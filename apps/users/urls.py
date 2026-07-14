from django.urls import path

from . import views
from .telegram_auth import (
    TelegramGatewaySendCodeView,
    TelegramGatewayVerifyCodeView,
    TelegramWidgetAuthView,
)

urlpatterns = [
    path("me/", views.MeView.as_view(), name="user-me"),
    path("dashboard/", views.DashboardView.as_view(), name="user-dashboard"),
    # Telegram Gateway API (phone verification)
    path(
        "telegram/gateway/send-code/",
        TelegramGatewaySendCodeView.as_view(),
        name="telegram-gateway-send-code",
    ),
    path(
        "telegram/gateway/verify-code/",
        TelegramGatewayVerifyCodeView.as_view(),
        name="telegram-gateway-verify-code",
    ),
    # Telegram Login Widget
    path(
        "telegram/widget/auth/",
        TelegramWidgetAuthView.as_view(),
        name="telegram-widget-auth",
    ),
]
