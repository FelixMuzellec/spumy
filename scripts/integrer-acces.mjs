// Phase 5 V3, sous-tâche 5.7 : intègre aux fiches la collecte d'accès de l'IGN (data/spots/collecte/acces-*.json).
//   - stationnement : le parking de la BD TOPO le plus proche à pied du point du spot (itinéraire piéton IGN) ;
//   - marche_min : ce temps de marche, arrondi à la minute supérieure (sans l'estran ni les rochers) ;
//   - coordonnées : contrôlées par le toponyme officiel de même nom ; pour une position V2 à la minute près,
//     remplacées par ce toponyme, avec l'ancienne valeur gardée (avant_v2) ;
//   - écarts : une position V2 à plus de 1,5 km du toponyme de même nom est signalée, jamais corrigée d'office.
// Statuts : INFÉRÉ (déduit de données officielles, à confirmer sur place), sauf le contrôle de position, VÉRIFIÉ.
// Une information déjà établie par une vérification V3 de terrain (statut VÉRIFIÉ) n'est jamais écrasée.
//   node scripts/integrer-acces.mjs data/spots/collecte/acces-2026-11-23.json
import fs from "node:fs";
import path from "node:path";
import { lireFiches, DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";
import { qualite } from "./fiches-v3-depuis-v2.mjs";
import { memeNom } from "./noms.mjs";

const fichierCollecte = process.argv[2];
if (!fichierCollecte) throw new Error("usage : node scripts/integrer-acces.mjs <collecte.json>");
const collecte = JSON.parse(fs.readFileSync(fichierCollecte, "utf8"));
const JOUR = collecte.date;
const parId = new Map(collecte.spots.map((s) => [s.id, s]));

const KM = (m) => (m / 1000).toFixed(1).replace(".", ",");

let n = 0;
const bilan = { stationnement: 0, sansParking: [], corrigees: [], controlees: 0, ecarts: [], sansToponyme: [] };
for (const { fichier, fiche: f } of lireFiches()) {
  const c = parId.get(f.id);
  if (!c) continue;
  n++;
  const anomalies = f.quality.anomalies.filter((a) => !a.startsWith("Position V2 à ") && !a.startsWith("Position de la fiche à ") && !a.startsWith("Aucun parking de la BD TOPO"));
  const qui = f.origin === "v2_preserved" ? "Position V2" : "Position de la fiche";
  // 1. Position : contrôle par le toponyme officiel de même nom.
  // Seuls les toponymes d'éléments naturels (cap, pointe, plage, embouchure, havre…) servent à corriger une position :
  // un village ou une commune n'est pas le poste de pêche.
  const candidats = (c.toponymes || []).filter((t) => memeNom(f.name, t.nom));
  const naturel = (t) => /orograph|hydrograph|cap|plage|embouchure|havre|anse|baie|pointe|estran|île|ile|rocher/i.test(t.categorie || "") && !/habit|commune|administratif/i.test(t.categorie || "");
  const topo = candidats.filter(naturel).sort((a, b) => a.ecart_m - b.ecart_m)[0] || candidats.sort((a, b) => a.ecart_m - b.ecart_m)[0];
  const topoNaturel = topo && naturel(topo);
  const imprecise = (f.coordinates.precision_m ?? 0) > 1000 && f.coordinates.info.origine === "v2";
  if (topo && topoNaturel && imprecise) {
    f.coordinates = {
      lat: +topo.lat.toFixed(6), lon: +topo.lon.toFixed(6), precision_m: 300,
      info: { statut: "VÉRIFIÉ", origine: "v3", sources: ["src-ign-geocodage-poi"], verifie_le: JOUR, niveau: 1,
        texte: `Position du toponyme officiel « ${topo.nom} » (${topo.categorie}) ; un lieu étendu sur quelques centaines de mètres, d'où une précision estimée à 300 m. Le poste exact reste à confirmer.` },
      avant_v2: { lat: null, lon: null, texte: (f.coordinates.info.texte.match(/\(([^)]*°[^)]*)\)/) || [])[1] || null },
    };
    bilan.corrigees.push(`${f.id} (${KM(topo.ecart_m)} km)`);
    anomalies.splice(0, anomalies.length, ...anomalies.filter((a) => !a.startsWith("Coordonnées V2 seulement en texte")));
  } else if (topo) {
    f.coordinates.controle = { statut: "VÉRIFIÉ", origine: "v3", sources: ["src-ign-geocodage-poi"], verifie_le: JOUR, niveau: 1, valeur: { toponyme: topo.nom, ecart_m: topo.ecart_m },
      texte: `Toponyme officiel « ${topo.nom} » (${topo.categorie}) à ${topo.ecart_m} m de la position de la fiche.` };
    bilan.controlees++;
    if (topo.ecart_m > 1500) { anomalies.push(`${qui} à ${KM(topo.ecart_m)} km du toponyme officiel « ${topo.nom} » (${topo.categorie}) : à vérifier (le poste peut être ailleurs que le point du toponyme).`); bilan.ecarts.push(`${f.id} (${KM(topo.ecart_m)} km${topoNaturel ? "" : ", toponyme habité"})`); }
    if (imprecise) anomalies.push(`Position V2 à la minute près, non corrigée : le seul toponyme de même nom est un lieu habité (« ${topo.nom} »), pas le poste.`);
  } else bilan.sansToponyme.push(f.id);

  // 2. Stationnement et marche (sur la position contrôlée ; les positions corrigées seront recalculées).
  const corrigee = topo && topoNaturel && imprecise;
  const ok = (c.marche || []).filter((m) => m.minutes != null);
  const meilleur = ok.sort((a, b) => a.minutes - b.minutes)[0];
  const parking = meilleur && c.parkings.find((p) => p.ign === meilleur.parking);
  if (f.access.stationnement.statut !== "VÉRIFIÉ") {
    if (imprecise && !corrigee) {
      f.access.stationnement = { statut: "INCONNU", origine: "v3", raison: "Position V2 à la minute près (jusqu'à 1,85 km d'écart) : un parking calculé sur ce point ne serait pas fiable. À reprendre après correction de la position." };
      f.access.marche_min = { statut: "INCONNU", origine: "v3", raison: "Position du spot trop imprécise pour un temps de marche." };
    } else if (parking && !corrigee) {
      f.access.stationnement = { statut: "INFÉRÉ", origine: "v3", sources: ["src-ign-bdtopo-parkings"], verifie_le: JOUR, niveau: 1,
        valeur: { lat: +parking.lat.toFixed(6), lon: +parking.lon.toFixed(6), ign: parking.ign, nature: parking.detail || parking.nature, ecart_m: parking.ecart_m },
        texte: `${parking.detail || "Parking"} recensé par la BD TOPO de l'IGN, à ${parking.ecart_m} m du point du spot ; le plus proche à pied. À confirmer sur place (ouverture, tarif, accès au poste).` };
      f.access.marche_min = { statut: "INFÉRÉ", origine: "v3", sources: ["src-ign-itineraire-pieton"], verifie_le: JOUR, niveau: 1, valeur: Math.ceil(meilleur.minutes),
        texte: `${Math.ceil(meilleur.minutes)} min à pied (${String(meilleur.km).replace(".", ",")} km) depuis ce parking jusqu'au point du spot, selon l'itinéraire piéton de l'IGN. L'estran, la grève et les rochers ne sont pas comptés.` };
      bilan.stationnement++;
    } else if (corrigee) {
      f.access.stationnement = { statut: "INCONNU", origine: "v3", raison: "Position corrigée le 23 nov. 2026 : le parking et la marche sont à recalculer sur la nouvelle position (prochaine collecte)." };
      f.access.marche_min = { statut: "INCONNU", origine: "v3", raison: "À recalculer sur la position corrigée (prochaine collecte)." };
    } else {
      anomalies.push(`Aucun parking de la BD TOPO à ${KM(c.parkings?.length === 0 ? (f.coordinates.precision_m > 1000 ? 2500 : 1500) : 1500)} km du point : accès à documenter autrement.`);
      bilan.sansParking.push(f.id);
    }
  }
  f.quality.anomalies = anomalies;
  const q = qualite(f); f.quality.inconnus = q.inconnus; f.quality.completude = q.completude;
  fs.writeFileSync(path.join(DIR_FICHES, fichier), JSON.stringify(f, null, 1) + "\n");
}
ecrireRegistre();
console.log(`[accès] ${n} fiches ; stationnement et marche : ${bilan.stationnement} ; positions corrigées : ${bilan.corrigees.join(", ") || "aucune"} ; contrôlées : ${bilan.controlees} ; écarts > 1,5 km : ${bilan.ecarts.join(", ") || "aucun"} ; sans toponyme de même nom : ${bilan.sansToponyme.join(", ") || "aucun"} ; sans parking : ${bilan.sansParking.join(", ") || "aucun"}`);
