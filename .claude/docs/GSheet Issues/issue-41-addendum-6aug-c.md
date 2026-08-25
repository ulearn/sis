Issue 41 -- Giampaolo Russo: Capel BA Unassigned, Payment Unreconciled (17th check)

Reporter: KC | Area: Booking/Accommodation | Row: 43 | Check: 17th Thu 6 Aug 2026 UTC

17th hourly check -- no change since 16th. Capel Street BA 11392 bedId still null (31 days until check-in).
Payment 17954 xeroPaymentId still null (41 days unreconciled).

== Root cause ==

Booking accommodation 11357 (Host Family):
- bed_id = 178, Claremont Close, 2 Aug to 6 Sep 2026
- active = true -- current stay, correctly assigned

Booking accommodation 11392 (City Centre Apartment -- Capel Street):
- bed_id = null -- NOT assigned to a specific bed
- start_date = 2026-09-06, end_date = 2026-09-14
- active = true
- 31 days until check-in (as of 6 Aug)

Payment 17954:
- amount = EUR 2,584.96, method = Bank
- payment_date = 2026-06-26 (41 days ago)
- xero_payment_id = null -- not reconciled in Xero
- created_at = 2026-06-29

== Fix recipe (NOT YET RUN) ==

Step 1 -- Assign a Capel Street bed to booking accommodation 11392 via SIS admin:
  Accommodation -- Matching/Beds -- find available Capel Street bed for 6-14 Sep 2026.
  Assign to BA 11392 via SIS admin (not direct SQL -- ensures availability logic runs).

Step 2 -- Reconcile payment 17954 in Xero:
  Find bank transfer EUR 2,584.96 around 26 Jun 2026 -- reconcile against relevant invoice.
  Then update SIS:
    UPDATE public.payments SET xero_payment_id = <id> WHERE id = 17954 AND xero_payment_id IS NULL;

Step 3 -- Verify:
  SELECT id, bed_id, start_date::date, end_date::date, active FROM public.booking_accommodations WHERE id IN (11357, 11392);
  SELECT id, amount, xero_payment_id, payment_date::date FROM public.payments WHERE id = 17954;

== Risk / category ==

- Category: accommodation, money
- Step 1: low risk -- use SIS admin UI
- Step 2: low risk -- reconcile in Xero then update SIS
- Reversible: yes | Blast radius: 1 student (Giampaolo Russo, student 14571)

== Status ==

OPEN -- fix NOT RUN. 31 days to check-in. Payment 41 days unreconciled.

Last checked: Thu 6 Aug 2026 UTC (17th hourly check)