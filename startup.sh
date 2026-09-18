#!/bin/sh
set -eu
# Resolve the project root from this script's own location, so the revive path
# works whether the workspace is mounted at /workspace or somewhere else.
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
# :8081 is QA-only — a revive must never inherit a stale built-output preview.
node scripts/preview.mjs stop || true
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
