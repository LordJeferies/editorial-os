# Editorial OS V12.7 · Studio Responsive

## Objetivo

V12.7 reconstruye la capa de presentación móvil sin recortar capacidades. La interfaz adopta un lenguaje visual inspirado en patrones de `shadcn/studio` (tokens semánticos, cards, sheets, botones, jerarquía y estados), pero sigue siendo una PWA estática en HTML/CSS/JS vanilla, compatible con GitHub Pages y el backend actual.

## Responsive móvil

La app ya no decide el layout a partir de píxeles físicos del panel. Usa el ancho real de `visualViewport` en CSS px/pt y bandas compactas:

- hasta 399 CSS px: teléfono compacto (objetivo principal: iPhone 14 Pro, ~393 px)
- 400–432 CSS px: teléfono estándar (objetivo principal: iPhone 15 Plus, ~430 px)
- 433–480 CSS px: teléfono grande (objetivo principal: iPhone 16 Pro Max, ~440 px)
- 600–899 CSS px: iPad/compacto amplio
- 900+ CSS px: desktop

También existe margen de seguridad para anchos menores como 375 CSS px.

## Home

- vuelve a ser un dashboard útil, no una pantalla simplificada;
- hero semanal + progreso + acciones principales;
- cards operativas y KPIs conservados;
- jerarquía visual tipo dashboard moderno;
- grid 1/2/3 columnas según espacio real;
- sin overflow horizontal en teléfono;
- barra inferior fija de cinco destinos.

## Feeds / Instagram

La corrección del grid de Instagram se hace en toda la cadena de ancho:

`feed wrap -> device shell -> Instagram viewport -> grid -> tile -> media`

- shell móvil `width:100%`, `min-width:0`;
- grid `repeat(3,minmax(0,1fr))`;
- tiles `min-width:0`, `aspect-ratio:1`;
- media absoluta dentro de cada tile;
- labels contenidas;
- se eliminan inline widths heredados en runtime;
- si el usuario selecciona preview Desktop desde un teléfono, se escala dentro de un stage y no ensancha el documento;
- migración única: una preferencia antigua `feedDevice=desktop` cambia a `Auto` en teléfono para evitar cargar accidentalmente un mockup desktop más ancho que el viewport.

## Navegación y componentes

- topbar móvil más compacta;
- touch targets de 44 CSS px;
- tabs inferiores estables: Inicio, Calendario, Plan, Feeds, Biblioteca;
- inputs >=16 px para evitar auto-zoom de Safari;
- sheets con borde, agrupación, scroll contenido y jerarquía consistente;
- botones y cards usan tokens semánticos inspirados en shadcn/studio;
- se elimina feedback por `scale()` durante tap en móvil.

## Arquitectura

V12.7 sigue cargando:

- `app-core.js` y contratos existentes;
- V12.3 storage/sync;
- V12.4 store/runtime;
- V12.6 mejoras UX;
- nueva capa `css/v127.css` + `js/v127-runtime.js`.

No se introduce Next.js, React obligatorio, bundler ni servidor. Se reutilizan patrones de diseño y arquitectura de componentes sin cambiar el modelo de despliegue.

## LinkedIn

Se mantiene el comportamiento correcto:

**LinkedIn base existente + LinkedIn L2 adicional**.

L2 no sustituye contenido previo.
