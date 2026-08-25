# LifePass — Subscription Invoicing & Xero Accounting

**Audience:** accounts / sales ops / engineers / Claude handoff. Documents how a LifePass
sale is invoiced across HubSpot and Xero, why it is structured this way, and the manual
step required to keep Xero clean. Financial facts only.

> **One-line summary:** A LifePass sale is billed as **two** invoices — a €997 onboarding fee
> and a single **€7,425 master subscription invoice** (suffix `-Sub`) that represents the whole
> 25-payment liability upfront. HubSpot's subscription module then auto-raises a **€297 invoice
> per monthly payment**; these are convenient for sales (they show the payment settling) but must
> **never be treated as receivables in Xero** — they would double-count against the master. The
> HubSpot→Xero Data Sync mirrors them anyway, so accounts **voids each €297 invoice in Xero**.
> Subscription receipts are allocated against the **master `-Sub` invoice**, progressively
> reducing its balance.

---

## 1. Product & amounts

| Component | Amount | Frequency | Invoice |
|---|---|---|---|
| Onboarding fee | **€997** | one-off | standalone invoice (e.g. `INV-1086`) |
| Subscription | **€297** | per payment × **25** | one **master** invoice (e.g. `INV-1088-Sub`) |
| **Subscription total** | **€7,425** | (25 × €297) | the master `-Sub` invoice |
| **Total contract value** | **€8,422** | (997 + 7,425) | — |

- The subscription runs **24 months but bills 25 times** — the customer pays on **day one** plus 24
  monthly cycles. `25 × €297 = €7,425`.
- The onboarding invoice (€997) syncs to Xero and is settled normally; the backend sync also creates
  the LifePass **booking** in SIS. It is not part of the problem described below — only the
  subscription leg is.

## 2. Why HubSpot subscriptions (the bridge)

Direct debit is the desired long-term collection method, but is unavailable at the point of sale:

- Students arrive in Ireland **without an Irish bank account**, so they cannot set up a SEPA direct
  debit at onboarding.
- ULearn does **not currently have a direct-debit facility with Bank of Ireland** (repeated setup
  attempts declined; deprioritised vs. closing sales).

So HubSpot Commerce **subscriptions (charged via Stripe)** are used as a **bridge** until the student
can move onto direct debit:

- The **card fees** on Stripe subscription payments create a standing incentive for students to switch
  to (cheaper) direct debit — the outcome ULearn wants.
- The **card stays on file**: if a later direct-debit payment fails at the bank, the card can be
  charged as a fallback (~48h after the failure).

## 3. The two-invoice model & why the master invoice exists

Rather than recognise subscription income only as each €297 arrives, the **entire €7,425 is invoiced
upfront** as a single master receivable (the `-Sub` invoice). Reasoning:

- **Recognises the full committed value as accounts receivable (trade debtors) on day one.** The
  customer is contractually committed for the full term, so the whole €7,425 is a real receivable, not
  a maybe.
- The unbilled-in-time portion is effectively **deferred / unearned income**; each subscription receipt
  **reduces the master's outstanding balance**, progressively converting committed value into collected
  revenue.
- **Locks the customer in and increases the balance-sheet value of the company** — a portfolio of large
  committed receivables (e.g. 10 × ~€7.4k ≈ €75k) reflects secured future income, versus a trickle of
  tiny monthly invoices that understate the commitment.

**Allocation rule:** every €297 subscription receipt is assigned against the **master `-Sub` invoice**,
reducing its balance. The master is the single receivable of record for the subscription.

## 4. The Xero double-count problem & the manual fix

HubSpot's subscription module **automatically raises a €297 invoice for every subscription payment**
(e.g. `INV-1350`, `INV-1415`, …). These serve one legitimate purpose:

- **Sales visibility** — staff see each little invoice settle inside HubSpot, giving an at-a-glance
  confirmation that the monthly payment cleared.

The problem:

- The **master `-Sub` invoice (€7,425) already represents the full liability** in Xero. The auto-created
  €297 invoices, if they land in Xero as receivables too, **double-count** the same money.
- The **HubSpot→Xero Data Sync mirrors them into Xero automatically**, where they sit **unpaid**. There
  is no reliable way to stop this at source (the sync grabs new invoices as they are created).

**Current process (manual, by design):**

The €297 invoices are **deliberately allowed to sync into Xero** — they are not blocked or auto-voided on
arrival. They serve as the **reconciliation handle**: an incoming €297 Stripe payment carries no
per-customer identifier, so the auto-invoice (which carries the customer's **email**) is the practical way
to work out **which customer** a given €297 payment belongs to. Per payment, accounts:

1. **Matches** the incoming €297 Stripe receipt to its auto-created €297 Xero invoice (identify customer via
   email → confirm in HubSpot if needed).
2. **Reassigns** the payment to the **master `-Sub` invoice**, reducing its balance.
3. **Voids** the now-empty €297 invoice in Xero — it then exists only in HubSpot (retaining its sales
   visibility) and no longer inflates Xero receivables.

The **master `-Sub` invoice remains the single Xero receivable** for the subscription.

## 5. Worked example — deal `505531960533`

HubSpot deal → invoices (live figures):

| Invoice | Amount | Status | Role |
|---|---|---|---|
| `INV-1086` | €997 | paid | Onboarding fee |
| `INV-1088-Sub` | €7,425 | open | **Master** subscription receivable (absorbs all €297 payments) |
| `INV-1350` | €297 | paid | Auto-created subscription invoice → **void in Xero** |
| `INV-1415` | €297 | paid | Auto-created subscription invoice → **void in Xero** |

In the customer's **Xero** contact, the auto-created €297 invoices appear unpaid until voided.
After voiding, only `INV-1086` (€997) and `INV-1088-Sub` (€7,425) remain, and the €297 receipts are
assigned to `INV-1088-Sub`.

## 6. Operating rules

- **DO** allocate every €297 subscription receipt against the master `-Sub` invoice.
- **DO** void each auto-created €297 subscription invoice in Xero (they stay in HubSpot for sales
  visibility).
- **DO NOT** treat the €297 auto-invoices as Xero receivables — they double-count the master.
- **DO NOT** delete them in HubSpot — sales relies on seeing them settle there.
- The `-Sub` suffix marks the master invoice. SIS also keys off it: the invoice-paid webhook **skips
  `-Sub` (and voided) invoices** when recomputing a booking balance, and LifePass partner commission
  accrues off the `-Sub` invoice while the `-Sub` invoice itself is **hidden from the partner portal**.

## 7. Known gaps / open items

- **Auto-voiding is deliberately NOT automated (decision, 2026-07-24).** Immediately voiding the €297
  invoices in Xero as they arrive was considered and **rejected** — it would remove the only reconciliation
  handle (the auto-invoice's email) for matching an anonymous €297 Stripe receipt to a customer, and create
  more reconciliation work than it saves. The manual match → reassign → void flow above stays until a
  direct-debit system gives each customer a stable per-payment identifier.
- **Direct-debit migration** remains the end goal and the trigger to revisit this: once a Bank of Ireland
  direct-debit facility exists and payments carry a per-customer identifier, the reconciliation handle is no
  longer needed and blocking/auto-voiding the €297 invoices becomes worthwhile.

---

*Related: `subs/subs.md` (original analysis of why HubSpot subscriptions cannot natively allocate
against a master receivable), `xero-hubspot-3bucket-2026-06-17.md` (HubSpot↔Xero sync buckets),
`Partner/Credit-Management-Technical.md` (the other cross-system HubSpot↔Xero↔SIS subsystem).*
