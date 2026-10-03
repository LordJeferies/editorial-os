# Editorial OS V12.11 · Desktop Web App

## Desktop macOS
- Añade `INSTALL_EDITORIAL_OS_DESKTOP.command`.
- El instalador compila un wrapper nativo macOS con `WKWebView`.
- La app resultante NO abre Safari ni Chrome.
- Instala `~/Applications/Editorial OS.app`.
- Usa el icono de Editorial OS.
- Firma ad-hoc el bundle y limpia `com.apple.quarantine`.
- Registra la app con LaunchServices.
- Crea un alias de acceso en el Escritorio.
- Abre la app al terminar.
- La ventana siempre carga `https://lordjeferies.github.io/editorial-os/`, de modo que las futuras actualizaciones de GitHub Pages aparecen sin reinstalar la app.

## Descarga desde la propia web
- Home incorpora `Desktop macOS`.
- También aparece `Descargar Desktop` en la tarjeta principal.
- El sheet explica la diferencia entre PWA/web y app Desktop.
- Incluye descarga directa del `.command`.
- Incluye botón para copiar un comando de instalación de una sola línea.

## Compatibilidad
- No cambia los contratos `jocEditorialV9*`.
- No cambia `public.editorial_state`.
- No cambia `workspace_key = editorial-os`.
- V12.10 Planner/Notas/Sheets permanece intacta.
