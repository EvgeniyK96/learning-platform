from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    mine = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "sender", "recipient", "body", "created_at", "read_at", "mine"]
        read_only_fields = ["id", "sender", "recipient", "created_at", "read_at"]

    def get_mine(self, obj):
        request = self.context.get("request")
        return bool(request and obj.sender_id == request.user.id)


class MessageCreateSerializer(serializers.Serializer):
    body = serializers.CharField(max_length=4000, trim_whitespace=True)

    def validate_body(self, value):
        if not value.strip():
            raise serializers.ValidationError("Сообщение не может быть пустым.")
        return value
