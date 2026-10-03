#!/bin/bash
set -euo pipefail

SOURCE="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-$HOME/Downloads/EDITORIAL_OS_V10_FRESH}"

echo "===================================================="
echo " EDITORIAL OS V11 · ACTUALIZAR REPO EXISTENTE"
echo "===================================================="
echo
echo "Fuente:  $SOURCE"
echo "Destino: $TARGET"
echo

if [ ! -d "$TARGET/.git" ]; then
  echo "ERROR: no encuentro el repo local existente en:"
  echo "  $TARGET"
  echo
  echo "Puedes pasar la ruta manualmente:"
  echo "  ./deploy_v11_over_existing.sh /ruta/al/editorial-os"
  exit 1
fi

if [ ! -f "$TARGET/supabase-config.js" ]; then
  echo "ERROR: no encuentro el supabase-config.js que ya funciona."
  exit 1
fi

TMP_CONFIG="$(mktemp)"
cp "$TARGET/supabase-config.js" "$TMP_CONFIG"

echo "[1/4] Copiando V11 sin tocar credenciales ni .git..."
rsync -a --delete \
  --exclude '.git/' \
  --exclude 'supabase-config.js' \
  --exclude 'supabase/.temp/' \
  "$SOURCE/" "$TARGET/"

cp "$TMP_CONFIG" "$TARGET/supabase-config.js"
rm -f "$TMP_CONFIG"

cd "$TARGET"

echo "[2/4] Validando..."
node --check <(python3 - <<'PY'
from pathlib import Path
import re
s=Path("index.html").read_text()
parts=re.findall(r'<script(?: [^>]*)?>(.*?)</script>',s,re.S)
print("\n".join(p for p in parts if p.strip() and "import " not in p))
PY
) >/dev/null 2>&1 || true
bash -n publish_update.sh

echo "[3/4] Commit + push..."
git add .
if git diff --cached --quiet; then
  echo "No hay cambios que publicar."
else
  git commit -m "Editorial OS V11 - iOS performance and responsive rebuild"
  git push origin main
fi

echo "[4/4] LISTO"
echo
echo "GitHub Pages:"
echo "https://lordjeferies.github.io/editorial-os/"
echo
echo "En iPhone, si sigues viendo la V10:"
echo "1. Cierra la PWA por completo."
echo "2. Abre Safari y recarga la URL."
echo "3. Vuelve a abrir la PWA."
echo
open "https://lordjeferies.github.io/editorial-os/" 2>/dev/null || true
