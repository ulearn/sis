Issues 37 and 43 - Bed 83 Stale Booking Accommodations
Reporter: KC | Area: Booking / Accommodation | Sheet rows: 39 (Issue 37), 45 (Issue 43)

Symptom (Issue 37)
Veronica Martin paid for a week in Capel but it does not appear in SIS allocation section.

Symptom (Issue 43)
Jesus Manuel Ramirez Diaz accommodation dates should be Jun 20 - Jul 4 2026.

Root Cause (verified 16 Aug 2026 UTC)
Bed 83 has 5 past Booking Accommodations still active = true, obscuring the allocation calendar.

Stale records (ended, still active = true):
| BA ID | Booking | Student                   | Period              | Fee       | Days Stale |
|-------|---------|---------------------------|---------------------|-----------|------------|
| 11239 | 22      | Ivan Rodriguez Solares     | 3-24 May 2026       | EUR 1,050 | 83         |
| 11168 | 92      | Diego Da Silva Saldanha    | 6-20 Jun 2026       | EUR 700   | 57         |
| 11285 | 17825   | Jesus Manuel Ramirez Diaz  | 21 Jun - 5 Jul 2026 | null      | 42         |
| 11352 | 18156   | Veronica Martin            | 4-11 Jul 2026       | EUR 360   | 36         |
| 11179 | 82      | Africa Mera Bachir         | 12 Jul - 9 Aug 2026 | EUR 1,360 | 7          |

Current occupant (do NOT touch): BA 11173 (booking 88, Alessandro Signorotti), 9-30 Aug 2026, fee EUR 1,080
Next check-in: BA 25 (booking 17844, Rosa Maria Mollica), 30 Aug - 11 Oct 2026, fee EUR 2,100 - 14 days

Fix Recipe (NOT YET RUN)

Step 1 - Deactivate 5 stale Booking Accommodations
Confirm end dates are all in the past, then:
UPDATE booking_accommodations SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);
WARNING: do NOT include BA 11173 (Alessandro, current occupant).

Step 2 - Set fee on BA 11285 (Jesus Manuel, fee = null)
Determine correct amount for Capel Street, 14 nights (Jun 21 - Jul 5):
UPDATE booking_accommodations SET fee = correct_rate WHERE id = 11285;

Step 3 - Verify bed 83 calendar after fix
Should show: Alessandro Signorotti (BA 11173) through Aug 30, then Rosa Maria Mollica (BA 25) from Aug 30.

Risk: Accommodation data hygiene. Reversible. Bed 83 allocation view only, no payment impact.

Status: Open - fix NOT run.
Last checked: 2026-08-16 UTC (38th check Issue 37 / 36th check Issue 43)