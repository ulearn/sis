// Shared email-template renderer for CODE-triggered sends (cron, webhooks,
// route handlers) so every automated email pulls its copy from an editable DB
// document_template instead of burying HTML in code. Mirrors the {if}/{{token}}
// grammar the Communications composer uses (routes/email.ts applyTokens) so the
// SAME template row renders identically whether a human sends it from the UI or
// the code fires it. Keep the grammar in sync with that engine. (Neil 2026-09-24)
//
// Tokens are looked up by exact key first, then with the common `student.` /
// `booking.` / `accommodation.` prefixes, matching applyTokens' fallback — so a
// template can say {if email} / {{student.email}} and either resolves.
import type { PrismaClient } from '../generated/prisma/client';
import { emailTemplateWhere } from './email-templates';

export function applyTemplateTokens(input: string, tokens: Record<string, any>): string {
  const lookup = (rawKey: string): any => {
    const k = rawKey.trim();
    if (tokens[k] != null) return tokens[k];
    for (const p of ['student.', 'booking.', 'accommodation.']) {
      if (tokens[p + k] != null) return tokens[p + k];
    }
    return undefined;
  };
  let s = String(input || '');
  // {if token}...{/if} — render inner only when the token is truthy. Non-greedy
  // so sequential (non-nested) blocks each close correctly.
  s = s.replace(/\{if\s+([a-z0-9_.]+)\}([\s\S]*?)\{\/if\}/gi, (_m, key, content) => (lookup(key) ? content : ''));
  // {{token}} substitution.
  s = s.replace(/\{\{([^}]+)\}\}/g, (m, key) => {
    const v = lookup(key);
    return v != null ? String(v) : '';
  });
  // Strip any stray control markers so they never reach the recipient.
  s = s.replace(/\{if [^}]+\}/g, '').replace(/\{\/if\}/g, '').replace(/\{else\}/g, '');
  return s;
}

// Load an email template by slug and render subject + body against `tokens`.
// Returns null when the template row is missing/inactive so the caller can fall
// back to its inline builder (no silent blank email). Never throws.
export async function renderEmailTemplate(
  prisma: PrismaClient,
  slug: string,
  tokens: Record<string, any>,
  fallbackSubject?: string,
): Promise<{ subject: string; html: string } | null> {
  try {
    const tpl = await prisma.documentTemplate.findFirst({
      where: emailTemplateWhere(slug, { templateType: 'email', active: true }),
      select: { subject: true, htmlTemplate: true },
    });
    if (!tpl?.htmlTemplate) return null;
    return {
      subject: applyTemplateTokens(tpl.subject || fallbackSubject || '', tokens),
      html: applyTemplateTokens(tpl.htmlTemplate, tokens),
    };
  } catch (e: any) {
    console.warn(`[render-template] "${slug}" render failed — caller should fall back:`, e?.message || e);
    return null;
  }
}
