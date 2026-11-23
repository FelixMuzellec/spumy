// Phase 5 V3, sous-tâche 5.7 : approches par phase de marée (§ 7.5), tirées des fenêtres de la fiche V2.
// Chaque fenêtre V2 (référence PM ou BM, décalages en heures, type de phase, priorité, note sourcée) est rangée
// dans sa phase : montante, descendante, haute (autour de la pleine mer) ou basse (autour de la basse mer).
// L'information reste d'origine V2 (`origine: "v2"`, INFÉRÉ, non revérifiée) ; une phase sans fenêtre reste INCONNU :
// elle n'est ni bonne ni mauvaise, elle n'est pas documentée. Aucune généralisation d'un spot à l'autre.
//   node scripts/marees-fiches.mjs
import fs from "node:fs";
import path from "node:path";
import { lireFiches, DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";
import { qualite } from "./fiches-v3-depuis-v2.mjs";

const h = (x) => { const s = x < 0 ? "−" : "+", a = Math.abs(x), hh = Math.floor(a), mm = Math.round((a - hh) * 60); return `${s}${hh} h${mm ? ` ${String(mm).padStart(2, "0")}` : ""}`; };
export function phaseDe(w) {
  const ref = w.phase === "pm" ? "pm" : "bm";
  const contient0 = w.offsetBefore <= 0 && w.offsetAfter >= 0;
  if (w.tidePhaseType === "montant") return "montante";
  if (w.tidePhaseType === "descendant") return "descendante";
  if (w.tidePhaseType === "renversement" || contient0) return ref === "pm" ? "haute" : "basse";
  const milieu = (w.offsetBefore + w.offsetAfter) / 2;
  return ref === "pm" ? (milieu < 0 ? "montante" : "descendante") : (milieu < 0 ? "descendante" : "montante");
}
const NOM = { montante: "marée montante", descendante: "marée descendante", haute: "autour de la pleine mer", basse: "autour de la basse mer" };

let n = 0, remplies = 0;
for (const { fichier, fiche: f } of lireFiches()) {
  const ws = f.tide_approaches.v2?.windows || [];
  for (const ph of ["basse", "montante", "haute", "descendante"]) {
    const ici = ws.filter((w) => phaseDe(w) === ph);
    if (f.tide_approaches[ph].origine === "v3") continue; // une recherche V3 n'est jamais écrasée
    if (!ici.length) {
      f.tide_approaches[ph] = { statut: "INCONNU", origine: "v2", raison: `Aucune fenêtre ${NOM[ph]} dans la fiche V2 : la phase n'est ni bonne ni mauvaise, elle n'est pas documentée (§ 7.5).` };
      continue;
    }
    remplies++;
    f.tide_approaches[ph] = {
      statut: "INFÉRÉ", origine: "v2", verifie_le: null,
      texte: `Fenêtres de la fiche V2 (${NOM[ph]}) : ${ici.map((w) => `${w.label} (${w.phase.toUpperCase()} ${h(w.offsetBefore)} → ${w.phase.toUpperCase()} ${h(w.offsetAfter)}, ${w.priority === "prime" ? "prioritaire" : "bonne"})`).join(" ; ")}.`,
      valeur: ici.map((w) => ({ id: w.id, libelle: w.label, reference: w.phase.toUpperCase(), debut_h: w.offsetBefore, fin_h: w.offsetAfter, priorite: w.priority, type_v2: w.tidePhaseType, note: w.note })),
    };
  }
  const q = qualite(f); f.quality.inconnus = q.inconnus; f.quality.completude = q.completude;
  fs.writeFileSync(path.join(DIR_FICHES, fichier), JSON.stringify(f, null, 1) + "\n");
  n++;
}
ecrireRegistre();
console.log(`[marée] ${n} fiches ; ${remplies} phases documentées par les fenêtres V2 sur ${n * 4}`);
