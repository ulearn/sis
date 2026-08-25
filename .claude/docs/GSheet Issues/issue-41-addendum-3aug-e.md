# Issue 41 — Giampaolo Russo — 71st check Mon 3 Aug 2026 UTC (7th today)

Reporter: Diego | Area: Booking / Accommodation | Sheet row: 43

## Symptom
Student booked host family (Aug 2–Sep 5) and apartment (Capel, Sep 6–Sep 14). No class assignment. BH shunt not run.

## Root Cause (confirmed 2026-08-03 UTC, 71st check)
- Booking 18180: CONFIRMED, confirmed=true, EUR 2,584.96 fully paid, EUR 0 open.
- Booking course 24956 (General English AM, Aug 3–Sep 11 2026): active=true, 0 student class assignments.
- Start date is Aug 3 (bank holiday); first teaching day Tue 4 Aug 2026.
- BH shunt (Issue 38) not yet run — BC24956 start_date stays 2026-08-03 until shunt runs.
- Capel apartment accommodation (Sep 6–Sep 14): no booking accommodation record confirmed in DB.
- No invoice or LOA on booking 18180.

## Fix Recipe — NOT YET RUN

Step 1: Run BH shunt first (issue-38-addendum-3aug-e.md). BC24956 start_date becomes 2026-08-04.
Step 2: Create student class assignment for student 14571 (Giampaolo Russo) via SIS admin (To Be Assigned). Week of Aug 4, booking course 24956.
Step 3: Add Capel apartment booking accommodation: student 14571, booking 18180, Sep 6–Sep 14 2026. Bed: confirm Capel bed ID.
Step 4: Generate and issue invoice + LOA for booking 18180.
Step 5: Reconcile payment 17954 in Xero.

Risk: Bookings/Attendance/Documents. Single student. Reversible.
URGENT: First class is TOMORROW Tue 4 Aug 2026. SCA must be created today.

Status: NOT RUN (71st check, 7th today Mon 3 Aug 2026 UTC).
Last checked: 2026-08-03 UTC