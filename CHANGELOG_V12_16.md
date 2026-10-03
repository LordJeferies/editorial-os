# Editorial OS V12.16

## Instalación / reinstalación macOS

Se añadió una ruta pública para reinstalar Editorial OS desde cero o sobre una instalación existente:

- `instalar.html`
- `INSTALL_EDITORIAL_OS_COMPLETE.command`

El instalador completo:

1. pide una clave de instalación;
2. guarda backup de la instalación Desktop y MCP si existen;
3. comprueba las herramientas de Apple;
4. descarga y valida el instalador Desktop actual;
5. instala `~/Applications/Editorial OS.app`;
6. descarga y valida el instalador MCP actual;
7. instala/actualiza `~/.editorial-os-mcp`;
8. ejecuta el self-test del MCP;
9. deja un reporte final en el Escritorio;
10. abre Editorial OS.app.

La GitHub Page, la PWA y los datos remotos de Supabase no se eliminan por este proceso.

## Página pública

`https://lordjeferies.github.io/editorial-os/instalar.html`

Incluye descarga directa del instalador, comando copiable, explicación de qué instala, qué preserva y enlaces a las guías general y MCP.
