# Issue 3 Addendum 12 Aug 2026 (228th run) — School Closures Status

Reporter: system  Area: Booking/Holidays  Sheet row: 4

Christmas shunt FIXED. Pending: August Bank Holiday entries for 2027-2030.

## Current State (228th run — unchanged)
9 closures in DB:
  id=1  Good Friday 2026: 2026-04-03 (past)
  id=11 Good Friday 2027: 2027-03-26
  id=12 Good Friday 2028: 2028-04-14
  id=13 Good Friday 2029: 2029-03-30
  id=14 Good Friday 2030: 2030-04-19
  id=7  Christmas 2026: 2026-12-21 to 2027-01-03
  id=8  Christmas 2027: 2027-12-20 to 2028-01-04
  id=9  Christmas 2028: 2028-12-18 to 2029-01-02
  id=10 Christmas 2029: 2029-12-24 to 2030-01-06

Missing: Aug BH 2027 (2027-08-02), 2028 (2028-08-07), 2029 (2029-08-06), 2030 (2030-08-05)

## Fix Recipe (NOT YET RUN — low priority)
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday) VALUES
  ('August Bank Holiday', '2027-08-02', '2027-08-02', true),
  ('August Bank Holiday', '2028-08-07', '2028-08-07', true),
  ('August Bank Holiday', '2029-08-06', '2029-08-06', true),
  ('August Bank Holiday', '2030-08-05', '2030-08-05', true);

## Risk
Category: data-hygiene. Low priority. Reversible.

## Status
Christmas shunt: FIXED. Aug BH 2027-2030: NOT YET ADDED.
Last checked: Wed 12 Aug 2026 UTC ~21:00 (228th run)