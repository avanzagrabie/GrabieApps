# Gabriel Díaz Bernal — sitio web

Sitio estático (GitHub Pages) del estudio de ingeniería de Gabriel Díaz Bernal. Sin frameworks, sin frontend build: HTML, CSS y JavaScript vainilla. Un único script Node interno (`tools/build-lang-pages.js`) genera las páginas finales optimizadas — ver [SEO y multi-idioma](#seo-y-multi-idioma) y [Rendimiento](#rendimiento) más abajo.

**Sitio en vivo:** https://avanzagrabie.github.io/GrabieApps/

## Características

- **Diseño propio**, oscuro y técnico, con fondo animado (canvas), terminal interactiva en el hero y microinteracciones en JS vainilla.
- **7 idiomas** (Español, English, Français, Português, العربية, 中文, 日本語), cada uno en su **propia URL** — no un solo URL que cambia de texto por JS. Ver [SEO y multi-idioma](#seo-y-multi-idioma).
- **Sin sección de contacto**: el estudio trabaja solo bajo invitación, así que no hay formulario ni email público — es una decisión de posicionamiento, no un descuido.
- **SEO al detalle**: canonical + `hreflang` por idioma, Open Graph/Twitter localizados, JSON-LD (`Person`, `ProfessionalService`, `WebSite`), `sitemap.xml` con anotaciones de idioma (+ hoja de estilo para verlo legible en el navegador), `robots.txt`, verificación de Google Search Console.
- **Cada página shippea 2 requests**: el HTML y un `main.js` diferido. Nada más — ver [Rendimiento](#rendimiento).

## Estructura

```
index.html                    ) Generadas por tools/build-lang-pages.js —
en/index.html                 ) NO se editan a mano, se regeneran.
fr/index.html                 )
pt/index.html                 )
ar/index.html                 )
zh/index.html                 )
ja/index.html                 )
404.html                      )
tools/
  template.html                Fuente en español — SE EDITA a mano
  404-template.html            Fuente de la página 404 — SE EDITA a mano
  build-lang-pages.js          Generador (Node, sin dependencias)
assets/
  css/style.css                Fuente del diseño — SE EDITA a mano (se incrusta en el build)
  js/i18n.js                   Diccionario de 7 idiomas — SE EDITA a mano (solo lo lee el build)
  js/main.js                   Interacciones: nav, terminal, fondo animado — se sirve tal cual
  img/                         Favicon, iconos, imagen Open Graph
sitemap.xml, sitemap.xsl, robots.txt, manifest.webmanifest, .nojekyll
.github/workflows/deploy.yml   Despliegue automático a GitHub Pages
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
- El mismo bloque en `sitemap.xml` vía `<xhtml:link>` (con `sitemap.xsl` para que se vea como tabla si lo abres directamente en el navegador — los buscadores ignoran esa hoja de estilo).
- JSON-LD con la descripción traducida.

El selector de idioma del menú no usa JavaScript para "cambiar" nada — son enlaces `<a>` normales a la URL de cada idioma, con el idioma activo marcado (`aria-current`).

## Rendimiento

Cada página shippea exactamente **2 requests**: el HTML y `assets/js/main.js` (con `defer`, no bloquea el render). Eso sale de dos decisiones que toma el build, no algo que haya que mantener a mano:

- **El CSS va incrustado** (`<style>` en el `<head>`, generado a partir de `assets/css/style.css`) en vez de enlazado — elimina la solicitud que bloqueaba el renderizado inicial.
- **`assets/js/i18n.js` no se sirve nunca.** Es solo la fuente de datos que lee el generador en build time; lo único que un visitante necesitaba de ahí en runtime eran las 5 líneas de la terminal animada del hero, así que cada página lleva ya esas 5 líneas — en su propio idioma — incrustadas en un `<script>` de un par de líneas.

Si vuelves a ver "solicitudes que bloquean el renderizado" o similar en Lighthouse/PageSpeed después de tocar `tools/template.html`, revisa que no hayas reintroducido un `<link rel="stylesheet">` o un `<script src="assets/js/i18n.js">` sueltos — el generador espera encontrarlos exactamente una vez, con ese texto exacto, para poder sustituirlos.

### Regenerar las páginas

`tools/template.html` (contenido en español), `tools/404-template.html` y `assets/js/i18n.js` (diccionario) son los únicos archivos que se editan a mano — igual que `assets/css/style.css` para el diseño. Después de tocar cualquiera de ellos:

```bash
node tools/build-lang-pages.js
```

Esto reescribe `index.html`, `en/index.html`, `fr/index.html`, `pt/index.html`, `ar/index.html`, `zh/index.html`, `ja/index.html` y `404.html` desde cero, con el CSS ya incrustado y las traducciones ya horneadas. Si añades una sección nueva o una clave `data-i18n` nueva en `tools/template.html`, añade su traducción en las 7 entradas de `assets/js/i18n.js` antes de regenerar (si falta una clave en algún idioma, el generador deja la clave sin traducir en su lugar en vez de fallar, así que conviene revisar la salida).

## Publicar en GitHub Pages

1. Crea el repositorio en GitHub (por ejemplo `avanzagrabie/GrabieApps`) y súbelo:
   ```bash
   git remote add origin https://github.com/avanzagrabie/GrabieApps.git
   git push -u origin main
   ```
2. En **Settings → Pages** del repositorio, en "Build and deployment" selecciona **GitHub Actions** como origen (el workflow en `.github/workflows/deploy.yml` ya está listo y se ejecuta automáticamente en cada push a `main`).
3. Alternativa sin Actions: en **Settings → Pages** elige "Deploy from a branch" → `main` → `/ (root)`. No hace falta build.

## Google Search Console

1. La propiedad ya está verificada vía meta tag (`google-site-verification` en el `<head>`).
2. En Search Console → **Sitemaps**, añade `sitemap.xml` (URL completa: `https://avanzagrabie.github.io/GrabieApps/sitemap.xml`).
3. Opcional: usa **Inspección de URLs** para pedir la indexación manual de `/`, `/en/`, etc. la primera vez, en vez de esperar al rastreo natural.

## Personalización pendiente

- El enlace de GitHub en el pie de página apunta a `github.com/avanzagrabie` — actualízalo si procede.
- No hay ninguna vía de contacto pública por diseño (el estudio solo opera bajo invitación). Si en algún momento quieres reintroducir un canal de contacto, añade de nuevo la clave `nav.contact` y el namespace `contact.*` en `assets/js/i18n.js` para los 7 idiomas, y actualiza `tools/build-lang-pages.js` si el nuevo contenido necesita tratamiento especial.
