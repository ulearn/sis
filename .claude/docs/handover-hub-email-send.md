# Handover — Send an LOA (or any document) as a Gmail attachment, on-box

**Audience:** the Claude Code instance running for the Hub.
**Updated:** for the on-box `node` + `documentScripts` access pattern you already use for generate/issue/revoke — **no HTTP API, no session, no API key.**

The send orchestration used to live only inside the HTTP route handler (which is why `documentScripts` had no send function). It has now been **extracted into `documentScripts.sendDocument(...)`**, so you can call it the same way you call `generateDraft` / `issueDocument`. The HTTP route now calls the same function — one shared path.

---

## The whole flow, on-box

Everything below runs in one `node` process against the compiled SIS build, with SIS's `.env` loaded (needs `DATABASE_URL`, and for the Gmail send `GOOGLE_SERVICE_ACCOUNT_KEY`).

```js
const SIS = '/home/sis/web/sis.ulearnschool.com/public_html/sis';
require('dotenv').config({ path: SIS + '/.env' });
const { PrismaPg } = require(SIS + '/node_modules/@prisma/adapter-pg');
const { PrismaClient } = require(SIS + '/dist/generated/prisma/client');
const { documentScripts } = require(SIS + '/dist/scripts/documents');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const docs = documentScripts(prisma);

(async () => {
  const studentId = 12345, bookingId = 67890;

  // 1. Get the PDF doc id. Reuse the latest ISSUED LOA, or generate+issue fresh.
  let issued = (await docs.listDocuments({ studentId, status: 'ISSUED' }))
                 .filter(d => d.documentType === 'letter_of_acceptance')
                 .sort((a, b) => b.id - a.id)[0];
  if (!issued) {
    const draft = await docs.generateDraft(/*templateId*/ 1, studentId, bookingId, 'admin');
    await docs.issueDocument(draft.id);              // must be ISSUED before send
    issued = await docs.getDocument(draft.id);
  }
  const docId = issued.id;

  // 2. Render the cover-email body from the right template (on-box, no HTTP).
  //    Agent → 'LoA-Attach-Agent', Student → 'LoA-Attach-Student'.
  const { tokens } = await docs.resolveTokens(studentId);
  const tpl = await prisma.documentTemplate.findUnique({ where: { slug: 'LoA-Attach-Agent' } });
  const body = docs.renderTemplate(tpl.htmlTemplate, tokens);   // resolves {if}/{{token}}
  // (Do NOT add a signature — sendDocument appends it + applies house style.)

  // 3. >>> HOLD HERE for Neil's approval. Show recipient, subject, body, docId. <<<

  // 4. Send (this is the "click send"): attaches the PDF, sends via Gmail, logs.
  const r = await docs.sendDocument({
    docId,
    to:      'agent@example.com',
    from:    'success@ulearnschool.com',     // must be in ALLOWED_SENDERS
    fromName:'ULearn',
    subject: 'ULearn Letter of Acceptance',
    body,
    sentBy:  'hub',
  });
  console.log(r);   // { status:'sent', messageId, threadId, filename }
  process.exit(0);
})();
```

---

## `documentScripts.sendDocument(opts)`

```ts
sendDocument({
  docId:   number,    // an ISSUED document_record id
  to:      string,
  from:    string,    // ALLOWED_SENDERS only (below)
  fromName?: string,  // default 'ULearn'
  subject?: string,   // default = template/document name
  body?:    string,   // rendered cover-email HTML; signature auto-appended
  sentBy?:  string,
}) → { status:'sent', messageId, threadId, filename }
```
Regenerates the issued PDF (puppeteer), sends via the Gmail service account with the PDF attached, writes a `document_dispatches` row + an `email_log` row. **Throws** `Document not found` / `Only issued documents can be sent` — guard on those.

Allowed `from` senders (anything else throws): `info@`, `accomm@`, `dos@`, `sales@`, `accounts@`, `partners@`, `success@`, `app@` — all `@ulearnschool.com`. LOAs go from **`success@`**.

Template ids/slugs: LOA document = `templateId 1` (`LOA-NonEU-QR`); cover emails = `LoA-Attach-Agent` (#75) / `LoA-Attach-Student` (#76). `docs.listDocuments({})` and `prisma.documentTemplate.findMany()` enumerate the rest.

---

## Notes
- **Approval gate:** steps 1–2 are prep; only run step 4 after Neil approves. That single `sendDocument` call IS the send.
- **Env:** the Gmail send needs `GOOGLE_SERVICE_ACCOUNT_KEY` (path to the DWD key) present in the process env — loading SIS's `.env` covers it. Without it, `sendEmail` throws "Service account key file not found".
- **LOA payment gate:** `generateDraft` enforces full-payment; pass role `'admin'` (4th arg) so it's satisfiable, or only generate for paid bookings.
- **No signature in `body`** — `sendDocument` appends the ULearn signature and applies the Verdana house style. Double-signing if you add your own.
- An equivalent HTTP route still exists (`POST /sis/api/documents/:id/send`) but you don't need it — it now calls this same `sendDocument`.
