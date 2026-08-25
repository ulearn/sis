# Issue 23 addendum 2026-07-31 (3rd check)
Data unchanged from 30 Jul. Low priority (student departed).

BC 826 (bk787): ended 2025-11-28, 245d stale, active=true, fee=null
BC 827 (bk787): ended 2026-01-30, 182d stale, active=true, fee=null
BC 828 (bk787): startDate=2026-03-02 endDate=2026-02-27 BACKWARDS (DST bug), active=true, fee=null
BC 829 (bk787): ended 2026-06-05, 56d stale, active=true, fee=null
Booking 787: Confirmed, paid EUR 2147.50. Student departed.

Fix (NOT YET RUN):
Correct BC 828 end date (confirm from Fidelo, likely 2026-03-28):
  UPDATE booking_course SET end_date='2026-03-28', updated_at=NOW() WHERE id=828;
Deactivate all 4 stale BCs:
  UPDATE booking_course SET active=false, updated_at=NOW() WHERE id IN (826,827,828,829);

Status: NOT YET RUN. 2026-07-31 UTC. Low priority.