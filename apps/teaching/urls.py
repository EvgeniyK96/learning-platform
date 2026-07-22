from django.urls import path

from . import views

urlpatterns = [
    path("overview/", views.TeacherOverviewView.as_view(), name="teacher-overview"),
    path("courses/", views.TeacherCoursesView.as_view(), name="teacher-courses"),
    path("courses/<int:pk>/students/", views.CourseStudentsView.as_view(), name="teacher-course-students"),
    path("submissions/", views.TeacherSubmissionsView.as_view(), name="teacher-submissions"),
    path("submissions/<int:pk>/", views.TeacherSubmissionReviewView.as_view(), name="teacher-submission-review"),
]
