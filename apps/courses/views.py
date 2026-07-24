from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course, Enrollment, Lesson, LessonProgress
from .serializers import (
    CourseDetailSerializer,
    CourseListSerializer,
    EnrollmentSerializer,
    LessonDetailSerializer,
)


class CourseListView(generics.ListAPIView):
    serializer_class = CourseListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Course.objects.filter(is_published=True)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(title__icontains=search)
        level = self.request.query_params.get("level")
        if level:
            qs = qs.filter(level=level)
        return qs


class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.filter(is_published=True)
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.AllowAny]


class EnrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.is_teacher:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Преподаватели не записываются на курсы.")
        course = generics.get_object_or_404(Course, pk=pk, is_published=True)
        enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
        return Response(
            EnrollmentSerializer(enrollment, context={"request": request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class MyEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Enrollment.objects.none()
        return Enrollment.objects.filter(user=self.request.user).select_related("course")


class LessonDetailView(generics.RetrieveAPIView):
    """Содержимое урока — только для записанных на курс и открытых модулей."""

    serializer_class = LessonDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Lesson.objects.none()
        return Lesson.objects.filter(
            module__course__enrollments__user=self.request.user
        )

    def get_object(self):
        from rest_framework.exceptions import PermissionDenied

        from apps.assessments.services import module_unlocked

        lesson = super().get_object()
        if not module_unlocked(self.request.user, lesson.module):
            raise PermissionDenied(
                "Модуль закрыт. Сдайте тест предыдущего модуля минимум на 75%."
            )
        return lesson


class CompleteLessonView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        from apps.assessments.services import module_unlocked

        lesson = generics.get_object_or_404(
            Lesson, pk=pk, module__course__enrollments__user=request.user
        )
        if not module_unlocked(request.user, lesson.module):
            return Response(
                {"detail": "Модуль закрыт. Сдайте тест предыдущего модуля минимум на 75%."},
                status=status.HTTP_403_FORBIDDEN,
            )
        LessonProgress.objects.get_or_create(user=request.user, lesson=lesson)

        from apps.certificates.services import check_and_issue

        certificate = check_and_issue(request.user, lesson.module.course)
        return Response(
            {
                "completed": True,
                "course_progress": lesson.module.course.progress_for(request.user),
                "certificate_issued": certificate is not None,
            }
        )
