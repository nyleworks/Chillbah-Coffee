/**
 * Chillbah Coffee: Route Card backend (Google Apps Script, bound to a Google Sheet).
 * Based on the Brew Addict stamp card, with a mobile-truck twist: every stamp remembers where the truck was.
 *
 * How it stays safe
 * - No personal details. A card is a random code that lives on the customer's phone. The sheet keeps only a
 *   one-way fingerprint (SHA-256) of that code, the stamps, where they were collected and dates.
 * - Only staff can add stamps or give free drinks. Those actions run only for the Google account that owns
 *   this script, signed in on the truck phone (Google checks the password and 2-step verification).
 * - The public web app can do one thing: look up a card by its code, so the customer's card updates live.
 *
 * Rules
 * - 10 stamps = one free drink of any kind. One visit is stamped per card per day (Kota Kinabalu time).
 * - Event bonus: a visit at an event gives 2 stamps.
 * - Explorer bonus: the first time a card has stamps from 3 different places (Homebased, Jesselton Point,
 *   or any event), it gets 1 extra stamp and the customer earns an Explorer badge (badges stay forever).
 * - A card lasts 2 months from its first stamp; an unfinished card then clears. Cards with no activity for
 *   6 months are deleted.
 *
 * Setup: see STAMP-CARD-SETUP.md. Two deployments of this same script:
 *   Public: Execute as Me, Who has access: Anyone       → its URL goes in src/data/stamps.ts as stampApi
 *   Staff:  Execute as Me, Who has access: Only myself  → its URL goes in src/data/stamps.ts as staffUrl
 */

var TZ = "Asia/Kuching";
var CARD_SIZE = 10;
var CARD_MONTHS = 2;   // an unfinished card clears this many months after its first stamp
var KEEP_DAYS = 183;   // delete cards with no activity for about 6 months
var EXPLORER_PLACES = 3;
var EVENT_STAMPS = 2;

// The two regular spots. Events are typed in by staff (or filled in from the website's event calendar).
var SPOTS = { home: "Homebased", jetty: "Jesselton Point Ferry Terminal" };

// Drinks staff can pick when giving a free drink (from the menu on the website, src/data/menu.ts)
var DRINKS = ["Coffee Latte", "Hazelnut Latte", "Caramel Latte", "Vanilla Latte", "Butterscotch Latte",
  "Salted Caramel Latte", "Iced Mocha", "Iced Cappuccino", "Caramel Macchiato", "Spanish Latte", "Iced Americano",
  "Americano Orange C", "Iced Chocolate", "Iced Choco Strawberry", "Thai Mix Tea", "Thai Green Tea", "Passionfruit Ade",
  "Strawberry Ade", "Honey Lemon Ade", "Mango Ade", "Matcha Latte", "Matcha Strawberry", "Matcha Mango", "Matcha Blueberry"];

var CARD_HEADERS = ["card", "stamps", "cardStart", "lastStampDate", "freeDrinks", "createdAt", "lastActivity",
  "trail", "places", "explorer", "badges"];
var LOG_HEADERS = ["time", "date", "card", "event", "stampNumber", "weekday", "hour", "spot", "place", "drink", "daysToFill"];

// ---------------------------------------------------------------------------------------------------------
// Run once from the editor: creates the tabs, the Summary formulas and the nightly clean-up.
// ---------------------------------------------------------------------------------------------------------
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TZ);
  var cards = ensureSheet_(ss, "Cards", CARD_HEADERS);
  cards.getRange("A:K").setNumberFormat("@");          // codes and dates stay as text
  var log = ensureSheet_(ss, "Log", LOG_HEADERS);
  log.getRange("A:A").setNumberFormat("yyyy-mm-dd hh:mm");
  log.getRange("B:D").setNumberFormat("@");
  log.getRange("F:F").setNumberFormat("@");
  log.getRange("H:J").setNumberFormat("@");
  buildSummary_(ss);

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "housekeeping") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("housekeeping").timeBased().everyDays(1).atHour(4).inTimezone(TZ).create();
  Logger.log("Done. Staff actions will only work for " + Session.getEffectiveUser().getEmail() + ".");
}

function ensureSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sh;
}

function buildSummary_(ss) {
  var sh = ss.getSheetByName("Summary") || ss.insertSheet("Summary", 0);
  sh.clear();
  var visit = 'Log!D2:D="stamp"';
  var rows = [
    ["Chillbah Route Card", ""],
    ["Updates by itself from the Log tab. Please don't edit this tab.", ""],
    ["", ""],
    ["Members (cards with at least 1 stamp)", '=IFERROR(COUNTUNIQUE(FILTER(Log!C2:C, ' + visit + ')), 0)'],
    ["Active members, last 30 days", '=IFERROR(COUNTUNIQUE(FILTER(Log!C2:C, ' + visit + ', Log!A2:A>=NOW()-30)), 0)'],
    ["Visits stamped this week (from Monday)", '=COUNTIFS(Log!D2:D, "stamp", Log!A2:A, ">="&(TODAY()-WEEKDAY(TODAY(), 3)))'],
    ["Visits stamped this month", '=COUNTIFS(Log!D2:D, "stamp", Log!A2:A, ">="&(EOMONTH(TODAY(), -1)+1))'],
    ["Visits stamped, all time", '=COUNTIF(Log!D2:D, "stamp")'],
    ["Event bonus stamps given", '=COUNTIF(Log!D2:D, "event_bonus")'],
    ["Explorer badges earned", '=COUNTIF(Log!D2:D, "explorer_bonus")'],
    ["Free drinks given this month", '=COUNTIFS(Log!D2:D, "free_drink", Log!A2:A, ">="&(EOMONTH(TODAY(), -1)+1))'],
    ["Free drinks given, all time", '=COUNTIF(Log!D2:D, "free_drink")'],
    ["Cards that expired unfinished", '=COUNTIF(Log!D2:D, "expired")'],
    ["Average days to fill a card", '=IFERROR(ROUND(AVERAGEIF(Log!D2:D, "free_drink", Log!K2:K), 1), "-")'],
    ["", ""],
    ["Visits by spot", ""],
    ["Homebased", '=COUNTIFS(Log!D2:D, "stamp", Log!H2:H, "home")'],
    ["Jesselton Point", '=COUNTIFS(Log!D2:D, "stamp", Log!H2:H, "jetty")'],
    ["Events", '=COUNTIFS(Log!D2:D, "stamp", Log!H2:H, "event")'],
    ["", ""],
    ["Visits by day of the week", ""]
  ];
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(function (d) {
    rows.push([d, '=COUNTIFS(Log!D2:D, "stamp", Log!F2:F, "' + d + '")']);
  });
  sh.getRange(1, 1, rows.length, 2).setValues(rows);
  sh.getRange("A1").setFontSize(14).setFontWeight("bold");
  sh.getRange("A2").setFontColor("#5a4b3c");
  sh.getRange("A16").setFontWeight("bold");
  sh.getRange("A21").setFontWeight("bold");
  sh.getRange("D4").setValue("Visits by place").setFontWeight("bold");
  sh.getRange("D5").setFormula("=IFERROR(QUERY(Log!D2:I, \"select I, count(D) where D = 'stamp' group by I order by count(D) desc label I 'Place', count(D) 'Visits'\", 0), \"No stamps yet\")");
  sh.getRange("G4").setValue("Visits by hour").setFontWeight("bold");
  sh.getRange("G5").setFormula("=IFERROR(QUERY(Log!D2:G, \"select G, count(D) where D = 'stamp' group by G order by G label G 'Hour', count(D) 'Visits'\", 0), \"No stamps yet\")");
  sh.getRange("J4").setValue("Free drinks by drink").setFontWeight("bold");
  sh.getRange("J5").setFormula("=IFERROR(QUERY(Log!D2:J, \"select J, count(D) where D = 'free_drink' and J <> '' group by J order by count(D) desc label J 'Drink', count(D) 'Free drinks'\", 0), \"None yet\")");
  sh.setColumnWidth(1, 300);
  sh.setColumnWidth(4, 240);
  sh.setColumnWidth(10, 200);
}

// ---------------------------------------------------------------------------------------------------------
// Web app entry points
// ---------------------------------------------------------------------------------------------------------

// GET: the staff page (only for the owner's Google account), otherwise a plain status reply.
// The website adds ?spot=…&place=… from its own schedule as a suggestion for where the truck is today.
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (isStaff_()) return staffPage_(validCode_(p.card) ? p.card : "", cleanSpot_(p.spot, p.place));
  return json_({ ok: true, service: "chillbah-route-card" });
}

// POST from the website: the only public action is looking up a card by its code.
function doPost(e) {
  try {
    var req = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (req.action === "card") return json_(lookup_(req.card));
    return json_({ ok: false, error: "bad_request" });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "server" });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function lookup_(code) {
  if (!validCode_(code)) return { ok: false, error: "bad_card" };
  var found = findCard_(cardsSheet_(), fingerprint_(code));
  return { ok: true, card: view_(found ? found.data : blankCard_("")) };
}

// ---------------------------------------------------------------------------------------------------------
// Staff actions, called from the staff page with google.script.run. Each one checks the signed-in account.
// ---------------------------------------------------------------------------------------------------------
function staffCard(code) {
  requireStaff_();
  if (!validCode_(code)) return { ok: false, error: "bad_card" };
  var found = findCard_(cardsSheet_(), fingerprint_(code));
  return { ok: true, card: view_(found ? found.data : blankCard_("")) };
}

function staffStamp(code, spot, place) {
  requireStaff_();
  if (!validCode_(code)) return { ok: false, error: "bad_card" };
  var where = cleanSpot_(spot, place);
  if (!where) return { ok: false, error: "no_spot" };
  return withLock_(function () {
    var sh = cardsSheet_(), id = fingerprint_(code);
    var found = findCard_(sh, id) || { row: 0, data: blankCard_(id) };
    var c = found.data, now = new Date(), today = todayStr_();
    expire_(c, now);
    if (c.stamps >= CARD_SIZE) { saveCard_(sh, found); return { ok: false, error: "full", card: view_(c) }; }
    if (c.lastStampDate === today) { saveCard_(sh, found); return { ok: false, error: "today", card: view_(c) }; }
    rememberSpot_(where);
    if (c.stamps === 0) c.cardStart = now.toISOString();
    var kind = where.spot === "event" ? "e" : where.spot === "jetty" ? "j" : "h";
    var before = c.stamps;

    // The visit itself
    c.stamps += 1; c.trail.push(kind);
    log_(now, id, "stamp", c.stamps, where, "", "");
    // Event bonus: a second stamp
    var eventBonus = false;
    if (where.spot === "event" && c.stamps < CARD_SIZE) {
      c.stamps += 1; c.trail.push(kind); eventBonus = true;
      log_(now, id, "event_bonus", c.stamps, where, "", "");
    }
    // Explorer bonus: once per card, at 3 different places
    if (c.places.indexOf(where.place) < 0) c.places.push(where.place);
    var explorer = false;
    if (!c.explorer && c.places.length >= EXPLORER_PLACES && c.stamps < CARD_SIZE) {
      c.stamps += 1; c.trail.push("x"); c.explorer = 1; c.badges += 1; explorer = true;
      log_(now, id, "explorer_bonus", c.stamps, where, "", "");
    }
    c.lastStampDate = today;
    c.lastActivity = now.toISOString();
    saveCard_(sh, found);
    return { ok: true, added: c.stamps - before, eventBonus: eventBonus, explorer: explorer, card: view_(c) };
  });
}

function staffFreeDrink(code, drink) {
  requireStaff_();
  if (!validCode_(code)) return { ok: false, error: "bad_card" };
  drink = DRINKS.indexOf(drink) >= 0 ? drink : "";
  return withLock_(function () {
    var sh = cardsSheet_(), id = fingerprint_(code);
    var found = findCard_(sh, id);
    if (!found) return { ok: false, error: "not_full", card: view_(blankCard_("")) };
    var c = found.data, now = new Date();
    if (c.stamps < CARD_SIZE) return { ok: false, error: "not_full", card: view_(c) };
    var days = c.cardStart ? Math.max(0, Math.round((now - new Date(c.cardStart)) / 864e5)) : "";
    resetCard_(c);
    c.freeDrinks += 1; c.lastActivity = now.toISOString();
    saveCard_(sh, found);
    log_(now, id, "free_drink", "", null, drink, days);
    return { ok: true, card: view_(c) };
  });
}

function staffSummary() {
  requireStaff_();
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Summary");
  if (!sh) return { ok: false };
  var v = sh.getRange("A4:B14").getDisplayValues();
  return { ok: true, rows: v.filter(function (r) { return r[0]; }) };
}

function staffDrinks() { requireStaff_(); return DRINKS; }

// ---------------------------------------------------------------------------------------------------------
// Today's spot. The first stamp of the day saves where the truck is, so the staff page opens on it for
// every later customer that day (it can still be changed on the page).
// ---------------------------------------------------------------------------------------------------------
function cleanSpot_(spot, place) {
  if (spot === "home" || spot === "jetty") return { spot: spot, place: SPOTS[spot] };
  if (spot === "event") {
    var name = String(place || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
    return { spot: "event", place: name || "Event" };
  }
  return null;
}
function rememberSpot_(where) {
  PropertiesService.getScriptProperties().setProperty("spot", JSON.stringify({ date: todayStr_(), spot: where.spot, place: where.place }));
}
function todaysSpot_() {
  try {
    var s = JSON.parse(PropertiesService.getScriptProperties().getProperty("spot") || "null");
    return s && s.date === todayStr_() ? cleanSpot_(s.spot, s.place) : null;
  } catch (e) { return null; }
}

// ---------------------------------------------------------------------------------------------------------
// Nightly clean-up (time trigger made by setup): clears expired cards and deletes long-unused ones.
// ---------------------------------------------------------------------------------------------------------
function housekeeping() {
  withLock_(function () {
    var sh = cardsSheet_(), now = new Date();
    var values = sh.getDataRange().getValues();
    var cutoff = now.getTime() - KEEP_DAYS * 864e5;
    for (var r = values.length - 1; r >= 1; r--) {
      var found = { row: r + 1, data: toCard_(values[r]) };
      var c = found.data;
      var last = c.lastActivity ? new Date(c.lastActivity).getTime() : 0;
      if (last && last < cutoff) { sh.deleteRow(r + 1); continue; }
      if (expire_(c, now)) saveCard_(sh, found);
    }
  });
}

// ---------------------------------------------------------------------------------------------------------
// Card rules
// ---------------------------------------------------------------------------------------------------------
function expiryOf_(c) {
  if (!c.cardStart) return null;
  var d = new Date(c.cardStart);
  d.setMonth(d.getMonth() + CARD_MONTHS);
  return d;
}

function resetCard_(c) { c.stamps = 0; c.cardStart = ""; c.trail = []; c.places = []; c.explorer = 0; }

// Clears an unfinished card once its time is up and logs it. Returns true if it changed the card.
function expire_(c, now) {
  var end = expiryOf_(c);
  if (c.stamps > 0 && c.stamps < CARD_SIZE && end && now >= end) {
    if (c.id) log_(now, c.id, "expired", c.stamps, null, "", "");
    resetCard_(c);
    return true;
  }
  return false;
}

// What the customer's card and the staff page show. An expired card shows as empty without being saved.
// trail: one letter per stamp: h Homebased, j Jesselton Point, e event, x explorer bonus.
function view_(c) {
  var stamps = c.stamps, end = expiryOf_(c), trail = c.trail, places = c.places.length, explorer = !!c.explorer;
  if (stamps > 0 && stamps < CARD_SIZE && end && new Date() >= end) { stamps = 0; end = null; trail = []; places = 0; explorer = false; }
  return {
    stamps: stamps,
    size: CARD_SIZE,
    expires: stamps > 0 && stamps < CARD_SIZE && end ? end.toISOString() : null,
    stampedToday: c.lastStampDate === todayStr_(),
    freeDrinks: c.freeDrinks,
    trail: trail.join(""),
    places: places,
    explorer: explorer,
    badges: c.badges
  };
}

// ---------------------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------------------

// The signed-in Google account must be the account that owns this script.
function isStaff_() {
  var me = Session.getEffectiveUser().getEmail();
  var active = Session.getActiveUser().getEmail();
  return !!me && !!active && active === me;
}
function requireStaff_() { if (!isStaff_()) throw new Error("Staff only. Open the staff page signed in to the Chillbah Google account."); }

// Card codes are 22 random URL-safe characters (128 bits) made on the customer's phone
function validCode_(code) { return typeof code === "string" && /^[A-Za-z0-9_-]{22}$/.test(code); }

// One-way fingerprint: the sheet never holds the code itself, so a copy of the sheet can't be used to stamp cards
function fingerprint_(code) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, "chillbah:" + code, Utilities.Charset.UTF_8)
    .map(function (b) { return ("0" + (b & 255).toString(16)).slice(-2); }).join("").slice(0, 32);
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function cardsSheet_() { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Cards"); }

function blankCard_(id) {
  return { id: id, stamps: 0, cardStart: "", lastStampDate: "", freeDrinks: 0, createdAt: new Date().toISOString(), lastActivity: "",
    trail: [], places: [], explorer: 0, badges: 0 };
}

function parseList_(s) { try { var v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }

function toCard_(r) {
  return { id: String(r[0]), stamps: Number(r[1]) || 0, cardStart: String(r[2] || ""), lastStampDate: String(r[3] || ""),
    freeDrinks: Number(r[4]) || 0, createdAt: String(r[5] || ""), lastActivity: String(r[6] || ""),
    trail: String(r[7] || "").split(""), places: parseList_(r[8]), explorer: Number(r[9]) || 0, badges: Number(r[10]) || 0 };
}

function findCard_(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return null;
  var cell = sh.getRange(2, 1, last - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
  if (!cell) return null;
  var row = cell.getRow();
  return { row: row, data: toCard_(sh.getRange(row, 1, 1, CARD_HEADERS.length).getValues()[0]) };
}

function saveCard_(sh, found) {
  var c = found.data;
  var vals = [[c.id, String(c.stamps), c.cardStart, c.lastStampDate, String(c.freeDrinks), c.createdAt, c.lastActivity,
    c.trail.join(""), JSON.stringify(c.places), String(c.explorer), String(c.badges)]];
  if (found.row) sh.getRange(found.row, 1, 1, CARD_HEADERS.length).setValues(vals);
  else { sh.appendRow(vals[0]); found.row = sh.getLastRow(); }
}

function log_(now, id, event, stampNumber, where, drink, days) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log").appendRow([
    now, Utilities.formatDate(now, TZ, "yyyy-MM-dd"), id.slice(0, 12), event, stampNumber,
    Utilities.formatDate(now, TZ, "EEE"), Number(Utilities.formatDate(now, TZ, "H")),
    where ? where.spot : "", where ? where.place : "", drink, days
  ]);
}

function todayStr_() { return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd"); }

// ---------------------------------------------------------------------------------------------------------
// The staff page
// ---------------------------------------------------------------------------------------------------------
function staffPage_(code, suggested) {
  // A spot already used today wins over the website's suggestion (staff may have changed it).
  var spot = todaysSpot_() || suggested || { spot: "home", place: SPOTS.home };
  var html = HtmlService.createHtmlOutput(STAFF_HTML_
      .replace("__CARD__", JSON.stringify(code))
      .replace("__SPOT__", JSON.stringify(spot).replace(/</g, "\\u003c")))
    .setTitle("Chillbah staff")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
  return html;
}

var STAFF_HTML_ = [
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><base target="_top">',
  '<style>',
  ':root{--ink:#12120d;--muted:#5a4b3c;--paper:#f4ebcd;--paper2:#ebdfb6;--ember:#e66f46;--forest:#2b5615;--line:#12120d}',
  '*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}',
  '.wrap{max-width:460px;margin:0 auto;padding:20px 16px 40px}',
  'h1{font:800 22px/1.1 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.04em;margin:0 0 4px}',
  'h2{font:800 14px/1.1 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.06em;margin:0 0 10px}',
  '.sub{color:var(--muted);margin:0 0 18px;font-size:14px}',
  '.box{border:3px solid var(--line);padding:16px;background:#fffaf0;box-shadow:5px 5px 0 var(--line);margin-bottom:18px}',
  '.spots{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}',
  '.spot{padding:12px 6px;border:3px solid var(--line);background:#fffaf0;font:700 14px/1.15 system-ui,sans-serif;cursor:pointer}',
  '.spot.on{background:var(--forest);color:var(--paper)}',
  'input{width:100%;margin-top:10px;padding:12px;border:3px solid var(--line);background:#fff;font:inherit}',
  '.trail{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:4px 0 14px;padding:0;list-style:none}',
  '.trail li{aspect-ratio:1;border:2px dashed #a8997f;display:grid;place-items:center;font:800 13px/1 ui-monospace,monospace;color:var(--muted)}',
  '.trail li.on{border:3px solid var(--line);background:var(--ink);color:var(--paper)}',
  '.trail li.e{background:var(--ember);color:var(--ink)}.trail li.j{background:#8ad8d8;color:var(--ink)}.trail li.x{background:var(--forest)}',
  '.count{font:800 24px/1 ui-monospace,monospace;margin:0 0 6px}',
  '.note{color:var(--muted);margin:6px 0 0;font-size:15px}',
  'button,select{font:inherit}',
  '.btn{display:block;width:100%;margin-top:16px;padding:16px;border:3px solid var(--line);background:var(--ember);color:var(--ink);font:800 18px/1 ui-monospace,monospace;text-transform:uppercase;cursor:pointer;box-shadow:4px 4px 0 var(--line)}',
  '.btn:disabled{opacity:.4}',
  'select{width:100%;margin-top:14px;padding:12px;border:3px solid var(--line);background:#fff}',
  '.done{margin-top:16px;padding:14px;background:var(--forest);color:var(--paper);font-weight:700;font-size:18px}',
  '.warn{margin-top:16px;padding:14px;border:3px solid var(--line);font-weight:700}',
  'table{width:100%;border-collapse:collapse;font-size:15px}td{padding:8px 0;border-bottom:2px dashed #a8997f}td:last-child{text-align:right;font-weight:700}',
  '.busy{opacity:.5;pointer-events:none}',
  '</style></head><body><div class="wrap">',
  '<h1>Chillbah staff</h1><p class="sub">Route Card</p>',
  '<div class="box" id="where"><h2>Today the truck is at</h2><div class="spots">',
  '<button class="spot" data-spot="home">Homebased</button><button class="spot" data-spot="jetty">Jesselton Point</button><button class="spot" data-spot="event">Event</button>',
  '</div><input id="place" maxlength="60" placeholder="Event name, e.g. RKB Kota Belud" hidden></div>',
  '<div id="app"><p class="note">Loading…</p></div>',
  '</div><script>',
  'var CARD=__CARD__,SPOT=__SPOT__,SIZE=10,app=document.getElementById("app"),drinks=[],placeIn=document.getElementById("place");',
  'function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c]})}',
  'function pick(s){SPOT.spot=s;document.querySelectorAll(".spot").forEach(function(b){b.classList.toggle("on",b.dataset.spot===s)});placeIn.hidden=s!=="event";if(s==="event"&&SPOT.place&&SPOT.place!=="Homebased"&&SPOT.place.indexOf("Jesselton")<0)placeIn.value=SPOT.place}',
  'document.querySelectorAll(".spot").forEach(function(b){b.onclick=function(){pick(b.dataset.spot)}});pick(SPOT.spot);',
  'function call(fn,args,done){app.classList.add("busy");var r=google.script.run.withSuccessHandler(function(x){app.classList.remove("busy");done(x)}).withFailureHandler(function(e){app.classList.remove("busy");app.innerHTML="<p class=warn>"+esc(e.message||e)+"</p>"});r[fn].apply(r,args)}',
  'var MSG={full:"This card is full. Give the free drink.",today:"This card already has today\'s stamp. One visit a day.",not_full:"This card doesn\'t have 10 stamps yet.",bad_card:"That QR code isn\'t a Chillbah card.",no_spot:"Pick where the truck is today first."};',
  'var ICON={h:"H",j:"J",e:"★",x:"✚"};',
  'function show(card,msg,ok){var h="<div class=box><ol class=trail>";for(var i=0;i<SIZE;i++){var k=card.trail.charAt(i);h+="<li class=\\""+(i<card.stamps?"on "+k:"")+"\\">"+(i<card.stamps?(ICON[k]||"●"):(i+1))+"</li>"}',
  'h+="</ol><p class=count>"+card.stamps+" of "+SIZE+" stamps</p>";',
  'h+="<p class=note>Places on this card: "+card.places+" of 3"+(card.explorer?" (Explorer bonus done)":"")+"</p>";',
  'if(card.expires)h+="<p class=note>Card ends "+new Date(card.expires).toLocaleDateString("en-GB",{day:"numeric",month:"long"})+"</p>";',
  'if(card.freeDrinks)h+="<p class=note>Free drinks so far: "+card.freeDrinks+"</p>";',
  'if(card.badges)h+="<p class=note>Explorer badges: "+card.badges+"</p>";',
  'if(msg)h+="<p class="+(ok?"done":"warn")+">"+esc(msg)+"</p>";',
  'if(card.stamps>=SIZE){h+="<select id=drink><option value=\\"\\">Which drink? (optional)</option>";drinks.forEach(function(d){h+="<option>"+esc(d)+"</option>"});h+="</select><button class=btn id=free>Give free drink</button>"}',
  'else if(!ok){h+="<button class=btn id=stamp"+(card.stampedToday?" disabled":"")+">Add stamp</button>";if(card.stampedToday&&!msg)h+="<p class=note>Already stamped today. One visit a day.</p>"}',
  'h+="</div><p class=note>Scan the next card with this phone\'s camera.</p>";app.innerHTML=h;',
  'var s=document.getElementById("stamp");if(s)s.onclick=function(){call("staffStamp",[CARD,SPOT.spot,placeIn.value],function(r){var m;if(r.ok){m="Stamp added. "+r.card.stamps+" of "+SIZE+".";if(r.eventBonus)m+=" Event bonus: +1.";if(r.explorer)m+=" Explorer bonus: +1!"}else m=MSG[r.error]||"Something went wrong.";show(r.card||card,m,r.ok)})};',
  'var f=document.getElementById("free");if(f)f.onclick=function(){call("staffFreeDrink",[CARD,document.getElementById("drink").value],function(r){show(r.card||card,r.ok?"Free drink given. A new card has started.":MSG[r.error]||"Something went wrong.",r.ok)})}}',
  'function summary(){call("staffSummary",[],function(r){var h="<div class=box><p class=note style=\\"margin-top:0\\">To stamp a card, scan the customer\'s QR code with this phone\'s camera.</p></div><h1 style=\\"font-size:18px\\">Numbers</h1><table>";',
  '(r.rows||[]).forEach(function(x){h+="<tr><td>"+esc(x[0])+"</td><td>"+esc(x[1])+"</td></tr>"});app.innerHTML=h+"</table><p class=note>More detail is in the Summary tab of the Google Sheet.</p>"})}',
  'if(CARD){call("staffDrinks",[],function(d){drinks=d||[];call("staffCard",[CARD],function(r){if(r.ok)show(r.card);else app.innerHTML="<p class=warn>"+esc(MSG[r.error]||"Something went wrong.")+"</p>"})})}else summary();',
  '</script></body></html>'
].join("\n");
