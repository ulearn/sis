# Issue 41 — Giampaolo Russo (Student 14571) — Addendum 15 Aug 2026 (c)

Reporter: Diego | Area: Booking / Accommodation | Sheet row: 43

SYMPTOM
Host family + three Capel Street blocks; fees missing on BAs 11396 and 11397; BA 11392 has no bed assigned.

CURRENT STATE (86th check — Sat 15 Aug 2026 ~12:00 UTC)

Booking 18180: CONFIRMED, confirmed=true, amountPaid=EUR 2,584.96, amountOpen=0

Booking Accommodations:
  BA 11357 (bed 178, host family provider 24): Aug 2-Aug 15, fee EUR 1,250, claimStatus=confirmed - ENDED TODAY, not deactivated
  BA 11396 (bed 44, Jenny Manders): Aug 15-Aug 22, fee=NULL, not claimed - STARTED TODAY, URGENT
  BA 11397 (bed 89, Capel Street): Aug 22-Sep 6, fee=NULL, not claimed - 7 days to check-in
  BA 11392 (City Centre Apt, bedId=null): Sep 6-Sep 14, fee=EUR 415, not claimed - no bed assigned

Change since 85th check (10:10 UTC): No fee set on BA 11396; student now resident with no fee recorded.

FIX RECIPE (NOT YET RUN)

1. Set fee on BA 11396 - TODAY (student resident since this morning)
   SIS admin > Booking 18180 > Accommodation > BA 11396 (bed 44, Aug 15-22)
   Confirm fee with Diego (ref: EUR 1,250/2 weeks on 11357 = ~EUR 625/week)
   Set fee = EUR 625 (or confirmed amount) > Save

2. Deactivate BA 11357 (ended today, safe)
   SIS admin > BA 11357 > active=false > Save
   SQL: UPDATE booking_accommodation SET active=false WHERE id=11357; -- NOT YET RUN

3. Set fee on BA 11397 (before Aug 22)
   SIS admin > BA 11397 (bed 89 / Capel Street, Aug 22-Sep 6, 3 weeks)
   Set fee = EUR 1,295 (confirm with Diego) > Save

4. Assign bed to BA 11392 (before Sep 6)
   Find available City Centre Apartment Sep 6-14; assign to BA 11392

RISK: Accommodation/Accounts - reversible - single student. Fee on BA 11396 overdue (resident today).
STATUS: OPEN - 86th check 2026-08-15 ~12:00 UTC. Fix NOT RUN.
