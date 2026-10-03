# Fuentes de diseño/arquitectura usadas en V12

V12 no incorpora un framework React sólo para copiar componentes. Se adaptaron patrones compatibles con la PWA vanilla existente.

## 21st.dev

Patrones estudiados/adaptados:

- Mobile Navigation / Bottom Bars: 3–5 destinos, hit targets ≥44 px, labels visibles, `safe-area-inset-bottom`, `100dvh`, feedback `:active`.
- Drawers / Sheets: en móvil, acciones secundarias y detalle en bottom sheet en lugar de modales centrados densos.
- Liquid Glass UI: glass como capa puntual de navegación/overlay, no como material aplicado a cientos de cards.
- Event Calendar: densidad progresiva; teléfono centrado en día/semana operativa en vez de siete columnas desktop comprimidas.

Referencias:
- https://21st.dev/community/components/explore/shadcn-bottom-navigation
- https://21st.dev/community/components/explore/liquid-glass-ui-components
- https://21st.dev/community/components/explore/shadcn-event-calendar
- https://news.21st.dev/blog/react-mobile-navigation-components
- https://news.21st.dev/blog/react-modal-dialog-components

## LiquidGlass

- https://github.com/ybouane/liquidglass
- https://liquid-glass.ybouane.com

Se usa la API real `LiquidGlass.init()` y `instance.destroy()`.

## SortableJS

- https://github.com/SortableJS/Sortable

Se conserva para el Kanban táctil del Emulador.
