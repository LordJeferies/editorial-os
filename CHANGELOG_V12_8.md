# Editorial OS V12.8 · iOS Polish

V12.8 pule la experiencia móvil a partir de las grabaciones reales de iPhone de V12.7. Mantiene los contratos, datos, Supabase y arquitectura estática.

## Correcciones principales

- El layout móvil usa medidas reales de `visualViewport` y mide el alto real de topbar/dock para que el contenido nunca quede debajo del chrome.
- El fondo y el root ocupan el alto visual completo; se elimina el espacio negro inferior desaprovechado.
- Se añadieron controles Atrás / Adelante en la barra superior y cierre prioritario de sheets antes de retroceder de vista.
- Calendario `Semana` muestra los 7 días de la semana completa en una única vista operativa móvil. Ya no es un carrusel que enseña un día a la vez.
- Las fichas de contenido pasan a bottom sheet con detents, grabber, drag para expandir/reducir/cerrar, body con scroll propio y footer de acciones siempre accesible.
- Se corrige el estado modal residual que podía dejar la interfaz sin responder después de cerrar una ficha/sheet.
- Los visores de Feeds en móvil tienen viewport interno vertical con momentum scroll. Instagram/Facebook/TikTok/YouTube/LinkedIn se pueden recorrer completos sin desplazar o ensanchar toda la aplicación.
- Instagram mantiene tres columnas flexibles exactas dentro del viewport del teléfono.
- Home conserva el dashboard completo con espaciado más compacto y consistente.
- Liquid Glass vuelve a estar activo de forma progresiva: usa `@ybouane/liquidglass` para chrome/botones cuando WebGL rinde bien y cae automáticamente al material CSS si el FPS es bajo.
- Continúa preservado `LinkedIn base + LinkedIn L2 adicional`.

## Patrones externos estudiados

- Apple HIG: safe areas, tab bars, toolbars y sheets con detents/grabber/swipe-to-dismiss.
- `ybouane/liquidglass`: refraction/blur/WebGL, lifecycle `destroy()` y `markChanged()`.
- `emilkowalski/vaul`: drawer móvil, scroll interno, cancelación y cierre robusto.
- `shadcnstudio/shadcn-studio`: jerarquía de cards, buttons, sheets, sidebar/menu y tokens semánticos.

## Compatibilidad preservada

- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`
- Supabase `public.editorial_state`
- workspace `editorial-os`
- cloud payload compatible `version:9`

## Deploy

```bash
chmod +x deploy_v12_8_over_existing.sh
./deploy_v12_8_over_existing.sh ~/Downloads/EDITORIAL_OS_V10_FRESH
```

El deploy hace fetch/rebase, backup, preserva `supabase-config.js`, ejecuta QA, hace commit/push fast-forward y espera a que GitHub Pages empiece a servir V12.8.
