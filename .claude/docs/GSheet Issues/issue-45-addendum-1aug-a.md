# Issue 45 - Stale Booking Courses (Renewal Students / Arrivals List)

Reporter: AC | Area: Renewal Students | Sheet row: 47 | Check: 14th (1st Sat 1 Aug 2026 UTC)

## Symptom
Returning students not on arrivals list. Root cause: 24,466 stale active booking courses inflate the active students set.

## Current State (fresh DB)

SELECT COUNT(*) FROM booking_courses WHERE active=true AND end_date < CURRENT_DATE; -> 24,466
(was 24,449 on 2026-07-31 -- 17 more overnight)

Named 27-item subset from original recipe still all active=true. Bulk cleanup pending Neil decision.

## Fix Recipe (NOT YET RUN)

Option A - Full bulk deactivate (all 24,466 stale BCs):
  -- Dry run: SELECT COUNT(*) FROM booking_courses WHERE active=true AND end_date < CURRENT_DATE;
  -- Execute: UPDATE booking_courses SET active=false WHERE active=true AND end_date < CURRENT_DATE;
CAUTION: verify count matches dry run before executing. Reversible.

Option B - Named 27-item subset first (safer):
See original recipe: issue-45-stale-bcs.md

Option C - Exclude BCs with open documents:
  SELECT bc.id, bc.end_date FROM booking_courses bc
  JOIN document_records dr ON dr.booking_id = bc.booking_id
  WHERE bc.active=true AND bc.end_date < CURRENT_DATE AND dr.status IN ('DRAFT','ISSUED');

## Risk
Category: data-hygiene, bookings. Reversible: yes. Blast radius: 24,466 rows (all genuinely stale).
Decision needed: Neil to choose Option A, B, or C.

## Status
Open -- 14th check, NOT FIXED. 24,466 stale BCs (+17 since yesterday). Awaiting Neil decision.
Last checked: 2026-08-01 UTC