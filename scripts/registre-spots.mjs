// Registre central des spots (phase 5, 5.3) : une ligne par fiche de data/spots/fiches/, tirée des fiches.
// data/spots/registre.json n'est jamais écrit à la main : `ecrireRegistre()` le régénère, et tests/spots-v3.mjs
// vérifie qu'il est à jour.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const DIR_FICHES = path.join(root, "data/spots/fiches");
export const F_REGISTRE = path.join(root, "data/spots/registre.json");

export function lireFiches() {
  if (!fs.existsSync(DIR_FICHES)) return [];
  return fs.readdirSync(DIR_FICHES).filter((n) => n.endsWith(".json")).sort()
    .map((n) => ({ fichier: n, fiche: JSON.parse(fs.readFileSync(path.join(DIR_FICHES, n), "utf8")) }));
}

/** Niveau de preuve le plus faible (le plus élevé numériquement) parmi les informations qui en portent un. */
function niveaux(f) {
  const n = [];
  const visite = (o) => { if (Array.isArray(o)) o.forEach(visite); else if (o && typeof o === "object") { if (typeof o.niveau === "number") n.push(o.niveau); Object.values(o).forEach(visite); } };
  visite(f);
  return n.length ? { meilleur: Math.min(...n), plus_faible: Math.max(...n) } : null;
}

export function registre() {
  const spots = lireFiches().map(({ fiche: f }) => ({
    id: f.id, name: f.name, origin: f.origin, statut: f.quality.statut,
    lat: f.coordinates.lat, lon: f.coordinates.lon, precision_m: f.coordinates.precision_m,
    stationnement_connu: f.access.stationnement.statut !== "INCONNU",
    niveau_preuve: niveaux(f), sources: f.provenance.sources.length, sources_v2: (f.provenance.sources_v2 || []).length,
    derniere_verification: f.quality.derniere_verification, completude: f.quality.completude,
    inconnus: f.quality.inconnus.length, anomalies: f.quality.anomalies.length,
    ...(f.legacy ? { guide_v2: f.legacy.guide } : {}),
  }));
  const par = (k) => spots.reduce((m, s) => ((m[s[k]] = (m[s[k]] || 0) + 1), m), {});
  return {
    "//": "Registre central des spots V3 (phase 5). Généré par scripts/registre-spots.mjs à partir de data/spots/fiches/ ; ne pas modifier à la main.",
    totaux: { spots: spots.length, parOrigine: par("origin"), parStatut: par("statut"), stationnementConnu: spots.filter((s) => s.stationnement_connu).length },
    spots,
  };
}

export const texteRegistre = () => JSON.stringify(registre(), null, 1) + "\n";
export function ecrireRegistre() { fs.writeFileSync(F_REGISTRE, texteRegistre()); }
