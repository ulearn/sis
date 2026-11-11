#!/bin/bash
# Runs inside tmux (started by ensure.sh). Keeps ONE ongoing conversation per
# session: the id lives in session.id (sis) / session-<tmux-session>.id (others);
# every restart (quit, crash, reboot) resumes it. Fresh start: delete that id file.
SESSION=${1:-cc-sis}
DIR=${2:-/home/sis/web/sis.ulearnschool.com/public_html}
NAME=${3:-sis-server}
HERE=/home/sis/web/sis.ulearnschool.com/public_html/sis/scripts/ccRemote
LOG=$HERE/ccRemote.log
IDFILE=$HERE/session.id
[ "$SESSION" = cc-sis ] || IDFILE=$HERE/session-$SESSION.id
TRANSCRIPTS=/home/sis/.claude/projects/$(echo "$DIR" | sed 's#[^a-zA-Z0-9]#-#g')
export PATH=/home/sis/.local/bin:/usr/local/bin:/usr/bin:/bin
cd "$DIR" || exit 1

while true; do
  [ -s "$IDFILE" ] || cat /proc/sys/kernel/random/uuid > "$IDFILE"
  ID=$(cat "$IDFILE")
  if [ -f "$TRANSCRIPTS/$ID.jsonl" ]; then
    echo "$(date -Is) [$NAME] claude resume $ID" >> "$LOG"
    claude --resume "$ID" --remote-control "$NAME"
  else
    echo "$(date -Is) [$NAME] claude new $ID" >> "$LOG"
    claude --session-id "$ID" --remote-control "$NAME"
  fi
  echo "$(date -Is) [$NAME] claude exited ($?), restart in 10s" >> "$LOG"
  sleep 10
done
