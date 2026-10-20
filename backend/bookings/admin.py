from django.contrib import admin
from .models import AvailabilitySlot, Booking


@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = ("coach", "date", "start_time", "end_time", "is_booked")
    list_filter = ("is_booked", "date")
    search_fields = ("coach__email",)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student",
        "coach",
        "topic",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("student__email", "coach__email", "topic")
