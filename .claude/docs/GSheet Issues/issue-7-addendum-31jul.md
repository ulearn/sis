# Issue 7 — Booking 17909 CANCELLED + confirmed=true (19th check)

Reporter: (staff) · Area: Booking · Sheet row: 8
Student: Sofiia Korkishchenko (ID 768)

## Root cause (31 Jul 2026)

Booking 17909:
- status=CANCELLED, confirmed=true (anomaly — CANCELLED should have confirmed=false)
- amountTotal=EUR 727.50, amountPaid=EUR 0 (no payments linked)
- hubspotDealId=500883363036 (Sofiia Korkishchenko — Renewal course PM Balance)
- Last updated 2026-06-17 — 44 days stale
- dataSource=HUBSPOT

Booking course 24693 (linked to bk 17909):
- Name: "Renewal - Academic Year PM"
- Dates: 2026-05-25 to 2026-11-13, 25 weeks, 15h/wk, fee EUR 1105.50
- active=true (should be false; booking is CANCELLED)

## Fix recipe (NOT YET RUN)

SQL (NOT YET RUN):
UPDATE bookings SET confirmed=false, updated_at=NOW() WHERE id=17909;
UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=24693;

Note: Verify Sofiia has an active replacement booking before deactivating — booking 17859 or similar.

## Risk: Bookings. Reversible. 1 booking, 1 student, 1 BC. No refund needed (amountPaid=0).
## Status: OPEN — fix NOT RUN — Last checked: Fri 31 Jul 2026 UTC (19th check, 44d stale)
