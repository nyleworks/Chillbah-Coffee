import { defineConfig } from 'astro/config';

// Static site, published to GitHub Pages at nyleworks.github.io/Chillbah-Coffee/ (see .github/workflows/pages.yml).
// If it moves to its own domain, change `site` and drop `base`.
export default defineConfig({
  output: 'static',
  site: 'https://nyleworks.github.io',
  base: '/Chillbah-Coffee',
  // Keep fonts as separate files instead of base64 inside the stylesheet: the stylesheet blocks the first paint,
  // so it should stay small, and the browser can cache the fonts on their own.
  vite: { build: { assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined) } },
});
