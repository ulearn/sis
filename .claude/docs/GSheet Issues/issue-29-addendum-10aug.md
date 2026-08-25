Issue 29 and 15 - Saikhantes Shagdarsuren (service_end + migration SCA)
Root Cause (Mon 10 Aug 2026 - 70th check)
- Booking 18151: CONFIRMED, EUR 1,339.20 paid, EUR 0 open
- service_end = 2026-08-07 - 3 days expired; correct = 2026-10-02 (BC 24925 ends Oct 2)
- SCA 255: class 11, week_start 12 Jan 2026 - predates course start 9 Mar by 56d (migration artefact)
- Payment 17872: EUR 1,339.20, Dec 2025 - xeroPaymentId null
Fix: UPDATE Booking SET service_end = 2026-10-02 WHERE id = 18151; (NOT YET RUN)
Xero: reconcile payment 17872. Last checked: 2026-08-10 UTC
