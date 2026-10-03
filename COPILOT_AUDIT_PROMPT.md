# Prompt para GitHub Copilot · Auditoría profunda de Editorial OS

Copia todo el bloque siguiente en GitHub Copilot trabajando dentro de este repositorio.

---

Quiero que hagas una **auditoría senior completa y práctica** de este repositorio antes de proponer más features.

Repositorio: `LordJeferies/editorial-os`

La aplicación es **Editorial OS**, una PWA editorial multi-marca estática desplegada con GitHub Pages y Supabase. No quiero una respuesta superficial ni una lista genérica. Quiero que inspecciones el código REAL del repo, sigas los flujos, identifiques errores verificables y propongas/codifiques reparaciones concretas.

## Contexto obligatorio

Lee primero, en este orden:

1. `docs/STABILITY_V12_8_2.md`
2. `README.md`
3. `PROJECT_FILES.txt`
4. `index.html`
5. `css/legacy.css`
6. `css/v12.css`
7. `css/v123.css`
8. `css/v124.css`
9. `css/v126.css`
10. `css/v127.css`
11. `css/v128.css`
12. `js/app-core.js`
13. `js/v12-runtime.js`
14. `js/v123-runtime.js`
15. `js/v124-store.js`
16. `js/v124-runtime.js`
17. `js/v126-runtime.js`
18. `js/v127-runtime.js`
19. `js/v128-runtime.js`
20. `js/v12-glass.js`
21. `js/v123-storage.js`
22. `js/v123-sync.js`
23. `sw.js`
24. `manifest.webmanifest`
25. `DEFAULT_JOC_CATALOG.md`

Después revisa los tests y scripts de deploy existentes.

## Restricciones que NO puedes romper

La app debe seguir siendo:

- PWA estática;
- compatible con GitHub Pages;
- HTML/CSS/JavaScript vanilla en runtime;
- sin requerir React/Next/Vite para ejecutar producción;
- Supabase existente;
- multi-marca;
- usable offline en la medida actual;
- compatible con los datos históricos.

Debes preservar:

- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`
- tabla `public.editorial_state`
- workspace `editorial-os`
- payload cloud compatible `version:9`
- marcas, pilares, familias y custom content
- escenarios y rangos
- completion/producción
- feeds
- planner
- LinkedIn base existente
- LinkedIn L2 adicional; **L2 nunca sustituye el contenido LinkedIn base**

No uses ni pidas service_role, database password, PAT ni secretos administrativos.

## Problema principal actual

La prioridad es **estabilidad y fluidez**, especialmente:

- scroll que se siente pegado o errático;
- scroll móvil y desktop;
- taps que dejan de responder;
- overlays/sheets que pueden bloquear interacción;
- listeners u observers duplicados;
- render/reflow excesivo;
- demasiadas capas históricas ejecutándose simultáneamente;
- CSS acumulativo con reglas contradictorias;
- feed simulators con nested scroll;
- Safari/PWA iPhone;
- rendimiento del Emulador;
- Service Worker/cache mezclando versiones.

V12.8.2 ya hizo una reparación de emergencia:

- documento vuelve a ser el scroller principal;
- `v126-runtime.js` y `v127-runtime.js` son compatibility shims sin observers;
- `v128-runtime.js` quedó reducido;
- mobile LiquidGlass WebGL está deshabilitado temporalmente y usa fallback CSS;
- desktop usa un solo root LiquidGlass aislado;
- sheets se simplificaron para no depender de un motor JS de detents;
- cache SW es `editorial-os-v12-8-2`.

No reviertas esto sin demostrar con pruebas que tu alternativa es mejor.

## Tu trabajo

### Fase 1 · Mapa real de arquitectura

Haz un mapa de:

- estado de dominio;
- estado de UI;
- persistencia;
- sync cloud;
- Service Worker;
- navegación;
- render por vista;
- listeners globales;
- observers;
- timers;
- requestAnimationFrame;
- SortableJS;
- LiquidGlass;
- sheets/drawers;
- feed rendering;
- calendar rendering;
- planner rendering.

Identifica qué archivo es realmente responsable de cada comportamiento.

### Fase 2 · Busca deuda acumulativa

Busca especialmente:

- múltiples runtimes haciendo el mismo trabajo;
- funciones duplicadas;
- listeners duplicados;
- `MutationObserver` innecesarios;
- `ResizeObserver` innecesarios;
- `visualViewport.scroll` handlers;
- `scroll` handlers no passive;
- llamadas repetidas a `getBoundingClientRect()` mezcladas con style writes;
- forced synchronous layout;
- `innerHTML` masivo en acciones frecuentes;
- render de vistas inactivas;
- `renderAll()` o equivalentes demasiado amplios;
- ciclos render -> persist -> sync -> render;
- `scrollIntoView()` que cambie scroll del documento inesperadamente;
- `overflow:hidden` en `html/body/root`;
- nested scrollers no necesarios;
- `touch-action:none` fuera de handles de drag;
- transform/scale que interfiera con hit testing;
- overlays transparentes con `pointer-events` activos;
- z-index incorrectos;
- backdrop-filter excesivo;
- WebGL roots grandes;
- objetos/listeners que nunca se destruyen.

Quiero referencias exactas a archivos y funciones.

### Fase 3 · Reproduce flujos críticos

Si puedes ejecutar navegador/E2E, prueba al menos:

#### Viewports

- 375×812
- 393×852
- 430×932
- 440×956
- iPad portrait
- desktop 1440×900

#### Flujos

1. abrir app;
2. hacer scroll largo en Home;
3. cambiar 50 veces entre tabs del dock;
4. abrir/cerrar 20 fichas;
5. Semana -> Mes -> Semana repetidamente;
6. semana completa debe mostrar Lun-Dom;
7. Emulador: reorder same-day;
8. Emulador: mover Monday -> Thursday -> Monday;
9. abrir catálogo y cerrarlo;
10. Feeds Instagram: tercera columna completa;
11. hacer scroll dentro del visor de Instagram;
12. salir del visor y seguir haciendo scroll en la página;
13. cambiar Instagram/Facebook/TikTok/YouTube/LinkedIn;
14. Auto/Mobile/Desktop;
15. Realista/Zoom-out/Mapa compacto;
16. abrir Biblioteca;
17. búsqueda;
18. modo oscuro;
19. offline -> online;
20. recargar y comprobar persistencia.

Registra errores de consola, long tasks, layout shifts y crecimiento del número de listeners/DOM cuando sea posible.

### Fase 4 · Revisa scroll específicamente

Determina para cada superficie quién debe poseer el scroll:

- app general -> **documento**;
- sheet abierta -> sheet;
- feed simulado -> viewport interno del feed;
- listas horizontales explícitas -> eje X local;
- drag planner -> sólo durante drag.

No quiero dos scrollers verticales compitiendo salvo el feed/sheet cuando sea intencional.

Comprueba Safari/iOS:

- `100dvh` / safe area;
- teclado;
- toolbar del navegador;
- `-webkit-overflow-scrolling: touch`;
- `overscroll-behavior`;
- `touch-action`;
- sticky/fixed elements;
- body scroll locking.

### Fase 5 · Revisa Service Worker y cache

Comprueba que:

- HTML/JS/CSS nuevos no se mezclan con versiones antiguas;
- no haya cache keys obsoletas activas;
- update lifecycle sea claro;
- offline no impida una actualización;
- no exista un loop de reload/SW;
- assets CDN tengan fallback razonable cuando corresponda.

### Fase 6 · LiquidGlass

Lee también:

`https://github.com/ybouane/liquidglass`

No uses un root que incluya toda la app. La librería rasteriza hijos del root y puede ser costosa.

En móvil, actualmente el WebGL real está deshabilitado por estabilidad. Si propones reactivarlo, hazlo sólo después de medir:

- FPS;
- input latency;
- scroll smoothness;
- memory;
- WebGL contexts.

No sacrifiques interacción por efecto visual.

### Fase 7 · Arquitectura objetivo

No sigas creando capas `v129-runtime.js`, `v130-runtime.js`, etc. encima de todas las anteriores.

Propón una consolidación incremental hacia algo como:

- `js/core/` dominio
- `js/state/`
- `js/storage/`
- `js/sync/`
- `js/ui/router.js`
- `js/ui/shell.js`
- `js/ui/sheets.js`
- `js/views/home.js`
- `js/views/calendar.js`
- `js/views/planner.js`
- `js/views/feeds.js`
- `js/views/library.js`
- `css/tokens.css`
- `css/base.css`
- `css/components.css`
- `css/mobile.css`

Pero **no hagas un big-bang rewrite**. Debe ser migración incremental con tests.

### Fase 8 · Tests que faltan

Quiero tests reales, no sólo búsquedas de strings.

Añade/recomienda:

- unit tests para move/reorder, fechas, scenario range, completion, migrations;
- Playwright E2E para viewports anteriores;
- test de click/tap de todos los botones principales;
- test de scroll document;
- test de scroll sheet;
- test de scroll feed;
- test de cerrar overlay y recuperar interacción;
- test de Service Worker/update;
- visual regression del Home/Calendario/Emulador/Feeds/Biblioteca.

Un `package.json` de **desarrollo/testing** está permitido aunque producción siga sin build.

## Entrega que quiero de ti

Primero dame un informe con esta estructura:

1. **P0 — bugs que pueden congelar o inutilizar la app**
2. **P1 — bugs funcionales**
3. **P2 — rendimiento/UX**
4. **P3 — deuda técnica**
5. **Qué NO tocar todavía**
6. **Plan de reparación incremental**

Para cada problema incluye:

- archivo;
- función/selector;
- por qué ocurre;
- cómo reproducirlo;
- impacto;
- corrección exacta;
- riesgo de la corrección;
- test que demuestra que quedó arreglado.

Después implementa primero sólo P0/P1, ejecuta pruebas y presenta el diff antes de avanzar a refactors mayores.

### Regla final

La prioridad no es que el código parezca más moderno. La prioridad es:

**tap -> respuesta inmediata -> scroll fluido -> estado seguro -> sync posterior.**

Una UI menos sofisticada pero estable es preferible a una UI con animaciones/WebGL que pierda input o se congele.

---
