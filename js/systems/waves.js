'use strict';
// 웨이브·스테이지 진행, 클리어/실패, 보스 도전, 지역 변경
// ---------- waves ----------
function waveTypes(s, w) {
  const n = 3 + Math.floor((w - 1) / 3);
  const pool = [['gloom', 5]]; if (s >= 4) pool.push(['bolt', 3]); if (s >= 8) pool.push(['sheep', 2]); if (s >= 13) pool.push(['thorn', 2]);
  const tot = pool.reduce((a, p) => a + p[1], 0), out = [];
  for (let i = 0; i < n; i++) { let r = Math.random() * tot; for (const p of pool) { r -= p[1]; if (r <= 0) { out.push(p[0]); break; } } }
  return out;
}
function startWave() { G.spawnQ = waveTypes(S.stage, S.wave); G.spawnT = 0.25; G.waveGap = 0; }
function spawnEnemy(type, o) {
  o = o || {}; const T = ENEMY[type], s = S.stage, img = SPR[type];
  const hp = BAL.hp(s) * T.hp * (1 + 0.04 * (Math.min(S.wave, 10) - 1)) * (o.hpMul || 1);
  const e = {
    type, x: o.x != null ? o.x : W + 20, y: o.y != null ? o.y : rand(G.laneTop, G.laneBot), hp, max: hp,
    spd: 30 * T.spd * (o.spdMul || 1), dmg: BAL.dmg(s) * T.dmg, gold: BAL.gold(s) * T.gold,
    flash: 0, kb: 0, ph: Math.random() * 6, boss: false, minion: !!o.minion, pend: 0, w: img.width * 2, h: img.height * 2, dead: false
  };
  e.y = clamp(e.y, G.laneTop, G.laneBot);
  G.enemies.push(e); return e;
}
function nextWave() {
  S.wave++;
  if (S.wave > BAL.waves) {
    if (S.farming) { S.wave = 1; G.loop++; if (S.autoChallenge) { challenge(); return; } startWave(); }
    else startBoss();
  } else startWave();
}
function challenge() {
  if (!S.farming) return;
  S.farming = false; G.loop = 0;
  G.enemies.forEach(e => { if (!e.dead) puff(e.x, e.y, 6, '#6f6896'); e.dead = true; });
  G.enemies = []; G.arrows = []; G.shots = [];
  S.stage++; if (S.stage > S.maxStage) S.maxStage = S.stage; if (S.stage > S.best) S.best = S.stage;
  checkUnlocks(); startBoss();
}
function stageClear(e) {
  addGold(e.gold * D.goldM); S.stats.bosses++; quest('boss');
  burst(e.x, e.y, 40, ['#ffe27a', '#ffffff', '#c9a7ff', '#8ff0d0']); ring(e.x, e.y, '#fff6c9', 120);
  for (let i = 0; i < 12; i++) shard(e.x, e.y);
  G.enemies.forEach(m => { if (m.minion && !m.dead) { m.dead = true; puff(m.x, m.y, 6, '#fff'); } });
  G.shots = [];
  // drop
  const r = Math.random(), hi = S.stage >= 50;
  const tier = r < (hi ? .12 : .06) ? 2 : r < (hi ? .5 : .3) ? 1 : 0;
  giveItem(pick(SLOTS), tier, true);
  S.stage++; S.stats.stagesCleared++; quest('stage');
  if (S.stage > S.maxStage) S.maxStage = S.stage; if (S.stage > S.best) S.best = S.stage;
  S.wave = 1; G.boss = null; G.hp = D.maxHP;
  checkUnlocks(); regionCheck(true);
  banner('스테이지 클리어!', '스테이지 ' + S.stage + '로 이동', '#fff6c9');
  AU.play('clear'); startWave(); saveGame();
}
function fail(reason) {
  G.enemies.forEach(e => { if (!e.dead) puff(e.x, e.y, 8, '#4d4673'); });
  G.enemies = []; G.arrows = []; G.shots = []; G.metQ = []; G.boss = null; G.spawnQ = [];
  if (S.stage > 1) { S.stage--; S.farming = true; } else S.farming = false;
  S.wave = 1; G.loop = 0; G.hp = D.maxHP;
  banner(reason === 'time' ? '시간 초과…' : '등대가 흔들렸어요…', S.farming ? '이전 스테이지에서 힘을 모아요' : '다시 힘내 봐요', '#ffd0e0');
  AU.play('fail'); regionCheck(false); startWave();
}
function regionCheck(announce) {
  const r = regionOf(S.stage), key = r.idx + ':' + r.cycle;
  if (key !== G.regionKey) {
    const first = !G.regionKey; G.regionKey = key; buildBg();
    if (!first && announce) setTimeout(() => banner(r.name, '꿈이 더 깊어졌어요', '#d8ccff'), 1400);
  }
}
