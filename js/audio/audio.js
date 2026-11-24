'use strict';
// 효과음과 배경음 (Web Audio 로 직접 합성)
const AU = { ctx: null, master: null, sfx: null, mus: null, last: {}, step: 0, next: 0, timer: null };
AU.init = function () {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume().catch(() => {}); return; }
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = AU.ctx = new C();
    AU.master = c.createGain(); AU.master.gain.value = S.muted ? 0 : 0.8; AU.master.connect(c.destination);
    AU.sfx = c.createGain(); AU.sfx.gain.value = 0.45; AU.sfx.connect(AU.master);
    AU.mus = c.createGain(); AU.mus.gain.value = 0.2;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    const dl = c.createDelay(1); dl.delayTime.value = 0.36; const fb = c.createGain(); fb.gain.value = 0.32;
    AU.mus.connect(lp); lp.connect(AU.master); lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(AU.master);
    AU.next = c.currentTime + 0.3;
    AU.timer = setInterval(AU.sched, 90);
  } catch (e) { AU.ctx = null; }
};
AU.setMute = m => { if (AU.master) AU.master.gain.setTargetAtTime(m ? 0 : 0.8, AU.ctx.currentTime, 0.05); };
AU.tone = function (f, dur, type, vol, f2, delay, dest) {
  const c = AU.ctx; if (!c) return; const t = c.currentTime + (delay || 0);
  const o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest || AU.sfx); o.start(t); o.stop(t + dur + 0.02);
};
AU.noise = function (dur, vol, freq) {
  const c = AU.ctx; if (!c) return; const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq || 800; g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(AU.sfx); s.start();
};
const SFX_GAP = { shoot: .07, hit: .05, crit: .07, coin: .06, hurt: .15, tap: .04 };
AU.play = function (n) {
  if (!AU.ctx || S.muted) return; const now = AU.ctx.currentTime;
  if (SFX_GAP[n] && AU.last[n] && now - AU.last[n] < SFX_GAP[n]) return; AU.last[n] = now;
  switch (n) {
    case 'shoot': AU.tone(1500, .09, 'sine', .12, 950); break;
    case 'tap': AU.tone(1800, .08, 'triangle', .14, 1200); break;
    case 'hit': AU.tone(520, .06, 'triangle', .12, 300); break;
    case 'crit': AU.tone(1320, .12, 'square', .07, 1760); AU.tone(1980, .16, 'sine', .1, 2640, .04); break;
    case 'coin': AU.tone(2200, .06, 'sine', .06, 2600); break;
    case 'hurt': AU.noise(.18, .25, 300); AU.tone(180, .2, 'sawtooth', .06, 90); break;
    case 'boss': [0, .35, .7].forEach((d, i) => AU.tone(220 - i * 30, .4, 'sawtooth', .08, 110, d)); AU.tone(55, 1.4, 'sine', .3, 40); break;
    case 'lvl': [523, 659, 784, 1047].forEach((f, i) => AU.tone(f, .14, 'triangle', .1, 0, i * .05)); break;
    case 'buy': AU.tone(880, .07, 'triangle', .1, 1320); break;
    case 'skill': AU.tone(400, .35, 'sine', .14, 1600); AU.noise(.25, .12, 2400); break;
    case 'boom': AU.noise(.5, .45, 500); AU.tone(90, .5, 'sine', .35, 40); break;
    case 'clear': [784, 988, 1175, 1568].forEach((f, i) => AU.tone(f, .22, 'triangle', .12, 0, i * .08)); break;
    case 'fail': [392, 330, 262].forEach((f, i) => AU.tone(f, .3, 'triangle', .12, 0, i * .16)); break;
    case 'dawn': [523, 659, 784, 988, 1175, 1319, 1568].forEach((f, i) => AU.tone(f, .9, 'sine', .08, 0, i * .18)); break;
    case 'drop': AU.tone(1047, .12, 'triangle', .12); AU.tone(1568, .2, 'triangle', .12, 0, .08); break;
    case 'lull': [659, 784, 659, 523].forEach((f, i) => AU.tone(f, .4, 'sine', .1, 0, i * .22)); break;
  }
};
// gentle music box over soft pads (Cmaj7 - Am7 - Fmaj7 - G6)
const CHORDS = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 64]];
const ARP = [0, 2, 1, 3, 2, 1, 3, 2];
const mf = m => 440 * Math.pow(2, (m - 69) / 12);
AU.sched = function () {
  const c = AU.ctx; if (!c) return; const e8 = 60 / 74 / 2;
  if (AU.next < c.currentTime - 1) AU.next = c.currentTime + 0.1;
  while (AU.next < c.currentTime + 0.3) {
    const bar = Math.floor(AU.step / 8) % 4, ch = CHORDS[bar], i = AU.step % 8, t = AU.next - c.currentTime;
    if (i === 0) ch.forEach(m => AU.pad(mf(m - 12), e8 * 8, t));
    if (!(i === 7 && bar === 3)) {
      let m = ch[ARP[i]] + 12; if (Math.random() < .12) m += 12;
      AU.tone(mf(m), 1.3, 'triangle', .07, 0, t, AU.mus); AU.tone(mf(m) * 2, .5, 'sine', .02, 0, t, AU.mus);
    }
    AU.step++; AU.next += e8;
  }
};
AU.pad = function (f, dur, delay) {
  const c = AU.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 1.2); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.6);
  o.connect(g); g.connect(AU.mus); o.start(t); o.stop(t + dur + 0.7);
};
