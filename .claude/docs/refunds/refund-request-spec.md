# Refund Request — D11 Webform Spec

Source brief: `refund-request.md` (same folder).
D7 reference: legacy webform node 3776 (alias `/refund-request`), 20 components, recovered from `.claude/Docs/tmp/ulearn_clean_24.02.2025_18.16.sql.gz`.
Territory data: `sites/default/files/territory/territory_map.json` (228 nationalities → 4 categories: EU, Non-EU (VBD), Non-EU (No Visa), Unsupported Territory).
Handler pattern: mirrors `become_a_student.yml` — Drupal Webform → HubSpot handler → optional Drupal enrichment module for Deal-level fields (see `handler-module.md`).

---

## 1. Legacy D7 form — what was there

20 fields, single page, with one conditional rule:

| Field key | Type | Required | Notes |
|---|---|---|---|
| student_name | textfield | yes | |
| agent_name_if_applicable | textfield | no | |
| invoice_number | textfield | yes | |
| refund_type | select | yes | visa / course / security / accomm |
| amount_requested | textfield | no | |
| bank_type | select | yes | iban / international — **drives conditional** |
| bank_country | select | yes | full country list |
| payee_name | textfield | yes | |
| payee_address | textfield | yes | |
| payee_address_2 | textfield | no | |
| payee_country_of_residence | select | yes | full country list |
| bic_address | textfield | yes | BIC / SWIFT |
| nsc | textfield | yes | shown only if bank_type = international |
| account_number | textfield | yes | |
| bank_name | textfield | yes | |
| bank_street_address | textfield | yes | |
| bank_city | textfield | yes | |
| correspondent_bank | textfield | yes | shown only if bank_type = international |
| correspondent_swift | textfield | yes | shown only if bank_type = international |
| other_information | textarea | no | |

Single conditional: `bank_type == 'international'` → show NSC + correspondent fields.

---

## 2. What's changed since then

- **Escrow via TransferMate (TM)** now handles the vast majority of refunds for Non-EU (VBD) nationalities — payment must return to the sending account by KYC rule. Bank details on the form are largely irrelevant for these cases; TM already has them.
- **Visa refusal is the dominant refund reason** for VBD applicants. It's not an operational issue — it's an embassy decision.
- **Nationality-driven branching** is now possible because we have `territory_map.json`. We can derive the user's territory and adapt the form path.

---

## 3. New D11 form — design

### 3.1 Field order (single page, with reveal-on-condition) — REVISED per Neil's responses

| # | Field | Type | Required | Behaviour |
|---|---|---|---|---|
| 1 | student_name | textfield | yes | |
| 2 | student_email | email | yes | confirmation + SIS contact match |
| 3 | nationality | select (popular countries top, full list below) | yes | copy the booking form's country layout; drives territory lookup |
| 4 | territory (computed) | hidden | — | populated by JS from territory_map.json; re-derived server-side on submit |
| 5 | invoice_number | textfield | yes | helps locate the booking in SIS |
| 6 | agent_name_if_applicable | textfield | no | retained from D7 |
| 7 | refund_reason | select | yes | options depend on territory — see §3.2 |
| 8 | refund_reason_other | textfield | conditional | shown if refund_reason = other |
| 9 | visa_refusal_letter | managed_file | conditional | shown if refund_reason = visa_refusal; `accept="image/*,application/pdf"` + `capture="environment"` for phone camera |
| 10 | amount_requested | textfield | no | cross-checked against student record |
| 11 | **Payment Path** (fieldset) | container | — | wraps processor + method |
| 11a | payment_processor | select | yes | VBD: `transfermate` (default) + `not_transfermate` only. Non-VBD: full list (TM, BoI, Revolut, Stripe) |
| 11b | payment_processor_other | select | conditional | bank_of_ireland / revolut / stripe — shown for VBD users who picked `not_transfermate` |
| 11c | payment_method | select | yes | bank / debit_card / credit_card — tooltip: "Processor = the company that handled your payment (usually TransferMate). Method = how you paid them (bank, debit, credit)." |
| 12 | **Bank details** (fieldset) | container | — | **always shown** — refunds always pay back by bank transfer. Tooltip on the fieldset: "Enter the same account you used to send the fees — under anti-money-laundering rules TransferMate can only return funds to the sending account." |
| 12a–k | (legacy bank fields) | various | yes/no per D7 | bank_type, bank_country, payee_name, payee_address, payee_address_2, payee_country_of_residence, bic_address, nsc, account_number, bank_name, bank_street_address, bank_city, correspondent_bank, correspondent_swift — with bank_type=international still surfacing NSC + correspondent fields |
| 13 | other_information | textarea | no | |

### 3.2 Design decisions — FINAL (incorporating Neil's responses below)

1. **Unsupported Territory: not blocked.** Use the booking form's country dropdown pattern — popular countries grouped at the top, full alphabetical list (including unsupported ones) below.
2. **EU nationals: visa_refusal hidden.** Refund-reason options are filtered by territory:
   - **EU**, **Non-EU (No Visa)**, **Unsupported**: `operational_service`, `operational_satisfaction`, `operational_cancellation`, `other` only.
   - **Non-EU (VBD)**: all of the above plus `visa_refusal`.
   - JS rebuilds the options on `nationality` change; server-side validation re-checks based on derived territory.
3. **TransferMate-only for VBD.** When territory = Non-EU (VBD), `payment_processor` shows just two options: `transfermate` (default) and `not_transfermate` (which reveals the BoI/Revolut/Stripe sub-select). For non-VBD territories, all processors are listed directly.
4. **Bank details always shown.** Refunds are always paid out by bank transfer regardless of how the fees were paid. No card-refund path. Fieldset has a tooltip making clear the account must match the sending account (KYC / AML).
5. **`agent_name_if_applicable` kept** as a non-required field.
6. **`student_email` added** — was missing from the D7 form despite being essential. Drives confirmation email + SIS contact match.
7. **Visa refusal letter accepts photo capture** — `<input type="file" capture="environment">` triggers camera on mobile, falls back to file picker on desktop.

## Neil Response: 
Okay, in your design, make decisions, don't block unsupported territory. Like, I would say the same thing as in the incoming forms. Like, we can just use the drop-down that you see, for example, I think in the contact form or sidebar form. Um, no, actually, do you know where it is? In the booking form, the new booking form, that's where it is. And that form is well laid out because it has the popular countries that we use all the time up front and then it has the other, like, shithole countries that, like, they're not supported, so what's the point? Afghanistan to Zimbabwe, you know, like all those ones are just down the list. So, yeah, I would include them, but leave them way down and you can copy that um same setup from the booking form. EU nationals can pick visa refusal. No, that doesn't make sense. Transfermate is default and surface first. Yeah, but only when they choose their nationality, right? So if they are non-EU VBD, right, if they come from Turkey or China or whatever, like, clearly we're gonna be pushing transfermate there. Well, let me see. If they're from VBD, I would go down that route of saying just surface transfermate and I didn't use transfermate. Bank details only appear for non- Well, I'll put it this way, like, there is no situation here where we're gonna be taking a credit card details in this form. So the only way they have to get the money back is bank details. So it must always be surfaced in my opinion. The other kind of restriction, I suppose, that we might meet down the road, but I'm not gonna try and program for it now. But if they put in the wrong bank account, like they put in their mom's bank account or their wife's bank account or whatever, and it TransferMate's record of the account that they used in the beginning to send the money, they're not gonna get the refund, right? Like by anti-money laundering and all the rest of laws, they can only TransferMate can only go back to the account that sent it. So if they go ahead and put in the wrong account, we might put a tooltip or some info and say like, you must put in the same account that you used to send the fees. But other than that, like, no, like we're not going to be doing anything. Everyone is going to get paid back by bank transfer. They don't get paid back into their credit card. I'm not even sure there's a way to do that, so. Agent name. Um, I'll still leave it there, just leave it as a non-required field, agent name. Like, it's useful to have it, I suppose, you know, it's not the end of the world. Student email, well, clearly, I said that at the very beginning, yeah. Quite surprised it wasn't on the other form. Like, I'm pretty sure that we were sending back dates to them. Perhaps I didn't ask for it. Anyway, it definitely needs to be there. I don't know why I didn't do that. And then, yeah, the visa refusal capture, that's brand new, so uploader capture needs to be on there.
## 

### 3.3 Open questions — RESOLVED

- **Payment Path tooltip wording** — confirmed fine.
- **Confirmation page** — dedicated `/refund-request-received` page (NOT `/thanks` — that path fires a GA4 conversion event for booking-form submissions).
- **HubSpot mapping** — **dropped entirely**. Refund data goes to SIS (existing Visa & Travel docs bucket is the natural home for the refusal letter). When a refund is approved, the related HubSpot deal moves manually from "Contract" stage to "Lost" by accounts — no Drupal-side HubSpot writes for this form.

---

## 4. Conditional logic (Webform states) — revised

```yaml
refund_reason_other:
  '#states':
    visible:
      ':input[name="refund_reason"]': { value: other }

visa_refusal_letter:
  '#states':
    visible:
      ':input[name="refund_reason"]': { value: visa_refusal }
    required:
      ':input[name="refund_reason"]': { value: visa_refusal }

payment_processor_other:
  '#states':
    visible:
      ':input[name="payment_processor"]': { value: not_transfermate }

# bank_details fieldset is ALWAYS shown — no #states on it.

nsc:
  '#states':
    visible:
      ':input[name="bank_type"]': { value: international }
# correspondent_bank, correspondent_swift — same as nsc
```

Refund-reason options and processor options are JS-driven from the territory category (not Webform states), since the option list itself changes — not just visibility of a fixed field.

---

## 5. Territory derivation

Small JS attached to the form:
1. On `nationality` change, fetch `/sites/default/files/territory/territory_map.json` (already publicly served, cache-friendly).
2. Look up selected country → write category into hidden `territory` field.
3. Optional: show a one-line banner under the nationality field ("Detected territory: Non-EU (VBD)") so the user sees what the form thinks.

Server submission validates the territory server-side too (don't trust the hidden field — re-derive from nationality in the HubSpot handler).

---

## 6. SIS storage (HubSpot dropped)

Submission destination: **SIS only**, no HubSpot handler.

On submission:
- The Webform submission record is the source of truth in Drupal.
- A submit handler in the `refund_request` custom module:
  1. Looks up the student in SIS by `student_email` (and `invoice_number` as tiebreaker).
  2. Inserts a `refund_request` row in SIS linked to that student + their TM transaction record (the existing "shadow" Escrow payment).
  3. Pushes the `visa_refusal_letter` upload into the existing SIS Visa & Travel docs bucket.
  4. Sets the request status to `pending_review`.
- HubSpot: no automated write. Accounts moves the related deal from "Contract" → "Lost" manually after approval.

Bank fields stay in the Drupal Webform submission storage (and copied to the SIS refund_request row) — they're internal-only, never pushed to HubSpot.
---

## 7. Files to deliver

1. `modules/custom/refund_request/` — custom module wrapping webform + approval workflow.
2. `webform.webform.refund_request.yml` — full webform config, importable via `drush config:import --partial`.
3. `js/refund-territory-detect.js` — nationality → territory hidden-field updater + refund-reason / processor option rebuilder.
4. `refund_request.libraries.yml` — attaches the JS to the form.
5. `refund_request.module` — submit handler (writes to SIS, pushes file to Visa & Travel bucket).
6. `refund_request.routing.yml` + admin controller — accounts review/approve UI (see §8).
7. `refund_request.install` — SIS `refund_request` table schema (id, submission_id, student_id, status, tm_transaction_id, approved_by, approved_at, sent_at, …).
8. Documentation update: this file moves from `2.ToDo/webform/` to a Done/ archive once shipped.

---

## 8. Approval & TransferMate email workflow — SIS-based

Source: §"UPDATE - NEW EFFICIENT PROCESSING?" in `refund-request.md`, plus the architectural decision to push the approval pathway into SIS (where accounts already lives).

### 8.1 Architecture

| Layer | Responsibility |
|---|---|
| **Drupal** | Public capture only. Renders the form, validates input, accepts the visa-refusal upload, POSTs the full submission payload (multipart with the file) to a SIS webhook endpoint, then redirects to `/refund-request-received`. No Drupal admin UI. No HubSpot writes. |
| **SIS** | System of record from the moment the request lands. Hosts the `RefundRequest` model, the review queue, the editable fee deduction, the Approve/Reject/Batch actions, the outbound email to `refunds@transfermate.com`, the audit trail, and the historical dashboard. |

Single source of truth = the SIS row. The visa refusal letter is filed into the existing `StudentDocument` table (category `"visa"`) so it shows up alongside the rest of the student's visa docs.

### 8.2 SIS additions

**Prisma model** — new `RefundRequest`:

```prisma
model RefundRequest {
  id              Int      @id @default(autoincrement())
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  studentId       Int?     @map("student_id")
  student         Student? @relation(fields: [studentId], references: [id])
  bookingId       Int?     @map("booking_id")
  booking         Booking? @relation(fields: [bookingId], references: [id])

  // Form payload (captured verbatim from Drupal)
  studentName     String   @map("student_name")
  studentEmail    String   @map("student_email")
  nationality     String
  territory       String   // EU | Non-EU (VBD) | Non-EU (No Visa) | Unsupported Territory
  invoiceNumber   String   @map("invoice_number")
  agentName       String?  @map("agent_name")
  refundReason    String   @map("refund_reason")  // visa_refusal | operational_service | operational_satisfaction | operational_cancellation | other
  refundReasonOther String? @map("refund_reason_other")
  amountRequested Decimal? @map("amount_requested") @db.Decimal(10,2)

  paymentProcessor      String  @map("payment_processor")        // transfermate | not_transfermate
  paymentProcessorOther String? @map("payment_processor_other")  // bank_of_ireland | revolut | stripe
  paymentMethod         String  @map("payment_method")           // bank | debit_card | credit_card

  // Bank fields (legacy D7 set; always captured)
  bankType        String?  @map("bank_type")
  bankCountry     String?  @map("bank_country")
  payeeName       String?  @map("payee_name")
  payeeAddress    String?  @map("payee_address")
  payeeAddress2   String?  @map("payee_address_2")
  payeeCountry    String?  @map("payee_country")
  bicSwift        String?  @map("bic_swift")
  nsc             String?
  accountNumber   String?  @map("account_number")
  bankName        String?  @map("bank_name")
  bankStreetAddress String? @map("bank_street_address")
  bankCity        String?  @map("bank_city")
  correspondentBank  String? @map("correspondent_bank")
  correspondentSwift String? @map("correspondent_swift")

  otherInformation String? @map("other_information") @db.Text

  // Refusal doc lives in StudentDocument; we keep a reference here
  visaRefusalDocId Int? @map("visa_refusal_doc_id")

  // Approval lifecycle
  status          String   @default("pending_review")  // pending_review | approved | sent_to_tm | rejected
  feeDeductionEur Decimal  @default(300.00) @map("fee_deduction_eur") @db.Decimal(10,2)
  feeBreakdown    String   @default("€250 visa processing + €50 non-refundable registration fee") @map("fee_breakdown")
  approvedById    Int?     @map("approved_by_id")
  approvedBy      SisUser? @relation(fields: [approvedById], references: [id])
  approvedAt      DateTime? @map("approved_at")
  sentToTmAt      DateTime? @map("sent_to_tm_at")
  rejectedAt      DateTime? @map("rejected_at")
  rejectReason    String?  @map("reject_reason") @db.Text

  @@index([status])
  @@index([studentId])
  @@map("refund_requests")
}
```

**Routes** (`src/routes/refunds.ts`):
- `POST /sis/api/webhooks/refund-request` — public, accepts the Drupal payload (multipart). Validates a shared secret header, resolves the student by email+invoice, files the upload as a `StudentDocument(category="visa")`, creates the `RefundRequest`, returns `201`. Notifies accounts (email or in-app).
- `GET /sis/api/refunds` — authenticated. Filter by status, territory, reason, date range.
- `GET /sis/api/refunds/:id` — single row + resolved student/booking/Escrow payment context.
- `PATCH /sis/api/refunds/:id` — accounts edits fee deduction / breakdown.
- `POST /sis/api/refunds/:id/approve` — flips to `approved`, then composes + sends the TM email, flips to `sent_to_tm`, stamps `sent_to_tm_at`. Audit-logged.
- `POST /sis/api/refunds/:id/reject` — body `{ reason }`, sets `rejected`, audit-logged.
- `POST /sis/api/refunds/batch-approve` — body `{ ids: [] }`, loops the single approve path.

**Business logic** (`src/scripts/refunds/`):
- `intake.ts` — webhook handler: validate secret, resolve student, persist row + doc.
- `approve.ts` — derived refund amount, build TM email, send, transition status.
- `email.ts` — Nodemailer-style sender (re-use the existing `scripts/email` module).
- `tm-template.ts` — the email body template.

**Auth** — uses the existing `requireAuth` + role-based section gating in `src/app.ts`. Refunds are gated to roles `admin`, `accounts` (new sub-role if not yet defined), and `dos`. The webhook endpoint is added to `publicPaths` and validates a header `X-Refund-Secret` against `process.env.REFUND_WEBHOOK_SECRET`.

### 8.3 SIS admin surface

Two pages under `/sis/refunds/`:

1. **Queue** (`/sis/refunds`) — default landing.
   - Columns: id, date, student, territory, reason, amount, status, age (days pending).
   - Filters: status (default = `pending_review`), territory, reason.
   - Bulk select + "Approve all selected" button → calls `batch-approve`.
   - Row click → review page.

2. **Review** (`/sis/refunds/:id`) — single request.
   - Top: status badge + action buttons (Approve & Send to TM / Reject / Save).
   - Left: form data captured from the user.
   - Right: SIS-resolved context — student record card, Escrow payment row (highlighted), all StudentDocuments for that student.
   - Editable: fee deduction amount + breakdown text. Defaults `€300` / standard breakdown.
   - Approve flow: confirm modal → POST `/approve` → on success shows the rendered TM email body + delivery receipt + reminder "Move HubSpot deal to Lost now".
   - Reject flow: textarea for reason → POST `/reject` → email back to student with the reason.

3. **History** (`/sis/refunds?status=all`) — same queue view, all statuses, with date-range filter. Provides the audit trail. CSV export.

### 8.4 TM email template

```
To: refunds@transfermate.com
Cc: accounts@ulearnschool.com
Subject: Refund Request — {{ student.firstName }} {{ student.lastName }} — TM Tx {{ tm_transaction_id }}

Hi TransferMate,

Please process a refund for the student below. The visa refusal letter is attached.

Student Name:        {{ student.firstName }} {{ student.lastName }}
ULearn Student ID:   {{ student.id }}
TM Transaction ID:   {{ tm_transaction_id }}
Original Amount:     €{{ original_amount }}
Fee Deduction:       €{{ fee_deduction_eur }} ({{ fee_breakdown }})
Refund Amount:       €{{ refund_amount }}

Refund destination: the original sending account (per KYC / AML).

Thanks,
ULearn Accounts
accounts@ulearnschool.com
```

Sent via the existing `scripts/email` module (Nodemailer-based), with the visa refusal doc attached from disk (or a signed URL into the SIS uploads dir if attachment size becomes an issue).

### 8.5 Phased delivery

| Phase | Scope | Ships when |
|---|---|---|
| **Phase 1** | Drupal form + SIS intake webhook + SIS Queue/Review pages with manual Approve action. Email to TM on approve. | Now — replaces the missing D7 form and gives accounts a single review screen. |
| **Phase 2** | Batch approve, CSV export, history filters, accounts in-app notification badge. | Iteration once Phase 1 is in use and we know the real volume. |
| **Phase 3** | Direct TransferMate API call instead of email — driven by the TM API work already underway. | When the TM API integration is in place; collapses the human relay step. |

### 8.6 Open items to verify before Phase 1

- Escrow payment lookup — currently `Payment.method = "TransferMate"` and `Payment.transactionId` holds the TM tx ID. Confirm whether the Escrow "shadow" payment is stored with a specific `type` value (e.g. `"escrow"`) or distinguished some other way.
- Drupal → SIS service auth — shared secret in env on both sides (`REFUND_WEBHOOK_SECRET`). Use a 32-byte random value generated once.
- Accounts notification — re-use the existing `EmailLog` / `scripts/email` path; no new channel.
- SIS role for accounts — confirm whether the existing `ROLE_PERMISSIONS` map already has an `accounts` role, or whether we extend an existing one.
