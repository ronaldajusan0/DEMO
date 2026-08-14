#!/usr/bin/env bash
# Turn a clone of this template into YOUR OWN GitHub repo — one command.
#
#   bash bootstrap.sh [repo-name] [--public|--private]
#
# It creates a new repo under YOUR account, repoints `origin` to it, pushes
# main + develop, and keeps the template as `upstream`. After this, every push,
# PR, issue, and Action runs in YOUR repo — never the template author's.
#
# Requires: gh (authenticated as YOU: `gh auth login`) + git.
set -euo pipefail
cd "$(dirname "$0")"

TEMPLATE_MATCH="ronaldajusan0/DEMO"   # the upstream template this was cloned from
NAME="${1:-bookit}"
VIS="--private"
for a in "$@"; do
  [ "$a" = "--public" ] && VIS="--public"
  [ "$a" = "--private" ] && VIS="--private"
done

command -v gh >/dev/null || { echo "gh not found: https://cli.github.com" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Log in first: gh auth login" >&2; exit 1; }

ME=$(gh api user -q .login)
echo "▶ You are: $ME"

ORIGIN_URL=$(git remote get-url origin 2>/dev/null || echo "")
echo "▶ Current origin: ${ORIGIN_URL:-<none>}"

# If origin still points at the template, move it aside to `upstream`.
if printf '%s' "$ORIGIN_URL" | grep -q "$TEMPLATE_MATCH"; then
  if ! git remote get-url upstream >/dev/null 2>&1; then
    git remote rename origin upstream
    echo "▶ kept template as 'upstream', freeing 'origin' for your repo"
  else
    git remote remove origin
  fi
fi

# Make sure we have the branches locally from upstream.
git fetch upstream --quiet 2>/dev/null || true

# Create YOUR repo and set it as origin, pushing the current branch.
if gh repo view "$ME/$NAME" >/dev/null 2>&1; then
  echo "▶ repo $ME/$NAME already exists — pointing origin at it"
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://github.com/$ME/$NAME.git"
  git push -u origin HEAD
else
  echo "▶ creating $ME/$NAME ($VIS) and pushing…"
  gh repo create "$NAME" "$VIS" --source=. --remote=origin --push
fi

# Push develop too (the app lives on develop).
if git show-ref --verify --quiet refs/remotes/upstream/develop; then
  git push origin "refs/remotes/upstream/develop:refs/heads/develop"
  echo "▶ pushed develop"
fi

# Also push main explicitly in case current branch wasn't main.
if git show-ref --verify --quiet refs/remotes/upstream/main; then
  git push origin "refs/remotes/upstream/main:refs/heads/main" 2>/dev/null || true
fi

echo ""
echo "✅ Done. origin → https://github.com/$ME/$NAME"
echo "   The 'Seed sprints & issues' Action is creating your issues now:"
echo "     gh issue list --repo $ME/$NAME"
echo "   Run the app:   bash booking/run.sh"
echo "   Build with AI: paste booking/auto-dev.md into your agent"
