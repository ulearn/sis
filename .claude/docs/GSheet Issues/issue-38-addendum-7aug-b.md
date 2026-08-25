Issue 38 Addendum - Fri 7 Aug 2026 00:03 UTC (49th check)
Reporter: PG | Row: 40

SYMPTOM
All 17 Booking Courses starting Mon 10 Aug 2026 still have 0 class assignments. Deadline EOD today. Classes start in 3 days.

ROOT CAUSE (verified 00:03 UTC)
13 READY to assign (CONFIRMED + confirmed=true):
  BC 108  Intensive General 30        bk 98
  BC 109  Morning General             bk 99
  BC 1313 Academic Year Afternoon     bk 1286
  BC 1818 Academic Year Morning       bk 1631
  BC 24915 Academic Year Morning      bk 18140
  BC 24970 Academic Year Afternoon    bk 18194
  BC 25004 General English AM Plus    bk 18226
  BC 25005 General English AM         bk 18227
  BC 25024 General English PM         bk 18246
  BC 25027 Academic Year Morning      bk 18248
  BC 25031 Academic Year Morning      bk 18252
  BC 25036 General English AM         bk 18256
  BC 25039 General English PM Plus    bk 18259

4 BLOCKED:
  BC 96    Intensive General 30    bk 88    CONFIRMED but confirmed=false
  BC 833   Academic Year Morning   bk 790   ESCROW
  BC 25007 Academic Year Morning   bk 18229 PARTIAL
  BC 25042 General English AM      bk 18262 PENDING

FIX RECIPE (NOT YET RUN)

Step 1 - Assign all 13 ready BCs in SIS Admin TODAY (before EOD Fri 7 Aug)

Step 2 - Unblock BC 96 (bk 88, confirmed=false):
  Verify bk 88 is fully paid, then:
  UPDATE bookings SET confirmed = true WHERE id = 88;

Step 3 - BC 833 (ESCROW bk 790): verify TransferMate release before assigning.

Step 4 - Chase BC 25007 (PARTIAL) and BC 25042 (PENDING) for outstanding payment.

RISK: bookings/class-assignments | reversible | 13-17 students | CRITICAL deadline TODAY
STATUS: NOT RUN
LAST CHECKED: Fri 7 Aug 2026 00:03 UTC
