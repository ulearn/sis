# Partner Credit — Technical Reference

**Audience:** engineers / Claude handoff. Machine-readable spec of the partner-credit
subsystem: data model, code paths, API facts, the three-way sync, idempotency, and
every known edge. Paired with `Credit-Management-Staff.md` (the operational guide).

> **One-line summary:** SIS is the system of record for a partner's *available credit*.
> A grant is created in the Portal and pushed out to Xero (credit note) + HubSpot (task).
> When a human applies the HubSpot **credit memo** to a student's invoice, the invoice-paid
> webhook detects it, **deducts the SIS store, stamps a "ULearn Credit" payment line, and
> auto-allocates the Xero credit note** — keeping all three environments aligned off that
> single human action.

---

## 1. Why the store lives in SIS

- A partner's *available credit* (owed but not yet applied to any student) is an **operational
  promise**, not moved money. Neither oracle models it at the moment it's needed:
  - **HubSpot** has NO customer-credit-balance object. Credit *memos* exist (objectTypeId `0-781`)
    but are an instrument bolted to a specific invoice, not a running balance — AND the object is
    **API-walled for standard private apps**: `GET /crm/v3/objects/credit_memos` → **403** (not a
    grantable scope; confirmed, and the MCP connector also rejects `0-781`).
  - **Xero** *does* have a real one (`CreditNote.remainingCredit`, cross-contact), but it's blind to
    HubSpot and invisible in day-to-day sales ops.
- So SIS owns the ledger (the only place that is both **partner-visible** *and* **API-controllable**),
  and mirrors OUT to Xero + a HubSpot task. This does not break "SIS is a display layer downstream of
  the oracles" — the booking *balance* stays derived from HubSpot as always; the credit ledger is a
  separate operational record with no other home.

---

## 2. Data model

### `agency_credits` (model `AgencyCredit`, `src/../schema.prisma`)
Signed ledger. **Balance = Σ amount over non-VOID rows.**

| column | meaning |
|---|---|
| `agencyId` | owning agency (partner) |
| `amount` Decimal(10,2) | **signed**: CREDIT rows +, DEBIT rows − |
| `entryType` | `CREDIT` (grant) \| `DEBIT` (use) |
| `status` | `OPEN` (active) \| `VOID` |
| `reason`, `sourceRef` | free text; sourceRef = origin invoice for a grant |
| `issueDate` @db.Date, `createdBy`, `createdAt` | |
| `appliedToBookingId`, `appliedInvoice`, `appliedToDealId`, `appliedAt` | where a DEBIT went |
| `paymentId` | (legacy, unused now — see §7) |
| **`xeroCreditNoteId` / `xeroCreditNoteNumber`** | the pushed Xero credit note (GUID / e.g. `CN-0411`) |
| **`hubspotTaskId`** | the "Create Credit Memo" reminder task |
| **`pushedAt`** | set when pushed to Xero/HubSpot |
| **`autoFromInvoiceCredit`** Bool | TRUE = DEBIT auto-posted by the reconcile (§5) |
| **`hubspotCreditMemoId`** | the applied memo id(s) captured on an auto-debit |

### `Agency.xeroContactId`
Cached Xero contactID, resolved once from the **operable portal-login email** (§4). Repointed on
HubSpot company merges (see agency-dedup gotcha).

### `Payment.dataSource = CREDIT` (enum `DataSource`)
The **"ULearn Credit" display payment row** the reconcile stamps on a booking so applied credit shows
as a distinct line vs cash. The invoice-paid webhook's HubSpot-payment prune **skips** `dataSource=CREDIT`.

---

## 3. Code map

| Concern | Location |
|---|---|
| Ledger read/write | `src/scripts/partners.ts` → `listCredits`, `addCredit` (grant), `useCredit` (manual debit) |
| Push + reconcile + allocate + delete | `src/scripts/partner-credit-sync.ts` |
| Routes | `src/routes/partners.ts` → `GET/POST /credits`, `POST /credits/use`, `POST /credits/:id/push`, `DELETE /credits/:id` |
| Auto-deduct trigger | `src/routes/webhooks.ts` `invoice-paid` handler → `reconcileBookingCredit` |
| Payment path | `src/scripts/bookings.ts` `addPayment`/`deletePayment` (ULearn-Credit method debit STRIPPED — §7) |
| UI | `public/partners.html` Finance tab → green **Credit** pill (`historyFilter==='credits'` → `renderCredits`) |

### `partner-credit-sync.ts` functions
- `resolveXeroContactId(prisma,xero,tenantId,agencyId)` — operable portal email → Xero contact, cached on `Agency.xeroContactId`.
- `pushCredit(prisma,creditId)` — grant → Xero `createCreditNotes` (ACCRECCREDIT, accountCode `100`, taxType `NONE`, AUTHORISED) + HubSpot task (`/crm/v3/objects/tasks` + v4 default association to the company). Idempotent (skips if `xeroCreditNoteId` set). Only CREDIT rows push.
- `reconcileBookingCredit(prisma,bookingId)` — the brain (§5).
- `allocateAgencyCreditInXero(prisma,agencyId,creditByInvoice)` — allocate the agency's Xero credit note(s) to the matching invoice (§6).
- `deleteCreditEverywhere(prisma,agencyId,creditId)` — void+un-allocate Xero CN, delete HubSpot task, delete grant, then re-reconcile the agency's auto-debit bookings (cascade, §8).
- `linkExistingXeroCredit(prisma,creditId,cnNumber)` — back-link a hand-made Xero CN so the push doesn't duplicate it.

---

## 4. Environment join key = the operable portal email

Xero credit note ↔ agency ↔ HubSpot are threaded on **the agency's active portal-login email**
(DataSync syncs HubSpot contacts → Xero contacts by email). `resolveXeroContactId` picks the active
`SisUser.email` (most-recent login), `getContacts(EmailAddress=="…")`, caches the contactID. The legacy
DataSync duplicate contacts have the same-ish emails but zero activity → naturally sidestepped because
we key on the *operable* login, not the dupes.

---

## 5. The reconcile (auto-deduct) — `reconcileBookingCredit`

Fired from the `invoice-paid` webhook (non-fatal) AFTER the booking balance update. No-op for B2C (no agency).

1. **Detect** per invoice on the deal: skip voided/deleted/`-Sub`. If the invoice has a readable
   **`credit_memos` association** (`/crm/v4/objects/invoices/{id}/associations/credit_memos` → 200 even
   though the object is 403), the applied credit = **`hs_amount_paid − Σ(commerce_payments)`** (handles
   mixed cash+credit). Sum → `detected`.
2. **Store debit (self-cleaning, single row per booking):** maintain ONE `autoFromInvoiceCredit` DEBIT
   = `−detected`. Upsert if `detected>0`; **delete** it if `detected==0` (so removing the memo in
   HubSpot wipes it — no orphan minus, no reversal entry).
3. **"ULearn Credit" payment row (self-cleaning):** one `Payment{dataSource:CREDIT, method:'ULearn Credit'}`
   per booking = `detected`; deleted when `detected==0`.
4. **Xero allocation:** `allocateAgencyCreditInXero` (§6).

**Idempotent** — re-runs converge (single rows keyed to `detected` / Xero `amountCredited`).

**Edge (accepted):** attributes ANY credit memo on a partner booking's invoice to that agency's store.
A non-agency goodwill memo would wrongly debit (rare; shows as negative = signal; staff void).

---

## 6. Xero auto-allocation — `allocateAgencyCreditInXero`

**KEY FACT: Xero allows cross-contact credit-note→invoice allocation** (HubSpot does NOT). So the
partner's credit note stays on the partner contact — no reassign — and **partials leave the remainder
correctly on the partner**.

Per invoice with detected credit: find the Xero invoice by matching `InvoiceNumber`; `gap =
min(detectedCredit − invoice.amountCredited, amountDue)`; allocate `gap` FIFO (by date) across the
agency's AUTHORISED credit notes with `remainingCredit`, via `createCreditNoteAllocation`. **Idempotent**
on the invoice's `amountCredited`. Reconcile is forward-only (allocate); *un*-allocation happens only in
the delete cascade.

---

## 7. What was removed (do not re-add)

The old manual **"ULearn Credit" payment METHOD** used to post its own store debit in `addPayment`
(+ a `deletePayment` reversal hook). **STRIPPED** — the reconcile owns store deduction now, so keeping
it double-counts. The method persists only as a payment *label*. The reconcile creates the CREDIT-source
payment row directly (not via `addPayment`), so it never triggers that path.

---

## 8. Delete cascade — `deleteCreditEverywhere`

Deleting a grant: (1) VOID + un-allocate its Xero credit note; (2) delete the HubSpot task; (3) delete
the SIS grant row; (4) **re-reconcile** the agency's auto-debit bookings → any whose HubSpot memo is now
gone self-clean their auto-debit + ULearn-Credit row. UI: red `×` on **manual rows only** (grants +
manual uses; hidden on auto-debits/CREDIT-payment rows). Staff-gated (`impersonatedByAdmin && role==='admin'`).

---

## 9. Permissions

All credit writes are **admin-impersonation-only**, three layers: `canManage = impersonatedByAdmin &&
role==='admin'` (button visibility) · route `403` unless `impersonatedByAdmin` · global
`blockImpersonatedWrites` (app.ts) makes non-admin staff read-only in any portal. A partner never sees
or can fire any of it.

---

## 10. The ONE irreducible manual step

Applying/removing the **HubSpot credit memo** on a student's invoice. Why it can't be automated:
- The memo object is API-walled (can't create/apply/remove via API).
- To apply a memo in HubSpot the memo + invoice must share **one** contact — so staff must **remove the
  agent/company contact and REPLACE with the student's** (two contacts breaks the application). Xero has
  no such rule (cross-contact allocation).
- The commission-sync does NOT carry a credit application into Xero — that's what the reconcile's Xero
  allocation fixes automatically.

So: apply/remove the memo in HubSpot (human) → the webhook fires → SIS store + Xero self-align. Deleting
the SIS grant handles the Xero+grant side; removing the memo handles the auto-debit + payment-row side.

**Removing an applied credit in the HubSpot UI:** open the invoice → **Actions → Apply or manage
credit** → click the **🗑 bin** next to the applied credit. This un-applies it (invoice balance rises),
which fires the `invoice-paid` webhook → the reconcile self-cleans the auto-debit + ULearn-Credit row.
Do this BEFORE voiding the Xero note / SIS `×`.

---

## 11. Verified end-to-end (2026-07-18, clean single-memo)

Grant €10 (CN-0411) on ABC Test Ltd #593 → applied HubSpot memo to INV-1425 → result, all in lockstep:
`HubSpot paid €10 / due €182.50` · `SIS: +€10 grant, −€10 auto-debit, balance €0, booking paid €10, ULearn
Credit €10 payment row` · `Xero: INV-1425 credited €10, CN-0411 remaining €0`.

## 12. Open / parked
- **Auto-apply at enrolment** (Phase 3): surface the agency's balance into HubSpot at deal/autoQuote time. Not built.
- **Stale HubSpot company id sweep**: after a company merge, an agency's `hubspotCompanyId` can point at the merged-away id → portal Finance empties (fixed for UEG; others may exist).
