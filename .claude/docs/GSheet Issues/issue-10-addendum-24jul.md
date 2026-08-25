Issue 10 - Massimiliano Cameran - No Cert on Bk97 - Addendum 24 Jul 2026
Sheet row: 11 | Check: 34th (Fri 24 Jul 2026 UTC)
Status: UNCHANGED - no completion certificate exists for booking 97.
Evidence:
- Booking 97 (student 91): EUR 1741/1741 paid
- BC 107 (Morning General, 27 Apr - 22 May 2026): active=true, 63d stale
- Docs on bk97: doc63 accounts REVOKED, doc64 accounts ISSUED - no cert
- Doc 179 (cert) on renewal bk18002 is OK; original bk97 has no cert
Fix Recipe (NOT YET RUN):
1. UPDATE BookingCourse SET active=false WHERE id=107
2. SIS admin -> Student 91 -> Booking 97 -> Generate Certificate of Completion
Risk: Low. Reversible.
Last checked: Fri 24 Jul 2026 UTC