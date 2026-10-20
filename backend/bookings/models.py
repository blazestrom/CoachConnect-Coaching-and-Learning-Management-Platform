from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from courses.models import Course


class AvailabilitySlot(models.Model):
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="availability_slots",
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "start_time"]
        unique_together = ("coach", "date", "start_time")

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("Slot start time must be earlier than end time.")

    def __str__(self):
        return f"{self.coach.get_full_name() or self.coach.email} on {self.date} [{self.start_time} - {self.end_time}] {'(Booked)' if self.is_booked else '(Available)'}"


class Booking(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_bookings",
    )
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="coach_bookings",
    )
    slot = models.OneToOneField(
        AvailabilitySlot,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="booking",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings",
    )
    topic = models.CharField(max_length=255)
    notes = models.TextField(blank=True, default="")
    meeting_link = models.URLField(
        blank=True, default="https://meet.jit.si/coachconnect-session"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="confirmed"
    )
    cancellation_reason = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Booking #{self.id}: {self.student.email} with {self.coach.email} ({self.status})"
