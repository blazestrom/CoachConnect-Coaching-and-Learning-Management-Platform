from django.urls import path
from .views import (
    AdminUserListView,
    AdminUserStatusUpdateView,
    CoachDetailView,
    CoachListView,
    CurrentUserView,
    LoginView,
    LogoutView,
    RegisterView,
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", CurrentUserView.as_view(), name="current_user"),
    path("coaches/", CoachListView.as_view(), name="coach_list"),
    path("coaches/<int:pk>/", CoachDetailView.as_view(), name="coach_detail"),
    path("admin/users/", AdminUserListView.as_view(), name="admin_user_list"),
    path(
        "admin/users/<int:pk>/status/",
        AdminUserStatusUpdateView.as_view(),
        name="admin_user_status",
    ),
]
