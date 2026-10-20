from rest_framework import permissions


class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_staff)
        )


class IsCoachRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "coach" or request.user.is_staff)
        )


class IsStudentRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "student" or request.user.is_staff)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.user.is_staff or request.user.role == "admin":
            return True
        # Check standard owner attributes
        if hasattr(obj, "user"):
            return obj.user == request.user
        if hasattr(obj, "coach"):
            return obj.coach == request.user
        if hasattr(obj, "student"):
            return obj.student == request.user
        return False
