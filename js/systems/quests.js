'use strict';
// 일일 퀘스트·업적 진행과 보상
// ---------- quests & achievements ----------
function today() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function ensureQuests() {
  const day = today(); if (S.quest && S.quest.day === day && Array.isArray(S.quest.list) && S.quest.list.length) return;
  let h = 0; for (const c of day) h = (h * 31 + c.charCodeAt(0)) | 0;
  const R = mulberry(h), ids = QPOOL.map(q => q.id);
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  S.quest = { day, list: ids.slice(0, 3).map(id => ({ id, p: 0, c: false })) };
}
function quest(id, n) { const L = S.quest && S.quest.list; if (!L) return; for (const q of L) if (q.id === id && !q.c) { const goal = QPOOL.find(x => x.id === id).goal; q.p = Math.min(goal, q.p + (n || 1)); } }
function questReward(i) {
  const g = BAL.gold(Math.max(1, S.maxStage)) * D.goldM;
  if (i === 0) return { gold: g * 120, txt: `꿈 조각 ${fmt(g * 120)}` };
  if (i === 1) return { item: 1, txt: '고급 장비 상자' };
  return S.prestiges > 0 ? { dust: 3, txt: '별가루 3' } : { gold: g * 250, txt: `꿈 조각 ${fmt(g * 250)}` };
}
function claimQuest(i) {
  const q = S.quest.list[i]; if (!q || q.c) return; const goal = QPOOL.find(x => x.id === q.id).goal; if (q.p < goal) return;
  const r = questReward(i); q.c = true;
  if (r.gold) addGold(r.gold); if (r.dust) { S.dust += r.dust; S.dustTotal += r.dust; } if (r.item) giveItem(pick(SLOTS), 1, true);
  toast('보상: ' + r.txt, 'gold'); AU.play('lvl');
}
function claimAch(id) {
  const a = ACH.find(x => x.id === id); if (!a || S.ach[id] || !a.c(S)) return;
  S.ach[id] = 1; const g = BAL.gold(Math.max(1, S.maxStage)) * D.goldM * 50; addGold(g); recalc();
  toast(`업적 달성! 피해 +5%, 꿈 조각 ${fmt(g)}`, 'gold'); AU.play('lvl');
}
function hasClaimable() {
  if (S.quest && S.quest.list) for (const q of S.quest.list) if (!q.c && q.p >= QPOOL.find(x => x.id === q.id).goal) return true;
  return ACH.some(a => !S.ach[a.id] && a.c(S));
}
// 받을 수 있는 퀘스트·업적 보상을 한 번에 받기. 받은 개수를 돌려줘요.
function claimAll() {
  let n = 0, gold = 0, dust = 0, items = 0;
  const g0 = S.gold, d0 = S.dust;
  (S.quest.list || []).forEach((q, i) => {
    if (q.c) return; const Q = QPOOL.find(x => x.id === q.id); if (q.p < Q.goal) return;
    const r = questReward(i); q.c = true; n++;
    if (r.gold) addGold(r.gold); if (r.dust) { S.dust += r.dust; S.dustTotal += r.dust; } if (r.item) { giveItem(pick(SLOTS), 1, false); items++; }
  });
  let achN = 0;
  for (const a of ACH) {
    if (S.ach[a.id] || !a.c(S)) continue;
    S.ach[a.id] = 1; achN++; n++; recalc();
    addGold(BAL.gold(Math.max(1, S.maxStage)) * D.goldM * 50);
  }
  if (!n) return 0;
  gold = S.gold - g0; dust = S.dust - d0;
  const parts = [];
  if (gold > 0) parts.push(`꿈 조각 ${fmt(gold)}`);
  if (dust > 0) parts.push(`별가루 ${dust}`);
  if (items) parts.push(`고급 장비 ${items}개`);
  if (achN) parts.push(`피해 +${achN * 5}%`);
  toast(`보상 ${n}개를 받았어요! ` + parts.join(' · '), 'gold');
  AU.play('lvl'); G.dirtyPanel = true;
  return n;
}
function claimableCount() {
  let n = 0;
  for (const q of (S.quest.list || [])) if (!q.c && q.p >= QPOOL.find(x => x.id === q.id).goal) n++;
  return n + ACH.filter(a => !S.ach[a.id] && a.c(S)).length;
}
