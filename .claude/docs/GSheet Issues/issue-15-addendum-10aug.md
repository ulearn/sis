Issue 15 - Saikhantes Shagdarsuren (service_end expired)
Root Cause (Mon 10 Aug 2026 - 91st check)
- Booking 18151: CONFIRMED, EUR 1,339.20 paid, EUR 0 open
- service_end = 2026-08-07 - 3 days expired; correct = 2026-10-02
- BC 24925 (Academic Year Afternoon, 9 Mar to 2 Oct 2026): active - 53 days remaining
- Stale service_end may block portal access for active student
Fix: UPDATE Booking SET service_end = 2026-10-02 WHERE id = 18151; (NOT YET RUN)
Risk: data-hygiene, reversible. Last checked: 2026-08-10 UTC
