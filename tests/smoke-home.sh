#!/usr/bin/env bash
# Loads the real app's home page via headless Chrome and fails if any
# Uncaught JS error appears — the baseline regression check every task
# in this plan re-runs after touching index.html's script tags.
set -euo pipefail
LOG=$(mktemp)
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-sandbox \
  --enable-logging=stderr --v=1 --virtual-time-budget=9000 --dump-dom \
  "http://localhost:8924/index.html#/" > /dev/null 2> "$LOG"
if grep -qi "Uncaught" "$LOG"; then
  echo "FAILED: Uncaught error(s) found on home page load:"
  grep -i "Uncaught" "$LOG"
  rm -f "$LOG"
  exit 1
fi
echo "smoke-home: no uncaught errors"
rm -f "$LOG"
exit 0
