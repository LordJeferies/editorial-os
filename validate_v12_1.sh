#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
for f in index.html manifest.webmanifest sw.js css/legacy.css css/v12.css css/v121.css js/app-core.js js/v12-runtime.js js/v121-runtime.js js/v12-glass.js; do [ -f "$f" ] || { echo "Falta $f"; exit 1; }; done
if command -v node >/dev/null; then
  node --check js/app-core.js
  node --check js/v12-runtime.js
  node --check js/v121-runtime.js
  node --input-type=module --check < js/v12-glass.js
fi
python3 -m json.tool manifest.webmanifest >/dev/null
grep -q "editorial-os-v12-1" sw.js
for k in jocEditorialV9 jocEditorialV9AppData jocEditorialV9Scenarios jocEditorialV9Cloud; do grep -q "$k" js/app-core.js || { echo "Falta contrato $k"; exit 1; }; done
grep -q "workspace_key:'editorial-os'" js/app-core.js
grep -q "window.EDITORIAL_PLANNER" js/app-core.js
grep -q "scrollSensitivity:72" js/app-core.js
grep -q "manualOverride:true" js/app-core.js
python3 - <<'PY'
from pathlib import Path
import re
h=Path('index.html').read_text(); ids=re.findall(r'\bid=["\']([^"\']+)["\']',h); d=sorted({x for x in ids if ids.count(x)>1});
if d: raise SystemExit('IDs duplicados: '+','.join(d))
print('QA estática V12.1: OK')
PY
