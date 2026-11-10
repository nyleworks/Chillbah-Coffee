// Friendly date labels shared by the event calendar and the Past events cards.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const parts = (s: string) => s.split('-').map(Number);

/** "7 November 2026", or for a range "7 – 9 November 2026" / "31 October – 1 November 2026". */
export function when(start: string, end?: string) {
  const [y, m, d] = parts(start);
  if (!end || end === start) return `${d} ${MONTHS[m - 1]} ${y}`;
  const [y2, m2, d2] = parts(end);
  if (y === y2 && m === m2) return `${d} – ${d2} ${MONTHS[m - 1]} ${y}`;
  if (y === y2) return `${d} ${MONTHS[m - 1]} – ${d2} ${MONTHS[m2 - 1]} ${y}`;
  return `${d} ${MONTHS[m - 1]} ${y} – ${d2} ${MONTHS[m2 - 1]} ${y2}`;
}
