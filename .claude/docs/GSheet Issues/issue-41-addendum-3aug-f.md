Issue 41 Giampaolo Russo Dual Accommodation 3 Aug 2026 10th check

Root cause confirmed 10th check today:
Booking 18180 (student 14571): CONFIRMED EUR 2584.96 paid EUR 0 open
BC24956 Gen Eng AM 2026-08-03 to 2026-09-11: active=true 0 SCAs - unshunted
BA11357 Host Family 2026-08-02 to 2026-09-06: active=true
Capel Street BA Sep6-Sep14: NOT YET CREATED
BH shunt (Issue 38) must run first to push BC24956 start from Aug3 to Aug4

Fix recipe NOT YET RUN:
Step 0: Run Issue 38 BH shunt (pushes BC24956 start_date Aug3->Aug4)
Step 1: SIS admin > Booking 18180 > BC24956 > Assign class week 2026-08-04
Step 2: SIS admin > Booking 18180 > Add Accommodation Type Apartment 2026-09-06 to 2026-09-14 Capel Street
Step 3: Issue invoice/LOA for booking 18180 if not yet done

Risk: bookings accommodation documents. 1 student. Reversible. Blast radius low.
OPEN. 74th overall 10th today Mon 3 Aug 2026 UTC. First class Tue 4 Aug. Fix NOT RUN.