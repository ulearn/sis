Issue 38 -- 76th check, Sat 8 Aug 2026 UTC
Sheet row: 40 | Area: Holidays, Bookings / Class Assignments
===
NEW FINDING vs 75th check: Booking Course 25035 (Rakan Alghamdi, General English Academic Year AM Plus, started Mon 3 Aug 2026, ends 18 Dec 2026, booking 17915) now appears in the Aug-3 zero-assignment list. It was not listed in the 75th check. Aug-3 list is now 8 Booking Courses (was 7).

Aug-3 Booking Courses (0 SCAs each -- 5 school days overdue as of Mon 11 Aug)
BC 97    Gustavo Ferreira s83               AY Morning           ends 18 Dec 2026
BC 1766  Maria Alves Paiva s1028            AY Renewal Morning   ends 4 Sep 2026
BC 24999 Soumaya Bourguiba s14594           GE PM                ends 29 Aug 2026
BC 25003 Aleix Cervera Gonzalez s14596      GE AM                ends 18 Sep 2026
BC 25010 Alin Merticariu s14601             GE AM                ends 28 Aug 2026
BC 25016 Anderson da Silva Martins s14607   Life Pass Morning    ends 22 Jan 2027
BC 25029 Monica Breier Fiametti s979        AY Morning           ends 13 Nov 2026
BC 25035 Rakan Alghamdi s14444 *** NEW ***  GE AY AM Plus        ends 18 Dec 2026

Aug-10 Booking Courses (0 SCAs each -- start MONDAY 10 Aug in <48 hours)
BC 96    Alessandro Signorotti s82          Intensive 30         ends 28 Aug
BC 108   Lucia Borroni s92                  Intensive 30         ends 21 Aug
BC 109   Maicol Moretti s93                 Morning General      ends 21 Aug
BC 833   Settiyanee Duangjai s400           AY Morning           ends 27 Nov
BC 1313  Ana Luiza De Sousa s744            AY Afternoon         ends 28 Aug
BC 1818  Natanael Reis Lourenco s1071       AY Morning           ends 18 Dec
BC 24915 Toshimi Hanakawa s877              AY Morning           ends 29 Jan 2027
BC 24970 Tsengelbayar Mendsaikhan s948      AY Afternoon         ends 29 Jan 2027
BC 25004 Vincenzo Contu s14597              GE AM Plus           ends 14 Aug *** 1-WEEK ***
BC 25005 Claudia Mereu s14598              GE AM                ends 14 Aug *** 1-WEEK ***
BC 25007 Nominjin Amartsogt s759            AY Morning           ends 12 Feb 2027
BC 25024 Josimar Roberto s14612             GE PM                ends 21 Aug
BC 25027 Jacqueline Burgos s14614           AY Morning           ends 12 Feb 2027
BC 25031 Brisia Garcia Roman s14617         AY Morning           ends 12 Feb 2027
BC 25036 Jorge Perez Aldana s14619          GE AM                ends 4 Sep
BC 25039 Cristian Ravai s17                 GE PM Plus           ends 28 Aug
BC 25042 Edith Nunes s1015                  GE AM                ends 28 Aug

Aug-17 Booking Courses (0 SCAs each -- 9 days away)
BC 91, 1410, 1428, 1656, 1732, 24949, 24993, 24995, 25012, 25022

FIX RECIPE - NOT YET RUN
  Assign all via SIS Admin -> Classes before Mon 10 Aug 09:00.
  Priority: BC25004 Vincenzo Contu + BC25005 Claudia Mereu -- 1-week, end Fri 14 Aug (zero margin).
  Also urgent: BC25035 Rakan Alghamdi -- 5 school days already missed.

VERIFY (read-only SQL):
  SELECT bc.id, bc.name, bc.start_date::date, s.first_name, s.last_name, COUNT(sca.id) as sca_count
  FROM booking_courses bc
  JOIN bookings b ON b.id = bc.booking_id
  JOIN students s ON s.id = b.student_id
  LEFT JOIN student_class_assignments sca ON sca.booking_course_id = bc.id
  WHERE bc.id = ANY(ARRAY[97,1766,24999,25003,25010,25016,25029,25035,
    96,108,109,833,1313,1818,24915,24970,25004,25005,25007,25024,25027,25031,25036,25039,25042])
  GROUP BY bc.id, bc.name, bc.start_date, s.first_name, s.last_name
  HAVING COUNT(sca.id) = 0
  ORDER BY bc.start_date, bc.id;

RISK: bookings / attendance. Reversible. Blast radius: 25 students unassigned.
Last checked: Sat 8 Aug 2026 UTC (76th check)
