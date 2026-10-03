# Editorial OS V12.1 · Emulador libre

## Reparación principal

El Emulador deja de tratar las fichas base como inmóviles. Ahora una ficha colocada en lunes puede moverse a jueves, volver a lunes y reordenarse dentro del mismo día.

### Drag & drop

- todas las `.plan-item` son arrastrables mediante el handle `⋮⋮`;
- los anchors precargados (`fixed`) pueden moverse; al moverlos se convierten en `manualOverride` para no volver a bloquearlos;
- SortableJS usa `scroll`, `scrollSensitivity`, `scrollSpeed`, `bubbleScroll`, `emptyInsertThreshold` e `invertSwap` para facilitar cruces entre días en iPhone/iPad;
- durante el drag se desactiva temporalmente `scroll-snap` para que el autoscroll horizontal funcione;
- el índice final se deriva del DOM después del drop, evitando errores de posición al mover entre listas;
- el fallback HTML5 usa la misma semántica de índices.

### Alternativa táctil sin drag

En pantallas compactas tocar una ficha abre **Mover ficha** con Lun–Dom. Así el usuario puede seleccionar una pieza y enviarla directamente al día deseado incluso si el gesto drag resulta incómodo.

## Mejoras V1X portadas a la línea oficial

Se revisó el constructor V1X y se portaron únicamente patrones seguros:

- tabs de Lun–Dom para el Emulador en móvil;
- día visible sincronizado con `plannerTargetDay`;
- catálogo como bottom sheet/FAB en compacto;
- `content-visibility` para Feeds/Agenda;
- aviso de actualización del Service Worker;
- tokens/feedback táctil y estados de drag.

No se portó el aislamiento V1X de `editorialV1X*` ni el workspace `editorial-os-v1x`, porque V12.1 es la línea oficial y debe conservar `jocEditorialV9*` + workspace `editorial-os`.

## Compatibilidad preservada

- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`
- `public.editorial_state`
- workspace `editorial-os`
- payload cloud `version:9`
- catálogo JOC, escenarios y completion
- GitHub Pages + Supabase
