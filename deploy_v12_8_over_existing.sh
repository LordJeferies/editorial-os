#!/bin/bash
set -euo pipefail
SOURCE="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-}"
PAGES_URL="https://lordjeferies.github.io/editorial-os/"
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

echo "[1/10] Fetch y reconciliación segura..."
git fetch origin
if ! git merge-base --is-ancestor origin/main HEAD; then
  git rebase origin/main
elif git merge-base --is-ancestor HEAD origin/main && [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  git rebase origin/main
fi

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="$(dirname "$TARGET")/EDITORIAL_OS_PRE_V12_8_BACKUP_$STAMP"
TMP_CONFIG="$(mktemp)"
trap 'rm -f "$TMP_CONFIG"' EXIT
cp supabase-config.js "$TMP_CONFIG"

echo "[2/10] Backup: $BACKUP"
mkdir -p "$BACKUP"
rsync -a --exclude '.git/' "$TARGET/" "$BACKUP/"

echo "[3/10] Instalando V12.8 iOS Polish..."
rsync -a \
  --exclude '.git/' \
  --exclude 'supabase-config.js' \
  --exclude '.DS_Store' \
  --exclude 'README.md' \
  --exclude 'PROJECT_FILES.txt' \
  --exclude 'TERMINAL_COMMANDS.txt' \
  --exclude 'tests/v128_layout_probe.html' \
  "$SOURCE/" "$TARGET/"
cp "$TMP_CONFIG" "$TARGET/supabase-config.js"
rm -f "$TARGET/css/v125.css" "$TARGET/js/v125-runtime.js" 2>/dev/null || true
rm -f "$TARGET/deploy_v12_7_over_existing.sh" "$TARGET/validate_v12_7.sh" "$TARGET/QA_V12_7.txt" "$TARGET/TERMINAL_V12_7.txt" "$TARGET/EDITORIAL_OS_V12_7.html" 2>/dev/null || true
chmod +x ./*.sh ./*.command 2>/dev/null || true

echo "[4/10] QA V12.8..."
./validate_v12_8.sh
cmp -s "$TMP_CONFIG" supabase-config.js || { echo "ERROR: supabase-config.js cambió"; exit 1; }

echo "[5/10] Diff..."
git status --short

echo "[6/10] Commit..."
git add -A
if ! git diff --cached --quiet; then
  git commit -m "Editorial OS V12.8 - iOS polish full week sheets and feed viewers"
else
  echo "      No hay cambios nuevos que commitear."
fi

echo "[7/10] Segundo fetch antes del push..."
git fetch origin
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo "      origin/main avanzó; rebase seguro..."
  git rebase origin/main
  ./validate_v12_8.sh
fi

echo "[8/10] Push fast-forward..."
git push origin main
SHA="$(git rev-parse --short=12 HEAD)"

echo "[9/10] Verificando GitHub Pages..."
if [ "${EDITORIAL_OS_SKIP_PAGES_VERIFY:-0}" = "1" ]; then
  echo "      Verificación HTTP omitida por EDITORIAL_OS_SKIP_PAGES_VERIFY=1."
elif command -v curl >/dev/null; then
  OK=0
  for i in $(seq 1 24); do
    if curl -fsSL --max-time 10 "${PAGES_URL}?v=${SHA}-${i}" 2>/dev/null | grep -q 'V12.8'; then
      OK=1; break
    fi
    printf '      esperando Pages (%s/24)...\n' "$i"
    sleep 5
  done
  if [ "$OK" -eq 1 ]; then echo "      GitHub Pages ya sirve V12.8."; else echo "      Push correcto; Pages aún puede estar propagándose."; fi
else
  echo "      curl no está disponible; se omite verificación HTTP."
fi

echo "[10/10] LISTO"
echo "Commit: $SHA"
echo "Repo   : https://github.com/LordJeferies/editorial-os"
echo "PWA    : ${PAGES_URL}?v=${SHA}"
echo "Backup : $BACKUP"
open "${PAGES_URL}?v=${SHA}" 2>/dev/null || true
