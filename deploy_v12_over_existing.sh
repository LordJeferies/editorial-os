#!/bin/bash
set -euo pipefail

SOURCE="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-}"

find_target(){
  local candidates=(
    "$HOME/Downloads/EDITORIAL_OS_V10_FRESH"
    "$HOME/Downloads/editorial-os"
    "$HOME/editorial-os"
    "$HOME/Documents/editorial-os"
  )
  for c in "${candidates[@]}"; do
    if [ -d "$c/.git" ] && [ -f "$c/index.html" ]; then
      echo "$c"; return 0
    fi
  done
  return 1
}

if [ -z "$TARGET" ]; then
  TARGET="$(find_target || true)"
fi

clear || true
echo "=============================================================="
echo " EDITORIAL OS V12 · ACTUALIZAR APP + GITHUB PAGES"
echo "=============================================================="
echo

if [ -z "$TARGET" ]; then
  echo "No pude detectar tu repo local automáticamente."
  echo
  echo "Ejecuta de nuevo indicando la carpeta, por ejemplo:"
  echo "  ./deploy_v12_over_existing.sh ~/Downloads/EDITORIAL_OS_V10_FRESH"
  exit 1
fi

TARGET="$(cd "$TARGET" && pwd)"
echo "Paquete V12: $SOURCE"
echo "Repo actual: $TARGET"
echo

if [ ! -d "$TARGET/.git" ]; then
  echo "ERROR: $TARGET no contiene .git"
  exit 1
fi
if [ ! -f "$TARGET/supabase-config.js" ]; then
  echo "ERROR: falta $TARGET/supabase-config.js"
  echo "V12 no continuará para evitar perder tu configuración cloud."
  exit 1
fi
if ! command -v rsync >/dev/null 2>&1; then
  echo "ERROR: rsync no está disponible. macOS normalmente lo incluye."
  exit 1
fi

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="$(dirname "$TARGET")/EDITORIAL_OS_PRE_V12_BACKUP_$STAMP"
TMP_CONFIG="$(mktemp)"
trap 'rm -f "$TMP_CONFIG"' EXIT

cp "$TARGET/supabase-config.js" "$TMP_CONFIG"

echo "[1/7] Backup de seguridad..."
mkdir -p "$BACKUP"
rsync -a --exclude '.git/' "$TARGET/" "$BACKUP/"
echo "      $BACKUP"

echo "[2/7] Instalando V12 sin tocar .git ni Supabase..."
rsync -a --delete \
  --exclude '.git/' \
  --exclude 'supabase-config.js' \
  --exclude '.DS_Store' \
  "$SOURCE/" "$TARGET/"
cp "$TMP_CONFIG" "$TARGET/supabase-config.js"

cd "$TARGET"
chmod +x ./*.sh INSTALL_FROM_ZERO.command 2>/dev/null || true

echo "[3/7] Validando JavaScript, bash y estructura..."
node --check js/app-core.js
node --check js/v12-runtime.js
node --input-type=module --check < js/v12-glass.js
for f in ./*.sh; do bash -n "$f"; done
python3 - <<'PY'
from pathlib import Path
from html.parser import HTMLParser
import json,re,sys

root=Path('.')
required=[
  'index.html','manifest.webmanifest','sw.js','supabase-config.js',
  'css/legacy.css','css/v12.css','js/app-core.js','js/v12-runtime.js','js/v12-glass.js'
]
missing=[x for x in required if not (root/x).exists()]
if missing:
    raise SystemExit('Faltan archivos: '+', '.join(missing))

json.loads((root/'manifest.webmanifest').read_text())
html=(root/'index.html').read_text()
ids=re.findall(r'\bid=["\']([^"\']+)["\']',html)
dup=sorted({x for x in ids if ids.count(x)>1})
if dup:
    raise SystemExit('IDs duplicados: '+', '.join(dup))
for ref in ['css/legacy.css','css/v12.css','js/app-core.js','js/v12-runtime.js','js/v12-glass.js']:
    if ref not in html: raise SystemExit('index.html no referencia '+ref)
for key in ['jocEditorialV9','jocEditorialV9AppData','jocEditorialV9Scenarios','jocEditorialV9Cloud']:
    if key not in (root/'js/app-core.js').read_text():
        raise SystemExit('Contrato localStorage perdido: '+key)
if "editorial-os-v12" not in (root/'sw.js').read_text():
    raise SystemExit('Service Worker no está en cache V12')
print('Validación estática: OK')
PY

echo "[4/7] Confirmando que supabase-config.js fue preservado..."
cmp -s "$TMP_CONFIG" supabase-config.js || { echo "ERROR: supabase-config.js cambió"; exit 1; }

echo "[5/7] Estado Git..."
git status --short

echo "[6/7] Commit + push a main..."
git add .
if git diff --cached --quiet; then
  echo "      No hay cambios nuevos que publicar."
else
  git commit -m "Editorial OS V12 - native UI, performance and modular frontend"
  git push origin main
fi

echo "[7/7] LISTO"
echo
echo "V12 instalada y publicada desde main."
echo "GitHub Pages: https://lordjeferies.github.io/editorial-os/"
echo
echo "El Service Worker usa editorial-os-v12, por lo que la PWA debe tomar la nueva versión."
echo "Si el icono del iPhone sigue mostrando una pantalla antigua:"
echo "  1. cierra Editorial OS completamente;"
echo "  2. abre la URL en Safari y recarga una vez;"
echo "  3. vuelve a abrir la PWA."
echo
echo "Backup pre-V12:"
echo "  $BACKUP"
echo
open "https://lordjeferies.github.io/editorial-os/" 2>/dev/null || true
