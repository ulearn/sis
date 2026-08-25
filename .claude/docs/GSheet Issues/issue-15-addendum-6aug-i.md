# Issue 15 — Saikhantes Shagdarsuren (service_end CRITICAL)
Reporter: PG | Area: Booking / Class | Sheet row: 16

## Symptom
Course dates and holidays make no sense for Saikhantes. Renewal booking service_end is expiring TONIGHT.

## Root Cause (verified 16:02 UTC Thu 6 Aug 2026)
- Booking 18151 (student 1001): service_end = 2026-08-07 — Fidelo-migrated service window, never extended after AY renewal.
- Booking course 24925 (AY Afternoon, ILEP 0318/0003): endDate = 2026-10-02 — correct end date.
- service_end unchanged since Jul 8 2026.
- Current time: 16:02 UTC Aug 6 = ~8 hours before expiry.
- Portal treats student as expired at midnight UTC Aug 7 if not corrected.

## Fix Recipe (NOT YET RUN)

Run via psql against the SIS database:

  UPDATE bookings
  SET service_end = '2026-10-02', updated_at = NOW()
  WHERE id = 18151;

Verify after:
  SELECT id, service_end, updated_at FROM bookings WHERE id = 18151;
Expected: service_end = 2026-10-02.

## Risk / Category
- Category: Bookings (service access). Reversible.
- Blast radius: booking 18151 / student 1001 only.
- URGENCY: CRITICAL — run tonight before midnight UTC.

## Status
Fix NOT RUN. service_end still = 2026-08-07 as of 16:02 UTC Thu 6 Aug 2026.
Last checked: 16:02 UTC Thu 6 Aug 2026