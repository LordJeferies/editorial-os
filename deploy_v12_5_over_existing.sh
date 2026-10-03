#!/bin/bash
set -euo pipefail
SOURCE="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-}"
find_target(){
  for c in "$HOME/Downloads/EDITORIAL_OS_V10_FRESH" "$HOME/Downloads/editorial-os" "$HOME/editorial-os" "$HOME/Documents/editorial-os"; do
    [ -d "$c/.git" ] && [ -f "$c/index.html" ] && { echo "$c"; return 0; }
  done
  return 1
}
[ -n "$TARGET" ] || TARGET="$(find_target || true)"
[ -n "$TARGET" ] || { echo "No encontré el repo. Usa: $0 /ruta/al/editorial-os"; exit 1; }
TARGET="$(cd "$TARGET" && pwd)"
[ -d "$TARGET/.git" ] || { echo "ERROR: $TARGET no contiene .git"; exit 1; }
[ -f "$TARGET/supabase-config.js" ] || { echo "ERROR: falta supabase-config.js"; exit 1; }
for cmd in git rsync python3; do command -v "$cmd" >/dev/null || { echo "ERROR: falta $cmd"; exit 1; }; done

cd "$TARGET"
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: hay cambios locales sin commit. Haz commit/stash antes de actualizar."
  git status --short
  exit 1
fi

echo "[1/9] Fetch y reconciliación segura..."
git fetch origin
if ! git merge-base --is-ancestor origin/main HEAD; then
  git rebase origin/main
elif git merge-base --is-ancestor HEAD origin/main && [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  git rebase origin/main
fi

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="$(dirname "$TARGET")/EDITORIAL_OS_PRE_V12_5_BACKUP_$STAMP"
TMP_CONFIG="$(mktemp)"
trap 'rm -f "$TMP_CONFIG"' EXIT
cp supabase-config.js "$TMP_CONFIG"

echo "[2/9] Backup: $BACKUP"
mkdir -p "$BACKUP"
rsync -a --exclude '.git/' "$TARGET/" "$BACKUP/"

echo "[3/9] Instalando V12.5 sin borrar documentación ajena..."
rsync -a \
  --exclude '.git/' \
  --exclude 'supabase-config.js' \
  --exclude '.DS_Store' \
  --exclude 'README.md' \
  --exclude 'PROJECT_FILES.txt' \
  --exclude 'TERMINAL_COMMANDS.txt' \
  --exclude '__v125_test.html' \
  --exclude 'js/__app_core_test.js' \
  "$SOURCE/" "$TARGET/"
cp "$TMP_CONFIG" "$TARGET/supabase-config.js"
chmod +x ./*.sh ./*.command 2>/dev/null || true

echo "[4/9] QA V12.5..."
./validate_v12_5.sh
cmp -s "$TMP_CONFIG" supabase-config.js || { echo "ERROR: supabase-config.js cambió"; exit 1; }

echo "[5/9] Diff..."
git status --short

echo "[6/9] Commit..."
git add -A
if ! git diff --cached --quiet; then
  git commit -m "Editorial OS V12.5 - simplified mobile and additive LinkedIn L2"
else
  echo "      No hay cambios nuevos que commitear."
fi

echo "[7/9] Segundo fetch antes del push..."
git fetch origin
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo "      origin/main avanzó; rebase seguro..."
  git rebase origin/main
  ./validate_v12_5.sh
fi

echo "[8/9] Push fast-forward..."
git push origin main

echo "[9/9] LISTO"
echo "Repo: https://github.com/LordJeferies/editorial-os"
echo "PWA : https://lordjeferies.github.io/editorial-os/"
echo "Backup: $BACKUP"
open "https://lordjeferies.github.io/editorial-os/" 2>/dev/null || true
