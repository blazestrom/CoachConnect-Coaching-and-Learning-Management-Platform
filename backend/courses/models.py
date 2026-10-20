from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Course(models.Model):
    LEVEL_CHOICES = (
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Advanced", "Advanced"),
        ("All Levels", "All Levels"),
    )

    CATEGORY_CHOICES = (
        ("Software Engineering", "Software Engineering"),
        ("Data Science & AI", "Data Science & AI"),
        ("Cloud & DevOps", "Cloud & DevOps"),
        ("Product & Design", "Product & Design"),
        ("Career & Leadership", "Career & Leadership"),
    )

    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses_taught",
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    category = models.CharField(
        max_length=100, choices=CATEGORY_CHOICES, default="Software Engineering"
    )
    description = models.TextField()
    learning_objectives = models.TextField(
        help_text="Newline separated learning objectives"
    )
    duration_hours = models.PositiveIntegerField(default=10)
    level = models.CharField(
        max_length=50, choices=LEVEL_CHOICES, default="All Levels"
    )
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    thumbnail_url = models.URLField(blank=True, default="")
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or "course"
            candidate = base_slug
            idx = 1
            while Course.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{idx}"
                idx += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class LearningResource(models.Model):
    RESOURCE_TYPES = (
        ("video", "Video Lesson"),
        ("document", "Reading Material"),
        ("link", "Reference Link"),
        ("assignment", "Practical Assignment"),
    )

    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="resources"
    )
    title = models.CharField(max_length=255)
    resource_type = models.CharField(
        max_length=50, choices=RESOURCE_TYPES, default="video"
    )
    url = models.URLField(blank=True, default="")
    description = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField(default=1)
    duration_minutes = models.PositiveIntegerField(default=15)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Enrollment(models.Model):
    STATUS_CHOICES = (
        ("active", "Active"),
        ("completed", "Completed"),
        ("dropped", "Dropped"),
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="enrollments"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="active"
    )
    progress_percentage = models.PositiveIntegerField(default=0)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("student", "course")
        ordering = ["-enrolled_at"]

    def __str__(self):
        return f"{self.student.email} -> {self.course.title} ({self.status})"

    def recalculate_progress(self):
        total = self.course.resources.count()
        if total == 0:
            self.progress_percentage = 100
        else:
            completed_count = self.resource_progress.filter(
                is_completed=True
            ).count()
            self.progress_percentage = int((completed_count / total) * 100)
            if self.progress_percentage >= 100:
                self.status = "completed"
                from django.utils import timezone

                if not self.completed_at:
                    self.completed_at = timezone.now()
            else:
                if self.status == "completed":
                    self.status = "active"
                    self.completed_at = None
        self.save(update_fields=["progress_percentage", "status", "completed_at"])
        return self.progress_percentage


class ResourceProgress(models.Model):
    enrollment = models.ForeignKey(
        Enrollment, on_delete=models.CASCADE, related_name="resource_progress"
    )
    resource = models.ForeignKey(
        LearningResource, on_delete=models.CASCADE, related_name="progress_records"
    )
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("enrollment", "resource")

    def __str__(self):
        return f"Progress: {self.enrollment.student.email} on {self.resource.title} ({self.is_completed})"
