from bookings.models import AvailabilitySlot, Booking
from bookings.serializers import BookingSerializer
from courses.models import Course, Enrollment
from courses.serializers import CourseListSerializer, EnrollmentSerializer
from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from users.models import User
from users.serializers import UserSerializer


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role
        today = timezone.now().date()

        if user.is_staff or role == "admin":
            # Admin Dashboard Aggregations
            total_users = User.objects.count()
            total_coaches = User.objects.filter(role="coach").count()
            total_students = User.objects.filter(role="student").count()
            total_courses = Course.objects.count()
            total_enrollments = Enrollment.objects.count()
            total_bookings = Booking.objects.count()
            completed_bookings = Booking.objects.filter(
                status="completed"
            ).count()
            active_slots = AvailabilitySlot.objects.filter(
                date__gte=today, is_booked=False
            ).count()

            recent_bookings = Booking.objects.select_related(
                "student", "coach", "slot"
            ).order_by("-created_at")[:5]
            recent_users = User.objects.order_by("-date_joined")[:5]

            return Response(
                {
                    "role": "admin",
                    "metrics": {
                        "total_users": total_users,
                        "total_coaches": total_coaches,
                        "total_students": total_students,
                        "total_courses": total_courses,
                        "total_enrollments": total_enrollments,
                        "total_bookings": total_bookings,
                        "completed_bookings": completed_bookings,
                        "active_slots": active_slots,
                    },
                    "recent_bookings": BookingSerializer(
                        recent_bookings, many=True
                    ).data,
                    "recent_users": UserSerializer(
                        recent_users, many=True
                    ).data,
                }
            )

        elif role == "coach":
            # Coach Dashboard
            my_courses = Course.objects.filter(coach=user)
            total_courses = my_courses.count()
            total_students = (
                Enrollment.objects.filter(course__coach=user)
                .values("student")
                .distinct()
                .count()
            )
            upcoming_bookings = (
                Booking.objects.filter(
                    coach=user, slot__date__gte=today, status="confirmed"
                )
                .select_related("student", "slot", "course")
                .order_by("slot__date", "slot__start_time")
            )
            available_slots = AvailabilitySlot.objects.filter(
                coach=user, date__gte=today, is_booked=False
            ).count()
            completed_sessions = Booking.objects.filter(
                coach=user, status="completed"
            ).count()

            recent_courses = (
                my_courses.annotate(
                    total_enrollments=Count("enrollments", distinct=True),
                    total_resources=Count("resources", distinct=True),
                )
                .order_by("-created_at")[:4]
            )

            return Response(
                {
                    "role": "coach",
                    "metrics": {
                        "total_courses": total_courses,
                        "total_students": total_students,
                        "upcoming_sessions": upcoming_bookings.count(),
                        "available_slots": available_slots,
                        "completed_sessions": completed_sessions,
                    },
                    "upcoming_bookings": BookingSerializer(
                        upcoming_bookings[:5], many=True
                    ).data,
                    "my_courses": CourseListSerializer(
                        recent_courses, many=True
                    ).data,
                }
            )

        else:
            # Student Dashboard
            enrollments = (
                Enrollment.objects.filter(student=user)
                .select_related("course", "course__coach")
                .prefetch_related("resource_progress__resource")
            )
            total_enrolled = enrollments.count()
            completed_courses = enrollments.filter(status="completed").count()

            upcoming_bookings = (
                Booking.objects.filter(
                    student=user, slot__date__gte=today, status="confirmed"
                )
                .select_related("coach", "slot", "course")
                .order_by("slot__date", "slot__start_time")
            )

            total_learning_hours = (
                enrollments.aggregate(Sum("course__duration_hours"))[
                    "course__duration_hours__sum"
                ]
                or 0
            )

            return Response(
                {
                    "role": "student",
                    "metrics": {
                        "total_enrolled": total_enrolled,
                        "completed_courses": completed_courses,
                        "in_progress_courses": total_enrolled - completed_courses,
                        "upcoming_sessions": upcoming_bookings.count(),
                        "total_learning_hours": total_learning_hours,
                    },
                    "recent_enrollments": EnrollmentSerializer(
                        enrollments.order_by("-enrolled_at")[:4], many=True
                    ).data,
                    "upcoming_bookings": BookingSerializer(
                        upcoming_bookings[:5], many=True
                    ).data,
                }
            )
