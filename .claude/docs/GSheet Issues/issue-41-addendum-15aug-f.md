Issue 41 addendum 15 Aug 2026 UTC 89th check

Reporter: KC | Area: Booking/Accomm | Sheet row: 43

ROOT CAUSE (89th check)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, fully paid EUR 2,584.96
- BA 11357 (bed 178, host family, Aug 2-Aug 15): ended today, still active = true
- BA 11396 (bed 44, Jenny Manders, host family, Aug 15-Aug 22): DAY 1 check-in, fee = null URGENT
- BA 11397 (bed 89, Capel Street, host family, Aug 22-Sep 6): fee = null, 7 days to check-in
- BA 11392 (City Centre Apartment, no bed, Sep 6-Sep 14): fee = EUR 415, bedId = null
- All BAs have accommodationType/roomType/board set (check BA 11392 for Capel apt bed)

FIX RECIPE (NOT YET RUN)
URGENT today: UPDATE booking_accommodation SET fee = <host_family_weekly_rate> WHERE id = 11396;
Today: UPDATE booking_accommodation SET active = false WHERE id = 11357;
Before Aug 22: UPDATE booking_accommodation SET fee = <host_family_weekly_rate x 2> WHERE id = 11397;
Before Sep 6: UPDATE booking_accommodation SET bed_id = <capel_bed_id> WHERE id = 11392;

RISK: reversible, booking/accomm. Fee null means provider payment calculations will be wrong.
STATUS: URGENT - fee null on day 1 check-in. Last checked: 15 Aug 2026 UTC (89th check / 295th run)