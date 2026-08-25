Issue 41 - Giampaolo Russo / Dual Accommodation (128th check, Wed 19 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 43

Symptom: Fees missing on two upcoming accommodation records.

Root cause (verified, 19 Aug 2026 ~10:30 UTC):
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, paid EUR 2,584.96, open EUR 0
- Accommodation 11357 (bed 178): ended 15 Aug 2026, 4 days stale, active - needs deactivation
- Accommodation 11396 (bed 44): 15 to 22 Aug 2026 (Sat checkout), active, fee = null - URGENT (3d)
- Accommodation 11397 (bed 89): 22 Aug to 6 Sep (Sat check-in), active, fee = null - URGENT (3d)
- Accommodation 11392 (bed 168, Capel St apartment): 6 Sep to 14 Sep, fee = EUR 415 - already configured; no action needed

Fix recipe (NOT YET RUN):
Step 1 (URGENT before Sat 22 Aug): Set fees on Accommodations 11396 + 11397 only.
  (Note: BA 11392 fee = EUR 415 is already set -- no action needed on it.)
  Check beds 44 and 89 rates from provider contract.
  UPDATE booking_accommodations SET fee = AMOUNT_44, updated_at = NOW() WHERE id = 11396;
  UPDATE booking_accommodations SET fee = AMOUNT_89, updated_at = NOW() WHERE id = 11397;
Step 2: Deactivate stale Accommodation 11357.
  Verify checkout completed, then:
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11357;
  Note: BA 11357 also in Issue 50 stale list - coordinate.
Step 3: Check for duplicate student class assignment.
  SELECT id, booking_course_id, class_id, week_start, week_end FROM student_class_assignments
  WHERE student_id = (SELECT student_id FROM bookings WHERE id = 18180) ORDER BY week_start;

Risk: accommodation. Step 1 URGENT. Reversible. Blast radius: 1 student, 3 BAs.
Status: OPEN - Fix NOT RUN | Last checked: Wed 19 Aug 2026 ~10:30 UTC (128th check)
Note (128th check): BA 11392 (bed 168, Capel St, Sep 6-14, fee EUR 415) added to root cause -- was absent from prior H cell. It is correctly configured.