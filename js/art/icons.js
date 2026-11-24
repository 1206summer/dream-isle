'use strict';
// 메뉴·버튼 아이콘 (10x10 픽셀). 스킬 아이콘은 data/skills.js 에 있어요
function buildIcons() {
  const I = {
    shard: ['....w.....', '...wmm....', '..wmmmM...', '.wmmmmMM..', 'wmmmmmMMM.', '.mmmmMMM..', '..mmMMM...', '...MMM....', '....M.....'],
    dust: ['....y.....', '....y.....', '...yYy....', 'yyyYwYyyy.', '...yYy....', '....y.....', '....y..y..', '......yYy.', '.......y..'],
    atk: ['.......yyy', '........Yy', '.......y.y', '......k...', '.....k....', '....k.....', '...k......', 'm.k.......', '.m........', 'm.m.......'],
    spd: ['.......ll.', '.....lllL.', '...llllL..', '..lllLL...', '.llLL.....', '.lL.......', 'lL........', 'l.........'],
    crit: ['..rrrrrr..', '.rwwwwwwr.', 'rwrrrrrrwr', 'rwrwwwwrwr', 'rwrwrrwrwr', 'rwrwrrwrwr', 'rwrwwwwrwr', 'rwrrrrrrwr', '.rwwwwwwr.', '..rrrrrr..'],
    critd: ['....y.....', '.y..y..y..', '..y.Y.y...', '...YwY....', 'yyYwwwYyy.', '...YwY....', '..y.Y.y...', '.y..y..y..', '....y.....'],
    tap: ['...kk.....', '...kwk....', '...kwk....', '...kwkkk..', '.kkkwkwkk.', 'kwkkwwwwwk', 'kwwwwwwwwk', '.kwwwwwwk.', '..kwwwwk..', '...kkkk...'],
    hp: ['...kkkk...', '...kyyk...', '..kkkkkk..', '...kwwk...', '...kllk...', '...kwwk...', '..kllllk..', '..kwwwwk..', '.kkkkkkkk.'],
    sun: ['....o.....', '.o..o..o..', '..oyyyo...', '..yYYYy...', 'ooyYwYyoo.', '..yYYYy...', '..oyyyo...', '.o..o..o..', '....o.....'],
    bow: ['ko........', 'k.o.......', 'k..o......', 'k..o......', 'kwwowwy...', 'k..o......', 'k..o......', 'k.o.......', 'ko........'],
    star: ['....y.....', '...yyy....', 'yyyyYyyyy.', '.yyYwYyy..', '..yyYyy...', '..yy.yy...', '.yy...yy..'],
    cape: ['..kkkkk...', '.kmmmmmk..', '.kmMmmmk..', 'kmmMmmmmk.', 'kmmMmmmmk.', 'kmmmMmmmk.', 'kmmmMmmmmk', 'kkkkkkkkkk'],
    charm: ['...kk.....', '..k..k....', '...kk.....', '..kttk....', '.kttttk...', '.ktyytk...', '.ktyytk...', '.kttttk...', '..kkkk....'],
    seed: ['...m.m....', '..mmMmm...', '...mMm....', '....M.....', '...ooo....', '..oooo....', '...oo.....'],
    moon: ['...yyy....', '..yyYY....', '.yyY......', '.yyY......', '.yyY......', '..yyYY....', '...yyy....'],
    snd: ['...k......', '..kk..w...', 'kkwk...w..', 'kwwk.w.w..', 'kwwk.w.w..', 'kkwk...w..', '..kk..w...', '...k......'],
    mute: ['...k......', '..kk......', 'kkwk.r..r.', 'kwwk..rr..', 'kwwk..rr..', 'kkwk.r..r.', '..kk......', '...k......'],
    quest: ['.kkkkkkk..', 'kwwwwwwwk.', '.kwkkkwk..', '.kwwwwwk..', '.kwkkkwk..', '.kwwwwwk..', '.kwkkwwk..', 'kwwwwwwwk.', '.kkkkkkk..'],
    lock: ['..kkkk....', '.k....k...', '.k....k...', 'kkkkkkkk..', 'kyyyyyyk..', 'kyyKKyyk..', 'kyyKKyyk..', 'kyyyyyyk..', 'kkkkkkkk..'],
  };
  for (const k of SKILL_KEYS) I[k] = SK[k].icon;
  for (const k in I) ICON[k] = spr(I[k]);
  ICON.whale = SPR.whale; ICON.rabbit = SPR.rabbit; ICON.plane = SPR.bird;
  const url = {};
  for (const k in ICON) { try { url[k] = ICON[k].toDataURL(); } catch (e) { url[k] = ''; } }
  ICON.url = url;
}
