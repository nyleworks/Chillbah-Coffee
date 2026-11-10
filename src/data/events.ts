// Chillbah's schedule. Dates are YYYY-MM-DD.

/** Opening hours shown on the Where we at card. `place` is left out on closed days. */
export const hours: { day: string; place?: string; time: string }[] = [
  { day: 'Mon', place: 'Homebased', time: '5AM – 7PM' },
  { day: 'Tue', place: 'Homebased', time: '5AM – 7PM' },
  { day: 'Wed', place: 'Homebased', time: '5AM – 7PM' },
  { day: 'Thu', place: 'Homebased', time: '5AM – 7PM' },
  { day: 'Fri', place: 'Jesselton Point Ferry Terminal', time: '3PM – 11PM' },
  { day: 'Sat', place: 'Jesselton Point Ferry Terminal', time: '3PM – 11PM' },
  { day: 'Sun', time: 'Closed' },
];

/**
 * Events, marked on the event calendar. `end` is the last day of a multi-day event (leave it out for one-day events).
 * Events that have finished by the time the site is built also show under Past events.
 */
export type ChillbahEvent = { date: string; end?: string; name: string; place?: string; photo?: string };
export const events: ChillbahEvent[] = [
  { date: '2026-10-24', end: '2026-10-25', name: 'Tuaran U-Plus Kg Timbuk' },
  { date: '2026-10-31', name: 'Bukit Bantayan, Curve25' },
  { date: '2026-11-07', end: '2026-11-09', name: 'RKB Kota Belud' },
  { date: '2026-11-07', name: 'My Melon Engagement' },
  { date: '2026-11-28', end: '2026-11-29', name: 'Tuaran U-Plus Kg Timbuk' },
];
