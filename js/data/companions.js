'use strict';
// 동료 3명: base=영입 비용, cd=공격 간격(초), coef=공격력 대비 피해 배율
const COMPS = {
  whale: { n: '구름 고래', d: '물줄기로 주변 적까지 범위 피해', base: 300, g: 1.17, cd: 2.4, coef: 0.5, p: L => `등대 회복 +${(L * 0.05).toFixed(2)}%/초` },
  rabbit: { n: '달토끼', d: '달떡을 빠르게 던져요', base: 1500, g: 1.17, cd: 0.9, coef: 0.35, p: L => `치명타 확률 +${Math.min(20, Math.floor(L / 5))}%` },
  plane: { n: '종이비행기 새', d: '적 3마리를 꿰뚫는 종이비행기', base: 6000, g: 1.17, cd: 1.6, coef: 0.6, p: L => `꿈 조각 +${L * 2}%` },
};
const compCoef = (k, L) => COMPS[k].coef * L * Math.pow(2, Math.floor(L / 15));
