from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Choice, Homework, HomeworkSubmission, Quiz, QuizAttempt
from .serializers import (
    HomeworkSerializer,
    HomeworkSubmissionSerializer,
    QuizAttemptSerializer,
    QuizSerializer,
)
from .services import module_unlocked


def _enrolled_quizzes(user):
    """Тесты уроков и модулей курсов, на которые записан пользователь."""
    return Quiz.objects.filter(
        Q(lesson__module__course__enrollments__user=user)
        | Q(module__course__enrollments__user=user)
    ).distinct()


def _check_quiz_access(user, quiz):
    module = quiz.module if quiz.module_id else quiz.lesson.module
    if not module_unlocked(user, module):
        raise PermissionDenied(
            "Модуль закрыт. Сдайте тест предыдущего модуля минимум на 75%."
        )


class QuizDetailView(generics.RetrieveAPIView):
    """Тест доступен только записанным на курс и в открытом модуле."""

    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return _enrolled_quizzes(self.request.user)

    def get_object(self):
        quiz = super().get_object()
        _check_quiz_access(self.request.user, quiz)
        return quiz


class QuizSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        quiz = generics.get_object_or_404(_enrolled_quizzes(request.user), pk=pk)
        _check_quiz_access(request.user, quiz)
        answers = request.data.get("answers", {})
        if not isinstance(answers, dict):
            return Response(
                {"detail": "answers должен быть объектом {question_id: choice_id}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        questions = quiz.questions.all()
        if not questions:
            return Response(
                {"detail": "В тесте нет вопросов."}, status=status.HTTP_400_BAD_REQUEST
            )

        correct = 0
        for question in questions:
            choice_id = answers.get(str(question.id))
            if choice_id is None:
                continue
            if Choice.objects.filter(
                id=choice_id, question=question, is_correct=True
            ).exists():
                correct += 1

        score = round(correct * 100 / len(questions))
        passed = score >= quiz.pass_score
        attempt = QuizAttempt.objects.create(
            user=request.user, quiz=quiz, score=score, passed=passed, answers=answers
        )

        certificate = None
        if passed:
            from apps.certificates.services import check_and_issue

            certificate = check_and_issue(request.user, quiz.course)

        return Response(
            {
                "score": score,
                "passed": passed,
                "pass_score": quiz.pass_score,
                "correct": correct,
                "total": len(questions),
                "attempt": QuizAttemptSerializer(attempt).data,
                "certificate_issued": certificate is not None,
            }
        )


class MyAttemptsView(generics.ListAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user).select_related("quiz")


class HomeworkDetailView(generics.RetrieveAPIView):
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Homework.objects.filter(
            lesson__module__course__enrollments__user=self.request.user
        )


class HomeworkSubmitView(generics.CreateAPIView):
    """Отправка решения домашнего задания (текст и/или файл)."""

    serializer_class = HomeworkSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        homework = generics.get_object_or_404(
            Homework,
            pk=self.kwargs["pk"],
            lesson__module__course__enrollments__user=self.request.user,
        )
        serializer.save(user=self.request.user, homework=homework)


class MySubmissionsView(generics.ListAPIView):
    serializer_class = HomeworkSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HomeworkSubmission.objects.filter(user=self.request.user).select_related(
            "homework"
        )
