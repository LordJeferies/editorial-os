#!/bin/bash
set -Eeuo pipefail

BASE_URL="https://lordjeferies.github.io/editorial-os"
APP_PATH="$HOME/Applications/Editorial OS.app"
MCP_DIR="$HOME/.editorial-os-mcp"
STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$HOME/Documents/Editorial OS Installer Backups/$STAMP"
LOG_DIR="$HOME/Library/Logs/Editorial OS Complete Installer"
LOG_FILE="$LOG_DIR/install_$STAMP.log"
DOWNLOAD_DIR="$HOME/Downloads"
DESKTOP_INSTALLER="$DOWNLOAD_DIR/INSTALL_EDITORIAL_OS_DESKTOP.command"
MCP_INSTALLER="$DOWNLOAD_DIR/INSTALL_EDITORIAL_MCP.command"
INSTALL_KEY_SHA256="ad2933fb937d4aff05e49bfc9f2349255c1ca7e5eb354ce75e3dc34a2bbc2ee0"

mkdir -p "$BACKUP_DIR" "$LOG_DIR" "$DOWNLOAD_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

ok(){ printf 'OK    %s\n' "$*"; }
info(){ printf 'INFO  %s\n' "$*"; }
warn(){ printf 'WARN  %s\n' "$*"; }
sha256_text(){ printf '%s' "$1" | shasum -a 256 | awk '{print $1}'; }

clear
echo "=============================================================="
echo " EDITORIAL OS · REINSTALACIÓN COMPLETA"
echo "=============================================================="
echo
echo "Esto reinstala la app Desktop y el MCP local."
echo "La versión web/PWA y los datos de Supabase siguen disponibles."
echo

if [ "$(uname -s)" != "Darwin" ]; then
  echo "ERROR: este instalador es sólo para macOS."
  exit 1
fi

AUTHORIZED=0
for attempt in 1 2 3; do
  read -r -s -p "Clave de instalación: " INSTALL_KEY
  echo
  if [ "$(sha256_text "$INSTALL_KEY")" = "$INSTALL_KEY_SHA256" ]; then
    AUTHORIZED=1
    break
  fi
  echo "Clave incorrecta ($attempt/3)."
done
unset INSTALL_KEY
if [ "$AUTHORIZED" -ne 1 ]; then
  echo "Instalación cancelada."
  exit 2
fi
ok "Clave aceptada"

info "Guardando copia de seguridad de la instalación local actual..."
if [ -d "$APP_PATH" ]; then
  ditto "$APP_PATH" "$BACKUP_DIR/Editorial OS.app" || true
fi
if [ -d "$MCP_DIR" ]; then
  ditto "$MCP_DIR" "$BACKUP_DIR/editorial-os-mcp" || true
fi
if [ -f "$HOME/Desktop/EDITORIAL_OS_MCP_CONFIG.json" ]; then
  cp "$HOME/Desktop/EDITORIAL_OS_MCP_CONFIG.json" "$BACKUP_DIR/" || true
fi
ok "Backup preparado: $BACKUP_DIR"

if ! xcode-select -p >/dev/null 2>&1; then
  warn "Faltan Xcode Command Line Tools."
  xcode-select --install || true
  echo "Termina la instalación de Apple y vuelve a ejecutar este mismo instalador."
  exit 3
fi
ok "Herramientas de Apple detectadas"

info "Descargando la versión Desktop más reciente..."
curl -fL "$BASE_URL/INSTALL_EDITORIAL_OS_DESKTOP.command" -o "$DESKTOP_INSTALLER"
chmod +x "$DESKTOP_INSTALLER"
bash -n "$DESKTOP_INSTALLER"

info "Descargando el MCP más reciente..."
curl -fL "$BASE_URL/INSTALL_EDITORIAL_MCP.command" -o "$MCP_INSTALLER"
chmod +x "$MCP_INSTALLER"
bash -n "$MCP_INSTALLER"
ok "Instaladores descargados y validados"

echo
echo "=============================================================="
echo " 1/2 · EDITORIAL OS DESKTOP"
echo "=============================================================="
"$DESKTOP_INSTALLER"

if [ ! -x "$APP_PATH/Contents/MacOS/EditorialOS" ]; then
  echo "ERROR: Editorial OS.app no quedó instalada correctamente."
  exit 4
fi
ok "Editorial OS.app verificada"

echo
echo "=============================================================="
echo " 2/2 · EDITORIAL OS MCP"
echo "=============================================================="
echo "El instalador MCP te pedirá el email y la contraseña del usuario de Supabase."
echo
"$MCP_INSTALLER"

if [ ! -x "$MCP_DIR/run-mcp.sh" ]; then
  echo "ERROR: Editorial OS MCP no quedó instalado correctamente."
  exit 5
fi
ok "Editorial OS MCP verificado"

set +e
MCP_TEST="$($MCP_DIR/run-mcp.sh --self-test 2>&1)"
MCP_RC=$?
set -e
printf '%s\n' "$MCP_TEST"

REPORT="$HOME/Desktop/EDITORIAL_OS_INSTALACION_$STAMP.txt"
cat > "$REPORT" <<EOF
EDITORIAL OS · REPORTE DE INSTALACIÓN
====================================
Fecha: $(date)

Desktop:
$APP_PATH

Web / PWA:
$BASE_URL/

Página de instalación:
$BASE_URL/instalar.html

Guía general:
$BASE_URL/guia.html

MCP:
$MCP_DIR

Guía MCP:
$BASE_URL/mcp.html

Backup previo:
$BACKUP_DIR

Log:
$LOG_FILE

MCP self-test exit code:
$MCP_RC
EOF

ok "Reporte guardado: $REPORT"
open "$APP_PATH" >/dev/null 2>&1 || true

echo
echo "=============================================================="
echo " INSTALACIÓN TERMINADA"
echo "=============================================================="
echo "App:    $APP_PATH"
echo "Web:    $BASE_URL/"
echo "MCP:    $MCP_DIR"
echo "Backup: $BACKUP_DIR"
echo "Log:    $LOG_FILE"
