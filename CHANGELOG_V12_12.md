# Editorial OS V12.12 · Planner Multi‑View

## Objetivo
Rehacer el Planificador como una superficie de trabajo estable y táctil, manteniendo una sola fuente de verdad (`plannerDraft`) para todas las vistas.

## Cambios
- Nuevo Planificador con tres vistas sincronizadas:
  - **Tablero**: columnas por día inspiradas en un board tipo Trello.
  - **Agenda**: días apilados con acción explícita `+ Añadir aquí`.
  - **Matriz**: tipos de contenido × días; tocar una celda añade una pieza.
- Las tres vistas leen y escriben el mismo `plannerDraft`. Cambiar de vista no crea ni borra otro plan.
- Nueva biblioteca/Content Rail con búsqueda, filtro L1/L2/L3, selección, `+` y drag handle dedicado.
- Drag & drop táctil propio basado en Pointer Events:
  - no depende del drag HTML nativo en iPhone;
  - no depende del `SortableJS` antiguo del planner móvil;
  - ghost fijo;
  - drop target de columna completa;
  - targets Lun–Dom visibles durante drag;
  - indicador de inserción;
  - auto-scroll vertical y horizontal;
  - `touch-action:none` sólo en el handle;
  - supresión del click posterior al drag para evitar abrir una ficha accidentalmente.
- Las fichas existentes pueden abrir detalle, moverse por drag, moverse por menú táctil, duplicarse y quitarse.
- `Vaciar plan` conserva el comando existente y por tanto el checkpoint/Undo del motor.
- La UI legacy del planner se mantiene en DOM como motor de compatibilidad, pero queda oculta cuando V12.12 está activa.

## Problemas observados en el video que cubre esta versión
- El drag móvil compite con scroll y puede perder el drop.
- El gesto puede terminar interpretándose como tap y abrir una ficha.
- El target de drop es pequeño/poco evidente.
- La bandeja y el día seleccionado duplican controles y hacen difícil saber dónde se soltará.
- No existe una alternativa suficientemente rápida cuando el drag táctil falla.
- El planner sólo ofrece una forma principal de composición.

## Compatibilidad
- No cambia `workspace_key = editorial-os`.
- No cambia el payload Supabase v9.
- No renombra las claves legacy de localStorage.
- V12.10 notas/sheets y V12.11 Desktop permanecen aditivos.
