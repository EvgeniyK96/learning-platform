from rest_framework import serializers

from .models import Choice, Homework, HomeworkSubmission, Question, Quiz, QuizAttempt


class ChoiceSerializer(serializers.ModelSerializer):
    """Вариант ответа без флага правильности."""

    class Meta:
        model = Choice
        fields = ["id", "text"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "text", "order", "choices"]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    best_score = serializers.SerializerMethodField()
    passed = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ["id", "lesson", "module", "title", "pass_score", "questions", "best_score", "passed"]

    def _attempts(self, obj):
        return QuizAttempt.objects.filter(quiz=obj, user=self.context["request"].user)

    def get_best_score(self, obj):
        best = self._attempts(obj).order_by("-score").first()
        return best.score if best else None

    def get_passed(self, obj):
        return self._attempts(obj).filter(passed=True).exists()


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ["id", "quiz", "quiz_title", "score", "passed", "created_at"]


class HomeworkSerializer(serializers.ModelSerializer):
    my_submission = serializers.SerializerMethodField()

    class Meta:
        model = Homework
        fields = ["id", "lesson", "title", "description", "my_submission"]

    def get_my_submission(self, obj):
        submission = (
            HomeworkSubmission.objects.filter(homework=obj, user=self.context["request"].user)
            .order_by("-submitted_at")
            .first()
        )
        if not submission:
            return None
        return HomeworkSubmissionSerializer(submission).data


class HomeworkSubmissionSerializer(serializers.ModelSerializer):
    homework_title = serializers.CharField(source="homework.title", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = HomeworkSubmission
        fields = [
            "id", "homework", "homework_title", "text", "file", "status",
            "status_display", "grade", "teacher_comment", "submitted_at",
        ]
        read_only_fields = ["homework", "status", "grade", "teacher_comment", "submitted_at"]
