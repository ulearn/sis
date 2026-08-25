Issue 27 addendum 29 Jul 2026
Sofiia Korkishchenko (booking 17909, student 768)
Sheet row 28

Symptom: Old course ending same day as new course starts; cancelled booking showing in-progress.

Root cause (confirmed):
Booking 17909: status=CANCELLED, confirmed=true (anomaly). amountOpen=727.50, amountPaid=0.
Last updated: 17 Jun 2026 (42 days stale).
BC 24693 (Renewal Academic Year PM, 25 May to 13 Nov 2026): active=true.

Fix recipe (NOT YET RUN):
Step 1: UPDATE Booking SET confirmed = false WHERE id = 17909;
Step 2: UPDATE booking_course SET active = false WHERE id = 24693;
Verify with accounts: EUR 727.50 open balance — real debt or write off?

Risk: Bookings / data integrity. Reversible. Void deadline: 25 Oct 2026 (88 days).

Status: Unchanged from 28 Jul 2026 (35th check). Fix NOT RUN.
Last checked: 2026-07-29 UTC