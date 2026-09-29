#!/usr/bin/env bash
# Serve the portfolio locally at http://localhost:3000.
# Uses lite-server (live reload) when npm is available, otherwise Python's http.server.
set -euo pipefail
cd "$(dirname "$0")"

if command -v npm >/dev/null 2>&1; then
    if [ ! -x node_modules/.bin/lite-server ]; then
        npm install
    fi
    echo "Serving on http://localhost:3000 (Ctrl+C to stop)"
    exec npx lite-server
else
    echo "npm not found, falling back to Python (no live reload)"
    echo "Serving on http://localhost:3000 (Ctrl+C to stop)"
    exec python3 -m http.server 3000
fi
