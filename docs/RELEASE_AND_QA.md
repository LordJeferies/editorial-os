# Release, QA e instalación

## Entregables obligatorios de una versión nueva

Para VXX:
- `EDITORIAL_OS_VXX_PWA.zip`
- `EDITORIAL_OS_VXX.html`
- `CHANGELOG_VXX.md`
- script `deploy_vXX_over_existing.sh`
- instrucciones Terminal
- README/documentación actualizados
- cache Service Worker nuevo

## Script de upgrade

Debe:
1. recibir o detectar el repo local.
2. validar que es un repo Git apropiado.
3. crear backup pre-upgrade.
4. preservar `.git`.
5. preservar `supabase-config.js` existente.
6. copiar archivos nuevos.
7. validar.
8. mostrar diff/status.
9. commit.
10. push a `main` sólo si todo es válido.

No sobrescribir `supabase-config.js` con un placeholder del ZIP.

## Validación estática mínima

### JavaScript
```bash
node --check js/app-core.js
node --check js/v12-runtime.js
node --check js/v12-glass.js
```

Para una versión nueva, ajustar nombres.

### Bash
```bash
bash -n deploy_vXX_over_existing.sh
bash -n install_from_zero.sh
bash -n publish_update.sh
bash -n setup_and_deploy.sh
bash -n setup_supabase.sh
bash -n start_local.sh
```

### Manifest
Parsear JSON.

### HTML
- IDs duplicados: 0.
- links CSS/JS existentes.
- manifest existente.
- icons existentes.

### Contratos
Comprobar presencia/compatibilidad de:
- `jocEditorialV9`.
- `jocEditorialV9AppData`.
- `jocEditorialV9Scenarios`.
- `jocEditorialV9Cloud`.
- workspace `editorial-os`.
- completion contract.

## Test matrix visual

### iPhone
- 390 px.
- 430 px.
- portrait.
- standalone PWA.
- Safari normal.
- teclado abierto en forms.

### iPad
- ~768/820/834 px portrait.
- landscape.

### Desktop
- 1024.
- 1280.
- 1440+.

## Smoke tests funcionales

1. cambiar marca.
2. cambiar vista.
3. calendario semana/mes.
4. swipe móvil.
5. marcar Hecho/Pendiente.
6. Emulador: clone/reorder/move/delete.
7. guardar escenario y activarlo.
8. Feed Realista.
9. Feed Zoom-out = misma vista escalada.
10. Mapa compacto.
11. Auto/Mobile/Desktop.
12. Biblioteca tabs.
13. crear custom content.
14. Undo/Redo.
15. export/import backup.
16. login Supabase.
17. push/pull/realtime.
18. offline shell.

## Rendimiento

No aceptar sólo una impresión visual.

Revisar:
- input delay/tap response.
- long tasks.
- cantidad de DOM en Feeds.
- cantidad de listeners.
- layouts forzados.
- memoria en undo.
- WebGL instances.

## PWA

En cada versión:
- nuevo `CACHE`.
- manifest name/version actualizado.
- assets locales críticos en precache.
- validar update en iPhone ya instalado.

## Rollback

El script debe dejar un backup local pre-upgrade. También existe historial Git.

Si falla producción:
1. revertir commit o checkout del commit previo.
2. restaurar archivos de backup si el repo local quedó incompleto.
3. NO borrar localStorage/Supabase para “arreglar” un frontend.
