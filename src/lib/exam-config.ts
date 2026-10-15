// Exam-module runtime config — editable without a redeploy (admin Settings
// writes it; the cron + request path read it). Mirrors the data/*.json + armed
// pattern used by auto-nudge / arrival-reminder. File: data/exam-config.json.
//
//  - cesEmail        : the VERIFIED CES exam-registration address. Null blocks
//                      live sends (spec: never assume a general enquiries address).
//  - sendsArmed      : master switch for live CES request sends (Neil: ON).
//  - directPayEnabled: V1=false → ULearn pays CES for EVERY student (they already
//                      paid us). V2=true → honour the per-booking EXAM_FEE extra
//                      (extra=prepaid/we pay CES; no extra=student pays CES direct).
//                      Keep OFF until legacy bundled-but-no-extra bookings clear.
//  - eligibilityWeek : programme week the exam requirement becomes visible (12).
//  - resultLeadWeeks : soft preference — results should be available at least this
//                      many weeks before the permission window ends (NOT a hard
//                      block; see spec §3 — regulatory rules stay configurable).
//  - reminders       : follow-up cron schedule (ships DARK: armed=false).
import fs from 'fs';
import path from 'path';

export interface ExamConfig {
  cesEmail: string | null;
  sendsArmed: boolean;
  directPayEnabled: boolean;
  eligibilityWeek: number;
  resultLeadWeeks: number;
  reminders: { armed: boolean; ackDays: number; escalateDays: number; preExamDays: number };
}

const CONFIG_PATH = path.join(__dirname, '..', '..', 'data', 'exam-config.json');

const DEFAULTS: ExamConfig = {
  cesEmail: null,
  sendsArmed: true,
  directPayEnabled: false,   // V1: ULearn pays CES for everyone (they already paid us)
  eligibilityWeek: 12,
  resultLeadWeeks: 8,
  reminders: { armed: false, ackDays: 3, escalateDays: 7, preExamDays: 7 },
};

export function getExamConfig(): ExamConfig {
  try {
    const saved = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) || {};
    return {
      cesEmail: typeof saved.cesEmail === 'string' && saved.cesEmail.trim() ? saved.cesEmail.trim() : null,
      sendsArmed: saved.sendsArmed !== false,          // default ON
      directPayEnabled: saved.directPayEnabled === true, // default OFF (V1 — we pay CES)
      eligibilityWeek: Number.isFinite(saved.eligibilityWeek) ? saved.eligibilityWeek : DEFAULTS.eligibilityWeek,
      resultLeadWeeks: Number.isFinite(saved.resultLeadWeeks) ? saved.resultLeadWeeks : DEFAULTS.resultLeadWeeks,
      reminders: {
        armed: saved.reminders?.armed === true,         // default DARK
        ackDays: Number.isFinite(saved.reminders?.ackDays) ? saved.reminders.ackDays : DEFAULTS.reminders.ackDays,
        escalateDays: Number.isFinite(saved.reminders?.escalateDays) ? saved.reminders.escalateDays : DEFAULTS.reminders.escalateDays,
        preExamDays: Number.isFinite(saved.reminders?.preExamDays) ? saved.reminders.preExamDays : DEFAULTS.reminders.preExamDays,
      },
    };
  } catch {
    return { ...DEFAULTS, reminders: { ...DEFAULTS.reminders } };
  }
}

export function updateExamConfig(patch: Partial<ExamConfig>): ExamConfig {
  const cur = getExamConfig();
  const next: ExamConfig = {
    ...cur,
    ...patch,
    reminders: { ...cur.reminders, ...(patch.reminders || {}) },
  };
  if (typeof next.cesEmail === 'string') next.cesEmail = next.cesEmail.trim() || null;
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2));
  return next;
}
