#!/usr/bin/env bash
# Turn a sprint issues JSON file into real GitHub issues via the gh CLI.
#
#   bash scripts/create-issues.sh templates/sprint-issues.json
#
# Requires: gh (authenticated, `gh auth login`) and a GitHub remote on `origin`.
# Use --dry-run to preview without creating anything.
set -euo pipefail
cd "$(dirname "$0")/.."

FILE="${1:-templates/sprint-issues.json}"
DRY_RUN="${2:-}"

if ! command -v gh >/dev/null; then
  echo "gh CLI not found. Install: https://cli.github.com/" >&2
  exit 1
fi
if ! command -v jq >/dev/null; then
  echo "jq not found. Install jq to parse the JSON." >&2
  exit 1
fi

count=$(jq 'length' "$FILE")
echo "Found $count issue(s) in $FILE"

for i in $(seq 0 $((count - 1))); do
  title=$(jq -r ".[$i].title" "$FILE")
  body=$(jq -r ".[$i].body" "$FILE")
  labels=$(jq -r ".[$i].labels // [] | join(\",\")" "$FILE")

  echo "----"
  echo "Title:  $title"
  echo "Labels: $labels"

  if [ "$DRY_RUN" = "--dry-run" ] || [ "$FILE" = "--dry-run" ]; then
    echo "(dry run — not created)"
    continue
  fi

  gh issue create --title "$title" --body "$body" \
    ${labels:+--label "$labels"}
done

echo "Done. See: gh issue list"
