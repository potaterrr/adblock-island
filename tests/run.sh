#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# install once if the browser tooling is missing
if [ ! -d node_modules/@playwright ]; then
  npm install --no-audit --no-fund
fi

node fake-redis.cjs &
SERVER=$!
trap 'kill "$SERVER" 2>/dev/null || true' EXIT
sleep 1

node smoke.mjs
node co-op.mjs
node wall.mjs
node handover.mjs

echo "all tests passed"
