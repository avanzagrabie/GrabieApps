<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Sitemap — Gabriel Díaz Bernal</title>
<meta name="robots" content="noindex"/>
<style>
  :root{ color-scheme: dark; }
  body{ margin:0; padding:40px 24px; background:#05070d; color:#eef1fa;
        font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif; }
  .wrap{ max-width:980px; margin:0 auto; }
  h1{ font-size:1.4rem; margin:0 0 6px; }
  p.sub{ color:#9aa3ba; margin:0 0 28px; font-size:.92rem; }
  table{ width:100%; border-collapse:collapse; border:1px solid rgba(255,255,255,.09); border-radius:10px; overflow:hidden; }
  th,td{ text-align:left; padding:12px 16px; font-size:.88rem; border-bottom:1px solid rgba(255,255,255,.09); vertical-align:top; }
  th{ background:rgba(255,255,255,.04); font-family:ui-monospace,Consolas,monospace; text-transform:uppercase; font-size:.72rem; letter-spacing:.06em; color:#9aa3ba; }
  tr:last-child td{ border-bottom:none; }
  a{ color:#5eead4; text-decoration:none; }
  a:hover{ text-decoration:underline; }
  .alt{ color:#626c85; font-family:ui-monospace,Consolas,monospace; font-size:.78rem; }
  .alt a{ color:#8b93a7; }
  .alt a + a::before{ content:" · "; color:#626c85; }
  .meta{ color:#626c85; font-family:ui-monospace,Consolas,monospace; font-size:.78rem; white-space:nowrap; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Sitemap</h1>
  <p class="sub"><xsl:value-of select="count(sm:urlset/sm:url)"/> URLs · generado automáticamente, ver <a href="https://github.com/avanzagrabie/GrabieApps/blob/main/sitemap.xml">sitemap.xml</a></p>
  <table>
    <tr><th>URL</th><th>Idiomas alternativos</th><th>Actualizado</th><th>Prioridad</th></tr>
    <xsl:for-each select="sm:urlset/sm:url">
    <tr>
      <td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td>
      <td class="alt">
        <xsl:for-each select="xhtml:link">
          <a href="{@href}"><xsl:value-of select="@hreflang"/></a>
        </xsl:for-each>
      </td>
      <td class="meta"><xsl:value-of select="sm:lastmod"/></td>
      <td class="meta"><xsl:value-of select="sm:priority"/></td>
    </tr>
    </xsl:for-each>
  </table>
</div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
