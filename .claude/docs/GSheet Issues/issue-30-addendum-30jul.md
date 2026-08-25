Issue 30 -- Giulia Avallone / Milena Vinci (addendum 30 Jul 2026)

Reporter: AC | Area: Booking / Admin | Sheet row: 31

Symptom
Giulia Avallone mother Milena Vinci listed as student in SIS; booking course stale.

Root cause (Thu 30 Jul 2026 UTC)
- Milena Vinci: no student record found in SIS DB (lastName search returned no match) -- original concern moot
- Booking course 104 (Morning General Plus, 2026-06-15 to 2026-06-26): active = true -- 34 days stale
- Booking 94 (Giulia Avallone, student 88): CONFIRMED, confirmed = true, fully paid EUR 1151.5
- Payment 17102: EUR 1151.5, Bank Transfer (Fidelo), 2026-03-13, xeroPaymentId = null

Fix recipe (NOT YET RUN)

Step 1 -- Deactivate stale booking course 104:
  UPDATE booking_course SET active = false WHERE id = 104;

Step 2 -- Reconcile payment 17102 with Xero:
  1. Check Hub fins/ for EUR 1151.5 bank transfer Mar 13 2026 for Giulia Avallone
  2. Find Xero payment reference
  3. UPDATE payment SET xero_payment_id = (xero_ref) WHERE id = 17102;

Note on Milena Vinci: not in SIS as a student -- no action needed on parent/student concern.

Risk: data hygiene (stale BC) + accounts (Xero null) -- reversible; low blast radius.

Status: BC 104 stale 34 days. Payment 17102 xeroPaymentId null. Milena Vinci not in DB.
Last checked: Thu 30 Jul 2026 UTC