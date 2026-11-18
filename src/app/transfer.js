// Transfert de toutes les données de cet appareil vers une autre adresse ou un autre téléphone.
//
// Le navigateur range le stockage par adresse : ce qui est enregistré à une adresse (journal, tes spots, ta boîte,
// réglages, analyses photo) n'est pas visible à une autre. Ce fichier fait passer ces données d'une adresse à
// l'autre, une fois (passage à spumy.github.io, 13 nov. 2026) ou à chaque changement de téléphone.
//
// Ne voyagent jamais dans le fichier : le jeton GitHub, la clé API Claude, l'état de la sauvegarde, la météo en cache.
// À l'import, rien n'est écrasé : les sessions du journal, tes spots, tes sorties en bateau et tes analyses photo
// s'ajoutent à ceux de l'appareil (union par identifiant) ; un réglage déjà présent sur l'appareil est gardé.
import { idbGet, idbKeys, idbSet } from "../core/idb.js";
import { mergeMyRecords } from "../bord/engine/myspots.js";
import { mergeEntries } from "./merge.js";

export const TRANSFER_FORMAT = "spumy/donnees";
export const TRANSFER_VERSION = 1;

// Jamais exporté : secrets, état de sauvegarde, caches re-téléchargeables, brouillons de l'instant.
const SKIP = [/^bar:sync/, /^bar:claude/, /^bar:data:/, /^bar:offshore:wx/, /^bar:scores/, /^bar:encours:/, /^bar:probe/];
const keep = (k) => k.startsWith("bar:") && !SKIP.some((re) => re.test(k));
const IDB_KEEP = /^photos:/;   // historique des analyses photo (vignettes comprises) ; ni brouillon ni analyse en cours

const parse = (s) => { try { return JSON.parse(s); } catch { return undefined; } };
const byId = (a, b) => { const m = new Map(); for (const x of [...(a || []), ...(b || [])]) if (x && x.id != null) m.set(String(x.id), { ...(m.get(String(x.id)) || {}), ...x }); return [...m.values()]; };

/** Ce que contient un ensemble de données, en mots : « 12 sessions (logonna-daoulas 9, pirou 3) · 2 spots… ». */
export function summarize(ls, idb) {
  const by = (pre) => Object.entries(ls).filter(([k]) => k.startsWith(pre)).map(([k, v]) => [k.slice(pre.length), (parse(v) || []).filter((x) => !x?.deleted).length]).filter(([, n]) => n > 0);
  const j = by("bar:journal:"), sp = by("bar:myspots:");
  const nJ = j.reduce((a, [, n]) => a + n, 0), nS = sp.reduce((a, [, n]) => a + n, 0);
  const nP = Object.values(idb).reduce((a, v) => a + (Array.isArray(v) ? v.length : 0), 0);
  const other = Object.keys(ls).filter((k) => !/^bar:(journal|myspots):/.test(k)).length;
  const parts = [];
  parts.push(`${nJ} session${nJ > 1 ? "s" : ""} au journal${j.length ? ` (${j.map(([g, n]) => `${g} ${n}`).join(", ")})` : ""}`);
  if (nS) parts.push(`${nS} spot${nS > 1 ? "s" : ""} à toi`);
  if (nP) parts.push(`${nP} analyse${nP > 1 ? "s" : ""} photo`);
  if (other) parts.push(`${other} réglage${other > 1 ? "s" : ""}`);
  return { sessions: nJ, spots: nS, photos: nP, settings: other, text: parts.join(" · ") };
}

/** Rassemble les données de cet appareil (localStorage « bar:… » et historique photo d'IndexedDB). */
export async function collectAll() {
  const ls = {};
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && keep(k)) ls[k] = localStorage.getItem(k); }
  const idb = {};
  for (const k of await idbKeys()) if (typeof k === "string" && IDB_KEEP.test(k)) { const v = await idbGet(k); if (Array.isArray(v) && v.length) idb[k] = v; }
  return { format: TRANSFER_FORMAT, version: TRANSFER_VERSION, exportedAt: new Date().toISOString(), from: location.origin + location.pathname.replace(/[^/]*$/, ""), localStorage: ls, indexedDB: idb };
}

/** Lit un fichier de transfert ; une erreur dit ce qu'est le fichier quand ce n'en est pas un. */
export function readTransfer(text) {
  const d = parse(text);
  if (Array.isArray(d)) throw new Error("ce fichier est le journal d'un seul guide : importe-le dans l'onglet Journal de ce guide");
  if (!d || typeof d !== "object" || d.format !== TRANSFER_FORMAT) throw new Error("ce n'est pas un fichier « Toutes mes données » de SPUMY");
  if (!Number.isInteger(d.version) || d.version > TRANSFER_VERSION) throw new Error("fichier fait par une version plus récente de SPUMY : mets d'abord l'application à jour");
  if (!d.localStorage || typeof d.localStorage !== "object") throw new Error("fichier incomplet");
  return d;
}

/** Ajoute les données du fichier à celles de l'appareil, sans rien écraser. Renvoie ce qui a été ajouté. */
export async function importAll(d) {
  const added = { sessions: 0, spots: 0, photos: 0, settings: 0, kept: 0 };
  for (const [k, v] of Object.entries(d.localStorage)) {
    if (!keep(k) || typeof v !== "string") continue;
    const cur = localStorage.getItem(k);
    let next = v;
    if (k.startsWith("bar:journal:")) {
      const a = parse(cur) || [], b = parse(v);
      if (!Array.isArray(b)) continue;
      const m = mergeEntries(b, a); added.sessions += m.length - a.length; next = JSON.stringify(m);   // l'appareil complète le fichier
    } else if (k.startsWith("bar:myspots:")) {
      const a = parse(cur) || [], b = parse(v);
      if (!Array.isArray(b)) continue;
      const m = mergeMyRecords(b, a); added.spots += Math.max(0, m.filter((x) => !x.deleted).length - a.filter((x) => !x?.deleted).length); next = JSON.stringify(m);
    } else if (/^bar:offshore:(trips|spots)$/.test(k)) {
      const a = parse(cur) || [], b = parse(v);
      if (!Array.isArray(a) || !Array.isArray(b)) { if (cur == null) { localStorage.setItem(k, v); added.settings++; } else added.kept++; continue; }
      next = JSON.stringify(byId(a, b));
    } else if (cur != null) { added.kept++; continue; }   // réglage déjà là : on garde celui de l'appareil
    else added.settings++;
    if (next !== cur) localStorage.setItem(k, next);
  }
  for (const [k, v] of Object.entries(d.indexedDB || {})) {
    if (!IDB_KEEP.test(k) || !Array.isArray(v)) continue;
    const cur = (await idbGet(k)) || [];
    const ids = new Set(cur.map((x) => x?.id));
    const extra = v.filter((x) => x && x.id != null && !ids.has(x.id));
    if (extra.length) { await idbSet(k, [...cur, ...extra]); added.photos += extra.length; }
  }
  return added;
}

/** Enregistre un fichier sur l'appareil (téléchargement). */
export function saveFile(name, text) {
  const u = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 4000);
}
