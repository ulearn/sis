## Issue 24 -- Alberto Squillace -- No Class Assignment, Visa Null, Fee Null (150th check 2026-07-30)
Reporter: PG | Area: booking | Sheet row: 25
Last checked: 2026-07-30 UTC (150th check)

### Root cause (live DB, 2026-07-30)
- Student 1052 Alberto Squillace: visa_status=null; last updated 2026-07-28; HubSpot contact 740892067018
- BC 24686 Morning General: start 2026-07-20, end 2026-09-18, active=true, fee=null
- Student class assignments for BC 24686: zero (no class assigned since course started)
- Teaching days lost as of end of Jul 30: 9 days (Jul 20-24, Jul 27-30)
- Booking 1611: CONFIRMED, confirmed=true, paid EUR 1280.12, amount_open=0 -- fully paid
- Calendar days remaining to Sep 18: 50

### Fix recipe (NOT YET RUN)
Step 1: Check HubSpot contact 740892067018 -- confirm visa status and course fee.

Step 2: Set BC fee:
UPDATE booking_courses SET fee=<CORRECT_FEE>, updated_at=NOW() WHERE id=24686;
  -- Replace <CORRECT_FEE> with amount from HubSpot. Expect 1 row.

Step 3: Set visa_status if applicable:
UPDATE students SET visa_status='approved', updated_at=NOW() WHERE id=1052;
  -- Use value from HubSpot.

Step 4: Create class assignment (confirm correct class_id first):
INSERT INTO student_class_assignments
  (booking_course_id, class_id, week_start, week_end, student_id, created_at)
VALUES (24686, <CLASS_ID>, '2026-07-20', '2026-09-18', 1052, NOW());
  -- Replace <CLASS_ID> with correct class. Expect 1 row.

Verify: SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE booking_course_id=24686;

### Risk
Category: bookings, data-hygiene. Reversible. Blast radius: 1 BC + 1 student + 1 SCA. Urgent: 9 teaching days lost.

### Status
NOT YET RUN. Last checked: 2026-07-30 UTC (150th check). 9 teaching days lost; 50 days remaining.