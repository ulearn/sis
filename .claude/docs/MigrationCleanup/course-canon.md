# Course-Name Canonicalization — Recipe & Status

**Status:** PARKED, ready to run. AY + Plus families fully specified. Non-AY families need a canonical-name dictionary from Neil before they can be done.

## The problem
Fidelo migration brought courses in under Fidelo's names (e.g. "Academic Year Morning"). The new HubSpot→Xero pathway creates them under canonical names ("General English Academic Year AM"). Same product, two names → the SIS course dropdown (`SIS_CONFIG.course_names`) only lists canonical ones, so Fidelo-named courses show as a stray option "at the end".

## Impact (assessed 2026-06-03)
4,212 AY-family rows. **93.7% (3,945) are historical** (course ended); only 267 current (232 live students). So this is mostly **normalising historical naming — low impact on current operations**. The name is cosmetic; nothing operational keys off it (see lockstep).

## What keys off the course NAME (the lockstep map)
- **BREAKS on rename (exact-match Sets):** ILEP deriver `src/scripts/ilep-deriver.ts` + twin `src/scripts/backfill-ilep.ts` — `MORNING_AY_NAMES` / `AFTERNOON_AY_NAMES`. Canonical names are NOT in them → ILEP codes stop deriving (visa/LOA relevant). **MUST add canonical names to both Sets in lockstep.**
- **SURVIVES (substring):** `src/scripts/documents.ts` `isAcademicYearCourse` uses `.includes('academic year')` — canonical "General English **Academic Year** AM" still contains it → visa 35-wk window keeps working. ✅
- **Unaffected:** rosters / classes / assign / move guards (all `category`-driven); RENEWAL badge (`isRenewal` flag, not name); doc display (just shows new name).
- **Source that re-mints old names:** `src/routes/webhooks.ts:570-588` `cleanCourseName` — emits "Academic Year Morning" etc. for new deals. Fix to emit canonical, else re-pollution.

## isRenewal — CRITICAL for renewals
All 622 Fidelo renewal-named courses have **`isRenewal = false`** — their ONLY renewal marker is the word "Renewal" in the name. Renewals stay operationally identical to AY (same course/category/class); the renewal-ness is a badge/flag only (indicates 2nd/3rd course, internal or external, visa/IRP relevant). So when collapsing the name, **MUST set `isRenewal = true`** on those rows to preserve the designation before dropping "Renewal" from the name.

## Mapping (AY + Plus — confirmed by Neil)
| Current name | Count | → Canonical | Also |
|---|---|---|---|
| Academic Year Morning | 1,833 | General English Academic Year AM | — |
| Academic Year Afternoon | 1,149 | General English Academic Year PM | — |
| Academic Year Renewal Morning | 414 | General English Academic Year AM | `isRenewal=true` |
| ULearn Renewal MORN | 305 | General English Academic Year AM | `isRenewal=true` |
| Academic Year Renewal Afternoon | 208 | General English Academic Year PM | `isRenewal=true` |
| ULearn Renewal AFT | 156 | General English Academic Year PM | `isRenewal=true` |
| Academic Year Morning Plus | 117 | General English Academic Year AM Plus | — |
| Academic Year Afternoon Plus | 30 | General English Academic Year PM Plus | — |

Plus (non-AY) canonical names given by Neil: "General English AM Plus", "General English PM Plus" (map from "Morning General Plus" 1,376 / "Afternoon General Plus" 470 — pending confirm).

**TODO from Neil:** canonical names for the remaining ~89 non-AY families (Morning General 5,381, Afternoon General, Evening General, Intensive General 30, IELTS variants, CLOSED GROUP JUNIOR, CLIL, Young Learners, Private Lessons, +5 Hours, etc.) — "make everything canonical" but needs the dictionary.

## Execution order (when greenlit)
1. Add all canonical names to `ilep-deriver.ts` + `backfill-ilep.ts` Sets. Build.
2. Fix `webhooks.ts` `cleanCourseName` to emit canonical names. Build + restart.
3. Rename bookingCourse rows per mapping; set `isRenewal=true` on the renewal rows. Snapshot first.
4. Find the `/config` course-names source and delete now-unused legacy entries from the dropdown list.

Snapshots to hub `…/MigrateRecon/`. Reversible.
