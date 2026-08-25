# Spec — Auto Christmas shunt for AY-visa bookings

Status: **BUILT & TESTED (2026-06-05).** Live on the WON-webhook booking-create path.

## Implementation
- `src/scripts/christmas-shunt.ts` → `applyChristmasClosures(prisma, bookingId)`. Self-contained (weekday helpers copied verbatim from `scripts/bookings.ts` so the math matches manual holiday adds). No-op for non-AY; idempotent; iterates for LifePass; bypasses the manual entitlement/35-week guards (enforced closure ≠ personal entitlement).
- Hooked in `src/routes/webhooks.ts` right after `prisma.booking.create`, wrapped in try/catch so a shunt failure can never abort booking creation (it's re-runnable).
- Verified on throwaway bookings: single AY (+10 wd, end 15/02→01/03/2027), idempotent re-run (0), non-AY no-op, LifePass two-Christmas iteration (+10 then +12 wd). Test records deleted.
- To re-apply to an existing booking manually: `require('./dist/scripts/christmas-shunt').applyChristmasClosures(prisma, id)`.

## Goal
Replicate Fidelo's one virtue, cleanly: any **new** Academic-Year-family booking that spans the school's Christmas closure must, **automatically and code-enforced**, account for that closure — no manual step. Where Fidelo *split* the course (the mess we've spent today untangling), we **shunt a single continuous course** instead.

## Rule (single course, shunt — do NOT split)
On creation of an AY-family booking (and when an AY course's dates change):
1. For each `SchoolClosure` with **`name = 'Christmas'`** whose window falls within the course `[startDate, endDate]`:
   - insert a `BookingHoliday(type='school')` for that closure window, and
   - shunt the **course end** forward by the closure's weekday count (the existing addHoliday shunt — Christmas falls *during* a continuous course, so unlike the legacy gap-resident holidays it *does* push the end).
2. **Iterate**: a LifePass (3 stacked AYs ≈ 75 weeks) spans 2–3 Christmases, and each shunt extends the end, possibly pulling the next Christmas into range. Loop until no unapplied `Christmas` closure remains in the window.
3. **Idempotent**: never double-apply (a Christmas already represented by a `type='school'` holiday in that window is skipped). Safe to re-run.

## Scope
- **Only AY-visa students.** Accommodation, extras, EU courses, short courses, and all other services are **untouched** (the shunt moves the course end only, as today).
- **Christmas only.** Good Friday (and any 1-day bank holiday) stays a `SchoolClosure` for its school-side purposes (kills class occurrences, excludes payroll, signals the door is shut) but **never shunts** and is **not** a student holiday — one day, sold-by-the-week, unrecoverable, by design.
- Disambiguation is by the literal **`name = 'Christmas'`** on the `SchoolClosure` row (not duration/inference).

## AY-family detection (course name)
Primary = the four dropdown / `ay_catalog.json` names:
`General English Academic Year AM`, `… AM (Plus)`, `… PM`, `… PM (Plus)`.
Also match (until course-canon collapses them) the live aliases: `Academic Year Morning/Afternoon`, `Academic Year Morning/Afternoon Plus`, `Academic Year Renewal Morning/Afternoon`, `ULearn Renewal MORN/AFT`, `Renewal - Academic Year AM/PM`, `Life Pass Morning/Afternoon`, `WICE Visa Renewal MORN/AFT`. Renewals carry `isRenewal=true` but are the same AY course → included.
LifePass = a pack of 3 AY courses; its constituent courses already match → **no special handling.**

## Prerequisite
`SchoolClosure` must hold the `Christmas` window for every season a booking can reach. Neil is adding ~5 years of Christmases now (each `name='Christmas'`, dates per year — they flex annually — plus a per-year `note` like "Christmas 2026"). No silent-miss guard needed once populated.

## Trigger points (when built)
- AY-family booking creation: the HubSpot WON webhook path + the in-app new-booking flow.
- AY course date edits (re-evaluate; idempotent).

## Out of scope / already handled
- Legacy split-course bookings (Fidelo): safe as-is; their Christmas holidays are now tagged `type='school'` (95 re-tagged 2026-06-05). The dual representation never conflicts (gap-resident holidays don't shunt).
- Historical (pre-2023) backfill: not needed (see `MigrationCleanup/holiday-entity-backfill.md`).

## Open/risks
- Confirm trigger lives in the webhook booking-create path (and that course rows exist at that point).
- Accom deliberately excluded — revisit only if AY students ever need housing auto-extended over the shunt (Neil: no).
