/**
 * KickStart-challenge social-post "Impact" score — the single source of truth
 * for ranking Progress Posts (admin leaderboard + student app).
 *
 *   Impact = 1·Likes + 5·Comments + 10·(Shares + Saves + Reposts)
 *
 * Rationale (see project_challenge_promo / chat 2026-06-28):
 *  - This is an ENGAGEMENT score, NOT a reach score. Views are deliberately
 *    EXCLUDED: they're passive, the most gameable metric, and at the scale of a
 *    student's reel (hundreds–few-thousand views, tens of likes) any view term
 *    swamps real engagement. Views are still captured + displayed for info, but
 *    they do not move the ranking.
 *  - Likes = 1 (low-effort signal); Comments = 5× (real engagement);
 *    Shares/Saves/Reposts = 10× (top "amplification" signals — they push the
 *    post to new audiences). An IG Reel shows these as likes, comments, reposts ↻,
 *    shares ➤, saves 🔖; missing metrics are just 0, so it degrades gracefully.
 *
 * Weights are v1 and deliberately tunable — re-fit after the first month of real
 * numbers. Keep them here so every surface computes the same number.
 */
export const IMPACT_WEIGHTS = { like: 1, comment: 5, amplify: 10 } as const;

export interface PostMetrics {
  views?: number | null;    // captured + displayed, but NOT scored
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;   // ➤ send / paper-plane
  saves?: number | null;    // 🔖 bookmark
  reposts?: number | null;  // ↻ repost
}

const n = (v: number | null | undefined): number => {
  const x = Number(v);
  return Number.isFinite(x) && x > 0 ? x : 0;
};

export function computeImpact(m: PostMetrics): number {
  const likes = n(m.likes);
  const comments = n(m.comments);
  const amplify = n(m.shares) + n(m.saves) + n(m.reposts); // all three amplify reach
  const score =
    IMPACT_WEIGHTS.like * likes +
    IMPACT_WEIGHTS.comment * comments +
    IMPACT_WEIGHTS.amplify * amplify;
  // One decimal is plenty for ranking; keeps the leaderboard tidy.
  return Math.round(score * 10) / 10;
}
