# Chillbah Coffee website

The site for Chillbah, a mobile coffee kiosk run from the back of a 4x4 Toyota Hilux in Sabah. Built from the Chillbah design system: cream ground, pixel type, hard black outlines and pixel-art scenes drawn on canvas.

## Stack

- [Astro](https://astro.build) 5, static output (no server needed). Deploy `dist/` to Netlify, Vercel, Cloudflare Pages or GitHub Pages.
- Plain CSS with design tokens (`src/styles/tokens.css`), day/night theme.
- Pixel art scenes and icons are drawn in code (`src/lib/`, `src/scripts/`). The Hilux and barista are image files in `public/`.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs dist/
npm run check    # checks the code for mistakes (types, missing imports) without building
```

## Where to edit

| What | File |
| --- | --- |
| Opening hours, Google Maps links, events (upcoming and past) | `src/data/events.ts` |
| Menu drinks (Coffee / Non-coffee pages), snacks, prices and HOT badges | `src/data/menu.ts` |
| Instagram, TikTok, Threads and WhatsApp links, page title, ticker words | `src/data/site.ts` |
| Colours, fonts, spacing | `src/styles/tokens.css` |
| Buttons, menu card, HOT badge | `src/styles/components.css` |
| Page sections | `src/components/*.astro` |
| Hero scene and sprites | `src/scripts/scene.ts`, `src/lib/sprites.ts` |
| Road-lane scenery (village, wedding, town, camp) | `src/lib/scenery.ts` |
| Scroll animation (awning fold, truck drives) | `src/scripts/story.ts` |
| Truck images (body, wheels, awning) | `public/*.webp`, laid out in `src/components/Truck.astro` |
| Reduce motion button | `src/lib/motion.ts` |

## Open items

- Instagram, TikTok, Threads and WhatsApp links are placeholders (`#`).
- Header font: Pixel Quest isn't bundled yet, so Pixelify Sans stands in. To use it, add the font file under `public/fonts/`, add an `@font-face` `src: url(...)` in `tokens.css`, and check its FontSpace licence allows commercial use.
