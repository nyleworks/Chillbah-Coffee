// Reduce motion. The header button saves a choice ('reduce' or 'full'); with no saved choice the device setting decides.
// The inline script in Base.astro sets <html data-motion> before anything paints, so CSS can key off it too.
const KEY = 'chillbah-motion';
const SPOT = 'chillbah-motion-spot';

export const reduceMotion = () => document.documentElement.dataset.motion === 'reduce';

/** The button flips the choice and reloads, so every animation (scroll story, pins, smooth scroll) starts in the new mode.
 *  The section you were looking at is remembered so the page comes back to it. */
export function initMotionToggle(btn: HTMLElement | null) {
  if (!btn) return;
  btn.setAttribute('aria-pressed', String(reduceMotion()));
  btn.addEventListener('click', () => {
    const next = reduceMotion() ? 'full' : 'reduce';
    try {
      localStorage.setItem(KEY, next);
      const secs = [...document.querySelectorAll<HTMLElement>('main section[id], footer')];
      const here = secs.filter((s) => s.getBoundingClientRect().top < innerHeight * 0.5).pop();
      sessionStorage.setItem(SPOT, here?.id || '');
    } catch { /* storage blocked: the choice can't be kept, so just apply it for this view */
      document.documentElement.dataset.motion = next;
      return;
    }
    history.scrollRestoration = 'manual'; // we put you back on your section ourselves
    location.reload();
  });
  // Back after the reload: jump straight to where you were.
  try {
    const spot = sessionStorage.getItem(SPOT);
    if (spot !== null) {
      sessionStorage.removeItem(SPOT);
      const el = spot ? document.getElementById(spot) : null;
      const target = el?.closest<HTMLElement>('.pin-track') ?? el; // pinned sections: go to the start of their track
      const go = () => scrollTo({ top: target ? target.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 94) : 0, behavior: 'instant' as ScrollBehavior });
      // Images, fonts and the scroll story keep resizing the page for a moment, so follow the section until it settles
      // (or until you start scrolling yourself).
      const ro = new ResizeObserver(() => requestAnimationFrame(go));
      const stop = () => { ro.disconnect(); history.scrollRestoration = 'auto'; };
      ro.observe(document.body);
      requestAnimationFrame(go);
      setTimeout(stop, 2500);
      ['wheel', 'touchstart', 'keydown'].forEach((ev) => addEventListener(ev, stop, { once: true, passive: true }));
    }
  } catch { /* ignore */ }
}
