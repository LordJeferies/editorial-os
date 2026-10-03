# Editorial OS V12.17 · Mobile startup recovery

## Problema corregido

En algunos móviles la página podía quedar visualmente cargada pero sin responder a botones. La causa más peligrosa era que `index.html` cargaba dependencias externas de CDN de forma síncrona antes del engine local. Si una de esas peticiones se demoraba o quedaba pendiente, el HTML ya se veía pero `app-core.js` todavía no había ejecutado sus listeners.

## Cambios

- `supabase-config.js` arranca un recovery runtime local antes de las dependencias externas.
- Si el engine no aparece en 4.2 s, el watchdog redirige automáticamente al safe boot.
- Nuevo `launch.html` con pantalla de carga real y progreso.
- El safe boot carga `index.html`, retira los scripts externos bloqueantes y ejecuta el engine local sin bloquear la interfaz.
- Supabase y Sortable se intentan cargar en background; si tardan, la app puede seguir abriendo en modo local.
- Nuevo `v1217-recovery.js` con fallback de navegación y recuperación de botones de bienvenida.
- El blocker de arranque no puede dejar la app atrapada indefinidamente.
- `manifest.webmanifest` inicia la PWA mediante `launch.html`.
- Service Worker actualizado a cache `editorial-os-v12-17` e incluye launcher + recovery runtime.

## URLs

Normal:

`https://lordjeferies.github.io/editorial-os/`

Safe boot directo:

`https://lordjeferies.github.io/editorial-os/launch.html?v=12.17`

## Criterio

Las dependencias externas no son requisito para pintar o navegar la interfaz. Supabase y Sortable son capacidades adicionales que pueden incorporarse cuando la red esté disponible. Una demora de terceros no debe convertir la aplicación en una pantalla muerta.
