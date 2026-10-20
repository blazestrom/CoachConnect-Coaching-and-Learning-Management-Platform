from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from core.permissions import IsAdminUserRole, IsCoachRole, IsOwnerOrAdmin
from notifications.models import Notification
from .models import Course, Enrollment, LearningResource, ResourceProgress
from .serializers import (
    CourseCreateUpdateSerializer,
    CourseDetailSerializer,
    CourseListSerializer,
    EnrollmentSerializer,
    LearningResourceSerializer,
)


class CourseListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CourseCreateUpdateSerializer
        return CourseListSerializer

    def get_queryset(self):
        qs = (
            Course.objects.all()
            .select_related("coach", "coach__coach_profile")
            .annotate(
                total_enrollments=Count("enrollments", distinct=True),
                total_resources=Count("resources", distinct=True),
            )
        )

        user = self.request.user
        mine = self.request.query_params.get("mine")

        if mine and user.is_authenticated and (user.role == "coach" or user.is_staff):
            qs = qs.filter(coach=user)
        elif not (user.is_authenticated and (user.is_staff or user.role == "admin")):
            qs = qs.filter(is_published=True)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(category__icontains=search)
                | Q(coach__first_name__icontains=search)
                | Q(coach__last_name__icontains=search)
            )

        category = self.request.query_params.get("category")
        if category and category != "All":
            qs = qs.filter(category=category)

        level = self.request.query_params.get("level")
        if level and level != "All":
            qs = qs.filter(level=level)

        coach_id = self.request.query_params.get("coach")
        if coach_id:
            qs = qs.filter(coach_id=coach_id)

        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        if not (self.request.user.role == "coach" or self.request.user.is_staff):
            raise permissions.PermissionDenied("Only coaches and administrators can create courses.")
        serializer.save(coach=self.request.user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all().select_related("coach")

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return CourseCreateUpdateSerializer
        return CourseDetailSerializer

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.AllowAny()]


class CourseResourceListCreateView(generics.ListCreateAPIView):
    serializer_class = LearningResourceSerializer

    def get_queryset(self):
        return LearningResource.objects.filter(course_id=self.kwargs["course_id"])

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsCoachRole()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        course = Course.objects.get(pk=self.kwargs["course_id"])
        if course.coach != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You do not own this course.")
        resource = serializer.save(course=course)

        # Create uncompleted ResourceProgress for existing active enrollments
        enrollments = Enrollment.objects.filter(course=course)
        for enr in enrollments:
            ResourceProgress.objects.get_or_create(enrollment=enr, resource=resource)
            enr.recalculate_progress()


class CourseResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LearningResourceSerializer
    queryset = LearningResource.objects.all()

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [permissions.IsAuthenticated(), IsCoachRole()]
        return [permissions.AllowAny()]

    def perform_destroy(self, instance):
        course = instance.course
        if course.coach != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You do not own this course.")
        instance.delete()
        for enr in course.enrollments.all():
            enr.recalculate_progress()


class EnrollCourseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if not course.is_published and not request.user.is_staff:
            return Response(
                {"error": "This course is not currently published."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            enrollment, created = Enrollment.objects.get_or_create(
                student=request.user,
                course=course,
                defaults={"status": "active", "progress_percentage": 0},
            )

            if not created:
                return Response(
                    {"message": "Already enrolled in this course", "enrollment_id": enrollment.id},
                    status=status.HTTP_200_OK,
                )

            # Initialize ResourceProgress for all current course resources
            for resource in course.resources.all():
                ResourceProgress.objects.create(
                    enrollment=enrollment,
                    resource=resource,
                    is_completed=False,
                )

            enrollment.recalculate_progress()

            # Notifications
            Notification.objects.create(
                user=request.user,
                title="Course Enrollment Confirmed",
                message=f"You have successfully enrolled in '{course.title}'. Start learning today!",
                notification_type="course_enrolled",
                link=f"/courses/{course.id}",
            )
            Notification.objects.create(
                user=course.coach,
                title="New Student Enrolled",
                message=f"{request.user.get_full_name() or request.user.email} enrolled in your course '{course.title}'.",
                notification_type="course_enrolled",
                link=f"/courses/{course.id}",
            )

        return Response(
            {
                "message": "Enrolled successfully",
                "enrollment": EnrollmentSerializer(enrollment, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class StudentEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Enrollment.objects.filter(student=self.request.user)
            .select_related("course", "course__coach")
            .prefetch_related("resource_progress__resource")
            .order_by("-enrolled_at")
        )


class CoachStudentEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsCoachRole]

    def get_queryset(self):
        return (
            Enrollment.objects.filter(course__coach=self.request.user)
            .select_related("student", "course")
            .order_by("-enrolled_at")
        )


class ToggleResourceProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, resource_id):
        try:
            resource = LearningResource.objects.get(pk=resource_id)
        except LearningResource.DoesNotExist:
            return Response(
                {"error": "Resource not found"}, status=status.HTTP_404_NOT_FOUND
            )

        enrollment = Enrollment.objects.filter(
            student=request.user, course=resource.course
        ).first()

        if not enrollment:
            return Response(
                {"error": "You must be enrolled in this course to mark resources."},
                status=status.HTTP_403_FORBIDDEN,
            )

        with transaction.atomic():
            progress, _ = ResourceProgress.objects.get_or_create(
                enrollment=enrollment, resource=resource
            )
            progress.is_completed = not progress.is_completed
            progress.completed_at = timezone.now() if progress.is_completed else None
            progress.save()

            new_percentage = enrollment.recalculate_progress()

            if new_percentage >= 100:
                Notification.objects.create(
                    user=request.user,
                    title="Course Completed! 🎉",
                    message=f"Congratulations! You completed 100% of the lessons in '{resource.course.title}'.",
                    notification_type="progress_update",
                    link=f"/courses/{resource.course.id}",
                )

        return Response(
            {
                "resource_id": resource.id,
                "is_completed": progress.is_completed,
                "progress_percentage": new_percentage,
                "status": enrollment.status,
            }
        )
