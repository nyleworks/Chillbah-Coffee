import { Grid, place } from './pixel';

const INK = '#12120d';
const CREAM = '#f4ebcd';

/** The white double-cab Hilux with a dark side awning over the tray. Faces left. 66×27. */
export function truck(): Grid {
  const g = Grid(66, 27);
  const W = '#eef0ec', Ws = '#d3d7d6', seam = '#7b8186', glass = '#2e3138', glassHi = '#4a5060',
    trim = '#26282b', flare = '#44474c', tire = '#1b1c1e', rim = '#5a5e63', hub = '#6d7278', awn = '#33363b', awnHi = '#4c5058',
    S = '#9aa0a6', red = '#c8442a', lamp = '#e8f4f6';

  // awning: tent-like panel, peak near the middle, flap hangs lower at the back
  for (let x = 29; x <= 65; x++) {
    const top = x <= 47 ? Math.round(3 - (x - 29) / 9) : Math.round(1 + (x - 47) / 8);
    g.rect(x, top, 1, 4 - top, awn);
    g.set(x, top, awnHi);
  }
  g.rect(29, 4, 34, 1, awnHi); g.rect(60, 4, 6, 2, awn);
  // antenna
  g.set(25, 1, trim); g.set(26, 2, trim);

  // body silhouette: nose, hood rising to the windscreen, A-pillar, roof, tray
  const topAt = (x: number) =>
    x <= 3 ? 10 : x <= 16 ? Math.round(10 - (x - 4) / 6) : x <= 28 ? Math.round(8 - ((x - 17) * 5) / 11) : x <= 42 ? 3 : 9;
  for (let x = 2; x <= 62; x++) g.rect(x, topAt(x), 1, 19 - topAt(x), W);
  g.rect(2, 15, 61, 3, Ws); // lower body shade band
  g.rect(43, 9, 20, 1, Ws); // tray rail

  // espresso machine peeking over the tray, under the awning
  g.rect(46, 6, 5, 3, S); g.rect(46, 6, 5, 1, '#6d7278'); g.rect(52, 7, 2, 2, '#715542');

  // side windows, B-pillar, mirror
  for (let x = 18; x <= 41; x++) { const t = Math.max(topAt(x) + 1, 4); g.rect(x, t, 1, 10 - t, glass); }
  g.rect(33, 4, 1, 6, trim); g.rect(42, 4, 1, 6, W);
  g.set(30, 4, glassHi); g.set(29, 5, glassHi); g.set(37, 4, glassHi); g.set(36, 5, glassHi);
  g.rect(19, 7, 3, 2, trim);

  // door seams and handles
  g.rect(17, 9, 1, 9, seam); g.rect(32, 9, 1, 9, seam); g.rect(41, 9, 1, 9, seam);
  g.rect(28, 11, 3, 1, trim); g.rect(38, 11, 3, 1, trim);

  // front: grille, bumper, headlight
  g.rect(2, 12, 2, 7, trim); g.rect(3, 10, 6, 2, trim); g.rect(4, 11, 3, 1, lamp); g.set(7, 11, '#f2c94c'); g.rect(4, 15, 2, 2, '#44474c');
  // rear: tail light, bumper
  g.rect(61, 10, 2, 5, red); g.rect(61, 16, 3, 3, '#4a4e55');
  // side step
  g.rect(19, 19, 25, 1, trim);

  // fender flares and wheels
  ([11, 49] as const).forEach((cx) => {
    const cy = 20;
    for (let j = -6; j <= 1; j++) for (let i = -7; i <= 7; i++) { const d = i * i + j * j; if (d <= 46 && d > 28) g.set(cx + i, cy + j, flare); }
    g.disc(cx, cy, 5, tire); g.disc(cx, cy, 3, rim);
    [[0, -2], [0, 2], [-2, 0], [2, 0]].forEach(([i, j]) => g.set(cx + i, cy + j, tire));
    g.set(cx, cy, hub);
  });

  // awning poles down to the tray
  g.rect(44, 5, 1, 5, S);
  g.rect(57, 6, 1, 4, S);

  g.outline(INK);
  return g;
}

export function pine(h: number, c1: string, c2: string): Grid {
  const g = Grid(h, h + 3); const cx = h >> 1;
  for (let y = 0; y < h; y++) { const w = Math.floor(y * 0.5 + 1) - (y % 4 === 3 ? 1 : 0); g.rect(cx - w + 1, y, w * 2 - 1, 1, y % 4 < 2 ? c1 : c2); }
  g.rect(cx, h, 1, 3, '#715542');
  return g;
}

export type CupKind = 'hot' | 'iced' | 'tall' | 'cream' | 'croffle';

/** 16×16 menu icons. */
export function cup(kind: CupKind, liquid: string | null = null): Grid {
  const g = Grid(16, 16), C = CREAM, W = '#ffffff';
  if (kind === 'hot') { g.rect(3, 7, 8, 7, C); g.rect(11, 8, 2, 1, C); g.rect(12, 8, 1, 4, C); g.rect(11, 11, 2, 1, C); g.rect(4, 7, 6, 1, liquid); g.rect(2, 14, 12, 1, '#c9a27a'); [[5, 3], [6, 4], [8, 2], [8, 4], [7, 3]].forEach(([x, y]) => g.set(x, y, W)); }
  if (kind === 'iced') { g.rect(4, 4, 8, 11, '#d7f0ee'); g.rect(5, 7, 6, 8, liquid); g.rect(5, 8, 2, 2, W); g.rect(8, 10, 2, 2, W); g.rect(9, 1, 1, 6, '#e66f46'); g.rect(10, 1, 2, 1, '#e66f46'); g.rect(3, 3, 10, 1, C); }
  if (kind === 'tall') { g.rect(4, 4, 8, 11, C); g.rect(4, 7, 8, 4, '#2b5615'); g.rect(3, 2, 10, 2, '#715542'); g.rect(7, 8, 2, 2, C); }
  if (kind === 'cream') { g.rect(4, 7, 8, 8, liquid); g.disc(8, 6, 3, W); g.set(8, 2, '#c8442a'); g.rect(3, 6, 10, 1, W); }
  if (kind === 'croffle') { g.rect(2, 7, 12, 6, '#d9a441'); for (let x = 3; x < 13; x += 3) g.rect(x, 7, 1, 6, '#a8742a'); g.rect(2, 9, 12, 1, '#a8742a'); g.rect(5, 5, 6, 2, W); g.set(8, 4, '#c8442a'); }
  g.outline(INK);
  return g;
}

/** Small inline icons (8×8) and step icons (18×18). `c` is the accent colour. */
export const icons = {
  pin(c: string) { const g = Grid(8, 8); g.rect(2, 0, 4, 1, c); g.rect(1, 1, 6, 3, c); g.rect(2, 4, 4, 1, c); g.rect(3, 5, 2, 2, c); g.rect(3, 2, 2, 1, CREAM); return g; },
  clock(c: string) { const g = Grid(8, 8); g.disc(4, 4, 3, c); g.rect(4, 2, 1, 3, CREAM); g.set(5, 4, CREAM); return g; },
  truck(c: string) { const g = Grid(8, 8); g.rect(0, 2, 5, 3, c); g.rect(5, 3, 3, 2, c); g.set(6, 3, '#8ad8d8'); g.set(1, 6, '#2a2620'); g.set(6, 6, '#2a2620'); g.rect(0, 5, 8, 1, c); return g; },
  bigpin() { const g = Grid(18, 18); g.disc(9, 6, 5, '#e66f46'); g.rect(7, 11, 4, 2, '#e66f46'); g.rect(8, 13, 2, 3, '#e66f46'); g.disc(9, 6, 2, CREAM); g.outline(INK); return g; },
  bigcup() { return place(cup('hot', '#715542'), 18, 18, 1, 1); },
  tree() { const t = pine(14, '#2b5615', '#4f7a2c'); t.outline(INK); return place(t, 18, 18, 2, 0); },
};
export type IconName = keyof typeof icons;

/** Day: sun. Night: crescent moon. 10×10. */
export function themeIcon(night: boolean): Grid {
  const g = Grid(10, 10);
  if (night) { g.disc(5, 5, 4, CREAM); g.disc(7, 3, 3, null); }
  else { g.disc(5, 5, 3, '#f2c94c'); [[5, 0], [5, 9], [0, 5], [9, 5]].forEach(([x, y]) => g.set(x, y, '#f2c94c')); }
  return g;
}
