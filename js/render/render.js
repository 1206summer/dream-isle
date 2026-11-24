'use strict';
// 캔버스 그리기: 배경, 섬, 캐릭터, 적, 이펙트, 오버레이
const cv = $('#cv'), ctx = cv.getContext('2d');
let DPR = 1, CW = 360, CH = 600, SC = 1;
let BG = { c: null, pal: null, clouds: [], stars: [], sea: null };
function resize() {
  const r = cv.parentElement.getBoundingClientRect();
  DPR = Math.min(3, window.devicePixelRatio || 1); CW = Math.max(1, r.width); CH = Math.max(1, r.height);
  cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR);
  SC = CW / W; G.H = CH / SC;
  G.islandTop = Math.round(G.H - 74);
  const hud = (G.boss ? 128 : 104) / SC;
  G.laneBot = G.islandTop - 22;
  G.laneTop = Math.max(108 / SC, G.islandTop - 210);
  if (G.laneBot - G.laneTop < 70) G.laneTop = G.laneBot - 70;
  G.bowX = 84; G.bowY = G.islandTop - 20;
  ctx.imageSmoothingEnabled = false;
  buildBg(); updateGoldPos();
}
function updateGoldPos() {
  const g = $('#curGold img'); if (!g) return; const r = g.getBoundingClientRect(), v = cv.getBoundingClientRect();
  G.goldPos = { x: (r.left + r.width / 2 - v.left) / SC, y: (r.top + r.height / 2 - v.top) / SC };
}
function buildBg() {
  const r = regionOf(S.stage), base = RPAL[r.idx], hs = r.cycle * 55;
  const P = { sky: base.sky.map(c => hue(c, hs)), cl: base.cl.map(c => hue(c, hs)), sea: base.sea.map(c => hue(c, hs)), deco: base.deco, stars: base.stars, idx: r.idx };
  BG.pal = P;
  const lw = 90, lh = Math.ceil(G.H / 4) + 1, c = mk(lw, lh), x = c.getContext('2d');
  const toRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [a, b, d] = P.sky.map(toRgb);
  for (let j = 0; j < lh; j++) {
    const t = j / (lh - 1); let col;
    if (t < 0.55) { const u = t / 0.55; col = a.map((v, i) => v + (b[i] - v) * u); } else { const u = (t - 0.55) / 0.45; col = b.map((v, i) => v + (d[i] - v) * u); }
    // quantise into soft bands for a pixel look
    col = col.map(v => Math.round(v / 6) * 6);
    x.fillStyle = `rgb(${col.map(v => clamp(v, 0, 255)).join(',')})`; x.fillRect(0, j, lw, 1);
  }
  const hz = lh * 0.7;
  if (P.deco === 'sun') {
    const cx = 66, cy = Math.round(hz - 6), R = 11;
    for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) if (i * i + j * j <= R * R) { if (j > 2 && (j % 3 === 0)) continue; x.fillStyle = j < -4 ? hue('#fff3b8', hs) : j < 2 ? hue('#ffd9a0', hs) : hue('#ffb7a0', hs); x.fillRect(cx + i, cy + j, 1, 1); }
  } else if (P.deco === 'moon' || P.deco === 'night') {
    const cx = P.deco === 'moon' ? 68 : 22, cy = 14, R = 6;
    for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) if (i * i + j * j <= R * R && (i - 3) * (i - 3) + (j + 1) * (j + 1) > 22) { x.fillStyle = P.deco === 'moon' ? '#fff6c9' : '#e9ddff'; x.fillRect(cx + i, cy + j, 1, 1); }
  }
  BG.c = c;
  // clouds
  const cs = [cloudSprite(18, 8, [[5, 5, 3.5], [10, 4, 4], [14, 5, 3.4]], P.cl), cloudSprite(26, 10, [[6, 6, 4], [12, 4.5, 4.5], [18, 5.5, 4], [22, 7, 2.8]], P.cl), cloudSprite(36, 13, [[7, 8, 5], [14, 6, 6], [22, 6, 5.5], [29, 8, 4.5]], P.cl)];
  BG.cloudSpr = cs;
  const R = mulberry(r.num * 7 + 1);
  BG.clouds = [];
  for (let i = 0; i < 8; i++) { const far = i < 4; BG.clouds.push({ s: Math.floor(R() * 3), x: R() * (W + 80) - 40, y: (P.deco === 'inv' ? 20 + R() * G.H * 0.3 : 30 + R() * (G.H * 0.62)), v: far ? 4 + R() * 4 : 9 + R() * 8, sc: far ? 2 : 3, a: far ? .65 : .95 }); }
  BG.stars = [];
  for (let i = 0; i < P.stars; i++) BG.stars.push({ x: R() * W, y: R() * G.H * 0.7, ph: R() * 6.28, big: R() < .18 });
  // cloud sea strip (2x scale)
  const sw = 200, sh = 40, sea = mk(sw, sh), sx = sea.getContext('2d');
  const bumps = []; for (let i = -1; i < 12; i++) bumps.push([i * 18 + 9, 12 + (i % 2) * 3, 10 + (i % 3)]);
  const ins = (i, j) => j >= 18 || bumps.some(([bx, by, br]) => { for (const o of [0, sw]) if ((i + .5 - bx - o) ** 2 + (j + .5 - by) ** 2 <= br * br) return true; return false; });
  for (let j = 0; j < sh; j++) for (let i = 0; i < sw; i++) if (ins(i, j)) { sx.fillStyle = !ins(i, j - 1) ? P.sea[2] : !ins(i, j - 2) ? P.sea[1] : P.sea[0]; sx.fillRect(i, j, 1, 1); }
  BG.sea = sea;
}
function drawBg(dt) {
  const P = BG.pal; if (!BG.c) return;
  ctx.drawImage(BG.c, 0, 0, BG.c.width * 4, BG.c.height * 4);
  const t = G.t;
  // stars
  for (const s of BG.stars) {
    const a = 0.45 + 0.55 * Math.sin(t * 2 + s.ph);
    if (a < 0.15) continue; ctx.globalAlpha = a; ctx.fillStyle = P.idx === 4 ? '#fff6c9' : '#ffffff';
    if (s.big) { ctx.fillRect(s.x - 1, s.y, 3, 1); ctx.fillRect(s.x, s.y - 1, 1, 3); if (P.idx === 4) { ctx.globalAlpha = a * .5; ctx.fillRect(s.x - 3, s.y, 7, 1); ctx.fillRect(s.x, s.y - 3, 1, 7); } }
    else ctx.fillRect(s.x, s.y, 1, 1);
  }
  ctx.globalAlpha = 1;
  if (P.deco === 'aurora') {
    for (let x = 0; x < W; x += 4) {
      const h1 = 34 + 18 * Math.sin(x * 0.021 + t * 0.6) + 10 * Math.sin(x * 0.05 - t);
      const y1 = G.H * 0.1 + 14 * Math.sin(x * 0.012 + t * 0.3);
      ctx.globalAlpha = .22; ctx.fillStyle = '#7dffc4'; ctx.fillRect(x, Math.round(y1 / 2) * 2, 4, Math.round(h1 / 2) * 2);
      ctx.globalAlpha = .18; ctx.fillStyle = '#c49bff'; ctx.fillRect(x, Math.round((y1 + h1 * .7) / 2) * 2, 4, Math.round(h1 * .6 / 2) * 2);
    }
    ctx.globalAlpha = 1;
  }
  if (P.deco === 'inv') {
    const isl = SPR.islandInv;
    [[40, G.laneTop - 10, 1], [200, G.laneTop + 40, 1.5], [310, G.laneTop - 30, 1]].forEach(([x, y, s], i) => { ctx.globalAlpha = .9; ctx.drawImage(isl, Math.round(x), Math.round(y + Math.sin(t * .8 + i) * 3), isl.width * s, isl.height * s); });
    ctx.globalAlpha = 1;
  }
  // clouds
  for (const c of BG.clouds) {
    c.x -= c.v * dt; c.y += G.cloudVY * dt * (c.sc / 3);
    const img = BG.cloudSpr[c.s];
    if (c.x < -img.width * c.sc) { c.x = W + 10; }
    if (c.y > G.H + 20) { c.y = -30; c.x = rand(0, W); }
    ctx.globalAlpha = c.a; ctx.drawImage(img, Math.round(c.x), Math.round(c.y), img.width * c.sc, img.height * c.sc);
  }
  ctx.globalAlpha = 1;
  // cloud sea
  const sy = G.islandTop + 26, off = Math.floor((t * 6) % 400 / 2) * 2;
  for (let x = -off; x < W; x += 400) ctx.drawImage(BG.sea, x, sy, 400, 80);
  ctx.fillStyle = P.sea[0]; ctx.fillRect(0, sy + 78, W, G.H - sy);
}
function dspr(img, x, y, s, alpha) {
  if (alpha != null) ctx.globalAlpha = alpha;
  ctx.drawImage(img, Math.round(x - img.width * s / 2), Math.round(y - img.height * s / 2), img.width * s, img.height * s);
  if (alpha != null) ctx.globalAlpha = 1;
}
function drawStar(x, y, r, col) {
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .48 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
function drawWorld() {
  const it = G.islandTop + G.lift, t = G.t;
  // lighthouse beam
  const lx = 22, ly = it - 46;
  const night = BG.pal && (BG.pal.idx === 1 || BG.pal.idx === 2 || BG.pal.idx === 4);
  ctx.save(); ctx.globalAlpha = night ? .22 : .13; ctx.fillStyle = '#fff6c9';
  const ang = Math.sin(t * .7) * .35;
  ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + Math.cos(ang - .09) * 420, ly + Math.sin(ang - .09) * 420); ctx.lineTo(lx + Math.cos(ang + .09) * 420, ly + Math.sin(ang + .09) * 420); ctx.closePath(); ctx.fill(); ctx.restore();
  // island
  dspr(SPR.island, 56, it + 30 + Math.sin(t * .9) * 1, 2);
  // lighthouse
  const lhImg = G.lhFlash > 0 && Math.floor(G.lhFlash * 30) % 2 ? SPR.lighthouseW : SPR.lighthouse;
  dspr(lhImg, 22, it - 27, 2);
  ctx.globalAlpha = .35 + .25 * Math.sin(t * 3); ctx.fillStyle = '#fff6c9'; ctx.fillRect(12, ly - 4, 20, 8); ctx.globalAlpha = 1;
  // lighthouse HP bar
  const hpw = 40, hpf = clamp(G.hp / D.maxHP, 0, 1);
  ctx.fillStyle = '#3b3363'; ctx.fillRect(2, it - 70, hpw + 2, 6);
  ctx.fillStyle = '#2a2142'; ctx.fillRect(3, it - 69, hpw, 4);
  ctx.fillStyle = hpf > .5 ? '#8ff0d0' : hpf > .25 ? '#ffe27a' : '#ff8fa8'; ctx.fillRect(3, it - 69, Math.round(hpw * hpf), 4);
  // archer + bow
  const bob = Math.round(Math.sin(t * 2.4)) * 1;
  dspr(SPR.archer, 64, it - 17 + bob, 2);
  const pull = G.bowT > 0 ? 2 : 0;
  dspr(SPR.bow, 84 - pull, it - 20 + bob, 2);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(79 - pull - (G.bowT > 0 ? 2 : 0), it - 34 + bob, 1, 28);
  // companions
  if (S.comp.whale) { const p = compPos('whale'); dspr(SPR.whale, p.x, p.y, 2); }
  if (S.comp.rabbit) { const p = compPos('rabbit'); dspr(SPR.moonSeat, p.x, p.y + 12, 2); dspr(SPR.rabbit, p.x, p.y, 2); }
  if (S.comp.plane) { const p = compPos('plane'); dspr(SPR.bird, p.x, p.y, 2); }
}
function drawEnemies() {
  const list = G.enemies.slice().sort((a, b) => a.y - b.y);
  for (const e of list) {
    if (e.dead) continue;
    const bob = Math.sin(e.ph * 3) * 2;
    if (e.boss) { drawBoss(e); continue; }
    const img = e.flash > 0 ? SPR[e.type + 'W'] : SPR[e.type];
    if (G.slowT > 0) { ctx.globalAlpha = .25; ctx.fillStyle = '#bfe6ff'; ctx.fillRect(Math.round(e.x - e.w / 2) - 2, Math.round(e.y + bob - e.h / 2) - 2, e.w + 4, e.h + 4); ctx.globalAlpha = 1; }
    dspr(img, e.x, e.y + bob, 2);
    if (e.hp < e.max) { const w = Math.max(16, e.w * .7), f = clamp(e.hp / e.max, 0, 1); ctx.fillStyle = '#2a2142'; ctx.fillRect(Math.round(e.x - w / 2), Math.round(e.y + e.h / 2 + 2), w, 3); ctx.fillStyle = '#ff8fc8'; ctx.fillRect(Math.round(e.x - w / 2), Math.round(e.y + e.h / 2 + 2), Math.round(w * f), 3); }
  }
}
function drawHole(x, y, s, flash) {
  const R = 34 * s;
  const rings = flash ? ['#ffffff', '#ffffff', '#ffffff', '#ffffff'] : ['#6b5aa0', '#4a3d78', '#2e2453', '#140f26'];
  rings.forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, Math.max(2, R - i * 8 * s), Math.max(2, (R - i * 8 * s) * .82), 0, 0, 6.29); ctx.fill(); });
  ctx.fillStyle = '#c9a7ff';
  for (let i = 0; i < 10; i++) { const a = G.t * 2 + i * .628, rr = R * (.35 + .55 * ((i * 37 % 10) / 10)); ctx.fillRect(Math.round(x + Math.cos(a) * rr), Math.round(y + Math.sin(a) * rr * .8), 3, 3); }
  ctx.fillStyle = '#ffe27a'; ctx.fillRect(Math.round(x - 10 * s), Math.round(y - 4), 5, 5); ctx.fillRect(Math.round(x + 5 * s), Math.round(y - 4), 5, 5);
  ctx.fillStyle = '#2a2440'; ctx.fillRect(Math.round(x - 9 * s), Math.round(y - 3), 2, 3); ctx.fillRect(Math.round(x + 6 * s), Math.round(y - 3), 2, 3);
}
function drawBoss(e) {
  const bob = Math.sin(e.ph * 2) * 3, f = e.flash > 0;
    if (e.cur === 'hole' && (e.kind === 'hole' || e.kind === 'king')) {
    if (e.kind === 'hole') { drawHole(e.x, e.y + bob, e.scale, f); }
    else { drawHole(e.x, e.y + bob + 10, e.scale * .7, f); dspr(f ? SPR.kingW : SPR.king, e.x, e.y + bob - 10, 3); }
    if (e.armor < 1) { ctx.globalAlpha = .6; ctx.strokeStyle = '#bfe6ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y + bob, 46, 0, 6.29); ctx.stroke(); ctx.globalAlpha = 1; }
  } else {
    const key = e.kind === 'clock' ? 'clockboss' : e.kind;
    dspr(f ? SPR[key + 'W'] : SPR[key], e.x, e.y + bob, 3 * e.scale);
  }
  if (e.kind === 'exam') { for (let i = 0; i < 3; i++) { const a = G.t * 1.5 + i * 2.1; dspr(SPR.paper, e.x + Math.cos(a) * 56, e.y + Math.sin(a) * 30 + bob, 1.5); } }
}
function drawProjectiles() {
  for (const a of G.arrows) {
    if (a.kind === 'auto' || a.kind === 'tap') {
      const ang = Math.atan2(a.vy, a.vx), len = a.kind === 'tap' ? 14 : 11;
      ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(ang);
      ctx.fillStyle = a.kind === 'tap' ? '#bfe6ff' : '#ffffff'; ctx.fillRect(-len, -1, len, 2);
      ctx.restore();
      drawStar(a.x, a.y, a.crit ? 5 : 4, a.crit ? '#ffe27a' : (a.kind === 'tap' ? '#bfe6ff' : '#fff6c9'));
    } else if (a.kind === 'bubble') {
      ctx.fillStyle = '#bfe6ff'; ctx.beginPath(); ctx.arc(a.x, a.y, 6, 0, 6.29); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(a.x - 3), Math.round(a.y - 3), 2, 2);
    } else if (a.kind === 'mochi') {
      dspr(SPR.mochi, a.x, a.y, 2);
    } else if (a.kind === 'plane') {
      ctx.save(); ctx.translate(Math.round(a.x), Math.round(a.y)); ctx.rotate(Math.atan2(a.vy, a.vx)); ctx.drawImage(SPR.bird, -7, -4, 14, 8); ctx.restore();
    } else if (a.kind === 'pierce') {
      ctx.globalAlpha = .55; ctx.fillStyle = '#bfe6ff'; ctx.fillRect(a.sx, a.y - 5, a.x - a.sx, 10); ctx.globalAlpha = .9; ctx.fillStyle = '#fff'; ctx.fillRect(a.sx, a.y - 2, a.x - a.sx, 4); ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff6c9'; ctx.beginPath(); ctx.arc(a.x, a.y, 10, -1.3, 1.3); ctx.arc(a.x - 5, a.y, 8, 1.2, -1.2, true); ctx.fill();
    } else if (a.kind === 'meteor') {
      drawStar(a.x, a.y, 7, '#ffe27a'); drawStar(a.x, a.y, 3.5, '#ffffff');
    }
  }
  for (const s of G.shots) {
    const r = 6 + Math.sin(s.ph * 12) * 1.5;
    ctx.fillStyle = '#4a3d78'; ctx.beginPath(); ctx.arc(s.x, s.y, r + 2, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#c9a7ff'; ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#ff9de0'; ctx.fillRect(Math.round(s.x - 2), Math.round(s.y - 2), 3, 3);
  }
}
function drawFx() {
  for (const f of G.fx) {
    const a = clamp(f.life / f.max, 0, 1);
    if (f.type === 'px' || f.type === 'puff') { ctx.globalAlpha = f.type === 'puff' ? a * .85 : a; ctx.fillStyle = f.col; const s = f.type === 'puff' ? f.size * (0.6 + a * .6) : f.size; ctx.fillRect(Math.round(f.x - s / 2), Math.round(f.y - s / 2), Math.ceil(s), Math.ceil(s)); }
    else if (f.type === 'star') { ctx.globalAlpha = a; ctx.fillStyle = f.col; const x = Math.round(f.x), y = Math.round(f.y); ctx.fillRect(x - 2, y, 5, 1); ctx.fillRect(x, y - 2, 1, 5); }
    else if (f.type === 'ring') { ctx.globalAlpha = a * .8; ctx.strokeStyle = f.col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.29); ctx.stroke(); }
    else if (f.type === 'note') { ctx.globalAlpha = a; ctx.fillStyle = f.col; const x = Math.round(f.x), y = Math.round(f.y); ctx.fillRect(x, y - 6, 1, 7); ctx.fillRect(x - 3, y, 4, 3); ctx.fillRect(x + 1, y - 6, 3, 1); ctx.fillRect(x + 3, y - 5, 1, 2); }
    else if (f.type === 'ghost') { ctx.globalAlpha = a * .35; const img = SPR[f.kind === 'king' ? 'king' : 'chase']; dspr(img, f.x, f.y, 3); }
  }
  ctx.globalAlpha = 1;
  for (const s of G.shards) dspr(SPR.shard, s.x, s.y, 2);
}
function drawNums() {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  for (const n of G.nums) {
    const age = n.max - n.life, a = clamp(n.life / 0.25, 0, 1), pop = age < .12 ? 1.6 - age / .12 * .6 : 1;
    const size = (n.crit ? 15 : 10) * pop;
    ctx.globalAlpha = a;
    if (n.crit) drawStar(n.x, n.y, 16 * pop, 'rgba(255,226,122,.85)');
    ctx.font = `700 ${size.toFixed(1)}px Silkscreen, monospace`;
    ctx.lineWidth = 3; ctx.strokeStyle = '#3b3363'; ctx.strokeText(fmt(n.v), n.x, n.y);
    ctx.fillStyle = n.crit ? '#fff2a8' : '#ffffff'; ctx.fillText(fmt(n.v), n.x, n.y);
  }
  ctx.globalAlpha = 1;
}
function drawOverlays() {
  const H = G.H;
  if (G.slowT > 0) { ctx.globalAlpha = .12; ctx.fillStyle = '#8fb6ff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (G.warnT > 0) {
    const t = G.warnT, a = Math.min(1, t / .4) * Math.min(1, (1.9 - t) / .3 + .2);
    ctx.globalAlpha = .5 * a; ctx.fillStyle = '#1b1432'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = (.35 + .25 * Math.sin(G.t * 14)) * a; ctx.fillStyle = '#ff6fa8'; ctx.fillRect(0, H * .4, W, 3); ctx.fillRect(0, H * .4 + 52, W, 3);
    ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '26px Jua, sans-serif'; ctx.lineWidth = 5; ctx.strokeStyle = '#3b3363'; ctx.strokeText('보스 악몽 등장!', W / 2, H * .4 + 18); ctx.fillStyle = '#ffd0e0'; ctx.fillText('보스 악몽 등장!', W / 2, H * .4 + 18);
    if (G.boss) { ctx.font = '15px Jua, sans-serif'; ctx.lineWidth = 4; ctx.strokeText(G.boss.name, W / 2, H * .4 + 40); ctx.fillStyle = '#fff'; ctx.fillText(G.boss.name, W / 2, H * .4 + 40); }
    ctx.globalAlpha = 1;
  }
  if (G.flashT > 0) { ctx.globalAlpha = clamp(G.flashT / .6, 0, 1) * .85; ctx.fillStyle = '#fffbe8'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (G.banner && G.mode !== 'title' && G.warnT <= 0) {
    const b = G.banner, a = Math.min(1, b.t / .2) * Math.min(1, (2.4 - b.t) / .4), y = H * .36 - (1 - Math.min(1, b.t / .25)) * 10;
    ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '24px Jua, sans-serif'; ctx.lineWidth = 5; ctx.strokeStyle = '#3b3363'; ctx.strokeText(b.title, W / 2, y); ctx.fillStyle = b.col; ctx.fillText(b.title, W / 2, y);
    if (b.sub) { ctx.font = '14px Jua, sans-serif'; ctx.lineWidth = 4; ctx.strokeText(b.sub, W / 2, y + 24); ctx.fillStyle = '#fff'; ctx.fillText(b.sub, W / 2, y + 24); }
    ctx.globalAlpha = 1;
  }
  if (G.hint > 0 && G.mode === 'play' && S.stats.taps < 5) {
    const a = Math.min(1, G.hint) * (.6 + .4 * Math.sin(G.t * 5));
    ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = '15px Jua, sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = '#3b3363';
    ctx.strokeText('화면을 탭해서 별빛 화살을 쏴요!', W * .62, G.laneBot - 6); ctx.fillStyle = '#fff'; ctx.fillText('화면을 탭해서 별빛 화살을 쏴요!', W * .62, G.laneBot - 6); ctx.globalAlpha = 1;
  }
  if (G.mode === 'dawn') {
    const t = G.dawnT, a = t < 2.6 ? Math.min(1, t / 2.4) : Math.max(0, 1 - (t - 2.6) / 2);
    const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, `rgba(255,214,170,${a * .9})`); gr.addColorStop(.6, `rgba(255,236,200,${a})`); gr.addColorStop(1, `rgba(255,255,255,${a})`);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    const sunY = H * .75 - Math.min(1, t / 3) * H * .35; ctx.globalAlpha = Math.min(1, a * 1.3); ctx.fillStyle = '#fff3b8'; ctx.beginPath(); ctx.arc(W / 2, sunY, 40, 0, 6.29); ctx.fill(); ctx.globalAlpha = 1;
    if (t > 1) {
      const ta = Math.min(1, (t - 1) / .5) * (t > 3.8 ? Math.max(0, 1 - (t - 3.8) / .8) : 1);
      ctx.globalAlpha = ta; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '30px Jua, sans-serif'; ctx.lineWidth = 6; ctx.strokeStyle = '#3b3363';
      ctx.strokeText('아침이 밝았다', W / 2, H * .3); ctx.fillStyle = '#fff'; ctx.fillText('아침이 밝았다', W / 2, H * .3);
      ctx.font = '16px Jua, sans-serif'; ctx.lineWidth = 4; ctx.strokeText(`별가루 +${G.dawnGain}`, W / 2, H * .3 + 32); ctx.fillStyle = '#ffe27a'; ctx.fillText(`별가루 +${G.dawnGain}`, W / 2, H * .3 + 32);
      ctx.globalAlpha = 1;
    }
  }
}
function render(dt) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const k = SC * DPR, sx = G.shake ? rand(-G.shake, G.shake) : 0, sy = G.shake ? rand(-G.shake, G.shake) : 0;
  ctx.setTransform(k, 0, 0, k, Math.round(sx * k), Math.round(sy * k));
  drawBg(dt);
  drawWorld();
  if (G.mode !== 'title') { drawEnemies(); drawProjectiles(); }
  drawFx();
  drawNums();
  ctx.setTransform(k, 0, 0, k, 0, 0);
  drawOverlays();
}
