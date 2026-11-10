// Chillbah's schedule. Dates are YYYY-MM-DD.

/** Google Maps links for each place in the opening hours (the Where we at card's map button and place names use them). */
export const maps: Record<string, string> = {
  Homebased: 'https://www.google.com/maps/place/Chillbah+Coffee+(homebased)/@5.9422489,116.0836017,21z/data=!4m6!3m5!1s0x323b696ece20c361:0x6b27dec10385bec1!8m2!3d5.9422886!4d116.0836999!16s%2Fg%2F11x8ytlzjl',
  'Jesselton Point Ferry Terminal': 'https://www.google.com/maps/place/Jesselton+Point+Ferry+Terminal+-+South+Jetty/@5.9929694,116.0756033,17z/data=!3m2!4b1!5s0x323b69878585fd75:0x867f78682e889870!4m6!3m5!1s0x323b6987828003c9:0x2127a85ba3de75ca!8m2!3d5.9929641!4d116.0781836!16s%2Fg%2F1pzt4vmmg',
};

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
