import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import https from 'https';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const ALLOWED_SENDERS = [
  'info@ulearnschool.com',
  'accomm@ulearnschool.com',  // accommodation team — used by Kelly's apartment/host comms
  'dos@ulearnschool.com',
  'sales@ulearnschool.com',
  'accounts@ulearnschool.com',
  'partners@ulearnschool.com',
  'success@ulearnschool.com',
  'app@ulearnschool.com',     // student-app identity — a Workspace alias of success@
];

// app@ is a Workspace ALIAS of success@, not a standalone mailbox. Gmail
// domain-wide delegation can only impersonate a real user, so we authenticate
// AS the underlying mailbox and let the alias ride on the From header (Workspace
// auto-enables send-as for aliases). Map alias → real mailbox to impersonate.
const ALIAS_MAILBOX: Record<string, string> = {
  'app@ulearnschool.com': 'success@ulearnschool.com',
};

// House-style wrap + signature — applied to EVERY outbound email by default.
// Verdana 12pt #2B2B2B (the established --ink colour across the LMS shell)
// + line-height 1.6. Recipients see the same brand format regardless of which
// composer / template / caller produced the body. Callers can opt out with
// houseStyle:false (rare — only for raw HTML that already self-styles).
//
// Signature.html is loaded once at startup. Path is best-effort across the
// two known locations — see history of relocations in the templates folder.
const SIG_PATH_CANDIDATES = [
  path.join(__dirname, '..', '..', '.claude', 'docs', 'Templates', 'Fidelo Email Templates', 'signature.html'),
  path.join(__dirname, '..', '..', '.claude', 'docs', 'Email Templates', 'signature.html'),
];
const _sigPath = SIG_PATH_CANDIDATES.find(p => fs.existsSync(p));
const SIGNATURE_HTML = _sigPath ? fs.readFileSync(_sigPath, 'utf-8') : '';
if (!_sigPath) console.warn('[email] signature.html not found — outbound emails will be unsigned');

// Per-sender signature overrides. Every sender gets the default signature.html
// UNLESS a `signature-<key>.html` sits beside it — e.g. signature-accomm.html
// for accomm@ (the accommodation team's own sign-off). Loaded once at startup.
// To add another: drop the file + add a line here.
const _sigDir = _sigPath ? path.dirname(_sigPath) : null;
function _loadSig(file: string): string {
  if (!_sigDir) return '';
  const p = path.join(_sigDir, file);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
}
const SENDER_SIGNATURES: Record<string, string> = {
  'accomm@ulearnschool.com': _loadSig('signature-accomm.html'),
};
function signatureFor(from?: string): string {
  const override = from ? SENDER_SIGNATURES[from] : '';
  return override && override.trim() ? override : SIGNATURE_HTML;
}

function applyHouseStyle(bodyHtml: string, from?: string): string {
  const sig = signatureFor(from);
  return (
    `<div style="font-family:Verdana,Geneva,sans-serif;font-size:12pt;color:#2B2B2B;line-height:1.6">` +
    bodyHtml + (sig ? '<br>' + sig : '') +
    `</div>`
  );
}

function getAuth(impersonateEmail: string): JWT {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyPath || !fs.existsSync(keyPath)) {
    throw new Error('Service account key file not found: ' + keyPath);
  }
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));

  return new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: SCOPES,
    subject: impersonateEmail,
  });
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

function buildRawEmail(opts: {
  from: string;
  fromName?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}): string {
  const hasAttachments = opts.attachments && opts.attachments.length > 0;
  const mixedBoundary = '----=_Mixed_' + Date.now().toString(36);
  const altBoundary = '----=_Alt_' + Date.now().toString(36) + '_a';

  const contentType = hasAttachments
    ? `multipart/mixed; boundary="${mixedBoundary}"`
    : `multipart/alternative; boundary="${altBoundary}"`;

  const headers = [
    `From: ${opts.fromName ? `${opts.fromName} <${opts.from}>` : opts.from}`,
    `To: ${opts.to}`,
    opts.cc ? `Cc: ${opts.cc}` : '',
    opts.bcc ? `Bcc: ${opts.bcc}` : '',
    `Subject: =?UTF-8?B?${Buffer.from(opts.subject).toString('base64')}?=`,
    opts.replyTo ? `Reply-To: ${opts.replyTo}` : '',
    'MIME-Version: 1.0',
    `Content-Type: ${contentType}`,
  ].filter(Boolean).join('\r\n');

  const plainText = opts.html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  const textParts = [
    `--${altBoundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    plainText,
    `--${altBoundary}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    opts.html,
    `--${altBoundary}--`,
  ].join('\r\n');

  let body: string;
  if (hasAttachments) {
    let parts = [
      `--${mixedBoundary}`,
      `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
      '',
      textParts,
    ].join('\r\n');

    for (const att of opts.attachments!) {
      parts += '\r\n' + [
        `--${mixedBoundary}`,
        `Content-Type: ${att.contentType}; name="${att.filename}"`,
        `Content-Disposition: attachment; filename="${att.filename}"`,
        'Content-Transfer-Encoding: base64',
        '',
        att.content.toString('base64').replace(/(.{76})/g, '$1\r\n'),
      ].join('\r\n');
    }
    parts += `\r\n--${mixedBoundary}--`;
    body = parts;
  } else {
    body = textParts;
  }

  const raw = headers + '\r\n\r\n' + body;

  return Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Call Gmail API directly via https — avoids importing the massive googleapis package
async function gmailSend(accessToken: string, raw: string): Promise<{ id: string; threadId: string }> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ raw });
    const req = https.request({
      hostname: 'gmail.googleapis.com',
      path: '/gmail/v1/users/me/messages/send',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          const parsed = JSON.parse(data);
          resolve({ id: parsed.id, threadId: parsed.threadId });
        } else {
          reject(new Error(`Gmail API ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export async function sendEmail(opts: {
  from: string;
  fromName?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  // Set false to send raw HTML without the Verdana/12pt/#2B2B2B wrap + signature.
  // Default true — every email gets the brand format unless the caller knows
  // it's sending fully self-styled HTML.
  houseStyle?: boolean;
}): Promise<{ messageId: string; threadId: string }> {
  if (!ALLOWED_SENDERS.includes(opts.from)) {
    throw new Error(`Sender "${opts.from}" not allowed. Use one of: ${ALLOWED_SENDERS.join(', ')}`);
  }

  const auth = getAuth(ALIAS_MAILBOX[opts.from] || opts.from);
  const tokenRes = await auth.authorize();
  const accessToken = tokenRes.access_token;
  if (!accessToken) throw new Error('Failed to get access token');

  // Default-on house style + signature wrap. Pass houseStyle:false to opt out.
  const wrappedHtml = opts.houseStyle === false ? opts.html : applyHouseStyle(opts.html, opts.from);
  const raw = buildRawEmail({ ...opts, html: wrappedHtml });
  const result = await gmailSend(accessToken, raw);

  return {
    messageId: result.id,
    threadId: result.threadId,
  };
}

export function getAllowedSenders() {
  return ALLOWED_SENDERS;
}
