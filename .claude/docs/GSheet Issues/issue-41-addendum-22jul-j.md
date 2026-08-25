# Issue 41 — Giampaolo Russo (student 14571) — Missing Capel Apt + Xero
Reporter: Diego/Staff | Sheet row 43 | Check: 53rd hourly, 103rd total (Wed 22 Jul 2026 UTC)

## Root Cause (fresh DB 22 Jul 2026 UTC)
Booking 18180: CONFIRMED, EUR 2584.96 total, EUR 0 open.
BA11357 (Host Family, bed 178, 2 Aug - 6 Sep 2026, EUR 1250, active): present and correct.
Capel Street apartment: STILL MISSING — no second booking_accommodation on booking 18180.
Payment 17954 (EUR 2584.96, Bank Transfer, 26 Jun 2026): xeroPaymentId = STILL null — 26 days unreconciled.
Check-in: 2 Aug 2026 — 11 calendar days away.

## Fix Recipe (NOT YET RUN)
Step 1 - Add Capel apt:
SIS admin: Booking 18180 => Add Accommodation => Capel Street Premium Room => 6 Sep - 14 Sep 2026.
If UI blocked (confirm bed_id + fee with Diego first):
INSERT INTO booking_accommodation (booking_id, bed_id, start_date, end_date, active, fee)
VALUES (18180, <capel_bed_id>, '2026-09-06', '2026-09-14', true, <fee>);

Step 2 - Reconcile Xero:
Xero: find EUR 2584.96 received ~26 Jun 2026 => reconcile against Giampaolo invoice.

## Risk: bookings | Reversible: yes | Blast radius: low (check-in 11 days)
## Status: Open — Capel missing; PMT17954 xeroId null 26d. Last checked: Wed 22 Jul 2026 UTC