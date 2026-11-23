// Prototype V6 — génère src/prototype-v3/connaissances.js depuis data/knowledge (source unique, jamais recopiée à la main) :
// les niveaux de preuve des rubriques de terrain des spots de Pirou et les connaissances sourcées sur le bar utilisées par
// la Météo et la Carte (V3-029). Usage : node scripts/connaissances-v6.mjs [--check]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const bord = read("data/knowledge/bar-bord.json"), niv = read("data/knowledge/preuves-niveaux.json");
const IDS = ["vent-exposition", "rafales-penalite", "houle-turbidite", "pression", "eau-chaude", "seuils-thermiques", "ciel-couvert",
  "lumiere-basse", "pluie-turbidite", "maree-flot", "coefficient-plage-utile", "courant-coefficient", "gros-coefficient-turbidite"];
const know = Object.fromEntries(bord.connaissances.filter((c) => IDS.includes(c.id)).map((c) => [c.id, {
  enonce: c.enonce, niveau: c.niveau, sources: (c.sources || []).map((s) => ({ ref: s.ref, url: s.url || null, niveau: s.niveau ?? null })),
}]));
const missing = IDS.filter((i) => !know[i]);
if (missing.length) { console.error("connaissances absentes :", missing.join(", ")); process.exit(1); }
const levels = Object.fromEntries(Object.entries(niv).filter(([k]) => k.startsWith("pirou-plage/")).map(([k, v]) => [k.slice(12), v]));
const out = `// FICHIER GÉNÉRÉ par scripts/connaissances-v6.mjs depuis data/knowledge : ne pas modifier à la main.
/** Échelle des niveaux de preuve (bar-bord.json, « echelle »). */
export const ECHELLE = ${JSON.stringify(bord.echelle, null, 1)};
/** Connaissances sourcées sur le bar (règles générales). */
export const KNOW = ${JSON.stringify(know, null, 1)};
/** Niveau de preuve de chaque rubrique de terrain des spots de Pirou (preuves-niveaux.json). */
export const NIVEAUX = ${JSON.stringify(levels)};
`;
const file = path.join(root, "src/prototype-v3/connaissances.js");
if (process.argv.includes("--check")) {
  if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== out) { console.error("connaissances.js n'est pas à jour : node scripts/connaissances-v6.mjs"); process.exit(1); }
  console.log("connaissances.js à jour");
} else { fs.writeFileSync(file, out); console.log(`écrit connaissances.js : ${IDS.length} connaissances, ${Object.keys(levels).length} spots`); }
