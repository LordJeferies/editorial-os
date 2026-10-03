# Product Spec · Editorial OS

## Visión

Editorial OS es el sistema operativo editorial de una marca o agencia. Convierte una estrategia editorial en un calendario operativo, permite simular distintos escenarios de frecuencia, visualizar cómo se distribuirá el contenido por plataforma y llevar control de producción.

Debe responder a tres preguntas de trabajo:
1. ¿Qué tenemos que publicar y cuándo?
2. ¿Cómo se distribuye esa producción entre formatos, familias y plataformas?
3. ¿Qué ya está hecho, qué está pendiente y qué escenario estamos ejecutando?

## Usuario principal

Productor/editor/estratega de contenido que gestiona una o varias marcas y necesita planificar contenido de Instagram, Facebook, TikTok, YouTube y LinkedIn desde el teléfono y el Mac.

## Conceptos editoriales

### Marca
Contenedor de configuración editorial. JOC es la marca inicial, pero el sistema es multi-marca.

### Pilar
Área estratégica de contenido.

### Familia
Subgrupo operativo dentro de un pilar.

### Tipo de contenido
Plantilla conceptual reutilizable: clip de podcast, carrusel, reacción, meme, video de tesis, etc.

### Lotes L1/L2/L3
Jerarquía/prioridad editorial usada para distribuir piezas y frecuencia.

### Escenario
Simulación guardada de qué contenidos aparecen cada día dentro de un rango temporal.

### Asset maestro fechado
La unidad de producción. El mismo asset puede distribuirse a varias plataformas, pero su estado Hecho/Pendiente se controla una sola vez.

## Marca JOC incluida

La instalación trae un catálogo inicial aproximado de 25 tipos de contenido que cubren:
- memes/microvisuales;
- podcast;
- webinar/autoridad;
- LinkedIn L2;
- series/marca personal;
- prueba social;
- carrusel principal;
- formatos YouTube.

La documentación humana del catálogo está en `DEFAULT_JOC_CATALOG.md`. El catálogo ejecutable está en el código.

## Reglas editoriales JOC relevantes

L1 semanal fijo:
- lunes: Presión vs Foco.
- martes: carrusel principal.
- miércoles: video importante.
- jueves: intro/trailer del podcast.
- viernes: Filosofando con Gigantes.
- sábado: Reacción.
- domingo: Famoso + frase/principio.

Volúmenes históricos contemplados:
- base 7/semana.
- +1 diaria: 14.
- alternancia +1/+2: ~17–18.
- +2 diaria: 21.
- +2/+3 alternado: ~24–25.
- +3 diaria: 28.

YouTube contempla Shorts y horizontales; LinkedIn tiene una familia propia L2 con nota, carrusel/documento y video.

## Modelo mental de navegación

### Home
“¿Qué debo atender ahora?”

Debe priorizar:
- progreso semanal;
- próximos contenidos;
- producción;
- escenarios;
- actividad;
- mix editorial;
- estado cloud.

No debe sentirse como un panel administrativo lleno de KPIs sin jerarquía.

### Calendario
“¿Qué se publica en una fecha?”

- iPhone: día/semana swipeable y mes compacto.
- iPad: composición propia, no desktop comprimido.
- desktop: semana completa y mes operativo.

### Franjas
“¿Cómo se distribuyen familias/recursos durante la semana?”

Es una vista matricial de producción. En móvil debe permitir pan real o evolucionar hacia una representación más operativa por día/semana.

### Emulador
“¿Qué pasa si organizo la semana así?”

Laboratorio editorial tipo Kanban:
- buscar contenido;
- copiar desde pool;
- mover entre días;
- reordenar;
- eliminar;
- guardar escenario;
- emular un rango;
- activar un escenario.

### Agenda
“¿Qué ocurre en secuencia cronológica?”

Vista lista para ejecución/revisión.

### Feeds
“¿Cómo se vería la estrategia en cada red?”

Plataformas:
- Instagram.
- Facebook.
- TikTok.
- YouTube.
- LinkedIn.

Modos:
- Realista: estructura parecida a la plataforma.
- Zoom-out: la MISMA vista realista escalada, no otra visualización.
- Mapa compacto: representación alternativa resumida.

Device simulation:
- Auto.
- Mobile.
- Desktop.

### Biblioteca
“¿De qué está compuesto el sistema editorial?”

Gestiona:
- contenido global/custom;
- pilares;
- familias;
- marcas;
- historial;
- cloud.

## Casos de uso prioritarios

### Caso A · Planear la semana desde iPhone
1. abrir Home.
2. ver próximo contenido y producción.
3. entrar a Calendario.
4. deslizar entre días.
5. abrir una pieza y revisar estado.
6. marcar Hecho cuando el asset maestro está terminado.

### Caso B · Diseñar un nuevo escenario
1. abrir Emulador.
2. elegir fecha inicial y rango.
3. buscar templates del catálogo.
4. clonar/reordenar/mover contenidos.
5. guardar escenario.
6. revisar piezas/semana, total y progreso.
7. activarlo.

### Caso C · Comparar presencia por plataforma
1. abrir Feeds.
2. elegir plataforma.
3. cambiar Realista/Zoom-out/Mapa compacto.
4. cambiar Auto/Mobile/Desktop.
5. revisar densidad y repetición editorial.

### Caso D · Crear una nueva marca
1. Biblioteca → Marcas.
2. crear marca.
3. definir color/plataformas.
4. activar contenidos globales.
5. crear custom content si hace falta.
6. construir escenarios propios.

### Caso E · Continuar en Mac lo editado en iPhone
1. hacer cambios localmente en iPhone.
2. estado se guarda inmediatamente en localStorage.
3. Supabase sincroniza en background.
4. Mac recibe Realtime/pull con la misma cuenta.

## No objetivos actuales

Editorial OS no pretende todavía ser:
- un editor de video;
- un publicador directo a redes;
- un DAM multimedia completo;
- un gestor de tareas genérico;
- un ERP de agencia.

Puede integrarse con sistemas mayores en el futuro, pero la prioridad es dominar el planning editorial y su ergonomía.
