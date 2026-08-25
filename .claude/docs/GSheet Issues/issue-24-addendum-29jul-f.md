# Issue 24 — Alberto Squillace — Visa Null (149th check, 29 Jul 2026)
Reporter: PG | Area: Booking | Sheet row: 25

Root cause (149th check, 29 Jul 2026 UTC)
- Student 1052 (Alberto Squillace): visaStatus = null. UNCHANGED.
- BC 24686 (Morning General): Jul 20-Sep 18 2026, active=true, fee=null, zero SCAs.
- 9 teaching days lost since Jul 20. 51 calendar days remaining.
- Payment 17124: EUR 1280.12, Bank Transfer Mar 25 2026, xeroPaymentId = null.
- Stale BC 1797 (Apr 6-Jun 26 2026): active=true, 33 days stale.
- HubSpot contact ID: 740892067018.

Fix recipe — NOT YET RUN
1. Check HubSpot 740892067018 for visa status.
2. UPDATE students SET visa_status='APPROVED', updated_at=NOW() WHERE id=1052;
3. UPDATE booking_courses SET fee=1280.12 WHERE id=24686;
4. Assign BC 24686 to Morning class.
5. UPDATE booking_courses SET active=false WHERE id=1797;
6. Reconcile payment 17124 in Xero.

Status: Open — Fix NOT RUN
Last checked: Wed 29 Jul 2026 UTC (149th check)