// Route Card (stamp card) settings. Backend: apps-script/Code.gs. Setup steps: STAMP-CARD-SETUP.md.
//
// Paste the two Apps Script web app links here (both end in /exec). While they are empty, the card runs in
// preview mode: saved on that phone only, with buttons that pretend to be the staff.
export const stamps = {
  stampApi: 'https://script.google.com/macros/s/AKfycbw7EH_zXyLP_rEctl85lsyDYWItXNVX85vD7UzVBHb5dyvpzO5NpC72LDcy4E03PA/exec', // public deployment ("Who has access: Anyone"): looks up a card's stamps
  staffUrl: 'https://script.google.com/macros/s/AKfycbz2LHHKIxqof6LPKiuRx9eRvswJ35ad8XsGEewy0X7FT_Uo0OmK691RG4BPFyW9Fw/exec', // staff deployment ("Who has access: Only myself"): the staff page
};
