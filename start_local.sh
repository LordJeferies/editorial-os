#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Editorial OS V12.8 · http://localhost:8080"
python3 -m http.server 8080
