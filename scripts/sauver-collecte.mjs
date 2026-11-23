// Enregistre le résultat d'un passage CI de collecte (lignes du journal) dans data/spots/collecte/.
// Usage : node scripts/sauver-collecte.mjs <acces|photos|risques|candidats> <passage CI> <fichier de sortie> [jour AAAA-MM-JJ]
// Lit le journal par `gh run view <passage> --log`. Seules les données sous Licence Ouverte (IGN, Géorisques)
// et les métadonnées Wikimedia Commons sont gardées ; tout résultat OpenStreetMap (ODbL) est retiré.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const [type, passage, sortie, jourArg] = process.argv.slice(2);
const PREFIXE = { acces: "COLLECTE", photos: "PHOTOS", risques: "RISQUES", candidats: "CANDIDAT" }[type];
if (!PREFIXE || !/^\d+$/.test(passage || "") || !sortie) {
  console.error("usage : node scripts/sauver-collecte.mjs <acces|photos|risques|candidats> <passage CI> <sortie> [jour]");
  process.exit(2);
}
const jour = jourArg || new Date().toISOString().slice(0, 10);
const journal = execFileSync("gh", ["run", "view", passage, "--log"], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
const motif = new RegExp(`${PREFIXE} (\\{.*\\})\\s*$`);
const lignes = journal.split("\n").map((l) => l.match(motif)?.[1]).filter(Boolean).map((l) => JSON.parse(l));
if (!lignes.length) {
  console.error(`aucune ligne ${PREFIXE} dans le passage ${passage}`);
  process.exit(1);
}

const ign = (liste) => (liste || []).filter((x) => x.source === "ign");
let doc;
if (type === "acces") {
  const spots = lignes.map((s) => {
    const parkings = ign(s.parkings?.resultats);
    const refs = new Set(parkings.map((p) => p.ign));
    return { id: s.id, point: s.point, toponymes: ign(s.nommes?.resultats), parkings, marche: (s.marche || []).filter((m) => refs.has(m.parking)) };
  });
  doc = { "//": `Collecte d'accès du ${jour} : données IGN seulement, Licence Ouverte ; résultats OpenStreetMap retirés.`, date: jour, passage: Number(passage), spots };
} else if (type === "photos") {
  doc = { "//": `Inventaire Wikimedia Commons (recherche géographique, 400 m) ; métadonnées seulement, aucune image copiée. Passage CI ${passage}.`, date: jour, passage_ci: passage, rayon_m: 400, spots: lignes };
} else if (type === "risques") {
  doc = { "//": `Collecte Géorisques (API v1 : /mvt à 500 m, /gaspar/risques de la commune), Licence Ouverte 2.0. Passage CI ${passage}.`, date: jour, passage_ci: passage, spots: lignes };
} else {
  doc = { "//": `Géocodage IGN (index poi de la Géoplateforme, Licence Ouverte) des candidats, filtré par département. Passage CI ${passage}.`, date: jour, passage_ci: passage, candidats: lignes };
}
fs.writeFileSync(sortie, JSON.stringify(doc, null, 1) + "\n");
console.log(`[sauvegarde] ${type} : ${lignes.length} lignes -> ${sortie}`);
