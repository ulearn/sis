62nd check Tue 25 Aug 2026 UTC
Booking 97 (Massimiliano Cameran, student 91): CONFIRMED, confirmed=false, paid EUR 1741, open EUR 0 (anomaly)
BC 107 (Morning General): ended 22 May 2026 = 95d stale, active=true, 1 SCA (SCA 235)
No Certificate of Completion (docs 63 REVOKED, 64 ISSUED = invoices only)
Fix NOT RUN
Fix: UPDATE bookings SET confirmed=true WHERE id=97; verify SCA 235; UPDATE booking_courses SET active=false WHERE id=107; generate cert.
Last checked: 2026-08-25 UTC