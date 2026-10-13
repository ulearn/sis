#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Nightly secrets-gated commit + push backup   (Neil, 2026-10-12)
#
# Backs up the ACTIVE work branch of each configured repo to GitHub after a
# basic secrets scan. The scan runs on the STAGED diff (what tonight would
# commit). If it trips, that repo is left UNCOMMITTED (changes unstaged) and is
# NOT pushed — a loud log line and a non-zero exit so the failure is visible.
#
#   scripts/nightly-commit.sh            # live: scan → commit → push
#   scripts/nightly-commit.sh --dry-run  # scan + report only (safe anytime)
#
# Per-repo config carries a `protect_main` flag: 1 = refuse to auto-commit when
# the repo is on main/master (SIS keeps main stable, work on claude/* branches);
# 0 = main is this repo's real working branch (the mobile repo).
#
# Optional per-repo allowlist: <repo>/.secrets-allow — one ERE per line; staged
# lines matching it are ignored (for genuine false positives).
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail
export PATH=/usr/local/bin:/usr/bin:/bin:${PATH:-}
# Never let a push block on an SSH passphrase prompt inside cron.
export GIT_SSH_COMMAND='ssh -o BatchMode=yes'

DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

# repo path | label | protect_main (1 = skip on main/master) | add_paths
# add_paths: space-separated source paths whose NEW files are also staged; empty
# = tracked-only (`git add -u`). This is what keeps the nightly from sweeping in
# untracked scratch — the sis repo carries thousands of .claude/cron payload
# JSONs + root *_payload/*_tmp junk that must never reach GitHub. We stage only
# real source. (src/generated is .gitignored, so `git add src` skips it.)
REPOS=(
  "/home/sis/web/sis.ulearnschool.com/public_html/sis|sis|1|src prisma public scripts"
  "/home/sis/dev/sis-mobile|mobile|0|"
)

ts()  { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*"; }

# Risky staged FILENAMES (defence-in-depth atop each repo's .gitignore).
BAD_NAMES_RE='(^|/)\.env($|\.)|\.pem$|\.key$|\.keystore$|-tokens\.json$|(^|/)id_rsa|\.p8$|client_secret.*\.json$|service.?account.*\.json$|\.bak$'
# Secret-like CONTENT in staged additions.
CONTENT_RE='-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|xox[baprs]-[0-9A-Za-z-]{10,}|gh[pousr]_[0-9A-Za-z]{30,}|github_pat_[0-9A-Za-z_]{30,}|sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{35}|sk_live_[0-9A-Za-z]{16,}|rk_live_[0-9A-Za-z]{16,}|(password|passwd|secret|api[_-]?key|access[_-]?token|client[_-]?secret|private[_-]?key)[[:space:]]*[:=][[:space:]]*[^[:space:]]{12,}'
# Lines that merely REFERENCE a secret (env var / config lookup) are not leaks.
REF_RE='process\.env|import |require\(|config\.|getenv|os\.environ|System\.getenv|\$\{'

FAIL=0
log "nightly-commit start (dry_run=$DRY_RUN)"

for entry in "${REPOS[@]}"; do
  IFS='|' read -r repo label protect add_paths <<<"$entry"
  log "=== $label ($repo) ==="
  if [[ ! -d "$repo/.git" ]]; then log "SKIP $label: not a git repo"; FAIL=1; continue; fi

  branch=$(git -C "$repo" branch --show-current 2>/dev/null)
  if [[ "$protect" == "1" && ( "$branch" == "main" || "$branch" == "master" ) ]]; then
    log "SKIP $label: on protected branch '$branch' (work-branch policy — stage/commit by hand)"; continue
  fi
  [[ -z "$branch" ]] && { log "SKIP $label: detached HEAD"; FAIL=1; continue; }

  # Stage tracked changes everywhere, plus NEW files only under real source
  # paths — never the untracked scratch (.claude/cron payloads, root *_tmp /
  # *_payload junk, build outputs) a blind `git add -A` would sweep in.
  git -C "$repo" add -u
  # shellcheck disable=SC2086
  [[ -n "$add_paths" ]] && git -C "$repo" add -- $add_paths 2>/dev/null || true
  if git -C "$repo" diff --cached --quiet; then
    log "$label: nothing to commit on '$branch'"; continue
  fi

  staged_files=$(git -C "$repo" diff --cached --name-only)

  # 1) risky filenames (minus the deliberate .env.example)
  bad_names=$(printf '%s\n' "$staged_files" | grep -iE -e "$BAD_NAMES_RE" | grep -vE '\.env\.example$' || true)

  # 2) secret-like content in ADDED lines — excludes this scanner + the allow
  #    file (their own regex literals would self-trip) and env/config references.
  #    `-e` is required: CONTENT_RE begins with "-----" which grep would read as options.
  bad_content=$(git -C "$repo" diff --cached -U0 -- . ':(exclude)scripts/nightly-commit.sh' ':(exclude)scripts/.secrets-patterns' ':(exclude).secrets-allow' \
      | grep -E '^\+' | grep -vE '^\+\+\+' \
      | grep -EIn -e "$CONTENT_RE" \
      | grep -vE -e "$REF_RE" || true)
  if [[ -f "$repo/.secrets-allow" ]]; then
    bad_content=$(printf '%s\n' "$bad_content" | grep -vEf "$repo/.secrets-allow" || true)
  fi

  if [[ -n "$bad_names" || -n "$bad_content" ]]; then
    log "!! SECRETS CHECK FAILED for $label — NOT committing/pushing. Fix, or allow-list in $repo/.secrets-allow"
    [[ -n "$bad_names"   ]] && { log "   risky staged filename(s):";            printf '%s\n' "$bad_names"   | sed 's/^/     /'; }
    [[ -n "$bad_content" ]] && { log "   secret-like content in staged additions (first 20):"; printf '%s\n' "$bad_content" | head -20 | sed 's/^/     /'; }
    git -C "$repo" reset -q    # unstage; working tree untouched, nothing committed
    FAIL=1
    continue
  fi

  n=$(printf '%s\n' "$staged_files" | grep -c .)
  if [[ "$DRY_RUN" == "1" ]]; then
    log "$label: scan CLEAN — $n file(s) would be committed+pushed to origin/$branch (dry-run)"
    git -C "$repo" reset -q
    continue
  fi

  msg="chore: nightly snapshot $(date '+%Y-%m-%d')"
  if git -C "$repo" -c user.name='ULearn Nightly' -c user.email='sis@ulearnschool.com' commit -q -m "$msg"; then
    if git -C "$repo" push -q origin "$branch"; then
      log "$label: committed $n file(s) + pushed to origin/$branch"
    else
      log "!! $label: commit MADE but PUSH FAILED (origin/$branch) — retries next run"; FAIL=1
    fi
  else
    log "!! $label: commit failed"; FAIL=1
  fi
done

log "nightly-commit done (exit $FAIL)"
exit $FAIL
