# Refund Request — Deployment Guide

Two-server deploy: SIS (Node) and Drupal. Apply in the order below.

## 0. Pre-flight

- Generate a shared secret (32-byte random) — same value lands in `.env` on both servers.
  ```bash
  python3 -c "import secrets; print(secrets.token_hex(32))"
  ```
- Create the public confirmation page on Drupal at path `/refund-request-received` (a simple node — "Thanks, we've received your refund request and accounts will be in touch.").

## 1. SIS deploy (do this first — Drupal posts to SIS)

All files live under `.claude/Docs/2.ToDo/webform/build/sis/`. Copy them into the SIS repo on the **claude** branch only (per the SIS CLAUDE.md rule — never push to master).

### 1.1 Prisma model
Append the contents of `sis/prisma/refund_request.prisma` to `prisma/schema.prisma`.
Add the back-relation fields noted at the top of that file into `Student`, `Booking`, and `SisUser`.

Generate + migrate:
```bash
ssh sis@sis.ulearnschool.com
source /home/sis/nodevenv/public_html/sis/20/bin/activate
cd /home/sis/public_html/sis
npx prisma migrate dev --name add_refund_requests
npx prisma generate
```

### 1.2 Source files
Drop into the repo:
- `src/routes/refunds.ts`
- `src/scripts/refunds/index.ts`
- `src/scripts/refunds/tm-template.ts`
- `public/refunds/queue.html`
- `public/refunds/review.html`

Apply the four small patches in `sis/src/app.patch.ts` to `src/app.ts` (one import, two `app.use` mounts, two page routes).

### 1.3 Env vars
Add to `/home/sis/public_html/sis/.env`:
```
REFUND_WEBHOOK_SECRET=<paste the shared secret>
SIS_UPLOADS_ROOT=/home/sis/public_html/sis/uploads
```

### 1.4 Build + restart
```bash
npx tsc
touch tmp/restart.txt
tail -n 50 sis.log
```

### 1.5 Smoke test
```bash
# Webhook auth (should be 401 without secret):
curl -sS -X POST https://sis.ulearnschool.com/sis/api/webhooks/refund-request/webhook -d '{}'

# With secret (should 400 — missing payload — confirming auth passes):
curl -sS -X POST https://sis.ulearnschool.com/sis/api/webhooks/refund-request/webhook \
  -H "X-Refund-Secret: <secret>" -d 'payload={}' -F 'placeholder=1'
```

Then log into SIS and visit `/sis/refunds` — should render the empty queue.

## 2. Drupal deploy

All files live under `.claude/Docs/2.ToDo/webform/build/drupal/`.

### 2.1 Custom module
Copy:
- `modules/refund_request/refund_request.info.yml`
- `modules/refund_request/refund_request.module`
- `modules/refund_request/refund_request.libraries.yml`
- `modules/refund_request/js/refund-territory-detect.js`

→ to `/home/ulearn/web/ulearnschool.com/public_html/modules/custom/refund_request/`.

Enable:
```bash
/home/ulearn/web/ulearnschool.com/public_html/vendor/bin/drush en refund_request -y
```

### 2.2 Env vars
Add to the Drupal environment (e.g. `.htaccess` SetEnv or `settings.php`):
```php
$_ENV['SIS_REFUND_WEBHOOK_URL'] = 'https://sis.ulearnschool.com/sis/api/webhooks/refund-request/webhook';
$_ENV['SIS_REFUND_WEBHOOK_SECRET'] = '<paste the same shared secret>';
putenv('SIS_REFUND_WEBHOOK_URL=' . $_ENV['SIS_REFUND_WEBHOOK_URL']);
putenv('SIS_REFUND_WEBHOOK_SECRET=' . $_ENV['SIS_REFUND_WEBHOOK_SECRET']);
```

### 2.3 Import the webform
```bash
# Stage the YAML somewhere Drush can read:
cp /home/ulearn/web/ulearnschool.com/public_html/.claude/Docs/2.ToDo/webform/build/drupal/webform.webform.refund_request.yml /tmp/

# Import:
/home/ulearn/web/ulearnschool.com/public_html/vendor/bin/drush config:import:single --source=/tmp/webform.webform.refund_request.yml
```

(Or, if `config:import:single` isn't available on this version: use the Webform UI → Configuration → Import, or add the YAML to your config sync dir and `drush cim --partial`.)

### 2.4 Create the form node + alias
A webform isn't user-accessible until you attach it to a node, or place it via its canonical URL `/webform/refund_request`. For consistency with the booking form pattern, create a Webform node:

```bash
/home/ulearn/web/ulearnschool.com/public_html/vendor/bin/drush php:eval "
\$node = \Drupal\node\Entity\Node::create([
  'type' => 'webform',
  'title' => 'Refund Request',
  'webform' => ['target_id' => 'refund_request'],
  'status' => 1,
  'path' => ['alias' => '/refund-request', 'pathauto' => 0],
]);
\$node->save();
echo 'Created node ' . \$node->id();
"
```

### 2.5 Cache clear
```bash
/home/ulearn/web/ulearnschool.com/public_html/vendor/bin/drush cr && \
  curl -s "https://waf.sucuri.net/api?k=5bfae191907f1f376d43fbd99a0533bd&s=ff1c246ec17e6cc0c1c6ba29475d0330&a=clearcache"
```

## 3. End-to-end smoke test

1. Visit https://ulearnschool.com/refund-request — form renders.
2. Pick a Non-EU (VBD) nationality (e.g. China) → confirm:
   - "Detected territory: Non-EU (VBD)" banner appears under the nationality field.
   - Refund reason dropdown shows Visa Refusal at the top.
   - Payment processor shows only TransferMate + "I didn't use TransferMate".
3. Pick visa_refusal → confirm upload field appears.
4. Submit (with a small dummy PDF).
5. Land on `/refund-request-received`.
6. In SIS, log in → `/sis/refunds` → see the new pending row.
7. Click row → review page renders, refusal letter shows in iframe, payment table shows any TransferMate payments on the booking.
8. Click Approve → confirm email sent (check `sis.log` and the TM mailbox).

## 4. Watch-outs

- **HubSpot stays out of this flow.** When a refund is approved, accounts must manually move the deal from "Contract" stage to "Lost" in HubSpot.
- **Escrow / TM transaction ID lookup** is best-effort. If `Payment.method = "TransferMate"` isn't set, the email will say "(not resolved — please provide manually)". Fix: ensure the Escrow shadow payments are recorded with `method = "TransferMate"` and `transactionId = <TM ref>` at booking time.
- **File size cap** is 10 MB at both Drupal (Webform setting) and SIS (Multer config). Bump in both places if needed.
- **Rate limit** on the form: 5 submissions per user per 24h. Adjust `limit_user` in the Webform YAML if the form needs to handle bulk re-submissions.
- **Visa refusal letter** is stored under `sis/uploads/students/<id>/visa/` as a `StudentDocument` row with `category="visa"` — so it surfaces alongside other visa documents in the student record.

## 5. Phase-2 follow-ups (not in this drop)

- In-app accounts notification badge in SIS (count of `pending_review`).
- Stronger Escrow payment matcher (look up by invoice number → booking → payment).
- TM API direct call instead of email, replacing the `sendEmail` step in `approve()`.
