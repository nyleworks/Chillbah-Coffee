// Scroll story.
// Hero (pinned while you scroll its track): the barista steps to the tray and folds the awning,
// walks to the front door and gets in, then the Hilux drives off to the left.
// Footer: as it scrolls into view the same Hilux rolls in from the right and parks in the middle.
// The barista moves in whole scene pixels; the truck shakes as the engine starts, then glides smoothly.
// Off under reduced motion.

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** 0→1 progress of p inside [a, b]. */
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

export function initStory() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const track = document.getElementById('sceneTrack');
  const frame = document.getElementById('sceneFrame');
  const stage = document.getElementById('sceneStage');
  const truck = document.getElementById('heroTruck');
  const awning = document.getElementById('heroAwning');
  const barista = document.getElementById('barista');
  const footer = document.getElementById('siteFooter');
  const footerTruck = document.getElementById('footerTruck');
  if (!track || !frame || !stage || !truck || !awning || !barista) return;

  document.documentElement.classList.add('story');

  const sizeTrack = () => track.style.setProperty('--frame-h', frame.offsetHeight + 'px');

  function hero() {
    const fw = stage!.clientWidth, sp = fw / 180; // one scene pixel in CSS px (the stage can be wider than the screen)
    const snap = (v: number) => Math.round(v / sp) * sp;
    const stickyTop = parseFloat(getComputedStyle(frame!).top) || 0;
    const r = track!.getBoundingClientRect();
    const p = clamp((stickyTop - r.top) / Math.max(1, r.height - frame!.offsetHeight));

    // Barista: start 65% → tray 58% → front door 37%, then climbs in.
    const walk1 = seg(p, 0, 0.12), walk2 = seg(p, 0.42, 0.62), getIn = seg(p, 0.62, 0.7);
    const xPct = 65 - 7 * walk1 - 21 * walk2;
    const dx = snap(((xPct - 65) / 100) * fw);
    const walking = (walk1 > 0 && walk1 < 1) || (walk2 > 0 && walk2 < 1);
    const folding = p > 0.12 && p < 0.42;
    const stepBob = walking ? (Math.floor(Math.abs(dx) / (sp * 2)) % 2) * sp : 0;
    const workBob = folding ? (Math.floor(p * 120) % 2) * sp : 0;
    const face = walk2 > 0 ? -1 : 1; // turn left to walk to the door
    const inStep = Math.floor(getIn * 3) / 3; // fade in 3 steps
    barista!.style.transform = `translate(${dx}px, ${-(stepBob + workBob + snap(inStep * sp * 3))}px) scaleX(${face})`;
    barista!.style.opacity = String(1 - inStep);

    // Awning folds toward its bag on the cab roof, in 6 chunky steps.
    const k = Math.floor(seg(p, 0.14, 0.4) * 6) / 6;
    awning!.style.transform = `scale(${1 - 0.95 * k}, ${1 - 0.75 * k})`;
    awning!.style.opacity = k >= 1 ? '0' : '1';

    // Engine starts: the truck idles with a shake once the barista is in, then pulls away smoothly.
    truck!.classList.toggle('idling', p >= 0.7 && p < 0.8);
    const d = seg(p, 0.8, 1);
    const ease = d * d * (3 - 2 * d); // smoothstep: gentle start, steady exit
    const exit = stage!.offsetLeft + truck!.offsetLeft + truck!.offsetWidth + 0.03 * fw; // distance to clear the left edge
    const tx = -ease * exit;
    truck!.style.transform = `translateX(${tx}px)`;
  }

  function foot() {
    if (!footer || !footerTruck) return;
    const vh = innerHeight, r = footer.getBoundingClientRect();
    const q = clamp((vh - r.top) / Math.max(1, Math.min(r.height, vh)));
    const lane = footer.clientWidth, tw = footerTruck.offsetWidth;
    const e = 1 - (1 - q) * (1 - q); // roll in and brake to a stop
    const start = lane / 2 + tw / 2 + 8; // just past the right edge
    const x = (1 - e) * start;
    footerTruck.style.transform = `translateX(calc(-50% + ${x}px))`;
  }

  let queued = false;
  const update = () => { queued = false; hero(); foot(); };
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  sizeTrack(); update();
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { sizeTrack(); request(); });
}
