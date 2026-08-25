Issue 18 -- Flavia Nascimento Mariano: visa inconsistency (11th check, 8 Aug 2026)

Reporter: AC | Area: Visa | Sheet row: 19 | Check: 11th hourly -- Sat 8 Aug 2026 UTC

SYMPTOM
Student visa shows as pending in UI; saving visa status triggers a PrismaClientKnownRequestError.

ROOT CAUSE (verified live, 8 Aug 2026)
- Student 983 (Flavia Nascimento Mariano): visaRequired=false, visaId=null
- visaFrom = 2026-06-01, visaUntil = 2027-02-01 (dates set but no visa document linked)
- Inconsistency: visa dates are present but visaRequired=false and visaId=null
  Possible cause: dates were set manually (or via migration) without creating a visa record or setting visaRequired=true
- The UI may derive a "visa pending" state from the presence of visaFrom/Until without a linked visaId
- Booking 1534: CONFIRMED, confirmed=true, EUR 1,308 fully paid
- BC 1710 (Academic Year Afternoon, 1 Jun to 20 Nov 2026): active=true, current
- HubSpot contact ID: 783659478249
- Last DB update: 28 Jul 2026

FIX RECIPE (NOT YET RUN)

Step 1 -- Check the Prisma error details:
  In SIS app logs (.sis.log or the admin UI error log), find the exact PrismaClientKnownRequestError message when trying to update visa status for student 983. Note the failing field/relation.

Step 2 -- Option A: Clear inconsistent visa dates (if visa not actually required):
  UPDATE students SET visa_from = NULL, visa_until = NULL, updated_at = NOW() WHERE id = 983;
  This removes the dangling date fields that may be causing the UI to show "visa pending".

Step 3 -- Option B: Properly set visa as approved (if visa IS approved):
  First check with AC/ST whether Flavia has a valid visa.
  If yes: UPDATE students SET visa_required = true, visa_from = '2026-06-01', visa_until = '2027-02-01', updated_at = NOW() WHERE id = 983;
  Then generate and issue a visa document via SIS admin (Students > 983 > Documents).

NEIL INPUT NEEDED
- Does Flavia actually have a visa? (visaFrom 2026-06-01 to 2027-02-01 -- 8 months, plausible)
- Is visaRequired=false correct or should it be true?
- What exact Prisma error occurs when trying to update?

RISK
Category: documents / visa. Reversible: yes. Blast radius: 1 student.

STATUS
Open -- Fix NOT RUN. Last checked: Sat 8 Aug 2026 UTC (11th hourly run)
