"""Кабинет преподавателя: доступ по роли и изоляция «только свои курсы»."""

import pytest

from apps.assessments.models import HomeworkSubmission

pytestmark = pytest.mark.django_db


# ---------- доступ по роли ----------

def test_anonymous_gets_401(api):
    assert api().get("/api/teaching/courses/").status_code == 401


def test_student_forbidden_from_teaching(api, enrolled_student):
    assert api(enrolled_student).get("/api/teaching/courses/").status_code == 403


def test_teacher_sees_own_courses(api, teacher, course):
    res = api(teacher).get("/api/teaching/courses/")
    assert res.status_code == 200
    titles = [c["title"] for c in res.json()]
    assert course.title in titles


def test_teacher_does_not_see_foreign_courses(api, other_teacher, course):
    """Другой преподаватель не видит чужой курс в своём списке."""
    res = api(other_teacher).get("/api/teaching/courses/")
    assert res.status_code == 200
    assert res.json() == []


# ---------- ученики и прогресс ----------

def test_teacher_sees_enrolled_students(api, teacher, course, enrolled_student):
    res = api(teacher).get(f"/api/teaching/courses/{course.id}/students/")
    assert res.status_code == 200
    usernames = [s["username"] for s in res.json()]
    assert enrolled_student.username in usernames
    assert res.json()[0]["progress"] == 0


def test_other_teacher_cannot_see_foreign_students(api, other_teacher, course):
    """Запрос учеников чужого курса → 404 (курс отфильтрован по владельцу)."""
    res = api(other_teacher).get(f"/api/teaching/courses/{course.id}/students/")
    assert res.status_code == 404


# ---------- очередь и проверка ДЗ ----------

def test_submission_queue_lists_pending(api, teacher, submission):
    res = api(teacher).get("/api/teaching/submissions/")
    assert res.status_code == 200
    ids = [s["id"] for s in res.json()]
    assert submission.id in ids


def test_other_teacher_queue_is_empty(api, other_teacher, submission):
    res = api(other_teacher).get("/api/teaching/submissions/")
    assert res.status_code == 200
    assert res.json() == []


def test_teacher_can_review_submission(api, teacher, submission):
    res = api(teacher).patch(
        f"/api/teaching/submissions/{submission.id}/",
        {"status": "accepted", "grade": 95, "teacher_comment": "Отлично"},
        format="json",
    )
    assert res.status_code == 200
    submission.refresh_from_db()
    assert submission.status == HomeworkSubmission.Status.ACCEPTED
    assert submission.grade == 95
    assert submission.teacher_comment == "Отлично"


def test_accepted_submission_leaves_pending_queue(api, teacher, submission):
    api(teacher).patch(
        f"/api/teaching/submissions/{submission.id}/",
        {"status": "accepted"}, format="json",
    )
    res = api(teacher).get("/api/teaching/submissions/")  # по умолчанию status=submitted
    assert submission.id not in [s["id"] for s in res.json()]


def test_other_teacher_cannot_review_foreign_submission(api, other_teacher, submission):
    res = api(other_teacher).patch(
        f"/api/teaching/submissions/{submission.id}/",
        {"status": "accepted"}, format="json",
    )
    assert res.status_code == 404
    submission.refresh_from_db()
    assert submission.status == HomeworkSubmission.Status.SUBMITTED


def test_grade_out_of_range_rejected(api, teacher, submission):
    res = api(teacher).patch(
        f"/api/teaching/submissions/{submission.id}/",
        {"grade": 150}, format="json",
    )
    assert res.status_code == 400


# ---------- преподаватель не обучается как ученик ----------

def test_teacher_cannot_enroll_in_course(api, teacher, course):
    from apps.courses.models import Enrollment

    res = api(teacher).post(f"/api/courses/{course.id}/enroll/")
    assert res.status_code == 403
    assert not Enrollment.objects.filter(user=teacher).exists()


def test_student_can_still_enroll(api, student, course):
    res = api(student).post(f"/api/courses/{course.id}/enroll/")
    assert res.status_code in (200, 201)


# ---------- сводка ----------

def test_overview_counts(api, teacher, course, submission):
    res = api(teacher).get("/api/teaching/overview/")
    assert res.status_code == 200
    data = res.json()
    assert data["courses_count"] == 1
    assert data["students_count"] == 1
    assert data["pending_submissions"] == 1
