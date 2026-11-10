// Paints every pixel sprite on the page: menu icons, logo, header button icons, lane scenery, footer grass.
import { paint } from '../lib/pixel';
import { cup, food, flame, themeIcon, motionIcon, type CupKind, type FoodKind } from '../lib/sprites';
import { isNight } from './theme';
import { drawTown, drawVillage, drawWedding, drawCamp, setFlicker } from '../lib/scenery';
import { reduceMotion } from '../lib/motion';

const SCENES = { town: drawTown, village: drawVillage, wedding: drawWedding, camp: drawCamp };

export function drawArt() {
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-cup]').forEach((cv) =>
    paint(cv, cup(cv.dataset.cup as CupKind, cv.dataset.liquid || null)));
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-food]').forEach((cv) =>
    paint(cv, food(cv.dataset.food as FoodKind, cv.dataset.liquid || null)));
  const fl = flame();
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-flame]').forEach((cv) => paint(cv, fl));

  document.querySelectorAll<HTMLCanvasElement>('canvas[data-theme-icon]').forEach((cv) => paint(cv, themeIcon(isNight())));
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-motion-icon]').forEach((cv) => paint(cv, motionIcon(reduceMotion(), isNight() ? '#fff6dc' : '#2a2620')));

  document.querySelectorAll<HTMLCanvasElement>('canvas[data-grass]').forEach((cv) => {
    const ctx = cv.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (let x = 0; x < cv.width; x++) {
      const h = 3 + ((x * 7) % 5 === 0 ? 3 : (x * 3) % 4 === 0 ? 1 : 0);
      ctx.fillStyle = x % 6 < 3 ? '#7fae45' : '#66882d';
      ctx.fillRect(x, cv.height - h, 1, h);
    }
  });

  // Lane backdrops: one art pixel per 4 CSS px, sized to the lane so they run edge to edge. On phones (lane 600px or
  // narrower) one art pixel per 2 CSS px instead: the scene is "zoomed out", so about as much of it shows as on a laptop
  // (Niekki, 2026-11-10). The road-lane truck shrinks to match (RoadLane.astro).
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-scenery]').forEach((cv) => {
    const px = cv.clientWidth <= 600 ? 2 : 4;
    const w = Math.max(1, Math.round(cv.clientWidth / px)), h = Math.max(1, Math.round(cv.clientHeight / px));
    if (cv.width !== w) cv.width = w;
    if (cv.height !== h) cv.height = h;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    (SCENES[cv.dataset.scenery as keyof typeof SCENES] ?? drawVillage)(ctx, w, h, isNight());
  });
}

// Theme switch: repaint every sprite, then cross-fade each canvas from its old picture to the new one
// so section scenery (shop lights, house windows) and icons ease across instead of snapping.
// The header buttons (day/night, reduce motion) are left out: their icons switch straight away.
let fadeToken = 0;
export function drawArtFaded(dur = 1400) {
  const cvs = [...document.querySelectorAll<HTMLCanvasElement>('canvas[data-cup], canvas[data-food], canvas[data-grass], canvas[data-scenery]')];
  const snap = (cv: HTMLCanvasElement) => {
    const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
    if (cv.width && cv.height) c.getContext('2d')!.drawImage(cv, 0, 0);
    return c;
  };
  const olds = cvs.map(snap);
  drawArt();
  if (reduceMotion()) return;
  const news = cvs.map(snap);
  const token = ++fadeToken, start = performance.now();
  const step = (now: number) => {
    if (token !== fadeToken) return;
    const k = Math.min(1, Math.max(0, (now - start) / dur)), e = k * k * (3 - 2 * k);
    cvs.forEach((cv, i) => {
      const ctx = cv.getContext('2d'); if (!ctx || !cv.width || !cv.height) return;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.globalAlpha = 1; ctx.drawImage(news[i], 0, 0, cv.width, cv.height);
      if (k < 1 && olds[i].width) { ctx.globalAlpha = 1 - e; ctx.drawImage(olds[i], 0, 0, cv.width, cv.height); }
      ctx.restore();
    });
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  // Safety net: if the browser holds back animation frames (Safari can), finish on the new picture anyway.
  setTimeout(() => { if (token === fadeToken) step(start + dur); }, dur + 100);
}
/** Stop any running cross-fade (e.g. before a resize repaint). */
export function stopArtFade() { fadeToken++; }

// Campfire flicker: while the camp lane is on screen, redraw it a few times a second with the next flame frame.
// Waits out a theme cross-fade (which is painting the same canvas). Off under reduced motion.
export function initFireFlicker() {
  if (reduceMotion()) return;
  const cv = document.querySelector<HTMLCanvasElement>('canvas[data-scenery="camp"]'); if (!cv) return;
  let frame = 0, timer = 0, fadeSeen = fadeToken, quietUntil = 0;
  const tick = () => {
    if (fadeSeen !== fadeToken) { fadeSeen = fadeToken; quietUntil = performance.now() + 1500; }
    if (performance.now() < quietUntil) return;
    const ctx = cv.getContext('2d'); if (!ctx || !cv.width) return;
    setFlicker(++frame);
    drawCamp(ctx, cv.width, cv.height, isNight());
  };
  new IntersectionObserver(([e]) => {
    clearInterval(timer);
    if (e.isIntersecting) timer = window.setInterval(tick, 150);
  }).observe(cv);
}
