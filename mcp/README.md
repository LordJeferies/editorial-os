# Editorial OS MCP

Servidor MCP local para controlar **Editorial OS** desde un host compatible con Model Context Protocol.

## Arquitectura

```text
ChatGPT / Claude / Codex / otro host MCP
                │
                │ stdio
                ▼
      Editorial OS MCP local
                │
                │ Supabase Auth + RLS
                ▼
       public.editorial_state
       workspace: editorial-os
                │
                ▼
     Editorial OS Web / PWA / Mac
```

El MCP no automatiza clics del navegador. Trabaja sobre la **misma fuente de datos compartida** de Editorial OS en Supabase. La app recibe esos cambios cuando está conectada con el mismo usuario/workspace.

## Instalación rápida

```bash
curl -fL "https://lordjeferies.github.io/editorial-os/INSTALL_EDITORIAL_MCP.command" -o "$HOME/Downloads/INSTALL_EDITORIAL_MCP.command"
chmod +x "$HOME/Downloads/INSTALL_EDITORIAL_MCP.command"
"$HOME/Downloads/INSTALL_EDITORIAL_MCP.command"
```

Requiere Node.js 22 o superior. El instalador intenta instalar/actualizar Node mediante Homebrew si hace falta.

El instalador deja el servidor en:

```text
~/.editorial-os-mcp/
```

y crea localmente:

```text
~/.editorial-os-mcp/.env
```

La contraseña vive sólo en ese archivo local con permisos `600`. No se publica en GitHub.

También genera:

```text
~/Desktop/EDITORIAL_OS_MCP_CONFIG.json
```

con la configuración que debes registrar en el host MCP.

## Configuración genérica de un host MCP

```json
{
  "mcpServers": {
    "editorial-os": {
      "command": "/Users/TU_USUARIO/.editorial-os-mcp/run-mcp.sh",
      "args": []
    }
  }
}
```

La ubicación exacta donde pegar este bloque cambia según el host MCP.

## Variables

```text
EDITORIAL_SUPABASE_URL
EDITORIAL_SUPABASE_ANON_KEY
EDITORIAL_SUPABASE_EMAIL
EDITORIAL_SUPABASE_PASSWORD
EDITORIAL_WORKSPACE_KEY=editorial-os
EDITORIAL_MCP_READ_ONLY=false
```

`EDITORIAL_SUPABASE_URL` y `EDITORIAL_SUPABASE_ANON_KEY` son las credenciales públicas del cliente y ya vienen preconfiguradas.

No uses `service_role` en este MCP para el uso normal. El servidor inicia sesión como usuario real y respeta RLS.

## Herramientas

### Lectura
- `editorial_status`
- `editorial_get_state`
- `editorial_search`
- `planner_list_week`
- `content_list`
- `content_list_notes`
- `production_get`
- `scenario_list`
- `brand_list`
- `history_recent`
- `editorial_backup`

### Escritura
- `planner_add_content`
- `planner_move_content`
- `planner_remove_content`
- `planner_clear_week`
- `content_create`
- `content_update`
- `content_delete`
- `content_add_note`
- `production_set`
- `scenario_save_current`
- `scenario_apply`
- `brand_create`
- `brand_update`
- `brand_set_active`

## Resources MCP
- `editorial://state`
- `editorial://planner`
- `editorial://criteria`

## Prompts MCP
- `plan-week`
- `review-week`
- `triage-corrections`

## Criterios de uso

1. Leer antes de escribir cuando el cambio dependa del estado actual.
2. Preservar campos desconocidos del payload.
3. Preferir `expectedRevision` en secuencias de varios cambios.
4. No borrar anchors/fichas `fixed` salvo instrucción explícita.
5. No vaciar el plan sin `confirm: true`.
6. No borrar contenido usado por el plan salvo `force: true`.
7. Añadir notas sin borrar las anteriores.
8. Mantener `workspace_key = editorial-os`.
9. La PWA y el MCP deben usar el mismo usuario si se espera sincronización inmediata.
10. No exponer `service_role`, database password, refresh tokens ni secretos privados.

## Read only

Para dejar al modelo consultar pero no modificar:

```text
EDITORIAL_MCP_READ_ONLY=true
```

Las herramientas de escritura devolverán error.

## Self-test

```bash
~/.editorial-os-mcp/run-mcp.sh --self-test
```

Esto valida Node y que estén configuradas las variables requeridas. No imprime la contraseña.

## Guía pública

https://lordjeferies.github.io/editorial-os/mcp.html

Consulta `EXAMPLES.md` para ejemplos concretos.
