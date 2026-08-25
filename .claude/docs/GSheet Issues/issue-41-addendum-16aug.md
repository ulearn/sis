Issue 41 - Giampaolo Russo (booking 18180, student 14571)
Reporter: KC | Area: Booking / Accommodation | Sheet row: 43

Symptom
Student booked Host Family (Aug 2-Sep 6) and Capel Street premium room (Sep 6-Sep 14). Staff could not add second accommodation in SIS.

Root Cause (verified 16 Aug 2026 UTC - 100th check)
Booking 18180: CONFIRMED, confirmed = true, EUR 2,584.96 fully paid.
Booking Course 24956 (General English AM): 3 Aug - 11 Sep 2026, active.

Class assignment duplicate (ESCALATION - 2nd check 16 Aug):
- SCA 426: class 12, weekStart 10 Aug 2026, weekEnd 11 Sep 2026 - already active
- SCA 424: class 12, weekStart 17 Aug 2026, weekEnd 11 Sep 2026 - starts TOMORROW (17 Aug)
- Both assign the student to class 12 for overlapping periods
- From 17 Aug student appears twice in class 12 attendance - attendance % will be corrupted

Accommodation status:

| BA ID | Bed  | Period                      | Fee       | Status                               |
|-------|------|-----------------------------|-----------|--------------------------------------|
| 11357 | 178  | 2 Aug - 15 Aug 2026         | EUR 1,250 | Ended Aug 15 - 2 days overdue, deactivate |
| 11396 | 44   | 15 Aug - 22 Aug 2026        | null      | Day 2 in situ - fee CRITICAL         |
| 11397 | 89   | 22 Aug - 6 Sep 2026         | null      | 6 days to check-in - set fee         |
| 11392 | null | 6 Sep - 14 Sep 2026         | EUR 415   | Bed not assigned - 21 days           |

Fix Recipe (NOT YET RUN)

Step 1 - Set fee on BA 11396 (CRITICAL - student in situ Day 2, no charge set)
SIS Admin: Booking 18180 > Accommodation > BA 11396 > set Host Family 1-week fee > save.

Step 2 - Remove duplicate Class Assignment (URGENT - SCA 424 starts TOMORROW 17 Aug)
SCA 424 (weekStart 17 Aug) and SCA 426 (weekStart 10 Aug) both assign class 12.
SCA 426 started first (10 Aug); SCA 424 is likely the erroneous duplicate.
SIS Admin: Classes > Student Assignments > delete SCA 424 (confirm with Diego/Paul first).

Step 3 - Deactivate BA 11357 (ended Aug 15, 2 days overdue)
SIS Admin: Booking 18180 > Accommodation > BA 11357 > deactivate.

Step 4 - Set fee on BA 11397 (before 22 Aug, 6 days)
BA 11397: bed 89, 22 Aug - 6 Sep (2 weeks). Set Host Family 2-week rate.

Step 5 - Assign bed to BA 11392 (before 6 Sep, 21 days)
BA 11392: Capel premium room, 6 Sep - 14 Sep. Assign appropriate bed_id.

Risk: Accommodation / bookings / class. Money risk: BA 11396 fee null = host not credited.
Duplicate SCA: attendance % corrupted from 17 Aug if not removed today. Reversible. Single booking.

Status: Open - fix NOT run.
Last checked: 2026-08-16 UTC (100th check)
