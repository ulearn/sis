# Issue 41 — Giampaolo Russo (BA 11396 started today, fee null)

Reporter: KC | Area: Booking/Accomm | Sheet row: 43

## Root cause (15 Aug 2026 UTC — 87th check)

- Booking 18180 (student 14571 Giampaolo Russo): CONFIRMED, fully paid EUR 2,584.96
- BA 11357 (bed 178, Aug 2-Aug 15): fee = EUR 1,250, confirmed — ENDED TODAY
- BA 11396 (bed 44, Jenny Manders, Aug 15-Aug 22): STARTED TODAY day 1 — fee = null, claimStatus = null — URGENT
- BA 11397 (bed 89, Capel Street, Aug 22-Sep 6): fee = null — 7 days to check-in
- BA 11392 (City Centre Apartment, Sep 6-Sep 14): fee = EUR 415 set, bedId = null — needs bed assignment

## Fix recipe (NOT YET RUN)

URGENT (today): confirm rate with Diego, then:
  UPDATE booking_accommodation SET fee = <rate> WHERE id = 11396;

Before Aug 22:
  UPDATE booking_accommodation SET fee = <rate> WHERE id = 11397;

Before Sep 6:
  UPDATE booking_accommodation SET bed_id = <apt_bed_id> WHERE id = 11392;

Reversible. Affects host payment recording (Jenny Manders bed 44).

## Status

URGENT. BA 11396 active since midnight Aug 15 — fee still null at 87th check (~14:00 UTC).
Last checked: 15 Aug 2026 UTC (87th check)
