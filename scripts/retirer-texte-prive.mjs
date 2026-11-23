// Phase 5 V3, décision de Félix du 23 nov. 2026 (22 h 25, « Très bien ») : retirer des fiches publiques V3 le texte
// privé de la V2 — ses propres sessions, son matériel et les tournures qui s'adressent à lui (« ton journal »,
// « ton guide », « ta boîte ») — et
// ne le garder que dans la sauvegarde V2 (data/spots/v2/sauvegarde.json, inchangée). Les observations privées sont
// retirées ; les conseils sont reformulés à l'impersonnel sans changer leur sens. Idempotent.
//   node scripts/retirer-texte-prive.mjs
import fs from "node:fs";
import path from "node:path";
import { lireFiches, DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";
import { qualite } from "./fiches-v3-depuis-v2.mjs";

const JOUR = "2026-11-23";
/** Remplacements, dans l'ordre : observations privées d'abord, tournures ensuite. */
export const REMPLACEMENTS = [
  [/Ton journal : tes deux sessions à bars \([^)]*\) tombaient une à deux heures après la basse mer, au coucher du soleil\./g, "Justification V2 tirée d'observations privées, retirée de la fiche publique : fenêtre à confirmer."],
  [/ Tes sessions : [^.]*\./g, ""],
  [/Spot de ton guide d'origine/g, "Spot des guides V2 d'origine"],
  [/savoir de terrain de ton guide d'origine/g, "savoir de terrain des guides V2 d'origine"],
  [/savoir de terrain de ton guide/g, "savoir de terrain des guides V2"],
  [/\(ton guide d'origine\)/g, "(guides V2 d'origine)"],
  [/ ; ton journal fera foi\./g, " ; à confirmer par le journal de pêche."],
  [/à confirmer par ton journal/g, "à confirmer par le journal de pêche"],
  [/à recaler avec ton journal/g, "à recaler avec le journal de pêche"],
  [/ton journal dira mieux/g, "le journal de pêche dira mieux"],
  [/Note dans ton journal la phase de tes touches/g, "Noter dans le journal de pêche la phase des touches"],
  // Matériel personnel de Félix (sa boîte, sa canne de 42 g) : le conseil reste, sans son matériel.
  [/ ?Dans ta boîte : [^.]*\./g, ""],
  [/ ; poids de ta boîte \([^)]*\)\./g, "."],
  [/dans la limite de ta canne \(42 g\)/g, "dans la limite de puissance de la canne"],
  [/\(limite de ta canne : 42 g\)/g, "(selon la puissance de la canne)"],
  [/avant que l'eau ne te coupe du bord/g, "avant que l'eau ne coupe le retour"],
];
/** Ce qu'aucune fiche publique ne doit plus contenir (contrôlé par tests/spots-v3.mjs). */
export const PRIVE = /(?<![A-Za-zÀ-ÿ])(ton|ta|tes|tu|toi|te)\s+[A-Za-zÀ-ÿ]|\bTon journal\b|\bTes sessions\b/i;

const nettoyer = (o) => {
  if (Array.isArray(o)) return o.map(nettoyer);
  if (o && typeof o === "object") return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, k === "legacy" ? v : nettoyer(v)]));
  if (typeof o === "string") return REMPLACEMENTS.reduce((s, [re, r]) => s.replace(re, r), o);
  return o;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  let n = 0;
  for (const { fichier, fiche: f } of lireFiches()) {
    const avant = JSON.stringify(f);
    const g = nettoyer(f);
    g.provenance.sources_v2 = (g.provenance.sources_v2 || []).filter((s) => !/^Ton journal\b/i.test(s));
    g.provenance.sources = g.provenance.sources.filter((id) => !id.startsWith("src-ton-journal-"));
    if (JSON.stringify(g) === avant) continue;
    g.legacy.champs_non_repris = { ...g.legacy.champs_non_repris,
      texte_prive: `Observations personnelles, matériel personnel et tournures adressées à Félix retirés ou reformulés le ${JOUR} (décision de Félix) ; texte intégral dans data/spots/v2/sauvegarde.json.` };
    const q = qualite(g); g.quality.inconnus = q.inconnus; g.quality.completude = q.completude;
    fs.writeFileSync(path.join(DIR_FICHES, fichier), JSON.stringify(g, null, 1) + "\n");
    n++;
  }
  ecrireRegistre();
  console.log(`[texte privé] ${n} fiches nettoyées`);
}
