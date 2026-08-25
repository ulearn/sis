# Issue 24 — Alberto Squillace Zero SCAs and Null Fee — Addendum 23 Jul 2026 (c)

**Reporter:** Staff | **Area:** Booking | **Sheet row:** 25 | **Check:** 52nd hourly (147th total)

## Symptom
BC24686 (Alberto Squillace, Morning General, 20 Jul - 18 Sep 2026): zero class assignments, booking course fee = null.

## Root Cause
No SCA since course start Mon 20 Jul 2026 (Day 4). BC24686.fee is null (not zero - genuinely unset). Booking 1611 CONFIRMED, confirmed=true, fully paid EUR 1,280.12.

## Evidence
- bookingCourse 24686: Morning General, 2026-07-20 to 2026-09-18, active=true, fee=null
- booking 1611 (student 1052): CONFIRMED, confirmed=true, amountPaid=1280.12, amountTotal=1280.12
- classAssignment count = 0
- School days lost: Mon 20, Tue 21, Wed 22, Thu 23 Jul (4 days - Day 4)
- ~41 school days remaining through 18 Sep 2026
- extras: none

## Fix Recipe (NOT YET RUN)

Step 1 - Assign to class (URGENT):
1. SIS Admin > Students > student 1052 (Alberto Squillace)
2. Booking 1611 > Courses > BC24686 (Morning General)
3. Assign to active AM class effective Mon 20 Jul (or earliest possible)
4. Confirm SCA appears in attendance for week of 20 Jul

Step 2 - Set booking course fee:
1. Edit BC24686 and set fee to correct EUR amount for Morning General
2. Check rate card vs booking total (EUR 1,280.12 paid total)
3. Confirm correct fee with accounts before updating

## Risk / Category
- Category: bookings / class assignment / data-hygiene; Reversible: yes
- Blast radius: one student; null fee may affect Xero invoice if re-generated
- Financial: 4 paid school days missed; 41 remaining

## Status
UNCHANGED - zero SCAs, fee null - Day 4 of 60-day course
Last checked: Thu 23 Jul 2026 UTC (52nd hourly check, 147th total)