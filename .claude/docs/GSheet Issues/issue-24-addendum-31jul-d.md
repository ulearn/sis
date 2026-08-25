Issue 24 - Alberto Squillace: Missing SCA + BC Fee Null (6th check 31 Jul 2026)
Student 1052 (Alberto Squillace): visa_status=null, last touched 2026-07-28.
Booking 1611: CONFIRMED, confirmed=true, fully paid EUR 1280.12.
Active BCs:
  BC1797 (Morning General, Apr6-Jun26 2026, fee EUR1836): active=true -- 35d stale -- DEACTIVATE
  BC24686 (Morning General, Jul20-Sep18 2026, fee=null): active=true -- 0 SCAs -- URGENT
Last SCA229: class12, weekEnd Apr26 2026 -- 96 days ago.
Teaching days lost in BC24686: Jul20-31 = 11 days without class assignment.
35 teaching days remain in BC24686 (Aug4-Sep18, excl Aug3 BH).

Fix recipe - NOT YET RUN (URGENT - student actively attending):
1. Deactivate stale BC1797: UPDATE booking_courses SET active = false WHERE id = 1797;
2. Set BC24686 fee (check HubSpot deal for agreed amount):
   UPDATE booking_courses SET fee = <agreed_fee> WHERE id = 24686;
3. Create SCA -- class12 assumed (last assigned), confirm with Paul:
   INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end, created_at) VALUES (24686, 1052, 12, '2026-07-20', '2026-09-18', NOW());
   (Or start from Aug 4 if retrospective attendance not needed)
4. Optional: UPDATE students SET visa_status = 'Approved' WHERE id = 1052;
Retrospective attendance Jul20-31: Paul to enter manually if needed once SCA created.
Risk: class assignments (urgent). Reversible. Blast radius: 1 student.
Last checked: 2026-07-31 UTC (6th check). 11d lost, 35d remain in BC24686.