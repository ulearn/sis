Issue 41 - Giampaolo Russo (Addendum 26 Jul 2026 D)

Reporter: Diego | Area: Booking / Accomm | Sheet row: 43

Root cause (verified Sun 26 Jul 2026 UTC - run 113)
- Booking 18180 Giampaolo Russo student 14571: Confirmed, EUR 2,584.96 fully paid
- BA11357 bed 178 host family Aug 2 to Sep 6 2026: active=true, fee=EUR 1,250 - correct, check-in in 7 days
- No Capel Street booking accommodation exists on booking 18180
- BC24956 General English AM Aug 3 to Sep 11 2026: active=true, fee=EUR 804.96, 0 class assignments
  NOTE: BC24956 start date Aug 3 = Bank Holiday (Issue 38); will shunt to Aug 4 when issue 38 fix runs
- Payment 17954: EUR 2,584.96, type=null, xeroPaymentId=null

Fix recipe (NOT YET RUN)

Step 1: Confirm Capel Street fee with KC/Diego (est. EUR 530).

Step 2: Add Capel Street accommodation to booking 18180 via SIS admin:
  Booking 18180 > Accommodation > Add
  Period: Sep 6 to Sep 14 2026 (1 week)
  Accommodation type: Capel / student residence
  Fee: confirmed amount (est. EUR 530)

Step 3: Reconcile payment 17954 in Xero:
  Payment 17954: EUR 2,584.96, type=null, xeroPaymentId=null
  Set payment type and link Xero reference.

Step 4: Issue 38 dependency - after Aug BH school_closures insert and shunt run, BC24956 shifts to start Aug 4. No manual step needed here.

Step 5: After issue-38 fix runs, assign BC24956 to class for week beginning Mon Aug 4.

Risk: bookings / accommodation / Xero; partially reversible; check-in in 7 days (Aug 2)

Status: UNRESOLVED - Capel BA missing, payment unreconciled, class unassigned. Last checked: Sun 26 Jul 2026 UTC run 113