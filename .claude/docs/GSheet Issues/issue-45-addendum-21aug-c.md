# Issue 45 addendum 21 Aug check 122
Reporter: KC | Sheet row 47 | Renewal students not appearing on arrivals list

Current state verified Fri 21 Aug 2026 ~12:00 UTC:
- Stale active Booking Courses (endDate <= today): 24,515
- (endDate < today boundary: 24,497 — 18 courses end exactly today)
- No change in count since late morning check 121. Fix NOT RUN.
- Root cause: renewal students with stale active BCs appear under old course on arrivals list.

Fix recipe (NOT YET RUN):
  Preview: SELECT COUNT(*) FROM booking_courses WHERE end_date <= CURRENT_DATE AND active = true;
  Execute: UPDATE booking_courses SET active = false WHERE end_date <= CURRENT_DATE AND active = true;
  Expected: ~24,515 rows affected. Run off-peak.

Risk: Bookings/data-hygiene. Large blast radius (24k+ rows). Mostly reversible.
Status: OPEN, Fix NOT RUN. Last checked: 2026-08-21 12:00 UTC (check 122)