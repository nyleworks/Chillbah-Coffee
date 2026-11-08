import { Grid, place } from './pixel';

const INK = '#12120d';
const CREAM = '#f4ebcd';

/** The green Hilux with the striped awning and espresso bar on the tray. 56×32. */
export function truck(): Grid {
  const g = Grid(56, 32), G = '#2b5615', H = '#4f7a2c', D = '#1d3a0e', glass = '#8ad8d8', S = '#9aa0a6', C = CREAM, E = '#e66f46';
  // awning + poles
  g.rect(5, 6, 1, 12, S); g.rect(28, 6, 1, 12, S);
  for (let x = 2; x < 32; x++) { const c = Math.floor((x - 2) / 3) % 2 ? C : E; g.rect(x, 3, 1, 3, c); if ((x - 2) % 3 !== 1) g.set(x, 6, c); }
  // espresso machine, grinder, chalkboard
  g.rect(8, 11, 8, 7, S); g.rect(8, 10, 8, 1, '#6d7278'); g.rect(10, 14, 2, 1, '#2a2620'); g.rect(13, 14, 2, 1, '#2a2620'); g.rect(11, 16, 2, 2, C);
  g.rect(18, 12, 3, 6, '#715542'); g.rect(18, 10, 3, 2, '#c9a27a');
  g.rect(22, 10, 5, 8, '#2a2620'); g.rect(23, 12, 3, 1, C); g.rect(23, 14, 2, 1, C); g.rect(23, 16, 3, 1, C);
  // tray bed
  g.rect(2, 18, 30, 8, G); g.rect(2, 18, 30, 1, H);
  // cab
  g.rect(33, 11, 13, 15, G); g.rect(35, 10, 9, 1, G); g.rect(34, 10, 1, 1, G);
  g.rect(35, 12, 5, 5, glass); g.rect(42, 12, 4, 5, glass); for (let y = 13; y <= 16; y++) g.set(46, y, glass);
  g.rect(35, 12, 1, 1, '#c8f0ee'); g.rect(42, 12, 1, 1, '#c8f0ee');
  g.rect(41, 18, 1, 7, D); g.rect(38, 19, 2, 1, D);
  // hood
  g.rect(46, 17, 8, 9, G); g.rect(46, 17, 8, 1, H); g.rect(47, 15, 1, 2, G);
  g.rect(52, 19, 2, 2, '#f2c94c'); g.rect(2, 19, 1, 3, '#c8442a');
  // stripe
  g.rect(2, 22, 52, 1, C);
  // bumpers
  g.rect(51, 25, 4, 2, S); g.rect(1, 25, 3, 2, S);
  // wheels
  ([[12, 26], [44, 26]] as const).forEach(([x, y]) => { g.disc(x, y, 5, '#2a2620'); g.disc(x, y, 2, '#b9b2a0'); g.set(x, y, '#6d7278'); });
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
