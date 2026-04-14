#!/bin/bash
#
# Catalog Sync — pulls product catalogs from hub.ulearnschool.com over HTTPS
# and writes them to sis/data/catalog/ for use by the partner portal and SIS.
#
# Cron (daily at 06:17):
#   17 6 * * * /home/sis/web/sis.ulearnschool.com/public_html/sis/scripts/catalog-sync.sh >> /home/sis/web/sis.ulearnschool.com/public_html/sis/data/catalog/sync.log 2>&1
#
# Atomic: downloads to .tmp, validates JSON, then mv into place.
# Idempotent: safe to run as often as you like.

set -uo pipefail

DEST="/home/sis/web/sis.ulearnschool.com/public_html/sis/data/catalog"
SOURCE_BASE="https://hub.ulearnschool.com/bird/products"
FILES=(eu_catalog.json ay_catalog.json accomm_catalog.json)

mkdir -p "$DEST"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
ERRORS=0

for f in "${FILES[@]}"; do
  URL="$SOURCE_BASE/$f"
  TMP="$DEST/$f.tmp"
  DEST_FILE="$DEST/$f"

  # Download with a 30s timeout, fail on HTTP errors
  if ! curl -sSf --max-time 30 -o "$TMP" "$URL"; then
    echo "[$TIMESTAMP] ERROR: failed to download $URL"
    rm -f "$TMP"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  # Validate it's parseable JSON before swapping
  if ! python3 -c "import json,sys; json.load(open('$TMP'))" 2>/dev/null; then
    echo "[$TIMESTAMP] ERROR: $f downloaded but is not valid JSON"
    rm -f "$TMP"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  # Atomic swap
  mv "$TMP" "$DEST_FILE"
  SIZE=$(stat -c%s "$DEST_FILE")
  echo "[$TIMESTAMP] OK: $f ($SIZE bytes)"
done

if [ "$ERRORS" -gt 0 ]; then
  echo "[$TIMESTAMP] FINISHED WITH $ERRORS ERROR(S)"
  exit 1
fi

echo "[$TIMESTAMP] All catalogs synced successfully"
exit 0
