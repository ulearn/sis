Issue 18 - Flavia Nascimento Mariano - Visa Null (Addendum 26 Jul 2026)

Reporter: ST | Area: Visa | Sheet row: 19

Root cause (fresh data 26 Jul 2026 UTC):
- Student 983 Flavia Nascimento Mariano: visa_status = null (12 days, since Jul 14 update)
- Booking course 1710 (Academic Year Afternoon, Jun 1-Nov 20 2026): active=true, 1 current SCA
- Student is actively attending class
- Original Prisma save error already resolved; only cosmetic null visa_status remains

Fix recipe (NOT YET RUN):
1. Confirm actual visa status via HubSpot contact for student 983
2. UPDATE students SET visa_status = APPROVED WHERE id = 983; (or PENDING per HubSpot)

Risk/Category: data-hygiene, reversible; urgency: low (student attending, null is cosmetic)

Status: OPEN - Fix NOT RUN.
Last checked: 26 Jul 2026 UTC (108th hourly run)