'use strict';
// 지역(배경)과 보스 이름·종류. 20스테이지마다 지역이 바뀌어요
const STAGES_PER_REGION = 20;
const REGIONS = [
  { n: '노을 하늘' }, { n: '별이 뜨는 밤' }, { n: '오로라 바다' }, { n: '거꾸로 된 하늘' }, { n: '깊은 악몽' }
];
const ROMAN = ['', ' Ⅱ', ' Ⅲ', ' Ⅳ', ' Ⅴ', ' Ⅵ', ' Ⅶ', ' Ⅷ', ' Ⅸ', ' Ⅹ'];
function regionOf(s) { const i = Math.floor((s - 1) / STAGES_PER_REGION); return { idx: i % 5, cycle: Math.floor(i / 5), num: i, name: REGIONS[i % 5].n + (ROMAN[Math.floor(i / 5)] !== undefined ? ROMAN[Math.floor(i / 5)] : ' ∞') }; }
const BOSSES = [
  { n: '시험 전날의 꿈', kind: 'exam' }, { n: '떨어지는 꿈', kind: 'hole' }, { n: '쫓기는 꿈', kind: 'chase' },
  { n: '지각하는 꿈', kind: 'clock' }, { n: '악몽의 왕', kind: 'king' }
];
// 지역별 배경 색 (하늘 3색, 구름 3색, 구름 바다 3색)
const RPAL = [
  { sky: ['#ffb4a8', '#ffcbd0', '#ffe6d2'], cl: ['#fff0f2', '#ffffff', '#ffc8d6'], sea: ['#ffeef3', '#ffffff', '#f5c3d3'], deco: 'sun', stars: 0 },
  { sky: ['#3d4194', '#6b70c9', '#aaabef'], cl: ['#cfcbf7', '#ecebff', '#9f9bdc'], sea: ['#d6d4fb', '#f2f1ff', '#a9a5e6'], deco: 'moon', stars: 70 },
  { sky: ['#1e3b69', '#2e6584', '#5ba6a4'], cl: ['#c4f0ea', '#ebfffc', '#8fcdc8'], sea: ['#c8f3ec', '#effffd', '#86c9c1'], deco: 'aurora', stars: 34 },
  { sky: ['#f4fbff', '#c3e7ff', '#86c6f2'], cl: ['#ffffff', '#ffffff', '#cfe6fb'], sea: ['#e8f5ff', '#ffffff', '#b5d8f5'], deco: 'inv', stars: 0 },
  { sky: ['#1b1432', '#2e2153', '#4b3679'], cl: ['#5d4d8a', '#7c6bb0', '#40336a'], sea: ['#4d4080', '#6e5ea6', '#352a5e'], deco: 'night', stars: 50 },
];
