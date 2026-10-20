from django.urls import path
from .views import (
    CoachStudentEnrollmentsView,
    CourseDetailView,
    CourseListCreateView,
    CourseResourceDetailView,
    CourseResourceListCreateView,
    EnrollCourseView,
    StudentEnrollmentsView,
    ToggleResourceProgressView,
)

urlpatterns = [
    path("courses/", CourseListCreateView.as_view(), name="course_list_create"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course_detail"),
    path(
        "courses/<int:course_id>/resources/",
        CourseResourceListCreateView.as_view(),
        name="course_resource_list_create",
    ),
    path(
        "courses/resources/<int:pk>/",
        CourseResourceDetailView.as_view(),
        name="course_resource_detail",
    ),
    path(
        "courses/<int:course_id>/enroll/",
        EnrollCourseView.as_view(),
        name="course_enroll",
    ),
    path(
        "courses/my-enrollments/",
        StudentEnrollmentsView.as_view(),
        name="student_enrollments",
    ),
    path(
        "courses/coach-students/",
        CoachStudentEnrollmentsView.as_view(),
        name="coach_student_enrollments",
    ),
    path(
        "courses/resources/<int:resource_id>/toggle-complete/",
        ToggleResourceProgressView.as_view(),
        name="toggle_resource_progress",
    ),
]
