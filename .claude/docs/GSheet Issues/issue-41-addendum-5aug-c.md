Issue 41 — Giampaolo Russo Dual Accommodation (14th check)
Reporter: Diego | Area: Booking / Accomm | Sheet row: 43 | Checked: Wed 5 Aug 2026 UTC

SYMPTOM
Student booked Host Family + Capel Street apartment. Capel BA exists in DB but no bed assigned. Payment unreconciled.

ROOT CAUSE — live data Wed 5 Aug 2026 UTC

Booking 18180 (Giampaolo Russo, student 14571):
  CONFIRMED, confirmed=true, amountPaid=EUR 2,584.96, amountOpen=EUR 0, amountTotal=EUR 2,584.96 — fully paid

Accommodations:
  BA 11357: bed 178 (Host Family, Claremont Close), 2 Aug to 6 Sep 2026, active=true, fee=EUR 1,250 — OK
  BA 11392: bedId=null (Capel Street), 6 Sep to 14 Sep 2026, active=true, fee=EUR 415 — NO BED ASSIGNED

  BA 11392 (Capel Street Sep 6-14) exists in DB but bedId=null — specific room/unit not allocated yet.

Course: BC 24956 (General English AM, 3 Aug to 11 Sep 2026), class 8, SCA 404 — OK

Payment:
  Payment 17954: EUR 2,584.96, Bank, 26 Jun 2026, xeroPaymentId=null — 40 DAYS UNRECONCILED

FIX RECIPE (NOT YET RUN)

Step 1 — Assign bed to BA 11392 (Capel Street Sep 6-14):
  Via SIS admin Accommodation allocation — assign Capel Street room/unit to BA 11392.
  Or directly: p.bookingAccommodation.update({ where: { id: 11392 }, data: { bedId: CAPEL_BED_ID } })
  Confirm correct bed ID first from provider 15 bed list.

Step 2 — Reconcile payment 17954 in Xero:
  EUR 2,584.96, Bank, 26 Jun 2026 — match Xero receipt for booking 18180.

RISK: bookings / money. Reversible: yes. Blast radius: 1 booking, 1 BA, 1 payment.
STATUS: Open — BA 11392 bedId=null; pmt 17954 Xero null 40d. Last checked: Wed 5 Aug 2026 UTC (14th hourly run)