'use strict';
// 밸런스 숫자: 적 체력/보상/피해 성장률, 보스 배율, 환생 조건과 별가루 공식
const BAL = {
  hp: s => 5 * Math.pow(1.30, s - 1),
  gold: s => 1.2 * Math.pow(1.15, s - 1),
  dmg: s => 7 * Math.pow(1.105, s - 1),
  bossHp: 20, bossGold: 15, bossTime: 30, waves: 10,
  prestigeStage: 30,
  dust: ms => ms < 30 ? 0 : Math.floor(Math.pow(ms / 10, 2.5)),
};
