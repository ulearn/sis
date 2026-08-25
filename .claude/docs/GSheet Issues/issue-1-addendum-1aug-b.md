# Issue 1 - Orphan Payments (Various)

Reporter: NM | Area: Cleanup | Sheet row: 2 | Check: 123rd (4th Sat 1 Aug 2026 UTC)

## Symptom
4 payments with booking_id=null from migration cleanup. Unchanged for 96+ days.

## Current State (fresh DB -- 4 orphan payments unchanged)

ID 4781: EUR 380, Flywire, booking_id=null, fidelo=32056 (~7 years old, legacy)
ID 16988: EUR 339.90, Bank, booking_id=null, hubspot_payment_id=1204827374829 (96 days)
ID 16989: EUR 339.90, Bank, booking_id=null, hubspot_payment_id=1204846469317 (96 days)
ID 17187: EUR 6,151, TransferMate Escrow, booking_id=null, fidelo=37587 (93 days)

NEW CROSS-REFERENCE (Sat Aug 1):
Issue 48 bookings 17856 (Galbusera) and 17857 (Fassina) show amount_paid=EUR 339.90
but have ZERO payment records linked. Orphan payments 16988+16989 are exactly EUR 339.90
Bank each. Almost certainly the same payments -- never linked to their bookings.
See Issue 48 recipe (issue-48-addendum-1aug-c.md) for combined fix.

## Fix Recipe (NOT YET RUN)

Payments 16988 + 16989 (likely Galbusera + Fassina -- see Issue 48):
1. Verify HubSpot payment IDs 1204827374829 and 1204846469317 against Galbusera/Fassina.
2. UPDATE payments SET booking_id=17856 WHERE id=16988; (adjust per verification)
   UPDATE payments SET booking_id=17857 WHERE id=16989;

Payment 17187 (TransferMate EUR 6,151, ULEARNP2026124, fidelo 37587):
1. Search TransferMate for ULEARNP2026124 -- identify student.
2. UPDATE payments SET booking_id=<id> WHERE id=17187;

Payment 4781 (Flywire EUR 380, fidelo 32056, legacy ~7yr):
1. Search Fidelo 32056 -- identify student.
2. Low priority; consider write-off comment if no booking found.

## Risk
Category: money, data-hygiene. Reversible: yes.
Connection: fixing 16988+16989 via Issue 48 resolves 2 of 4 orphan payments simultaneously.

## Status
Open -- 123rd check, NOT FIXED. 4 orphan payments (96d/96d/93d/7yr).
Last checked: 2026-08-01 UTC (4th check today)