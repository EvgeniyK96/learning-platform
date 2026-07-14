"""Троттлинг для эндпоинтов аутентификации и регистрации (анти-брутфорс)."""

from djoser.views import UserViewSet
from rest_framework_simplejwt.views import TokenObtainPairView


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Вход (JWT): не более 10 попыток в минуту с одного адреса."""

    throttle_scope = "auth"


class ThrottledUserViewSet(UserViewSet):
    """djoser UserViewSet с ограничением частоты на регистрацию."""

    def get_throttles(self):
        if self.action == "create":
            self.throttle_scope = "register"
        return super().get_throttles()
