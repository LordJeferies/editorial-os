# Editorial OS V12.4

PWA editorial estática multi-marca para GitHub Pages + Supabase. V12.4 reconstruye el frontend móvil manteniendo el engine y los contratos de datos existentes.

## Instalar sobre la versión actual

```bash
cd ~/Downloads
unzip -o EDITORIAL_OS_V12_4_PWA.zip
cd EDITORIAL_OS_V12_4_PWA
chmod +x deploy_v12_4_over_existing.sh
./deploy_v12_4_over_existing.sh
```

Si el repo no se detecta:

```bash
./deploy_v12_4_over_existing.sh ~/Downloads/EDITORIAL_OS_V10_FRESH
```

## Qué cambia

- shell iPhone/iPad específico;
- toolbar limpia y tab bar de navegación;
- sistema consistente de sheets/menus;
- Emulador móvil de un solo día con menú contextual y catálogo en sheet;
- Calendar/Feeds/Library adaptados a tareas móviles;
- inputs 16 px y sin escalados táctiles para evitar auto-zoom extraño;
- LiquidGlass WebGL desactivado en compacto;
- UI state separado del domain state mediante `v124-store.js`;
- component islands y event delegation en `v124-runtime.js`;
- mantiene IndexedDB/outbox/conflict detection de V12.3.

Consulta `CHANGELOG_V12_4.md` y `TERMINAL_V12_4.txt`.

## Contratos preservados

- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`
- `public.editorial_state`
- workspace `editorial-os`
- payload `version:9`

## Stack de producción

- HTML5/CSS/JavaScript estático;
- módulos ES selectivos;
- GitHub Pages;
- Supabase;
- SortableJS con alternativas de interacción en móvil;
- localStorage + IndexedDB;
- Service Worker;
- sin build obligatorio.

La arquitectura V12.4 adopta patrones actuales de React/Signals (estado UI aislado, componentes, identidad estable, actualizaciones batched y event delegation) sin introducir todavía un segundo renderer virtual que compita con el engine DOM existente.


## V12.11 · Desktop macOS

Editorial OS puede instalarse como una app independiente de Safari/Chrome. El wrapper nativo usa WKWebView y sigue cargando la GitHub Page viva, por lo que las nuevas versiones web aparecen sin reinstalar la app.

Instalación directa:

```bash
curl -fL "https://lordjeferies.github.io/editorial-os/INSTALL_EDITORIAL_OS_DESKTOP.command?v=12.11" -o "$HOME/Downloads/INSTALL_EDITORIAL_OS_DESKTOP.command"
chmod +x "$HOME/Downloads/INSTALL_EDITORIAL_OS_DESKTOP.command"
"$HOME/Downloads/INSTALL_EDITORIAL_OS_DESKTOP.command"
```

Destino: `~/Applications/Editorial OS.app` y alias en `~/Desktop/Editorial OS`.
