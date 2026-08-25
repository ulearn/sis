Issue 1 - Orphan Payments + Stale Booking Courses
Reporter: NM | Area: Cleanup | Sheet row 2 | 213th hourly check Tue 11 Aug 2026 UTC

Symptom
Four payments with booking_id = NULL; two booking courses ended 2026-07-10 still active.

Root cause (live data, 11 Aug 2026 - 213th check)

NEW since 212th check: bookings 17856 + 17857 now show amountPaid = EUR 339.90, amountOpen = null.
Payments 16988, 16989 still have booking_id = NULL - amountPaid was set on the booking records
directly without linking the payment records. This is a partial/manual fix state.
Linking the payments now could double-count if amountPaid is derived from linked payments.
Check schema/logic before running Step 1 below.

Orphan payments (all four still booking_id = null):
- Payment 4781: EUR 380, 2019-08-20, comment ULS771773625/21022 - orphaned
- Payment 16988: EUR 339.90, 2026-04-28 - orphaned; booking 17856 amountPaid already = 339.90
- Payment 16989: EUR 339.90, 2026-04-28 - orphaned; booking 17857 amountPaid already = 339.90
- Payment 17187: EUR 6,151, 2026-05-01, comment ULEARNP2026124 - orphaned

Booking anomalies (new: amountPaid now set):
- Booking 17856 (Margherita Galbusera): CONFIRMED, confirmed = false, amountPaid = 339.90, amountOpen = null, amountTotal = 339.90
- Booking 17857 (Francesca Fassina): CONFIRMED, confirmed = false, amountPaid = 339.90, amountOpen = null, amountTotal = 339.90

Stale booking courses:
- BC 24630 (General English AM Plus, booking 17856): ended 2026-07-10, active = true - 32 days stale
- BC 24631 (General English AM Plus, booking 17857): ended 2026-07-10, active = true - 32 days stale

Fix recipe - NOT YET RUN

Step 0 - Determine if amountPaid is stored or derived:
  SELECT b.id, b.amount_paid, SUM(p.amount) AS linked_sum
  FROM bookings b LEFT JOIN payments p ON p.booking_id = b.id
  WHERE b.id IN (17856, 17857) GROUP BY b.id, b.amount_paid;
  If linked_sum is null while amount_paid = 339.90, field is stored separately.
  If derived, skip Step 1 - linking would double-count.

Step 1 - Link payments to bookings (only if amountPaid is stored, not derived):
  UPDATE payments SET booking_id = 17856 WHERE id = 16988;
  UPDATE payments SET booking_id = 17857 WHERE id = 16989;
  Verify student names match before running.

Step 2 - Fix confirmed flags:
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857) AND status = CONFIRMED;

Step 3 - Deactivate stale booking courses:
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 4 - Payment 17187 (EUR 6,151, txn ULEARNP2026124): manual investigation required.
  Match via HubSpot deal with TransferMate reference ULEARNP2026124.

Step 5 - Payment 4781 (EUR 380, 2019, Flywire txn ULS771773625/21022): legacy orphan.
  Low priority. Investigate if Xero cleanup desired.

Risk
Category: financial + data-hygiene | Reversible: yes (with backups) | Blast radius: low
Caution: Step 1 could double-count amountPaid if derived from linked payments - verify Step 0 first.

Status
213th check - NEW: amountPaid now set on bookings 17856+17857 (absent in 212th check).
Payments still orphaned. BCs still stale. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC
