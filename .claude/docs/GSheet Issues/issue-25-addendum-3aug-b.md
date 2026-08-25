Issue 25 Uyanga Tungalag Visa Null 0 SCAs 3 Aug 2026 3rd check today

Root cause confirmed 3rd check today:
Day 100 without class assignment (course started 2026-04-27)
Student 917: visa_status=null hubspot_contact_id=null confirmed fresh
BC1613 Academic Year Morning Apr27-Oct30 2026: active=true 0 SCAs confirmed fresh
Payment 17258: EUR 3066 xero_payment_id=null - EUR 661 discrepancy vs booking amount

Fix recipe NOT YET RUN:
Step 1: UPDATE students SET visa_status=Approved WHERE id=917;
Step 2: Backfill hubspot_contact_id from HubSpot for student 917
Step 3: SIS admin > BC1613 > Create SCA for appropriate class
Step 4: Reconcile EUR 661 discrepancy and Xero link for payment 17258

Risk: attendance visa data money. 1 student. Reversible. Day 100.
OPEN. 141st overall 3rd today Mon 3 Aug 2026 UTC. Fix NOT RUN.