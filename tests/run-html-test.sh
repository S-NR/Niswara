#!/usr/bin/env bash
# Runs one browser-based test page (tests/*.test.html) via headless Chrome
# against the already-running local server on :8924, and exits 0/1 based on
# the page's own console output — a stand-in for `node test.js`'s exit code,
# since this machine has no Node runtime (see ledger: Task 1 Ruling).
set -euo pipefail
FILE="$1"
LOG=$(mktemp)
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --no-sandbox \
  --enable-logging=stderr --v=1 --virtual-time-budget=20000 --dump-dom \
  "http://localhost:8924/tests/${FILE}" > /dev/null 2> "$LOG"
LINE=$(grep -E "CONSOLE.*(all assertions passed|FAILED)" "$LOG" | tail -n 1 || true)
if echo "$LINE" | grep -q "FAILED"; then
  echo "$LINE"
  rm -f "$LOG"
  exit 1
fi
if echo "$LINE" | grep -q "all assertions passed"; then
  echo "$LINE"
  rm -f "$LOG"
  exit 0
fi
echo "no test output found in $FILE (page may have errored before running assertions)"
cat "$LOG"
rm -f "$LOG"
exit 1
