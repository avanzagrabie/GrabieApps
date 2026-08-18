# Gabriel Díaz Bernal — sitio web

Sitio estático (GitHub Pages) del estudio de ingeniería de Gabriel Díaz Bernal. Sin frameworks, sin frontend build: HTML, CSS y JavaScript vainilla. Un único script Node interno (`tools/build-lang-pages.js`) genera las páginas finales optimizadas — ver [SEO y multi-idioma](#seo-y-multi-idioma) y [Rendimiento](#rendimiento) más abajo.

**Sitio en vivo:** https://avanzagrabie.github.io/GrabieApps/

## Características

- **Diseño propio**, oscuro y técnico, con fondo animado (canvas), terminal interactiva en el hero y microinteracciones en JS vainilla.
- **7 idiomas** (Español, English, Français, Português, العربية, 中文, 日本語), cada uno en su **propia URL** — no un solo URL que cambia de texto por JS. Ver [SEO y multi-idioma](#seo-y-multi-idioma).
- **Contacto muy restringido, no un formulario abierto**: solo se aceptan clientes por invitación. El formulario (`#contact`) pide únicamente un código de invitación y no lo envía a ningún sitio — al enviarlo, `assets/js/main.js` solo cambia qué se muestra en la propia página, sin red ni almacenamiento de por medio. Ver [Contacto](#contacto).
- **Casos de estudio de videojuegos**: página propia por título (`sniper-3d.html`, `cities-skylines-2.html`, 7 idiomas cada una) explicando el trabajo de motor en Sniper 3D: Gun Shooting Games y Cities: Skylines II, con enlaces a las tiendas oficiales. Ver [Juegos](#juegos).
- **SEO al detalle**: canonical + `hreflang` por idioma, Open Graph/Twitter localizados, JSON-LD (`Person`, `ProfessionalService`, `WebSite`), `sitemap.xml` generado (no editado a mano) con anotaciones de idioma (+ hoja de estilo para verlo legible en el navegador), `robots.txt`, verificación de Google Search Console.
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
sniper-3d.html                 ) Casos de estudio de videojuegos, misma lógica, 7 idiomas.
en/sniper-3d.html               )
cities-skylines-2.html          )
en/cities-skylines-2.html       )
...                             )
404.html                      )
sitemap.xml                   ) Generado por el build — NO se edita a mano.
tools/
  template.html                Fuente en español (portada) — SE EDITA a mano
  privacy-template.html        Fuente de la página de privacidad — SE EDITA a mano
  game-sniper3d-template.html  Fuente del caso de estudio de Sniper 3D — SE EDITA a mano
  game-cities2-template.html   Fuente del caso de estudio de Cities: Skylines II — SE EDITA a mano
  404-template.html            Fuente de la página 404 — SE EDITA a mano
  build-lang-pages.js          Generador (Node, sin dependencias)
assets/
  css/style.css                Fuente del diseño — SE EDITA a mano (se incrusta en el build)
  js/i18n.js                   Diccionario de 7 idiomas — SE EDITA a mano (solo lo lee el build)
  js/main.js                   Interacciones: nav, terminal, fondo animado — se sirve tal cual
  img/                         Favicon, iconos, imagen Open Graph
sitemap.xsl, robots.txt, manifest.webmanifest, .nojekyll
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

`sitemap.xml` ya no se edita a mano: lo genera `renderSitemap()` dentro de `tools/build-lang-pages.js` a partir de la lista real de páginas (home, privacidad y cada caso de estudio de videojuego) × los 7 idiomas, así que nunca puede desincronizarse de lo que el build produce realmente. Añadir una página nueva es registrarla una vez en el script, no copiar y pegar 7 bloques `<url>` a mano.

## Juegos

`sniper-3d.html` y `cities-skylines-2.html` (y sus 6 versiones de idioma cada uno) son páginas de caso de estudio para los dos títulos que sí podemos nombrar públicamente — el resto del trabajo de motor con otros estudios queda bajo NDA y no se menciona por nombre (ver el aviso en `#clients` de la portada).

Cada página explica en qué consiste "el motor" en ese género de juego, qué hicimos concretamente a nivel de motor (nunca diseño ni arte), y enlaza a las tiendas oficiales reales (App Store/Google Play para Sniper 3D, Steam/Paradox Interactive para Cities: Skylines II).

**Las capturas de pantalla son marcadores de posición**, no imágenes reales del juego: son propiedad de Wildlife Studios y de Paradox Interactive/Colossal Order respectivamente, y no había forma de verificar aquí mismo que tuviéramos derecho a publicarlas. La sección `.game-shot-grid` de cada plantilla (`tools/game-sniper3d-template.html`, `tools/game-cities2-template.html`) tiene un comentario HTML en cada bloque indicando exactamente dónde va la etiqueta `<img>` real cuando lleguen las capturas con derechos confirmados por el estudio — sustituir el `<div class="game-shot">` correspondiente y regenerar.

## Rendimiento

Cada página generada es **una única respuesta HTTP**: HTML, CSS y JS, todo en el mismo archivo. Eso sale de tres decisiones que toma el build, no algo que haya que mantener a mano:

- **El CSS va incrustado** (`<style>` en el `<head>`, generado a partir de `assets/css/style.css`) en vez de enlazado — elimina la solicitud que bloqueaba el renderizado inicial.
- **`assets/js/main.js` también va incrustado** (`<script>` al final del `<body>`, generado a partir de `assets/js/main.js`) — GitHub Pages fija el `Cache-Control` en 10 minutos para cualquier archivo estático y no hay forma de cambiarlo desde aquí, así que la única manera de que Lighthouse deje de avisar de "tiempos de caché ineficientes" para ese archivo es no servirlo aparte.
- **`assets/js/i18n.js` no se sirve nunca.** Es solo la fuente de datos que lee el generador en build time; lo único que un visitante necesitaba de ahí en runtime eran las 5 líneas de la terminal animada del hero, así que cada página lleva ya esas 5 líneas — en su propio idioma — incrustadas en un `<script>` de un par de líneas.

Si vuelves a ver "solicitudes que bloquean el renderizado" o "tiempos de caché ineficientes" en Lighthouse/PageSpeed después de tocar `tools/template.html`, revisa que no hayas reintroducido un `<link rel="stylesheet">`, un `<script src="assets/js/main.js">` o un `<script src="assets/js/i18n.js">` sueltos — el generador espera encontrarlos exactamente una vez, con ese texto exacto, para poder sustituirlos.

### Regenerar las páginas

`tools/template.html` (contenido en español), `tools/privacy-template.html`, `tools/game-sniper3d-template.html`, `tools/game-cities2-template.html`, `tools/404-template.html` y `assets/js/i18n.js` (diccionario) son los únicos archivos que se editan a mano — igual que `assets/css/style.css` para el diseño. Después de tocar cualquiera de ellos:

```bash
node tools/build-lang-pages.js
```

Esto reescribe `index.html`, `en/index.html`, `fr/index.html`, `pt/index.html`, `ar/index.html`, `zh/index.html`, `ja/index.html`, las 7 `privacy.html`, las 7 `sniper-3d.html`, las 7 `cities-skylines-2.html`, `404.html` y `sitemap.xml` desde cero, con el CSS ya incrustado y las traducciones ya horneadas. Si añades una sección nueva o una clave `data-i18n` nueva en cualquiera de las plantillas, añade su traducción en las 7 entradas de `assets/js/i18n.js` antes de regenerar (si falta una clave en algún idioma, el generador deja la clave sin traducir en su lugar en vez de fallar, así que conviene revisar la salida).

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

El formulario (`tools/template.html`, sección `#contact`) no tiene backend ni lo necesita, y no envía nada a ningún sitio: pide un código de invitación y, al enviarlo, `assets/js/main.js` (`initContactForm`) solo oculta el campo (`#contact-form-fields`) y muestra un mensaje de confirmación estático (`#contact-form-sent`) en la misma página — sin petición de red, sin redirección, sin ventana emergente. No hay ningún dato que salga del navegador del visitante, así que este sitio nunca recibe, procesa ni almacena nada de ese formulario; por eso la página de privacidad sigue siendo honesta sin necesitar un backend.

Quién realmente contacta a quién queda fuera del sitio web por diseño: las normas mostradas junto al formulario (`contact.rule1`–`rule6` en `assets/js/i18n.js`) explican el proceso en texto, no en código — no hay ningún mecanismo de contacto automatizado ni de terceros que mantener aquí.

## Personalización pendiente

- El enlace de GitHub en el pie de página apunta a `github.com/avanzagrabie` — actualízalo si procede.
- Las capturas de pantalla en `sniper-3d.html` y `cities-skylines-2.html` son marcadores de posición (ver [Juegos](#juegos)) — sustitúyelas por las capturas reales en cuanto tengas los derechos confirmados.
