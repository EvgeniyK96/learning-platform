"""Общие фикстуры для тестов: пользователи, курс с ДЗ, записи, сдачи."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.assessments.models import Homework, HomeworkSubmission
from apps.courses.models import Course, Enrollment, Lesson, Module

User = get_user_model()


@pytest.fixture
def make_user(db):
    def _make(username, is_teacher=False, **kw):
        return User.objects.create_user(
            username=username, password="pass12345", is_teacher=is_teacher, **kw
        )
    return _make


@pytest.fixture
def api():
    """Фабрика APIClient: api(user) — авторизованный, api() — аноним."""
    def _api(user=None):
        client = APIClient()
        if user is not None:
            client.force_authenticate(user)
        return client
    return _api


@pytest.fixture
def teacher(make_user):
    return make_user("teacher1", is_teacher=True, first_name="Пре", last_name="Под")


@pytest.fixture
def other_teacher(make_user):
    return make_user("teacher2", is_teacher=True)


@pytest.fixture
def student(make_user):
    return make_user("student1", first_name="Уче", last_name="Ник")


@pytest.fixture
def outsider(make_user):
    """Авторизованный пользователь, не записанный на курс преподавателя."""
    return make_user("outsider1")


@pytest.fixture
def course(db, teacher):
    """Курс преподавателя `teacher` с одним уроком и домашним заданием."""
    c = Course.objects.create(
        title="Тест-курс", slug="test-course", description="описание", teacher=teacher
    )
    module = Module.objects.create(course=c, title="Модуль 1", order=1)
    lesson = Lesson.objects.create(module=module, title="Урок 1", order=1)
    Homework.objects.create(lesson=lesson, title="ДЗ 1", description="сделать задание")
    return c


@pytest.fixture
def homework(course):
    return Homework.objects.get(lesson__module__course=course)


@pytest.fixture
def enrolled_student(course, student):
    Enrollment.objects.create(user=student, course=course)
    return student


@pytest.fixture
def submission(homework, enrolled_student):
    return HomeworkSubmission.objects.create(
        homework=homework, user=enrolled_student, text="моё решение"
    )
