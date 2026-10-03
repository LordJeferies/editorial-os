#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

clear || true
echo "=========================================================="
echo " EDITORIAL OS V12.5 · INSTALACIÓN DESDE CERO"
echo "=========================================================="
echo
echo "Carpeta:"
echo "  $ROOT"
echo

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew no está instalado."
  echo
  echo "Instálalo primero con el comando oficial de Homebrew y vuelve a ejecutar este script."
  echo "https://brew.sh/"
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "Falta Git / Xcode Command Line Tools."
  xcode-select --install || true
  echo "Cuando termine la instalación de Apple, vuelve a ejecutar:"
  echo "  ./install_from_zero.sh"
  exit 1
fi

echo "[1/7] Dependencias..."
if ! command -v gh >/dev/null 2>&1; then
  brew install gh
fi
if ! command -v supabase >/dev/null 2>&1; then
  brew install supabase/tap/supabase
fi

chmod +x setup_and_deploy.sh setup_supabase.sh publish_update.sh start_local.sh

echo
echo "[2/7] Validando archivos..."
for f in index.html manifest.webmanifest sw.js supabase_schema.sql; do
  if [ ! -f "$f" ]; then
    echo "ERROR: falta $f"
    exit 1
  fi
done

echo
echo "[3/7] GitHub"
if ! gh auth status >/dev/null 2>&1; then
  gh auth login -w
fi

echo
read -r -p "Nombre del repo público [editorial-os]: " REPO_NAME
REPO_NAME="${REPO_NAME:-editorial-os}"

echo
echo "[4/7] Supabase"
read -r -p "¿Configurar Supabase ahora? [S/n]: " USE_SUPABASE
USE_SUPABASE="${USE_SUPABASE:-S}"
if [[ "$USE_SUPABASE" =~ ^[SsYy]$ ]]; then
  ./setup_supabase.sh
else
  echo "Omitido. Puedes hacerlo después con ./setup_supabase.sh"
fi

echo
echo "[5/7] Creando repo público y GitHub Pages..."
./setup_and_deploy.sh "$REPO_NAME"

echo
echo "[6/7] Comprobación local..."
python3 -m http.server 8080 >/tmp/editorial-os-v12-5-http.log 2>&1 &
SERVER_PID=$!
sleep 1
if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
  echo "Servidor local iniciado temporalmente en http://localhost:8080"
  kill "$SERVER_PID" >/dev/null 2>&1 || true
else
  echo "AVISO: no se pudo iniciar el servidor local de prueba."
fi

echo
echo "[7/7] INSTALACIÓN TERMINADA"
OWNER="$(gh api user --jq .login)"
if [ "$REPO_NAME" = "$OWNER.github.io" ]; then
  PAGE_URL="https://$OWNER.github.io/"
else
  PAGE_URL="https://$OWNER.github.io/$REPO_NAME/"
fi

echo
echo "----------------------------------------------------------"
echo "Editorial OS V12.5"
echo "Repo:  https://github.com/$OWNER/$REPO_NAME"
echo "PWA:   $PAGE_URL"
echo "----------------------------------------------------------"
echo
echo "En iPhone:"
echo "1. Abre la URL en Safari."
echo "2. Compartir."
echo "3. Añadir a pantalla de inicio."
echo
echo "Para trabajar localmente:"
echo "  ./start_local.sh"
echo
echo "Para publicar futuros cambios:"
echo "  ./publish_update.sh"
