// Route Card (stamp card) settings. Backend: apps-script/Code.gs. Setup steps: STAMP-CARD-SETUP.md.
//
// Paste the two Apps Script web app links here (both end in /exec). While they are empty, the card runs in
// preview mode: saved on that phone only, with buttons that pretend to be the staff.
export const stamps = {
  stampApi: '', // public deployment ("Who has access: Anyone"): looks up a card's stamps
  staffUrl: '', // staff deployment ("Who has access: Only myself"): the staff page
};
