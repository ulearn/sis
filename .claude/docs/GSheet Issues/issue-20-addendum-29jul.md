Issue 20 - Ariunsarnai Batbayar Booking PENDING Day 114 (61st check, 29 Jul 2026)
Reporter: AC | Area: Booking / Accounts | Sheet row: 21

Root cause (live check Wed 29 Jul 2026 UTC)
- Booking 1605 (student 1047 Ariunsarnai Batbayar): status=PENDING, confirmed=false -- Day 114 since 6 Apr 2026
- Amount paid=EUR 0; amount open=EUR 1509 -- no payments recorded on booking
- No class assignments for student 1047
- Last booking update: 23 Jun 2026 12:06 UTC -- 36 days without any change
- Likely scenario: dropout or payment via channel not recorded in SIS

Fix recipe (NOT YET RUN)
1. Check HubSpot deal linked to booking 1605 -- WON or LOST?
2. Check Hub/Xero/TransferMate for any payment from Ariunsarnai Batbayar (Apr-Jun 2026)
3. If dropped out: UPDATE Booking SET status=CANCELLED, updatedAt=NOW() WHERE id=1605;
4. If payment exists but unlinked: see issue-20-ariunsarnai-payment-due.md for context

Risk: Money/Bookings - medium (EUR 1509 unrecorded); verify HubSpot/Xero before action. Reversible.
Status: Unchanged - Fix NOT RUN.
Last checked: 2026-07-29 UTC