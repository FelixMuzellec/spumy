// Phase 5 V3, sous-tâche 5.7 : intègre aux fiches l'inventaire des photos libres (data/spots/collecte/photos-*.json).
// Règle (§ 15) : une photo proche n'est pas une photo du lieu. Ne sont gardées que les photos à 400 m au plus du point
// dont le titre ou la description porte le nom du spot (une de ses parties nommantes, voir noms.mjs), avec une licence
// libre connue. Statut INFÉRÉ : le nom et la distance rendent le lien probable ; ce que montre l'image (le poste, la
// plage, le village) reste à vérifier avant tout affichage. Les autres photos proches ne sont pas reprises.
// Une information de photo déjà VÉRIFIÉE en V3 n'est jamais écrasée.
//   node scripts/integrer-photos.mjs data/spots/collecte/photos-2026-11-23.json
import fs from "node:fs";
import path from "node:path";
import { lireFiches, DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";
import { qualite } from "./fiches-v3-depuis-v2.mjs";
import { texteNommeLeSpot } from "./noms.mjs";

const fichier = process.argv[2];
if (!fichier) throw new Error("usage : node scripts/integrer-photos.mjs <photos.json>");
const collecte = JSON.parse(fs.readFileSync(fichier, "utf8"));
const JOUR = collecte.date;
const parId = new Map(collecte.spots.map((s) => [s.id, s]));
const LIBRES = /^(CC0|Public domain|CC BY(-SA)? [0-9.]+)$/;
const IMAGE = /\.(jpe?g|png|tiff?|webp)$/i; // ni vidéo, ni son, ni document
const cle = (t) => t.replace(/^File:/, "").replace(/\.\w+$/, "").replace(/[0-9]+/g, "").replace(/[^A-Za-zÀ-ÿ]+/g, " ").trim().toLowerCase();
const MAX = 6;

const bilan = { avec: [], sans: [], proches: 0, gardees: 0 };
for (const { fichier: nomFichier, fiche: f } of lireFiches()) {
  const c = parId.get(f.id);
  if (!c || f.photos?.statut === "VÉRIFIÉ") continue;
  bilan.proches += c.photos.length;
  const vues = new Set();
  const gardees = c.photos
    .filter((p) => p.licence && LIBRES.test(p.licence) && p.page && IMAGE.test(p.titre) && texteNommeLeSpot(f.name, `${p.titre} ${p.description || ""}`))
    .filter((p) => { const k = cle(p.titre); if (vues.has(k)) return false; vues.add(k); return true; }) // une série = une photo
    .slice(0, MAX)
    .map((p) => ({ titre: p.titre.replace(/^File:/, ""), page: p.page, licence: p.licence, auteur: p.auteur || null, date: p.date || null, distance_m: p.distance_m }));
  if (gardees.length) {
    bilan.avec.push(f.id); bilan.gardees += gardees.length;
    f.photos = { statut: "INFÉRÉ", origine: "v3", sources: ["src-wikimedia-commons-geo"], verifie_le: JOUR, niveau: 4, valeur: gardees,
      texte: `${gardees.length} photo${gardees.length > 1 ? "s" : ""} libre${gardees.length > 1 ? "s" : ""} de Wikimedia Commons, à ${Math.max(...gardees.map((g) => g.distance_m))} m au plus du point, porte${gardees.length > 1 ? "nt" : ""} le nom du lieu. Ce que montre chaque image (poste, plage, village) reste à vérifier avant affichage ; licence et auteur à citer.` };
  } else {
    bilan.sans.push(f.id);
    f.photos = { statut: "INCONNU", origine: "v3", verifie_le: JOUR,
      raison: c.photos.length
        ? `Aucune des ${c.photos.length} photos libres de Wikimedia Commons à 400 m du point ne porte le nom du lieu : aucune n'est présentée comme une photo du spot (inventaire du ${JOUR}).`
        : `Aucune photo géolocalisée de Wikimedia Commons à 400 m du point (inventaire du ${JOUR}).` };
  }
  const q = qualite(f); f.quality.inconnus = q.inconnus; f.quality.completude = q.completude;
  fs.writeFileSync(path.join(DIR_FICHES, nomFichier), JSON.stringify(f, null, 1) + "\n");
}
ecrireRegistre();
console.log(`[photos] ${bilan.avec.length} spots avec au moins une photo libre portant leur nom (${bilan.gardees} photos gardées sur ${bilan.proches} proches) ; ${bilan.sans.length} sans`);
console.log(`  avec : ${bilan.avec.join(", ")}`);
console.log(`  sans : ${bilan.sans.join(", ")}`);
