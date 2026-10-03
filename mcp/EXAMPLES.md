# Editorial OS MCP · ejemplos de uso

## 1. Ver qué hay esta semana

Usuario:

> Revisa mi plan de esta semana y dime cuántas piezas hay por día.

Secuencia recomendada:

```text
editorial_status
planner_list_week
```

No requiere escritura.

## 2. Añadir una pieza

Usuario:

> Agrega un reel de webinar el miércoles para Instagram y LinkedIn.

Usar `planner_add_content`:

```json
{
  "dow": 3,
  "title": "Webinar · reel",
  "type": "Webinar",
  "lot": "L2",
  "surface": "Reel",
  "platforms": ["instagram", "linkedin"]
}
```

Después volver a llamar `planner_list_week` para verificar.

## 3. Mover una pieza

Primero usa `planner_list_week` y obtén el `instanceId`.

Luego:

```json
{
  "instanceId": "plan-...",
  "toDow": 5
}
```

Usar `planner_move_content`.

## 4. Corrección editorial

> A esta pieza agrégale una nota: el hook está muy lento; necesitamos una frase más fuerte al inicio.

Usar `content_add_note`:

```json
{
  "identity": "IDENTIDAD_DE_LA_PIEZA",
  "text": "El hook está muy lento; necesitamos una frase más fuerte al inicio.",
  "author": "MCP"
}
```

No reemplazar notas anteriores.

## 5. Cambiar estado de producción

> Marca esta pieza como con cambios solicitados y asígnasela a Pamela.

```json
{
  "identity": "IDENTIDAD_DE_LA_PIEZA",
  "date": "2026-10-05",
  "status": "changes",
  "assignee": "Pamela"
}
```

Estados admitidos:

```text
planned
production
editing
review
changes
approved
scheduled
published
```

## 6. Crear una ficha reutilizable

> Crea un tipo de contenido llamado Clip de objeciones para Instagram, TikTok y LinkedIn.

Usar `content_create`. Después, si debe entrar en la semana, usar `planner_add_content` con el `contentId` devuelto.

## 7. Guardar un escenario

> Guarda esta semana como escenario "Semana Webinar Octubre".

Usar:

```json
{
  "name": "Semana Webinar Octubre"
}
```

con `scenario_save_current`.

## 8. Aplicar un escenario

Esta operación reemplaza el `plannerDraft` actual, por lo que debe ser explícita:

```json
{
  "id": "scenario-...",
  "confirm": true
}
```

Usar `scenario_apply`.

## 9. Vaciar plan

Operación destructiva. Sólo hacerla cuando el usuario lo pida claramente:

```json
{
  "keepFixed": true,
  "confirm": true
}
```

Por defecto se recomienda conservar las fichas `fixed`.

## 10. Flujo recomendado para IA

```text
1. editorial_status
2. leer la sección necesaria
3. explicar brevemente qué se va a cambiar si el cambio es amplio
4. ejecutar herramientas específicas
5. volver a leer
6. confirmar resultado real
```

## Criterio de conflicto

Para una secuencia crítica:

1. leer `revision`;
2. pasarla como `expectedRevision`;
3. si el MCP responde conflicto, volver a leer;
4. no reintentar a ciegas.

Esto reduce el riesgo de pisar cambios hechos desde iPhone, Web o Desktop al mismo tiempo.
