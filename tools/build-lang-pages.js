#!/usr/bin/env node
/* =========================================================
   build-lang-pages.js
   ---------------------------------------------------------
   Generates one fully-translated, statically-baked HTML page
   per non-Spanish language (en/fr/pt/ar/zh/ja) from index.html
   (the Spanish source of truth) and assets/js/i18n.js (the
   translation dictionary).

   Why: search engines need one crawlable, self-contained URL
   per language — not one URL whose text is swapped by client
   JS after load. This script produces:
     /en/index.html   /fr/index.html   /pt/index.html
     /ar/index.html   /zh/index.html   /ja/index.html
   each with its own <html lang>, dir, title, meta description,
   Open Graph/Twitter tags, hreflang cluster, canonical URL and
   body copy already baked in as plain HTML — no JS required to
   read the content in the right language.

   Run after editing content in index.html and/or translations
   in assets/js/i18n.js:
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
const TARGETS = ORDER.filter((l) => l !== "es");

function urlFor(lang) {
  return lang === "es" ? BASE_URL : `${BASE_URL}${lang}/`;
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

function buildLangMenu(currentLang) {
  const lines = ORDER.map((l) => {
    const cur = l === currentLang ? ' aria-current="true"' : "";
    return `          <a role="menuitem" href="${urlFor(l)}"${cur}>${LANGS[l].name} <span class="code">${LANGS[l].code}</span></a>`;
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

function renderPage(templateHtml, lang, dict) {
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

  // local asset paths -> one level up (pages live at /{lang}/index.html)
  html = html.replace(/href="assets\//g, 'href="../assets/');
  html = html.replace(/src="assets\//g, 'src="../assets/');
  html = html.replace(/href="manifest\.webmanifest"/, 'href="../manifest.webmanifest"');

  return html;
}

function main() {
  const templatePath = path.join(ROOT, "index.html");
  const i18nPath = path.join(ROOT, "assets", "js", "i18n.js");
  const template = fs.readFileSync(templatePath, "utf8");
  const I18N = extractI18N(fs.readFileSync(i18nPath, "utf8"));

  for (const lang of TARGETS) {
    const dict = I18N[lang];
    if (!dict) { console.error(`No dictionary for "${lang}" in i18n.js — skipped`); continue; }
    const out = renderPage(template, lang, dict);
    const dir = path.join(ROOT, lang);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), out, "utf8");
    console.log(`Built ${lang}/index.html (${out.length} bytes)`);
  }
  console.log("Done. Remember: index.html (Spanish) is the hand-edited source — edit it and assets/js/i18n.js, then re-run this script.");
}

main();
