Issue 37 - Veronica Martin / Jesus Manuel Ramirez Diaz (bed 83 stale BAs)

Reporter: KC | Area: Booking / Accomm | Sheet row: 39 | Check: 11th (Sat 1 Aug 2026 UTC)

Symptom
Student paid for accommodation in Capel - does not appear in SIS for allocation.

Root Cause (fresh DB - NOT YET FIXED)
Booking accommodation 11352 (Veronica Martin, bed 83, booking 18156):
  Start 2026-07-04, end 2026-07-11, active = true, fee EUR 360
  21 days post-checkout (was 19d on Thu 30 Jul)

Booking accommodation 11285 (Jesus Manuel Ramirez Diaz, bed 83, booking 17825):
  Start 2026-06-21, end 2026-07-05, active = true, fee = null
  27 days post-checkout (was 25d on Thu 30 Jul)

Both BAs still active - bed 83 remains blocked for new allocation.
Bookings 17825 and 18156 both CONFIRMED, confirmed = true - no booking anomaly.

Fix Recipe (NOT YET RUN)

  UPDATE booking_accommodations SET active = false WHERE id IN (11285, 11352);

Note: BA 11285 has fee = null. Confirm with accounts whether fee was collected before deactivating.

Verify:
  SELECT id, active, fee FROM booking_accommodations WHERE id IN (11285, 11352);

Risk / Category
- Category: data-hygiene / accommodation
- Reversible: yes
- Blast radius: bed 83 availability only (2 records)
- Low urgency: cosmetic - bed 83 blocked but no active student pending allocation

Status
Open - 11th check (Sat 1 Aug 2026). NOT FIXED.
BAs now 21d + 27d stale (2 additional days since Thu 30 Jul check).

Last checked: 2026-08-01 UTC
