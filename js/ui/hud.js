'use strict';
// 화면 위 정보(재화, 스테이지, 웨이브, 보스 바)와 스킬 버튼 줄
// 스킬 버튼 줄은 data/skills.js 목록으로 만들어요
$('#skillbar').insertAdjacentHTML('afterbegin', SKILL_KEYS.map(k => `<button class="sk" data-sk="${k}" aria-label="${SK[k].n}"><img data-icon="${k}" alt=""><span class="cdv"></span><span class="cdt num"></span><span class="lv num"></span></button>`).join(''));
// ---------- HUD ----------
let lastWaveKey = '';
function updHud() {
  $('#gold').textContent = fmt(S.gold);
  $('#dust').textContent = fmt(S.dust);
  $('#curDust').style.display = S.dustTotal > 0 || S.prestiges > 0 ? '' : 'none';
  const r = regionOf(S.stage);
  $('#regionName').textContent = r.name; $('#stageNum').textContent = 'STAGE ' + S.stage;
  const wk = S.wave + ':' + S.farming + ':' + G.loop;
  if (wk !== lastWaveKey) {
    lastWaveKey = wk; let h = '';
    for (let i = 1; i <= BAL.waves; i++) h += `<i class="${i < S.wave ? 'done' : i === S.wave ? 'cur' : ''}"></i>`;
    if (!S.farming) h += `<i class="boss ${S.wave > BAL.waves ? 'cur' : ''}"></i>`;
    h += S.wave > BAL.waves ? '<span>보스!</span>' : `<span class="num">${S.wave}/${BAL.waves}</span>`;
    $('#waveInfo').innerHTML = h;
  }
  const bb = $('#bossBar');
  if (G.boss && G.mode === 'play') {
    if (bb.hidden) { bb.hidden = false; }
    $('#bossName').textContent = G.boss.name + (G.boss.armor < 1 ? ' (단단해짐!)' : '');
    $('#bossHp').style.width = clamp(G.boss.hp / G.boss.max * 100, 0, 100) + '%';
    const bt = $('#bossTime'); bt.textContent = Math.ceil(G.bossT) + '초'; bt.classList.toggle('low', G.bossT < 8);
  } else if (!bb.hidden) bb.hidden = true;
  $('#bChallenge').hidden = !(S.farming && G.mode === 'play');
  $('#farmTag').hidden = !(S.farming && G.mode === 'play');
  $('#chSub').textContent = '스테이지 ' + (S.stage + 1);
  $('#bAutoCh').textContent = '자동 도전 ' + (S.autoChallenge ? 'ON' : 'OFF');
  $('#bSpeed').textContent = S.speed + 'x'; $('#bSpeed').classList.toggle('on', S.speed > 1);
  { const mi = $('#muteIc'), mu = ICON.url[S.muted ? 'mute' : 'snd']; if (mi.getAttribute('src') !== mu) mi.src = mu; }
  $('#qdot').classList.toggle('show', hasClaimable());
  $('#eqdot').classList.toggle('show', SLOTS.some(s => S.inv[s].some((c, t) => t < 4 && c >= 3)));
  $('#prdot').classList.toggle('show', canPrestige());
  $('#bAuto').classList.toggle('on', S.autoSkill);
}
function updSkillbar() {
  document.querySelectorAll('.sk').forEach(b => {
    const k = b.dataset.sk, L = S.sk[k], cd = G.cd[k], max = SK[k].cd * D.cdM;
    b.classList.toggle('locked', !L);
    b.classList.toggle('ready', !!L && cd <= 0 && !S.autoSkill);
    b.querySelector('.cdv').style.setProperty('--p', (L ? clamp(cd / max * 100, 0, 100) : 0) + '%');
    b.querySelector('.cdt').textContent = !L ? '' : cd > 0 ? Math.ceil(cd) : '';
    b.querySelector('.lv').textContent = L ? 'Lv' + L : 'ST' + SK[k].unlock;
    const im = b.querySelector('img'); const want = ICON.url[L ? k : 'lock']; if (im.getAttribute('src') !== want) im.src = want;
  });
}
