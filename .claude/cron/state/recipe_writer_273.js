const fs = require("fs");
const base = "/home/sis/web/sis.ulearnschool.com/public_html/sis/.claude/docs/GSheet Issues/";

fs.writeFileSync(base + "issue-41-addendum-14aug-c.md", [
  "Issue 41 - Giampaolo Russo Accommodation Restructured (75th check)",
  "Reporter: Diego | Area: Booking/Accomm | Sheet row 43 | Fri 14 Aug 2026 UTC",
  "",
  "Root cause - UPDATED (accommodation restructured today 2026-08-14)",
  "BA 11357 (host family, bed 178): Aug 2-Aug 15, fee EUR 1250 - end date shortened from Sep 6 to Aug 15 today",
  "BA 11396 (NEW, bed 44): Aug 15-22, fee NULL - MISSING FEE - created 2026-08-14",
  "BA 11397 (NEW, bed 89): Aug 22-Sep 6, fee NULL - MISSING FEE - created 2026-08-14",
  "BA 11392 (apartment, bed null): Sep 6-Sep 14, fee EUR 415 - still no bed (Sep 6 = 23 days)",
  "",
  "Bed 44 (Aug 15-22): clear, no conflicts",
  "Bed 89 (Aug 22-Sep 6): BA 11387 (Vincenzo Gagliano, bk 18175) ends Aug 22 - same-day checkout/checkin, verify housekeeping",
  "Beds 168 + 194: clear for Sep 6-14",
  "",
  "Fix recipe (NOT YET RUN)",
  "1. Confirm fees with Diego then: UPDATE booking_accommodation SET fee=[X], updatedAt=NOW() WHERE id IN (11396, 11397);",
  "2. Assign bed to BA 11392: UPDATE booking_accommodation SET bedId=[168 or 194], updatedAt=NOW() WHERE id=11392;",
  "3. Verify Aug 22 bed 89 turnaround - confirm Vincenzo checks out and housekeeping can turn room same day",
  "",
  "Risk: bookings+money | Reversible | Blast radius: 3 BAs",
  "Open - fix NOT RUN. Sep 6 check-in 23 days. Last checked: 2026-08-14 UTC (75th)"
].join("
"));
console.log("recipe 41 written");

fs.writeFileSync(base + "issue-48-addendum-14aug-d.md", [
  "Issue 48 - Telmuun Enkhsaikhan / BC 1810 / Payment 17956 (123rd check)",
  "Reporter: Staff | Area: Attendance/Classes | Sheet row 50 | Fri 14 Aug 2026 UTC",
  "",
  "Root cause (updated - no data change since 122nd check)",
  "Booking 1624 (Telmuun Enkhsaikhan, student 293): status=PARTIAL, confirmed=false, paid EUR 1406, open EUR 250. Service May 18-Nov 20 2026.",
  "PARTIAL+confirmed=false likely excludes student from active listings and class assignment search.",
  "Booking Course 1810 (Academic Year Renewal Morning, Jun 29 2026 to Jan 1 2027): active=true, 0 class assignments (47 days)",
  "Payment 17956: EUR 100, Bank, xeroPaymentId=null, created Jun 29 2026 - unreconciled 47 days",
  "EUR 250 open balance prevents booking reaching CONFIRMED status",
  "",
  "Fix recipe (NOT YET RUN)",
  "1. Assign BC 1810 to correct AM class via SIS UI",
  "2. Reconcile Payment 17956 in Xero (EUR 100 Bank ~Jun 29), then: UPDATE payment SET xeroPaymentId=[ID], updatedAt=NOW() WHERE id=17956;",
  "3. Settle EUR 250 open balance - identify missing payment or chase student/agency",
  "4. Set booking confirmed=true after balance cleared: UPDATE booking SET confirmed=true, updatedAt=NOW() WHERE id=1624;",
  "",
  "Risk: attendance+bookings+money | Reversible | Blast radius: single student",
  "Open - fix NOT RUN. 47 days no class assignment; Xero unreconciled 47 days; EUR 250 open. Last checked: 2026-08-14 UTC (123rd)"
].join("
"));
console.log("recipe 48 written");