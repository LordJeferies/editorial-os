# Editorial OS V12.4 · Frontend Core

V12.4 reconstruye la composición móvil sin cambiar los contratos editoriales, Supabase ni el despliegue estático. El objetivo de esta release es que iPhone/iPad dejen de sentirse como un desktop comprimido.

## Shell móvil

- Header móvil propio: marca activa, estado de sync, búsqueda y menú contextual.
- La barra desktop deja de ocupar espacio en iPhone/iPad compacto.
- Tab bar inferior reservada exclusivamente a navegación: Hoy, Calendario, Plan, Feeds y Biblioteca.
- Targets táctiles de 44 px como mínimo.
- Search, More y acciones contextuales se presentan mediante sheets.
- Safe areas, visual viewport y teclado se tratan como parte del layout.
- Se elimina `scale()` como feedback táctil en compacto.
- Inputs/selects/textareas se mantienen en 16 px para evitar auto-zoom de Safari.

## Emulador / Planificador

- Sólo un día se renderiza en móvil; no hay siete columnas fuera de pantalla.
- Plan / Vista previa / Escenarios son modos explícitos.
- El catálogo real se mueve a un bottom sheet, conservando listeners y datos.
- Las fichas se muestran como filas táctiles de producción, no mini-cards desktop.
- Handle separado para reorder.
- `•••` abre menú contextual con: detalles, mover, subir, bajar y quitar.
- El drag deja de ser la única forma de organizar contenido.
- El botón + del header abre el catálogo.
- Configuración de rango/escenario vive en sheet, no en una barra permanente.

## Calendario

- Toolbar desktop oculta en compacto.
- Título grande y acciones Hoy/Vista.
- Semana operativa enfocada en días, mes accesible desde sheet.
- Cards de día convertidas a listas agrupadas con separadores simples.

## Feeds

- Plataformas quedan visibles como selector horizontal.
- Vista, dispositivo, horizonte y formatos pasan al sheet Ajustes.
- Se limita overflow accidental para que una simulación desktop no ensanche el viewport de la PWA.

## Biblioteca

- Search/lista primero.
- Crear y filtros se presentan como acciones contextuales.
- Formularios de pilares/familias/marcas pueden reutilizarse dentro de sheets sin duplicar listeners.
- Listas y gestores usan filas táctiles con jerarquía más cercana a iOS.

## Home / Hoy

- Analytics densos se ocultan en móvil.
- Hoy + producción + piezas maestras + escenarios forman la superficie inicial.
- Acciones directas: Calendario, Planificar, Buscar, Biblioteca.

## Menús y sheets

- Sistema único de sheet con backdrop, focus trap, Escape, devolución de foco y scroll contenido.
- Menú Más prioriza Buscar, Agenda, Franjas, Sync, Apariencia, Ajustes, Diagnóstico, Exportar e Importar.
- Las acciones destructivas se diferencian semánticamente sin convertirlas en botones gigantes.

## Arquitectura frontend

V12.4 introduce una capa de UI con principios de React/Signals sin obligar un framework a controlar el DOM legacy:

- `js/v124-store.js`: store UI reactivo y batched, separado del domain state.
- `js/v124-runtime.js`: component islands móviles y event delegation.
- El dominio sigue en `app-core.js` y mantiene compatibilidad.
- Esto evita una reescritura big-bang y permite sustituir renderer por renderer en releases futuras.

La decisión es intencional: no se añade un segundo virtual DOM encima de los renderers imperativos existentes hasta que cada feature esté aislada. Se adoptan las técnicas de identidad estable, single source of truth, componentes y estado derivado sin poner en riesgo la PWA estática.

## Liquid Glass / rendimiento

- iPhone/iPad compacto ya no inicializan WebGL LiquidGlass.
- El móvil usa `backdrop-filter` CSS únicamente en chrome persistente.
- LiquidGlass se carga dinámicamente sólo en desktop.
- Esto reduce trabajo de compositing durante keyboard, scroll y drag.

## Compatibilidad preservada

Sin renombrar:

- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`
- `public.editorial_state`
- workspace `editorial-os`
- payload cloud `version:9`
- completion / scenarios / catalog IDs.
