import uuid

from django.contrib.auth.models import User
from django.db import models

from apps.courses.models import Course


def generate_number():
    return uuid.uuid4().hex[:12].upper()


class Certificate(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="certificates", verbose_name="Пользователь"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="certificates", verbose_name="Курс"
    )
    number = models.CharField(
        "Номер", max_length=12, unique=True, default=generate_number, editable=False
    )
    issued_at = models.DateTimeField("Дата выдачи", auto_now_add=True)

    class Meta:
        verbose_name = "Сертификат"
        verbose_name_plural = "Сертификаты"
        constraints = [
            models.UniqueConstraint(fields=["user", "course"], name="unique_certificate")
        ]

    def __str__(self):
        return f"Сертификат {self.number} — {self.user.username}, {self.course.title}"
