# TransferMate Escrow — End-to-End Spec (v1)

Distilled from `braindump-1.md` (Neil, 2026-05-28) plus the existing
SIS-side escrow handling that's already in production.

Reference example in SIS today: **booking 1612** — a correctly-stamped escrow
payment row attached to a booking in ESCROW status. New TM-API code should
produce records that look exactly like 1612.

---

## 1. The core problem: TM "pending" is ambiguous

TransferMate's API uses **`pending`** as a single state covering two very
different real-world situations:

| Real-world meaning | Typical duration |
|---|---|
| **Settlement in transit** — Brazilian/Argentine student paid, money is en route to TM's Irish account but hasn't landed in BoI yet | 24–72 hours |
| **Escrow hold** — Chinese/Mongolian/etc. visa-required student paid; TM holds the funds until the visa decision lands | days or weeks |

Same `pending` flag for both. TM does not disambiguate.

### Our disambiguator: country + duration

A payment is **escrow** when:
- TM status = `pending`, **AND**
- The student's nationality is in our **visa-required ("exotic") countries**
  list (already a source of truth in `territory-map.json` — used elsewhere
  in SIS).

Optional secondary check: if a `pending` payment stays `pending` for **> ~2
days**, it's almost certainly escrow regardless of nationality.

Once a payment becomes anything other than `pending` (confirmed / settled /
paid), TM's state change fires a webhook and we move it out of escrow on
our side.

---

## 2. Transport: webhooks, not polling

TM **pushes** state-change notifications via webhook. **No cron / polling
needed.** The escrow notification email you receive today (the "funds being
held in TransferMate's escrow account…" message) is a TM-side artifact of
the same state change that the API will signal to our endpoint.

→ New endpoint to build: `POST /sis/api/webhooks/transfermate` (hub-side
   or sis-side — TBD when wiring).

---

## 3. State machine

```
TM "pending" + visa-required nationality
        │
        ▼
 ┌──────────────────┐  state changes  ┌──────────────────────┐
 │  ESCROW (held)   │ ──────────────▶ │ settled (BoI landed) │
 └──────────────────┘                 └──────────────────────┘
        │                                       │
        │ visa refused                          │ → confirmed / paid in TM
        ▼                                       ▼
 ┌──────────────────┐                 ┌──────────────────────┐
 │ refund issued    │                 │ real cash, normal    │
 │ (we keep €300)   │                 │ payment posting      │
 └──────────────────┘                 └──────────────────────┘
```

The €300 retained on a refusal = €250 non-refundable visa-deposit + €50
registration fee.

---

## 4. Two simultaneous effects on every escrow event

When the TM webhook fires for an escrow event, **two parallel pieces of
work happen** — one in each system.

### A. HubSpot deal treatment (NEW — replaces the legacy split workflow)

**Old behaviour (about to be deprecated):**
- Escrow deals stayed at **"contractsent"** stage.
- Deposits were split: €250 deposit → deal moved to **"closedwon"** with €250;
  remainder (e.g. €750) stayed on a separate contract-stage shell deal.
- A workaround to avoid showing escrow money as "won."

**New behaviour (intended):**
- The commercial decision IS the trigger for **"closedwon"** — even if only
  €1 has been paid.
- The deal carries the **full balance outstanding** via Accounts Receivable
  rather than being split.
- An **`escrow` flag** is set on the deal (custom property — TBD where) so
  it's visually distinguishable in HubSpot.
- No payment is attached to the deal yet (money hasn't settled to bank).
- This matches the "every man for himself" / per-student-deal model.

So the TM-API webhook will **also push downstream changes into HubSpot**:
1. Move deal → `closedwon`.
2. Set the escrow flag.
3. Leave the deal with full balance outstanding.

### B. SIS payment row (matches existing behaviour today)

This part already works manually / via the Fidelo importer. The TM-API
just automates the same shape:

- Create `Payment` row on the booking: `method='TransferMate Escrow'`,
  `type='Escrow'`, `amount=<TM amount>`, `paymentDate=<TM date>`,
  `transactionId=<TM reference, e.g. ULEARNP2026106>`, `dataSource='TM-API'`
  (or similar).
- Set `Booking.status = 'ESCROW'`.
- `Booking.amountPaid` is **not bumped** (escrow rows are excluded from the
  rollup — already implemented in `bookings.ts:495–512`).
- Existing downstream filters take over: student is hidden from
  matching / class roster / transport / partner statements / LoA gating
  until the booking flips out of ESCROW.

---

## 5. Visa-decision branches

### Visa APPROVED (or pending → settles to BoI):
- TM webhook fires → state has moved off `pending`.
- SIS: post a **real** (non-escrow) Payment row for the released amount,
  flip `Booking.status` → `CONFIRMED` (or `PARTIAL` if balance remains).
- HubSpot: deal already at `closedwon`; clear the escrow flag.
- The student instantly becomes visible to all operational modules.

### Visa REFUSED:
- TM refunds the student minus our €300 retention (€250 visa-deposit
  non-refundable + €50 reg fee).
- The **€300 retained** lands in our BoI account → post as a normal
  payment on the deal.
- HubSpot deal → **`closedlost`**.
  - **Why `closedlost` despite a financial gain?** Our Google Ads conversion
    metrics are wired to the `closedwon` vs `closedlost` signal. Currently,
    flagging a refusal as `closedwon` (because we kept €300) feeds Google
    Ads a false positive on student-acquisition success — those refused
    leads should NOT be optimised toward. `closedlost` is the correct
    marketing-attribution signal even though the books gained €300.

---

## 6. What we already have vs. what's still to build

| Component | Status |
|---|---|
| SIS `Booking.status = 'ESCROW'` enum | ✅ exists |
| Escrow-tagged Payment row (`type='Escrow'` / `method='TransferMate Escrow'`) | ✅ exists; `bookings.ts:495–512` excludes from `amountPaid` rollup |
| Downstream-module filtering (matching, transport, classes, partner totals, LoA, host-payment cron) | ✅ all in place |
| Manual escrow entry path (admin UI / Fidelo importer pattern) | ✅ works today |
| Visa-required countries source of truth | ✅ `territory-map.json` |
| **TM API webhook receiver** | ❌ TO BUILD — production API access in hand, not deployed |
| **TM "pending → escrow" disambiguation logic** (country/duration) | ❌ TO BUILD |
| **HubSpot deal-side changes on escrow** (move to `closedwon` + escrow flag + balance outstanding) | ❌ TO BUILD |
| **HubSpot deal → `closedlost` on visa refusal + €300 retention payment posting** | ❌ TO BUILD |
| New `escrow` custom property on HubSpot Deal | ❌ TO CREATE in HubSpot |

---

## 7. Action points (when ready to deploy the TM API)

1. **HubSpot — create the deal property**: a boolean `escrow` (or similar) on
   the Deal object so the flag is visible in Sales views. Decide field
   location (top of deal record, side panel, etc.).

2. **TM webhook endpoint** (`POST /sis/api/webhooks/transfermate`):
   - Receives state-change notifications.
   - Maps TM payload → SIS Payment row + HubSpot deal updates.
   - Disambiguates `pending` via nationality lookup against
     `territory-map.json`.

3. **Deal-state transitions**:
   - On escrow hold → deal `closedwon` + set `escrow` flag.
   - On release/settle → clear `escrow` flag; SIS posts real payment.
   - On refusal → clear `escrow`, deal → `closedlost`, post €300 retention
     payment on the deal.

4. **Decide where `escrow` lives in HubSpot** — Sales sidebar? Deal stage
   metadata? A new pipeline?

5. **Reuse existing manual entry pattern** — the TM webhook produces rows
   that look identical to today's manual escrow entries (and to booking 1612).
   No new SIS payment shape needed.

6. **Migration of existing escrow deals**: the legacy
   "contract-stage-split-into-two-deals" pattern needs cleanup before the
   new flow goes live, otherwise old escrow deals will sit in the wrong
   stage indefinitely. Audit query: deals at `contractsent` with a
   visa-required nationality + an escrow payment in SIS = candidates to
   move to `closedwon` with the flag set.

---

## 8. Open questions / decisions still pending

- **Endpoint location**: TM webhook on the SIS server (`sis.ulearnschool.com`)
  or the hub server (`hub.ulearnschool.com`)? hub already handles Xero
  reconciliation crons; could be natural fit.
- **TM payload schema**: not yet documented here. Once production API
  credentials are live, sample payloads should be captured and added to
  `payload-samples/` next to this spec.
- **HubSpot escrow flag UX**: which deal property and how surfaced — needs
  a HubSpot Sales view tweak.
- **Refund leg accounting**: when TM refunds the student (visa refused),
  does the €300 retention come back to us via TM (so we see it in TM's
  payout) or directly from the student's leg? Needs confirmation with TM.

---

## Related

- `braindump-1.md` — Neil's raw 2026-05-28 dump this spec was distilled from.
- `bookings.ts:495–512` — `amountPaid` rollup excludes escrow rows.
- `accommodation.ts:291,329–336` — escrow excluded from unplaced pool.
- `documents.ts:625–636` — escrow blocks LoA issue.
- `partners.ts:23,37,49,58,179` — escrow excluded from partner statements.
- `classes.ts:337,1123–1130` — escrow excluded from class roster.
- `transport.ts:65` — escrow excluded from transfers.
- `cron-accomm-balance-warn.ts:66–70` — T-3 cron skips escrow bookings.
- `import-fidelo-payments-api.ts:216–224` — how the Fidelo importer tagged
  TransferMate + ESCROW rows; the TM-API webhook should replicate this shape.
- `territory-map.json` (in `lms/prototype/data/`) — canonical visa-required
  countries list.
