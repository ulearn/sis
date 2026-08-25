# Host Portal v1 — Spec

Native SIS rebuild of the legacy Make.com / ManyChat / Airtable /
MiniExtensions host-matching portal. First-come-first-served claim flow,
per-host magic link, no login.

Owner: Neil
Started: 2026-05-22

---

## Background

Pre-existing legacy system (built years ago, no longer running):
- Make.com (formerly Integromat) handled scenarios/automation
- Airtable held host + student data
- ManyChat (Meta API wrapper) sent WhatsApp messages
- MiniExtensions provided the form builder for the portal page

Reference: https://miniextensions.com/miniextensions-form-for-airtable/

Why rebuild natively:
- Eliminate 4 SaaS dependencies + their bills
- All host + student + financial data is now in SIS
- Want to surface API-side WhatsApp messages back inside SIS (eventually) so
  Kelly has full visibility instead of a separate phone/app

---

## v1 Decisions Locked

| Item | Decision | Rationale |
|---|---|---|
| Outreach channel | **Email only** | Zero new infra — existing `sendStudentEmail` works today. SMS / WhatsApp deferred (WhatsApp via Bird.com needs separate API number + dual-channel for Kelly — operationally complex). |
| Token model | **Evergreen** — one permanent link per host, no expiry | Simpler — no batch lifecycle, hosts can bookmark. |
| Account-history scope | **Full view from day 1** via magic link | Low risk — host only sees their own bills. Login can be added later if issues. |
| Travel Pair (twinning) | **At Booking level** via shared `travelPairId` | A *pair* = 2 (occasionally 3) individuals literally travelling together — same flight, so usually same airport transfer + same house. It is NOT a group. Linked at booking level (these specific bookings travel together), not at student level (Fidelo did the latter — we improve). |

---

## Build Order (5 slices, each independently shippable)

### 1. Magic-link layer (foundational, ~150 lines)

**New table** `host_portal_token`:
```
id           BIGSERIAL PRIMARY KEY
token        TEXT     UNIQUE NOT NULL    -- crypto-random 32+ chars
providerId   INTEGER  NOT NULL REFERENCES accommodation_providers(id) ON DELETE CASCADE
createdAt    TIMESTAMPTZ NOT NULL DEFAULT now()
lastUsedAt   TIMESTAMPTZ                  -- bumped on every successful resolve
@@unique(providerId)                       -- one evergreen token per host
```

**Endpoints**:
- `POST /host-portal/mint?providerId=N` (admin) — returns existing token if any,
  else creates one. Idempotent.
- Middleware on `/host-portal/<token>/*` — resolves token → providerId, attaches
  to `req.hostProvider`. Returns 404 if token unknown.

### 2. Travel Pair (twinning) on Booking  — NOT built yet

A **travel pair** is a small twinning of **2 (occasionally 3)** individual
students who literally travel together (same flight). The implication: they
usually want the **same airport transfer** and the **same house**, so when one
is claimed/placed the other should move with them.

This is **distinct from a group** (15–20 students arriving together). Group
functionality **does not exist** and is a separate future build (see non-goals).
A pair *can* exist inside a group, but the pairing is its own thing.

**Naming**: avoid "travel together" (unwieldy). Use **Travel Pair** (or
"travel buddies") in the UI; `travelPairId` at the DB layer.

**Schema change**: add `travelPairId String?` (UUID) to `Booking`. All bookings
sharing the same `travelPairId` are paired (2–3 rows).

**UI**: small "Pair with another booking" affordance on the booking-edit screen
— pick the partner booking (autocomplete by student name); generate a UUID if
neither has one, or join the existing pair.

No claim-engine changes in this slice — the link is just stored. The claim
engine (slice 4) reads it to keep a pair together (all-or-nothing).

### 3. Per-host portal page (read-only)

**Route**: `/host-portal/<token>` (HTML)

**Layout**:
- Top banner: "Welcome, {hostName}" + their host id + contact email
- Section A: **Students available to host this week** — uses the existing
  `getUnplacedStudents` query (already filters out CANCELLED bookings + visa
  pending + unpaid). Each row shows dates, nights, nationality, gender,
  any allergies/diet notes, "Claim" button (POST in slice 4).
- Section B: **My current placements** — students currently in this host's
  beds (`bookingAccommodation.bedId IN (this host's beds)`).
- Section C: **My account** — open Xero Bills owed (from `hostPaymentLineItem`
  WHERE `providerId = N AND xeroStatus IN ('submitted','paid')`), grouped
  by payment run. Same data the host-payments cron already produces; this
  is just a read-side view.

Claim button is a no-op stub in this slice — full wiring in slice 4.

### 4. Claim = Expression of Interest (provisional) + Kelly confirmation — BUILT (single-placement)

Refined from the original "hard claim". A host clicking **Claim** does NOT place
the student — it registers a **provisional Expression of Interest**. We don't
let hosts self-place (there can be reasons a host shouldn't get a student);
Kelly confirms.

**State machine** on `booking_accommodation`:
- unclaimed → `claimedByProviderId = NULL`, in the pool.
- **EOI / pending** → host clicks Claim → `claimedByProviderId` set, `claimStatus='pending'`, `claimedVia='host-portal'`, `claimedAt=now()`. Removed from every host's pool (first-come effect) but NOT placed.
- **confirmed** → Kelly assigns a bed (normal matching flow) → `claimStatus='confirmed'`; bed assignment is the placement.
- **released** → Kelly rejects → claim cleared → back in the pool.

**Route** (BUILT): `POST /host-portal/<token>/claim` body `{ bookingAccommodationId }`.
Race-safe atomic: `updateMany WHERE claimedByProviderId IS NULL AND bedId IS NULL
AND active` → 0 rows = another host got there first → 409.

**Columns** (BUILT): `claimedByProviderId`, `claimedAt`, `claimStatus`,
`claimedVia` on `booking_accommodations`.

**Surfacing the EOI to staff** (the three channels, BUILT a/c, b in progress):
- **(a) Slack** — ping on each claim (reuses existing `postSlackMessage`), cc Kelly.
- **(b) Matching screen** — when Kelly opens a student, a **gold "‹Host› expressed
  interest"** chip sits to the right of the photo/name/age/dates/type pills,
  with Release (and the normal assign = confirm). A list-strip was rejected
  (doesn't scale horizontally); per-student reveal is the home.
- **(c) In-SIS notifications** — the user-menu notifications stub shows a
  pending-claim count.

**Travel pair** (once slice 2 built): if the booking has a `travelPairId`, the
claim covers all paired placements all-or-nothing in one transaction.

**Open question (post-iteration):** whether to later allow a **direct claim** —
the front-end Claim fires the matching engine and places immediately, skipping
the Kelly-confirm step. Deferred; decide after we see how the provisional flow
behaves in practice.

### 5. Staff outreach UI

**New card** in the SIS host-matching screen ("Send portal link"):
- Multi-select of hosts (autocomplete by name, "favourites" filter)
- "Send link to N hosts" button
- For each selected host:
  - Mint-or-fetch their evergreen token
  - Build personalised link: `https://sis.ulearnschool.com/host-portal/<token>`
  - Email via `sendStudentEmail`, From=`accomm@`, with a template body
    showing "X students looking for a home this week — click your link"
- Same evergreen link goes out every time — hosts can bookmark it.

---

## Out of v1 (explicit non-goals)

- WhatsApp / SMS outreach — deferred. Bird.com requires a separate API number
  and Kelly currently uses a handset on the same number; can't have both at
  once. Email-only ships today.
- Group bookings (28 Chinese students arriving together) — needs separate
  group-booking schema work. Travel-together at Booking level (slice 2) is
  the building block but doesn't model groups themselves.
- Surfacing WhatsApp/SMS replies back in SIS staff view — only relevant once
  WhatsApp/SMS outreach is live.
- Login layer for account-history view — deferred per Neil; revisit if any
  bills-side incident.

---

## Open follow-ups (post-v1)

- Group bookings: model + UI for "28 students arriving together, must place
  N together / can split across M hosts"
- WhatsApp via Bird.com (or alternative) once Kelly's handset workflow is
  worked out (maybe "switch to Bird app for accomm, keep handset for emergency")
- Surface inbound WhatsApp replies back in SIS staff console

---

## Related memory

- `~/.claude/projects/-home-sis-web-sis-ulearnschool-com-public-html/memory/project_host_portal_v1.md`
- `~/.claude/projects/-home-sis-web-sis-ulearnschool-com-public-html/memory/reference_hub_vhost_access.md` (where the financial / Xero-bill code lives — relevant for the account-history section)
