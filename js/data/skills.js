'use strict';
// 스킬 4종. 스킬 하나에 필요한 것은 모두 여기 한 곳에 있어요.
//   n       이름                 unlock  열리는 스테이지
//   cd      쿨타임(초)            base/g  첫 강화 비용 / 레벨당 비용 증가율
//   d(L)    설명 문구 (L = 스킬 레벨)
//   icon    10x10 픽셀 아이콘 (색 글자는 art/sprites.js 의 PAL)
//   auto(n, boss)  자동 스킬일 때 쓸 조건 (n = 화면 속 적 수, boss = 보스전 여부)
//   cast(L, targets)  실제 효과. targets = 화면 속 적 목록
// 새 스킬을 추가하면 스킬 버튼·탭·저장 데이터·키보드 단축키(순서대로 1,2,3,4,5…)가 자동으로 따라와요.
const SK = {
  meteor: {
    n: '유성우', unlock: 3, cd: 14, base: 150, g: 1.32,
    m: L => 3 + 0.6 * (L - 1),
    d: L => `별 10개가 쏟아져 각각 공격력 ×${SK.meteor.m(L).toFixed(1)} 범위 피해`,
    icon: ['l.........', '.l..l.....', '..l..l....', 'l..l..yy..', '.l..lyYYy.', '..l.yYwYy.', '....yYYy..', '.....yy...'],
    auto: (n, boss) => boss || n >= 2,
    cast(L, targets) {
      const dmg = D.atk * SK.meteor.m(L);
      for (let i = 0; i < 10; i++) {
        const t = pick(targets);
        G.metQ.push({ d: i * 0.11, dmg, tx: clamp(t.x + rand(-26, 26), 110, W - 10), ty: clamp(t.y + rand(-20, 20), G.laneTop, G.laneBot) });
      }
      G.shake = Math.max(G.shake, 3);
    },
  },
  pierce: {
    n: '달빛 관통', unlock: 6, cd: 9, base: 400, g: 1.32,
    m: L => 10 + 2 * (L - 1),
    d: L => `한 줄의 적을 모두 꿰뚫는 화살, 공격력 ×${SK.pierce.m(L)}`,
    icon: ['...BBB....', '..BB......', '.BB.......', '.Bwwwwwwwy', '.BB.......', '..BB......', '...BBB....'],
    auto: () => true,
    cast(L) {
      const t = pickTarget();
      G.arrows.push({ kind: 'pierce', x: G.bowX, y: t.y, vx: 760, vy: 0, dmg: D.atk * SK.pierce.m(L), hitR: 26, pierce: 999, hit: new Set(), life: 1.2, sx: G.bowX });
      G.shake = Math.max(G.shake, 4);
    },
  },
  lullaby: {
    n: '자장가', unlock: 12, cd: 24, base: 1500, g: 1.32,
    dur: L => 5 + 0.25 * (L - 1),
    amp: L => 0.2 + 0.02 * (L - 1),
    d: L => `${SK.lullaby.dur(L).toFixed(1)}초 동안 모든 적 느려짐, 받는 피해 +${Math.round(SK.lullaby.amp(L) * 100)}%`,
    icon: ['......nn..', '....nnnn..', '....n..n..', '....n..n..', '....n..n..', '..nnn.nn..', '.nnnn.nnn.', '.nnn......'],
    auto: (n, boss) => boss || n >= 4,
    cast(L) {
      G.slowT = SK.lullaby.dur(L); G.lullAmp = SK.lullaby.amp(L); AU.play('lull');
      for (let i = 0; i < 14; i++) G.fx.push({ type: 'note', x: rand(100, W), y: rand(G.laneTop, G.laneBot + 20), vx: rand(-10, 10), vy: rand(-25, -10), life: rand(1.5, 2.5), max: 2.5, col: pick(['#c9a7ff', '#8fd3ff', '#ffffff']) });
    },
  },
  dawn: {
    n: '새벽빛', unlock: 20, cd: 40, base: 8000, g: 1.32,
    m: L => 30 + 6 * (L - 1),
    d: L => `화면 전체 폭발, 공격력 ×${SK.dawn.m(L)}`,
    icon: ['....o.....', '.o..o..o..', '..oyyyo...', '..yYYYy...', 'ooyYwYyoo.', '..yYYYy...', '..oyyyo...', '.o..o..o..', '....o.....'],
    auto: (n, boss) => boss || n >= 4,
    cast(L, targets) {
      G.flashT = 0.6; G.shake = Math.max(G.shake, 9); AU.play('boom');
      ring(W / 2, (G.laneTop + G.laneBot) / 2, '#fff6c9', 260);
      const m = SK.dawn.m(L);
      targets.forEach(e => { const c = Math.random() < D.crit; dealDmg(e, D.atk * m * (c ? D.critd : 1), c, 'skill'); });
    },
  },
};
const SKILL_KEYS = Object.keys(SK);
