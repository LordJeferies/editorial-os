# Editorial OS V12.3 · Mobile Core + Stability + Production

## Mobile / iPhone

- inputs/selects/textareas de 16 px en compact mode para evitar auto-zoom de iOS;
- `touch-action: manipulation` en controles;
- feedback táctil sin `scale()` en móvil;
- Emulador móvil renderiza un solo día real en DOM;
- reorden vertical dentro del día;
- mover a otro día mediante selector explícito, sin exigir drag horizontal largo;
- fallback Pointer Events si SortableJS no está disponible;
- catálogo del Emulador como bottom sheet;
- calendario: 1 día en teléfono, 3 días visibles en tablet compacta, 7 columnas en desktop;
- navegación interna sin `scrollIntoView()` en el runtime V12.3;
- Home añade superficie “Hoy”.

## Funciones de producto

- workflow de producción por ocurrencia: Planificada, En producción, Editando, Por revisión, Cambios, Aprobada, Programada y Publicada;
- responsable;
- hora de publicación;
- checklist Guion/Grabación/Edición/Subtítulos/Copy/Portada;
- notas de producción;
- búsqueda global (⌘K);
- Quick Add global;
- hash routing para Home/Calendario/Franjas/Emulador/Agenda/Feeds/Biblioteca;
- diagnóstico interno con versión, viewport, PWA mode, cache, IndexedDB y sync.

## Persistencia / estabilidad

- IndexedDB shadow snapshot;
- durable outbox local para cambios cloud pendientes;
- deviceId estable;
- revision/baseRevision en payload cloud compatible con `version:9`;
- detección básica de conflicto multi-device;
- elegir “Usar nube” o “Mantener aquí” en conflicto;
- import JSON validado antes de aplicar;
- migración no destructiva que añade `appData.production`;
- crash log local para errores/unhandled rejections.

## PWA

- cache `editorial-os-v12-3`;
- actualización controlada mediante `SKIP_WAITING`;
- network-first para navegación;
- stale-while-revalidate para assets locales;
- manifest con `id`, categorías y shortcuts.

## Deploy / QA

- updater hace `git fetch` y rebase antes de modificar el repo;
- no usa `rsync --delete`, para no borrar documentación nueva que exista en GitHub;
- comprueba de nuevo `origin/main` antes del push;
- tests Node para schema/migración/revisions;
- QA de contratos legacy, mobile UX, Service Worker, manifest, scripts y HTML.

## Compatibilidad preservada

- `jocEditorialV9`;
- `jocEditorialV9AppData`;
- `jocEditorialV9Scenarios`;
- `jocEditorialV9Cloud`;
- `public.editorial_state`;
- workspace `editorial-os`;
- cloud payload `version:9`;
- completion legacy;
- IDs de catálogo y escenarios.
