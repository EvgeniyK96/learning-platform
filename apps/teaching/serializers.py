from pathlib import Path

from django.urls import reverse
from rest_framework import serializers

from apps.assessments.models import HomeworkSubmission
from apps.courses.models import Course


class TeacherCourseSerializer(serializers.ModelSerializer):
    """Курс преподавателя со сводкой: сколько учеников и ДЗ на проверке."""

    students_count = serializers.SerializerMethodField()
    pending_submissions = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id", "title", "slug", "level", "language",
            "students_count", "pending_submissions", "lessons_count", "is_published",
        ]

    def get_students_count(self, obj):
        return obj.enrollments.count()

    def get_pending_submissions(self, obj):
        return HomeworkSubmission.objects.filter(
            homework__lesson__module__course=obj,
            status=HomeworkSubmission.Status.SUBMITTED,
        ).count()

    def get_lessons_count(self, obj):
        return obj.total_lessons()


class StudentProgressSerializer(serializers.Serializer):
    """Ученик курса с прогрессом. На вход — объект Enrollment."""

    id = serializers.IntegerField(source="user.id")
    username = serializers.CharField(source="user.username")
    full_name = serializers.SerializerMethodField()
    email = serializers.CharField(source="user.email")
    enrolled_at = serializers.DateTimeField()
    progress = serializers.SerializerMethodField()
    lessons_done = serializers.SerializerMethodField()
    quizzes_passed = serializers.SerializerMethodField()
    homeworks_accepted = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_progress(self, obj):
        return obj.course.progress_for(obj.user)

    def get_lessons_done(self, obj):
        from apps.courses.models import LessonProgress

        return LessonProgress.objects.filter(
            user=obj.user, lesson__module__course=obj.course
        ).count()

    def get_quizzes_passed(self, obj):
        from apps.assessments.models import QuizAttempt

        return (
            QuizAttempt.objects.filter(user=obj.user, passed=True)
            .filter(quiz__lesson__module__course=obj.course)
            .values("quiz").distinct().count()
            + QuizAttempt.objects.filter(user=obj.user, passed=True)
            .filter(quiz__module__course=obj.course)
            .values("quiz").distinct().count()
        )

    def get_homeworks_accepted(self, obj):
        return HomeworkSubmission.objects.filter(
            user=obj.user,
            homework__lesson__module__course=obj.course,
            status=HomeworkSubmission.Status.ACCEPTED,
        ).count()


class TeacherSubmissionSerializer(serializers.ModelSerializer):
    """Сдача ДЗ глазами преподавателя: данные ученика + проверяемые поля."""

    student_name = serializers.SerializerMethodField()
    student_username = serializers.CharField(source="user.username", read_only=True)
    student_id = serializers.IntegerField(source="user.id", read_only=True)
    homework_title = serializers.CharField(source="homework.title", read_only=True)
    homework_description = serializers.CharField(source="homework.description", read_only=True)
    course_title = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    file_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = HomeworkSubmission
        fields = [
            "id", "student_id", "student_name", "student_username",
            "homework", "homework_title", "homework_description", "course_title",
            "text", "file_url", "file_name",
            "status", "status_display", "grade", "teacher_comment",
            "submitted_at", "updated_at",
        ]
        read_only_fields = [
            "homework", "text", "submitted_at", "updated_at",
        ]

    def get_student_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_course_title(self, obj):
        return obj.homework.lesson.module.course.title

    def get_file_url(self, obj):
        if not obj.file:
            return None
        return reverse("submission-file", args=[obj.id])

    def get_file_name(self, obj):
        if not obj.file:
            return None
        return Path(obj.file.name).name

    def validate_status(self, value):
        allowed = {
            HomeworkSubmission.Status.SUBMITTED,
            HomeworkSubmission.Status.ACCEPTED,
            HomeworkSubmission.Status.REJECTED,
        }
        if value not in allowed:
            raise serializers.ValidationError("Недопустимый статус.")
        return value

    def validate_grade(self, value):
        if value is not None and not (0 <= value <= 100):
            raise serializers.ValidationError("Оценка — от 0 до 100.")
        return value
