import { Grid } from './pixel';

const INK = '#12120d';
const CREAM = '#f4ebcd';

export function pine(h: number, c1: string, c2: string): Grid {
  const g = Grid(h, h + 3); const cx = h >> 1;
  for (let y = 0; y < h; y++) { const w = Math.floor(y * 0.5 + 1) - (y % 4 === 3 ? 1 : 0); g.rect(cx - w + 1, y, w * 2 - 1, 1, y % 4 < 2 ? c1 : c2); }
  g.rect(cx, h, 1, 3, '#715542');
  return g;
}

export type CupKind = 'hot' | 'iced' | 'tall' | 'cream';

/** 16×16 menu icons. */
export function cup(kind: CupKind, liquid: string | null = null): Grid {
  const g = Grid(16, 16), C = CREAM, W = '#ffffff';
  if (kind === 'hot') { g.rect(3, 7, 8, 7, C); g.rect(11, 8, 2, 1, C); g.rect(12, 8, 1, 4, C); g.rect(11, 11, 2, 1, C); g.rect(4, 7, 6, 1, liquid); g.rect(2, 14, 12, 1, '#c9a27a'); [[5, 3], [6, 4], [8, 2], [8, 4], [7, 3]].forEach(([x, y]) => g.set(x, y, W)); }
  if (kind === 'iced') { g.rect(4, 4, 8, 11, '#d7f0ee'); g.rect(5, 7, 6, 8, liquid); g.rect(5, 8, 2, 2, W); g.rect(8, 10, 2, 2, W); g.rect(9, 1, 1, 6, '#e66f46'); g.rect(10, 1, 2, 1, '#e66f46'); g.rect(3, 3, 10, 1, C); }
  if (kind === 'tall') { g.rect(4, 4, 8, 11, C); g.rect(4, 7, 8, 4, '#2b5615'); g.rect(3, 2, 10, 2, '#715542'); g.rect(7, 8, 2, 2, C); }
  if (kind === 'cream') { g.rect(4, 7, 8, 8, liquid); g.disc(8, 6, 3, W); g.set(8, 2, '#c8442a'); g.rect(3, 6, 10, 1, W); }
  g.outline(INK);
  return g;
}

/** HOT badge flame, 9×11 (7×9 flame plus its outline): yellow core in an orange flame. */
export function flame(): Grid {
  const g = Grid(9, 11), O = '#f08a2e', Y = '#ffd34d';
  const r = (x: number, y: number, w: number, h: number, c: string) => g.rect(x + 1, y + 1, w, h, c);
  r(3, 0, 1, 1, O); r(2, 1, 2, 1, O); r(5, 1, 1, 1, O); r(2, 2, 4, 1, O); r(1, 3, 5, 2, O); r(0, 5, 7, 3, O); r(1, 8, 5, 1, O);
  r(3, 4, 1, 1, Y); r(2, 5, 3, 3, Y);
  g.outline(INK);
  return g;
}

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
