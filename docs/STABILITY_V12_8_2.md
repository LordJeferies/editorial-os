# Editorial OS V12.8.2 · Stability repair

Fecha: 2026-10-03

## Motivo

Después de V12.8/V12.8.1 se observaron bloqueos, scroll irregular en iPhone y navegador, navegación poco fiable y sensación de que algunos botones quedaban sin responder.

La causa no era un único botón. Había varias capas de frontend históricas actuando simultáneamente sobre la misma UI:

- `v126-runtime.js` mantenía fitting del feed con `ResizeObserver` y lecturas/escrituras repetidas de geometría.
- `v127-runtime.js` añadía `ResizeObserver`, `MutationObserver`, `visualViewport.scroll`, `resize` y fitting adicional.
- `v128-runtime.js` volvía a medir geometría, modificar estilos, observar DOM y gestionar sheets.
- `v12-glass.js` seguía añadiendo trabajo WebGL en móvil.
- `v128.css` bloqueaba `html/body/#glassRoot` a una altura de viewport y convertía `#appScroller` en el scroll principal, creando nested scrolling y conflictos con Safari/PWA.

El resultado era demasiada coordinación runtime para una PWA estática que debe sentirse inmediata.

## Reparación V12.8.2

### 1. Scroll natural de documento

Se eliminó el modelo de altura bloqueada + `#appScroller` como único scroller.

Ahora:

- `html`, `body` y `#glassRoot` crecen de forma natural;
- el documento es el scroll principal;
- `#appScroller` no tiene altura máxima ni `overflow-y:auto`;
- no se usa `overscroll-behavior:none` global;
- el dock y topbar permanecen fijos, pero el contenido tiene padding safe-area estable.

Esto reduce especialmente los problemas de Safari cuando cambia la barra del navegador, aparece el teclado o cambia `visualViewport`.

### 2. Una sola capa activa de responsive runtime

`v126-runtime.js` y `v127-runtime.js` se convirtieron en compatibility shims. Ya no instalan observadores ni loops de resize/scroll.

`v128-runtime.js` es ahora pequeño y deliberadamente limitado a:

- navegación fallback;
- limpieza segura de modales;
- back/forward;
- ajuste puntual de Instagram 3 columnas;
- actualización debounced sólo en resize/orientation;
- clases visuales estables.

No hay `MutationObserver` global ni `ResizeObserver` del feed.

### 3. Sheets/drawer simplificados

Se retiró el motor JS de detents/drag que modificaba altura y transform durante gestos.

La ficha mantiene apariencia de bottom sheet, pero usa comportamiento CSS predecible:

- scroll interno sólo en la ficha;
- header sticky;
- footer sticky;
- botón de cierre de 44 px;
- toque en backdrop cierra;
- Escape cierra;
- al cerrar se eliminan locks residuales de `overflow`, `pointer-events` y `touch-action`.

Cuando la estabilidad esté verificada se puede reintroducir un drawer con detents mediante un componente aislado y testeado, no mediante otra capa encima del DOM existente.

### 4. Feeds

El feed sigue teniendo scroll interno intencional porque representa un teléfono dentro de la app, pero es ahora el único nested scroll móvil importante.

- `touch-action:pan-y`;
- momentum scroll de iOS;
- `overscroll-behavior-y:auto`;
- ancho máximo 430 CSS px;
- Instagram `repeat(3,minmax(0,1fr))`;
- sin cálculos de track por frame;
- sin ResizeObserver.

### 5. Liquid Glass

El WebGL real se desactivó temporalmente en móvil.

Motivo: la prioridad es que scroll/taps sean deterministas. El estilo Liquid Glass móvil se mantiene mediante material CSS (`backdrop-filter`, bordes, highlights y sombras). El LiquidGlass real continúa en desktop con un único root aislado: `#topGlassRoot -> #glassHeader`.

Esto sigue la limitación estructural de `@ybouane/liquidglass`: cada root rasteriza contenido para alimentar shaders, por lo que los roots grandes o múltiples pueden ser costosos.

### 6. Service Worker

Cache actual:

`editorial-os-v12-8-2`

HTML, JS y CSS siguen `networkFirst` con `cache:'no-store'` para evitar mezclar una versión nueva del HTML con runtimes viejos del cache.

## Compatibilidad que NO se cambió

- PWA estática / GitHub Pages.
- Supabase existente.
- `public.editorial_state`.
- workspace `editorial-os`.
- `jocEditorialV9`.
- `jocEditorialV9AppData`.
- `jocEditorialV9Scenarios`.
- `jocEditorialV9Cloud`.
- cloud payload `version:9`.
- LinkedIn base + LinkedIn L2 adicional.
- planner / escenarios / producción / feeds / biblioteca.

## Deuda técnica todavía importante

Aunque V12.8.2 reduce los hotspots principales, el repo sigue cargando capas históricas de CSS/JS (`legacy`, V12, V12.3, V12.4, V12.6, V12.7, V12.8). El siguiente trabajo serio debe consolidarlas gradualmente.

No conviene seguir creando `v129.css`, `v129-runtime.js`, etc. encima de las anteriores. La siguiente fase debe mover comportamiento ya validado a una arquitectura única y eliminar la capa reemplazada después de pruebas E2E.

## Criterios de aceptación para la próxima revisión

1. Scroll del Home continuo durante 30 segundos sin freeze.
2. 50 taps alternando los 5 tabs del dock sin perder input.
3. Abrir/cerrar 20 fichas sin overlay residual.
4. Cambiar Semana/Mes 20 veces sin crecimiento evidente de listeners/observers.
5. Feed Instagram mantiene 3 columnas en 393/430/440 CSS px.
6. Feed puede hacer scroll interno y volver al scroll de la página sin quedarse atrapado.
7. Emulador puede mover y reordenar contenido con touch.
8. Safari iPhone y Chrome/Safari desktop sin errores no controlados.
9. Después de recargar, estado local y cloud permanecen intactos.
10. Ningún cambio de UI debe esperar a Supabase.
