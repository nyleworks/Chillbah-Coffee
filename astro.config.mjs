import { defineConfig } from 'astro/config';

// Static site. Set `site` to the real domain once it exists.
export default defineConfig({
  output: 'static',
  // Keep fonts as separate files instead of base64 inside the stylesheet: the stylesheet blocks the first paint,
  // so it should stay small, and the browser can cache the fonts on their own.
  vite: { build: { assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined) } },
});
