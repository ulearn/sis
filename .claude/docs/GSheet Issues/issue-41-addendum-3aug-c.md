Issue 41 Giampaolo Russo Dual Accommodation - 68th check Mon 3 Aug 2026 UTC 4th today

Root Cause:
Today is Aug Bank Holiday. First real teaching day: Tuesday 4 August.
Booking 18180: CONFIRMED amount_paid=EUR 2584.96 amount_open=EUR 0
BC24956 GE AM Aug3-Sep11: active=true start_date=2026-08-03 bank holiday 0 SCAs
BA 11357 bed178 Aug2-Sep6: active=true host family Patty McSweeney property 66
Capel Street BA Sep6-Sep14: NO booking_accommodation record in database
Documents on bk18180: NONE -- no invoice issued
Payment 17954: EUR 2584.96 paid 2026-06-26 xero_payment_id=null 38 days unreconciled

Fix Recipe - NOT YET RUN
Step 1: BC24956 shunted Aug3 to Aug4 via Issue 38 BH shunt -- no separate action
Step 2: Create SCA for bk18180 on BC24956 starting week of 2026-08-04
Step 3: Add BA for Capel Street Sep6-Sep14 premium room to bk18180
Step 4: Issue invoice for bk18180
Step 5: Reconcile Xero -- UPDATE payments SET xero_payment_id=<id> WHERE id=17954;

Risk: Bookings+Accommodation+Documents+Money (Xero 38d gap). Single student.
URGENT: SCA needed before Tuesday 4 Aug morning.
Last checked: 2026-08-03 UTC (68th hourly check, 4th today)