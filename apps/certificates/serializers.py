from rest_framework import serializers

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    user_name = serializers.SerializerMethodField()
    course_hours = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            "id", "number", "course", "course_title", "user_name",
            "course_hours", "lessons_count", "issued_at",
        ]

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_lessons_count(self, obj):
        return obj.course.total_lessons()

    def get_course_hours(self, obj):
        from django.db.models import Sum

        from apps.courses.models import Lesson

        minutes = (
            Lesson.objects.filter(module__course=obj.course).aggregate(
                total=Sum("duration_minutes")
            )["total"]
            or 0
        )
        return max(1, round(minutes / 60))
