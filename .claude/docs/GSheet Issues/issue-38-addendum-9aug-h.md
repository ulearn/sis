# Issue 38 -- School Classes Mon 10 Aug (Addendum 9 Aug-h)

**Check:** 88th Sun 9 Aug 2026 UTC | **Row:** 40 | CRITICAL: classes start TOMORROW -- unchanged from 87th check

## READY -- 13 Booking Courses (confirmed=true, fully paid, 0 SCAs)
- BC 108 Lucia Borroni (student 92), Intensive General 30, Aug 10-21, booking 98
- BC 109 Maicol Moretti (student 93), Morning General, Aug 10-21, booking 99
- BC 1313 Ana Luiza De Sousa (student 744), Academic Year Afternoon, Aug 10-28, booking 1286
- BC 1818 Natanael Reis Lourenco de Sales (student 1071), Academic Year Morning, Aug 10-Dec 18, booking 1631
- BC 24915 Toshimi Hanakawa (student 877), Academic Year Morning, Aug 10-Jan 29, booking 18140
- BC 24970 Tsengelbayar Mendsaikhan (student 948), Academic Year Afternoon, Aug 10-Jan 29, booking 18194
- BC 25004 Vincenzo Contu (student 14597), General English AM Plus, Aug 10-14, booking 18226
- BC 25005 Claudia Mereu (student 14598), General English AM, Aug 10-14, booking 18227
- BC 25024 Josimar Roberto (student 14612), General English PM, Aug 10-21, booking 18246
- BC 25027 Jacqueline Olga Burgos (student 14614), Academic Year Morning, Aug 10-Feb 12, booking 18248
- BC 25031 Brisia Garcia Roman (student 14617), Academic Year Morning, Aug 10-Feb 12, booking 18252
- BC 25036 Jorge Perez Aldana (student 14619), General English AM, Aug 10-Sep 4, booking 18256
- BC 25039 Cristian Ravai (student 17), General English PM Plus, Aug 10-28, booking 18259

## ON HOLD -- 4 Booking Courses (do not assign yet)
- BC 96 Alessandro Signorotti, booking 88: confirmed=false, EUR 250 owed (paid 1845/2095)
- BC 833 Settiyanee Duangjai, booking 790: status=ESCROW, must release first
- BC 25007 Nominjin Amartsogt, booking 18229: PARTIAL, EUR 370 owed (paid 980/1350)
- BC 25042 Edith Nunes, booking 18262: PENDING, EUR 456 owed (paid 0/456)

## Fix Recipe (NOT YET RUN)
For 13 READY Booking Courses: assign each to class via SIS Admin > Classes (UI workflow).
No direct SQL needed -- UI creates the class assignment records.

For BC 96 (Alessandro Signorotti, booking 88):
  Step 1: Confirm booking 88 (resolve EUR 250 balance or waive)
  Step 2: Assign BC 96 to class

For BC 833 (Settiyanee Duangjai, booking 790):
  Step 1: Release escrow on booking 790
  Step 2: Assign BC 833 to class

BC 25007 + BC 25042: Hold until payments received.

## Risk
Category: bookings/class-scheduling. Reversible.
CRITICAL: 13 students unplaced on first day of term if not actioned today (Sun 9 Aug).

Status: Open. NOT YET RUN. Last checked: 2026-08-09 UTC (88th check)
