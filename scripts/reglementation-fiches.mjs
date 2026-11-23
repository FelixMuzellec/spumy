// Phase 5 V3, sous-tâche 5.7 : réglementation du bar vérifiée sur les textes officiels, appliquée à chaque fiche.
// Arrêté du 1er avril 2026 (TECM2608397A) : zones CIEM 7 et 4, relâcher seul du 1er février au 31 mars, 3 bars par
// pêcheur et par jour en janvier et du 1er avril au 31 décembre ; zone CIEM 8, 2 bars par jour ; filets fixes
// interdits. Taille minimale 42 cm (arrêté du 26 octobre 2012, version du 14 janvier 2026). Enregistrement RecFishing
// la veille et déclaration sous 24 h (arrêté TECM2608396A). La limite des zones CIEM 7 et 8 est le 48ᵉ parallèle Nord.
// Remplace la ligne V2 de `regulations` (texte gardé dans la sauvegarde V2). Les règles valent pour 2026 seulement.
// Les règles locales (scripts/reglementation-locale.mjs) suivent les règles nationales.
//   node scripts/reglementation-fiches.mjs
import fs from "node:fs";
import path from "node:path";
import { lireFiches, DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";
import { qualite } from "./fiches-v3-depuis-v2.mjs";
import { LOCALES } from "./reglementation-locale.mjs";

const JOUR = "2026-11-23";
const S_BAR = "src-arrete-bar-loisir-2026", S_TAILLE = "src-legifrance-tailles-minimales-2026", S_DECL = "src-arrete-peche-loisir-2026-recfishing";
const regles = (lat) => {
  const nord = lat >= 48;
  const zone = nord ? "CIEM 7 (Manche, au nord du 48ᵉ parallèle)" : "CIEM 8 (golfe de Gascogne, au sud du 48ᵉ parallèle)";
  return [
    { statut: "VÉRIFIÉ", origine: "v3", sources: [S_BAR], verifie_le: JOUR, niveau: 1,
      texte: nord
        ? "Bar, 2026, zone CIEM 7 : du 1er février au 31 mars, pêche en relâcher seulement, à la canne ou à la ligne à main ; en janvier et du 1er avril au 31 décembre, 3 bars au plus par pêcheur et par jour. Filets fixes interdits pour le bar."
        : "Bar, 2026, zone CIEM 8 : 2 bars au plus par pêcheur et par jour, toute l'année. Filets fixes interdits pour le bar.",
      valeur: { espece: "bar", annee: 2026, zone, limite_jour: nord ? 3 : 2, ...(nord ? { relacher_seul: { du: "02-01", au: "03-31" } } : {}) } },
    { statut: "VÉRIFIÉ", origine: "v3", sources: [S_TAILLE], verifie_le: JOUR, niveau: 1, texte: "Bar : taille minimale de capture 42 cm (Manche, mer du Nord, Atlantique).", valeur: { espece: "bar", taille_min_cm: 42 } },
    { statut: "VÉRIFIÉ", origine: "v3", sources: [S_DECL], verifie_le: JOUR, niveau: 1, texte: "Bar : enregistrement sur l'application RecFishing au moins la veille de la pêche, puis déclaration de chaque capture dans les 24 heures." },
  ];
};

let n = 0;
for (const { fichier, fiche: f } of lireFiches()) {
  f.regulations = [...regles(f.coordinates.lat), ...(LOCALES[f.id] || [])];
  const proche = Math.abs(f.coordinates.lat - 48) < 0.02;
  const note = "Spot à moins de 2,2 km du 48ᵉ parallèle : la zone CIEM (7 ou 8) dépend du poste exact ; à vérifier sur place.";
  f.quality.anomalies = f.quality.anomalies.filter((a) => a !== note).concat(proche ? [note] : []);
  const q = qualite(f); f.quality.inconnus = q.inconnus; f.quality.completude = q.completude;
  fs.writeFileSync(path.join(DIR_FICHES, fichier), JSON.stringify(f, null, 1) + "\n");
  n++;
}
ecrireRegistre();
console.log(`[réglementation] ${n} fiches : bar 2026 selon la zone CIEM, taille, déclaration`);
