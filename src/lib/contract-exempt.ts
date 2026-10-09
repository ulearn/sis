// Agencies exempt from signing the commercial ETO partner agreement — non-
// commercial schools (HubSpot Industry = Primary/Secondary Education), which buy
// at net terms with no commission and shouldn't sign a reseller/commission
// contract. STOPGAP by id until the industry-keyed "Net Terms" partner type +
// contract variant is built (Neil 2026-09-15).
export const CONTRACT_EXEMPT_AGENCIES = new Set<number>([632]); // Colegio Vitoria (school)

export function isContractExempt(agencyId: number | null | undefined): boolean {
  return agencyId != null && CONTRACT_EXEMPT_AGENCIES.has(agencyId);
}
