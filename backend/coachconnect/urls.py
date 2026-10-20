from core.views import DashboardStatsView
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # OpenAPI Schema and Swagger UI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # Dashboard API
    path(
        "api/dashboard/stats/",
        DashboardStatsView.as_view(),
        name="dashboard_stats",
    ),
    # App URLs
    path("api/", include("users.urls")),
    path("api/", include("courses.urls")),
    path("api/", include("bookings.urls")),
    path("api/", include("notifications.urls")),
]
