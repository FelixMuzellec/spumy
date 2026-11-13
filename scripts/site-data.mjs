// Fiches de sites (data/sites/<site>.config.js) : contrôle et empreintes.
//
// Une fiche est une donnée pure (aucune fonction, aucune valeur calculée) écrite en JavaScript commenté :
// les commentaires portent la provenance de chaque choix (source, date, ce qui reste à confirmer sur place)
// et JSON n'en admet pas. Ce module vérifie qu'elle reste exportable telle quelle en JSON, qu'elle respecte
// le schéma data/schema/site.schema.json et les règles qui croisent plusieurs champs.
// Utilisé par la construction (une fiche invalide arrête tout) et par tests/data.mjs.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const SCHEMA_PATH = path.join(root, "data/schema/site.schema.json");
export const EXPORTS = ["SITE", "GENERAL_PRINCIPLES", "SPOTS"];

let validator = null;
function schemaValidator() {
  if (!validator) {
    const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: false });
    validator = ajv.compile(JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8")));
  }
  return validator;
}

export async function loadSite(file) {
  const m = await import(pathToFileURL(path.resolve(root, file)).href + `?t=${Date.now()}`);
  return Object.fromEntries(Object.keys(m).map((k) => [k, m[k]]));
}

// Donnée pure : objets simples, tableaux, textes, nombres finis, booléens, null. Rien d'autre.
export function pureDataProblems(v, where = "", seen = new Set()) {
  const out = [];
  const t = typeof v;
  if (v === null || t === "string" || t === "boolean") return out;
  if (t === "number") { if (!Number.isFinite(v)) out.push(`${where} : nombre non fini (${v})`); return out; }
  if (t !== "object") { out.push(`${where} : ${t} interdit dans une fiche`); return out; }
  if (seen.has(v)) { out.push(`${where} : référence circulaire`); return out; }
  seen.add(v);
  const proto = Object.getPrototypeOf(v);
  if (Array.isArray(v)) v.forEach((x, i) => out.push(...pureDataProblems(x, `${where}[${i}]`, seen)));
  else if (proto !== Object.prototype && proto !== null) out.push(`${where} : objet ${proto?.constructor?.name || "?"} interdit`);
  else for (const [k, x] of Object.entries(v)) {
    if (x === undefined) out.push(`${where}.${k} : undefined (laisser le champ absent)`);
    else out.push(...pureDataProblems(x, `${where}.${k}`, seen));
  }
  seen.delete(v);
  return out;
}

// Règles qui croisent plusieurs champs (le schéma ne voit qu'un champ à la fois).
export function crossProblems({ SITE, SPOTS }) {
  const out = [];
  const zones = Object.keys(SITE.zones || {}), ports = SITE.tide?.ports || {};
  if (!ports[SITE.tide?.defaultPort]) out.push(`SITE.tide.defaultPort « ${SITE.tide?.defaultPort} » absent de SITE.tide.ports`);
  for (const [k, p] of Object.entries(ports)) if (p.kind === "interp") for (const e of ["a", "b"]) if (!ports[p[e]]) out.push(`port ${k} : ${e} = « ${p[e]} » absent des ports de la fiche`);
  const ids = new Set();
  for (const s of SPOTS || []) {
    if (ids.has(s.id)) out.push(`spot ${s.id} : identifiant en double`);
    ids.add(s.id);
    if (!zones.includes(s.zone)) out.push(`spot ${s.id} : zone « ${s.zone} » absente de SITE.zones`);
    if (s.tidePort !== undefined && !ports[s.tidePort]) out.push(`spot ${s.id} : port de marée « ${s.tidePort} » absent de SITE.tide.ports`);
    const wids = new Set();
    for (const w of s.tidalRules?.windows || []) {
      if (wids.has(w.id)) out.push(`spot ${s.id} : créneau ${w.id} en double`);
      wids.add(w.id);
      if (!(w.offsetAfter > w.offsetBefore)) out.push(`spot ${s.id}, créneau ${w.id} : la fin (${w.offsetAfter}) doit suivre le début (${w.offsetBefore})`);
    }
  }
  const seeds = new Set();
  for (const e of SITE.seedJournal || []) {
    if (seeds.has(e.id)) out.push(`session initiale ${e.id} en double`);
    seeds.add(e.id);
    if (!ids.has(e.spotId)) out.push(`session initiale ${e.id} : spot « ${e.spotId} » inconnu`);
  }
  return out;
}

// Tous les problèmes d'une fiche chargée ; [] = fiche valide.
export function siteProblems(mod) {
  const out = [];
  const extra = Object.keys(mod).filter((k) => !EXPORTS.includes(k));
  if (extra.length) out.push(`exports en trop : ${extra.join(", ")} (une fiche n'exporte que ${EXPORTS.join(", ")})`);
  const data = Object.fromEntries(EXPORTS.filter((k) => k in mod).map((k) => [k, mod[k]]));
  out.push(...pureDataProblems(data, "fiche"));
  const validate = schemaValidator();
  if (!validate(data)) for (const e of validate.errors) out.push(`schéma : ${e.instancePath || "/"} ${e.message}${e.params?.additionalProperty ? ` (« ${e.params.additionalProperty} »)` : ""}${e.params?.allowedValues ? ` (${e.params.allowedValues.join(", ")})` : ""}`);
  if (!out.length) out.push(...crossProblems(data));
  return out;
}

// La fiche telle que la lira l'application : JSON, ordre des champs conservé.
export const siteJson = (mod) => JSON.stringify(Object.fromEntries(EXPORTS.map((k) => [k, mod[k]])));

// Empreinte de chaque partie et de chaque spot : toute modification d'une fiche se voit, spot par spot.
const sha = (v) => crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex").slice(0, 16);
export function fingerprint(mod) {
  return {
    SITE: sha(mod.SITE), GENERAL_PRINCIPLES: sha(mod.GENERAL_PRINCIPLES),
    spots: Object.fromEntries(mod.SPOTS.map((s) => [s.id, sha(s)])),
  };
}
