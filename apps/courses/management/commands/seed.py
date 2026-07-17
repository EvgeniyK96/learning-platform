"""Наполнение базы демо-данными: python manage.py seed"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.assessments.models import Choice, Homework, Question, Quiz
from apps.courses.models import Course, Lesson, Module

COURSES = [
    {
        "title": "Python с нуля",
        "slug": "python-basics",
        "language": "Python",
        "level": "beginner",
        "description": "Основы Python: синтаксис, типы данных, функции и ООП. "
        "Курс для тех, кто начинает путь в программировании.",
        "modules": [
            {
                "title": "Введение в Python",
                "lessons": [
                    {
                        "title": "Установка и первая программа",
                        "video_url": "https://www.youtube.com/embed/KOdfpbnWLVo",
                        "duration": 12,
                        "content": "Устанавливаем Python, настраиваем редактор и пишем первую программу — классический «Hello, World!».",
                        "quiz": {
                            "title": "Проверка: первая программа",
                            "questions": [
                                {
                                    "text": "Какая функция выводит текст на экран в Python?",
                                    "choices": [("print()", True), ("echo()", False), ("write()", False)],
                                },
                                {
                                    "text": "Каким расширением обладают файлы Python?",
                                    "choices": [(".py", True), (".python", False), (".pt", False)],
                                },
                            ],
                        },
                    },
                    {
                        "title": "Переменные и типы данных",
                        "video_url": "https://www.youtube.com/embed/Rz4jHkYcpTY",
                        "duration": 18,
                        "content": "Числа, строки, списки, словари. Динамическая типизация и функция type().",
                        "homework": {
                            "title": "Калькулятор возраста",
                            "description": "Напишите программу, которая запрашивает год рождения и выводит возраст пользователя.",
                        },
                    },
                ],
            },
            {
                "title": "Функции и ООП",
                "lessons": [
                    {
                        "title": "Функции",
                        "video_url": "https://www.youtube.com/embed/9Os0o3wzS_I",
                        "duration": 22,
                        "content": "Объявление функций, аргументы, возвращаемые значения, lambda-выражения.",
                        "quiz": {
                            "title": "Проверка: функции",
                            "questions": [
                                {
                                    "text": "Какое ключевое слово объявляет функцию?",
                                    "choices": [("def", True), ("func", False), ("function", False)],
                                },
                            ],
                        },
                    },
                    {
                        "title": "Классы и объекты",
                        "video_url": "https://www.youtube.com/embed/ZDa-Z5JzLYM",
                        "duration": 25,
                        "content": "Классы, экземпляры, метод __init__, наследование.",
                        "homework": {
                            "title": "Класс «Студент»",
                            "description": "Создайте класс Student с полями имя и оценки и методом среднего балла.",
                        },
                    },
                ],
            },
        ],
    },
    {
        "title": "Веб-разработка на Django",
        "slug": "django-web",
        "language": "Python / Django",
        "level": "intermediate",
        "description": "Создание веб-приложений на Django: модели, представления, шаблоны, REST API.",
        "modules": [
            {
                "title": "Основы Django",
                "lessons": [
                    {
                        "title": "Структура проекта",
                        "video_url": "https://www.youtube.com/embed/rHux0gMZ3Eg",
                        "duration": 15,
                        "content": "Проект и приложения, manage.py, настройки, первый запуск сервера.",
                        "quiz": {
                            "title": "Проверка: структура Django",
                            "questions": [
                                {
                                    "text": "Какой командой запускается сервер разработки?",
                                    "choices": [
                                        ("python manage.py runserver", True),
                                        ("django start", False),
                                        ("python server.py", False),
                                    ],
                                },
                            ],
                        },
                    },
                    {
                        "title": "Модели и ORM",
                        "video_url": "https://www.youtube.com/embed/5zNR3E6WRLE",
                        "duration": 20,
                        "content": "Определение моделей, миграции, запросы через ORM.",
                        "homework": {
                            "title": "Модель блога",
                            "description": "Создайте модели Post и Comment со связью «один ко многим» и зарегистрируйте их в админке.",
                        },
                    },
                ],
            },
        ],
    },
]


class Command(BaseCommand):
    help = "Наполняет базу демо-курсами, тестами и домашними заданиями"

    def handle(self, *args, **options):
        teacher, created = get_user_model().objects.get_or_create(
            username="teacher",
            defaults={"first_name": "Иван", "last_name": "Преподавателев", "is_staff": True},
        )
        if created:
            teacher.set_password("teacher12345")
            teacher.save()

        for course_data in COURSES:
            course, created = Course.objects.get_or_create(
                slug=course_data["slug"],
                defaults={
                    "title": course_data["title"],
                    "description": course_data["description"],
                    "level": course_data["level"],
                    "language": course_data["language"],
                    "teacher": teacher,
                },
            )
            if not created:
                self.stdout.write(f"Курс уже есть: {course.title}")
                continue

            for m_order, module_data in enumerate(course_data["modules"]):
                module = Module.objects.create(
                    course=course, title=module_data["title"], order=m_order
                )
                for l_order, lesson_data in enumerate(module_data["lessons"]):
                    lesson = Lesson.objects.create(
                        module=module,
                        title=lesson_data["title"],
                        video_url=lesson_data["video_url"],
                        content=lesson_data["content"],
                        duration_minutes=lesson_data["duration"],
                        order=l_order,
                    )
                    quiz_data = lesson_data.get("quiz")
                    if quiz_data:
                        quiz = Quiz.objects.create(lesson=lesson, title=quiz_data["title"])
                        for q_order, q in enumerate(quiz_data["questions"]):
                            question = Question.objects.create(
                                quiz=quiz, text=q["text"], order=q_order
                            )
                            for text, is_correct in q["choices"]:
                                Choice.objects.create(
                                    question=question, text=text, is_correct=is_correct
                                )
                    hw = lesson_data.get("homework")
                    if hw:
                        Homework.objects.create(
                            lesson=lesson, title=hw["title"], description=hw["description"]
                        )

            self.stdout.write(self.style.SUCCESS(f"Создан курс: {course.title}"))

        self.stdout.write(self.style.SUCCESS("Демо-данные готовы."))
