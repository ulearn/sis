# Issue 25 Addendum 9 Aug
Reporter: Staff | Row: 26 | Check: 153rd Sun 9 Aug 2026 UTC

## Root Cause - unchanged
- Student 917 (Uyanga Tungalag): visa_status=null, HubSpot contact ID=null
- Booking 1467: Confirmed, confirmed=true, fully paid EUR 2405
- BC 1613 (Academic Year Morning): started 27 Apr 2026, active=true, 0 SCAs, day 104

## Fix Recipe (NOT YET RUN)
Step 1: Verify visa in HubSpot; set visa_status via SIS admin.
Step 2: Look up Uyanga in HubSpot; UPDATE students SET hubspot_contact_id = <id> WHERE id = 917;
Step 3: Assign BC 1613 to class via SIS Admin.

## Risk: Visa / class assignments. Reversible. 1 student.
## Status: Open. NOT RUN. Day 104. Visa null, HubSpot null, 0 SCAs.
## Last Checked: Sun 9 Aug 2026 UTC (153rd check)