Issue 15 -- Saikhantes Shagdarsuren: service_end Expired
Check: 88th, Sun 9 Aug 2026 UTC | Reporter: AC | Row: 16

ROOT CAUSE -- CURRENT STATE

Booking 18151 (Saikhantes Shagdarsuren):
  status=CONFIRMED, confirmed=true
  serviceEnd=2026-08-07 -- expired 3 days ago (today Aug 9)
  amountPaid=EUR 1,339.20, amountOpen=EUR 0
  updatedAt=2026-07-08 (not updated since early July)

BC 24925 (AY Afternoon, 2026-03-09 to 2026-10-02): active=true -- current, do NOT deactivate.
Payment 17872: EUR 1,339.20, Bank Transfer, 2025-12-19, xeroPaymentId=null -- 234 days unreconciled.

serviceEnd should be 2026-10-02 (course end), not 2026-08-07.

FIX RECIPE -- NOT YET RUN

Step 1: Correct serviceEnd
  UPDATE Booking SET serviceEnd=2026-10-02, updatedAt=NOW() WHERE id=18151;

Step 2: Reconcile Payment 17872 in Xero
  - Find invoice for booking 18151 in Xero
  - Match payment (EUR 1,339.20, Bank Transfer, 19 Dec 2025)
  - Set xeroPaymentId on payment 17872 in SIS once reconciled

Step 3: Verify
  SELECT id, serviceEnd, confirmed FROM Booking WHERE id=18151;
  Expect: serviceEnd=2026-10-02

RISK: Category=Bookings/Data hygiene | Reversible=Yes
Blast radius: Single student (Saikhantes), cosmetic field only
Urgency: Low -- BC 24925 still current through Oct 2

STATUS: Open -- Fix NOT RUN | Last checked: Sun 9 Aug 2026 UTC (88th check)
