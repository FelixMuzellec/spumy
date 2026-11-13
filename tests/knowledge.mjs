// Connaissances halieutiques (phase 5) : le fichier de connaissances du mode BORD et le niveau de preuve des
// rubriques de chaque spot restent justes et à jour avec le code et les fiches.
//
//   1. data/knowledge/bar-bord.json suit son schéma ; une connaissance n'est jamais plus sûre que sa meilleure
//      source ; une connaissance de niveau 1 à 3 cite au moins une source ; ce qu'elle dit utiliser existe dans le code.
//   2. Les règles du moteur de leurres sont toutes classées, et leur nombre par source est celui du code.
//   3. data/knowledge/preuves-spots.json couvre chaque rubrique de chaque spot une fois, avec son étiquette actuelle.
//   4. Le contrôle attrape vraiment les erreurs (chaque cas doit être refusé).
// Usage : node tests/knowledge.mjs
import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { SITES } from "../scripts/sites.mjs";
import { loadSite } from "../scripts/site-data.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
let pass = 0, fail = 0;
const t = (name, ok, detail = "") => { if (ok) pass++; else { fail++; console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`); } };

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(read("data/schema/knowledge.schema.json"));
const lures = fs.readFileSync(path.join(root, "src/bord/engine/lures.js"), "utf8");
const lureCounts = {};
for (const m of lures.matchAll(/\br\(\s*(?:`[^`]*`|"[^"]*")\s*,\s*"([a-zA-Z]+)"/g)) lureCounts[m[1]] = (lureCounts[m[1]] || 0) + 1;

// Problèmes d'un fichier de connaissances (vide = juste).
function knowledgeProblems(doc) {
  const p = [];
  if (!validate(doc)) p.push(...validate.errors.map((e) => `schéma : ${e.instancePath || "/"} ${e.message}`));
  const ids = new Set();
  for (const k of doc.connaissances || []) {
    if (ids.has(k.id)) p.push(`${k.id} : identifiant en double`); ids.add(k.id);
    const best = Math.min(...(k.sources || []).map((s) => s.niveau), 6);
    if (k.niveau <= 3 && !(k.sources || []).length) p.push(`${k.id} : niveau ${k.niveau} sans source`);
    if ((k.sources || []).length && k.niveau < best) p.push(`${k.id} : niveau ${k.niveau} plus sûr que sa meilleure source (${best})`);
    if (k.valeurs && k.valeurs.niveau < k.niveau) p.push(`${k.id} : valeurs plus sûres que l'énoncé`);
    for (const u of k.utilise_par || []) {
      const [file, what] = u.split(" : ");
      if (/^référence/.test(file)) continue;
      const files = file.includes("*") ? SITES.map((s) => s.config) : [file];
      for (const f of files) if (!fs.existsSync(path.join(root, f))) p.push(`${k.id} : fichier absent ${f}`);
      const ident = (what || "").match(/^[A-Za-z_][\w.]*/)?.[0]?.split(".")[0];
      if (ident && !files.some((f) => fs.existsSync(path.join(root, f)) && fs.readFileSync(path.join(root, f), "utf8").includes(ident)))
        p.push(`${k.id} : « ${ident} » introuvable dans ${file}`);
    }
  }
  const rl = doc.regles_leurres || {};
  for (const [key, n] of Object.entries(lureCounts)) {
    if (!rl[key]) p.push(`règles de leurres : source « ${key} » non classée (${n} règles)`);
    else if (rl[key].regles !== n) p.push(`règles de leurres : « ${key} » compte ${rl[key].regles} règles, le code en a ${n}`);
  }
  for (const key of Object.keys(rl)) if (!lureCounts[key]) p.push(`règles de leurres : « ${key} » n'existe plus dans le code`);
  return p;
}

// 1-2. Fichier de connaissances
const K = read("data/knowledge/bar-bord.json");
const kp = knowledgeProblems(K);
t("bar-bord.json : schéma, niveaux, sources, code utilisé, règles de leurres", !kp.length, kp.slice(0, 8).join(" | "));
t("bar-bord.json : les 5 niveaux de l'échelle sont définis", ["1", "2", "3", "4", "5"].every((n) => K.echelle[n]));
t("bar-bord.json : les 82 règles du moteur de leurres sont classées", Object.values(K.regles_leurres).reduce((a, r) => a + r.regles, 0) === Object.values(lureCounts).reduce((a, n) => a + n, 0),
  `${Object.values(lureCounts).reduce((a, n) => a + n, 0)} dans le code`);
t("bar-bord.json : la réglementation cite un texte officiel (niveau 1)", K.connaissances.some((k) => k.domaine === "réglementation" && k.niveau === 1 && k.sources.some((s) => s.niveau === 1 && /Arrêté/.test(s.ref))));

// 3. Niveau de preuve des rubriques de spot
const P = read("data/knowledge/preuves-spots.json");
const current = new Map();
for (const s of SITES) {
  const m = await loadSite(s.config);
  for (const sp of m.SPOTS) {
    current.set(`${s.key}/${sp.id}/terrain`, sp.terrain.confidence);
    for (const [r, v] of Object.entries(sp.topology)) current.set(`${s.key}/${sp.id}/${r}`, v.confidence);
  }
}
function preuvesProblems(doc) {
  const p = [], seen = new Set();
  for (const x of doc.rubriques || []) {
    const id = `${x.guide}/${x.spot}/${x.rubrique}`;
    if (seen.has(id)) p.push(`${id} : en double`); seen.add(id);
    if (!current.has(id)) p.push(`${id} : n'existe plus dans les fiches`);
    else if (current.get(id) !== x.ancien) p.push(`${id} : étiquette « ${x.ancien} » ≠ fiche « ${current.get(id)} »`);
    if (!Number.isInteger(x.niveau) || x.niveau < 1 || x.niveau > 5) p.push(`${id} : niveau ${x.niveau} hors échelle`);
    if (!x.motif || x.motif.length < 10) p.push(`${id} : motif absent`);
  }
  for (const id of current.keys()) if (!seen.has(id)) p.push(`${id} : rubrique non classée`);
  const by = {}; for (const x of doc.rubriques || []) by[x.niveau] = (by[x.niveau] || 0) + 1;
  if (JSON.stringify(Object.fromEntries(Object.entries(by).map(([k, v]) => [String(k), v]))) !== JSON.stringify(doc.resume?.par_niveau)) p.push("résumé par niveau faux");
  return p;
}
const pp = preuvesProblems(P);
t(`preuves-spots.json : chacune des ${current.size} rubriques classée une fois, étiquette actuelle, résumé juste`, !pp.length, pp.slice(0, 8).join(" | "));
t("preuves-spots.json : les 192 rubriques « verified » relues (aucune laissée sans motif propre ou par défaut)", P.rubriques.filter((x) => x.ancien === "verified").length === [...current.values()].filter((v) => v === "verified").length);

// 4. Le contrôle attrape les erreurs
const clone = (o) => JSON.parse(JSON.stringify(o));
const refuse = (name, doc, fn) => { const p = fn(doc); t(`contrôle : ${name} refusé`, p.length > 0, "accepté à tort"); };
{ const d = clone(K); d.connaissances[0].sources = []; refuse("niveau 1 sans source", d, knowledgeProblems); }
{ const d = clone(K); const x = d.connaissances.find((k) => k.niveau === 5 && k.sources.length); if (x) { x.niveau = 1; refuse("connaissance plus sûre que sa source", d, knowledgeProblems); } }
{ const d = clone(K); d.connaissances[0].utilise_par = ["src/bord/engine/model.js : fonctionInexistante"]; refuse("code utilisé introuvable", d, knowledgeProblems); }
{ const d = clone(K); d.regles_leurres.deduit.regles += 1; refuse("nombre de règles de leurres faux", d, knowledgeProblems); }
{ const d = clone(K); delete d.regles_leurres.vagues; refuse("source de leurres non classée", d, knowledgeProblems); }
{ const d = clone(K); d.connaissances[1].niveau = 6; refuse("niveau hors échelle (schéma)", d, knowledgeProblems); }
{ const d = clone(P); d.rubriques.pop(); refuse("rubrique de spot oubliée", d, preuvesProblems); }
{ const d = clone(P); d.rubriques[0].ancien = "verified"; refuse("étiquette différente de la fiche", d, preuvesProblems); }
{ const d = clone(P); d.rubriques.push(clone(d.rubriques[0])); refuse("rubrique en double", d, preuvesProblems); }

console.log(`[connaissances] ${K.connaissances.length} connaissances, ${current.size} rubriques de spot : ${pass}/${pass + fail}`);
if (fail) process.exitCode = 1;
