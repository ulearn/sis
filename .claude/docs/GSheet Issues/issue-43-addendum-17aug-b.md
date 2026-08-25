Issue 43 -- Jesus Manuel Ramirez Diaz / Bed 83 stale BAs (38th check, 17 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 45

Symptom
Accommodation dates should be Jun 20 to Jul 4. Fee not set on BA 11285.

Root cause (evidence)
- BA 11285 (booking 17825, Jesus Manuel Ramirez Diaz): start 2026-06-21, end 2026-07-05, fee = null -- 43 days stale
- Bed 83 cluster -- 5 stale active BAs:
  - BA 11239: May 3-24 2026 (85d past end), fee = EUR 1,050
  - BA 11168: Jun 6-20 2026 (58d past end), fee = EUR 700
  - BA 11285: Jun 21-Jul 5 2026 (43d past end), fee = null
  - BA 11352: Jul 4-11 2026 (37d past end), fee = EUR 360
  - BA 11179: Jul 12-Aug 9 2026 (8d past end), fee = EUR 1,360
- Current occupant: BA 11173 (Alessandro Signorotti, booking 88), Aug 9-30 2026, active, fee = EUR 1,080
- Next check-in: BA 25 (Rosa Maria Mollica, booking 17844), Aug 30 2026, fee = EUR 2,100 -- 13 days

Fix recipe (NOT YET RUN)

Step 1 -- Confirm fee for BA 11285 with KC (dates were disputed):
  UPDATE BookingAccommodation SET fee = <agreed_amount> WHERE id = 11285;

Step 2 -- Deactivate 5 stale BAs on bed 83 (NOT here):
  UPDATE BookingAccommodation SET active = false WHERE id IN (11239, 11168, 11285, 11352, 11179);

Step 3 -- Verify bed 83 clean:
  SELECT id,bookingId,startDate,endDate,active,fee FROM BookingAccommodation WHERE bedId = 83 ORDER BY startDate;

Risk / Category
Data hygiene + accommodation | Reversible | Blast radius: bed 83 occupancy view | DEADLINE: Aug 30 next check-in (13 days)

Status
OPEN -- fix NOT RUN. 5 stale BAs on bed 83. Aug 30 check-in 13d.
Last checked: 2026-08-17 UTC (38th check)