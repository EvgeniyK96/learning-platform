from django.urls import path

from . import views

urlpatterns = [
    path("me/", views.MeView.as_view(), name="user-me"),
    path("dashboard/", views.DashboardView.as_view(), name="user-dashboard"),
]
