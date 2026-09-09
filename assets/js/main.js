/* =========================================================
   Gabriel Díaz Bernal — interactions
   Nav, language switcher, scroll reveal, terminal typewriter,
   background canvas. Vanilla JS, no dependencies.
   ========================================================= */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initLangSwitch();
    initReveal();
    initActiveLink();
    initTerminal();
    initBackgroundFx();
    initContactForm();
    initYear();
    initLightbox();
  });

  /* ---------- mobile nav ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    var links = document.querySelectorAll(".nav-links a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    }
  }

  /* ---------- language switcher ----------
     Each language lives at its own crawlable URL (/, /en/, /fr/...);
     the menu items are plain <a> links, so switching is just navigation.
     This JS only opens/closes the dropdown. */
  function initLangSwitch() {
    var switcher = document.querySelector(".lang-switch");
    if (!switcher) return;
    var btn = switcher.querySelector(".lang-btn");
    var menu = switcher.querySelector(".lang-menu");
    if (!btn || !menu) return;

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      switcher.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", switcher.classList.contains("is-open") ? "true" : "false");
    });

    document.addEventListener("click", function (e) {
      if (!switcher.contains(e.target)) switcher.classList.remove("is-open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") switcher.classList.remove("is-open");
    });
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    items.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- active nav link on scroll ---------- */
  function initActiveLink() {
    var links = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (section) map[id] = a;
    });
    var ids = Object.keys(map);
    if (!ids.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });

    ids.forEach(function (id) { obs.observe(document.getElementById(id)); });
  }

  /* ---------- terminal typewriter ---------- */
  var terminalTimer = null;

  function initTerminal() {
    var body = document.querySelector(".terminal-body");
    if (!body) return;
    runTerminal(body);
  }

  function runTerminal(body) {
    if (terminalTimer) { clearTimeout(terminalTimer); terminalTimer = null; }
    var lines = window.GDB_TERMINAL_LINES;
    if (!lines || !lines.length) return;

    body.innerHTML = "";

    if (reduceMotion) {
      lines.forEach(function (l) {
        body.appendChild(buildLine(l.cmd, l.out, true));
      });
      return;
    }

    var lineIndex = 0;
    function nextLine() {
      if (lineIndex >= lines.length) return;
      var l = lines[lineIndex];
      var row = buildLine("", "", false);
      body.appendChild(row);
      var cmdEl = row.querySelector(".term-cmd");
      var cursor = row.querySelector(".term-cursor");
      typeText(cmdEl, l.cmd, cursor, function () {
        var outEl = row.querySelector(".term-out");
        outEl.textContent = l.out;
        outEl.style.display = "block";
        cursor.remove();
        lineIndex++;
        terminalTimer = setTimeout(nextLine, 420);
      });
    }
    nextLine();
  }

  function buildLine(cmd, out, immediate) {
    var row = document.createElement("div");
    row.className = "term-line";
    var prompt = document.createElement("span");
    prompt.className = "term-prompt";
    prompt.textContent = "$";
    var cmdEl = document.createElement("span");
    cmdEl.className = "term-cmd";
    var outEl = document.createElement("span");
    outEl.className = "term-out";

    if (immediate) {
      cmdEl.textContent = cmd;
      outEl.textContent = out;
      row.appendChild(prompt); row.appendChild(cmdEl); row.appendChild(outEl);
      return row;
    }

    var cursor = document.createElement("span");
    cursor.className = "term-cursor";
    outEl.style.display = "none";
    row.appendChild(prompt); row.appendChild(cmdEl); row.appendChild(cursor); row.appendChild(outEl);
    return row;
  }

  function typeText(el, text, cursor, done) {
    var i = 0;
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        terminalTimer = setTimeout(step, 26);
      } else {
        done();
      }
    })();
  }

  /* ---------- background canvas: subtle drifting node network ---------- */
  function initBackgroundFx() {
    var canvas = document.getElementById("fx-canvas");
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext("2d");
    var w, h, nodes = [];
    var NODE_COUNT = Math.min(46, Math.floor((window.innerWidth * window.innerHeight) / 34000));
    var LINK_DIST = 140;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function makeNodes() {
      nodes = [];
      for (var i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      ctx.fillStyle = "rgba(94,234,212,0.55)";
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = "rgba(139,92,246," + (0.12 * (1 - dist / LINK_DIST)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
          }
        }
      }
      for (var c = 0; c < nodes.length; c++) {
        ctx.beginPath();
        ctx.arc(nodes[c].x, nodes[c].y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }

    resize();
    makeNodes();
    requestAnimationFrame(tick);
    window.addEventListener("resize", function () {
      resize();
      makeNodes();
    });
  }

  /* ---------- contact form ----------
     Static site, no backend, and nowhere this data is sent: the
     "invitation code" field is never transmitted or stored anywhere,
     by this site or any third party. Submitting it just swaps the
     visible UI state from the field to a confirmation message —
     nothing leaves the browser, no navigation, no popup. */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var fields = document.getElementById("contact-form-fields");
    var sent = document.getElementById("contact-form-sent");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (fields) fields.hidden = true;
      if (sent) sent.hidden = false;
    });
  }

  /* ---------- footer year ---------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- gallery lightbox ----------
     Capturas ampliables en las galerías de las páginas de proyecto.
     Se construye entero desde JS para que ninguna plantilla tenga que
     cambiar y funcione en todas las galerías existentes a la vez. Las
     etiquetas van aquí y no en i18n.js porque el diccionario no viaja a
     las páginas generadas (el texto se hornea en el build): son tres
     cadenas de interfaz, se resuelven por el lang del <html>. */
  var LB_LABELS = {
    es: { close: "Cerrar", prev: "Anterior", next: "Siguiente", of: "de" },
    en: { close: "Close", prev: "Previous", next: "Next", of: "of" },
    fr: { close: "Fermer", prev: "Précédent", next: "Suivant", of: "sur" },
    pt: { close: "Fechar", prev: "Anterior", next: "Seguinte", of: "de" },
    ar: { close: "إغلاق", prev: "السابق", next: "التالي", of: "من" },
    zh: { close: "关闭", prev: "上一张", next: "下一张", of: "/" },
    ja: { close: "閉じる", prev: "前へ", next: "次へ", of: "/" }
  };

  function initLightbox() {
    var figures = [].slice.call(document.querySelectorAll(".game-shot-grid .game-shot"));
    var shots = figures.filter(function (f) { return f.querySelector("img"); });
    if (!shots.length) return;

    var t = LB_LABELS[(document.documentElement.lang || "es").slice(0, 2)] || LB_LABELS.es;
    var index = 0;
    var lastFocused = null;

    var overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="' + t.close + '">&times;</button>' +
      '<button type="button" class="lightbox-nav lightbox-prev" aria-label="' + t.prev + '">&#8249;</button>' +
      '<button type="button" class="lightbox-nav lightbox-next" aria-label="' + t.next + '">&#8250;</button>' +
      '<figure class="lightbox-figure">' +
      '<img alt="">' +
      '<figcaption><span class="lightbox-caption"></span><span class="lightbox-count"></span></figcaption>' +
      "</figure>";
    document.body.appendChild(overlay);

    var lbImg = overlay.querySelector("img");
    var lbCaption = overlay.querySelector(".lightbox-caption");
    var lbCount = overlay.querySelector(".lightbox-count");
    var btnClose = overlay.querySelector(".lightbox-close");
    var btnPrev = overlay.querySelector(".lightbox-prev");
    var btnNext = overlay.querySelector(".lightbox-next");
    // A single image needs no prev/next chrome.
    if (shots.length < 2) { btnPrev.hidden = true; btnNext.hidden = true; }

    function show(i) {
      index = (i + shots.length) % shots.length;
      var img = shots[index].querySelector("img");
      var cap = shots[index].querySelector("figcaption");
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || "";
      lbCaption.textContent = cap ? cap.textContent : "";
      lbCount.textContent = shots.length > 1 ? String(index + 1) + " " + t.of + " " + String(shots.length) : "";
      overlay.setAttribute("aria-label", lbImg.alt || lbCaption.textContent);
    }

    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      overlay.hidden = false;
      document.body.classList.add("lightbox-open");
      btnClose.focus();
    }

    function close() {
      overlay.hidden = true;
      document.body.classList.remove("lightbox-open");
      lbImg.removeAttribute("src");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    shots.forEach(function (fig, i) {
      fig.classList.add("is-zoomable");
      fig.tabIndex = 0;
      fig.setAttribute("role", "button");
      fig.addEventListener("click", function () { open(i); });
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); open(i); }
      });
    });

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () { show(index - 1); });
    btnNext.addEventListener("click", function () { show(index + 1); });
    // Clicking the backdrop closes; clicking the image or a control does not.
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });

    document.addEventListener("keydown", function (e) {
      if (overlay.hidden) return;
      if (e.key === "Escape") { close(); return; }
      if (shots.length < 2) return;
      // In RTL the arrow that points at the previous thumbnail is the right one.
      var rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowLeft") show(index + (rtl ? 1 : -1));
      else if (e.key === "ArrowRight") show(index + (rtl ? -1 : 1));
    });

    // Keep focus inside the dialog while it is open.
    overlay.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusables = [btnClose, btnPrev, btnNext].filter(function (b) { return !b.hidden; });
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
})();
