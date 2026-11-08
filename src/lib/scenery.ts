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

/* ---------------- Town ---------------- */

export function drawTown(ctx: Ctx, W: number, H: number, night: boolean) {
  const r = rng(7);
  const k = night ? 0.42 : 1;
  const walls = ['#c98a6b', '#b0705a', '#d9c7a0', '#7d8a96', '#a3b8a8', '#e2d39f', '#8f7a9a', '#c4a484'];
  const base = H - 3; // sidewalk below
  ctx.clearRect(0, 0, W, H);

  // back row: taller, flatter silhouettes for depth
  for (let x = -6; x < W;) {
    const w = 10 + Math.floor(r() * 14), h = Math.min(H - 2, 18 + Math.floor(r() * (H - 16)));
    rect(ctx, x, base - h, w, h, night ? '#262a33' : '#c9c1a6');
    for (let wy = base - h + 3; wy < base - 4; wy += 4) for (let wx = x + 2; wx < x + w - 2; wx += 3)
      rect(ctx, wx, wy, 1, 2, lit(r, night, 0.45, '#1b1e26', '#b3ab90'));
    x += w + Math.floor(r() * 3);
  }

  // front row
  const lamps: number[] = [];
  for (let x = -4; x < W;) {
    const w = 14 + Math.floor(r() * 14), h = Math.min(H - 4, 12 + Math.floor(r() * (H - 14)));
    const top = base - h, wall = walls[Math.floor(r() * walls.length)];
    box(ctx, x, top, w, h + 1, shade(wall, k));
    rect(ctx, x + 1, top + 1, w - 2, 1, shade(wall, k * 1.12 > 1 ? 1 : k * 1.12)); // top highlight
    // windows (upper floors)
    for (let wy = top + 3; wy < base - 7; wy += 5) for (let wx = x + 3; wx + 2 < x + w - 2; wx += 4) {
      rect(ctx, wx - 1, wy - 1, 4, 5, INK);
      rect(ctx, wx, wy, 2, 3, lit(r, night, 0.62, '#1d2130', '#5d7194'));
      if (!night) rect(ctx, wx, wy, 1, 1, '#8ad8d8');
    }
    // shop front with striped awning on some
    const shop = r() < 0.55;
    const doorX = x + 2 + Math.floor(r() * Math.max(1, w - 8));
    if (shop) {
      for (let i = 1; i < w - 1; i++) rect(ctx, x + i, base - 7, 1, 2, shade(Math.floor((i - 1) / 2) % 2 ? '#f4ebcd' : pick(r, ['#e66f46', '#e66f46', '#2b5615']), k));
      rect(ctx, x + 1, base - 5, w - 2, 1, INK);
      rect(ctx, x + 2, base - 4, w - 4, 4, night ? '#ffd877' : '#2e3138'); // shop window glow at night
      if (night) glow(ctx, x + w / 2, base - 2, Math.min(8, w / 2), 0.18);
    }
    rect(ctx, doorX, base - 5, 3, 5, INK); rect(ctx, doorX + 1, base - 4, 1, 4, shade('#715542', k));
    // roof bits
    const roof = r();
    if (roof < 0.3) { box(ctx, x + 3, top - 4, 5, 3, shade('#9aa0a6', k)); rect(ctx, x + 3, top - 1, 1, 1, INK); rect(ctx, x + 7, top - 1, 1, 1, INK); } // water tank
    else if (roof < 0.5) { rect(ctx, x + w - 4, top - 5, 1, 5, INK); rect(ctx, x + w - 6, top - 4, 5, 1, INK); if (night) rect(ctx, x + w - 4, top - 6, 1, 1, '#e66f46'); } // antenna
    if (r() < 0.5) lamps.push(x + w + 1);
    x += w + Math.floor(r() * 2);
  }

  // sidewalk + curb
  rect(ctx, 0, base, W, 1, INK);
  rect(ctx, 0, base + 1, W, 2, night ? '#4a4c50' : '#c9c5b8');
  for (let x = 0; x < W; x += 6) rect(ctx, x, base + 1, 1, 2, night ? '#3a3c40' : '#b2ad9e');

  // street lamps
  for (let x = 6; x < W; x += 34 + Math.floor(r() * 10)) {
    rect(ctx, x, base - 16, 1, 16, INK); rect(ctx, x, base - 16, 4, 1, INK);
    rect(ctx, x + 3, base - 15, 2, 1, night ? '#fff2b0' : '#9aa0a6');
    if (night) { glow(ctx, x + 4, base - 13, 7, 0.3); for (let j = 0; j < 12; j++) for (let i = -Math.floor(j / 2); i <= Math.floor(j / 2); i++) { ctx.fillStyle = 'rgba(255, 222, 110, .1)'; ctx.fillRect(x + 4 + i, base - 14 + j, 1, 1); } }
  }
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
  const h = 15, top = base - h;
  rect(ctx, x, top, w, h, INK);
  for (let px = x + 1; px < x + w - 1; px++) rect(ctx, px, top + 1, 1, h - 1, shade(px % 3 ? '#6b4a32' : '#5a3d28', k));
  for (let py = top + 4; py < base; py += 4) rect(ctx, x + 1, py, w - 2, 1, shade('#4a3222', k)); // plank seams
  // open front with a hanging lantern
  rect(ctx, x + 3, top + 4, 9, h - 4, night ? '#3a2a1a' : '#2a2620');
  rect(ctx, x + 7, top + 4, 1, 3, INK); rect(ctx, x + 6, top + 7, 3, 2, night ? '#ffe08a' : '#9aa0a6');
  if (night) glow(ctx, x + 7, top + 8, 10, 0.32);
  // crates
  box(ctx, x + w - 8, base - 5, 6, 5, shade('#a8742a', k));
  // lean-to corrugated roof with rust patches
  for (let i = -3; i < w + 3; i++) {
    const y = top - 5 + Math.floor((i + 3) / (w + 6) * 4);
    rect(ctx, x + i, y - 1, 1, 1, INK);
    rect(ctx, x + i, y, 1, 3, shade(i % 2 ? '#9aa0a6' : '#7b8186', k));
    if (r() < 0.18) rect(ctx, x + i, y + 1, 1, 1, shade('#a0603a', k));
  }
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
  let x = 8 + Math.floor(r() * 6);
  let n = 0;
  while (x < W + 40) {
    const kind = n % 4;
    if (kind === 0) { const w = 40 + Math.floor(r() * 10); stiltHouse(ctx, x, base, w, night, r); x += w + 16; }
    else if (kind === 1) { palm(ctx, x, base, Math.min(H - 6, 26 + Math.floor(r() * 10)), night); x += 18; }
    else if (kind === 2) { const w = 22 + Math.floor(r() * 6); shack(ctx, x, base, w, night, r); x += w + 12; }
    else {
      banana(ctx, x + 4, base, night); x += 14;
      for (let f = 0; f < 4; f++) rect(ctx, x + f * 3, base - 5, 1, 5, INK);
      rect(ctx, x, base - 4, 10, 1, INK); x += 16 + Math.floor(r() * 10);
    }
    n++;
  }
}
