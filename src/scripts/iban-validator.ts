/**
 * IBAN Validator (mod-97 checksum per ISO 13616)
 *
 * Usage:
 *   validateIBAN('IE64IRCE92050112345678') → { valid: true, country: 'IE', bankCode: 'IRCE', bic: 'IRCDIE2D' }
 *   validateIBAN('IE64IRCE9205011234567')  → { valid: false, error: 'Invalid checksum' }
 */

// Irish bank code → BIC mapping
const IRISH_BIC_MAP: Record<string, string> = {
  'AIBK': 'AIBKIE2D',
  'BOFI': 'BOFIIE2D',
  'IPBS': 'IPBSIE2D',
  'PSTS': 'PTSBIE2D',
  'REVO': 'REVOGB21',  // Revolut (Lithuanian originally, now IE)
  'EBSI': 'EBSBIE2D',
  'DURU': 'DURUIE21',  // An Post / Düsseldorfer
  'CSDO': 'CSDOIE2D',  // Credit Suisse Dublin
  'ULSB': 'ULSBIE2D',  // Ulster Bank
  'NAIA': 'NAIAIE21',  // N26
  'BLTN': 'BLTNIE21',  // Bunq / N26
  'TRWI': 'TRWIGB2L',  // Wise (TransferWise)
};

export function validateIBAN(input: string): { valid: boolean; error?: string; country?: string; bankCode?: string; bic?: string; formatted?: string } {
  // Clean input — remove spaces, uppercase
  const iban = input.replace(/\s+/g, '').toUpperCase();

  // Basic length check (min 15, max 34)
  if (iban.length < 15 || iban.length > 34) {
    return { valid: false, error: 'Invalid length (' + iban.length + ' chars, expected 15-34)' };
  }

  // Must start with 2 letters (country code)
  if (!/^[A-Z]{2}/.test(iban)) {
    return { valid: false, error: 'Must start with country code (2 letters)' };
  }

  // Check digits must be numeric
  if (!/^[A-Z]{2}\d{2}/.test(iban)) {
    return { valid: false, error: 'Check digits (positions 3-4) must be numeric' };
  }

  // Irish IBAN: IE + 2 check digits + 4 bank code + 14 digits = 22 chars
  const country = iban.substring(0, 2);
  if (country === 'IE' && iban.length !== 22) {
    return { valid: false, error: 'Irish IBAN must be 22 characters (got ' + iban.length + ')' };
  }

  // Mod-97 validation (ISO 7064)
  // Move first 4 chars to end, convert letters to numbers (A=10, B=11, ... Z=35)
  const rearranged = iban.substring(4) + iban.substring(0, 4);
  let numStr = '';
  for (const ch of rearranged) {
    if (ch >= '0' && ch <= '9') {
      numStr += ch;
    } else {
      numStr += String(ch.charCodeAt(0) - 55); // A=10, B=11, etc.
    }
  }

  // Calculate mod 97 on the large number (process in chunks to avoid BigInt issues)
  let remainder = 0;
  for (let i = 0; i < numStr.length; i++) {
    remainder = (remainder * 10 + parseInt(numStr[i])) % 97;
  }

  if (remainder !== 1) {
    return { valid: false, error: 'Invalid checksum (mod-97 check failed)' };
  }

  // Extract bank code and look up BIC
  const bankCode = iban.substring(4, 8);
  const bic = country === 'IE' ? (IRISH_BIC_MAP[bankCode] || null) : null;

  return {
    valid: true,
    country,
    bankCode,
    bic: bic || undefined,
    formatted: iban.replace(/(.{4})/g, '$1 ').trim(),
  };
}

// BIC lookup from bank code
export function getBICFromIBAN(iban: string): string | null {
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  if (clean.length < 8) return null;
  const bankCode = clean.substring(4, 8);
  return IRISH_BIC_MAP[bankCode] || null;
}
