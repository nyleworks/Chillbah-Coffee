// Fills every [data-calendar] month grid (see Calendar.astro). Starts on the current month; ◀ ▶ move a month.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const nice = (s: string) => { const [y, m, d] = s.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

type EventData = { date: string; name: string; place: string }[];

export function initCalendars() {
  const now = new Date();
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());

  document.querySelectorAll<HTMLElement>('[data-calendar]').forEach((root) => {
    const mode = root.dataset.calendar;
    const data = JSON.parse(root.dataset.cal || '[]');
    const grid = root.querySelector<HTMLElement>('.cal-grid')!;
    const label = root.querySelector<HTMLElement>('.cal-month')!;
    const card = root.closest<HTMLElement>('[data-cal-card]');
    let y = now.getFullYear(), m = now.getMonth();
    let selected = '';

    const events: EventData = mode === 'events' ? data : [];
    const booked = new Set<string>(mode === 'booking' ? data : []);

    function listEvents() {
      const list = card?.querySelector<HTMLElement>('[data-event-list]'); if (!list) return;
      const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
      const items = events.filter((e) => e.date.startsWith(prefix)).sort((a, b) => a.date.localeCompare(b.date));
      list.innerHTML = items.length
        ? items.map((e) => `<li><span class="label">${nice(e.date)}</span><b></b><small></small></li>`).join('')
        : '<li class="empty">No events this month yet.</li>';
      // names and places go in as text, never as HTML
      list.querySelectorAll('li:not(.empty)').forEach((li, i) => { li.querySelector('b')!.textContent = items[i].name; li.querySelector('small')!.textContent = items[i].place; });
    }

    function updateBooking() {
      const out = card?.querySelector<HTMLElement>('[data-picked]');
      const btn = card?.querySelector<HTMLAnchorElement>('[data-book]');
      if (out) out.textContent = selected ? nice(selected) : 'Pick a free date';
      if (btn) {
        btn.toggleAttribute('aria-disabled', !selected);
        const base = btn.dataset.base || '#';
        const msg = encodeURIComponent(`Hi Chillbah! I'd like to book the Hilux for ${selected ? nice(selected) : 'an event'}.`);
        btn.href = base.startsWith('https://wa.me/') ? `${base}?text=${msg}` : base;
      }
    }

    function render() {
      label.textContent = `${MONTHS[m]} ${y}`;
      grid.querySelectorAll('.cal-day').forEach((n) => n.remove());
      const first = (new Date(y, m, 1).getDay() + 6) % 7; // Monday first
      const days = new Date(y, m + 1, 0).getDate();
      for (let i = 0; i < first; i++) { const b = document.createElement('div'); b.className = 'cal-day blank'; grid.append(b); }
      for (let d = 1; d <= days; d++) {
        const key = iso(y, m, d);
        const isPast = key < todayIso, isBooked = booked.has(key), ev = events.find((e) => e.date === key);
        const free = mode === 'booking' && !isPast && !isBooked;
        const el = document.createElement(free ? 'button' : 'div');
        el.className = 'cal-day';
        el.textContent = String(d);
        el.setAttribute('role', 'gridcell');
        if (key === todayIso) el.classList.add('today');
        if (isPast) el.classList.add('past');
        if (ev) { el.classList.add('event'); el.setAttribute('aria-label', `${nice(key)}: ${ev.name}`); }
        if (isBooked) { el.classList.add('booked'); el.setAttribute('aria-label', `${nice(key)}: booked`); }
        if (free) {
          (el as HTMLButtonElement).type = 'button';
          el.setAttribute('aria-label', `${nice(key)}: available`);
          if (key === selected) { el.classList.add('selected'); el.setAttribute('aria-pressed', 'true'); }
          el.addEventListener('click', () => { selected = selected === key ? '' : key; render(); updateBooking(); });
        }
        grid.append(el);
      }
      listEvents();
    }

    root.querySelector('[data-prev]')?.addEventListener('click', () => { m--; if (m < 0) { m = 11; y--; } render(); });
    root.querySelector('[data-next]')?.addEventListener('click', () => { m++; if (m > 11) { m = 0; y++; } render(); });
    render();
    updateBooking();
  });
}
