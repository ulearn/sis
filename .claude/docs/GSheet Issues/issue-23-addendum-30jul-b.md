## Issue 23 addendum 2026-07-30 (2nd run today)
Hash change: column B updated. Data unchanged.
BC 826 (bk787): ended 2025-11-28, 244d stale, fee=null
BC 827 (bk787): ended 2026-01-30, 181d stale, fee=null
BC 828 (bk787): start 2026-03-02 end 2026-02-27 BACKWARDS (DST bug)
BC 829 (bk787): ended 2026-06-05, 55d stale, fee=null
Booking 787: Confirmed, paid EUR 2147.50. Student departed.

Fix (NOT YET RUN):
Fix BC 828 end date (confirm from Fidelo): UPDATE booking_courses SET end_date='2026-03-28' WHERE id=828;
Deactivate: UPDATE booking_courses SET active=false WHERE id IN (826,827,828,829);

Status: NOT YET RUN. 2026-07-30 UTC. Low priority.