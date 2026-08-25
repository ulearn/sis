# Issue 41 Giampaolo Russo — Addendum 99th hrly Sat 25 Jul 2026

STATUS: UNCHANGED from 98th hourly.

Live data (99th hrly):
  Student 14571 (Giampaolo Russo): visaStatus = null (last updated Jul 11 = 14 days)
  Booking 18180: CONFIRMED, confirmed = true, fully paid EUR 2,584.96
  Booking course 24956 (General English AM, Aug 3 to Sep 11): active=true
    NOTE: BC 24956 starts Aug 3 (Bank Holiday) — also on Issue 38 shunt list
  Booking accommodation 11357 (Aug 2 to Sep 6, bed 178 host family): active=true — present
  Capel Street accommodation (Sep 6 to Sep 14): STILL MISSING — no second BA on booking 18180
  Payment 17954: EUR 2,584.96, Bank, Jun 26, xeroPaymentId=null (29 days)

URGENCY:
  Host family check-in: Aug 2 = 8 days away.
  Capel Street BA has been missing for 21+ days.
  BC 24956 also needs Aug 3 shunt to Aug 4 (see Issue 38).
  visaStatus null for 14 days — student may not be able to access portal.

Fix recipe (NOT YET RUN — see issue-41-giampaolo-dual-accomm.md for full recipe):
  1. Confirm Capel Street room/bed details with staff (premium room, Sep 6 to Sep 14, EUR 529.96).
  2. Create missing booking accommodation for booking 18180, Sep 6 to Sep 14, Capel bed.
  3. Reconcile payment 17954 (xeroPaymentId=null, 29 days).
  4. Set visaStatus on student 14571.
  5. After Issue 38 fix runs: BC 24956 start_date will be shunted to Aug 4.

STATUS: Fix NOT RUN. Host family check-in Aug 2 = 8 days away.
Last checked: Sat 25 Jul 2026 UTC (99th hourly)
