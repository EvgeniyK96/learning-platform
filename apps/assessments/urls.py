from django.urls import path

from . import views

urlpatterns = [
    path("quizzes/<int:pk>/", views.QuizDetailView.as_view(), name="quiz-detail"),
    path("quizzes/<int:pk>/submit/", views.QuizSubmitView.as_view(), name="quiz-submit"),
    path("attempts/", views.MyAttemptsView.as_view(), name="my-attempts"),
    path("homeworks/<int:pk>/", views.HomeworkDetailView.as_view(), name="homework-detail"),
    path("homeworks/<int:pk>/submit/", views.HomeworkSubmitView.as_view(), name="homework-submit"),
    path("submissions/", views.MySubmissionsView.as_view(), name="my-submissions"),
]
