// Phase 8 — Lecture des journées de référence d'un guide : <dossier>/<guide>.json (sortie de scripts/epreuve-fetch.mjs)
// ou <dossier>/<guide>.json.gz (archives du dépôt, data/epreuve/archives/). null si le guide n'a pas de journées.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

export const ARCHIVES = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../data/epreuve/archives");

export function readDays(dir, key) {
  const plain = path.join(dir, `${key}.json`), gz = `${plain}.gz`;
  if (fs.existsSync(plain)) return JSON.parse(fs.readFileSync(plain, "utf8"));
  if (fs.existsSync(gz)) return JSON.parse(zlib.gunzipSync(fs.readFileSync(gz)).toString("utf8"));
  return null;
}
