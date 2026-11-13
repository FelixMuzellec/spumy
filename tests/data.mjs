// Fiches de sites (lot 3.6) : données pures, schéma, règles croisées, et empreinte de chaque spot.
//
// L'empreinte de référence (tests/ref/sites.json) fixe le contenu de chaque fiche : un spot modifié,
// ajouté ou retiré fait échouer le test, qui le nomme. Quand la modification est voulue, on régénère
// la référence (node tests/data.mjs --update-ref) dans le même commit que la fiche : le diff le montre.
// Usage : node tests/data.mjs [--update-ref]
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { SITES } from "../scripts/sites.mjs";
import { loadSite, siteProblems, pureDataProblems, siteJson, fingerprint, EXPORTS } from "../scripts/site-data.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const REF = path.join(root, "tests/ref/sites.json");
let pass = 0, fail = 0;
const t = (name, ok, detail = "") => { if (ok) pass++; else { fail++; console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`); } };

const mods = {};
for (const s of SITES) mods[s.key] = await loadSite(s.config);

// 1. Chaque fiche est valide et se relit en JSON à l'identique.
for (const [key, m] of Object.entries(mods)) {
  const p = siteProblems(m);
  t(`${key} : fiche valide (schéma, données pures, règles croisées)`, !p.length, p.slice(0, 8).join(" | "));
  let same = true;
  try { assert.deepStrictEqual(JSON.parse(siteJson(m)), Object.fromEntries(EXPORTS.map((k) => [k, m[k]]))); } catch { same = false; }
  t(`${key} : exportée en JSON sans perte`, same);
  t(`${key} : identifiant du guide conforme à la liste des sites`, m.SITE.id === SITES.find((s) => s.key === key).id, m.SITE.id);
}

// 2. Le contrôle attrape vraiment les erreurs de saisie (chaque cas doit être refusé).
const base = mods.logonna;
const copy = () => JSON.parse(siteJson(base));
const refuse = (name, mutate, expect) => {
  const m = copy(); mutate(m);
  const p = siteProblems(m);
  t(`contrôle : ${name} refusé`, p.length > 0 && (!expect || p.some((x) => expect.test(x))), p.slice(0, 3).join(" | ") || "accepté à tort");
};
refuse("champ inconnu dans un spot (faute de frappe)", (m) => { m.SPOTS[0].houlMax = 1; }, /houlMax/);
refuse("champ obligatoire absent", (m) => { delete m.SPOTS[0].access; }, /access/);
refuse("valeur hors liste (priorité de créneau)", (m) => { m.SPOTS[0].tidalRules.windows[0].priority = "top"; }, /prime, bon/);
refuse("secteur de vent hors de la rose à 16", (m) => { m.SPOTS[0].exposedAngles = [200]; }, /multiple/);
refuse("houle maximale négative", (m) => { m.SPOTS[0].houleMax = -1; });
refuse("coordonnées illisibles", (m) => { m.SPOTS[0].coords = "près du port"; }, /coords/);
refuse("lat sans lon", (m) => { delete m.SPOTS[0].lon; }, /lon/);
refuse("explication de coefHardMax sans seuil", (m) => { m.SPOTS[0].coefHardMaxWhy = "courant"; delete m.SPOTS[0].coefHardMax; }, /coefHardMax/);
refuse("niveau de preuve inconnu", (m) => { m.SPOTS[0].topology.fond.confidence = "sûr"; }, /verified/);
refuse("port de marée mal décrit", (m) => { const k = Object.keys(m.SITE.tide.ports)[0]; m.SITE.tide.ports[k] = { kind: "harmonic", label: "x" }; }, /ports/);
refuse("zone inconnue", (m) => { m.SPOTS[0].zone = "nulle-part"; }, /zone/);
refuse("port de marée inconnu", (m) => { m.SPOTS[0].tidePort = "atlantide"; }, /atlantide/);
refuse("identifiant de spot en double", (m) => { m.SPOTS[1].id = m.SPOTS[0].id; }, /double/);
refuse("créneau qui finit avant de commencer", (m) => { const w = m.SPOTS[0].tidalRules.windows[0]; [w.offsetBefore, w.offsetAfter] = [w.offsetAfter, w.offsetBefore]; }, /suivre/);
refuse("session initiale sur un spot inconnu", (m) => { m.SITE.seedJournal = [{ id: "x", date: "2026-01-01", spotId: "zzz", result: 5, fish: 0, lure: "a", note: "b" }]; }, /inconnu/);
refuse("export en trop", (m) => { m.HELPER = 1; }, /exports en trop/);
t("contrôle : fonction refusée", pureDataProblems({ a: { f: () => 1 } }).length === 1);
t("contrôle : undefined refusé", pureDataProblems({ a: undefined }).length === 1);
t("contrôle : NaN refusé", pureDataProblems({ a: [NaN] }).length === 1);
t("contrôle : Date refusée", pureDataProblems({ a: new Date() }).length === 1);

// 3. Empreinte de chaque partie et de chaque spot, comparée à la référence.
const now = Object.fromEntries(Object.entries(mods).map(([k, m]) => [k, fingerprint(m)]));
if (process.argv.includes("--update-ref")) {
  fs.mkdirSync(path.dirname(REF), { recursive: true });
  fs.writeFileSync(REF, JSON.stringify(now, null, 2) + "\n");
  console.log(`référence réécrite : ${path.relative(root, REF)}`);
} else {
  const ref = JSON.parse(fs.readFileSync(REF, "utf8"));
  for (const key of new Set([...Object.keys(ref), ...Object.keys(now)])) {
    const a = ref[key], b = now[key];
    if (!a || !b) { t(`${key} : guide ${a ? "retiré" : "ajouté"} (référence à mettre à jour si c'est voulu)`, false); continue; }
    for (const part of ["SITE", "GENERAL_PRINCIPLES"]) t(`${key} : ${part} inchangé`, a[part] === b[part]);
    const ids = new Set([...Object.keys(a.spots), ...Object.keys(b.spots)]);
    const changed = [...ids].filter((id) => a.spots[id] !== b.spots[id]);
    t(`${key} : ${Object.keys(a.spots).length} spots identiques à la référence`, !changed.length,
      changed.map((id) => `${id} (${!a.spots[id] ? "ajouté" : !b.spots[id] ? "retiré" : "modifié"})`).join(", "));
    t(`${key} : ordre des spots inchangé`, Object.keys(a.spots).join() === Object.keys(b.spots).join());
  }
}

const nSpots = Object.values(mods).reduce((n, m) => n + m.SPOTS.length, 0);
console.log(`[données] ${Object.keys(mods).length} fiches, ${nSpots} spots : ${pass}/${pass + fail}`);
if (fail) process.exitCode = 1;
