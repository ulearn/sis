# Issue 1 Addendum — Thu 23 Jul 2026 (47th hourly, 103rd total)

**Sheet row:** 2 | **Reporter:** NM | **Area:** Cleanup

## Symptom
Orphan payments (bookingId = null) and stale active booking-course / booking-accommodation counts.

## Root Cause (current state, NOT YET FIXED)

### Orphan payments — 4 total, all unchanged

| ID | Amount | Method | Payment date | Days | fideloPaymentId | Notes |
|----|--------|--------|-------------|------|-----------------|-------|
| 4781 | EUR 380 | Flywire | Aug 2019 | Permanent | 32056 | 2019 Fidelo legacy — permanently unresolvable |
| 16988 | EUR 339.90 | Bank | 28 Apr 2026 | 86 | null | Needs booking link |
| 16989 | EUR 339.90 | Bank | 28 Apr 2026 | 86 | null | Needs booking link |
| 17187 | EUR 6,151 | TransferMate Escrow | 1 May 2026 | 83 | **37587** | Fidelo-migrated orphan — see note |

**Payment 17187 — new detail this check:**
fideloPaymentId = 37587 means this was imported from Fidelo during the Apr/May 2026 migration with bookingId null.
Either (a) the Fidelo booking was not migrated to SIS, or (b) the link was lost during import.
At EUR 6,151 this is significant. To resolve: search SIS for a booking with ~EUR 6,151 total and no matching
large payment; or check archived Fidelo data for payment 37587 to find the student/booking.
This may be unresolvable without Fidelo source data — similar in nature to payment 4781. Neil to confirm.

### Stale active counts (unchanged)
- Booking courses: 24,436 with active = true and endDate before 23 Jul 2026
- Booking accommodations: 11,175 with active = true and endDate before 23 Jul 2026

## Fix Recipe (NOT YET RUN)

### Step 1 — Payments 16988 + 16989 (EUR 339.90 each, Bank, 28 Apr 2026)
Same day, same amount, same method — likely a split or duplicate for one student booking.
Check HubSpot for a student who paid ~EUR 680 by bank transfer around 28 Apr 2026, find the SIS booking, then:
    -- NOT YET RUN
    UPDATE payments SET booking_id = <target_booking_id> WHERE id IN (16988, 16989);

### Step 2 — Payment 17187 (EUR 6,151 TransferMate Escrow, fideloId=37587)
    -- NOT YET RUN — find booking with ~EUR 6,151 total and no large payment
    SELECT b.id, b.total_fee, s.first_name, s.last_name
    FROM bookings b JOIN students s ON s.id = b.student_id
    WHERE b.total_fee BETWEEN 5900 AND 6400
      AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.booking_id = b.id AND p.amount > 5000);
If a match: UPDATE payments SET booking_id = 17187_booking WHERE id = 17187;
If no match: treat as permanently unresolvable; flag for write-off.

### Step 3 — Payment 4781 (EUR 380, Flywire, fideloId=32056, 2019)
No action possible. Leave as audit record.

### Step 4 — Deactivate stale booking courses (~24,436 rows)
    -- NOT YET RUN
    UPDATE booking_courses SET active = false WHERE active = true AND end_date < NOW();

### Step 5 — Deactivate stale booking accommodations (~11,175 rows)
    -- NOT YET RUN
    UPDATE booking_accommodations SET active = false WHERE active = true AND end_date < NOW();

## Risk
- Payments: money category; reversible (unlink if wrong booking chosen)
- Deactivation: data-hygiene; reversible; ~35k rows, boolean flag only

## Status
OPEN — Fix NOT RUN.
**Last checked:** Thu 23 Jul 2026 UTC (47th hourly, 103rd total)