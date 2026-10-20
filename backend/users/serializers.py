from rest_framework import serializers
from .models import CoachProfile, StudentProfile, User


class CoachProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoachProfile
        fields = [
            "id",
            "headline",
            "expertise",
            "qualifications",
            "years_of_experience",
            "hourly_rate",
            "rating",
            "total_reviews",
            "is_verified",
        ]


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "education_level",
            "learning_goals",
            "interests",
        ]


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    coach_profile = CoachProfileSerializer(read_only=True)
    student_profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "phone",
            "bio",
            "avatar",
            "is_active",
            "date_joined",
            "coach_profile",
            "student_profile",
        ]
        read_only_fields = ["id", "date_joined"]

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else obj.email.split("@")[0]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    headline = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    expertise = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    hourly_rate = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, default=50.00
    )
    education_level = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    learning_goals = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "phone",
            "bio",
            "avatar",
            "headline",
            "expertise",
            "hourly_rate",
            "education_level",
            "learning_goals",
        ]

    def validate_role(self, value):
        if value not in ["student", "coach"]:
            # Admins must be provisioned through management or superusers
            return "student"
        return value

    def create(self, validated_data):
        headline = validated_data.pop("headline", "")
        expertise = validated_data.pop("expertise", "")
        hourly_rate = validated_data.pop("hourly_rate", 50.00)
        education_level = validated_data.pop("education_level", "")
        learning_goals = validated_data.pop("learning_goals", "")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            email=validated_data["email"],
            password=password,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=validated_data.get("role", "student"),
            phone=validated_data.get("phone", ""),
            bio=validated_data.get("bio", ""),
            avatar=validated_data.get("avatar", ""),
        )

        if user.role == "coach":
            CoachProfile.objects.create(
                user=user,
                headline=headline
                or f"Expert {expertise or 'Professional'} Mentor",
                expertise=expertise or "General Coaching",
                hourly_rate=hourly_rate,
            )
        else:
            StudentProfile.objects.create(
                user=user,
                education_level=education_level or "Lifelong Learner",
                learning_goals=learning_goals or "Skill advancement",
            )

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    coach_profile = CoachProfileSerializer(required=False)
    student_profile = StudentProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone",
            "bio",
            "avatar",
            "coach_profile",
            "student_profile",
        ]

    def update(self, instance, validated_data):
        coach_data = validated_data.pop("coach_profile", None)
        student_data = validated_data.pop("student_profile", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if coach_data and hasattr(instance, "coach_profile"):
            for attr, value in coach_data.items():
                setattr(instance.coach_profile, attr, value)
            instance.coach_profile.save()

        if student_data and hasattr(instance, "student_profile"):
            for attr, value in student_data.items():
                setattr(instance.student_profile, attr, value)
            instance.student_profile.save()

        return instance
