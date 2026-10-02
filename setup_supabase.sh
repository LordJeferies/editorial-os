#!/bin/bash
set -euo pipefail

echo "======================================================"
echo " Editorial OS V10 · Supabase setup automático"
echo "======================================================"
echo

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# 1) CLI
if ! command -v supabase >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "[1/8] Instalando Supabase CLI..."
    brew install supabase/tap/supabase
  else
    echo "ERROR: Homebrew no está instalado."
    echo "Instala Homebrew o instala Supabase CLI manualmente."
    exit 1
  fi
else
  echo "[1/8] Supabase CLI ya instalado: $(supabase --version)"
fi

# 2) login
echo
echo "[2/8] Login en Supabase..."
if ! supabase projects list >/dev/null 2>&1; then
  supabase login
fi

# 3) list projects
echo
echo "[3/8] Tus proyectos:"
supabase projects list || true
echo
read -r -p "Pega el PROJECT REF del proyecto que quieres usar: " PROJECT_REF
if [ -z "$PROJECT_REF" ]; then
  echo "ERROR: PROJECT REF vacío."
  exit 1
fi

# 4) init workspace
echo
echo "[4/8] Inicializando configuración local de Supabase..."
if [ ! -f "supabase/config.toml" ]; then
  supabase init
fi
mkdir -p supabase/migrations

# 5) migration
TS="$(date +%Y%m%d%H%M%S)"
MIG="supabase/migrations/${TS}_editorial_os_v10.sql"

if ls supabase/migrations/*_editorial_os_v10.sql >/dev/null 2>&1; then
  MIG="$(ls -1 supabase/migrations/*_editorial_os_v10.sql | tail -n 1)"
  echo "Usando migración existente: $MIG"
else
  echo "[5/8] Creando migración Editorial OS..."
  cp supabase_schema.sql "$MIG"
fi

# 6) link
echo
echo "[6/8] Vinculando proyecto remoto..."
echo "Si pide contraseña de base de datos, usa la contraseña de Database del proyecto."
echo "Si no la recuerdas, puedes resetearla desde Supabase > Project Settings > Database."
supabase link --project-ref "$PROJECT_REF"

# 7) push
echo
echo "[7/8] Creando tabla, RLS y Realtime en Supabase..."
supabase db push

# 8) get publishable key and write config
echo
echo "[8/8] Obteniendo URL y API key pública..."

KEYS_JSON="$(supabase projects api-keys --project-ref "$PROJECT_REF" -o json 2>/dev/null || true)"

PUBLISHABLE_KEY="$(python3 - "$KEYS_JSON" <<'PY'
import json, sys
raw=sys.argv[1]
try:
    data=json.loads(raw)
except Exception:
    print("")
    raise SystemExit
if isinstance(data, dict):
    data=data.get("api_keys") or data.get("keys") or [data]
if not isinstance(data, list):
    data=[]
preferred=[]
fallback=[]
for item in data:
    if not isinstance(item, dict): continue
    name=str(item.get("name") or item.get("type") or item.get("key_type") or "").lower()
    value=item.get("api_key") or item.get("key") or item.get("value")
    if not value: continue
    if "publish" in name:
        preferred.append(value)
    elif "anon" in name:
        fallback.append(value)
print((preferred or fallback or [""])[0])
PY
)"

PROJECT_URL="https://${PROJECT_REF}.supabase.co"

if [ -z "$PUBLISHABLE_KEY" ]; then
  echo
  echo "No pude detectar automáticamente la publishable/anon key."
  echo "Puedes verla con:"
  echo "  supabase projects api-keys --project-ref $PROJECT_REF"
  echo
  read -r -p "Pega aquí la publishable key (sb_publishable_...) o anon key: " PUBLISHABLE_KEY
fi

cat > supabase-config.js <<EOF
window.EDITORIAL_SUPABASE = {
  url: "${PROJECT_URL}",
  key: "${PUBLISHABLE_KEY}"
};
EOF

echo
echo "======================================================"
echo " SUPABASE CONFIGURADO"
echo "======================================================"
echo "Project ref: $PROJECT_REF"
echo "URL:         $PROJECT_URL"
echo "Config:      $ROOT/supabase-config.js"
echo
echo "Ahora puedes probar la app:"
echo
echo "  python3 -m http.server 8080"
echo
echo "y abrir:"
echo
echo "  http://localhost:8080"
echo
echo "Después ve a Biblioteca > Nube y crea/inicia sesión."
echo
echo "Si vas a GitHub Pages, publica estos cambios con:"
echo
echo "  ./publish_update.sh"
echo
