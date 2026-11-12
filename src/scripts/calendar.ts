// Fills every [data-calendar] month grid (see Calendar.astro). Starts on the current month; ◀ ▶ move a month.
// Event days (every day of a multi-day event) are marked; tapping one opens a popup listing that day's events.
import { when } from '../lib/dates';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

type Ev = { date: string; end?: string; name: string; place?: string };

export function initCalendars() {
  const now = new Date();
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());

  document.querySelectorAll<HTMLElement>('[data-calendar]').forEach((root) => {
    const grid = root.querySelector<HTMLElement>('.cal-grid')!;
    const label = root.querySelector<HTMLElement>('.cal-month')!;
    const card = root.closest<HTMLElement>('[data-cal-card]');
    let y = now.getFullYear(), m = now.getMonth();

    const events: Ev[] = JSON.parse(root.dataset.cal || '[]');
    const last = (e: Ev) => e.end || e.date;
    const on = (key: string) => events.filter((e) => e.date <= key && key <= last(e));
    const pop = card?.querySelector<HTMLDialogElement>('[data-event-pop]');

    // Fills a list with events as text, never as HTML.
    function fill(list: HTMLElement, items: Ev[], empty: string) {
      list.replaceChildren();
      if (!items.length) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = empty; list.append(li); return; }
      for (const e of items) {
        const li = document.createElement('li');
        const d = document.createElement('span'); d.className = 'label'; d.textContent = when(e.date, e.end);
        const b = document.createElement('b'); b.textContent = e.name;
        li.append(d, b);
        if (e.place) { const s = document.createElement('small'); s.textContent = e.place; li.append(s); }
        if (last(e) < todayIso) li.classList.add('done');
        list.append(li);
      }
    }

    function listEvents() {
      const list = card?.querySelector<HTMLElement>('[data-event-list]'); if (!list) return;
      const first = iso(y, m, 1), end = iso(y, m, new Date(y, m + 1, 0).getDate());
      const items = events.filter((e) => e.date <= end && last(e) >= first).sort((a, b) => a.date.localeCompare(b.date));
      fill(list, items, 'No events this month yet.');
    }

    function showDay(key: string) {
      if (!pop) return;
      pop.querySelector('[data-pop-date]')!.textContent = when(key);
      fill(pop.querySelector<HTMLElement>('[data-pop-list]')!, on(key), '');
      pop.showModal();
    }

    function render() {
      label.textContent = `${MONTHS[m]} ${y}`;
      grid.querySelectorAll('.cal-day').forEach((n) => n.remove());
      const first = (new Date(y, m, 1).getDay() + 6) % 7; // Monday first
      const days = new Date(y, m + 1, 0).getDate();
      for (let i = 0; i < first; i++) { const b = document.createElement('div'); b.className = 'cal-day blank'; grid.append(b); }
      for (let d = 1; d <= days; d++) {
        const key = iso(y, m, d);
        const evs = on(key);
        const el = document.createElement(evs.length ? 'button' : 'div');
        el.className = 'cal-day';
        el.textContent = String(d);
        if (key === todayIso) el.classList.add('today');
        if (key < todayIso) el.classList.add('past');
        if (evs.length) {
          (el as HTMLButtonElement).type = 'button';
          el.classList.add('event');
          el.setAttribute('aria-label', `${when(key)}: ${evs.map((e) => e.name).join(', ')}`);
          el.addEventListener('click', () => showDay(key));
        }
        grid.append(el);
      }
      listEvents();
    }

    root.querySelector('[data-prev]')?.addEventListener('click', () => { m--; if (m < 0) { m = 11; y--; } render(); });
    root.querySelector('[data-next]')?.addEventListener('click', () => { m++; if (m > 11) { m = 0; y++; } render(); });
    // A tap on the dark backdrop closes the popup: closedby="any" does it natively (Events.astro). Fallback for Safari:
    // only close when the tap lands outside the popup box (taps on its padding also target the dialog itself).
    if (pop && !('closedBy' in HTMLDialogElement.prototype)) {
      pop.addEventListener('click', (e) => {
        if (e.target !== pop) return;
        const r = pop.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) pop.close();
      });
    }
    render();
  });
}
