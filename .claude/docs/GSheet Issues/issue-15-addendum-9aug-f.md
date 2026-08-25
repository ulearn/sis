Issue 15: Saikhantes Shagdasuren - service_end Expired 2 Days
Reporter: Staff | Area: booking/class | Sheet row: 16 | 86th check Sun 9 Aug 2026 UTC

SYMPTOM
Course dates/holidays appear incorrect - migration artefact (Fidelo Jan 12 vs SIS Mar 9 restart).

ROOT CAUSE - 86th check UNCHANGED from 85th
Booking 18151 (Saikhantes Shagdarsuren): CONFIRMED, confirmed=true, EUR 1,339.20 paid, EUR 0 open
serviceEnd=2026-08-07 - EXPIRED 2 DAYS AGO (today 2026-08-09)
BC 24925 (Academic Year Afternoon): endDate=2026-10-02, active=true
Payment 17872: EUR 1,339.20, Bank Transfer, 2025-12-19, xeroPaymentId=null (unreconciled)

FIX RECIPE - NOT YET RUN
Step 1:
UPDATE "Booking" SET "serviceEnd"='2026-10-02' WHERE id=18151;

Step 2 - Verify:
SELECT id, status, "serviceEnd", "amountPaid" FROM "Booking" WHERE id=18151;
Expected: serviceEnd=2026-10-02.

Step 3 - Xero (separate): reconcile payment 17872 (EUR 1,339.20, xeroPaymentId=null).

RISK: bookings/data-hygiene. Reversible. Blast radius: Saikhantes only.

STATUS: OPEN. service_end 2d expired. 86th check Sun 9 Aug 2026 UTC. Unchanged.
Last checked: 2026-08-09 UTC