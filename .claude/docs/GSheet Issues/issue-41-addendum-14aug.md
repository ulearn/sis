Issue 41 - Giampaolo Russo (BA 11392 - bed unassigned, Sep 6 check-in)
Reporter: KC; Area: Booking / Accomm; Sheet row: 43

Symptom
Student booked host family (Aug 2-Sep 6) and apartment at Capel St (Sep 6-Sep 14). Apartment has no bed assigned.

Root cause (verified 14 Aug 2026 UTC)
BA 11357 (host family Aug 2-Sep 6): correctly placed.
BA 11392 (apartment Sep 6-Sep 14): bed_id = null, fee = EUR 415, active = true.
Available beds: 168 (A1) and 194 (Arasain-1) - confirmed available in prior checks.
Apartment check-in Sep 6, 2026 - 23 days away.

Fix recipe (NOT YET RUN)
1. Verify beds 168 and 194 still available for Sep 6-14 in Accommodation section.
2. Assign bed to BA 11392 (replace BED_ID with 168 or 194 after confirming):
   UPDATE "BookingAccommodation" SET bed_id = BED_ID, updated_at = NOW() WHERE id = 11392;
   Or via SIS admin UI: open Giampaolo Russo -> BA 11392 -> select bed.
3. Confirm fee EUR 415 correct for Sep 6-14 (8 nights).

Risk / category
bookings / accommodation; reversible; blast radius: 1 student.
Sep 6 check-in - 23 days to assign bed.

Status: OPEN - bed null, Sep 6 check-in (23 days). Fix NOT RUN.
Last checked: 2026-08-14 UTC (68th check)