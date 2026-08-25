# Soft Availability / Reservation Scaffolding — Spec

**Status:** Draft for review (Neil, 2026-07-15). Not built.
**Goal:** A fast, read-only availability check that answers two questions for a given date range:
1. **Academic** — is there a class *seat* free (a hard cap)?
2. **Accommodation** — is there a *room of type X* free at Capel Street (a soft cap)?

Ultimately exposed as an **API endpoint** the inbox AI agents (HubSpot/Xero/SIS-connected) can hit to answer "do we have space for this person, these dates, this room type — yes/no, and if no, what's the fallback?" First deliverable is an **admin-only test page** (no nav entry needed).

---

## 0. Grounding — what the system actually has today

### Academic
- **7 teaching rooms** (confirmed, Neil 2026-07-15) — the **Basement is one of the 7**: Room 1, 2, 4, 5, 6, 7, Basement. The DB `Classroom` table has **8** rows because **Room 3** also exists but currently hosts **zero classes** → it's the spare/non-counted 8th row (exclude from the cap, or mark inactive).
- **`capacity` is `null` on every classroom row** — the 16-seat cap is *not* in the system yet.
- Model: **7 rooms × 16 legal max = 112 seats per session**. Two sessions/day (AM = `MORNING`, PM = `AFTERNOON`) → **112 AM + 112 PM = 224/day**.
- Note: rooms aren't all general 16-seat GE classes right now (Basement hosts a `121`/one-to-one; Room 6 hosts IELTS) — but the 16 legal max per room is the physical ceiling regardless; course-type nuance is the "squash the curve" secondary factor (§1).
- A student occupies a seat for the life of their course (`BookingCourse.startDate → endDate`), in a session derived from `BookingCourse.category` (established in the issue-26 work):
  - `MORNING`, `MORNING_PLUS` → AM
  - `AFTERNOON`, `AFTERNOON_PLUS` → PM
  - `INTENSIVE` → **both** AM and PM
  - `PRIVATE` → 1:1, uses a room but not the shared 112 pool (handle separately)
  - `OTHER` → excluded / flagged

### Accommodation (Capel Street = Provider #15, `type` "Apartment")
- Two properties: **A1** (4 rooms, 8 beds) + **A2** (4 rooms, 5 beds) = **13 beds**.
- Model chain: **Provider → Property → Room → Bed → BookingAccommodation (placement)**.
- **Room type lives on `AccommodationRoom.roomType`** (beds inherit it). Live Capel values: **`Premium`, `Superior`, `Standard`, `Twin/Shared`**. Ensuite = `AccommodationRoom.enSuite` (bool). Board is on the *request* (`BookingAccommodation.board`), and apartments force "Self Catering".
- **A bed is occupied over a window** ⟺ a `BookingAccommodation` row with `bedId = <bed>`, `active = true`, booking not `CANCELLED`, and `[startDate, endDate]` overlapping the window. `bedId = null` = an **unplaced request** (pending demand, occupies nothing). One placement row spans the whole stay (no per-night rows). Dates are `@db.Date` (day granularity).
- **No availability/occupancy function exists.** The closest is `getHostTimeline(from,to,type)` (`src/scripts/accommodation.ts:376`), which returns *occupied* intervals per bed; the browser grid (`_matchBucketPlacements`, `admin.html:11157`) infers "free" as "no placement covers this day". `placeStudent` does **no** collision check. This spec's check would be the first server-side inversion of occupied → free.

### Data gaps to close before/within Phase 1
1. `Classroom.capacity` is null → set to **16** (and decide Basement).
2. Add a per-provider **"include in soft availability"** flag (so Capel is in now, future leased/owned properties opt in with a checkbox).
3. `AccommodationRoom.capacity` exists but is unused — real capacity = **count of Bed rows**. Keep using bed count.

---

## 1. Part A — Academic seat availability (HARD cap)

**Question:** *For [from,to] in session S, is there a free seat?*

**Capacity:** `SEATS_PER_SESSION = teachingRooms × 16` (= 112 with 7 rooms). Sourced from `Classroom` (active, capacity set), so it self-updates if rooms/caps change.

**Occupancy (the tricky bit — it varies week-by-week):** students arrive and leave mid-window, so a single "count" is wrong. Compute occupancy **per week across the requested range** and take the **peak**:

```
for each ISO week W overlapping [from,to]:
    usedAM(W) = # distinct students with an active, paid course whose [start,end]
                covers W and whose category resolves to AM (INTENSIVE counts here too)
    usedPM(W) = same for PM
freeAM = SEATS_PER_SESSION − max_W(usedAM(W))
answer(AM) = freeAM > 0   // fits only if EVERY week in range has a seat
```

- **Fits ⟺ every week in the range has ≥1 free seat** (report the tightest week + its free count).
- **Gating:** count only bookings that are paid/active (mirror the `getUnplacedStudents` payment gate) and not CANCELLED; exclude ESCROW/visa-pending if we want "confirmed" demand only. Two modes: **confirmed** (paid) vs **provisional** (include pending) — default confirmed, surface provisional as a caveat.
- **Level distribution — advisory only, never a blocker.** Level is usually unknown at booking, and the DOS "squashes the normal curve" (moves learners up/down on Fridays) to absorb arrivals. So the *authoritative* answer is total seats in the session. **Optionally** surface a per-level occupancy heatmap (from `StudentClassAssignment → class.level`) as advisory colour, flagged "pedagogical pressure", but the yes/no is seat-count only.
- **Private courses** occupy a room 1:1 → subtract occupied private rooms from the room pool for that session, or model separately. Flag for decision.

**Output:**
```json
{ "session": "AM", "from": "2026-08-15", "to": "2026-09-12",
  "seatsPerSession": 112, "peakUsed": 98, "free": 14,
  "tightestWeek": "2026-08-24", "available": true,
  "levelPressure": { "B1": 0.9, "B2": 0.4 }   // advisory, optional
}
```

This part is **simple and deterministic** — a hard limit. Ship it first.

---

## 2. Part B — Accommodation soft availability (SOFT cap, Capel St)

**Question:** *For [from,to], is there a `<roomType>` (+ensuite?) free at Capel Street? If not, what's the fallback?*

**"Soft" because there is no ceiling** — beyond owned/leased inventory we can source host families, other providers, or (in extremis) Airbnb/Daft. So the check reports availability *within opted-in inventory* and, on a miss, a **fallback**, rather than a hard "no".

**Scope:** providers with the **"include in soft availability"** flag = Capel (#15) now; extensible by flag later.

**Free-bed computation (invert `getHostTimeline`, scoped + typed):**
```
beds = provider(15).properties.rooms[roomType == requested (+ enSuite if asked)].beds
for each bed:
    occupied = EXISTS BookingAccommodation where
        bedId = bed.id AND active AND booking.status != 'CANCELLED'
        AND startDate <  to  AND endDate >  from     // STRICT overlap (see below)
free = beds where NOT occupied for the WHOLE window
available = free.length > 0
```

- **Shared-day turnover rule:** `endDate` is a *shared checkout/checkin day* (`splitPlacement` convention, `accommodation.ts:557`). Use **strict** comparisons (`start < to && end > from`) so a new stay starting the day an old one ends is **not** a false conflict — matches the grid's `_matchBucketPlacements` rendering.
- **Whole-window requirement:** a bed counts as free only if it has **no** overlapping placement across the entire [from,to] (not just some nights). If none is free for the full window, compute per-room-type the **earliest date a bed of that type frees up**, and the **next available alternative type** → that's the fallback.
- **Pending demand (unplaced requests, `bedId = null`):** decide whether an active-but-unplaced request for overlapping dates/type "soft-reserves" a bed. Two modes:
  - **Occupancy mode** (default): only *placed* beds count as taken → truest "physical" availability.
  - **Reservation mode:** also net off pending same-type requests → protects against over-promising. Surface pending count as a caveat either way.

**Output:**
```json
{ "property": "Capel Street", "roomType": "Premium", "enSuite": true,
  "from": "2026-08-15", "to": "2026-08-29",
  "available": false, "freeBeds": [],
  "pendingDemand": 1,
  "fallback": { "sameTypeFreeFrom": "2026-09-02",
                "altTypeAvailableNow": "Standard",
                "note": "No Premium ensuite for these dates; Standard is free, or Premium frees 2 Sep." } }
```

**Complications (Neil's "dates/calendarisation always bites"):**
- `@db.Date` day granularity; server is Dublin TZ / DST → do all week/overlap math with **UTC methods** (per house rule) to avoid the summer off-by-one.
- Half-open turnover day (above).
- Course-holiday shunts can move a stay's end date (holiday spec) — read the *current* placement dates, don't recompute.
- Room type is on the **room**, not the bed or the request — filter on `AccommodationRoom.roomType`.

---

## 3. The API (what the AI agents call)

Read-only, fast, token-authenticated (these agents live outside the admin session). Proposed:

- `GET /sis/api/availability/course?from=&to=&session=AM|PM&mode=confirmed|provisional`
- `GET /sis/api/availability/accommodation?from=&to=&roomType=&enSuite=&mode=occupancy|reservation`
- Optionally a combined `GET /sis/api/availability?...` returning both blocks in one call (the common agent question is "space for course **and** a room").

Each returns the JSON above: `available` boolean first (so the agent can branch instantly), then the detail + fallback. Auth via a scoped API key (separate from student/admin sessions). All computation reuses the functions below — the endpoint is a thin wrapper.

**New server functions (thin, testable, reused by API + test page):**
- `courseSeatAvailability({ from, to, session, mode })` → seat block.
- `accommodationAvailability({ from, to, roomType, enSuite, mode, providerIds? })` → bed block (defaults to soft-availability-flagged providers).

---

## 4. Admin test page (first deliverable)

A standalone admin-only page (e.g. `/sis/reservation-check`, **not** in the nav) with two small forms:
- **Course check:** date range + AM/PM → shows free seats, tightest week, yes/no (+ optional level-pressure strip).
- **Accommodation check:** date range + room-type dropdown (`Premium/Superior/Standard/Twin·Shared`) + ensuite toggle → shows free beds / yes-no / fallback.

Calls the same two functions/endpoints. This is Neil's manual "do we have space?" tool and the proving ground for the API the agents will later hit.

---

## 5. Phasing

| Phase | Deliverable |
|---|---|
| **0** | Set `Classroom.capacity = 16` (decide Basement); add provider `softAvailability` flag (Capel = on); confirm category→session map. |
| **1** | `courseSeatAvailability()` + endpoint + test-page course form. Hard cap — simplest, highest confidence. |
| **2** | `accommodationAvailability()` (invert `getHostTimeline`, scoped to Capel, typed, strict overlap) + endpoint + test-page accom form + fallback logic. |
| **3** | Combined `/availability` endpoint + token auth for the inbox agents; reservation-mode (pending demand); multi-property extensibility via the flag. |

## 6. Open decisions for Neil
1. ~~Basement~~ **RESOLVED** — 7 rooms incl. Basement = 112. Reconcile the empty 8th row **Room 3** (mark inactive / cap 0 so it's excluded from the sum).
2. **Seat capacity source** — hard-code 16, or set `Classroom.capacity` per room (allows exceptions)?
3. **Level pressure** — build the advisory heatmap now, or defer (yes/no on seats only for v1)?
4. **Pending demand** — should unplaced accommodation requests soft-reserve a bed (reservation mode) or not (occupancy mode) by default?
5. **Private courses** — subtract private-occupied rooms from the academic pool, or ignore for v1?
6. **API auth** — scoped API key for the agents; who mints/rotates it?
