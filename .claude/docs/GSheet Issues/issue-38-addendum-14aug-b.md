Issue 38 - Eduardo Roche Diaz (course ended, cert DRAFT, 0 SCAs)
Reporter: various | Area: Holidays, Bookings | Sheet row: 40

Symptom
Eduardo Roche Diaz (Booking 18265, Booking Course 25043) never assigned to a class. Course ended 2026-08-14 (today) with 0 class assignments. Certificate document 566 created 2026-08-13 is stuck in DRAFT with no attendance data.

Root cause (verified 14 Aug 2026 UTC, 161st check)
- Booking Course 25043 (General English PM): start 2026-08-10, end 2026-08-14, active = true, 0 class assignments
- Booking 18265 (Eduardo Roche Diaz, student ID 14602): CONFIRMED, confirmed = true, amount paid = EUR 126
- Certificate document 566 (documentType = certificate): status = DRAFT, created 2026-08-13, issuedAt = null
- 0 class assignments means document generator has no attendance data - cert cannot be issued
- 5 school days permanently lost without retroactive fix: Mon 10 Aug to Fri 14 Aug
- Appropriate class for Eduardo (level B2): class ID 6 (B2&C1 PM, 13:45-17:00)

Fix recipe (NOT YET RUN)

Step 1 - Create retroactive class assignment:
  INSERT INTO StudentClassAssignment (class_id, booking_course_id, week_start, week_end, created_at, updated_at)
  VALUES (6, 25043, '2026-08-10', '2026-08-14', NOW(), NOW());
  Verify Eduardo actual presence with Paul or class teacher before inserting.

Step 2 - Deactivate ended Booking Course:
  UPDATE BookingCourse SET active = false, updated_at = NOW() WHERE id = 25043;

Step 3 - Regenerate and issue Certificate document 566:
  After SCA exists, regenerate doc 566 via SIS doc UI (Admin > Documents > Booking 18265).
  Or via DB: UPDATE DocumentRecord SET status = ISSUED, issued_at = NOW(), updated_at = NOW() WHERE id = 566;

Risk / category
- Category: bookings / attendance / documents; reversible; blast radius: 1 student, 1 document
- Without the retroactive SCA the certificate can never show attendance

Status: OPEN - course ended today. Fix NOT YET RUN.
Last checked: 2026-08-14 UTC (161st check)