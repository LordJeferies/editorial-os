# Prompt maestro para CREAR la siguiente versión de Editorial OS

> Este prompt no es para pedir un diagnóstico. Es para iniciar el trabajo completo de la siguiente versión.
>
> **Úsalo en ChatGPT Work, Codex o cualquier entorno que tenga acceso al repositorio, archivos, terminal y posibilidad de generar entregables.**
>
> Si el chat actual no tiene esas capacidades, NO debe dedicar la respuesta a repetir un análisis de solo lectura. Debe indicar de forma breve que necesita pasar a Work/Codex y continuar allí con este mismo encargo.

---

## PROMPT

Quiero que **CREES la siguiente versión funcional de Editorial OS ahora mismo** partiendo del estado REAL actual del repositorio.

No quiero únicamente que leas la documentación, audites el proyecto o me digas qué harías. La lectura inicial es sólo el paso 0. Después debes **modificar el código, probarlo, empaquetarlo y entregarme la nueva versión**.

Repositorio fuente de verdad:
`https://github.com/LordJeferies/editorial-os`

PWA publicada:
`https://lordjeferies.github.io/editorial-os/`

## REGLA DE EJECUCIÓN

Tu trabajo en esta tarea termina únicamente cuando hayas realizado, en este orden:

```text
INSPECCIONAR
↓
PLANEAR CAMBIOS CONCRETOS
↓
EDITAR EL CÓDIGO REAL
↓
PROBAR / VALIDAR
↓
CORREGIR FALLOS
↓
GENERAR LA NUEVA VERSIÓN
↓
EMPAQUETAR ZIP + HTML
↓
GENERAR SCRIPT DE ACTUALIZACIÓN
↓
ACTUALIZAR DOCUMENTACIÓN
↓
ENTREGAR LOS ARTEFACTOS Y COMANDOS DE TERMINAL
```

**No te detengas después de INSPECCIONAR o PLANEAR.**

Si tu entorno actual sólo permite lectura web y no permite archivos/terminal/escritura:

1. no hagas una auditoría extensa para terminar diciendo que no puedes implementar;
2. pide o activa inmediatamente un entorno con ejecución, preferentemente **ChatGPT Work o Codex**;
3. continúa allí esta misma tarea;
4. conserva este prompt y el contexto ya leído;
5. no me pidas que vuelva a explicar el producto.

No presentes como resultado final frases del tipo:
- “no he modificado el repositorio”;
- “no puedo generar los archivos”;
- “aquí tienes un análisis para que otro entorno lo haga”;

salvo que sea técnicamente imposible pasar a un entorno de ejecución. El objetivo de este prompt es precisamente **producir la siguiente versión**.

---

# 0. ARRANQUE RÁPIDO

Primero determina la versión actual en `main` y calcula automáticamente el número de la siguiente versión.

Ejemplo:
- si `main` es V12 → crea V13;
- si ya es V13 → crea V14;
- no asumas el número por el nombre de un archivo aislado.

Crea al inicio una rama de trabajo tipo:

```text
editorial-os-vNEXT
```

o trabaja en un checkout aislado si tu entorno lo gestiona así.

No modifiques `main` antes de tener una versión validada.

---

# 1. LECTURA OBLIGATORIA, PERO BREVE Y ORIENTADA A IMPLEMENTAR

Lee en este orden:

1. `AGENTS.md`
2. `docs/AI_START_HERE.md`
3. `README.md`
4. `docs/PRODUCT_SPEC.md`
5. `docs/FEATURES_AND_USE_CASES.md`
6. `docs/ARCHITECTURE.md`
7. `docs/DATA_CONTRACTS.md`
8. `docs/VISUAL_REFERENCE_SPEC.md`
9. `docs/REFERENCES.md`
10. `docs/ROADMAP.md`
11. `docs/RELEASE_AND_QA.md`
12. último `CHANGELOG_*.md`
13. código real de `index.html`, `css/`, `js/`, `sw.js`, `manifest.webmanifest` y scripts de deploy.

Si una lectura aparece truncada en la interfaz, usa herramientas de archivos/GitHub para leerla por rangos o directamente desde el checkout. **No consideres una lectura truncada como motivo para detener la implementación.**

Después inspecciona el código real y verifica que documentación e implementación coincidan. Si difieren, usa el código como fuente técnica de verdad y actualiza la documentación al terminar.

La inspección inicial debe desembocar inmediatamente en una lista corta de cambios que vas a implementar en esta versión y después empezar a editar.

---

# 2. NO ROMPER CONTRATOS DE DATOS

Mantén compatibilidad con:

- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`
- `public.editorial_state`
- workspace `editorial-os`
- IDs existentes de brands/pillars/families/templates
- `brand.enabledContentIds`
- completion keys
- scenarios/range/slots
- payload cloud legacy compatible, incluyendo `version:9` mientras siga vigente

Preserva el `supabase-config.js` real durante cualquier actualización.

No pidas ni pongas en frontend/repo:

- `service_role`
- secret keys
- PAT
- database password
- contraseña del usuario

Si una mejora exige cambiar un contrato, implementa primero una migración backward-compatible y reversible.

---

# 3. OBJETIVO DEL PRODUCTO

Editorial OS es una PWA editorial multi-marca para operar un sistema real de contenido 360 desde iPhone, iPad y desktop.

Debe conservar y mejorar:

- Home / dashboard operativo
- Calendario semana/mes
- Franjas / resource lanes
- Emulador editorial / Kanban
- Agenda
- Feeds Instagram / Facebook / TikTok / YouTube / LinkedIn
- Biblioteca
- Pilares
- Familias
- Tipos de contenido
- Marcas
- Historial
- Supabase
- Undo/Redo
- escenarios con rango temporal
- tracking Hecho/Pendiente

No conviertas Editorial OS en un dashboard SaaS genérico.

Prioridad global:

```text
1. fluidez
2. ergonomía iPhone/iPad
3. claridad
4. estabilidad
5. Liquid Glass correcto
6. calendario / Kanban
7. estética
8. nuevas funciones
```

---

# 4. ESTA VERSIÓN DEBE MEJORAR DE VERDAD LA APP

No hagas sólo cambio de número, colores o documentación.

Analiza el código y aplica mejoras reales donde tengan mayor impacto. Usa `docs/ROADMAP.md` como base, pero no como límite.

Entre los puntos que debes evaluar y, cuando proceda, mejorar están:

- render selectivo por vista;
- memoización de datos derivados;
- feeds con horizontes largos y DOM excesivo;
- listeners individuales vs event delegation;
- iPad portrait;
- Franjas táctiles;
- Kanban iPhone;
- progressive disclosure;
- bottom sheets;
- safe areas;
- `100dvh` / `visualViewport`;
- navegación inferior;
- Undo/Redo;
- sincronización local-first;
- sincronización innecesaria durante render;
- conflictos multi-device;
- offline/retry;
- Service Worker y actualización de versión;
- consistencia visual y design tokens;
- reducción progresiva de CSS legacy;
- accesibilidad y touch targets.

No tienes obligación de implementar todos esos puntos en una sola versión. Debes elegir un conjunto coherente de mejoras de alto impacto, implementarlas bien y documentar lo pendiente.

---

# 5. CONTRATO VISUAL

Lee `docs/VISUAL_REFERENCE_SPEC.md` como sustituto persistente de las referencias visuales originales que el usuario subió.

La app debe sentirse como una combinación de:

- app iOS profesional;
- creator tool;
- editor/productivity tool;
- interfaz editorial minimalista;
- superficies black/white/off-white;
- cards grandes;
- pills;
- dock inferior;
- sheets/drawers;
- controles contextuales;
- esquinas amplias;
- jerarquía tipográfica clara;
- colores funcionales, no decorativos;
- motion corto y físico.

No basta con añadir `border-radius` + `backdrop-filter`.

## Mobile

Diseña y prueba primero:

- 390 px
- 430 px

Debe haber:

- safe areas reales;
- targets >=44 px;
- ningún elemento cortado;
- scroll horizontal sólo donde tenga intención clara;
- calendario móvil específico;
- toolbars secundarias en sheets o progressive disclosure;
- dock usable con una mano;
- feedback inmediato al tap.

## iPad

Trata iPad explícitamente. No lo conviertas automáticamente en desktop sólo por superar 760 px.

## Desktop

Puede tener mayor densidad, sidebar/inspector y composición más amplia sin parecer un iPhone estirado.

---

# 6. LIQUID GLASS

Usa la implementación real ybouane/liquidglass sólo donde aporte valor.

Reglas:

- roots pequeños;
- top bar/dock/hero controls/overlays concretos;
- nunca envolver calendario, feed o biblioteca completos;
- lifecycle idempotente;
- destruir/recrear cuando cambie breakpoint/theme si es necesario;
- respetar dispositivos lentos y reduced transparency;
- evitar decenas de instancias WebGL.

---

# 7. REFERENCIAS EXTERNAS A INVESTIGAR Y APROVECHAR

Revisa las versiones actuales, licencias y patrones relevantes antes de implementar:

## Liquid Glass
- https://github.com/ybouane/liquidglass
- https://liquid-glass.ybouane.com

## Calendarios
- https://github.com/kcsujeet/ilamy-calendar
- https://www.calendarkit.io
- https://github.com/kotapullarao/calendar-planner
- https://github.com/schedule-x/schedule-x

## Drag/touch
- https://github.com/SortableJS/Sortable

## PWA/mobile shell
- https://github.com/RhysSullivan/nextjs-mobile-app-template

## 21st.dev
- https://21st.dev
- https://21st.dev/community/components
- https://21st.dev/community/components/explore/shadcn-bottom-navigation
- https://21st.dev/community/components/explore/liquid-glass-components
- https://21st.dev/community/components/explore/liquid-glass-ui-components
- https://21st.dev/community/components/explore/calendar-component
- https://21st.dev/community/components/explore/shadcn-event-calendar
- https://news.21st.dev/blog/react-mobile-navigation-components

Puedes adaptar patrones, estructuras, CSS, geometría, interacción y código compatible cuando la licencia lo permita.

No introduzcas React/Tailwind/Next sólo porque una referencia los use. Reproduce el comportamiento y diseño dentro del stack actual cuando eso sea técnicamente más sensato.

---

# 8. RENDIMIENTO

No hacer:

- render global de todas las vistas;
- persistir o sincronizar por efecto colateral de un render;
- crear feeds de cientos de posts invisibles;
- recalcular repetidamente la misma derivación editorial;
- WebGL en listas grandes;
- cientos de `backdrop-filter`;
- bloquear una mutación local esperando Supabase;
- añadir librerías pesadas sin demostrar necesidad.

Hacer:

- local-first;
- optimistic UI;
- render de vista activa;
- invalidación selectiva;
- memo/selectors;
- event delegation cuando convenga;
- lazy/windowing/IntersectionObserver;
- requestAnimationFrame donde aporte valor;
- cloud sync en background y debounced;
- feedback inmediato de tap/drag.

---

# 9. FUNCIONES QUE DEBEN SEGUIR OPERATIVAS

## Feeds
- Realista
- Zoom-out = MISMA vista realista escalada
- Mapa compacto
- Auto / Mobile / Desktop

## Calendario
- mobile week mediante swipe/day pages
- mobile month compacto
- desktop week/month completos

## Emulador/Kanban
- pool
- search/filter
- clone
- reorder
- move entre días
- delete
- range
- save/activate scenario

## Producción
- Hecho/Pendiente pertenece al asset maestro fechado, no a cada duplicado de red

## Cloud
- autenticación
- pull/push
- realtime
- estado local primero

## Utilidades
- Undo/Redo
- import/export
- theme
- escenarios guardados
- biblioteca multi-marca

---

# 10. ARQUITECTURA

Mantén una instalación simple compatible con GitHub Pages.

Si el proyecto sigue funcionando bien como HTML/CSS/JS modular sin build step, conserva esa ventaja.

Prefiere:

```text
index.html
css/
js/
docs/
manifest.webmanifest
sw.js
```

antes que introducir un framework grande sin una razón técnica demostrable.

Refactoriza incrementalmente. No hagas big-bang rewrite.

---

# 11. IMPLEMENTACIÓN: NO PARAR HASTA TENER BUILD ENTREGABLE

Después de la auditoría:

1. realiza los cambios en archivos reales;
2. ejecuta la app localmente;
3. corrige errores de consola;
4. prueba navegación y flujos;
5. prueba responsive;
6. actualiza manifest y SW al nuevo número de versión;
7. genera changelog;
8. actualiza README/docs;
9. genera HTML standalone de entrega si el proyecto lo mantiene;
10. genera ZIP completo;
11. genera script de actualización sobre repo existente;
12. prueba el script en una copia/repositorio temporal cuando sea posible.

---

# 12. QA OBLIGATORIO

Antes de declarar terminada la versión ejecuta y reporta:

- `node --check` o validación equivalente de todo JS;
- `bash -n` de scripts;
- validación JSON de manifest;
- IDs duplicados;
- referencias CSS/JS rotas;
- Service Worker y cache name nuevo;
- localStorage legacy;
- escenarios;
- completion;
- preservación de `supabase-config.js`;
- iPhone 390 px;
- iPhone 430 px;
- iPad portrait;
- iPad landscape;
- desktop 1024;
- desktop 1440+;
- light/dark;
- PWA standalone;
- Feed Realista;
- Feed Zoom-out;
- Feed Mapa compacto;
- Kanban touch;
- Calendario week/month;
- Undo/Redo;
- import/export.

No declares una validación que no hayas ejecutado.

---

# 13. ENTREGA OBLIGATORIA

La respuesta final debe incluir artefactos REALES:

1. `EDITORIAL_OS_VNEXT_PWA.zip`
2. `EDITORIAL_OS_VNEXT.html`
3. `CHANGELOG_VNEXT.md`
4. README/documentación actualizados
5. `deploy_vNEXT_over_existing.sh`
6. resultados de QA
7. código exacto de Terminal para actualizar desde Mac
8. ruta/commit/branch de trabajo si hubo cambios en GitHub

El script de actualización debe:

- crear backup de la versión anterior;
- preservar `.git`;
- preservar `supabase-config.js`;
- preservar datos existentes;
- copiar la nueva versión;
- validar archivos críticos;
- permitir commit/push sólo después de instalar correctamente.

Usa un nuevo nombre de cache en el Service Worker para evitar que iOS siga sirviendo assets viejos.

---

# 14. GITHUB

Si tienes escritura:

- trabaja primero en branch o checkout aislado;
- no sobrescribas `main` prematuramente;
- cuando todo pase QA, deja commit coherente;
- si el usuario pidió actualizar `main`, hazlo al final;
- no publiques secretos.

Si sólo tienes lectura de GitHub pero sí tienes terminal/archivos, clona el repo, crea los artefactos localmente y entrégalos igualmente.

---

# 15. RESPUESTA FINAL

No cierres con una lista de cosas que otra IA debería hacer.

Cierra únicamente después de haber creado la versión y proporciona:

```text
VERSIÓN CREADA:
CAMBIOS PRINCIPALES:
VALIDACIONES EJECUTADAS:
ZIP:
HTML:
SCRIPT DE UPDATE:
COMMIT/BRANCH:
COMANDOS DE TERMINAL:
```

Si surgió una limitación menor, documenta qué prueba concreta quedó pendiente, pero entrega todo lo demás que sí pudiste completar.

## FIN DEL PROMPT
