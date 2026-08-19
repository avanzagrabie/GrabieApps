#!/usr/bin/env node
/* =========================================================
   build-lang-pages.js
   ---------------------------------------------------------
   Generates one fully-translated, statically-baked, performance-
   optimized HTML page per language (es at the repo root, plus
   en/fr/pt/ar/zh/ja subfolders) from tools/template.html (the
   hand-edited Spanish source) and assets/js/i18n.js (the
   translation dictionary).

   Why a build step at all, given "no build step" was the original
   pitch: search engines need one crawlable, self-contained URL per
   language (see README → SEO y multi-idioma), and performance
   audits (Lighthouse) want the render-blocking stylesheet inlined
   and no unnecessary script fetched just to type five lines into a
   terminal widget. Doing both by hand across 7 pages would drift;
   this script keeps them in lockstep with one source of truth.

   Per generated page:
     - data-i18n / data-i18n-attr text baked in as plain HTML,
       attributes stripped.
     - assets/css/style.css inlined into a <style> tag — removes
       the render-blocking CSS request entirely.
     - assets/js/main.js inlined into a <script> tag too — GitHub
       Pages fixes Cache-Control at 10 minutes for every static
       asset and there's no way to override that here, so the only
       way to stop Lighthouse flagging "inefficient cache lifetime"
       for it is to not ship it as a separate request at all.
     - assets/js/i18n.js is NOT shipped at all. Instead, a tiny
       inline <script> carries just that page's 5 terminal
       cmd/out pairs for the inlined main.js's typewriter.
     - <html lang dir>, title/description/OG/Twitter, canonical,
       the full hreflang cluster, og:locale (+alternates), the
       language-switcher menu (own language marked current) and
       the JSON-LD description are all set per language.
     - Remaining local asset paths (favicon, manifest) get a `../`
       prefix for the 6 subpages (they live one level deep).

   Net result: every generated page is a single HTTP response —
   HTML, CSS and JS all inline, nothing else to fetch.

   Run after editing tools/template.html, assets/css/style.css
   and/or assets/js/i18n.js:
     node tools/build-lang-pages.js
   ========================================================= */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASE_URL = "https://avanzagrabie.github.io/GrabieApps/";

const LANGS = {
  es: { name: "Español", code: "ES", dir: "ltr", locale: "es_ES" },
  en: { name: "English", code: "EN", dir: "ltr", locale: "en_US" },
  fr: { name: "Français", code: "FR", dir: "ltr", locale: "fr_FR" },
  pt: { name: "Português", code: "PT", dir: "ltr", locale: "pt_PT" },
  ar: { name: "العربية", code: "AR", dir: "rtl", locale: "ar_AR" },
  zh: { name: "中文", code: "ZH", dir: "ltr", locale: "zh_CN" },
  ja: { name: "日本語", code: "JA", dir: "ltr", locale: "ja_JP" }
};
const ORDER = ["es", "en", "fr", "pt", "ar", "zh", "ja"];
const TERM_KEYS = ["term1_cmd", "term1_out", "term2_cmd", "term2_out", "term3_cmd", "term3_out", "term4_cmd", "term4_out", "term5_cmd", "term5_out"];

function urlFor(lang) {
  return lang === "es" ? BASE_URL : `${BASE_URL}${lang}/`;
}
function outPathFor(lang) {
  return lang === "es" ? path.join(ROOT, "index.html") : path.join(ROOT, lang, "index.html");
}
function urlForPrivacy(lang) {
  return lang === "es" ? `${BASE_URL}privacy.html` : `${BASE_URL}${lang}/privacy.html`;
}
function outPathForPrivacy(lang) {
  return lang === "es" ? path.join(ROOT, "privacy.html") : path.join(ROOT, lang, "privacy.html");
}

// Game case-study pages (one flat file per language, same pattern as privacy.html).
// `images` (optional): filenames under assets/img/games/<slug>/, listed in sitemap.xml's
// image extension so Google Images has a direct feed of what's on each page.
const GAMES = [
  { slug: "sniper-3d", templateFile: "game-sniper3d-template.html" },
  {
    slug: "cities-skylines-2", templateFile: "game-cities2-template.html",
    images: [
      "cities-skylines-2-puerto-industrial.webp",
      "cities-skylines-2-vista-aerea-dirigible.webp",
      "cities-skylines-2-herramienta-carreteras.webp",
      "cities-skylines-2-ciudad-montanas-lago.webp",
      "cities-skylines-2-nudo-autopista-atardecer.webp",
      "cities-skylines-2-litoral-montanas-dia.webp",
      "cities-skylines-2-diseno-rotonda.webp",
      "cities-skylines-2-horizonte-nocturno-aurora.webp"
    ]
  },
  { slug: "rosmino", templateFile: "game-rosmino-template.html" },
  { slug: "perfect-studio", templateFile: "game-perfectstudio-template.html" }
];
function urlForGame(slug, lang) {
  return lang === "es" ? `${BASE_URL}${slug}.html` : `${BASE_URL}${lang}/${slug}.html`;
}
function outPathForGame(slug, lang) {
  return lang === "es" ? path.join(ROOT, `${slug}.html`) : path.join(ROOT, lang, `${slug}.html`);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
function escapeJson(s) {
  return JSON.stringify(String(s)).slice(1, -1);
}

function extractI18N(jsSource) {
  const marker = "var I18N = {";
  const start = jsSource.indexOf(marker);
  if (start === -1) throw new Error("Could not find 'var I18N = {' in i18n.js");
  const braceStart = start + marker.length - 1;
  let depth = 0, end = -1;
  for (let i = braceStart; i < jsSource.length; i++) {
    if (jsSource[i] === "{") depth++;
    else if (jsSource[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error("Unbalanced braces while parsing I18N object");
  const literal = jsSource.slice(start + "var I18N = ".length, end + 1);
  // eslint-disable-next-line no-new-func
  return new Function("return (" + literal + ");")();
}

function buildLangMenu(currentLang, urlFn) {
  const fn = urlFn || urlFor;
  const lines = ORDER.map((l) => {
    const cur = l === currentLang ? ' aria-current="true"' : "";
    return `          <a role="menuitem" href="${fn(l)}"${cur}>${LANGS[l].name} <span class="code">${LANGS[l].code}</span></a>`;
  });
  return `<div class="lang-menu" role="menu">\n${lines.join("\n")}\n        </div>`;
}

function buildLocaleBlock(currentLang) {
  const lines = [`<meta property="og:locale" content="${LANGS[currentLang].locale}">`];
  ORDER.filter((l) => l !== currentLang).forEach((l) => {
    lines.push(`<meta property="og:locale:alternate" content="${LANGS[l].locale}">`);
  });
  return lines.join("\n");
}

function buildTerminalScript(dict) {
  var lines = [];
  for (var i = 0; i < TERM_KEYS.length; i += 2) {
    var cmdKey = "hero." + TERM_KEYS[i], outKey = "hero." + TERM_KEYS[i + 1];
    lines.push({ cmd: dict[cmdKey] !== undefined ? dict[cmdKey] : cmdKey, out: dict[outKey] !== undefined ? dict[outKey] : outKey });
  }
  return `<script>window.GDB_TERMINAL_LINES=${JSON.stringify(lines)};</script>`;
}

function renderPage(templateHtml, lang, dict, cssContent, jsContent) {
  let html = templateHtml;

  // <html lang dir>
  html = html.replace(
    /<html lang="es">/,
    LANGS[lang].dir === "rtl" ? `<html lang="${lang}" dir="rtl">` : `<html lang="${lang}">`
  );

  // <meta ... content="OLD" data-i18n-attr="content:KEY"> -> filled in, attribute stripped
  html = html.replace(
    /<meta\b([^>]*?)content="[^"]*"([^>]*?)\sdata-i18n-attr="content:([a-zA-Z0-9_.]+)"([^>]*)>/g,
    (m, pre, mid, key, post) => {
      const val = dict[key] !== undefined ? dict[key] : key;
      return `<meta${pre}content="${escapeAttr(val)}"${mid}${post}>`;
    }
  );

  // any element with data-i18n="KEY">TEXT< -> filled in, attribute stripped
  html = html.replace(
    /\sdata-i18n="([a-zA-Z0-9_.]+)"([^>]*)>([^<]*)</g,
    (m, key, restAttrs, oldText) => {
      const val = dict[key] !== undefined ? dict[key] : key;
      return `${restAttrs}>${escapeHtml(val)}<`;
    }
  );

  // canonical + og:url -> this page's own URL
  const selfUrl = urlFor(lang);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${selfUrl}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${selfUrl}">`);

  // og:locale block -> this language primary, the rest as alternates
  html = html.replace(
    /<meta property="og:locale" content="[^"]*">\n(?:<meta property="og:locale:alternate" content="[^"]*">\n?)+/,
    buildLocaleBlock(lang) + "\n"
  );

  // language switcher menu -> same 7 links, this page's own language marked current
  html = html.replace(/<div class="lang-menu" role="menu">[\s\S]*?<\/div>/, buildLangMenu(lang));

  // top lang button code (only the one immediately followed by </button>, not a menu item's </a>)
  html = html.replace(/<span class="code">ES<\/span>\s*<\/button>/, `<span class="code">${LANGS[lang].code}</span>\n        </button>`);

  // JSON-LD ProfessionalService description -> translated meta.description
  html = html.replace(
    /"description": "Estudio distribuido de 25 ingenieros de software de élite que trabaja bajo demanda y acepta proyectos solo bajo condiciones muy selectas\."/,
    `"description": "${escapeJson(dict["meta.description"])}"`
  );

  // inline the stylesheet: no render-blocking request, no separate cached asset to manage
  html = html.replace(
    /<link rel="stylesheet" href="assets\/css\/style\.css">/,
    `<style>\n${cssContent}\n</style>`
  );

  // i18n.js is not shipped: swap it for a tiny inline snippet with just this
  // page's 5 terminal lines, which is all the client ever needed from it.
  html = html.replace(
    /<script src="assets\/js\/i18n\.js" defer><\/script>\n/,
    buildTerminalScript(dict) + "\n"
  );

  // remaining local asset paths -> one level up (subpages live at /{lang}/index.html)
  if (lang !== "es") {
    html = html.replace(/href="assets\//g, 'href="../assets/');
    html = html.replace(/src="assets\//g, 'src="../assets/');
    html = html.replace(/href="manifest\.webmanifest"/, 'href="../manifest.webmanifest"');
  }

  html = inlineMainJs(html, jsContent);

  return html;
}

// main.js is tiny (a few KB) and every page needs it, so it gets inlined too:
// one HTML response per page, zero external requests, nothing left for
// "use efficient cache lifetimes" to flag (GitHub Pages fixes that header at
// 10 minutes for every static asset and there is no way to override it here).
function inlineMainJs(html, jsContent) {
  return html.replace(
    /<script src="(?:\.\.\/)?assets\/js\/main\.js" defer><\/script>/,
    () => `<script>\n${jsContent}\n</script>`
  );
}

function render404(templateHtml, cssContent, jsContent) {
  const html = templateHtml.replace(
    /<link rel="stylesheet" href="assets\/css\/style\.css">/,
    `<style>\n${cssContent}\n</style>`
  );
  return inlineMainJs(html, jsContent);
}

function renderPrivacy(templateHtml, lang, dict, cssContent, jsContent) {
  let html = templateHtml;

  html = html.replace(
    /<html lang="es">/,
    LANGS[lang].dir === "rtl" ? `<html lang="${lang}" dir="rtl">` : `<html lang="${lang}">`
  );

  html = html.replace(
    /<meta\b([^>]*?)content="[^"]*"([^>]*?)\sdata-i18n-attr="content:([a-zA-Z0-9_.]+)"([^>]*)>/g,
    (m, pre, mid, key, post) => {
      const val = dict[key] !== undefined ? dict[key] : key;
      return `<meta${pre}content="${escapeAttr(val)}"${mid}${post}>`;
    }
  );

  html = html.replace(
    /\sdata-i18n="([a-zA-Z0-9_.]+)"([^>]*)>([^<]*)</g,
    (m, key, restAttrs, oldText) => {
      const val = dict[key] !== undefined ? dict[key] : key;
      return `${restAttrs}>${escapeHtml(val)}<`;
    }
  );

  const selfUrl = urlForPrivacy(lang);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${selfUrl}">`);

  html = html.replace(/<div class="lang-menu" role="menu">[\s\S]*?<\/div>/, buildLangMenu(lang, urlForPrivacy));

  html = html.replace(/<span class="code">ES<\/span>\s*<\/button>/, `<span class="code">${LANGS[lang].code}</span>\n        </button>`);

  html = html.replace(
    /<link rel="stylesheet" href="assets\/css\/style\.css">/,
    `<style>\n${cssContent}\n</style>`
  );

  if (lang !== "es") {
    html = html.replace(/href="assets\//g, 'href="../assets/');
    html = html.replace(/src="assets\//g, 'src="../assets/');
    html = html.replace(/href="manifest\.webmanifest"/, 'href="../manifest.webmanifest"');
  }

  html = inlineMainJs(html, jsContent);

  return html;
}

// Game case-study pages: same recipe as renderPrivacy, parametrized by slug
// (own canonical/hreflang cluster and lang-menu URLs per game).
function renderGamePage(templateHtml, lang, dict, cssContent, jsContent, slug) {
  let html = templateHtml;

  html = html.replace(
    /<html lang="es">/,
    LANGS[lang].dir === "rtl" ? `<html lang="${lang}" dir="rtl">` : `<html lang="${lang}">`
  );

  html = html.replace(
    /<meta\b([^>]*?)content="[^"]*"([^>]*?)\sdata-i18n-attr="content:([a-zA-Z0-9_.]+)"([^>]*)>/g,
    (m, pre, mid, key, post) => {
      const val = dict[key] !== undefined ? dict[key] : key;
      return `<meta${pre}content="${escapeAttr(val)}"${mid}${post}>`;
    }
  );

  html = html.replace(
    /\sdata-i18n="([a-zA-Z0-9_.]+)"([^>]*)>([^<]*)</g,
    (m, key, restAttrs, oldText) => {
      const val = dict[key] !== undefined ? dict[key] : key;
      return `${restAttrs}>${escapeHtml(val)}<`;
    }
  );

  // <img ... alt="OLD" ... data-i18n-attr="alt:KEY"> -> filled in, attribute stripped
  // (screenshot galleries need translated alt text; same recipe as the meta content rule above)
  html = html.replace(
    /<img\b([^>]*?)alt="[^"]*"([^>]*?)\sdata-i18n-attr="alt:([a-zA-Z0-9_.]+)"([^>]*)>/g,
    (m, pre, mid, key, post) => {
      const val = dict[key] !== undefined ? dict[key] : key;
      return `<img${pre}alt="${escapeAttr(val)}"${mid}${post}>`;
    }
  );

  const selfUrl = urlForGame(slug, lang);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${selfUrl}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${selfUrl}">`);

  html = html.replace(
    /<meta property="og:locale" content="[^"]*">\n(?:<meta property="og:locale:alternate" content="[^"]*">\n?)+/,
    buildLocaleBlock(lang) + "\n"
  );

  html = html.replace(/<div class="lang-menu" role="menu">[\s\S]*?<\/div>/, buildLangMenu(lang, (l) => urlForGame(slug, l)));

  html = html.replace(/<span class="code">ES<\/span>\s*<\/button>/, `<span class="code">${LANGS[lang].code}</span>\n        </button>`);

  html = html.replace(
    /<link rel="stylesheet" href="assets\/css\/style\.css">/,
    `<style>\n${cssContent}\n</style>`
  );

  if (lang !== "es") {
    html = html.replace(/href="assets\//g, 'href="../assets/');
    html = html.replace(/src="assets\//g, 'src="../assets/');
    html = html.replace(/href="manifest\.webmanifest"/, 'href="../manifest.webmanifest"');
  }

  html = inlineMainJs(html, jsContent);

  return html;
}

// sitemap.xml: generated, not hand-maintained, so it can never drift from the
// actual set of pages the build produces. One <url> per language for each of
// home, privacy and every game page, each with the full hreflang cluster.
function renderSitemap(games) {
  const today = new Date().toISOString().slice(0, 10);
  function block(urlFn, priorityFor, changefreq, images) {
    const imageLines = (images || [])
      .map((file) => `    <image:image>\n      <image:loc>${BASE_URL}assets/img/games/${images.slug}/${file}</image:loc>\n    </image:image>`)
      .join("\n");
    return ORDER.map((lang) => {
      const loc = urlFn(lang);
      const alts = ORDER.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFn(l)}"/>`).join("\n");
      const xdefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFn("es")}"/>`;
      const imgBlock = imageLines ? `\n${imageLines}` : "";
      return `  <url>\n    <loc>${loc}</loc>\n${alts}\n${xdefault}${imgBlock}\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priorityFor(lang)}</priority>\n  </url>`;
    }).join("\n");
  }

  const blocks = [
    block(urlFor, (l) => (l === "es" ? "1.0" : "0.9"), "monthly"),
    block(urlForPrivacy, () => "0.3", "yearly")
  ];
  games.forEach((game) => {
    const images = game.images ? Object.assign([...game.images], { slug: game.slug }) : null;
    blocks.push(block((l) => urlForGame(game.slug, l), (l) => (l === "es" ? "0.6" : "0.5"), "monthly", images));
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${blocks.join("\n")}\n</urlset>\n`;
}

function main() {
  const template = fs.readFileSync(path.join(__dirname, "template.html"), "utf8");
  const cssContent = fs.readFileSync(path.join(ROOT, "assets", "css", "style.css"), "utf8").trim();
  const jsContent = fs.readFileSync(path.join(ROOT, "assets", "js", "main.js"), "utf8").trim();
  const I18N = extractI18N(fs.readFileSync(path.join(ROOT, "assets", "js", "i18n.js"), "utf8"));

  for (const lang of ORDER) {
    const dict = I18N[lang];
    if (!dict) { console.error(`No dictionary for "${lang}" in i18n.js — skipped`); continue; }
    const out = renderPage(template, lang, dict, cssContent, jsContent);
    const outPath = outPathFor(lang);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, out, "utf8");
    console.log(`Built ${path.relative(ROOT, outPath)} (${out.length} bytes)`);
  }

  const privacyTemplate = fs.readFileSync(path.join(__dirname, "privacy-template.html"), "utf8");
  for (const lang of ORDER) {
    const dict = I18N[lang];
    if (!dict) continue;
    const out = renderPrivacy(privacyTemplate, lang, dict, cssContent, jsContent);
    const outPath = outPathForPrivacy(lang);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, out, "utf8");
    console.log(`Built ${path.relative(ROOT, outPath)} (${out.length} bytes)`);
  }

  const template404 = fs.readFileSync(path.join(__dirname, "404-template.html"), "utf8");
  const out404 = render404(template404, cssContent, jsContent);
  fs.writeFileSync(path.join(ROOT, "404.html"), out404, "utf8");
  console.log(`Built 404.html (${out404.length} bytes)`);

  for (const game of GAMES) {
    const gameTemplate = fs.readFileSync(path.join(__dirname, game.templateFile), "utf8");
    for (const lang of ORDER) {
      const dict = I18N[lang];
      if (!dict) continue;
      const out = renderGamePage(gameTemplate, lang, dict, cssContent, jsContent, game.slug);
      const outPath = outPathForGame(game.slug, lang);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, out, "utf8");
      console.log(`Built ${path.relative(ROOT, outPath)} (${out.length} bytes)`);
    }
  }

  const sitemap = renderSitemap(GAMES);
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");
  console.log(`Built sitemap.xml (${sitemap.length} bytes)`);

  console.log("Done. Edit tools/template.html, tools/privacy-template.html, tools/404-template.html, tools/game-*-template.html and/or assets/js/i18n.js, then re-run this script.");
}

main();
