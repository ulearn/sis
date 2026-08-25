# Issue 41 — Giampaolo Russo (Booking 18180) — Capel Missing + Xero Null

Reporter: Diego | Area: Booking / Accommodation | Sheet row: 43

## Symptom
Student booked two accommodations (Host Family + Capel St apartment) but only Host Family appears in SIS. Student also not appearing in matching section for host family assignment.

## Root cause (Fri 24 Jul 2026 UTC — 70th per-issue check)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, EUR 2,584.96 / 2,584.96 fully paid
- Accommodation 11357: Host Family, bed 178, 2 Aug – 6 Sep 2026, EUR 1,250, active = true
- Capel Street accommodation: STILL missing from SIS — only 1 accommodation record on booking
- Payment 17954: EUR 2,584.96, Bank, 29 Jun 2026, xero_payment_id = null — 25 days unreconciled
- Booking course 24956: General English AM, 3 Aug – 11 Sep 2026, active = true
  → BC24956 starts ON 3 Aug 2026 = August Bank Holiday (Issue 38 — not yet in school_closures)
- Check-in: 2 Aug 2026 = 9 days away

## Fix recipe (NOT YET RUN)
1. SIS admin → Booking 18180 → Accommodations → Add second accommodation for Capel Street
   - Type: Apartment / Premium Room
   - Dates: 6 Sep – 14 Sep 2026 (per original report: 1 week + 1 extra night)
   - Assign appropriate bed/room once added
2. Xero: reconcile payment 17954 (EUR 2,584.96, Bank, 29 Jun) against the correct Xero invoice
   - This will set xero_payment_id and mark payment as reconciled
3. After Issue 38 Aug BH fix: verify BC24956 start date — if 3 Aug remains, shift to Tue 4 Aug

Risk: Medium / reversible. Adding accommodation is low-risk. Xero reconciliation is reversible. Course date change requires care if student has already been notified.

## Status
STILL OPEN — check-in 9 days away, Capel missing, Xero null 25d. Fix NOT RUN.
Last checked: Fri 24 Jul 2026 UTC (70th per-issue check, 148th total)