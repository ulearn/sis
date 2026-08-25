/**
 * Native push via FCM HTTP v1 — delivers to devices registered in device_tokens
 * (the mobile app POSTs its FCM token to /sis/student/push-register on launch).
 *
 * AUTH: a Firebase service-account key for project `ulearn-d6d48` (this is NOT the
 * Drive/Sheets sa-key.json — that's a different GCP project, key-being-371817).
 * Path: env FIREBASE_SA_KEY, else .secrets/firebase-ulearn.json. If the key is
 * ABSENT, sendToStudent() warns once and no-ops — so the in-app inbox + email keep
 * working while the credential is still pending. Drop the key in and push turns on
 * with no code change.
 *
 * ANDROID now; iOS works through the same call once an APNs key is uploaded to the
 * Firebase project (no server change — FCM v1 fans out to both platforms).
 *
 * Best-effort by contract: never throws to the caller (a failed push must not break
 * the message write or the email). Dead tokens (UNREGISTERED) are pruned.
 */
import fs from 'fs';
import path from 'path';
import { JWT } from 'google-auth-library';
import type { PrismaClient } from '../generated/prisma/client';

const PROJECT_ID = 'ulearn-d6d48';
const FCM_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;
const SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const KEY_PATH = process.env.FIREBASE_SA_KEY || path.join(__dirname, '..', '..', '.secrets', 'firebase-ulearn.json');

let _jwt: JWT | null = null;
let _warnedMissing = false;

function jwtClient(): JWT | null {
  if (_jwt) return _jwt;
  if (!fs.existsSync(KEY_PATH)) {
    if (!_warnedMissing) {
      console.warn(`[push] Firebase key not found at ${KEY_PATH} — native push disabled (in-app inbox + email unaffected). Drop the ulearn-d6d48 service-account JSON there to enable.`);
      _warnedMissing = true;
    }
    return null;
  }
  const key = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  _jwt = new JWT({ email: key.client_email, key: key.private_key, scopes: [SCOPE] });
  return _jwt;
}

/** Flatten an HTML body to a short plain-text push line. */
export function stripHtml(html: string, max = 140): string {
  const t = String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

export function pushScripts(prisma: PrismaClient) {
  return {
    /**
     * Fire a native push to every device the student has registered.
     * Returns { sent, pruned }. Never throws.
     */
    async sendToStudent(studentId: number, msg: { title: string; body: string; data?: Record<string, string> }) {
      try {
        const client = jwtClient();
        if (!client) return { sent: 0, pruned: 0 };
        const tokens = await prisma.deviceToken.findMany({ where: { studentId }, select: { token: true } });
        if (!tokens.length) return { sent: 0, pruned: 0 };
        const { token: access } = await client.getAccessToken();
        if (!access) return { sent: 0, pruned: 0 };

        let sent = 0;
        const dead: string[] = [];
        for (const { token } of tokens) {
          const payload = {
            message: {
              token,
              notification: { title: msg.title, body: msg.body },
              data: msg.data || {},
              android: { priority: 'HIGH', notification: { default_sound: true } },
            },
          };
          const r = await fetch(FCM_ENDPOINT, {
            method: 'POST',
            headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (r.ok) { sent++; continue; }
          const errText = await r.text().catch(() => '');
          // Only prune on a definitive "this token is dead" signal — NOT on a
          // generic INVALID_ARGUMENT (that can mean a payload bug, and we must not
          // delete live tokens over our own mistake).
          if (r.status === 404 || /UNREGISTERED|registration-token-not-registered/i.test(errText)) {
            dead.push(token);
          } else {
            console.warn(`[push] FCM ${r.status} for student ${studentId}: ${errText.slice(0, 200)}`);
          }
        }
        if (dead.length) await prisma.deviceToken.deleteMany({ where: { token: { in: dead } } });
        return { sent, pruned: dead.length };
      } catch (e: any) {
        console.warn(`[push] sendToStudent(${studentId}) failed: ${e?.message || e}`);
        return { sent: 0, pruned: 0 };
      }
    },
  };
}
