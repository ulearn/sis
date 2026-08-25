# Issue 48 — Galbusera/Fassina Class Assignment (2 Aug 2026, check 33)

Reporter: Staff | Area: Attendance/Classes | Sheet row: 50

## Root Cause (33rd check — 2 Aug 2026 UTC)
- Booking 17856 (Galbusera): CONFIRMED, confirmed=false, amountPaid EUR 339.90, amountOpen null, 0 payment records
- Booking 17857 (Fassina): CONFIRMED, confirmed=false, amountPaid EUR 339.90, amountOpen null, 0 payment records
- Orphan PMTs 16988 (HS 1204827374829) + 16989 (HS 1204846469317), EUR 339.90 each, 96 days unlinked (cross-ref Issue 1)
- BC 24630 (GE AM Plus, ended 2026-07-10): active = true — 23 days stale
- BC 24631 (GE AM Plus, ended 2026-07-10): active = true — 23 days stale

Other students (Uyanga/Ana Jessica/Telmuun/Ariunsarnai/Saikhantes/Enshi): tracked in Issues 25/17/20/15/23.

## Fix Recipe — NOT YET RUN

Step 1: Verify + link payments — see Issue 1 recipe (NOT YET RUN):
UPDATE payments SET booking_id = 17856 WHERE id = 16988;
UPDATE payments SET booking_id = 17857 WHERE id = 16989;
UPDATE bookings SET confirmed = true, amount_open = 0 WHERE id IN (17856, 17857);

Step 2: Deactivate stale BCs (NOT YET RUN):
UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

## Risk: money, bookings | Reversible | Blast radius: 2 students (Galbusera, Fassina)
## Status: Open — payments unlinked 96d; BCs 23d stale
Last checked: 2 Aug 2026 UTC (check 33, 8th today)