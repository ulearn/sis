# Issue 15 Addendum 30jul-f (133rd check Thu 30 Jul 2026 UTC)

Reporter: PG | Sheet row: 16

Symptom: Saikhantes Shagdarsuren (s1001) — class assignment expired Jul 3, holiday Jul 20-Aug 21, returns Mon 24 Aug.

Fresh DB check:
- Student 1001: visaStatus=null, booking 18151 CONFIRMED/true.
- BC 24925 (AY Afternoon, Mar 9-Oct 2 2026): active=true.
- SCA 255: class 11 (B1 PM), week_start=2026-01-12, week_end=2026-07-03. No replacement. 0 total SCAs on BC 24925.
- Holiday ends Aug 21. Returns Mon Aug 24. Not urgent until Aug 17.
- Old BC 1982 (bk1724, ended Dec 19 2025): still active — cosmetic stale.
- No change from 30jul-e.

Fix (see 30jul-e for full SQL):
Step 1: INSERT student_class_assignments (24925, 11, 2026-08-24, 2026-10-02, 1001, NOW()).
Step 2: UPDATE booking_courses SET active=false WHERE id=1982.
Step 3: Confirm visaStatus via HubSpot.

Status: NOT RUN. 133rd check Thu 30 Jul 2026. Action window: Aug 17-24.
