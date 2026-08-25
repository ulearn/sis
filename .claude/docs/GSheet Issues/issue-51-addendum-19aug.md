Issue 51 Email Template Edits Lost on Send (373rd check, 19 Aug 2026)
Sheet row: 53  Reporter: NM  Area: Booking/Accommodation

Symptom: Staff edits to email templates disappear when sent (room number missing etc.)

Status: Bug STILL PRESENT in code. No change since 372nd check (Tue 18 Aug).

Evidence (code check, 19 Aug 2026)
- src/routes/email.ts line 327: finalHtml = applyTokens(t.htmlTemplate, tokens)
  This overwrites the staff-edited HTML with the raw DB template before sending.
- t.htmlTemplate = raw template from DB
- finalHtml (set at line 317 as html from request) = staff-edited version from commsEditor
- Triggered only when template has {if} blocks (line 325 check)
- Bug introduced 2026-08-14 (Antonella Day-1 email fix) -- correct intent, wrong source HTML

Fix Recipe -- NOT YET RUN (one-line code fix)
File: src/routes/email.ts line 327
Change:
  finalHtml = applyTokens(t.htmlTemplate, tokens);
To:
  finalHtml = applyTokens(finalHtml, tokens);
Then restart server: touch tmp/restart.txt

Risk: LOW. One-line change. Restores intended behavior (preserve staff edits, still resolve tokens).
Blast radius: All conditional templates. Reversible by reverting the one line.
Status: Fix NOT RUN. Last checked: Wed 19 Aug 2026 UTC (373rd check).