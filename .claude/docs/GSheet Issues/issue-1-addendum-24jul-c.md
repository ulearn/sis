Issue 1 — Orphan Payments — Addendum 24 Jul 2026 C
Reporter: NM | Area: Cleanup | Sheet row: 2

Symptom
Payments with bookingId = null (not linked to any booking).

Root cause (56th hourly check, 150th total — Fri 24 Jul 2026 UTC):
- Payment 16988: EUR 339.90, Bank, bookingId = null, fideloId = null, xeroId = null — 87 days
- Payment 16989: EUR 339.90, Bank, bookingId = null, fideloId = null, xeroId = null — 87 days
- Payment 17187: EUR 6,151, TransferMate Escrow, bookingId = null, fideloId = 37587, transactionId = D2026226 — 84 days
- Payment 4781: EUR 380, Flywire, Aug 2019, fideloId = 32056 — permanently unresolvable
- Stale booking courses: 24,436 — UNCHANGED
- Stale booking accommodations with beds: 43 — UNCHANGED
All items unchanged.

Fix recipe — NOT YET RUN

Step 1: Link payments 16988 + 16989
Check with accounts: EUR 339.90 x2 Bank payments from ~28 Apr 2026.
Identify the student booking they belong to (likely same student, two instalments).
Update bookingId on both payments once identified.

Step 2: Investigate fideloPaymentId 37587 (payment 17187)
EUR 6,151 TransferMate Escrow, fideloId = 37587, transactionId = D2026226.
Check Hub fins/ or Fidelo records for fideloPaymentId 37587 to identify the booking.

Step 3: Write off payment 4781
EUR 380 Flywire from Aug 2019, fideloId = 32056 — permanently unresolvable.
Consider writing off or archiving this record.

Risk / Category
- Category: Accounts — orphan payment linkage
- Reversible: Yes (bookingId update is reversible)
- Blast radius: 4 payments; EUR 7,210.80 total if all linked
- Urgency: Low-medium (87 days, but accounts need clean records)

Status: NOT YET RUN.
Last checked: Fri 24 Jul 2026 UTC (56th issue check, 150th total hourly run)