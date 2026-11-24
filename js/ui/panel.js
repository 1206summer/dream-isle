'use strict';
// 하단 탭 메뉴: 강화 / 스킬 / 장비 / 동료 / 환생
// ---------- panel builders ----------
const stat = (id, label) => `<div>${label}<b class="num" id="${id}"></b></div>`;
const modeSeg = () => `<div class="seg">${[1, 10, 0].map(m => `<button data-act="mode" data-m="${m}" class="${S.buyMode === m ? 'on' : ''}">${m ? 'x' + m : 'MAX'}</button>`).join('')}</div>`;
const buyBtn = (act, k, id, extra) => `<button class="buy" data-act="${act}" data-k="${k}" id="${id}-b"><span id="${id}-l">강화</span><span class="c num">${extra || shardI()}<i id="${id}-c"></i></span></button>`;
function buildPanel() {
  G.dirtyPanel = false; G.dirtyEq = false;
  let h = '';
  if (TAB === 'up') {
    h += `<div class="stat">${stat('st-dps', '초당 피해')}${stat('st-tap', '탭 피해')}${stat('st-gold', '꿈 조각 배율')}</div>`;
    h += `<div class="ph"><b>꿈 조각 강화</b>${modeSeg()}</div>`;
    for (const k in UPG) { const U = UPG[k]; h += `<div class="row"><div class="ic">${img(U.icon)}</div><div class="tx"><b>${U.n}</b><em class="num" id="u-${k}-lv"></em><small>${U.d}</small><span class="ef num" id="u-${k}-ef"></span></div>${buyBtn('up', k, 'u-' + k)}</div>`; }
  } else if (TAB === 'sk') {
    h += `<div class="ph"><b>스킬</b><span>자동 스킬 <button class="mini" data-act="autosk">${S.autoSkill ? 'ON' : 'OFF'}</button></span>${modeSeg()}</div>`;
    for (const k in SK) { h += `<div class="row"><div class="ic">${img(S.sk[k] ? k : 'lock')}</div><div class="tx"><b>${SK[k].n}</b><em class="num" id="s-${k}-lv"></em><small id="s-${k}-d"></small><span class="ef" id="s-${k}-ef"></span></div>${buyBtn('sk', k, 's-' + k)}</div>`; }
    h += `<p class="note">스킬 버튼을 누르거나 키보드 1~4로 쓸 수 있어요</p>`;
  } else if (TAB === 'co') {
    h += `<div class="ph"><b>꿈속 친구들</b>${modeSeg()}</div>`;
    for (const k in COMPS) { const C = COMPS[k]; h += `<div class="row"><div class="ic">${img(k)}</div><div class="tx"><b>${C.n}</b><em class="num" id="c-${k}-lv"></em><small>${C.d}</small><span class="ef" id="c-${k}-ef"></span></div>${buyBtn('co', k, 'c-' + k)}</div>`; }
  } else if (TAB === 'eq') {
    h += `<div class="eqs">${SLOTS.map(s => { const t = S.eq[s]; return `<div>${img(s)}<b style="color:${t >= 0 ? TIERS[t].c : '#9c95bc'}">${t >= 0 ? TIERS[t].n : '없음'}</b>${EQ[s].stat}<br><span class="num">${t >= 0 ? EQ[s].f(EQ[s].v[t]) : '-'}</span></div>`; }).join('')}</div>`;
    h += `<div class="ph"><b>보관함</b><button class="mini" data-act="mergeall">모두 합성</button></div>`;
    for (const s of SLOTS) {
      const canM = S.inv[s].some((c, t) => t < 4 && c >= 3);
      h += `<div class="row"><div class="ic">${img(s)}</div><div class="tiers">${TIERS.map((T, t) => `<button class="tier ${S.inv[s][t] ? '' : 'zero'} ${S.eq[s] === t ? 'eqd' : ''}" data-act="equip" data-s="${s}" data-t="${t}"><i style="background:${T.c}"></i>${T.n}<b class="num">${S.inv[s][t]}</b></button>`).join('')}</div><button class="buy ${canM ? '' : 'off'}" data-act="merge" data-s="${s}" style="min-width:60px">합성<small>3→1</small></button></div>`;
    }
    h += `<p class="note">보스를 물리치면 장비를 얻어요. 같은 등급 3개를 합성하면 한 단계 위 등급이 돼요.<br>장비는 환생해도 사라지지 않아요.</p>`;
  } else if (TAB === 'pr') {
    const gain = prestigeGain(), ok = canPrestige();
    h += `<div class="prest"><h3>아침이 밝았다</h3><p>섬 고도 <b class="num">${(S.prestiges * 1000).toLocaleString()}m</b> · 이번 꿈 최고 스테이지 <b class="num">${S.maxStage}</b></p>
      <div class="big">${img('dust')}<span class="num" id="pr-gain">+${gain}</span></div>
      <p>${ok ? '지금 환생하면 별가루를 받고 처음부터 더 강하게 시작해요' : `스테이지 ${BAL.prestigeStage}에 도달하면 환생할 수 있어요`}</p>
      <p>초기화: 꿈 조각·강화·스킬·동료 / 유지: 장비·별가루·영구 강화·업적</p>
      <button class="pbtn ${ok ? '' : 'off'}" data-act="prestige">환생하기</button></div>`;
    h += `<div class="ph"><b>별가루 영구 강화</b><span>보유 ${img('dust')} <b class="num" id="pr-dust"></b></span></div>`;
    for (const k in PERM) { const P = PERM[k]; h += `<div class="row"><div class="ic">${img(P.icon)}</div><div class="tx"><b>${P.n}</b><em class="num" id="p-${k}-lv"></em><small id="p-${k}-d"></small></div>${buyBtn('perm', k, 'p-' + k, img('dust'))}</div>`; }
    h += `<button class="danger" data-act="wipe">저장 데이터 지우고 처음부터</button>`;
  }
  panel.innerHTML = h;
  refreshPanel();
}
function setBuy(id, cost, afford, label, maxed, cur) {
  const b = document.getElementById(id + '-b'); if (!b) return;
  b.classList.toggle('off', !maxed && !afford); b.classList.toggle('max', !!maxed);
  document.getElementById(id + '-l').textContent = maxed ? 'MAX' : label;
  document.getElementById(id + '-c').textContent = maxed ? '' : fmt(cost);
  b.querySelector('.c img').style.display = maxed ? 'none' : '';
}
const txt = (id, v) => { const e = document.getElementById(id); if (e && e.textContent !== v) e.textContent = v; };
function refreshPanel() {
  if (TAB === 'up') {
    txt('st-dps', fmt(D.dps)); txt('st-tap', fmt(D.tap)); txt('st-gold', '×' + (D.goldM < 100 ? D.goldM.toFixed(2) : fmt(D.goldM)));
    for (const k in UPG) {
      const U = UPG[k], L = S.up[k], b = bulk(l => upCost(k, l), L, U.max, S.buyMode), maxed = L >= U.max;
      const m = k === 'atk' ? D.atkMul : k === 'hp' ? D.hpMul : k === 'spd' ? D.capeM : 1;
      const show = v => k === 'crit' ? Math.round(Math.min(1, v + (D.crit - UPG.crit.val(L))) * 100) + '%' : k === 'critd' ? Math.round((v + D.starA) * 100) + '%' : k === 'tap' ? '×' + v.toFixed(1) : k === 'spd' ? (v * m).toFixed(2) + '/초' : fmt(v * m);
      txt(`u-${k}-lv`, 'Lv.' + L);
      txt(`u-${k}-ef`, maxed ? show(U.val(L)) : `${show(U.val(L))} → ${show(U.val(L + b.n))}`);
      setBuy('u-' + k, b.tot, S.gold >= b.tot, b.n > 1 ? '+' + b.n : '강화', maxed);
    }
  } else if (TAB === 'sk') {
    for (const k in SK) {
      const L = S.sk[k];
      if (!L) { txt(`s-${k}-lv`, ''); txt(`s-${k}-d`, `스테이지 ${SK[k].unlock}에 도달하면 열려요`); txt(`s-${k}-ef`, ''); const bt = document.getElementById(`s-${k}-b`); if (bt) { bt.classList.add('off'); txt(`s-${k}-l`, '잠김'); txt(`s-${k}-c`, '-'); } continue; }
      const b = bulk(l => skCost(k, l), L, 999, S.buyMode);
      txt(`s-${k}-lv`, 'Lv.' + L); txt(`s-${k}-d`, SK[k].d(L)); txt(`s-${k}-ef`, `쿨타임 ${(SK[k].cd * D.cdM).toFixed(1)}초`);
      setBuy('s-' + k, b.tot, S.gold >= b.tot, b.n > 1 ? '+' + b.n : '강화', false);
    }
  } else if (TAB === 'co') {
    for (const k in COMPS) {
      const L = S.comp[k], b = bulk(l => coCost(k, l), L, 999, S.buyMode);
      txt(`c-${k}-lv`, L ? 'Lv.' + L : '');
      txt(`c-${k}-ef`, L ? `피해 공격력 ×${compCoef(k, L).toFixed(1)} · ${COMPS[k].p(L)}` : '아직 꿈속에서 기다리고 있어요');
      setBuy('c-' + k, b.tot, S.gold >= b.tot, L ? (b.n > 1 ? '+' + b.n : '레벨업') : '만나기', false);
    }
  } else if (TAB === 'pr') {
    txt('pr-dust', fmt(S.dust)); txt('pr-gain', '+' + prestigeGain());
    for (const k in PERM) {
      const P = PERM[k], L = S.perm[k], maxed = L >= P.max, c = P.cost(L);
      txt(`p-${k}-lv`, 'Lv.' + L); txt(`p-${k}-d`, P.d(maxed ? L : L + 1) + (maxed ? '' : '  (다음)'));
      setBuy('p-' + k, c, S.dust >= c, '강화', maxed);
    }
  }
}
function doBuy(act, k) {
  if (act === 'up') {
    const U = UPG[k], L = S.up[k]; if (L >= U.max) return;
    const b = bulk(l => upCost(k, l), L, U.max, S.buyMode); if (!b.n || S.gold < b.tot) return;
    const oldMax = D.maxHP;
    S.gold -= b.tot; S.up[k] += b.n; S.stats.upgrades += b.n; quest('upgrade', b.n); recalc();
    if (k === 'hp') G.hp += D.maxHP - oldMax;
    if (Math.floor(S.up[k] / 10) > Math.floor(L / 10)) { AU.play('lvl'); sparkle(64, G.islandTop - 30, '#ffe27a', 8); } else AU.play('buy');
    if (k === 'atk' && Math.floor(S.up[k] / 25) > Math.floor(L / 25)) toast('공격력 각성! 피해 2배', 'gold');
  } else if (act === 'sk') {
    const L = S.sk[k]; if (!L) return; const b = bulk(l => skCost(k, l), L, 999, S.buyMode); if (!b.n || S.gold < b.tot) return;
    S.gold -= b.tot; S.sk[k] += b.n; S.stats.upgrades += b.n; quest('upgrade', b.n); AU.play('buy');
  } else if (act === 'co') {
    const L = S.comp[k], b = bulk(l => coCost(k, l), L, 999, S.buyMode); if (!b.n || S.gold < b.tot) return;
    S.gold -= b.tot; S.comp[k] += b.n; recalc();
    if (!L) { toast(`${COMPS[k].n}이(가) 함께해요!`, 'mint'); AU.play('lvl'); } else AU.play('buy');
  } else if (act === 'perm') {
    const P = PERM[k], L = S.perm[k]; if (L >= P.max) return; const c = P.cost(L); if (S.dust < c) return;
    S.dust -= c; S.perm[k]++; recalc(); AU.play('lvl');
  }
  refreshPanel();
}
panel.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return; AU.init();
  const a = b.dataset.act, k = b.dataset.k;
  if (a === 'mode') { S.buyMode = +b.dataset.m; buildPanel(); }
  else if (a === 'up' || a === 'sk' || a === 'co' || a === 'perm') doBuy(a, k);
  else if (a === 'autosk') { S.autoSkill = !S.autoSkill; buildPanel(); }
  else if (a === 'equip') { const s = b.dataset.s, t = +b.dataset.t; if (S.inv[s][t] > 0) { S.eq[s] = t; recalc(); AU.play('buy'); buildPanel(); } }
  else if (a === 'merge') { const s = b.dataset.s; for (let t = 0; t < 4; t++) if (S.inv[s][t] >= 3) { mergeItem(s, t); toast(`${TIERS[t + 1].n} ${EQ[s].n} 합성 성공!`, 'gold'); AU.play('drop'); break; } buildPanel(); }
  else if (a === 'mergeall') { const n = mergeAll(); toast(n ? `${n}번 합성했어요!` : '합성할 장비가 없어요', n ? 'gold' : 'lav'); if (n) AU.play('drop'); buildPanel(); }
  else if (a === 'prestige') { if (canPrestige()) confirmPrestige(); else toast(`스테이지 ${BAL.prestigeStage}에 도달하면 환생할 수 있어요`, 'lav'); }
  else if (a === 'wipe') confirmWipe();
});
document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => {
  AU.init(); TAB = b.dataset.tab; document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x === b)); panel.scrollTop = 0; buildPanel();
}));
document.querySelectorAll('.sk').forEach(b => b.addEventListener('click', () => { AU.init(); const k = b.dataset.sk; if (!S.sk[k]) { toast(`스테이지 ${SK[k].unlock}에 도달하면 열려요`, 'lav'); return; } if (G.cd[k] > 0) return; useSkill(k, false); }));
$('#bAuto').addEventListener('click', () => { S.autoSkill = !S.autoSkill; toast('자동 스킬 ' + (S.autoSkill ? 'ON' : 'OFF'), 'lav'); if (TAB === 'sk') buildPanel(); });
$('#bSpeed').addEventListener('click', () => { AU.init(); S.speed = S.speed === 1 ? 2 : 1; toast(S.speed === 2 ? '2배속!' : '보통 속도', 'lav'); });
$('#bMute').addEventListener('click', () => { AU.init(); S.muted = !S.muted; AU.setMute(S.muted); });
$('#bQuest').addEventListener('click', () => { AU.init(); openQuests(); });
$('#bChallenge').addEventListener('click', () => { AU.init(); challenge(); });
$('#bAutoCh').addEventListener('click', () => { S.autoChallenge = !S.autoChallenge; updHud(); });
