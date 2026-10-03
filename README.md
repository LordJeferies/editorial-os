# Editorial OS V12.3

PWA editorial multi-marca para GitHub Pages + Supabase. V12.3 consolida el rediseño móvil y añade una capa de estabilidad/producción sin romper datos legacy.

## Instalar sobre la versión actual

```bash
cd ~/Downloads
unzip -o EDITORIAL_OS_V12_3_PWA.zip
cd EDITORIAL_OS_V12_3_PWA
chmod +x deploy_v12_3_over_existing.sh
./deploy_v12_3_over_existing.sh
```

Si el repo no se detecta:

```bash
./deploy_v12_3_over_existing.sh ~/Downloads/EDITORIAL_OS_V10_FRESH
```

El updater:

- sincroniza `origin/main` antes de tocar archivos;
- crea backup;
- conserva `.git`;
- conserva `supabase-config.js`;
- no borra documentación remota ajena al paquete;
- valida V12.3;
- hace commit;
- vuelve a comprobar `origin/main`;
- hace push sólo cuando la historia es publicable por fast-forward.

## Probar local

```bash
./start_local.sh
```

Abre `http://localhost:8080`.

## Cambios centrales

- iPhone sin auto-zoom por inputs pequeños;
- Emulador de un solo día en móvil;
- move/reorder fiable y fallback sin Sortable;
- calendario 1/3/7 días según composición;
- “Hoy” en Home;
- búsqueda global `⌘K`;
- Quick Add;
- workflow de producción, hora, responsable, checklist y notas;
- IndexedDB shadow state + outbox;
- revision/conflict detection multi-device;
- import validado y migración no destructiva;
- diagnóstico interno;
- Service Worker V12.3 con actualización controlada;
- updater Git seguro.

Consulta `CHANGELOG_V12_3.md` y `TERMINAL_V12_3.txt`.

## Contratos que siguen iguales

LocalStorage:

- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`

Cloud:

- tabla `public.editorial_state`
- workspace `editorial-os`
- payload `version:9`

V12.3 añade campos compatibles (`appData.production`, `syncMeta`) sin renombrar los contratos anteriores.

## Stack

- HTML/CSS/JavaScript vanilla;
- PWA + Service Worker;
- Supabase JS v2;
- SortableJS con fallback Pointer Events en móvil;
- LiquidGlass como mejora visual progresiva;
- localStorage + IndexedDB;
- GitHub Pages.
