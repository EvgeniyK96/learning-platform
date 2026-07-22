from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.assessments.models import HomeworkSubmission
from apps.courses.models import Course, Enrollment

from .permissions import IsTeacher
from .serializers import (
    StudentProgressSerializer,
    TeacherCourseSerializer,
    TeacherSubmissionSerializer,
)


class TeacherCoursesView(generics.ListAPIView):
    """Курсы, которые ведёт текущий преподаватель."""

    serializer_class = TeacherCourseSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Course.objects.none()
        return Course.objects.filter(teacher=self.request.user).order_by("title")


class CourseStudentsView(generics.ListAPIView):
    """Ученики конкретного курса преподавателя с их прогрессом."""

    serializer_class = StudentProgressSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Enrollment.objects.none()
        course = generics.get_object_or_404(
            Course, pk=self.kwargs["pk"], teacher=self.request.user
        )
        return (
            Enrollment.objects.filter(course=course)
            .select_related("user", "course")
            .order_by("user__username")
        )


class TeacherSubmissionsView(generics.ListAPIView):
    """Очередь сдач ДЗ по всем курсам преподавателя.

    Фильтры: ?status=submitted|accepted|rejected, ?course=<id>.
    По умолчанию показываются сдачи на проверке.
    """

    serializer_class = TeacherSubmissionSerializer
    permission_classes = [IsTeacher]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return HomeworkSubmission.objects.none()
        qs = HomeworkSubmission.objects.filter(
            homework__lesson__module__course__teacher=self.request.user
        ).select_related("user", "homework", "homework__lesson__module__course")

        status = self.request.query_params.get("status", "submitted")
        if status and status != "all":
            qs = qs.filter(status=status)

        course = self.request.query_params.get("course")
        if course:
            qs = qs.filter(homework__lesson__module__course_id=course)

        return qs.order_by("-submitted_at")


class TeacherSubmissionReviewView(generics.RetrieveUpdateAPIView):
    """Просмотр и проверка одной сдачи ДЗ (оценка, комментарий, статус)."""

    serializer_class = TeacherSubmissionSerializer
    permission_classes = [IsTeacher]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return HomeworkSubmission.objects.none()
        return HomeworkSubmission.objects.filter(
            homework__lesson__module__course__teacher=self.request.user
        ).select_related("user", "homework", "homework__lesson__module__course")


class TeacherOverviewView(APIView):
    """Короткая сводка для шапки кабинета преподавателя."""

    permission_classes = [IsTeacher]

    def get(self, request):
        courses = Course.objects.filter(teacher=request.user)
        students = (
            Enrollment.objects.filter(course__teacher=request.user)
            .values("user").distinct().count()
        )
        pending = HomeworkSubmission.objects.filter(
            homework__lesson__module__course__teacher=request.user,
            status=HomeworkSubmission.Status.SUBMITTED,
        ).count()
        return Response({
            "courses_count": courses.count(),
            "students_count": students,
            "pending_submissions": pending,
        })
