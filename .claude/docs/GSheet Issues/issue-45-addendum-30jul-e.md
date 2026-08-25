== Issue 45 - Stale Booking Courses Blocking Arrivals (3rd check Thu 30 Jul)
Reporter: Staff | Area: Renewal Students | Sheet row: 47

-- Symptom
Renewal students not in arrivals list. Previous booking courses still active=true.

-- Root Cause (Thu 30 Jul 2026 UTC - 3rd check)
All 27 named BCs remain active. Fix NOT RUN.

Batch 1: 11 BCs ended 2026-07-24 (6 days stale) - unchanged:
BC24776, BC1781, BC25011, BC20, BC81, BC24620, BC24606, BC24828, BC1792, BC24989, BC37

Batch 2: 15 BCs ended 2026-07-17 (13 days stale) - unchanged:
BC1771, BC1737, BC7, BC1294, BC1770, BC1765, BC1718, BC26, BC1708, BC24960, BC1681, BC1669, BC95, BC1719, BC24946

Legacy: BC505 (Tuguldur Otgonbaatar, ended Aug 2025)

Eduardo Roche Diaz (student 14602):
- BC25011 (bk18233, ended Jul 24): 6d stale - in Batch 1
- BC25023 (bk18245, ends Jul 31 TOMORROW): active - deactivate after Jul 31 end-of-day

-- Fix Recipe (NOT YET RUN)

Step 1 - Deactivate Batch 1 (11 BCs):
  UPDATE booking_courses SET active=false WHERE id IN (24776,1781,25011,20,81,24620,24606,24828,1792,24989,37);

Step 2 - Deactivate Batch 2 (15 BCs):
  UPDATE booking_courses SET active=false WHERE id IN (1771,1737,7,1294,1770,1765,1718,26,1708,24960,1681,1669,95,1719,24946);

Step 3 - Deactivate legacy BC505:
  UPDATE booking_courses SET active=false WHERE id=505;

Step 4 - Deactivate BC25023 (run on/after 2026-08-01):
  UPDATE booking_courses SET active=false WHERE id=25023;

Step 5 - Verify:
  SELECT COUNT(*) FROM booking_courses WHERE id IN (24776,1781,25011,20,81,24620,24606,24828,1792,24989,37,1771,1737,7,1294,1770,1765,1718,26,1708,24960,1681,1669,95,1719,24946,505) AND active=true; -- expect 0

Note: BC1765 (Maria Eduarda Alves Paiva) has BC1766 starting Aug 3 (see issue 38).

-- Risk
Data hygiene - reversible. Blast: 27 BCs (+BC25023 after Jul 31).

-- Status
OPEN - 27 stale BCs unchanged, fix NOT RUN (3rd check Thu 30 Jul 2026 UTC)