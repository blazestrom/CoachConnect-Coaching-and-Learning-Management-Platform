from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = (
        ("booking_created", "Booking Created"),
        ("booking_confirmed", "Booking Confirmed"),
        ("booking_cancelled", "Booking Cancelled"),
        ("course_enrolled", "Course Enrolled"),
        ("progress_update", "Progress Update"),
        ("system", "System Notification"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=50, choices=TYPE_CHOICES, default="system"
    )
    link = models.CharField(max_length=255, blank=True, default="")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.title} ({'Read' if self.is_read else 'Unread'})"
