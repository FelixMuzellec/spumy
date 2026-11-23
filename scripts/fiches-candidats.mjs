// Phase 5 V3, sous-tâche 5.12 : fiches des candidats nommés par au moins deux éditeurs indépendants (origine
// v3_researched, statut « candidate » tant que la sécurité et l'accès ne sont pas documentés). Position : toponyme
// officiel de l'IGN (collecte CI, data/spots/collecte/candidats-*.json), jamais une source de pêche. Tout ce qui
// n'est pas sourcé est INCONNU, avec sa raison. Une fiche existante n'est jamais écrasée.
//   node scripts/fiches-candidats.mjs data/spots/collecte/candidats-2026-11-23.json
import fs from "node:fs";
import path from "node:path";
import { DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";
import { qualite } from "./fiches-v3-depuis-v2.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const JOUR = "2026-11-23";
const inconnu = (raison) => ({ statut: "INCONNU", origine: "v3", raison });
const NATUREL = /orograph|hydrograph|cap|pointe|plage|baie|anse|rocher|estran|île/i;

/** Ce que les pages lues affirment de chaque candidat (sources de data/sources/manuelles.json). */
export const PREUVES = {
  percho: [["src-mieuxpecher-morbihan", "« Pointe du Percho ❤ » (liste des spots de pêche du bord du Morbihan)"], ["src-carnet-de-peche-guide-bretagne", "« Pointe du Percho (rochers profonds, lieu jaune et gros bars) »"]],
  conguel: [["src-mieuxpecher-morbihan", "« Pointe du Conguel » (presqu'île de Quiberon)"], ["src-carnet-de-peche-bar-surfcasting-morbihan", "« Pointe du Conguel POINTE ROCHEUSE · BAR · LIEU JAUNE · VIEILLE »"]],
  saintcolomban: [["src-mieuxpecher-morbihan", "« La pointe de Saint Colomban »"], ["src-carnet-de-peche-bar-surfcasting-morbihan", "« Pointe Saint-Colomban POINTE ROCHEUSE · BAR · DORADE ROYALE · SAR »"]],
  plougrescant: [["src-mieuxpecher-cotes-darmor", "« La Pointe du Château et ses environs à Plougrescant »"], ["src-carnet-de-peche-liste-cotes-darmor", "« Pointe du Château — Gouffre de Plougrescant · Bar » (liste des spots des Côtes-d'Armor)"]],
  querqueville: [["src-mieuxpecher-normandie", "« Pointe et digue de Querqueville »"], ["src-carnet-de-peche-lieu-noir", "« Digue de Querqueville DIGUE » (spots à lieu noir)"]],
  caplevi: [["src-mieuxpecher-normandie", "« Cap Levi »"], ["src-decathlon-chasse-cap-levi", "« Pour les bars, on attend plutôt que la marée remonte » (anse du cap Lévi, chasse sous-marine)"]],
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const fichier = process.argv[2];
  if (!fichier) throw new Error("usage : node scripts/fiches-candidats.mjs <candidats.json>");
  const collecte = JSON.parse(fs.readFileSync(fichier, "utf8"));
  const { candidats } = JSON.parse(fs.readFileSync(path.join(root, "data/spots/candidats-v3.json"), "utf8"));
  const bilan = { crees: [], gardes: [], sansPosition: [] };
  for (const c of candidats) {
    const f_ = path.join(DIR_FICHES, `${c.id}.json`);
    if (fs.existsSync(f_)) { bilan.gardes.push(c.id); continue; }
    const r = collecte.candidats.find((x) => x.id === c.id);
    // Toponyme choisi à la main (candidats-v3.json : nom exact et commune) parmi les résultats de l'IGN.
    const topo = (r?.toponymes || []).find((t) => t.nom === c.toponyme && t.commune === c.commune);
    if (!topo) { bilan.sansPosition.push(c.id); continue; }
    const preuves = PREUVES[c.id] || [];
    const f = {
      id: c.id, name: c.nom, origin: "v3_researched",
      coordinates: { lat: +topo.lat.toFixed(6), lon: +topo.lon.toFixed(6), precision_m: NATUREL.test(topo.categorie) ? 300 : 1000,
        info: { statut: "VÉRIFIÉ", origine: "v3", sources: ["src-ign-geocodage-poi"], verifie_le: JOUR, niveau: 1,
          texte: `Position du toponyme officiel « ${topo.nom} » (${topo.categorie || "catégorie non donnée"}${topo.commune ? `, ${topo.commune}` : ""}). Le poste exact reste à confirmer sur place.` } },
      access: { stationnement: inconnu("À collecter (BD TOPO de l'IGN) après la création de la fiche."), approche: inconnu("Aucune source ne décrit l'approche du poste."),
        marche_min: inconnu("À calculer (itinéraire piéton de l'IGN)."), difficulte: inconnu("Aucune source ne décrit la difficulté de l'accès."), restrictions: inconnu("Restrictions d'accès non recherchées au-delà des règles de pêche.") },
      environment: { milieu: { statut: "INFÉRÉ", origine: "v3", sources: preuves.map(([s]) => s), verifie_le: JOUR, texte: c.milieu },
        fond: inconnu("Nature du fond non décrite par les sources lues."), exposition: inconnu("Exposition non documentée."), profondeur: inconnu("Profondeur non documentée (aucune courbe inventée)."),
        structures: inconnu("Structures du poste non décrites par les sources lues."), courant: inconnu("Courant non documenté.") },
      tide_approaches: { basse: inconnu("Aucune source ne décrit la basse mer à ce poste."), montante: inconnu("Aucune source ne décrit la montante à ce poste."),
        haute: inconnu("Aucune source ne décrit la pleine mer à ce poste."), descendante: inconnu("Aucune source ne décrit la descendante à ce poste."), coefficients: inconnu("Aucun coefficient documenté pour ce poste.") },
      conditions: { favorables: inconnu("Conditions favorables non documentées."), defavorables: inconnu("Conditions défavorables non documentées."), dangereuses: inconnu("Conditions dangereuses non documentées : à rechercher avant tout affichage.") },
      species: [{ espece: "bar", priorite: 1, presence: { statut: "INFÉRÉ", origine: "v3", sources: preuves.map(([s]) => s), verifie_le: JOUR, niveau: 4,
        texte: `Poste nommé par deux éditeurs indépendants : ${preuves.map(([, a]) => a).join(" ; ")}.` } }],
      strategies: [], lure_guidance: [],
      safety: { engagement: inconnu("Engagement de l'accès non documenté."), consignes: [], houle_max_m: inconnu("Houle maximale non documentée."), coef_max: inconnu("Coefficient maximal non documenté."),
        acces_maree: inconnu("Aucune contrainte d'accès liée à la marée documentée : ce qui ne veut pas dire sans risque.") },
      regulations: [{ statut: "INCONNU", origine: "v3", raison: "Réglementation à appliquer par scripts/reglementation-fiches.mjs." }],
      windows: { habituelles: inconnu("Aucune fenêtre de fonctionnement documentée (§ 7.6)."), securite: inconnu("Aucune fenêtre d'accessibilité documentée (§ 7.6).") },
      photos: inconnu("Photos non inventoriées."),
      provenance: { sources: [...new Set(["src-ign-geocodage-poi", ...preuves.map(([s]) => s)])].sort() },
      quality: { statut: "candidate", derniere_verification: JOUR, completude: 0, inconnus: [], anomalies: ["Fiche créée par la passe exhaustive (5.12) : sécurité, accès et conditions à documenter avant tout affichage."] },
    };
    const q = qualite(f); f.quality.inconnus = q.inconnus; f.quality.completude = q.completude;
    fs.writeFileSync(f_, JSON.stringify(f, null, 1) + "\n");
    bilan.crees.push(`${c.id} (${topo.nom}, ${topo.categorie})`);
  }
  ecrireRegistre();
  console.log("[candidats]", bilan);
}
