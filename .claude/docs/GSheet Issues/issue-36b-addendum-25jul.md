# Issue 36b — Stale Booking Accommodations With Beds — Addendum 25 Jul 2026

Reporter: (internal) | Area: Booking / Accomm | Sheet row: 38

Root cause (46th hourly check, 151st total — Sat 25 Jul 2026 UTC):
- Stale BAs with beds: 47 records — UP 4 from 43 (45th check Fri 24 Jul)
- 4 new today (expired 25 Jul):
  BA 11366: bed 189, booking 18212
  BA 11312: bed 161, booking 17984
  BA 26:    bed 178, booking 17845
  BA 11184: bed 188, booking 78
- Previously known: BA 11265 (bed 157, ended 19 Jul), BA 11257 (bed 168, ended 18 Jul)
- BA 26 (bed 178) now free — Giampaolo (booking 18180) needs it from 2 Aug (Issue 41 dep)

Fix recipe — NOT YET RUN:
  UPDATE booking_accommodations SET active = false
  WHERE active = true AND bed_id IS NOT NULL AND end_date < '2026-07-26';

Risk: data hygiene | Reversible: Yes | Urgency: Medium-High (BA 26 blocks Giampaolo bed 178)
Status: NOT YET RUN. Last checked: Sat 25 Jul 2026 UTC (46th check, 151st total)