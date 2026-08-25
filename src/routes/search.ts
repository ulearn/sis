// Cross-entity contact search — feeds the email To: field autocomplete
// across every comms block in the admin UI (host, teacher, student pages
// + the older pvComms / sdTo compose paths). One endpoint so all callers
// get the same matching rules and ranking.
//
// Returns a flat list of { id, name, email, type, subtitle } from
// students + accommodation providers (hosts) + teachers. Filtered to
// rows that have an email address (otherwise the To: field can't use
// them). If contextType is passed, results of that type bubble to the
// top so e.g. on a host page the host matches surface first.
import { Router } from 'express';
import { PrismaClient } from '../generated/prisma/client';

export function searchRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get('/contacts', async (req, res) => {
    const q = String(req.query.q || '').trim();
    const contextType = String(req.query.contextType || ''); // 'student' | 'provider' | 'teacher' | ''
    if (q.length < 2) return res.json({ items: [] });

    try {
      // ILIKE on indexed name + email columns. unaccent() on both sides
      // per the project convention (see reference_unaccent_search memory)
      // so accented names match plain queries and vice versa.
      const like = `%${q}%`;

      const [students, providers, teachers]: [any[], any[], any[]] = await Promise.all([
        prisma.$queryRaw<any[]>`
          SELECT id, first_name, last_name, email, nationality
            FROM students
           WHERE email IS NOT NULL AND email <> ''
             AND (unaccent(first_name || ' ' || COALESCE(last_name, '')) ILIKE unaccent(${like})
                  OR unaccent(email) ILIKE unaccent(${like}))
           ORDER BY last_name NULLS LAST, first_name
           LIMIT 12
        `,
        prisma.$queryRaw<any[]>`
          SELECT id, name, contact_first_name, contact_last_name, email, type, city
            FROM accommodation_providers
           WHERE email IS NOT NULL AND email <> ''
             AND (unaccent(name) ILIKE unaccent(${like})
                  OR unaccent(COALESCE(contact_first_name, '') || ' ' || COALESCE(contact_last_name, '')) ILIKE unaccent(${like})
                  OR unaccent(email) ILIKE unaccent(${like}))
           ORDER BY name
           LIMIT 12
        `,
        prisma.$queryRaw<any[]>`
          SELECT id, first_name, last_name, email
            FROM teachers
           WHERE email IS NOT NULL AND email <> ''
             AND (unaccent(first_name || ' ' || COALESCE(last_name, '')) ILIKE unaccent(${like})
                  OR unaccent(email) ILIKE unaccent(${like}))
           ORDER BY last_name NULLS LAST, first_name
           LIMIT 12
        `,
      ]);

      const items = [
        ...students.map(s => ({
          id: s.id,
          type: 'student' as const,
          name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          email: s.email,
          subtitle: s.nationality ? `Student · ${s.nationality}` : 'Student',
        })),
        ...providers.map(p => ({
          id: p.id,
          type: 'provider' as const,
          name: p.name,
          email: p.email,
          subtitle: [p.type, [p.contact_first_name, p.contact_last_name].filter(Boolean).join(' '), p.city].filter(Boolean).join(' · '),
        })),
        ...teachers.map(t => ({
          id: t.id,
          type: 'teacher' as const,
          name: `${t.first_name || ''} ${t.last_name || ''}`.trim(),
          email: t.email,
          subtitle: 'Teacher',
        })),
      ];

      // Bias by current page context — same-type matches first, others below.
      const typePriority = (t: string) => (t === contextType ? 0 : 1);
      items.sort((a, b) => typePriority(a.type) - typePriority(b.type));

      res.json({ items: items.slice(0, 20) });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  return router;
}
