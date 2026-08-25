Issue 38 addendum 14 Aug C — Eduardo Roche Diaz cert ISSUED
Reporter: various | Area: Holidays, Bookings | Sheet row: 40

Symptom
Staff reported students not appearing in class assignment lists due to date picker UX.
Sub-issue here: Eduardo Roche Diaz (Booking 18265, BC 25043) had cert 566 stuck in DRAFT.

Root cause (verified 14 Aug 2026 UTC, 164th check)
- Certificate 566: status changed from DRAFT to ISSUED (v1) — detected this check
- Cert was issued on or after the 163rd check (Fri 14 Aug ~10:11 UTC) — likely manually by Neil
- Booking Course 25043 (General English PM, Aug 10-14 2026): active=true — stale (ended today)
- 0 SCAs remain — cert was issued without SCA-based attendance data
- Booking 18265 (Eduardo Roche Diaz, student 14602): CONFIRMED, confirmed=true, EUR 126 paid

Evidence
BC 25043:  active=true, endDate=2026-08-14 (stale)
Cert 566:  status=ISSUED, versionNo=1, createdAt=2026-08-13
SCAs BC25043: 0 records

Remaining fix recipe (NOT YET RUN)

Step 1 - Deactivate ended Booking Course 25043:
  UPDATE "BookingCourse" SET active = false, "updatedAt" = NOW() WHERE id = 25043;
  Data hygiene only. Cert already issued; no document impact.

Risk / category
- Category: data-hygiene; reversible; blast radius: 1 booking course record
- Cert concern: RESOLVED (cert 566 is now ISSUED)
- Only remaining action: deactivate stale BC 25043

Status
CERT RESOLVED — cert 566 changed DRAFT to ISSUED during this check window.
Remaining: deactivate BC 25043 (minor data hygiene, low priority).
Last checked: 2026-08-14 UTC (164th check)