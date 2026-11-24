'use strict';
// 한 프레임 게임 진행 (1/60초 단위)
function update(dt) {
  G.t += dt;
  updFx(dt);
  if (G.mode === 'dawn') { updDawn(dt); return; }
  if (G.mode !== 'play') return;
  S.stats.playTime += dt;
  if (G.hint > 0) G.hint -= dt;
  // income tracking (game-time, used for offline reward)
  G.incT += dt; if (G.incT >= 5) { const r = G.incAcc / G.incT; S.income = S.income ? S.income * 0.8 + r * 0.2 : r; G.incAcc = 0; G.incT = 0; }
  // waves
  if (S.wave <= BAL.waves) {
    if (G.spawnQ.length) { G.spawnT -= dt; if (G.spawnT <= 0) { spawnEnemy(G.spawnQ.shift()); G.spawnT = 0.62; } }
    else if (!G.enemies.length) { G.waveGap += dt; if (G.waveGap > 0.45) { G.waveGap = 0; nextWave(); } }
  } else if (G.boss) {
    if (G.boss.st !== 'enter') G.bossT -= dt;
    if (G.bossT <= 0) { fail('time'); return; }
  } else if (!G.enemies.length) { startBoss(); }
  // lighthouse regen
  G.hp = Math.min(D.maxHP, G.hp + D.maxHP * D.regen * dt);
  // timers
  for (const k in G.cd) G.cd[k] = Math.max(0, G.cd[k] - dt);
  if (G.slowT > 0) G.slowT -= dt;
  const slow = G.slowT > 0 ? 0.45 : 1;
  // archer
  G.fireT -= dt; if (G.bowT > 0) G.bowT -= dt;
  if (G.fireT <= 0) { const t = pickTarget(); if (t) { fireArrow(t, D.atk, 'auto'); G.fireT += 1 / D.aps; } else G.fireT = 0; }
  // companions
  for (const k in COMPS) {
    const L = S.comp[k]; if (!L) continue; const c = G.comp[k]; c.t -= dt;
    if (c.t <= 0) { const t = pickTarget(); if (t) { c.t += COMPS[k].cd; compFire(k, t, L); } else c.t = 0; }
  }
  if (S.autoSkill) autoSkills();
  // meteors queue
  for (const m of G.metQ) { m.d -= dt; if (m.d <= 0) { m.done = true; G.arrows.push({ kind: 'meteor', x: m.tx + 70, y: G.laneTop - 90, tx: m.tx, ty: m.ty, spd: 520, dmg: m.dmg, splash: 36, life: 2 }); } }
  G.metQ = G.metQ.filter(m => !m.done);
  // enemies
  for (const e of G.enemies) {
    if (e.dead) continue;
    if (e.flash > 0) e.flash -= dt;
    if (e.kb > 0) { e.x += e.kb * 60 * dt * (e.boss ? 0.3 : 1); e.kb = Math.max(0, e.kb - dt * 40); }
    if (e.boss) { updBoss(e, dt * (G.slowT > 0 ? 0.7 : 1)); continue; }
    e.ph += dt; e.x -= e.spd * slow * dt;
    if (e.x - e.w * 0.4 <= 74) { e.dead = true; puff(e.x, e.y, 8, '#4d4673'); hitLighthouse(e.dmg); if (G.mode !== 'play' || !G.enemies.length) break; }
  }
  // boss shots
  for (const s of G.shots) {
    s.ph += dt; const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy);
    if (d < 8) { s.done = true; hitLighthouse(s.dmg); if (!G.shots.length) break; continue; }
    s.x += dx / d * s.spd * slow * dt; s.y += dy / d * s.spd * slow * dt;
  }
  G.shots = G.shots.filter(s => !s.done);
  updArrows(dt);
  G.enemies = G.enemies.filter(e => !e.dead);
}
