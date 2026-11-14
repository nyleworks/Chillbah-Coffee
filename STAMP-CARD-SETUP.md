# Route Card setup (stamp card)

The Route Card is Chillbah's stamp card. It needs no sign-up. Each customer's phone gets a card that is a random code,
shown as a QR code. After paying, the customer shows the QR code and staff scan it with the **truck phone**. That opens
the **staff page**, where staff tap **Add stamp** or **Give free drink**. The customer's card updates within a few seconds.

## The rules

- 10 stamps = one free drink of any kind. One visit is stamped per card per day (Kota Kinabalu time).
- Every stamp remembers where the truck was: **Homebased** (cup), **Jesselton Point** (anchor) or an **event** (star).
- **Event bonus:** a visit at an event gives 2 stamps.
- **Explorer bonus:** the first time a card has stamps from 3 different places (Homebased, Jesselton Point, or any
  event, and each event counts as its own place), it gets 1 extra stamp and an Explorer badge. Badges stay forever.
- A card lasts **2 months** from its first stamp. If it isn't full by then, it clears and starts again.
- The card shows the truck's **next stop**, from the same schedule as the Where we at card and the event calendar
  (`src/data/events.ts`).
- No names or phone numbers are collected. The Google Sheet keeps only a scrambled copy of each card code
  (it can't be turned back into the code), the stamps, where they were collected and dates.
- Cards with no activity for 6 months are deleted automatically every night.

There is no test or preview mode: the card only works once the two web app links below are in
`src/data/stamps.ts`. Each card can get one visit stamped per day. The staff page checks both the card's last
stamp date and the Log tab, and shows "This card already has today's stamp" on a second try.

## Before you start

Use Chillbah's own Google account, and turn on **2-Step Verification** for it
(Google Account → Security → 2-Step Verification). This account is the only one that can stamp cards.

## One-time setup (about 15 minutes)

1. Create a new Google Sheet in the Chillbah Google account, for example "Chillbah route cards".
2. In the sheet: **Extensions → Apps Script**. Delete what's there, paste all of the code from
   `apps-script/Code.gs`, and save.
3. Choose **setup** in the function menu at the top and press **Run**. Allow the permissions it asks for.
   This makes the Summary, Cards and Log tabs and a nightly clean-up.
4. **Deploy → New deployment → Web app** with *Execute as*: **Me** and *Who has access*: **Anyone**.
   Deploy and copy the URL (it ends in `/exec`). This is the **public link**: it can only look up a card's stamps.
5. **Deploy → New deployment → Web app** again, this time with *Who has access*: **Only myself**.
   Copy this URL too. This is the **staff link**.
6. Send both links to Claude, or paste them into `src/data/stamps.ts` as `stampApi` (public) and `staffUrl` (staff),
   then rebuild and publish the site.

## Setting up the truck phone

1. In the phone's browser, sign in to the Chillbah Google account, and make sure it is the **only** Google account
   signed in to that browser (Google's staff pages get confused by several accounts).
2. Open the website with `#staff-phone=on` at the end:
   `https://nyleworks.github.io/Chillbah-Coffee/#staff-phone=on`. The card will say this phone is now the truck phone.
3. Open the staff link once and bookmark it. It shows the numbers from the Summary tab.
4. Test it: open the stamp card on your own phone, scan its QR code with the truck phone's camera, and tap **Add stamp**.

To stop a phone being the truck phone, open the website with `#staff-phone=off`.
If the truck phone is lost, sign it out from the Chillbah Google account (Google Account → Security → Your devices).
Without that sign-in, nobody can stamp cards, even if they have the phone.

## Where the truck is today

The staff page has three buttons at the top: **Homebased**, **Jesselton Point** and **Event** (with a box for the
event's name). It picks today's spot by itself from the website's schedule: an event in `src/data/events.ts` wins
over the regular weekly spot. Check it before the first stamp of the day. Whatever is used for the first stamp is
remembered for the rest of the day.

Keep event names the same on every day of a multi-day event, so it counts as one place for the Explorer bonus.

## The numbers

The **Summary** tab updates by itself: members, active members in the last 30 days, visits this week and month,
event bonus stamps, Explorer badges, free drinks, cards that expired, average days to fill a card, visits by spot,
by place, by day of the week and by hour, and which drinks people take free. Counts are close but not exact: a customer
whose phone lost their card and who had no screenshot shows up as two cards.

## Good to know

- If you change `Code.gs` later, update **both** deployments: **Deploy → Manage deployments → Edit → New version**,
  so the links stay the same.
- The Sheet is styled like the website (pixel fonts, cream and green, ink outlines). To repaint it, pick
  **restyle** in the function menu at the top of the Apps Script editor and press **Run**. It never changes the data.
- Please don't type in the Cards or Log tabs. To fix a mistake, ask Claude.
