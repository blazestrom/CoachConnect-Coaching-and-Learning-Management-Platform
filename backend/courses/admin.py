from django.contrib import admin
from .models import Course, Enrollment, LearningResource, ResourceProgress


class LearningResourceInline(admin.TabularInline):
    model = LearningResource
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "coach",
        "category",
        "level",
        "price",
        "is_published",
        "created_at",
    )
    list_filter = ("category", "level", "is_published")
    search_fields = ("title", "description", "coach__email")
    inlines = [LearningResourceInline]


@admin.register(LearningResource)
class LearningResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "resource_type", "order")
    list_filter = ("resource_type",)
    search_fields = ("title", "course__title")


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "course",
        "status",
        "progress_percentage",
        "enrolled_at",
    )
    list_filter = ("status",)
    search_fields = ("student__email", "course__title")


@admin.register(ResourceProgress)
class ResourceProgressAdmin(admin.ModelAdmin):
    list_display = ("enrollment", "resource", "is_completed", "completed_at")
    list_filter = ("is_completed",)
