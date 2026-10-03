#!/bin/bash
set -euo pipefail

INPUT="${1:-}"
MESSAGE="${2:-Update Editorial OS V12}"

if [ -n "$INPUT" ]; then
  if [ ! -e "$INPUT" ]; then
    echo "ERROR: no existe: $INPUT"
    exit 1
  fi

  case "$INPUT" in
    *.html|*.HTML)
      cp "$INPUT" index.html
      echo "Reemplazado index.html desde:"
      echo "  $INPUT"
      ;;
    *.zip|*.ZIP)
      TMP="$(mktemp -d)"
      trap 'rm -rf "$TMP"' EXIT
      unzip -q "$INPUT" -d "$TMP"

      FOUND="$(find "$TMP" -name index.html -print -quit)"
      if [ -z "$FOUND" ]; then
        echo "ERROR: el ZIP no contiene index.html."
        exit 1
      fi

      SOURCE_DIR="$(dirname "$FOUND")"
      echo "Actualizando proyecto completo desde:"
      echo "  $SOURCE_DIR"

      if command -v rsync >/dev/null 2>&1; then
        rsync -a \
          --exclude '.git/' \
          --exclude '.DS_Store' \
          "$SOURCE_DIR/" ./
      else
        cp -R "$SOURCE_DIR/." ./
        rm -rf ./.git-from-update 2>/dev/null || true
      fi
      ;;
    *)
      echo "ERROR: usa un .html o .zip"
      exit 1
      ;;
  esac
fi

git add .
if git diff --cached --quiet; then
  echo "No hay cambios que publicar."
  exit 0
fi

git commit -m "$MESSAGE"
git push origin main

echo
echo "Publicado."
echo "GitHub Pages desplegará el nuevo commit automáticamente."
