'use strict';
// 팝업: 퀘스트·업적, 환생 확인, 초기화, 오프라인 보상
// ---------- modals ----------
const modal = $('#modal'), mbox = $('#mbox');
function openModal(html, onClick, sticky) { mbox.innerHTML = html; modal.hidden = false; modal.onclick = e => { if (e.target === modal && !sticky) closeModal(); const b = e.target.closest('[data-m]'); if (b && onClick) onClick(b.dataset.m, b); }; }
function closeModal() { modal.hidden = true; mbox.innerHTML = ''; }
function questsHtml() {
  ensureQuests();
  const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), left = (mid - now) / 1000;
  const cn = claimableCount();
  let h = `<h2>퀘스트 · 업적</h2><button class="allbtn ${cn ? '' : 'off'}" data-m="all">${cn ? `모두 받기 (${cn})` : '받을 보상이 없어요'}</button><h4>오늘의 꿈 퀘스트 <small>(${fmtTime(left)} 후 새로 고침)</small></h4>`;
  S.quest.list.forEach((q, i) => {
    const Q = QPOOL.find(x => x.id === q.id), done = q.p >= Q.goal, r = questReward(i);
    h += `<div class="q"><div class="tx">${Q.n}<small>보상: ${r.txt}</small><div class="pb"><i style="width:${q.p / Q.goal * 100}%"></i></div></div><button data-m="q${i}" class="${q.c ? 'done' : done ? '' : 'off'}">${q.c ? '완료' : done ? '받기' : q.p + '/' + Q.goal}</button></div>`;
  });
  h += `<h4>업적 <small>(달성할 때마다 모든 피해 +5%)</small></h4>`;
  const list = ACH.slice().sort((a, b) => (!!S.ach[a.id] - !!S.ach[b.id]) || (b.c(S) - a.c(S)));
  for (const a of list) { const got = !!S.ach[a.id], ok = a.c(S); h += `<div class="q"><div class="tx">${a.n}</div><button data-m="a${a.id}" class="${got ? 'done' : ok ? '' : 'off'}">${got ? '완료' : ok ? '받기' : '진행 중'}</button></div>`; }
  h += `<div class="mrow"><button class="ghost" data-m="close">닫기</button></div>`;
  return h;
}
function openQuests() {
  openModal(questsHtml(), m => {
    if (m === 'close') return closeModal();
    if (m === 'all') claimAll(); else if (m[0] === 'q') claimQuest(+m.slice(1)); else if (m[0] === 'a') claimAch(m.slice(1));
    const st = mbox.scrollTop; mbox.innerHTML = questsHtml(); mbox.scrollTop = st; G.dirtyPanel = true;
  });
}
function confirmPrestige() {
  const g = prestigeGain();
  openModal(`<h2>아침을 맞이할까요?</h2><div class="bigr">${img('dust')}<span class="num">+${g}</span></div>
    <p class="center">꿈 조각, 강화, 스킬, 동료는 처음으로 돌아가요.<br>장비, 별가루, 영구 강화, 업적은 그대로예요.</p>
    <div class="mrow"><button class="ghost" data-m="no">조금 더 꿈꾸기</button><button data-m="yes">아침 맞이하기</button></div>`,
    m => { closeModal(); if (m === 'yes') startPrestige(); });
}
function confirmWipe() {
  openModal(`<h2>정말 처음부터 할까요?</h2><p class="center">모든 진행 상황과 별가루, 장비가 사라져요.<br>되돌릴 수 없어요.</p>
    <div class="mrow"><button class="ghost" data-m="no">취소</button><button data-m="yes" style="background:#ffc6d6">모두 지우기</button></div>`,
    m => { closeModal(); if (m === 'yes') { wipeGame(); S = newState(); location.reload(); } });
}
function showOffline(sec, gold) {
  openModal(`<h2>꿈꾸는 동안 모은 조각</h2><p class="center">${fmtTime(sec)} 동안 친구들이 등대를 지키며 꿈 조각을 모았어요</p>
    <div class="bigr">${img('shard')}<span class="num">+${fmt(gold)}</span></div><p class="center" style="font-size:12px;color:var(--ink2)">최대 8시간 · 효율 ${30 + 10 * S.perm.poff}%</p>
    <div class="mrow"><button data-m="ok">받기</button></div>`, m => { if (m === 'ok') { addGold(gold); G.incAcc -= gold; AU.play('lvl'); for (let i = 0; i < 16; i++) shard(rand(150, 300), rand(G.laneTop, G.laneBot)); closeModal(); } }, true);
}
function offlineCheck() {
  if (!S.started) return;
  const sec = Math.min(8 * 3600, (Date.now() - S.last) / 1000);
  S.last = Date.now();
  if (sec < 60) return;
  const est = BAL.gold(Math.max(1, S.stage)) * 0.9 * D.goldM;
  const rate = S.income > 0 ? S.income : est;
  const gold = rate * sec * (0.3 + 0.1 * S.perm.poff);
  if (gold >= 1) showOffline(sec, gold);
}
