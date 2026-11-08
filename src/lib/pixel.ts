// Tiny pixel engine: sprites are drawn at 1px on a small grid, then shown scaled up
// with `image-rendering: pixelated`. Every sprite gets a 1px `line` outline.

export type Color = string | null;

export interface Grid {
  w: number;
  h: number;
  p: Color[];
  set(x: number, y: number, c: Color): void;
  get(x: number, y: number): Color;
  rect(x: number, y: number, rw: number, rh: number, c: Color): void;
  disc(cx: number, cy: number, r: number, c: Color): void;
  outline(c: Color): void;
  draw(ctx: CanvasRenderingContext2D, ox?: number, oy?: number): void;
}

export function Grid(w: number, h: number): Grid {
  const p: Color[] = new Array(w * h).fill(null);
  const g: Grid = {
    w, h, p,
    set(x, y, c) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < w && y < h) p[y * w + x] = c; },
    get(x, y) { return x >= 0 && y >= 0 && x < w && y < h ? p[y * w + x] : null; },
    rect(x, y, rw, rh, c) { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) g.set(x + i, y + j, c); },
    disc(cx, cy, r, c) { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * 0.6) g.set(cx + i, cy + j, c); },
    outline(c) {
      const add: [number, number][] = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
        if (!g.get(x, y) && (g.get(x + 1, y) || g.get(x - 1, y) || g.get(x, y + 1) || g.get(x, y - 1))) add.push([x, y]);
      add.forEach(([x, y]) => g.set(x, y, c));
    },
    draw(ctx, ox = 0, oy = 0) {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const c = p[y * w + x];
        if (c) { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, 1, 1); }
      }
    },
  };
  return g;
}

export function paint(cv: HTMLCanvasElement, g: Grid) {
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, cv.width, cv.height);
  g.draw(ctx);
}

/** Copy one grid into a bigger one at an offset. */
export function place(src: Grid, w: number, h: number, ox: number, oy: number): Grid {
  const g = Grid(w, h);
  src.p.forEach((v, i) => v && g.set(ox + (i % src.w), oy + ((i / src.w) | 0), v));
  return g;
}
