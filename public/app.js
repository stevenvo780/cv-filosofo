/* =========================================================
   CV Filósofo — interacción (sin dependencias)
   Idioma ES/EN · preloader · cabecera · índice · revelados ·
   título por letras · palabras que se iluminan · áreas fijas ·
   carril horizontal · cinta · contadores · cursor · escenas.
   ========================================================= */
(function () {
  "use strict";

  var doc = document, root = doc.documentElement, body = doc.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- Idioma ES (defecto) / EN ---------- */
  var langButtons = $$("[data-set-lang]");
  var lang = "es";
  function applyLang(l) {
    lang = l;
    var en = l === "en";
    body.classList.toggle("en", en);
    root.lang = en ? "en" : "es";
    langButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === l)); });
    try { localStorage.setItem("cv-filo-lang", l); } catch (e) {}
    formatCounts();
    layout();
  }
  function initialLang() {
    var requested = new URLSearchParams(window.location.search).get("lang");
    if (requested === "es" || requested === "en") return requested;
    if (/\/en(\/|$|\.html)/.test(window.location.pathname)) return "en";
    try {
      var saved = localStorage.getItem("cv-filo-lang");
      if (saved === "en" || saved === "es") return saved;
    } catch (e) {}
    return "es";
  }
  langButtons.forEach(function (b) { b.addEventListener("click", function () { applyLang(b.getAttribute("data-set-lang")); }); });

  var y = doc.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* ---------- Contadores: se derivan del propio contenido ---------- */
  $$("[data-count-of]").forEach(function (el) {
    var n = $$(el.getAttribute("data-count-of")).length;
    if (n) el.setAttribute("data-to", String(n));
  });
  $$(".proj-group").forEach(function (g) {
    var c = g.querySelector(".pg-count");
    if (c) c.textContent = String(g.querySelectorAll(".proj").length).padStart(2, "0");
  });
  function fmt(n, sep) {
    var s = String(Math.round(n));
    if (!sep) return n < 10 ? "0" + s : s;
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, lang === "en" ? "," : ".");
  }
  function formatCounts() {
    $$(".count[data-to]").forEach(function (el) {
      if (el.dataset.done || reduce) el.textContent = fmt(+el.dataset.to, el.dataset.sep);
    });
  }
  function runCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    var to = +el.dataset.to, t0 = performance.now(), dur = 1400;
    if (reduce) { el.textContent = fmt(to, el.dataset.sep); return; }
    (function tick(now) {
      var p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e, el.dataset.sep);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- Título del hero: letras envueltas ---------- */
  $$("[data-split]").forEach(function (h) {
    h.setAttribute("aria-label", h.textContent.replace(/\s+/g, " ").trim());
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(" ")); return; }
            var w = doc.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
            part.split("").forEach(function (c) {
              var s = doc.createElement("span"); s.className = "c"; s.textContent = c;
              s.style.setProperty("--i", i++); w.appendChild(s);
            });
            frag.appendChild(w);
          });
          ch.parentNode.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) walk(ch);
      });
    })(h);
  });

  /* ---------- Palabras que se iluminan con el scroll ---------- */
  var wordBlocks = $$("[data-words]").map(function (el) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(" ")); return; }
            var s = doc.createElement("span"); s.className = "mf-w"; s.textContent = part;
            words.push(s); frag.appendChild(s);
          });
          ch.parentNode.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) walk(ch);
      });
    })(el);
    return { el: el, words: words, last: -1 };
  });

  /* ---------- Preloader (1.ª visita de la sesión) ---------- */
  function ready() { root.classList.add("is-ready"); }
  var pre = doc.querySelector(".preloader");
  if (root.classList.contains("intro-pending") && pre) {
    var cnt = doc.getElementById("pl-count"), bar = doc.getElementById("pl-bar");
    var t0 = performance.now(), minDur = 1500, fontsOk = false;
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fontsOk = true; }); else fontsOk = true;
    (function tick(now) {
      var p = clamp((now - t0) / minDur, 0, 1);
      if (!fontsOk) p = Math.min(p, 0.9);
      var e = 1 - Math.pow(1 - p, 3);
      if (cnt) cnt.textContent = String(Math.round(e * 100)).padStart(2, "0");
      if (bar) bar.style.transform = "scaleX(" + e + ")";
      if (p < 1 || !fontsOk) {
        if (now - t0 < 5000) return requestAnimationFrame(tick);
      }
      pre.setAttribute("data-phase", "leaving");
      root.classList.remove("intro-pending");
      try { sessionStorage.setItem("filo-intro", "1"); } catch (e2) {}
      setTimeout(ready, 280);
      setTimeout(function () { pre.removeAttribute("data-phase"); }, 1300);
    })(t0);
  } else {
    requestAnimationFrame(function () { requestAnimationFrame(ready); });
  }

  /* ---------- Revelados ---------- */
  // escalonar hijos de rejillas
  $$(".proj-grid, .idx, .skills-grid, .contact-grid, .influence-list, .edu").forEach(function (g) {
    $$("[data-reveal]", g).forEach(function (el, i) { if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (i % 6) * 70 + "ms"); });
  });
  var revealEls = $$("[data-reveal]");
  function reveal(el) {
    el.classList.add("is-in");
    $$(".count", el).forEach(runCount);
    if (el.classList.contains("section-label")) scramble(el);
  }
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(reveal);
  } else {
    // Un elemento recortado a área cero nunca "intersecta": los de tipo clip se
    // disparan desde su contenedor.
    var groups = new Map();
    revealEls.forEach(function (el) {
      var trg = el.getAttribute("data-reveal") === "clip" ? el.parentElement : el;
      if (!groups.has(trg)) groups.set(trg, []);
      groups.get(trg).push(el);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        (groups.get(en.target) || []).forEach(reveal);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    groups.forEach(function (_, trg) { io.observe(trg); });
  }
  $$(".count").forEach(function (el) { if (!el.closest("[data-reveal]")) { if (reduce) runCount(el); else ioCount(el); } });
  function ioCount(el) {
    if (!("IntersectionObserver" in window)) return runCount(el);
    var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { runCount(el); o.disconnect(); } }, { threshold: 0.4 });
    o.observe(el);
  }

  /* ---------- Rótulos que se "descifran" ---------- */
  var GLYPHS = "ΑΒΓΔΘΛΞΠΣΦΨΩ∀∃¬∧∨→⊢⊨";
  function scramble(label) {
    if (reduce) return;
    $$("span:not(.section-num)", label).forEach(function (sp) {
      if (sp.offsetParent === null || sp.children.length) return;
      var final = sp.textContent, n = final.length, frame = 0, total = 18;
      (function step() {
        frame++;
        var out = "";
        for (var i = 0; i < n; i++) {
          if (final[i] === " " || i < (frame / total) * n) out += final[i];
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        sp.textContent = out;
        if (frame < total) setTimeout(step, 34); else sp.textContent = final;
      })();
    });
  }

  /* ---------- Cabecera, progreso e índice ---------- */
  var header = doc.getElementById("header");
  var progress = doc.getElementById("progress");
  var menu = doc.getElementById("menu");
  var menuBtn = doc.getElementById("menu-btn");
  var menuOpen = false, lastScroll = window.scrollY;
  $$(".menu-sections li").forEach(function (li, i) { li.style.setProperty("--i", i); });
  function setMenu(open) {
    menuOpen = open;
    menu.setAttribute("data-open", String(open));
    menuBtn.setAttribute("aria-expanded", String(open));
    header.setAttribute("data-open", String(open));
    if (open) { menu.removeAttribute("inert"); root.style.overflow = "hidden"; setTimeout(function () { var f = menu.querySelector("a"); if (f) f.focus({ preventScroll: true }); }, 350); }
    else { menu.setAttribute("inert", ""); root.style.overflow = ""; }
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () { setMenu(!menuOpen); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuOpen) { setMenu(false); menuBtn.focus(); } });
  }

  /* ---------- Áreas: sección fija con 4 pasos ---------- */
  var areas = doc.getElementById("areas");
  var panels = $$(".area-panel", areas);
  var railItems = $$(".areas-rail-item", areas);
  var areasLine = null;
  var areaStep = -1;
  var pinnable = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
  function setStep(i) {
    if (i === areaStep) return;
    areaStep = i;
    panels.forEach(function (p, k) { p.classList.toggle("is-active", k === i); });
    railItems.forEach(function (b, k) { b.setAttribute("aria-current", String(k === i)); });
    if (areasLine) areasLine.parentNode.style.setProperty("--c", getComputedStyle(panels[i]).getPropertyValue("--c"));
    if (currentScene === "areas" && window.Ideas) window.Ideas.scene("areas", i);
  }
  if (areas && !reduce) {
    var line = doc.createElement("div"); line.className = "areas-line"; line.setAttribute("aria-hidden", "true");
    areasLine = doc.createElement("span"); line.appendChild(areasLine);
    areas.querySelector(".areas-sticky").appendChild(line);
    railItems.forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.getAttribute("data-step");
        var top = areas.getBoundingClientRect().top + window.scrollY;
        var span = areas.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + span * ((i + 0.5) / panels.length), behavior: "smooth" });
      });
    });
  }

  /* ---------- Temas: carril horizontal ---------- */
  var rail = doc.getElementById("temas");
  var track = doc.getElementById("rail-track");
  var railBar = doc.getElementById("rail-bar");
  var railShift = 0;

  function layout() {
    var pin = pinnable.matches && !reduce;
    if (areas) {
      areas.classList.toggle("is-pinned", pin);
      if (pin) { if (areaStep < 0) setStep(0); }
      else { panels.forEach(function (p) { p.classList.remove("is-active"); }); areaStep = -1; }
    }
    if (rail && track) {
      rail.classList.toggle("is-pinned", pin);
      if (pin) {
        track.style.transform = "";
        railShift = Math.max(0, track.scrollWidth - window.innerWidth);
        rail.style.height = (window.innerHeight + railShift) + "px";
      } else {
        rail.style.height = ""; track.style.transform = ""; railShift = 0;
      }
    }
    onScroll();
  }

  /* ---------- Cinta (velocidad ligada al scroll) ---------- */
  var tracks = $$(".marquee-track").map(function (t) { return { el: t, x: 0, dir: +t.getAttribute("data-dir") || -1, w: 0 }; });
  var marquee = doc.querySelector(".marquee");
  var marqueeOn = false, vel = 0;
  if (marquee && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { marqueeOn = en[0].isIntersecting; if (marqueeOn) loop(); }).observe(marquee);
  }
  var looping = false, lastT = 0;
  function loop() {
    if (looping || reduce) return;
    looping = true; lastT = 0;
    requestAnimationFrame(function step(t) {
      var dt = Math.min(0.05, (t - (lastT || t)) / 1000); lastT = t;
      vel *= Math.pow(0.08, dt);
      tracks.forEach(function (tr) {
        if (!tr.w) tr.w = tr.el.scrollWidth / 2;
        tr.x += tr.dir * (40 + Math.abs(vel) * 0.9) * dt;
        if (tr.x <= -tr.w) tr.x += tr.w;
        if (tr.x > 0) tr.x -= tr.w;
        tr.el.style.transform = "translate3d(" + tr.x.toFixed(1) + "px,0,0)";
      });
      if (marqueeOn) requestAnimationFrame(step); else looping = false;
    });
  }
  tracks.forEach(function (tr) { tr.x = tr.dir > 0 ? -200 : 0; });

  /* ---------- Escenas de la constelación ---------- */
  var currentScene = "hero";
  var sceneEls = $$("[data-scene]");
  function pickScene() {
    var mid = window.innerHeight * 0.5, found = null;
    for (var i = 0; i < sceneEls.length; i++) {
      var r = sceneEls[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) { found = sceneEls[i]; break; }
    }
    if (!found) return;
    var name = found.getAttribute("data-scene");
    if (name !== currentScene) {
      currentScene = name;
      if (window.Ideas) window.Ideas.scene(name, name === "areas" && areaStep >= 0 ? areaStep : undefined);
    }
  }

  /* ---------- Scroll (un solo manejador por frame) ---------- */
  var ticking = false;
  function onScroll() {
    var sy = window.scrollY, vh = window.innerHeight;
    var max = doc.documentElement.scrollHeight - vh;
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? sy / max : 0) + ")";

    vel += sy - lastScroll;
    if (header && !menuOpen) {
      header.setAttribute("data-scrolled", String(sy > 30));
      var goingDown = sy > lastScroll;
      if (sy > 480 && goingDown && sy - lastScroll > 2) header.setAttribute("data-hidden", "true");
      else if (!goingDown || sy < 480) header.setAttribute("data-hidden", "false");
    }
    lastScroll = sy;

    // palabras
    wordBlocks.forEach(function (b) {
      if (!b.el.offsetParent) return;
      var r = b.el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = reduce ? 1 : clamp((vh * 0.82 - r.top) / (r.height + vh * 0.3), 0, 1);
      var lit = p * b.words.length * 1.15;
      var key = Math.round(lit * 4);
      if (key === b.last) return;
      b.last = key;
      for (var i = 0; i < b.words.length; i++) b.words[i].style.opacity = String(clamp(0.14 + (lit - i) * 0.86, 0.14, 1));
    });

    // áreas fijas
    if (areas && areas.classList.contains("is-pinned")) {
      var ar = areas.getBoundingClientRect();
      var ap = clamp(-ar.top / Math.max(1, ar.height - vh), 0, 0.9999);
      setStep(Math.floor(ap * panels.length));
      if (areasLine) areasLine.style.transform = "scaleX(" + ap + ")";
    }

    // carril
    if (rail && rail.classList.contains("is-pinned")) {
      var rr = rail.getBoundingClientRect();
      var rp = clamp(-rr.top / Math.max(1, rr.height - vh), 0, 1);
      track.style.transform = "translate3d(" + (-rp * railShift).toFixed(1) + "px,0,0)";
      if (railBar) railBar.style.transform = "scaleX(" + rp + ")";
    }

    pickScene();
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(layout, 150); });
  if (pinnable.addEventListener) pinnable.addEventListener("change", layout);

  /* ---------- Cursor, botones magnéticos y tarjetas con luz ---------- */
  if (finePointer && !reduce) {
    root.classList.add("has-cursor");
    var cur = doc.querySelector(".cursor"), dot = cur.querySelector(".cursor-dot"), ring = cur.querySelector(".cursor-ring");
    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
      var t = e.target.closest && e.target.closest("a,button,.proj,.theme-card");
      cur.setAttribute("data-state", t ? "link" : "");
      cur.setAttribute("data-hidden", "false");
    }, { passive: true });
    doc.addEventListener("pointerleave", function () { cur.setAttribute("data-hidden", "true"); });
    (function follow() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
      requestAnimationFrame(follow);
    })();

    $$(".magnetic").forEach(function (m) {
      m.addEventListener("pointermove", function (e) {
        var r = m.getBoundingClientRect();
        m.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      m.addEventListener("pointerleave", function () { m.style.transform = ""; });
    });

    $$(".proj").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        c.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        c.style.transform = "perspective(900px) rotateX(" + ((0.5 - py) * 5).toFixed(2) + "deg) rotateY(" + ((px - 0.5) * 6).toFixed(2) + "deg)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* ---------- Arranque ---------- */
  applyLang(initialLang());
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { tracks.forEach(function (t) { t.w = 0; }); layout(); });
  window.addEventListener("load", layout);
})();
