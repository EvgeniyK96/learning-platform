"""Последовательный доступ к модулям курса.

Модуль открыт, только если по всем предыдущим модулям курса, у которых есть
итоговый тест, этот тест сдан (score >= pass_score, т.е. проходной балл 75%).
Первый модуль открыт всегда.
"""

from .models import Quiz, QuizAttempt


def unlocked_module_ids(user, course):
    """Возвращает set id модулей курса, доступных пользователю."""
    modules = list(course.modules.order_by("order", "id"))
    if not user.is_authenticated:
        return set()

    passed_quiz_module_ids = set(
        QuizAttempt.objects.filter(
            user=user, passed=True, quiz__module__course=course
        ).values_list("quiz__module_id", flat=True)
    )
    module_quiz_ids = set(
        Quiz.objects.filter(module__course=course).values_list("module_id", flat=True)
    )

    unlocked = set()
    for module in modules:
        unlocked.add(module.id)
        # следующий модуль открывается, только если тест этого модуля сдан
        if module.id in module_quiz_ids and module.id not in passed_quiz_module_ids:
            break
    return unlocked


def module_unlocked(user, module):
    return module.id in unlocked_module_ids(user, module.course)
