// Pare-feu du nom des branches et des phases autorisées (PF-13, PF-14 du registre tests/pare-feux/regles.mjs).
// Modèle (docs/BRANCHES.md, Félix, 24 nov. 2026, 21 h 45 et 22 h 52) : claude/v<N>-phase-<NN>-<sujet> ou
// claude/v<N>-suivi-<sujet>, tout en minuscules. Une phase de la V3 n'a de branche que si le journal des décisions porte
// son jeton « PROCEED TO PHASE N » (jamais de phase 8 sans son propre jeton). La V2 est close : seuls ses noms inscrits
// à docs/BRANCHES.md sont admis. Un programme absent de VERSIONS (registre des pare-feux) est refusé.
// Usage : node scripts/pare-feux/branche.mjs <nom de branche>   (code 1 si refusé ; « main » est toujours refusé)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VERSIONS } from "../../tests/pare-feux/regles.mjs";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lire = (f) => fs.readFileSync(path.join(RACINE, f), "utf8");
export const MODELE = /^claude\/v(\d+)-(?:phase-(\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*|suivi-[a-z0-9]+(?:-[a-z0-9]+)*)$/;

/** Plus haute phase dont le journal des décisions porte le jeton (« PROCEED TO PHASE N »). */
export function phaseAutorisee(journal = lire("docs/DECISIONS_LOG.md")) {
  return Math.max(0, ...[...journal.matchAll(/PROCEED TO PHASE (\d+)/g)].map((m) => Number(m[1])));
}

/** Noms inscrits à docs/BRANCHES.md (anciens noms en attente de renommage et nouveaux noms). */
export function nomsInscrits(branches = lire("docs/BRANCHES.md")) {
  return new Set([...branches.matchAll(/`(claude\/[^`\s]+)`/g)].map((m) => m[1]));
}

export function verifierBranche(nom, { journal, branches } = {}) {
  const erreurs = [], avertissements = [];
  const inscrits = nomsInscrits(branches);
  if (nom === "main" || nom === "HEAD") return { erreurs: ["refusé : push sur main (GitHub Pages publie main ; fusion par Félix seulement)"], avertissements };
  const m = MODELE.exec(nom);
  if (!m) {
    if (inscrits.has(nom)) avertissements.push(`ancien nom en attente de renommage (docs/BRANCHES.md) : ${nom}`);
    else erreurs.push(`nom de branche hors modèle : ${nom} (attendu claude/v3-phase-NN-sujet ou claude/v3-suivi-sujet, en minuscules)`);
    return { erreurs, avertissements };
  }
  const programme = `v${m[1]}`, phase = m[2] ? Number(m[2]) : null;
  if (!VERSIONS[programme]) erreurs.push(`programme ${programme} absent du registre des pare-feux (VERSIONS) : ajouter la version et revoir chaque règle`);
  else if (programme === "v2" && !inscrits.has(nom)) erreurs.push(`programme v2 clos : seuls les noms de docs/BRANCHES.md sont admis (${nom})`);
  else if (programme !== "v2" && phase !== null) {
    const max = phaseAutorisee(journal);
    if (phase > max) erreurs.push(`phase non autorisée : phase ${phase} sans son jeton « APPROVED — PROCEED TO PHASE ${phase} » (dernier jeton : phase ${max})`);
  }
  return { erreurs, avertissements };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const nom = process.argv[2];
  if (!nom) { console.error("usage : node scripts/pare-feux/branche.mjs <nom de branche>"); process.exit(2); }
  const { erreurs, avertissements } = verifierBranche(nom);
  for (const a of avertissements) console.log(`! ${a}`);
  for (const e of erreurs) console.log(`✗ ${e}`);
  if (!erreurs.length) console.log(`✓ branche admise : ${nom}`);
  process.exit(erreurs.length ? 1 : 0);
}
