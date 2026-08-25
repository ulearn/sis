#!/bin/bash
# Hourly SIS Cleanup issue-bot launcher. Scoped permissions (no global bypass).
# Guards: kill-switch file + non-overlap lock.
# Disable anytime:  rm .claude/cron/ENABLED      (re-enable: touch it)
set -uo pipefail
export PATH="/home/sis/.local/bin:/usr/local/bin:/usr/bin:/bin"
export HOME="/home/sis"
DIR="/home/sis/web/sis.ulearnschool.com/public_html/sis"
CRON="$DIR/.claude/cron"

[ -f "$CRON/ENABLED" ] || { echo "$(date -u +%FT%TZ) disabled — skip"; exit 0; }
mkdir -p "$CRON/logs" "$CRON/state"

# Single-instance lock (skip if a previous run is still going)
exec 9>"$CRON/state/run.lock"
flock -n 9 || { echo "$(date -u +%FT%TZ) still running — skip"; exit 0; }

cd "$DIR" || exit 1
TS=$(date -u +%Y%m%dT%H%M%SZ)
LOG="$CRON/logs/run-$TS.log"

# Scoped allowlist instead of --dangerously-skip-permissions: the bot can read
# anywhere, run node/ssh-hub, and write only inside .claude/cron/. Tools outside
# the allowlist are auto-denied in non-interactive (-p) mode. DRY_RUN is
# inherited from the caller's environment if set.
/home/sis/.local/bin/claude -p "$(cat "$CRON/issue-bot.md")" \
  --model claude-sonnet-4-6 \
  --settings "$CRON/settings.json" \
  --permission-mode default \
  --add-dir "$DIR" \
  >"$LOG" 2>&1
RC=$?
# keep only the last 200 run logs
ls -1t "$CRON/logs"/run-*.log 2>/dev/null | tail -n +201 | xargs -r rm -f
echo "$(date -u +%FT%TZ) exit=$RC log=$LOG"
exit $RC
