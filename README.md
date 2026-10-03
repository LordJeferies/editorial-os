# Editorial OS V10

PWA editorial multi-marca para GitHub Pages + Supabase.

## Qué viene cargado

Una instalación nueva ya trae el catálogo JOC que venimos definiendo:
Memes, Podcast, Webinar, Testimonios, Reacciones, Carruseles, LinkedIn L2,
Filosofando, Lifestyle/Voiceover y formatos específicos de YouTube.

Consulta `DEFAULT_JOC_CATALOG.md`.

Eso significa que **no tienes que volver a crear esos tipos**.

Lo que no existe automáticamente es un historial retroactivo de archivos finales ya producidos:
la aplicación no puede adivinar qué Reel o carrusel anterior ya estaba terminado.
Desde V10 puedes llevar ese control con **Hecho / Pendiente** por fecha.

## Novedades V10

### Producción
Cada contenido fechado puede marcarse:
- `Pendiente`
- `✓ Hecho`

El check aparece en:
- calendario;
- mes;
- franjas;
- agenda;
- feeds realistas;
- zoom-out;
- mapa compacto;
- Home;
- vista de emulación.

El estado es del **asset maestro** de esa fecha, por lo que la misma pieza aparece hecha
en todas las redes a las que se distribuye.

### Rango de emulación
Antes de pulsar `Emular` o `Guardar emulación` puedes elegir:

- fecha inicial;
- `N` semanas; o
- una fecha final concreta.

Una emulación solo genera contenido dentro de ese rango.

Ejemplos:
- 5 oct → 4 semanas;
- 1 nov → 30 nov;
- 15 ene → 8 semanas.

Las emulaciones guardadas muestran:
- rango;
- piezas por semana;
- piezas totales;
- cuántas están hechas;
- barra de progreso.

### Catálogo inicial
JOC empieza con los tipos ya definidos.
Las nuevas marcas pueden seleccionar contenidos del repositorio global o crear otros nuevos.

## Instalación desde cero en Mac

1. Descomprime `EDITORIAL_OS_V10_FRESH.zip`.
2. Entra a la carpeta.
3. Ejecuta:

```bash
chmod +x *.sh INSTALL_FROM_ZERO.command
./install_from_zero.sh
```

También puedes hacer doble clic en `INSTALL_FROM_ZERO.command`.

El instalador:
- comprueba Git/Homebrew;
- instala GitHub CLI si hace falta;
- instala Supabase CLI si hace falta;
- inicia sesión en GitHub;
- opcionalmente configura Supabase;
- crea el repo público;
- hace el primer push;
- activa GitHub Pages.

## Supabase

Si ya tienes un proyecto Supabase:

```bash
./setup_supabase.sh
```

El script:
1. inicia sesión;
2. muestra tus proyectos;
3. pide el Project Ref;
4. vincula el proyecto;
5. ejecuta `supabase_schema.sql`;
6. activa RLS/Realtime;
7. obtiene Project URL + publishable/anon key;
8. genera `supabase-config.js`.

La información editorial, estados Hecho/Pendiente, marcas y emulaciones se guardan
dentro del payload sincronizado.

## Probar localmente

```bash
./start_local.sh
```

Abre:

```text
http://localhost:8080
```

## Publicar una actualización

Si editaste los archivos actuales:

```bash
./publish_update.sh
```

Si recibes una versión nueva de `index.html`:

```bash
./publish_update.sh "/ruta/a/index.html" "Actualiza Editorial OS"
```

También acepta un ZIP.

## Crear el repo público sin el instalador completo

```bash
./setup_and_deploy.sh editorial-os
```

## iPhone

Después de que GitHub Pages esté publicado:

1. abre la URL en Safari;
2. Compartir;
3. Añadir a pantalla de inicio.

La PWA incluye:
- Home;
- Calendario;
- Emulador;
- Feeds;
- Biblioteca;
- Mobile/Desktop/Auto;
- vista Realista;
- Zoom-out;
- Mapa compacto.

Con Supabase, Mac y iPhone usan el mismo estado al iniciar sesión con el mismo usuario.

## Seguridad

`supabase-config.js` solo debe contener la Project URL y una publishable/anon key.
No pongas una `service_role` key en una aplicación pública.
La protección de datos depende de Supabase Auth + RLS, configurados por `supabase_schema.sql`.

## V11 · rendimiento + iPhone

- Solo se renderiza la vista activa; navegar ya no reconstruye todas las pantallas.
- El render dejó de escribir en Supabase.
- LiquidGlass usa roots pequeños para header/dock y ya no rasteriza toda la app.
- `visualViewport` + 100dvh corrige el viewport standalone de iPhone.
- Bottom dock está en flujo, no fixed.
- Semana móvil = carrusel scroll-snap; mes móvil = celdas compactas.
- Kanban táctil usa SortableJS.
- Franjas, biblioteca, feeds y emulador permiten pan horizontal real.

## Repositorios usados en V11

- `ybouane/liquidglass`: WebGL Liquid Glass. V11 aísla el header y el dock en roots
  pequeños para evitar rasterizar calendarios/feeds enteros.
- `SortableJS/Sortable`: drag & drop táctil para el Kanban.
- `RhysSullivan/nextjs-mobile-app-template`: patrón iOS PWA de viewport `dvh`,
  bottom nav en flujo y panes móviles.
- `kotapullarao/calendar-planner`: referencia de calendario PWA vanilla y rendering
  eficiente.

La aplicación sigue siendo HTML/JS estático para conservar GitHub Pages + Supabase.
