Issue 48 - Telmuun Enkhsaikhan / BC 1810 / Payment 17956 (123rd check)
Reporter: Staff | Area: Attendance/Classes | Sheet row 50 | Fri 14 Aug 2026 UTC

Root cause (updated - no data change since 122nd check)
Booking 1624 (Telmuun Enkhsaikhan student 293): status=PARTIAL confirmed=false paid=EUR 1406 open=EUR 250. Service May 18-Nov 20 2026.
PARTIAL+confirmed=false likely excludes student from active listings and class assignment search.
Booking Course 1810 (Academic Year Renewal Morning Jun 29 2026 to Jan 1 2027): active=true 0 class assignments (47 days).
Payment 17956: EUR 100 Bank xeroPaymentId=null created Jun 29 2026 - unreconciled 47 days.
EUR 250 open balance prevents booking reaching CONFIRMED status.

Fix recipe (NOT YET RUN)
1. Assign BC 1810 to correct AM class via SIS class management UI.
2. Reconcile Payment 17956 in Xero (EUR 100 Bank around Jun 29): UPDATE payment SET "xeroPaymentId"=[ID] "updatedAt"=NOW() WHERE id=17956;
3. Settle EUR 250 open balance - identify missing payment or chase student/agency.
4. After balance cleared: UPDATE booking SET confirmed=true "updatedAt"=NOW() WHERE id=1624;

Risk: attendance+bookings+money | Reversible | Blast radius: single student booking
Student invisible in class assignment - attendance records blocked.
Open - fix NOT RUN. 47 days no class assignment Xero unreconciled 47 days EUR 250 open.
Last checked: 2026-08-14 UTC (123rd check)