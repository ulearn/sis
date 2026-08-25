Issue 38 - Class Assignments for Mon 10 Aug Starters
Reporter: PG | Row: 40

Status - Fri 7 Aug 2026 UTC (54th check)
Still 0 class assignments across all 17 Booking Courses. TODAY is last working day. CRITICAL.

Root Cause (verified this check - unchanged from 53rd check)
13 READY (CONFIRMED + confirmed = true):
  BC 108, 109, 1313, 1818, 24915, 24970, 25004, 25005, 25024, 25027, 25031, 25036, 25039

4 BLOCKED:
  BC 96    bk 88    Alessandro Signorotti   CONFIRMED/confirmed=false  EUR 250 open
  BC 833   bk 790   Settiyanee Duangjai     ESCROW  EUR 4847.50
  BC 25007 bk 18229 Nominjin Amartsogt      PARTIAL EUR 370 open
  BC 25042 bk 18262 Edith Nunes             PENDING EUR 456 unpaid

Fix Recipe (NOT YET RUN)
Step 1: Assign all 13 ready BCs in SIS Admin TODAY.
Step 2: BC 96 - verify EUR 250 paid, then UPDATE bookings SET confirmed=true WHERE id=88, assign BC 96.
Step 3: BC 833 - check TransferMate escrow; if released, confirm bk 790, assign BC 833.
Step 4: Chase bk 18229 (EUR 370) and bk 18262 (EUR 456) for payment.

Risk: 13-17 students | CRITICAL - deadline EOD TODAY (Fri 7 Aug)
Status: NOT RUN. Last checked: Fri 7 Aug 2026 UTC (54th hourly check).