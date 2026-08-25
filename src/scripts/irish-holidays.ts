/**
 * Irish statutory public (bank) holidays — pure, no DB.
 *
 * IMPORTANT: bank holidays deliberately live ONLY here, never in the
 * school_closures table. In a payroll sense a bank holiday does not exist — it
 * is a normal paid day; the teacher is paid regardless, the only real effect is
 * that the building is physically closed. school_closures is read by payroll
 * (class cost/revenue + occurrence suppression), so storing bank holidays there
 * would invent a payroll treatment that must not exist. Keeping them code-only
 * means there is no row to leak: the two concerns never meet.
 *
 * Consumers:
 *   · Day-1 email — shifts the first lesson to Tuesday when the start Monday is
 *     a bank holiday (locked-door warning).
 *   · Holidays admin UI — read-only reference overlay, never persisted.
 *
 * DATES: served from data/bank-holidays.json (the persisted store, read fresh on
 * every call so the annual cron's writes are picked up without a restart). It
 * ships seeded with the ACTUAL published 2026 & 2027 dates (verified 2026-08-13
 * against publicholidays.ie, cross-checked vs the gov.ie/citizensinformation
 * summary), incl. weekend→weekday substitutes. The Dec-31 cron
 * (cron-bank-holidays) computes the following year and writes it into the store.
 * Any year missing from the store falls back to on-the-fly computation, which
 * handles cascading substitutes (Christmas Sat + St Stephen's Sun → Mon + Tue) —
 * the case my first "next Monday" version got wrong. The JSON is hand-editable
 * for the rare ad-hoc one-off holiday (e.g. a national day of mourning), which
 * no rule or computation can predict.
 */
import fs from 'fs';
import path from 'path';

export interface BankHoliday {
  date: string; // 'YYYY-MM-DD' (UTC)
  name: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

const STORE_PATH = path.join(__dirname, '..', '..', 'data', 'bank-holidays.json');

// Embedded fallback used only if the JSON store is missing/unreadable — the same
// verified published dates the store ships with, so the module never breaks.
const DEFAULTS: Record<string, BankHoliday[]> = {
  '2026': [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-02-02', name: "St Brigid's Day" },
    { date: '2026-03-17', name: "St Patrick's Day" },
    { date: '2026-04-06', name: 'Easter Monday' },
    { date: '2026-05-04', name: 'May Bank Holiday' },
    { date: '2026-06-01', name: 'June Bank Holiday' },
    { date: '2026-08-03', name: 'August Bank Holiday' },
    { date: '2026-10-26', name: 'October Bank Holiday' },
    { date: '2026-12-25', name: 'Christmas Day' },
    { date: '2026-12-26', name: "St Stephen's Day" },
    { date: '2026-12-28', name: "St Stephen's Day (substitute)" },
  ],
  '2027': [
    { date: '2027-01-01', name: "New Year's Day" },
    { date: '2027-02-01', name: "St Brigid's Day" },
    { date: '2027-03-17', name: "St Patrick's Day" },
    { date: '2027-03-29', name: 'Easter Monday' },
    { date: '2027-05-03', name: 'May Bank Holiday' },
    { date: '2027-06-07', name: 'June Bank Holiday' },
    { date: '2027-08-02', name: 'August Bank Holiday' },
    { date: '2027-10-25', name: 'October Bank Holiday' },
    { date: '2027-12-25', name: 'Christmas Day' },
    { date: '2027-12-26', name: "St Stephen's Day" },
    { date: '2027-12-27', name: 'Christmas Day (substitute)' },
    { date: '2027-12-28', name: "St Stephen's Day (substitute)" },
  ],
};

/** Read the persisted store fresh (so cron writes are seen without a restart). */
function loadStore(): Record<string, BankHoliday[]> {
  try {
    const raw = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    if (raw && typeof raw === 'object' && Object.keys(raw).length) return raw;
  } catch { /* fall through to embedded defaults */ }
  return DEFAULTS;
}

/**
 * Compute a year's holidays from the statutory rules (fixed dates + nth/last
 * Monday + Easter computus + cascading weekend substitutes). Exported so the
 * annual cron can persist the next year, and used as the fallback for any year
 * not in the store.
 */
export function computeHolidayList(year: number): BankHoliday[] {
  const U = (m: number, day: number) => new Date(Date.UTC(year, m, day));
  const nthMonday = (m: number, n: number) => {
    const d = U(m, 1); let c = 0;
    while (true) { if (d.getUTCDay() === 1 && ++c === n) return new Date(d); d.setUTCDate(d.getUTCDate() + 1); }
  };
  const lastMonday = (m: number) => {
    const d = U(m + 1, 0); // last day of month m
    while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() - 1);
    return new Date(d);
  };
  // Gregorian Easter (Anonymous computus) → Easter Monday
  const a = year % 19, b = Math.floor(year / 100), c = year % 100,
    d0 = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d0 - g + 15) % 30,
    i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
    mth = Math.floor((a + 11 * h + 22 * l) / 451),
    month = Math.floor((h + l - 7 * mth + 114) / 31) - 1,
    day = ((h + l - 7 * mth + 114) % 31) + 1;
  const easterMonday = U(month, day); easterMonday.setUTCDate(easterMonday.getUTCDate() + 1);

  const base: BankHoliday[] = [
    { date: iso(U(0, 1)), name: "New Year's Day" },
    { date: iso(nthMonday(1, 1)), name: "St Brigid's Day" },   // 1st Mon Feb (2023+)
    { date: iso(U(2, 17)), name: "St Patrick's Day" },
    { date: iso(easterMonday), name: 'Easter Monday' },
    { date: iso(nthMonday(4, 1)), name: 'May Bank Holiday' },
    { date: iso(nthMonday(5, 1)), name: 'June Bank Holiday' },
    { date: iso(nthMonday(7, 1)), name: 'August Bank Holiday' },
    { date: iso(lastMonday(9)), name: 'October Bank Holiday' },
    { date: iso(U(11, 25)), name: 'Christmas Day' },
    { date: iso(U(11, 26)), name: "St Stephen's Day" },
  ];

  // Weekend→weekday substitutes for the fixed-date holidays, processed in date
  // order so consecutive ones cascade (Christmas Sat → Mon, St Stephen's Sun →
  // Tue, because Mon is already taken).
  const taken = new Set(base.map(x => x.date));
  const subs: BankHoliday[] = [];
  for (const fx of [{ d: U(0, 1), n: "New Year's Day" }, { d: U(2, 17), n: "St Patrick's Day" },
                    { d: U(11, 25), n: 'Christmas Day' }, { d: U(11, 26), n: "St Stephen's Day" }]) {
    if (fx.d.getUTCDay() === 0 || fx.d.getUTCDay() === 6) {
      const s = new Date(fx.d);
      do { s.setUTCDate(s.getUTCDate() + 1); }
      while (s.getUTCDay() === 0 || s.getUTCDay() === 6 || taken.has(iso(s)));
      taken.add(iso(s));
      subs.push({ date: iso(s), name: `${fx.n} (substitute)` });
    }
  }
  return [...base, ...subs].sort((x, y) => x.date.localeCompare(y.date));
}

/** Named Irish statutory public holidays for a calendar year (UTC). */
export function irishPublicHolidayList(year: number): BankHoliday[] {
  return loadStore()[String(year)] ?? computeHolidayList(year);
}

/**
 * Compute `year` and persist it into the store (used by the Dec-31 cron to pull
 * the following year in). Overwrites any existing entry for that year — safe
 * because the computation is factually correct for the standard 10 statutory
 * holidays. Returns the list written.
 */
export function saveComputedYear(year: number): BankHoliday[] {
  const store = { ...loadStore() };
  const list = computeHolidayList(year);
  store[String(year)] = list;
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2) + '\n');
  return list;
}

/** ISO-date Set for a year — fast membership test (used by the Day-1 email). */
export function irishPublicHolidays(year: number): Set<string> {
  return new Set(irishPublicHolidayList(year).map(h => h.date));
}

/** All bank holidays whose date falls within [fromIso, toIso] inclusive. */
export function bankHolidaysInRange(fromIso: string, toIso: string): BankHoliday[] {
  const y0 = Number(fromIso.slice(0, 4)), y1 = Number(toIso.slice(0, 4));
  const out: BankHoliday[] = [];
  for (let y = y0; y <= y1; y++) {
    for (const h of irishPublicHolidayList(y)) {
      if (h.date >= fromIso && h.date <= toIso) out.push(h);
    }
  }
  return out;
}
