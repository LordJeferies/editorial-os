# Editorial OS V12 · Changelog

## Objetivo

V12 convierte la reconstrucción de rendimiento de V11 en una interfaz más cercana a una aplicación nativa de iPhone/iPad, manteniendo GitHub Pages, Supabase y todos los contratos históricos de datos.

## Arquitectura

- `index.html` deja de contener ~274 KB de CSS/JS inline.
- CSS histórico se conserva, en el mismo orden, en `css/legacy.css` para minimizar regresiones.
- La capa visual V12 vive en `css/v12.css`.
- El núcleo funcional vive en `js/app-core.js`.
- La ergonomía móvil/sheets está en `js/v12-runtime.js`.
- LiquidGlass queda aislado en `js/v12-glass.js` con destroy/re-init idempotente al cambiar breakpoint, orientación o tema.
- No se añadió React, Vite, npm ni un build step.

## Rendimiento

- Memo de `assetsForDate()` durante cada ciclo de render para evitar derivaciones repetidas de la misma fecha/plataforma.
- El memo se invalida antes de cada render de vista, por lo que no conserva datos editoriales obsoletos.
- Feeds con horizonte de escenario largo renderizan inicialmente 42 días; el usuario puede pedir el rango completo.
- Semana/mes normales mantienen su comportamiento completo.
- Se eliminó la primera implementación legacy/rota de `renderInventory()`.
- `showLibraryTab()` ya no programa sync cloud sólo por renderizar una pestaña.
- Undo/Redo programa sincronización cloud después de restaurar el snapshot.

## iPhone / iPad

- `viewport-fit=cover` + safe areas.
- Breakpoint compacto ampliado a 899 px para que iPad portrait no reciba automáticamente la semana desktop de siete columnas.
- Bottom navigation visible hasta 899 px.
- Controles secundarios usan progressive disclosure mediante `Filtros`, `Ajustes` o `Configurar`.
- Nuevo bottom sheet “Más herramientas” para Agenda, Franjas, apariencia, nube, importar y exportar.
- Bottom sheet con Escape, cierre por backdrop, retorno de foco y focus loop básico.
- Targets táctiles principales de 44 px mínimo.
- Drawer de detalle se convierte en sheet inferior en pantallas compactas.

## Liquid Glass

- Mantiene roots pequeños para top bar y dock.
- Nunca envuelve calendario, feeds, biblioteca o Kanban completos.
- El controlador destruye recursos WebGL antes de reinicializar.
- Dock LiquidGlass sólo existe en modo compacto; desktop usa únicamente el top bar.

## PWA

- Manifest actualizado a Editorial OS V12.
- Cache: `editorial-os-v12`.
- Precache local incluye CSS y JS modularizados.
- Las dependencias CDN continúan como mejora online/fallback igual que en V11.

## Contratos preservados

Sin migración destructiva:

- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`
- `public.editorial_state`
- workspace `editorial-os`
- `supabase-config.js`
- IDs existentes de marcas, templates, pilares y familias
- semántica de `completion`
- slots/rangos de escenarios
- payload cloud legacy compatible
