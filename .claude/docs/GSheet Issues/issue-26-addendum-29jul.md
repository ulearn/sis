# Issue 26 addendum 29 Jul 2026

Reporter: pg | Area: Booking / Class | Row: 27

UNCHANGED since 28 Jul run.

Root cause (43rd hourly check Wed 29 Jul 2026 UTC):
- BC 23 (Intensive General 30, ended 22 May 2026, booking 22): active=true — 68d stale
- BC 24826: active=true — stale (ended earlier 2026)
- Booking 18034: EUR 250 open, status=PARTIAL, confirmed=false
- Booking 22: fully paid EUR 1948, no issue

Fix recipe (NOT YET RUN):
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=23;
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=24826;
  Chase EUR 250 on booking 18034 via HubSpot.

Risk: data-hygiene + money. Reversible. Blast radius: 2 BCs + 1 payment.
Status: UNCHANGED. Last checked: Wed 29 Jul 2026 UTC.