from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from core.permissions import IsAdminUserRole
from .models import CoachProfile, User
from .serializers import (
    CoachProfileSerializer,
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data
        return Response(
            {
                "message": "User registered successfully",
                "token": token.key,
                "user": user_data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Please provide both email and password"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)
        if not user:
            # Fallback if username wasn't synced
            try:
                user_obj = User.objects.get(email=email)
                if user_obj.check_password(password):
                    user = user_obj
            except User.DoesNotExist:
                user = None

        if not user:
            return Response(
                {"error": "Invalid email or password credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"error": "This account is inactive. Please contact admin."},
                status=status.HTTP_403_FORBIDDEN,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "token": token.key,
                "user": UserSerializer(user).data,
            }
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response(
            {"message": "Logged out successfully"}, status=status.HTTP_200_OK
        )


class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class CoachListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = (
            User.objects.filter(role="coach", is_active=True)
            .select_related("coach_profile")
            .order_by("-coach_profile__rating")
        )
        search = self.request.query_params.get("search", "")
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(coach_profile__headline__icontains=search)
                | Q(coach_profile__expertise__icontains=search)
            )
        expertise = self.request.query_params.get("expertise", "")
        if expertise:
            qs = qs.filter(coach_profile__expertise__icontains=expertise)
        return qs


class CoachDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.filter(role="coach", is_active=True).select_related(
        "coach_profile"
    )


class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        qs = User.objects.all().order_by("-date_joined")
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )
        return qs


class AdminUserStatusUpdateView(APIView):
    permission_classes = [IsAdminUserRole]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if "is_active" in request.data:
            user.is_active = bool(request.data["is_active"])
        if "role" in request.data and request.data["role"] in [
            "student",
            "coach",
            "admin",
        ]:
            user.role = request.data["role"]
            if user.role == "coach" and not hasattr(user, "coach_profile"):
                CoachProfile.objects.create(user=user)
        user.save()
        return Response(UserSerializer(user).data)
