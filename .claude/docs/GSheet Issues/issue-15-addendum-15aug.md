Issue 15 — Saikhantes Shagdarsuren (Student 1001) — Addendum 15 Aug 2026

Reporter: KC/TB | Area: Booking / Class | Sheet row: 16

SYMPTOM
Course dates and holidays make no sense; Student Class Assignment expired; service_end in the past.

CURRENT STATE (120th check — Sat 15 Aug 2026 UTC)

Booking 18151
- Status: CONFIRMED, confirmed=true
- Amount paid: EUR 1,339.20 | Amount open: EUR 0
- service_end: 7 Aug 2026 — expired 8 days ago
- Last admin action: 8 Jul 2026 (37 days without update)

Booking Course 24925
- Name: Academic Year Afternoon
- Dates: 9 Mar 2026 – 2 Oct 2026, active=true

Student Class Assignment 255 (only SCA for student 1001)
- Class: 11
- week_start: 12 Jan 2026 | week_end: 3 Jul 2026
- 43 days stale (Jul 3 to Aug 15)
- No newer Student Class Assignment exists

Note: Unknown if student is still attending. No admin review since Jul 8.

FIX RECIPE (NOT YET RUN)

Step 1: Confirm with KC/TB — is student currently in class?

Step 2a (if still attending): Create new Student Class Assignment
  SIS admin -> Student 1001 -> Booking 18151 -> Booking Course 24925 -> Class Assignments
  New Student Class Assignment:
    class_id: 11 (or new class if moved)
    week_start: 2026-07-04
    week_end: 2026-10-02
  Save

  Update service_end:
    UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;
    -- NOT YET RUN

Step 2b (if finished): Deactivate Booking Course 24925
  SIS admin -> Booking Course 24925 -> active=false
  Set service_end to actual leave date.

RISK: reversible; single student; attendance gap since Jul 3
STATUS: OPEN — awaiting KC/TB confirmation. Last checked: 2026-08-15 UTC (120th check)