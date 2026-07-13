from django.contrib.auth.models import User
from django.db import models


class Course(models.Model):
    class Level(models.TextChoices):
        BEGINNER = "beginner", "Начальный"
        INTERMEDIATE = "intermediate", "Средний"
        ADVANCED = "advanced", "Продвинутый"

    class Runner(models.TextChoices):
        NONE = "", "Без практики"
        PYTHON = "python", "Python IDE (Pyodide)"
        JAVASCRIPT = "javascript", "JavaScript-песочница"
        TERMINAL = "terminal", "Мини-терминал (bash/git/docker)"
        SQL = "sql", "SQL-консоль (SQLite)"

    title = models.CharField("Название", max_length=200)
    slug = models.SlugField("Слаг", max_length=200, unique=True)
    description = models.TextField("Описание")
    cover = models.ImageField("Обложка", upload_to="covers/", blank=True, null=True)
    level = models.CharField("Уровень", max_length=20, choices=Level.choices, default=Level.BEGINNER)
    language = models.CharField("Язык программирования", max_length=50, blank=True)
    teacher = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="taught_courses",
        verbose_name="Преподаватель",
    )
    runner = models.CharField(
        "Практика в уроке", max_length=20, choices=Runner.choices,
        default=Runner.NONE, blank=True,
    )
    is_published = models.BooleanField("Опубликован", default=True)
    created_at = models.DateTimeField("Создан", auto_now_add=True)

    class Meta:
        verbose_name = "Курс"
        verbose_name_plural = "Курсы"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def total_lessons(self):
        return Lesson.objects.filter(module__course=self).count()

    def progress_for(self, user):
        """Процент пройденных уроков курса для пользователя."""
        total = self.total_lessons()
        if not total or not user.is_authenticated:
            return 0
        done = LessonProgress.objects.filter(
            user=user, lesson__module__course=self
        ).count()
        return round(done * 100 / total)


class Module(models.Model):
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="modules", verbose_name="Курс"
    )
    title = models.CharField("Название", max_length=200)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        verbose_name = "Модуль"
        verbose_name_plural = "Модули"
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.course.title} — {self.title}"


class Lesson(models.Model):
    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name="lessons", verbose_name="Модуль"
    )
    title = models.CharField("Название", max_length=200)
    video_url = models.URLField("Ссылка на видео", blank=True)
    content = models.TextField("Текст урока", blank=True)
    duration_minutes = models.PositiveIntegerField("Длительность, мин", default=0)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        verbose_name = "Урок"
        verbose_name_plural = "Уроки"
        ordering = ["order", "id"]

    def __str__(self):
        return self.title


class Enrollment(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="enrollments", verbose_name="Пользователь"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="enrollments", verbose_name="Курс"
    )
    enrolled_at = models.DateTimeField("Дата записи", auto_now_add=True)

    class Meta:
        verbose_name = "Запись на курс"
        verbose_name_plural = "Записи на курсы"
        constraints = [
            models.UniqueConstraint(fields=["user", "course"], name="unique_enrollment")
        ]

    def __str__(self):
        return f"{self.user.username} → {self.course.title}"


class LessonProgress(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="lesson_progress", verbose_name="Пользователь"
    )
    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, related_name="progress", verbose_name="Урок"
    )
    completed_at = models.DateTimeField("Завершён", auto_now_add=True)

    class Meta:
        verbose_name = "Прогресс урока"
        verbose_name_plural = "Прогресс уроков"
        constraints = [
            models.UniqueConstraint(fields=["user", "lesson"], name="unique_lesson_progress")
        ]

    def __str__(self):
        return f"{self.user.username}: {self.lesson.title}"
