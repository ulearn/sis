Issue 12 — Massimiliano Cameran / Rakan Alghamdi / Bernardo Hughes Pimentel
Reporter: AC | Area: Booking / Accomm | Sheet row: 13
Status Update: Fri 7 Aug 2026 UTC (126th check)

SYMPTOM
Three students whose accommodation stay-ends fall mid-week, staff worried about cutting off nights.

ROOT CAUSE (verified this check)

Stale Booking Accommodations (unchanged):
- Booking Accommodation 11162: bookingId=97, bed 179, ended 23 May 2026, active=true — 75 days stale
- Booking Accommodation 11314: bookingId=18002, bed 179, ended 6 Jun 2026, active=true — 61 days stale
- Booking Accommodation 11319: bookingId=18034, bed=null, 31 May to 31 May 2026 (zero-length), active=true — 67 days stale; booking PARTIAL, confirmed=false

Bernardo Hughes Pimentel (student 14524) — NOT stale:
- Booking Accommodation 11213: bookingId=49, starts 25 Jul, ends 4 Sep 2026, active=true — CURRENT
- Booking 49: CONFIRMED, confirmed=true, fully paid EUR 3,200.20, serviceEnd=13 Sep 2026
- Booking Course 52 (Morning General Plus, 27 Jul to 4 Sep 2026): active — ongoing
- Bernardo visa_status=null (minor data quality only)
- No anomaly in Bernardo records; his BA is ongoing until Sep 4.

FIX RECIPE (NOT YET RUN)

Step 1 — Deactivate stale Booking Accommodations:
  UPDATE booking_accommodations SET active=false, updated_at=NOW() WHERE id IN (11162, 11314, 11319);

Step 2 — Verify:
  SELECT id, active, start_date, end_date, booking_id FROM booking_accommodations WHERE id IN (11162, 11314, 11319);

RISK
Category: data-hygiene. Reversible: yes. Blast radius: 3 rows.

STATUS
Fix NOT RUN. Last checked: Fri 7 Aug 2026 UTC (126th hourly check).
3 stale BAs unchanged (75d/61d/67d). Bernardo BA confirmed current (not stale).
