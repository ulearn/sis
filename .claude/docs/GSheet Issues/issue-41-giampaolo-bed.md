Issue 41 - Giampaolo Russo - Capel St Bed Unassigned (54th check 12 Aug 2026)

Reporter: KC  Area: Booking/Accomm  Sheet row: 43

Symptom: Student booked host family (2 Aug-6 Sep) and Capel Street apartment (6-14 Sep). Capel St bed not assigned.

Root Cause (54th check confirmed):
- Booking Accommodation 11357 (host family): bed 178, 2 Aug to 6 Sep 2026, active=true - CORRECT
- Booking Accommodation 11392 (Capel Street, 6-14 Sep 2026): bed_id = null - NOT assigned, fee = EUR 415 confirmed
- Bed 168 (Capel Street, Bed A): confirmed free 5 Sep to 27 Sep 2026
  Active occupancies on bed 168:
  - BA 11161 (bk 98): 8 Aug-22 Aug 2026 (current occupant)
  - BA 11218 (bk 44): 22 Aug-5 Sep 2026 (next occupant, ends 5 Sep)
  - BA 32 (bk 17823): 27 Sep-11 Oct 2026 (future booking)
  Gap: 5 Sep to 27 Sep = FREE. Giampaolo 6 Sep-14 Sep fits with no conflict.

Fix Recipe - NOT YET RUN:
  UPDATE booking_accommodations SET bed_id = 168 WHERE id = 11392;

  Via SIS admin: Accommodation -> find BA 11392 (Giampaolo Russo, Sep 6-14)
  -> assign bed 168 (Bed A, Capel St).

Risk: accommodation. Reversible. Blast radius: 1 student.
URGENCY: Moderate - 25 days to check-in. Bed 168 free and confirmed available.

Status: Fix NOT RUN. 54 consecutive checks. Bed 168 confirmed free 5 Sep-27 Sep.
Last checked: Wed 12 Aug 2026 UTC (54th check)