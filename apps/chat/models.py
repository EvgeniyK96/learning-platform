from django.conf import settings
from django.db import models


class Message(models.Model):
    """Личное сообщение между учеником и преподавателем."""

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="sent_messages", verbose_name="Отправитель",
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="received_messages", verbose_name="Получатель",
    )
    body = models.TextField("Текст")
    created_at = models.DateTimeField("Отправлено", auto_now_add=True)
    read_at = models.DateTimeField("Прочитано", null=True, blank=True)

    class Meta:
        verbose_name = "Сообщение"
        verbose_name_plural = "Сообщения"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["sender", "recipient"]),
            models.Index(fields=["recipient", "read_at"]),
        ]

    def __str__(self):
        return f"{self.sender_id} → {self.recipient_id}: {self.body[:40]}"
