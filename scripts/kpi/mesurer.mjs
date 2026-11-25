// Mesure des indicateurs (KPI) des standards internationaux (tests/pare-feux/kpis.mjs ; Félix, 25 nov. 2026, 9 h 37).
// Valeurs : data/kpi/mesures.json ; cliquet : data/kpi/reference.json ; tableau : docs/regles/KPI.md.
// Usage :
//   node scripts/kpi/mesurer.mjs --ecrire [--accepter "<raison>"]   mesure, écrit ; un recul exige une raison écrite
//   node scripts/kpi/mesurer.mjs --verifier                         CI : mesure à nouveau, compare au fichier commité et
//                                                                   au cliquet ; échoue sur un recul ou un seuil non
//                                                                   atteint sans écart écrit
//   --sans-couverture : reprend la couverture enregistrée (essais rapides)
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KPIS, SECTIONS } from "../../tests/pare-feux/kpis.mjs";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lire = (f) => fs.readFileSync(path.join(RACINE, f), "utf8");
const json = (f) => JSON.parse(lire(f));
const MESURES = "data/kpi/mesures.json", REFERENCE = "data/kpi/reference.json", DOC = "docs/regles/KPI.md";
const arg = (n) => process.argv.includes(n);
const val = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
const pct = (n, d) => Math.round((1000 * n) / d) / 10;

/** Sens d'amélioration d'un indicateur : +1 plus haut est mieux, -1 plus bas est mieux. */
export const sens = (k) => ([">=", ">"].includes(k.seuil[0]) ? 1 : -1);
export function atteint(k, v) {
  const [op, s] = k.seuil;
  if (typeof v !== "number") return false;
  return op === ">=" ? v >= s : op === ">" ? v > s : op === "<=" ? v <= s : op === "==" ? v === s : op === "entre" ? v >= s[0] && v <= s[1] : false;
}

function donnees() {
  const d = path.join(RACINE, "data/spots/fiches");
  const F = fs.readdirSync(d).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(d, f), "utf8")));
  const ok = (q) => F.filter((f) => f.quality?.criteres?.[q]?.ok).length;
  const auj = Date.now();
  return {
    "donnees.securite_documentee": { valeur: pct(ok("QUAL-5"), F.length), detail: `${ok("QUAL-5")} fiches sur ${F.length}` },
    "donnees.credibilite": { valeur: pct(ok("QUAL-1"), F.length), detail: `${ok("QUAL-1")} fiches sur ${F.length}` },
    "donnees.exactitude": { valeur: pct(ok("QUAL-3"), F.length), detail: `${ok("QUAL-3")} fiches sur ${F.length}` },
    "donnees.completude": { valeur: pct(F.reduce((s, f) => s + (f.quality?.completude || 0), 0), F.length), detail: `moyenne sur ${F.length} fiches` },
    "donnees.reglementation": { valeur: pct(ok("QUAL-6"), F.length), detail: `${ok("QUAL-6")} fiches sur ${F.length}` },
    "donnees.confidentialite": { valeur: pct(ok("QUAL-7"), F.length), detail: `${ok("QUAL-7")} fiches sur ${F.length}` },
    "donnees.actualite": { valeur: pct(F.filter((f) => f.quality?.derniere_verification && auj - Date.parse(f.quality.derniere_verification) <= 365 * 864e5).length, F.length), detail: "vérification datée de moins de 365 jours" },
  };
}

function contraste() {
  const c = json("docs/design/contrastes-v3.json");
  const textes = Object.values(c.themes).flat().filter((x) => x.seuil === 4.5);
  const min = Math.min(...textes.map((x) => x.ratio));
  return { "accessibilite.contraste_texte_min": { valeur: min, detail: `${textes.length} associations texte / fond, deux thèmes (tests/design-v3.mjs)` } };
}

function performance() {
  const p = json("docs/socle/perf-avant.json");
  const v3 = Object.entries(p.pages).filter(([k]) => k.startsWith("v3-"));
  const [k, pire] = v3.reduce((a, b) => (b[1].lcpMs > a[1].lcpMs ? b : a));
  return { "performance.lcp_v3_max": { valeur: pire.lcpMs, detail: `${pire.label} (${k}), mesure du ${p.date} (scripts/mesure-perf.mjs)`, mesure_le: p.date } };
}

async function complexite() {
  const { ESLint } = await import("eslint");
  const e = new ESLint({ cwd: RACINE, overrideConfig: { rules: { complexity: ["warn", { max: 15 }] } } });
  const r = await e.lintFiles(["src/prototype-v3", "src/design/v3", "scripts/etude-moteur-bord"]);
  const m = r.flatMap((x) => x.messages.filter((y) => y.ruleId === "complexity").map((y) => `${path.relative(RACINE, x.filePath)}:${y.line} (${/complexity of (\d+)/.exec(y.message)?.[1]})`));
  return { "code.v3_fonctions_complexes": { valeur: m.length, detail: m.length ? `dont ${m.sort((a, b) => Number(/\((\d+)\)/.exec(b)[1]) - Number(/\((\d+)\)/.exec(a)[1]))[0]}` : "aucune" } };
}

function navigateurs() {
  const tests = fs.readdirSync(path.join(RACINE, "tests")).filter((f) => f.endsWith(".mjs")).map((f) => lire(`tests/${f}`)).join("\n");
  const moteurs = ["chromium", "webkit", "firefox"].filter((m) => new RegExp(`\\b${m}\\.launch\\(`).test(tests));
  return { "compatibilite.navigateurs": { valeur: moteurs.length, detail: moteurs.join(", ") || "aucun" } };
}

function couverture(anciennes) {
  if (arg("--sans-couverture") && anciennes) return Object.fromEntries(Object.entries(anciennes).filter(([k]) => k.startsWith("couverture.")));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "spumy-couverture-"));
  const r = spawnSync(path.join(RACINE, "node_modules/.bin/c8"), ["--reporter=json-summary", `--report-dir=${dir}`, "--include=scripts/etude-moteur-bord/**", process.execPath, "tests/etude-moteur-bord.mjs"],
    { cwd: RACINE, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`tests du moteur en échec sous mesure de couverture :\n${r.stdout}\n${r.stderr}`);
  const t = JSON.parse(fs.readFileSync(path.join(dir, "coverage-summary.json"), "utf8")).total;
  fs.rmSync(dir, { recursive: true, force: true });
  return {
    "couverture.moteur.branches": { valeur: t.branches.pct, detail: `${t.branches.covered}/${t.branches.total} branches de scripts/etude-moteur-bord (c8, tests/etude-moteur-bord.mjs)` },
    "couverture.moteur.instructions": { valeur: t.statements.pct, detail: `${t.statements.covered}/${t.statements.total} instructions` },
  };
}

export async function mesurer(anciennes) {
  return { ...couverture(anciennes), ...donnees(), ...contraste(), ...performance(), ...(await complexite()), ...navigateurs() };
}

const seuilTexte = (k) => { const [op, s] = k.seuil; return op === "entre" ? `entre ${s[0]} et ${s[1]}` : `${{ ">=": "≥", ">": ">", "<=": "≤", "==": "=" }[op]} ${s}${k.unite && k.unite !== "écart" && k.unite !== "manque" && k.unite !== "perte" ? " " + k.unite : ""}`; };
const fr = (v) => String(v).replace(".", ",");

/** Tableau lisible (pur : même résultat dans ce script et dans tests/pare-feux.mjs). */
export function rendreDoc(valeurs) {
  const etat = (k) => {
    if (k.mesure === "prevu") return `**à mesurer, phase ${k.phase}** : ${k.raison}`;
    if (k.mesure === "garde") return `**tenu** (contrôle bloquant) : ${[...new Set(k.gardes.map(([f]) => `\`${f}\``))].join(", ")}`;
    const m = valeurs[k.cle];
    if (!m) return "**non mesuré**";
    return atteint(k, m.valeur) ? `**atteint** : ${fr(m.valeur)}${k.unite === "%" ? " %" : k.unite ? " " + k.unite : ""} (${m.detail})`
      : `**non atteint** : ${fr(m.valeur)}${k.unite === "%" ? " %" : k.unite ? " " + k.unite : ""} (${m.detail}) ; à atteindre en phase ${k.ecart?.phase} : ${k.ecart?.raison}`;
  };
  const bilan = (f) => KPIS.filter(f).length;
  return `# Indicateurs des standards internationaux, section par section

Généré par \`node scripts/kpi/mesurer.mjs --ecrire\` depuis \`tests/pare-feux/kpis.mjs\` et \`data/kpi/mesures.json\`. Ne pas modifier à la main.

Félix (25 nov. 2026, 9 h 37) : « Pour t'assurer de la qualité de tes tests et ne pas être biaisé, il y a des standards internationaux top tier. Ces standards sont assurés par des KPIs auxquels tu dois te confronter pour chaque section de l'application. »

## Comment lire ce tableau

- **Atteint** ou **non atteint** : valeur mesurée par un programme, jamais estimée.
- **Tenu** : un contrôle bloquant de la CI fait échouer les tests à la moindre violation.
- **À mesurer** : pas encore mesurable. La mesure doit exister avant la clôture de la phase indiquée, sinon les tests échouent.
- **Seuil de la norme** ou **seuil proposé** : la norme fixe le seuil, ou bien elle définit seulement la mesure et le seuil est une proposition de Claude, à valider par Félix.
- **Cliquet** : une valeur mesurée ne recule jamais sans une raison écrite (\`data/kpi/reference.json\`). La CI le vérifie à chaque proposition.

## Bilan

- atteints : ${bilan((k) => k.mesure === "auto" && valeurs[k.cle] && atteint(k, valeurs[k.cle].valeur))}
- non atteints, avec la phase où ils doivent l'être : ${bilan((k) => k.mesure === "auto" && valeurs[k.cle] && !atteint(k, valeurs[k.cle].valeur))}
- tenus par un contrôle bloquant : ${bilan((k) => k.mesure === "garde")}
- à mesurer : ${bilan((k) => k.mesure === "prevu")}

${SECTIONS.map((s) => `## ${s}

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
${KPIS.filter((k) => k.section === s).map((k) => `| ${k.id} | ${k.kpi} | ${k.norme.nom}, ${k.norme.version}${k.norme.url ? ` ([source](${k.norme.url}))` : ""} | ${seuilTexte(k)} (${k.seuilSource === "norme" ? "seuil de la norme" : "seuil proposé"}) | ${etat(k)} |`).join("\n")}
`).join("\n")}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const enregistrees = fs.existsSync(path.join(RACINE, MESURES)) ? json(MESURES).valeurs : undefined;
  const valeurs = await mesurer(enregistrees);
  const ref = fs.existsSync(path.join(RACINE, REFERENCE)) ? json(REFERENCE) : { valeurs: {}, historique: [] };
  const fautes = [], reculs = [];
  for (const k of KPIS.filter((x) => x.mesure === "auto")) {
    const m = valeurs[k.cle];
    if (!m) { fautes.push(`${k.id} : valeur ${k.cle} non mesurée`); continue; }
    if (!atteint(k, m.valeur) && !(k.ecart?.phase && k.ecart?.raison)) fautes.push(`${k.id} : seuil non atteint (${m.valeur}, ${seuilTexte(k)}) sans écart écrit`);
    const r = ref.valeurs[k.cle];
    if (typeof r === "number" && sens(k) * (m.valeur - r) < -1e-9) reculs.push(`${k.id} : indicateur en recul, ${r} → ${m.valeur} (${k.kpi})`);
  }
  if (arg("--verifier")) {
    if (!enregistrees) fautes.push(`${MESURES} absent (node scripts/kpi/mesurer.mjs --ecrire)`);
    else for (const [c, m] of Object.entries(valeurs)) if (enregistrees[c]?.valeur !== m.valeur) fautes.push(`${c} : valeur commitée ${enregistrees[c]?.valeur}, mesurée ${m.valeur} (node scripts/kpi/mesurer.mjs --ecrire)`);
    if (lire(DOC) !== rendreDoc(enregistrees || {})) fautes.push(`${DOC} pas à jour (node scripts/kpi/mesurer.mjs --ecrire)`);
    fautes.push(...reculs);
  } else if (arg("--ecrire")) {
    const raison = val("--accepter");
    if (reculs.length && !raison) fautes.push(...reculs, "un recul s'enregistre seulement avec sa raison : --accepter \"<raison>\"");
    else {
      const avant = { ...ref.valeurs };
      for (const k of KPIS.filter((x) => x.mesure === "auto" && valeurs[x.cle])) {
        const v = valeurs[k.cle].valeur, r = ref.valeurs[k.cle];
        ref.valeurs[k.cle] = typeof r !== "number" || sens(k) * (v - r) > 0 || raison ? v : r;   // le cliquet n'avance que dans le bon sens
      }
      const change = Object.keys(ref.valeurs).filter((c) => avant[c] !== ref.valeurs[c]);
      if (change.length) ref.historique.push({ date: new Date().toISOString().slice(0, 10), raison: raison || "progrès ou première mesure", changements: Object.fromEntries(change.map((c) => [c, [avant[c] ?? null, ref.valeurs[c]]])) });
      fs.mkdirSync(path.join(RACINE, "data/kpi"), { recursive: true });
      fs.writeFileSync(path.join(RACINE, MESURES), JSON.stringify({ "//": "Valeurs mesurées par scripts/kpi/mesurer.mjs (KPI de tests/pare-feux/kpis.mjs).", valeurs }, null, 2) + "\n");
      fs.writeFileSync(path.join(RACINE, REFERENCE), JSON.stringify({ "//": "Cliquet des KPI : meilleure valeur atteinte ; un recul n'est accepté qu'avec sa raison (--accepter).", ...ref }, null, 2) + "\n");
      fs.writeFileSync(path.join(RACINE, DOC), rendreDoc(valeurs));
    }
  }
  for (const [c, m] of Object.entries(valeurs)) console.log(`   ${c} = ${m.valeur} (${m.detail})`);
  for (const f of fautes) console.log(`✗ ${f}`);
  console.log(`[kpi] ${KPIS.length} indicateurs, ${SECTIONS.length} sections : ${fautes.length ? fautes.length + " écart(s) bloquant(s)" : "aucun recul, chaque seuil atteint ou son écart écrit"}`);
  process.exit(fautes.length ? 1 : 0);
}
