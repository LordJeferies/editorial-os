# Especificación visual derivada de las referencias

Este documento traduce a reglas implementables las referencias visuales entregadas durante el diseño. Sirve cuando otro chat no tiene acceso a las imágenes originales.

## Lenguaje general

Editorial OS debe combinar:
1. ergonomía de app iOS contemporánea;
2. minimalismo editorial;
3. Liquid Glass selectivo;
4. densidad de herramientas creativas profesionales;
5. cards modulares con color funcional.

No debe parecer:
- dashboard SaaS genérico;
- Bootstrap/admin panel;
- desktop encogido en móvil;
- “glassmorphism” aplicado indiscriminadamente.

## Geometría

Escala recomendada:
```css
--radius-xs:8px;
--radius-sm:12px;
--radius-md:16px;
--radius-lg:22px;
--radius-xl:28px;
--radius-2xl:34px;
--radius-pill:999px;
```

Uso típico:
- card principal: 24–32 px.
- card secundaria: 18–24 px.
- control: 14–18 px.
- pill/chip: 999 px.

Los contenedores grandes deben tener radios mayores que sus controles internos.

## Espaciado

Usar grid 4/8:
```css
--space-1:4px;
--space-2:8px;
--space-3:12px;
--space-4:16px;
--space-5:20px;
--space-6:24px;
--space-8:32px;
--space-10:40px;
--space-12:48px;
```

Pantalla móvil:
- padding inline: 16–20 px según densidad.

Card:
- padding: 16–20 px.
- icono→texto: 8–12 px.
- título→subtítulo: 4–6 px.
- sección→sección: 16–24 px.

## Tipografía

Familia:
```css
font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text",sans-serif;
```

Jerarquía aproximada:
```css
--text-xs:11px;
--text-sm:13px;
--text-base:15px;
--text-md:17px;
--text-lg:20px;
--text-xl:24px;
--text-2xl:30px;
--text-3xl:38px;
```

Pesos predominantes:
- 500.
- 600.
- 700.

Títulos grandes:
- letter-spacing negativo.
- line-height ~0.95–1.05.

Evitar hacer todo bold 800/900.

## Paleta dark

```css
--surface-0:#080808;
--surface-1:#101011;
--surface-2:#171719;
--surface-3:#1e1e21;
--surface-4:#262629;
--text-1:rgba(255,255,255,.96);
--text-2:rgba(255,255,255,.62);
--text-3:rgba(255,255,255,.40);
```

La profundidad debe surgir principalmente de valores de surface, no de sombras enormes.

## Paleta light

No depender siempre de `#fff` puro.

```css
--cream-50:#f8f7f0;
--cream-100:#f2f1e8;
--cream-200:#e8e7dd;
```

Las cards claras pueden ser blancas/traslúcidas sobre fondos ligeramente cálidos.

## Acentos Editorial OS

Base recomendada:
```text
Background  #09090A
Surface 1   #151516
Surface 2   #1D1D1F
Creative    #EFFF59
AI          #8B7CFF
Processing  #FF7738
Success     #6EE7A0
Text        #F7F7F8 / #A5A5AB
```

El producto actual conserva colores semánticos por contenido y plataformas. No reemplazarlos sin revisar legibilidad y significado.

## Color funcional

- lime: acción creativa/primaria.
- violet: IA o generación asistida.
- orange: procesando/atención.
- green: hecho/aprobado.
- red: error/destructivo.
- blue: scheduled/info.
- gray: neutral.

No usar color fuerte sólo como decoración.

## Cards

Estructura mental:
```text
card
├── visual / indicator
├── title + metadata
└── status / action
```

Dark:
```css
border:1px solid rgba(255,255,255,.07);
```

Light:
```css
border:1px solid rgba(0,0,0,.05);
```

Evitar box-shadows dramáticas en todas las cards.

## Liquid Glass

Glass real = refracción/blur/lighting/selective chrome. No equivale a `backdrop-filter` solamente.

Usar para:
- top bar;
- dock;
- bottom sheets/modals destacados;
- controles flotantes sobre media.

No usar para:
- 50 cards de calendario;
- feeds completos;
- todo el viewport;
- listas densas.

Fallback CSS aceptable:
```css
background:rgba(28,28,31,.68);
border:1px solid rgba(255,255,255,.13);
backdrop-filter:blur(28px) saturate(145%);
box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 18px 50px rgba(0,0,0,.22);
```

Pero cuando `LiquidGlass` está disponible, el efecto principal debe venir de la implementación WebGL real.

## Botones

Alturas:
- compact: 36 px.
- regular: 44 px.
- primary: 52 px.

Hit target mínimo: 44 × 44 px.

Familias:
- primary pill.
- dark pill.
- tint button.
- circular icon button.

Estado pressed:
```css
transform:scale(.97);
transition:transform 120ms ease;
```

## Motion

Duraciones:
- press: 80–120 ms.
- popover: 160–220 ms.
- panel/sheet: 220–300 ms.
- page transition: 280–380 ms.

Easing sugerido:
```css
cubic-bezier(.2,.8,.2,1)
cubic-bezier(.22,1,.36,1)
```

Respetar `prefers-reduced-motion`.

## Bottom dock

3–5 destinos primarios.

Editorial OS:
- Home.
- Calendario.
- Emulador.
- Feeds.
- Biblioteca.

Acciones secundarias van a “Más herramientas”/sheet.

Debe respetar `safe-area-inset-bottom` y no tapar contenido.

## Bottom sheet

Móvil:
- sheet desde abajo;
- radio ~28–32 px superior;
- max-height ~82–86dvh;
- scroll interno;
- handle;
- backdrop;
- Escape;
- cerrar tocando backdrop;
- devolver foco;
- focus loop básico.

## Layout por dispositivo

### iPhone
```text
header compacto
contenido principal
acciones contextuales
scroll
bottom dock
```

Inspectores/controles secundarios → sheets.

### iPad
No usar automáticamente desktop. Puede usar:
- dos columnas;
- inspector colapsable;
- day carousel más ancho;
- dock móvil/tablet.

### Desktop
```text
header/nav
workspace ancho
panels/inspectors
calendario completo o matrices
```

Desktop no debe parecer un iPhone ampliado.

## Calendario

Phone:
- semana como página por día/swipe;
- mes compacto con dots;
- nada de siete columnas llenas de texto.

Desktop:
- siete columnas completas.

## Kanban

Phone:
- un día operativo visible;
- swipe cambia día;
- source catalog idealmente sheet;
- long-press/reorder;
- feedback ghost/chosen;
- auto-scroll.

## Feeds

La vista realista debe preservar el “metáfora visual” de cada plataforma. Zoom-out = misma vista escalada.

## Imágenes/media

Siempre:
```css
object-fit:cover;
```
o `contain` cuando corresponda.

Aspect ratios de uso frecuente:
- 1:1.
- 4:5.
- 16:9.
- 9:16.

## Textura

Fondos pueden usar:
- radial gradients muy sutiles;
- grain/noise microscópico;
- viñeta ligera;
- luz ambiental.

No convertir la UI en una textura visible o ruidosa.

## Regla de composición

El espacio no se “rellena”. Se compone.

Usar:
- zonas de respiro;
- agrupación funcional;
- una acción primaria clara;
- controles secundarios escondidos hasta contexto;
- visual hierarchy por contraste/tamaño, no por docenas de bordes.
