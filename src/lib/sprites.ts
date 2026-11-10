import { Grid } from './pixel';

const INK = '#12120d';
const CREAM = '#f4ebcd';

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
};
export type IconName = keyof typeof icons;

/** Day: sun. Night: crescent moon. 10×10. */
export function themeIcon(night: boolean): Grid {
  const g = Grid(10, 10);
  if (night) { g.disc(5, 5, 4, CREAM); g.disc(7, 3, 3, null); }
  else { g.disc(5, 5, 3, '#f2c94c'); [[5, 0], [5, 9], [0, 5], [9, 5]].forEach(([x, y]) => g.set(x, y, '#f2c94c')); }
  return g;
}

/** Reduce-motion button. Motion on: pause bars (tap to calm the page). Motion reduced: play arrow (tap to bring it back). 10×10. */
export function motionIcon(reduced: boolean, c: string): Grid {
  const g = Grid(10, 10);
  if (reduced) for (let i = 0; i < 4; i++) g.rect(2 + i * 2, 1 + i, 2, 8 - i * 2, c);
  else { g.rect(2, 1, 2, 8, c); g.rect(6, 1, 2, 8, c); }
  return g;
}
