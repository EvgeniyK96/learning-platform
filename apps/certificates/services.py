"""Выдача сертификатов.

Сертификат выдаётся автоматически, когда пользователь:
- прошёл все уроки курса;
- сдал все тесты курса;
- получил «принято» по всем домашним заданиям курса.
"""

from django.db.models import Q

from apps.assessments.models import Homework, HomeworkSubmission, Quiz, QuizAttempt
from apps.courses.models import Lesson, LessonProgress

from .models import Certificate


def course_completed(user, course):
    lessons = Lesson.objects.filter(module__course=course)
    if not lessons.exists():
        return False

    done = LessonProgress.objects.filter(user=user, lesson__in=lessons).count()
    if done < lessons.count():
        return False

    quiz_ids = Quiz.objects.filter(
        Q(lesson__in=lessons) | Q(module__course=course)
    ).values_list("id", flat=True)
    passed = (
        QuizAttempt.objects.filter(user=user, quiz_id__in=quiz_ids, passed=True)
        .values("quiz")
        .distinct()
        .count()
    )
    if passed < len(quiz_ids):
        return False

    homework_ids = Homework.objects.filter(lesson__in=lessons).values_list("id", flat=True)
    accepted = (
        HomeworkSubmission.objects.filter(
            user=user,
            homework_id__in=homework_ids,
            status=HomeworkSubmission.Status.ACCEPTED,
        )
        .values("homework")
        .distinct()
        .count()
    )
    return accepted >= len(homework_ids)


def check_and_issue(user, course):
    """Выдать сертификат, если курс пройден. Возвращает новый сертификат или None."""
    if Certificate.objects.filter(user=user, course=course).exists():
        return None
    if not course_completed(user, course):
        return None
    return Certificate.objects.create(user=user, course=course)
