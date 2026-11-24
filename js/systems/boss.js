'use strict';
// 보스 등장과 패턴
function startBoss() {
  S.wave = BAL.waves + 1; G.spawnQ = [];
  const s = S.stage, r = regionOf(s), B = BOSSES[r.idx];
  const hp = BAL.hp(s) * BAL.bossHp;
  const img = bossImg(B.kind);
  const e = {
    type: 'boss', kind: B.kind, name: B.n, x: W + 70, y: (G.laneTop + G.laneBot) / 2, hp, max: hp, spd: 0,
    dmg: BAL.dmg(s) * 2, gold: BAL.gold(s) * BAL.bossGold, flash: 0, kb: 0, ph: 0, boss: true, pend: 0,
    w: img.width * 3, h: img.height * 3, dead: false, bt: 2, at: 2.2, home: 262, st: 'enter', dash: 0, scale: 1, armor: 1, cur: B.kind
  };
  G.boss = e; G.enemies.push(e); G.bossT = BAL.bossTime; G.warnT = 1.9;
  AU.play('boss'); G.shake = Math.max(G.shake, 4);
}
function bossImg(kind) { return kind === 'hole' ? { width: 26, height: 22 } : SPR[kind === 'clock' ? 'clockboss' : kind]; }
function bossShot(e) {
  G.shots.push({ x: e.x - e.w * 0.3, y: e.y, tx: 30, ty: G.islandTop - 40, spd: 120, dmg: e.dmg, ph: 0 });
}
function updBoss(e, dt) {
  e.ph += dt;
  if (e.st === 'enter') { e.x -= 70 * dt; if (e.x <= e.home) { e.x = e.home; e.st = 'fight'; } return; }
  const k = e.kind === 'king' ? ['exam', 'clock', 'chase', 'hole'][Math.floor(e.ph / 6) % 4] : e.kind;
  e.cur = k;
  if (k === 'hole') { e.scale = 1 + 0.4 * Math.sin(e.ph * 1.7); e.armor = e.scale < 0.85 ? 0.5 : 1; }
  else { e.scale = lerp(e.scale, 1, Math.min(1, dt * 4)); e.armor = 1; }
  e.at -= dt; if (e.at <= 0) { e.at = 2.6; bossShot(e); }
  e.bt -= dt;
  if (e.bt <= 0) {
    if (k === 'exam') { e.bt = 4; for (let i = 0; i < 3; i++) spawnEnemy('paper', { x: e.x - 30, y: e.y + rand(-50, 50), minion: true }); sparkle(e.x - 30, e.y, '#ffffff', 8); }
    else if (k === 'clock') { e.bt = 2.6; spawnEnemy('clock', { x: e.x - 30, y: e.y + rand(-40, 40), minion: true }); }
    else if (k === 'chase') { e.bt = 3.6; e.dash = 0.45; e.hitDone = false; }
    else e.bt = 3;
  }
  if (e.dash > 0) {
    e.dash -= dt; e.x -= 300 * dt;
    if (Math.random() < .6) G.fx.push({ type: 'ghost', x: e.x, y: e.y, life: .3, max: .3, img: bossImg(e.kind === 'king' ? 'king' : 'chase'), kind: e.kind });
    if (e.x < 150) { e.x = 150; if (!e.hitDone) { e.hitDone = true; hitLighthouse(e.dmg * 1.2); } e.dash = 0; }
  } else if (e.x < e.home) e.x = Math.min(e.home, e.x + 45 * dt);
}
