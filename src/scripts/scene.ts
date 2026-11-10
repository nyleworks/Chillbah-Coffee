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

// Jetty scene (Niekki, 2026-11-10, after a drone shot of Jesselton Point): the truck parks on a pier over the sea,
// with hilly islands on the horizon. Same sky, sun and moon as the mountain scene. Horizon at y 86.
const HORIZON = 86;
const islands = [
  [[10, 86], [20, 79], [32, 75], [44, 71], [56, 73], [68, 67], [82, 70], [96, 76], [110, 82], [124, 86]], // big one behind the sun
  [[166, 86], [172, 83], [184, 81], [194, 82], [204, 86]], // flat islet
  [[232, 86], [246, 78], [262, 73], [278, 77], [292, 82], [304, 86]], // wide screens only, from here out
  [[-96, 86], [-86, 82], [-68, 80], [-56, 83], [-48, 86]],
  [[330, 86], [340, 83], [356, 82], [366, 86]],
  [[-170, 86], [-156, 78], [-140, 75], [-124, 80], [-112, 86]],
];
const islandTop = (pts: number[][], x: number) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    if (x >= x1 && x <= x2) return Math.round(y1 + ((y2 - y1) * (x - x1)) / (x2 - x1) + ((x * 5) % 3 === 0 ? -1 : 0));
  }
  return 999;
};
export type SceneName = 'hills' | 'jetty';

/** The scene change, pixel style: the picture breaks up into chunky blocks (1 → 8 px and back), and mid-way the
 *  blocks flip from the old scene to the new one in a scattered checker, like an old console loading a level. */
const BLOCKS = [1, 2, 3, 4, 6, 8];
function pixelSwap(a: ImageData, b: ImageData, p: number) {
  const w = a.width, h = a.height, out = new ImageData(w, h);
  const size = BLOCKS[Math.min(BLOCKS.length - 1, Math.round(Math.sin(Math.PI * p) * (BLOCKS.length - 1)))];
  const k = Math.min(1, Math.max(0, (p - 0.3) / 0.4)); // share of cells already showing the new scene
  const cell = 8;
  for (let y = 0; y < h; y++) {
    const sy = y - (y % size);
    for (let x = 0; x < w; x++) {
      const sx = x - (x % size);
      const cx = (sx / cell) | 0, cy = (sy / cell) | 0;
      const r = (((cx * 73856093) ^ (cy * 19349663)) >>> 0) % 997 / 997; // fixed scatter order per cell
      const src = r < k ? b : a, i = (sy * w + sx) * 4, o = (y * w + x) * 4;
      out.data[o] = src.data[i]; out.data[o + 1] = src.data[i + 1]; out.data[o + 2] = src.data[i + 2]; out.data[o + 3] = 255;
    }
  }
  return out;
}
const SCENE_KEY = 'chillbah-scene';
const savedScene = (): SceneName => { try { return localStorage.getItem(SCENE_KEY) === 'jetty' ? 'jetty' : 'hills'; } catch { return 'hills'; } };

export function initScene(canvas: HTMLCanvasElement | null) {
  const sx = canvas?.getContext('2d');
  if (!canvas || !sx) return { setNight(_n: boolean) {}, setScene(_s: SceneName) {}, scene: (): SceneName => 'hills' };
  const cv: HTMLCanvasElement = canvas; // non-null from here on, also inside the hoisted helpers below
  const reduce = reduceMotion();
  const p1 = pine(12, '#2b5615', '#244a12'), p2 = pine(9, '#4f7a2c', '#2b5615');
  p1.outline('#12120d'); p2.outline('#12120d');
  const sign = Grid(10, 14); sign.rect(1, 0, 8, 9, '#2a2620'); sign.rect(2, 2, 6, 1, '#e66f46'); sign.rect(2, 4, 5, 1, '#f4ebcd'); sign.rect(2, 6, 4, 1, '#f4ebcd'); sign.rect(1, 9, 1, 4, '#715542'); sign.rect(8, 9, 1, 4, '#715542'); sign.outline('#12120d');
  const stool = Grid(8, 9); stool.rect(0, 0, 8, 2, '#e66f46'); stool.rect(1, 2, 1, 6, '#715542'); stool.rect(6, 2, 1, 6, '#715542'); stool.outline('#12120d');
  const icedCup = cup('iced', '#a8742a');
  // jetty props: a lamp post, a little speedboat and a ferry far out
  const boat = Grid(16, 6); boat.rect(5, 0, 5, 2, '#e8e4d8'); boat.rect(6, 0, 3, 1, '#4f7fa8'); boat.rect(1, 2, 14, 2, '#f4f0e4'); boat.rect(2, 4, 12, 1, '#e66f46'); boat.set(0, 2, '#f4f0e4'); boat.outline('#12120d');
  const boat2 = Grid(14, 6); boat2.rect(4, 0, 4, 2, '#e8e4d8'); boat2.set(5, 0, '#4f7fa8'); boat2.rect(1, 2, 12, 2, '#f4f0e4'); boat2.rect(2, 4, 10, 1, '#2f7d6a'); boat2.set(13, 2, '#f4f0e4'); boat2.outline('#12120d');
  // a wooden sampan moored under the pier (phones show the water below the deck; see measure())
  const sampan = Grid(26, 9);
  sampan.rect(7, 0, 10, 1, '#3d6f9a'); sampan.rect(6, 1, 12, 3, '#4f86b4'); sampan.rect(7, 2, 10, 1, '#3d6f9a'); // canopy
  sampan.rect(7, 4, 1, 1, '#5a3a22'); sampan.rect(16, 4, 1, 1, '#5a3a22');
  sampan.rect(1, 5, 24, 2, '#a0703f'); sampan.set(0, 4, '#a0703f'); sampan.set(25, 4, '#a0703f'); sampan.rect(2, 7, 22, 1, '#7a5030'); sampan.rect(1, 5, 24, 1, '#e66f46');
  sampan.outline('#12120d');
  const ferry = Grid(14, 5); ferry.rect(3, 0, 8, 2, '#f4f0e4'); ferry.rect(4, 0, 6, 1, '#7d93a8'); ferry.rect(1, 2, 12, 2, '#e8e4d8'); ferry.outline('#3f5a6e');
  let frame = 0;
  // Which scene is showing, and the change between them: `wipe` runs 0 → 1 during the pixel swap.
  let scene: SceneName = savedScene(), prev: SceneName = scene, wipe = 1, wipeAnim = 0;

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
  let cut = 0, cutTop = 0, ox = 0, below = 0;
  const measure = () => {
    const stageEl = canvas.parentElement; if (!stageEl) return;
    const px = stageEl.clientWidth / 180 || 1;
    // Phones lift the art above a strip at the bottom of the hero (Hero.astro): grow the canvas down over it, so the
    // grass carries on under the mountain and the jetty shows the water under the pier.
    const lifted = frameEl ? frameEl.clientHeight - (stageEl.offsetTop + stageEl.offsetHeight) : 0;
    below = lifted > 1 ? Math.ceil(lifted / px) : 0;
    if (canvas.height !== 106 + below) canvas.height = 106 + below;
    canvas.style.height = below ? `${(106 + below) * px}px` : '';
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
    const H = 130 + below; // world rows down to the bottom of the canvas (it starts at world y 18)
    // World x 40 is the art's left edge; L..R is the world span the canvas shows (wider than the art on wide screens).
    const L = Math.floor(40 - ox), R = Math.ceil(40 - ox + cv.width), W = R - L;
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
    // The land under the sky. Mid-switch, both scenes are painted and blended pixel-style (see pixelSwap).
    const sunX = (t < 0.5 ? 53 : 55) + skyX, sunY = t < 0.5 ? 29 + skyY + Math.round(ease(t / 0.5) * 80) : 29 + skyY + Math.round((1 - ease((t - 0.5) / 0.5)) * 80);
    const land = (name: SceneName) => (name === 'jetty' ? drawJetty(ctx, L, R, W, H, sunX, sunY) : drawHills(ctx, L, R, W, H));
    if (wipe >= 1 || prev === scene) land(scene);
    else {
      const cw = cv.width, ch = cv.height;
      const skyImg = ctx.getImageData(0, 0, cw, ch);
      land(prev); const a = ctx.getImageData(0, 0, cw, ch);
      ctx.putImageData(skyImg, 0, 0);
      land(scene); const b = ctx.getImageData(0, 0, cw, ch);
      ctx.putImageData(pixelSwap(a, b, wipe), 0, 0);
    }
    const ground = scene === 'jetty' ? mix('#2f7f98', '#16233a') : mix('#7fae45', '#4c5f2c');
    if (frameEl && ground !== lastGround) { frameEl.style.setProperty('--ground', ground); lastGround = ground; } // phones extend the ground below the art (Hero.astro)
  }

  function drawHills(ctx: CanvasRenderingContext2D, L: number, R: number, W: number, H: number) {
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
    ctx.fillStyle = mix('#7fae45', '#4c5f2c'); ctx.fillRect(L, 92, W, H - 92);
    ctx.fillStyle = mix('#66882d', '#3a4a22');
    const span = Math.max(32, H - 98), tufts = Math.round(90 * span / 32); // more rows of tufts when phones show grass below the art
    for (let x0 = Math.floor(L / 240) * 240; x0 < R; x0 += 240) for (let i = 0; i < tufts; i++) { const x = x0 + ((i * 37) % 240), y = 95 + ((i * 11) % span); ctx.fillRect(x, y, 1, 2); ctx.fillRect(x + 1, y + 1, 1, 1); }
    ctx.fillStyle = mix('#c9a27a', '#5a4632'); ctx.fillRect(L, 108, W, 6);
    ctx.fillStyle = mix('#b08560', '#4a3a2a'); for (let x = Math.floor(L / 9) * 9; x < R; x += 9) ctx.fillRect(x, 110, 4, 1);
    ctx.fillStyle = '#12120d'; ctx.fillRect(L, 92, W, 1);
    sign.draw(ctx, 70, 96);
    stool.draw(ctx, 172, 99); stool.draw(ctx, 186, 101);
    icedCup.draw(ctx, 198, 94);
  }

  // The jetty: sea to the horizon with islands, the sun's (or moon's) glitter on the water, a concrete pier with a
  // railing along its far edge, a lamp post and the ferry terminal's shed off to the right, piles down into the water.
  function drawJetty(ctx: CanvasRenderingContext2D, L: number, R: number, W: number, H: number, sunX: number, sunY: number) {
    // sea, in three bands that darken towards the viewer
    const bands: [number, string][] = [[HORIZON, mix('#6fb8c4', '#2a3a58')], [92, mix('#4f9fb4', '#22314c')], [100, mix('#3d8ca6', '#1c2a42')], [110, mix('#2f7f98', '#16233a')]];
    bands.forEach(([y, c], i) => { ctx.fillStyle = c; ctx.fillRect(L, y, W, (bands[i + 1]?.[0] ?? H) - y); });
    // islands, hazy, with a dark outline on top like the mountain
    const isl = mix('#5b8577', '#25344c'), islDark = mix('#4a7466', '#1e2b40');
    islands.forEach((pts) => {
      const x0 = Math.max(L, pts[0][0]), x1 = Math.min(R, pts[pts.length - 1][0]);
      for (let x = x0; x < x1; x++) {
        const h = islandTop(pts, x); if (h >= HORIZON) continue;
        ctx.fillStyle = isl; ctx.fillRect(x, h, 1, HORIZON - h);
        ctx.fillStyle = islDark; if ((x * 7) % 5 === 0) ctx.fillRect(x, h + 2 + (x % 3), 1, 2); // treetop texture
        ctx.fillStyle = '#12120d'; ctx.fillRect(x, h, 1, 1);
      }
    });
    // the islands' shadow line on the water
    ctx.fillStyle = mix('#5a9fae', '#24344e'); ctx.fillRect(L, HORIZON, W, 1);
    // glitter: little dashes drifting along the water
    ctx.fillStyle = mix('#a8dcdc', '#3c5070');
    for (let x0 = Math.floor(L / 120) * 120; x0 < R; x0 += 120) for (let i = 0; i < 26; i++) {
      const y = HORIZON + 3 + ((i * 13) % 34), len = 2 + (i % 3) + (y > 100 ? 1 : 0);
      ctx.fillRect(x0 + ((i * 47 + (frame >> 1) * (i % 2 ? 1 : -1)) % 120 + 120) % 120, y, len, 1);
    }
    // the sun's (or moon's) path of light on the water, under wherever it hangs; it fades as it sets
    const lit = t < 0.5 ? Math.max(0, 1 - Math.max(0, sunY - 40) / 40) : Math.max(0, 1 - Math.max(0, sunY - 40) / 40) * 0.8;
    if (lit > 0.05) {
      ctx.fillStyle = t < 0.5 ? `rgba(242,201,76,${lit.toFixed(2)})` : `rgba(244,235,205,${lit.toFixed(2)})`;
      for (let y = HORIZON + 1, i = 0; y < 104; y += 2, i++) {
        const w = 2 + Math.round((y - HORIZON) / 5), wob = ((i + (frame >> 2)) % 3) - 1;
        ctx.fillRect(sunX - (w >> 1) + wob, y, w - ((i + frame) % 2), 1);
      }
    }
    // boats bobbing on the swell
    const bob = (n: number) => (((frame >> 3) + n) % 4 < 2 ? 0 : 1);
    ferry.draw(ctx, 176, HORIZON + 1 + bob(1));
    for (let x0 = Math.floor((L - 60) / 260) * 260; x0 < R; x0 += 260) {
      boat.draw(ctx, x0 + 37, 89 + bob(0)); if (x0) boat2.draw(ctx, x0 + 4, 92 + bob(2));
    }
    // ferry terminal shed on the pier, right of the stools (only part of it shows unless the screen is wide)
    const wall = mix('#e8e4d8', '#5a5f6c'), roof = mix('#8fa6b8', '#3c4a60'), roofDark = mix('#6f8698', '#2e3a4e');
    ctx.fillStyle = wall; ctx.fillRect(212, 84, 90, 18);
    ctx.fillStyle = mix('#5a6878', '#1c2333'); for (let x = 218; x < 300; x += 12) ctx.fillRect(x, 90, 6, 6); // windows
    if (t > 0.5) { ctx.fillStyle = `rgba(242,201,76,${((t - 0.5) * 2).toFixed(2)})`; for (let x = 218; x < 300; x += 12) ctx.fillRect(x, 90, 6, 6); } // lit at night
    ctx.fillStyle = roof; ctx.fillRect(208, 78, 98, 6);
    ctx.fillStyle = roofDark; ctx.fillRect(208, 83, 98, 1); for (let x = 210; x < 306; x += 4) ctx.fillRect(x, 79, 1, 4);
    ctx.fillStyle = '#12120d'; ctx.fillRect(208, 77, 98, 1); ctx.fillRect(207, 77, 1, 7); ctx.fillRect(306, 77, 1, 7); ctx.fillRect(212, 84, 1, 18);
    // pier deck: far edge railing, then the deck the truck stands on, its front face and the piles
    const deckTop = 100, deckFront = 118; // deep enough that the awning poles (down to about y 117) stand on it
    ctx.fillStyle = mix('#bdb6a4', '#55524a'); ctx.fillRect(L, deckTop, W, deckFront - deckTop);
    ctx.fillStyle = mix('#a9a28f', '#4a4740'); for (let x = Math.floor(L / 16) * 16; x < R; x += 16) ctx.fillRect(x, deckTop + 1, 1, deckFront - deckTop - 1); // slab joints
    ctx.fillStyle = mix('#cfc8b6', '#625e55'); ctx.fillRect(L, deckTop, W, 1);
    // railing (posts every 8 px, two rails)
    const rail = mix('#e8e4d8', '#7a7a74');
    ctx.fillStyle = '#12120d'; ctx.fillRect(L, 93, W, 1);
    ctx.fillStyle = rail; ctx.fillRect(L, 94, W, 1); ctx.fillRect(L, 97, W, 1);
    for (let x = Math.floor(L / 8) * 8; x < R; x += 8) { ctx.fillStyle = rail; ctx.fillRect(x, 94, 1, 6); ctx.fillStyle = '#12120d'; ctx.fillRect(x + 1, 95, 1, 5); }
    // front face, piles, foam
    ctx.fillStyle = '#12120d'; ctx.fillRect(L, deckFront, W, 1);
    ctx.fillStyle = mix('#7a7466', '#34322e'); ctx.fillRect(L, deckFront + 1, W, 3);
    ctx.fillStyle = '#12120d'; ctx.fillRect(L, deckFront + 4, W, 1);
    // Under the deck (only phones see this far down): the pier's shadow on the water, the piles standing in it with foam
    // at the waterline and wobbly reflections, slow rows of ripples, the sun's or moon's glitter, and a moored sampan.
    const water = deckFront + 12;
    if (H > water) {
      ctx.fillStyle = mix('#2f7f98', '#16233a'); ctx.fillRect(L, deckFront + 5, W, H - deckFront - 5);
      ctx.fillStyle = mix('#1f6680', '#101a2c'); ctx.fillRect(L, deckFront + 5, W, water - deckFront - 5); // shade under the deck
      ctx.fillStyle = mix('#5aa8bc', '#2a3c5c');
      for (let y = water + 3, r = 0; y < H; y += 4 + (r % 2), r++) {
        const drift = (frame >> 2) * (r % 2 ? 1 : -1);
        for (let x0 = Math.floor(L / 23) * 23; x0 < R; x0 += 23) ctx.fillRect(x0 + (((r * 9 + drift) % 23) + 23) % 23, y, 3 + (r % 3), 1);
      }
      if (lit > 0.05) {
        ctx.fillStyle = t < 0.5 ? `rgba(242,201,76,${(lit * 0.8).toFixed(2)})` : `rgba(244,235,205,${(lit * 0.7).toFixed(2)})`;
        for (let y = water + 2, i = 0; y < H; y += 3, i++) ctx.fillRect(sunX - 3 + (((i + (frame >> 2)) % 3) - 1) * 2, y, 3 + (i % 3), 1);
      }
    }
    const pileH = Math.max(0, Math.min(H, water) - deckFront - 5);
    for (let x = Math.floor(L / 14) * 14 + 4; x < R; x += 14) {
      ctx.fillStyle = mix('#6a6458', '#2c2a26'); ctx.fillRect(x, deckFront + 5, 3, pileH);
      ctx.fillStyle = '#12120d'; ctx.fillRect(x + 3, deckFront + 5, 1, pileH);
      if (H > water) {
        ctx.fillStyle = mix('#245f74', '#0e1828'); // reflection, breaking up as it goes down
        for (let k = 0; k < 7; k++) ctx.fillRect(x + ((k + (frame >> 2)) % 2), water + 1 + k * 2, 3 - (k >> 2), 1);
      }
      ctx.fillStyle = mix('#d8eeee', '#4a5a78'); ctx.fillRect(x - 1 + ((frame >> 3) % 2), water, 5, 1); // foam round the pile
    }
    if (H > water + 10) {
      const by = water + 6 + bob(3), bx = 108;
      ctx.fillStyle = mix('#c9a27a', '#6a5a48'); // mooring rope from the pile to the bow
      for (let i = 0; i <= 6; i++) ctx.fillRect(105 + i, water - 4 + Math.round((by + 5 - (water - 4)) * i / 6), 1, 1);
      ctx.fillStyle = mix('#1f6680', '#101a2c'); ctx.fillRect(bx + 1, by + 9, 24, 1); // its shadow on the water
      sampan.draw(ctx, bx, by);
      if (t > 0.5) { ctx.fillStyle = `rgba(242,201,76,${((t - 0.5) * 2).toFixed(2)})`; ctx.fillRect(bx + 11, by + 2, 2, 1); } // lantern at night
    }
    // lamp post (lit at night)
    ctx.fillStyle = '#12120d'; ctx.fillRect(56, 70, 3, 33); ctx.fillRect(53, 68, 9, 3);
    ctx.fillStyle = mix('#7d93a8', '#4a5468'); ctx.fillRect(57, 71, 1, 31);
    ctx.fillStyle = t > 0.5 ? '#f2c94c' : mix('#f4f0e4', '#f2c94c'); ctx.fillRect(54, 71, 7, 1);
    if (t > 0.5) { ctx.fillStyle = `rgba(242,201,76,${((t - 0.5) * 0.22).toFixed(2)})`; ctx.fillRect(51, 101, 13, 17); ctx.fillRect(48, 104, 19, 11); } // pool of light on the deck
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
  /** Switch between the mountain and the jetty with the pixel swap (instant under reduced motion). */
  function setScene(next: SceneName) {
    if (next === scene && wipe >= 1) return;
    try { localStorage.setItem(SCENE_KEY, next); } catch { /* storage blocked: just switch for this view */ }
    cancelAnimationFrame(wipeAnim);
    prev = wipe >= 1 || wipe > 0.5 ? scene : prev;
    scene = next;
    if (reduce || prev === scene) { wipe = 1; draw(); return; }
    wipe = 0;
    const start = performance.now(), dur = 1100, tick = 70; // stepped frames, like the rest of the scene
    const step = (now: number) => {
      wipe = Math.min(1, Math.floor((now - start) / tick) * tick / dur); draw();
      if (wipe < 1) wipeAnim = requestAnimationFrame(step);
    };
    wipeAnim = requestAnimationFrame(step);
  }
  return { setNight, setScene, scene: () => scene };
}
