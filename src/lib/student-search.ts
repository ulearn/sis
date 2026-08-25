import { Prisma } from '../generated/prisma/client';

/**
 * Tokenised, accent-insensitive student search — the single source of truth for
 * "search students by name / email / id", shared by the SIS student list
 * (scripts/students.ts) and the partner portal (scripts/partners.ts).
 *
 * Behaviour: the term is split on whitespace; EACH token must match at least one
 * searchable column (AND across tokens, OR across columns). That's what lets a
 * pasted "Maria Agustina Quiñoa" match a row whose firstName is "Maria Agustina"
 * and lastName is "Quiñoa" — no single column contains the whole phrase.
 *
 * `unaccent()` wraps both column and term on the name columns so typed "Quinoa"
 * matches stored "Quiñoa" (matching only — the DB keeps the real characters).
 * Email and fidelo_customer_num carry no diacritics, so they skip unaccent. A
 * purely-numeric token additionally substring-matches the student id (so "97"
 * finds id 97, 970, 197 …).
 *
 * Returns a boolean SQL fragment for a WHERE clause, or Prisma.empty when blank.
 * IMPORTANT: the caller's query MUST alias the students table as `s`.
 */
export function studentSearchSql(search: string | null | undefined): Prisma.Sql {
  const s = (search || '').trim();
  if (!s) return Prisma.empty;

  const tokens = s.split(/\s+/).filter((t) => t.length > 0);
  const groups = tokens.map((tok) => {
    const term = `%${tok}%`;
    const idClause = /^\d+$/.test(tok) ? Prisma.sql` OR s.id::text ILIKE ${term}` : Prisma.empty;
    return Prisma.sql`(
      unaccent(s.first_name) ILIKE unaccent(${term})
      OR unaccent(s.last_name) ILIKE unaccent(${term})
      OR unaccent(s.nickname) ILIKE unaccent(${term})
      OR s.email ILIKE ${term}
      OR s.fidelo_customer_num ILIKE ${term}
      ${idClause}
    )`;
  });

  return Prisma.sql`(${Prisma.join(groups, ' AND ')})`;
}
