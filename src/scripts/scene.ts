// The hero scene: grass, road and Kinabalu (the Hilux itself is an <img> over the canvas, see Hero.astro), day or night. 180×106 canvas (8 rows of extra grass under the road lift the ground off the screen edge), 140ms stepped frames.
import { Grid } from '../lib/pixel';
import { cup, pine } from '../lib/sprites';
import { isNight } from './theme';
import { reduceMotion } from '../lib/motion';

// Kinabalu's ridge as drawn at full height; MT_SCALE shrinks it toward its base (y 92) so there's open sky above the peak
// for the wordmark (Niekki, 2026-11-10: a smaller mountain is fine). The tail past x 240 lets it slope down to the base
// on wide screens, where the canvas extends beyond the original 180px of art.
const MT_SCALE = 0.62;
const lift = (y: number) => 92 - (92 - y) * MT_SCALE;
const ridge = [[52, 92], [70, 72], [84, 58], [94, 60], [102, 44], [110, 48], [116, 34], [122, 40], [128, 28], [134, 36], [140, 26], [146, 33], [152, 30], [160, 42], [170, 38], [180, 52], [196, 58], [214, 70], [240, 76], [262, 86], [284, 92]]
  .map(([x, y]) => [x, lift(y)]);
const heightAt = (x: number) => {
  for (let i = 0; i < ridge.length - 1; i++) {
    const [x1, y1] = ridge[i], [x2, y2] = ridge[i + 1];
    if (x >= x1 && x <= x2) return Math.round(y1 + ((y2 - y1) * (x - x1)) / (x2 - x1) + ((x * 7) % 3) - 1);
  }
  return 200;
};
const snow = [[100, 52, 10], [126, 38, 8], [148, 40, 10], [172, 50, 9]].map(([x, y, l]) => [x, Math.round(lift(y)), Math.max(3, Math.round(l * MT_SCALE))]);
const clouds = [[20, 40, 1], [150, 24, 0.6], [200, 46, 0.8], [90, 30, 0.7]];

export function initScene(canvas: HTMLCanvasElement | null) {
  const sx = canvas?.getContext('2d');
  if (!canvas || !sx) return { setNight(_n: boolean) {} };
  const reduce = reduceMotion();
  const p1 = pine(12, '#2b5615', '#244a12'), p2 = pine(9, '#4f7a2c', '#2b5615');
  p1.outline('#12120d'); p2.outline('#12120d');
  const sign = Grid(10, 14); sign.rect(1, 0, 8, 9, '#2a2620'); sign.rect(2, 2, 6, 1, '#e66f46'); sign.rect(2, 4, 5, 1, '#f4ebcd'); sign.rect(2, 6, 4, 1, '#f4ebcd'); sign.rect(1, 9, 1, 4, '#715542'); sign.rect(8, 9, 1, 4, '#715542'); sign.outline('#12120d');
  const stool = Grid(8, 9); stool.rect(0, 0, 8, 2, '#e66f46'); stool.rect(1, 2, 1, 6, '#715542'); stool.rect(6, 2, 1, 6, '#715542'); stool.outline('#12120d');
  const icedCup = cup('iced', '#a8742a');
  let frame = 0;

  function cloud(x: number, y: number, col: string) {
    const g = Grid(30, 12); g.disc(8, 7, 4, col); g.disc(15, 5, 5, col); g.disc(22, 7, 4, col); g.rect(4, 8, 22, 3, col);
    g.draw(sx!, Math.round(x), Math.round(y));
  }

  // Day ↔ night blend: 0 = day, 1 = night. Switching theme animates it: the sun sinks behind the
  // mountain, then the moon rises, while the sky and ground colours fade across.
  let t = isNight() ? 1 : 0;
  const frameEl = canvas.closest<HTMLElement>('.scene-frame');
  let anim = 0;
  const mix = (a: string, b: string) => {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (sh: number) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
  };
  const ease = (v: number) => v * v * (3 - 2 * v);
  let lastSky = '', lastGround = '';
  // How much of the stage is cropped off the left/top on narrow screens, in canvas px. Re-measured on resize only.
  // On wide screens the art (stage) is narrower than the frame: the canvas then spans the whole frame width and the
  // 180px of art is drawn `ox` canvas px in from its left edge, with sky, ground and road carrying on to both edges.
  let cut = 0, cutTop = 0, ox = 0;
  const measure = () => {
    const stageEl = canvas.parentElement; if (!stageEl) return;
    const px = stageEl.clientWidth / 180 || 1;
    const left = stageEl.offsetLeft;
    cut = left < 0 ? -left / px : 0;
    cutTop = stageEl.offsetTop < 0 ? -stageEl.offsetTop / px : 0;
    const fw = frameEl?.clientWidth ?? 0;
    if (left > 0.5 && fw) {
      const cw = Math.round(fw / px);
      if (canvas.width !== cw) canvas.width = cw;
      canvas.style.left = `${-left}px`; canvas.style.width = `${fw}px`;
      ox = left / px;
    } else {
      if (canvas.width !== 180) canvas.width = 180;
      canvas.style.left = ''; canvas.style.width = '';
      ox = 0;
    }
  };
  measure();
  addEventListener('resize', () => { measure(); draw(); });

  function draw() {
    const ctx = sx!;
    const H = 130;
    // World x 40 is the art's left edge; L..R is the world span the canvas shows (wider than the art on wide screens).
    const L = Math.floor(40 - ox), R = Math.ceil(40 - ox + canvas.width), W = R - L;
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(1, 0, 0, 1, Math.round(ox) - 40, -18);
    const sky = mix('#8ad8d8', '#1f2b45');
    ctx.fillStyle = sky; ctx.fillRect(L, 0, W, H);
    // the plain sky above the art (tall screens) must match the canvas sky exactly, frame by frame
    if (frameEl && sky !== lastSky) { frameEl.style.backgroundColor = sky; lastSky = sky; } // only when it changes (theme switch)
    // stars fade in late
    // On narrow screens the stage is wider than the screen and its left edge is cropped: keep the sun/moon in view.
    // (measured in measure(), not every frame, so drawing never forces a layout)
    const skyX = Math.round(Math.max(0, cut + 4 - 2)); // extra world shift for the sun/moon
    // ...and when the scene is lifted (phones, Hero.astro) the top rows can be cut off too: drop them into view
    const skyY = Math.round(Math.max(0, cutTop + 3));
    if (t > 0.6) { ctx.fillStyle = `rgba(244,235,205,${((t - 0.6) / 0.4).toFixed(2)})`; const n = Math.round(40 * W / 240); for (let i = 0; i < n; i++) if ((i + (frame >> 3)) % 7) ctx.fillRect(L + ((i * 53) % W), 18 + ((i * 29) % 50), 1, 1); }
    // sun sets during the first half, moon rises in the second (both slip behind the hills)
    if (t < 0.5) {
      const dy = Math.round(ease(t / 0.5) * 80);
      const s2 = Grid(22, 22); s2.disc(11, 11, 5, '#f2c94c');
      [[11, 1], [11, 2], [11, 20], [11, 19], [1, 11], [2, 11], [20, 11], [19, 11], [4, 4], [18, 4], [4, 18], [18, 18]].forEach(([x, y]) => s2.set(x, y, '#f2c94c'));
      s2.draw(ctx, 42 + skyX, 18 + skyY + dy);
    } else {
      const dy = Math.round((1 - ease((t - 0.5) / 0.5)) * 80);
      const m = Grid(14, 14); m.disc(7, 7, 6, '#f4ebcd'); m.disc(10, 5, 5, null); m.draw(ctx, 48 + skyX, 22 + skyY + dy);
    }
    const reps = Math.max(1, Math.round(W / 240)); // more clouds across a wide sky
    for (let r = 0; r < reps; r++) clouds.forEach(([x, y, sp]) => cloud(L + ((x + r * 240 * 0.37 + frame * sp * 0.25) % (W + 40)) - 30, y + (r % 2) * 6, mix('#f0f8f0', '#3a4a66')));
    // mountain
    const mt = mix('#455976', '#3c4c68');
    for (let x = 52; x < 284; x++) { const h = heightAt(x); if (h >= 92) continue; ctx.fillStyle = mt; ctx.fillRect(x, h, 1, 96 - h); ctx.fillStyle = '#12120d'; ctx.fillRect(x, h, 1, 1); }
    ctx.fillStyle = mix('#5d7194', '#2d3a52');
    snow.forEach(([x, y, l]) => { for (let i = 0; i < l; i++) ctx.fillRect(x + (i >> 1), y + i, 1, 1); });
    // cloud band at the mountain base
    ctx.fillStyle = mix('#f0f8f0', '#3a4a66');
    for (let x = L; x < R; x++) { const y = 82 + Math.round(Math.sin(x / 7) * 2); ctx.fillRect(x, y, 1, 8); }
    // tree line (plus a loose row of pines out to the edges on wide screens)
    [[36, 76], [46, 80], [184, 79], [196, 74], [208, 80]].forEach(([x, y], i) => (i % 2 ? p2 : p1).draw(ctx, x, y));
    for (let x = 14, i = 0; x > L - 12; x -= 19 + (i % 3) * 4, i++) (i % 2 ? p2 : p1).draw(ctx, x, 77 + (i % 3) * 2);
    for (let x = 226, i = 0; x < R; x += 19 + (i % 3) * 4, i++) (i % 2 ? p1 : p2).draw(ctx, x, 77 + ((i + 1) % 3) * 2);
    // ground, road
    const ground = mix('#7fae45', '#4c5f2c');
    if (frameEl && ground !== lastGround) { frameEl.style.setProperty('--ground', ground); lastGround = ground; } // phones extend the grass below the art (Hero.astro)
    ctx.fillStyle = ground; ctx.fillRect(L, 92, W, H - 92);
    ctx.fillStyle = mix('#66882d', '#3a4a22');
    for (let x0 = Math.floor(L / 240) * 240; x0 < R; x0 += 240) for (let i = 0; i < 90; i++) { const x = x0 + ((i * 37) % 240), y = 95 + ((i * 11) % 32); ctx.fillRect(x, y, 1, 2); ctx.fillRect(x + 1, y + 1, 1, 1); }
    ctx.fillStyle = mix('#c9a27a', '#5a4632'); ctx.fillRect(L, 108, W, 6);
    ctx.fillStyle = mix('#b08560', '#4a3a2a'); for (let x = Math.floor(L / 9) * 9; x < R; x += 9) ctx.fillRect(x, 110, 4, 1);
    ctx.fillStyle = '#12120d'; ctx.fillRect(L, 92, W, 1);
    sign.draw(ctx, 70, 96);
    stool.draw(ctx, 172, 99); stool.draw(ctx, 186, 101);
    icedCup.draw(ctx, 198, 94);
  }

  draw();
  // The idle animation (drifting clouds, twinkling stars) only runs while the hero is on screen and the tab is open.
  if (!reduce) {
    let timer = 0, onScreen = true;
    const sync = () => {
      const run = onScreen && !document.hidden;
      if (run && !timer) timer = window.setInterval(() => { frame++; draw(); }, 140);
      if (!run && timer) { clearInterval(timer); timer = 0; }
    };
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }).observe(canvas);
    document.addEventListener('visibilitychange', sync);
    sync();
  }
  /** Animate to day or night (instant under reduced motion). */
  function setNight(night: boolean) {
    const target = night ? 1 : 0;
    cancelAnimationFrame(anim);
    if (reduce) { t = target; draw(); return; }
    const from = t, start = performance.now(), dur = 1400 * Math.abs(target - from);
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / Math.max(1, dur));
      t = from + (target - from) * k; draw();
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }
  return { setNight };
}
