#!/bin/bash
set -euo pipefail

REPO_NAME="${1:-editorial-os}"

echo "=================================================="
echo " Editorial OS V12.5 · GitHub Pages"
echo " Repo público: $REPO_NAME"
echo "=================================================="

if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: Git no está disponible. En macOS normalmente llega con Xcode Command Line Tools."
  echo "Ejecuta: xcode-select --install"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "[1/6] Instalando GitHub CLI..."
    brew install gh
  else
    echo "ERROR: falta Homebrew/GitHub CLI."
    exit 1
  fi
fi

echo "[2/6] Revisando sesión de GitHub..."
if ! gh auth status >/dev/null 2>&1; then
  gh auth login -w
fi

OWNER="$(gh api user --jq .login)"
echo "GitHub: $OWNER"

if [ -z "$(git config --global user.name || true)" ]; then
  read -r -p "Nombre para los commits de Git: " GIT_NAME
  git config --global user.name "$GIT_NAME"
fi
if [ -z "$(git config --global user.email || true)" ]; then
  read -r -p "Email para los commits de Git: " GIT_EMAIL
  git config --global user.email "$GIT_EMAIL"
fi

echo "[3/6] Preparando repositorio local..."
if [ ! -d .git ]; then
  git init
fi
git branch -M main
git add .
if ! git diff --cached --quiet; then
  git commit -m "Editorial OS V12.5 initial release"
fi

echo "[4/6] Creando/actualizando repo público..."
if gh repo view "$OWNER/$REPO_NAME" >/dev/null 2>&1; then
  echo "El repo ya existe."
  if ! git remote get-url origin >/dev/null 2>&1; then
    git remote add origin "https://github.com/$OWNER/$REPO_NAME.git"
  fi
  git push -u origin main
else
  gh repo create "$OWNER/$REPO_NAME" --public --source=. --remote=origin --push \
    --description "Editorial OS: multi-brand content calendar, emulator, feeds and production tracking"
fi

echo "[5/6] Activando GitHub Pages desde main:/ ..."
API="/repos/$OWNER/$REPO_NAME/pages"
if gh api "$API" >/dev/null 2>&1; then
  gh api --method PUT "$API" \
    -H "Accept: application/vnd.github+json" \
    --input - <<JSON >/dev/null
{"source":{"branch":"main","path":"/"}}
JSON
else
  gh api --method POST "$API" \
    -H "Accept: application/vnd.github+json" \
    --input - <<JSON >/dev/null
{"source":{"branch":"main","path":"/"}}
JSON
fi

echo "[6/6] LISTO"
if [ "$REPO_NAME" = "$OWNER.github.io" ]; then
  URL="https://$OWNER.github.io/"
else
  URL="https://$OWNER.github.io/$REPO_NAME/"
fi
echo
echo "Repo:  https://github.com/$OWNER/$REPO_NAME"
echo "Pages: $URL"
echo
echo "La primera publicación de Pages puede tardar unos minutos."
