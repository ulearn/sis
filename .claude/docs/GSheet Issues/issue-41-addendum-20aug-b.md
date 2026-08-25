# Issue 41 — Giampaolo Russo (student 14571) | 143rd check Thu 20 Aug 2026 UTC

Sheet row 43 | Reporter: KC | Area: Booking/Accomm

## DB-verified state (143rd — no change from 142nd)

BA 11394 (bed 89, ended 9 Aug, fee null, ACTIVE): Deactivate TODAY — 11d stale; blocks bed 89 Sat 22
BA 11396 (bed 44, 15–22 Aug, fee null, ACTIVE): Set fee + deactivate on/after Sat 22
BA 11397 (bed 89, 22 Aug–6 Sep, fee null, ACTIVE): Set fee before Sat 22 move-in
BA 11357 (bed 178, ended 15 Aug, fee EUR 1250, ACTIVE): Deactivate — 5d stale
Booking 18180: CONFIRMED, fully paid EUR 5,331.

## Fix recipe (NOT YET RUN)

Step 1 (TODAY): UPDATE "BookingAccommodation" SET active = false WHERE id = 11394;
Step 2 (TODAY): UPDATE "BookingAccommodation" SET active = false WHERE id = 11357;
Step 3 (before Sat 22): Confirm fees with Diego; UPDATE "BookingAccommodation" SET fee = <AMOUNT> WHERE id IN (11396, 11397);
Step 4 (after Sat 22 checkout): UPDATE "BookingAccommodation" SET active = false WHERE id = 11396;

Risk: low, single student, reversible. Deadline: Sat 22 Aug (2 days).
Status: URGENT. 143rd check Thu 20 Aug 2026 UTC.