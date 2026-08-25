# Issue 18 -- Flavia Nascimento Mariano (addendum Sat 25 Jul 2026 UTC, 90th hourly run)

Sheet row: 19 | Area: Visa | Reporter: PG

Symptom
Visa status shows pending, student not appearing in class-to-be-assigned view.

NEW FINDING (Sat 25 Jul 2026) -- SCAs now detected with corrected query
Previous checks reported 0 SCAs due to a field-name bug (used startDate/endDate; correct fields are weekStart/weekEnd).
With corrected query:
- SCA 256: classId=9, weekStart Jun 1, weekEnd Jun 14 2026 (expired -- covered first 2 weeks)
- SCA 265: classId=11, weekStart Jun 15, weekEnd Nov 20 2026 (ACTIVE -- covers today through course end)

Flavia IS assigned to class 11. She is NOT missing from class. The to-be-assigned issue is operationally resolved.

Current DB state (Sat 25 Jul 2026 UTC)
- Student 983 Flavia Nascimento Mariano: visaStatus = null (last DB update Jul 14 -- 11 days ago)
- HubSpot contact ID: 783659478249
- Booking 1534: CONFIRMED, amountPaid=EUR 1308, amountOpen=0 (fully paid)
- Booking course 1710: Academic Year Afternoon, Jun 1 to Nov 20, active=true
- Class assignments: SCA 256 (classId=9, Jun 1-14) + SCA 265 (classId=11, Jun 15-Nov 20 ACTIVE)

Remaining issue
visaStatus = null (11 days). No longer blocking class attendance. May affect attendance compliance reports and student portal visa display.

Fix recipe (NOT YET RUN)

Step 1 -- Confirm actual visa status
Check HubSpot contact 783659478249. Flavia is Brazilian -- non-EEA, likely requires D-Study visa.

Step 2 -- Set visaStatus once confirmed
Via SIS admin: Student 983 -> Personal Details -> Visa Status -> [status] -> Save
SQL (NOT YET RUN -- confirm actual status first): UPDATE "Student" SET "visaStatus" = 'APPROVED' WHERE id = 983;

Risk / category
Low. Category: data-hygiene. Reversible. Urgency reduced -- she is already attending class.

Status
OPEN (low priority) -- visa null 11 days. Class assignment issue RESOLVED (SCA 265 active Jun 15-Nov 20). Only visa backfill remains.

Last checked: Sat 25 Jul 2026 UTC (90th hourly run)