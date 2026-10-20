import uuid
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from core.permissions import IsCoachRole
from courses.models import Course
from notifications.models import Notification
from .models import AvailabilitySlot, Booking
from .serializers import (
    AvailabilitySlotSerializer,
    BookingCreateSerializer,
    BookingSerializer,
    SlotCreateSerializer,
)


class AvailabilitySlotListCreateView(generics.ListCreateAPIView):
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = AvailabilitySlot.objects.all().select_related("coach")

        coach_id = self.request.query_params.get("coach")
        if coach_id:
            qs = qs.filter(coach_id=coach_id)

        date = self.request.query_params.get("date")
        if date:
            qs = qs.filter(date=date)

        available_only = self.request.query_params.get("available_only")
        if available_only in ["true", "1"]:
            qs = qs.filter(is_booked=False)

        upcoming = self.request.query_params.get("upcoming")
        if upcoming in ["true", "1"]:
            today = timezone.now().date()
            qs = qs.filter(date__gte=today)

        return qs.order_by("date", "start_time")

    def create(self, request, *args, **kwargs):
        if not (request.user.role == "coach" or request.user.is_staff):
            return Response(
                {"error": "Only coaches can create availability slots."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = SlotCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        date = serializer.validated_data["date"]
        start_time = serializer.validated_data["start_time"]
        end_time = serializer.validated_data["end_time"]

        # Prevent duplicate or overlapping slot for the same coach on same day
        overlapping = AvailabilitySlot.objects.filter(
            coach=request.user,
            date=date,
            start_time__lt=end_time,
            end_time__gt=start_time,
        ).exists()

        if overlapping:
            return Response(
                {"error": "An overlapping availability slot already exists for this date and time."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slot = AvailabilitySlot.objects.create(
            coach=request.user,
            date=date,
            start_time=start_time,
            end_time=end_time,
        )

        return Response(
            AvailabilitySlotSerializer(slot).data,
            status=status.HTTP_201_CREATED,
        )


class AvailabilitySlotDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCoachRole]
    serializer_class = AvailabilitySlotSerializer
    queryset = AvailabilitySlot.objects.all()

    def perform_destroy(self, instance):
        if instance.coach != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You cannot delete this slot.")
        if instance.is_booked:
            raise permissions.PermissionDenied(
                "Cannot delete an already booked slot. Please cancel the booking instead."
            )
        instance.delete()


class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return BookingCreateSerializer
        return BookingSerializer

    def get_queryset(self):
        user = self.request.user
        qs = (
            Booking.objects.all()
            .select_related("student", "coach", "slot", "course")
            .order_by("-created_at")
        )

        if user.role == "student":
            qs = qs.filter(student=user)
        elif user.role == "coach":
            qs = qs.filter(coach=user)
        # Admin sees all

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        upcoming = self.request.query_params.get("upcoming")
        if upcoming in ["true", "1"]:
            today = timezone.now().date()
            qs = qs.filter(slot__date__gte=today, status="confirmed")

        return qs

    def create(self, request, *args, **kwargs):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        slot_id = serializer.validated_data["slot_id"]
        course_id = serializer.validated_data.get("course_id")
        topic = serializer.validated_data["topic"]
        notes = serializer.validated_data.get("notes", "")

        # Use atomic transaction and row locking to prevent race conditions
        with transaction.atomic():
            try:
                slot = AvailabilitySlot.objects.select_for_update().get(pk=slot_id)
            except AvailabilitySlot.DoesNotExist:
                return Response(
                    {"error": "Availability slot not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if slot.is_booked:
                return Response(
                    {"error": "This slot has already been booked by another student."},
                    status=status.HTTP_409_CONFLICT,
                )

            if slot.coach == request.user:
                return Response(
                    {"error": "Coaches cannot book their own availability slots."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            course = None
            if course_id:
                course = Course.objects.filter(pk=course_id).first()

            # Mark slot booked
            slot.is_booked = True
            slot.save(update_fields=["is_booked"])

            # Generate meeting room link
            room_hash = uuid.uuid4().hex[:10]
            meeting_link = f"https://meet.jit.si/coachconnect-{room_hash}"

            booking = Booking.objects.create(
                student=request.user,
                coach=slot.coach,
                slot=slot,
                course=course,
                topic=topic,
                notes=notes,
                meeting_link=meeting_link,
                status="confirmed",
            )

            # Notifications
            Notification.objects.create(
                user=request.user,
                title="Coaching Session Confirmed",
                message=f"Session with Coach {slot.coach.get_full_name() or slot.coach.email} on {slot.date} at {slot.start_time.strftime('%H:%M')} is confirmed.",
                notification_type="booking_confirmed",
                link="/bookings",
            )

            Notification.objects.create(
                user=slot.coach,
                title="New Session Booked",
                message=f"Student {request.user.get_full_name() or request.user.email} booked a session for {slot.date} at {slot.start_time.strftime('%H:%M')} on '{topic}'.",
                notification_type="booking_created",
                link="/bookings",
            )

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )


class BookingDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingSerializer
    queryset = Booking.objects.all().select_related("student", "coach", "slot", "course")

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if not (user.is_staff or user.role == "admin" or obj.student == user or obj.coach == user):
            raise permissions.PermissionDenied("You do not have permission to view this booking.")
        return obj


class BookingCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.select_related("slot", "coach", "student").get(pk=pk)
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND
            )

        user = request.user
        is_party = (booking.student == user or booking.coach == user or user.is_staff or user.role == "admin")
        if not is_party:
            return Response(
                {"error": "You do not have permission to cancel this booking."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if booking.status == "cancelled":
            return Response(
                {"error": "Booking is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cancellation_reason = request.data.get("reason", "Cancelled by user.")

        with transaction.atomic():
            booking.status = "cancelled"
            booking.cancellation_reason = cancellation_reason
            booking.save(update_fields=["status", "cancellation_reason", "updated_at"])

            # Free the slot for other learners
            if booking.slot:
                booking.slot.is_booked = False
                booking.slot.save(update_fields=["is_booked"])

            # Send notifications
            cancelled_by = user.get_full_name() or user.email
            for recipient in [booking.student, booking.coach]:
                Notification.objects.create(
                    user=recipient,
                    title="Session Booking Cancelled",
                    message=f"Session on {booking.slot.date if booking.slot else 'Scheduled Date'} was cancelled by {cancelled_by}. Reason: {cancellation_reason}",
                    notification_type="booking_cancelled",
                    link="/bookings",
                )

        return Response(
            {
                "message": "Booking successfully cancelled and slot released.",
                "booking": BookingSerializer(booking).data,
            }
        )


class BookingStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get("status")
        if new_status not in ["pending", "confirmed", "completed", "cancelled"]:
            return Response(
                {"error": "Invalid status value"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Only coach, admin or student (for cancel) can update
        user = request.user
        if not (user.is_staff or user.role == "admin" or booking.coach == user):
            return Response(
                {"error": "Only the session coach or admin can update status to completed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        booking.status = new_status
        booking.save(update_fields=["status", "updated_at"])
        return Response(BookingSerializer(booking).data)
