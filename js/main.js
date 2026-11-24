'use strict';
// 시작, 게임 루프, 입력, 저장 타이밍
const STEP = 1 / 60;
let lastT = performance.now(), acc = 0, hudT = 0, saveT = 0, panelT = 0, questT = 0;
function startGame() {
  if (G.mode !== 'title') return;
  AU.init();
  $('#title').hidden = true;
  const fresh = !S.started;
  S.started = true; G.mode = 'play';
  recalc(); G.hp = D.maxHP; G.regionKey = ''; regionCheck(false);
  checkUnlocks();
  if (S.wave > BAL.waves && !S.farming) startBoss(); else { if (S.wave > BAL.waves) S.wave = 1; startWave(); }
  if (fresh) { G.hint = 10; banner('별빛 등대를 지켜 줘!', '악몽 구름이 몰려와요', '#fff6c9'); saveGame(); }
  else { G.hint = 0; banner(regionOf(S.stage).name, '스테이지 ' + S.stage + '에서 이어해요', '#fff6c9'); offlineCheck(); }
  G.dirtyPanel = true;
}
function frame(now) {
  let dt = (now - lastT) / 1000; lastT = now;
  if (!(dt >= 0)) dt = 0;
  dt = Math.min(dt, 0.1);
  const sp = G.mode === 'play' ? S.speed : 1;
  acc += dt * sp; let n = 0;
  while (acc >= STEP && n < 10) { update(STEP); acc -= STEP; n++; }
  if (n >= 10) acc = 0;
  try { render(dt * sp); } catch (e) { console.error(e); }
  hudT += dt; if (hudT > 0.08) { hudT = 0; updHud(); updSkillbar(); }
  panelT += dt; if (panelT > 0.2) { panelT = 0; if (G.dirtyPanel || (TAB === 'eq' && G.dirtyEq)) buildPanel(); else refreshPanel(); }
  saveT += dt; if (saveT > 5) { saveT = 0; if (G.mode === 'play') saveGame(); }
  questT += dt; if (questT > 10) { questT = 0; ensureQuests(); }
  requestAnimationFrame(frame);
}
function init() {
  buildSprites(); setIcons();
  const had = loadGame();
  recalc(); ensureQuests();
  if (had && S.started) { $('#bStart').textContent = '이어하기'; $('#startHint').textContent = `스테이지 ${S.stage} · 섬 고도 ${(S.prestiges * 1000).toLocaleString()}m`; }
  resize(); G.hp = D.maxHP; regionCheck(false);
  buildPanel(); updHud(); updSkillbar();
  new ResizeObserver(() => resize()).observe($('#view'));
  window.addEventListener('resize', resize);
  $('#bStart').addEventListener('click', e => { e.stopPropagation(); startGame(); });
  $('#title').addEventListener('click', startGame);
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); AU.init();
    const r = cv.getBoundingClientRect();
    tap((e.clientX - r.left) / SC, (e.clientY - r.top) / SC);
  });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('keydown', e => {
    if (G.mode !== 'play' || !modal.hidden) return;
    const k = SKILL_KEYS[+e.key - 1];
    if (k) useSkill(k, false);
    if (e.key === ' ') { e.preventDefault(); const t = pickTarget(); if (t) tap(t.x, t.y); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveGame();
    else if (G.mode === 'play' && modal.hidden) offlineCheck();
  });
  window.addEventListener('pagehide', saveGame);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { updateGoldPos(); });
  setTimeout(updateGoldPos, 600);
  requestAnimationFrame(t => { lastT = t; requestAnimationFrame(frame); });
  window.__G = { G, D, get S() { return S; }, set S(v) { S = v; }, update, recalc, useSkill, tap, startGame, doBuy, upCost, bulk, challenge, startPrestige, mergeAll, giveItem, fmt, BAL, saveGame, loadGame, newState, buildPanel, offlineCheck, stageClear, fail, regionCheck, startBoss, startWave, showOffline };
}
init();
