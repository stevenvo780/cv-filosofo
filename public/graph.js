/* =========================================================
   Constelación de ideas — canvas 2D, sin dependencias.
   Una esfera de conceptos filosóficos (griego) y símbolos de
   lógica, unidos por relaciones; anillos armilares de oro y
   hilos de seda al fondo (eco de Paideía). Cada sección fija
   una "escena": posición, tamaño, color y cúmulo enfocado.
   API: window.Ideas.scene(nombre, foco)
   ========================================================= */
(function () {
  "use strict";

  var canvas = document.getElementById("ideas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, DPR = 1, mobile = false;
  /* Mobile starts reduced: full quality on mid-tier LH was a multi-second
     long task (b5ff270 TBT ~8s outlier). Desktop keeps full quality. */
  var quality = (typeof window !== "undefined" && window.matchMedia &&
    window.matchMedia("(max-width: 767px), (pointer: coarse)").matches) ? 0 : 1;

  /* ---------- Paleta ---------- */
  var C = {
    gold: [224, 168, 94], teal: [67, 181, 166], violet: [141, 124, 192],
    terra: [217, 116, 74], cream: [232, 224, 212]
  };
  var CLUSTER_COL = [C.gold, C.teal, C.violet, C.terra, C.cream];

  /* ---------- Conceptos: [etiqueta, transliteración, cúmulo, peso, tipo] ----------
     cúmulos: 0 lógica · 1 epistemología · 2 mente/IA · 3 ética/retórica · 4 sistemas/cosmos */
  var CONCEPTS = [
    ["λόγος", "lógos", 0, 3, "g"], ["ἀπόδειξις", "apódeixis", 0, 2, "g"], ["συλλογισμός", "syllogismós", 0, 2, "g"],
    ["⊢", "", 0, 1, "m"], ["∀x", "", 0, 1, "m"], ["¬p", "", 0, 1, "m"], ["p → q", "", 0, 1, "m"], ["SAT", "", 0, 1, "m"], ["ST", "", 0, 2, "m"],
    ["ἐπιστήμη", "epistḗmē", 1, 3, "g"], ["ἀλήθεια", "alḗtheia", 1, 2, "g"], ["δόξα", "dóxa", 1, 1, "g"],
    ["ἀφαίρεσις", "aphaíresis", 1, 2, "g"], ["⊨", "", 1, 1, "m"], ["a priori", "", 1, 1, "i"],
    ["νοῦς", "noûs", 2, 3, "g"], ["ψυχή", "psykhḗ", 2, 2, "g"], ["τέχνη", "tékhnē", 2, 2, "g"],
    ["λx.x", "", 2, 1, "m"], ["MLTT", "", 2, 1, "m"],
    ["ἦθος", "êthos", 3, 3, "g"], ["ῥητορική", "rhētorikḗ", 3, 2, "g"], ["ἔλεγχος", "élenkhos", 3, 2, "g"],
    ["διάλογος", "diálogos", 3, 1, "g"], ["ἀγορά", "agorá", 3, 1, "g"],
    ["κόσμος", "kósmos", 4, 3, "g"], ["φύσις", "phýsis", 4, 2, "g"], ["αὐτοποίησις", "autopoíēsis", 4, 2, "g"],
    ["σύστημα", "sýstēma", 4, 1, "g"], ["ἀρχή", "arkhḗ", 4, 1, "g"]
  ];
  var LINKS = [
    ["λόγος", "ἐπιστήμη"], ["ἐπιστήμη", "νοῦς"], ["νοῦς", "τέχνη"], ["λόγος", "ST"], ["ST", "τέχνη"],
    ["ἦθος", "ῥητορική"], ["ῥητορική", "ἀλήθεια"], ["ἔλεγχος", "λόγος"], ["κόσμος", "φύσις"],
    ["αὐτοποίησις", "νοῦς"], ["ἀφαίρεσις", "λόγος"], ["ἀγορά", "ST"], ["ψυχή", "φύσις"],
    ["σύστημα", "τέχνη"], ["ἦθος", "ἀγορά"], ["κόσμος", "ἀρχή"], ["ἀλήθεια", "⊨"], ["διάλογος", "ἔλεγχος"]
  ];
  // Direcciones de cada cúmulo sobre la esfera
  var DIRS = [
    norm([-0.62, -0.46, 0.64]), norm([0.72, -0.34, 0.6]), norm([0.58, 0.5, -0.64]),
    norm([-0.66, 0.52, -0.54]), norm([0.05, 0.96, 0.28])
  ];

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  // PRNG determinista: la constelación es siempre la misma
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function gauss() { return (rnd() + rnd() + rnd() - 1.5) / 1.5; }

  var nodes = [], edges = [], rings = [], pulses = [];

  function build() {
    seed = 7; nodes = []; edges = [];
    // núcleo
    nodes.push({ p: [0, 0, 0], label: "φιλοσοφία", tr: "philosophía", cl: -1, w: 4, kind: "g", ph: 0 });
    var byLabel = {};
    var heads = [];
    CONCEPTS.forEach(function (c) {
      var d = DIRS[c[2]], p;
      if (c[3] === 3) {
        p = [d[0] * 0.92, d[1] * 0.92, d[2] * 0.92];
      } else {
        var s = 0.9;
        var v = norm([d[0] + gauss() * s, d[1] + gauss() * s, d[2] + gauss() * s]);
        var r = 0.78 + rnd() * 0.3;
        p = [v[0] * r, v[1] * r, v[2] * r];
      }
      var n = { p: p, label: c[0], tr: c[1], cl: c[2], w: c[3], kind: c[4], ph: rnd() * 6.28 };
      byLabel[c[0]] = nodes.length;
      if (c[3] === 3) heads.push(nodes.length);
      nodes.push(n);
    });
    // polvo sin etiqueta
    var dust = mobile ? 40 : 84;
    for (var i = 0; i < dust; i++) {
      var y = 1 - (i + 0.5) * 2 / dust, rad = Math.sqrt(1 - y * y), th = i * 2.39996;
      var v = norm([Math.cos(th) * rad + gauss() * 0.12, y + gauss() * 0.12, Math.sin(th) * rad + gauss() * 0.12]);
      var r = 0.86 + rnd() * 0.24;
      var best = 0, bd = -2;
      for (var k = 0; k < DIRS.length; k++) {
        var dt = v[0] * DIRS[k][0] + v[1] * DIRS[k][1] + v[2] * DIRS[k][2];
        if (dt > bd) { bd = dt; best = k; }
      }
      nodes.push({ p: [v[0] * r, v[1] * r, v[2] * r], label: "", cl: best, w: rnd() < 0.18 ? 1 : 0, kind: "", ph: rnd() * 6.28 });
    }
    var seen = {};
    function addEdge(a, b, strong) {
      if (a === b) return;
      var key = a < b ? a + "-" + b : b + "-" + a;
      if (seen[key]) return;
      seen[key] = 1;
      edges.push({ a: a, b: b, s: strong ? 1 : 0 });
    }
    heads.forEach(function (h) { addEdge(0, h, true); });
    LINKS.forEach(function (l) {
      if (byLabel[l[0]] != null && byLabel[l[1]] != null) addEdge(byLabel[l[0]], byLabel[l[1]], true);
    });
    // vecinos cercanos (mismo cúmulo primero)
    for (var a = 1; a < nodes.length; a++) {
      var cand = [];
      for (var b = 1; b < nodes.length; b++) {
        if (a === b) continue;
        var pa = nodes[a].p, pb = nodes[b].p;
        var d2 = (pa[0] - pb[0]) * (pa[0] - pb[0]) + (pa[1] - pb[1]) * (pa[1] - pb[1]) + (pa[2] - pb[2]) * (pa[2] - pb[2]);
        if (nodes[a].cl !== nodes[b].cl) d2 *= 1.8;
        cand.push([d2, b]);
      }
      cand.sort(function (x, y) { return x[0] - y[0]; });
      var kn = nodes[a].label ? 3 : 2;
      for (var j = 0; j < kn; j++) addEdge(a, cand[j][1], false);
    }
    // adyacencia para el resaltado al pasar el puntero
    nodes.forEach(function (n) { n.adj = []; n.hl = 0; n.hover = 0; });
    edges.forEach(function (e) { nodes[e.a].adj.push(e.b); nodes[e.b].adj.push(e.a); });

    // anillos armilares
    rings = [
      { r: 1.2, tx: 1.18, tz: 0.18, spin: 0.05, beads: [0.1, 0.62] },
      { r: 1.3, tx: 0.32, tz: -0.62, spin: -0.034, beads: [0.35] },
      { r: 1.1, tx: -0.9, tz: 0.9, spin: 0.042, beads: [0.8] }
    ];
    pulses = [];
  }

  /* ---------- Sprites de brillo (pre-renderizados) ---------- */
  var sprites = {};
  function sprite(col) {
    var key = col.join(",");
    if (sprites[key]) return sprites[key];
    var s = document.createElement("canvas"); s.width = s.height = 64;
    var g = s.getContext("2d");
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(" + key + ",1)");
    gr.addColorStop(0.18, "rgba(" + key + ",0.55)");
    gr.addColorStop(0.5, "rgba(" + key + ",0.12)");
    gr.addColorStop(1, "rgba(" + key + ",0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    sprites[key] = s;
    return s;
  }

  /* ---------- Escenas ---------- */
  // cx, cy: centro (fracción del viewport) · r: radio (fracción del lado menor)
  // a: opacidad · hue: color de la seda · focus: cúmulo enfocado (-1 ninguno)
  var SCENES = {
    hero:         { d: [0.7, 0.5, 0.36, 1], m: [0.5, 0.27, 0.38, 1], hue: C.violet, focus: -1 },
    prologo:      { d: [0.8, 0.56, 0.3, 0.55], m: [0.5, 0.2, 0.34, 0.3], hue: C.violet, focus: -1 },
    perfil:       { d: [0.86, 0.3, 0.26, 0.5], m: [0.85, 0.2, 0.3, 0.25], hue: C.teal, focus: 1 },
    areas:        { d: [0.28, 0.55, 0.3, 1], m: [0.62, 0.3, 0.36, 0.42], flat: [0.8, 0.5, 0.28, 0.55], hue: C.gold, focus: 0 },
    temas:        { d: [0.5, 0.5, 0.56, 0.3], m: [0.5, 0.5, 0.6, 0.22], hue: C.gold, focus: -1 },
    st:           { d: [0.82, 0.26, 0.22, 0.5], m: [0.5, 0.2, 0.34, 0.25], hue: C.gold, focus: 0 },
    linaje:       { d: [0.84, 0.22, 0.2, 0.45], m: [0.8, 0.2, 0.3, 0.22], hue: C.terra, focus: 3 },
    escritura:    { d: [0.9, 0.3, 0.24, 0.35], m: [0.8, 0.18, 0.28, 0.18], hue: C.violet, focus: 2 },
    formacion:    { d: [0.84, 0.24, 0.22, 0.45], m: [0.8, 0.2, 0.3, 0.2], hue: C.teal, focus: 1 },
    competencias: { d: [0.82, 0.24, 0.2, 0.45], m: [0.8, 0.2, 0.3, 0.2], hue: C.gold, focus: 0 },
    quote:        { d: [0.5, 0.5, 0.48, 0.8], m: [0.5, 0.5, 0.5, 0.45], hue: C.violet, focus: -1 },
    obra:         { d: [0.5, 0.5, 0.5, 0.18], m: [0.5, 0.5, 0.5, 0.12], hue: C.teal, focus: 4 },
    contacto:     { d: [0.82, 0.22, 0.2, 0.85], m: [0.72, 0.2, 0.3, 0.4], hue: C.gold, focus: -1 }
  };
  var FOCUS_HUE = [C.gold, C.teal, C.violet, C.terra, C.cream];

  var S = { cx: 0.7, cy: 0.5, r: 0.4, a: 0, hue: C.violet.slice(), focus: -1 };
  var T = { cx: 0.7, cy: 0.5, r: 0.4, a: 1, hue: C.violet.slice(), focus: -1 };

  function setScene(name, focus) {
    var sc = SCENES[name] || SCENES.hero;
    var v = mobile ? sc.m : sc.d;
    // Áreas sin fijar (movimiento reducido o pantalla baja): la esfera se aparta del texto
    if (!mobile && sc.flat) {
      var ar = document.getElementById("areas");
      if (ar && !ar.classList.contains("is-pinned")) v = sc.flat;
    }
    T.cx = v[0]; T.cy = v[1]; T.r = v[2]; T.a = v[3];
    T.focus = focus != null ? focus : sc.focus;
    T.hue = (focus != null && focus >= 0) ? FOCUS_HUE[focus].slice() : sc.hue.slice();
    if (reduce) { snap(); render(0); }
  }
  function snap() { S.cx = T.cx; S.cy = T.cy; S.r = T.r; S.a = T.a; S.hue = T.hue.slice(); S.focus = T.focus; }

  /* ---------- Cámara ---------- */
  var yaw = 0.6, pitch = -0.18, yawV = 0.055;
  var ptr = { x: 0, y: 0, tx: 0, ty: 0, sx: -9999, sy: -9999 };
  var scrollKick = 0;

  function lerpAngle(a, b, k) {
    var d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d * k;
  }

  function resize() {
    var w = window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    var wasMobile = mobile;
    mobile = w < 768;
    DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.75 : 1.5) * (quality ? 1 : 0.75);
    W = w; H = h;
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    if (wasMobile !== mobile || !nodes.length) build();
    if (reduce) render(0);
  }

  /* ---------- Seda (hilos de fondo) ---------- */
  var SILK = [
    [0.18, 0.1, 1.3, 0.21, 0.9, 0.0], [0.34, 0.14, 0.9, 0.17, 1.4, 1.7], [0.52, 0.12, 1.1, 0.2, 0.8, 3.1],
    [0.66, 0.16, 0.7, 0.15, 1.2, 4.2], [0.82, 0.11, 1.5, 0.22, 1.0, 5.3], [0.44, 0.2, 0.6, 0.12, 1.7, 2.4]
  ];
  function silk(t, col, alpha) {
    var n = mobile ? 4 : 6;
    var steps = mobile ? 48 : 72;
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < n; i++) {
      var L = SILK[i];
      ctx.beginPath();
      for (var s = 0; s <= steps; s++) {
        var u = s / steps;
        var x = (-0.1 + 1.2 * u) * W + Math.sin(u * 6.283 * L[4] + t * 0.13 + L[5]) * W * 0.07;
        var y = (L[0] + Math.sin(u * 6.283 * L[2] + t * 0.1 + L[5]) * L[1] + Math.sin(u * 6.283 * L[4] * 1.7 - t * 0.07 + i) * L[3] * 0.35) * H;
        if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      var rgb = "rgba(" + (col[0] | 0) + "," + (col[1] | 0) + "," + (col[2] | 0) + ",";
      if (quality) {
        ctx.lineWidth = 22; ctx.strokeStyle = rgb + (0.022 * alpha) + ")"; ctx.stroke();
        ctx.lineWidth = 7; ctx.strokeStyle = rgb + (0.05 * alpha) + ")"; ctx.stroke();
      }
      ctx.lineWidth = 1.1; ctx.strokeStyle = rgb + (0.3 * alpha) + ")"; ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  /* ---------- Render ---------- */
  var proj = []; // [x, y, z, s] por nodo
  var last = 0, raf = 0, running = false, ftAcc = 0, ftN = 0;

  function project(p, cy_, sy_, cp, sp, R, cx0, cy0) {
    var x = p[0] * cy_ - p[2] * sy_;
    var z = p[0] * sy_ + p[2] * cy_;
    var y = p[1] * cp - z * sp;
    z = p[1] * sp + z * cp;
    var s = 4.2 / (4.2 - z);
    return [cx0 + x * R * s, cy0 + y * R * s, z, s];
  }

  function render(t) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (S.a < 0.01) return;

    var hue = S.hue;
    var cx0 = S.cx * W, cy0 = S.cy * H, R = S.r * Math.min(W, H);

    // bruma de color tras la esfera
    var fog = ctx.createRadialGradient(cx0, cy0, 0, cx0, cy0, R * 2.3);
    fog.addColorStop(0, "rgba(" + (hue[0] | 0) + "," + (hue[1] | 0) + "," + (hue[2] | 0) + "," + (0.16 * S.a) + ")");
    fog.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fog; ctx.fillRect(0, 0, W, H);

    silk(t, hue, Math.min(1, S.a + 0.25));

    // cuerpo de la esfera: disco de vidrio con reflejo y borde tenue
    var body = ctx.createRadialGradient(cx0 - R * 0.35, cy0 - R * 0.4, R * 0.05, cx0, cy0, R * 1.08);
    body.addColorStop(0, "rgba(255,240,220," + (0.07 * S.a) + ")");
    body.addColorStop(0.55, "rgba(" + (hue[0] | 0) + "," + (hue[1] | 0) + "," + (hue[2] | 0) + "," + (0.05 * S.a) + ")");
    body.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(cx0, cy0, R * 1.08, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = "rgba(232,224,212," + (0.07 * S.a) + ")"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx0, cy0, R * 1.02, 0, 6.2832); ctx.stroke();

    var cyaw = Math.cos(yaw + ptr.x * 0.35), syaw = Math.sin(yaw + ptr.x * 0.35);
    var cp = Math.cos(pitch + ptr.y * 0.22), sp = Math.sin(pitch + ptr.y * 0.22);
    var breathe = 1 + Math.sin(t * 0.6) * 0.012;

    // anillos
    ctx.lineWidth = 1;
    for (var ri = 0; ri < rings.length; ri++) {
      var rg = rings[ri], ang = t * rg.spin + ri;
      var ctx_ = Math.cos(rg.tx), stx = Math.sin(rg.tx), ctz = Math.cos(rg.tz + ang * 0.2), stz = Math.sin(rg.tz + ang * 0.2);
      var pts = [];
      for (var k = 0; k <= 64; k++) {
        var th = (k / 64) * 6.2832;
        var px = Math.cos(th) * rg.r, py = 0, pz = Math.sin(th) * rg.r;
        var y1 = py * ctx_ - pz * stx, z1 = py * stx + pz * ctx_;
        var x2 = px * ctz - y1 * stz, y2 = px * stz + y1 * ctz;
        pts.push(project([x2, y2, z1], Math.cos(ang * 0.3), Math.sin(ang * 0.3), cp, sp, R, cx0, cy0));
      }
      ctx.beginPath();
      for (k = 0; k < pts.length; k++) { if (k) ctx.lineTo(pts[k][0], pts[k][1]); else ctx.moveTo(pts[k][0], pts[k][1]); }
      ctx.strokeStyle = "rgba(224,168,94," + (0.42 * S.a) + ")";
      ctx.stroke();
      for (var bi = 0; bi < rg.beads.length; bi++) {
        var bu = (rg.beads[bi] + t * 0.018 * (ri + 1)) % 1;
        var bp = pts[Math.floor(bu * 64)];
        var bs = 5 + bp[3] * 4;
        ctx.globalAlpha = S.a * (0.5 + 0.5 * (bp[2] + 1) / 2);
        ctx.drawImage(sprite(C.gold), bp[0] - bs * 2, bp[1] - bs * 2, bs * 4, bs * 4);
        ctx.fillStyle = "#f3d19c";
        ctx.beginPath(); ctx.arc(bp[0], bp[1], 2.4 * bp[3], 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // proyección de nodos
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], b = i ? breathe + Math.sin(t * 0.8 + n.ph) * 0.01 : 1;
      proj[i] = project([n.p[0] * b, n.p[1] * b, n.p[2] * b], cyaw, syaw, cp, sp, R, cx0, cy0);
      var target = S.focus < 0 ? 0.5 : (n.cl === S.focus ? 1 : (i === 0 ? 0.6 : 0.18));
      if (hovered >= 0) target = (i === hovered || nodes[hovered].adj.indexOf(i) >= 0) ? 1 : 0.14;
      n.hl += (target - n.hl) * 0.08;
    }

    // aristas
    for (var e = 0; e < edges.length; e++) {
      var ed = edges[e], A = proj[ed.a], B = proj[ed.b], na = nodes[ed.a], nb = nodes[ed.b];
      var depth = ((A[2] + B[2]) / 2 + 1) / 2; // 0 fondo · 1 frente
      var h = Math.min(na.hl, nb.hl);
      var al = (0.05 + depth * 0.22) * (0.35 + h * 1.1) * (ed.s ? 1.5 : 1) * S.a;
      var col = na.cl >= 0 ? CLUSTER_COL[na.cl] : C.gold;
      ctx.strokeStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + Math.min(0.85, al) + ")";
      ctx.lineWidth = ed.s ? 1.1 : 0.7;
      ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
    }

    // pulsos que viajan por las aristas (ideas en tránsito)
    if (!reduce) {
      var want = mobile ? 7 : 14;
      while (pulses.length < want) pulses.push({ e: (Math.random() * edges.length) | 0, u: 0, v: 0.25 + Math.random() * 0.45, dir: Math.random() < 0.5 });
      ctx.globalCompositeOperation = "lighter";
      for (var pi = pulses.length - 1; pi >= 0; pi--) {
        var pu = pulses[pi], pe = edges[pu.e];
        pu.u += pu.v * dt;
        if (pu.u >= 1) { pulses.splice(pi, 1); continue; }
        var u = pu.dir ? pu.u : 1 - pu.u;
        var P = proj[pe.a], Q = proj[pe.b];
        var x = P[0] + (Q[0] - P[0]) * u, y = P[1] + (Q[1] - P[1]) * u;
        var pc = nodes[pe.a].cl >= 0 ? CLUSTER_COL[nodes[pe.a].cl] : C.gold;
        var sz = 9 * (P[3] + Q[3]) / 2;
        ctx.globalAlpha = Math.sin(pu.u * Math.PI) * S.a * (0.45 + Math.min(nodes[pe.a].hl, 1) * 0.55);
        ctx.drawImage(sprite(pc), x - sz, y - sz, sz * 2, sz * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    // nodos (de atrás hacia adelante)
    var labels = [];
    var labelK = Math.max(0, Math.min(1, (S.a - 0.5) / 0.3));
    var order = nodes.map(function (_, k) { return k; }).sort(function (a, b) { return proj[a][2] - proj[b][2]; });
    for (var oi = 0; oi < order.length; oi++) {
      var idx = order[oi], nd = nodes[idx], pr = proj[idx];
      var dpt = (pr[2] + 1) / 2;
      var ncol = nd.cl >= 0 ? CLUSTER_COL[nd.cl] : C.gold;
      var base = idx === 0 ? 7 : (nd.w === 3 ? 4.2 : nd.w === 2 ? 3 : nd.w === 1 ? 2.2 : 1.4);
      var rad = base * pr[3] * (0.8 + nd.hl * 0.5);
      var al2 = (0.25 + dpt * 0.75) * (0.35 + nd.hl * 0.9) * S.a;
      if (quality || nd.w >= 2) {
        ctx.globalAlpha = Math.min(1, al2 * 0.9);
        var g = rad * 5;
        ctx.drawImage(sprite(ncol), pr[0] - g, pr[1] - g, g * 2, g * 2);
      }
      ctx.globalAlpha = Math.min(1, al2 + 0.1);
      ctx.fillStyle = idx === 0 ? "#fff4e0" : "rgb(" + Math.min(255, ncol[0] + 30) + "," + Math.min(255, ncol[1] + 30) + "," + Math.min(255, ncol[2] + 30) + ")";
      ctx.beginPath(); ctx.arc(pr[0], pr[1], Math.max(0.8, rad * 0.55), 0, 6.2832); ctx.fill();

      if (nd.label && labelK > 0) {
        var la = (0.12 + dpt * 0.88) * (0.3 + nd.hl * 0.9) * S.a * labelK;
        if (la > 0.05) labels.push({ i: idx, x: pr[0], y: pr[1], s: pr[3], rad: rad, la: la, col: ncol, pri: la * (nd.w + 1) + (idx === hovered ? 9 : 0) });
      }
    }
    ctx.globalAlpha = 1;

    // rótulos (los más importantes primero; los que chocan se omiten)
    labels.sort(function (a, b) { return b.pri - a.pri; });
    var boxes = [];
    ctx.textAlign = "center";
    for (var li = 0; li < labels.length; li++) {
      var L = labels[li], nd2 = nodes[L.i], fs;
      if (nd2.kind === "m") { fs = (mobile ? 10 : 11.5) * L.s; ctx.font = "500 " + fs + "px 'JetBrains Mono', monospace"; }
      else if (nd2.kind === "i") { fs = (mobile ? 12 : 14) * L.s; ctx.font = "italic 400 " + fs + "px 'Cormorant Garamond', serif"; }
      else { fs = (L.i === 0 ? 24 : nd2.w === 3 ? 21 : nd2.w === 2 ? 16.5 : 14) * L.s * (mobile ? 0.86 : 1); ctx.font = "italic 400 " + fs + "px 'EB Garamond', 'Cormorant Garamond', serif"; }
      var tw = ctx.measureText(nd2.label).width, ty = L.y - L.rad - 6;
      var bx = [L.x - tw / 2 - 3, ty - fs * 0.85, L.x + tw / 2 + 3, ty + fs * 0.25];
      var hit = false;
      for (var q = 0; q < boxes.length && !hit; q++) {
        var o = boxes[q];
        if (bx[0] < o[2] && bx[2] > o[0] && bx[1] < o[3] && bx[3] > o[1]) hit = true;
      }
      if (hit) continue;
      boxes.push(bx);
      ctx.globalAlpha = Math.min(1, L.la);
      ctx.fillStyle = L.i === 0 ? "#f6e3c2" : (nd2.w === 3 ? "rgb(" + L.col.join(",") + ")" : "#e8e0d4");
      ctx.fillText(nd2.label, L.x, ty);
      if (nd2.tr && (L.i === hovered || (nd2.w === 3 && nd2.hl > 0.8 && L.la > 0.5))) {
        ctx.font = "400 " + (9.5 * L.s) + "px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#8fa3a8";
        ctx.fillText(nd2.tr.toUpperCase(), L.x, L.y + L.rad + 13);
        boxes.push([L.x - 40, L.y + L.rad, L.x + 40, L.y + L.rad + 16]);
      }
    }
    ctx.globalAlpha = 1;
  }
  /* ---------- Bucle ---------- */
  var dt = 0.016, clock = 0;
  function frame(now) {
    raf = 0;
    if (!running) return;
    dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    clock += dt;

    // presupuesto: si va lento, bajar calidad una vez
    if (quality && clock > 1.2) {
      ftAcc += dt; ftN++;
      if (ftN === 90) {
        if (ftAcc / ftN > 0.03) { quality = 0; resize(); }
        ftAcc = 0; ftN = 0;
      }
    }

    var k = 1 - Math.pow(0.05, dt); // suavizado independiente del framerate
    S.cx += (T.cx - S.cx) * k; S.cy += (T.cy - S.cy) * k; S.r += (T.r - S.r) * k; S.a += (T.a - S.a) * k;
    for (var i = 0; i < 3; i++) S.hue[i] += (T.hue[i] - S.hue[i]) * k;
    S.focus = T.focus;

    ptr.x += (ptr.tx - ptr.x) * k; ptr.y += (ptr.ty - ptr.y) * k;
    scrollKick *= Math.pow(0.1, dt);
    if (T.focus >= 0) {
      var d = DIRS[T.focus];
      var ty = Math.atan2(d[0], d[2]) + 0.25; // gira el cúmulo hacia el espectador
      var tp = Math.atan2(d[1], Math.hypot(d[0], d[2])) * 0.9;
      yaw = lerpAngle(yaw, ty + Math.sin(clock * 0.2) * 0.15, k * 0.6);
      pitch += (tp - pitch) * k * 0.6;
    } else {
      yaw += (yawV + scrollKick) * dt;
      pitch += (-0.18 + Math.sin(clock * 0.15) * 0.08 - pitch) * k * 0.3;
    }
    render(clock);
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (reduce || running) return;
    running = true; last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  /* ---------- Puntero: inclina la esfera y resalta conceptos ---------- */
  var hovered = -1;
  function onMove(e) {
    ptr.tx = (e.clientX / W - 0.5) * 2;
    ptr.ty = (e.clientY / H - 0.5) * 2;
    ptr.sx = e.clientX; ptr.sy = e.clientY;
    var el = e.target;
    var overContent = el && el.closest && el.closest("a,button,p,h1,h2,h3,h4,li,blockquote,dd,dt,.proj,.theme-card,.method-col,.menu");
    var best = -1, bd = 900;
    if (!overContent && S.a > 0.4) {
      for (var i = 0; i < nodes.length; i++) {
        if (!nodes[i].label || !proj[i]) continue;
        var dx = proj[i][0] - e.clientX, dy = proj[i][1] - e.clientY, d2 = dx * dx + dy * dy;
        if (d2 < bd && proj[i][2] > -0.35) { bd = d2; best = i; }
      }
    }
    hovered = best;
  }
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", function () { ptr.tx = 0; ptr.ty = 0; hovered = -1; });

  var lastY = window.scrollY;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    scrollKick = Math.max(-0.6, Math.min(0.6, scrollKick + (y - lastY) * 0.0009));
    lastY = y;
  }, { passive: true });

  var rw = window.innerWidth, rh = window.innerHeight;
  window.addEventListener("resize", function () {
    // ignora los saltos de altura de la barra del navegador móvil
    if (window.innerWidth !== rw || Math.abs(window.innerHeight - rh) > 140) {
      rw = window.innerWidth; rh = window.innerHeight;
      var cur = currentScene;
      resize();
      setScene(cur.name, cur.focus);
    }
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });

  var currentScene = { name: "hero", focus: null };
  window.Ideas = {
    scene: function (name, focus) {
      if (currentScene.name === name && currentScene.focus === focus) return;
      currentScene = { name: name, focus: focus };
      setScene(name, focus);
    }
  };

  /* Soft-yield boot — NOT rIC (b5ff270 TBT ~8s). Sync resize+build+start
     coalesced under LH 4x into 100–320ms graph.js long tasks (de874cd R2).
     #ideasPh stays visible until is-ready — never empty void. */
  function softYield(fn) {
    requestAnimationFrame(function () { setTimeout(fn, 0); });
  }
  softYield(function () {
    resize();
    setScene("hero");
    softYield(function () {
      if (reduce) { snap(); S.a = T.a; render(0); }
      canvas.classList.add("is-ready");
      /* Opus: swap static #ideasPh silhouette for live canvas (never empty void).
         is-ready + hide ph + start stay atomic — no mid-swap empty frame. */
      var ph = document.getElementById("ideasPh");
      if (ph) ph.classList.add("is-hidden");
      start();
      if (document.fonts && document.fonts.ready && reduce) {
        document.fonts.ready.then(function () { render(0); });
      }
    });
  });
})();
