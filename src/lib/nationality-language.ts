// Derive a student's mother tongue (language NAME, e.g. "Spanish") from their
// nationality (country name). Source of truth = the long-established langmap
// (`data/lang-map.json`, copied from the hub `bird/scripts/country/lang-map.json`),
// which is stored inverted as { Language: [countries…] }. We build a
// country→language index from it once.
//
// A handful of nationalities arrive from HubSpot/CLDR under names the langmap
// doesn't carry ("Türkiye" vs "Turkey", "Czechia", the split Congos, etc.) — the
// OVERRIDES table maps those to a language (using the map's own language names).
// Fill-only by design: callers must never overwrite an existing language.
import fs from 'fs';
import path from 'path';

let _index: Record<string, string> | null = null;

function loadIndex(): Record<string, string> {
  if (_index) return _index;
  const candidates = [
    path.join(process.cwd(), 'data/lang-map.json'),
    path.join(__dirname, '../../data/lang-map.json'),
  ];
  const file = candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } });
  const idx: Record<string, string> = {};
  if (file) {
    try {
      const map = JSON.parse(fs.readFileSync(file, 'utf8'));
      for (const [lang, countries] of Object.entries(map)) {
        if (!Array.isArray(countries)) continue;   // skips the `metadata` entry
        for (const c of countries) idx[String(c).trim().toLowerCase()] = String(lang);
      }
    } catch { /* leave idx empty — derivation just returns null */ }
  }
  _index = idx;
  return idx;
}

// SIS/HubSpot nationality names the langmap doesn't carry → language name.
// Keys are lower-cased. Values use the langmap's own language vocabulary.
const OVERRIDES: Record<string, string> = {
  'türkiye': 'Turkish',
  'czechia': 'Czech',
  'congo - brazzaville': 'French',
  'congo - kinshasa': 'French',
  'palestinian territories': 'Arabic',
  'palestine': 'Arabic',
  'hong kong sar china': 'Chinese',
  'côte d’ivoire': 'French',
  "côte d'ivoire": 'French',
  'bosnia & herzegovina': 'Bosnian',
  'andorra': 'Spanish',           // langmap has no Catalan
  'antigua & barbuda': 'English',
  'western sahara': 'Arabic',
  'north macedonia': 'Macedonian',
  'haiti': 'French',              // langmap has no Haitian Creole
  'japanese': 'Japanese',          // demonym entered as a nationality
};

/** Mother tongue (language name) for a nationality, or null if unknown. */
export function languageForNationality(nationality: string | null | undefined): string | null {
  if (!nationality) return null;
  const key = String(nationality).trim().toLowerCase();
  if (!key) return null;
  return OVERRIDES[key] || loadIndex()[key] || null;
}
