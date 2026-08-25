Issue 38 — Aug Bank Holiday 2026-08-03 (70th check, 20th on Aug 2)
Sheet row: 40 | Reporter: NM | Area: School Closures

Symptom
Aug Bank Holiday 2026-08-03 absent from school_closures; 21 BCs start Aug 3 with no SCAs.

Root cause (unchanged from 2aug-p)
- school_closures: 9 entries (Good Fridays 2026-2030, Christmas 2026-2029). Aug BH absent.
- 21 active BCs start 2026-08-03, all sca_count = 0.
- BC 25003 (Aleix Cervera Gonzalez bk18225, Aug3-Sep18): duplicate of BC 25002, still active.
- BC 24697 (Rakan bk17915, Academic Year Morning Jul6-Jul31): active=true, ended 2 days ago.
- BC 25035 (Rakan bk17915, General English AY AM Plus Aug3-Dec18): sequential, safe to shunt.
- After removing duplicates: 19 BCs to shunt Aug3 to Aug4.

Status
FIX NOT RUN. Data unchanged from 2aug-p. BH is TOMORROW (Aug 3). Window closes tonight.

Fix recipe (NOT YET RUN)
1. Deactivate BC 24697: UPDATE booking_courses SET active=false WHERE id=24697;
2. Deactivate BC 25003: UPDATE booking_courses SET active=false WHERE id=25003;
3. Insert Aug BH: INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday) VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true);
4. Shunt 19 BCs: UPDATE booking_courses SET start_date='2026-08-04' WHERE start_date='2026-08-03' AND active=true; -- verify count=19 first
5. Create SCAs for all 19 BCs for week starting Tue 4 Aug.

Risk / category
bookings - reversible | blast radius: 19 students first class day

Last checked
2026-08-02 UTC (70th overall, 20th on Aug 2)