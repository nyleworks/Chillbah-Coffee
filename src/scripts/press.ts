// Click animation for every button: the button squashes down and pops back (CSS .is-pressed in components.css),
// and a little burst of square pixel sparks flies out from where it was tapped. Off under reduced motion.
import { reduceMotion } from '../lib/motion';
const COLORS = ['var(--ember)', 'var(--forest)', 'var(--sun, #f2c14e)', 'var(--line)'];

export function initPress() {
  if (reduceMotion()) return;
  document.addEventListener('pointerdown', (e) => {
    const btn = (e.target as Element).closest<HTMLElement>('button, .cb-btn, #navLinks a');
    if (!btn || btn.matches('[disabled], [aria-disabled]')) return;
    btn.classList.remove('is-pressed'); void btn.offsetWidth; btn.classList.add('is-pressed');
    btn.addEventListener('animationend', () => btn.classList.remove('is-pressed'), { once: true });
    burst(e.clientX, e.clientY);
  }, { passive: true });
}

function burst(x: number, y: number) {
  const n = 8;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    const size = i % 2 ? 6 : 8;
    s.style.cssText = `position:fixed;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;background:${COLORS[i % COLORS.length]};pointer-events:none;z-index:9999`;
    document.body.append(s);
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
    const d = 34 + Math.random() * 18;
    const dx = Math.round(Math.cos(a) * d / 2) * 2, dy = Math.round(Math.sin(a) * d / 2) * 2; // even steps keep it on the pixel grid
    s.animate(
      [{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 1, offset: 0.7 }, { transform: `translate(${dx}px,${dy + 6}px)`, opacity: 0 }],
      { duration: 480, easing: 'steps(6, start)' },
    ).onfinish = () => s.remove();
  }
}
