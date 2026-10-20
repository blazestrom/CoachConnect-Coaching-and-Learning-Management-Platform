from rest_framework import serializers
from courses.serializers import CourseListSerializer
from users.serializers import UserSerializer
from .models import AvailabilitySlot, Booking


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    coach = UserSerializer(read_only=True)

    class Meta:
        model = AvailabilitySlot
        fields = [
            "id",
            "coach",
            "date",
            "start_time",
            "end_time",
            "is_booked",
            "created_at",
        ]
        read_only_fields = ["id", "is_booked", "created_at"]


class SlotCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = ["id", "date", "start_time", "end_time"]

    def validate(self, data):
        if data["start_time"] >= data["end_time"]:
            raise serializers.ValidationError(
                "Slot start time must be before end time."
            )
        return data


class BookingSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    coach = UserSerializer(read_only=True)
    slot = AvailabilitySlotSerializer(read_only=True)
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "student",
            "coach",
            "slot",
            "course",
            "topic",
            "notes",
            "meeting_link",
            "status",
            "cancellation_reason",
            "created_at",
            "updated_at",
        ]


class BookingCreateSerializer(serializers.Serializer):
    slot_id = serializers.IntegerField()
    course_id = serializers.IntegerField(required=False, allow_null=True)
    topic = serializers.CharField(max_length=255)
    notes = serializers.CharField(
        required=False, allow_blank=True, default=""
    )
