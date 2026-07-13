from django.contrib import admin

from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ["number", "user", "course", "issued_at"]
    search_fields = ["number", "user__username"]
    list_filter = ["course"]
