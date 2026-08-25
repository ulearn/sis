# Issue 18 — Flávia Nascimento Mariano Visa Status (9th check)
Reporter: AC | Area: Visa | Sheet row: 19 | Checked: Thu 6 Aug 2026 UTC

## Symptom
Student shows visa pending, not displaying in class-assignment view. PrismaClientKnownRequestError when staff tries to save visa status via UI dropdown.

## Root Cause — live data Thu 6 Aug 2026 UTC (unchanged from 8th check)

- Student 983 (Flávia Nascimento Mariano): visa_status = null, last DB update 2026-07-28 (9 days ago)
- Booking 1534: CONFIRMED, confirmed = true, amountPaid = EUR 1,308, amountOpen = EUR 0 — fully paid
- Booking course 1710 (Academic Year Afternoon, 1 Jun to 20 Nov 2026): active = true
- Class assignments: SCA 256 (class 9) + SCA 265 (class 11) — student actively assigned to class
- visa_status field is a plain string in Postgres (no Postgres enum constraint found) — PrismaClientKnownRequestError is likely a Prisma model validation issue in the UI route handler, not a DB constraint

Student is attending class normally; visa_status = null is a data-quality anomaly only.

## Fix Recipe (NOT YET RUN)

Option A — Via SIS admin UI (if the save error is intermittent):
  Go to admin > Students > Student 983 > Edit > Visa Status > select Approved > Save

Option B — Direct DB update (if UI consistently throws PrismaClientKnownRequestError):
  In sis/ directory:
    node --env-file=.env -e 'const {PrismaClient}=require("./dist/generated/prisma/client"); ... p.student.update({where:{id:983},data:{visaStatus:"Approved"}})'
  NOTE: NOT YET RUN — review visaStatus valid values in prisma/schema.prisma first.

Option C — Investigate the Prisma error:
  If Option B also fails, check prisma/schema.prisma for the visaStatus field type.
  The error may be an enum mismatch (e.g., valid value is "APPROVED" not "Approved").

## Risk / Category
data-hygiene / visa — reversible. Blast radius: 1 student field.

## Status
Open — visa_status still null, 9 days since last DB update. Student in class, no operational impact.
Last checked: Thu 6 Aug 2026 UTC (9th hourly run)