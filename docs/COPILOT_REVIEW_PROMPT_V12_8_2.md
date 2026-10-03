# Prompt para GitHub Copilot · Auditoría de estabilidad Editorial OS V12.8.2

Copia desde aquí y pégalo en GitHub Copilot dentro del repositorio `LordJeferies/editorial-os`:

---

Quiero que hagas una auditoría técnica completa del repositorio actual `LordJeferies/editorial-os`, rama `main`, partiendo del estado más reciente. NO asumas que la app está bien sólo porque compila. Quiero que la pruebes como una aplicación real, identifiques por qué puede quedarse pegada o sentirse lenta, y propongas/codifiques correcciones verificables.

## Contexto del producto

Editorial OS es una PWA editorial multi-marca estática. Debe seguir siendo compatible con GitHub Pages y Supabase, sin obligar a migrar a React/Next/Vite ni añadir un backend nuevo.

Funciones principales:
- Home/dashboard.
- Calendario semana/mes.
- Franjas.
- Emulador/Planner/Kanban.
- Agenda.
- Feeds Instagram/Facebook/TikTok/YouTube/LinkedIn.
- Biblioteca, pilares, familias, tipos de contenido y marcas.
- Supabase cloud sync.
- Undo/Redo.
- Estados de producción.
- Escenarios.

## Contratos que NO debes romper

Conservar exactamente la compatibilidad con:
- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`
- Supabase `public.editorial_state`
- workspace `editorial-os`
- payload cloud compatible `version:9`
- marcas, pilares, familias, contenido custom, historial, escenarios, producción y feeds existentes.

No uses ni pidas service_role, database password, PAT o secretos administrativos. `supabase-config.js` contiene la clave pública cliente que ya usa la app.

LinkedIn debe seguir siendo:
`contenido LinkedIn existente + LinkedIn L2 adicional`.
L2 NO sustituye contenido previo.

## Contexto de los bugs recientes

V12.7/V12.8 fueron agregando capas de frontend sobre capas anteriores y aparecieron problemas reales en iPhone y navegador:
- scroll entrecortado o que se queda pegado;
- taps que tardan o dejan de responder;
- overlays/sheets que pueden bloquear la app;
- feeds internos difíciles de recorrer;
- demasiados listeners/observers y cálculos de layout simultáneos;
- conflictos de scroll entre `body`, `#appScroller`, sheets y feed viewers;
- Service Worker mezclando versiones durante actualizaciones;
- LiquidGlass WebGL demasiado costoso en móvil.

Lee primero `docs/STABILITY_V12_8_2.md` para entender las reparaciones aplicadas.

En V12.8.2 se hizo lo siguiente:
1. `html/body/#glassRoot` volvieron a crecimiento natural y el documento es el scroller principal.
2. `#appScroller` dejó de ser un nested scroll global.
3. `v126-runtime.js` y `v127-runtime.js` se redujeron a compatibility shims sin observers pesados.
4. `v128-runtime.js` se reemplazó por un core liviano sin MutationObserver global, ResizeObserver continuo ni motor JS de detents.
5. Sheets/drawers usan CSS más simple y cierres explícitos.
6. El único nested scroll intencional importante es el teléfono simulado dentro de Feeds.
7. LiquidGlass WebGL quedó desactivado temporalmente en móvil y sólo se mantiene real en desktop dentro de un root pequeño/aislado.
8. Service Worker usa cache `editorial-os-v12-8-2` y network-first para HTML/JS/CSS.

## Lo que debes hacer

### Fase 1 · inspección

Revisa TODO el árbol relevante antes de modificar:
- `index.html`
- `css/legacy.css`
- `css/v12.css`
- `css/v123.css`
- `css/v124.css`
- `css/v126.css`
- `css/v127.css`
- `css/v128.css`
- `js/app-core.js`
- `js/v12-runtime.js`
- `js/v123-runtime.js`
- `js/v124-runtime.js`
- `js/v126-runtime.js`
- `js/v127-runtime.js`
- `js/v128-runtime.js`
- `js/v12-glass.js`
- `sw.js`
- `manifest.webmanifest`
- tests existentes.

Identifica:
- listeners duplicados;
- MutationObserver / ResizeObserver innecesarios;
- `visualViewport` listeners en scroll;
- `scrollTo`, `scrollIntoView`, scroll-snap o transforms que puedan competir con scroll nativo;
- estilos que definan `overflow:hidden`, `height:100vh/100dvh`, `position:fixed`, `touch-action:none`, `overscroll-behavior:none` de forma demasiado amplia;
- forced synchronous layouts (leer `getBoundingClientRect/clientWidth/scrollWidth` después de escribir estilos en el mismo frame);
- render loops;
- componentes que se reconstruyen en cada tap;
- listeners individuales masivos donde convenga event delegation;
- funciones duplicadas por hoisting;
- Service Worker que pueda servir combinaciones incompatibles de HTML/JS/CSS;
- cualquier runtime histórico que ya no deba ejecutar lógica.

### Fase 2 · reproducir

Levanta la app local y crea pruebas E2E con Playwright o herramienta equivalente.

Prueba mínimo estas resoluciones lógicas:
- 393 × 852 (iPhone 14 Pro class)
- 430 × 932 (iPhone 15 Plus class)
- 440 × 956 (iPhone 16 Pro Max class)
- 834 × 1112 (iPad portrait class)
- 1440 × 1000 desktop

No uses sólo screenshots. Automatiza interacción.

### Fase 3 · pruebas obligatorias

1. Home: hacer scroll de arriba abajo y de vuelta 10 veces. No freeze, no bloqueo de input.
2. Dock móvil: hacer 50 taps alternando Inicio/Calendario/Plan/Feeds/Biblioteca. Cada tap debe cambiar de vista.
3. Abrir/cerrar 20 sheets y 20 fichas. Después de cada cierre el contenido debe seguir recibiendo taps y scroll.
4. Calendario: Semana/Mes 20 veces; prev/next/today; semana completa visible en Week.
5. Planner: cambiar días, añadir, mover, borrar y reordenar una pieza.
6. Feed Instagram: tres columnas completas a 393/430/440 px.
7. Feed móvil: hacer scroll dentro del mockup hasta el final y volver; luego continuar scroll de la página sin quedar atrapado.
8. Cambiar Instagram/Facebook/TikTok/YouTube/LinkedIn repetidamente.
9. Probar Realista / Zoom-out / Mapa compacto y Auto / Mobile / Desktop.
10. Biblioteca: cambiar tabs/filtros y abrir elementos.
11. Tema claro/oscuro.
12. Supabase: la UI local debe responder antes de cualquier respuesta cloud.
13. Offline/online si el entorno lo permite.
14. Recarga con Service Worker activo y verificar que los assets son todos de la misma versión.
15. Registrar errores `console.error`, `unhandledrejection` y long tasks.

## Performance

Instrumenta y reporta:
- Long Tasks > 50 ms durante navegación y scroll.
- cantidad aproximada de listeners relevantes antes/después de 50 navegaciones;
- cantidad de MutationObservers/ResizeObservers activos;
- tamaño DOM del Feed para una semana y un horizonte largo;
- coste de `renderFeed()`;
- coste de `renderHome()`;
- si `renderAll()` todavía se usa innecesariamente;
- si Sortable se recrea demasiado.

Prioriza eliminar trabajo, no sólo hacerlo más rápido.

## Arquitectura esperada

NO agregues otra capa `v129-runtime.js` encima de todas las anteriores como solución principal.

Quiero que propongas una consolidación gradual:
- un runtime UI actual;
- estilos actuales claramente separados de legacy;
- shims históricos sin side effects;
- event delegation donde ayude;
- render sólo de vista activa;
- estado/domain separado de composición UI;
- scroll nativo del documento como default;
- nested scroll sólo donde realmente representa una superficie independiente, como el mockup de Feed;
- cero observers globales salvo necesidad demostrada.

Si para estabilizar hace falta eliminar código legacy actualmente cargado, hazlo sólo después de demostrar mediante búsqueda/tests que ya está reemplazado.

## Liquid Glass

Revisa `https://github.com/ybouane/liquidglass` y su API real.

Reglas:
- nunca usar `document.body`, `#glassRoot` o un root que contenga toda Editorial OS;
- mantener roots pequeños;
- no abrir múltiples contextos WebGL innecesarios;
- no inicializar/destruir en cada resize de Safari;
- móvil debe priorizar 60fps/scroll/touch por encima del shader;
- si la implementación real no supera las pruebas de interacción, dejar fallback CSS en móvil está permitido;
- desktop puede conservar WebGL en root aislado si no afecta rendimiento.

## Feeds

El Feed debe ser funcional, no sólo visual.

Instagram en móvil:
- tres columnas completas;
- nunca dos columnas + fragmento de la tercera;
- no overflow horizontal global;
- scroll interno del mockup usable;
- al llegar al inicio/final, el usuario debe poder volver a desplazar la página naturalmente.

Para horizonte largo, investiga virtualización/windowing o render incremental. No crear cientos/miles de nodos si no son visibles.

## Sheets / fichas

Prioridad: que nunca bloqueen la app.

Primero prueba el modelo CSS simple actual. Si quieres reintroducir detents/swipe, usa un componente aislado y testeado, idealmente inspirado en `vaul` o un patrón equivalente, pero sin convertir toda la app a React.

Debe existir siempre:
- botón cerrar visible;
- tap backdrop;
- Escape desktop;
- cleanup de cualquier lock;
- foco restaurado cuando corresponda;
- body/page recupera scroll después de cerrar.

## Entrega que quiero de ti

No quiero sólo comentarios generales.

Entrega:
1. `AUDIT_REPORT.md` con problemas encontrados, severidad P0/P1/P2 y evidencia exacta archivo/línea.
2. Cambios de código necesarios.
3. Tests E2E reproducibles.
4. `PERFORMANCE_BEFORE_AFTER.md` con mediciones antes/después.
5. Lista de código legacy que puede eliminarse de forma segura y código que todavía debe conservarse.
6. Verificación de los contratos de storage/Supabase.
7. Una conclusión clara sobre si `main` está listo o no para publicarse.

No declares PASS si no ejecutaste la prueba correspondiente.

No hagas cambios cosméticos grandes hasta resolver primero:
P0 = freeze / scroll / taps / overlays / navegación / datos.
P1 = rendimiento y arquitectura.
P2 = polish visual.

Cuando termines, explícame cada cambio importante y por qué elimina una causa concreta del problema, no sólo qué archivo modificaste.

---
