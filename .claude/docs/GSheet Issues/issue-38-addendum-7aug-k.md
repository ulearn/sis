# Issue 38 -- Unassigned Booking Courses (Addendum 7 Aug 2026, run k)

Reporter: Staff | Area: Holidays, Bookings | Sheet row: 40 | Check: 63rd hourly -- Fri 7 Aug 2026 UTC

## Symptom
Students with no SCA will not appear in class lists when school resumes Monday 10 Aug.

## Root Cause (63rd check)

Count escalated: 13 to 17. Four new BCs added since 7aug-j. All 17 start Mon 10 Aug with 0 SCAs.

## All 17 unassigned BCs starting 10 Aug 2026

BC25004  Gen English AM Plus       Vincenzo Contu            bk18226  end 14 Aug  CRITICAL 1-week
BC25005  Gen English AM            Claudia Mereu             bk18227  end 14 Aug  CRITICAL 1-week
BC108    Intensive General 30      Lucia Borroni             bk98     end 21 Aug
BC109    Morning General           Maicol Moretti            bk99     end 21 Aug
BC25024  Gen English PM            Josimar Roberto           bk18246  end 21 Aug
BC25042  Gen English AM            Edith Nunes               bk18262  end 28 Aug  [NEW]
BC96     Intensive General 30      Alessandro Signorotti     bk88     end 28 Aug  BLOCKED (bk88 confirmed=false EUR250 open)
BC1313   AY Afternoon              Ana Luiza De Sousa        bk1286   end 28 Aug  (confirmed=true EUR120 open - assignable)
BC25039  Gen English PM Plus       Cristian Ravai            bk18259  end 28 Aug
BC25036  Gen English AM            Jorge Perez Aldana        bk18256  end 4 Sep
BC833    AY Morning                Settiyanee Duangjai       bk790    end 27 Nov 2026  [NEW]
BC24970  AY Afternoon              Tsengelbayar Mendsaikhan  bk18194  end 29 Jan 2027  [NEW]
BC1818   AY Morning                Natanael Reis             bk1631   end 18 Dec 2026
BC24915  AY Morning                Toshimi Hanakawa          bk18140  end 29 Jan 2027
BC25007  AY Morning                Nominjin Amartsogt        bk18229  end 12 Feb 2027
BC25027  AY Morning                Jacqueline Burgos         bk18248  end 12 Feb 2027
BC25031  AY Morning                Brisia Garcia Roman       bk18252  end 12 Feb 2027  [NEW]

Booking 88: confirmed=false amount_open=EUR 250 => BC96 BLOCKED
Booking 1286: confirmed=true amount_open=EUR 120 => BC1313 assignable

## Priority
1. TODAY Fri 7 Aug: BC25004 + BC25005 (expire 14 Aug, 1-week courses)
2. Before Monday: BC108 BC109 BC25024 BC25042 BC25039 (expire 21-28 Aug)
3. This week: AY BCs (BC833 BC24970 BC1818 BC24915 BC25007 BC25027 BC25031 BC1313 BC25036)
4. When bk88 confirmed: BC96

## Fix Recipe (NOT YET RUN)

Step 1: SIS Admin > Classes > To Be Assigned
  Assign BC25004 (Vincenzo Contu) to Gen English AM Plus class -- TODAY
  Assign BC25005 (Claudia Mereu) to Gen English AM class -- TODAY

Step 2: Assign all other ready BCs before Monday (skip BC96)
  Work through list above in SIS Admin > Classes > To Be Assigned

Step 3: Resolve bk88 to unblock BC96
  Chase EUR 250 from Signorotti
  UPDATE bookings SET confirmed = true WHERE id = 88;
  Then assign BC96 to Intensive General 30

Step 4: Verify:
  SELECT COUNT(*) FROM booking_courses bc
  WHERE bc.active = true AND bc.start_date >= '2026-08-10'
  AND (SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = bc.id) = 0;
  -- Expected: 0 (or 1 if BC96 still blocked)

## Risk
Category: bookings / class assignment. Reversible: yes. Blast radius: 17 students start Mon with no class. BC25004+25005 miss entire 1-week course if not assigned today.

## Status
Open -- NOT RUN. CRITICAL for Fri 7 Aug.
Last checked: Fri 7 Aug 2026 UTC (63rd hourly run)
