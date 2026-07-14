from django.contrib.auth.models import User
from django.db import models

from apps.courses.models import Lesson, Module

from .validators import validate_homework_file


class Quiz(models.Model):
    """Тест урока (lesson) или итоговый тест модуля (module) — заполняется одно из двух."""

    lesson = models.OneToOneField(
        Lesson, on_delete=models.CASCADE, related_name="quiz",
        verbose_name="Урок", null=True, blank=True,
    )
    module = models.OneToOneField(
        Module, on_delete=models.CASCADE, related_name="quiz",
        verbose_name="Модуль", null=True, blank=True,
    )
    title = models.CharField("Название", max_length=200)
    pass_score = models.PositiveIntegerField("Проходной балл, %", default=70)

    class Meta:
        verbose_name = "Тест"
        verbose_name_plural = "Тесты"

    def __str__(self):
        return self.title

    @property
    def course(self):
        if self.module_id:
            return self.module.course
        return self.lesson.module.course


class Question(models.Model):
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE, related_name="questions", verbose_name="Тест"
    )
    text = models.TextField("Вопрос")
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        verbose_name = "Вопрос"
        verbose_name_plural = "Вопросы"
        ordering = ["order", "id"]

    def __str__(self):
        return self.text[:60]


class Choice(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="choices", verbose_name="Вопрос"
    )
    text = models.CharField("Вариант ответа", max_length=300)
    is_correct = models.BooleanField("Правильный", default=False)

    class Meta:
        verbose_name = "Вариант ответа"
        verbose_name_plural = "Варианты ответов"

    def __str__(self):
        return self.text


class QuizAttempt(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="quiz_attempts", verbose_name="Пользователь"
    )
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE, related_name="attempts", verbose_name="Тест"
    )
    score = models.PositiveIntegerField("Результат, %")
    passed = models.BooleanField("Сдан", default=False)
    answers = models.JSONField("Ответы", default=dict)
    created_at = models.DateTimeField("Дата попытки", auto_now_add=True)

    class Meta:
        verbose_name = "Попытка теста"
        verbose_name_plural = "Попытки тестов"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.quiz.title} — {self.score}%"


class Homework(models.Model):
    lesson = models.OneToOneField(
        Lesson, on_delete=models.CASCADE, related_name="homework", verbose_name="Урок"
    )
    title = models.CharField("Название", max_length=200)
    description = models.TextField("Задание")

    class Meta:
        verbose_name = "Домашнее задание"
        verbose_name_plural = "Домашние задания"

    def __str__(self):
        return self.title


class HomeworkSubmission(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "На проверке"
        ACCEPTED = "accepted", "Принято"
        REJECTED = "rejected", "На доработку"

    homework = models.ForeignKey(
        Homework, on_delete=models.CASCADE, related_name="submissions",
        verbose_name="Домашнее задание",
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="homework_submissions",
        verbose_name="Пользователь",
    )
    text = models.TextField("Решение", blank=True)
    file = models.FileField(
        "Файл", upload_to="homework/", blank=True, null=True,
        validators=[validate_homework_file],
    )
    status = models.CharField(
        "Статус", max_length=20, choices=Status.choices, default=Status.SUBMITTED
    )
    grade = models.PositiveIntegerField("Оценка", null=True, blank=True)
    teacher_comment = models.TextField("Комментарий преподавателя", blank=True)
    submitted_at = models.DateTimeField("Отправлено", auto_now_add=True)
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        verbose_name = "Сдача домашнего задания"
        verbose_name_plural = "Сдачи домашних заданий"
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.user.username}: {self.homework.title} ({self.get_status_display()})"
