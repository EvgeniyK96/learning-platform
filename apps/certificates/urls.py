from django.urls import path

from . import views

urlpatterns = [
    path("", views.MyCertificatesView.as_view(), name="my-certificates"),
    path("verify/<str:number>/", views.VerifyCertificateView.as_view(), name="certificate-verify"),
]
