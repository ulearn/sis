# Issue 1 — Orphan Payments (Addendum 24 Aug 2026)

**Reporter:** NM | **Area:** Cleanup | **Sheet row:** 2 | **Run:** 496th (Mon 24 Aug 2026 UTC)

## Symptom
5 payments with no bookingId. Total EUR 7,710.80. Unchanged since 22 Aug.

## Root Cause — Current State

| Payment | Amount | Method | Date | Note |
|---------|--------|--------|------|------|
| P16988 | EUR 339.90 | Bank | 28 Apr 2026 | Linkable to booking 17856 (Margherita Galbusera) |
| P16989 | EUR 339.90 | Bank | 28 Apr 2026 | Linkable to booking 17857 (Francesca Fassina) |
| P17187 | EUR 6,151.00 | TransferMate Escrow | 1 May 2026 | transactionId=D2026226, ref ULEARNP2026124 |
| P18122 | EUR 250.00 | Card | 23 Aug 2026 | dataSource=HUBSPOT; clearance deposit via HubSpot link |
| P18123 | EUR 250.00 | Card | 23 Aug 2026 | dataSource=HUBSPOT; clearance deposit, 56-min gap = 2 students |

P18122/P18123 confirmed dataSource=HUBSPOT. No paidBy or comment set. Check HubSpot Commerce to identify students.

## Fix Recipe (NOT YET RUN)

Link P16988 to booking 17856, P16989 to booking 17857 (verify students first).
Identify P18122/P18123: HubSpot > Commerce > Payments > 23 Aug 2026 > EUR 250.
Investigate P17187: Hub fins/ for TransferMate D2026226 / ULEARNP2026124.
Deactivate BCs 24630 + 24631 if still active.

## Risk / Category
data-hygiene / accounts | reversible | blast radius: low

## Status
Open — fix NOT RUN. Last checked: 24 Aug 2026 UTC (496th run).