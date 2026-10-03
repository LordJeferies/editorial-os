# Contratos de datos y compatibilidad

Este archivo define lo que una nueva versión debe preservar o migrar conscientemente.

## LocalStorage

### `jocEditorialV9`
Estado de UI/editorial:
- platform;
- calendarMode;
- anchorDate;
- volume;
- l2Mix;
- ytMode;
- liMode;
- eventWeek;
- mainSource;
- theme;
- lanePlatform;
- agendaPlatform;
- feedPlatform;
- feedHorizon;
- feedView;
- feedDevice;
- libraryTab;
- execution;
- moves;
- hidden;
- tentative;
- campos de escenario/UI añadidos históricamente.

### `jocEditorialV9AppData`
```js
{
  activeBrandId,
  brands,
  pillars,
  families,
  customContent,
  history,
  completion
}
```

### `jocEditorialV9Scenarios`
Array de escenarios guardados.

### `jocEditorialV9Cloud`
Configuración pública cliente Supabase si se guarda desde UI.

No renombrar keys sólo para “limpiar nombres”. Las keys V9 son deliberadamente legacy para preservar datos.

## Brand

```js
{
  id,
  name,
  initials,
  color,
  platforms:[],
  enabledContentIds:[],
  archived:false,
  lastDraft?,
  activeScenarioId?
}
```

JOC usa `id:'joc'`.

## Pillar

```js
{
  id,
  name,
  description,
  archived:false
}
```

## Family

```js
{
  id,
  name,
  pillarId,
  description,
  archived:false
}
```

## Built-in template

Campos habituales:

```js
{
  id,
  title,
  type,
  lot,
  surface,
  platforms:[],
  fixed?,
  defaultDow?,
  role,
  familyId,
  pillarId
}
```

## Custom content

```js
{
  id,
  title,
  type,
  lot,
  surface,
  platforms:[],
  compatibleFormats:[],
  pillarId,
  familyId,
  description,
  color,
  role:'Contenido personalizado',
  custom:true,
  archived:false
}
```

## Scenario instance

```js
{
  instanceId,
  templateId,
  masterKey,
  title,
  type,
  lot,
  lotRank,
  order,
  role,
  note,
  surface,
  platforms:[],
  fixed,
  dow,
  familyId,
  pillarId,
  compatibleFormats:[],
  description,
  color,
  ...overrides
}
```

## Planner slots

```js
{
  1:[],
  2:[],
  3:[],
  4:[],
  5:[],
  6:[],
  0:[]
}
```

No cambiar los DOW keys sin migración.

## Saved scenario

```js
{
  id,
  name,
  brandId,
  createdAt,
  range,
  slots
}
```

## Range

```js
{
  mode:'weeks' | 'end',
  start:'YYYY-MM-DD',
  end:'YYYY-MM-DD',
  weeks:Number
}
```

## History

```js
{
  id,
  at:ISODate,
  brandId,
  action,
  detail
}
```

Históricamente se limita aproximadamente a 300 registros persistidos.

## Completion

Key:

```text
${brandId}|${scenarioId}|${date}|${identity}
```

Identity:

```js
a.masterKey || a.instanceId || a.templateId || a.id || a.title
```

Value:

```js
{
  done:true,
  at:ISODate
}
```

Esta semántica es crítica porque el estado representa el asset maestro, no una copia por red.

## Cloud payload

Debe seguir leyendo/escribiendo payloads antiguos:

```js
{
  version:9,
  state,
  appData,
  savedScenarios,
  plannerDraft
}
```

`version:9` es una etiqueta legacy del formato, no la versión del producto.

## Supabase

Tabla:
- `public.editorial_state`

Conceptualmente:
```sql
id uuid primary key
user_id uuid references auth.users(id)
workspace_key text default 'editorial-os'
payload jsonb
updated_at timestamptz
unique(user_id, workspace_key)
```

Workspace:
- `editorial-os`

RLS:
- el usuario sólo accede a su propia fila.

## Sync

Flujo:

```text
mutación UI
→ estado JS inmediato
→ localStorage
→ scheduleCloudSync (~1 s)
→ upsert payload completo
→ Realtime a otros dispositivos
→ applyCloudPayload
→ persistencia local
→ render
```

Limitaciones:
- last-write-wins;
- no merge estructural;
- no outbox durable;
- no revision conflict detection.

## Reglas de migración

Requieren migration explícita:
- cambiar keys localStorage;
- cambiar payload cloud;
- cambiar IDs existentes;
- cambiar formato completion;
- cambiar slots/range;
- cambiar significado de `lot`, `type` o `platform`;
- cambiar tabla/workspace.

Una migración debe:
1. detectar schema/version anterior;
2. clonar/backup antes de transformar;
3. ser idempotente;
4. conservar unknown fields cuando sea posible;
5. permitir rollback o export JSON.
