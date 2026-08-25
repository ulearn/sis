# Issue 26 - Ivan Rodriguez (66th check)
Reporter: Staff | Area: Booking/Class | Sheet row: 27 | Sun 16 Aug 2026 UTC

Symptom: Intensive students only appear once in to-be-assigned list.

Root Cause (66th check - 16 Aug 2026 UTC):
- BC 23 (Intensive General 30): active, ended 2026-05-22 - 86 days stale (SCAs 122+376 historical, within course)
- BC 24826 (2 weeks Intensive General 30): active, ended 2026-06-19 - 58 days stale, 0 SCAs
- Booking 18034: PARTIAL, confirmed=false, EUR 845 paid, EUR 250 open - unchanged since 7 Jun 2026
- No change from 65th check (Sat 15 Aug). Stale counts +1.

Fix Recipe (NOT YET RUN):
1. Deactivate BCs 23+24826: UPDATE BookingCourse SET active=false WHERE id IN (23,24826)
2. Chase EUR 250 on booking 18034; set confirmed=true once paid

Risk: Bookings + money | Reversible | EUR 250 open needs follow-up
Status: Open - fix NOT RUN | Last checked: Sun 16 Aug 2026 UTC
