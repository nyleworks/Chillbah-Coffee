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

/** 16×16 snack icons. `accent` tints the topping (hotdog sauce, roti john filling); burgers take the patty colour. */
export const FOOD_KINDS = ['burger', 'bagel', 'hotdog', 'lamb', 'sate', 'sausage', 'rotijohn', 'fries'] as const;
export type FoodKind = (typeof FOOD_KINDS)[number];
export function food(kind: FoodKind, accent: string | null = null): Grid {
  const g = Grid(16, 16), W = '#fff6dc';
  const BUN = '#d9a441', BUN_D = '#a8742a', GREEN = '#6fae3a', TOMATO = '#d9452f', CHEESE = '#ffd34d';
  if (kind === 'burger' || kind === 'bagel') {
    const bun = kind === 'bagel' ? '#c8873a' : BUN;
    g.rect(5, 2, 6, 1, bun); g.rect(3, 3, 10, 1, bun); g.rect(2, 4, 12, 2, bun);
    if (kind === 'bagel') { g.rect(7, 3, 2, 2, BUN_D); [[4, 4], [11, 4], [5, 3], [10, 3], [3, 5], [12, 5]].forEach(([x, y]) => g.set(x, y, W)); }
    else [[6, 3], [9, 3], [4, 4], [11, 4], [7, 5]].forEach(([x, y]) => g.set(x, y, W));
    g.rect(1, 6, 14, 1, GREEN); [2, 5, 8, 11, 13].forEach((x) => g.set(x, 7, GREEN));
    g.rect(2, 7, 12, 1, TOMATO); [2, 5, 8, 11, 13].forEach((x) => g.set(x, 7, GREEN));
    g.rect(2, 8, 12, 1, CHEESE); g.set(5, 9, CHEESE); g.set(10, 9, CHEESE);
    g.rect(2, 9, 12, 2, accent ?? '#5a3a26'); g.set(5, 9, CHEESE); g.set(10, 9, CHEESE);
    g.rect(2, 11, 12, 1, bun); g.rect(3, 12, 10, 1, BUN_D);
  }
  if (kind === 'hotdog') {
    g.rect(2, 9, 12, 3, BUN); g.rect(1, 10, 14, 1, BUN); g.rect(3, 12, 10, 1, BUN_D);
    g.rect(1, 7, 14, 2, '#c0503a'); g.set(0, 8, '#c0503a'); g.set(15, 8, '#c0503a');
    for (let x = 2; x < 14; x += 2) { g.set(x, 7, CHEESE); g.set(x + 1, 6, CHEESE); }
    if (accent) [3, 7, 11].forEach((x) => g.set(x, 8, accent));
  }
  if (kind === 'lamb') {
    const M = '#7a3b2a', M2 = '#5a2a1e', BONE = '#f4ebcd';
    g.rect(3, 6, 7, 6, M); g.rect(2, 7, 9, 4, M); g.rect(4, 12, 5, 1, M);
    [[4, 7], [6, 9], [8, 7], [3, 9], [5, 11], [8, 10]].forEach(([x, y]) => g.set(x, y, M2));
    g.set(9, 5, BONE); g.set(10, 4, BONE); g.set(11, 3, BONE); g.set(10, 5, BONE); g.set(11, 4, BONE); g.set(12, 2, BONE); g.set(13, 2, BONE); g.set(12, 3, BONE);
  }
  if (kind === 'sate') {
    for (let i = 0; i < 13; i++) g.set(1 + i, 14 - i, '#c9a27a');
    [[4, 11], [8, 7], [12, 3]].forEach(([x, y]) => { g.disc(x, y, 2, '#7a3b2a'); g.set(x - 1, y - 1, '#c0703a'); });
    [[6, 9], [10, 5]].forEach(([x, y]) => { g.set(x, y, '#c9a27a'); g.set(x - 1, y, '#4a2216'); g.set(x, y + 1, '#4a2216'); g.set(x + 1, y, '#4a2216'); g.set(x, y - 1, '#4a2216'); });
  }
  if (kind === 'sausage') {
    const S = '#c0603a', S2 = '#8a3a22';
    g.rect(2, 6, 12, 4, S); g.rect(1, 7, 14, 2, S);
    [4, 7, 10].forEach((x) => { g.set(x, 6, S2); g.set(x + 1, 7, S2); g.set(x + 2, 8, S2); });
    g.rect(12, 9, 3, 1, CHEESE); g.set(13, 10, CHEESE); g.set(14, 11, CHEESE);
  }
  if (kind === 'rotijohn') {
    g.rect(1, 5, 14, 3, '#e0a24a'); g.rect(0, 6, 16, 2, '#e0a24a'); [3, 7, 11].forEach((x) => { g.set(x, 5, '#f0c070'); g.set(x + 1, 5, '#f0c070'); });
    g.rect(1, 8, 14, 2, accent ?? CHEESE); [2, 6, 10, 13].forEach((x) => g.set(x, 8, GREEN)); [4, 8, 12].forEach((x) => g.set(x, 9, TOMATO));
    g.rect(1, 10, 14, 1, '#e0a24a'); g.rect(2, 11, 12, 1, BUN_D);
  }
  if (kind === 'fries') {
    [[4, 3], [6, 2], [8, 3], [10, 2], [5, 4], [9, 4], [7, 3], [11, 4]].forEach(([x, y]) => g.rect(x, y, 1, 7 - (y - 2), CHEESE));
    g.rect(3, 8, 10, 1, TOMATO); g.rect(3, 9, 10, 4, TOMATO); g.rect(4, 13, 8, 1, TOMATO); g.rect(5, 10, 6, 1, W);
  }
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

export const SOCIAL_KINDS = ['instagram', 'tiktok', 'threads', 'whatsapp'] as const;
export type SocialKind = (typeof SOCIAL_KINDS)[number];

/** Social media icons, 14×14, drawn from text rows (one letter per pixel, '.' = empty). */
export function social(kind: SocialKind): Grid {
  const g = Grid(14, 14);
  const rows: Record<SocialKind, string[]> = {
    instagram: [],
    tiktok: [
      'kkkkkkkkkkkkkk',
      'kkkkkkkCWkkkkk',
      'kkkkkkkCWkkkkk',
      'kkkkkkkCWWkkkk',
      'kkkkkkkCWWWWRk',
      'kkkkkkkCWkkWRk',
      'kkkkkkkCWkkkkk',
      'kkkkCCCCWkkkkk',
      'kkkCWWWWWkkkkk',
      'kkCWkkkCWRkkkk',
      'kkCWkkkCWRkkkk',
      'kkkWWWWWRkkkkk',
      'kkkkRRRRkkkkkk',
      'kkkkkkkkkkkkkk',
    ],
    threads: [
      'kkkkkkkkkkkkkk',
      'kkkkkWWWWkkkkk',
      'kkkWWkkkkWWkkk',
      'kkWkkkkkkkkWkk',
      'kkWkkkWWWkkWkk',
      'kWkkkWkkkWkkWk',
      'kWkkkWkkkWkkWk',
      'kWkkkkWWWWkkWk',
      'kWkkkkkkkWkWkk',
      'kkWkkkkkkWWkkk',
      'kkWkkkkkkkkkkk',
      'kkkWWkkkkWWkkk',
      'kkkkkWWWWkkkkk',
      'kkkkkkkkkkkkkk',
    ],
    whatsapp: [
      '....gggggg....',
      '..ggGGGGGGgg..',
      '.gGGWWWWWWGGg.',
      '.gGWWGGGGWWGg.',
      'gGWWGWWGGGWWGg',
      'gGWGGWWGGGGWGg',
      'gGWGGGWGGGGWGg',
      'gGWGGGGWGGGWGg',
      'gGWGGGGGWWGWGg',
      'gGWWGGGGWWWWGg',
      '.gGWWGGGGWWGg.',
      '.gWWWWWWWWGGg.',
      'gWWgGGGGGGgg..',
      'ggg.gggggg....',
    ],
  };
  const pal: Record<string, string> = {
    p: INK, P: '#8a3ab9', R: '#e1306c', O: '#f56040', Y: '#fcaf45', W: '#ffffff',
    k: '#000000', C: '#25f4ee', g: INK, G: '#25d366',
  };
  if (kind === 'instagram') {
    // Rounded square in the purple-to-yellow sunset, white camera frame, lens ring and flash dot.
    const band = (y: number) => (y < 4 ? '#8a3ab9' : y < 7 ? '#e1306c' : y < 9 ? '#f56040' : '#fcaf45');
    for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) {
      const corner = (x < 2 || x > 11) && (y < 2 || y > 11) && !((x === 1 || x === 12) && (y === 1 || y === 12));
      if (!corner) g.set(x, y, band(y));
    }
    const W = '#ffffff';
    g.rect(2, 2, 10, 1, W); g.rect(2, 11, 10, 1, W); g.rect(2, 2, 1, 10, W); g.rect(11, 2, 1, 10, W);
    g.rect(5, 4, 4, 1, W); g.rect(5, 9, 4, 1, W); g.rect(4, 5, 1, 4, W); g.rect(9, 5, 1, 4, W);
    g.set(9, 3, W);
    g.outline(INK);
    return g;
  }
  rows[kind].forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') g.set(x, y, pal[ch]); }));
  return g;
}
