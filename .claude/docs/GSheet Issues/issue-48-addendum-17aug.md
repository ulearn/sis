Issue 48 - Telmuun Enkhsaikhan / No Class + Payment Gap (Day 49)
Reporter: AC | Area: Attendance / Classes | Sheet row: 50

Symptom: Telmuun not in class to be assigned. BC 1810 active since 29 Jun with 0 SCAs. EUR 250 outstanding.

Root cause (evidence)
- Booking 1624: PARTIAL, confirmed=false, amountPaid=EUR 1406, amountOpen=EUR 250 -- updated 2026-08-05 (12d ago)
- BC 1810 (Academic Year Renewal Morning, 29 Jun 2026 to 1 Jan 2027): active=true, 0 SCAs -- 49 days without class
- Payment 17956: EUR 100 Bank 29 Jun -- only linked payment; amountPaid=1406 is likely migration artefact

Fix recipe -- NOT YET RUN
  Step 1: Verify payment in HubSpot/Xero (read-only -- confirm EUR 1406+ received)

  Step 2: If payment confirmed:
  UPDATE Booking SET confirmed=true WHERE id=1624;

  Step 3: Assign to AM class:
  INSERT INTO StudentClassAssignment (bookingCourseId, classId, weekStart, weekEnd)
    VALUES (1810, CLASS_ID, CURRENT_DATE, 2027-01-01);

  Step 4: Chase EUR 250 balance if not fully paid.

Info needed:
1. Is EUR 250 balance paid in HubSpot/Xero?
2. Which AM class for Telmuun?
Risk: Bookings/class/money -- reversible. Blast radius: student 293 Telmuun Enkhsaikhan.
Status: Open -- fix NOT RUN. 49 days without class.
Last checked: 2026-08-17 UTC (140th check)