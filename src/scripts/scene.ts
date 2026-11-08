// The hero scene: Hilux parked on grass under Kinabalu, day or night. 180×98 canvas, 140ms stepped frames.
import { Grid } from '../lib/pixel';
import { cup, pine, truck } from '../lib/sprites';
import { css, isNight } from './theme';

const ridge = [[52, 92], [70, 72], [84, 58], [94, 60], [102, 44], [110, 48], [116, 34], [122, 40], [128, 28], [134, 36], [140, 26], [146, 33], [152, 30], [160, 42], [170, 38], [180, 52], [196, 58], [214, 70], [240, 76]];
const heightAt = (x: number) => {
  for (let i = 0; i < ridge.length - 1; i++) {
    const [x1, y1] = ridge[i], [x2, y2] = ridge[i + 1];
    if (x >= x1 && x <= x2) return Math.round(y1 + ((y2 - y1) * (x - x1)) / (x2 - x1) + ((x * 7) % 3) - 1);
  }
  return 200;
};
const clouds = [[20, 40, 1], [150, 24, 0.6], [200, 46, 0.8], [90, 30, 0.7]];
const stars = Array.from({ length: 40 }, (_, i) => [(i * 53) % 240, 18 + ((i * 29) % 50)]);

export function initScene(canvas: HTMLCanvasElement | null) {
  const sx = canvas?.getContext('2d');
  if (!canvas || !sx) return { redraw() {} };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = truck();
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

  function draw() {
    const ctx = sx!;
    const night = isNight(); const W = 240, H = 120;
    ctx.setTransform(1, 0, 0, 1, -40, -18);
    ctx.fillStyle = css('sky'); ctx.fillRect(0, 0, W, H);
    if (night) {
      ctx.fillStyle = '#f4ebcd'; stars.forEach(([x, y], i) => { if ((i + (frame >> 3)) % 7) ctx.fillRect(x, y, 1, 1); });
      const m = Grid(14, 14); m.disc(7, 7, 6, '#f4ebcd'); m.disc(10, 5, 5, null); m.draw(ctx, 48, 22);
    } else {
      const s = Grid(22, 22); s.disc(11, 11, 5, '#f2c94c');
      [[11, 1], [11, 2], [11, 20], [11, 19], [1, 11], [2, 11], [20, 11], [19, 11], [4, 4], [18, 4], [4, 18], [18, 18]].forEach(([x, y]) => s.set(x, y, '#f2c94c'));
      s.draw(ctx, 42, 18);
    }
    clouds.forEach(([x, y, sp]) => cloud(((x + frame * sp * 0.25) % 280) - 30, y, night ? '#3a4a66' : '#f0f8f0'));
    // mountain
    const mt = css('slate');
    for (let x = 52; x < W; x++) { const h = heightAt(x); ctx.fillStyle = mt; ctx.fillRect(x, h, 1, 96 - h); ctx.fillStyle = '#12120d'; ctx.fillRect(x, h, 1, 1); }
    ctx.fillStyle = night ? '#2d3a52' : '#5d7194';
    [[100, 52, 10], [126, 38, 8], [148, 40, 10], [172, 50, 9]].forEach(([x, y, l]) => { for (let i = 0; i < l; i++) ctx.fillRect(x + (i >> 1), y + i, 1, 1); });
    // cloud band at the mountain base
    ctx.fillStyle = night ? '#3a4a66' : '#f0f8f0';
    for (let x = 40; x < W; x++) { const y = 82 + Math.round(Math.sin(x / 7) * 2); ctx.fillRect(x, y, 1, 8); }
    // tree line
    [[36, 76], [46, 80], [184, 79], [196, 74], [208, 80]].forEach(([x, y], i) => (i % 2 ? p2 : p1).draw(ctx, x, y));
    // ground, road
    ctx.fillStyle = night ? '#4c5f2c' : '#7fae45'; ctx.fillRect(0, 92, W, 28);
    ctx.fillStyle = night ? '#3a4a22' : '#66882d';
    for (let i = 0; i < 70; i++) { const x = (i * 37) % W, y = 95 + ((i * 11) % 24); ctx.fillRect(x, y, 1, 2); ctx.fillRect(x + 1, y + 1, 1, 1); }
    ctx.fillStyle = night ? '#5a4632' : '#c9a27a'; ctx.fillRect(0, 108, W, 6);
    ctx.fillStyle = night ? '#4a3a2a' : '#b08560'; for (let x = 0; x < W; x += 9) ctx.fillRect(x, 110, 4, 1);
    ctx.fillStyle = '#12120d'; ctx.fillRect(0, 92, W, 1);
    // truck, with a little idle bob
    const bob = reduce ? 0 : (frame >> 3) % 2;
    const tx = 88, ty = 86;
    T.draw(ctx, tx, ty + bob);
    // steam rising from the espresso machine, past the awning
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      const t = (frame + i * 9) % 36; const y = ty - 1 - t / 2 + bob; const x = tx + 48 + Math.round(Math.sin((t + i) / 4) * 1.5);
      if (t < 30) ctx.fillRect(x, Math.round(y), 1, 1);
    }
    sign.draw(ctx, 70, 96);
    stool.draw(ctx, 160, 99); stool.draw(ctx, 174, 101);
    icedCup.draw(ctx, 186, 94);
  }

  draw();
  if (!reduce) setInterval(() => { frame++; draw(); }, 140);
  return { redraw: draw };
}
