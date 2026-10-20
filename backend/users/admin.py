from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CoachProfile, StudentProfile, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "email",
        "first_name",
        "last_name",
        "role",
        "is_active",
        "is_staff",
    )
    list_filter = ("role", "is_active", "is_staff")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal info",
            {"fields": ("first_name", "last_name", "phone", "bio", "avatar")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    ordering = ("email",)


@admin.register(CoachProfile)
class CoachProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "headline",
        "expertise",
        "hourly_rate",
        "rating",
        "is_verified",
    )
    list_filter = ("is_verified",)
    search_fields = ("user__email", "headline", "expertise")


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "education_level", "interests")
    search_fields = ("user__email", "learning_goals")
