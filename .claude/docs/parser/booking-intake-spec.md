# Booking intake — two-track strategy

Decided 2026-06-06. Goal: **end staff transcription of partner booking forms**, without building a permanent home for the PDF habit we actually want to kill.

Two separate problems, solved separately, converging on the **same** `enroll(agencyId, data)` path → HubSpot deal at Enrolment/Quote stage → **Saraa clicks auto-quote manually** (sales must stay aware; not an automatic sale) → surfaces in the partner portal.

```
            ┌─ TRACK A: magic-link student form (adoption — the real fix)
 canonical  │
   data  ───┼─→ enroll(agencyId, data) ─→ HubSpot deal ─→ [manual auto-quote] ─→ partner portal
            │
            └─ TRACK B: staff PDF parser (stopgap — for holdouts)
```

---

## Track B — Parser engine (BUILT, 2026-06-06)

`src/scripts/booking-parser.ts` → `parseBookingPdf(pdf: Buffer)`.

- **Stage 1 (free, deterministic):** `pdftotext -layout` (poppler, already on the box) → text.
- **Stage 2 (cheap):** OpenAI `gpt-4o-mini` (override via `OPENAI_PARSER_MODEL`) maps the text → canonical JSON whose field names + enum values mirror the partner-portal `enrollForm`. `temperature 0`, `json_object` mode.
- **`normalize()`** safety net: coerces enums to form-valid values (or null + `needsReview`), derives `courseWeeks`/dates.
- Returns `{ booking, text, usage, model }`. `booking.needsReview[]` = fields the model was unsure about (ambiguous ticks etc.) for the human to confirm.
- **Cost/perf:** ~$0.0004 per form, ~1 call. No new npm deps (child_process + global fetch). Tested live on the legacy ULearn form (Wakana Adachi) — clean extraction incl. course "General English 20AM" → group/morning/20.
- **Not handled yet:** scanned/image PDFs (no OCR — throws a clear error); contradictory forms (e.g. visa "NO" ticked but a visa type also ticked) surface as a `needsReview`/human-confirm concern.

### Remaining for Track B (UI — placement undecided, NOT the partner portal)
Staff-only tool: **upload PDF + select partner (agencyId)** → `parseBookingPdf` → prefilled review screen (`needsReview` highlighted) → confirm → existing `enroll(agencyId, data)`. The ONLY new piece was the engine; everything downstream is reuse. Likely home = SIS admin; could later be fed by an email-in workflow (forward attachment → auto-parse). **Never expose to partners** — that would entrench the PDF habit.

---

## Track A — Magic-link student enrollment (SPEC — adoption play)

**Why:** the answer to "how do I get agents off PDFs." The agent fills nothing and sends no PDF — they hand their **student** a link. The student lands on *our* enrollment form, submits, and it's auto-attributed to the agency. Agent does *less* work than emailing a PDF, keeps their "I have my own system / hidden middleman" appearance, loses no margin. Carrot + PDF-killer in one.

**Precedent:** the SIS host portal already uses magic-link auth + token attribution (`[[project_host_portal_v1]]`) — mechanism is proven in this codebase.

### Mechanism
1. **Per-agency link token.** Each agency gets a stable, rotatable token → `agencyId`. Mint from the partner portal ("Share enrollment link") and store (DB table or signed HMAC like the host-portal pattern). Rotatable so a leaked link can be killed.
2. **Student-facing form.** Reuse `enrollForm` minus agent-only chrome, scoped to the agency via the token. No login — the token *is* the auth, read-only to one action (create enrollment for this agency).
3. **White-label / proxy.** Serve under a neutral domain (e.g. `schoolbookings.com/<token>`) reverse-proxied to SIS `/enroll/<token>`, so the student never sees `ulearnschool.com` and the agent's middleman position is preserved. (Subdomain `book.<neutral>.com` also fine; per-agency vanity URLs are NOT worth 150 DNS entries — one neutral domain + token path.)
4. **Submit → same path.** `enroll(agencyId, data)` → deal in the agency's HubSpot account (their domain/email attribution) → Enrolment stage → **manual auto-quote by Saraa** → partner portal.

### Guards / notes
- The Housam→Ahmed "student must not submit under the agent's own email" guard in `enroll()` already protects this path.
- Rate-limit by token; CAPTCHA if abused. Token scope is create-only, single agency.
- Optional later: pre-fill the agency name/branding on the form from the token so it feels bespoke to that agent.

### Phasing
1. Token mint + storage + "Share link" button in partner portal.
2. `/enroll/<token>` public student form (reuse enrollForm) → `enroll()`.
3. Neutral domain + reverse proxy (white-label).
4. (Optional) per-agency light branding on the form.

---

## Convergence
Both tracks produce the **same canonical `data`** and call the **same `enroll(agencyId, data)`**. Build the parser engine once (done), the enroll path once (done), and the two intake surfaces are thin shells on top. Track A is the strategic win; Track B is the insurance for holdouts so we never hand-transcribe again.
