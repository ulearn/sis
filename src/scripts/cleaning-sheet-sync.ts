// Cleaning queue ↔ Google Sheet sync.
//
// One sync call performs both directions:
//   1. Pull — read the sheet, mark any rows where Done=TRUE as cleaned in SIS.
//   2. Push — overwrite the sheet with SIS's current open queue (which now
//      excludes anything we just marked done).
//
// Auth: reuses the existing service account from email.ts. The target sheet
// must be shared with the service account email as Editor — surfaces a
// helpful error if not.
//
// Sheet shape (header in row 1):
//   A: ID  B: Week  C: Apartment/Room  D: Checking Out
//   E: Checkout  F: Next Arrival  G: Urgency Window  H: Done  I: Notes
//
// The Done column should be formatted as Insert → Tick box in Sheets so
// the cleaner sees a checkbox; UNFORMATTED_VALUE returns it as a boolean
// regardless of formatting.

import { JWT } from 'google-auth-library';
import fs from 'fs';
import https from 'https';
import { PrismaClient } from '../generated/prisma/client';
import { accommodationScripts } from './accommodation';

const SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const HEADERS = ['ID', 'Week', 'Apartment / Room', 'Checking Out', 'Checkout', 'Next Arrival', 'Urgency Window', 'Done', 'Notes'];

function getAuth(): JWT {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyPath || !fs.existsSync(keyPath)) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY missing — cannot auth to Sheets');
  }
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
  return new JWT({ email: key.client_email, key: key.private_key, scopes: SHEETS_SCOPES });
}

function callSheets(token: string, method: string, path: string, body?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'sheets.googleapis.com',
      path: '/v4/spreadsheets' + path,
      method,
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if ((res.statusCode || 0) >= 400) {
            const msg = parsed.error?.message || `Sheets API ${res.statusCode}`;
            // Surface the share-permission case in plain English
            if (/permission|403|not have access/i.test(msg)) {
              return reject(new Error('Sheets API: share the sheet with the SIS service account as Editor — ' + msg));
            }
            return reject(new Error(msg));
          }
          resolve(parsed);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getTabName(token: string, spreadsheetId: string, gid: number): Promise<string> {
  const meta: any = await callSheets(token, 'GET', `/${spreadsheetId}?fields=sheets.properties`);
  const sheet = meta.sheets?.find((s: any) => s.properties?.sheetId === gid);
  if (!sheet) throw new Error(`Tab with gid ${gid} not found in spreadsheet`);
  return sheet.properties.title;
}

function quoteTab(name: string): string {
  // Sheets requires single-quote wrapping when the name has spaces or
  // special chars; embedded quotes get doubled.
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : `'${name.replace(/'/g, "''")}'`;
}

function fmtDateTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtUrgency(h: number | null): string {
  if (h == null) return 'No next';
  if (h < 0) return `${Math.abs(h)}h overdue`;
  if (h < 48) return `${h} Hours`;
  return `${Math.round(h / 24)} Days`;
}

function weekLabel(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : new Date(iso);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(monday.getDate())}/${pad(monday.getMonth() + 1)}-${pad(sunday.getDate())}/${pad(sunday.getMonth() + 1)}/${sunday.getFullYear()}`;
}

export async function syncCleaningSheet(prisma: PrismaClient, providerId: number): Promise<{ pushed: number; thisWeekCleaned: number; markedDone: number; tab: string }> {
  const provider = await prisma.accommodationProvider.findUnique({
    where: { id: providerId },
    select: { id: true, name: true, cleaningEnabled: true, cleaningSheetId: true, cleaningSheetGid: true },
  });
  if (!provider) throw new Error('Provider not found');
  if (!provider.cleaningEnabled) throw new Error('Cleaning is not enabled on this provider');
  if (!provider.cleaningSheetId || provider.cleaningSheetGid == null) {
    throw new Error('Sheet not configured — set the spreadsheet ID and tab gid first');
  }

  const auth = getAuth();
  const tok: any = await auth.authorize();
  const token = tok.access_token as string;

  const tabName = await getTabName(token, provider.cleaningSheetId, provider.cleaningSheetGid);
  const tab = quoteTab(tabName);

  // 1) PULL — read existing rows, mark Done ones cleaned in SIS
  const readRange = `${tab}!A2:H1000`;
  const readResp: any = await callSheets(
    token, 'GET',
    `/${provider.cleaningSheetId}/values/${encodeURIComponent(readRange)}?valueRenderOption=UNFORMATTED_VALUE`
  );
  const existingRows: any[][] = readResp.values || [];
  let markedDone = 0;
  for (const row of existingRows) {
    const placementId = parseInt(row[0]);
    const done = row[7];
    if (!placementId || !done) continue;
    const isDone = done === true || String(done).toUpperCase() === 'TRUE';
    if (!isDone) continue;
    const p = await prisma.bookingAccommodation.findUnique({ where: { id: placementId } });
    if (p && !p.cleanedAt) {
      await prisma.bookingAccommodation.update({
        where: { id: placementId },
        data: { cleanedAt: new Date(), cleanedBy: 'Sheet' },
      });
      markedDone++;
    }
  }

  // 2) PUSH — fetch the current queue (post-pull) and overwrite the range
  const accomm = accommodationScripts(prisma);
  const { items } = await accomm.getCleaningQueue(providerId);

  // Build the values array with weekly banner rows inserted between week
  // groups. Track the row indices of banner rows vs data rows so we can
  // apply formatting + validation precisely (no endless checkboxes below
  // the data; banners get merged/highlighted; data gets alt-striped).
  const valueRows: (string | number | boolean)[][] = [];
  const bannerIdxs: number[] = [];
  const dataIdxs: number[] = [];
  let lastWeekKey: string | null = null;
  for (const r of items) {
    const co = new Date(r.checkoutAt);
    const monday = new Date(co);
    monday.setDate(monday.getDate() + (monday.getDay() === 0 ? -6 : 1 - monday.getDay()));
    monday.setHours(0, 0, 0, 0);
    const wkKey = monday.toISOString().slice(0, 10);
    if (wkKey !== lastWeekKey) {
      const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
      const fmt = (d: Date) => d.toLocaleDateString('en-IE', { day: '2-digit', month: 'short' });
      bannerIdxs.push(valueRows.length); // 0-based, post-header
      valueRows.push([`Week of ${fmt(monday)} — ${fmt(sunday)}  ·  ${countWeek(items, wkKey)} clean${countWeek(items, wkKey) === 1 ? '' : 's'}`, '', '', '', '', '', '', '', '']);
      lastWeekKey = wkKey;
    }
    dataIdxs.push(valueRows.length);
    valueRows.push([
      r.id,
      weekLabel(r.checkoutAt),
      r.apartmentRoom,
      r.student || '',
      fmtDateTime(r.checkoutAt),
      r.nextStudent && r.nextCheckinAt ? `${r.nextStudent} · ${fmtDateTime(r.nextCheckinAt)}` : '',
      fmtUrgency(r.urgencyHours),
      // Reflect the actual SIS state so already-done items stay checked
      // in the sheet rather than appearing fresh on every sync.
      r.cleanedAt ? true : false,
      r.cleanedAt ? 'Cleaned' : '',
    ]);
  }

  // Reset formatting + validation + merges on the data area before writing
  // new values, so old banner rows / strips / endless checkboxes don't
  // linger across syncs.
  const sheetId = provider.cleaningSheetGid;
  const colCount = HEADERS.length;
  const FULL_RANGE = { sheetId, startRowIndex: 0, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: colCount };
  const COL_H_RANGE = { sheetId, startRowIndex: 0, endRowIndex: 1000, startColumnIndex: 7, endColumnIndex: 8 };

  await callSheets(token, 'POST', `/${provider.cleaningSheetId}:batchUpdate`, {
    requests: [
      { unmergeCells: { range: FULL_RANGE } },
      { updateCells: { range: FULL_RANGE, fields: 'userEnteredFormat' } },
      { setDataValidation: { range: COL_H_RANGE } },
    ],
  });

  // Now write values
  await callSheets(token, 'POST',
    `/${provider.cleaningSheetId}/values/${encodeURIComponent(`${tab}!A1:I1000`)}:clear`, {});
  await callSheets(token, 'PUT',
    `/${provider.cleaningSheetId}/values/${encodeURIComponent(`${tab}!A1`)}?valueInputOption=USER_ENTERED`,
    { values: [HEADERS, ...valueRows] });

  // Apply fresh formatting / merges / validation
  const requests: any[] = [];

  // Header — bold + underline + bottom border + don't wrap (so auto-resize
  // sizes column G on the unwrapped "Urgency Window" width)
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: colCount },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true, underline: true },
          borders: { bottom: { style: 'SOLID', width: 1 } },
          wrapStrategy: 'OVERFLOW_CELL',
          backgroundColor: { red: 0.96, green: 0.96, blue: 0.98 },
        },
      },
      fields: 'userEnteredFormat(textFormat,borders,wrapStrategy,backgroundColor)',
    },
  });

  // Alt-stripe data rows — every second data row gets a very light grey
  // background. Banner rows are excluded from striping; they get the
  // indigo treatment below which overrides any default white.
  for (let i = 0; i < dataIdxs.length; i++) {
    if (i % 2 !== 1) continue; // stripe every other one, starting with second
    const r = dataIdxs[i] + 1; // +1 because dataIdxs are 0-based post-header
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 0, endColumnIndex: colCount },
        cell: { userEnteredFormat: { backgroundColor: { red: 0.97, green: 0.97, blue: 0.98 } } },
        fields: 'userEnteredFormat.backgroundColor',
      },
    });
  }

  // Banner rows — indigo background + bold text + bordered top/bottom +
  // merge across A:I so the label flows wide and column A doesn't get
  // auto-resized to the banner's width.
  for (const idx of bannerIdxs) {
    const r = idx + 1; // post-header offset
    requests.push({
      mergeCells: {
        range: { sheetId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 0, endColumnIndex: colCount },
        mergeType: 'MERGE_ALL',
      },
    });
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 0, endColumnIndex: colCount },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, foregroundColor: { red: 0.22, green: 0.20, blue: 0.64 } },
            backgroundColor: { red: 0.93, green: 0.95, blue: 1.0 },
            borders: {
              top:    { style: 'SOLID',       width: 1, color: { red: 0.78, green: 0.82, blue: 1.0 } },
              bottom: { style: 'SOLID',       width: 1, color: { red: 0.88, green: 0.91, blue: 1.0 } },
            },
            verticalAlignment: 'MIDDLE',
            padding: { top: 4, bottom: 4, left: 8, right: 8 },
          },
        },
        fields: 'userEnteredFormat(textFormat,backgroundColor,borders,verticalAlignment,padding)',
      },
    });
  }

  // Checkbox validation — only on column H of the actual data rows.
  // Group contiguous data row indices so we send one request per run
  // instead of one per row.
  const ranges: { start: number; end: number }[] = [];
  let curStart: number | null = null;
  let curEnd: number = -2;
  for (const idx of dataIdxs) {
    if (idx === curEnd + 1) {
      curEnd = idx;
    } else {
      if (curStart != null) ranges.push({ start: curStart, end: curEnd });
      curStart = idx;
      curEnd = idx;
    }
  }
  if (curStart != null) ranges.push({ start: curStart, end: curEnd });
  for (const { start, end } of ranges) {
    requests.push({
      setDataValidation: {
        range: { sheetId, startRowIndex: start + 1, endRowIndex: end + 2, startColumnIndex: 7, endColumnIndex: 8 },
        rule: { condition: { type: 'BOOLEAN' }, strict: true, showCustomUi: true },
      },
    });
  }

  // Auto-resize all columns last so it sees final widths
  requests.push({
    autoResizeDimensions: {
      dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: colCount },
    },
  });

  // Uniform, slightly taller row height across header + banners + data
  // rows so the sheet reads with breathing room. Default is ~21px; 28px
  // gives the cleaner room to scan rows without crowding.
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 + valueRows.length },
      properties: { pixelSize: 28 },
      fields: 'pixelSize',
    },
  });

  if (requests.length > 0) {
    await callSheets(token, 'POST', `/${provider.cleaningSheetId}:batchUpdate`, { requests });
  }

  // `pushed` = every row written to the sheet (the wide window, kept so Kelly
  // can verify last weekend's cleans). `thisWeekCleaned` = the billable count:
  // turnovers CLEANED in the current ISO week — the same basis the Xero push
  // uses. Surfacing both stops the toast reading "6 sent" when only 4 are this
  // week's work (issue #50).
  const _mon = new Date(); _mon.setHours(0, 0, 0, 0);
  _mon.setDate(_mon.getDate() + (_mon.getDay() === 0 ? -6 : 1 - _mon.getDay()));
  const thisWeekCleaned = items.filter((r: any) => r.cleanedAt && new Date(r.cleanedAt) >= _mon).length;
  return { pushed: dataIdxs.length, thisWeekCleaned, markedDone, tab: tabName };
}

function countWeek(items: any[], wkKey: string): number {
  let n = 0;
  for (const r of items) {
    const co = new Date(r.checkoutAt);
    const m = new Date(co);
    m.setDate(m.getDate() + (m.getDay() === 0 ? -6 : 1 - m.getDay()));
    m.setHours(0, 0, 0, 0);
    if (m.toISOString().slice(0, 10) === wkKey) n++;
  }
  return n;
}
