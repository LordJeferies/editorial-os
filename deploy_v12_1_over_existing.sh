#!/bin/bash
set -euo pipefail
SOURCE="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-}"
find_target(){ for c in "$HOME/Downloads/EDITORIAL_OS_V10_FRESH" "$HOME/Downloads/editorial-os" "$HOME/editorial-os" "$HOME/Documents/editorial-os"; do [ -d "$c/.git" ] && [ -f "$c/index.html" ] && { echo "$c"; return 0; }; done; return 1; }
[ -n "$TARGET" ] || TARGET="$(find_target || true)"
[ -n "$TARGET" ] || { echo "No encontré el repo. Ejecuta: $0 /ruta/al/editorial-os"; exit 1; }
TARGET="$(cd "$TARGET" && pwd)"
[ -d "$TARGET/.git" ] || { echo "ERROR: $TARGET no contiene .git"; exit 1; }
[ -f "$TARGET/supabase-config.js" ] || { echo "ERROR: falta supabase-config.js"; exit 1; }
command -v rsync >/dev/null || { echo "ERROR: falta rsync"; exit 1; }
STAMP="$(date +%Y%m%d_%H%M%S)"; BACKUP="$(dirname "$TARGET")/EDITORIAL_OS_PRE_V12_1_BACKUP_$STAMP"; TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
cp "$TARGET/supabase-config.js" "$TMP"
echo "[1/6] Backup: $BACKUP"; mkdir -p "$BACKUP"; rsync -a --exclude '.git/' "$TARGET/" "$BACKUP/"
echo "[2/6] Copiando V12.1..."; rsync -a --delete --exclude '.git/' --exclude 'supabase-config.js' --exclude '.DS_Store' "$SOURCE/" "$TARGET/"; cp "$TMP" "$TARGET/supabase-config.js"
cd "$TARGET"; chmod +x ./*.sh ./*.command 2>/dev/null || true
echo "[3/6] QA..."; ./validate_v12_1.sh
echo "[4/6] Verificando Supabase..."; cmp -s "$TMP" supabase-config.js || { echo "ERROR: supabase-config.js cambió"; exit 1; }
echo "[5/6] Commit..."; git add .; if ! git diff --cached --quiet; then git commit -m "Editorial OS V12.1 - emulator drag drop repair"; fi
echo "[6/6] Push..."; git push origin main
echo "LISTO: https://lordjeferies.github.io/editorial-os/"; echo "Backup: $BACKUP"; open "https://lordjeferies.github.io/editorial-os/" 2>/dev/null || true
