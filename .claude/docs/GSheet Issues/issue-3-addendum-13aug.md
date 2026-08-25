Issue 3 -- School Closures / August Bank Holidays

Reporter: NM | Area: Bookings | Sheet row: 4
229th check -- Thu 13 Aug 2026 UTC

Symptom:
August Bank Holidays 2027-2030 absent from school_closures table.

Root Cause:
9 closures confirmed: Good Fridays 2026-2030, Christmas 2026-2029.
Missing: Aug BH 2027, 2028, 2029, 2030. No change since 228th check Wed 12 Aug.

Fix Recipe (NOT YET RUN - low priority):
INSERT INTO school_closures (start_date, end_date, name, note) VALUES
  (2027-08-02 Aug BH), (2028-08-06 Aug BH), (2029-08-05 Aug BH), (2030-08-04 Aug BH);

Status: OPEN (low priority). Last checked: Thu 13 Aug 2026 UTC (229th check)
Previous recipe: issue-3-addendum-12aug.md