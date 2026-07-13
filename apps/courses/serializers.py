from rest_framework import serializers

from .models import Course, Enrollment, Lesson, LessonProgress, Module


class LessonListSerializer(serializers.ModelSerializer):
    """Урок в списке — без содержимого."""

    completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "title", "duration_minutes", "order", "completed"]

    def get_completed(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False
        return LessonProgress.objects.filter(user=user, lesson=obj).exists()


class LessonDetailSerializer(LessonListSerializer):
    quiz_id = serializers.SerializerMethodField()
    homework_id = serializers.SerializerMethodField()
    course_id = serializers.IntegerField(source="module.course_id", read_only=True)
    course_runner = serializers.CharField(source="module.course.runner", read_only=True)

    class Meta(LessonListSerializer.Meta):
        fields = LessonListSerializer.Meta.fields + [
            "content", "quiz_id", "homework_id", "course_id", "course_runner",
        ]

    def get_quiz_id(self, obj):
        quiz = getattr(obj, "quiz", None)
        return quiz.id if quiz else None

    def get_homework_id(self, obj):
        homework = getattr(obj, "homework", None)
        return homework.id if homework else None


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonListSerializer(many=True, read_only=True)
    locked = serializers.SerializerMethodField()
    quiz = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ["id", "title", "order", "locked", "quiz", "lessons"]

    def get_locked(self, obj):
        unlocked = self.context.get("unlocked_ids")
        if unlocked is None:
            return False
        return obj.id not in unlocked

    def get_quiz(self, obj):
        """Итоговый тест модуля и его статус для пользователя."""
        quiz = getattr(obj, "quiz", None)
        if not quiz:
            return None
        user = self.context["request"].user
        best_score, passed = None, False
        if user.is_authenticated:
            from apps.assessments.models import QuizAttempt

            attempts = QuizAttempt.objects.filter(user=user, quiz=quiz)
            best = attempts.order_by("-score").first()
            best_score = best.score if best else None
            passed = attempts.filter(passed=True).exists()
        return {
            "id": quiz.id,
            "title": quiz.title,
            "pass_score": quiz.pass_score,
            "best_score": best_score,
            "passed": passed,
        }


class CourseListSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id", "title", "slug", "description", "cover", "level", "language",
            "runner", "teacher_name", "lessons_count", "is_enrolled", "progress",
            "created_at",
        ]

    def get_teacher_name(self, obj):
        if not obj.teacher:
            return ""
        return obj.teacher.get_full_name() or obj.teacher.username

    def get_lessons_count(self, obj):
        return obj.total_lessons()

    def get_is_enrolled(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False
        return Enrollment.objects.filter(user=user, course=obj).exists()

    def get_progress(self, obj):
        return obj.progress_for(self.context["request"].user)


class CourseDetailSerializer(CourseListSerializer):
    modules = serializers.SerializerMethodField()

    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + ["modules"]

    def get_modules(self, obj):
        from apps.assessments.services import unlocked_module_ids

        user = self.context["request"].user
        context = {
            **self.context,
            "unlocked_ids": unlocked_module_ids(user, obj),
        }
        return ModuleSerializer(
            obj.modules.order_by("order", "id"), many=True, context=context
        ).data


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "course", "enrolled_at"]
