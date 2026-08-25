# Issue 36b — Pietro Caccianiga (student 14521) | 246th check Thu 20 Aug 2026 UTC

Sheet row 38 | Reporter: KC | Area: Booking/Accomm

## DB-verified state (246th — no change from 245th)

BA 11393 (bed 88, starts Sat 22 Aug, endDate 13 Sep, fee NULL, ACTIVE): Set fee TODAY — 2 days to move-in
BA 11311 (bed 84, 28 Jun – 22 Aug, fee EUR 3850, ACTIVE): Deactivate on/after Sat 22 checkout
Booking 17980: CONFIRMED, fully paid EUR 5,331. EUR 5,331 − EUR 3,850 = EUR 1,481 remaining for BA 11393 (3 weeks).

## Fix recipe (NOT YET RUN)

Step 1 (TODAY): UPDATE "BookingAccommodation" SET fee = 1481 WHERE id = 11393;
(Confirm EUR 1,481 is correct before running — check booking invoice breakdown.)
Step 2 (after Sat 22): UPDATE "BookingAccommodation" SET active = false WHERE id = 11311;

Risk: low, single student, reversible. Deadline: Sat 22 Aug (2 days).
Status: URGENT. 246th check Thu 20 Aug 2026 UTC.