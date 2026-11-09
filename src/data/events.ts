// Placeholder schedule data. Replace with the real events, bookings and hours when they're ready.
// Dates are YYYY-MM-DD.

/** Opening hours shown on the Where we at card. */
export const hours: { day: string; time: string }[] = [
  { day: 'Monday', time: 'TBA' },
  { day: 'Tuesday', time: 'TBA' },
  { day: 'Wednesday', time: 'TBA' },
  { day: 'Thursday', time: 'TBA' },
  { day: 'Friday', time: 'TBA' },
  { day: 'Saturday', time: 'TBA' },
  { day: 'Sunday', time: 'TBA' },
];

/** Upcoming events, marked on the event calendar. */
export const events: { date: string; name: string; place: string }[] = [
  { date: '2026-11-14', name: 'Event name (placeholder)', place: 'Location TBA' },
  { date: '2026-11-22', name: 'Event name (placeholder)', place: 'Location TBA' },
  { date: '2026-12-06', name: 'Event name (placeholder)', place: 'Location TBA' },
];

/** Dates the truck is already booked for private events (greyed out on the booking calendar). */
export const booked: string[] = ['2026-11-14', '2026-11-22', '2026-11-28', '2026-12-06', '2026-12-20'];

/** Past events. `photo` is optional: leave it out to show the pixel placeholder. */
export const pastEvents: { name: string; date: string; place: string; photo?: string }[] = [
  { name: 'Past event (placeholder)', date: 'Month 2026', place: 'Location TBA' },
  { name: 'Past event (placeholder)', date: 'Month 2026', place: 'Location TBA' },
  { name: 'Past event (placeholder)', date: 'Month 2026', place: 'Location TBA' },
];
