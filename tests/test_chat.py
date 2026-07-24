"""Чат: право переписки только в паре ученик ↔ преподаватель его курса."""

import pytest

from apps.chat.models import Message

pytestmark = pytest.mark.django_db


# ---------- контакты ----------

def test_student_contact_is_the_teacher(api, teacher, course, enrolled_student):
    res = api(enrolled_student).get("/api/chat/contacts/")
    assert res.status_code == 200
    ids = [c["id"] for c in res.json()]
    assert teacher.id in ids


def test_outsider_has_no_contacts(api, course, outsider):
    res = api(outsider).get("/api/chat/contacts/")
    assert res.status_code == 200
    assert res.json() == []


# ---------- отправка и разграничение доступа ----------

def test_student_can_message_teacher(api, teacher, course, enrolled_student):
    res = api(enrolled_student).post(
        f"/api/chat/thread/{teacher.id}/", {"body": "Здравствуйте!"}, format="json"
    )
    assert res.status_code == 201
    assert Message.objects.filter(sender=enrolled_student, recipient=teacher).count() == 1


def test_teacher_can_reply_to_student(api, teacher, course, enrolled_student):
    res = api(teacher).post(
        f"/api/chat/thread/{enrolled_student.id}/", {"body": "Добрый день"}, format="json"
    )
    assert res.status_code == 201


def test_outsider_cannot_message_teacher(api, teacher, course, outsider):
    res = api(outsider).post(
        f"/api/chat/thread/{teacher.id}/", {"body": "привет"}, format="json"
    )
    assert res.status_code == 403
    assert not Message.objects.filter(recipient=teacher).exists()


def test_student_cannot_message_arbitrary_user(api, enrolled_student, outsider):
    """Ученик не может писать тому, кто не его преподаватель."""
    res = api(enrolled_student).post(
        f"/api/chat/thread/{outsider.id}/", {"body": "привет"}, format="json"
    )
    assert res.status_code == 403


def test_empty_message_rejected(api, teacher, course, enrolled_student):
    res = api(enrolled_student).post(
        f"/api/chat/thread/{teacher.id}/", {"body": "   "}, format="json"
    )
    assert res.status_code == 400


def test_anonymous_cannot_access_chat(api, teacher):
    assert api().get(f"/api/chat/thread/{teacher.id}/").status_code == 401


# ---------- непрочитанные и отметка о прочтении ----------

def test_unread_increments_then_clears_on_read(api, teacher, course, enrolled_student):
    api(enrolled_student).post(
        f"/api/chat/thread/{teacher.id}/", {"body": "вопрос"}, format="json"
    )
    # у преподавателя одно непрочитанное
    assert api(teacher).get("/api/chat/unread/").json()["unread"] == 1

    # открытие переписки помечает входящие прочитанными
    thread = api(teacher).get(f"/api/chat/thread/{enrolled_student.id}/")
    assert thread.status_code == 200
    assert len(thread.json()["messages"]) == 1
    assert api(teacher).get("/api/chat/unread/").json()["unread"] == 0


def test_thread_shows_both_sides(api, teacher, course, enrolled_student):
    api(enrolled_student).post(
        f"/api/chat/thread/{teacher.id}/", {"body": "вопрос"}, format="json"
    )
    api(teacher).post(
        f"/api/chat/thread/{enrolled_student.id}/", {"body": "ответ"}, format="json"
    )
    res = api(enrolled_student).get(f"/api/chat/thread/{teacher.id}/")
    bodies = [m["body"] for m in res.json()["messages"]]
    assert bodies == ["вопрос", "ответ"]
    # флаг "mine" считается относительно текущего пользователя
    mine = {m["body"]: m["mine"] for m in res.json()["messages"]}
    assert mine["вопрос"] is True
    assert mine["ответ"] is False
