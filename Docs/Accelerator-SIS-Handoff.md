# Accelerator — SIS Portal Handoff (for the SIS-side build)

> **Produced in hubapp, handed to the SIS Claude Code.** The hubapp engine (fields, AutoQuote branch,
> reconcile, crons) **and** the dynamic base-protected contract **are built and live**. The remaining piece
> lives in SIS: surface the contract on partner login and push the signature date to HubSpot. Goes live
> **with / just after** the Accelerator email send. Full spec: `hubapp/Docs/Accelerator/Accelerator-Build-Spec.md`.

## What SIS must build

1. **On partner login**, if the agency has **not yet signed** (`agencies.accel_agree_date IS NULL`), fetch
   the partner's **personalised, base-protected contract** from hubapp and embed it:

   `GET https://hub.ulearnschool.com/hubapp/accelerator/contract?companyId={agencies.hubspot_company_id}`
   — or `?contactId={hubspot_contact_id}` for a **sole trader** with no company (e.g. Saranzaya).

   hubapp returns a **self-contained HTML** document (logo inlined; branded to match the partner's email) with
   a **3-column table — Funded Enrolments · Tier · Your Rate = max(base, tier)** — so the partner **NEVER sees a
   rate below their existing base** (critical: an existing 25%/28% partner shown "22%" will not sign). Embed the
   returned HTML (iframe or inject). It already contains the click-to-agree `#accel-agree` checkbox and the
   `#accel-activate` button for step 2. *(hubapp resolves the base rate from the entity's `commission`; a new
   partner with none defaults to 22% and simply sees the climbing ladder.)*

2. On **"Agree & Activate"** (`#accel-activate`, enabled once `#accel-agree` is checked):
   - Stamp SIS: `agencies.accel_agree_date = today` (date). Add the column if absent. **Log** who/when.
   - **Push to HubSpot** (existing SIS→HubSpot bridge) — PATCH the partner's HubSpot **Company**
     (`agencies.hubspot_company_id`), or the **Contact** (`hubspot_contact_id`) for a sole trader, setting
     three already-created properties:
     - `accel_agree_date`  = today (YYYY-MM-DD)
     - `accel_cycle_start` = today (YYYY-MM-DD)
     - `accel_cycle_end`   = **31 Dec of (this year + 1)** — founding runway (sign 2026 → `2027-12-31`)
   - Idempotent: only set when first signing; never overwrite an existing `accel_agree_date`.

3. Done — the moment `accel_agree_date` lands on the HubSpot entity, the hubapp engine takes over (a HubSpot
   workflow inherits to employee contacts; hubapp computes the tiered commission at quote time + reconciles
   nightly). **SIS computes no rate** — it only captures the signature + date, and embeds the hubapp-rendered doc.

## Endpoints / properties reference

- **Contract (read):** `GET /hubapp/accelerator/contract?companyId=` | `?contactId=` | `?base=<pct>` (preview).
  Returns branded HTML. `contract.js` renders it; base resolved from `commission` on the entity.
- **Company/Contact props** (created, group `sales_properties`): `accel_agree_date` (date),
  `accel_cycle_start` (date), `accel_cycle_end` (date), `accel_won_count` (number), `accel_cmsn` (number %).
  SIS writes only the **first three** on signing.
- PATCH `https://api.hubapi.com/crm/v3/objects/companies/{id}` (or `/contacts/{id}`) with
  `{ "properties": { "accel_agree_date":"YYYY-MM-DD", "accel_cycle_start":"YYYY-MM-DD", "accel_cycle_end":"YYYY-MM-DD" } }`.

## Notes

- The contract is **evergreen** — no year/signee-specific clauses, no appendix. The founding cycle is a rule
  ("31 Dec of the following year"), computed per signee.
- The **base-protection** and **override** terms are in the rendered contract: base can never be reduced (the
  rate in the original agreement + any since, prior to signing); on signature this overrides the commission
  terms of the existing agreement, all other partnership terms remain in force.
- The **Send-5** launch gift is NOT in the contract (time-boxed email offer only), keeping the contract evergreen.
