# Editorial OS V12.20 · iPhone-first

V12.20 cambia la filosofía de arranque móvil: la app debe abrir primero y los servicios secundarios conectarse después.

## Cambios principales

- La PWA ya no inicia en una página de recuperación. `start_url` apunta directamente a Editorial OS.
- `launch.html` queda como compatibilidad y redirige inmediatamente a la app real.
- `repair.html` concentra la reparación manual de caché/Service Worker sin borrar contenido local ni Supabase.
- Nuevo runtime `js/v1220-mobile.js` para iPhone/PWA:
  - estado `Local listo` / nube,
  - modo Safari o PWA,
  - instrucciones de instalación,
  - copiar/compartir link con fallback,
  - reparación accesible,
  - bloqueo de overlays de carga antiguos,
  - Planner móvil con Agenda como vista inicial en el primer arranque móvil,
  - registro diferido del Service Worker.
- Nuevo `css/v1220-mobile.css`:
  - safe areas de iPhone,
  - bottom dock estable,
  - touch targets >= 44 px,
  - inputs de 16 px para evitar zoom accidental,
  - menos desbordes horizontales,
  - drawers como bottom sheets,
  - Planner y controles adaptados a touch,
  - dashboard de una columna/dos columnas según el componente.
- Service Worker V12.20:
  - caché `editorial-os-v12-20`,
  - instalación ligera con shell mínimo,
  - ya no intenta precargar toda la app durante la instalación,
  - navegación `network-first` con timeout y fallback local,
  - limpieza automática sólo de caches antiguas de Editorial OS.
- Supabase y Sortable siguen siendo opcionales durante el arranque. La interfaz local no debe esperar a esos servicios.

## Criterio móvil

1. Interfaz primero.
2. Trabajo local disponible aunque la nube tarde.
3. Nube visible como estado, no como pantalla bloqueante.
4. Todo gesto avanzado debe tener alternativa táctil.
5. Recovery es una herramienta manual, no la puerta de entrada normal.

## URLs

- App: `https://lordjeferies.github.io/editorial-os/`
- Reparación: `https://lordjeferies.github.io/editorial-os/repair.html`
- Launcher legado: `https://lordjeferies.github.io/editorial-os/launch.html`
