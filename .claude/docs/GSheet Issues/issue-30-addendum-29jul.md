Issue 30 - Giulia Avallone BC104 Stale + PMT17102 Xero Null (110th check, 29 Jul 2026)
Reporter: PG | Area: Bookings / Accounts | Sheet row: 31

Root cause (live check Wed 29 Jul 2026 UTC)
- Booking course 104 (Morning General Plus, ended 26 Jun 2026): active=true -- 33 days stale
- Payment 17102 (EUR 1151.50, booking 94, Giulia Avallone): xeroPaymentId=null, type=null -- 85 days old (created 5 May 2026)
- Both fixes still pending, unchanged

Fix recipe (NOT YET RUN)
1. Deactivate stale BC: UPDATE BookingCourse SET active=false, updatedAt=NOW() WHERE id=104;
2. Find Xero payment via Hub: ssh hub@localhost
   node /home/hub/web/hub.ulearnschool.com/public_html/fins/find-payment.js 17102
   Then: UPDATE Payment SET xeroPaymentId=<xeroId>, type=Bank, updatedAt=NOW() WHERE id=17102;

Risk: Accounts/Bookings - medium for payment link (EUR 1151.50); low for BC deactivation. Reversible.
Status: Unchanged - Fix NOT RUN.
Last checked: 2026-07-29 UTC