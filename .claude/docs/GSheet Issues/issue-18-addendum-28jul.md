# Issue 18 — Flavia Nascimento Mariano: Visa Null (Addendum 28 Jul 2026)
Reporter: Staff. Sheet row 19. Last checked: Tue 28 Jul 2026 UTC (110th hourly run).

## Status: CLASS ASSIGNMENT RESOLVED
BC 1710 (Academic Year Afternoon, 1 Jun-20 Nov 2026) has 2 SCAs confirmed:
- SCA 256: Jun 1-14 2026, class 9 (initial 2-week entry)
- SCA 265: Jun 15-Nov 20 2026, class 11 (ongoing through course end)
Flavia is continuously assigned to class 11 through end of AY course.

## Status: VISA STILL OPEN
- Student 983 (Flavia Nascimento Mariano): visa_status=null — 14 days
- Student record updated 26 Jul 2026 (2 days ago) — touched but visa not set

## Fix recipe (NOT YET RUN)
1. Verify correct visa status via HubSpot (search by name/email).
2. Set: UPDATE students SET visa_status='<STATUS>', updated_at=NOW() WHERE id=983;

## Risk
Data hygiene. Low risk. No class impact (student already assigned). Previous: issue-18-addendum-26jul.md.