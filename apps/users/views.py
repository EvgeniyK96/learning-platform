from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserSerializer


class MeView(generics.RetrieveUpdateAPIView):
    """Профиль текущего пользователя (личный кабинет)."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class DashboardView(APIView):
    """Сводка личного кабинета: курсы, прогресс, сертификаты, результаты."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from apps.assessments.models import HomeworkSubmission, QuizAttempt
        from apps.certificates.models import Certificate
        from apps.courses.models import Enrollment
        from apps.courses.serializers import EnrollmentSerializer

        enrollments = Enrollment.objects.filter(user=request.user).select_related("course")
        certificates = Certificate.objects.filter(user=request.user)
        return Response(
            {
                "user": UserSerializer(request.user).data,
                "enrollments": EnrollmentSerializer(
                    enrollments, many=True, context={"request": request}
                ).data,
                "certificates_count": certificates.count(),
                "quizzes_passed": QuizAttempt.objects.filter(
                    user=request.user, passed=True
                ).values("quiz").distinct().count(),
                "homeworks_accepted": HomeworkSubmission.objects.filter(
                    user=request.user, status=HomeworkSubmission.Status.ACCEPTED
                ).count(),
            }
        )
