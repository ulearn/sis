# Issue 13 — Insurance Fee Null Lizbeth del Carmen (Addendum 28 Jul 2026)
Reporter: Staff. Sheet row 14. Last checked: Tue 28 Jul 2026 UTC (37th dedicated check).

## Root cause (fresh Tue 28 Jul 2026)
- Booking extra 96: extra_type=INSURANCE, fee=null, booking_id=17981
- Last updated: 25 May 2026 — 64 days ago
- Booking 17981 (Lizbeth del Carmen): Confirmed, amount_paid=EUR 1,407.50
- Insurance extra created without fee. Booking amount_open likely understated; not in Xero.

## Fix recipe (NOT YET RUN)
1. Confirm correct insurance fee from HubSpot deal / original agreement.
2. Set fee: UPDATE booking_extras SET fee=<CONFIRMED_AMOUNT>, updated_at=NOW() WHERE id=96;
   (Typical values: EUR 80/100/120 — verify the deal before running)
3. Verify amount_open on booking 17981 after: SELECT id, amount_open, amount_paid FROM bookings WHERE id=17981;

## Risk
Financial. Low blast radius. Reversible. Previous: issue-13-addendum-27jul.md.