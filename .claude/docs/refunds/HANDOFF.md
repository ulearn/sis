# Refund Request — SIS-side Handoff

**Owner now:** SIS Claude. The Drupal capture layer is already live; this brief covers the SIS-side work that completes the loop.

## 1. Context

ULearn just shipped a public refund-request form on the Drupal site:
- URL: **https://ulearnschool.com/refund-request** (Drupal node 103, webform id `refund_request`)
- Thank-you page: `/refund-request-received` (node 104)
- The Drupal custom module `refund_request` POSTs each submission, plus the visa refusal letter as a multipart file, to:
  **`POST https://sis.ulearnschool.com/sis/api/webhooks/refund-request/webhook`**
  with header `X-Refund-Secret: <shared secret>`.

Right now SIS does not have this endpoint, so the Drupal module logs a warning and stores the submission locally in Drupal Webform only. Once you ship the SIS side and we set the env var on Drupal, submissions will start forwarding automatically.

**Design principles (already agreed with Neil):**
- SIS is the system of record once the request lands. No HubSpot writes.
- Approval is a SIS UI action by accounts. On Approve, SIS emails `refunds@transfermate.com` (cc `accounts@ulearnschool.com`) with the refusal letter attached.
- When approved, accounts manually moves the related HubSpot deal to "Lost" — the SIS UI prompts this.
- Visa refusal letter goes into the existing `StudentDocument` table with `category: "visa"` so it surfaces alongside the rest of the student's visa docs.

## 2. What's been staged

All staged files are in this folder (`.claude/docs/refunds/`):

| File | Purpose |
|---|---|
| `refund-request-spec.md` | Full spec — read this first. §8 covers SIS architecture; §6 covers the SIS storage model. |
| `prisma/refund_request.prisma` | The new `RefundRequest` model to append to `prisma/schema.prisma`. Includes the back-relation lines you need to add into `Student`, `Booking`, and `SisUser`. |
| `src/routes/refunds.ts` | Express Router. Public webhook (`/webhook`) + authenticated CRUD/approve/reject/batch. |
| `src/scripts/refunds/index.ts` | Business logic: `intake`, `list`, `get`, `update`, `approve`, `reject`, `batchApprove`, `getRefusalLetterStream`. |
| `src/scripts/refunds/tm-template.ts` | TM email body (text + HTML). |
| `src/app.patch.ts` | The four edits to make in `src/app.ts`: import, two `app.use` mounts, two page routes. |
| `public/refunds/queue.html` | Accounts queue page — filters, bulk-select, batch approve, CSV export. |
| `public/refunds/review.html` | Per-request review — student panel, payments panel, refusal-letter iframe, editable fee deduction, Approve / Reject. |
| `README-DEPLOY.md` | Step-by-step deploy of both sides (Drupal half already done — section 2 of that doc). |

**These files are a blueprint, not a final source-of-truth.** Adapt names, mounts, and patterns to whatever is already in place. In particular, please check / adjust:

- Path of the email module (`src/scripts/email.ts` exports `sendEmail` and `EmailAttachment` — I read this, but if signatures have changed, adjust the `approve()` call accordingly).
- Whether `accounts` is a real role in `ROLE_PERMISSIONS` or whether refund management should sit under an existing role (admin / dos).
- Whether the webhook prefix `/sis/api/webhooks/refund-request/` collides with anything (it shouldn't — it's specific).
- Whether `Payment.method = "TransferMate"` and `Payment.transactionId` are the right keys to look up the Escrow shadow payment, or whether there's a more specific marker (e.g. `Payment.type = "escrow"`).

## 3. Deploy steps (summary)

Full detail in `README-DEPLOY.md` §1. TL;DR:

1. **Prisma**: append `refund_request.prisma` content to `prisma/schema.prisma`; add the three back-relation lines; `npx prisma migrate dev --name add_refund_requests`; `npx prisma generate`.
2. **Source**: drop `src/routes/refunds.ts`, `src/scripts/refunds/index.ts`, `src/scripts/refunds/tm-template.ts`, `public/refunds/queue.html`, `public/refunds/review.html` into the repo.
3. **`src/app.ts`**: apply the four patches in `src/app.patch.ts` (import, webhook mount, authenticated mount, page routes).
4. **`.env`**: add `REFUND_WEBHOOK_SECRET=<32-byte hex>` and `SIS_UPLOADS_ROOT=/home/sis/public_html/sis/uploads`. **Generate the secret on SIS side** (`python3 -c "import secrets; print(secrets.token_hex(32))"`) and send the value back to Neil so he can set the matching `SIS_REFUND_WEBHOOK_SECRET` on Drupal.
5. **Build + restart**: `npx tsc && touch tmp/restart.txt`.

## 4. Smoke tests

```bash
# Webhook auth gate (expect 401):
curl -sS -X POST https://sis.ulearnschool.com/sis/api/webhooks/refund-request/webhook -d '{}'

# With secret (expect 400 — missing payload — confirms auth passes):
curl -sS -X POST https://sis.ulearnschool.com/sis/api/webhooks/refund-request/webhook \
  -H "X-Refund-Secret: $REFUND_WEBHOOK_SECRET" \
  -F 'payload={"student_name":"Test","student_email":"t@x.com","nationality":"China","territory":"Non-EU (VBD)","invoice_number":"X-1","refund_reason":"visa_refusal","payment_processor":"transfermate","payment_method":"bank"}'

# Then log into SIS as admin and visit https://sis.ulearnschool.com/sis/refunds
# — should render the queue with the test row.
```

## 5. Handoff back to Neil

Once SIS is up:

1. Send Neil the shared secret value.
2. Confirm the smoke test row appears in the SIS queue.
3. He'll set `SIS_REFUND_WEBHOOK_SECRET` and `SIS_REFUND_WEBHOOK_URL` on Drupal, after which real submissions start flowing through.
4. Live end-to-end test: he submits via the form, you confirm a queue row + the visa refusal letter attached to the student's `StudentDocument` row.

## 6. Out of scope for this drop (Phase 2+)

- Accounts in-app notification badge (count of `pending_review`).
- Stronger Escrow payment matcher (`invoiceNumber → booking → payment`).
- Direct TransferMate API call in place of the email step (depends on the TM API work already underway elsewhere).
- HubSpot deal "Lost" automation — explicitly deferred; manual for now.

## 7. Watch-outs

- **Don't push to GitHub master.** Per SIS CLAUDE.md, repo work is read-only / claude-branch only.
- **Don't write to HubSpot from this flow.** Refund processing intentionally bypasses HubSpot.
- **File size cap** is 10 MB at both Drupal (Webform setting) and SIS (Multer config in `src/routes/refunds.ts`). Match if you change one.
- **Email attachments**: the `approve()` path reads the file from disk and passes it as a Buffer to `sendEmail`. If the existing `sendEmail` signature has changed since this was written, adjust the attachment block in `src/scripts/refunds/index.ts` (function `approve`).

## 8. Contact

If anything is ambiguous, check the spec doc (`refund-request-spec.md`) — it has Neil's inline responses to all the original open questions. If still stuck, surface to Neil rather than guessing on architecture.
