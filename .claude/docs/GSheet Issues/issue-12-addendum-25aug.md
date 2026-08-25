196th check Tue 25 Aug 2026 UTC
SCA 288 (class 12): linked to BC 24697, week_end 2026-12-18 (140d past BC end)
BC 24697 (Academic Year Morning, ILEP 0318/0020): ended 31 Jul 2026 = 25d stale, active=true
BC 25035 (General English Academic Year AM Plus): ends 8 Jan 2027, active=true, 0 SCAs
Rakan unclassed since 3 Aug 2026 = 22 days
Fix NOT RUN
Fix: UPDATE student_class_assignments SET week_end=2026-07-31 WHERE id=288; UPDATE booking_courses SET active=false WHERE id=24697; INSERT SCA (class 12, BC 25035, 2026-08-03 to 2027-01-08).
Last checked: 2026-08-25 UTC