from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Пользователь платформы: стандартные поля Django + профиль."""

    avatar = models.ImageField("Аватар", upload_to="avatars/", blank=True, null=True)
    bio = models.TextField("О себе", blank=True)
    is_teacher = models.BooleanField(
        "Преподаватель", default=False,
        help_text="Даёт доступ к кабинету преподавателя: проверка ДЗ, прогресс учеников, чат.",
    )

    class Meta(AbstractUser.Meta):
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
