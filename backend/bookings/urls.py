from django.urls import path
from .views import (
    AvailabilitySlotDeleteView,
    AvailabilitySlotListCreateView,
    BookingCancelView,
    BookingDetailView,
    BookingListCreateView,
    BookingStatusUpdateView,
)

urlpatterns = [
    path("slots/", AvailabilitySlotListCreateView.as_view(), name="slot_list_create"),
    path(
        "slots/<int:pk>/",
        AvailabilitySlotDeleteView.as_view(),
        name="slot_delete",
    ),
    path("bookings/", BookingListCreateView.as_view(), name="booking_list_create"),
    path("bookings/<int:pk>/", BookingDetailView.as_view(), name="booking_detail"),
    path(
        "bookings/<int:pk>/cancel/",
        BookingCancelView.as_view(),
        name="booking_cancel",
    ),
    path(
        "bookings/<int:pk>/status/",
        BookingStatusUpdateView.as_view(),
        name="booking_status_update",
    ),
]
