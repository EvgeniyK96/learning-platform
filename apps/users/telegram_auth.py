"""Telegram authentication views (Gateway API + Login Widget)."""

import hashlib
import hmac
import time
from urllib.parse import parse_qsl

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from telegram_gateway_verification import TelegramGatewayClient
from telegram_gateway_verification.exceptions import TelegramGatewayError

User = get_user_model()


class TelegramGatewaySendCodeView(APIView):
    """Send verification code via Telegram Gateway API."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_number = request.data.get("phone_number")
        if not phone_number:
            return Response(
                {"error": "phone_number is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        gateway_token = settings.TELEGRAM_GATEWAY_TOKEN
        if not gateway_token:
            return Response(
                {"error": "Telegram Gateway not configured"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            gateway = TelegramGatewayClient(gateway_token)
            result = gateway.send_verification_message(
                phone_number=phone_number,
                code_length=5,
                ttl=120,
            )
            return Response(
                {
                    "request_id": result.request_id,
                    "ttl": 120,
                }
            )
        except TelegramGatewayError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class TelegramGatewayVerifyCodeView(APIView):
    """Verify code and authenticate/login user."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        request_id = request.data.get("request_id")
        code = request.data.get("code")
        phone_number = request.data.get("phone_number")

        if not all([request_id, code, phone_number]):
            return Response(
                {"error": "request_id, code, and phone_number are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        gateway_token = settings.TELEGRAM_GATEWAY_TOKEN
        if not gateway_token:
            return Response(
                {"error": "Telegram Gateway not configured"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            gateway = TelegramGatewayClient(gateway_token)
            result = gateway.check_verification_status(request_id, code=code)

            # Check if code is valid
            if not result.verification_status or result.verification_status.status != "code_valid":
                return Response(
                    {"error": "Invalid or expired code"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user, created = User.objects.get_or_create(
                username=f"tg_{phone_number}",
                defaults={
                    "phone_number": phone_number,
                    "first_name": "Telegram",
                },
            )

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "first_name": user.first_name,
                        "phone_number": phone_number,
                    },
                    "created": created,
                }
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class TelegramWidgetAuthView(APIView):
    """Verify Telegram Login Widget data and authenticate user."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        auth_data = request.data
        if not auth_data:
            return Response(
                {"error": "No auth data provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        bot_token = settings.TELEGRAM_BOT_TOKEN
        if not bot_token:
            return Response(
                {"error": "Telegram Bot not configured"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not self._verify_telegram_auth(auth_data, bot_token):
            return Response(
                {"error": "Invalid Telegram authentication data"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if self._is_auth_data_expired(auth_data):
            return Response(
                {"error": "Authentication data expired"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        telegram_id = str(auth_data.get("id"))
        username = auth_data.get("username", f"tg_{telegram_id}")
        first_name = auth_data.get("first_name", "Telegram")
        last_name = auth_data.get("last_name", "")
        photo_url = auth_data.get("photo_url", "")

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
            },
        )

        if created or not user.first_name:
            user.first_name = first_name
            user.last_name = last_name
            user.save(update_fields=["first_name", "last_name"])

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "telegram_id": telegram_id,
                    "photo_url": photo_url,
                },
                "created": created,
            }
        )

    def _verify_telegram_auth(self, auth_data: dict, bot_token: str) -> bool:
        """Verify Telegram Login Widget hash."""
        received_hash = auth_data.pop("hash", None)
        if not received_hash:
            return False

        data_check_arr = []
        for key, value in sorted(auth_data.items()):
            data_check_arr.append(f"{key}={value}")
        data_check_string = "\n".join(data_check_arr)

        secret_key = hashlib.sha256(bot_token.encode()).digest()
        calculated_hash = hmac.new(
            secret_key, data_check_string.encode(), hashlib.sha256
        ).hexdigest()

        auth_data["hash"] = received_hash
        return hmac.compare_digest(calculated_hash, received_hash)

    def _is_auth_data_expired(self, auth_data: dict, max_age: int = 86400) -> bool:
        """Check if auth data is older than max_age seconds (default 24h)."""
        auth_date = auth_data.get("auth_date")
        if not auth_date:
            return True
        return (int(time.time()) - int(auth_date)) > max_age