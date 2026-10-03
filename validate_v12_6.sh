#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
for f in index.html manifest.webmanifest sw.js css/legacy.css css/v12.css css/v123.css css/v124.css css/v126.css js/app-core.js js/v12-runtime.js js/v123-runtime.js js/v124-store.js js/v124-runtime.js js/v126-runtime.js js/v12-glass.js; do
  [ -f "$f" ] || { echo "Falta $f"; exit 1; }
done
if command -v node >/dev/null; then
  node --check js/app-core.js
  node --check js/v12-runtime.js
  node --check js/v123-runtime.js
  node --check js/v124-store.js
  node --check js/v124-runtime.js
  node --check js/v126-runtime.js
  node --input-type=module --check < js/v12-glass.js
  node tests/test_planner_move.js
  node tests/test_v123_core.js
  node tests/test_v126_ui.js
fi
python3 -m json.tool manifest.webmanifest >/dev/null
grep -q "editorial-os-v12-6" sw.js
for k in jocEditorialV9 jocEditorialV9AppData jocEditorialV9Scenarios jocEditorialV9Cloud; do grep -q "$k" js/app-core.js || { echo "Falta contrato $k"; exit 1; }; done
grep -q "workspace_key:'editorial-os'" js/app-core.js
python3 - <<'PY'
from pathlib import Path
import re
h=Path('index.html').read_text()
ids=re.findall(r'\bid=["\']([^"\']+)["\']',h)
d=sorted({x for x in ids if ids.count(x)>1})
if d: raise SystemExit('IDs duplicados: '+','.join(d))
assert './css/v125.css' not in h
assert './js/v125-runtime.js' not in h
assert './css/v126.css' in h and './js/v126-runtime.js' in h
print('QA estática V12.6: OK')
PY
