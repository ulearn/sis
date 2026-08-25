# Issue 10 -- Massimiliano Cameran -- No Completion Certificate (Addendum 26 Jul 2026)

Reporter: Various | Area: Doc Gen / Certs | Sheet row: 11

Status (35th check, Sun 26 Jul 2026 UTC): UNCHANGED from prior checks.

- Student 91, booking 97: EUR 1,741 / 1,741 fully paid
- Booking course 107 (Morning General, 27 Apr-22 May 2026): active = true -- 65 days stale
- Documents on booking 97: doc63 accounts REVOKED, doc64 accounts ISSUED -- no completion certificate present
- Renewal booking 18002 has doc179 (no action needed)

Fix recipe (NOT YET RUN -- see issue-10-addendum-24jul.md for full details):
1. Generate completion certificate for booking 97 via SIS admin (student 91 > booking 97 > Documents)
2. Set booking course 107 active = false

Risk: documents | Reversible: yes | Priority: low-medium (cosmetic; student has left)

Status: OPEN. Last checked: Sun 26 Jul 2026 UTC (110th hourly)