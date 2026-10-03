# Editorial OS V12.5 · Simplified Mobile + Feed Repair + LinkedIn L2

## Objetivo

V12.5 simplifica la interfaz móvil sin cambiar la arquitectura estática de GitHub Pages ni los contratos de datos. Se centra en tres problemas concretos observados en uso real en iPhone:

1. el mockup de Instagram podía cortar la tercera columna;
2. demasiados controles estaban visibles simultáneamente;
3. LinkedIn L2 estaba interpretándose como sustitución parcial del plan base, cuando debe ser una capa adicional.

## Instagram Feed

- el shell móvil usa `box-sizing:border-box`;
- el mockup nunca puede crecer más que el espacio disponible;
- `ig-real-grid` usa `repeat(3,minmax(0,1fr))`;
- cada tile usa `min-width:0` y `overflow:hidden`;
- medios y labels ya no pueden imponer un ancho intrínseco que rompa el grid;
- el mismo arreglo aplica tanto a móvil como desktop;
- Zoom-out sigue trabajando sobre la superficie realista, no sobre un dataset alternativo.

Resultado esperado: siempre se ven las tres columnas completas dentro del mockup de Instagram.

## LinkedIn L2 aditivo

LinkedIn ahora se calcula en capas:

```text
LinkedIn base histórico
+ cualquier pieza del plan general que ya apunte a LinkedIn
+ línea LinkedIn L2
= publicaciones totales de LinkedIn
```

Se preserva la línea histórica:

- lunes: Carrusel del podcast;
- martes: Carrusel principal JOC;
- miércoles: Video importante;
- jueves: Carrusel del invitado/lanzamiento.

Además se conserva cualquier otra pieza del plan base que ya llegue a LinkedIn, como testimonios o eventos.

La línea L2 es nueva y NO reemplaza nada.

### L2 adicional · 4/semana

- lunes: Nota · aprendizaje del podcast;
- martes: Documento/carrusel · framework del podcast;
- jueves: Video · insight del episodio;
- viernes: Nota · cierre/contrapunto de la semana.

### L2 adicional · 7/semana

Incluye lo anterior y suma:

- miércoles: Nota de autoridad;
- sábado: Documento checklist/diagnóstico;
- domingo: Video caso/reflexión.

Los L2 usan `masterKey` propio y `sourceMasterKey` para preservar la relación con su fuente sin hacer que la deduplicación elimine la pieza adicional.

## Interfaz móvil simplificada

### Navegación global

Se mantiene una barra inferior de cinco destinos:

- Hoy;
- Calendario;
- Plan;
- Feeds;
- Biblioteca.

Agenda, Franjas, Cloud, Diagnóstico, preferencias e Import/Export permanecen en menús secundarios.

### Planificador

- la pantalla principal mantiene el día activo como superficie central;
- `+` abre Catálogo;
- `•••` abre acciones contextuales;
- Configuración, Vista previa y Escenarios se agrupan en el menú del Planificador;
- la ficha ofrece Ver detalles, Mover, Subir, Bajar y Quitar;
- drag no es la única forma de mover contenido.

### Feeds

En móvil quedan visibles sólo:

- selector de plataforma;
- botón Ajustes;
- simulación.

Plataforma, vista, dispositivo y horizonte se gestionan desde sheets dedicadas.

### Biblioteca

Se elimina visualmente la tira de seis tabs en iPhone. La Biblioteca se organiza mediante secciones:

```text
Contenido
Estrategia
  ├─ Pilares
  └─ Familias
Marcas
Sistema
  ├─ Historial
  ├─ Nube
  └─ Diagnóstico
```

La lógica y los paneles originales siguen siendo los mismos; la nueva UI sólo cambia cómo se llega a ellos.

## Arquitectura

- `app-core.js` continúa siendo el motor de dominio;
- `v124-store.js` continúa como store UI reactivo y batched;
- `v125-runtime.js` sustituye `v124-runtime.js` como compositor móvil;
- `v125.css` es la capa visual final de V12.5;
- no se añadió un segundo virtual DOM encima del renderer existente;
- GitHub Pages y la app siguen siendo estáticos.

## Compatibilidad preservada

Sin cambios destructivos en:

- `jocEditorialV9`;
- `jocEditorialV9AppData`;
- `jocEditorialV9Scenarios`;
- `jocEditorialV9Cloud`;
- `public.editorial_state`;
- workspace `editorial-os`;
- payload cloud legacy `version:9`;
- completion;
- scenario slots/ranges;
- IDs existentes del catálogo.

## PWA

Cache nuevo:

```text
editorial-os-v12-5
```

Incluye `css/v125.css` y `js/v125-runtime.js` en el precache.
