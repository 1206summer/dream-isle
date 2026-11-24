'use strict';
// 장비 획득/합성/장착
// ---------- items ----------
function giveItem(slot, tier, announce) {
  S.inv[slot][tier]++;
  if (tier > S.eqBest) S.eqBest = tier;
  if (tier > S.eq[slot]) { S.eq[slot] = tier; recalc(); }
  G.dirtyEq = true;
  if (announce) { toast(`${TIERS[tier].n} ${EQ[slot].n} 획득!`, tier >= 2 ? 'gold' : 'lav'); AU.play('drop'); }
}
function bestOwned(slot) { for (let t = 4; t >= 0; t--) if (S.inv[slot][t] > 0) return t; return -1; }
function mergeItem(slot, t) {
  if (t >= 4 || S.inv[slot][t] < 3) return false;
  S.inv[slot][t] -= 3; S.inv[slot][t + 1]++;
  if (t + 1 > S.eqBest) S.eqBest = t + 1;
  const b = bestOwned(slot); if (S.eq[slot] < 0 || S.inv[slot][S.eq[slot]] <= 0 || b > S.eq[slot]) S.eq[slot] = b;
  G.dirtyEq = true; recalc(); return true;
}
function mergeAll() { let n = 0; for (const s of SLOTS) for (let t = 0; t < 4; t++) while (S.inv[s][t] >= 3) { mergeItem(s, t); n++; } return n; }
