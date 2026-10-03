# Roadmap técnico

Este roadmap prioriza deuda y mejoras por impacto. No es una obligación de meter todo en la próxima release.

## Ya resuelto / mejorado en V12

- extracción de CSS/JS fuera del `index.html` monolítico;
- capa visual V12 separada;
- breakpoint compact hasta 899 px;
- bottom sheet “Más herramientas”;
- progressive disclosure en vistas densas;
- LiquidGlass controller con destroy/re-init;
- memo por ciclo de derivación de assets;
- límite inicial en feeds de escenario largo;
- Biblioteca ya no sincroniza sólo por renderizar tab;
- undo/redo programa sync;
- cache `editorial-os-v12`.

## P0 · No romper

- compatibilidad de datos V9 legacy;
- Supabase existente;
- escenarios;
- completion;
- catálogo/IDs;
- PWA install/update;
- `supabase-config.js` durante deploy.

## P1 · Rendimiento feeds

Problema:
- el DOM puede crecer demasiado.

Objetivo:
- windowing real por días/grupos.
- IntersectionObserver.
- event delegation.
- derivación memoizada por revision.

Medir en iPhone antes/después.

## P2 · Derived state / selectors

Centralizar:
- `assetsForDate`.
- `allAssets`.
- `platformAssets`.
- aggregations Home/Calendar/Feed.

Ideal:
- cache keyed por brand/scenario/date/platform/config revision.
- invalidación explícita.

## P3 · Separar más `app-core.js`

Orden seguro:
1. persistence.
2. cloud.
3. derived selectors.
4. history.
5. calendar.
6. planner.
7. feeds.
8. library.

Mantener ESM estático sin build.

## P4 · Event delegation

Reducir listeners card-by-card en:
- agenda;
- library;
- calendar cards;
- feed posts.

## P5 · Kanban iPhone

- catálogo en bottom sheet.
- add-to-day sin drag largo.
- long press/reorder dentro del día.
- autoscroll.
- drop zones más grandes.

## P6 · Franjas touch

Migrar HTML5 DnD legacy a:
- SortableJS; o
- Pointer Events si ofrece mejor control.

Añadir:
- sticky labels.
- day focus.
- accesibilidad keyboard equivalente.

## P7 · Sync multi-device

Deuda:
- last-write-wins.

Posible evolución sin cambiar tabla:
- `revision`.
- `updatedAt` local.
- `baseRevision`.
- warning de conflicto.

No implementar silenciosamente una estrategia de merge sin tests.

## P8 · Offline outbox

Si el uso offline se vuelve crítico:
- IndexedDB.
- cola durable.
- retries/backoff.
- idempotency/revision.

## P9 · Undo patches

Sustituir snapshots completos por command/patch history para reducir memoria y GC.

## P10 · Design system

Reducir dependencia de `legacy.css` progresivamente:
- tokens únicos;
- radii scale;
- spacing scale;
- typography scale;
- componentes base;
- responsive consolidado.

No eliminar legacy en un big-bang visual sin pruebas comparativas.
