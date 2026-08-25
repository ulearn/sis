Issue 41 — Giampaolo Russo (Student 14571) — Addendum 15 Aug 2026

Reporter: Diego | Area: Booking / Accommodation | Sheet row: 43

SYMPTOM
Host family + two Capel Street accommodation blocks; fees missing on Booking Accommodations 11396 and 11397.

CURRENT STATE (83rd check — Sat 15 Aug 2026 UTC)

Booking 18180
- Status: CONFIRMED, confirmed = true
- Amount paid: EUR 2,584.96 | Amount open: EUR 0 (fully settled)

Booking Accommodations:
  BA 11357: bed 178 (host family), Aug 2-Aug 15 (ENDED TODAY), fee=EUR 1,250, active=true — DEACTIVATE
  BA 11396: bed 44 (Capel wk1), Aug 15-Aug 22 (STARTED TODAY), fee=NULL, active=true — URGENT: student here now
  BA 11397: bed 89 (Capel wk2-4), Aug 22-Sep 6, fee=NULL, active=true — check-in in 7 days
  BA 11392: bed unassigned, Sep 6-Sep 14, fee=EUR 415, active=true — bed needed before Sep 6

Payment 17954: EUR 2,584.96, Jun 26 2026, xero_payment_id=null — 50 days unreconciled

Rate reference (from BA 11357 = EUR 1,250 for 13 nights):
  BA 11396 (7 nights, Aug 15-22): est. EUR 625
  BA 11397 (15 nights, Aug 22-Sep 6): est. EUR 1,295 — confirm with Diego

FIX RECIPE (NOT YET RUN)

1. Set fee on BA 11396 — URGENT (student resident today)
   SIS admin -> Booking 18180 -> Accommodation -> BA 11396 (bed 44, Aug 15-22)
   Set fee = EUR 625 (confirm with Diego) -> Save

2. Deactivate BA 11357
   SIS admin -> BA 11357 (bed 178) -> set active = false

3. Set fee on BA 11397 (before Aug 22)
   SIS admin -> BA 11397 (bed 89, Aug 22-Sep 6)
   Set fee = EUR 1,295 (confirm with Diego) -> Save

4. Assign bed for BA 11392 (before Sep 6)
   Sep 6-Sep 14 City Centre apt — use accommodation matching screen

5. Reconcile Payment 17954 in Xero
   EUR 2,584.96, Jun 26 2026 — Xero -> find Jun 26 bank receipt -> link to Booking 18180 invoice

RISK: BA 11396 fee needed TODAY; BA 11397 needed before Aug 22; reversible; single student
STATUS: OPEN — 83rd check 2026-08-15 UTC
