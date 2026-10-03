# Prompt maestro para continuar Editorial OS desde cualquier chat de IA

Copia desde `PROMPT` hasta `FIN DEL PROMPT` en el chat que vaya a crear la siguiente versión.

---

## PROMPT

Quiero que continúes el desarrollo de **Editorial OS** desde el estado REAL actual del repositorio y entregues una nueva versión funcional completa, no sólo recomendaciones.

Repositorio fuente de verdad:
`https://github.com/LordJeferies/editorial-os`

PWA publicada:
`https://lordjeferies.github.io/editorial-os/`

### 1. PRIMERO: LEE Y AUDITA

Antes de tocar código, inspecciona el repo actual y determina:
- versión real en `main`;
- commit HEAD;
- versión que declara manifest/SW/index;
- estructura actual;
- si la app publicada parece corresponder al repo.

Lee en este orden:
1. `docs/AI_START_HERE.md`
2. `README.md`
3. `docs/PRODUCT_SPEC.md`
4. `docs/FEATURES_AND_USE_CASES.md`
5. `docs/ARCHITECTURE.md`
6. `docs/DATA_CONTRACTS.md`
7. `docs/VISUAL_REFERENCE_SPEC.md`
8. `docs/REFERENCES.md`
9. `docs/ROADMAP.md`
10. `docs/RELEASE_AND_QA.md`
11. `CHANGELOG_V12.md` y changelogs posteriores si existen.

Después inspecciona el código real. Si documentación y código difieren, indícalo y usa el código como fuente de verdad técnica, preservando contratos existentes.

### 2. NO ROMPAS LOS DATOS

Debes mantener compatibilidad con:
- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`
- `public.editorial_state`
- workspace `editorial-os`
- IDs de brands/pillars/families/templates
- `brand.enabledContentIds`
- completion keys
- scenarios/range/slots
- payload cloud legacy compatible, incluyendo `version:9` si sigue vigente.

Preserva el `supabase-config.js` real del repo/instalación.

NO pidas ni pongas en frontend/repo:
- service_role;
- secret key;
- PAT;
- database password;
- contraseña del usuario.

### 3. OBJETIVO DE PRODUCTO

Editorial OS es una PWA editorial multi-marca con:
- Home;
- Calendario;
- Franjas;
- Emulador/Kanban;
- Agenda;
- Feeds Instagram/Facebook/TikTok/YouTube/LinkedIn;
- Biblioteca;
- Pilares;
- Familias;
- Tipos de contenido;
- Marcas;
- Historial;
- Supabase;
- Undo/Redo;
- escenarios con rango temporal;
- tracking Hecho/Pendiente.

No conviertas el producto en un dashboard SaaS genérico.

Prioridad:
1. fluidez.
2. ergonomía iPhone/iPad.
3. claridad.
4. estabilidad.
5. Liquid Glass correcto.
6. calendario/Kanban.
7. estética.
8. nuevas funciones.

### 4. DISEÑO

Lee `docs/VISUAL_REFERENCE_SPEC.md` como contrato visual derivado de las imágenes originales del usuario.

La aplicación debe sentirse como:
- app iOS profesional;
- creator tool;
- editor/productivity tool;
- minimal editorial;
- cards amplias;
- pills;
- bottom dock;
- sheets/drawers;
- jerarquía clara;
- colores funcionales;
- dark/light surfaces;
- motion corto y físico.

No basta con `border-radius + backdrop-filter`.

Liquid Glass:
- usa la implementación real de ybouane/liquidglass cuando corresponda;
- roots pequeños;
- header/dock/overlays selectivos;
- nunca rasterices el calendario/feed entero.

Mobile:
- iPhone 390/430 px reales;
- safe areas;
- `100dvh` / visualViewport;
- targets >=44 px;
- no elementos cortados;
- no 7 columnas microscópicas;
- secondary tools en sheets/progressive disclosure.

iPad:
- no asumir desktop por estar en 768px;
- diseña una composición explícita.

Desktop:
- puede ser más denso y ancho;
- no debe parecer un iPhone estirado.

### 5. REFERENCIAS EXTERNAS OBLIGATORIAS A ESTUDIAR

Antes de implementar, revisa versiones actuales/licencias/patrones relevantes de:

Liquid Glass:
- https://github.com/ybouane/liquidglass
- https://liquid-glass.ybouane.com

Calendario:
- https://github.com/kcsujeet/ilamy-calendar
- https://www.calendarkit.io
- https://github.com/kotapullarao/calendar-planner
- https://github.com/schedule-x/schedule-x

Drag/touch:
- https://github.com/SortableJS/Sortable

PWA/mobile shell:
- https://github.com/RhysSullivan/nextjs-mobile-app-template

21st.dev:
- https://21st.dev
- https://21st.dev/community/components
- https://21st.dev/community/components/explore/shadcn-bottom-navigation
- https://21st.dev/community/components/explore/liquid-glass-components
- https://21st.dev/community/components/explore/liquid-glass-ui-components
- https://21st.dev/community/components/explore/calendar-component
- https://21st.dev/community/components/explore/shadcn-event-calendar
- https://news.21st.dev/blog/react-mobile-navigation-components

Puedes adaptar estructuras, CSS y patrones compatibles cuando la licencia lo permita. No metas React/Tailwind/Next o un framework enorme sólo para copiar un componente si el proyecto sigue resolviéndose bien como PWA estática.

### 6. RENDIMIENTO

Audita antes de cambiar.

No hacer:
- render global de todas las vistas;
- guardar/sincronizar durante render;
- recrear listeners masivamente sin necesidad;
- crear feeds de cientos de posts invisibles;
- WebGL en listas grandes;
- cientos de `backdrop-filter`;
- esperar Supabase para mostrar una mutación local.

Hacer:
- local-first;
- optimistic UI;
- render active view;
- invalidación selectiva;
- memo de datos derivados;
- event delegation cuando convenga;
- IntersectionObserver/windowing para listas largas;
- requestAnimationFrame donde tenga sentido;
- sync background/debounced.

### 7. FUNCIONALIDAD QUE DEBE CONSERVARSE

Feeds:
- Realista.
- Zoom-out = la MISMA vista realista escalada.
- Mapa compacto.
- Auto/Mobile/Desktop.

Calendario:
- mobile week swipe/day pages.
- mobile month compacto.
- desktop week/month completos.

Emulador:
- pool.
- search/filter.
- clone.
- reorder.
- move entre días.
- delete.
- range.
- save/activate scenario.

Producción:
- Hecho/Pendiente representa asset maestro fechado, no duplicado por plataforma.

### 8. ARQUITECTURA

Mantén una instalación simple compatible con GitHub Pages.

Si el repo sigue sin build step, prefiere ESM estático y módulos pequeños antes que introducir tooling complejo.

Refactoriza incrementalmente. No hagas un big-bang rewrite si puede romper datos o comportamiento.

### 9. TESTS / QA

Antes de empaquetar valida:
- JS con `node --check`;
- Bash con `bash -n`;
- manifest JSON;
- IDs duplicados;
- referencias CSS/JS;
- service worker;
- localStorage legacy;
- escenarios;
- completion;
- Supabase config preservation;
- iPhone 390;
- iPhone 430;
- iPad portrait/landscape;
- desktop 1024/1440+;
- light/dark;
- standalone PWA;
- Feed Realista/Zoom-out/Mapa;
- Kanban touch;
- Undo/Redo;
- import/export.

### 10. ENTREGA OBLIGATORIA

Quiero que IMPLEMENTES la versión siguiente y me entregues:

1. `EDITORIAL_OS_VXX_PWA.zip`
2. `EDITORIAL_OS_VXX.html`
3. `CHANGELOG_VXX.md`
4. README/documentación actualizados
5. script `deploy_vXX_over_existing.sh`
6. código de Terminal exacto para instalar/actualizar desde mi Mac
7. backup/rollback antes de reemplazar la versión anterior
8. validaciones ejecutadas y su resultado

El script debe preservar:
- `.git`
- `supabase-config.js`
- datos existentes

Cambia el cache del Service Worker a la nueva versión para que iOS no se quede usando assets viejos.

Si tienes acceso de escritura al repositorio y te pido actualizarlo, valida primero y realiza un commit coherente. No publiques secretos.

### 11. FORMA DE TRABAJAR

No me devuelvas sólo mockups, pseudocódigo o una lista de recomendaciones. Investiga, modifica el código, prueba y entrega el paquete ejecutable.

Si algo puede resolverse inspeccionando el repo, no me preguntes a mí primero.

Si una decisión implica romper un contrato de datos, entonces sí detente, explícala y propone una migración segura.

## FIN DEL PROMPT
