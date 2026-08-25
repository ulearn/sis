Issue 23 addendum 29 Jul 2026
Enshi Lu (booking 787, student 397)
Sheet row 24

Symptom: Course dates do not make sense - start March, finish February.

Root cause (confirmed):
BC 826 (Academic Year Morning, 17 Nov-28 Nov 2025): 243 days stale, active=true, fee=null
BC 827 (Academic Year Morning, 5 Jan-30 Jan 2026): 180 days stale, active=true, fee=null
BC 828 (Academic Year Morning): start 2 Mar 2026 / end 27 Feb 2026 — backwards dates (DST off-by-one migration bug)
BC 829 (Academic Year Morning, 30 Mar-5 Jun 2026): 54 days stale, active=true, fee=null

Fix recipe (NOT YET RUN):
Step 1 — Correct BC 828 end date (verify correct end date with Neil before running):
  UPDATE booking_course SET end_date = '2026-06-19' WHERE id = 828;
Step 2 — Deactivate all 4 stale booking courses:
  UPDATE booking_course SET active = false WHERE id IN (826, 827, 828, 829);

Risk: Data hygiene. Reversible. Blast radius: booking 787 only. Low priority — student has left.

Status: Unchanged from 28 Jul 2026. Fix NOT RUN.
Last checked: 2026-07-29 UTC