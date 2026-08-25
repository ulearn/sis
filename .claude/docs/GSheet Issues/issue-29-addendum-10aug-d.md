Issue 29 and 15 — Saikhantes service_end Expired (Addendum 10 Aug 2026, run d)

Reporter: KC | Area: booking / class | Sheet row: 30

Root Cause (75th check, Mon 10 Aug 2026 UTC):
- Student 1001 (Saikhantes Shagdarsuren), Booking 18151
- status: CONFIRMED, confirmed = true, EUR 1,339.20 paid, EUR 0 open
- service_end = 2026-08-07 — EXPIRED 5 days ago
- Booking Course 24925: active, 1 class assignment, ends 2026-10-02 (53 days remaining)
- Student is in class; service_end is the only stale field

FIX RECIPE — NOT YET RUN
Update booking 18151 service_end to 2026-10-02 (match BC 24925 end date):

  UPDATE bookings SET service_end = 2026-10-02 WHERE id = 18151;

Risk: data-hygiene. Trivial, reversible. Blast radius = 1 booking field.
Status: Open — service_end 5 days expired, student in class and fully paid.
Last checked: Mon 10 Aug 2026 UTC (75th check)