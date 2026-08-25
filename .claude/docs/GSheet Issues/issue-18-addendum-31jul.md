# Issue 18 — Flavia Nascimento Mariano visa null (1st check Fri 31 Jul 2026)

Reporter: various | Area: Visa | Sheet row: 19

## Status: Unchanged from 30 Jul; hash change is whitespace artefact

## Evidence (live DB)

- Student 983 (Flavia Nascimento Mariano): visa_status = null (last touched 2026-07-28 14:50 UTC)
- Class assignment 265: class 11 (B1 PM), Jun 15 to Nov 20 2026 — student IS assigned, no ops impact
- Class assignment 256: class 9 (A2 PM), Jun 1-14 2026 — prior class (ended)

## KEY FINDING — visa_status column is TEXT, correct case is Approved

Column type: text (NOT an enum). Values in use across all students: Approved, Pending, Refused.

Prior recipe (issue-18-addendum-30jul-c.md) used APPROVED (all-caps) — INCORRECT. Correct value is Approved.

## Fix recipe (NOT YET RUN)

Verify visa is confirmed in HubSpot for student 983, then:
  UPDATE students SET visa_status = 'Approved', updated_at = NOW() WHERE id = 983;

The PrismaClientKnownRequestError on UI save is a separate UI validation bug unrelated to visa_status. Direct DB fix bypasses it.

## Risk: Bookings/visa — reversible. Blast radius: 1 student.
## Last checked: Fri 31 Jul 2026 UTC (1st check today)
