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

  /* ---------- contact form → Telegram deep link ----------
     Static site, no backend: there is nowhere to POST this to
     without either running a server or embedding a bot token in
     public client-side code (a real credential leak). Instead this
     opens a t.me chat with the recipient, prefilled with the
     message — the visitor still has to press send themselves.
     Nothing here is ever transmitted to, or stored by, this site. */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var username = form.getAttribute("data-telegram") || "Chichanofis";
      var name = form.querySelector("#f-name").value.trim();
      var code = form.querySelector("#f-code").value.trim();
      var message = form.querySelector("#f-message").value.trim();

      var text = "Nombre: " + name + "\nCódigo de invitación: " + code + "\n\n" + message;
      var url = "https://t.me/" + encodeURIComponent(username) + "?text=" + encodeURIComponent(text);

      window.open(url, "_blank", "noopener");
    });
  }

  /* ---------- footer year ---------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }
})();
