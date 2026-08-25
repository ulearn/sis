Issue 37 - Veronica Martin: Stale Accommodation Records (17th check, Fri 7 Aug 2026)
Reporter: KC | Area: Booking / Accomm | Sheet row: 39

Root cause (17th check - unchanged)
Booking accommodation 11285 (booking 17825, Jesus Ramirez Diaz): bed 83, ended 5 Jul 2026, active = true - 33 days stale, fee = null
Booking accommodation 11352 (Veronica Martin, student 278, booking 18156): bed 83, ended 11 Jul 2026, active = true - 27 days stale, fee EUR 360
Both BAs use bed 83. While stale and active, bed 83 shows as occupied, blocking reallocation.
Cosmetic only - no live student is in bed 83.

Fix recipe (NOT YET RUN)
  UPDATE booking_accommodations SET active = false WHERE id IN (11285, 11352);

After running: bed 83 appears as unoccupied and available for reallocation.

Risk: data-hygiene / accommodation; reversible; cosmetic only
Status: BA 11285: 33 days stale. BA 11352: 27 days stale. Both blocking bed 83. Fix NOT RUN.
Last checked: Fri 7 Aug 2026 UTC (17th check)