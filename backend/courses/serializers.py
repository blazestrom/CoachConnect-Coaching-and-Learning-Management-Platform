from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Course, Enrollment, LearningResource, ResourceProgress


class LearningResourceSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = LearningResource
        fields = [
            "id",
            "course",
            "title",
            "resource_type",
            "url",
            "description",
            "order",
            "duration_minutes",
            "created_at",
            "is_completed",
        ]
        read_only_fields = ["id", "created_at"]

    def get_is_completed(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(
                student=request.user, course=obj.course
            ).first()
            if enrollment:
                progress = ResourceProgress.objects.filter(
                    enrollment=enrollment, resource=obj
                ).first()
                return progress.is_completed if progress else False
        return False


class CourseListSerializer(serializers.ModelSerializer):
    coach = UserSerializer(read_only=True)
    total_enrollments = serializers.SerializerMethodField()
    total_resources = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "description",
            "learning_objectives",
            "coach",
            "duration_hours",
            "level",
            "price",
            "thumbnail_url",
            "is_published",
            "created_at",
            "updated_at",
            "total_enrollments",
            "total_resources",
        ]

    def get_total_enrollments(self, obj):
        return getattr(obj, "total_enrollments", obj.enrollments.count())

    def get_total_resources(self, obj):
        return getattr(obj, "total_resources", obj.resources.count())


class CourseDetailSerializer(serializers.ModelSerializer):
    coach = UserSerializer(read_only=True)
    resources = LearningResourceSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "description",
            "learning_objectives",
            "coach",
            "duration_hours",
            "level",
            "price",
            "thumbnail_url",
            "is_published",
            "created_at",
            "updated_at",
            "resources",
            "is_enrolled",
            "user_progress",
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(
                student=request.user, course=obj
            ).exists()
        return False

    def get_user_progress(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(
                student=request.user, course=obj
            ).first()
            if enrollment:
                return {
                    "enrollment_id": enrollment.id,
                    "progress_percentage": enrollment.progress_percentage,
                    "status": enrollment.status,
                    "enrolled_at": enrollment.enrolled_at,
                    "completed_at": enrollment.completed_at,
                }
        return None


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "category",
            "description",
            "learning_objectives",
            "duration_hours",
            "level",
            "price",
            "thumbnail_url",
            "is_published",
        ]


class ResourceProgressSerializer(serializers.ModelSerializer):
    resource = LearningResourceSerializer(read_only=True)

    class Meta:
        model = ResourceProgress
        fields = ["id", "resource", "is_completed", "completed_at"]


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    resource_progress = ResourceProgressSerializer(many=True, read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student",
            "course",
            "status",
            "progress_percentage",
            "enrolled_at",
            "completed_at",
            "resource_progress",
        ]
