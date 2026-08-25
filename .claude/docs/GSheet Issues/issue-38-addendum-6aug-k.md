# Issue 38 — Class Assignment Deadline (45th check, Thu 6 Aug 2026 18:00 UTC)

Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

## Root cause
All 17 booking courses starting Mon 10 Aug 2026 still have 0 class assignments.
DEADLINE: Fri 7 Aug 2026 EOD (TOMORROW).

13 ready to assign (CONFIRMED + confirmed=true):
BC 108 Intensive General 30, BC 109 Morning General, BC 1313 Academic Year Afternoon
BC 1818 Academic Year Morning, BC 24915 Academic Year Morning, BC 24970 Academic Year Afternoon
BC 25004 General English AM Plus, BC 25005 General English AM, BC 25024 General English PM
BC 25027 Academic Year Morning, BC 25031 Academic Year Morning, BC 25036 General English AM
BC 25039 General English PM Plus

4 still blocked (confirmed=false):
- BC 96: CONFIRMED+confirmed=false, EUR 1,845/2,095 paid (EUR 250 outstanding)
- BC 833: ESCROW+confirmed=false, EUR 4,847.50 fully paid in escrow — needs status fix
- BC 25007: PARTIAL+confirmed=false, EUR 980/1,350 paid (EUR 370 outstanding)
- BC 25042: PENDING+confirmed=false, EUR 0/456 unpaid

## Fix recipe (NOT YET RUN)

Step 1 - Assign 13 ready BCs in SIS admin before Fri 7 Aug EOD
SIS admin > Classes > Assign students: BC 108, 109, 1313, 1818, 24915, 24970,
25004, 25005, 25024, 25027, 25031, 25036, 25039

Step 2 - BC 833 (ESCROW fully paid)
Check TransferMate via Hub fins/. Once escrow release confirmed:
  UPDATE bookings SET confirmed = true
  WHERE id = (SELECT booking_id FROM booking_courses WHERE id = 833);

Step 3 - BC 96 (EUR 250 outstanding)
Collect EUR 250 or manually confirm if student arriving:
  UPDATE bookings SET confirmed = true
  WHERE id = (SELECT booking_id FROM booking_courses WHERE id = 96);

Step 4 - BC 25007 (EUR 370) and BC 25042 (EUR 456)
Collect balance or decide to confirm manually.

## Risk
Category: bookings / class assignment; reversible; up to 17 students without class Mon 10 Aug

## Status
URGENT — deadline Fri 7 Aug EOD. 0/17 BCs assigned. Fix NOT RUN.
Last checked: Thu 6 Aug 2026 18:00 UTC