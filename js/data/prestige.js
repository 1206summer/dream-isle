'use strict';
// 환생 "아침이 밝았다" 별가루 영구 강화
const seedGold = L => L ? 300 * Math.pow(3.5, L - 1) : 0;
const PERM = {
  pdmg: { n: '별빛 축복', icon: 'atk', d: L => `모든 피해 ×${(1 + 0.5 * L).toFixed(1)}`, max: 999, cost: L => Math.ceil(2 * Math.pow(1.22, L)) },
  pgold: { n: '꿈의 풍요', icon: 'shard', d: L => `꿈 조각 ×${(1 + 0.4 * L).toFixed(1)}`, max: 999, cost: L => Math.ceil(2 * Math.pow(1.22, L)) },
  pseed: { n: '꿈의 씨앗', icon: 'seed', d: L => `환생 후 꿈 조각 ${fmt(seedGold(L))}개로 시작`, max: 15, cost: L => 2 + 2 * L },
  pcrit: { n: '별의 행운', icon: 'crit', d: L => `치명타 확률 +${2 * L}%`, max: 10, cost: L => 2 + L },
  pcd: { n: '아침 햇살', icon: 'sun', d: L => `스킬 쿨타임 -${6 * L}%`, max: 5, cost: L => 3 + 2 * L },
  pcost: { n: '성장 가속', icon: 'spd', d: L => `강화 비용 -${Math.round((1 - Math.pow(0.96, L)) * 100)}%`, max: 10, cost: L => 3 + 2 * L },
  poff: { n: '깊은 잠', icon: 'moon', d: L => `오프라인 보상 효율 ${30 + 10 * L}%`, max: 7, cost: L => 2 + 2 * L },
};
