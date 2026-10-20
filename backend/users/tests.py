from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User, CoachProfile, StudentProfile


class UserAuthTests(APITestCase):
    def test_student_registration(self):
        url = reverse("register")
        payload = {
            "email": "newstudent@example.com",
            "password": "SecurePass123!",
            "first_name": "New",
            "last_name": "Student",
            "role": "student",
            "education_level": "Undergraduate",
            "learning_goals": "Software engineering fundamentals",
        }
        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["email"], "newstudent@example.com")
        self.assertTrue(
            StudentProfile.objects.filter(
                user__email="newstudent@example.com"
            ).exists()
        )

    def test_coach_registration(self):
        url = reverse("register")
        payload = {
            "email": "newcoach@example.com",
            "password": "SecurePass123!",
            "first_name": "New",
            "last_name": "Coach",
            "role": "coach",
            "headline": "Lead System Architect",
            "expertise": "Go, Distributed Queues",
            "hourly_rate": 80.00,
        }
        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertTrue(
            CoachProfile.objects.filter(
                user__email="newcoach@example.com"
            ).exists()
        )

    def test_user_login(self):
        user = User.objects.create_user(
            email="loginuser@example.com",
            password="MySecretPassword123!",
            role="student",
        )
        url = reverse("login")
        response = self.client.post(
            url,
            data={"email": "loginuser@example.com", "password": "MySecretPassword123!"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["email"], "loginuser@example.com")

    def test_invalid_login_credentials(self):
        url = reverse("login")
        response = self.client.post(
            url,
            data={"email": "nonexistent@example.com", "password": "WrongPassword"},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
