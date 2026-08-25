Issue 36b — Pietro Caccianiga — BA 11393 fee null + service_end mismatch (343rd run)
Row: 38 | Run: 343rd Mon 17 Aug 2026 UTC

ROOT CAUSE (verified from DB — 213th check)
- BA 11393: bedId 88 (Capel St A2 Room 3 Bed A), Aug 22 to Sep 13 (4 weeks), fee = null, active = true
- Booking 17980: service_end = 2026-08-21 — MISMATCH (BA starts Aug 22; service_end must be Sep 13)
- No Xero invoice in SIS DB for booking 17980
- Both anomalies unchanged since last check — fix NOT RUN

CHECK-IN Aug 22 = 5 days away.

FIX (NOT YET RUN):
Step 1 — Confirm fee with Diego/KC for bed 88, 4 wks Aug 22-Sep 13 (implied EUR 1,360 at EUR 340/wk)
Step 2 — Set fee:
  UPDATE booking_accommodations SET fee=<amount> WHERE id=11393;
Step 3 — Extend service_end:
  UPDATE bookings SET service_end='2026-09-13' WHERE id=17980;
Step 4 — Check/raise Xero invoice for booking 17980 (none in DB)
Step 5 — Verify:
  SELECT id,fee,start_date,end_date,active FROM booking_accommodations WHERE id IN(11311,11393);

RISK: Accommodation | Reversible | 1 student | DEADLINE Aug 22 check-in (5 days)
See full recipe: issue-36b-addendum-17aug-d.md
Last checked: 2026-08-17 UTC (343rd hourly run, 213th check for this issue)
