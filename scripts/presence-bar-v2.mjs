// Phase 5 V3, revue contradictoire (24 nov. 2026) : la présence du bar marquée « VÉRIFIÉ » par la V2, sans date ni
// source, est confrontée aux pages lues en phase 5. Si une page de pêche lue (domaine « halieutique ») attache le bar au
// poste, l'information garde VÉRIFIÉ et reçoit ces sources et leur date ; sinon elle passe à INFÉRÉ, avec la raison.
// Une déclaration n'est pas une preuve (CLAUDE.md). Idempotent.
//   node scripts/presence-bar-v2.mjs
import fs from "node:fs";
import path from "node:path";
import { lireFiches, DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";
import { sourcesParSpot } from "./qualifier-fiches.mjs";
import { texteNommeLeSpot } from "./noms.mjs";

const NOTE = "Statut V2 « VÉRIFIÉ » sans date ni page : ramené à INFÉRÉ, aucune page de pêche lue en phase 5 n'attachant le bar au poste (revue contradictoire du 24 nov. 2026).";

export function sourcesDuBar(f, sources) {
  return sources.filter((s) => !s.prive && !s.hors_peche && s.evaluation?.statut === "évaluée" && s.evaluation.bar_au_poste === true
    && (s.editeur_classe?.domaines || []).includes("halieutique") && texteNommeLeSpot(f.name, `${s.texte} ${s.evaluation.affirmation || ""}`));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const registre = JSON.parse(fs.readFileSync("data/sources/registre.json", "utf8"));
  const parSpot = sourcesParSpot(registre);
  const bilan = { confirmees: [], ramenees: [] };
  for (const { fichier, fiche: f } of lireFiches()) {
    const p = (f.species || []).find((e) => e.espece === "bar")?.presence;
    if (!p || p.origine !== "v2" || p.statut !== "VÉRIFIÉ" || p.verifie_le || (p.sources || []).length) continue;
    const lues = sourcesDuBar(f, parSpot.get(f.id) || []);
    if (lues.length) {
      p.sources = lues.map((s) => s.id).sort();
      p.verifie_le = lues.map((s) => s.evaluation.consulte_le).sort().at(-1);
      bilan.confirmees.push(f.id);
    } else {
      p.statut = "INFÉRÉ";
      p.texte = `${p.texte} ${NOTE}`;
      bilan.ramenees.push(f.id);
    }
    fs.writeFileSync(path.join(DIR_FICHES, fichier), JSON.stringify(f, null, 1) + "\n");
  }
  ecrireRegistre();
  console.log(`[présence du bar V2] confirmées par une page lue : ${bilan.confirmees.length} (${bilan.confirmees.join(", ")}) ; ramenées à INFÉRÉ : ${bilan.ramenees.length}`);
}
