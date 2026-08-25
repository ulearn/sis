Issue 41 addendum 15 Aug 2026 UTC 88th check

Reporter: KC | Area: Booking/Accomm | Sheet row: 43

ROOT CAUSE (88th check)
- BA 11357 (bed 178, Aug 2-Aug 15): ended today, still active
- BA 11396 (bed 44, Jenny Manders, Aug 15-Aug 22): DAY 1 check-in, fee = null URGENT
- BA 11397 (bed 89, Capel Street, Aug 22-Sep 6): fee = null, 7 days to check-in
- BA 11392 (City Centre Apartment, Sep 6-Sep 14): fee = EUR 415, bedId = null

FIX RECIPE (NOT YET RUN)
URGENT today: UPDATE booking_accommodation SET fee = <rate> WHERE id = 11396;
Today: UPDATE booking_accommodation SET active = false WHERE id = 11357;
Before Aug 22: UPDATE booking_accommodation SET fee = <rate> WHERE id = 11397;
Before Sep 6: UPDATE booking_accommodation SET bed_id = <apt_bed_id> WHERE id = 11392;

RISK: reversible, booking/accomm
STATUS: URGENT, fee null on day 1 check-in. Last checked: 15 Aug 2026 UTC (88th check / 293rd run)