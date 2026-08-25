# HANDOVER — Secure the hub tooling + enable the Challenges editor write

**Audience:** the Claude working on the hub (`hub@` / hub.ulearnschool.com).
**Prepared by:** the SIS-side Claude, 2026-06-07.

## TL;DR
1. Put an auth gate in front of the **human-facing** hub dashboards + their action/write endpoints.
2. THEN flip the Challenges editor from read-only → read-write (files staged in this folder).

The Challenges dashboard is **LIVE NOW but READ-ONLY** (no write endpoint exposed):
`/hubapp/public/challenges-dashboard.html`, linked as the first card on `/hubapp/public/dashboard.html`.

## Why this exists
Security audit of hub.ulearnschool.com found **no auth anywhere** on the tooling:
- No `.htaccess` auth, no `.htpasswd`, no IP gate. `server: nginx`, **not behind Cloudflare** (no `cf-ray`).
- ~20 unauthenticated `hubapp` POST routes incl. **live actions**: `/hubapp/campaigns/send-campaign`
  + `/b2c/send-campaign` (send email!), `/hubapp/send-email`, `/sequence-enroll`, `/recycle`,
  `/deal-discount`, `/auto-quote`, `/quote-creator`, `/update-list-campaigns`, `campaigns/save-email`.
- `/fins/payroll/zoho/leave/sync-all` (POST) also open. megatron.html + all dashboards open.
We were adding ANOTHER write (Challenges → edits the discount % autoQuote applies). Neil's call:
**lock down the whole hub**, not just the new endpoint.

## ⚠️ CRITICAL CONSTRAINT — do NOT blanket-auth the vhost
A naive "basic-auth the whole site" will BREAK live integrations. These are machine-to-machine and
MUST stay open (no human login):
- **Public reads (other servers hit them):**
  - `GET /hubapp/challenges/current`  ← the SIS partner portal fetches this on every enrol-form load
  - `GET /hubapp/challenges`           ← same family; the Drupal booking site will fetch it too
- **Inbound webhooks (HubSpot / Resonate / Vapi / external):**
  - `POST /hubapp/form-ai-email`, `/recycle`, `/chat-followup`, `/vapi-outbound`, `/vapi-callback`,
    `/vapi-fox*`, etc. (verify each by its caller — grep the senders before deciding)

So the gate must be **PATH-SCOPED**: protect HUMAN dashboards + their action endpoints, EXEMPT the
machine/webhook/public-read paths. Enumerate before flipping anything.

### Path classification (starting point — verify each)
**GATE** (human dashboards + their write/action buttons):
- `/megatron.html`, `/hubapp/public/*.html` (all dashboards), `/fins/financial.html`, `data-integrity.html`
- `POST /hubapp/campaigns/*` (incl. send-campaign), `/deal-discount`, `/update-list-campaigns`,
  `/send-email`, `/sequence-enroll`, `/fins/payroll/*`, and the NEW `POST /hubapp/challenges`

**EXEMPT** (machine — leave open):
- `GET /hubapp/challenges`, `/hubapp/challenges/current`
- the inbound webhooks above, unsubscribe pages
- check whether `/hubapp/auto-quote` / `/quote-creator` are triggered by HubSpot workflows — if so,
  exempt or protect them with a separate machine token, not the human login.

## Two acceptable approaches (Neil's preference, easiest-first)

### Option A — PIN / passphrase (simplest; Neil: "not the crown jewels")
Single shared PIN, standard login dialog.
- Cleanest: a small Express middleware in `hubapp` that, **for gated paths only**, checks a signed
  cookie; if absent, serves a tiny PIN page (PIN in `process.env`). Add the SAME middleware to the
  `fins` app (separate app — must be added there too).
- OR Apache `.htaccess` Basic Auth scoped by `<Location>`/`<Files>` to the gated paths only (NOT the
  whole vhost — see constraint). No code, but Apache path-scoping with the exemptions is fiddlier.
- Recommended: **app-level middleware with an explicit EXEMPT allowlist** — most controllable given
  the webhook/read exemptions.

### Option B — Google session (Neil's preferred IF easy)
"If logged into a Google account on a ulearn domain, you're in."
- **Not behind Cloudflare** (`server: nginx`), so the zero-code Cloudflare Access path isn't available
  unless you put the site behind Cloudflare first.
- Realistic impls:
  - **oauth2-proxy** in front (nginx `auth_request`) with Google OIDC, restricted to the Workspace
    domain (`hd=ulearnschool.com` / your domains). Path-exempt the machine routes via nginx `location`
    blocks. No app code, but needs nginx config access + an oauth2-proxy process.
  - OR app-level `passport-google-oauth20` in hubapp (+ fins), domain-restricted. More code, both apps.
  - If you DO put hub behind Cloudflare, **Cloudflare Access + Google IdP** becomes the easiest
    (zero app code, domain-restricted) — matches Neil's mental model exactly.

## After the gate is up — enable the Challenges WRITE
Staged in this folder (`hubapp/.claude/challenges-handover/`):
- `registry.js.NEW` — adds `saveChallenges()` (validates %/dates 0–100 + YYYY-MM-DD, atomic temp+rename
  write, busts the mtime cache) to the live-read registry. Only diff vs current `registry.js` = that
  function + its export line. Copy over `scripts/challenges/registry.js`.
- `dashboard.html.NEW` — the 4-card index (already deployed; kept here for reference).
- `challenges-dashboard.html` — the editor (already deployed in read-only mode).
- Add this POST route to `index.js`, right after the existing `GET /hubapp/challenges`:
  ```js
  app.post('/hubapp/challenges', (req, res) => {
    try {
      const body = (req.body && req.body.months) ? req.body.months : req.body;
      const saved = challenges.saveChallenges(body);
      res.json({ success: true, months: saved });
    } catch (e) { res.status(400).json({ success: false, error: String((e && e.message) || e) }); }
  });
  ```
  (`req.body` is already a parsed object — `express.text` + `jsonSanitizerMiddleware` handle that.)
- In `public/challenges-dashboard.html`, flip `const READONLY = true;` → `false` (it already POSTs to
  `/hubapp/challenges` and renders the full editor).
- Restart: `touch hubapp/tmp/restart.txt` (needed for registry.js + index.js; the JSON itself is
  live-read and never needs a restart).
- **The POST must be in the GATED set** — it edits the discount the booking flow applies.

## How the Challenges system works (so you don't break it)
- Single source: `hubapp/scripts/challenges/challenges.json` (keyed `YYYY-MM`). `registry.js` reads it
  LIVE via an mtime cache — editing the JSON is instant, no restart. `autoQuote`/`creator` read the %
  via `registry.getChallengeDiscount()`.
- Consumers of the GET endpoint: SIS partner portal (live now), Drupal booking site (being built).
  Keep the GET open.

## Also flag to Neil (separate from this task)
The pre-existing **unauthenticated campaign-send** endpoints are the bigger exposure. If
hub.ulearnschool.com is internet-reachable (nginx, no CF Access found), those are open today.
Securing them is the real win here — the Challenges write is minor by comparison.
