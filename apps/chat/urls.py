from django.urls import path

from . import views

urlpatterns = [
    path("contacts/", views.ContactsView.as_view(), name="chat-contacts"),
    path("unread/", views.UnreadCountView.as_view(), name="chat-unread"),
    path("thread/<int:user_id>/", views.ThreadView.as_view(), name="chat-thread"),
]
