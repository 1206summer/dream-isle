'use strict';
// 스킬 사용 공통 처리. 스킬별 효과는 data/skills.js 의 cast/auto 에 있어요.
function useSkill(k, auto) {
  const L = S.sk[k]; if (!L || G.cd[k] > 0 || G.mode !== 'play') return false;
  const targets = G.enemies.filter(onScreen); if (!targets.length) { if (!auto) toast('공격할 악몽이 없어요', 'lav'); return false; }
  G.cd[k] = SK[k].cd * D.cdM; S.stats.skills++; quest('skill'); AU.play('skill');
  SK[k].cast(L, targets);
  return true;
}
function autoSkills() {
  const n = G.enemies.filter(onScreen).length, boss = !!(G.boss && onScreen(G.boss) && G.boss.st !== 'enter');
  if (!n) return;
  for (const k of SKILL_KEYS) if (SK[k].auto(n, boss)) useSkill(k, true);
}
function checkUnlocks() {
  for (const k of SKILL_KEYS) if (!S.sk[k] && S.maxStage >= SK[k].unlock) { S.sk[k] = 1; toast(`새 스킬: ${SK[k].n}!`, 'gold'); G.dirtyPanel = true; }
}
