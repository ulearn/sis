Issue 10 Addendum 20 Aug 2026 (57th check)
Massimiliano Cameran | Doc Gen/Certs | Sheet row 11

No change from 19 Aug.

Root cause:
- Booking 97 CONFIRMED confirmed=false fully paid EUR 1741 amountOpen=0 (anomaly)
- Booking Course 107 Morning General ended 2026-05-22 90 days stale active=true 1 class assignment
- Booking Course 24793 General English AM ended 2026-06-05 76 days stale active=true 1 class assignment
- Documents on booking 97: doc 63 REVOKED (Invoice), doc 64 ISSUED (Invoice) - no certificate issued

Fix recipe (NOT YET RUN):
1. Set confirmed=true: UPDATE bookings SET confirmed = true WHERE id = 97;
2. Verify SCA on BC 107 is historical, deactivate: UPDATE booking_courses SET active = false WHERE id = 107;
3. Verify SCA on BC 24793 is historical, deactivate: UPDATE booking_courses SET active = false WHERE id = 24793;
4. Generate and issue Certificate of Completion for booking 97 via SIS doc gen UI.

Risk: low (booking flag, historical BCs), medium (certificate). Reversible.
Status: 90 days since BC 107 ended. No certificate. confirmed=false anomaly. Fix pending Neil approval.
Last checked: 2026-08-20 UTC (57th check)