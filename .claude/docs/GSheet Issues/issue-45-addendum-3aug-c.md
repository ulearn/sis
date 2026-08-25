# Issue 45 — Stale Booking Courses / Renewal Arrivals — 3 Aug 2026 UTC
Reporter: AC | Area: Renewal Students | Sheet row: 47

Root cause:
- 24,467 active BCs with endDate < 2026-08-04 (unchanged)
- BC 25006 (endDate=2026-08-03, active=true): included in count
- Neil decision pending: bulk deactivate all 24,467 vs named subset

Fix recipe (NOT YET RUN — awaiting decision):
Option A - Bulk: p.bookingCourse.updateMany({where:{endDate:{lt:new Date('2026-08-04')},active:true},data:{active:false}}) — 24,467 rows. Run AFTER Issue 38 shunt.
Option B - Named subset (27 items from prior recipe).

Risk: data-hygiene, large blast radius on Option A. Irreversible without backup.
Status: OPEN — awaiting Neil decision. Last checked: 2026-08-03 UTC