# Editorial OS V12.6 · UX Recovery

## Objetivo

V12.6 corrige la dirección visual de V12.5. La aplicación móvil vuelve a partir de la composición rica y funcional de V12.4, pero conserva las mejoras de dominio de V12.5. La simplificación se hace por jerarquía y menús contextuales, no eliminando capacidad.

## Frontend móvil

- Reactiva `v124.css` + `v124-runtime.js` como shell móvil principal.
- Retira de la ruta activa `v125.css` y `v125-runtime.js`.
- Mantiene cinco destinos principales: Hoy, Calendario, Plan, Feeds y Biblioteca.
- Conserva sheets, menús contextuales, catálogo modal, búsqueda global y Detail Sheet.
- Home vuelve a mostrar información útil y módulos operativos en lugar de ocultarlos.
- Biblioteca conserva tabs funcionales y formularios/edición en sheets.
- Feeds conserva las plataformas visibles y mueve sólo ajustes secundarios al sheet.

## Emulador

- Un solo día real se renderiza en modo compacto.
- Tabs Lun–Dom permanecen visibles.
- Cards recuperan información útil: título, tipo, lote, plataformas y menú contextual.
- Reorden vertical, mover por día, subir/bajar y eliminar siguen disponibles.
- Catálogo se abre con `+` en bottom sheet.
- Drag no es la única forma de mover contenido.

## Instagram Feed

La corrección ahora actúa sobre toda la geometría, no sólo sobre `grid-template-columns`:

1. `feed-sim-wrap` determina el espacio disponible real.
2. `v126-runtime.js` mide ese ancho después de cada render/resize.
3. El mockup móvil recibe un ancho explícito `<= 390px` y siempre cabe dentro del wrapper.
4. El shell usa `box-sizing:border-box`.
5. Todas las capas internas de Instagram se limitan a `width:100% / min-width:0`.
6. El grid se fuerza a tres tracks calculados desde `grid.clientWidth`: `(ancho - 2 gaps) / 3`.
7. Cada tile recibe exactamente ese ancho, usa containment y no puede ensanchar su track por contenido.
8. Zoom-out escala esta misma superficie desde afuera.

## LinkedIn

Se mantiene la lógica correcta de V12.5:

`LinkedIn base existente + cualquier publicación base que ya apunta a LinkedIn + LinkedIn L2 adicional`.

L2 no reemplaza contenido preexistente. `linkedinLayer:'base'` y `linkedinLayer:'l2'` siguen explícitos y cada pieza L2 conserva `sourceMasterKey`.

## Datos y backend conservados

- IndexedDB shadow state / outbox.
- revision + baseRevision + deviceId.
- detección de conflictos multi-dispositivo.
- producción, hora, responsable, checklist, links y notas.
- búsqueda global, diagnóstico y recovery.
- contratos legacy `jocEditorialV9*`.
- Supabase `public.editorial_state`, workspace `editorial-os`, payload compatible `version:9`.

## PWA

- cache `editorial-os-v12-6`.
- lifecycle de actualización controlado.
- manifest `Editorial OS V12.6`.
- no se cambia el modelo de despliegue estático GitHub Pages.
