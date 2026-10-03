# AI START HERE · Editorial OS

Este archivo es el punto de entrada obligatorio para cualquier IA que vaya a analizar, mantener, mejorar o publicar Editorial OS.

## 1. Qué es Editorial OS

Editorial OS es una PWA editorial multi-marca pensada para planificar, simular, revisar y operar un sistema de contenido 360 desde iPhone, iPad y desktop. No es un dashboard genérico: debe sentirse como una aplicación profesional de producción editorial y creator tooling.

Funciones principales:
- Home / Dashboard operativo.
- Calendario semana/mes.
- Franjas / resource lanes.
- Emulador editorial tipo Kanban.
- Agenda.
- Feeds simulados de Instagram, Facebook, TikTok, YouTube y LinkedIn.
- Biblioteca global de pilares, familias, tipos de contenido, marcas e historial.
- escenarios con rango temporal.
- estado de producción Hecho / Pendiente.
- Undo / Redo.
- Supabase Auth + estado cloud.
- PWA instalable desde GitHub Pages.

## 2. Regla principal

Antes de modificar código:
1. Lee este archivo.
2. Lee `README.md`.
3. Lee `docs/PRODUCT_SPEC.md`.
4. Lee `docs/FEATURES_AND_USE_CASES.md`.
5. Lee `docs/ARCHITECTURE.md`.
6. Lee `docs/DATA_CONTRACTS.md`.
7. Lee `docs/VISUAL_REFERENCE_SPEC.md`.
8. Lee `docs/REFERENCES.md`.
9. Lee `docs/ROADMAP.md`.
10. Lee `docs/RELEASE_AND_QA.md`.
11. Lee `AI_MASTER_PROMPT.md` si la tarea es crear una nueva versión.

Después inspecciona el código real. No asumas que la documentación está más actualizada que el código.

## 3. Fuente de verdad técnica

Repositorio:
- `https://github.com/LordJeferies/editorial-os`
- rama principal: `main`
- GitHub Pages: `https://lordjeferies.github.io/editorial-os/`

La versión documentada al crear este handoff es V12.

Stack intencional:
- HTML5 estático.
- CSS.
- JavaScript vanilla.
- módulos ES donde aportan valor.
- sin React/Vue/Svelte.
- sin Vite/Webpack.
- sin build step obligatorio.
- GitHub Pages.
- Supabase JS v2 por CDN.
- SortableJS para drag táctil.
- LiquidGlass WebGL real para chrome selectivo.

No migres a un framework pesado salvo que exista una justificación técnica demostrable y el cambio incluya una estrategia de migración, rollback y compatibilidad PWA.

## 4. Contratos que NO se rompen sin migración explícita

LocalStorage:
- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`

Cloud:
- tabla `public.editorial_state`
- workspace `editorial-os`
- payload legacy compatible, incluyendo `version:9`

Identidad:
- IDs existentes de marcas.
- IDs de pilares.
- IDs de familias.
- IDs de templates.
- `brand.enabledContentIds`.
- semántica de `completion`.
- representación de slots y rangos de escenarios.

Archivo sensible a preservar durante upgrades:
- `supabase-config.js`

No insertar en frontend o repo:
- service_role.
- secret key administrativa.
- PAT.
- contraseña de base de datos.
- contraseña del usuario.

## 5. Principios de producto

Orden de prioridad:
1. fluidez.
2. ergonomía iPhone/iPad.
3. claridad.
4. estabilidad.
5. Liquid Glass correcto.
6. calendario/Kanban.
7. estética.
8. nuevas funciones.

La app ya tiene suficiente superficie funcional. No añadir módulos sólo por añadirlos. Mejorar el flujo real de trabajo.

## 6. Principios de interacción

- UI local-first y optimista.
- tap → cambio visual inmediato.
- persistencia local → sync cloud en background.
- nunca bloquear UI esperando Supabase para una edición local.
- renderizar sólo la vista activa.
- invalidación selectiva.
- memoizar datos derivados costosos.
- virtualizar/windowing cuando el horizonte crece.
- progressive disclosure: contenido primero, herramientas después.
- mínimo táctil recomendado: 44 × 44 px.
- safe areas.
- `100dvh` / `visualViewport` para iOS.
- iPhone no puede ser desktop comprimido.
- iPad portrait necesita composición explícita.

## 7. Material visual

Las imágenes originales de referencia fueron entregadas durante el diseño de V12. Como esas imágenes pueden no estar disponibles para otro chat, `docs/VISUAL_REFERENCE_SPEC.md` contiene la traducción técnica de esas referencias: proporciones, tokens, materiales, grids, cards, glass, tipografía, motion, dock, sheets, calendarios y editor-like layouts.

Si se necesitan coincidencias pixel-perfect con una captura concreta y esa captura no está disponible en el chat actual, pedir al usuario que la adjunte. No inventar detalles ausentes.

## 8. Qué debe hacer una IA al crear V13/V14/etc.

1. Determinar la versión real en `main` y la publicada.
2. Leer la documentación de continuidad.
3. Auditar los contratos de datos.
4. Perfilar los hotspots reales antes de optimizar.
5. Revisar referencias externas actuales y sus licencias.
6. Implementar una versión funcional, no sólo una propuesta.
7. Validar JS, HTML, Bash, manifest, SW, IDs, responsive y compatibilidad.
8. Entregar:
   - `EDITORIAL_OS_VXX_PWA.zip`
   - `EDITORIAL_OS_VXX.html`
   - changelog
   - script de upgrade que preserve `.git` y `supabase-config.js`
   - instrucciones de Terminal para Mac
   - actualización de documentación de continuidad

## 9. Definición de terminado

Una versión NO está terminada porque “se ve mejor”. Debe:
- cargar sin errores de consola críticos;
- mantener datos anteriores;
- mantener login/sync;
- responder correctamente a iPhone ~390 y ~430 px;
- funcionar en iPad portrait/landscape;
- funcionar en desktop;
- permitir navegación y scroll sin superficies cortadas;
- mantener la semántica de calendarios, escenarios, feeds y Hecho/Pendiente;
- cambiar el cache del Service Worker para la versión nueva;
- incluir rollback/backup en el script de instalación.
