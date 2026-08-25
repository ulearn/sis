Issue 48 - Telmuun Enkhsaikhan, BC 1810 No Class Assignment (97th check, 12 Aug 2026)

Reporter: AC | Sheet row: 50

Root cause:
- BC 1810 (Academic Year Renewal Morning, student 293): ends 1 Jan 2027, active, 0 CAs - 47 days
- Booking 1624: PARTIAL, confirmed=false, amountPaid EUR 1406, amountOpen EUR 250
- Only payment: 17956 (EUR 100, 31 Mar 2026), xeroId=null - EUR 1306 gap = Fidelo migration artefact
- Stale legacy BCs active: 482, 483, 1609, 1610, 1611, 1612

Fix recipe (NOT YET RUN):
Step 1: INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end) VALUES (1810, CLASS_ID, '2026-08-11', '2026-08-14');
Step 2: UPDATE booking_courses SET active = false WHERE id IN (482, 483, 1609, 1610, 1611, 1612);
Step 3: Accounts to verify EUR 1306 Fidelo gap before marking paid.

Risk: bookings/attendance/data-hygiene | Reversible: yes

Status: Open - 0 SCAs 47d; EUR 250 open; stale BCs unchanged. Last checked: 2026-08-12 UTC (97th check)