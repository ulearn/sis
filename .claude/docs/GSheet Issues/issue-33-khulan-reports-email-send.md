# Issue 33 - Khulan Badrak: No students selected on bulk email send from Reports

Reporter: PG (Khulan Badrak)
Area: Student Reports
Sheet row: 41
Last checked: 2026-06-18 UTC (hourly bot)

## Symptom

User selects student from student list in Reports, sees 1 recipient selected, clicks Send, gets error: no students selected.
Also reported by Paul Jun 2026 (see comment admin.html line 1348).

## Root cause

sendBulkEmail() at line 1494 reads the LIVE bulkSelectedStudents Set:
  const ids = [...bulkSelectedStudents];

But showStudentsInSchoolReport() clears bulkSelectedStudents on every render (line 2219):
  bulkSelectedStudents.clear();

This fires on date-filter change, This-week click, or any report navigation.
If the report reloads between checkbox-tick and Send click (including while modal is open),
bulkSelectedStudents is wiped. Modal header shows correct count (captured in local ids var
at openBulkEmailModal line 1367) but sendBulkEmail re-reads the now-empty live Set.

### Intended fix was documented but never wired up

Line 1349 declares _bulkEmailRecipientIds as the intended frozen snapshot:
  // Recipients frozen when the bulk-email modal OPENS. sendBulkEmail() uses these,
  // not the live set (Paul, Khulan Badrakh, Jun 2026).
  let _bulkEmailRecipientIds = [];

openBulkEmailModal() never assigns to it; sendBulkEmail() never reads from it.

## Fix recipe (NOT YET RUN)

Two edits in public/admin.html:

Change 1: freeze recipients at modal open (line 1367, inside openBulkEmailModal)
  BEFORE: const ids = [...bulkSelectedStudents];
  AFTER:  const ids = [...bulkSelectedStudents];
          _bulkEmailRecipientIds = ids;   // ADD THIS LINE

Change 2: read frozen snapshot in sendBulkEmail (line 1494)
  BEFORE: const ids = [...bulkSelectedStudents];
  AFTER:  const ids = _bulkEmailRecipientIds.length ? _bulkEmailRecipientIds : [...bulkSelectedStudents];

Static file - no build/restart needed, browser reload only.

## Risk / category

Category: code / UI bug
Reversible: yes, trivial revert, zero DB change
Blast radius: zero

## Status

Recipe written - NOT YET APPLIED
Last checked: 2026-06-18 UTC
**Jun19 hrly15 (this run):** Fresh grep confirms: L1349 _bulkEmailRecipientIds=[] declared but (a) L1366 openBulkEmailModal() does NOT set it, (b) L1494 sendBulkEmail() reads live [...bulkSelectedStudents]. Bug persists. L2219 showStudentsInSchoolReport() calls bulkSelectedStudents.clear() on every render. Fix recipe above is still correct (2 lines, no build). Row 41 B/F/G hash changed since last seen.json — reporter may have added context. Code state: unchanged. Last checked: 2026-06-19T14:08 UTC.
**Jun19 this run (interactive session):** Fresh grep confirms L1349 _bulkEmailRecipientIds=[] declared but NOT set in openBulkEmailModal (only 1 grep hit). sendBulkEmail L1494 reads live bulkSelectedStudents. Code unchanged. Fix recipe still valid: 2 lines, no build.


**Jun20 SAT hrly — Bug persists (fresh code check). _bulkEmailRecipientIds (L1349) declared but NOT set in openBulkEmailModal (L1367 captures local ids var but never assigns to _bulkEmailRecipientIds). sendBulkEmail (L1494) still reads live [...bulkSelectedStudents], which showStudentsInSchoolReport (L2219) clears on every render. Fix is 2 lines in public/admin.html — no build or server restart needed (static file). NOT YET APPLIED. Last checked: 2026-06-20 UTC hrly.**

**Jun21 hrly — Bug CONFIRMED STILL PRESENT (fresh code check). admin.html L1349: _bulkEmailRecipientIds=[] declared but NEVER SET. openBulkEmailModal L1367 captures ids=[...bulkSelectedStudents] correctly into local var but does not assign to _bulkEmailRecipientIds. sendBulkEmail L1494 reads live [...bulkSelectedStudents] — cleared at L2219 by showStudentsInSchoolReport() on any render. Fix: add _bulkEmailRecipientIds = ids; after L1367; change L1494 to const ids = _bulkEmailRecipientIds.length ? _bulkEmailRecipientIds : [...bulkSelectedStudents];. Static file — no build or restart. NOT YET APPLIED. Last checked: 2026-06-21 UTC hrly.**

**Jun22 hrly — Bug CONFIRMED STILL PRESENT (fresh code check). admin.html L1349: _bulkEmailRecipientIds=[] declared but NEVER SET in openBulkEmailModal. L1367 captures local ids=[...bulkSelectedStudents] but does NOT assign to _bulkEmailRecipientIds. sendBulkEmail L1494 reads live [...bulkSelectedStudents] — cleared at L2219 by showStudentsInSchoolReport on any render. Fix recipe unchanged (2 lines, no build). NOT YET APPLIED. Last checked: 2026-06-22 UTC hrly.**


Last checked: 2026-06-23 UTC hrly: Bug CONFIRMED STILL PRESENT (fresh code check). admin.html line 1349 declares _bulkEmailRecipientIds=[] as intended frozen snapshot — but openBulkEmailModal (line 1365) captures ids=[...bulkSelectedStudents] into a local const, NEVER assigns it to _bulkEmailRecipientIds. sendBulkEmail (line 1494) reads live [...bulkSelectedStudents] which is cleared at line 2219 by showStudentsInSchoolReport on any report render. Result: if report view updates between checkbox selection and Send click, the live set is empty. FIX (2 lines, no build/restart): (1) After line 1367 add: _bulkEmailRecipientIds = ids; (2) In sendBulkEmail line 1494 change: const ids = [...bulkSelectedStudents]; -> const ids = _bulkEmailRecipientIds.length ? [..._bulkEmailRecipientIds] : [...bulkSelectedStudents];

**Jun25 hrly (2nd check, fresh code): BUG CONFIRMED STILL PRESENT. L1349: _bulkEmailRecipientIds=[] declared but NEVER assigned in openBulkEmailModal() (L1367 captures to local const ids only, does NOT assign to _bulkEmailRecipientIds). L1494 sendBulkEmail() reads live [...bulkSelectedStudents] — cleared by showStudentsInSchoolReport L2219 on every render/filter/navigation. Result: any report update between checkbox-tick and Send wipes the selection. Fix remains 2 lines in public/admin.html, no build or restart. NOT YET APPLIED. Last checked: 2026-06-25 UTC hrly (2nd check today).**

Last checked Jun28 SUN UTC (3rd code check, public/admin.html): Bug STILL PRESENT. L1355 _bulkEmailRecipientIds=[] declared. Comment L1351-1354 documents intended fix (frozen snapshot) but code change NOT applied. L1373 const ids=[...bulkSelectedStudents] — correct local capture, but not saved to _bulkEmailRecipientIds. L1500 sendBulkEmail() still reads [...bulkSelectedStudents] directly (live set, cleared on navigation). Fix (2 lines, NOT RUN): (1) add _bulkEmailRecipientIds=ids; after L1373; (2) change L1500 to const ids=_bulkEmailRecipientIds; Last checked: 2026-06-28 SUN UTC (3rd code check).
**Jul01 WED UTC (5th code check, fresh grep):** Bug CONFIRMED STILL PRESENT. Current line numbers: L1444 let _bulkEmailRecipientIds=[] declared; L1460 async function openBulkEmailModal(); L1462 const ids=[...bulkSelectedStudents] — correct local source, NOT assigned to _bulkEmailRecipientIds; L1613 async function sendBulkEmail(); L1619 const ids=[...bulkSelectedStudents] — BUG: reads live set not frozen snapshot. Fix (2 lines, NOT RUN): (1) after L1462 add _bulkEmailRecipientIds = ids; (2) change L1619 to const ids=_bulkEmailRecipientIds; No build or restart needed. Last checked: 2026-07-01 UTC hrly (5th code check).

**4 Jul UTC (6th code check, admin.html): Bug STILL PRESENT. Line ~1445: let _bulkEmailRecipientIds = [] declared, comment added, but never assigned in openBulkEmailModal(). Line ~1463 in openBulkEmailModal(): const ids = [...bulkSelectedStudents] — reads live set correctly as local var, but NOT stored into _bulkEmailRecipientIds. Line ~1619 in sendBulkEmail(): const ids = [...bulkSelectedStudents] — BUG: reads live set at send time. Two-line fix (NOT RUN): (1) add _bulkEmailRecipientIds=ids; after L1463; (2) change L1619 to const ids=_bulkEmailRecipientIds. No build or restart needed — static file. Last checked: 2026-07-04 UTC (6th code check).**

**4 Jul UTC (7th code check, fresh admin.html): Bug CONFIRMED STILL PRESENT. L1447: let _bulkEmailRecipientIds = [] — declared but never assigned. L1465: const ids = [...bulkSelectedStudents] — correct source, but result NOT stored in _bulkEmailRecipientIds. L1622: const ids = [...bulkSelectedStudents] — reads live set at send time (BUG: bulkSelectedStudents may be cleared if report navigation happened since modal open). Two-line fix: (1) add _bulkEmailRecipientIds=ids; after L1465; (2) change L1622 to const ids=[..._bulkEmailRecipientIds]. No build required. Last checked: 2026-07-04 UTC (7th code check, hrly bot).**
**8 Jul UTC (8th code check) — FIX CONFIRMED APPLIED. admin.html L1467: _bulkEmailRecipientIds = ids; now present immediately after the ids capture in openBulkEmailModal(). L1625: const ids = [..._bulkEmailRecipientIds]; reads the frozen snapshot. Code comment at L1444-1447 documents the rationale. The two-line fix from the recipe was applied between 4 Jul and 8 Jul 2026. Bug resolved. Sheet K updated to fixed.**
