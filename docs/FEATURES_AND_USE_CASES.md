# Herramientas y casos de uso

## Home / Dashboard

### Objetivo
Convertir todo el estado editorial en una pantalla de “qué hago ahora”.

### Información
- semana actual;
- cobertura;
- piezas maestras/publicaciones;
- Reels/Shorts;
- escenarios;
- producción Hecho/Pendiente;
- próximo contenido;
- mix por familias;
- plataformas;
- lotes L1/L2/L3;
- actividad;
- cloud.

### UX deseada
Cards grandes, jerarquía nativa, poca densidad inicial, acceso rápido a calendario/emulador/feeds. Los detalles secundarios deben vivir en panels o sheets.

## Calendario

### Objetivo
Ubicar cada asset dentro del tiempo.

### Semana móvil
- tabs de 7 días;
- una página de día de ancho completo;
- scroll horizontal nativo;
- scroll-snap;
- el swipe no debe generar sync cloud continuo.

### Mes móvil
- 42 celdas compactas;
- fecha, cantidad, dots de contenido;
- tap abre semana/día.

### Desktop
- semana de 7 columnas;
- mes de 7 columnas;
- overflow sólo donde sea intencional.

### Mejoras futuras posibles
- ventana de 3 días en móvil en vez de crear 7 páginas;
- memo fuerte por date/scenario;
- drag limitado y accesible;
- tratamiento especial iPad.

## Franjas

### Objetivo
Visualizar familias/recursos como lanes por día.

### Estado actual
Vista ancha. Históricamente depende de scroll horizontal. V11 conservaba HTML5 DnD; V12 prioriza la ergonomía visual pero este flujo sigue siendo candidato a migrar a Sortable/Pointer Events.

### Evolución recomendada
- iPhone: selector Día/Semana o focus-day.
- sticky family label.
- drag touch consistente.
- auto-scroll.

## Emulador / Kanban

### Objetivo
Probar una estructura editorial sin alterar el escenario activo hasta que el usuario la guarde/active.

### Capacidades
- pool de catálogo;
- filtros y búsqueda;
- clone desde pool;
- reorder;
- mover entre días;
- eliminar;
- rango por semanas o fecha final;
- preview;
- guardado y activación.

### Touch
SortableJS usa delay táctil, forceFallback y feedback chosen/ghost.

### UX ideal iPhone
- un día visible;
- swipe entre días;
- botón “+” abre catálogo como bottom sheet;
- long-press/reorder dentro del día;
- targets de drop grandes;
- autoscroll.

Mantener siempre `plannerDraft[dow]` y contratos de escenarios.

## Agenda

### Objetivo
Lectura cronológica y ejecución.

### Buen uso
- revisar lo de hoy/semana;
- confirmar Hecho/Pendiente;
- filtrar plataforma.

### Escalabilidad
Si la cantidad de filas crece significativamente, usar event delegation y windowing.

## Feeds

### Objetivo
Simular la estrategia desde la perspectiva de la plataforma.

### Realista
Cada plataforma tiene una estructura propia.

### Zoom-out
Debe medir y escalar la MISMA superficie realista. No crear otro dataset ni otra representación.

### Mapa compacto
Vista alternativa resumida.

### Riesgo técnico
Horizontes largos pueden producir mucho DOM. V12 limita el render inicial de escenarios largos y permite cargar el rango completo.

### Evolución futura
- dataset derivado memoizado;
- IntersectionObserver;
- windowing por días/grupos;
- evitar listeners por post.

## Biblioteca

### Objetivo
Administrar el sistema editorial, no mostrar un formulario gigante permanente.

### Áreas
- Contenido.
- Pilares.
- Familias.
- Marcas.
- Historial.
- Cloud.

### Regla
Render ≠ mutación. Abrir una tab no debe guardar ni sincronizar si el usuario no cambió nada.

## Producción · Hecho/Pendiente

### Objetivo
Saber si el asset maestro fechado ya está producido.

### Regla
No duplicar el estado por red. Una pieza distribuida a Instagram + TikTok + LinkedIn comparte estado del asset maestro.

### Key conceptual
`brandId | scenarioId | date | identity`

Identity prioriza:
`masterKey || instanceId || templateId || id || title`

## Escenarios y rangos

### Rango
- `weeks`: fecha inicial + N semanas.
- `end`: fecha inicial + fecha final.

### Escenario guardado
Conserva:
- id;
- name;
- brandId;
- createdAt;
- range;
- slots.

## Undo / Redo

Históricamente usa snapshots completos con límite de 60. V12 asegura sync después de restore. A futuro conviene migrar a patches/commands para reducir memoria.

## Cloud / Supabase

### Flujo
UI inmediata → localStorage → debounce → upsert JSONB → Realtime.

### Debilidades conocidas
- payload completo;
- last-write-wins;
- sin merge multi-device;
- sin outbox durable.

No normalizar la DB durante una mejora visual ordinaria.
