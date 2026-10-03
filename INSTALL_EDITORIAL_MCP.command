#!/bin/bash
set -euo pipefail

BASE_URL="https://lordjeferies.github.io/editorial-os/mcp"
DEST="$HOME/.editorial-os-mcp"
ENV_FILE="$DEST/.env"

echo "=============================================================="
echo " EDITORIAL OS · MCP INSTALLER"
echo "=============================================================="
echo

ensure_node(){
  if command -v node >/dev/null 2>&1; then
    local major
    major="$(node -p 'Number(process.versions.node.split(".")[0])')"
    if [ "$major" -ge 20 ]; then
      echo "OK    Node $(node -v)"
      return 0
    fi
  fi

  echo "INFO  Node.js 20+ no está disponible."
  if command -v brew >/dev/null 2>&1; then
    echo "INFO  Instalando/actualizando Node con Homebrew..."
    brew install node || brew upgrade node || true
  fi

  if ! command -v node >/dev/null 2>&1; then
    echo "ERROR: no pude instalar Node automáticamente."
    echo "Instálalo desde https://nodejs.org/ y vuelve a ejecutar este archivo."
    exit 1
  fi

  local major
  major="$(node -p 'Number(process.versions.node.split(".")[0])')"
  if [ "$major" -lt 20 ]; then
    echo "ERROR: Node.js 20+ requerido. Actual: $(node -v)"
    exit 1
  fi
  echo "OK    Node $(node -v)"
}

ensure_node
mkdir -p "$DEST"

echo "INFO  Descargando servidor MCP..."
curl -fLsS "$BASE_URL/package.json" -o "$DEST/package.json"
curl -fLsS "$BASE_URL/server.mjs" -o "$DEST/server.mjs"
curl -fLsS "$BASE_URL/run-mcp.sh" -o "$DEST/run-mcp.sh"
curl -fLsS "$BASE_URL/env.example" -o "$DEST/env.example"
chmod +x "$DEST/run-mcp.sh"

if [ ! -f "$ENV_FILE" ]; then
  cp "$DEST/env.example" "$ENV_FILE"
fi

echo "INFO  Instalando dependencias..."
cd "$DEST"
npm install --omit=dev --no-audit --no-fund

echo
echo "Configura el usuario de Supabase que usará el MCP."
echo "La Project URL, anon key y workspace ya vienen preconfigurados."
echo
read -r -p "Email de Supabase (Enter para conservar el actual): " MCP_EMAIL
read -r -s -p "Contraseña (por ejemplo 4brxs si ESA cuenta usa esa contraseña; Enter para conservar): " MCP_PASSWORD
echo

python3 - "$ENV_FILE" "$MCP_EMAIL" "$MCP_PASSWORD" <<'PY'
import sys
from pathlib import Path
p=Path(sys.argv[1])
email=sys.argv[2]
password=sys.argv[3]
lines=p.read_text(encoding="utf-8").splitlines()
def setv(key,val):
    global lines
    found=False
    out=[]
    for line in lines:
        if line.startswith(key+"="):
            found=True
            out.append(f"{key}={val}" if val else line)
        else:
            out.append(line)
    if not found and val:
        out.append(f"{key}={val}")
    lines=out
if email:setv("EDITORIAL_SUPABASE_EMAIL",email)
if password:setv("EDITORIAL_SUPABASE_PASSWORD",password)
p.write_text("\n".join(lines)+"\n",encoding="utf-8")
PY

chmod 600 "$ENV_FILE"

echo
echo "INFO  Validando código..."
node --check "$DEST/server.mjs"

echo "INFO  Self-test..."
set +e
SELF="$("$DEST/run-mcp.sh" --self-test 2>&1)"
RC=$?
set -e
echo "$SELF"
if [ "$RC" -ne 0 ]; then
  echo
  echo "El servidor está instalado, pero falta completar alguna credencial."
  echo "Edita:"
  echo "  $ENV_FILE"
else
  echo
  echo "OK    MCP listo."
fi

CONFIG=$(cat <<EOF
{
  "mcpServers": {
    "editorial-os": {
      "command": "$DEST/run-mcp.sh",
      "args": []
    }
  }
}
EOF
)

echo
echo "=============================================================="
echo " CONFIGURACIÓN MCP"
echo "=============================================================="
echo "$CONFIG"
echo
echo "Copia este bloque en tu cliente MCP."
echo "El lugar exacto depende del cliente que uses."

mkdir -p "$HOME/Desktop"
printf "%s\n" "$CONFIG" > "$HOME/Desktop/EDITORIAL_OS_MCP_CONFIG.json"
if command -v pbcopy >/dev/null 2>&1; then
  printf "%s" "$CONFIG" | pbcopy
  echo
  echo "OK    Configuración copiada al portapapeles."
fi

echo "OK    Configuración guardada también en:"
echo "      $HOME/Desktop/EDITORIAL_OS_MCP_CONFIG.json"

echo
echo "Guía pública paso a paso:"
echo "https://lordjeferies.github.io/editorial-os/mcp.html"
echo
echo "Instalado en:"
echo "$DEST"
