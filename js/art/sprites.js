'use strict';
// 픽셀아트 캐릭터/적/보스/섬. 문자 한 칸 = 픽셀 한 칸, 색은 PAL 참고
const PAL = {
  k: '#3b3363', K: '#26203f', w: '#ffffff', W: '#eef3ff', s: '#ffe1cf', p: '#ffa8c2',
  y: '#ffe27a', Y: '#fff6c9', o: '#ffb86b', O: '#f08f4a', h: '#c7b3ff', H: '#a58bf0',
  m: '#8ff0d0', M: '#4fcfa8', b: '#8fd3ff', B: '#5aa9e6', l: '#d8ccff', L: '#b3a3f0',
  e: '#2a2440', r: '#ff7a8a', t: '#ffd0e0', g: '#9a93b8', d: '#6d5fa8', P: '#ff9de0', n: '#7a6fb0'
};
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function stamp(x, ox, oy, rows, pal) {
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch === '.' || ch === ' ' || !pal[ch]) continue; x.fillStyle = pal[ch]; x.fillRect(ox + i, oy + j, 1, 1); } });
}
function spr(rows, pal) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length)); const c = mk(w, h);
  stamp(c.getContext('2d'), 0, 0, rows, Object.assign({}, PAL, pal || {})); return c;
}
function blob(w, h, circles, col, stamps) {
  const ins = (x, y) => x >= 0 && y >= 0 && x < w && y < h && circles.some(([cx, cy, r]) => (x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= r * r);
  const c = mk(w, h), x = c.getContext('2d');
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (!ins(i, j)) continue; let f;
    if (!ins(i - 1, j) || !ins(i + 1, j) || !ins(i, j - 1) || !ins(i, j + 1)) f = col.k;
    else if (!ins(i - 1, j - 2) || !ins(i, j - 2)) f = col.l;
    else if (!ins(i + 1, j + 2) || !ins(i, j + 2)) f = col.d;
    else f = col.b;
    x.fillStyle = f; x.fillRect(i, j, 1, 1);
  }
  (stamps || []).forEach(s => stamp(x, s[0], s[1], s[2], Object.assign({}, PAL, col, s[3] || {})));
  return c;
}
function whiteOf(c) { const o = mk(c.width, c.height), x = o.getContext('2d'); x.drawImage(c, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, o.width, o.height); return o; }
function flipV(c) { const o = mk(c.width, c.height), x = o.getContext('2d'); x.translate(0, c.height); x.scale(1, -1); x.drawImage(c, 0, 0); return o; }

const SPR = {}, ICON = {};
function buildSprites() {
  SPR.archer = spr([
    '......y.........',
    '.....yYy........',
    '......y.........',
    '....kkkkk.......',
    '...khhhhhk......',
    '..khhhhhhhk.....',
    '..khHhhhHhhk....',
    '..khsssssshk....',
    '..ksseksseks....',
    '..kspssssspk....',
    '...kssssssk.....',
    '....kkkkkk......',
    '...kmmwwmmk.....',
    '..kmmmwmmmmk....',
    '..kmMmmmmmMk....',
    '..kmmmmmmmmk....',
    '...kksk.ksk.....',
    '...kkk..kkk.....',
  ]);
  SPR.bow = spr(['oo...', '.oo..', '..o..', '..oo.', '...o.', '...o.', '...o.', '...o.', '...o.', '...o.', '...o.', '..oo.', '..o..', '.oo..', 'oo...']);
  SPR.lighthouse = spr([
    '.....kkkk.....',
    '....kllllk....',
    '...kllLlllk...',
    '..kkkkkkkkkk..',
    '..kyYYYYYYyk..',
    '..kYwwwwwwYk..',
    '..kyYYYYYYyk..',
    '..kkkkkkkkkk..',
    '.kmmmmmmmmmmk.',
    '.kkkkkkkkkkkk.',
    '..kwwwwwwwwk..',
    '..kwwwwwwwwk..',
    '..kllllllllk..',
    '..kLLLLLLLLk..',
    '..kwwwwwwwwk..',
    '..kwwbbwwwwk..',
    '..kwwBBwwwwk..',
    '..kllllllllk..',
    '..kLLLLLLLLk..',
    '.kwwwwwwwwwwk.',
    '.kwwwwwwwwwwk.',
    '.kllllllllllk.',
    '.kLLLLLLLLLLk.',
    '.kwwwwkkwwwwk.',
    '.kwwwkddkwwwk.',
    '.kwwwkddkwwwk.',
    'kkkkkkkkkkkkkk',
  ]);
  // enemies (face on the left: they travel left)
  const ec = { k: '#2f2850', b: '#6f6896', l: '#8f88b8', d: '#554e7c' };
  SPR.gloom = blob(20, 14, [[6, 8, 5], [11, 6, 6], [15, 9, 4.5], [10, 10, 4.5]], ec,
    [[4, 7, ['wk..wk', 'kk..kk', 'p.kk.p']]]);
  const bc = { k: '#25204a', b: '#5b5aa0', l: '#7f7fc8', d: '#43427e' };
  SPR.bolt = blob(20, 18, [[6, 7, 5], [11, 5, 5.5], [15, 8, 4.5], [10, 9, 4.5]], bc,
    [[3, 5, ['k....k', '.wk.kw', '.kk.kk', '...kk.']], [9, 12, ['..yy', '.yy.', 'yyyy', '..y.', '.y..', 'y...']]]);
  const sc = { k: '#221c3c', b: '#5c547f', l: '#7a72a3', d: '#453e66' };
  SPR.sheep = blob(20, 16, [[7, 6, 4], [12, 5, 4], [16, 7, 3.5], [10, 9, 5], [15, 10, 4], [5, 10, 3.5]], sc,
    [[1, 5, ['.KKKK.', 'KKKKKK', 'KhKKhK', 'KKKKKK', '.KppK.', '..KK..']], [6, 13, ['K.K...K.K', 'K.K...K.K', '.........']]]);
  const tc = { k: '#3a2459', b: '#8a6fb0', l: '#ab93d3', d: '#6c5392' };
  SPR.thorn = blob(22, 18, [[8, 9, 5], [13, 8, 5.5], [16, 11, 4], [10, 12, 4]], tc,
    [[6, 7, ['wk.wk', 'kk.kk', '.kkk.']], [10, 0, ['..k..', '..k..', '.kLk.']], [2, 7, ['kk.', 'Lk.']], [19, 8, ['.k', 'kk', 'k.']], [6, 15, ['k...k...k', 'k...k...k', '.........']], [15, 1, ['k..', '.k.', '..k']], [2, 2, ['..k', '.k.', 'k..']]],);
  SPR.paper = spr(['kkkkkkkk.', 'kwwwwwwkk', 'kwkkkwwwk', 'kwwwwwwwk', 'kwekwekwk', 'kwwwwwwwk', 'kwkkkkwwk', 'kwwwwwwwk', 'kkkkkkkkk']);
  SPR.clock = spr(['y.......y.', 'yykkkkkyy.', '.kwwkwwk..', 'kwwwkwwwk.', 'kwwwkkwwk.', 'kwwwwwwwk.', 'kwewwwewk.', '.kwwwwwk..', '..kkkkk...']);
  // bosses
  const xb = { k: '#2f2850', b: '#8a84a8', l: '#aca6cc', d: '#6a6488' };
  SPR.exam = blob(32, 24, [[9, 14, 8], [16, 10, 9], [24, 13, 7.5], [16, 16, 7.5]], xb,
    [[5, 10, ['kkkkk.kkkkk', 'kwwek.kwwek', 'kwwwkkkwwwk', 'kkkkk.kkkkk']], [8, 16, ['.k.k.k.']], [24, 3, ['.b.', 'bbb', 'bwb', '.b.']], [22, 15, ['kkkkkkk', 'kwwwwwk', 'kwkkkwk', 'kwwwwwk', 'kwkkwwk', 'kkkkkkk']]]);
  const cb = { k: '#140f26', b: '#3d3560', l: '#574e80', d: '#2a2448' };
  SPR.chase = blob(32, 22, [[11, 12, 8], [18, 9, 7], [23, 12, 5.5], [15, 15, 6]], cb,
    [[5, 8, ['PP...PP', 'Pw...Pw', 'PP...PP']], [7, 14, ['.kkkkk.', 'k.k.k.k']], [26, 6, ['.LLLL', '.....', 'LLLLL', '.....', '..LLL']]]);
  const kb2 = { k: '#2f2850', b: '#9d97bd', l: '#c0bbe0', d: '#7a749c' };
  SPR.clockboss = blob(32, 26, [[9, 15, 8], [16, 12, 9], [24, 15, 7.5], [16, 18, 7]], kb2,
    [[13, 7, ['...kkkkk...', '..kwwwwwk..', '.kwwwkwwwk.', 'kwwwwkwwwwk', 'kwwwwkwwwwk', 'kwwwwkkkwwk', 'kwwwwwwwwwk', '.kwwwwwwwk.', '..kwwwwwk..', '...kkkkk...']], [12, 5, ['yy.......yy', 'yy.......yy']], [3, 13, ['wk.wk', 'kk.kk']], [4, 17, ['.kk.']]]);
  const kg = { k: '#1a1233', b: '#4a3d78', l: '#6b5aa0', d: '#33295a' };
  SPR.king = blob(34, 28, [[10, 18, 9], [17, 14, 10], [25, 17, 8.5], [17, 20, 8.5]], kg,
    [[11, 1, ['y...y...y..', 'yy.yyy.yy..', 'yyyyyyyyy..', 'yrryyyrryy.', 'yyyyyyyyy..']], [7, 14, ['yy...yy', 'yk...yk', 'yy...yy']], [8, 19, ['k.....k', '.kkkkk.', '.kwkwk.']]]);
  // companions
  const wc = { k: '#3b3363', b: '#9fd8ff', l: '#d6f0ff', d: '#6fb5e8' };
  SPR.whale = blob(26, 14, [[11, 8, 6], [16, 8, 5.5], [20, 8, 4.5], [4, 4, 2.6], [4, 11, 2.6], [7, 8, 2.5]], wc,
    [[10, 10, ['wwwwwwww', '.wwwwww.']], [19, 6, ['e.', 'p.']]]);
  SPR.rabbit = spr(['..k...k.....', '.kwk.kwk....', '.kpk.kpk....', '.kwk.kwk....', '.kwwwwwk....', 'kwwwwwwwk...', 'kwewwwewk...', 'kwpwkwpwk...', '.kwwwwwk....', '..kwwwwk.k..', '.kwwwwwwkwk.', '.kwwwwwwwk..', '..kkkkkkk...']);
  SPR.moonSeat = spr(['y..........y', 'yy........yy', '.yyy....yyy.', '..yyyyyyyy..', '....yyyy....']);
  SPR.bird = spr(['kk............', 'kwkk..........', 'kwwwkk........', '.kwwwwkek.....', '.kmwwwwwwkkk..', '..kmmwwwkkk...', '..kmmkkk......', '...kk.........']);
  SPR.shard = spr(['..w..', '.wmM.', 'wmmMM', '.mMM.', '..M..']);
  SPR.mochi = spr(['.kkk.', 'kwwwk', 'kwpwk', '.kkk.']);
  SPR.island = makeIsland();
  SPR.islandInv = flipV(makeIsland(7, 40, 22));
  for (const k of ['archer', 'gloom', 'bolt', 'sheep', 'thorn', 'paper', 'clock', 'exam', 'chase', 'clockboss', 'king', 'lighthouse']) SPR[k + 'W'] = whiteOf(SPR[k]);
  buildIcons();
}
function makeIsland(seed = 3, w = 64, h = 36) {
  const R = mulberry(seed), c = mk(w, h), x = c.getContext('2d'), cx = w / 2;
  const top = 5;
  for (let y = top; y < h; y++) {
    const t = (y - top - 6) / (h - top - 6);
    const hw = y < top + 6 ? cx - 1 : (cx - 1) * Math.pow(Math.max(0, 1 - t), 0.85);
    for (let i = Math.round(cx - hw); i <= Math.round(cx + hw); i++) {
      const edge = i <= Math.round(cx - hw) || i >= Math.round(cx + hw) || y === top;
      let f;
      if (edge) f = '#5b4f94';
      else if (y <= top + 1) f = '#c9ffe9';
      else if (y <= top + 3) f = '#8ff0d0';
      else if (y <= top + 4 + ((i * 7) % 3 === 0 ? 1 : 0)) f = '#4fcfa8';
      else f = ((i + y * 3) % 7 === 0 || R() < .06) ? '#a491dc' : (y % 5 === 0 ? '#bfaef0' : '#b5a3ea');
      x.fillStyle = f; x.fillRect(i, y, 1, 1);
    }
  }
  // tufts and flowers
  for (let i = 3; i < w - 3; i += 2 + Math.floor(R() * 3)) { x.fillStyle = '#8ff0d0'; x.fillRect(i, top - 1, 1, 1); if (R() < .3) { x.fillStyle = R() < .5 ? '#ffb3cf' : '#ffe27a'; x.fillRect(i, top - 2, 1, 1); } }
  // cloud fluff wrapping the sides
  const fluff = [[4, top + 9, 5], [11, top + 11, 4.5], [w - 5, top + 8, 5], [w - 12, top + 11, 4], [cx, top + 22, 3.5], [cx - 9, top + 15, 3], [cx + 9, top + 16, 3]];
  const ins = (i, j) => fluff.some(([fx, fy, r]) => (i + .5 - fx) ** 2 + (j + .5 - fy) ** 2 <= r * r);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (ins(i, j)) {
    const e = !ins(i - 1, j) || !ins(i + 1, j) || !ins(i, j - 1) || !ins(i, j + 1);
    x.fillStyle = e ? '#a9b7e8' : (!ins(i, j + 2) ? '#dfe7ff' : '#ffffff'); x.fillRect(i, j, 1, 1);
  }
  return c;
}
function cloudSprite(w, h, circles, col) { return blob(w, h, circles, { k: col[2], b: col[0], l: col[1], d: col[2] }); }
