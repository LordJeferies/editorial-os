# Fuentes usadas en Editorial OS V12

V12 adapta patrones a la PWA vanilla existente. No introduce React/Tailwind/Next sólo para copiar componentes.

## 21st.dev

Base:
- https://21st.dev
- https://21st.dev/community/components

Navegación móvil:
- https://21st.dev/community/components/explore/shadcn-bottom-navigation
- https://21st.dev/community/components/explore/navigation-bar-ui-design
- https://news.21st.dev/blog/react-mobile-navigation-components

Liquid Glass:
- https://21st.dev/community/components/explore/liquid-glass-components
- https://21st.dev/community/components/explore/liquid-glass-ui-components

Calendario:
- https://21st.dev/community/components/explore/calendar-component
- https://21st.dev/community/components/explore/shadcn-event-calendar

Patrones adoptados:
- 3–5 destinos primarios en bottom nav;
- labels y targets táctiles;
- safe areas;
- `100dvh`;
- progressive disclosure;
- sheets para acciones secundarias;
- glass selectivo;
- calendario móvil operativo y no desktop comprimido.

## LiquidGlass

- https://github.com/ybouane/liquidglass
- https://liquid-glass.ybouane.com

Se usa la API real `LiquidGlass.init()` y el lifecycle `destroy()` cuando está disponible.

## SortableJS

- https://github.com/SortableJS/Sortable

Se conserva para el Kanban táctil.

## Calendario / PWA

- https://github.com/kcsujeet/ilamy-calendar
- https://www.calendarkit.io
- https://github.com/kotapullarao/calendar-planner
- https://github.com/schedule-x/schedule-x
- https://github.com/RhysSullivan/nextjs-mobile-app-template

Ver `docs/REFERENCES.md` para qué se estudia de cada fuente y reglas de adaptación/licencia.
