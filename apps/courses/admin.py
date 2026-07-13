from django.contrib import admin

from .models import Course, Enrollment, Lesson, LessonProgress, Module


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["title", "level", "language", "teacher", "is_published", "created_at"]
    list_filter = ["level", "is_published"]
    search_fields = ["title", "description"]
    prepopulated_fields = {"slug": ["title"]}
    inlines = [ModuleInline]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "order"]
    list_filter = ["course"]
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ["title", "module", "order", "duration_minutes"]
    list_filter = ["module__course"]
    search_fields = ["title"]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ["user", "course", "enrolled_at"]
    list_filter = ["course"]


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ["user", "lesson", "completed_at"]
