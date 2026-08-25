# Xero invoice ↔ HubSpot card-surcharge sync gap — handover for SIS Claude

**Status:** Analysis complete, **no code changed** (all investigation read-only). Implementation is for the SIS-side Claude, which owns this code with full repo context. Nothing should be edited until Neil signs off on the approach.

**Owner context:** Raised by Neil from the hub/fins side while reconciling a Stripe payment in Xero. This doc is the grounded brief so the SIS Claude can implement without re-deriving.

---

## 1. Symptom

A HubSpot invoice paid by **credit card** shows a higher total than the matching **Xero** invoice, by exactly the card surcharge. The Xero invoice is left short, so it never matches the Stripe bank receipt at reconciliation time.

Worked example — **INV-1316** (student Raddad Aljohani, a Saudi / non-EEA card; HubSpot invoice id `1241960107204`):

| Source | Total | Notes |
|---|--:|---|
| Xero invoice | **€5,480.50** | line items €6,149.00 − Partner Commission €668.50; `AUTHORISED`, unpaid |
| HubSpot `hs_amount_billed` | **€5,699.72** | = €5,480.50 + **€219.22** (4% card surcharge) |
| Stripe gross charge | €5,699.72 | what the customer actually paid |
| Stripe processing fee | €270.90 | Stripe's cut (4.75% — international card) |
| Net payout to BOI | €5,428.82 | €5,699.72 − €270.90 |

The €219.22 gap between the Xero invoice (€5,480.50) and the amount actually charged/billed (€5,699.72) is the **card surcharge that never reached Xero**.

HubSpot invoice fields (read live):
```
hs_subtotal                     = 6149.00
hs_order_level_discounts_total  = 668.50      (the partner commission)
hs_discounts_total              = 668.50
hs_amount_billed                = 5699.72     ← truth: subtotal − discount + 219.22 surcharge
hs_amount_paid                  = 5699.72
```
Note `hs_amount_billed` (5699.72) ≠ `hs_subtotal − hs_order_level_discounts_total` (5480.50). The €219.22 surcharge is **added on top** — it is NOT a line item, NOT in the discount, NOT tax.

---

## 2. Two different fees — do not conflate

| Fee | Who pays | Direction | On the invoice? | This case |
|---|---|---|---|---|
| **"Add fees" buyer surcharge** | the **customer** | money **in** — raises `hs_amount_billed` | yes (baked into billed) | **€219.22** (4% card / ~1% SEPA) |
| **Stripe/HubSpot processing fee** | **ULearn** | money **out** — reduces payout | no — deducted from payout | €270.90 |

The €5,699.72 the customer paid **includes** the €219.22 surcharge. The €5,428.82 received is after Stripe's **separate** €270.90 processing fee. The two fees are unrelated and only coincidentally similar in size here. This gap doc is about the **surcharge** (money in), not the processing fee.

(Side economics, for context only: the 4% surcharge collected €219.22 but the actual Stripe fee was €270.90, so ULearn under-recovered €51.68 on this international card — flat 4% covers EU/UK cards but not non-EEA. That's a pricing-policy point, separate from this sync bug.)

---

## 3. Root cause — confirmed

HubSpot's **"add fees"** feature lets a merchant charge the buyer a fee that varies by payment method (e.g. 4% card vs ~1% SEPA). Key facts (researched + confirmed against live data):

- It is applied **at checkout, when the buyer selects their payment method** — i.e. **ex-post**, at payment, NOT at invoice creation. So the surcharge is genuinely **unknowable when the `invoice-created` sync runs** if the buyer pays later.
- It **increases the total the buyer pays** and is reflected in the invoice's `hs_amount_billed` (confirmed: INV-1316 billed = 5699.72).
- Available for invoices, payment links, quotes, subscriptions.

Sources:
- HubSpot — Configure your buyer checkout experience ("add fees"): https://knowledge.hubspot.com/payment-processing/configure-your-buyer-checkout-experience#add-fees
- HubSpot payments — FAQ: https://knowledge.hubspot.com/payment-processing/payments-frequently-asked-questions
- HubSpot — Understand order totals, billing, and charges (processing fee is deducted, not on the invoice): https://knowledge.hubspot.com/account-management/understand-hubspot-order-totals-billing-and-charges-frequently-asked-questions

**Why Xero ends up short** — the SIS Xero builder reconstructs the invoice from parts and ignores `hs_amount_billed`:

`src/scripts/xero-invoice-commission.ts` → `createXeroInvoiceFromHubSpot()`:
- Reads `hs_order_level_discounts_total` → `commissionEUR` (668.50). (line ~159)
- Builds `xeroLines` = HubSpot line items (Σ amount = 6149.00) **+** one negative `"Partner Commission — {agency}"` line of `−commissionEUR`. (lines ~246–266)
- → Xero total = 6149.00 − 668.50 = **5,480.50**.
- It fetches `hs_amount_billed` into `ip.hs_amount_billed` (line ~140) but **never uses it to set or validate the total**. The €219.22 surcharge has no representation in the rebuilt invoice, so it is dropped.

This affects **both** the create path and the update/reconcile path — they share the same `xeroLines` construction.

**Why nothing re-syncs Xero after payment** — `src/routes/webhooks.ts` → `POST /invoice-paid` handler (≈ lines 1449–1727):
- Reads HubSpot `hs_amount_billed` / `hs_amount_paid`, sums across the deal's invoices.
- Updates the **SIS booking** (`amountPaid`, `amountOpen`, status PENDING→PARTIAL→CONFIRMED) and upserts **SIS Payment** rows.
- Flips the **deal to its own pipeline's won stage** (correctly reads `wonStage` from the deal's pipeline — does NOT hardcode `closedwon`).
- **Never calls `createXeroInvoiceFromHubSpot` / `updateInvoice` / touches Xero at all** — the Xero references in its body are only comments.
- `createXeroInvoiceFromHubSpot` (via `createXeroInvoiceWithRetry`) is invoked **only from `invoice-created`** (calls at lines ~804 and ~1412).

So: the surcharge lands in `hs_amount_billed` at payment, but the only thing that writes the Xero invoice ran at creation. If the buyer pays by card after the invoice was created at the base price, Xero is never corrected. (In INV-1316 the surcharge was already in `hs_amount_billed` at creation time — payment preceded invoice creation by seconds — yet Xero is still €5,480.50, which proves the builder bug independently of timing.)

(Trigger note: INV-1316 was HubSpot workflow-enrolled 5 Jun 10:16 IST though the invoice/payment was 2 Jun — confirms the sync is workflow-driven. The `invoice-paid` workflow fires on `amount_paid > 0` and whenever `amount_paid` changes.)

---

## 4. Proposed fix — two parts

### Part A (core): builder must reconcile its total to `hs_amount_billed`
In `createXeroInvoiceFromHubSpot()`, after building `xeroLines` (line items + commission line), add a positive balancing line for any residual vs `hs_amount_billed`:

```
expectedTotal = Σ(lineItem.amount)  −  commissionEUR        // 6149.00 − 668.50 = 5480.50
residual      = round(hs_amount_billed − expectedTotal, 2)  // 5699.72 − 5480.50 = +219.22
if (residual > 0.01) {
  xeroLines.push({
    description: 'Card Surcharge',          // wording TBD
    quantity: 1,
    unitAmount: residual,
    accountCode: <decision — see §5>,
    taxType: 'NONE',
  });
}
```
- Use HubSpot's per-line `amount` (post per-line discount) for the sum, not `price × quantity`, to avoid rounding drift.
- Result: Xero total = `hs_amount_billed` = €5,699.72 → matches the Stripe receipt, reconciles 1:1.
- Bank-transfer invoices (no surcharge): residual ≈ 0 → no line added → behaviour unchanged.
- This self-heals any other positive adjustment HubSpot bakes into `hs_amount_billed` beyond line-items-minus-discount, not just card surcharge.

### Part B (trigger): `invoice-paid` should re-sync the Xero invoice
Have `POST /invoice-paid` call the builder's **update path** (via `createXeroInvoiceWithRetry` / `createXeroInvoiceFromHubSpot`) after it processes the payment, so Xero refreshes to the now-final `hs_amount_billed`. This covers the invoice-created-then-paid-later-by-card flow where the surcharge only appears at payment. Belt-and-suspenders alongside Part A.

---

## 5. Decisions to settle before building (Neil + SIS Claude)

1. **Account code for the surcharge line.** `100` (sales) keeps the total right but books surcharge as revenue. Cleaner is a dedicated **merchant-fees / card-surcharge** account so it nets against the Stripe processing fee in the P&L (leaving the true ~€51.68 net cost on this txn). This is the one real accounting decision.
2. **Negative residual** (`hs_amount_billed < expectedTotal`) — should not occur; **log + skip/flag**, do not silently add a negative line.
3. **Paid-invoice guard.** The builder's update path refuses to re-author a Xero invoice that already shows `amountPaid > 0` / `PAID`. Today Xero invoices are unpaid at this stage (bank-line reconciliation is a separate, later, manual/headless process), so the update is allowed — but confirm, and decide behaviour if a Xero payment already exists.
4. **Back-catalogue.** Every card-paid invoice synced before the fix is short by its surcharge. A one-off sweep is needed to correct historical Xero invoices (the existing `src/scripts/backfill-hubspot-fees.ts` may already be related — check it first).
5. **Confirm the HubSpot source field.** INV-1316 shows the surcharge only as the residual (billed − (subtotal − discount)); confirm whether HubSpot also exposes it as a discrete fee property. If a clean field exists, read it directly rather than inferring the residual.

---

## 6. Verification plan
- Re-run the builder for INV-1316 in dry-run → expect Xero total €5,699.72 (a €219.22 "Card Surcharge" line added).
- Confirm a SEPA/bank-transfer invoice (no surcharge) is unchanged (residual ≈ 0, no extra line).
- Confirm `invoice-paid` re-sync updates an existing unpaid Xero invoice and is blocked on a paid one.
- Spot-check the P&L account the surcharge lands in matches the §5.1 decision.

---

## 7. Boundaries / what this is NOT
- This is **virtual payment application** (the digital copy of "money came in") across HubSpot → Xero invoice → SIS. It is **not** bank reconciliation. Matching the actual Stripe bank line in Xero is a separate accounting process (manual / headless-browser session replay) handled on the hub/fins side.
- The processing fee (€270.90) and the bank-line matching are out of scope here.

## 8. Scope — only the SIS-synced cohort; standard invoices already self-heal via DataSync

(Neil, near-verbatim — important boundary on the fix.)

This is **only relevant for our synced invoices** — the non-aligned cohort, i.e. invoices that carry a **global / one-time discount** (as HubSpot calls them): partner commissions, LifePass, goodwill deductions, 0% commission lines, etc. Our sync is **just for those non-aligned invoices**. That cohort is already very well understood by the code — **there is no need to add anything else; it will only ever respond in respect of those types of invoices.**

For **regular/standard invoices** (just line items → a total, no one-time discount), everything should just work properly already, because those invoices are kept **aligned between HubSpot and Xero by the DataSync module** — the plug-in that Xero created in the HubSpot marketplace. So this is **probably not a problem** for invoices that don't have commissions, don't have LifePass applied, and don't have one-time discounts applied for some other reason. Standard invoices will **adapt in the background without anyone even knowing** — when a person chooses to pay by card at 4%, the invoice itself changes in HubSpot, and that **triggers a sync refresh across into Xero too** (via DataSync).

So we just basically need to **mirror that protocol** in the invoices that *we* take care of — the one-time-discount cohort DataSync deliberately can't represent. (This is the rationale for Part B: replicate DataSync's "HubSpot total changed → refresh Xero" behaviour for our cohort.)

## Cross-references
- Hub-side origin notes: `hub/.claude/Docs/Projects/inv-charge-relaign.md` (this file's source).
- SIS memory: HubSpot→Xero invoice sync via SIS webhook (not native DataSync); the builder owns any invoice carrying an order-level discount.
- Related known SIS item: invoice-paid won-stage handling (reads deal's own pipeline; does not hardcode closedwon).
