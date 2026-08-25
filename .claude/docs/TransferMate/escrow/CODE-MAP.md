# TransferMate Escrow — Code Map (one page)

_Audit 2026-05-31. Where every piece of the escrow flow actually lives across the 3 servers._

## The 3 locations

| Where | Path | Role |
|---|---|---|
| **hub** | `hub.ulearnschool.com/public_html/fins/scripts/tm/` | The TransferMate integration — receives TM signals, talks to HubSpot + Xero, pushes to SIS. **This is the brain.** |
| **hubapp** | `hub.ulearnschool.com/public_html/hubapp/scripts/migrate/` | One-off **historical backfill / migration-recon** only (Jan-2025→now HubSpot invoices + Xero recon). **No live escrow logic. Being retired ~2026-06-01** once recon finishes — don't add code here. |
| **SIS** | `sis.ulearnschool.com/public_html/sis/src/` | Receives the escrow signal, stores the shadow payment + booking state, and every operations module reads that state. **The display/ops layer.** |

---

## The flow (signal → interpretation → effect)

```
TransferMate  ──POST /fins/tm/api/webhook──▶  hub/fins/scripts/tm/webhook.js
                                              reads TM-native <escrow> flag
                                              │
                  ┌───────────────────────────┴───────────────────────────┐
                  │ escrow = 1 (held)                       escrow = 0 (standard) │
                  ▼                                              ▼
            escrow.js handleEscrow()                      apply.js applyPayment()
              1. HubSpot: deal → closedwon                  → posts payment to Xero
                 + escrow = "Yes"                             (TM clearing account)
              2. POST → SIS /transfermate-escrow             → Xero→HubSpot→SIS via
                 (TM_SIS_ESCROW_URL, X-TM-Internal-Secret)     existing /invoice-paid
                  │
                  ▼
        SIS webhooks.ts  router.post('/transfermate-escrow')
          - create Payment: type=Escrow, method='TransferMate Escrow', dataSource=TM_API
          - Booking.status → ESCROW   (never downgrades CONFIRMED)
                  │
                  ▼
        Downstream SIS modules read Booking.status='ESCROW' / the escrow payment tag
        and EXCLUDE the student:
          classes.ts (unassigned pool + roster) · accommodation.ts (matching pool)
          transport.ts · documents.ts (LoA gate) · partners.ts (statements)
          cron-accomm-balance-warn.ts · bookings.ts (amountPaid rollup excludes escrow)
```

---

## What EXISTS vs what's TO BUILD

### ✅ Built & live
- **Escrow IN**: `webhook.js` → `escrow.js handleEscrow` → HubSpot won+`escrow=Yes` → SIS `/transfermate-escrow` (shadow payment + status ESCROW).
- **Standard payments**: `webhook.js` (escrow=0) → `apply.js` → Xero → HubSpot → SIS `/invoice-paid` (creates `dataSource=HUBSPOT` payment rows + sets amountPaid/status).
- **Escrow dashboard**: `feed.js getFeed()` (report export + live API) → `/fins/tm/api/feed` → `dashboard.html`.
- **All SIS downstream exclusions** (pool/accom/transport/LoA/partners/cron/rollup).
- **One-off legacy fix (2026-05-31)**: 15 mis-migrated in-escrow students retagged → escrow shadow + ESCROW + visa Pending (`src/scripts/escrow-retag.ts`).

### ❌ To build (the release/refusal legs)
- **Escrow RELEASED (visa approved)**: TM signals release → set HubSpot `escrow="No"` → SIS posts a **real** payment + flips ESCROW→CONFIRMED, **keeps** the shadow (spec §5). *No `handleRelease` exists in `escrow.js` today.* **Likely path:** the released money already flows Xero→HubSpot→`/invoice-paid`; make that path **escrow-flag-aware** (read the deal `escrow` property) rather than a separate endpoint.
- **Escrow REFUSED**: the trigger EXISTS — hub `POST /fins/tm/api/refusal` → `escrow.js handleRefusal` → HubSpot deal `closedlost` + `escrow="No"`. But the SIS leg (`postRefusalToSis`) is a **stub** (`TM_SIS_REFUSAL_URL` unset) and the TM refund leg is blocked. Needs the SIS side: booking → CANCELLED + €300 retention posting.
- **Escrow RELEASED has NO trigger at all** — `escrow.js` exports only `handleEscrow` + `handleRefusal`; no `handleRelease`, no `/api/release` route. This is the real gap. (Lean on the deal `escrow` flag via `/invoice-paid`, per above.)
- **HubSpot `escrow` deal property**: the boolean (unset / Yes / No) is the 3-state audit trail the middleware sets — confirm it's created + reliably populated.

---

## Key facts that bit us this session (don't re-learn the hard way)
- **TM `status='Paid'` = held in escrow awaiting visa** (per `report.js` header), NOT "paid to us". Released-to-bank looks identical in the feed — only the bank/Xero reconciliation distinguishes.
- **HubSpot flattens all Xero payment methods to `method='Bank'`** in `/invoice-paid` (line ~1454). Fine — SIS is a display layer and doesn't need processor detail. Escrow state is carried by the **deal flag**, not the payment method.
- **`/invoice-paid` creates payment rows** (`dataSource=HUBSPOT`) AND overwrites amountPaid; it never touches FIDELO/MANUAL/escrow rows. (Backfill dedup: delete FIDELO twins only where a HUBSPOT row landed; exclude escrow + non-bank types + refunds.)

## Source-of-truth docs
- `spec-v1.md` (end-to-end design) · `sis-escrow-endpoint-spec.md` (SIS contract) · `braindump-1.md` (Neil's raw notes) · this file (current code reality).
