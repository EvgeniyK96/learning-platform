from django.contrib import admin

from .models import Choice, Homework, HomeworkSubmission, Question, Quiz, QuizAttempt


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 2


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ["title", "lesson", "pass_score"]
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["text", "quiz", "order"]
    list_filter = ["quiz"]
    inlines = [ChoiceInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ["user", "quiz", "score", "passed", "created_at"]
    list_filter = ["passed", "quiz"]


@admin.register(Homework)
class HomeworkAdmin(admin.ModelAdmin):
    list_display = ["title", "lesson"]


@admin.register(HomeworkSubmission)
class HomeworkSubmissionAdmin(admin.ModelAdmin):
    list_display = ["user", "homework", "status", "grade", "submitted_at"]
    list_filter = ["status"]
    list_editable = ["status", "grade"]

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if obj.status == HomeworkSubmission.Status.ACCEPTED:
            from apps.certificates.services import check_and_issue

            check_and_issue(obj.user, obj.homework.lesson.module.course)
