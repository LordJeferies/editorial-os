#!/bin/bash
set -Eeuo pipefail

APP_NAME="Editorial OS"
APP_URL="https://lordjeferies.github.io/editorial-os/"
BUNDLE_ID="com.lordjeferies.editorialos.desktop"
APP_DIR="$HOME/Applications"
APP_PATH="$APP_DIR/$APP_NAME.app"
DESKTOP_NAME="Editorial OS"
LOG_DIR="$HOME/Library/Logs/Editorial OS Desktop"
SUPPORT_DIR="$HOME/Library/Application Support/Editorial OS Desktop"
STAMP="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOG_DIR/install_$STAMP.log"
TMP_DIR="$(mktemp -d)"
STAGE_APP="$TMP_DIR/$APP_NAME.app"
BACKUP_APP="$SUPPORT_DIR/Editorial OS.previous.app"
DEPLOYMENT_TARGET="13.0"

mkdir -p "$APP_DIR" "$LOG_DIR" "$SUPPORT_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

cleanup(){ rm -rf "$TMP_DIR" 2>/dev/null || true; }
on_error(){
  code=$?
  echo
  echo "=============================================================="
  echo " ERROR INSTALANDO EDITORIAL OS DESKTOP"
  echo " Código: $code"
  echo " Línea : ${1:-desconocida}"
  echo " Log   : $LOG_FILE"
  echo "=============================================================="
  cleanup
  exit "$code"
}
trap 'on_error "$LINENO"' ERR
trap cleanup EXIT

ok(){ printf 'OK    %s\n' "$*"; }
info(){ printf 'INFO  %s\n' "$*"; }
warn(){ printf 'WARN  %s\n' "$*"; }

echo "=============================================================="
echo " EDITORIAL OS · DESKTOP MACOS"
echo "=============================================================="
echo "Web: $APP_URL"
echo "App: $APP_PATH"
echo "Log: $LOG_FILE"
echo

if [ "$(uname -s)" != "Darwin" ]; then
  echo "ERROR: este instalador sólo funciona en macOS."
  exit 1
fi

ARCH="$(uname -m)"
case "$ARCH" in
  arm64|x86_64) ;;
  *) echo "ERROR: arquitectura no soportada: $ARCH"; exit 1 ;;
esac
ok "macOS $(sw_vers -productVersion 2>/dev/null || true) · $ARCH"

if ! xcode-select -p >/dev/null 2>&1; then
  warn "Faltan Xcode Command Line Tools."
  xcode-select --install || true
  echo
  echo "Completa la instalación de Apple y vuelve a ejecutar este mismo archivo."
  exit 2
fi
ok "Developer path activo: $(xcode-select -p)"

cat > "$TMP_DIR/probe.swift" <<'SWIFT'
import Foundation
print("ok")
SWIFT

DEV_CANDIDATES=()
CURRENT_DEV="$(xcode-select -p 2>/dev/null || true)"
[ -n "$CURRENT_DEV" ] && DEV_CANDIDATES+=("$CURRENT_DEV")
[ -d "/Applications/Xcode.app/Contents/Developer" ] && DEV_CANDIDATES+=("/Applications/Xcode.app/Contents/Developer")
[ -d "/Library/Developer/CommandLineTools" ] && DEV_CANDIDATES+=("/Library/Developer/CommandLineTools")
[ -d "/Applications/Xcode-beta.app/Contents/Developer" ] && DEV_CANDIDATES+=("/Applications/Xcode-beta.app/Contents/Developer")

SELECTED_DEV=""
SWIFTC=""
SDK_PATH=""
TARGET_TRIPLE="${ARCH}-apple-macosx${DEPLOYMENT_TARGET}"

for DEV in "${DEV_CANDIDATES[@]}"; do
  [ -d "$DEV" ] || continue
  CANDIDATE_SWIFTC="$(DEVELOPER_DIR="$DEV" xcrun --find swiftc 2>/dev/null || true)"
  CANDIDATE_SDK="$(DEVELOPER_DIR="$DEV" xcrun --sdk macosx --show-sdk-path 2>/dev/null || true)"
  [ -n "$CANDIDATE_SWIFTC" ] || continue
  [ -x "$CANDIDATE_SWIFTC" ] || continue
  [ -n "$CANDIDATE_SDK" ] || continue
  info "Probando toolchain: $DEV"
  if DEVELOPER_DIR="$DEV" "$CANDIDATE_SWIFTC" \
      "$TMP_DIR/probe.swift" \
      -sdk "$CANDIDATE_SDK" \
      -target "$TARGET_TRIPLE" \
      -o "$TMP_DIR/probe" >/dev/null 2>"$TMP_DIR/probe.err"; then
    SELECTED_DEV="$DEV"
    SWIFTC="$CANDIDATE_SWIFTC"
    SDK_PATH="$CANDIDATE_SDK"
    break
  else
    warn "Toolchain no usable: $DEV"
    sed -n '1,8p' "$TMP_DIR/probe.err" || true
  fi
done

if [ -z "$SELECTED_DEV" ]; then
  echo
  echo "ERROR: ninguna toolchain Swift pudo compilar para $TARGET_TRIPLE."
  echo "El problema anterior provenía de Xcode-beta intentando usar como target la versión del sistema actual."
  echo "Este instalador ya fuerza un deployment target estable, pero no encontró una toolchain funcional."
  echo
  echo "Developer paths probados:"
  printf '  %s\n' "${DEV_CANDIDATES[@]}"
  echo
  echo "Instala/actualiza Xcode estable o Command Line Tools y vuelve a ejecutar."
  exit 3
fi

ok "Toolchain seleccionada: $SELECTED_DEV"
ok "Swift compiler: $SWIFTC"
ok "SDK: $SDK_PATH"
ok "Target: $TARGET_TRIPLE"

mkdir -p "$STAGE_APP/Contents/MacOS" "$STAGE_APP/Contents/Resources"

cat > "$TMP_DIR/main.swift" <<'SWIFT'
import Cocoa
import WebKit

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    let appURL = URL(string: "https://lordjeferies.github.io/editorial-os/")!

    func applicationDidFinishLaunching(_ notification: Notification) {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.preferences.javaScriptCanOpenWindowsAutomatically = true
        config.applicationNameForUserAgent = "EditorialOSDesktop/12.11.1"
        config.mediaTypesRequiringUserActionForPlayback = []

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsMagnification = true

        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1360, height: 900),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "Editorial OS"
        window.titleVisibility = .hidden
        window.titlebarAppearsTransparent = true
        window.isMovable = true
        window.isReleasedWhenClosed = false
        window.collectionBehavior.insert(.fullScreenPrimary)
        window.minSize = NSSize(width: 760, height: 560)
        window.contentMinSize = NSSize(width: 760, height: 560)
        window.contentView = webView

        let restoredFrame = window.setFrameUsingName("EditorialOS.MainWindow")
        window.setFrameAutosaveName("EditorialOS.MainWindow")
        if !restoredFrame {
            window.center()
        }

        buildMenus()
        loadHome()
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }

    func loadHome() {
        var request = URLRequest(url: appURL)
        request.cachePolicy = .reloadRevalidatingCacheData
        request.timeoutInterval = 30
        webView.load(request)
    }

    func buildMenus() {
        let main = NSMenu()
        let appItem = NSMenuItem()
        main.addItem(appItem)
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "Acerca de Editorial OS", action: #selector(showAbout), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Salir de Editorial OS", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appItem.submenu = appMenu

        let navItem = NSMenuItem()
        navItem.title = "Navegación"
        main.addItem(navItem)
        let nav = NSMenu(title: "Navegación")
        nav.addItem(withTitle: "Atrás", action: #selector(goBack), keyEquivalent: "[")
        nav.addItem(withTitle: "Adelante", action: #selector(goForward), keyEquivalent: "]")
        nav.addItem(withTitle: "Recargar", action: #selector(reloadPage), keyEquivalent: "r")
        nav.addItem(NSMenuItem.separator())
        nav.addItem(withTitle: "Inicio", action: #selector(home), keyEquivalent: "0")
        navItem.submenu = nav

        let viewItem = NSMenuItem()
        viewItem.title = "Visualización"
        main.addItem(viewItem)
        let view = NSMenu(title: "Visualización")
        view.addItem(withTitle: "Pantalla completa", action: #selector(toggleFullScreen), keyEquivalent: "f")
        viewItem.submenu = view
        NSApp.mainMenu = main
    }

    @objc func showAbout() {
        let alert = NSAlert()
        alert.messageText = "Editorial OS Desktop"
        alert.informativeText = "Aplicación macOS que carga la versión actual de Editorial OS desde GitHub Pages."
        alert.runModal()
    }

    @objc func goBack() { if webView.canGoBack { webView.goBack() } }
    @objc func goForward() { if webView.canGoForward { webView.goForward() } }
    @objc func reloadPage() { webView.reloadFromOrigin() }
    @objc func home() { loadHome() }
    @objc func toggleFullScreen() { window.toggleFullScreen(nil) }

    func isInternal(_ url: URL) -> Bool {
        guard url.scheme == "https", url.host == "lordjeferies.github.io" else { return false }
        return url.path.hasPrefix("/editorial-os")
    }

    func webView(_ webView: WKWebView,
                 decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }
        if isInternal(url) || url.scheme == "about" || url.scheme == "blob" || url.scheme == "data" {
            decisionHandler(.allow)
            return
        }
        if ["http", "https", "mailto"].contains(url.scheme ?? "") {
            NSWorkspace.shared.open(url)
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView,
                 createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction,
                 windowFeatures: WKWindowFeatures) -> WKWebView? {
        guard let url = navigationAction.request.url else { return nil }
        if isInternal(url) { webView.load(URLRequest(url: url)) }
        else { NSWorkspace.shared.open(url) }
        return nil
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.regular)
let delegate = AppDelegate()
app.delegate = delegate
app.run()
SWIFT

DEVELOPER_DIR="$SELECTED_DEV" "$SWIFTC" \
  "$TMP_DIR/main.swift" \
  -sdk "$SDK_PATH" \
  -target "$TARGET_TRIPLE" \
  -o "$STAGE_APP/Contents/MacOS/EditorialOS" \
  -framework Cocoa \
  -framework WebKit

chmod +x "$STAGE_APP/Contents/MacOS/EditorialOS"
ok "Wrapper WKWebView compilado"

cat > "$STAGE_APP/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key><string>es</string>
  <key>CFBundleDisplayName</key><string>Editorial OS</string>
  <key>CFBundleExecutable</key><string>EditorialOS</string>
  <key>CFBundleIdentifier</key><string>$BUNDLE_ID</string>
  <key>CFBundleInfoDictionaryVersion</key><string>6.0</string>
  <key>CFBundleName</key><string>Editorial OS</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>12.11.1</string>
  <key>CFBundleVersion</key><string>12111</string>
  <key>CFBundleIconFile</key><string>AppIcon</string>
  <key>LSMinimumSystemVersion</key><string>13.0</string>
  <key>NSHighResolutionCapable</key><true/>
  <key>NSPrincipalClass</key><string>NSApplication</string>
</dict>
</plist>
PLIST

ICON_PNG="$TMP_DIR/icon.png"
ICONSET="$TMP_DIR/AppIcon.iconset"
if curl -fsSL "https://lordjeferies.github.io/editorial-os/icons/icon-512.png?v=12.11.1" -o "$ICON_PNG"; then
  mkdir -p "$ICONSET"
  sips -z 16 16 "$ICON_PNG" --out "$ICONSET/icon_16x16.png" >/dev/null
  sips -z 32 32 "$ICON_PNG" --out "$ICONSET/icon_16x16@2x.png" >/dev/null
  sips -z 32 32 "$ICON_PNG" --out "$ICONSET/icon_32x32.png" >/dev/null
  sips -z 64 64 "$ICON_PNG" --out "$ICONSET/icon_32x32@2x.png" >/dev/null
  sips -z 128 128 "$ICON_PNG" --out "$ICONSET/icon_128x128.png" >/dev/null
  sips -z 256 256 "$ICON_PNG" --out "$ICONSET/icon_128x128@2x.png" >/dev/null
  sips -z 256 256 "$ICON_PNG" --out "$ICONSET/icon_256x256.png" >/dev/null
  sips -z 512 512 "$ICON_PNG" --out "$ICONSET/icon_256x256@2x.png" >/dev/null
  sips -z 512 512 "$ICON_PNG" --out "$ICONSET/icon_512x512.png" >/dev/null
  sips -z 1024 1024 "$ICON_PNG" --out "$ICONSET/icon_512x512@2x.png" >/dev/null
  if iconutil -c icns "$ICONSET" -o "$STAGE_APP/Contents/Resources/AppIcon.icns"; then
    ok "Icono macOS generado"
  else
    warn "No pude generar .icns; la app funcionará con icono genérico."
  fi
else
  warn "No pude descargar el icono; la app funcionará con icono genérico."
fi

plutil -lint "$STAGE_APP/Contents/Info.plist" >/dev/null
codesign --force --deep --sign - "$STAGE_APP"
codesign --verify --deep --strict "$STAGE_APP"
ok "Bundle firmado ad-hoc y verificado"

rm -rf "$BACKUP_APP"
if [ -d "$APP_PATH" ]; then
  info "Guardando instalación anterior..."
  ditto "$APP_PATH" "$BACKUP_APP"
fi

NEW_APP="$APP_DIR/.Editorial OS.installing.$$.app"
rm -rf "$NEW_APP"
ditto "$STAGE_APP" "$NEW_APP"
if [ ! -x "$NEW_APP/Contents/MacOS/EditorialOS" ]; then
  echo "ERROR: el stage final no contiene el ejecutable."
  exit 4
fi

rm -rf "$APP_PATH"
mv "$NEW_APP" "$APP_PATH"
xattr -dr com.apple.quarantine "$APP_PATH" 2>/dev/null || true

LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
if [ -x "$LSREGISTER" ]; then
  "$LSREGISTER" -f "$APP_PATH" >/dev/null 2>&1 || true
fi
ok "App instalada: $APP_PATH"

osascript <<EOF >/dev/null 2>&1 || warn "No se pudo crear el alias del Escritorio."
tell application "Finder"
    set targetApp to POSIX file "$APP_PATH" as alias
    if exists item "$DESKTOP_NAME" of desktop then
        try
            delete item "$DESKTOP_NAME" of desktop
        end try
    end if
    make new alias file at desktop to targetApp with properties {name:"$DESKTOP_NAME"}
end tell
EOF

if [ -e "$HOME/Desktop/$DESKTOP_NAME" ]; then
  ok "Alias creado en Escritorio"
else
  warn "Finder no confirmó el alias; la app sí está instalada en $APP_PATH"
fi

touch "$APP_PATH"
open -R "$APP_PATH"
open "$APP_PATH"

echo
echo "=============================================================="
echo " EDITORIAL OS DESKTOP INSTALADO"
echo "=============================================================="
echo "App:        $APP_PATH"
echo "Escritorio: $HOME/Desktop/$DESKTOP_NAME"
echo "Web viva:   $APP_URL"
echo "Log:        $LOG_FILE"
echo
echo "La app no abre Safari/Chrome. Usa una ventana WKWebView propia."
echo "Cuando GitHub Pages se actualiza, esta app carga la versión nueva."
