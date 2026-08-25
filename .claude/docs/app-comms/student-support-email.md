# Student App — "Message Us" Support Mechanism (spec)

**Status:** spec only — not built (2026-06-11)
**Goal:** let a logged-in student contact the school from the student app, replacing the static email/phone line in the Support card. Low effort — reuses existing email-send + logging + in-app inbox; no new tables, no new mail setup.

## Why it's cheap
- `sendStudentEmail(prisma, {...})` (`src/routes/email.ts:138`) already does SES SMTP send + house style + writes an `EmailLog` row linked to the student. The support form just calls it.
- Student is authenticated (`req.session.studentId`), so identity is known — no name/email entry, no spam vector, replies thread back automatically.
- In-app inbox already exists (`messageScripts.postToApp`, `src/scripts/messages.ts`) for the acknowledgement.

## Current state (what this replaces)
- `public/student.html` ~line 1098–1102: **Support & FAQ** card is static text — `success@ulearnschool.com · +353 1 475 1222 · Emergency: +353 85 157 4801`.
- In-app messaging is one-directional today (staff → student only); `StudentMessage` has no student→staff direction. This feature does NOT make StudentMessage bidirectional — student→staff goes out as **email**, not an in-app thread.

## v1 scope
### Frontend (`public/student.html`, Support card)
- Keep the phone numbers + emergency line.
- Add a **"Message us"** button → opens a composer (reuse the bottom-sheet overlay pattern, e.g. `openMessages()` / `openBookCourse()`):
  - **Topic** dropdown: Accommodation / Course / Visa & Letters / Payments / Other.
  - **Message** textarea.
  - Submit → `POST /sis/student/api/support`; success state = "We've got your message — we'll be in touch."

### Backend (`src/routes/student.ts` + `src/scripts/student.ts`)
- New `POST /sis/student/api/support`, body `{ topic, message }`.
- Handler: load student from `session.studentId`, then `sendStudentEmail()`:
  - `to`: **success@ulearnschool.com** (v1 — single inbox).
  - `from`: system address (info@/success@).
  - `replyTo`: **the student's own email** → staff hit Reply and it reaches the student directly.
  - `subject`: `[Student Support · {Topic}] {First Last} (#{studentId})`.
  - `html`: the student's message + auto-appended identity block (name, student #, course/booking, current class) so staff have context without a lookup.
  - Links the `EmailLog` row to `studentId` (automatic).
- After send, `messageScripts.postToApp()` drops a confirmation into the student's in-app inbox.
- Guard: trivial rate sanity (e.g. require non-empty message); no heavy validation (trusted, authenticated sender).

## Decisions / open questions
1. **Routing** — v1 = single `success@` inbox. Topic-based routing (accommodation→hosts, visa→admissions) is a later option; the topic is already captured in the subject so routing can be added without UI change.
2. **Topic dropdown** — include it (recommended) vs single free-text box. Spec assumes dropdown.
3. Confirm the system `from` address (info@ vs success@).

## Explicitly out of scope (v1)
- Two-way in-app threading (replies stay in email).
- Attachments from the student.
- Push / WhatsApp (see student in-app messaging deferral).

## Touch points
- `public/student.html` — Support card + composer overlay (static, no build).
- `src/routes/student.ts` — new route (build + restart).
- `src/scripts/student.ts` — `support()` handler (build + restart).
- Reuses: `sendStudentEmail` (`src/routes/email.ts`), `messageScripts.postToApp` (`src/scripts/messages.ts`).
