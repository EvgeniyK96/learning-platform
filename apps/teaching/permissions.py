from rest_framework.permissions import BasePermission


class IsTeacher(BasePermission):
    """Доступ только пользователям с ролью преподавателя."""

    message = "Доступно только преподавателям."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_teacher)
