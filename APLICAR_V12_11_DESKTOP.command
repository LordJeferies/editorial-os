#!/bin/bash
set -Eeuo pipefail

REPO="${1:-}"
if [ -z "$REPO" ]; then
  for d in \
    "$HOME/Downloads/EDITORIAL_OS_V10_FRESH" \
    "$HOME/Downloads/editorial-os" \
    "$HOME/editorial-os" \
    "$HOME/Documents/editorial-os"
  do
    if [ -d "$d/.git" ]; then REPO="$d"; break; fi
  done
fi

if [ -z "$REPO" ] || [ ! -d "$REPO/.git" ]; then
  echo "ERROR: no encontré el repo local de Editorial OS."
  echo "Usa: bash APLICAR_V12_11_DESKTOP.command /ruta/al/editorial-os"
  exit 1
fi

cd "$REPO"
echo "REPO=$REPO"

if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: hay cambios locales sin commit. No se tocarán."
  git status --short
  exit 2
fi

git fetch origin
git rebase origin/main

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="$HOME/Downloads/EDITORIAL_OS_PRE_V12_11_$STAMP"
mkdir -p "$BACKUP/js"
cp js/v129-runtime.js "$BACKUP/js/v129-runtime.js"
cp sw.js "$BACKUP/sw.js"
cp README.md "$BACKUP/README.md"

python3 - <<'PY'
from pathlib import Path
import re

p=Path('js/v129-runtime.js')
s=p.read_text(encoding='utf-8')
marker='/* V12.11 additive loader */'
if marker not in s:
    s += '''\n\n/* V12.11 additive loader */\n(()=>{\n  if(document.querySelector('script[data-editorial-v1211]'))return;\n  const s=document.createElement('script');\n  s.src='./js/v1211-runtime.js?v=12.11';\n  s.defer=true;\n  s.dataset.editorialV1211='1';\n  document.head.appendChild(s);\n})();\n'''
p.write_text(s,encoding='utf-8')

sw=Path('sw.js')
s=sw.read_text(encoding='utf-8')
s=re.sub(r"const CACHE='editorial-os-v12-[^']+';","const CACHE='editorial-os-v12-11';",s)
if "'./css/v1211.css'" not in s:
    s=s.replace("'./css/v1210.css'","'./css/v1210.css','./css/v1211.css'")
if "'./js/v1211-runtime.js'" not in s:
    s=s.replace("'./js/v1210-runtime.js'","'./js/v1210-runtime.js','./js/v1211-runtime.js'")
sw.write_text(s,encoding='utf-8')

readme=Path('README.md')
r=readme.read_text(encoding='utf-8')
if '## V12.11 · Desktop macOS' not in r:
    r += '''\n\n## V12.11 · Desktop macOS\n\nEditorial OS puede instalarse como una app independiente de Safari/Chrome. El wrapper nativo usa WKWebView y sigue cargando la GitHub Page viva, por lo que las nuevas versiones web aparecen sin reinstalar la app.\n\nInstalación directa:\n\n```bash\ncurl -fL "https://lordjeferies.github.io/editorial-os/INSTALL_EDITORIAL_OS_DESKTOP.command?v=12.11" -o "$HOME/Downloads/INSTALL_EDITORIAL_OS_DESKTOP.command"\nchmod +x "$HOME/Downloads/INSTALL_EDITORIAL_OS_DESKTOP.command"\n"$HOME/Downloads/INSTALL_EDITORIAL_OS_DESKTOP.command"\n```\n\nDestino: `~/Applications/Editorial OS.app` y alias en `~/Desktop/Editorial OS`.\n'''
readme.write_text(r,encoding='utf-8')
PY

node --check js/v1211-runtime.js
node --check js/v129-runtime.js
bash -n INSTALL_EDITORIAL_OS_DESKTOP.command

grep -q "V12.11 additive loader" js/v129-runtime.js
grep -q "editorial-os-v12-11" sw.js
grep -q "v1211-runtime.js" sw.js
grep -q "v1211.css" sw.js

git add js/v129-runtime.js js/v1211-runtime.js css/v1211.css sw.js README.md CHANGELOG_V12_11.md INSTALL_EDITORIAL_OS_DESKTOP.command APLICAR_V12_11_DESKTOP.command

if ! git diff --cached --quiet; then
  git commit -m "Editorial OS V12.11 - desktop app distribution"
fi

git fetch origin
BASE="$(git merge-base HEAD origin/main)"
if [ "$(git rev-parse origin/main)" != "$BASE" ]; then
  git rebase origin/main
  node --check js/v1211-runtime.js
  node --check js/v129-runtime.js
  bash -n INSTALL_EDITORIAL_OS_DESKTOP.command
fi

git push origin main

chmod +x INSTALL_EDITORIAL_OS_DESKTOP.command
./INSTALL_EDITORIAL_OS_DESKTOP.command

SHA="$(git rev-parse --short HEAD)"
echo
echo "=============================================================="
echo " EDITORIAL OS V12.11 COMPLETADO"
echo "=============================================================="
echo "Commit: $SHA"
echo "Backup: $BACKUP"
echo "Web:    https://lordjeferies.github.io/editorial-os/?v=$SHA"
echo "App:    $HOME/Applications/Editorial OS.app"
echo "Desktop:$HOME/Desktop/Editorial OS"
echo
