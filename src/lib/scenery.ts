// Pixel backdrops for the road lanes: a town (menu section) and a kampung (Find us section).
// Drawn at 1 art pixel per canvas pixel, shown scaled up with image-rendering: pixelated.
// At night the windows, street lamps and lanterns light up; by day they're off.

const INK = '#12120d';
const LIT = ['#f2c94c', '#ffe08a', '#f5b942'];

/** Small seeded RNG so the skyline is the same on every redraw. */
function rng(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
/** A window colour. Always draws two numbers so day and night lay out the same skyline. */
function lit(r: () => number, night: boolean, chance: number, off: string, day: string) {
  const a = r(), b = r();
  return night ? (a < chance ? LIT[Math.floor(b * LIT.length)] : off) : day;
}

/** Darken a #rrggbb colour for night. */
function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

type Ctx = CanvasRenderingContext2D;
function rect(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function box(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string) { rect(ctx, x, y, w, h, INK); rect(ctx, x + 1, y + 1, w - 2, h - 2, fill); }
function glow(ctx: Ctx, cx: number, cy: number, r: number, a = 0.22) {
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    const d = Math.sqrt(i * i + j * j); if (d > r) continue;
    ctx.fillStyle = `rgba(255, 214, 90, ${(a * (1 - d / r)).toFixed(3)})`; ctx.fillRect(cx + i, cy + j, 1, 1);
  }
}

/* ---------------- Town: close-up row of shophouses ---------------- */

const SHOPS = [
  { wall: '#d9c7a0', sign: '#2b5615', ink: '#f4ebcd', awn: '#e66f46', goods: ['#715542', '#c9a27a', '#f4ebcd'] },
  { wall: '#e8b9a0', sign: '#8a2e1c', ink: '#f2c94c', awn: '#f4ebcd', goods: ['#d9a441', '#a8742a', '#f2c94c'] },
  { wall: '#a3b8a8', sign: '#f2c94c', ink: '#12120d', awn: '#2b5615', goods: ['#e66f46', '#8ad8d8', '#96b04f', '#f2c94c'] },
  { wall: '#c9b7d6', sign: '#455976', ink: '#f4ebcd', awn: '#8f7a9a', goods: ['#e66f46', '#8ad8d8', '#f4ebcd'] },
  { wall: '#e2d39f', sign: '#f4ebcd', ink: '#2b5615', awn: '#96b04f', goods: ['#f4ebcd', '#8ad8d8', '#e66f46'] },
  { wall: '#c98a6b', sign: '#12120d', ink: '#e66f46', awn: '#f2c94c', goods: ['#f2c94c', '#e66f46', '#f4ebcd'] },
];

function shopfront(ctx: Ctx, x: number, w: number, roofY: number, base: number, shop: typeof SHOPS[number], night: boolean, r: () => number) {
  const k = night ? 0.45 : 1;
  const signTop = base - 30, awnTop = signTop + 8, frontTop = awnTop + 4;
  // upper floors up to this building's own roof line
  rect(ctx, x - 1, roofY - 1, w + 2, signTop - roofY + 1, INK);
  rect(ctx, x, roofY, w, signTop - roofY, shade(shop.wall, k));
  // parapet / cornice, sometimes with a stepped centre gable
  rect(ctx, x, roofY, w, 3, shade('#f4ebcd', k)); rect(ctx, x, roofY + 3, w, 1, INK);
  const gable = r();
  if (gable < 0.45 && roofY > 6) {
    const gw = Math.round(w * 0.4), gx = x + Math.round((w - gw) / 2);
    rect(ctx, gx - 1, roofY - 5, gw + 2, 5, INK); rect(ctx, gx, roofY - 4, gw, 4, shade('#f4ebcd', k));
    rect(ctx, gx + Math.round(gw / 2) - 4, roofY - 8, 9, 3, INK); rect(ctx, gx + Math.round(gw / 2) - 3, roofY - 7, 7, 2, shade(shop.wall, k));
  } else if (gable < 0.7) {
    box(ctx, x + w - 12, roofY - 6, 7, 6, shade('#9aa0a6', k)); // water tank
  }
  // louvred windows, one row per floor
  for (let wy = roofY + 6; wy + 12 <= signTop - 3; wy += 16) for (let wx = x + 6; wx + 10 < x + w - 4; wx += 16) {
    rect(ctx, wx - 1, wy - 1, 12, 14, INK);
    const on = lit(r, night, 0.55, '#1d2130', '#5d7194');
    rect(ctx, wx, wy, 10, 12, on);
    for (let ly = wy + 1; ly < wy + 12; ly += 2) rect(ctx, wx, ly, 10, 1, night ? 'rgba(0,0,0,.25)' : '#8ad8d8');
    rect(ctx, wx + 4, wy, 2, 12, INK);
    if (night && on !== '#1d2130') glow(ctx, wx + 5, wy + 6, 10, 0.15);
    rect(ctx, wx - 2, wy + 12, 14, 2, shade('#f4ebcd', k)); // sill
  }
  // blank sign board (no lettering)
  rect(ctx, x + 2, signTop, w - 4, 8, INK);
  rect(ctx, x + 3, signTop + 1, w - 6, 6, shop.sign);
  rect(ctx, x + 3, signTop + 1, w - 6, 1, shade('#ffffff', night ? 0.5 : 0.9));
  if (night) glow(ctx, x + w / 2, signTop + 4, Math.min(16, w / 3), 0.16);
  // striped awning, slanting out
  for (let i = 0; i < w; i++) {
    const c = Math.floor(i / 4) % 2 ? '#f4ebcd' : shop.awn;
    rect(ctx, x + i, awnTop, 1, 3, shade(c, k));
  }
  rect(ctx, x, awnTop + 3, w, 1, INK);
  for (let i = 1; i < w; i += 4) rect(ctx, x + i, awnTop + 3, 2, 1, shade(Math.floor(i / 4) % 2 ? '#f4ebcd' : shop.awn, k)); // scallops
  // shop front: display window + door
  rect(ctx, x, frontTop, w, base - frontTop, shade(shop.wall, k * 0.85));
  const doorW = 10, winW = w - doorW - 12, wy = frontTop + 2, wh = base - wy - 3;
  rect(ctx, x + 4, wy - 1, winW + 2, wh + 2, INK);
  rect(ctx, x + 5, wy, winW, wh, night ? '#ffe7a3' : '#3b4a5a');
  // shelves and goods
  for (let sy = wy + 4; sy < wy + wh; sy += 5) {
    rect(ctx, x + 5, sy, winW, 1, night ? '#c9a27a' : '#2a3542');
    for (let gx = x + 7; gx < x + 5 + winW - 2; gx += 3) if (r() < 0.7) rect(ctx, gx, sy - 2, 2, 2, shade(pick(r, shop.goods), night ? 0.95 : 0.8));
  }
  if (!night) for (let i = 0; i < wh; i++) { rect(ctx, x + 7 + i, wy + wh - 1 - i, 1, 1, 'rgba(200,240,240,.35)'); rect(ctx, x + 10 + i, wy + wh - 1 - i, 1, 1, 'rgba(200,240,240,.2)'); } // glass glint
  else glow(ctx, x + 5 + winW / 2, base - 2, Math.min(18, winW / 2), 0.2);
  // door
  const dx = x + w - doorW - 4;
  rect(ctx, dx - 1, wy - 1, doorW + 2, base - wy + 1, INK);
  rect(ctx, dx, wy, doorW, base - wy, night ? '#ffd877' : shade('#715542', k));
  rect(ctx, dx + doorW / 2, wy, 1, base - wy, INK);
  rect(ctx, dx + 1, wy + 2, doorW / 2 - 2, 6, night ? '#fff2c4' : '#5d7194');
  rect(ctx, dx + doorW / 2 + 1, wy + 2, doorW / 2 - 2, 6, night ? '#fff2c4' : '#5d7194');
  // potted plant by the door
  box(ctx, dx - 6, base - 4, 4, 4, shade('#a0603a', k));
  rect(ctx, dx - 7, base - 8, 2, 4, shade('#4f7a2c', k)); rect(ctx, dx - 5, base - 9, 2, 5, shade('#2b5615', k)); rect(ctx, dx - 3, base - 7, 2, 3, shade('#4f7a2c', k));
}

export function drawTown(ctx: Ctx, W: number, H: number, night: boolean) {
  const r = rng(7);
  const base = H - 4, signTop = base - 30;
  ctx.clearRect(0, 0, W, H);
  // Each building gets its own height: from one storey above the shop to the top of the strip.
  const heights = [0.05, 0.6, 0.3, 0.9, 0.45, 0.75, 0.15, 0.55];
  let x = -10, i = 0;
  const cols: { x: number; top: number }[] = [];
  let prevTop = 0;
  while (x < W) {
    const w = 58 + Math.floor(r() * 18);
    const span = Math.max(0, signTop - 18);
    const roofY = 10 + Math.round(heights[i % heights.length] * span);
    shopfront(ctx, x, w, roofY, base, SHOPS[i % SHOPS.length], night, r);
    if (i > 0) cols.push({ x: x - 4, top: Math.max(prevTop, roofY) + 4 });
    prevTop = roofY;
    x += w + 4; i++;
  }
  // five-foot-way pillars between shops, up to the lower roof
  for (const c of cols) { rect(ctx, c.x - 1, c.top, 6, base - c.top, INK); rect(ctx, c.x, c.top, 4, base - c.top, shade('#f4ebcd', night ? 0.5 : 1)); rect(ctx, c.x, c.top, 1, base - c.top, shade('#ffffff', night ? 0.5 : 0.95)); }
  // five-foot way floor + curb
  rect(ctx, 0, base, W, 1, INK);
  rect(ctx, 0, base + 1, W, 2, night ? '#4a4c50' : '#c9c5b8');
  for (let tx = 0; tx < W; tx += 5) rect(ctx, tx, base + 1, 1, 2, night ? '#3a3c40' : '#b2ad9e');
  rect(ctx, 0, base + 3, W, 1, night ? '#2e3034' : '#9aa0a6');
}

/* ---------------- Kampung (rural) ---------------- */

function stiltHouse(ctx: Ctx, x: number, base: number, w: number, night: boolean, r: () => number) {
  const k = night ? 0.45 : 1;
  const plankA = shade('#8a5a3c', k), plankB = shade('#74492f', k), trim = shade('#e2d39f', k);
  const stilt = 8, bodyH = 18, top = base - stilt - bodyH;
  // stilts, cross-brace and steps
  for (let px = x + 1; px < x + w; px += 6) rect(ctx, px, base - stilt, 2, stilt, INK);
  for (let i = 0; i < stilt; i++) rect(ctx, x + 3 + i, base - stilt + i, 1, 1, shade('#5a3d28', k));
  for (let s2 = 0; s2 < 6; s2++) rect(ctx, x + w + 1 + s2, base - stilt + s2 + 1, 3, 1, shade('#715542', k));
  rect(ctx, x + w + 1, base - stilt, 1, stilt, INK);
  // veranda rail
  rect(ctx, x - 6, base - stilt - 5, 6, 1, INK); for (let px = x - 6; px < x; px += 2) rect(ctx, px, base - stilt - 4, 1, 4, INK);
  // walls: vertical planks with a cream trim band
  rect(ctx, x, top, w, bodyH + 1, INK);
  for (let px = x + 1; px < x + w - 1; px++) rect(ctx, px, top + 1, 1, bodyH - 1, px % 2 ? plankA : plankB);
  rect(ctx, x + 1, top + 2, w - 2, 1, trim);
  rect(ctx, x - 7, base - stilt, w + 9, 2, INK); // floor beam
  // windows with green shutters
  for (let wx = x + 4; wx + 6 < x + w - 9; wx += 10) {
    const win = lit(r, night, 1, '#2a2620', '#2a2620');
    rect(ctx, wx - 1, top + 5, 7, 7, INK); rect(ctx, wx, top + 6, 5, 5, win); rect(ctx, wx + 2, top + 6, 1, 5, INK);
    rect(ctx, wx - 3, top + 6, 2, 5, shade('#2b5615', k)); rect(ctx, wx + 6, top + 6, 2, 5, shade('#2b5615', k));
    if (night) glow(ctx, wx + 2, top + 8, 9, 0.25);
  }
  // door
  rect(ctx, x + w - 8, top + 5, 6, bodyH - 5, INK); rect(ctx, x + w - 7, top + 6, 4, bodyH - 6, night ? '#f5b942' : shade('#5a3a26', k));
  if (night) glow(ctx, x + w - 5, base - stilt - 2, 8, 0.2);
  // roof: zinc gable with ridges, or thatch (attap)
  const zinc = r() < 0.55, roofC = zinc ? shade('#9aa0a6', k) : shade('#b08a4a', k), roofD = zinc ? shade('#7b8186', k) : shade('#8f6d34', k);
  const rh = Math.ceil(w / 3.2);
  for (let j = 0; j < rh; j++) {
    const half = Math.round(((j + 1) / rh) * (w / 2 + 6));
    const cx = x + w / 2;
    rect(ctx, Math.round(cx - half) - 1, top - rh + j, half * 2 + 2, 1, INK);
    rect(ctx, Math.round(cx - half), top - rh + j, half * 2, 1, j % 2 ? roofC : roofD);
  }
  rect(ctx, x - 7, top, w + 14, 1, INK);
}

function shack(ctx: Ctx, x: number, base: number, w: number, night: boolean, r: () => number) {
  const k = night ? 0.45 : 1;
  const h = 18, top = base - h;
  rect(ctx, x, top, w, h, INK);
  for (let px = x + 1; px < x + w - 1; px++) rect(ctx, px, top + 1, 1, h - 1, shade(px % 3 ? '#6b4a32' : '#5a3d28', k));
  for (let py = top + 4; py < base; py += 4) rect(ctx, x + 1, py, w - 2, 1, shade('#4a3222', k)); // plank seams
  // open front with a hanging lantern
  rect(ctx, x + 3, top + 4, 9, h - 4, night ? '#3a2a1a' : '#2a2620');
  rect(ctx, x + 7, top + 4, 1, 3, INK); rect(ctx, x + 6, top + 7, 3, 2, night ? '#ffe08a' : '#9aa0a6');
  if (night) glow(ctx, x + 7, top + 8, 10, 0.32);
  // crates
  box(ctx, x + w - 8, base - 5, 6, 5, shade('#a8742a', k));
  // lean-to corrugated roof with rust patches: one solid slab sloping down to the right
  for (let i = -3; i < w + 3; i++) {
    const y = top - 6 + Math.floor(((i + 3) / (w + 6)) * 4);
    rect(ctx, x + i, y - 1, 1, 1, INK);
    rect(ctx, x + i, y, 1, top - y + 1, shade(i % 2 ? '#9aa0a6' : '#7b8186', k));
    if (r() < 0.18) rect(ctx, x + i, y + 1, 1, 2, shade('#a0603a', k));
  }
  rect(ctx, x - 3, top + 1, w + 6, 1, INK);
}

function palm(ctx: Ctx, x: number, base: number, h: number, night: boolean) {
  const k = night ? 0.5 : 1, trunk = shade('#8a6a44', k), ring = shade('#6b5034', k), leaf = shade('#4f7a2c', k), leafD = shade('#2b5615', k);
  for (let j = 0; j < h; j++) rect(ctx, x + Math.round(Math.sin((j / h) * 1.6) * 3), base - j, 2, 1, j % 3 ? trunk : ring);
  const tx = x + 3, ty = base - h;
  [[-1, 0], [1, 0], [-1, 1], [1, 1], [0, -1]].forEach(([dx, dy]) => {
    for (let i = 0; i < 10; i++) rect(ctx, tx + dx * i, ty + Math.floor((i * i) / (dy < 0 ? 30 : 12)) + dy * 2 - (dx === 0 ? i : 0), 2, 1, i % 2 ? leaf : leafD);
  });
  rect(ctx, tx - 1, ty, 3, 3, shade('#715542', k));
}

function banana(ctx: Ctx, x: number, base: number, night: boolean) {
  const k = night ? 0.5 : 1;
  rect(ctx, x, base - 11, 2, 11, shade('#7d8a52', k));
  for (let i = 0; i < 7; i++) {
    rect(ctx, x - 1 - i, base - 12 + Math.floor(i / 2), 2, 2, shade('#96b04f', k));
    rect(ctx, x + 2 + i, base - 14 + Math.floor(i / 2), 2, 2, shade('#7fae45', k));
  }
}

/** Rolling jungle canopy behind the kampung. */
function canopy(ctx: Ctx, W: number, base: number, H: number, night: boolean, r: () => number) {
  const c1 = night ? '#1f2a17' : '#7d8a52', c2 = night ? '#18220f' : '#66733f';
  for (let x = -10; x < W + 10;) {
    const rad = 8 + Math.floor(r() * 8), cy = base - Math.floor(H * 0.32) + Math.floor(r() * 6);
    for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++)
      if (i * i + j * j <= rad * rad) rect(ctx, x + i, cy + j, 1, base - (cy + j), j < -rad / 2 ? c1 : c2);
    x += rad + 2 + Math.floor(r() * 6);
  }
}

export function drawVillage(ctx: Ctx, W: number, H: number, night: boolean) {
  const r = rng(11);
  const base = H - 1;
  ctx.clearRect(0, 0, W, H);
  canopy(ctx, W, base, H, night, r);
  // One wooden house and one shack, with a few plants around them.
  const houseW = 46, shackW = 30;
  // On narrow (phone) lanes the pair moves closer so both always fit on screen.
  const narrow = W < houseW + shackW + 60;
  const hx = narrow ? Math.round((W - houseW - shackW - 4) / 2) : Math.max(10, Math.round(W * 0.16));
  const sx = narrow ? hx + houseW + 4 : Math.max(hx + houseW + 30, Math.round(W * 0.68));
  palm(ctx, hx - 16, base, Math.min(H - 6, 34), night);
  stiltHouse(ctx, hx, base, houseW, night, r);
  if (!narrow) banana(ctx, hx + houseW + 16, base, night);
  shack(ctx, sx, base, shackW, night, r);
  palm(ctx, sx + shackW + 14, base, Math.min(H - 6, 28), night);
}
