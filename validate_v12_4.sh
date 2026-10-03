#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
required=(
 index.html manifest.webmanifest sw.js
 css/legacy.css css/v12.css css/v123.css css/v124.css
 js/v123-data.js js/v123-sync.js js/v123-storage.js js/app-core.js js/v12-runtime.js js/v123-runtime.js js/v124-store.js js/v124-runtime.js js/v12-glass.js
 tests/test_v123_core.js tests/test_planner_move.js tests/test_v124_ui.js
)
for f in "${required[@]}"; do [ -f "$f" ] || { echo "Falta $f"; exit 1; }; done

if command -v node >/dev/null; then
  node --check js/app-core.js
  node --check js/v12-runtime.js
  node --check js/v123-runtime.js
  node --check js/v124-store.js
  node --check js/v124-runtime.js
  node --input-type=module --check < js/v12-glass.js
  node tests/test_v123_core.js
  node tests/test_planner_move.js
  node tests/test_v124_ui.js
else
  echo "AVISO: Node no está instalado; se omiten checks JS ejecutables."
fi

python3 -m json.tool manifest.webmanifest >/dev/null
grep -q "editorial-os-v12-4" sw.js
for k in jocEditorialV9 jocEditorialV9AppData jocEditorialV9Scenarios jocEditorialV9Cloud; do grep -q "$k" js/app-core.js || { echo "Falta contrato $k"; exit 1; }; done
grep -q "workspace_key:'editorial-os'" js/app-core.js
grep -q "window.EDITORIAL_PLANNER" js/app-core.js
grep -q "manualOverride:true" js/app-core.js
python3 - <<'PY'
from pathlib import Path
import re,json
h=Path('index.html').read_text()
ids=re.findall(r'\bid=["\']([^"\']+)["\']',h)
d=sorted({x for x in ids if ids.count(x)>1})
if d: raise SystemExit('IDs duplicados: '+','.join(d))
for ref in ['css/v124.css','js/v124-store.js','js/v124-runtime.js']:
    if ref not in h: raise SystemExit('index no referencia '+ref)
m=json.loads(Path('manifest.webmanifest').read_text())
if m.get('name')!='Editorial OS V12.4': raise SystemExit('Manifest no es V12.4')
print('QA estática V12.4: OK')
PY
for f in ./*.sh; do bash -n "$f"; done
rm -f __v124_test.html js/__app_core_test.js 2>/dev/null || true
echo "OK · Editorial OS V12.4 validado."
