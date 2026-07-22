from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        ref_name = "User"
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "avatar", "bio", "is_teacher", "date_joined",
        ]
        read_only_fields = ["id", "username", "is_teacher", "date_joined"]


class DashboardSerializer(serializers.Serializer):
    """Сводка личного кабинета; сериализуемый объект — текущий пользователь."""

    user = UserSerializer(source="*", read_only=True)
    enrollments = serializers.SerializerMethodField()
    certificates_count = serializers.SerializerMethodField()
    quizzes_passed = serializers.SerializerMethodField()
    homeworks_accepted = serializers.SerializerMethodField()

    def get_enrollments(self, obj):
        from apps.courses.models import Enrollment
        from apps.courses.serializers import EnrollmentSerializer

        enrollments = Enrollment.objects.filter(user=obj).select_related("course")
        return EnrollmentSerializer(enrollments, many=True, context=self.context).data

    def get_certificates_count(self, obj):
        from apps.certificates.models import Certificate

        return Certificate.objects.filter(user=obj).count()

    def get_quizzes_passed(self, obj):
        from apps.assessments.models import QuizAttempt

        return (
            QuizAttempt.objects.filter(user=obj, passed=True)
            .values("quiz").distinct().count()
        )

    def get_homeworks_accepted(self, obj):
        from apps.assessments.models import HomeworkSubmission

        return HomeworkSubmission.objects.filter(
            user=obj, status=HomeworkSubmission.Status.ACCEPTED
        ).count()
