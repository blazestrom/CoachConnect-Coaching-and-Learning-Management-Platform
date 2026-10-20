from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("username", email.split("@")[0])
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = (
        ("student", "Student"),
        ("coach", "Coach"),
        ("admin", "Administrator"),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")
    phone = models.CharField(max_length=30, blank=True, default="")
    bio = models.TextField(blank=True, default="")
    avatar = models.URLField(blank=True, default="")

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_full_name() or self.email} ({self.role})"

    @property
    def is_coach(self):
        return self.role == "coach"

    @property
    def is_student(self):
        return self.role == "student"

    @property
    def is_administrator(self):
        return self.role == "admin" or self.is_superuser


class CoachProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="coach_profile"
    )
    headline = models.CharField(
        max_length=200, blank=True, default="Certified Professional Coach"
    )
    expertise = models.CharField(
        max_length=255,
        blank=True,
        default="Software Architecture, Career Mentorship",
    )
    qualifications = models.TextField(blank=True, default="")
    years_of_experience = models.PositiveIntegerField(default=3)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.9)
    total_reviews = models.PositiveIntegerField(default=12)
    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Coach Profile: {self.user.email}"


class StudentProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="student_profile"
    )
    education_level = models.CharField(max_length=100, blank=True, default="")
    learning_goals = models.TextField(blank=True, default="")
    interests = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Student Profile: {self.user.email}"
