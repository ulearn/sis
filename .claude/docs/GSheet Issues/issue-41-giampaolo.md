# Issue 41 — Giampaolo Russo — Check-in Tomorrow + Capel Missing

Reporter: Diego (staff) | Area: Booking / Accommodation | Sheet row: 43

## Symptom
Student booked two accommodation types: Host Family (Aug-Sep) and Capel Street apartment (Sep 6-14). Only Host Family is in SIS. Capel BA missing. Also: booking course start date appears wrong (Sunday Aug 2).

## Root Cause (Evidence — Fri 31 Jul 2026 UTC)
- Student 14571 (Giampaolo Russo)
- Booking 18180: CONFIRMED, confirmed = true, EUR 2,584.96 fully paid, open = 0.00
- BA 11357 (bed 178, 5 Claremont Close Glasnevin, Host Family Individual): start_date = 2026-08-01, end_date = 2026-09-05, active = true, claim_status = confirmed
  - NOTE: DB shows start = Aug 1 (TOMORROW Saturday); prior H column incorrectly stated Aug 2 — actual DB value has been Aug 1 throughout
- BC 24956 (General English AM): start_date = 2026-08-02 (Sunday), end_date = 2026-09-10 — start day is a Sunday, which is wrong
  - BC 24956 is included in the Issue 38 shunt list; after Aug BH fix it will move to start 2026-08-04 (Tue)
- ZERO student_class_assignments for student 14571 as of now
- Capel Street accommodation (Sep 6-14): NO booking_accommodations record exists for student 14571 in that period
  - G column specifies: premium room at Capel Street, Sep 6 to Sep 14 (1 week + 1 extra night)
  - This needs to be added manually in SIS once Diego confirms bed ID and fee

## Fix Recipe (NOT YET RUN)

### Fix A: Add Capel Street Booking Accommodation (requires Diego)
1. In SIS admin, open Booking 18180 (Giampaolo Russo)
2. Add new Booking Accommodation: type = Apartment/Self-Catering (Capel Street), dates Sep 6 to Sep 14 2026, 1 week +1 night
3. Assign correct bed at Capel Street property
4. Set fee as per Diego/deal amount
5. Mark active and confirmed once ready

OR via SQL (once Diego provides bed_id and fee):
```sql
-- NOT YET RUN
INSERT INTO booking_accommodations (booking_id, accommodation_type, start_date, end_date, active, bed_id, fee)
VALUES (18180, 'Apartment', '2026-09-06', '2026-09-14', true, <BED_ID>, <FEE>);
-- Replace <BED_ID> and <FEE> with actual values from Diego
```

### Fix B: BC 24956 Start Date (via Issue 38 shunt)
BC 24956 start is currently 2026-08-02 (Sunday). Once Issue 38 Aug Bank Holiday fix runs, it will be shunted to 2026-08-04 (Tuesday). No separate fix needed IF Issue 38 is resolved.

```sql
-- NOT YET RUN (only needed if Issue 38 fix NOT run)
UPDATE booking_courses SET start_date = '2026-08-04' WHERE id = 24956;
```

## Risk / Category
- Category: Bookings / Accommodation — URGENT (check-in tomorrow)
- BA 11357 (Host Family): ready and confirmed — no action needed
- Capel BA: missing — moderate risk, student needs Sep 6-14 accommodation confirmed
- BC date: fixed by Issue 38; otherwise manual fix needed
- Reversible: YES

## Status
PARTIALLY RESOLVED. BA 11357 ready for check-in TOMORROW (Sat 1 Aug). Capel BA absent — awaiting Diego input.
19th total check (Fri 31 Jul 2026 UTC). Fix NOT RUN.
Last checked: 2026-07-31 UTC (hourly bot run)