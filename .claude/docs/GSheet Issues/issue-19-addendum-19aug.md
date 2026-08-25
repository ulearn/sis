Issue 19 - Mai Lan Chu (16th check, 18 Aug 2026 UTC)
Reporter: | Area: Booking/Class | Sheet row: 20

Symptom
Not appearing in class-to-be-assigned list; 2 stale booking courses; 3 Xero-unreconciled payments.

Root cause (evidence from live DB)

- Booking 83 (Mai Lan Chu): CONFIRMED, confirmed = true, amountPaid = EUR 2,629.80, amountOpen = EUR 0
- Booking Course 89 (Morning IELTS, booking 83): ended 2026-05-22 — 88 days stale, active = true
- Booking Course 90 (Private Lessons, booking 83): ended 2026-05-22 — 88 days stale, active = true
- 3 payments all xeroPaymentId = null:
  - Payment 27: EUR 2,135.00, Bank Transfer, 2024-03-19 (likely from prior booking period)
  - Payment 17019: EUR 250.00, Stripe, 2026-02-12
  - Payment 17002: EUR 2,629.80, TransferMate, 2026-04-08
  - Sum: EUR 5,014.80 vs amountPaid EUR 2,629.80 — EUR 2,385 gap (Payment 27 likely legacy)

Fix recipe (NOT YET RUN)

Step 1 — Check SCAs before deactivating:
  SELECT COUNT(*) FROM "StudentClassAssignment" WHERE "bookingCourseId" IN (89, 90);

Step 2 — Deactivate Booking Course 89:
  UPDATE "BookingCourse" SET active = false, "updatedAt" = NOW() WHERE id = 89;

Step 3 — Deactivate Booking Course 90:
  UPDATE "BookingCourse" SET active = false, "updatedAt" = NOW() WHERE id = 90;

Step 4 — Investigate EUR 2,385 gap:
  - Payment 27 (EUR 2,135, Bank, Mar 2024): likely from a prior booking period — verify via Hub fins/
  - If Payment 27 belongs to a different booking, the gap shrinks to approx EUR 250
  - Link all 3 payments to Xero invoices via Hub fins/ or Xero UI

Step 5 — Verify:
  SELECT id, name, end_date, active FROM "BookingCourse" WHERE booking_id = 83;
  SELECT id, amount, xero_payment_id FROM "Payment" WHERE booking_id = 83;

Risk / category
- Bookings + money | Reversible | Blast radius: 1 student
- Stale Booking Courses prevent correct class assignment display
- Xero reconciliation requires accounts team action

Status
Open — fix NOT RUN. Booking Courses 89+90 now 89 days stale. 3 payments Xero-null.
Last checked: 2026-08-19 UTC (17th check)