// Exam-sitting CSV parsing + column mapping — one source of truth for the admin
// importer (routes/exams.ts) and the initial one-off load. Tolerant of the
// real-world CES sheet headers (e.g. "Published start", "CEFR level").

// Quote-aware CSV → array of row objects keyed by normalised snake_case header.
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = '', row: string[] = [], inQuotes = false;
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') { if (src[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); field = ''; row = []; }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const nonEmpty = rows.filter(r => r.some(c => c.trim() !== ''));
  if (!nonEmpty.length) return [];
  const headers = nonEmpty[0].map(h => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
  return nonEmpty.slice(1).map(r => {
    const o: Record<string, string> = {};
    headers.forEach((h, i) => { o[h] = (r[i] ?? '').trim(); });
    return o;
  });
}

const EXAM_CODE_ALIASES: Record<string, string> = {
  b1_preliminary: 'B1_PRELIMINARY', pet: 'B1_PRELIMINARY', b1: 'B1_PRELIMINARY', preliminary: 'B1_PRELIMINARY',
  b2_first: 'B2_FIRST', fce: 'B2_FIRST', b2: 'B2_FIRST', first: 'B2_FIRST',
  c1_advanced: 'C1_ADVANCED', cae: 'C1_ADVANCED', c1: 'C1_ADVANCED', advanced: 'C1_ADVANCED',
  ielts_gt: 'IELTS_GT', ielts: 'IELTS_GT', ielts_general: 'IELTS_GT', ielts_general_training: 'IELTS_GT', gt: 'IELTS_GT',
};
export function normExamCode(s?: string): string | null {
  if (!s) return null;
  const k = s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  if (EXAM_CODE_ALIASES[k]) return EXAM_CODE_ALIASES[k];
  for (const [alias, code] of Object.entries(EXAM_CODE_ALIASES)) if (k.includes(alias)) return code;
  return null;
}

// Accept YYYY-MM-DD or DD/MM/YYYY (sheet export) → YYYY-MM-DD.
export function normDate(s?: string): string | null {
  if (!s) return null;
  const t = s.trim();
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = t.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/); if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  const d = new Date(t); return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

// Map parsed CSV rows → normalised sitting objects for examScripts.importSittings.
// Exam code reads exam_code, else a friendly Exam column ("Preliminary"/"First"/
// "Advanced") or a CEFR-level column; time reads start_time / time / published_start.
export function csvRowsToSittings(rows: Record<string, string>[]): any[] {
  return rows.map(r => {
    const code = normExamCode(r.exam_code || r.exam || r.examination || r.code || r.qualification || r.cefr_level || r.level);
    const date = normDate(r.exam_date || r.date || r.sitting_date);
    const fee = (r.fee_eur || r.fee || r.price || '').replace(/[^0-9.]/g, '');
    return {
      examCode: code,
      provider: r.provider || undefined,
      examDate: date,
      startTime: r.start_time || r.time || r.published_start || r.start || null,
      endTime: r.end_time || r.end || r.finish || null,
      feeEur: fee || null,
      externalExamId: r.external_exam_id || r.external_id || r.bc_id || null,
      sourceUrl: r.source_url || r.source || null,
      sourceCheckedAt: r.source_checked_at || r.last_checked || r.captured || null,
      notes: r.notes || r.caveats || null,
      status: 'PUBLISHED',
    };
  });
}

export function parseExamCsvToSittings(text: string): any[] {
  return csvRowsToSittings(parseCsv(text));
}
