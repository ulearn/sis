Issue 1 -- Orphan Payments / Stale Records -- Addendum 24 Jul (e)

Reporter: NM | Area: Cleanup | Sheet row: 2
Checked: Fri 24 Jul 2026 UTC -- 58th hourly check, 154th total run

CURRENT STATUS (unchanged)

Orphan payments (bookingId = null):
- Payment 16988: EUR 339.90, Bank, 28 Apr 2026 -- 87 days orphaned, no fideloId/transactionId
- Payment 16989: EUR 339.90, Bank, 28 Apr 2026 -- 87 days orphaned, no fideloId/transactionId
- Payment 17187: EUR 6,151, TransferMate Escrow, 1 May 2026 -- 84 days orphaned -- fideloPaymentId=37587, transactionId=D2026226, comment=ULEARNP2026124
- Payment 4781: EUR 380, Flywire, 20 Aug 2019 -- fideloPaymentId=32056 -- permanently unresolvable

Stale booking courses (active=true, endDate past): 24,436 (unchanged)
Stale booking accommodations with beds (active=true, endDate past, bedId not null): 43 (unchanged)

FIX RECIPE (NOT YET RUN)

Payments 16988+16989 (EUR 339.90 x2, Bank, 28 Apr):
  Search bank statements / HubSpot for booking ~EUR 680 around late Apr 2026.
  UPDATE payments SET booking_id = <id> WHERE id IN (16988, 16989);

Payment 17187 (EUR 6,151, TransferMate, 1 May):
  Search Fidelo payment 37587 / TransferMate D2026226 / ULEARNP2026124 for associated booking.
  UPDATE payments SET booking_id = <id> WHERE id = 17187;

Payment 4781 (EUR 380, 2019): Write off or archive -- permanently unresolvable.

Stale booking courses:
  -- Preview: SELECT COUNT(*) FROM booking_courses WHERE active=true AND end_date < CURRENT_DATE; => 24,436
  UPDATE booking_courses SET active = false WHERE active = true AND end_date < CURRENT_DATE;

Stale booking accommodations:
  UPDATE booking_accommodations SET active = false
  WHERE active = true AND end_date < CURRENT_DATE AND bed_id IS NOT NULL;
  -- Preview count: 43

RISK
- Category: money (payments) / data-hygiene (stale records)
- Reversible: Yes
- Blast radius: Payments: EUR 6,830.80 unattributed. Stale records: cosmetic.

STATUS
OPEN - Fix NOT Run | Last checked: Fri 24 Jul 2026 UTC
