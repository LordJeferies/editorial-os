#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "[1/8] Archivos V12.3"
for f in index.html manifest.webmanifest sw.js css/legacy.css css/v12.css css/v123.css js/v123-data.js js/v123-sync.js js/v123-storage.js js/app-core.js js/v12-runtime.js js/v123-runtime.js js/v12-glass.js; do
  [ -f "$f" ] || { echo "Falta $f"; exit 1; }
done

echo "[2/8] JavaScript"
if command -v node >/dev/null 2>&1; then
  node --check js/v123-data.js
  node --check js/v123-sync.js
  node --check js/v123-storage.js
  node --check js/app-core.js
  node --check js/v12-runtime.js
  node --check js/v123-runtime.js
  node --input-type=module --check < js/v12-glass.js
  node tests/test_v123_core.js
  node tests/test_planner_move.js
else
  echo "AVISO: Node no está instalado; se omite sintaxis/tests Node."
fi

echo "[3/8] Manifest y Service Worker"
python3 -m json.tool manifest.webmanifest >/dev/null
grep -q '"id": "./"' manifest.webmanifest
grep -q 'editorial-os-v12-3' sw.js
grep -q 'SKIP_WAITING' sw.js

echo "[4/8] HTML / referencias"
python3 - <<'PY'
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
h=Path('index.html').read_text()
class P(HTMLParser):
  def __init__(self): super().__init__(); self.ids=[]
  def handle_starttag(self,tag,attrs):
    d=dict(attrs)
    if 'id' in d:self.ids.append(d['id'])
p=P();p.feed(h);dups=[x for x,n in Counter(p.ids).items() if n>1]
if dups: raise SystemExit('IDs duplicados: '+', '.join(dups))
for ref in ['css/v123.css','js/v123-data.js','js/v123-sync.js','js/v123-storage.js','js/v123-runtime.js']:
  if ref not in h: raise SystemExit('Falta referencia '+ref)
for id_ in ['drawerWorkflowStatus','drawerPublishTime','drawerAssignee','drawerProductionNotes']:
  if f'id="{id_}"' not in h: raise SystemExit('Falta UI producción '+id_)
print('HTML OK · IDs únicos:',len(p.ids))
PY

echo "[5/8] Contratos legacy"
for k in jocEditorialV9 jocEditorialV9AppData jocEditorialV9Scenarios jocEditorialV9Cloud; do grep -q "$k" js/app-core.js || { echo "Falta contrato $k"; exit 1; }; done
grep -q "workspace_key:'editorial-os'" js/app-core.js
grep -q 'version:9' js/app-core.js
grep -q 'production:{}' js/app-core.js
grep -q 'syncMeta' js/app-core.js

echo "[6/8] Mobile UX"
grep -q 'font-size:16px!important' css/v123.css
grep -q 'touch-action:manipulation' css/v123.css
grep -q 'renderDows=compact?\[selectedDow\]' js/app-core.js
! grep -q 'scrollIntoView' js/v123-runtime.js || { echo 'v123-runtime no debe usar scrollIntoView'; exit 1; }

echo "[7/8] Bash"
for f in ./*.sh; do bash -n "$f"; done

echo "[8/8] Deploy safety"
grep -q 'git fetch origin' deploy_v12_3_over_existing.sh
grep -q 'git rebase origin/main' deploy_v12_3_over_existing.sh
grep -q 'supabase-config.js' deploy_v12_3_over_existing.sh

echo "OK · Editorial OS V12.3 validado."
