#!/usr/bin/env bash
# One command to reproduce the BookIt dev experience after cloning.
#
#   bash booking/run.sh
#
# It switches to the branch that has the app (`develop`), installs deps if
# needed, and boots the dev server at http://localhost:3000.
set -euo pipefail
cd "$(dirname "$0")/.."   # repo root

BRANCH="develop"   # the app lives on develop; main is release-only

echo "▶ switching to $BRANCH (the app branch)…"
git switch "$BRANCH" 2>/dev/null || git switch -c "$BRANCH" --track "origin/$BRANCH"
git pull --ff-only 2>/dev/null || true

cd booking

if ! command -v pnpm >/dev/null; then
  echo "pnpm not found — installing via npm…"
  npm i -g pnpm >/dev/null
fi

if [ ! -d node_modules ]; then
  echo "▶ installing dependencies…"
  pnpm install
fi

echo "▶ generating Prisma client…"
pnpm exec prisma generate >/dev/null 2>&1 || true

echo "▶ starting dev server → http://localhost:3000  (Ctrl-C to stop)"
exec pnpm dev
