/**
 * Self check-in details per accommodation PROVIDER (the building, e.g. Capel Street = provider 15) — Neil 2026-11-07:
 * "the arrival email must get them into the building on day one; the rest goes in a one-page property guide".
 * Read from a PRIVATE file outside the repo and the web root (the lockbox code must never reach git or a public URL):
 *   ~/.config/ulearn/property-access.json  { "<providerId>": { label, lockboxCode, lockboxWhere, checkinFrom, guidePdf, guideName } }
 * Override the path with PROPERTY_ACCESS_FILE. Re-read when the file changes (edit the code there, no rebuild).
 */
import fs from "fs";
import os from "os";
import path from "path";

export type PropertyAccess = { label?: string; lockboxCode?: string; lockboxWhere?: string; checkinFrom?: string; guidePdf?: string; guideName?: string };
const FILE = () => process.env.PROPERTY_ACCESS_FILE || path.join(os.homedir(), ".config", "ulearn", "property-access.json");
let cache: { mtime: number; data: Record<string, PropertyAccess> } = { mtime: 0, data: {} };

export function propertyAccess(providerId?: number | null): PropertyAccess | null {
  if (!providerId) return null;
  try {
    const st = fs.statSync(FILE());
    if (st.mtimeMs !== cache.mtime) cache = { mtime: st.mtimeMs, data: JSON.parse(fs.readFileSync(FILE(), "utf8")) };
  } catch { return null; }
  const a = cache.data[String(providerId)];
  return a && a.lockboxCode ? a : null;
}

// "A1 / Room 4" → "A1/R4" (the label written on the key tag); anything else is returned as it is.
export function keyLabel(roomName?: string | null): string {
  const s = String(roomName || "").trim();
  const m = s.match(/^([A-Z]\d+)\s*\/\s*Room\s*(\d+)/i);
  return m ? `${m[1].toUpperCase()}/R${m[2]}` : s;
}
