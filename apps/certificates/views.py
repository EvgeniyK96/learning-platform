from rest_framework import generics, permissions

from .models import Certificate
from .serializers import CertificateSerializer


class MyCertificatesView(generics.ListAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user).select_related(
            "course", "user"
        )


class VerifyCertificateView(generics.RetrieveAPIView):
    """Публичная проверка подлинности сертификата по номеру."""

    queryset = Certificate.objects.select_related("course", "user")
    serializer_class = CertificateSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "number"
