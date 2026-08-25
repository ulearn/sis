Issue 22 - Edite Nunes Class Assignment Missing (Addendum 29 Jul 2026 run C)

Reporter: AC | Area: Booking / Class | Sheet row: 23

Root cause (verified Wed 29 Jul 2026 UTC - 147th hourly check)
- Student 1015 (Edith Nunes): booking 18214, Confirmed, EUR 608 paid, confirmed=true
- Booking course 24991 (General English AM, 13 Jul to 7 Aug 2026): active=true, 0 class assignments - confirmed fresh
- Stale booking courses 24933 and 24934 should be deactivated
- BC 24991 ends 7 Aug 2026 - 9 days remaining

Fix recipe (NOT YET RUN)

Step 1 - Assign student to General English AM via SIS admin:
  Student 1015 → booking 18214 → BC 24991 → assign class for WB 27 Jul 2026.

Step 2 - Deactivate stale BCs 24933 and 24934:
  UPDATE booking_courses SET active = false WHERE id IN (24933, 24934);

Risk: bookings | Reversible: yes | Blast radius: 1 student, 3 booking courses.

Status: OPEN - Fix NOT RUN - CRITICAL: 9 days left (course ends 7 Aug)
Last checked: Wed 29 Jul 2026 UTC (147th hourly check)