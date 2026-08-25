Issue 39 -- Xuezhen Huang (addendum Sat 25 Jul 2026 UTC, 90th hourly run)

Sheet row: 41 | Area: Booking / Accomm | Reporter: KC

Symptom
Student paid for 3 weeks accommodation in Host Family + Morning General course, does not appear in class-to-be-assigned view.

Current DB state (Sat 25 Jul 2026 UTC -- unchanged)
- Student 14443 Xuezhen Huang: visaStatus = null (last DB update Jul 17 -- 8 days ago)
- Booking 17831: CONFIRMED, confirmed=true, amountPaid=EUR 1396.90 (fully paid)
- Booking course 24609: Morning General, Jul 13 to Jul 31, active=true, fee=EUR 570
- Booking accommodation 11358: Jul 12 to Aug 2, bedId=180 (host family confirmed), fee=EUR 900
 - Class assignments: 0 -- student has never been assigned a class

School day count (today Sat Jul 25)
- Missed: 10 days (weeks Jul 13 and Jul 20 -- irrecoverable)
- Remaining: 5 days -- Mon Jul 27, Tue Jul 28, Wed Jul 29, Thu Jul 30, Fri Jul 31
- Monday Jul 27 is the FINAL window to assign her. Course ends Fri Jul 31.

Root cause
visaStatus = null blocks the class-to-be-assigned view. Student is physically present (bed 180 confirmed since Jul 12) but has never attended a class.

Fix recipe (NOT YET RUN)

Step 1 -- Set visaStatus for student 14443
Go to SIS admin: Student 14443 -> Personal Details -> Visa Status -> Approved -> Save.
SQL (NOT YET RUN):
  UPDATE "Student" SET "visaStatus" = 'APPROVED' WHERE id = 14443;

Step 2 -- Assign to Morning General class via SIS UI
Booking 17831 -> Courses -> BC 24609 (Morning General Jul 13-31) -> Class Assignment -> assign from wb Mon Jul 27.

Risk / category
CRITICAL. Course ends Fri Jul 31. 10 school days permanently missed; 5 remain. Category: bookings. Reversible.

Status
OPEN -- unchanged 8 days. Mon Jul 27 is the last effective action window.

Last checked: Sat 25 Jul 2026 UTC (90th hourly run)
