Issue 24 Alberto Squillace SCA Needed 3 Aug 2026 7th check today

Root cause confirmed 7th check today:
Student returns TOMORROW Tue 4 Aug 2026
BC24686 Morning General Jul20-Sep18 2026: active=true 0 SCAs confirmed fresh
BC1797 Morning General Apr6-Jun26 2026: ended Jun26 still active - 38 days stale
SCA for class 12 week 2026-08-04 still needed

Fix recipe NOT YET RUN:
Step 1: SIS admin > Booking course 24686 > Create SCA class 12 week starting 2026-08-04
Step 2: UPDATE booking_courses SET active=false WHERE id=1797;

Risk: attendance. 1 student. Reversible. URGENT returns Tue 4 Aug.
OPEN. 45th overall 7th today Mon 3 Aug 2026 UTC. Fix NOT RUN.