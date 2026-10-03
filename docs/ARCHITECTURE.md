# Arquitectura V12

## Stack

- PWA estática.
- GitHub Pages.
- HTML5.
- CSS tradicional.
- JavaScript vanilla.
- módulos ES para capas aisladas.
- Supabase JS v2 CDN.
- SortableJS 1.15.6 CDN.
- `@ybouane/liquidglass` dinámico por CDN.
- localStorage.
- Service Worker.

No existe `package.json` ni build obligatorio.

## Árbol V12

```text
editorial-os/
├── index.html
├── manifest.webmanifest
├── sw.js
├── supabase-config.js
├── supabase_schema.sql
├── DEFAULT_JOC_CATALOG.md
├── README.md
├── AI_MASTER_PROMPT.md
├── css/
│   ├── legacy.css
│   └── v12.css
├── js/
│   ├── app-core.js
│   ├── v12-runtime.js
│   └── v12-glass.js
├── docs/
│   ├── AI_START_HERE.md
│   ├── PRODUCT_SPEC.md
│   ├── FEATURES_AND_USE_CASES.md
│   ├── ARCHITECTURE.md
│   ├── DATA_CONTRACTS.md
│   ├── VISUAL_REFERENCE_SPEC.md
│   ├── REFERENCES.md
│   ├── ROADMAP.md
│   └── RELEASE_AND_QA.md
└── icons/
```

## Por qué V12 conserva `legacy.css`

V11 tenía años/versiones de CSS acumuladas dentro de `index.html`. V12 lo extrae sin alterar el orden de cascada para reducir riesgo. `v12.css` es la capa nueva.

No considerar `legacy.css` como arquitectura final. Es una capa de compatibilidad que debe limpiarse de forma incremental y testeada.

## Runtime

### `app-core.js`
Contiene el núcleo funcional heredado/refactorizado:
- state y appData;
- catálogo;
- derivación de assets;
- renderers;
- calendario;
- planner;
- feeds;
- biblioteca;
- persistencia;
- Supabase;
- escenarios;
- completion;
- undo/redo.

### `v12-runtime.js`
Capa de ergonomía y shell V12:
- “Más herramientas” bottom sheet;
- progressive disclosure de filtros/configuración;
- manejo compact mode <=899 px;
- accessibility/focus del sheet;
- toast de actualización de Service Worker;
- metadatos visuales V12.

### `v12-glass.js`
Controlador de LiquidGlass:
- instancia top bar;
- instancia dock sólo en compact mode;
- destroy antes de re-init;
- responde a cambios de breakpoint/orientación/tema;
- mantiene WebGL fuera del main pesado.

## Shell conceptual

```text
#glassRoot
├── ambient
├── #topGlassRoot
│   ├── liquid-scene
│   └── #glassHeader
├── #appScroller
│   ├── #homeView
│   ├── #calendarView
│   ├── #lanesView
│   ├── #emulatorView
│   ├── #agendaView
│   ├── #feedsView
│   └── #inventoryView
├── #dockGlassRoot
│   ├── liquid-scene
│   └── #mobileDock
└── drawers/sheets
```

Las shells de vista pueden permanecer en DOM, pero sólo la activa debe reconstruir su contenido dinámico.

## Rendering

V11 introdujo `renderShared()` + `renderActiveView()` y `requestAnimationFrame`; V12 mantiene esa regla.

No volver a un `renderAll()` que reconstruya todas las vistas.

Reglas para nuevas funciones:
- renderers no deben persistir por efecto colateral;
- mutaciones deben pasar por funciones de commit/persistencia;
- listeners en listas grandes deben tender a delegación;
- derived data debe memoizarse por ciclo/revisión cuando sea seguro.

## Memo de assets V12

V12 reduce recomputación repetida de `assetsForDate()` durante un ciclo de render y limpia/invalida el memo para evitar datos obsoletos.

No convertir el cache en almacenamiento persistente sin una estrategia de invalidación explícita.

## Responsive

### <=430
Phone estrecho.

### 431–760
Phone/grande.

### 761–899
Tablet compact/iPad portrait. V12 evita tratar 768 px como desktop automáticamente.

### >=900
Desktop/tablet grande.

El breakpoint es una decisión de composición, no una garantía de hardware.

## LiquidGlass

Usar la API real:

```js
LiquidGlass.init({
  root,
  glassElements:[element]
})
```

Reglas:
- glass element hijo directo del root correspondiente;
- root pequeño;
- nunca envolver feeds/calendario/biblioteca completa;
- no crear decenas de WebGL instances;
- destruir antes de reconfigurar.

## Drag/Drop

Emulador:
- SortableJS.
- clone desde pool.
- move/reorder entre días.

Franjas:
- deuda histórica: revisar/migrar a touch-friendly engine.

## PWA

V12 usa cache `editorial-os-v12`.

Al crear V13:
- cambiar nombre del cache;
- actualizar manifest;
- mantener `start_url`/`scope` compatibles con GitHub Pages;
- validar standalone;
- revisar update lifecycle.

## Supabase

Arquitectura actual deliberadamente simple:
- auth en frontend;
- RLS protege la fila del usuario;
- una fila JSONB por user/workspace;
- Realtime propaga UPDATE.

No usar credenciales administrativas en la PWA.
