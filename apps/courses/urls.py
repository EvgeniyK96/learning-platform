from django.urls import path

from . import views

urlpatterns = [
    path("", views.CourseListView.as_view(), name="course-list"),
    path("my/", views.MyEnrollmentsView.as_view(), name="my-enrollments"),
    path("<int:pk>/", views.CourseDetailView.as_view(), name="course-detail"),
    path("<int:pk>/enroll/", views.EnrollView.as_view(), name="course-enroll"),
    path("lessons/<int:pk>/", views.LessonDetailView.as_view(), name="lesson-detail"),
    path("lessons/<int:pk>/complete/", views.CompleteLessonView.as_view(), name="lesson-complete"),
]
