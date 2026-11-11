#!/bin/bash
# Always-on Claude Code "Remote Control" session for SIS (claude.ai app / phone).
# Mirrors the hub (cc-remote / hub-server) and fins (cc-fins / fins-server) setup.
# Cron runs this @reboot and every 5 min: if the tmux session is missing, start it.
# run.sh (inside tmux) restarts claude 10s after it exits and resumes the same
# conversation.
#   Usage: ensure.sh [tmux-session] [project-dir] [remote-name]
#     no args = sis:  cc-sis  /home/sis/web/sis.ulearnschool.com/public_html  sis-server
#   Attach from a server shell:  tmux attach -t cc-sis    (detach: Ctrl-b then d)
#   Stop for good:               remove its cron lines, then  tmux kill-session -t cc-sis
SESSION=${1:-cc-sis}
DIR=${2:-/home/sis/web/sis.ulearnschool.com/public_html}
NAME=${3:-sis-server}
HERE=/home/sis/web/sis.ulearnschool.com/public_html/sis/scripts/ccRemote
export PATH=/home/sis/.local/bin:/usr/local/bin:/usr/bin:/bin

tmux has-session -t "$SESSION" 2>/dev/null && exit 0

echo "$(date -Is) starting tmux session $SESSION ($NAME in $DIR)" >> "$HERE/ccRemote.log"
tmux new-session -d -s "$SESSION" -x 200 -y 50 -c "$DIR" "$HERE/run.sh '$SESSION' '$DIR' '$NAME'"
