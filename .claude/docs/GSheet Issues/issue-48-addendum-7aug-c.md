Issue 48 - Renewal Students Missing / Francesca Fassini (67th check Fri 7 Aug 2026 UTC)

NEW FINDING: Student 14462 (Francesca Fassina, email francescafassina98@gmail.com) exists in SIS.
The name Fassina vs Fassini is a one-letter variant - very likely the same person. Needs human confirmation.

Evidence (Fri 7 Aug 2026 UTC):
- No record with surname Fassini in SIS
- Student 14462 Francesca Fassina (francescafassina98@gmail.com): closest match (spelling variant)
- Bk 17856 (Margherita Galbusera): CONFIRMED, confirmed=false, amount_paid=339.90, service_end=null
- Bk 17857: CONFIRMED, confirmed=false, amount_paid=339.90, 0 payments directly linked
- BC 24630: active=true ended 10 Jul 2026 (28d stale, 0 SCAs)
- BC 24631: active=true ended 10 Jul 2026 (28d stale, 0 SCAs)
- Orphan pmt 16988 (EUR 339.90, Bank, 28 Apr 2026): booking_id=null
- Orphan pmt 16989 (EUR 339.90, Bank, 28 Apr 2026): booking_id=null

Fix recipe (NOT YET RUN):
Step 1: Ask staff - is student 14462 Francesca Fassina (francescafassina98@gmail.com) the same as Francesca Fassini in issue?
  If YES: no new record needed. Optionally fix spelling if required.
  If NO: create new student for Francesca Fassini.
Step 2: UPDATE payments SET booking_id = 17856 WHERE id = 16988; (also Issue 1 - do not double-run)
Step 3: UPDATE payments SET booking_id = 17857 WHERE id = 16989; (also Issue 1 - do not double-run)
Step 4: UPDATE bookings SET confirmed = true, amount_open = 0 WHERE id IN (17856, 17857);
Step 5: UPDATE booking_courses SET active = false WHERE id IN (24630, 24631); (also Issue 1 - do not double-run)
Step 6: Fix service_end on bk 17856 (currently null) - find correct end date from HubSpot/BC end date
  UPDATE bookings SET service_end = YYYY-MM-DD WHERE id = 17856;

Risk: Data hygiene + financial. Reversible. Status: UNRESOLVED - Fassina/Fassini confirmation needed.