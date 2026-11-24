'use strict';
// 이펙트: 데미지 숫자, 파티클, 꿈 조각 흡수
// ---------- fx ----------
function addNum(x, y, v, crit) {
  if (G.nums.length > 46) G.nums.shift();
  G.nums.push({ x, y, v, crit, life: crit ? 1.0 : 0.75, max: crit ? 1.0 : 0.75, vy: crit ? -70 : -55 });
}
function puff(x, y, n, col) { for (let i = 0; i < n; i++) G.fx.push({ type: 'puff', x: x + rand(-8, 8), y: y + rand(-6, 6), vx: rand(-40, 40), vy: rand(-40, 20), life: rand(.35, .6), max: .6, col, size: rand(3, 6) }); }
function burst(x, y, n, cols) { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), s = rand(40, 160); G.fx.push({ type: 'px', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(.3, .7), max: .7, col: pick(cols), size: rand(2, 3.5), g: 120 }); } }
function sparkle(x, y, col, n) { for (let i = 0; i < n; i++) G.fx.push({ type: 'star', x: x + rand(-10, 10), y: y + rand(-10, 10), vx: rand(-30, 30), vy: rand(-50, -10), life: rand(.3, .6), max: .6, col }); }
function ring(x, y, col, r) { G.fx.push({ type: 'ring', x, y, r: 2, R: r, life: .4, max: .4, col }); }
function shard(x, y) {
  if (G.shards.length > 60) return;
  const a = rand(-2.8, -0.3), s = rand(60, 140);
  G.shards.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, home: rand(.3, .5) });
}
function updFx(dt) {
  for (const f of G.fx) {
    f.life -= dt; f.x += (f.vx || 0) * dt; f.y += (f.vy || 0) * dt; if (f.g) f.vy += f.g * dt;
    if (f.type === 'puff') { f.vx *= 0.92; f.vy *= 0.92; }
    if (f.type === 'ring') f.r = lerp(f.R, 2, f.life / f.max);
  }
  G.fx = G.fx.filter(f => f.life > 0);
  if (G.fx.length > 400) G.fx.splice(0, G.fx.length - 400);
  for (const n of G.nums) { n.life -= dt; n.y += n.vy * dt; n.vy += 90 * dt; }
  G.nums = G.nums.filter(n => n.life > 0);
  const gp = G.goldPos;
  for (const s of G.shards) {
    s.t += dt;
    if (s.t < s.home) { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 260 * dt; s.vx *= 0.97; }
    else {
      const dx = gp.x - s.x, dy = gp.y - s.y, d = Math.hypot(dx, dy), sp = 200 + (s.t - s.home) * 900;
      if (d < 12) { s.done = true; AU.play('coin'); popGold(); continue; }
      s.x += dx / d * sp * dt; s.y += dy / d * sp * dt;
    }
  }
  G.shards = G.shards.filter(s => !s.done);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 18);
  if (G.warnT > 0) G.warnT -= dt;
  if (G.flashT > 0) G.flashT -= dt;
  if (G.lhFlash > 0) G.lhFlash -= dt;
  if (G.banner) { G.banner.t += dt; if (G.banner.t > 2.4) G.banner = null; }
}
