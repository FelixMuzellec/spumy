// Phase 5 V3, sous-tâche 5.7 (sécurité) : intègre aux fiches la collecte Géorisques (data/spots/collecte/risques-*.json).
//   - safety.mouvements_terrain : événements de la BDMvt (BRGM) à 500 m du point, avec type, fiabilité, précision,
//     date (null quand la base porte la valeur de remplissage 1111-01-01) et distance au point ;
//     aucun événement recensé → INCONNU (le recensement n'est pas exhaustif : jamais « sans risque ») ;
//   - safety.risques_commune : risques de la commune du point (GASPAR), portée communale.
// Une information VÉRIFIÉE par une vérification de terrain V3 n'est jamais écrasée.
//   node scripts/integrer-risques.mjs data/spots/collecte/risques-2026-11-23.json
import fs from "node:fs";
import path from "node:path";
import { lireFiches, DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";
import { qualite } from "./fiches-v3-depuis-v2.mjs";

const fichier = process.argv[2];
if (!fichier) throw new Error("usage : node scripts/integrer-risques.mjs <risques.json>");
const collecte = JSON.parse(fs.readFileSync(fichier, "utf8"));
const JOUR = collecte.date;
const parId = new Map(collecte.spots.map((s) => [s.id, s]));
const distance = (a, b) => { const R = 6371000, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2; return Math.round(2 * R * Math.asin(Math.sqrt(h))); };
const DATE_INCONNUE = "1111-01-01"; // valeur de remplissage de la BDMvt quand la date n'est pas connue
// Risques communaux qui concernent la pêche du bord ; les autres restent dans la valeur, sans être mis en avant.
const LITTORAL = /submersion marine|mouvement de terrain|[ée]boulement|chutes de pierres|tempête|engins de guerre/i;
const pluriel = (n, s, p = s + "s") => `${n} ${n > 1 ? p : s}`;

const bilan = { avecMvt: [], sansMvt: 0, falaise: [], communes: 0 };
for (const { fichier: nomFichier, fiche: f } of lireFiches()) {
  const c = parId.get(f.id);
  if (!c) continue;
  const s = f.safety;
  if (!(s.mouvements_terrain?.origine === "v3" && s.mouvements_terrain.statut === "VÉRIFIÉ" && !s.mouvements_terrain.sources?.includes("src-georisques-bdmvt"))) {
    if (c.mvt.erreur) throw new Error(`${f.id} : collecte BDMvt en erreur (${c.mvt.erreur}) ; relancer la collecte`);
    const evts = c.mvt.evenements.map((e) => ({ id: e.id, type: e.type, date: e.date && e.date !== DATE_INCONNUE ? e.date : null, fiabilite: e.fiabilite, precision: e.precision, lieu: e.lieu, distance_m: e.lat != null ? distance(f.coordinates, e) : null }))
      .sort((a, b) => (a.distance_m ?? 9e9) - (b.distance_m ?? 9e9));
    if (evts.length) {
      const types = {};
      for (const e of evts) types[e.type] = (types[e.type] || 0) + 1;
      const datees = evts.filter((e) => e.date).map((e) => e.date).sort();
      const chutes = types["Chute de blocs / Eboulement"] || 0;
      s.mouvements_terrain = { statut: "VÉRIFIÉ", origine: "v3", sources: ["src-georisques-bdmvt"], verifie_le: JOUR, niveau: 1,
        valeur: { rayon_m: c.rayon_m, total: evts.length, types, plus_recent: datees.at(-1) || null, evenements: evts },
        texte: `${pluriel(evts.length, "mouvement de terrain recensé", "mouvements de terrain recensés")} par le BRGM à ${c.rayon_m} m du point : ${Object.entries(types).map(([k, v]) => `${k} (${v})`).join(", ")}. ${datees.length ? `Le plus récent daté : ${datees.at(-1).slice(0, 4)} ; ` : ""}${evts.length - datees.length ? `${pluriel(evts.length - datees.length, "événement", "événements")} sans date. ` : ""}${chutes ? "Chutes de blocs recensées : ne pas stationner au pied de la falaise. " : ""}Recensement non exhaustif ; l'état actuel de la côte n'est pas connu.` };
      bilan.avecMvt.push(f.id);
      if (chutes) bilan.falaise.push(f.id);
    } else {
      s.mouvements_terrain = { statut: "INCONNU", origine: "v3", verifie_le: JOUR,
        raison: `Aucun mouvement de terrain recensé par le BRGM à ${c.rayon_m} m du point (Géorisques, ${JOUR}) ; le recensement n'est pas exhaustif, ce qui ne prouve pas l'absence de risque.` };
      bilan.sansMvt++;
    }
  }
  if (c.gaspar.erreur) throw new Error(`${f.id} : collecte GASPAR en erreur (${c.gaspar.erreur})`);
  const communes = c.gaspar.communes.map((x) => ({ commune: x.commune, code_insee: x.code_insee, risques: x.risques.map((r) => r.libelle).filter(Boolean) }));
  const cotiers = [...new Set(communes.flatMap((x) => x.risques).filter((r) => LITTORAL.test(r)))];
  if (communes.length) {
    bilan.communes++;
    s.risques_commune = { statut: "VÉRIFIÉ", origine: "v3", sources: ["src-georisques-gaspar"], verifie_le: JOUR, niveau: 1, valeur: communes,
      texte: `Risques recensés pour ${c.gaspar.rayon_m > 1 ? `les communes à ${c.gaspar.rayon_m / 1000} km du point (le point est hors des limites communales)` : "la commune"} (${communes.map((x) => x.commune).join(", ")}) : ${cotiers.length ? cotiers.join(" ; ") : "aucun risque côtier listé"}. Portée communale : ne décrit pas le poste.` };
  } else {
    s.risques_commune = { statut: "INCONNU", origine: "v3", verifie_le: JOUR, raison: `Aucune commune trouvée par Géorisques pour le point (${JOUR}).` };
  }
  const q = qualite(f); f.quality.inconnus = q.inconnus; f.quality.completude = q.completude;
  fs.writeFileSync(path.join(DIR_FICHES, nomFichier), JSON.stringify(f, null, 1) + "\n");
}
ecrireRegistre();
console.log(`[risques] mouvements de terrain à 500 m : ${bilan.avecMvt.length} spots (dont ${bilan.falaise.length} avec chutes de blocs : ${bilan.falaise.join(", ")}) ; aucun recensé : ${bilan.sansMvt} ; risques communaux : ${bilan.communes} spots`);
