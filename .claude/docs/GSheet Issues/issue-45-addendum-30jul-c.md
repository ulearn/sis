# Issue 45 — Renewal Students Not in Arrivals — 11 Stale BCs (ended Jul 24)
Reporter: Staff  |  Area: Renewal Students  |  Sheet row: 47

## Symptom
Renewal students whose old courses ended Fri Jul 24 not appearing in arrivals list.
Old booking courses (ended Jul 24) remain active=true and interfere with arrivals filtering.

## Current state (Thu 30 Jul 2026 UTC)
11 BCs ended 2026-07-24 still active=true:

BC20    Lalita Champakhong              Academic Year Morning             PENDING
BC37    Ralph Belizaire Calderon        Academic Year Afternoon           CONFIRMED
BC81    Pietro Colombo                  Morning General Plus              CONFIRMED
BC1781  Jose Geraldo Cursino de Moura   Morning General Plus              CONFIRMED
BC1792  Nicole Valentina Rueda Mendoza  Morning General Plus              CONFIRMED
BC24606 Martina Tartaro                 Morning General Plus      bk17822 CONFIRMED
BC24620 Jade Ribeiro                    General English AM                PARTIAL
BC24776 Mario Roggi                     General English AM                CONFIRMED
BC24828 Martina Tartaro                 12wk Morning GP + IELTS   bk17822 CONFIRMED (dup booking)
BC24989 Marcos Abrego Tofe              General English AM                CONFIRMED
BC25011 Eduardo Roche Diaz              General English PM        bk18233 CONFIRMED

Also: BC505 (Tuguldur Otgonbaatar, Academic Year Morning, ended Aug 15 2025) still active.
Note: 'Tuguldurtugs Enkhtugs' from issue G not found in DB by this name — may be different
spelling or already resolved.

## Fix recipe (NOT YET RUN)

### Step 1 — deactivate 11 stale Jul 24 BCs
  UPDATE booking_courses SET active=false
  WHERE id IN (20,37,81,1781,1792,24606,24620,24776,24828,24989,25011)
  AND active=true;
  -- Expected: up to 11 rows

### Step 2 — deactivate legacy BC505 (Tuguldur Otgonbaatar, ended Aug 2025)
  UPDATE booking_courses SET active=false WHERE id=505;

### Step 3 — verify renewal students appear in arrivals (week Aug 3 / 4)
After deactivating, check the arrivals list in SIS for week starting Aug 3/4.
Students with new active BCs starting that week should now appear.

## Note on wider pattern
Issue 36b (row 38) tracks 46 stale booking accommodations with the same root cause.
BCs are not auto-deactivated when end date passes. A nightly job or end-of-term batch
deactivation routine would prevent this recurring.

## Risk / category
- Category: data-hygiene — very low risk
- Reversible: set active=true if wrong BC deactivated
- 11 Jul 24 stale BCs + 1 legacy BC505

## Status
OPEN — 11 stale Jul 24 BCs unchanged; fix NOT RUN
Last checked: Thu 30 Jul 2026 UTC