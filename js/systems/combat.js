'use strict';
// 전투: 조준, 화살, 피해, 처치 보상, 탭 공격, 동료 공격, 폭발
// ---------- combat ----------
function pickTarget(px, py) {
  let best = null, bd = 1e9, fallback = null, fd = 1e9;
  for (const e of G.enemies) {
    if (!onScreen(e)) continue;
    const d = px != null ? Math.hypot(e.x - px, e.y - py) : e.x;
    if (d < fd) { fd = d; fallback = e; }
    if (e.hp - e.pend > 0 && d < bd) { bd = d; best = e; }
  }
  return best || fallback;
}
function fireArrow(t, base, kind) {
  const crit = Math.random() < D.crit, dmg = base * (crit ? D.critd : 1);
  const a = { kind, x: G.bowX, y: G.bowY - 2, t, dmg, crit, spd: kind === 'tap' ? 640 : 560, vx: 1, vy: 0, life: 2 };
  t.pend += dmg; G.arrows.push(a); G.bowT = 0.14;
  AU.play(kind === 'tap' ? 'tap' : 'shoot');
}
function dealDmg(e, d, crit, src) {
  if (e.dead) return;
  if (G.slowT > 0) d *= 1 + G.lullAmp;
  if (e.boss && e.armor < 1) d *= e.armor;
  e.hp -= d; e.flash = 0.09; e.kb += e.boss ? 0.6 : (src === 'tap' ? 6 : 3.5);
  addNum(e.x + rand(-8, 8), e.y - e.h * 0.35, d, crit);
  AU.play(crit ? 'crit' : 'hit');
  if (crit) sparkle(e.x, e.y, '#ffe27a', 5);
  if (e.hp <= 0) kill(e);
}
function kill(e) {
  e.dead = true;
  if (e.boss) { stageClear(e); return; }
  addGold(e.gold * D.goldM * (S.farming ? 1 : 1));
  S.stats.kills++; quest('kill');
  puff(e.x, e.y, 10, e.type === 'paper' || e.type === 'clock' ? '#ffffff' : '#8f88b8');
  const n = e.minion ? 1 : 2 + (Math.random() < .5 ? 1 : 0);
  for (let i = 0; i < n; i++) shard(e.x, e.y);
  if (!e.minion && Math.random() < 0.002) giveItem(pick(SLOTS), 0, true);
}
function hitLighthouse(d) {
  G.hp -= d; G.lhFlash = 0.25; G.shake = Math.max(G.shake, 3); AU.play('hurt');
  sparkle(28, G.islandTop - 40, '#ff9de0', 6);
  if (G.hp <= 0) { G.hp = 0; fail('hp'); }
}
function tap(wx, wy) {
  if (G.mode !== 'play') return;
  const now = performance.now(); if (now - G.lastTap < 45) return; G.lastTap = now;
  S.stats.taps++; quest('tap'); G.hint = 0;
  sparkle(wx, wy, '#ffffff', 4); ring(wx, wy, '#ffffff', 14);
  const t = pickTarget(wx, wy);
  if (t) fireArrow(t, D.tap, 'tap');
}
function compFire(k, t, L) {
  const dmg = D.atk * compCoef(k, L);
  const c = compPos(k);
  if (k === 'whale') G.arrows.push({ kind: 'bubble', x: c.x + 14, y: c.y, t, dmg, splash: 46, spd: 300, life: 3 });
  else if (k === 'rabbit') G.arrows.push({ kind: 'mochi', x: c.x + 6, y: c.y, t, dmg, spd: 420, life: 3, rot: 0 });
  else { const dx = t.x - c.x, dy = t.y - c.y, d = Math.hypot(dx, dy) || 1; G.arrows.push({ kind: 'plane', x: c.x, y: c.y, vx: dx / d * 340, vy: dy / d * 340, dmg, hitR: 16, pierce: 3, hit: new Set(), life: 2.5 }); }
}
function compPos(k) {
  const t = G.t, it = G.islandTop + G.lift;
  if (k === 'whale') return { x: 46, y: it - 112 + Math.sin(t * 1.3) * 4 };
  if (k === 'rabbit') return { x: 104, y: it - 150 + Math.sin(t * 1.7 + 1) * 3 };
  return { x: 112 + Math.cos(t * 1.6) * 12, y: it - 86 + Math.sin(t * 3.2) * 6 };
}
function updArrows(dt) {
  for (const a of G.arrows) {
    a.life -= dt; if (a.life <= 0) { a.done = true; continue; }
    if (a.kind === 'pierce' || a.kind === 'plane') {
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.kind === 'pierce' && Math.random() < .8) G.fx.push({ type: 'px', x: a.x - rand(0, 20), y: a.y + rand(-6, 6), vx: -30, vy: rand(-10, 10), life: .4, max: .4, col: pick(['#bfe6ff', '#ffffff', '#fff6c9']), size: 2 });
      for (const e of G.enemies) {
        if (e.dead || a.hit.has(e)) continue;
        if (Math.abs(e.x - a.x) < (e.w * 0.4 + 6) && Math.abs(e.y - a.y) < a.hitR + e.h * 0.25) {
          a.hit.add(e); const c = Math.random() < D.crit; dealDmg(e, a.dmg * (c ? D.critd : 1), c, a.kind);
          if (--a.pierce <= 0) { a.done = true; break; }
        }
      }
      if (a.x > W + 40 || a.y < -20 || a.y > G.H + 20) a.done = true;
      continue;
    }
    if (a.kind === 'meteor') {
      const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy);
      if (Math.random() < .9) G.fx.push({ type: 'px', x: a.x, y: a.y, vx: rand(-8, 8), vy: rand(-8, 8), life: .35, max: .35, col: pick(['#fff6c9', '#ffe27a', '#ffffff']), size: 2 });
      if (d < 10) { a.done = true; explode(a.tx, a.ty, a.splash, a.dmg, true); continue; }
      a.x += dx / d * a.spd * dt; a.y += dy / d * a.spd * dt; continue;
    }
    // homing
    if (!a.t || a.t.dead) { a.t = pickTarget(); if (!a.t) { a.done = true; continue; } a.t.pend += a.dmg; }
    const tx = a.t.x, ty = a.t.y, dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy);
    if (d < 10 + (a.t.boss ? a.t.w * 0.25 : 0)) {
      a.done = true; a.t.pend = Math.max(0, a.t.pend - a.dmg);
      if (a.splash) { explode(a.t.x, a.t.y, a.splash, a.dmg, false, a.kind); }
      else { const c = a.kind === 'auto' || a.kind === 'tap' ? a.crit : false; dealDmg(a.t, a.dmg, c, a.kind); }
      continue;
    }
    a.vx = dx / d; a.vy = dy / d; a.x += a.vx * a.spd * dt; a.y += a.vy * a.spd * dt;
    if (a.kind === 'mochi') a.rot += dt * 12;
    if ((a.kind === 'auto' || a.kind === 'tap') && Math.random() < .5) G.fx.push({ type: 'px', x: a.x, y: a.y, vx: 0, vy: 0, life: .2, max: .2, col: a.crit ? '#ffe27a' : '#ffffff', size: 1.5 });
  }
  G.arrows = G.arrows.filter(a => !a.done);
}
function explode(x, y, r, dmg, crittable, kind) {
  ring(x, y, kind === 'bubble' ? '#bfe6ff' : '#fff6c9', r); burst(x, y, 10, kind === 'bubble' ? ['#bfe6ff', '#ffffff', '#8fd3ff'] : ['#ffe27a', '#fff6c9', '#ffffff']);
  for (const e of G.enemies) {
    if (e.dead) continue;
    if (Math.hypot(e.x - x, e.y - y) < r + e.w * 0.3) { const c = crittable && Math.random() < D.crit; dealDmg(e, dmg * (c ? D.critd : 1), c, kind); }
  }
}
