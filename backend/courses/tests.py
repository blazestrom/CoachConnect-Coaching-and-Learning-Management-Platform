import datetime
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User
from courses.models import Course, LearningResource, Enrollment


class CourseAndEnrollmentTests(APITestCase):
    def setUp(self):
        self.coach = User.objects.create_user(
            email="coach@example.com",
            password="Password123!",
            role="coach",
            first_name="Coach",
            last_name="Test",
        )
        self.student = User.objects.create_user(
            email="student@example.com",
            password="Password123!",
            role="student",
            first_name="Student",
            last_name="Test",
        )
        self.course = Course.objects.create(
            coach=self.coach,
            title="Intro to Scalable Systems",
            category="Software Engineering",
            description="Foundations of microservices",
            learning_objectives="Scale backends",
            duration_hours=10,
            price=50.00,
            is_published=True,
        )
        self.resource = LearningResource.objects.create(
            course=self.course,
            title="Lesson 1: Architecture",
            resource_type="video",
            url="https://example.com/video1",
            duration_minutes=20,
            order=1,
        )

    def test_student_can_list_published_courses(self):
        url = reverse("course_list_create")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should contain at least our course
        self.assertGreaterEqual(len(response.data.get("results", [])), 1)

    def test_student_can_enroll_in_course(self):
        self.client.force_authenticate(user=self.student)
        url = reverse("course_enroll", kwargs={"course_id": self.course.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Enrollment.objects.filter(
                student=self.student, course=self.course
            ).exists()
        )

    def test_cannot_duplicate_enrollment(self):
        self.client.force_authenticate(user=self.student)
        url = reverse("course_enroll", kwargs={"course_id": self.course.id})
        res1 = self.client.post(url)
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        res2 = self.client.post(url)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(
            Enrollment.objects.filter(
                student=self.student, course=self.course
            ).count(),
            1,
        )

    def test_toggle_resource_completion_and_progress(self):
        self.client.force_authenticate(user=self.student)
        # Enroll first
        self.client.post(reverse("course_enroll", kwargs={"course_id": self.course.id}))

        toggle_url = reverse(
            "toggle_resource_progress", kwargs={"resource_id": self.resource.id}
        )
        response = self.client.post(toggle_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["progress_percentage"], 100)
        self.assertEqual(response.data["status"], "completed")
