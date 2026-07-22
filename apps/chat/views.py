from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Message
from .serializers import MessageCreateSerializer, MessageSerializer
from .services import can_chat, chat_partner_ids

User = get_user_model()


def _display_name(user):
    return user.get_full_name() or user.username


class ContactsView(APIView):
    """Список собеседников: с кем можно переписываться, с последним
    сообщением и числом непрочитанных. Сортировка — по свежести переписки."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        me = request.user
        partner_ids = chat_partner_ids(me)
        partners = User.objects.filter(id__in=partner_ids)

        contacts = []
        for u in partners:
            last = (
                Message.objects.filter(
                    Q(sender=me, recipient=u) | Q(sender=u, recipient=me)
                )
                .order_by("-created_at")
                .first()
            )
            unread = Message.objects.filter(
                sender=u, recipient=me, read_at__isnull=True
            ).count()
            contacts.append({
                "id": u.id,
                "name": _display_name(u),
                "username": u.username,
                "is_teacher": u.is_teacher,
                "last_message": last.body if last else "",
                "last_at": last.created_at if last else None,
                "unread": unread,
            })

        contacts.sort(
            key=lambda c: (c["last_at"] is not None, c["last_at"] or 0),
            reverse=True,
        )
        return Response(contacts)


class ThreadView(APIView):
    """Переписка с одним пользователем.

    GET — история сообщений (входящие помечаются прочитанными).
    POST — отправить сообщение.
    """

    permission_classes = [permissions.IsAuthenticated]

    def _partner(self, request, user_id):
        if not can_chat(request.user, user_id):
            raise PermissionDenied(
                "С этим пользователем нельзя переписываться. "
                "Чат доступен только между учеником и преподавателем его курса."
            )
        return generics.get_object_or_404(User, pk=user_id)

    def get(self, request, user_id):
        partner = self._partner(request, user_id)
        me = request.user
        messages = Message.objects.filter(
            Q(sender=me, recipient=partner) | Q(sender=partner, recipient=me)
        ).order_by("created_at")

        # входящие непрочитанные — помечаем прочитанными
        Message.objects.filter(
            sender=partner, recipient=me, read_at__isnull=True
        ).update(read_at=timezone.now())

        return Response({
            "partner": {
                "id": partner.id,
                "name": _display_name(partner),
                "username": partner.username,
                "is_teacher": partner.is_teacher,
            },
            "messages": MessageSerializer(
                messages, many=True, context={"request": request}
            ).data,
        })

    def post(self, request, user_id):
        partner = self._partner(request, user_id)
        serializer = MessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = Message.objects.create(
            sender=request.user,
            recipient=partner,
            body=serializer.validated_data["body"],
        )
        return Response(
            MessageSerializer(message, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class UnreadCountView(APIView):
    """Общее число непрочитанных сообщений — для бейджа в навигации."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(
            recipient=request.user, read_at__isnull=True
        ).count()
        return Response({"unread": count})
