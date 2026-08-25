# Issue 48 -- Multi-student class assignment / attendance

Reporter: AC | Area: Attendance/Classes | Row: 50 | 2026-07-30 UTC

## Root causes per student

### 1. Uyanga Tungalag S917 -- duplicate of Issue 25
Booking 1467 CONFIRMED confirmed=true paid=EUR 2405. BC 1613 AY Morning Apr27-Oct30 active. visaStatus=null hubspotContactId=null. Zero SCAs ever. Blocker: visa null. Fix: see Issue 25.

### 2. Ana Jessica Rosa de Paula Santos S766 -- duplicate of Issue 17
Booking 1308 CANCELLED confirmed=false paid=EUR 1530. BC 1350 active (orphaned). Cancelled booking excluded from assignment view. Fix: see Issue 17.

### 3. Telmuun Enkhsaikhan S293
Booking 1624 PARTIAL confirmed=false open=EUR 250 paid=EUR 1406 (updated 2026-07-08).
BC 1810 AY Renewal Morning Jun29-Dec18 2026 active=true.
Last SCA: id=86 class=11 week_end=2026-05-01 on OLD booking 1466 -- 90 days ago.
No SCA on current booking 1624 or BC 1810 -- attendance gap since Jun 29.
Blocker: confirmed=false on bk1624.
FIX NOT YET RUN: verify EUR 250 in HubSpot/Xero; if paid: UPDATE bookings SET confirmed=true WHERE id=1624; then create SCA for student 293 BC 1810 class 11 from Jun29; backfill attendance via admin.

### 4. Ariunsarnai Batbayar S1047 -- duplicate of Issue 20
Booking 1605 PENDING confirmed=false open=EUR 1509 paid=0. No SCAs. Fix: see Issue 20.

### 5. Francesca Fassina S14462
NOTE: AC wrote Fassini; DB has Fassina -- name discrepancy.
Booking 17857 CONFIRMED confirmed=false paid=EUR 339.90 open=null.
BC 24630 General English AM Plus Jun29-Jul10 2026 active=true. Course ended 20 days ago.
No SCAs -- attendance for entire 2-week course never recorded.
Blocker: confirmed=false. Course now over so retroactive fix only.
FIX NOT YET RUN: ask AC which class she was in; UPDATE bookings SET confirmed=true WHERE id=17857; insert SCA student_id=14462 booking_course_id=24630 class_id=? week_start=2026-06-29 week_end=2026-07-10; enter attendance via admin UI.

### 6. Margherita Galbusera S14461
Booking 17856 CONFIRMED confirmed=false paid=EUR 339.90 open=null.
BC 24631 General English AM Plus Jun29-Jul10 2026 active=true. Course ended 20 days ago. No SCAs.
FIX NOT YET RUN: ask AC which class; UPDATE bookings SET confirmed=true WHERE id=17856; insert SCA student_id=14461 booking_course_id=24631 class_id=? week_start=2026-06-29 week_end=2026-07-10; enter attendance.

### 7. Saikhantes Shagdarsuren S1001
Booking 18151 CONFIRMED confirmed=true paid=EUR 1339.20. BC 24925 AY Afternoon Mar9-Oct2 active.
SCA 255: class_id=11 week_start=2026-01-12 week_end=2026-07-03 (single 6-month SCA, no others).
Holiday: Jul 20 -- Aug 21 2026.
Already-assigned false positive: system finds SCA255 (expired Jul3) and blocks new assignment.
Missing attendance: weeks Jul6-10 and Jul13-17.
FIX NOT YET RUN: UPDATE student_class_assignments SET week_end=2026-07-17 WHERE id=255; enter attendance for Jul6-10 and Jul13-17 via admin (confirm with Paul/AC); after holiday ends Aug22+ extend SCA again.

### 8. Enshi Lu S397
Booking 787 CONFIRMED confirmed=true paid=EUR 2147.50 (updated 2026-06-05).
BC 826 Nov17-28 2025 active=true (stale). BC 827 Jan5-30 2026 active=true (stale). BC 828 BACKWARDS Mar2-Feb27 2026 active=true (see Issue 23). BC 829 Mar30-Jun5 2026 active=true (ended 55 days ago).
SCA 58: class_id=8 week_start=2026-03-30 week_end=2026-05-31 BC=829. Ends 5 days before BC829 end (Jun5). No attendance Jun1-5 or Jun8-12.
FIX NOT YET RUN: confirm with AC Jun1-5 and Jun8-12 attendance; if Jun8-12 attended: UPDATE booking_courses SET end_date=2026-06-13 WHERE id=829; UPDATE student_class_assignments SET week_end=2026-06-12 WHERE id=58; enter retroactive attendance; then deactivate stale BCs 826/827/828/829.

## Info needed from AC / Neil
1. Francesca Fassina + Margherita Galbusera: which class for Jun29-Jul10?
2. Enshi Lu: did he attend Jun1-5 AND Jun8-12? Confirm with Paul/AC.
3. Saikhantes: actual attendance Jul6-10 and Jul13-17?
4. Telmuun: is EUR 250 genuinely outstanding or already paid?

## Related issues: 25 (Uyanga visa), 17 (Ana Jessica cancelled), 20 (Ariunsarnai pending), 23 (Enshi backwards)

## Risk: Attendance/docs -- retroactive changes affect certs and ILEP. SQL reversible. 6 students max 12 weeks retroactive.

Status: NOT YET RUN | Last checked: 2026-07-30 UTC