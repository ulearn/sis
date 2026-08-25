Issue 41 - Giampaolo Russo (ID 14571) — Capel Street accommodation missing + Xero payment unreconciled
Reporter: KC/Diego | Area: Booking / Accomm | Sheet row: 43 | Last checked: 2026-07-22 UTC

Symptom: Student booked Host Family (Aug 2-Sep 6) + Capel Street apt (Sep 6-14). Only Host Family in SIS; Capel apt missing.

Root Cause:
- Booking 18180 (Giampaolo Russo, student 14571, confirmed=true): only 1 accommodation record.
- Host Family: BA 11357, bed 178, 2 Aug to 6 Sep 2026, active=true. Confirmed.
- Capel Street apartment: STILL MISSING — no BA record for Sep 6-14.
- Payment 17954 (EUR 2584.96, Bank Transfer, created 2026-06-29): xeroId = null — 23 days unreconciled.
- Host Family check-in: 2 Aug 2026 — 11 calendar days away.
- DB confirmed — 50th hourly check Wed 22 Jul 2026 UTC (100th total).

Fix Recipe (NOT YET RUN):
1. Add Capel Street accommodation via SIS: Student 14571 > Booking 18180 > Add accommodation.
   Type: Apartment (Capel Street). Dates: 6 Sep 2026 to 14 Sep 2026. Assign Capel bed.
2. Reconcile payment 17954 in Xero: match EUR 2584.96 bank transaction ~29 Jun 2026 to booking 18180 invoice.
3. Verify: SELECT id, accommodation_type, bed_id, start_date, end_date FROM booking_accommodations WHERE booking_id=18180;

Risk: Guest needs Capel bed from Sep 6. Xero mismatch. Reversible. Check-in Aug 2 (11 days).
Status: Open - fix NOT RUN. Wed 22 Jul 2026 UTC (50th hourly, 100th total).