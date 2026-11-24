'use strict';
// 일반 적 종류: hp/spd/dmg/gold 는 기본값 대비 배율
const ENEMY = {
  gloom: { n: '먹구름', hp: 1, spd: 1, dmg: 1, gold: 1 },
  bolt: { n: '번개구름', hp: 0.7, spd: 1.7, dmg: 1, gold: 1.1 },
  sheep: { n: '그림자 양', hp: 2.1, spd: 0.7, dmg: 1.3, gold: 1.7 },
  thorn: { n: '가시 안개', hp: 1.2, spd: 1, dmg: 2.2, gold: 1.3 },
  paper: { n: '시험지', hp: 0.5, spd: 1.5, dmg: 0.8, gold: 0.15 },
  clock: { n: '시계', hp: 0.35, spd: 2.1, dmg: 1.2, gold: 0.15 },
};
