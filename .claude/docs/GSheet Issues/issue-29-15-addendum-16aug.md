Issue 29+15: Saikhantes - booking 18151 student 1001
Root cause (99th check 16 Aug 2026):
- serviceEnd=2026-08-07 EXPIRED (9 days)
- BC 24925 ends 2026-10-02 active=true
- Holiday 2500 ends 2026-08-21 (returns Thu 21 Aug, 5 days)
- SCA 255 weekEnd=2026-07-03 (44 days expired, no SCA for Aug 24)
- Payment 17872 EUR 1339.20 xeroPaymentId=null
Fix (NOT YET RUN):
1. Extend booking 18151 serviceEnd to 2026-10-02 (URGENT before Aug 21)
2. Create SCA: student 1001 class 11 bc 24925 weekStart 2026-08-24 weekEnd 2026-10-02 (URGENT)
3. Reconcile payment 17872 in Xero
Status: Open fix NOT run. 315th run.