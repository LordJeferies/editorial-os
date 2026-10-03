# Editorial OS V12.14

## Perfiles rápidos de Supabase

- Configuración > Cuenta ahora puede guardar perfiles rápidos de acceso por dispositivo.
- Cada perfil guarda sólo `label` + `email` en localStorage (`editorialV1214AuthProfiles`).
- Seleccionar un perfil rellena el email y lleva el foco al campo de contraseña.
- El usuario puede guardar, seleccionar y eliminar perfiles locales.
- Si ya existe una sesión Supabase activa, el email conectado se añade automáticamente como perfil local.
- Supabase Auth continúa usando `persistSession:true`, por lo que después de iniciar sesión normalmente no hace falta volver a escribir la contraseña en ese contenedor.

## Seguridad

- Editorial OS NO guarda contraseñas en GitHub ni en localStorage.
- No se hardcodea ninguna contraseña compartida en la PWA pública.
- La contraseña se introduce en el momento del login y se entrega al handler existente de Supabase Auth.
- Las credenciales públicas del proyecto (`Project URL` + `anon/publishable key`) siguen preconfiguradas en `supabase-config.js`.
- Nunca se expone `service_role`.

## Compatibilidad

- Workspace: `editorial-os`.
- Tabla: `public.editorial_state`.
- Payload compatible: `version: 9`.
- No cambia `state`, `appData`, `savedScenarios`, `plannerDraft` ni `syncMeta`.
- Service Worker actualizado a `editorial-os-v12-14`.
