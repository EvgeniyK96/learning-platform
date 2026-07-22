"""Правила, кто с кем может переписываться.

Разрешена переписка только в паре ученик ↔ преподаватель его курса:
- преподаватель может писать ученикам, записанным на его курсы;
- ученик может писать преподавателям курсов, на которые он записан.
"""

from apps.courses.models import Course, Enrollment


def chat_partner_ids(user):
    """ID пользователей, с которыми `user` вправе переписываться."""
    ids = set()

    # как преподаватель — его ученики
    ids.update(
        Enrollment.objects.filter(course__teacher=user)
        .values_list("user_id", flat=True)
    )
    # как ученик — преподаватели его курсов
    ids.update(
        Course.objects.filter(enrollments__user=user, teacher__isnull=False)
        .values_list("teacher_id", flat=True)
    )

    ids.discard(user.id)
    return ids


def can_chat(user, other_id):
    """Может ли `user` переписываться с пользователем `other_id`."""
    return int(other_id) in chat_partner_ids(user)
