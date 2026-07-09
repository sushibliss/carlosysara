/* ===========================================================
   El soltero en peligro de extinción
   Juego de preguntas para la despedida/boda. Castellano,
   tono humorístico-irónico. Responsive y táctil.
   -----------------------------------------------------------
   CONFIG: respuestas, tolerancias y archivos.
   ✏️ Los TEXTOS del juego se editan en copy.js.
   =========================================================== */

const CONFIG = {
  // Archivos que subes al repo (carpeta /assets). Si faltan, salen marcadores.
  assets: {
    novio:   "assets/novio.jpg",   // portada + puzzle
    cigarro: "assets/Cigarro.png", // foto de cigarro real
    novia:   "assets/novia.png",   // laberinto
    suegro:  "assets/suegro.png",  // laberinto
    cancion: "assets/cancion.mp3", // canción final de los novios
  },

  // Cuenta atrás: 25 de julio de 2026, 17:00, hora de España (CEST, +02:00)
  countdownTarget: "2026-07-25T17:00:00+02:00",

  cigarro:  { correctCm: 10, tolerance: 0.5, minCm: 5, maxCm: 15 },
  distancia:{ correctKm: 185, tolerance: 2, min: 0, max: 400 },
  pong:     { winScore: 3 },

  // P8 — Wordle. Palabras de 5 letras; se elige una al azar cada partida.
  wordle: { words: ["tenis", "padel", "floky"] },


  // P6 — Aria y Floky: cuántos calcetines hay que salvar y cuántos pueden comerse.
  perros: { salvar: 8, maxComidos: 3 },
};

/* ----------------------- utilidades ----------------------- */
const $ = (sel, el = document) => el.querySelector(sel);
const game = $("#game");
const progressBar = $("#progressBar");

const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
// rellena {marcadores} de los textos de copy.js: fmt("Pollo {n}", { n: 2 })
const fmt = (s, vars) => s.replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? vars[k] : m));

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
  screenDistancia, // 4
  screenPong,      // 5
  screenDogs,      // 6 — Aria y Floky contra los calcetines
  screenWordle,    // 7
  screenObstacles, // 8 — la traca final: la novia borracha
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
  fb.textContent = randItem(COPY.general.fallos);
}
function ok(fb, msg = COPY.general.correcto) {
  fb.className = "feedback ok";
  fb.textContent = msg;
}

/* =========================================================
   PORTADA — zoom latido + corazones
   ========================================================= */
function screenWelcome() {
  const s = makeScreen();
  s.innerHTML = `<p class="kicker">${COPY.portada.kicker}</p>`;

  const hero = document.createElement("div");
  hero.className = "hero";
  const im = imgOr(CONFIG.assets.novio, "El novio", "Sube assets/novio.png", "beat");
  hero.appendChild(im);
  s.appendChild(hero);

  const h1 = document.createElement("h1");
  h1.textContent = COPY.portada.titulo;
  s.appendChild(h1);

  const p = document.createElement("p");
  p.className = "hint";
  p.textContent = COPY.portada.texto;
  s.appendChild(p);

  const btn = document.createElement("button");
  btn.className = "btn big";
  btn.textContent = COPY.portada.boton;
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
  s.innerHTML = `<p class="kicker">${COPY.puzzle.kicker}</p><h2>${COPY.puzzle.titulo}</h2>
    <p class="hint">${COPY.puzzle.texto}</p>`;

  const board = document.createElement("div");
  board.className = "puzzle";
  s.appendChild(board);

  // contador de movimientos + chuleta
  const bar = document.createElement("div");
  bar.className = "pz-bar";
  const movesEl = document.createElement("span");
  movesEl.className = "pz-moves"; movesEl.textContent = COPY.puzzle.movimientos + "0";
  const peekBtn = document.createElement("button");
  peekBtn.className = "btn ghost pz-peek"; peekBtn.textContent = COPY.puzzle.chuleta;
  bar.appendChild(movesEl); bar.appendChild(peekBtn);
  s.appendChild(bar);

  const fb = feedbackEl(s);

  // 3x3: posiciones 0..8. background-position por pieza.
  const order = [0,1,2,3,4,5,6,7,8];
  // baraja asegurando que no quede ya resuelto
  do { shuffle(order); } while (order.every((v, i) => v === i));

  let selected = null;
  let moves = 0;
  let solved = false;
  let imgOk = true;
  const pieces = [];

  const pullas = COPY.puzzle.pullas;

  function bgPos(idx) {
    const c = idx % 3, r = Math.floor(idx / 3);
    return `${(c / 2) * 100}% ${(r / 2) * 100}%`;
  }

  let peeking = false;

  // el tablero se construye UNA vez; los movimientos solo actualizan (sin parpadeo)
  function buildBoard() {
    board.innerHTML = "";
    for (let slot = 0; slot < 9; slot++) {
      const d = document.createElement("div");
      d.className = "pz-piece";
      if (imgOk) d.style.backgroundImage = `url("${CONFIG.assets.novio}")`;
      const sl = slot;
      d.onclick = () => pick(sl);
      board.appendChild(d);
      pieces[slot] = d;
    }
  }

  function update(popSlots = []) {
    pieces.forEach((d, slot) => {
      const pieceIdx = order[slot];
      if (imgOk) {
        d.style.backgroundPosition = bgPos(peeking ? slot : pieceIdx);
      } else {
        d.style.backgroundImage = "none";
        d.style.display = "flex"; d.style.alignItems = "center"; d.style.justifyContent = "center";
        d.style.fontSize = "28px"; d.style.color = "#8a6470";
        d.textContent = pieceIdx + 1;
      }
      d.classList.toggle("placed", pieceIdx === slot);
      d.classList.toggle("sel", selected === slot);
      d.classList.remove("pop");
      if (popSlots.includes(slot)) { void d.offsetWidth; d.classList.add("pop"); }
    });
  }

  function pick(slot) {
    if (solved || peeking) return;
    if (selected === null) { selected = slot; update(); return; }
    if (selected === slot) { selected = null; update(); return; }
    const a = selected, b = slot;
    [order[a], order[b]] = [order[b], order[a]];
    selected = null;
    moves++;
    movesEl.textContent = COPY.puzzle.movimientos + moves;
    const pulla = pullas.find(p => p[0] === moves);
    if (pulla) { fb.className = "feedback bad"; fb.textContent = pulla[1]; }
    update([a, b]);
    if (order.every((v, i) => v === i)) {
      solved = true;
      board.classList.add("pz-solved");
      ok(fb, fmt(COPY.puzzle.exito, { movimientos: moves }));
      burstHearts(board);
      setTimeout(next, 1600);
    }
  }

  // chuleta: mantener pulsado para ver la foto entera
  function setPeek(on) {
    if (solved || !imgOk) return;
    peeking = on;
    board.classList.toggle("pz-peeking", on);
    update();
  }
  peekBtn.addEventListener("mousedown", () => setPeek(true));
  peekBtn.addEventListener("touchstart", e => { setPeek(true); e.preventDefault(); }, { passive: false });
  ["mouseup", "mouseleave"].forEach(ev => peekBtn.addEventListener(ev, () => setPeek(false)));
  peekBtn.addEventListener("touchend", () => setPeek(false));

  // fallback si la imagen no existe: numeritos para poder probar
  const test = new Image();
  test.onerror = () => { imgOk = false; update(); };
  test.src = CONFIG.assets.novio;

  buildBoard();
  update();
}

// pequeña explosión de corazones sobre un elemento (celebración)
function burstHearts(el) {
  const rect = el.getBoundingClientRect();
  for (let i = 0; i < 18; i++) {
    const h = document.createElement("div");
    h.className = "burst-heart";
    h.textContent = randItem(["❤️", "💖", "💛", "🤍", "💍", "🎉"]);
    h.style.left = (rect.left + rect.width / 2) + "px";
    h.style.top = (rect.top + rect.height / 2) + "px";
    document.body.appendChild(h);
    const ang = Math.random() * Math.PI * 2, d = 70 + Math.random() * 130;
    h.animate([
      { transform: "translate(0,0) scale(.6)", opacity: 1 },
      { transform: `translate(${Math.cos(ang) * d}px, ${Math.sin(ang) * d - 40}px) scale(${1 + Math.random()})`, opacity: 0 },
    ], { duration: 900 + Math.random() * 600, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" });
    setTimeout(() => h.remove(), 1600);
  }
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }

/* =========================================================
   P2 — CIGARRO estirable: acierta los cm (10 ±0,5)
   ========================================================= */
function screenCigarro() {
  const s = makeScreen();
  const cfg = CONFIG.cigarro;
  s.innerHTML = `<p class="kicker">${COPY.cigarro.kicker}</p><h2>${COPY.cigarro.titulo}</h2>
    <p class="hint">${COPY.cigarro.texto}</p>`;

  const card = document.createElement("div");
  card.className = "card cig-wrap";
  card.innerHTML = `
    <div class="cig-stage" id="stage">
      <div class="cig" id="cig"><div class="cig-handle" id="handle">↔</div></div>
    </div>
    <div class="ruler" id="ruler"></div>
    <p style="margin:14px 0 0">${COPY.cigarro.mide} <span class="cm-read" id="cmRead">8.0</span> cm</p>`;
  s.appendChild(card);

  const fb = feedbackEl(s);
  const btn = document.createElement("button");
  btn.className = "btn"; btn.textContent = COPY.cigarro.boton;
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
      ok(fb, COPY.cigarro.exito);
      setTimeout(next, 900);
    } else {
      fail(fb);
    }
  };
}

/* =========================================================
   P4 — OBSTÁCULOS: lleva a la novia borracha hasta el suegro
   La gracia está en controlar el tambaleo (inercia + bandazos).
   ========================================================= */
function screenObstacles() {
  const s = makeScreen();
  s.innerHTML = `<p class="kicker">${COPY.borracha.kicker}</p><h2>${COPY.borracha.titulo}</h2>
    <p class="hint">${COPY.borracha.texto}</p>`;

  const wrap = document.createElement("div");
  wrap.className = "pong-wrap";
  const cv = document.createElement("canvas");
  cv.id = "arena";
  wrap.appendChild(cv);
  s.appendChild(wrap);
  const fb = feedbackEl(s);

  // la cara de la novia empeora con cada copa
  const drunkEmojis = ["🥴", "🤪", "😵‍💫", "🤢", "🤮"];
  // fotos por nivel de borrachera: assets/novia1.png (sobria) … novia5.png (fatal).
  // Si falta alguna, usa novia.png; si tampoco está, el emoji del nivel.
  const noviaLevels = Array.from({ length: 5 }, (_, i) => {
    const im = new Image(); im.__ok = false;
    im.onload = () => im.__ok = true;
    im.src = `assets/novia${i + 1}.png`;
    return im;
  });
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
  // enemigos que se mueven (rebotan en paredes)
  const enemies = [
    { x: 160, y: 110, vx: 1.6, vy: 0.0, r: 18, e: "👵" },
    { x: 60,  y: 250, vx: 0.0, vy: 1.5, r: 18, e: "💃" },
    { x: 260, y: 250, vx: -1.4, vy: 1.1, r: 18, e: "🐕" },
    { x: 160, y: 380, vx: 1.2, vy: -0.8, r: 18, e: "🐗" },
  ];
  // bebidas: si las toca, se las bebe (borrachera acumulativa)
  const drinks = [
    { x: 120, y: 190, r: 15, e: "🍺", active: true },
    { x: 210, y: 285, r: 15, e: "🍷", active: true },
    { x: 55,  y: 105, r: 15, e: "🥃", active: true },
    { x: 265, y: 90,  r: 15, e: "🍾", active: true },
  ];
  let drunk = 0;          // nivel de borrachera extra (0..4)
  let invertedUntil = 0;  // tras un trago, el mundo gira (controles invertidos)

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
      // el vaivén crece con cada trago
      const wobble = Math.sin(t * 0.004) * (0.78 + drunk * 0.16) + (Math.random() - 0.5) * (0.4 + drunk * 0.15);
      const cos = Math.cos(wobble), sin = Math.sin(wobble);
      let rx = dx * cos - dy * sin, ry = dx * sin + dy * cos;
      if (now < invertedUntil) { rx = -rx; ry = -ry; } // el mundo gira: va al revés
      player.vx += rx * 0.5; player.vy += ry * 0.5;
    }
    // bandazos aleatorios + algún tropiezo gordo (crecen con la borrachera)
    player.vx += (Math.random() - 0.5) * (0.85 + drunk * 0.22);
    player.vy += (Math.random() - 0.5) * (0.85 + drunk * 0.22);
    if (Math.random() < 0.02 + drunk * 0.008) { player.vx += (Math.random() - 0.5) * 7; player.vy += (Math.random() - 0.5) * 7; }

    // inercia (mucha = cuesta frenar)
    player.vx *= 0.90; player.vy *= 0.90;
    // límite de velocidad (borracha = más lanzada)
    const sp = Math.hypot(player.vx, player.vy), MAX = 3.4 + drunk * 0.25;
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
        fb.className = "feedback bad"; fb.textContent = randItem(COPY.borracha.tropiezos);
      }
    }

    // bebidas: un trago… y a verlas venir
    for (const dr of drinks) {
      if (dr.active && dist(player, dr) < player.r + dr.r) {
        dr.active = false;
        drunk = Math.min(4, drunk + 1);
        invertedUntil = now + 2200;
        fb.className = "feedback bad";
        fb.textContent = fmt(randItem(COPY.borracha.tragos), { copa: dr.e });
        // la copa reaparece en otro sitio al rato
        setTimeout(() => {
          dr.x = 40 + Math.random() * (W - 80);
          dr.y = 80 + Math.random() * (H - 180);
          dr.active = true;
        }, 5000);
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
        respawn(randItem(COPY.borracha.enemigos));
      }
    }

    // meta
    if (dist(player, goal) < player.r + goal.r - 6 && !won) {
      won = true; running = false;
      ok(fb, COPY.borracha.exito);
      setTimeout(next, 1400);
    }

    draw(t);
    requestAnimationFrame(loop);
  }

  function emoji(x, y, size, ch) {
    // fillStyle OPACO siempre: en Android el alpha del último fillStyle tiñe los emoji
    ctx.fillStyle = "#000";
    ctx.font = size + "px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(ch, x, y + 1);
  }
  function imgCircle(img, x, y, r) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(img, x - r, y - r, r * 2, r * 2); ctx.restore();
    ctx.lineWidth = 2; ctx.strokeStyle = "#c26479"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  }

  function draw(t) {
    // suelo
    ctx.fillStyle = "#3a2630"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.04)";
    for (let y = 0; y < H; y += 24) ctx.fillRect(0, y, W, 12);

    // meta (suegro)
    ctx.fillStyle = "rgba(212,163,115,.3)"; ctx.beginPath(); ctx.arc(goal.x, goal.y, goal.r + 8, 0, Math.PI * 2); ctx.fill();
    if (hasSuegro) imgCircle(imgSuegro, goal.x, goal.y, goal.r); else emoji(goal.x, goal.y, 34, "👴");

    // obstáculos
    obstacles.forEach(o => emoji(o.x, o.y, o.r * 1.8, o.e));
    // bebidas (brillan un poco para tentar)
    drinks.forEach(dr => {
      if (!dr.active) return;
      ctx.fillStyle = "rgba(212,163,115,.18)";
      ctx.beginPath(); ctx.arc(dr.x, dr.y, dr.r + 5 + Math.sin(t * 0.005) * 2, 0, Math.PI * 2); ctx.fill();
      emoji(dr.x, dr.y, dr.r * 2, dr.e);
    });
    // enemigos
    enemies.forEach(en => emoji(en.x, en.y, en.r * 1.9, en.e));

    // estela borracha
    trail.forEach((p, i) => {
      ctx.globalAlpha = (i + 1) / trail.length * 0.25;
      ctx.fillStyle = "#e08aa0"; ctx.beginPath(); ctx.arc(p.x, p.y, player.r * 0.7, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // sprite según nivel: foto del nivel → novia.png → emoji del nivel
    const lvl = Math.min(drunk, 4);
    const sprite = noviaLevels[lvl].__ok ? noviaLevels[lvl] : (hasNovia ? imgNovia : null);

    // visión doble: un "fantasma" de la novia que baila alrededor
    if (drunk > 0) {
      ctx.globalAlpha = 0.22 + drunk * 0.07;
      const off = 5 + drunk * 3;
      const gx = player.x + Math.sin(t * 0.006) * off, gy = player.y + Math.cos(t * 0.005) * off * 0.7;
      if (sprite) ctx.drawImage(sprite, gx - player.r, gy - player.r, player.r * 2, player.r * 2);
      else emoji(gx, gy, 30, drunkEmojis[lvl]);
      ctx.globalAlpha = 1;
    }

    // jugadora (novia): la cara/foto cambia con cada copa
    if (sprite) imgCircle(sprite, player.x, player.y, player.r);
    else emoji(player.x, player.y, 30, drunkEmojis[lvl]);

    // HUD
    ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = "13px serif"; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(COPY.borracha.hudTropiezos + tropiezos + (drunk ? COPY.borracha.hudCopas + "🍺".repeat(drunk) : ""), 8, 8);
    if (performance.now() < invertedUntil) {
      ctx.fillStyle = "#e8b8c4"; ctx.textAlign = "center";
      ctx.fillText(COPY.borracha.mundoGira, W / 2, 26);
    }
  }

  requestAnimationFrame(loop);
}


/* =========================================================
   P5 — DISTANCIA Fraga → Viladecans (185 ±2 km)
   ========================================================= */
function screenDistancia() {
  const s = makeScreen();
  const cfg = CONFIG.distancia;
  s.innerHTML = `<p class="kicker">${COPY.distancia.kicker}</p><h2>${COPY.distancia.titulo}</h2>
    <p class="hint">${COPY.distancia.texto}</p>`;

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<div class="km-read"><span id="kmRead">${Math.round((cfg.min+cfg.max)/2)}</span> km</div>
    <input class="slider" type="range" id="kmSlider" min="${cfg.min}" max="${cfg.max}" value="${Math.round((cfg.min+cfg.max)/2)}" step="1" />
    <div class="tiny">${COPY.distancia.ayuda}</div>`;
  s.appendChild(card);

  const fb = feedbackEl(s);
  const btn = document.createElement("button");
  btn.className = "btn"; btn.textContent = COPY.distancia.boton;
  s.appendChild(btn);

  const slider = $("#kmSlider", card), kmRead = $("#kmRead", card);
  slider.addEventListener("input", () => kmRead.textContent = slider.value);

  btn.onclick = () => {
    if (Math.abs(Number(slider.value) - cfg.correctKm) <= cfg.tolerance) {
      ok(fb, COPY.distancia.exito);
      setTimeout(next, 900);
    } else fail(fb);
  };
}

/* =========================================================
   P6 — PONG (primero a 3)
   ========================================================= */
function screenPong() {
  const s = makeScreen();
  s.innerHTML = `<p class="kicker">${COPY.pong.kicker}</p><h2>${COPY.pong.titulo}</h2>
    <p class="hint">${fmt(COPY.pong.texto, { puntos: CONFIG.pong.winScore })}</p>
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

  const padH = 16, PAD_FULL = 84;
  let mePadW = PAD_FULL;      // la pala del novio ENCOGE con cada golpe
  const aiPadW = PAD_FULL;
  let me = { x: W/2 - PAD_FULL/2 }, ai = { x: W/2 - PAD_FULL/2 };
  const meTrail = [], aiTrail = []; // estelas
  let ball = resetBall(1);
  let meScore = 0, aiScore = 0, running = true;

  // regalos de boda en la pista: se pasean y desvían el anillo
  const obs = [
    { x: 80,  y: 128, r: 14, vx: .55,  e: "🍾" },
    { x: 220, y: 156, r: 14, vx: -.5,  e: "💐" },
    { x: 150, y: 268, r: 14, vx: .45,  e: "🎁" },
  ];

  function resetBall(dir) {
    // más rápido que antes
    return { x: W/2, y: H/2, vx: (Math.random()*2-1)*3.4, vy: dir * 5.2, r: 12, ang: 0 };
  }

  function setMeX(clientX) {
    const rect = cv.getBoundingClientRect();
    const rel = (clientX - rect.left) / rect.width * W;
    me.x = Math.min(W - mePadW, Math.max(0, rel - mePadW/2));
  }
  cv.addEventListener("touchmove", e => { setMeX(e.touches[0].clientX); e.preventDefault(); }, { passive: false });
  cv.addEventListener("touchstart", e => { setMeX(e.touches[0].clientX); }, { passive: true });
  cv.addEventListener("mousemove", e => setMeX(e.clientX));

  function loop() {
    if (!running || current !== screens.indexOf(screenPong)) return;

    // IA MÁS LENTA y torpe (más fácil de ganar)
    const target = ball.x - aiPadW/2;
    ai.x += Math.max(-1.7, Math.min(1.7, (target - ai.x) * 0.05));
    ai.x = Math.min(W - aiPadW, Math.max(0, ai.x));

    // estelas (guarda posiciones recientes)
    meTrail.push(me.x); if (meTrail.length > 9) meTrail.shift();
    aiTrail.push(ai.x); if (aiTrail.length > 9) aiTrail.shift();

    ball.x += ball.vx; ball.y += ball.vy; ball.ang += 0.18;
    if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;

    // los regalos se pasean y desvían el anillo
    for (const o of obs) {
      o.x += o.vx;
      if (o.x < 30 + o.r || o.x > W - 30 - o.r) o.vx *= -1;
      const dx = ball.x - o.x, dy = ball.y - o.y, d = Math.hypot(dx, dy);
      if (d < ball.r + o.r) {
        const nx = dx / (d || 1), ny = dy / (d || 1);
        const dot = ball.vx * nx + ball.vy * ny;
        ball.vx -= 2 * dot * nx; ball.vy -= 2 * dot * ny;    // rebote
        ball.vx += (Math.random() - .5) * 1.2;                // caos extra
        ball.x = o.x + nx * (ball.r + o.r + 1);
        ball.y = o.y + ny * (ball.r + o.r + 1);
        if (Math.abs(ball.vy) < 2.2) ball.vy = 2.2 * Math.sign(ball.vy || 1); // que no se quede plano
      }
    }

    if (ball.y - ball.r < padH && ball.x > ai.x && ball.x < ai.x + aiPadW && ball.vy < 0) {
      ball.vy *= -1; ball.vx += (ball.x - (ai.x + aiPadW/2)) * 0.06;
    }
    if (ball.y + ball.r > H - padH && ball.x > me.x && ball.x < me.x + mePadW && ball.vy > 0) {
      ball.vy *= -1; ball.vx += (ball.x - (me.x + mePadW/2)) * 0.06;
      mePadW = Math.max(46, mePadW - 7); // cada golpe, la pala encoge
    }
    if (ball.y < 0) { meScore++; meScoreEl.textContent = meScore; mePadW = PAD_FULL; ball = resetBall(1); checkWin(); }
    if (ball.y > H) { aiScore++; aiScoreEl.textContent = aiScore; mePadW = PAD_FULL; ball = resetBall(-1); }

    draw();
    requestAnimationFrame(loop);
  }

  function checkWin() {
    if (meScore >= CONFIG.pong.winScore) {
      running = false;
      ok(fb, COPY.pong.exito);
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

  function drawPaddle(x, y, w, color, trail, img, hasImg) {
    // estela
    trail.forEach((tx, i) => {
      const a = (i + 1) / trail.length * 0.28;
      ctx.globalAlpha = a;
      ctx.fillStyle = color;
      roundRect(tx, y, w, padH, 8); ctx.fill();
    });
    ctx.globalAlpha = 1;
    // pala
    if (hasImg) {
      ctx.save(); roundRect(x, y, w, padH, 8); ctx.clip();
      ctx.drawImage(img, x, y, w, padH);
      ctx.restore();
      ctx.lineWidth = 2; ctx.strokeStyle = color; roundRect(x, y, w, padH, 8); ctx.stroke();
    } else {
      const g = ctx.createLinearGradient(x, y, x, y + padH);
      g.addColorStop(0, "#fff6"); g.addColorStop(.5, color); g.addColorStop(1, "#0003");
      ctx.fillStyle = g; roundRect(x, y, w, padH, 8); ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.stroke();
    }
  }

  function drawCourt() {
    // tierra batida
    ctx.fillStyle = "#c96f4a"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(0,0,0,.05)";
    for (let y = 0; y < H; y += 16) ctx.fillRect(0, y, W, 8);
    // líneas blancas de la pista
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 2;
    ctx.strokeRect(14, 12, W - 28, H - 24);                 // dobles
    ctx.beginPath(); ctx.moveTo(40, 12); ctx.lineTo(40, H - 12); ctx.stroke();          // individuales izq
    ctx.beginPath(); ctx.moveTo(W - 40, 12); ctx.lineTo(W - 40, H - 12); ctx.stroke();  // individuales dcha
    ctx.beginPath(); ctx.moveTo(14, H/2 - 78); ctx.lineTo(W - 14, H/2 - 78); ctx.stroke(); // saque arriba
    ctx.beginPath(); ctx.moveTo(14, H/2 + 78); ctx.lineTo(W - 14, H/2 + 78); ctx.stroke(); // saque abajo
    ctx.beginPath(); ctx.moveTo(W/2, H/2 - 78); ctx.lineTo(W/2, H/2 + 78); ctx.stroke();   // línea central de saque
    // red
    ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(0, H/2 + 2, W, 4);   // sombra
    ctx.fillStyle = "#f4f0e6"; ctx.fillRect(0, H/2 - 3, W, 5);           // cinta
    ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 8) { ctx.beginPath(); ctx.moveTo(x, H/2 - 3); ctx.lineTo(x, H/2 + 2); ctx.stroke(); }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawCourt();
    // regalos de boda (flotan un poco)
    obs.forEach(o => {
      ctx.fillStyle = "#000"; // opaco: en Android el alpha del fillStyle tiñe los emoji
      ctx.font = (o.r * 2.1) + "px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(o.e, o.x, o.y + Math.sin(Date.now() / 300 + o.x) * 2);
    });
    // palas (novia arriba = IA, novio abajo = jugador)
    drawPaddle(ai.x, 2, aiPadW, "#d4a373", aiTrail, imgNovia, hasNovia);
    drawPaddle(me.x, H - padH - 2, mePadW, "#c26479", meTrail, imgNovio, hasNovio);
    // bola = anillo 💍
    ctx.save();
    ctx.translate(ball.x, ball.y); ctx.rotate(ball.ang);
    ctx.fillStyle = "#000"; // opaco: en Android el alpha del fillStyle tiñe los emoji
    ctx.font = (ball.r * 2.4) + "px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("💍", 0, 1);
    ctx.restore();
  }

  requestAnimationFrame(loop);
}

/* =========================================================
   P6 — ARIA Y FLOKY: que no se coman los calcetines
   Toca los calcetines para salvarlos; toca a los perros
   para espantarlos. Los perros van al calcetín más cercano
   y cada vez corren más.
   ========================================================= */
function screenDogs() {
  const s = makeScreen();
  const GOAL = CONFIG.perros.salvar, MAX_EATEN = CONFIG.perros.maxComidos;
  s.innerHTML = `<p class="kicker">${COPY.perros.kicker}</p><h2>${COPY.perros.titulo}</h2>
    <p class="hint">${fmt(COPY.perros.texto, { salvar: GOAL, max: MAX_EATEN })}</p>`;

  const wrap = document.createElement("div");
  wrap.className = "pong-wrap";
  const cv = document.createElement("canvas");
  cv.id = "dogs";
  wrap.appendChild(cv);
  s.appendChild(wrap);
  const fb = feedbackEl(s);

  const W = 320, H = 420; cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");

  let saved = 0, eaten = 0, running = true;
  const socks = [];
  const pops = [];   // efectos flotantes (corazones, ñams…)
  let spawnTimer = 0;

  const dogs = [
    { x: 40,  y: 40,  speed: 1.15, r: 20, e: "🐕", name: COPY.perros.nombres[0], stun: 0 },
    { x: 280, y: 380, speed: 1.3,  r: 20, e: "🐶", name: COPY.perros.nombres[1], stun: 0 },
  ];

  function spawnSock() {
    socks.push({ x: 30 + Math.random() * (W - 60), y: 45 + Math.random() * (H - 90), r: 16 });
  }
  spawnSock(); spawnSock();

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function tapAt(clientX, clientY) {
    if (!running) return;
    const rect = cv.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width * W;
    const y = (clientY - rect.top) / rect.height * H;
    // ¿calcetín? (radio generoso para el dedo)
    for (let i = 0; i < socks.length; i++) {
      if (Math.hypot(socks[i].x - x, socks[i].y - y) < 30) {
        pops.push({ x: socks[i].x, y: socks[i].y, e: "💖", t: performance.now() });
        socks.splice(i, 1);
        saved++;
        if (saved >= GOAL) win();
        return;
      }
    }
    // ¿perro? → se asusta, salta hacia atrás y se queda aturdido un momento
    for (const d of dogs) {
      if (Math.hypot(d.x - x, d.y - y) < 34) {
        d.stun = performance.now() + 900;
        pops.push({ x: d.x, y: d.y - 22, e: "💢", t: performance.now() });
        const ang = Math.random() * Math.PI * 2;
        d.x = Math.min(W - 20, Math.max(20, d.x + Math.cos(ang) * 60));
        d.y = Math.min(H - 20, Math.max(20, d.y + Math.sin(ang) * 60));
      }
    }
  }
  cv.addEventListener("touchstart", e => { tapAt(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, { passive: false });
  cv.addEventListener("mousedown", e => tapAt(e.clientX, e.clientY));

  function win() {
    running = false;
    ok(fb, fmt(COPY.perros.exito, { salvar: GOAL }));
    setTimeout(next, 1200);
  }
  function lose() {
    eaten = 0; saved = 0;
    socks.length = 0; spawnSock(); spawnSock();
    fb.className = "feedback bad";
    fb.textContent = randItem(COPY.perros.derrotas);
  }

  let last = performance.now();
  function loop(now) {
    if (!running || current !== screens.indexOf(screenDogs)) return;
    const dt = Math.min(32, now - last); last = now;

    // van apareciendo calcetines (máximo 4 a la vez)
    spawnTimer += dt;
    if (spawnTimer > 1400 && socks.length < 4) { spawnTimer = 0; spawnSock(); }

    // los perros persiguen el calcetín más cercano, y cada vez corren más
    const boost = 1 + Math.min(0.8, saved * 0.07);
    for (const d of dogs) {
      if (now < d.stun || !socks.length) continue;
      let tgt = socks[0], best = Infinity;
      for (const sk of socks) { const dd = dist(d, sk); if (dd < best) { best = dd; tgt = sk; } }
      const dx = tgt.x - d.x, dy = tgt.y - d.y, dd = Math.hypot(dx, dy) || 1;
      d.x += dx / dd * d.speed * boost * (dt / 16);
      d.y += dy / dd * d.speed * boost * (dt / 16);
      if (dd < d.r + tgt.r - 6) {
        pops.push({ x: tgt.x, y: tgt.y, e: "😋", t: now }); // ñam
        socks.splice(socks.indexOf(tgt), 1);
        eaten++;
        if (eaten >= MAX_EATEN) lose();
      }
    }

    draw(now);
    requestAnimationFrame(loop);
  }

  function emoji(x, y, size, ch) {
    // fillStyle OPACO siempre: en Android el alpha del último fillStyle tiñe los emoji
    ctx.fillStyle = "#000";
    ctx.font = size + "px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(ch, x, y + 1);
  }

  function draw(now) {
    // suelo del salón
    ctx.fillStyle = "#3a2630"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.04)";
    for (let y = 0; y < H; y += 24) ctx.fillRect(0, y, W, 12);

    // calcetines (se menean para tentar)
    socks.forEach(sk => emoji(sk.x, sk.y + Math.sin(now / 250 + sk.x) * 2, 30, "🧦"));

    // perros (trotan; aturdidos ven estrellitas)
    dogs.forEach(d => {
      const hop = now < d.stun ? 0 : Math.abs(Math.sin(now / 130 + d.x)) * 3;
      emoji(d.x, d.y - hop, 38, d.e);
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = "11px serif"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(d.name, d.x, d.y + 18);
      if (now < d.stun) emoji(d.x + 16, d.y - 24, 14, "💫");
    });

    // efectos flotantes
    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i], age = now - p.t;
      if (age > 700) { pops.splice(i, 1); continue; }
      ctx.globalAlpha = 1 - age / 700;
      emoji(p.x, p.y - age / 24, 24, p.e);
      ctx.globalAlpha = 1;
    }

    // HUD
    ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = "13px serif"; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(`${COPY.perros.hudSalvados}: ${saved}/${GOAL}   ${COPY.perros.hudComidos}: ${eaten}/${MAX_EATEN}`, 8, 8);
  }

  requestAnimationFrame(loop);
}

/* =========================================================
   P8 — WORDLE: adivina la palabra (5 letras, 6 intentos)
   ========================================================= */
function screenWordle() {
  const s = makeScreen();
  const ROWS = 6, LEN = 5;
  const answer = randItem(CONFIG.wordle.words).toUpperCase();

  s.innerHTML = `<p class="kicker">${COPY.wordle.kicker}</p><h2>${COPY.wordle.titulo}</h2>
    <p class="hint">${COPY.wordle.texto}</p>`;

  const board = document.createElement("div");
  board.className = "wordle-board";
  s.appendChild(board);
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    const row = document.createElement("div");
    row.className = "wordle-row";
    cells[r] = [];
    for (let c = 0; c < LEN; c++) {
      const t = document.createElement("div");
      t.className = "wordle-tile";
      row.appendChild(t);
      cells[r][c] = t;
    }
    board.appendChild(row);
  }

  const fb = feedbackEl(s);

  // teclado en pantalla
  const kb = document.createElement("div");
  kb.className = "keyboard";
  const rowsKb = ["QWERTYUIOP", "ASDFGHJKLÑ", "↵ZXCVBNM⌫"];
  const keyState = {}; // letra -> estado para colorear teclas
  rowsKb.forEach(rk => {
    const kr = document.createElement("div");
    kr.className = "kb-row";
    for (const ch of rk) {
      const key = document.createElement("button");
      key.className = "key" + (ch === "↵" || ch === "⌫" ? " key-wide" : "");
      key.textContent = ch;
      key.dataset.k = ch;
      key.onclick = () => press(ch);
      kr.appendChild(key);
    }
    kb.appendChild(kr);
  });
  s.appendChild(kb);

  let row = 0, col = 0, done = false;
  const grid = Array.from({ length: ROWS }, () => Array(LEN).fill(""));

  function press(ch) {
    if (done) return;
    if (ch === "↵") return submit();
    if (ch === "⌫") { if (col > 0) { col--; grid[row][col] = ""; paint(); } return; }
    if (col < LEN) { grid[row][col] = ch; col++; paint(); }
  }

  function paint() {
    for (let c = 0; c < LEN; c++) {
      cells[row][c].textContent = grid[row][c];
      cells[row][c].classList.toggle("filled", !!grid[row][c]);
    }
  }

  function submit() {
    if (col < LEN) { fb.className = "feedback bad"; fb.textContent = COPY.wordle.faltanLetras; return; }
    const guess = grid[row].join("");
    // colorear con manejo de letras repetidas
    const res = Array(LEN).fill("absent");
    const rem = {};
    for (let c = 0; c < LEN; c++) rem[answer[c]] = (rem[answer[c]] || 0) + 1;
    for (let c = 0; c < LEN; c++) if (guess[c] === answer[c]) { res[c] = "correct"; rem[guess[c]]--; }
    for (let c = 0; c < LEN; c++) if (res[c] !== "correct" && rem[guess[c]] > 0) { res[c] = "present"; rem[guess[c]]--; }

    for (let c = 0; c < LEN; c++) {
      const cell = cells[row][c];
      cell.classList.add(res[c]);
      // estado de la tecla (correct > present > absent)
      const k = guess[c], prev = keyState[k];
      if (res[c] === "correct" || (res[c] === "present" && prev !== "correct") || (!prev)) keyState[k] = res[c];
      const keyEl = kb.querySelector(`.key[data-k="${k}"]`);
      if (keyEl) keyEl.className = "key " + keyState[k];
    }

    if (guess === answer) {
      done = true;
      ok(fb, COPY.wordle.exito);
      setTimeout(next, 1300);
      return;
    }
    row++; col = 0;
    if (row >= ROWS) {
      done = true;
      fb.className = "feedback bad";
      fb.textContent = fmt(COPY.wordle.derrota, { palabra: answer });
      const retry = document.createElement("button");
      retry.className = "btn secondary"; retry.textContent = COPY.wordle.reintentar;
      retry.onclick = () => show(current); // recarga la pantalla (nueva palabra al azar)
      s.appendChild(retry);
    }
  }

  // teclado físico (para probar en escritorio)
  window.__wordleKey && window.removeEventListener("keydown", window.__wordleKey);
  window.__wordleKey = (e) => {
    if (current !== screens.indexOf(screenWordle)) return;
    if (e.key === "Enter") { e.preventDefault(); press("↵"); }
    else if (e.key === "Backspace") { e.preventDefault(); press("⌫"); }
    else if (/^[a-zA-ZñÑ]$/.test(e.key)) press(e.key.toUpperCase());
  };
  window.addEventListener("keydown", window.__wordleKey);
}

/* =========================================================
   FINAL — fundido limpio al color del fondo, resplandor,
   lluvia de corazones y cuenta atrás con la canción
   ========================================================= */
function finishGame() {
  setProgress();

  // 1) el juego se desvanece y aparece (en fundido) el interludio con el resplandor
  showInterlude();
  game.style.transition = "opacity 1.5s ease";
  game.style.opacity = 0;
  $("#progress").style.display = "none";
  $("#skipBtn").style.display = "none";

  // 2) lluvia de corazones durante el interludio (se mantiene)
  setTimeout(() => rainHearts(9000), 900);

  // 3) fundido LENTO hacia la cuenta atrás; la canción y la letra entran después
  setTimeout(() => {
    showFinal();
    const il = $(".interlude");
    if (il) {
      il.style.transition = "opacity 2.5s ease";
      il.style.opacity = "0";
      setTimeout(() => il.remove(), 2600);
    }
  }, 6000);
}

// interludio: pantalla del color del fondo con un resplandor suave (sin nombres ni emojis)
function showInterlude() {
  const il = document.createElement("div");
  il.className = "interlude";
  il.innerHTML = `<div class="il-glow"></div>`;
  document.body.appendChild(il);
}

// lluvia de corazones (celebración sobre la cuenta atrás)
function rainHearts(ms) {
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:35;overflow:hidden";
  document.body.appendChild(box);
  const startT = Date.now();
  (function spawn() {
    if (Date.now() - startT > ms) { setTimeout(() => box.remove(), 4600); return; }
    const h = document.createElement("div");
    h.textContent = randItem(["❤️", "💖", "🤍", "💛", "🌹", "💍", "🎉"]);
    h.style.cssText = `position:absolute;top:-34px;left:${Math.random() * 100}%;font-size:${14 + Math.random() * 22}px`;
    box.appendChild(h);
    h.animate([
      { transform: "translateY(0) rotate(0)", opacity: 1 },
      { transform: `translateY(${window.innerHeight + 70}px) rotate(${(Math.random() * 2 - 1) * 180}deg)`, opacity: .85 },
    ], { duration: 2600 + Math.random() * 1900, easing: "linear", fill: "forwards" });
    setTimeout(() => h.remove(), 4600);
    setTimeout(spawn, 48);
  })();
}

function showFinal() {
  const wrap = document.createElement("div");
  wrap.className = "final show";
  wrap.innerHTML = `
    <div class="label">${COPY.final.titulo}</div>
    <div class="units">
      <div class="unit"><span class="clock" id="cd-d">00</span><small>${COPY.final.dias}</small></div>
      <div class="unit"><span class="clock" id="cd-h">00</span><small>${COPY.final.horas}</small></div>
      <div class="unit"><span class="clock" id="cd-m">00</span><small>${COPY.final.min}</small></div>
      <div class="unit"><span class="clock" id="cd-s">00</span><small>${COPY.final.seg}</small></div>
    </div>
    <div class="date">${COPY.final.fecha}</div>
  `;
  document.body.appendChild(wrap);

  // emojis flotando suaves detrás de la cuenta atrás
  const floats = document.createElement("div");
  floats.className = "hearts final-hearts";
  const finalPool = ["❤️", "💛", "🤍", "💕", "💖", "💍", "👰", "🤵", "💒", "🌾", "🌼", "🎉", "🥂", "🌹"];
  for (let i = 0; i < 26; i++) {
    const h = document.createElement("div");
    h.className = "heart";
    h.textContent = randItem(finalPool);
    h.style.left = Math.random() * 100 + "%";
    h.style.animationDuration = (6 + Math.random() * 8) + "s";
    h.style.animationDelay = (-Math.random() * 12) + "s";
    h.style.fontSize = (13 + Math.random() * 20) + "px";
    floats.appendChild(h);
  }
  wrap.prepend(floats);

  // canción de los novios: entra DESPUÉS de la cuenta atrás y arranca sola
  const audio = document.createElement("audio");
  audio.controls = true; audio.src = CONFIG.assets.cancion;
  audio.style.display = "none";
  audio.onerror = () => { audio.replaceWith(Object.assign(document.createElement("div"), { className: "label", textContent: COPY.final.sinCancion })); };
  wrap.appendChild(audio);

  // letra en scroll (tipo créditos): invisible hasta que la canción suena
  if (COPY.final.letra && COPY.final.letra.length) {
    const lyr = document.createElement("div");
    lyr.className = "lyrics";
    const inner = document.createElement("div");
    inner.className = "lyrics-inner";
    COPY.final.letra.forEach(line => {
      const p = document.createElement("p");
      p.innerHTML = line === "" ? "&nbsp;" : "";
      if (line !== "") p.textContent = line;
      inner.appendChild(p);
    });
    lyr.appendChild(inner);
    wrap.appendChild(lyr);
    // velocidad: ~2s por línea → una pasada completa ≈ duración de la canción (3:16)
    inner.style.animationDuration = (COPY.final.letra.length * 2) + "s";
    // la letra aparece con el play, y el scroll arranca 1 segundo después de sonar
    let scrollTimer = null;
    audio.addEventListener("play", () => {
      lyr.classList.add("on");
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => inner.classList.add("rolling"), 1000);
    });
    audio.addEventListener("pause", () => { clearTimeout(scrollTimer); inner.classList.remove("rolling"); });
  }

  // secuencia: 1º cuenta atrás → 2º canción (sola) → 3º letra (con el play)
  setTimeout(() => {
    audio.style.display = "";
    audio.play().catch(() => { /* si el navegador bloquea el autoplay, queda el botón ▶ */ });
  }, 2200);

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
