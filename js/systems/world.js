'use strict';
// 게임 진행 중 상태(G): 적, 화살, 이펙트, 타이머 등
const G = {
  mode: 'title', t: 0, H: 600, islandTop: 520, laneTop: 120, laneBot: 500, bowX: 84, bowY: 500,
  enemies: [], arrows: [], fx: [], nums: [], shards: [], shots: [], metQ: [], spawnQ: [], spawnT: 0, waveGap: 0,
  boss: null, bossT: 0, hp: 100, fireT: 0, bowT: 0, cd: Object.fromEntries(SKILL_KEYS.map(k => [k, 0])), slowT: 0, lullAmp: 0,
  shake: 0, warnT: 0, flashT: 0, lhFlash: 0, loop: 0, comp: { whale: { t: 1 }, rabbit: { t: .5 }, plane: { t: 1.2 } },
  incAcc: 0, incT: 0, banner: null, dawnT: 0, lastTap: 0, goldPos: { x: 30, y: 20 }, regionKey: '', dirtyEq: true, dirtyPanel: true,
  hint: 9, lift: 0, cloudVY: 0
};
const onScreen = e => !e.dead && e.x < W + 30;
function addGold(v) { S.gold += v; G.incAcc += v; }
function banner(title, sub, col) { G.banner = { t: 0, title, sub, col: col || '#fff' }; }
