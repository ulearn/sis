# Matching

Unplaced-student → bed assignment. getUnplacedStudents query filters out CANCELLED + visa-pending + unpaid bookings. Manual deactivation of BookingAccommodation row needed when a booking is cancelled (footgun: status=CANCELLED alone won't stop the Monday host-payment cron from billing — also deactivate the placement). Documentation pending.
