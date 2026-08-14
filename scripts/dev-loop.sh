#!/usr/bin/env bash
# The AUTO DEV LOOP.
#
# Runs the test suite and re-runs it every time a source or test file changes.
# Leave this open in a terminal pane during the demo: as the AI edits
# src/sprint.js, tests re-run automatically. Red turns green in front of you.
#
#   npm run loop        # or: bash scripts/dev-loop.sh
#
# The loop is the feedback engine of AI-assisted dev:
#   1. tests define the target (red)
#   2. AI writes code
#   3. loop re-runs tests instantly
#   4. AI reads failures, fixes, repeats — until green
set -euo pipefail
cd "$(dirname "$0")/.."
echo "auto dev loop watching src/ and test/ — Ctrl-C to stop"
exec node --test --watch
