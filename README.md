# Editorial OS V12.15

PWA editorial multi-marca para planificar, revisar, simular y sincronizar contenido entre Web, iPhone/iPad, Desktop macOS y asistentes de IA mediante MCP.

## Links

- App: https://lordjeferies.github.io/editorial-os/
- Guía pública: https://lordjeferies.github.io/editorial-os/guia.html
- MCP: https://lordjeferies.github.io/editorial-os/mcp.html
- Repo: https://github.com/LordJeferies/editorial-os

## Arquitectura

```text
Editorial OS Web / PWA / Desktop
              │
              ├── localStorage + IndexedDB
              │
              └── Supabase Auth + Realtime
                         │
                         ▼
                public.editorial_state
                workspace: editorial-os
                payload version: 9
                         ▲
                         │
                  Editorial OS MCP
```

## Planner

Las tres vistas trabajan sobre el mismo `plannerDraft`:

- **Tablero**: estilo kanban/Trello con drag handle, drop zones por día y reorder.
- **Agenda**: días apilados y acciones táctiles sin depender del drag.
- **Matriz**: contenido × días para componer la semana rápidamente.

Cambiar de vista no crea otro plan ni elimina fichas.

## Cuenta y Supabase

La Project URL y la publishable/anon key ya vienen preconfiguradas en `supabase-config.js`.

La app permite:

- iniciar sesión;
- crear cuenta;
- cerrar sesión;
- guardar perfiles rápidos por nombre/email;
- subir y bajar estado;
- restaurar la configuración oficial.

Los perfiles rápidos no guardan la contraseña en GitHub ni en localStorage. Si una cuenta usa `4brxs`, el usuario puede escribir `4brxs` al iniciar sesión y Supabase mantiene la sesión persistente en ese dispositivo.

## Welcome + Progress · V12.15

- Pantalla de bienvenida de primer uso.
- Acceso directo a Configuración y MCP.
- Barra global superior con porcentaje y descripción de la operación.
- Cargas normales no bloqueantes.
- Operaciones críticas pueden usar `blocking:true`; en ese caso aparece un overlay explicando por qué hay que esperar.
- Login y sincronización se reflejan en la barra de progreso.

API disponible para módulos futuros:

```js
const token = window.EDITORIAL_PROGRESS.start('Procesando…', { blocking: false });
window.EDITORIAL_PROGRESS.set(token, 50, 'Mitad del proceso…');
window.EDITORIAL_PROGRESS.done(token, 'Listo');

await window.EDITORIAL_PROGRESS.run(
  'Aplicando cambios…',
  async ({ set }) => {
    set(30, 'Validando…');
    // trabajo
  },
  { blocking: true, blockReason: 'Este cambio debe terminar antes de seguir.' }
);
```

## MCP · V12.15

Editorial OS incluye un servidor MCP local basado en el SDK oficial MCP TypeScript v2 y transporte stdio.

Instalación:

```bash
curl -fL "https://lordjeferies.github.io/editorial-os/INSTALL_EDITORIAL_MCP.command" -o "$HOME/Downloads/INSTALL_EDITORIAL_MCP.command"
chmod +x "$HOME/Downloads/INSTALL_EDITORIAL_MCP.command"
"$HOME/Downloads/INSTALL_EDITORIAL_MCP.command"
```

Requiere Node.js 20+.

El instalador deja el servidor en:

```text
~/.editorial-os-mcp/
```

y crea un `.env` local con permisos restringidos. La URL y anon key ya vienen precargadas; el usuario agrega email y contraseña de Supabase.

### Herramientas MCP

Lectura:

- `editorial_status`
- `editorial_get_state`
- `editorial_search`
- `planner_list_week`
- `content_list`
- `content_list_notes`
- `production_get`
- `scenario_list`
- `brand_list`
- `history_recent`
- `editorial_backup`

Escritura:

- `planner_add_content`
- `planner_move_content`
- `planner_remove_content`
- `planner_clear_week`
- `content_create`
- `content_update`
- `content_delete`
- `content_add_note`
- `production_set`
- `scenario_save_current`
- `scenario_apply`
- `brand_create`
- `brand_update`
- `brand_set_active`

Resources:

- `editorial://state`
- `editorial://planner`
- `editorial://criteria`

Prompts:

- `plan-week`
- `review-week`
- `triage-corrections`

### Criterios MCP

- leer antes de escribir cuando el cambio dependa del estado actual;
- preservar campos desconocidos del payload;
- usar `expectedRevision` en secuencias críticas;
- no borrar fichas `fixed` sin instrucción explícita;
- las operaciones destructivas requieren confirmación;
- no usar `service_role` para este flujo normal;
- `EDITORIAL_MCP_READ_ONLY=true` deja el servidor sólo en lectura.

Ver `mcp/README.md` y `mcp/EXAMPLES.md`.

## Desktop macOS

Editorial OS puede instalarse como app independiente de Safari/Chrome mediante WKWebView y seguir cargando la GitHub Page viva.

```bash
curl -fL "https://lordjeferies.github.io/editorial-os/INSTALL_EDITORIAL_OS_DESKTOP.command?v=12.11" -o "$HOME/Downloads/INSTALL_EDITORIAL_OS_DESKTOP.command"
chmod +x "$HOME/Downloads/INSTALL_EDITORIAL_OS_DESKTOP.command"
"$HOME/Downloads/INSTALL_EDITORIAL_OS_DESKTOP.command"
```

Destino:

```text
~/Applications/Editorial OS.app
~/Desktop/Editorial OS
```

## Contratos preservados

- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`
- `public.editorial_state`
- `workspace_key = editorial-os`
- `payload.version = 9`

## Stack

- HTML/CSS/JavaScript estático;
- GitHub Pages;
- Supabase Auth + Realtime;
- localStorage + IndexedDB;
- Service Worker;
- WKWebView para Desktop;
- MCP TypeScript SDK v2 para integración con IA.

## QA

Consulta `QA_V12_15.md`.
