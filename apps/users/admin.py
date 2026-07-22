from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Профиль", {"fields": ("avatar", "bio")}),
        ("Роль на платформе", {"fields": ("is_teacher",)}),
    )
    list_display = DjangoUserAdmin.list_display + ("is_teacher",)
    list_filter = DjangoUserAdmin.list_filter + ("is_teacher",)
