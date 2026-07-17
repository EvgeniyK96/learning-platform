"""Импорт всех курсов из lessons/: большие курсы и мини-курсы.

    python manage.py import_courses [--only slug]

Большие курсы (10 модулей: файлы *_Modul_NN_uroki*.md + файл с домашками
и мини-тестами по модулям, проходной балл 75%): Python, C++, JavaScript,
Java, DevOps.

Мини-курсы (один файл с модулями, уроками и итоговым тестом, проходной
балл 70%): Linux, Git, Docker, SQL.
"""

import re
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from apps.assessments.models import Choice, Homework, Question, Quiz
from apps.courses.models import Course, Lesson, Module

BIG_PASS_SCORE = 75
MINI_PASS_SCORE = 70

BIG_COURSES = [
    {
        "slug": "python-basics",
        "title": "Python с нуля",
        "dir": "Python",
        "modules_glob": "Modul_*.md",
        "extras_glob": "Python_s_nulya*.md",
        "language": "Python",
        "level": Course.Level.BEGINNER,
        "runner": Course.Runner.PYTHON,
        "description": "Полный курс Python: от установки и первых программ до ООП, "
        "работы с файлами, тестирования и итогового проекта. Теория + встроенная "
        "IDE прямо в браузере, тест в конце каждого модуля.",
    },
    {
        "slug": "cpp-basics",
        "title": "C++ с нуля",
        "dir": "С++",
        "modules_glob": "CPP_Modul_*.md",
        "extras_glob": "CPP_domashka*.md",
        "language": "C++",
        "level": Course.Level.BEGINNER,
        "runner": Course.Runner.NONE,
        "description": "Курс C++: синтаксис, указатели и память, ООП, STL и "
        "итоговый проект. Тест в конце каждого модуля и домашние задания "
        "с проверкой преподавателем.",
    },
    {
        "slug": "javascript-basics",
        "title": "JavaScript с нуля",
        "dir": "javascript",
        "modules_glob": "JS_Modul_*.md",
        "extras_glob": "JS_domashka*.md",
        "language": "JavaScript",
        "level": Course.Level.BEGINNER,
        "runner": Course.Runner.JAVASCRIPT,
        "description": "Курс JavaScript: основы языка, DOM, асинхронность, работа "
        "с API и итоговый проект. Код запускается прямо в браузере во встроенной "
        "песочнице.",
    },
    {
        "slug": "java-basics",
        "title": "Java с нуля",
        "dir": "Java",
        "modules_glob": "Java_Modul_*.md",
        "extras_glob": "Java_domashka*.md",
        "language": "Java",
        "level": Course.Level.BEGINNER,
        "runner": Course.Runner.NONE,
        "description": "Курс Java: синтаксис, ООП, коллекции, исключения, потоки "
        "и итоговый проект. Тест в конце каждого модуля и домашние задания.",
    },
    {
        "slug": "devops-basics",
        "title": "DevOps с нуля",
        "dir": "DevOps",
        "modules_glob": "DevOps_Modul_*.md",
        "extras_glob": "DevOps_domashka*.md",
        "language": "DevOps",
        "level": Course.Level.INTERMEDIATE,
        "runner": Course.Runner.TERMINAL,
        "description": "Курс DevOps: Linux, Git, Docker, CI/CD, Kubernetes, "
        "Terraform, мониторинг. Команды можно отрабатывать во встроенном "
        "учебном терминале.",
    },
]

MINI_COURSES = [
    {
        "slug": "linux-mini",
        "title": "Мини-курс: Linux",
        "dir": "LinuxMini",
        "file_glob": "Minikurs_Linux*.md",
        "language": "Linux",
        "runner": Course.Runner.TERMINAL,
        "description": "Быстрый старт в Linux: файловая система, команды терминала, "
        "права доступа. Практика во встроенном учебном терминале, итоговый тест.",
    },
    {
        "slug": "git-mini",
        "title": "Мини-курс: Git",
        "dir": "Git",
        "file_glob": "Minikurs_Git*.md",
        "language": "Git",
        "runner": Course.Runner.TERMINAL,
        "description": "Git с нуля: коммиты, ветки, слияния, GitHub и Pull Request. "
        "Команды git можно пробовать во встроенном терминале, итоговый тест.",
    },
    {
        "slug": "docker-mini",
        "title": "Мини-курс: Docker",
        "dir": "Docker",
        "file_glob": "Minikurs_Docker*.md",
        "language": "Docker",
        "runner": Course.Runner.TERMINAL,
        "description": "Docker для начинающих: образы, контейнеры, Dockerfile, "
        "docker compose. Практика во встроенном терминале, итоговый тест.",
    },
    {
        "slug": "sql-mini",
        "title": "Мини-курс: SQL",
        "dir": "SQL",
        "file_glob": "Minikurs_SQL*.md",
        "language": "SQL",
        "runner": Course.Runner.SQL,
        "description": "SQL для начинающих: SELECT, фильтрация, JOIN, агрегации. "
        "Запросы выполняются в настоящей SQLite-консоли прямо в браузере, "
        "итоговый тест.",
    },
]


# ---------- общие парсеры ----------

def parse_lessons_block(text):
    """Разбирает текст с '## Урок N.M. Title' на уроки."""
    lessons = []
    parts = re.split(r"^## Урок\s+", text, flags=re.M)[1:]
    for part in parts:
        header, _, body = part.partition("\n")
        num_match = re.match(r"(\d+\.\d+)\.?\s*(.*)", header.strip())
        if not num_match:
            continue
        num, title = num_match.group(1), num_match.group(2).strip()

        duration = 30
        dur_match = re.search(r"\*\*Время:\s*(\d+)", body)
        if dur_match:
            duration = int(dur_match.group(1))
            body = re.sub(r"^\*\*Время:.*$", "", body, flags=re.M)

        content = body.strip().strip("-").strip()
        lessons.append(
            {"num": num, "title": f"{num}. {title}", "duration": duration, "content": content}
        )
    return lessons


def parse_questions(block, answers):
    """Вопросы формата '1. текст' + варианты 'a) ...'. answers: {'1': 'b', ...}"""
    questions = []
    current = None
    for line in block.splitlines():
        stripped = line.strip()
        q_match = re.match(r"^(\d+)\.\s+(.*)", stripped)
        o_match = re.match(r"^([a-d])\)\s*(.*)", stripped)
        if q_match:
            current = {"num": q_match.group(1), "text": q_match.group(2), "options": []}
            questions.append(current)
        elif o_match and current is not None:
            current["options"].append(o_match.group(2).strip())
        elif current is not None and stripped and not current["options"]:
            current["text"] += " " + stripped

    parsed = []
    for q in questions:
        letter = answers.get(q["num"])
        if not letter or len(q["options"]) < 2:
            continue
        parsed.append(
            {"text": q["text"], "options": q["options"], "correct_index": "abcd".index(letter)}
        )
    return parsed


def parse_extras(text):
    """Файл домашек и тестов большого курса → (homeworks, tests).

    homeworks: {'1.1': 'текст'}; tests: {номер_модуля: [вопросы]}.
    Секции ищутся по заголовкам '# ЧАСТЬ N. ...' (номера частей в курсах разные).
    """
    sections = re.split(r"^# ЧАСТЬ\s+\d+\.\s*", text, flags=re.M)
    hw_text = tests_text = ""
    for section in sections[1:]:
        head = section.splitlines()[0].upper()
        if "ДОМАШНИЕ" in head:
            hw_text = section
        elif "ТЕСТ" in head:
            tests_text = section

    homeworks = {}
    for row in re.finditer(r"^\|\s*(\d+\.\d+)\s+([^|]*)\|\s*([^|]+)\|", hw_text, re.M):
        homeworks[row.group(1)] = row.group(3).strip()

    tests = {}
    for block in re.split(r"^## Тест по Модулю\s+", tests_text, flags=re.M)[1:]:
        module_number = int(re.match(r"(\d+)", block).group(1))
        answers_match = re.search(r"\*\*Ответы:\*\*\s*(.+)$", block, re.M)
        if not answers_match:
            continue
        answers = dict(re.findall(r"(\d+)-([a-d])", answers_match.group(1)))
        tests[module_number] = parse_questions(block[: answers_match.start()], answers)
    return homeworks, tests


def create_quiz(module, title, questions, pass_score):
    quiz = Quiz.objects.create(module=module, title=title, pass_score=pass_score)
    for q_order, q in enumerate(questions):
        question = Question.objects.create(quiz=quiz, text=q["text"], order=q_order)
        for idx, option in enumerate(q["options"]):
            Choice.objects.create(
                question=question, text=option, is_correct=(idx == q["correct_index"])
            )
    return quiz


class Command(BaseCommand):
    help = "Импортирует все курсы из lessons/ (большие + мини-курсы)"

    def add_arguments(self, parser):
        parser.add_argument("--only", help="Импортировать только курс с этим slug")

    def handle(self, *args, **options):
        base = Path(settings.BASE_DIR) / "lessons"
        if not base.exists():
            raise CommandError("Папка lessons/ не найдена")
        self.teacher, created = get_user_model().objects.get_or_create(
            username="teacher",
            defaults={"first_name": "Иван", "last_name": "Преподавателев", "is_staff": True},
        )
        if created:
            self.teacher.set_password("teacher12345")
            self.teacher.save()
        only = options.get("only")

        for cfg in BIG_COURSES:
            if only and cfg["slug"] != only:
                continue
            self.import_big(base, cfg)
        for cfg in MINI_COURSES:
            if only and cfg["slug"] != only:
                continue
            self.import_mini(base, cfg)

        self.stdout.write(self.style.SUCCESS("Импорт завершён."))

    # ---------- курсы ----------

    def find_dir(self, base, name):
        for p in base.iterdir():
            if p.is_dir() and p.name.strip() == name:
                return p
        raise CommandError(f"Папка lessons/{name} не найдена")

    def recreate_course(self, cfg):
        course, _ = Course.objects.update_or_create(
            slug=cfg["slug"],
            defaults={
                "title": cfg["title"],
                "description": cfg["description"],
                "level": cfg.get("level", Course.Level.BEGINNER),
                "language": cfg["language"],
                "runner": cfg["runner"],
                "teacher": self.teacher,
                "is_published": True,
            },
        )
        course.modules.all().delete()
        return course

    def import_big(self, base, cfg):
        folder = self.find_dir(base, cfg["dir"])
        module_files = sorted(folder.glob(cfg["modules_glob"]))
        extras_file = next(folder.glob(cfg["extras_glob"]), None)
        if not module_files or not extras_file:
            raise CommandError(f"{cfg['slug']}: не найдены файлы модулей или домашек/тестов")

        homeworks, tests = parse_extras(extras_file.read_text(encoding="utf-8"))
        course = self.recreate_course(cfg)

        total_lessons = total_hw = total_quizzes = 0
        for path in module_files:
            text = path.read_text(encoding="utf-8")
            m = re.search(r"^# Модуль\s+(\d+)\.\s*(.+)$", text, re.M)
            if not m:
                raise CommandError(f"{path.name}: нет заголовка '# Модуль N.'")
            number, title = int(m.group(1)), m.group(2).strip()
            module = Module.objects.create(
                course=course, title=f"Модуль {number}. {title}", order=number
            )
            for order, data in enumerate(parse_lessons_block(text)):
                lesson = Lesson.objects.create(
                    module=module,
                    title=data["title"],
                    content=data["content"],
                    duration_minutes=data["duration"],
                    order=order,
                )
                total_lessons += 1
                hw_text = homeworks.get(data["num"])
                if hw_text:
                    Homework.objects.create(
                        lesson=lesson,
                        title=f"Домашнее задание к уроку {data['num']}",
                        description=hw_text,
                    )
                    total_hw += 1
            if tests.get(number):
                create_quiz(module, f"Тест по модулю {number}", tests[number], BIG_PASS_SCORE)
                total_quizzes += 1

        self.stdout.write(
            f"{cfg['title']}: {total_lessons} уроков, {total_hw} домашек, "
            f"{total_quizzes} тестов (проходной {BIG_PASS_SCORE}%)"
        )

    def import_mini(self, base, cfg):
        folder = self.find_dir(base, cfg["dir"])
        path = next(folder.glob(cfg["file_glob"]), None)
        if not path:
            raise CommandError(f"{cfg['slug']}: файл мини-курса не найден")
        text = path.read_text(encoding="utf-8")

        # итоговый тест отделяем от уроков
        parts = re.split(r"^# ИТОГОВЫЙ ТЕСТ.*$", text, flags=re.M)
        lessons_text = parts[0]
        test_text = parts[1] if len(parts) > 1 else ""

        course = self.recreate_course(cfg)

        total_lessons = 0
        last_module = None
        for block in re.split(r"^# Модуль\s+", lessons_text, flags=re.M)[1:]:
            header, _, body = block.partition("\n")
            num_match = re.match(r"(\d+)\.\s*(.*)", header.strip())
            number, title = int(num_match.group(1)), num_match.group(2).strip()
            module = Module.objects.create(
                course=course, title=f"Модуль {number}. {title}", order=number
            )
            last_module = module
            for order, data in enumerate(parse_lessons_block(body)):
                Lesson.objects.create(
                    module=module,
                    title=data["title"],
                    content=data["content"],
                    duration_minutes=data["duration"],
                    order=order,
                )
                total_lessons += 1

        quiz_note = "без теста"
        answers_match = re.search(
            r"^### Ответы.*?$\n+(.+)$", test_text, re.M
        )
        if last_module and answers_match:
            answers = dict(re.findall(r"(\d+)-([a-d])", answers_match.group(1)))
            questions = parse_questions(test_text[: answers_match.start()], answers)
            if questions:
                create_quiz(
                    last_module, "Итоговый тест мини-курса", questions, MINI_PASS_SCORE
                )
                quiz_note = f"итоговый тест из {len(questions)} вопросов (проходной {MINI_PASS_SCORE}%)"

        self.stdout.write(f"{cfg['title']}: {total_lessons} уроков, {quiz_note}")
