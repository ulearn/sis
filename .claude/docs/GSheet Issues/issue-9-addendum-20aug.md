Issue 9 Addendum 20 Aug 2026 (71st check)
Suvderdene Bayartsog | Doc Gen/Certs | Sheet row 10

No change from 19 Aug.

Root cause:
- Booking 1498 CONFIRMED confirmed=false amountPaid=null no payments recorded
- Document 171 DRAFT version 1 created 2026-06-05 76 days unissued template 82
- Booking Course 1660 ended 2026-06-05 76 days stale active=true 0 class assignments

Fix recipe (NOT YET RUN):
1. Check payments: SELECT * FROM payments WHERE booking_id = 1498;
2. If paid: UPDATE bookings SET confirmed = true WHERE id = 1498;
3. Delete draft 171 and regenerate cert via SIS doc gen UI.
4. Deactivate BC 1660: UPDATE booking_courses SET active = false WHERE id = 1660;

Risk: medium (docs), low (booking flag). No payments - confirm before acting. Reversible.
Status: 76 days unissued, no payments on booking 1498. Fix pending Neil approval.
Last checked: 2026-08-20 UTC (71st check)