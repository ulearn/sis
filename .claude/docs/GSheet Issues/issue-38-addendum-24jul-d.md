# Issue 38 — August Bank Holiday 2026 (check Fri 24 Jul 2026 UTC, 80th hourly, 153rd total)

Reporter: staff. Area: Holidays / Bookings. Sheet row 40.

## Symptom
Staff have to set end dates of courses manually because system does not enforce bank holidays.

## Root Cause
- August Bank Holiday (Mon 3 Aug 2026): ABSENT from school_closures table
- October Bank Holiday (Mon 26 Oct 2026): ABSENT from school_closures table
- Database has 9 closures only: Good Fridays 2026-2030 and Christmas 2026-2029
- Booking course 24956 (Giampaolo Russo, Issue 41): starts Mon 3 Aug 2026 = the Bank Holiday itself
- Booking course 24991 (Edith Nunes, Issue 22): ends Fri 7 Aug; system counts Mon 3 Aug as school day
- Aug Bank Holiday is now 10 calendar days away
- Status UNCHANGED — 80th hourly check, fix still NOT RUN

## Fix Recipe (NOT YET RUN)
1. Insert into school_closures table:
   - name: "August Bank Holiday"
   - startDate: 2026-08-03
   - endDate: 2026-08-03
   - isPaidHoliday: true
   SQL: INSERT INTO school_closure (name, start_date, end_date, is_paid_holiday) VALUES ("August Bank Holiday", "2026-08-03", "2026-08-03", true);
2. Insert October Bank Holiday:
   SQL: INSERT INTO school_closure (name, start_date, end_date, is_paid_holiday) VALUES ("October Bank Holiday", "2026-10-26", "2026-10-26", true);
3. After inserting Aug BH: verify booking course 24956 (Giampaolo) start date adjusts if webhook handles it, or manually ensure the course start logic treats Aug 3 as a holiday
4. After inserting Aug BH: verify booking course 24991 (Edith Nunes) end date is recalculated correctly

## Risk / Category
- Category: bookings / school closures
- Reversible: yes (delete the row)
- Blast radius: all bookings with courses spanning Aug 3 or Oct 26
- URGENCY: HIGH — Aug Bank Holiday is 10 days away; affects student class scheduling for two open issues

## Status
Fix NOT RUN as of Fri 24 Jul 2026 UTC (153rd total check, 80th hourly).