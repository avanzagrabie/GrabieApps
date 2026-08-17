# Gabriel Díaz Bernal — sitio web

Sitio estático (GitHub Pages) del estudio de ingeniería de Gabriel Díaz Bernal. Sin frameworks, sin build step, sin dependencias externas: HTML, CSS y JavaScript vainilla.

**Sitio en vivo:** https://avanzagrabie.github.io/GrabieApps/

## Características

- **Diseño propio**, oscuro y técnico, con fondo animado (canvas), terminal interactiva en el hero y microinteracciones en JS vainilla.
- **7 idiomas** (Español, English, Français, Português, العربية, 中文, 日本語): se detecta el idioma del dispositivo (`navigator.language`) y se puede cambiar manualmente desde el selector del menú. El árabe activa `dir="rtl"` automáticamente; la ventana de terminal se mantiene siempre LTR (como cualquier bloque de código). Ver [assets/js/i18n.js](assets/js/i18n.js).
- **Sin sección de contacto**: el estudio trabaja solo bajo invitación, así que no hay formulario ni email público — es una decisión de posicionamiento, no un descuido.
- **SEO**: metadatos completos (title/description/canonical), Open Graph + Twitter Cards con imágenes generadas a medida, datos estructurados JSON-LD (`Person`, `ProfessionalService`, `Blog`, `BlogPosting`), `sitemap.xml`, `robots.txt` y `manifest.webmanifest`.
- **Blog** estático en [blog/](blog/), con 3 artículos de ejemplo.
- **Cero dependencias**: no hay CDNs, ni Google Fonts, ni frameworks. Todo el CSS/JS vive en `assets/`.

## Estructura

```
index.html                  Página principal (una sola página con secciones ancla)
404.html                    Página de error personalizada
blog/
  index.html                 Listado del blog
  ia-agentica-produccion.html
  edge-computing-distribuido.html
  criptografia-post-cuantica.html
assets/
  css/style.css              Sistema de diseño completo
  js/i18n.js                  Traducciones (es/en/fr/pt) + detección de idioma
  js/main.js                  Interacciones: nav, terminal, fondo animado, formulario
  img/                        Favicon, iconos, imágenes Open Graph
sitemap.xml, robots.txt, manifest.webmanifest, .nojekyll
.github/workflows/deploy.yml  Despliegue automático a GitHub Pages
```

## Ejecutar en local

No requiere instalación. Basta con abrir `index.html` en el navegador, o servirlo con cualquier servidor estático, por ejemplo:

```bash
python -m http.server 8080
# o
npx serve .
```

## Publicar en GitHub Pages

1. Crea el repositorio en GitHub (por ejemplo `avanzagrabie/GrabieApps`) y súbelo:
   ```bash
   git remote add origin https://github.com/avanzagrabie/GrabieApps.git
   git push -u origin main
   ```
2. En **Settings → Pages** del repositorio, en "Build and deployment" selecciona **GitHub Actions** como origen (el workflow en `.github/workflows/deploy.yml` ya está listo y se ejecuta automáticamente en cada push a `main`).
3. Alternativa sin Actions: en **Settings → Pages** elige "Deploy from a branch" → `main` → `/ (root)`. No hace falta build.

## Añadir una entrada al blog

1. Duplica cualquier archivo de `blog/` (por ejemplo `blog/ia-agentica-produccion.html`) y renómbralo con el slug del nuevo artículo.
2. Sustituye las claves `data-i18n="post_xxx.*"` por un nuevo namespace (`post_nuevo.*`) y añade esas claves con su traducción en los 7 idiomas dentro de `assets/js/i18n.js`.
3. Añade una tarjeta nueva en `blog/index.html` (y opcionalmente en la vista previa de `index.html`).
4. Añade la URL del nuevo artículo a `sitemap.xml`.
5. Genera una imagen Open Graph a juego si quieres (ver el generador en el historial del proyecto, basado en `System.Drawing`) o reutiliza `assets/img/og-default.png`.

## Personalización pendiente

- El enlace de GitHub en el pie de página apunta a `github.com/avanzagrabie` — actualízalo si procede.
- No hay ninguna vía de contacto pública por diseño (el estudio solo opera bajo invitación). Si en algún momento quieres reintroducir un canal de contacto, añade de nuevo la clave `nav.contact` y el namespace `contact.*` en `assets/js/i18n.js` para los 7 idiomas.
