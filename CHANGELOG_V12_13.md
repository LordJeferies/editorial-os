# Editorial OS V12.13

## Configuración / Supabase

- Nuevo centro de Configuración accesible desde Home, desktop y toolbar móvil.
- Muestra estado de sesión y sincronización.
- Project URL y publishable/anon key ya vienen precargados desde `supabase-config.js`.
- La key se mantiene oculta por defecto y se puede revelar/copiar.
- Login, crear cuenta, salir, subir y bajar se ejecutan reutilizando los handlers existentes de Editorial OS.
- Botón para restaurar la configuración oficial eliminando overrides locales de `jocEditorialV9Cloud`.
- Acceso a la configuración avanzada existente de Nube.

## Supabase actual

- Tabla: `public.editorial_state`
- Workspace compartido: `editorial-os`
- Payload compatible: `version: 9`
- Auth: email/password con sesión persistente.
- Cliente: Project URL + publishable/anon key.
- Nunca usar `service_role` en la PWA.

## PWA

- Service Worker `editorial-os-v12-13`.
- `supabase-config.js`, `v1213-runtime.js` y `v1213.css` forman parte del core cache.

## Compatibilidad

No se cambian los contratos de `state`, `appData`, `savedScenarios`, `plannerDraft`, `syncMeta`, ni las claves legacy de localStorage.
