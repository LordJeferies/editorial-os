#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
echo "QA estática V12.8"
node --check js/app-core.js
node --check js/v128-runtime.js
node --check js/v12-glass.js
python3 -m json.tool manifest.webmanifest >/dev/null
node tests/test_planner_move.js
node tests/test_v123_core.js
node tests/test_v128_ui.js
python3 - <<'PY'
from pathlib import Path
import re
html=Path('index.html').read_text()
ids=re.findall(r'\bid=["\']([^"\']+)["\']',html)
dups=sorted({x for x in ids if ids.count(x)>1})
if dups: raise SystemExit('IDs duplicados: '+', '.join(dups))
css=Path('css/v128.css').read_text()
if css.count('{')!=css.count('}'):
    raise SystemExit('Llaves CSS V12.8 desbalanceadas')
print('HTML IDs: OK')
print('CSS braces: OK')
PY
bash -n deploy_v12_8_over_existing.sh
printf '\nQA V12.8: OK\n'
