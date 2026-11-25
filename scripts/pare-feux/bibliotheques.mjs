// Pare-feu des bibliothèques npm (PF-47 ; Félix, 25 nov. 2026, 8 h 13 : « Oui » à la surveillance des failles, et
// « se prémunir contre les attaques les plus modernes »). Deux contrôles, lancés par la CI de chaque proposition :
//   1. failles connues : `npm audit` ; une faille grave ou critique bloque, sauf si elle est inscrite, avec sa raison
//      et sa date de fin, à tests/pare-feux/failles-acceptees.json (une acceptation échue bloque à nouveau) ;
//   2. délai de sécurité : une version de bibliothèque ajoutée ou changée par la proposition doit être publiée depuis
//      7 jours au moins (les vers npm de 2026 sont repérés en quelques heures ou jours ; même délai que Dependabot) ;
//      une version plus récente n'est admise qu'examinée et inscrite, avec sa raison et une date de fin (delai_examinees).
// Usage : node scripts/pare-feux/bibliotheques.mjs [--base <réf. Git>] [--rapport <audit.json>] [--maintenant <AAAA-MM-JJ>]
//   --base : réf. de comparaison du verrou (package-lock.json) pour le délai (par défaut : aucune comparaison) ;
//   --rapport : rapport `npm audit --json` déjà produit (essais hors ligne) ; --maintenant : date du jour (essais).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ACCEPTEES = "tests/pare-feux/failles-acceptees.json";
export const DELAI_JOURS = 7;
export const GRAVES = new Set(["high", "critical"]);

const opt = (nom) => { const i = process.argv.indexOf(nom); return i > 0 ? process.argv[i + 1] : undefined; };

/** Failles graves ou critiques non acceptées (ou dont l'acceptation est échue). */
export function faillesBloquantes(audit, acceptees, aujourdhui) {
  const fautes = [];
  for (const [paquet, v] of Object.entries(audit.vulnerabilities || {})) {
    if (!GRAVES.has(v.severity)) continue;
    const ids = (v.via || []).filter((x) => typeof x === "object").map((x) => String(x.url || x.source));
    const ok = acceptees.find((a) => a.paquet === paquet && (!a.avis || ids.includes(a.avis)));
    if (!ok) fautes.push(`${paquet} : faille ${v.severity} (${ids.join(", ") || "sans avis"})`);
    else if (!ok.raison || !ok.jusqu_au || ok.jusqu_au < aujourdhui) fautes.push(`${paquet} : acceptation sans raison ou échue (${ok.jusqu_au || "sans date"})`);
  }
  return fautes;
}

/** Versions (nom@version) du verrou npm. */
export function versions(verrou) {
  const v = new Set();
  for (const [p, e] of Object.entries(verrou.packages || {})) if (p && e.version && !e.link) v.add(`${e.name || p.replace(/^.*node_modules\//, "")}@${e.version}`);
  return v;
}

async function datePublication(nomVersion) {
  const i = nomVersion.lastIndexOf("@"), nom = nomVersion.slice(0, i), version = nomVersion.slice(i + 1);
  const r = await fetch(`https://registry.npmjs.org/${nom.replace("/", "%2F")}`, { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error(`registre npm : ${nom} → HTTP ${r.status}`);
  return (await r.json()).time?.[version];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const aujourdhui = opt("--maintenant") || new Date().toISOString().slice(0, 10);
  const acceptees = fs.existsSync(path.join(RACINE, ACCEPTEES)) ? JSON.parse(fs.readFileSync(path.join(RACINE, ACCEPTEES), "utf8")).acceptees || [] : [];
  const fautes = [];
  // 1. Failles connues.
  let audit;
  if (opt("--rapport")) audit = JSON.parse(fs.readFileSync(opt("--rapport"), "utf8"));
  else {
    try { audit = JSON.parse(execFileSync("npm", ["audit", "--json"], { cwd: RACINE, stdio: ["ignore", "pipe", "pipe"] }).toString()); }
    catch (e) { audit = JSON.parse(e.stdout?.toString() || "{}"); }   // npm audit sort en code 1 quand il trouve une faille
    if (!audit.metadata && !audit.vulnerabilities) { console.log("✗ npm audit sans réponse exploitable"); process.exit(1); }
  }
  fautes.push(...faillesBloquantes(audit, acceptees, aujourdhui));
  console.log(`[bibliothèques] failles : ${JSON.stringify(audit.metadata?.vulnerabilities || {})}`);
  // 2. Délai de sécurité des versions ajoutées ou changées.
  const base = opt("--base");
  if (base) {
    let avant = new Set();
    try { avant = versions(JSON.parse(execFileSync("git", ["show", `${base}:package-lock.json`], { cwd: RACINE }).toString())); } catch { /* pas de verrou à la base */ }
    const apres = versions(JSON.parse(fs.readFileSync(path.join(RACINE, "package-lock.json"), "utf8")));
    const nouvelles = [...apres].filter((v) => !avant.has(v));
    const examinees = JSON.parse(fs.readFileSync(path.join(RACINE, ACCEPTEES), "utf8")).delai_examinees || [];
    for (const v of nouvelles) {
      const quand = await datePublication(v);
      const jours = quand ? (Date.parse(aujourdhui) - Date.parse(quand)) / 864e5 : -1;
      if (quand && jours >= DELAI_JOURS) continue;
      const ex = examinees.find((e) => e.version === v);
      if (ex && ex.raison && ex.jusqu_au && ex.jusqu_au >= aujourdhui) { console.log(`! ${v} : publiée il y a ${jours.toFixed(1)} jour(s), examinée (${ex.raison.slice(0, 60)}…), jusqu'au ${ex.jusqu_au}`); continue; }
      fautes.push(`${v} : publiée il y a ${quand ? jours.toFixed(1) : "?"} jour(s), délai de sécurité ${DELAI_JOURS} jours`);
    }
    console.log(`[bibliothèques] versions nouvelles depuis ${base} : ${nouvelles.length}`);
  }
  for (const f of fautes) console.log(`✗ ${f}`);
  console.log(`[bibliothèques] ${fautes.length ? fautes.length + " blocage(s)" : "aucune faille grave, aucune version trop récente"}`);
  process.exit(fautes.length ? 1 : 0);
}
