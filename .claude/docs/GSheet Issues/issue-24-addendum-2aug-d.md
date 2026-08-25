Issue 24 Alberto Squillace BC Fee + SCA
Reporter: pg Row 25 Check 27th (7th today Sun 2 Aug UTC)

Symptom: Migration student split two courses. BC 24686 fee=null. No SCA since Apr 6. Returns Tue Aug 4.

Root Cause (27th check 02 Aug 2026):
- BC 1797 (Morning General Apr 6-Jun 26 2026): active=true ended 37 days ago. SCA id=229 class 12 week Apr 6.
- BC 24686 (Morning General Jul 20-Sep 18 2026): active=true fee=null 0 SCAs (99 days stale).
- Student returns Tue Aug 4 after bank holiday.

Fix Recipe (NOT YET RUN):
1. Check booking 1611: SELECT amount_paid, amount_open FROM bookings WHERE id=1611;
2. Set fee: UPDATE booking_courses SET fee=<correct_fee> WHERE id=24686;
3. Create SCA week Aug 4: INSERT INTO student_class_assignments (booking_course_id, class_id, week_start) VALUES (24686, <class_id>, 2026-08-04);
   Use class 12 if same level as BC 1797 or confirm with AC.
4. Deactivate stale BC 1797: UPDATE booking_courses SET active=false WHERE id=1797;

Risk: Bookings + class. Reversible. 1 student. Urgent: returns Tue Aug 4.

Status: UNRESOLVED Fix NOT RUN
Last checked: 2026-08-02 UTC