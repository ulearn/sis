Issue 1 - Orphan Payments + Stale Records (Addendum 22 Jul 2026 H)
Reporter: NM | Area: Cleanup | Sheet row: 2

Root cause (43rd hourly check, Wed 22 Jul 2026 UTC, 99th total):
- Payment 16988 (EUR 339.90, Bank, 28 Apr 2026): bookingId=null, xeroPaymentId=null — 86 days
- Payment 16989 (EUR 339.90, Bank, 28 Apr 2026): bookingId=null, xeroPaymentId=null — 86 days
- Payment 17187 (EUR 6151, TransferMate Escrow, 1 May 2026): bookingId=null — 83 days
- Payment 4781 (EUR 380, Flywire, Aug 2019): FIDELO legacy — permanently unresolvable
- Stale booking courses: 24,436 (active=true, end_date before 22 Jul 2026) — UNCHANGED
- Stale booking accommodations: 11,175 (active=true, end_date before 22 Jul 2026) — UNCHANGED
All UNCHANGED. Fix NOT RUN.

Fix recipe (NOT YET RUN):
See master: issue-1-orphan-payments.md
Orphan pmts: UPDATE payments SET booking_id = <id> WHERE id IN (16988,16989,17187);
Stale BCs: UPDATE booking_courses SET active=false WHERE active=true AND end_date < 2026-07-22; (24,436 rows)
Stale BAs: UPDATE booking_accommodations SET active=false WHERE active=true AND end_date < 2026-07-22; (11,175 rows)

Status: UNCHANGED. Last checked: Wed 22 Jul 2026 UTC (43rd hourly, 99th total).