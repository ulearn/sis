# Issue 41 — Giampaolo Russo: Capel Street BA Unassigned + Xero Payment Unreconciled (16th check)

Reporter: KC | Area: Booking/Accomm | Row: 43 | Student: Giampaolo Russo ID 14571
Check: 16th Thu 6 Aug 2026 UTC. Fix NOT RUN.

## Symptom

Two accommodation types booked (Host Family + City Centre Apartment at Capel Street). Neither appeared in matching section. City Centre Apartment bed still not assigned.

## Root cause (16th check Thu 6 Aug 2026 UTC)

- Booking accommodation 11357 (Host Family, bed 178, Claremont Close, 2 Aug to 6 Sep 2026): active, current stay — OK
- Booking accommodation 11392 (City Centre Apartment, 6 Sep to 14 Sep 2026): bedId = null — not assigned to a bed; 31 days until check-in
- Payment 17954: EUR 2,584.96, Bank, payment date 26 Jun 2026, xeroPaymentId = null — 41 days unreconciled
  Note: previous runs stated payment date as 29 Jun 2026 — actual paymentDate in DB is 2026-06-26 (41 days, not 38)

## Fix recipe (NOT YET RUN)

Step 1 — Assign bed to booking accommodation 11392 via SIS admin:
  Accommodation -> Matching -> find Giampaolo Russo -> assign to Capel Street room (City Centre Apartment)
  OR via SIS admin direct: set bedId on booking_accommodation id=11392 to the correct Capel Street bed.

Step 2 — Reconcile payment 17954 in Xero:
  Find payment EUR 2,584.96 from Giampaolo Russo / Jun 26 2026 in Xero.
  Link to invoice and mark as reconciled.
  Then update xeroPaymentId on payment 17954 in SIS (or confirm the SIS-Xero sync handles this).

Step 3 — Verify:
  SELECT id, bed_id, start_date, end_date, active FROM public.booking_accommodations WHERE id = 11392;
  SELECT id, xero_payment_id FROM public.payments WHERE id = 17954;

## Risk / category

- Category: bookings, accommodation, payments
- Risk: low — assigning a bed is reversible; Xero reconciliation is manual
- Reversible: yes
- Blast radius: single student (Giampaolo Russo, student 14571)

## Status

OPEN — fix NOT RUN. Sep 6 check-in is 31 days away.

Last checked: Thu 6 Aug 2026 UTC (16th hourly check)