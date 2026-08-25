Issue 41 — Giampaolo Russo (apartment bed unassigned)

Reporter: Diego | Area: Booking / Accomm | Sheet row: 43 | Student ID: 14571

Symptom
Student booked host family (assigned) + apartment Sep 6–14 (bed not assigned). Check-in 24 days away (6 Sep 2026).

Root cause (live data — 61st check, Thu 13 Aug 2026 UTC)

- Booking Accommodation 11357 (host family): bed 178, Aug 2 to Sep 6 2026, fee = EUR 1,250, active — correct
- Booking Accommodation 11392 (apartment): bedId = null, Sep 6 to Sep 14 2026, fee = EUR 415, active
- Occupied beds Sep 6–14: 83, 161, 190, 38, 179, 88, 84, 33, 87
- Available:
    Bed 168 — name Bed A, room A1 / Room 1, property A1 (available)
    Bed 194 — name Bed1, room Arasain-1, property Arasain (available)

Fix recipe (NOT YET RUN)

Step 1 — Choose bed (Neil decision): 168 (A1) or 194 (Arasain)

Step 2 — Assign bed to BA 11392
  NOT YET RUN
  UPDATE booking_accommodations SET bed_id = <BED_ID>, updated_at = NOW() WHERE id = 11392;
  Verify: SELECT id, bed_id, start_date, end_date, fee FROM booking_accommodations WHERE id = 11392;

Step 3 — Confirm no double-booking before running
  SELECT id, bed_id, start_date, end_date FROM booking_accommodations
    WHERE bed_id = <BED_ID> AND start_date < '2026-09-14' AND end_date > '2026-09-06';
  Should return 0 rows (no conflicts).

Risk / category
- Category: bookings / accommodation
- Reversible: yes
- Blast radius: single student; run double-booking check first
- Urgency: MEDIUM-HIGH — check-in Sep 6 = 24 days

Status
Open — fix NOT RUN as of 61st check Thu 13 Aug 2026 UTC. Beds 168 (A1) and 194 (Arasain) available.