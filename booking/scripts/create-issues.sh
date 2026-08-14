#!/usr/bin/env bash
# Push a sprint's issues to GitHub as a Milestone + labeled Issues.
#
#   bash booking/scripts/create-issues.sh booking/sprints/sprint-1.json
#   bash booking/scripts/create-issues.sh booking/sprints/sprint-1.json --dry-run
#   bash booking/scripts/create-issues.sh --all            # all sprints in booking/sprints
#
# Requires: gh (authenticated: `gh auth login`) + jq + a GitHub remote on origin.
# The GitHub Milestone == the sprint, so you can filter/close it in the UI.
set -euo pipefail
cd "$(dirname "$0")/../.."   # repo root

command -v gh >/dev/null || { echo "gh not found: https://cli.github.com" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq not found" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Not logged in. Run: gh auth login" >&2; exit 1; }

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Repo: $REPO"

DRY_RUN=""
FILES=()
if [ "${1:-}" = "--all" ]; then
  FILES=(booking/sprints/*.json)
else
  FILES=("${1:?usage: create-issues.sh <sprint.json>|--all [--dry-run]}")
  [ "${2:-}" = "--dry-run" ] && DRY_RUN="1"
fi
[ "${2:-}${3:-}" = "--dry-run" ] && DRY_RUN="1"

ensure_label() {  # $1 name
  gh label create "$1" --color BFD4F2 >/dev/null 2>&1 || true
}

ensure_milestone() {  # $1 title  $2 description  -> echoes milestone title (gh matches by title)
  local title="$1" desc="$2"
  local existing
  existing=$(gh api "repos/$REPO/milestones?state=all" --jq ".[] | select(.title==\"$title\") | .title" 2>/dev/null || true)
  if [ -z "$existing" ]; then
    [ -n "$DRY_RUN" ] && { echo "(dry) create milestone: $title" >&2; return; }
    gh api "repos/$REPO/milestones" -f title="$title" -f description="$desc" >/dev/null
    echo "created milestone: $title" >&2
  else
    echo "milestone exists: $title" >&2
  fi
}

for FILE in "${FILES[@]}"; do
  echo "=== $FILE ==="
  MS_TITLE=$(jq -r '.milestone' "$FILE")
  MS_DESC=$(jq -r '.description // ""' "$FILE")
  ensure_milestone "$MS_TITLE" "$MS_DESC"

  n=$(jq '.issues | length' "$FILE")
  for i in $(seq 0 $((n - 1))); do
    title=$(jq -r ".issues[$i].title" "$FILE")
    body=$(jq -r ".issues[$i].body" "$FILE")
    mapfile -t labels < <(jq -r ".issues[$i].labels[]?" "$FILE")

    echo "--- $title  [${labels[*]}]"
    if [ -n "$DRY_RUN" ]; then echo "(dry run — not created)"; continue; fi

    for l in "${labels[@]}"; do ensure_label "$l"; done
    label_args=(); for l in "${labels[@]}"; do label_args+=(--label "$l"); done

    gh issue create --title "$title" --body "$body" \
      --milestone "$MS_TITLE" "${label_args[@]}"
  done
done

echo "Done. See: gh issue list   |   gh api repos/$REPO/milestones --jq '.[].title'"
