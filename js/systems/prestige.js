'use strict';
// 환생 처리와 아침 연출 진행
// ---------- prestige ----------
function canPrestige() { return S.maxStage >= BAL.prestigeStage; }
function prestigeGain() { return BAL.dust(S.maxStage); }
function startPrestige() {
  if (!canPrestige() || G.mode !== 'play') return;
  G.mode = 'dawn'; G.dawnT = 0; G.dawnGain = prestigeGain(); G.dawnDone = false;
  G.enemies.forEach(e => puff(e.x, e.y, 6, '#fff6c9')); G.enemies = []; G.arrows = []; G.shots = []; G.metQ = []; G.boss = null;
  AU.play('dawn');
}
function updDawn(dt) {
  G.dawnT += dt;
  const t = G.dawnT;
  G.cloudVY = t < 3 ? Math.min(220, t * 160) : Math.max(0, 220 - (t - 3) * 200);
  G.lift = t < 2.6 ? -Math.sin(Math.min(1, t / 2.6) * Math.PI / 2) * 26 : -26 * Math.max(0, 1 - (t - 2.6) / 1.6);
  if (Math.random() < .5) G.fx.push({ type: 'star', x: rand(0, W), y: rand(0, G.H), vx: 0, vy: rand(-60, -20), life: rand(.5, 1), max: 1, col: pick(['#fff6c9', '#ffffff', '#ffd0e0']) });
  if (!G.dawnDone && t >= 2.6) { G.dawnDone = true; doPrestige(G.dawnGain); }
  if (t >= 4.6) { G.mode = 'play'; G.cloudVY = 0; G.lift = 0; banner('아침이 밝았다', `섬이 고도 ${(S.prestiges * 1000).toLocaleString()}m 하늘로 올라왔어요`, '#fff6c9'); }
}
function doPrestige(gain) {
  S.dust += gain; S.dustTotal += gain; S.prestiges++;
  S.gold = seedGold(S.perm.pseed); S.stage = 1; S.maxStage = 1; S.wave = 1; S.farming = false;
  for (const k in S.up) S.up[k] = 0; for (const k in S.sk) S.sk[k] = 0; for (const k in S.comp) S.comp[k] = 0;
  for (const k in G.cd) G.cd[k] = 0;
  recalc(); G.hp = D.maxHP; G.regionKey = ''; regionCheck(false); startWave(); G.dirtyPanel = true; G.dirtyEq = true; saveGame();
}
