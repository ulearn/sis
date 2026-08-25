# SPEC (for SIS-side Claude): "invoice fully paid → deal Closed Won" must be pipeline-aware

**Owner system:** SIS (`sis.ulearnschool.com`) — the HubSpot↔Xero invoice/payment integration.
**Suspected handler:** `POST /sis/api/webhooks/invoice-paid` — fired by a HubSpot **workflow** when a payment is applied to an invoice. The workflow is only the trigger; this handler does the deal write. (Sibling of the known `/sis/api/webhooks/invoice-created` → `createXeroInvoiceFromHubSpot`.) **To confirm:** the deal stage write must originate here (look for a `dealstage`/`closedwon` write); verify before editing.
**HubSpot app making the bad writes:** `INTEGRATION` source, **app id `24751607`** (confirmed via deal property history `sourceId`). A workflow-native stage change would instead show `AUTOMATION_PLATFORM`, so the write is server code using this app's token — i.e. the webhook handler, not the workflow. This app id appears nowhere in `fins`/`hubapp`, so the handler lives in the SIS codebase.
**Date raised:** 2026-06-04. Raised by Neil after B2B deals were observed jumping into the Direct/B2C pipeline.

## Problem
When an invoice becomes fully paid, the SIS integration moves the associated deal to **Closed Won by hardcoding `dealstage = "closedwon"`**. `"closedwon"` is the won stage of the **Direct Sales (`default`) pipeline only**. In HubSpot, writing a `dealstage` that belongs to a different pipeline **also moves the deal into that pipeline**. Result: **B2B deals (pipeline `35765201`) get dragged out of B2B Sales and into Direct/B2C** and marked closedwon. B2C deals are unaffected (they are already in `default`).

This silently corrupts pipeline reporting, commission attribution (B2B vs B2C), and forecasting. It has been happening for weeks and staff have been manually dragging deals back.

## Evidence (deal property history, HubSpot)
- Deal `314876430560` "Point Intercâmbios – Augusto Almeida Poliani": pipeline `35765201`/`109570243` since 2025-09-25 (CRM_UI) → **2026-06-03T16:17:54Z flipped to `default`/`closedwon` by INTEGRATION/24751607** the instant its invoice (INV-1192) reached fully-paid.
- Deal `387804997824` "Blue Intercâmbios – Laura Donini" (INV-1154): same, flipped 2026-06-03T16:18:05Z.
- Deal `238354109677` "Mickaela Pina de Lima | Blue Intercâmbios" (INV-1127): flipped 2026-06-03T16:18:23Z.
- Deal `493808162028` "LanguageCourse S.L." (INV-1319): flipped to `default`/`closedwon` by INTEGRATION/24751607 on **2026-05-19**, then a human dragged it back to `35765201`/`104175589` on 05-26 — proves this is recurring and pre-dates today.

(The three 2026-06-03 flips were a side effect of a one-off Xero→HubSpot payment backfill run from `fins`. The backfill only created Payments; the deal flip was done entirely by app 24751607's "fully paid" handler. Those three deals have since been manually restored.)

**Recurring at scale — 2026-05-29 batch (8 deals in 16 seconds):** an overnight/batch payment run tripped eight agency (B2B) deals from `35765201` → `default` between 05:00:13 and 05:00:29Z, all by INTEGRATION/24751607. Diego flagged them in Slack; Saraa hand-moved all 8 back to `35765201` on 2026-06-02 (07:10–07:13Z). Deal IDs: 504675442879, 504719695041, 504712684745, 504720217307, 503017578713, 503018813679, 503018584253, 343602975981 (e.g. "Re-abroad – Nako Murase", "Japan Ireland Adventures – Kairi Kawabata", "Mathmycourse Chile – Cristóbal Castro"). Each shows the same fingerprint: created in B2B by 24751607, flipped to default by 24751607 on payment, then CRM_UI restore. This is ongoing manual cleanup cost, not a one-off.

## Required behaviour
On "invoice fully paid → mark deal won", the handler must set the deal to the **won stage of the deal's OWN pipeline**, never a hardcoded literal:

1. Read the deal's current `pipeline` (and `dealstage`).
2. Resolve that pipeline's won stage from HubSpot's pipelines API (`GET /crm/v3/pipelines/deals`) — do **not** hardcode stage IDs; resolve by stage metadata/label so it survives pipeline edits. (Cache per process.)
3. If the deal is already at its pipeline's won stage, no-op.
4. Update **only `dealstage`** to that pipeline's won stage. Do **not** write `pipeline` and do **not** write a stage from a different pipeline.

This is exactly the pattern already used in `fins/scripts/tm/escrow.js` (`markWon`): it reads `deal.properties.pipeline`, looks up `wonStages[pipeline]`, throws if none resolves, and sets `dealstage` only. Mirror that.

## Pipeline / stage reference (HubSpot portal, deals)
| Pipeline | id | Won stage | Lost stage |
|---|---|---|---|
| Direct Sales (B2C) | `default` | `closedwon` (WON) | `closedlost` (LOST) |
| B2B Sales | `35765201` | `104175589` (WON) | `104175590` (LOST) |

(Full B2B stages: 104175584 INBOX · 104175585 NAQ REQUEST · 104175586 ENGAGEMENT · 104175587 CONSIDERATION & NEGOTIATION · 1555217649 PROPOSAL · 109570243 ENROLMENT · 104175588 CONTRACT · 104175589 WON · 104175590 LOST.)

Only these two pipelines carry money-bearing deals today; other pipelines are moot.

## Acceptance tests
- A B2B deal (`35765201`, any non-won stage) on a fully-paid invoice → ends at `35765201`/`104175589`, pipeline unchanged. **Must NOT become `default`.**
- A B2C deal (`default`) on a fully-paid invoice → ends at `default`/`closedwon` (unchanged behaviour).
- A deal already at its pipeline's won stage → no write.

## Follow-up (separate from the code fix)
A broader audit is warranted: other B2B deals may have been flipped to `default`/`closedwon` by this handler historically and never manually restored. Query deals currently in `default`/`closedwon` whose `pipeline` property history shows a prior `35765201` value, and restore them. (Out of scope for the SIS code change itself.)
