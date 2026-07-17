from django.contrib.auth import get_user_model
from rest_framework import generics, permissions

from .serializers import DashboardSerializer, UserSerializer


class MeView(generics.RetrieveUpdateAPIView):
    """Профиль текущего пользователя (личный кабинет)."""

    # queryset не используется (get_object → request.user), но без него
    # drf-yasg исключает эндпоинт из схемы
    queryset = get_user_model().objects.none()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class DashboardView(generics.RetrieveAPIView):
    """Сводка личного кабинета: курсы, прогресс, сертификаты, результаты."""

    queryset = get_user_model().objects.none()
    serializer_class = DashboardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
