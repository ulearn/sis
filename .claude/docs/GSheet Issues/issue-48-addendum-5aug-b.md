Issue 48 - Class Assignment Anomalies (Multiple Students)
Reporter: AC | Area: Attendance/classes | Sheet row 50

Symptom: Multiple issues with class assignments and stale booking courses.

Root cause (53rd hourly check - Wed 5 Aug 2026 UTC)

Stale booking courses:
  BC 24630 (Francesca Fassina):    ends 2026-07-10, active=true, SCAs=0, 26d stale
  BC 24631 (Margherita Galbusera): ends 2026-07-10, active=true, SCAs=0, 26d stale
  BC 25006 (Marina Larripa):       ends 2026-08-03, active=true, SCAs=2, 2d stale
  Progress: BC 25006 now has 2 SCAs (was 0 on Aug 4).

Orphan payments (bookingId = null):
  Payment 16988: EUR 339.90 -> should link to booking 17856 (Galbusera)
  Payment 16989: EUR 339.90 -> should link to booking 17857 (Fassina)

Fix recipe (NOT YET RUN)

Step 1 - Deactivate stale BCs:
  UPDATE booking_course SET active = false WHERE id IN (24630, 24631, 25006);

Step 2 - Link orphan payments:
  -- Verify first: booking 17856 = Galbusera, 17857 = Fassina
  UPDATE payment SET booking_id = 17856 WHERE id = 16988;
  UPDATE payment SET booking_id = 17857 WHERE id = 16989;

Risk: data-hygiene | money | Reversible: yes | Blast radius: low
Status: Open - BCs 24630/24631 26d stale; BC 25006 2d stale; pmts orphaned 107d. NOT RUN.
Last checked: Wed 5 Aug 2026 UTC (53rd hourly check)