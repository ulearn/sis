Issue 1 - Orphan Payments / Incomplete Bookings (Addendum 9 Aug g)

Reporter: NM
Area: Cleanup
Sheet row: 2
Last checked: 2026-08-09 UTC (205th hourly check)

SYMPTOM
Orphan payments (booking_id=null). Two confirmed bookings have confirmed=false. Two stale BCs remain active.

ROOT CAUSE confirmed 9 Aug 2026 (unchanged from 204th check)

Orphan payments:
- Payment 4781: EUR 380, Flywire, 20 Aug 2019 (~2,549 days orphaned)
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 (~104 days orphaned)
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 (~104 days orphaned)
- Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026 (~101 days orphaned)

Incomplete bookings:
- Booking 17856: status=CONFIRMED, confirmed=false, 0 payments linked, amount_open=null
- Booking 17857: status=CONFIRMED, confirmed=false, 0 payments linked, amount_open=null

Stale booking courses:
- BC 24630 (General English AM Plus): active=true, end_date=2026-07-10 -- 31 days stale
- BC 24631 (General English AM Plus): active=true, end_date=2026-07-10 -- 31 days stale

FIX RECIPE - NOT YET RUN

Step 1 -- Link payment 16988 to booking 17856:
SQL: UPDATE payments SET booking_id = 17856 WHERE id = 16988;
SQL: UPDATE bookings SET confirmed = true, amount_open = 0 WHERE id = 17856;

Step 2 -- Link payment 16989 to booking 17857:
SQL: UPDATE payments SET booking_id = 17857 WHERE id = 16989;
SQL: UPDATE bookings SET confirmed = true, amount_open = 0 WHERE id = 17857;

Step 3 -- Deactivate stale booking courses:
SQL: UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 4 -- Payment 4781 (EUR 380, 2019, Flywire):
Ancient migration orphan. Finance review required. May need Xero write-off. Do NOT auto-link.

Step 5 -- Payment 17187 (EUR 6,151, TransferMate Escrow, May 2026):
Large escrow. Confirm with TransferMate/finance whether disbursed. Do not link without Neil approval.

RISK
- Category: money / data-hygiene
- Reversible: yes for Steps 1-3; Steps 4-5 need finance sign-off
- Blast radius: Steps 1-3 affect 2 students + 2 stale BCs

STATUS
Open -- fix NOT RUN (205th check, unchanged). Last checked: 2026-08-09 UTC