# Issue 37 — Bed 83 stale BAs | 54th check Thu 20 Aug 2026 UTC

Sheet row 39 (also row 45/Issue 43) | Reporter: KC | Area: Booking/Accomm

## DB-verified state (54th — no change from 53rd)

All 5 stale BAs on bed 83 confirmed STILL ACTIVE:
BA 11239 (booking 22, ended 24 May, fee EUR 1050): 88d stale
BA 11168 (booking 92, ended 20 Jun, fee EUR 700): 61d stale
BA 11285 (booking 17825, ended 5 Jul, fee NULL): 46d stale — booking 17825 fully paid EUR 2,008; confirm fee
BA 11352 (booking 18156, ended 11 Jul, fee EUR 360): 40d stale
BA 11179 (booking 82, ended 9 Aug, fee EUR 1360): 11d stale
Next occupant BA 25 (booking 17844) starts 30 Aug = 10 days.

## Fix recipe (NOT YET RUN)

Step 1: SELECT id, "amountPaid", total FROM "Booking" WHERE id = 17825; -- confirm fee for BA 11285
Step 2: UPDATE "BookingAccommodation" SET fee = <CONFIRMED_AMOUNT> WHERE id = 11285;
Step 3: UPDATE "BookingAccommodation" SET active = false WHERE id IN (11239,11168,11285,11352,11179);

Risk: low, reversible. Deadline: 30 Aug 2026 (10 days).
Status: No change. 54th check Thu 20 Aug 2026 UTC.