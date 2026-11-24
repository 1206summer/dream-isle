'use strict';
// 업적 목록: c(S) 가 참이면 달성. 받을 때마다 모든 피해 +5%
const ACH = [
  { id: 's10', n: '스테이지 10 도달', c: S => S.best >= 10 },
  { id: 's25', n: '스테이지 25 도달', c: S => S.best >= 25 },
  { id: 's50', n: '스테이지 50 도달', c: S => S.best >= 50 },
  { id: 's75', n: '스테이지 75 도달', c: S => S.best >= 75 },
  { id: 's100', n: '스테이지 100 도달', c: S => S.best >= 100 },
  { id: 'k500', n: '악몽 구름 500마리', c: S => S.stats.kills >= 500 },
  { id: 'k5000', n: '악몽 구름 5,000마리', c: S => S.stats.kills >= 5000 },
  { id: 'k50000', n: '악몽 구름 50,000마리', c: S => S.stats.kills >= 50000 },
  { id: 't500', n: '탭 500번', c: S => S.stats.taps >= 500 },
  { id: 't5000', n: '탭 5,000번', c: S => S.stats.taps >= 5000 },
  { id: 'b10', n: '보스 10번 물리치기', c: S => S.stats.bosses >= 10 },
  { id: 'b50', n: '보스 50번 물리치기', c: S => S.stats.bosses >= 50 },
  { id: 'b200', n: '보스 200번 물리치기', c: S => S.stats.bosses >= 200 },
  { id: 'p1', n: '첫 아침 맞이하기', c: S => S.prestiges >= 1 },
  { id: 'p3', n: '아침 3번 맞이하기', c: S => S.prestiges >= 3 },
  { id: 'p10', n: '아침 10번 맞이하기', c: S => S.prestiges >= 10 },
  { id: 'e2', n: '희귀 장비 얻기', c: S => S.eqBest >= 2 },
  { id: 'e3', n: '전설 장비 얻기', c: S => S.eqBest >= 3 },
  { id: 'e4', n: '신화 장비 얻기', c: S => S.eqBest >= 4 },
  { id: 'c3', n: '꿈속 친구 모두 만나기', c: S => S.comp.whale > 0 && S.comp.rabbit > 0 && S.comp.plane > 0 },
];
