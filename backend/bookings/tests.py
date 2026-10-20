import datetime
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User
from bookings.models import AvailabilitySlot, Booking


class BookingAndSlotTests(APITestCase):
    def setUp(self):
        self.coach = User.objects.create_user(
            email="coach_booking@example.com",
            password="Password123!",
            role="coach",
            first_name="Coach",
            last_name="Booking",
        )
        self.student1 = User.objects.create_user(
            email="student1_booking@example.com",
            password="Password123!",
            role="student",
            first_name="Student",
            last_name="One",
        )
        self.student2 = User.objects.create_user(
            email="student2_booking@example.com",
            password="Password123!",
            role="student",
            first_name="Student",
            last_name="Two",
        )

        tomorrow = datetime.date.today() + datetime.timedelta(days=2)
        self.slot = AvailabilitySlot.objects.create(
            coach=self.coach,
            date=tomorrow,
            start_time=datetime.time(14, 0),
            end_time=datetime.time(15, 0),
            is_booked=False,
        )

    def test_student_can_book_available_slot(self):
        self.client.force_authenticate(user=self.student1)
        url = reverse("booking_list_create")
        payload = {
            "slot_id": self.slot.id,
            "topic": "Mentorship on Database Sharding",
            "notes": "Discussing partition keys",
        }
        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.slot.refresh_from_db()
        self.assertTrue(self.slot.is_booked)
        self.assertEqual(
            Booking.objects.filter(student=self.student1, slot=self.slot).count(), 1
        )

    def test_prevent_double_booking_conflict(self):
        self.client.force_authenticate(user=self.student1)
        url = reverse("booking_list_create")
        payload = {
            "slot_id": self.slot.id,
            "topic": "First Booking Request",
        }
        res1 = self.client.post(url, data=payload)
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Second student tries to book same slot
        self.client.force_authenticate(user=self.student2)
        res2 = self.client.post(url, data={"slot_id": self.slot.id, "topic": "Conflicting attempt"})
        self.assertEqual(res2.status_code, status.HTTP_409_CONFLICT)

    def test_cancellation_releases_slot(self):
        self.client.force_authenticate(user=self.student1)
        url = reverse("booking_list_create")
        res1 = self.client.post(url, data={"slot_id": self.slot.id, "topic": "Session to cancel"})
        booking_id = res1.data["id"]

        cancel_url = reverse("booking_cancel", kwargs={"pk": booking_id})
        res2 = self.client.post(cancel_url, data={"reason": "Scheduling conflict"})
        self.assertEqual(res2.status_code, status.HTTP_200_OK)

        booking = Booking.objects.get(pk=booking_id)
        self.assertEqual(booking.status, "cancelled")
        self.slot.refresh_from_db()
        self.assertFalse(self.slot.is_booked)
