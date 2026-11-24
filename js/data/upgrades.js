'use strict';
// 꿈 조각 강화 6종: base=첫 비용, g=비용 증가율, val=레벨별 수치
const UPG = {
  atk: { n: '공격력', icon: 'atk', d: '별빛 화살 한 발의 피해', base: 10, g: 1.11, max: 1e9, val: L => (6 + 4 * L) * Math.pow(2, Math.floor(L / 25)) },
  spd: { n: '공격속도', icon: 'spd', d: '1초에 쏘는 화살 수', base: 25, g: 1.17, max: 60, val: L => 1.5 + 0.05 * L },
  crit: { n: '치명타 확률', icon: 'crit', d: '별 모양 큰 피해가 나올 확률', base: 60, g: 1.2, max: 40, val: L => 0.05 + 0.01 * L },
  critd: { n: '치명타 피해', icon: 'critd', d: '치명타가 터질 때의 피해 배율', base: 50, g: 1.15, max: 1e9, val: L => 1.5 + 0.1 * L },
  tap: { n: '탭 공격력', icon: 'tap', d: '탭 화살 피해 (공격력 기준 배율)', base: 15, g: 1.13, max: 1e9, val: L => 1 + 0.5 * L },
  hp: { n: '등대 HP', icon: 'hp', d: '악몽을 버티는 등대의 체력', base: 20, g: 1.15, max: 1e9, val: L => 100 * Math.pow(1.1, L) },
};
