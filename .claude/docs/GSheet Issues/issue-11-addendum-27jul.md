# Issue 11 — Valeriya Salauyova / Egor Solovyov — HubSpot Link Null (Addendum 27 Jul 2026)
Reporter: Various | Area: Data | Sheet row: 12

Status (5th check, Mon 27 Jul 2026 UTC): UNCHANGED — now 48 days since last update

Evidence:
- Student 1063 (Valeriya Salauyova): hubspotContactId = null — last updated 9 Jun 2026 (48 days)
- Booking 17912: CONFIRMED, EUR 1,938 / 1,938 fully paid, confirmed = true, last updated 8 Jul 2026
- No HubSpot contact linked — visa sync and auto-updates will not work

Fix Recipe (NOT YET RUN):
Step 1 — Search HubSpot contacts for 'Valeriya Salauyova' (or 'Salauyova').
Step 2 — Obtain HubSpot contact ID.
Step 3 — UPDATE Student SET hubspot_contact_id = <contact_id>, updated_at = NOW() WHERE id = 1063;

Risk: Low. Data hygiene. Reversible. Blast radius: single student.
Status: OPEN. 5th check Mon 27 Jul 2026 UTC. hubspotContactId still null (48d). Fix NOT RUN.
