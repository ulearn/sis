Issue 7 addendum 6 Aug 2026
Root Cause (Thu 6 Aug UTC)
Bk 17909 (student 768): CANCELLED, confirmed=true, EUR 0 paid, EUR 727.50 open, 0 pmts
BC 24693 (Renewal AY PM, ends Nov 13 2026): active=true, 0 class assignments

Fix Recipe (NOT YET RUN)
  UPDATE bookings SET confirmed=false WHERE id=17909;
  UPDATE booking_courses SET active=false WHERE id=24693 AND booking_id=17909;

Risk: data-hygiene | Reversible | Low blast radius
Status: Unchanged. Last checked: Thu 6 Aug 2026 UTC (31st check, 57 days open)
