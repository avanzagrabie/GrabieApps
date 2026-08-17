# Gabriel Díaz Bernal — sitio web

Sitio estático (GitHub Pages) del estudio de ingeniería de Gabriel Díaz Bernal. Sin frameworks, sin frontend build: HTML, CSS y JavaScript vainilla. Un único script Node interno (`tools/build-lang-pages.js`) genera las páginas finales optimizadas — ver [SEO y multi-idioma](#seo-y-multi-idioma) y [Rendimiento](#rendimiento) más abajo.

**Sitio en vivo:** https://avanzagrabie.github.io/GrabieApps/

## Características

- **Diseño propio**, oscuro y técnico, con fondo animado (canvas), terminal interactiva en el hero y microinteracciones en JS vainilla.
- **7 idiomas** (Español, English, Français, Português, العربية, 中文, 日本語), cada uno en su **propia URL** — no un solo URL que cambia de texto por JS. Ver [SEO y multi-idioma](#seo-y-multi-idioma).
- **Contacto muy restringido, no un formulario abierto**: solo se aceptan clientes por invitación. El formulario (`#contact`) no envía nada a ningún servidor nuestro — abre un chat de Telegram con el mensaje ya redactado (`t.me/Chichanofis?text=...`) y el visitante decide si lo envía. Ver [Contacto](#contacto).
- **SEO al detalle**: canonical + `hreflang` por idioma, Open Graph/Twitter localizados, JSON-LD (`Person`, `ProfessionalService`, `WebSite`), `sitemap.xml` con anotaciones de idioma (+ hoja de estilo para verlo legible en el navegador), `robots.txt`, verificación de Google Search Console.
- **Cada página es 1 sola solicitud HTTP**: HTML, CSS y JS, todo inline. Nada más que cargar — ver [Rendimiento](#rendimiento).
- **Cero cookies, cero analítica, cero rastreo** — verificable, no solo declarado. Página de privacidad honesta en los 7 idiomas (`/privacy.html`) explicando exactamente eso. Ver [Privacidad](#privacidad-y-cumplimiento).
- **Fuera de la Wayback Machine**: `robots.txt` excluye a `ia_archiver`/`archive.org_bot` y todas las páginas llevan `noarchive` — ver [Archivado](#archivado).

## Estructura

```
index.html                    ) Generadas por tools/build-lang-pages.js —
en/index.html                 ) NO se editan a mano, se regeneran.
fr/index.html                 )
pt/index.html                 )
ar/index.html                 )
zh/index.html                 )
ja/index.html                 )
privacy.html                  ) Página de privacidad, misma lógica, 7 idiomas.
en/privacy.html                )
...                            )
404.html                      )
tools/
  template.html                Fuente en español (portada) — SE EDITA a mano
  privacy-template.html        Fuente de la página de privacidad — SE EDITA a mano
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

Cada página generada es **una única respuesta HTTP**: HTML, CSS y JS, todo en el mismo archivo. Eso sale de tres decisiones que toma el build, no algo que haya que mantener a mano:

- **El CSS va incrustado** (`<style>` en el `<head>`, generado a partir de `assets/css/style.css`) en vez de enlazado — elimina la solicitud que bloqueaba el renderizado inicial.
- **`assets/js/main.js` también va incrustado** (`<script>` al final del `<body>`, generado a partir de `assets/js/main.js`) — GitHub Pages fija el `Cache-Control` en 10 minutos para cualquier archivo estático y no hay forma de cambiarlo desde aquí, así que la única manera de que Lighthouse deje de avisar de "tiempos de caché ineficientes" para ese archivo es no servirlo aparte.
- **`assets/js/i18n.js` no se sirve nunca.** Es solo la fuente de datos que lee el generador en build time; lo único que un visitante necesitaba de ahí en runtime eran las 5 líneas de la terminal animada del hero, así que cada página lleva ya esas 5 líneas — en su propio idioma — incrustadas en un `<script>` de un par de líneas.

Si vuelves a ver "solicitudes que bloquean el renderizado" o "tiempos de caché ineficientes" en Lighthouse/PageSpeed después de tocar `tools/template.html`, revisa que no hayas reintroducido un `<link rel="stylesheet">`, un `<script src="assets/js/main.js">` o un `<script src="assets/js/i18n.js">` sueltos — el generador espera encontrarlos exactamente una vez, con ese texto exacto, para poder sustituirlos.

### Regenerar las páginas

`tools/template.html` (contenido en español), `tools/privacy-template.html`, `tools/404-template.html` y `assets/js/i18n.js` (diccionario) son los únicos archivos que se editan a mano — igual que `assets/css/style.css` para el diseño. Después de tocar cualquiera de ellos:

```bash
node tools/build-lang-pages.js
```

Esto reescribe `index.html`, `en/index.html`, `fr/index.html`, `pt/index.html`, `ar/index.html`, `zh/index.html`, `ja/index.html`, las 7 `privacy.html` y `404.html` desde cero, con el CSS ya incrustado y las traducciones ya horneadas. Si añades una sección nueva o una clave `data-i18n` nueva en cualquiera de las plantillas, añade su traducción en las 7 entradas de `assets/js/i18n.js` antes de regenerar (si falta una clave en algún idioma, el generador deja la clave sin traducir en su lugar en vez de fallar, así que conviene revisar la salida).

## Privacidad y cumplimiento

El sitio no usa cookies (propias ni de terceros), no ejecuta ningún script de analítica, no carga nada desde fuera de este dominio y no tiene ningún formulario — no hay ningún dato personal que recopilar. Esto no es una afirmación de marketing: se puede verificar con `grep -rn "localStorage\|document.cookie" assets/js/` (sin coincidencias) o mirando las cabeceras de red de cualquier página (sin `Set-Cookie`).

Como consecuencia:

- **No hay banner de cookies.** Mostrar uno pidiendo consentimiento para cookies que no existen sería inexacto, no "más cumplidor" — el RGPD (y leyes equivalentes: CCPA/CPRA, LGPD, etc.) exigen consentimiento *antes de* usar cookies no esenciales; si no hay ninguna, no hay nada que consentir.
- **`/privacy.html`** (y su versión en cada idioma) documenta esto explícitamente: qué no hacemos, por qué el RGPD y normativas equivalentes no aplican al no haber tratamiento de datos, y una nota sobre qué procesa GitHub Pages como parte del hosting (fuera de nuestro control).
- Si en el futuro se añade **cualquier** cookie, script de analítica, formulario o recurso de terceros, hay que actualizar `tools/privacy-template.html` para reflejarlo con precisión — y probablemente entonces sí haga falta un banner de consentimiento real.

## Archivado

`robots.txt` excluye explícitamente a `ia_archiver` y `archive.org_bot` (el crawler de la Wayback Machine de Internet Archive), y todas las páginas llevan `<meta name="robots" content="... noarchive">`, que además evita que Google/Bing ofrezcan una copia en caché del sitio.

Esto es lo estándar y lo que los archivadores que se comportan bien (incluida la Wayback Machine) respetan — pero es una señal voluntaria, no un candado. Ninguna página pública en la web puede impedir de forma absoluta que alguien la capture: siempre queda ver el código fuente, guardarla desde el navegador, hacer una captura de pantalla o usar una herramienta de archivado que ignore `robots.txt`. Si el dominio llegara a tener capturas antiguas ya guardadas en el Wayback Machine (poco probable, es nuevo), hay que pedir su retirada directamente en `archive.org/about/exclude.php` — eso no se puede automatizar desde el repositorio.

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

## Contacto

El formulario (`tools/template.html`, sección `#contact`) no tiene backend ni lo necesita: al enviarlo, `assets/js/main.js` construye el texto a partir de los campos y abre `https://t.me/Chichanofis?text=...` en una pestaña nueva — el navegador (o la app) de Telegram del propio visitante es quien realmente envía el mensaje, si el visitante decide confirmarlo. Este sitio nunca recibe, procesa ni almacena esos datos; por eso la página de privacidad sigue siendo honesta sin necesitar un backend.

**No se usa ni se expone ningún token de bot de Telegram** — hacerlo en código público sería una fuga de credenciales real, ya que cualquiera podría leerlo con solo ver el código fuente. Un enlace `t.me/usuario` es el único mecanismo compatible con un sitio 100% estático sin comprometer eso.

Para cambiar el destinatario, edita el atributo `data-telegram` del `<form>` en `tools/template.html` y regenera con `node tools/build-lang-pages.js`.

## Personalización pendiente

- El enlace de GitHub en el pie de página apunta a `github.com/avanzagrabie` — actualízalo si procede.
