// Day/night theme. The saved choice is applied early by an inline script in Base.astro.
const KEY = 'chillbah-theme';
const listeners: (() => void)[] = [];

export function isNight(): boolean {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
}

export function onThemeChange(fn: () => void) { listeners.push(fn); }

// Turn on the page-wide colour transition *before* the theme flips, so every section fades across.
let fadeTimer = 0;
function startFade() {
  const root = document.documentElement;
  root.classList.add('theme-fade');
  void getComputedStyle(root).color; // apply the transition rules before colours change
  clearTimeout(fadeTimer);
  fadeTimer = window.setTimeout(() => root.classList.remove('theme-fade'), 1600);
}

export function initThemeToggle(btn: HTMLElement | null) {
  btn?.addEventListener('click', () => {
    const next = isNight() ? 'light' : 'dark';
    startFade();
    // Picking what the device already uses means "back to the device setting": forget the choice instead of pinning it.
    const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const root = document.documentElement;
    if (next === system) delete root.dataset.theme; else root.dataset.theme = next;
    try { if (next === system) localStorage.removeItem(KEY); else localStorage.setItem(KEY, next); } catch { /* storage blocked: still switches for this visit */ }
    listeners.forEach((fn) => fn());
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { startFade(); listeners.forEach((fn) => fn()); });
}

export const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue('--' + name).trim();
