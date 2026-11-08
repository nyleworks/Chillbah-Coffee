// Day/night theme. The saved choice is applied early by an inline script in Base.astro.
const KEY = 'chillbah-theme';
const listeners: (() => void)[] = [];

export function isNight(): boolean {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
}

export function onThemeChange(fn: () => void) { listeners.push(fn); }

export function initThemeToggle(btn: HTMLElement | null) {
  btn?.addEventListener('click', () => {
    const next = isNight() ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch { /* storage blocked: still switches for this visit */ }
    listeners.forEach((fn) => fn());
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => listeners.forEach((fn) => fn()));
}

export const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue('--' + name).trim();
