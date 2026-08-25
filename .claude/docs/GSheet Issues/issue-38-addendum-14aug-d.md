Issue 38 addendum 14 Aug D -- BC 25043 ended today, still active

Reporter: various | Area: Holidays, Bookings | Sheet row: 40
165th check -- Fri 14 Aug 2026 UTC

Context:
Eduardo Roche Diaz (Booking 18265, BC 25043, student 14602).
Certificate 566 changed DRAFT -> ISSUED in the 164th check (earlier this morning).

Root cause (verified 165th check):
- Booking Course 25043 (General English PM): endDate = 2026-08-14 (TODAY), active = true
- 0 student class assignments remain on BC 25043
- Safe to deactivate: 0 SCAs, cert already issued, course complete
- Certificate 566: status = ISSUED (v1), updatedAt 2026-08-14 08:41 UTC -- confirmed still ISSUED

Evidence:
BC 25043: active=true, endDate=2026-08-14 (today), SCAs=0
Cert 566:  status=ISSUED, versionNo=1, updatedAt=2026-08-14T08:41:18.327Z

Fix recipe (NOT YET RUN):

Step 1 - Deactivate ended Booking Course 25043:
  UPDATE BookingCourse SET active = false, updatedAt = NOW() WHERE id = 25043;
  Safe: 0 SCAs, cert issued. Data hygiene only.

Risk / category:
- Category: data-hygiene; reversible; blast radius: 1 booking course record
- Cert concern: RESOLVED (cert 566 is ISSUED)

Status:
Cert RESOLVED. BC 25043 deactivation PENDING -- ended today, still active.
Last checked: 2026-08-14 UTC (165th check)
Previous recipe: issue-38-addendum-14aug-c.md
