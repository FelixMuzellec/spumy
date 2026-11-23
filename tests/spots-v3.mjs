// Fiches de spots V3 (phase 5, 5.3) : schéma du § 7.4, aucune perte de spot V2, comparaison avant/après,
// registre central à jour, qualité recalculée. Usage : node tests/spots-v3.mjs
import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { lireFiches, texteRegistre, F_REGISTRE } from "../scripts/registre-spots.mjs";
import { qualite } from "../scripts/fiches-v3-depuis-v2.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
let pass = 0, fail = 0;
const t = (n, ok, info = "") => { if (ok) pass++; else { fail++; console.log(`✗ ${n}${info ? " — " + info : ""}`); } };

const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false, strictRequired: false });
const valider = ajv.compile(read("data/schema/spot-v3.schema.json"));
const inv = read("data/spots/v2/inventaire.json");
const fiches = lireFiches();
const parId = new Map(fiches.map(({ fiche }) => [fiche.id, fiche]));

for (const { fichier, fiche: f } of fiches) {
  const ok = valider(f);
  t(`schéma : ${fichier}`, ok, ok ? "" : ajv.errorsText(valider.errors, { separator: " ; " }).slice(0, 400));
  t(`nom de fichier = identifiant : ${fichier}`, fichier === `${f.id}.json`);
  const q = qualite(f);
  t(`qualité recalculée : ${f.id}`, JSON.stringify(q.inconnus) === JSON.stringify(f.quality.inconnus) && q.completude === f.quality.completude, `${f.quality.completude} contre ${q.completude}`);
}
t("identifiants uniques", parId.size === fiches.length);

// Le schéma refuse bien ce qu'il doit refuser (copies modifiées d'une fiche réelle).
const base = fiches[0]?.fiche;
const variante = (fn) => { const c = structuredClone(base); fn(c); return valider(c); };
t("schéma : refuse un INCONNU qui porte un texte", !variante((c) => { c.access.stationnement = { statut: "INCONNU", origine: "v3", raison: "absent ici", texte: "parking" }; }));
t("schéma : refuse une information V3 sans source ni date de vérification", !variante((c) => { c.access.stationnement = { statut: "VÉRIFIÉ", origine: "v3", texte: "parking" }; }));
t("schéma : refuse un spot personnel (origine user_manual) dans le dépôt", !variante((c) => { c.origin = "user_manual"; }));
t("schéma : refuse une fiche sans réglementation", !variante((c) => { delete c.regulations; }));
t("schéma : accepte une information V3 sourcée et datée", variante((c) => { c.access.stationnement = { statut: "VÉRIFIÉ", origine: "v3", valeur: { lat: 48.3, lon: -4.3 }, sources: ["src-exemple"], verifie_le: "2026-11-23" }; }));

// Aucun spot V2 perdu ; empreinte V2 gardée ; coordonnées identiques, ou corrigées avec l'ancienne valeur conservée.
for (const s of inv.spots) {
  const f = parId.get(s.id);
  t(`spot V2 présent dans le catalogue : ${s.id}`, !!f);
  if (!f) continue;
  t(`${s.id} : origine v2_preserved et empreinte V2 gardée`, f.origin === "v2_preserved" && f.legacy?.empreinte_v2 === s.empreinte && f.legacy?.guide === s.guide);
  if (s.lat != null) {
    const meme = f.coordinates.lat === s.lat && f.coordinates.lon === s.lon;
    t(`${s.id} : coordonnées V2 gardées, ou corrigées avec preuve et ancienne valeur`, meme || (f.coordinates.info.origine === "v3" && f.coordinates.avant_v2?.lat === s.lat && f.coordinates.avant_v2?.lon === s.lon));
  } else {
    t(`${s.id} : coordonnées V2 en texte gardées dans la fiche`, (f.coordinates.info.texte || "").includes(s.coordsTexte) || f.coordinates.avant_v2?.texte === s.coordsTexte);
  }
}
t("aucune fiche v2_preserved sans spot V2", fiches.every(({ fiche: f }) => f.origin !== "v2_preserved" || inv.spots.some((s) => s.id === f.id)));
t("registre central à jour (node scripts/fiches-v3-depuis-v2.mjs le régénère)", fs.readFileSync(F_REGISTRE, "utf8") === texteRegistre());

console.log(`[spots V3] ${fiches.length} fiches, schéma § 7.4, aucune perte V2, registre : ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
