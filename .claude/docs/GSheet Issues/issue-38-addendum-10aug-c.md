Issue 38 Addendum 10 Aug 2026 c — Aug-3 Stragglers
Sheet row: 40 | 103rd cron check Mon 10 Aug 2026 UTC

5 BCs started 2026-08-03 still have 0 class assignments after 8 days.
(Rakan Alghamdi / BC 25035 is tracked in Issue 12.)

BC 25010 | Alin Merticariu (14601) | GE AM | Aug3-Aug28 | New student, not placed
BC 25003 | Aleix Cervera Gonzalez (14596) | GE AM | Aug3-Sep18 | Duplicate? BC 25002 same dates 1 SCA
BC 25029 | Monica Breier Fiametti (979) | AY Morning | Aug3-Nov13 | Existing student, not placed
BC 25016 | Anderson da Silva Martins (14607) | Life Pass Morning | Aug3-Jan27 | Confirm if SCA needed
BC 1766 | Maria Eduarda Alves Paiva (1028) | AY Renewal Morning | Aug3-Sep4 | URGENT 25 days left

FIX RECIPE (NOT YET RUN)
1. BC 25003: check if duplicate of BC 25002; if so: UPDATE booking_courses SET active=false WHERE id=25003
2. BC 25010: check level test -> assign GE AM class via SIS admin UI
3. BC 25029: check prior level -> assign AY Morning class
4. BC 25016: ask staff if Life Pass needs StudentClassAssignment; assign if yes
5. BC 1766: assign to AY Morning NOW - only 25 days to Sep 4

Risk: bookings/class-assignment | Reversible: yes | BC 1766 ends Sep 4 urgent
Status: Not yet run | Last checked: 2026-08-10 UTC