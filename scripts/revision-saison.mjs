// Phase 7 V3 : proposition chiffrée de révision du facteur de saison du moteur BORD, et son impact sur les 66 spots V2.
// Une PROPOSITION, jamais appliquée dans src/ (PF-19) : le moteur V2 garde ses coefficients. Les tables proposées sont des
// hypothèses de niveau 4, appuyées sur les connaissances régionales de data/knowledge/bar-bord.json (zone de validité).
// Usage : node scripts/revision-saison.mjs --ecrire   (réécrit data/moteur-bord/revision-saison-phase-7.json)
//         node scripts/revision-saison.mjs --verifier (code 1 si le fichier n'est pas à jour)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITES } from "./sites.mjs";
import { loadSite } from "./site-data.mjs";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SORTIE = path.join(RACINE, "data/moteur-bord/revision-saison-phase-7.json");
const lire = (p) => JSON.parse(fs.readFileSync(path.join(RACINE, p), "utf8"));

// Coefficients actuels (src/bord/engine/model.js, SEASON), relus dans le code pour ne jamais diverger.
const MODEL = fs.readFileSync(path.join(RACINE, "src/bord/engine/model.js"), "utf8");
const table = (nom) => JSON.parse(new RegExp(`^\\s*${nom}:\\s*(\\[[^\\]]+\\])`, "m").exec(MODEL)[1]);
const V2 = { roche: table("roche"), plage: table("plage"), abri: table("abri") };

// Zone de validité par la position du spot (jamais affichée comme secteur, PF-09).
// Iroise et Bretagne nord : migrants majoritaires (67 à 71 %, de Pontual 2023), frai de janvier à avril-mai, pic de
// mi-février à fin mars (Fritsch 2005), creux des débarquements de la ligne de traîne en mars-avril (Fritsch 2005, p. 134).
// Au sud du 48ᵉ parallèle et au Cotentin : aucune source régionale ne justifie de changer les valeurs ; inchangées.
// Cotentin : à l'est de 2° O et au nord de 48° 45' N (Granville compris), pour ne pas y ranger la côte d'Émeraude
// (Saint-Malo, Cancale), où les marquages de Saint-Malo fondent la Bretagne nord (revue indépendante du 26 nov. 2026).
export function zoneDe(lat, lon) {
  if (lon > -2 && lat >= 48.75) return "cotentin";
  if (lat < 48) return "bretagne-sud";
  return "bretagne-nord-iroise";
}
const OUVERT_NORD = [0.6, 0.55, 0.5, 0.6, 0.9, 1, 1, 1, 1, 1, 0.95, 0.75];
// Abri (hypothèse abri-hiver, niveau 4, gardée) : la table V2 de l'abri reçoit la moitié du changement proposé pour la côte
// ouverte, comme la V2 réduit de moitié l'écart de saison en rade, ria ou havre.
const abriDe = (t) => t.map((v, i) => Math.round((V2.abri[i] + (v - V2.roche[i]) / 2) * 1000) / 1000);
export const PROPOSE = {
  "bretagne-nord-iroise": { roche: OUVERT_NORD, plage: OUVERT_NORD, abri: abriDe(OUVERT_NORD) },
  "bretagne-sud": V2,
  cotentin: V2,
};

function regimeOf(spot, SITE) {
  if (spot.regime) return spot.regime;
  if (SITE.zones?.[spot.zone]?.sea === "rade") return "abri";
  const ty = String(spot.type || "").toUpperCase();
  if (/HAVRE|RIA|ESTUAIRE|EMBOUCHURE/.test(ty)) return "abri";
  if (/PLAGE|ESTRAN SABLEUX|POINTE SABLEUSE/.test(ty)) return "plage";
  return "roche";
}

export async function calculer() {
  const registre = new Map(lire("data/spots/registre.json").spots.filter((s) => s.origin === "v2_preserved").map((s) => [s.id, s]));
  const spots = [];
  for (const site of SITES) {
    const m = await loadSite(site.config);
    for (const sp of m.SPOTS) {
      const r = registre.get(sp.id);
      if (!r) throw new Error(`spot V2 absent du registre : ${sp.id}`);
      const regime = regimeOf(sp, m.SITE), zone = zoneDe(r.lat, r.lon);
      const avant = V2[regime], apres = PROPOSE[zone][regime];
      const ecarts = apres.map((v, i) => Math.round((v - avant[i]) * 1000) / 1000);
      spots.push({ id: sp.id, guide: site.key, zone, regime, avant, apres, ecarts });
    }
  }
  const mois = Array.from({ length: 12 }, (_, i) => {
    const touches = spots.filter((s) => s.ecarts[i] !== 0);
    return { mois: i + 1, spots_touches: touches.length, ecart_min: Math.min(0, ...touches.map((s) => s.ecarts[i])), ecart_max: Math.max(0, ...touches.map((s) => s.ecarts[i])) };
  });
  // Ordre relatif : paires de spots d'un même guide dont l'écart de facteur de saison change d'au moins 0,1 (un indice du
  // risque de changement de rang ; le rang réel dépend de toute la Favorabilité et sera mesuré à l'épreuve, phase 8).
  const paires = [];
  for (let i = 0; i < 12; i++) {
    let n = 0;
    for (const a of spots) for (const b of spots) if (a.guide === b.guide && a.id < b.id
      && Math.abs((a.apres[i] - b.apres[i]) - (a.avant[i] - b.avant[i])) >= 0.1 - 1e-9) n++;
    paires.push({ mois: i + 1, paires_meme_guide: n });
  }
  const parZone = {};
  for (const s of spots) parZone[s.zone] = (parZone[s.zone] || 0) + 1;
  return {
    "//": "Généré par scripts/revision-saison.mjs ; proposition de la phase 7, jamais appliquée dans src/ (PF-19). Lecture : docs/moteur-bord/07-REVISION-PHASE-7.md",
    spots_total: spots.length, par_zone: parZone, tables_proposees: PROPOSE, par_mois: mois, ordre_relatif: paires,
    spots,
  };
}

const ecrit = JSON.stringify(await calculer(), null, 1) + "\n";
if (process.argv.includes("--ecrire")) { fs.writeFileSync(SORTIE, ecrit); console.log(`[révision saison] ${path.relative(RACINE, SORTIE)} réécrit`); }
else if (process.argv.includes("--verifier")) {
  const ok = fs.existsSync(SORTIE) && fs.readFileSync(SORTIE, "utf8") === ecrit;
  console.log(ok ? "[révision saison] proposition à jour (66 spots)" : "✗ [révision saison] data/moteur-bord/revision-saison-phase-7.json pas à jour : relancer avec --ecrire");
  process.exit(ok ? 0 : 1);
} else process.stdout.write(ecrit);
