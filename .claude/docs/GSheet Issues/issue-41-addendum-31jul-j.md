Issue 41 Addendum  31 Jul 2026 (j)  Check-in This Weekend
Reporter: Diego  Area: Booking / Accomm  Sheet row: 43  Student: Giampaolo Russo (s14571)
Last checked: 2026-07-31 UTC (22nd hourly check)

SYMPTOM
Student booked host family (Aug 2-Sep 6) and Capel Street apartment (Sep 6-14).
Both were absent from SIS at time of original report.

CURRENT DB STATE (this run)
- Booking 18180: confirmed=true, amount_paid=EUR 2584.96, amount_open=0
- BA 11357 (host family, bed 178 Claremont Close): start_date=2026-08-02 (Sun), end_date=2026-09-06, active=true, fee=EUR 1250
  UNCHANGED across all 22 checks.
- Capel Street BA (Sep 6-Sep 14): still ABSENT from DB -- no booking_accommodation record.
- BC 24956 (General English AM, Aug 3-Sep 11, bk18180): in Issue 38 shunt list -- start moves to Aug 4 when that fix runs.

Open discrepancy: arrival date
The original issue (and DB) both say Aug 2 (Sunday). BA 11357 start_date = 2026-08-02.
Previous runs flagged that student may arrive Saturday 1 Aug -- source: Diego. Unresolved.
TODAY (Fri 31 Jul) is the last chance to update BA start_date to Aug 1 if that is accurate.

FIX RECIPE (NOT YET RUN)

Action 1 -- Confirm arrival date with Diego TONIGHT (Fri 31 Jul)
  If student arrives Sat 1 Aug (tomorrow):
    UPDATE booking_accommodations SET start_date = '2026-08-01' WHERE id = 11357;
  If student arrives Sun 2 Aug: no change needed (DB already correct).

Action 2 -- Add Capel Street BA once Diego confirms details
  Neil needs: (a) which bed at Capel Street, (b) what fee
  INSERT INTO booking_accommodations (booking_id, bed_id, start_date, end_date, active, fee)
  VALUES (18180, <capel_bed_id>, '2026-09-06', '2026-09-14', true, <capel_fee>);

Action 3 -- Issue 38 fix will move BC 24956 start from Aug 3 to Aug 4
  No separate action needed here; it is covered by Issue 38 Step 3.

RISK / CATEGORY
- Category: bookings / accomm
- Reversible: yes (revert BA start_date; delete inserted BA if wrong)
- Blast radius: 1 student
- URGENCY: HIGH -- check-in is this weekend. Must confirm with Diego tonight.

STATUS
NOT RUN. 22nd hourly check (Fri 31 Jul 2026).
BA start date discrepancy (Aug 1 vs Aug 2) unresolved. Capel BA absent. Neil to confirm with Diego tonight.