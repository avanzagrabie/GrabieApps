# Gabriel Díaz Bernal — sitio web

Sitio estático (GitHub Pages) del estudio de ingeniería de Gabriel Díaz Bernal. Sin frameworks, sin frontend build: HTML, CSS y JavaScript vainilla. Un único script Node interno (`tools/build-lang-pages.js`) genera las páginas traducidas — ver [SEO y multi-idioma](#seo-y-multi-idioma) más abajo.

**Sitio en vivo:** https://avanzagrabie.github.io/GrabieApps/

## Características

- **Diseño propio**, oscuro y técnico, con fondo animado (canvas), terminal interactiva en el hero y microinteracciones en JS vainilla.
- **7 idiomas** (Español, English, Français, Português, العربية, 中文, 日本語), cada uno en su **propia URL** — no un solo URL que cambia de texto por JS. Ver [SEO y multi-idioma](#seo-y-multi-idioma).
- **Sin sección de contacto**: el estudio trabaja solo bajo invitación, así que no hay formulario ni email público — es una decisión de posicionamiento, no un descuido.
- **SEO al detalle**: canonical + `hreflang` por idioma, Open Graph/Twitter localizados, JSON-LD (`Person`, `ProfessionalService`, `WebSite`), `sitemap.xml` con anotaciones de idioma, `robots.txt`, verificación de Google Search Console.
- **Cero dependencias de runtime**: no hay CDNs, ni Google Fonts, ni frameworks. Todo el CSS/JS vive en `assets/`. (El generador de páginas usa solo Node built-ins, sin `npm install`.)

## Estructura

```
index.html                  Página principal en español (fuente de verdad / plantilla)
en/index.html                 ) Generadas por tools/build-lang-pages.js —
fr/index.html                 ) no se editan a mano, se regeneran.
pt/index.html                 )
ar/index.html                 )
zh/index.html                 )
ja/index.html                 )
404.html                    Página de error personalizada
tools/build-lang-pages.js   Generador de las páginas por idioma (Node, sin dependencias)
assets/
  css/style.css              Sistema de diseño completo
  js/i18n.js                  Diccionario de 7 idiomas (fuente que lee el generador)
  js/main.js                  Interacciones: nav, terminal, fondo animado
  img/                        Favicon, iconos, imagen Open Graph
sitemap.xml, robots.txt, manifest.webmanifest, .nojekyll
.github/workflows/deploy.yml  Despliegue automático a GitHub Pages
```

## Ejecutar en local

No requiere instalación. Basta con abrir `index.html` en el navegador, o servirlo con cualquier servidor estático:

```bash
python -m http.server 8080
# o
npx serve .
```

## SEO y multi-idioma

Cada idioma vive en su propia URL, con el contenido ya traducido directamente en el HTML (no inyectado por JavaScript después de cargar):

| Idioma | URL |
|---|---|
| Español (fuente) | `/` |
| English | `/en/` |
| Français | `/fr/` |
| Português | `/pt/` |
| العربية (RTL) | `/ar/` |
| 中文 | `/zh/` |
| 日本語 | `/ja/` |

Por qué así y no con un selector que reescribe el texto en el sitio: Google recomienda explícitamente una URL indexable por idioma, con etiquetas `hreflang` cruzándolas — un único URL cuyo contenido cambia según el navegador (como tenía este sitio antes) hace que los buscadores solo puedan indexar una versión. Cada página generada incluye:

- `<html lang="xx" dir="ltr|rtl">` correcto (árabe en RTL).
- `<title>`, meta description, Open Graph y Twitter Cards traducidos.
- `<link rel="canonical">` a sí misma (no todas apuntando a la raíz en español).
- El clúster completo de `<link rel="alternate" hreflang="...">` (las 7 + `x-default`).
- El mismo bloque en `sitemap.xml` vía `<xhtml:link>`.
- JSON-LD con la descripción traducida.

El selector de idioma del menú ya no usa JavaScript para "cambiar" nada — son enlaces `<a>` normales a la URL de cada idioma, con el idioma activo marcado (`aria-current`).

### Regenerar las páginas de idioma

`index.html` (español) y `assets/js/i18n.js` (diccionario) son los únicos archivos que se editan a mano. Después de tocar cualquiera de los dos:

```bash
node tools/build-lang-pages.js
```

Esto reescribe `en/index.html`, `fr/index.html`, `pt/index.html`, `ar/index.html`, `zh/index.html` y `ja/index.html` desde cero. Si añades una sección nueva o una clave `data-i18n` nueva en `index.html`, añade su traducción en las 7 entradas de `assets/js/i18n.js` antes de regenerar (si falta una clave en algún idioma, el generador deja la clave sin traducir en su lugar en vez de fallar, así que conviene revisar la salida).

## Publicar en GitHub Pages

1. Crea el repositorio en GitHub (por ejemplo `avanzagrabie/GrabieApps`) y súbelo:
   ```bash
   git remote add origin https://github.com/avanzagrabie/GrabieApps.git
   git push -u origin main
   ```
2. En **Settings → Pages** del repositorio, en "Build and deployment" selecciona **GitHub Actions** como origen (el workflow en `.github/workflows/deploy.yml` ya está listo y se ejecuta automáticamente en cada push a `main`).
3. Alternativa sin Actions: en **Settings → Pages** elige "Deploy from a branch" → `main` → `/ (root)`. No hace falta build.

## Google Search Console

1. La propiedad ya está verificada vía meta tag (`google-site-verification` en el `<head>` de `index.html`).
2. En Search Console → **Sitemaps**, añade `sitemap.xml` (URL completa: `https://avanzagrabie.github.io/GrabieApps/sitemap.xml`).
3. Opcional: usa **Inspección de URLs** para pedir la indexación manual de `/`, `/en/`, etc. la primera vez, en vez de esperar al rastreo natural.

## Personalización pendiente

- El enlace de GitHub en el pie de página apunta a `github.com/avanzagrabie` — actualízalo si procede.
- No hay ninguna vía de contacto pública por diseño (el estudio solo opera bajo invitación). Si en algún momento quieres reintroducir un canal de contacto, añade de nuevo la clave `nav.contact` y el namespace `contact.*` en `assets/js/i18n.js` para los 7 idiomas, y actualiza `tools/build-lang-pages.js` si el nuevo contenido necesita tratamiento especial.
