# Issue 18 - Flavia Nascimento Mariano: Visa Null - Addendum 28 Jul 2026 (2nd touch)

Reporter: Staff. Sheet row 19. Last checked: Tue 28 Jul 2026 ~15:00 UTC (111th hourly run).

## Symptom
Student 983 (Flavia Nascimento Mariano): visa_status = null, not appearing in some staff views.

## Root cause (live DB)
- Student 983: visa_status = null (unchanged)
- Student record updated TWICE today 28 Jul 2026:
  - 09:38 UTC: bulk touch (automated, did not set visa)
  - 14:50 UTC: second update (manual? did not set visa either)
- 14d since visa_status last would have been set (student record last had data change Jul 14)
- Booking course 1710 (AY Afternoon): 2 SCAs confirmed (SCA256 Jun1-14 class9; SCA265 Jun15-Nov20 class11)
- Class assignment: RESOLVED - student continuously assigned through Nov 20 2026

## Notable: 14:50 UTC touch
The 14:50 record update is later than the 09:38 bulk cron touch. This suggests someone edited
the student record in SIS this afternoon but did not (or could not) set visa_status.
Possible cause: the visa dropdown may not be saving correctly (see issue-18-flavia-visa-save-error.md).

## Fix recipe (NOT YET RUN)
1. Verify correct visa status via HubSpot (search Flavia Nascimento Mariano).
2. Check if the SIS save error from earlier is still present (try setting visa in UI).
3. If UI fails, set directly:
   UPDATE students SET visa_status = '<STATUS>' WHERE id = 983;

## Risk
Data hygiene. Low risk. No class impact (student fully assigned). Visa null may hide from staff dashboards.

## Status
FIX NOT RUN. Student record touched again at 14:50 UTC today - someone may have attempted fix. Verify.

Last checked: Tue 28 Jul 2026 ~15:00 UTC (111th hourly check). Prior: issue-18-addendum-28jul.md