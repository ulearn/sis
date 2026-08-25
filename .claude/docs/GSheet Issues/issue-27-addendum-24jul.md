Issue 27 - Sofiia Korkishchenko - Cancelled Booking Anomalies - Addendum 24 Jul 2026
Sheet row: 28 | Check: 31st (Fri 24 Jul 2026 UTC)
Status: UNCHANGED - void deadline now 93 days away (25 Oct 2026).
Evidence:
- Booking 17909: CANCELLED but confirmed=true; amountPaid=0, amountTotal=727.50; last updated 17 Jun
- Zero payments on bk17909 (pmts 17477+17478 deleted 17 Jun 2026)
- Doc 94 (LOA v2): ISSUED - should be revoked
- BC 24693 (Renewal AY PM, 25 May - 13 Nov 2026): active=true on cancelled booking
- HubSpot Commerce pmt 1230788330738 (EUR 727.50): NOT voided, deadline 25 Oct 2026 (93d)
Fix Recipe (NOT YET RUN):
1. UPDATE DocumentRecord SET status='REVOKED' WHERE id=94
2. UPDATE BookingCourse SET active=false WHERE id=24693
3. Void HubSpot Commerce payment 1230788330738 before 25 Oct 2026
4. (optional) UPDATE Booking SET confirmed=false WHERE id=17909
Risk: Medium - HubSpot void irreversible. DB changes reversible.
Last checked: Fri 24 Jul 2026 UTC