// Paquet d'entrée de session (Félix, 25 nov. 2026, 20 h 36 : « mêmes résultats, mêmes exigences, mêmes contrôles,
// mais moins de jetons »). Il remplace la lecture complète de la continuité, du journal des décisions, des exigences et
// du référentiel : il en extrait, depuis les registres contrôlés, tout ce qui vaut pour la phase demandée. Sa complétude
// est contrôlée par tests/pare-feux.mjs (PF-50) : chaque exigence, pare-feu, indicateur et décision qui vaut pour la phase
// y figure.
// Usage : npm run -s contexte -- <numéro de phase>
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REGLES, RAPPORTS_DEPUIS } from "../tests/pare-feux/regles.mjs";
import { EXIGENCES } from "../tests/pare-feux/exigences.mjs";
import { KPIS } from "../tests/pare-feux/kpis.mjs";
import { COMPLEXITE } from "../tests/pare-feux/complexite.mjs";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = (f) => fs.readFileSync(path.join(RACINE, f), "utf8");
const existe = (f) => fs.existsSync(path.join(RACINE, f));
const git = (...a) => { try { return execFileSync("git", a, { cwd: RACINE, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return "?"; } };

/** Phases citées par la colonne « Phase » d'une exigence (« 3, 6 », « 10 à 12 », « toutes »). */
export function phasesExigence(texte) {
  const n = (texte.match(/\d+/g) || []).map(Number);
  return /\d+ à \d+/.test(texte) ? Array.from({ length: n[1] - n[0] + 1 }, (_, i) => n[0] + i) : n;
}

export function exigencesDeLaPhase(n) {
  return lire("docs/REQUIREMENTS.md").split("\n").filter((l) => /^\| [A-Z]+-\d+ \|/.test(l)).map((l) => l.split("|").slice(1, -1).map((x) => x.trim()))
    .filter((c) => c[c.length - 1] === "toutes" || phasesExigence(c[c.length - 1]).includes(n) || EXIGENCES[c[0]]?.phase === n);
}

export function paquet(n) {
  const out = [];
  const titre = (t) => out.push("", `## ${t}`, "");
  out.push(`# Paquet de contexte, phase ${n}`, "", `Branche ${git("branch", "--show-current")}, commit ${git("rev-parse", "--short", "HEAD")}. Règles absolues : CLAUDE.md (déjà chargé). Toutes les règles ci-dessous sont contrôlées par npm test et la CI, sauf les consignes non automatisables, à appliquer soi-même.`);

  titre("État courant (SPUMY_AUDIT_CONTINUITY.md)");
  out.push(lire("SPUMY_AUDIT_CONTINUITY.md").split(/^## Règle de passation/m)[0].split("\n").filter((l) => !/^# /.test(l)).join("\n").trim());

  const ref = lire("docs/SPUMY_MASTER_PROMPT.md").split("\n");
  const debut = ref.findIndex((l) => new RegExp(`^## PHASE ${n} -`).test(l));
  titre(`Périmètre du référentiel (docs/SPUMY_MASTER_PROMPT.md, lignes ${debut + 1} et suivantes)`);
  if (debut < 0) out.push("(phase absente du référentiel)");
  else { const fin = ref.findIndex((l, i) => i > debut && /^## /.test(l)); out.push(ref.slice(debut, fin < 0 ? undefined : fin).join("\n").trim()); }

  const cadrage = `docs/phases/PHASE-${n}-CADRAGE.md`;
  if (existe(cadrage)) { titre(`Cadrage de la phase (${cadrage})`); out.push(lire(cadrage).split("\n").filter((l) => !/^# /.test(l)).join("\n").trim()); }

  titre(`Exigences de la phase ${n} (docs/REQUIREMENTS.md, état : docs/regles/EXIGENCES.md)`);
  for (const c of exigencesDeLaPhase(n)) {
    const e = EXIGENCES[c[0]];
    out.push(`- ${c[0]} [phase ${c[c.length - 1]}] ${c[1]} — critère : ${c[4]}${e ? ` — état : ${e.etat}${e.phase ? `, acceptation en phase ${e.phase}` : ""}${e.raison ? ` (${e.raison})` : ""}` : ""}`);
  }

  titre(`Pare-feux dus à la phase ${n} (docs/regles/PARE-FEUX.md)`);
  for (const r of REGLES) for (const [v, e] of Object.entries(r.versions)) {
    if (e.etat === "prevu" && e.phase === n) out.push(`- ${r.id} (${v}) à poser : ${r.titre} — ${e.raison}`);
    if (e.aCompleter?.phase === n) out.push(`- ${r.id} (${v}) à compléter : ${e.aCompleter.quoi}`);
  }
  if (n >= RAPPORTS_DEPUIS) out.push("- PF-48 : rapport de phase avec, partie 4, « ### Solutions comparées » (avec « Recommandée ») et « ### Mise en œuvre pas à pas » ; partie 10, « ### Menaces actuelles et parades » (veille datée et sourcée).");

  titre(`Indicateurs dus à la phase ${n} (docs/regles/KPI.md)`);
  for (const k of KPIS) {
    if (k.mesure === "prevu" && k.phase === n) out.push(`- ${k.id} à mesurer : ${k.kpi} (${k.norme.nom}) — ${k.raison}`);
    if (k.ecart?.phase === n) out.push(`- ${k.id} à atteindre : ${k.kpi} — ${k.ecart.raison}`);
    if (k.objectif) out.push(`- ${k.id} objectif suivi (jamais au détriment des spots) : ${k.kpi}`);
  }
  for (const [c, j] of Object.entries(COMPLEXITE)) if (j.phase === n) out.push(`- K-29 : ${c} (${j.verdict}) — ${j.raison}`);

  titre("Règles en vigueur (pare-feux ; détail et contrôles : docs/regles/PARE-FEUX.md)");
  for (const r of REGLES) out.push(`- ${r.id} ${r.titre}`);

  titre("Consignes non automatisables (à appliquer soi-même)");
  for (const r of REGLES) for (const [v, e] of Object.entries(r.versions)) if (e.etat === "manuel") out.push(`- ${r.id} (${v}) ${r.titre} — ${e.raison}`);
  for (const r of REGLES) for (const e of Object.values(r.versions)) if (e.note && /reste(nt)? (une )?consigne|reste jugée/.test(e.note)) out.push(`- ${r.id} : ${e.note}`);

  titre("Décisions validées (docs/DECISIONS_LOG.md ; une idée qui en touche une est présentée comme un changement)");
  for (const m of lire("docs/DECISIONS_LOG.md").matchAll(/^\| (V3-\d{3}) \| ([^|]*) \| ([^|\n]*) \|$/gm)) out.push(`- ${m[1]} ${m[2].trim()} — ${m[3].trim()}`);
  out.push("- Consignes datées de Félix : lignes « | — | » du journal ; chacune est couverte par un pare-feu (PF-01 à PF-50).");

  titre("Commandes");
  out.push("- `npm run -s verifier` : toutes les suites, une ligne chacune ; détail seulement en cas d'échec.",
    "- `npm run kpi` après une amélioration (le cliquet avance) ; un recul exige `--accepter \"<raison>\"`.",
    "- `node tests/pare-feux.mjs --ecrire` après un changement des registres ; `--instantane` après une nouvelle décision validée.",
    "- `git config core.hooksPath .githooks` en début de session.");
  return out.join("\n") + "\n";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const n = Number(process.argv[2]);
  if (!Number.isInteger(n) || n < 1 || n > 15) { console.error("usage : npm run -s contexte -- <phase de 1 à 15>"); process.exit(2); }
  process.stdout.write(paquet(n));
}
