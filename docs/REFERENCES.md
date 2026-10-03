# Referencias técnicas y visuales

Estas fuentes se usan para estudiar patrones, APIs y soluciones. No significa que todas deban convertirse en dependencias.

Antes de copiar código, revisar licencia actual del proyecto y compatibilidad con una PWA estática.

## Liquid Glass

### ybouane/liquidglass
- https://github.com/ybouane/liquidglass
- https://liquid-glass.ybouane.com

Estudiar:
- `README.md`.
- `src/defaults.ts`.
- `src/LiquidGlass.ts`.
- `src/index.ts`.
- `site/index.html`.

Uso en Editorial OS:
- `LiquidGlass.init()` real.
- roots pequeños.
- header/dock.
- lifecycle destroy/re-init.

No envolver todo el main.

## Drag and drop

### SortableJS
- https://github.com/SortableJS/Sortable

Uso:
- clone desde pool.
- reorder.
- move entre días.
- touch delay/fallback.

Estudiar para:
- autoscroll;
- mejor workflow iPhone;
- posible migración de Franjas.

## Calendarios

### ILaMY Calendar
- https://github.com/kcsujeet/ilamy-calendar

Estudiar:
- week/day/month UX.
- resource timeline.
- agenda.
- drag/drop.
- arquitectura de calendarios complejos.

### CalendarKit
- https://www.calendarkit.io

Estudiar:
- densidad.
- navegación.
- day/week layouts.
- patrones modernos.

### Calendar Planner
- https://github.com/kotapullarao/calendar-planner

Estudiar:
- PWA calendar.
- patrones vanilla-friendly.
- touch.
- rendimiento.

### Schedule-X
- https://github.com/schedule-x/schedule-x

Estudiar:
- responsive calendar.
- separación de views.
- arquitectura moderna.

## PWA / shell móvil

### nextjs-mobile-app-template
- https://github.com/RhysSullivan/nextjs-mobile-app-template

Aunque usa otro stack, estudiar:
- `100dvh`.
- safe areas.
- mobile shell.
- bottom navigation.
- comportamiento standalone.

No introducir Next.js sólo para copiar este patrón.

## 21st.dev

- https://21st.dev
- https://21st.dev/community/components

Colecciones relevantes:
- https://21st.dev/community/components/explore/shadcn-bottom-navigation
- https://21st.dev/community/components/explore/navigation-bar-ui-design
- https://21st.dev/community/components/explore/liquid-glass-components
- https://21st.dev/community/components/explore/liquid-glass-ui-components
- https://21st.dev/community/components/explore/calendar-component
- https://21st.dev/community/components/explore/shadcn-event-calendar

Artículos/patrones:
- https://news.21st.dev/blog/react-mobile-navigation-components

Cómo usar 21st.dev en este proyecto:
1. estudiar composición y microinteracciones;
2. identificar dependencias del componente;
3. adaptar el patrón a HTML/CSS/JS vanilla si es razonable;
4. no instalar React/Tailwind sólo para un componente;
5. conservar accesibilidad, safe areas y hit targets;
6. comparar varias implementaciones antes de escoger una.

Los componentes de 21st.dev son inspiración/patrones; revisar la licencia del componente/fuente concreta antes de copiar código literal.

## Referencias visuales internas

El usuario entregó una colección de pantallas de:
- video editing;
- creator tools;
- calendarios;
- fitness/learning;
- music/social apps;
- dashboards;
- smart-home/cards;
- node editors.

La traducción técnica se conserva en `docs/VISUAL_REFERENCE_SPEC.md`.
