/* ===========================================================
   El soltero en peligro de extinción
   Juego de preguntas para la despedida/boda. Castellano,
   tono humorístico-irónico. Responsive y táctil.
   -----------------------------------------------------------
   CONFIG: edita aquí respuestas, archivos y frases.
   =========================================================== */

const CONFIG = {
  // Archivos que subes al repo (carpeta /assets). Si faltan, salen marcadores.
  assets: {
    novio:   "assets/novio.jpg",   // portada + puzzle
    cigarro: "assets/Cigarro.png", // foto de cigarro real
    pollos:  ["assets/pollo1.png", "assets/pollo2.png", "assets/pollo3.png", "assets/pollo4.png", "assets/pollo5.png", "assets/pollo6.png"],
    novia:   "assets/novia.png",   // laberinto
    suegro:  "assets/suegro.png",  // laberinto
    cancion: "assets/cancion.mp3", // canción final de los novios
  },

  // Cuenta atrás: 25 de julio de 2026, 17:00, hora de España (CEST, +02:00)
  countdownTarget: "2026-07-25T17:00:00+02:00",

  cigarro:  { correctCm: 10, tolerance: 0.5, minCm: 5, maxCm: 15 },
  distancia:{ correctKm: 185, tolerance: 2, min: 0, max: 400 },
  pong:     { winScore: 3 },

  // P7 — Quiz del Chivi. fake = la frase que NO es del Chivi.
  // ⚠️ Teresa: valida las frases "reales" y cámbialas si hace falta.
  chivi: {
    options: [
      { text: "“Mi cuñado es tan tonto que riega las plantas de plástico”", fake: false },
      { text: "“Como una vampiresa de la noche, me chupas hasta el carné de identidad”", fake: false },
      { text: "“Te quiero más que a mi declaración de la renta trimestral”", fake: true },
    ],
  },
};

/* ----------------------- utilidades ----------------------- */
const $ = (sel, el = document) => el.querySelector(sel);
const game = $("#game");
const progressBar = $("#progressBar");

const ironies = [
  "Casi… pero el comité de bodas no lo aprueba.",
  "No. Y eso que te lo estábamos poniendo fácil.",
  "Error. La novia ya empieza a dudar.",
  "Frío, frío. Como los pies antes del “sí, quiero”.",
  "Incorrecto. Vuelve a intentarlo, campeón.",
];
const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// <img> con marcador automático si la imagen no existe
function imgOr(src, alt, phText, extraClass = "") {
  const im = new Image();
  im.alt = alt; im.className = extraClass;
  im.src = src;
  im.dataset.ph = phText;
  im.onerror = () => {
    const div = document.createElement("div");
    div.className = "ph " + extraClass;
    div.textContent = phText;
    im.replaceWith(div);
  };
  return im;
}

/* ----------------------- flujo de pantallas ----------------------- */
const screens = [
  screenWelcome,   // portada
  screenPuzzle,    // 1
  screenCigarro,   // 2
  screenPollos,    // 3
  screenObstacles, // 4
  screenDistancia, // 5
  screenPong,      // 6
  screenChivi,     // 7
];
let current = 0;

function setProgress() {
  // la portada no cuenta; 7 pruebas
  const pct = Math.max(0, (current) / (screens.length - 1)) * 100;
  progressBar.style.width = pct + "%";
}

function show(i) {
  current = i;
  game.innerHTML = "";
  setProgress();
  screens[i]();
}
function next() {
  if (current < screens.length - 1) show(current + 1);
  else finishGame();
}

$("#skipBtn").addEventListener("click", next);

/* helper para construir pantallas */
function makeScreen() {
  const s = document.createElement("div");
  s.className = "screen";
  game.appendChild(s);
  return s;
}
function feedbackEl(s) {
  const f = document.createElement("div");
  f.className = "feedback";
  s.appendChild(f);
  return f;
}
function fail(fb) {
  fb.className = "feedback bad";
  fb.textContent = randItem(ironies);
}
function ok(fb, msg = "¡Correcto! 🎉") {
  fb.className = "feedback ok";
  fb.textContent = msg;
}

/* =========================================================
   PORTADA — zoom latido + corazones
   ========================================================= */
function screenWelcome() {
  const s = makeScreen();
  s.innerHTML = `<p class="kicker">Concurso pre-boda</p>`;

  const hero = document.createElement("div");
  hero.className = "hero";
  const im = imgOr(CONFIG.assets.novio, "El novio", "Sube assets/novio.png", "beat");
  hero.appendChild(im);
  s.appendChild(hero);

  const h1 = document.createElement("h1");
  h1.textContent = "El soltero en peligro de extinción";
  s.appendChild(h1);

  const p = document.createElement("p");
  p.className = "hint";
  p.textContent = "7 pruebas te separan de tu destino. Falla y la novia tomará nota. Suerte (la vas a necesitar).";
  s.appendChild(p);

  const btn = document.createElement("button");
  btn.className = "btn big";
  btn.textContent = "Empezar 💍";
  btn.onclick = next;
  s.appendChild(btn);

  // corazones y emojis flotantes (muchos)
  const hearts = document.createElement("div");
  hearts.className = "hearts";
  // más peso a los corazones, con algún detalle rural
  const pool = ["❤️","💛","🤍","💕","💖","💗","💘","💞","❤️","💛","🌾","🌼","💍","🤍","💕"];
  for (let i = 0; i < 28; i++) {
    const h = document.createElement("div");
    h.className = "heart";
    h.textContent = randItem(pool);
    h.style.left = Math.random() * 100 + "%";
    h.style.animationDuration = (5 + Math.random() * 7) + "s";
    h.style.animationDelay = (-Math.random() * 10) + "s";
    h.style.fontSize = (14 + Math.random() * 22) + "px";
    hearts.appendChild(h);
  }
  game.appendChild(hearts);
}

/* =========================================================
   P1 — PUZZLE 9 piezas (tocar 2 para intercambiar)
   ========================================================= */
function screenPuzzle() {
  const s = makeScreen();
  s.innerHTML = `<p class="kicker">Prueba 1 de 7</p><h2>Recompón al galán</h2>
    <p class="hint">Toca dos piezas para intercambiarlas. Reconstruye la foto del novio… si te atreves.</p>`;

  const board = document.createElement("div");
  board.className = "puzzle";
  s.appendChild(board);

  const fb = feedbackEl(s);

  // 3x3: posiciones 0..8. background-position por pieza.
  const order = [0,1,2,3,4,5,6,7,8];
  // baraja asegurando que no quede ya resuelto
  do { shuffle(order); } while (order.every((v, i) => v === i));

  let selected = null;
  const pieces = [];

  function bgPos(idx) {
    const c = idx % 3, r = Math.floor(idx / 3);
    return `${(c / 2) * 100}% ${(r / 2) * 100}%`;
  }

  function render() {
    board.innerHTML = "";
    order.forEach((pieceIdx, slot) => {
      const d = document.createElement("div");
      d.className = "pz-piece";
      d.style.backgroundImage = `url("${CONFIG.assets.novio}")`;
      d.style.backgroundPosition = bgPos(pieceIdx);
      if (selected === slot) d.classList.add("sel");
      d.onclick = () => pick(slot);
      board.appendChild(d);
      pieces[slot] = d;
    });
  }

  function pick(slot) {
    if (selected === null) { selected = slot; render(); return; }
    if (selected === slot) { selected = null; render(); return; }
    [order[selected], order[slot]] = [order[slot], order[selected]];
    selected = null;
    render();
    if (order.every((v, i) => v === i)) {
      ok(fb, "¡Galán recompuesto! 🧩");
      setTimeout(next, 900);
    }
  }

  // fallback si la imagen no existe: numeritos para poder probar
  const test = new Image();
  test.onerror = () => {
    pieces.forEach((p, slot) => {
      p.style.backgroundImage = "none";
      p.style.display = "flex"; p.style.alignItems = "center"; p.style.justifyContent = "center";
      p.style.fontSize = "28px"; p.style.color = "#7a6a52";
      p.textContent = order[slot] + 1;
    });
  };
  test.src = CONFIG.assets.novio;

  render();
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }

/* =========================================================
   P2 — CIGARRO estirable: acierta los cm (10 ±0,5)
   ========================================================= */
function screenCigarro() {
  const s = makeScreen();
  const cfg = CONFIG.cigarro;
  s.innerHTML = `<p class="kicker">Prueba 2 de 7</p><h2>El Winston de la verdad</h2>
    <p class="hint">Estira o encoge el cigarro hasta que mida lo que mide un Winston largo. Sin reglas trampa.</p>`;

  const card = document.createElement("div");
  card.className = "card cig-wrap";
  card.innerHTML = `
    <div class="cig-stage" id="stage">
      <div class="cig" id="cig"><div class="cig-handle" id="handle">↔</div></div>
    </div>
    <div class="ruler" id="ruler"></div>
    <p style="margin:14px 0 0">Mide: <span class="cm-read" id="cmRead">8.0</span> cm</p>`;
  s.appendChild(card);

  const fb = feedbackEl(s);
  const btn = document.createElement("button");
  btn.className = "btn"; btn.textContent = "Confirmar medida 🚬";
  s.appendChild(btn);

  const stage = $("#stage", card);
  const cig = $("#cig", card);
  const handle = $("#handle", card);
  const cmRead = $("#cmRead", card);
  const ruler = $("#ruler", card);
  let cm = 8.0;
  let pxPerCm = 20; // se recalcula según el ancho real

  // usa la imagen real de cigarro si existe
  const probe = new Image();
  probe.onload = () => { cig.classList.add("hasimg"); cig.style.setProperty("--cigimg", `url("${CONFIG.assets.cigarro}")`); };
  probe.src = CONFIG.assets.cigarro;

  // dibuja una regla calibrada 0..maxCm
  function buildRuler() {
    pxPerCm = stage.clientWidth / cfg.maxCm;
    ruler.innerHTML = "";
    for (let i = 0; i <= cfg.maxCm; i++) {
      const tick = document.createElement("div");
      tick.className = "tick"; tick.style.left = (i * pxPerCm) + "px";
      tick.innerHTML = `<span>${i}</span>`;
      ruler.appendChild(tick);
    }
  }
  function applyWidth() {
    cig.style.width = (cm * pxPerCm) + "px";
    cmRead.textContent = cm.toFixed(1);
  }
  function refresh() { buildRuler(); applyWidth(); }
  // espera a tener tamaño real
  requestAnimationFrame(refresh);
  window.addEventListener("resize", refresh);

  let dragging = false, startX = 0, startCm = 0;
  const startDrag = (x) => { dragging = true; startX = x; startCm = cm; };
  const moveDrag = (x) => {
    if (!dragging) return;
    let nv = startCm + (x - startX) / pxPerCm;
    cm = Math.min(cfg.maxCm, Math.max(cfg.minCm, Math.round(nv * 10) / 10));
    applyWidth();
  };
  const endDrag = () => dragging = false;

  handle.addEventListener("mousedown", e => { e.preventDefault(); startDrag(e.clientX); });
  window.addEventListener("mousemove", e => moveDrag(e.clientX));
  window.addEventListener("mouseup", endDrag);
  handle.addEventListener("touchstart", e => { startDrag(e.touches[0].clientX); }, { passive: true });
  window.addEventListener("touchmove", e => { if (dragging) moveDrag(e.touches[0].clientX); }, { passive: true });
  window.addEventListener("touchend", endDrag);

  btn.onclick = () => {
    if (Math.abs(cm - cfg.correctCm) <= cfg.tolerance) {
      ok(fb, "¡Exacto! 10 cm de pura elegancia rural. 🚬");
      setTimeout(next, 900);
    } else {
      fail(fb);
    }
  };
}

/* =========================================================
   P3 — SEXADOR DE POLLOS (respuestas aleatorias)
   ========================================================= */
function screenPollos() {
  const s = makeScreen();
  const TOTAL = 6;
  s.innerHTML = `<p class="kicker">Prueba 3 de 7</p><h2>Sexador de pollos</h2>
    <p class="hint">De uno en uno. Acierta los ${TOTAL} seguidos. Si fallas uno… vuelta al primer pollo. 🐔</p>`;

  let idx = 0;
  let truth = makeTruth();           // verdad aleatoria, se regenera al fallar
  function makeTruth() { return Array.from({ length: TOTAL }, () => (Math.random() < 0.5 ? "M" : "H")); }

  // puntitos de progreso
  const dots = document.createElement("div");
  dots.className = "pollo-dots";
  s.appendChild(dots);

  const card = document.createElement("div");
  card.className = "card pollo-card";
  s.appendChild(card);

  const fb = feedbackEl(s);

  function renderDots() {
    dots.innerHTML = "";
    for (let i = 0; i < TOTAL; i++) {
      const d = document.createElement("span");
      d.className = "pollo-dot" + (i < idx ? " done" : (i === idx ? " now" : ""));
      d.textContent = i < idx ? "🥚" : "•";
      dots.appendChild(d);
    }
  }

  function renderPollo() {
    renderDots();
    card.innerHTML = "";
    const label = document.createElement("p");
    label.className = "tiny"; label.textContent = `Pollo ${idx + 1} de ${TOTAL}`;
    card.appendChild(label);

    const pic = imgOr(CONFIG.assets.pollos[idx], "Pollo " + (idx + 1), "🐔", "pollo-pic");
    if (pic.tagName === "IMG") pic.classList.add("pollo-pic");
    card.appendChild(pic);

    const btns = document.createElement("div");
    btns.className = "sexbtns";
    [["M", "Macho ♂"], ["H", "Hembra ♀"]].forEach(([v, txt]) => {
      const b = document.createElement("button");
      b.textContent = txt;
      b.onclick = () => answer(v);
      btns.appendChild(b);
    });
    card.appendChild(btns);
  }

  function answer(v) {
    if (v === truth[idx]) {
      idx++;
      if (idx >= TOTAL) {
        renderDots();
        ok(fb, "¡Ojo clínico! Te contratan en la granja. 🐓");
        setTimeout(next, 1000);
      } else {
        ok(fb, "¡Bien! Siguiente pollo…");
        setTimeout(() => { fb.textContent = ""; fb.className = "feedback"; renderPollo(); }, 500);
      }
    } else {
      // fallo: vuelta al principio con nueva lotería
      idx = 0; truth = makeTruth();
      fail(fb);
      setTimeout(renderPollo, 700);
    }
  }

  renderPollo();
}

/* =========================================================
   P4 — OBSTÁCULOS: lleva a la novia borracha hasta el suegro
   La gracia está en controlar el tambaleo (inercia + bandazos).
   ========================================================= */
function screenObstacles() {
  const s = makeScreen();
  s.innerHTML = `<p class="kicker">Prueba 4 de 7</p><h2>Llévala con el suegro 🥴</h2>
    <p class="hint">Toca/arrastra hacia donde quieres ir. La novia va piripi: se tambalea sola. Esquiva los obstáculos 🛢️ y a los enemigos 👵💃🐕 y llega arriba con el suegro 👴.</p>`;

  const wrap = document.createElement("div");
  wrap.className = "pong-wrap";
  const cv = document.createElement("canvas");
  cv.id = "arena";
  wrap.appendChild(cv);
  s.appendChild(wrap);
  const fb = feedbackEl(s);

  // fotos opcionales
  const imgNovia = new Image(); let hasNovia = false;
  imgNovia.onload = () => hasNovia = true; imgNovia.src = CONFIG.assets.novia;
  const imgSuegro = new Image(); let hasSuegro = false;
  imgSuegro.onload = () => hasSuegro = true; imgSuegro.src = CONFIG.assets.suegro;

  const W = 320, H = 460; cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");

  const start = { x: W / 2, y: H - 36 };
  const player = { x: start.x, y: start.y, vx: 0, vy: 0, r: 16 };
  const goal = { x: W / 2, y: 38, r: 22 };
  const trail = [];
  let tropiezos = 0, running = true, won = false;

  // obstáculos fijos
  const obstacles = [
    { x: 80,  y: 150, r: 20, e: "🛢️" },
    { x: 240, y: 150, r: 20, e: "🪑" },
    { x: 160, y: 230, r: 22, e: "🤮" },
    { x: 70,  y: 320, r: 20, e: "🚧" },
    { x: 250, y: 320, r: 20, e: "🛢️" },
  ];
  // enemigos que se mueven (lentos, rebotan en paredes)
  const enemies = [
    { x: 160, y: 110, vx: 1.3, vy: 0.0, r: 18, e: "👵" },
    { x: 60,  y: 250, vx: 0.0, vy: 1.2, r: 18, e: "💃" },
    { x: 260, y: 250, vx: -1.1, vy: 0.9, r: 18, e: "🐕" },
  ];

  // objetivo de control (donde toca el jugador)
  let target = null;
  function setTarget(clientX, clientY) {
    const rect = cv.getBoundingClientRect();
    target = {
      x: (clientX - rect.left) / rect.width * W,
      y: (clientY - rect.top) / rect.height * H,
    };
  }
  cv.addEventListener("touchstart", e => { setTarget(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  cv.addEventListener("touchmove",  e => { setTarget(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, { passive: false });
  cv.addEventListener("touchend",   () => { target = null; });
  cv.addEventListener("mousedown",  e => setTarget(e.clientX, e.clientY));
  cv.addEventListener("mousemove",  e => { if (e.buttons) setTarget(e.clientX, e.clientY); });
  cv.addEventListener("mouseup",    () => { target = null; });
  // teclado (escritorio): fija un objetivo en esa dirección
  window.__arenaKey && window.removeEventListener("keydown", window.__arenaKey);
  window.__arenaKey = (e) => {
    const m = { ArrowUp: [0,-60], ArrowDown:[0,60], ArrowLeft:[-60,0], ArrowRight:[60,0] };
    if (m[e.key]) { e.preventDefault(); target = { x: player.x + m[e.key][0], y: player.y + m[e.key][1] }; }
  };
  window.addEventListener("keydown", window.__arenaKey);

  let t0 = performance.now();
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function respawn(msg) {
    tropiezos++;
    player.x = start.x; player.y = start.y; player.vx = 0; player.vy = 0;
    trail.length = 0;
    fb.className = "feedback bad"; fb.textContent = msg;
  }

  function loop(now) {
    if (!running || current !== screens.indexOf(screenObstacles)) return;
    const t = now - t0;

    // EMPUJE BORRACHO: la dirección de control se tuerce con un vaivén
    if (target) {
      let dx = target.x - player.x, dy = target.y - player.y;
      const d = Math.hypot(dx, dy) || 1;
      dx /= d; dy /= d;
      const wobble = Math.sin(t * 0.004) * 0.6 + (Math.random() - 0.5) * 0.3; // ±~35°
      const cos = Math.cos(wobble), sin = Math.sin(wobble);
      const rx = dx * cos - dy * sin, ry = dx * sin + dy * cos;
      player.vx += rx * 0.5; player.vy += ry * 0.5;
    }
    // bandazos aleatorios + algún tropiezo gordo
    player.vx += (Math.random() - 0.5) * 0.7;
    player.vy += (Math.random() - 0.5) * 0.7;
    if (Math.random() < 0.012) { player.vx += (Math.random() - 0.5) * 6; player.vy += (Math.random() - 0.5) * 6; }

    // inercia (mucha = cuesta frenar)
    player.vx *= 0.90; player.vy *= 0.90;
    // límite de velocidad
    const sp = Math.hypot(player.vx, player.vy), MAX = 3.4;
    if (sp > MAX) { player.vx *= MAX / sp; player.vy *= MAX / sp; }

    player.x += player.vx; player.y += player.vy;

    // paredes (rebote suave)
    if (player.x < player.r) { player.x = player.r; player.vx *= -0.5; }
    if (player.x > W - player.r) { player.x = W - player.r; player.vx *= -0.5; }
    if (player.y < player.r) { player.y = player.r; player.vy *= -0.5; }
    if (player.y > H - player.r) { player.y = H - player.r; player.vy *= -0.5; }

    // estela
    trail.push({ x: player.x, y: player.y }); if (trail.length > 10) trail.shift();

    // obstáculos: rebote + tropiezo
    for (const o of obstacles) {
      if (dist(player, o) < player.r + o.r) {
        const nx = (player.x - o.x), ny = (player.y - o.y), nd = Math.hypot(nx, ny) || 1;
        player.x = o.x + nx / nd * (player.r + o.r);
        player.y = o.y + ny / nd * (player.r + o.r);
        player.vx = nx / nd * 2.4; player.vy = ny / nd * 2.4;
        fb.className = "feedback bad"; fb.textContent = randItem(["¡ay, el bordillo!", "uy 🛢️", "¡cuidado!", "el suelo se mueve…"]);
      }
    }

    // enemigos: mover + colisión = vuelta a empezar
    for (const en of enemies) {
      en.x += en.vx; en.y += en.vy;
      if (en.x < en.r || en.x > W - en.r) en.vx *= -1;
      if (en.y < en.r || en.y > H - en.r) en.vy *= -1;
      en.x = Math.max(en.r, Math.min(W - en.r, en.x));
      en.y = Math.max(en.r, Math.min(H - en.r, en.y));
      if (dist(player, en) < player.r + en.r) {
        respawn(randItem(["¡La suegra! A empezar 👵", "¡Te pilló la ex! 💃", "¡El perro! 🐕 Vuelta atrás"]));
      }
    }

    // meta
    if (dist(player, goal) < player.r + goal.r - 6 && !won) {
      won = true; running = false;
      ok(fb, "¡Llegó con el suegro (de milagro)! 👴🍺 " + (tropiezos ? `Solo ${tropiezos} tropiezo(s).` : "¡Sin despeinarse!"));
      setTimeout(next, 1200);
    }

    draw(t);
    requestAnimationFrame(loop);
  }

  function emoji(x, y, size, ch) {
    ctx.font = size + "px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(ch, x, y + 1);
  }
  function imgCircle(img, x, y, r) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(img, x - r, y - r, r * 2, r * 2); ctx.restore();
    ctx.lineWidth = 2; ctx.strokeStyle = "#b5553f"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  }

  function draw(t) {
    // suelo
    ctx.fillStyle = "#2f2a24"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.04)";
    for (let y = 0; y < H; y += 24) ctx.fillRect(0, y, W, 12);

    // meta (suegro)
    ctx.fillStyle = "rgba(201,161,74,.25)"; ctx.beginPath(); ctx.arc(goal.x, goal.y, goal.r + 8, 0, Math.PI * 2); ctx.fill();
    if (hasSuegro) imgCircle(imgSuegro, goal.x, goal.y, goal.r); else emoji(goal.x, goal.y, 34, "👴");

    // obstáculos
    obstacles.forEach(o => emoji(o.x, o.y, o.r * 1.8, o.e));
    // enemigos
    enemies.forEach(en => emoji(en.x, en.y, en.r * 1.9, en.e));

    // estela borracha
    trail.forEach((p, i) => {
      ctx.globalAlpha = (i + 1) / trail.length * 0.25;
      ctx.fillStyle = "#e08aa0"; ctx.beginPath(); ctx.arc(p.x, p.y, player.r * 0.7, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // jugadora (novia)
    if (hasNovia) imgCircle(imgNovia, player.x, player.y, player.r);
    else emoji(player.x, player.y, 30, "🥴");

    // HUD
    ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = "13px serif"; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText("Tropiezos: " + tropiezos, 8, 8);
  }

  requestAnimationFrame(loop);
}


/* =========================================================
   P5 — DISTANCIA Fraga → Viladecans (185 ±2 km)
   ========================================================= */
function screenDistancia() {
  const s = makeScreen();
  const cfg = CONFIG.distancia;
  s.innerHTML = `<p class="kicker">Prueba 5 de 7</p><h2>De Fraga a Viladecans</h2>
    <p class="hint">¿Cuántos kilómetros separan la patria chica del altar? Afina, geógrafo.</p>`;

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<div class="km-read"><span id="kmRead">${Math.round((cfg.min+cfg.max)/2)}</span> km</div>
    <input class="slider" type="range" id="kmSlider" min="${cfg.min}" max="${cfg.max}" value="${Math.round((cfg.min+cfg.max)/2)}" step="1" />
    <div class="tiny">Desliza para ajustar</div>`;
  s.appendChild(card);

  const fb = feedbackEl(s);
  const btn = document.createElement("button");
  btn.className = "btn"; btn.textContent = "Confirmar distancia 🗺️";
  s.appendChild(btn);

  const slider = $("#kmSlider", card), kmRead = $("#kmRead", card);
  slider.addEventListener("input", () => kmRead.textContent = slider.value);

  btn.onclick = () => {
    if (Math.abs(Number(slider.value) - cfg.correctKm) <= cfg.tolerance) {
      ok(fb, "¡Clavado! 185 km de amor y peajes. 🛣️");
      setTimeout(next, 900);
    } else fail(fb);
  };
}

/* =========================================================
   P6 — PONG (primero a 3)
   ========================================================= */
function screenPong() {
  const s = makeScreen();
  s.innerHTML = `<p class="kicker">Prueba 6 de 7</p><h2>Pong nupcial</h2>
    <p class="hint">Primero a ${CONFIG.pong.winScore}. Tú abajo (desliza), la máquina arriba. Pásale el anillo 💍.</p>
    <div class="score"><span id="aiScore">0</span> — <span id="meScore">0</span></div>`;

  const wrap = document.createElement("div");
  wrap.className = "pong-wrap";
  const cv = document.createElement("canvas");
  cv.id = "pong";
  wrap.appendChild(cv);
  s.appendChild(wrap);
  const fb = feedbackEl(s);

  const meScoreEl = $("#meScore", s), aiScoreEl = $("#aiScore", s);

  // tamaño interno
  const W = 300, H = 400; cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");

  // fotos opcionales de los novios como palas
  const imgNovio = new Image(); let hasNovio = false;
  imgNovio.onload = () => hasNovio = true; imgNovio.src = CONFIG.assets.novio;
  const imgNovia = new Image(); let hasNovia = false;
  imgNovia.onload = () => hasNovia = true; imgNovia.src = CONFIG.assets.novia;

  const padW = 84, padH = 16;
  let me = { x: W/2 - padW/2 }, ai = { x: W/2 - padW/2 };
  const meTrail = [], aiTrail = []; // estelas
  let ball = resetBall(1);
  let meScore = 0, aiScore = 0, running = true;

  function resetBall(dir) {
    // más rápido que antes
    return { x: W/2, y: H/2, vx: (Math.random()*2-1)*3.4, vy: dir * 5.2, r: 12, ang: 0 };
  }

  function setMeX(clientX) {
    const rect = cv.getBoundingClientRect();
    const rel = (clientX - rect.left) / rect.width * W;
    me.x = Math.min(W - padW, Math.max(0, rel - padW/2));
  }
  cv.addEventListener("touchmove", e => { setMeX(e.touches[0].clientX); e.preventDefault(); }, { passive: false });
  cv.addEventListener("touchstart", e => { setMeX(e.touches[0].clientX); }, { passive: true });
  cv.addEventListener("mousemove", e => setMeX(e.clientX));

  function loop() {
    if (!running || current !== screens.indexOf(screenPong)) return;

    // IA MÁS LENTA y torpe (más fácil de ganar)
    const target = ball.x - padW/2;
    ai.x += Math.max(-1.7, Math.min(1.7, (target - ai.x) * 0.05));
    ai.x = Math.min(W - padW, Math.max(0, ai.x));

    // estelas (guarda posiciones recientes)
    meTrail.push(me.x); if (meTrail.length > 9) meTrail.shift();
    aiTrail.push(ai.x); if (aiTrail.length > 9) aiTrail.shift();

    ball.x += ball.vx; ball.y += ball.vy; ball.ang += 0.18;
    if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;

    if (ball.y - ball.r < padH && ball.x > ai.x && ball.x < ai.x + padW && ball.vy < 0) {
      ball.vy *= -1; ball.vx += (ball.x - (ai.x + padW/2)) * 0.06;
    }
    if (ball.y + ball.r > H - padH && ball.x > me.x && ball.x < me.x + padW && ball.vy > 0) {
      ball.vy *= -1; ball.vx += (ball.x - (me.x + padW/2)) * 0.06;
    }
    if (ball.y < 0) { meScore++; meScoreEl.textContent = meScore; ball = resetBall(1); checkWin(); }
    if (ball.y > H) { aiScore++; aiScoreEl.textContent = aiScore; ball = resetBall(-1); }

    draw();
    requestAnimationFrame(loop);
  }

  function checkWin() {
    if (meScore >= CONFIG.pong.winScore) {
      running = false;
      ok(fb, "¡Reflejos de campeón! 💍");
      setTimeout(next, 1000);
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawPaddle(x, y, color, trail, img, hasImg) {
    // estela
    trail.forEach((tx, i) => {
      const a = (i + 1) / trail.length * 0.28;
      ctx.globalAlpha = a;
      ctx.fillStyle = color;
      roundRect(tx, y, padW, padH, 8); ctx.fill();
    });
    ctx.globalAlpha = 1;
    // pala
    if (hasImg) {
      ctx.save(); roundRect(x, y, padW, padH, 8); ctx.clip();
      ctx.drawImage(img, x, y, padW, padH);
      ctx.restore();
      ctx.lineWidth = 2; ctx.strokeStyle = color; roundRect(x, y, padW, padH, 8); ctx.stroke();
    } else {
      const g = ctx.createLinearGradient(x, y, x, y + padH);
      g.addColorStop(0, "#fff6"); g.addColorStop(.5, color); g.addColorStop(1, "#0003");
      ctx.fillStyle = g; roundRect(x, y, padW, padH, 8); ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.stroke();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // línea central
    ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.setLineDash([6, 8]);
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke(); ctx.setLineDash([]);
    // palas (novia arriba = IA, novio abajo = jugador)
    drawPaddle(ai.x, 2, "#c9a14a", aiTrail, imgNovia, hasNovia);
    drawPaddle(me.x, H - padH - 2, "#b5553f", meTrail, imgNovio, hasNovio);
    // bola = anillo 💍
    ctx.save();
    ctx.translate(ball.x, ball.y); ctx.rotate(ball.ang);
    ctx.font = (ball.r * 2.4) + "px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("💍", 0, 1);
    ctx.restore();
  }

  requestAnimationFrame(loop);
}

/* =========================================================
   P7 — QUIZ DEL CHIVI: ¿cuál NO es del Chivi?
   ========================================================= */
function screenChivi() {
  const s = makeScreen();
  s.innerHTML = `<p class="kicker">Prueba 7 de 7</p><h2>Trivial del Chivi</h2>
    <p class="hint">Una de estas frases NUNCA salió de la pluma del Chivi. ¿Cuál es la impostora?</p>`;

  const opts = CONFIG.chivi.options.map((o, i) => ({ ...o, i }));
  shuffle(opts);

  const box = document.createElement("div");
  box.className = "options";
  s.appendChild(box);
  const fb = feedbackEl(s);

  opts.forEach(o => {
    const b = document.createElement("button");
    b.className = "opt"; b.textContent = o.text;
    b.onclick = () => {
      if (o.fake) {
        b.classList.add("ok");
        ok(fb, "¡Esa es la farsante! 🎤 Eres digno del Chivi.");
        box.querySelectorAll("button").forEach(x => x.disabled = true);
        setTimeout(next, 1100);
      } else {
        b.classList.add("bad");
        fail(fb);
      }
    };
    box.appendChild(b);
  });
}

/* =========================================================
   FINAL — la pantalla se cae a trozos y aparece la cuenta atrás
   ========================================================= */
function finishGame() {
  setProgress();
  // la cuenta atrás ya queda DETRÁS; los trozos caen y la van descubriendo
  showFinal();
  shatterScreen();
}

function shatterScreen() {
  const layer = $("#shatter");
  layer.style.display = "block";
  layer.innerHTML = "";

  // troceamos la PANTALLA TAL Y COMO ESTÁ (clonando el contenido del juego)
  const rect = game.getBoundingClientRect();
  const vh = window.innerHeight;
  const cols = 6, rows = 9;
  const tw = rect.width / cols, th = rect.height / rows;
  const pageBg = getComputedStyle(document.body).backgroundColor || "#f6efe2";

  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const shard = document.createElement("div");
    shard.className = "shard";
    shard.style.left = (rect.left + c * tw) + "px";
    shard.style.top = (rect.top + r * th) + "px";
    shard.style.width = (tw + 1) + "px";
    shard.style.height = (th + 1) + "px";
    shard.style.overflow = "hidden";
    shard.style.background = pageBg;
    shard.style.boxShadow = "0 0 0 1px rgba(58,47,37,.10), 0 6px 14px rgba(0,0,0,.12)";

    // clon del juego, recolocado para que cada trozo muestre su porción
    const clone = game.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.left = (-(c * tw)) + "px";
    clone.style.top = (-(r * th)) + "px";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";
    clone.style.maxWidth = "none";
    clone.style.margin = "0";
    clone.style.opacity = "1";
    clone.style.boxSizing = "border-box";
    shard.appendChild(clone);
    layer.appendChild(shard);

    const dx = (Math.random() * 2 - 1) * 200;
    const rot = (Math.random() * 2 - 1) * 150;
    const delay = (r * 120) + Math.random() * 200;   // caen por filas, escalonado
    const dur = 1800 + Math.random() * 1100;          // lento
    shard.animate([
      { transform: "translate(0,0) rotate(0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * .5}px, ${vh * .32}px) rotate(${rot * .5}deg) scale(.97)`, opacity: 1, offset: .55 },
      { transform: `translate(${dx}px, ${vh + 240}px) rotate(${rot}deg) scale(.85)`, opacity: 0 },
    ], { duration: dur, delay, easing: "cubic-bezier(.33,0,.67,1)", fill: "forwards" });
  }
  // ocultar el juego de fondo
  game.style.opacity = 0;
  $("#progress").style.display = "none";
  $("#skipBtn").style.display = "none";

  // limpia la capa cuando ya han caído todos
  setTimeout(() => { layer.style.display = "none"; layer.innerHTML = ""; }, 3500);
}

function showFinal() {
  const wrap = document.createElement("div");
  wrap.className = "final show";
  wrap.innerHTML = `
    <div class="label">Cuenta atrás para el “sí, quiero”</div>
    <div class="units">
      <div class="unit"><span class="clock" id="cd-d">00</span><small>días</small></div>
      <div class="unit"><span class="clock" id="cd-h">00</span><small>horas</small></div>
      <div class="unit"><span class="clock" id="cd-m">00</span><small>min</small></div>
      <div class="unit"><span class="clock" id="cd-s">00</span><small>seg</small></div>
    </div>
    <div class="date">25 de julio · 17:00</div>
  `;
  document.body.appendChild(wrap);

  // canción de los novios (si existe)
  const audio = document.createElement("audio");
  audio.controls = true; audio.autoplay = true; audio.src = CONFIG.assets.cancion;
  audio.onerror = () => { audio.replaceWith(Object.assign(document.createElement("div"), { className: "label", textContent: "🎵 (sube assets/cancion.mp3 para la canción)" })); };
  wrap.appendChild(audio);

  const target = new Date(CONFIG.countdownTarget).getTime();
  const pad = n => String(n).padStart(2, "0");
  function tick() {
    let diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const sec = Math.floor(diff / 1000);
    $("#cd-d").textContent = pad(d);
    $("#cd-h").textContent = pad(h);
    $("#cd-m").textContent = pad(m);
    $("#cd-s").textContent = pad(sec);
  }
  tick();
  setInterval(tick, 1000);
}

/* arranque */
show(0);
