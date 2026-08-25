Issue 38 — Class Assignments for Mon 10 Aug Starters
Reporter: PG | Row: 40

Status — Fri 7 Aug 2026 UTC (52nd check)
Still 0 class assignments. Students start Mon 10 Aug — EOD TODAY is the deadline.

Symptom
17 Booking Courses starting 10 Aug 2026 all have 0 class assignments.

Root Cause (verified this check — no change from 51st check)

13 READY (CONFIRMED + confirmed = true):
  BC 108   Intensive General 30        bk 98
  BC 109   Morning General             bk 99
  BC 1313  Academic Year Afternoon     bk 1286  Ana Luiza De Sousa  EUR 120 open (confirmed)
  BC 1818  Academic Year Morning       bk 1631
  BC 24915 Academic Year Morning       bk 18140
  BC 24970 Academic Year Afternoon     bk 18194
  BC 25004 General English AM Plus     bk 18226
  BC 25005 General English AM          bk 18227
  BC 25024 General English PM          bk 18246
  BC 25027 Academic Year Morning       bk 18248
  BC 25031 Academic Year Morning       bk 18252
  BC 25036 General English AM          bk 18256
  BC 25039 General English PM Plus     bk 18259

4 BLOCKED:
  BC 96    bk 88   Alessandro Signorotti  CONFIRMED / conf=false  EUR 250 open of EUR 2,095
  BC 833   bk 790  Settiyanee Duangjai    ESCROW                  EUR 4,847.50 in escrow
  BC 25007 bk 18229 Nominjin Amartsogt   PARTIAL                 EUR 370 open of EUR 1,350
  BC 25042 bk 18262 Edith Nunes          PENDING                 EUR 456 (fully unpaid)

Fix Recipe (NOT YET RUN)

Step 1 — Assign all 13 ready BCs in SIS Admin TODAY before EOD Fri 7 Aug.

Step 2 — Unblock BC 96 (Alessandro Signorotti, bk 88):
  Verify EUR 250 is genuinely outstanding. If paid:
  UPDATE bookings SET confirmed = true WHERE id = 88;
  Then assign BC 96.

Step 3 — BC 833 (Settiyanee Duangjai, ESCROW):
  Check TransferMate escrow release. If released, confirm bk 790 and assign BC 833.

Step 4 — Chase PARTIAL/PENDING:
  bk 18229 (Nominjin, EUR 370 open): contact student/agent.
  bk 18262 (Edith Nunes, EUR 456 fully unpaid): contact student/agent.

Risk: bookings/class-assignments | reversible | 13-17 students | CRITICAL deadline EOD TODAY (Fri 7 Aug)
Status: NOT RUN. Last checked: Fri 7 Aug 2026 UTC (52nd hourly check).