'use strict';
// 저장 데이터 구조, 저장/불러오기, 능력치 계산(recalc), 비용 계산
const SAVE_KEY = 'dream-isle-save-v1';
function newState() {
  return {
    v: 1, started: false, gold: 0, dust: 0, dustTotal: 0, stage: 1, maxStage: 1, best: 1, wave: 1, farming: false, autoChallenge: true,
    up: { atk: 0, spd: 0, crit: 0, critd: 0, tap: 0, hp: 0 },
    sk: Object.fromEntries(SKILL_KEYS.map(k => [k, 0])), autoSkill: true,
    inv: { bow: [0, 0, 0, 0, 0], star: [0, 0, 0, 0, 0], cape: [0, 0, 0, 0, 0], charm: [0, 0, 0, 0, 0] },
    eq: { bow: -1, star: -1, cape: -1, charm: -1 }, eqBest: -1,
    comp: { whale: 0, rabbit: 0, plane: 0 },
    perm: { pdmg: 0, pgold: 0, pseed: 0, pcrit: 0, pcd: 0, pcost: 0, poff: 0 },
    prestiges: 0, stats: { kills: 0, taps: 0, bosses: 0, skills: 0, upgrades: 0, stagesCleared: 0, playTime: 0 },
    quest: { day: '', list: [] }, ach: {}, income: 0, last: Date.now(), speed: 1, muted: false, buyMode: 1
  };
}
function merge(def, src) {
  if (!src || typeof src !== 'object') return def;
  for (const k in def) {
    if (!(k in src)) continue;
    const d = def[k], s = src[k];
    if (Array.isArray(d)) { if (Array.isArray(s)) def[k] = d.map((v, i) => typeof s[i] === 'number' && isFinite(s[i]) ? s[i] : v); }
    else if (d && typeof d === 'object') { if (k === 'ach') def[k] = Object.assign({}, s); else if (k === 'quest') def[k] = s; else merge(d, s); }
    else if (typeof d === typeof s && (typeof s !== 'number' || isFinite(s))) def[k] = s;
  }
  return def;
}
let S = newState();
function loadGame() {
  try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { S = merge(newState(), JSON.parse(raw)); return true; } } catch (e) { }
  return false;
}
function saveGame() {
  if (!S.started) return;
  S.last = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { }
}
function wipeGame() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }

// ================= derived stats =================
const D = {};
function recalc() {
  const e = k => S.eq[k] >= 0 ? EQ[k].v[S.eq[k]] : 0;
  const achN = Object.keys(S.ach).length;
  D.achM = 1 + 0.05 * achN;
  D.bowM = e('bow') || 1; D.capeM = e('cape') || 1; D.starA = e('star'); D.charmM = e('charm') || 1;
  D.dustM = 1 + 0.1 * S.dustTotal;
  D.atkMul = D.bowM * (1 + 0.5 * S.perm.pdmg) * D.achM * D.dustM;
  D.atk = UPG.atk.val(S.up.atk) * D.atkMul;
  D.aps = UPG.spd.val(S.up.spd) * D.capeM;
  D.crit = Math.min(1, UPG.crit.val(S.up.crit) + 0.02 * S.perm.pcrit + Math.min(20, Math.floor(S.comp.rabbit / 5)) * 0.01);
  D.critd = UPG.critd.val(S.up.critd) + D.starA;
  D.critAvg = 1 + D.crit * (D.critd - 1);
  D.tap = D.atk * UPG.tap.val(S.up.tap);
  D.hpMul = D.capeM;
  D.maxHP = UPG.hp.val(S.up.hp) * D.hpMul;
  D.goldM = D.charmM * (1 + 0.4 * S.perm.pgold) * (1 + 0.02 * S.comp.plane);
  D.costM = Math.pow(0.96, S.perm.pcost);
  D.cdM = 1 - 0.06 * S.perm.pcd;
  D.regen = 0.012 + 0.0005 * S.comp.whale;
  D.compDps = D.atk * (compCoef('whale', S.comp.whale) / COMPS.whale.cd * 1.4 + compCoef('rabbit', S.comp.rabbit) / COMPS.rabbit.cd + compCoef('plane', S.comp.plane) / COMPS.plane.cd * 1.3);
  D.dps = D.atk * D.aps * D.critAvg + D.compDps;
}
const upCost = (k, L) => UPG[k].base * Math.pow(UPG[k].g, L) * D.costM;
const skCost = (k, L) => SK[k].base * Math.pow(SK[k].g, L - 1) * D.costM;
const coCost = (k, L) => COMPS[k].base * Math.pow(COMPS[k].g, L) * D.costM;
// how many levels and total cost for a buy at mode (1, 10, 0 = max)
function bulk(costFn, L, max, mode) {
  let n = 0, tot = 0; const lim = mode === 0 ? 1000 : mode;
  while (n < lim && L + n < max) {
    const c = costFn(L + n);
    if (mode === 0 && tot + c > S.gold) break;
    tot += c; n++;
  }
  if (mode === 0 && n === 0 && L < max) { n = 1; tot = costFn(L); }
  return { n, tot };
}
