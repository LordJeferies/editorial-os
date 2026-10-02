#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
PORT="${1:-8080}"
echo "Editorial OS V10"
echo "http://localhost:$PORT"
echo "Ctrl+C para detener."
python3 -m http.server "$PORT"
