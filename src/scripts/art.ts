// Paints every pixel sprite on the page: menu icons, inline icons, logo, theme icon, footer grass.
import { paint } from '../lib/pixel';
import { cup, icons, themeIcon, type CupKind, type IconName } from '../lib/sprites';
import { css, isNight } from './theme';
import { drawTown, drawVillage } from '../lib/scenery';

export function drawArt() {
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-cup]').forEach((cv) =>
    paint(cv, cup(cv.dataset.cup as CupKind, cv.dataset.liquid || null)));

  document.querySelectorAll<HTMLCanvasElement>('canvas[data-icon]').forEach((cv) =>
    paint(cv, icons[cv.dataset.icon as IconName](css('ember'))));

  document.querySelectorAll<HTMLCanvasElement>('canvas[data-theme-icon]').forEach((cv) => paint(cv, themeIcon(isNight())));

  document.querySelectorAll<HTMLCanvasElement>('canvas[data-grass]').forEach((cv) => {
    const ctx = cv.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (let x = 0; x < cv.width; x++) {
      const h = 3 + ((x * 7) % 5 === 0 ? 3 : (x * 3) % 4 === 0 ? 1 : 0);
      ctx.fillStyle = x % 6 < 3 ? '#7fae45' : '#66882d';
      ctx.fillRect(x, cv.height - h, 1, h);
    }
  });

  // Lane backdrops: one art pixel per 4 CSS px, sized to the lane so they run edge to edge.
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-scenery]').forEach((cv) => {
    const w = Math.max(1, Math.round(cv.clientWidth / 4)), h = Math.max(1, Math.round(cv.clientHeight / 4));
    if (cv.width !== w) cv.width = w;
    if (cv.height !== h) cv.height = h;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    (cv.dataset.scenery === 'town' ? drawTown : drawVillage)(ctx, w, h, isNight());
  });
}

// Theme switch: repaint every sprite, then cross-fade each canvas from its old picture to the new one
// so section scenery (shop lights, house windows) and icons ease across instead of snapping.
let fadeToken = 0;
export function drawArtFaded(dur = 1400) {
  const cvs = [...document.querySelectorAll<HTMLCanvasElement>('canvas[data-cup], canvas[data-icon], canvas[data-theme-icon], canvas[data-grass], canvas[data-scenery]')];
  const snap = (cv: HTMLCanvasElement) => {
    const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
    if (cv.width && cv.height) c.getContext('2d')!.drawImage(cv, 0, 0);
    return c;
  };
  const olds = cvs.map(snap);
  drawArt();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const news = cvs.map(snap);
  const token = ++fadeToken, start = performance.now();
  const step = (now: number) => {
    if (token !== fadeToken) return;
    const k = Math.min(1, (now - start) / dur), e = k * k * (3 - 2 * k);
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
}
/** Stop any running cross-fade (e.g. before a resize repaint). */
export function stopArtFade() { fadeToken++; }
