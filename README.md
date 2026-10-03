# Editorial OS V12

PWA editorial multi-marca para GitHub Pages + Supabase, diseñada para operar planificación, escenarios, producción y simulación de feeds desde iPhone, iPad y desktop.

> **IA / continuidad:** si eres un asistente de IA que va a modificar este proyecto, empieza por [`docs/AI_START_HERE.md`](docs/AI_START_HERE.md) y después usa [`AI_MASTER_PROMPT.md`](AI_MASTER_PROMPT.md) como protocolo de trabajo para una versión nueva.

## Estado actual

Versión de producto documentada: **V12**.

V12 consolida la reconstrucción de rendimiento de V11 y añade:
- CSS/JS fuera del `index.html` monolítico;
- capa visual mobile-first;
- tratamiento iPad portrait;
- progressive disclosure;
- bottom sheet de herramientas;
- lifecycle de LiquidGlass;
- memo de derivación editorial por ciclo;
- límite inicial para feeds de escenarios largos;
- correcciones de sync Biblioteca/Undo;
- cache PWA `editorial-os-v12`.

## Qué hace

- Home / Dashboard.
- Calendario semana/mes.
- Franjas.
- Emulador tipo Kanban.
- Agenda.
- Feeds simulados Instagram/Facebook/TikTok/YouTube/LinkedIn.
- Biblioteca de contenido/pilares/familias/marcas.
- escenarios con rango temporal.
- tracking Hecho/Pendiente.
- historial.
- Undo/Redo.
- Supabase Auth + Realtime sync.
- PWA instalable.

## Documentación de continuidad

| Documento | Propósito |
|---|---|
| [`docs/AI_START_HERE.md`](docs/AI_START_HERE.md) | Entrada obligatoria para cualquier IA |
| [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) | Qué es el producto y qué problemas resuelve |
| [`docs/FEATURES_AND_USE_CASES.md`](docs/FEATURES_AND_USE_CASES.md) | Cómo funciona cada herramienta y casos de uso |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Stack, módulos, rendering, PWA y arquitectura |
| [`docs/DATA_CONTRACTS.md`](docs/DATA_CONTRACTS.md) | Contratos legacy, Supabase, escenarios y completion |
| [`docs/VISUAL_REFERENCE_SPEC.md`](docs/VISUAL_REFERENCE_SPEC.md) | Traducción técnica de las referencias visuales originales |
| [`docs/REFERENCES.md`](docs/REFERENCES.md) | Repos, 21st.dev y fuentes a estudiar |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Deuda y siguientes mejoras |
| [`docs/RELEASE_AND_QA.md`](docs/RELEASE_AND_QA.md) | QA, packaging, instalación y rollback |
| [`AI_MASTER_PROMPT.md`](AI_MASTER_PROMPT.md) | Prompt listo para crear la siguiente versión |

## Stack

- HTML5 + CSS + JavaScript vanilla.
- módulos ES selectivos.
- sin React/Vue/Svelte.
- sin bundler/build obligatorio.
- Supabase JS v2 por CDN.
- SortableJS.
- LiquidGlass WebGL real.
- localStorage.
- Service Worker.
- GitHub Pages.

## Compatibilidad que no se rompe

LocalStorage histórico:
- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`

Cloud:
- `public.editorial_state`
- workspace `editorial-os`
- payload legacy compatible.

Durante upgrades se preserva el `supabase-config.js` real del repo/usuario.

## Instalar / probar local

```bash
./start_local.sh
```

Abre:

```text
http://localhost:8080
```

## Actualizar una instalación existente a V12

Desde el paquete V12:

```bash
chmod +x deploy_v12_over_existing.sh
./deploy_v12_over_existing.sh /ruta/al/repo/editorial-os
```

El script crea backup, preserva `.git` y `supabase-config.js`, valida y publica.

## Instalar desde cero en Mac

```bash
chmod +x *.sh INSTALL_FROM_ZERO.command
./install_from_zero.sh
```

También puedes ejecutar `INSTALL_FROM_ZERO.command`.

## Supabase

La PWA sólo debe utilizar Project URL + publishable/anon key en frontend. Nunca incluir `service_role` ni secretos administrativos.

Schema de referencia: `supabase_schema.sql`.

## Catálogo JOC

`DEFAULT_JOC_CATALOG.md` documenta el catálogo inicial. La implementación ejecutable está en el código y sus IDs forman parte de la compatibilidad.

## Referencias

Consulta `docs/REFERENCES.md` y `SOURCES_V12.md`.

Principales:
- ybouane/liquidglass.
- SortableJS.
- ILaMY Calendar.
- CalendarKit.
- Calendar Planner.
- Schedule-X.
- nextjs-mobile-app-template.
- 21st.dev.

## Releases

- `CHANGELOG_V12.md`: cambios V12.
- `docs/RELEASE_AND_QA.md`: criterios de una release válida.
- `AI_MASTER_PROMPT.md`: instrucción completa para que otro chat analice, mejore, empaquete y entregue una nueva versión.
