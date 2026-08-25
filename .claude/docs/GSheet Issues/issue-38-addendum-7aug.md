Issue 38 - Class Assignment Urgency: Mon 10 Aug 2026 Starters (50th check)
Reporter: PG | Area: Bookings | Sheet row: 40

Status Update: Fri 7 Aug 2026 UTC (50th check)
All 17 Booking Courses starting Mon 10 Aug 2026 have 0 class assignments. Assign TODAY.
Note: Original issue 38 is a UX/code enhancement (date picker). See issue-38-course-date-ux.md.

13 Ready for Assignment (CONFIRMED + confirmed=true)
BC 108   | Intensive General 30     | Lucia Borroni (student 92)
BC 109   | Morning General          | Maicol Moretti (student 93)
BC 1313  | Academic Year Afternoon  | Ana Luiza De Sousa (student 744)
BC 1818  | Academic Year Morning    | Natanael Reis Lourenco de Sales (student 1071)
BC 24915 | Academic Year Morning    | Toshimi Hanakawa (student 877)
BC 24970 | Academic Year Afternoon  | Tsengelbayar Mendsaikhan (student 948)
BC 25004 | General English AM Plus  | Vincenzo Contu (student 14597)
BC 25005 | General English AM       | Claudia Mereu (student 14598)
BC 25024 | General English PM       | Josimar Roberto (student 14612)
BC 25027 | Academic Year Morning    | Jacqueline Burgos (student 14614)
BC 25031 | Academic Year Morning    | Brisia Garcia Roman (student 14617)
BC 25036 | General English AM       | Jorge Perez Aldana (student 14619)
BC 25039 | General English PM Plus  | Cristian Ravai (student 17)

4 NOT Ready (cannot assign)
BC 96    | Intensive General 30     | Alessandro Signorotti (82) | CONFIRMED but confirmed=false - investigate
BC 833   | Academic Year Morning    | Settiyanee Duangjai (400)  | ESCROW - payment not cleared
BC 25007 | Academic Year Morning    | Nominjin Amartsogt (759)   | PARTIAL - partial payment
BC 25042 | General English AM       | Edith Nunes (1015)         | PENDING - no payment

Fix Recipe (NOT YET RUN)
Step 1: Assign 13 ready students via SIS Admin > each booking > Assign to Class, week starting 2026-08-10.
Step 2: BC 96 anomaly - check booking confirmed status:
  SELECT b.id, b.status, b.confirmed, b.amount_paid FROM bookings b JOIN booking_courses bc ON bc.booking_id=b.id WHERE bc.id=96;
  If paid: UPDATE bookings SET confirmed=true WHERE id = (SELECT booking_id FROM booking_courses WHERE id=96);
Step 3: Coordinate with finance on ESCROW/PARTIAL/PENDING before Monday.

Risk: operational | class assignment via admin UI is safe | students start Mon 10 Aug - URGENT.
Status: Fix NOT RUN. Last checked: Fri 7 Aug 2026 UTC (50th hourly check).