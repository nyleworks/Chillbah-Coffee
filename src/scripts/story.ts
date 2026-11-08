// Scroll story.
// Hero (pinned while you scroll its track): the barista steps to the tray and folds the awning,
// walks to the front door and gets in, then the Hilux drives off to the left.
// Road lanes: the Hilux drives across the menu (left→right) and Find us (right→left) sections,
// and rolls in from the left to park in the middle of the footer.
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

  // Road lanes. "pass" lanes sit at the bottom of a pinned section: once the section's bottom reaches the bottom of
  // the screen the page holds while the truck drives in from one edge and out the other, then scrolling carries on.
  // So each truck is gone before the next one shows up. The "arrive" lane (footer) rolls in and parks in the middle.
  const lanes = Array.from(document.querySelectorAll<HTMLElement>('.lane'));
  const pins = Array.from(document.querySelectorAll<HTMLElement>('.pin-track'));
  function sizePins() {
    const vh = innerHeight;
    for (const t of pins) {
      const sec = t.firstElementChild as HTMLElement | null; if (!sec) continue;
      const h = sec.offsetHeight;
      t.style.setProperty('--sec-h', h + 'px');
      t.style.setProperty('--pin-top', vh - h + 'px');
      t.style.setProperty('--pin', Math.round(vh * 0.9) + 'px');
    }
  }
  function roads() {
    const vh = innerHeight;
    for (const lane of lanes) {
      const truckEl = lane.querySelector<HTMLElement>('.lane-truck'); if (!truckEl) continue;
      const ltr = lane.dataset.dir === 'ltr';
      const half = lane.clientWidth / 2 + truckEl.offsetWidth / 2 + 8; // centre → just off the edge
      let x: number;
      if (lane.dataset.mode === 'arrive') {
        const host = (lane.parentElement ?? lane).getBoundingClientRect(); // the footer: parked once fully in view
        const q = clamp((vh - host.top) / Math.max(1, Math.min(host.height, vh)));
        const e = 1 - (1 - q) * (1 - q); // roll in and brake to a stop
        x = (1 - e) * half * (ltr ? -1 : 1);
      } else {
        const track = lane.closest<HTMLElement>('.pin-track'); if (!track) continue;
        const sec = track.firstElementChild as HTMLElement;
        const pin = track.offsetHeight - sec.offsetHeight;
        const q = clamp((vh - sec.offsetHeight - track.getBoundingClientRect().top) / Math.max(1, pin));
        x = (q * 2 - 1) * half * (ltr ? 1 : -1); // off one edge → off the other
      }
      truckEl.style.transform = `translateX(calc(-50% + ${x}px))${ltr ? ' scaleX(-1)' : ''}`;
    }
  }

  let queued = false;
  const update = () => { queued = false; hero(); roads(); };
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  sizeTrack(); sizePins(); update();
  const ro = new ResizeObserver(() => { sizePins(); request(); });
  pins.forEach((t) => t.firstElementChild && ro.observe(t.firstElementChild));
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { sizeTrack(); sizePins(); request(); });
}
