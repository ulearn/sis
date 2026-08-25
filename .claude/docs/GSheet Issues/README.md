# GSheet Issues — fix recipes

Generated/maintained by the hourly **issue-bot** (`.claude/cron/issue-bot.md`) and by Neil's sessions. One file per row of the **"SIS Cleanup"** Google Sheet.

- The bot is **report-only**: it diagnoses and writes recipes here + terse notes to the sheet. It **never executes** a fix.
- Each recipe lists exact, copy-pasteable steps marked **NOT YET RUN**. A human runs them.
- Sheet columns: `A=# B=STUDENT C=DealID D=SIS E=REPORT F=AREA G=ISSUE H=CAUSE I=SOLUTION J=INFO_NEEDED K=DONE?`.
- Risk categories: **money** (payments/Xero/balances), **documents** (LOA/cert/visa), **bookings** (course/holiday/ILEP), **data-hygiene**, **code**.

Disable the bot: `rm .claude/cron/ENABLED`. Logs: `.claude/cron/logs/`.
