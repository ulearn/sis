import { JWT } from 'google-auth-library';
import fs from 'fs';
import https from 'https';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const ALLOWED_SENDERS = [
  'info@ulearnschool.com',
  'dos@ulearnschool.com',
  'sales@ulearnschool.com',
  'accounts@ulearnschool.com',
  'partners@ulearnschool.com',
];

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
    `--${hasAttachments ? altBoundary : altBoundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    plainText,
    `--${hasAttachments ? altBoundary : altBoundary}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    opts.html,
    `--${hasAttachments ? altBoundary : altBoundary}--`,
  ].join('\r\n');

  let body: string;
  if (hasAttachments) {
    // Wrap text content in multipart/alternative inside multipart/mixed
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
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}): Promise<{ messageId: string; threadId: string }> {
  if (!ALLOWED_SENDERS.includes(opts.from)) {
    throw new Error(`Sender "${opts.from}" not allowed. Use one of: ${ALLOWED_SENDERS.join(', ')}`);
  }

  const auth = getAuth(opts.from);
  const tokenRes = await auth.authorize();
  const accessToken = tokenRes.access_token;
  if (!accessToken) throw new Error('Failed to get access token');

  const raw = buildRawEmail(opts);
  const result = await gmailSend(accessToken, raw);

  return {
    messageId: result.id,
    threadId: result.threadId,
  };
}

export function getAllowedSenders() {
  return ALLOWED_SENDERS;
}
