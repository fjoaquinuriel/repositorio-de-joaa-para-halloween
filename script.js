(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Cuenta atrás ---------- */
  (() => {
    const el = $('#count'); if (!el) return;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let target = new Date(now.getFullYear(), 9, 31);
    if (today > target) target = new Date(now.getFullYear() + 1, 9, 31);
    const d = Math.round((target - today) / 864e5);
    el.textContent = d === 0 ? 'Hoy es 31 de octubre. Apaga las luces.'
      : d === 1 ? 'Falta 1 día para Halloween.'
      : 'Faltan ' + d + ' días para Halloween.';
  })();

  /* ---------- Fondo dinámico ---------- */
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, sil = null, wins = [];
  const rnd32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const S = (top, mid, hor, moon, storm) => ({ top, mid, hor, moon, storm: !!storm });
  const scenes = {
    inicio:       S([6, 6, 10],  [24, 14, 22], [84, 32, 10],  [243, 235, 200]),
    pelicula:     S([5, 8, 18],  [12, 22, 42], [34, 48, 84],  [236, 240, 226]),
    reparto:      S([6, 12, 9],  [14, 28, 22], [38, 62, 46],  [226, 238, 205]),
    curiosidades: S([12, 6, 18], [30, 12, 40], [76, 28, 72],  [240, 222, 235], true),
    galeria:      S([10, 8, 6],  [34, 20, 10], [100, 52, 12], [255, 196, 120]),
    duelo:        S([14, 4, 6],  [42, 8, 10],  [120, 22, 14], [236, 120, 92], true)
  };
  const clone = s => ({ top: s.top.slice(), mid: s.mid.slice(), hor: s.hor.slice(), moon: s.moon.slice(), storm: s.storm });
  let cur = clone(scenes.inicio), target = scenes.inicio;
  const rgb = a => 'rgb(' + (a[0] | 0) + ',' + (a[1] | 0) + ',' + (a[2] | 0) + ')';

  const R = rnd32(11);
  const stars = Array.from({ length: 130 }, () => ({ x: R(), y: R() * .62, r: R() < .15 ? 2 : 1, sp: .6 + R() * 1.6, ph: R() * 6.28 }));
  const fogs = Array.from({ length: 8 }, (_, i) => ({ x: R() * 1.2 - .1, y: i < 4 ? .3 + R() * .35 : .74 + R() * .18, w: .22 + R() * .25, h: .12 + R() * .1, a: .06 + R() * .08, sp: (.004 + R() * .008) * (R() < .5 ? 1 : -1) }));
  const leafCols = ['#c2570f', '#8a3a0c', '#a8761f', '#6b2410'];
  let leaves = [];
  let bats = [], nextBat = 6;
  let embers = [];
  let fl = 0, nextBolt = 9, bolt = [];

  function resize(force) {
    const w = innerWidth, h = innerHeight;
    if (!force && w === W && Math.abs(h - H) < 120) return;
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = w; H = h;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    buildSil();
    const n = W < 700 ? 16 : 28;
    leaves = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: 20 + Math.random() * 40, vy: 22 + Math.random() * 38, rot: Math.random() * 6.28, vr: (Math.random() - .5) * 3, s: 3.5 + Math.random() * 4, c: leafCols[(Math.random() * 4) | 0], ph: Math.random() * 6.28 }));
  }

  function buildSil() {
    sil = document.createElement('canvas');
    sil.width = Math.round(W * DPR); sil.height = Math.round(H * DPR);
    const s = sil.getContext('2d'); s.scale(DPR, DPR);
    const rnd = rnd32(7);
    const gy = x => H * .86 + Math.sin(x / W * 8 + 1) * H * .012 + Math.sin(x / W * 19) * H * .005;
    const u = Math.max(.55, Math.min(1.25, Math.min(W / 1300, H / 760)));
    s.fillStyle = '#050406';
    s.beginPath(); s.moveTo(0, H);
    for (let x = 0; x <= W + 12; x += 12) s.lineTo(x, gy(x));
    s.lineTo(W, H); s.closePath(); s.fill();

    // casa
    const hx = W < 700 ? W * .05 : W * .12;
    const base = gy(hx + 110 * u) + 8, top = base - 120 * u;
    s.fillRect(hx, top, 230 * u, 124 * u);
    s.beginPath(); s.moveTo(hx - 14 * u, top + 2); s.lineTo(hx + 115 * u, top - 95 * u); s.lineTo(hx + 244 * u, top + 2); s.closePath(); s.fill();
    s.fillRect(hx + 170 * u, top - 92 * u, 22 * u, 62 * u);
    s.fillRect(hx + 230 * u, top + 44 * u, 84 * u, 80 * u);
    s.beginPath(); s.moveTo(hx + 222 * u, top + 46 * u); s.lineTo(hx + 272 * u, top + 8 * u); s.lineTo(hx + 322 * u, top + 46 * u); s.closePath(); s.fill();
    wins = [
      { x: hx + 40 * u, y: top + 38 * u, w: 26 * u, h: 36 * u },
      { x: hx + 150 * u, y: top + 38 * u, w: 26 * u, h: 36 * u },
      { x: hx + 102 * u, y: top - 56 * u, w: 22 * u, h: 28 * u }
    ];

    // árboles pelados
    function branch(x, y, len, ang, wd, depth) {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      s.lineWidth = Math.max(1, wd); s.lineCap = 'round'; s.strokeStyle = '#050406';
      s.beginPath(); s.moveTo(x, y); s.lineTo(x2, y2); s.stroke();
      if (depth <= 0) return;
      const n = depth > 3 ? 2 : (rnd() < .6 ? 3 : 2);
      for (let i = 0; i < n; i++) {
        const da = (rnd() - .5) * 1.25 + (i - (n - 1) / 2) * .35;
        branch(x2, y2, len * (.68 + rnd() * .14), ang + da, wd * .68, depth - 1);
      }
    }
    [[.88, .15, 7], [.64, .095, 6], [.34, .085, 6], [.985, .11, 6]].forEach(([fx, fl2, d]) => {
      const x = W * fx;
      branch(x, gy(x) + 4, H * fl2, -Math.PI / 2 + (rnd() - .5) * .2, Math.max(4, H * fl2 * .09), d);
    });

    // lápidas
    s.fillStyle = '#050406';
    for (let i = 0; i < 9; i++) {
      const x = W * (.46 + i * .035 + rnd() * .012), w = (14 + rnd() * 12) * u, h = (26 + rnd() * 20) * u, y = gy(x) + 3;
      s.save(); s.translate(x, y); s.rotate((rnd() - .5) * .25);
      if (rnd() < .3) { s.fillRect(-2 * u, -h, 4 * u, h); s.fillRect(-w * .4, -h * .75, w * .8, 4 * u); }
      else { s.beginPath(); s.moveTo(-w / 2, 0); s.lineTo(-w / 2, -h + w / 2); s.arc(0, -h + w / 2, w / 2, Math.PI, 0); s.lineTo(w / 2, 0); s.closePath(); s.fill(); }
      s.restore();
    }
  }

  function drawBat(b, t) {
    const f = Math.sin(t * 14 + b.ph);
    ctx.save(); ctx.translate(b.x, b.y); ctx.scale(b.vx > 0 ? 1 : -1, 1);
    ctx.fillStyle = '#050406';
    ctx.beginPath(); ctx.ellipse(0, 0, b.s * .35, b.s * .2, 0, 0, 6.283); ctx.fill();
    for (const sd of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(sd * b.s * .6, -b.s * (.5 + .4 * f), sd * b.s * 1.2, -b.s * (.1 + .3 * f));
      ctx.quadraticCurveTo(sd * b.s * .8, b.s * .1, sd * b.s * .5, b.s * .1);
      ctx.quadraticCurveTo(sd * b.s * .3, b.s * .2, 0, b.s * .15);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function fogLayer(front) {
    for (const f of fogs) {
      if ((f.y > .7) !== front) continue;
      ctx.save(); ctx.translate(f.x * W, f.y * H); ctx.scale(1, f.h);
      const r = f.w * W;
      const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      rg.addColorStop(0, 'rgba(190,185,200,' + f.a + ')'); rg.addColorStop(1, 'rgba(190,185,200,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill(); ctx.restore();
    }
  }

  function draw(t) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgb(cur.top)); g.addColorStop(.55, rgb(cur.mid)); g.addColorStop(.88, rgb(cur.hor)); g.addColorStop(1, '#050406');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    for (const s of stars) {
      const a = .25 + .6 * (.5 + .5 * Math.sin(t * s.sp + s.ph));
      ctx.fillStyle = 'rgba(255,250,230,' + a.toFixed(2) + ')';
      ctx.fillRect(s.x * W, s.y * H, s.r, s.r);
    }

    const mx = W * (W < 700 ? .74 : .78), my = H * (W < 700 ? .14 : .2);
    const mr = Math.max(34, Math.min(98, Math.min(W, H) * .1));
    const pulse = 1 + .03 * Math.sin(t * .8), m = cur.moon;
    const gg = ctx.createRadialGradient(mx, my, mr * .8, mx, my, mr * 5 * pulse);
    gg.addColorStop(0, 'rgba(' + (m[0] | 0) + ',' + (m[1] | 0) + ',' + (m[2] | 0) + ',.35)');
    gg.addColorStop(1, 'rgba(' + (m[0] | 0) + ',' + (m[1] | 0) + ',' + (m[2] | 0) + ',0)');
    ctx.fillStyle = gg; ctx.fillRect(mx - mr * 6, my - mr * 6, mr * 12, mr * 12);
    ctx.fillStyle = rgb(m); ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(110,100,85,.18)';
    [[-.3, -.2, .22], [.25, .1, .3], [-.1, .4, .16], [.38, -.35, .12]].forEach(c => { ctx.beginPath(); ctx.arc(mx + c[0] * mr, my + c[1] * mr, c[2] * mr, 0, 6.283); ctx.fill(); });

    fogLayer(false);

    if (fl > 0.01) {
      ctx.fillStyle = 'rgba(255,255,255,' + (fl * .13).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
      if (bolt.length) {
        ctx.strokeStyle = 'rgba(255,255,255,' + Math.min(1, fl).toFixed(2) + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); bolt.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
      }
    }

    for (const b of bats) drawBat(b, t);
    ctx.drawImage(sil, 0, 0, W, H);

    const f = .8 + .2 * Math.sin(t * 11) * Math.sin(t * 2.3);
    for (const w of wins) {
      const wg = ctx.createRadialGradient(w.x + w.w / 2, w.y + w.h / 2, 0, w.x + w.w / 2, w.y + w.h / 2, w.w * 4);
      wg.addColorStop(0, 'rgba(255,170,70,' + (.28 * f).toFixed(2) + ')'); wg.addColorStop(1, 'rgba(255,170,70,0)');
      ctx.fillStyle = wg; ctx.fillRect(w.x - w.w * 4, w.y - w.w * 4, w.w * 9, w.h + w.w * 8);
      ctx.fillStyle = 'rgba(255,186,90,' + (.8 * f).toFixed(2) + ')'; ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = 'rgba(5,4,6,.9)'; ctx.fillRect(w.x + w.w / 2 - 1, w.y, 2, w.h); ctx.fillRect(w.x, w.y + w.h / 2 - 1, w.w, 2);
    }

    fogLayer(true);

    for (const l of leaves) {
      ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.rot); ctx.fillStyle = l.c;
      ctx.beginPath(); ctx.ellipse(0, 0, l.s, l.s * .5, 0, 0, 6.283); ctx.fill(); ctx.restore();
    }

    if (embers.length) {
      ctx.globalCompositeOperation = 'lighter';
      for (const e of embers) {
        ctx.fillStyle = 'rgba(255,' + (120 + e.life * 90 | 0) + ',40,' + (e.life * .8).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r * (.5 + e.life), 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  function step(dt, t) {
    const k = 1 - Math.pow(.02, dt);
    for (const key of ['top', 'mid', 'hor', 'moon']) for (let i = 0; i < 3; i++) cur[key][i] += (target[key][i] - cur[key][i]) * k;
    cur.storm = target.storm;
    for (const f of fogs) { f.x += f.sp * dt; if (f.x > 1.4) f.x = -.4; if (f.x < -.4) f.x = 1.4; }
    for (const l of leaves) {
      l.x += (l.vx + Math.sin(t + l.ph) * 14) * dt; l.y += l.vy * dt; l.rot += l.vr * dt;
      if (l.y > H + 10) { l.y = -10; l.x = Math.random() * W; }
      if (l.x > W + 10) l.x = -10;
    }
    if (t > nextBat && bats.length < 2) {
      const dir = Math.random() < .5 ? 1 : -1;
      bats.push({ x: dir > 0 ? -30 : W + 30, y: H * (.08 + Math.random() * .3), vx: dir * (90 + Math.random() * 90), s: 9 + Math.random() * 8, ph: Math.random() * 6 });
      nextBat = t + 7 + Math.random() * 8;
    }
    bats = bats.filter(b => { b.x += b.vx * dt; b.y += Math.sin(t * 3 + b.ph) * 18 * dt; return b.x > -50 && b.x < W + 50; });
    if (cur.storm && t > nextBolt) {
      fl = 1; nextBolt = t + 10 + Math.random() * 14;
      bolt = []; let x = W * (.25 + Math.random() * .5);
      for (let y = 0; y < H * .55; y += H * .06) { bolt.push([x, y]); x += (Math.random() - .5) * 60; }
    }
    fl = Math.max(0, fl - dt * 1.7);
    for (const e of embers) { e.x += e.vx * dt * 60; e.y += e.vy * dt * 60; e.life -= dt * .9; }
    embers = embers.filter(e => e.life > 0);
  }

  let last = performance.now(), tt = 0;
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; tt += dt;
    step(dt, tt); draw(tt);
    requestAnimationFrame(loop);
  }
  resize(true);
  if (reduce) draw(0); else requestAnimationFrame(loop);
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduce) draw(0); }, 150); });

  function setScene(id) {
    target = scenes[id] || scenes.inicio;
    if (reduce) { cur = clone(target); draw(0); }
  }

  /* ---------- Secciones y navegación ---------- */
  const links = $$('.links a');
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.dataset.scene;
      setScene(id);
      links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-scene]').forEach(s => io.observe(s));

  /* ---------- Puntero: brasas, linterna y manchas ---------- */
  let lx = -100, ly = -100;
  addEventListener('pointermove', e => {
    root.style.setProperty('--mx', e.clientX + 'px');
    root.style.setProperty('--my', e.clientY + 'px');
    if (reduce || e.pointerType === 'touch') return;
    if (Math.hypot(e.clientX - lx, e.clientY - ly) > 22 && embers.length < 40) {
      lx = e.clientX; ly = e.clientY;
      embers.push({ x: lx, y: ly, vx: (Math.random() - .5) * .5, vy: -(.3 + Math.random() * .7), life: 1, r: 1 + Math.random() * 2 });
    }
  }, { passive: true });

  const torchBtn = $('#torchBtn');
  torchBtn.addEventListener('click', () => {
    const on = document.body.classList.toggle('torch-on');
    torchBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  const splats = [];
  document.addEventListener('click', e => {
    if (reduce) return;
    const s = 24 + Math.random() * 26;
    const el = document.createElement('div'); el.className = 'splat';
    let dots = '';
    const n = 6 + ((Math.random() * 5) | 0);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, r = 10 + Math.random() * 22;
      dots += '<circle cx="' + (40 + Math.cos(a) * r).toFixed(1) + '" cy="' + (40 + Math.sin(a) * r).toFixed(1) + '" r="' + (1.5 + Math.random() * 4).toFixed(1) + '"/>';
    }
    el.innerHTML = '<svg viewBox="0 0 80 80" width="' + (s * 2) + '" height="' + (s * 2) + '" fill="#9d0f16" aria-hidden="true"><circle cx="40" cy="40" r="' + (8 + Math.random() * 7).toFixed(1) + '"/>' + dots + '<rect x="38" y="40" width="4" height="' + (12 + Math.random() * 20).toFixed(0) + '" rx="2"/></svg>';
    el.style.left = (e.clientX - s) + 'px'; el.style.top = (e.clientY - s) + 'px';
    document.body.appendChild(el); splats.push(el);
    if (splats.length > 10) splats.shift().remove();
    setTimeout(() => el.remove(), 1800);
  });

  /* ---------- Secretos: abrir todo ---------- */
  const facts = $$('#facts details');
  const toggleAll = $('#toggleAll');
  toggleAll.addEventListener('click', () => {
    const open = facts.some(d => !d.open);
    facts.forEach(d => { d.open = open; });
    toggleAll.textContent = open ? 'Cerrar todo' : 'Abrir todo';
  });

  /* ---------- Duelo: simulador ---------- */
  const scen = {
    haddonfield: { j: .42, note: 'Terreno de Michael: sombras, jardines y casas con las luces apagadas.' },
    crystal: { j: .70, note: 'Terreno de Jason: bosque, lago y cabañas de madera.' },
    almacen: { j: .58, note: 'Terreno neutral: nadie juega en casa.' }
  };
  const ML = [
    'Michael aparece por la espalda y lo estrella contra la pared.',
    'Michael se queda quieto en la oscuridad y espera su momento.',
    'El cuchillo de Michael roza el hombro de Jason.',
    'Michael cae al suelo, se levanta sin decir nada y vuelve a avanzar.',
    'Michael corta la luz y desaparece de la vista de Jason.',
    'Michael esquiva el machete y responde con un golpe seco.'
  ];
  const JL = [
    'Jason levanta a Michael con una mano y lo lanza contra el suelo.',
    'El machete de Jason abre una grieta en la puerta.',
    'Jason aguanta el golpe sin inmutarse y sigue avanzando.',
    'Jason rompe la pared de un empujón y sale por el otro lado.',
    'Jason atrapa a Michael del cuello y lo arrastra hacia atrás.',
    'Jason ignora el corte y contraataca con toda su fuerza.'
  ];
  const fightBtn = $('#fightBtn'), logEl = $('#log'), resEl = $('#result'), noteEl = $('#sceneNote');
  const sel = () => ($('input[name="scene"]:checked') || {}).value || 'almacen';
  $$('input[name="scene"]').forEach(r => r.addEventListener('change', () => { noteEl.textContent = scen[sel()].note; }));
  noteEl.textContent = scen[sel()].note;
  const take = arr => arr.splice((Math.random() * arr.length) | 0, 1)[0];
  let running = false;
  fightBtn.addEventListener('click', () => {
    if (running) return;
    running = true; fightBtn.disabled = true; logEl.innerHTML = ''; resEl.textContent = '';
    const p = scen[sel()].j, mA = ML.slice(), jA = JL.slice();
    let mj = 0, jj = 0; const steps = [];
    for (let i = 0; i < 5; i++) {
      const jw = Math.random() < p;
      if (jw) jj++; else mj++;
      steps.push({ j: jw, txt: take(jw ? jA : mA) });
    }
    steps.forEach((s, i) => setTimeout(() => {
      const li = document.createElement('li'); li.className = s.j ? 'j' : 'm';
      const b = document.createElement('b'); b.textContent = 'Asalto ' + (i + 1) + ': ';
      li.appendChild(b); li.appendChild(document.createTextNode(s.txt)); logEl.appendChild(li);
    }, i * 700));
    setTimeout(() => {
      resEl.textContent = jj > mj ? 'Gana Jason Voorhees, ' + jj + ' asaltos contra ' + mj + '.' : 'Gana Michael Myers, ' + mj + ' asaltos contra ' + jj + '.';
      running = false; fightBtn.disabled = false; fightBtn.textContent = 'Otra pelea';
    }, steps.length * 700 + 200);
  });

  /* ---------- Duelo: tu voto ---------- */
  const KEY = 'haddonfield-voto';
  const voteBtns = $$('[data-vote]'), voteMsg = $('#voteMsg');
  const getVote = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const putVote = v => { try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento */ } };
  function showVote(v) {
    voteBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.vote === v ? 'true' : 'false'));
    if (!v) return;
    voteMsg.textContent = v === 'jason' ? 'Coincidimos: tu apuesta es Jason.' : 'Piensas distinto que yo: tu apuesta es Michael. Prueba el simulador en Haddonfield.';
  }
  voteBtns.forEach(b => b.addEventListener('click', () => { putVote(b.dataset.vote); showVote(b.dataset.vote); }));
  showVote(getVote());
})();
