Issue 51 -- Email Template Edits Lost on Send
Reporter: KC | Area: Booking/Accomm | Sheet row: 53

Symptom: Staff edits to email templates disappeared on send (e.g. room number added by Kelly vanished).

Root cause (confirmed):
- src/routes/email.ts, conditional re-render block (lines ~325-337)
- Send handler was reconstructing finalHtml from the raw DB template (t.htmlTemplate) AFTER
  staff had edited the composer HTML -- overwriting their edits with the unedited template.
- Only triggered when template contains {if} blocks (accommodation confirmation templates).

Fix applied: 2026-08-14
- src/routes/email.ts line 334 now reads: finalHtml = applyTokens(finalHtml, tokens)
- Preserves the staff-edited HTML (finalHtml = client body from composer) and only
  evaluates tokens/conditionals on the already-edited version.
- Code comment in file confirms fix date and intent (also references issue #51).

Evidence (374th check, Wed 19 Aug 2026):
- src/routes/email.ts line 334 = finalHtml = applyTokens(finalHtml, tokens) CONFIRMED
- Previous morning run (373rd, 7:13 AM today) incorrectly reported bug still present.
  It was checking line 327 which is now a comment block, not code.
- No further action needed in code.

Status: RESOLVED -- fix applied 2026-08-14 | Last confirmed: Wed 19 Aug 2026 UTC (374th check)
