# Issue 24 - Alberto Squillace Fee Null + Zero Class Assignment (Addendum 21 Jul, run d)
Reporter: AC | Area: Booking/Class | Sheet row 25 | 37th hourly check (114th total) Tue 21 Jul 2026 UTC

## Symptom
Alberto Squillace: migration-era booking with holidays assigned in Fidelo; fee field null on booking course.

## Current Status (fresh DB)

BC 24686 | Alberto Squillace (student 1052) | bk1611 | Morning General | 20 Jul to 18 Sep 2026 | fee=null | active=true | 0 class assignments | Day 2 since course start (Mon 20 Jul)
Booking 1611: status CONFIRMED, confirmed=true, amount paid EUR 1280.12 / EUR 1280.12 (fully paid).
Fee null means course fee cannot appear on invoices or certificates. Booking otherwise healthy.
Also flagged: BC 24616 (Mia Wehrli, bk17842) -- fee null, similar issue.

## Fix Recipe (NOT YET RUN)
1. Set fee on BC 24686: UPDATE booking_course SET fee=<correct fee amount> WHERE id=24686;
   -- NOT YET RUN. Confirm correct fee amount from booking 1611 or HubSpot deal before running.
2. Set fee on BC 24616 (Mia Wehrli): UPDATE booking_course SET fee=<correct fee> WHERE id=24616;
3. Assign Alberto (BC24686) to a class: SIS > Students > 1052 > Bookings > 1611 > Courses > BC24686 > assign class
4. Deactivate stale BC 1797 (if still active): UPDATE booking_course SET active=false WHERE id=1797;

## Risk / Category
- Category: bookings / data-hygiene
- Reversible: yes (can update fee again if wrong)
- Blast radius: Alberto day 2 with 0 class assignment; fee null affects invoices/certs

## Status
OPEN - 37th hourly check, fix NOT YET RUN.
Last checked: 2026-07-21 ~21:00 UTC
