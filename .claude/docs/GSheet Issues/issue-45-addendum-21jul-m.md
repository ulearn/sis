# Issue 45 - Renewal Students No Class Assignment (Addendum 21 Jul, run m)
Reporter: AC | Area: Renewal Students | Sheet row 47 | 37th hourly check (66th total) Tue 21 Jul 2026 UTC

## Symptom
Returning students with confirmed booking courses not appearing on arrivals/class list; zero class assignments.

## Current Status (fresh DB - no change since run l at 19:00 UTC)

BC 24828 | Martina Tartaro (student 14441) | bk18036 | Morning General Plus + IELTS Easter Promo | 5 May to 24 Jul 2026 | 0 SCAs | active=true | ENDS FRIDAY 24 Jul (3 calendar days)
BC 25011 | Eduardo Roche Diaz (student 14602) | bk18233 | General English PM | 20 Jul to 24 Jul 2026 | 0 SCAs | CONFIRMED, fully paid EUR 178.50 | 2 school days missed (Jul 20 Mon + Jul 21 Tue) | ENDS FRIDAY 24 Jul
BC 24609 | Xuezhen Huang (student 14443) | bk17831 | Morning General | 13 Jul to 31 Jul 2026 | 0 SCAs | 9 school days missed | 10 days remaining
BC 24991 | Edite Nunes (student 1015) | bk18214 | General English AM | 13 Jul to 7 Aug 2026 | 0 SCAs | 7 school days missed | 13 days remaining

Eduardo (BC25011): course is only 5 days (Mon 20 - Fri 24 Jul). 2 days missed; 3 school days remain (Wed 22, Thu 23, Fri 24).
Martina (BC24828): 12-week course, 0 class assignments from day one; ends Friday.

## Fix Recipe (NOT YET RUN)
Assign each booking course to the appropriate class in SIS > class admin:

1. SIS > Students > 14441 Martina Tartaro > Bookings > 18036 > Courses > BC24828 > assign to class -- URGENT ends Fri 24 Jul
2. SIS > Students > 14602 Eduardo Roche Diaz > Bookings > 18233 > Courses > BC25011 > assign to General English PM class -- URGENT ends Fri 24 Jul
3. SIS > Students > 14443 Xuezhen Huang > Bookings > 17831 > Courses > BC24609 > assign to Morning General class
4. SIS > Students > 1015 Edite Nunes > Bookings > 18214 > Courses > BC24991 > assign to General English AM class

## Risk / Category
- Category: bookings / data-hygiene
- Reversible: yes (class assignment can be changed)
- Blast radius: 4 students untracked; BC25011 Eduardo has only 3 school days remaining

## Status
OPEN - 37th hourly check, fix NOT YET RUN.
Last checked: 2026-07-21 ~21:00 UTC
