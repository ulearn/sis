# Issue 54 - Checkout Per Person vs Per Room
Reporter: KC | Area: Booking/Accomm | Sheet row: 56

## Symptom
SIS counts checkouts per person. Last weekend a couple in A1/R1 showed 2 checkouts, but Natia always counted per room. Exception: A1/R4 has individual single beds where per-person counting is correct.

## Root cause (with evidence)
BA 11160: Maicol Moretti (student 93), Bed B (bedId 174), end 22 Aug 2026
BA 11161: Lucia Borroni (student 92), Bed A (bedId 168), end 22 Aug 2026
Both BAs end same date in room A1/Room 1 (roomId 82).

getCleaningQueue() in src/scripts/accommodation.ts (lines 821-865) fetches per bookingAccommodation record.
apartmentRoom label includes bed name via joinPropRoomBed(propName, roomName, bedName) line 850.
Result: queue shows A1/Room1/Bed A and A1/Room1/Bed B as 2 distinct entries for 1 physical clean.

A1 room structure confirmed from DB:
- Room 1 (id 82): 2 beds (Bed A id=168, Bed B id=174) — couple room
- Room 2 (id 83): 2 beds (Bed A id=83, Bed B id=175) — couple room
- Room 3 (id 84): 1 bed — single room
- Room 4 (id 85): 3 single beds (id=156,157,173) — shared individuals, per-person is correct there

Design gap: cleaning queue has no concept of room-level checkout; always per booking accommodation (per bed).

## Fix recipe (NOT YET RUN)

OPTION A - Room-level grouping in getCleaningQueue (recommended):
File: src/scripts/accommodation.ts, around line 835.
After placements array is built, group by: roomId + endDate.toISOString().
For groups with >1 member (couple room, same end date):
  - Emit 1 item instead of N
  - apartmentRoom = joinPropRoomBed(propName, roomName, "") — drop bed name
  - student = comma-joined student names from the group
  - checkoutAt = earliest of the group checkoutAt values
  - nextCheckinAt = earliest next check-in across all beds in room
  - cleanedAt = null unless ALL BAs in group have cleanedAt set
  - ids = [ba.id, ...] — mark-cleaned route must iterate all

Also update PATCH /cleaning/:placementId/checkout-at and markCleaned/unmarkCleaned
to accept and act on multiple BA ids when a room group is passed.

OPTION B - Room type flag (more schema work):
Add cleaningMode (per_room or per_bed) to AccommodationRoom.
Default per_bed; set couple rooms to per_room. Cleaning queue reads flag.

OPTION C - Labels only (minimal, not recommended):
Drop bed name from apartmentRoom for multi-bed rooms. Still shows N entries. Confusing.

## Risk / category
Category: UI / cleaning queue display logic only.
Reversible: Yes — no data changed.
Blast radius: Low — affects getCleaningQueue for providers with multi-bed rooms (A1 currently).
BAs 11160 and 11161 past end date (22 Aug 2026); cleanedAt null — still in queue uncleaned.

## Status
Open — design gap confirmed, fix recipe written, NOT YET RUN.
Last checked: 2026-08-24 UTC