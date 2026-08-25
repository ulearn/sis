# Issue 25 - Uyanga Tungalag Visa+SCA (142nd check Mon 3 Aug 2026 UTC, 4th today) -- Day 98 corrected
Reporter: ST | Area: Visa/Class | Sheet row: 26

Root Cause (fresh + correction):
- Student 917 (Uyanga Tungalag): visa_status=null, hubspot_contact_id=null
- BC 1613 (AY Morning, Apr 27-Oct 30 2026): active=true, 0 SCAs -- Day 98 without SCA
- Day count correction: previous H said Day 100; recalculated Apr 27 to Aug 3 = 3+31+30+31+3 = 98 days
- Payment 17258: EUR 3,066, xero_payment_id=null -- EUR 661 discrepancy vs booking total

Fix Recipe (NOT YET RUN):
Step 1: Confirm visa_status enum: SELECT DISTINCT visa_status FROM students WHERE visa_status IS NOT NULL LIMIT 5;
Step 2: UPDATE students SET visa_status='Approved',updated_at=NOW() WHERE id=917;
Step 3: Find HubSpot contact ID: SELECT email FROM students WHERE id=917; then search HubSpot contacts API
Step 4: UPDATE students SET hubspot_contact_id=<id> WHERE id=917;
Step 5: INSERT INTO student_class_assignments (booking_course_id,student_id,class_id,week_start,week_end) VALUES (1613,917,<class_id>,'2026-08-04','2026-10-30');
Step 6: Investigate EUR 661 gap: SELECT SUM(amount) FROM payments WHERE booking_id IN (SELECT id FROM bookings WHERE student_id=917);

Risk: bookings/class/visa | Reversible: yes | Blast: student 917
Status: 142nd check. Day 98 (corrected from 100). visa=null. 0 SCAs. EUR661 discrepancy. Fix NOT RUN. Last checked: 2026-08-03 UTC
