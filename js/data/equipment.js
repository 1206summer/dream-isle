'use strict';
// 장비 등급과 부위별 효과 (v = 일반~신화 수치)
const TIERS = [{ n: '일반', c: '#b4bccc' }, { n: '고급', c: '#6fd69a' }, { n: '희귀', c: '#6fb8ff' }, { n: '전설', c: '#ffaa4d' }, { n: '신화', c: '#ff7ccf' }];
const EQ = {
  bow: { n: '별빛 활', stat: '공격력', v: [1.3, 1.8, 3, 6, 15], f: v => '×' + v },
  star: { n: '반짝 별핀', stat: '치명타 피해', v: [0.3, 0.8, 2, 5, 12], f: v => '+' + Math.round(v * 100) + '%' },
  cape: { n: '구름 망토', stat: '공속·등대 HP', v: [1.1, 1.2, 1.35, 1.6, 2], f: v => '×' + v },
  charm: { n: '꿈 부적', stat: '꿈 조각', v: [1.25, 1.6, 2.5, 5, 12], f: v => '×' + v },
};
const SLOTS = ['bow', 'star', 'cape', 'charm'];
