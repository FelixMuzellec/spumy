// Phase 5 V3, sous-tâche 5.13 : sources lues après la création d'une fiche (chasse sous-marine, forums, presse),
// rattachées à la fiche par sa provenance. Chaque source est au registre (data/sources/manuelles.json) avec son
// évaluation ; la qualification (QUAL-1 à QUAL-7) en tire seule les conséquences. Idempotent.
//   node scripts/sources-complementaires.mjs
import fs from "node:fs";
import path from "node:path";
import { lireFiches, DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";

export const COMPLEMENTS = {
  "plougrescant": [
    "src-lcsm-pointe-du-chateau"
  ],
  "conguel": [
    "src-lcsm-pointe-du-conguel"
  ],
  "querqueville": [
    "src-lcsm-pointe-de-querqueville"
  ],
  "begenaud": [
    "src-lcsm-pointe-de-beg-an-aud"
  ],
  "bihit": [
    "src-lcsm-pointe-de-bihit"
  ],
  "brezellec": [
    "src-lcsm-pointe-de-brezellec"
  ],
  "ilepercee": [
    "src-lcsm-ile-percee"
  ]
};

if (import.meta.url === `file://${process.argv[1]}`) {
  let n = 0;
  for (const { fichier, fiche: f } of lireFiches()) {
    const ajout = (COMPLEMENTS[f.id] || []).filter((id) => !f.provenance.sources.includes(id));
    if (!ajout.length) continue;
    f.provenance.sources = [...f.provenance.sources, ...ajout].sort();
    fs.writeFileSync(path.join(DIR_FICHES, fichier), JSON.stringify(f, null, 1) + "\n");
    n++;
  }
  ecrireRegistre();
  console.log(`[sources complémentaires] ${n} fiches complétées`);
}
