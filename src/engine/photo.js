// Analyse d'un spot à partir de photos — moteur, sans interface.
//
// Principe : aucune affirmation sans preuve.
//   Passe 1 — INVENTAIRE : le modèle de vision relève ce qui est visible,
//             photo par photo et zone par zone, sans interprétation de pêche.
//   Passe 2 — VÉRIFICATION : un second appel, sans mémoire du premier,
//             contrôle chaque observation sur la photo ; « absent » est écarté.
//   Passe 3 — LECTURE DU PÊCHEUR : sur la seule base des faits numérotés
//             (observations vérifiées o…, marée et lumière calculées ici t…,
//             fiche du guide f…, notes du pêcheur u…). Chaque élément doit
//             citer ses faits ; l'application écarte ceux qui n'en citent pas.
// La marée et la lumière au moment de la prise de vue sont calculées par
// l'application (date EXIF de la photo), jamais devinées par le modèle.
import { SITE } from "SITE_CONFIG";
import { allSpots } from "./myspots.js";
import { solarTimes, fmtH } from "./core.js";
import { tideDay, tidePred, localDecimal, msAtLocal, parisParts } from "./tide.js";
import { terrainOf, waterDirOf, GRATTER, ENCOMBREMENT, COUCHES } from "./model.js";
import { spotLatLon, kmBetween, dir16Of } from "./weather.js";
import { FAMILLES } from "./lures.js";

export const PHOTO = { maxPhotos: 6, longEdge: 2000, jpegQuality: 0.85, thumbEdge: 256, keep: 6 };
// Prix publics par million de jetons (USD), relevés sur platform.claude.com le 25/10/2026.
export const CLAUDE_MODELS = {
  "claude-opus-5-5": { label: "Claude Opus 5.5 — le plus précis", in: 4, out: 20 },
  "claude-sonnet-5-5": { label: "Claude Sonnet 5.5 — environ deux fois moins cher", in: 2, out: 10 },
};
export const DEFAULT_MODEL = "claude-opus-5-5";
// Une seule clé pour tous les guides (même origine) ; elle ne quitte jamais l'appareil,
// sauf vers api.anthropic.com dans l'en-tête de la requête.
export const CLAUDE_CFG_KEY = "bar:claude";
export const PHOTOS_KEY = "bar:photos:" + SITE.id;
export const API_URL = "https://api.anthropic.com/v1/messages";
export const MODELS_URL = "https://api.anthropic.com/v1/models";
// Page de création des clés (platform.claude.com/docs/en/get-api-key, relu le 25/10/2026).
export const KEYS_URL = "https://platform.claude.com/settings/keys";
// Achat de crédit (support.claude.com, « How do I pay for my API usage? », relu le 26/10/2026) :
// Billing → « Buy credits ». Crédits prépayés, non remboursables, valables un an.
export const BILLING_URL = "https://platform.claude.com/settings/billing";
export const PHOTO_JOB_KEY = "photojob:" + SITE.id;
export { TERRAIN_KEY, withTerrainOverrides } from "./terrain.js";

// ─────────────────────────────────────────────────────────────────────
// EXIF : date de prise de vue et position, lues dans le JPEG d'origine.
// (Les images envoyées sont ré-encodées : elles ne contiennent plus aucune métadonnée.)
// ─────────────────────────────────────────────────────────────────────
export function readExif(buf) {
  try {
    const v = new DataView(buf instanceof ArrayBuffer ? buf : buf.buffer);
    if (v.byteLength < 4 || v.getUint16(0) !== 0xffd8) return null;
    let p = 2;
    while (p + 4 <= v.byteLength) {
      if (v.getUint8(p) !== 0xff) return null;
      const marker = v.getUint8(p + 1), len = v.getUint16(p + 2);
      if (marker === 0xda || marker === 0xd9) return null;           // début de l'image : plus de métadonnées
      if (marker === 0xe1 && p + 10 <= v.byteLength && v.getUint32(p + 4) === 0x45786966 && v.getUint16(p + 8) === 0) {
        return parseTiff(v, p + 10, Math.min(v.byteLength, p + 2 + len));
      }
      p += 2 + len;
    }
    return null;
  } catch { return null; }
}
function parseTiff(v, t0, end) {
  const order = v.getUint16(t0);
  if (order !== 0x4949 && order !== 0x4d4d) return null;
  const le = order === 0x4949;
  const u16 = (o) => v.getUint16(o, le), u32 = (o) => v.getUint32(o, le);
  if (u16(t0 + 2) !== 42) return null;
  const SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
  const readIfd = (off) => {
    const out = {};
    const at = t0 + off;
    if (at + 2 > end) return out;
    const n = u16(at);
    for (let i = 0; i < n; i++) {
      const e = at + 2 + i * 12;
      if (e + 12 > end) break;
      const tag = u16(e), type = u16(e + 2), count = u32(e + 4);
      const size = (SIZE[type] || 0) * count;
      if (!size) continue;
      const vo = size <= 4 ? e + 8 : t0 + u32(e + 8);
      if (vo + size > end) continue;
      if (type === 2) { let s = ""; for (let k = 0; k < count; k++) { const c = v.getUint8(vo + k); if (!c) break; s += String.fromCharCode(c); } out[tag] = s.trim(); }
      else if (type === 3) out[tag] = count === 1 ? u16(vo) : Array.from({ length: count }, (_, k) => u16(vo + 2 * k));
      else if (type === 4) out[tag] = count === 1 ? u32(vo) : Array.from({ length: count }, (_, k) => u32(vo + 4 * k));
      else if (type === 5) out[tag] = Array.from({ length: count }, (_, k) => { const d = u32(vo + 8 * k + 4); return d ? u32(vo + 8 * k) / d : 0; });
    }
    return out;
  };
  const ifd0 = readIfd(u32(t0 + 4));
  const exif = ifd0[0x8769] ? readIfd(ifd0[0x8769]) : {};
  const gps = ifd0[0x8825] ? readIfd(ifd0[0x8825]) : {};
  const dms = (a) => (Array.isArray(a) && a.length === 3 ? a[0] + a[1] / 60 + a[2] / 3600 : null);
  let lat = dms(gps[2]), lon = dms(gps[4]);
  if (lat != null && gps[1] === "S") lat = -lat;
  if (lon != null && gps[3] === "W") lon = -lon;
  const ok = (x, m) => x != null && Number.isFinite(x) && Math.abs(x) <= m && x !== 0;
  if (!exif[0x9003] && !ifd0[0x0132] && !ok(lat, 90) && !ifd0[0x0112]) return null;   // rien d'utile (EXIF vide ou tronqué)
  return {
    date: exif[0x9003] || ifd0[0x0132] || null,
    offset: exif[0x9011] || exif[0x9010] || null,
    lat: ok(lat, 90) ? +lat.toFixed(6) : null,
    lon: ok(lon, 180) ? +lon.toFixed(6) : null,
    orientation: ifd0[0x0112] || null,
  };
}

/** Heure saisie dans un champ datetime-local (« 2026-10-29T14:30 ») : heure de Paris, quel que soit le fuseau
 *  du téléphone (le reste de l'application compte en heure de Paris). NaN si la saisie est vide ou invalide. */
export function parisInputMs(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(v || ""));
  if (!m) return NaN;
  const [, mo, d, hh, mi, ss] = m.slice(1).map((x) => +(x || 0));
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || hh > 23 || mi > 59) return NaN;
  return msAtLocal(`${m[1]}-${m[2]}-${m[3]}`, hh + mi / 60 + ss / 3600);
}

/** Instant de prise de vue : EXIF avec fuseau, EXIF supposé à l'heure de Paris, ou date du fichier. */
export function photoInstant(exif, lastModified) {
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(exif?.date || "");
  if (m) {
    const [y, mo, d, hh, mi, ss] = m.slice(1).map(Number);
    if (y > 1990 && mo >= 1 && mo <= 12) {
      const off = /^([+-])(\d{2}):?(\d{2})$/.exec(exif.offset || "");
      if (off) {
        const mins = (off[1] === "-" ? -1 : 1) * (+off[2] * 60 + +off[3]);
        return { ms: Date.UTC(y, mo - 1, d, hh, mi, ss) - mins * 60000, source: "exif", note: "date de prise de vue de la photo" };
      }
      const iso = `${m[1]}-${m[2]}-${m[3]}`;
      return { ms: msAtLocal(iso, hh + mi / 60 + ss / 3600), source: "exif-paris", note: "date de prise de vue, heure de Paris supposée" };
    }
  }
  if (Number.isFinite(lastModified) && lastModified > 0) return { ms: lastModified, source: "fichier", note: "date du fichier (peut être celle d'un transfert)" };
  return { ms: null, source: null, note: "heure de prise de vue inconnue" };
}

export const parisISO = (ms) => { const p = parisParts(ms); return `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`; };
const frDate = (iso) => iso.split("-").reverse().join("/");
const fr1 = (x) => String(Math.round(x * 10) / 10).replace(".", ",");

/** Spot de la liste le plus proche d'une position GPS. */
export function nearestSpot(lat, lon, spots = allSpots()) {
  if (lat == null || lon == null) return null;
  let best = null;
  for (const s of spots) {
    const c = spotLatLon(s); if (!c) continue;
    const km = kmBetween({ lat, lon }, c);
    if (!best || km < best.km) best = { spot: s, km: Math.round(km * 10) / 10 };
  }
  return best;
}

// ─────────────────────────────────────────────────────────────────────
// Faits calculés par l'application (t…) : marée et lumière à l'instant de la photo.
// ─────────────────────────────────────────────────────────────────────
function lightAt(dec, sun) {
  if (!sun || sun.sunrise == null) return null;
  if (dec >= sun.dawn && dec < sun.sunrise + 0.75) return "aube, basse lumière";
  if (dec >= sun.sunset - 0.75 && dec < sun.dusk) return "crépuscule, basse lumière";
  if (dec >= sun.sunrise + 0.75 && dec < sun.sunset - 0.75) return "plein jour";
  return "nuit";
}
/** Hauteur d'eau, phase et coefficient au port du spot, à un instant donné. */
export function tideAt(spot, ms) {
  const port = spot?.tidePort || SITE.tide.defaultPort;
  const iso = parisISO(ms);
  const td = tideDay(iso, port);
  const ev = td.events;
  let prev = null, next = null;
  for (const e of ev) { if (e.ms <= ms) prev = e; else if (!next) next = e; }
  if (!prev || !next) return null;
  const P = SITE.tide.ports[port];
  let h;
  if (P.kind === "harmonic") h = tidePred(P.station).level(ms) + P.z0;
  else { const f = (ms - prev.ms) / (next.ms - prev.ms); h = prev.h + (next.h - prev.h) * (1 - Math.cos(f * Math.PI)) / 2; }
  const lo = Math.min(prev.h, next.h), hi = Math.max(prev.h, next.h);
  const pct = hi > lo ? Math.round(((h - lo) / (hi - lo)) * 100) : null;
  const pm = prev.type === "PM" ? prev : next;
  return {
    port, portLabel: P.label, method: P.kind, accuracy: P.accuracy, iso, phase: prev.type === "BM" ? "montante" : "descendante",
    prev, next, h: Math.max(0, h), pct, coef: pm.coef ?? null,
    sincePrevH: (ms - prev.ms) / 36e5, toNextH: (next.ms - ms) / 36e5,
  };
}
const hm = (h) => { const m = Math.round(h * 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`; };
/** « de » devant un nom de port, avec l'élision et la contraction du français (d'Audierne, du Conquet, de l'Aber Wrac'h). */
export function deNom(n) {
  const x = String(n || "");
  if (/^Le /.test(x)) return `du ${x.slice(3)}`;
  if (/^Les /.test(x)) return `des ${x.slice(4)}`;
  if (/^La /.test(x)) return `de la ${x.slice(3)}`;
  if (/^L['’]/.test(x)) return `de l'${x.slice(2)}`;
  if (/^[AEIOUYÉÈÊÂÎÔaeiouyéèêâîô]/.test(x)) return `d'${x}`;
  return `de ${x}`;
}
/** Faits t… : un par instant de prise de vue distinct (à 10 min près). */
export function timeFacts(spot, photos) {
  const out = [];
  const seen = [];
  photos.forEach((ph, i) => {
    if (!Number.isFinite(ph.when?.ms)) return;
    const dupe = seen.find((x) => Math.abs(x.ms - ph.when.ms) < 10 * 60000);
    if (dupe) { dupe.photos.push(i + 1); dupe.notes.push(ph.when.note); return; }
    seen.push({ ms: ph.when.ms, photos: [i + 1], src: ph.when, notes: [ph.when.note] });
  });
  seen.forEach((x) => {
    const iso = parisISO(x.ms), dec = localDecimal(x.ms, iso);
    const sun = solarTimes(iso);
    const light = lightAt(dec, sun);
    const t = spot ? tideAt(spot, x.ms) : null;
    const who = x.photos.length > 1 ? `Photos ${x.photos.join(", ")}` : `Photo ${x.photos[0]}`;
    const notes = new Set(x.notes).size === 1 ? x.src.note : x.photos.map((n, k) => `photo ${n} : ${x.notes[k]}`).join(" ; ");
    let txt = `${who} : prise${x.photos.length > 1 ? "s" : ""} le ${frDate(iso)} à ${fmtH(dec)}${x.photos.length > 1 ? " (à 10 min près)" : ""} (${notes}).`;
    if (light) txt += ` Lumière : ${light} (lever ${fmtH(sun.sunrise)}, coucher ${fmtH(sun.sunset)}).`;
    if (t) {
      txt += ` Marée ${t.phase} au port ${deNom(t.portLabel)}, ${hm(t.sincePrevH)} après la ${t.prev.type === "PM" ? "pleine" : "basse"} mer de ${fmtH(localDecimal(t.prev.ms, iso))}`
        + ` et ${hm(t.toNextH)} avant la ${t.next.type === "PM" ? "pleine" : "basse"} mer de ${fmtH(localDecimal(t.next.ms, iso))}`
        + `${t.coef ? `, coefficient ${t.coef}` : ""} ; hauteur d'eau calculée ${fr1(t.h)} m`
        + `${t.pct != null ? `, soit ${t.pct} % du chemin entre la basse mer (${fr1(Math.min(t.prev.h, t.next.h))} m) et la pleine mer (${fr1(Math.max(t.prev.h, t.next.h))} m)` : ""}`
        + `${t.method !== "harmonic" && t.accuracy ? ` (marée de ce port : ${t.accuracy})` : ""}.`;
      if (t.pct != null && t.pct < 50) txt += " À pleine mer, l'eau sera plus haute que sur cette photo : une partie de ce qui est découvert sera couvert.";
      if (t.pct != null && t.pct >= 50) txt += " À basse mer, l'eau sera plus basse que sur cette photo : une partie de ce qui est sous l'eau se découvrira.";
    }
    out.push({ id: `t${out.length + 1}`, t: txt, kind: "calculé par l'application", photos: x.photos });
  });
  return out;
}

/** Faits f… : la fiche du spot dans le guide (à confirmer ou contredire par les photos). */
export function ficheFacts(spot) {
  if (!spot) return [];
  const T = terrainOf(spot);
  const conf = (c) => (c === "verified" ? "sourcé" : "déduit");
  const f = [];
  const add = (t, kind) => { if (t) f.push({ id: `f${f.length + 1}`, t, kind }); };
  add(`Spot : ${spot.name} (${spot.subtitle}) — type « ${String(spot.type).toLowerCase()} ».`, "fiche du guide");
  add(`Fond : ${T.fond}`, `fiche, ${conf(T.confidence)}`);
  add(`Encombrement ${T.encombrement}/3 (${ENCOMBREMENT[T.encombrement] || ""}) ; ${GRATTER[T.gratter]?.label || T.gratter}.`, `fiche, ${conf(T.confidence)}`);
  add(`Couches d'eau pêchables : ${T.couches.join(", ")}.`, `fiche, ${conf(T.confidence)}`);
  if (T.montage) add(`Montage conseillé : ${T.montage}`, `fiche, ${conf(T.confidence)}`);
  const w = waterDirOf(spot);
  if (w != null) add(`Le large est vers le ${dir16Of(w)} (déduit des secteurs de vent exposés de la fiche).`, "fiche, déduit");
  for (const k of ["structure", "courant", "exposition", "bars"]) {
    const x = spot.topology?.[k];
    if (x?.text) add(`${k[0].toUpperCase() + k.slice(1)} : ${x.text}`, `fiche, ${conf(x.confidence)}`);
  }
  if (spot.tidalRules?.montantOuDescendant) add(`Marée : ${spot.tidalRules.montantOuDescendant}`, "fiche du guide");
  for (const r of spot.securite || []) add(`Sécurité : ${r.t}`, r.s);
  return f;
}

// ─────────────────────────────────────────────────────────────────────
// Schémas de réponse (sorties structurées de l'API : pas de minLength, maxItems, etc.)
// ─────────────────────────────────────────────────────────────────────
export const OBS_CATS = {
  surface_eau: "surface de l'eau", courant: "courant visible", couleur_eau: "couleur de l'eau", roche: "roche",
  sable_vase_galets: "sable, vase, galets", vegetation: "algues, herbier", estran: "estran", ouvrage: "ouvrage",
  acces: "accès", danger: "danger", vie: "vie visible", ciel_lumiere: "ciel et lumière", autre: "autre",
};
const str = { type: "string" };
const obj = (properties) => ({ type: "object", additionalProperties: false, required: Object.keys(properties), properties });
const arr = (items) => ({ type: "array", items });
const refs = arr(str);
export const SCHEMA_OBS = obj({
  photos: arr(obj({ photo: { type: "integer" }, vue: str, qualite: { type: "string", enum: ["bonne", "moyenne", "faible"] }, limites: str })),
  observations: arr(obj({ photo: { type: "integer" }, zone: str, x: { type: "integer" }, y: { type: "integer" },
    categorie: { type: "string", enum: Object.keys(OBS_CATS) }, fait: str, confiance: { type: "string", enum: ["elevee", "moyenne", "faible"] } })),
  non_visible: arr(str),
});
export const SCHEMA_VERIF = obj({
  verdicts: arr(obj({ id: str, statut: { type: "string", enum: ["confirme", "douteux", "absent"] }, raison: str })),
});
export const SCHEMA_LECTURE = obj({
  synthese: str,
  lecture: arr(obj({ titre: str, texte: str, nature: { type: "string", enum: ["observe", "deduit"] }, refs })),
  postes: arr(obj({ nom: str, emplacement: str, pourquoi: str, moment: str, confiance: { type: "string", enum: ["elevee", "moyenne", "faible"] }, refs })),
  approche: arr(obj({ texte: str, refs })),
  securite: arr(obj({ texte: str, refs })),
  accroche: obj({ niveau: { type: "string", enum: ["faible", "moyen", "fort", "indetermine"] }, raison: str, refs }),
  leurres: arr(obj({ famille: { type: "string", enum: Object.keys(FAMILLES) }, pourquoi: str, refs })),
  fiche: arr(obj({ point: str, fiche_dit: str, photos_montrent: str, accord: { type: "string", enum: ["accord", "desaccord", "non_tranche"] }, refs })),
  a_verifier: arr(str),
  propositions: arr(obj({ champ: { type: "string", enum: ["encombrement", "gratter", "couches"] }, valeur: str, raison: str, refs })),
});

/**
 * Ramène une valeur à la forme d'un schéma : propriétés connues seulement, chaînes bornées,
 * entiers vérifiés, tableaux bornés. Sert aux réponses du modèle (l'abonnement claude.ai ne
 * garantit pas le format) et aux analyses importées d'un fichier : rien d'autre n'entre.
 */
export function conform(v, schema, depth = 0) {
  if (!schema || depth > 6) return null;
  if (schema.type === "object") {
    const src = v && typeof v === "object" && !Array.isArray(v) ? v : {};
    const out = {};
    for (const [k, sub] of Object.entries(schema.properties || {})) out[k] = conform(src[k], sub, depth + 1);
    return out;
  }
  if (schema.type === "array") return (Array.isArray(v) ? v.slice(0, 200) : []).map((x) => conform(x, schema.items, depth + 1));
  if (schema.type === "integer") { const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN; return Number.isFinite(n) ? Math.round(n) : null; }
  if (schema.type === "string") return typeof v === "string" ? v.slice(0, 4000) : typeof v === "number" || typeof v === "boolean" ? String(v) : "";
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// Consignes des trois passes
// ─────────────────────────────────────────────────────────────────────
export const SYS_OBS = `Tu es l'œil d'un guide de pêche du bar au leurre, du bord. Ta seule tâche : INVENTORIER ce qui est visible sur les photos, sans aucune interprétation de pêche.

Méthode, photo par photo :
1. Dis ce que montre la photo (angle de vue, distance, partie du site) et sa qualité.
2. Balaie l'image dans l'ordre : premier plan, plan moyen, arrière-plan ; de gauche à droite.
3. Relève ce qui est visible parmi : l'état de la surface (lisse, ridée, clapot, vagues, déferlement, écume, lignes ou veines, remous, plaques lisses dans une zone ridée) ; la couleur et la transparence de l'eau et leurs contrastes ; la roche (platier, blocs, failles, tombant, galets) ; le sable ou la vase ; la végétation (algues, goémon, herbier) ; l'estran découvert ; les ouvrages (cale, digue, épi, bouchots, tables à huîtres, corps-morts, bouées) ; les accès et les dangers visibles ; la vie visible (oiseaux qui plongent ou tournent, éclaboussures, poissons) ; le ciel et la lumière.

Règles strictes :
- Une observation = un seul fait visible, situé : numéro de photo et zone de l'image (« premier plan gauche », « centre, plan moyen »…), plus x et y, la position approximative de son centre en pourcentage de la photo (x : 0 au bord gauche, 100 au bord droit ; y : 0 en haut, 100 en bas).
- Aucun mot d'interprétation de pêche (poste, bar, chasse probable, bon coin…) : seulement ce qui se voit.
- Aucune mesure inventée : pas de profondeur, de vitesse de courant, de hauteur ni de distance chiffrées. Les comparaisons sont permises (« plus foncé que », « plus large que »).
- Si un élément est ambigu, dis-le et mets la confiance à « faible » ; ne le complète jamais avec ce qui serait probable.
- Ne nomme pas le lieu, sauf s'il est écrit sur la photo.
- Ignore les personnes : ne les décris pas et ne cherche pas à les identifier.
- Dans « non_visible », liste ce que ces photos ne permettent pas de savoir et qui compterait pour un pêcheur (profondeur, nature du fond sous l'eau, courant hors de la surface visible, ce qui est hors cadre…).
- Réponds en français.`;

export const SYS_VERIF = `Tu es un contrôleur exigeant. On te donne des photos et une liste d'observations faites par quelqu'un d'autre.
Pour chaque observation, regarde la photo et la zone indiquées, et décide :
- « confirme » : le fait est nettement visible à cet endroit ;
- « douteux » : c'est possible mais ambigu, flou, ou visible ailleurs que dans la zone et la position indiquées ;
- « absent » : tu ne le vois pas, ou la photo le contredit.
Sois strict : entre « confirme » et « douteux », choisis « douteux ». Une mesure chiffrée ou une interprétation présentée comme un fait visible est « absent ».
Juge seulement ce qui est visible ; n'ajoute aucune observation. Donne pour chaque verdict une raison courte, en français. Rends exactement un verdict par identifiant reçu.`;

export const SYS_LECTURE = `Tu es un pêcheur professionnel du bar au leurre, du bord, sur les côtes de Bretagne et de Normandie. Tu lis un spot à partir de FAITS numérotés, et de rien d'autre :
- o… : observations des photos, vérifiées (« incertain » quand la vérification les a jugées douteuses) ;
- t… : marée et lumière au moment des photos, calculées par l'application ;
- f… : fiche du spot dans le guide ;
- u… : ce que dit le pêcheur.

Méthode : 1. lecture de l'eau et du courant ; 2. structures et fond ; 3. où le bar a des raisons de se tenir, et pourquoi (postes) ; 4. moment de marée et de lumière, seulement si des faits t ou f le permettent ; 5. approche et placement du pêcheur ; 6. sécurité ; 7. risque d'accroche ; 8. familles de leurres adaptées aux couches d'eau et au fond ; 9. confrontation avec la fiche (seulement si des faits f existent) ; 10. ce qu'il faut vérifier sur place.

Règles strictes :
- Chaque élément cite dans « refs » les identifiants exacts des faits qui le fondent. Un élément qu'aucun fait ne fonde ne doit pas être écrit.
- « observe » quand l'élément reprend un fait ; « deduit » quand c'est ton raisonnement de pêcheur à partir des faits, et alors le raisonnement doit apparaître dans le texte.
- N'invente rien : aucune profondeur, vitesse, distance, proie, nom de lieu ou source qui ne figure pas dans les faits.
- Une observation « incertaine » ne fonde jamais seule un poste ou une consigne.
- Si les faits ne suffisent pas, dis-le (accroche « indetermine », moment « non déterminable avec ces photos ») plutôt que de combler.
- Leurres : seulement les familles surface, nageur (poisson nageur), weightless (souple non plombé ou texan), shad (souple plombé), metal ; aucune marque ni modèle.
- « fiche » reste vide s'il n'y a aucun fait f.
- « propositions » : seulement quand des observations confirmées contredisent ou précisent la fiche sur l'encombrement du fond (valeur 1, 2 ou 3), la pêche à gratter (oui, texan ou non) ou les couches d'eau pêchables (liste parmi surface, sous-surface, mi-eau, fond, séparées par des virgules). Une photo ne montre pas le fond sous l'eau : ne propose que ce que les parties visibles établissent. Sinon, laisse la liste vide.
- Ton direct et concret, phrases courtes. Réponds en français.`;

// ─────────────────────────────────────────────────────────────────────
// Contenu des requêtes
// ─────────────────────────────────────────────────────────────────────
const imageBlocks = (photos) => photos.flatMap((p, i) => [
  { type: "text", text: `Photo ${i + 1} :` },
  { type: "image", source: { type: "base64", media_type: "image/jpeg", data: p.b64 } },
]);
export function contentObs(photos) {
  return [...imageBlocks(photos), { type: "text", text: `Inventorie ces ${photos.length} photo${photos.length > 1 ? "s" : ""} selon la méthode. Numérote les photos de 1 à ${photos.length}.` }];
}
export const obsLine = (o) => `${o.id} · photo ${o.photo} · ${o.zone}${o.x != null ? ` (≈ x ${o.x} %, y ${o.y} %)` : ""} · [${OBS_CATS[o.categorie] || o.categorie}] ${o.fait}`;
export function contentVerif(photos, observations) {
  return [...imageBlocks(photos), { type: "text", text: `Observations à contrôler (${observations.length}) :\n${observations.map(obsLine).join("\n")}` }];
}
export function contentLecture({ observations, tFacts, fFacts, uFacts }) {
  const lines = [];
  lines.push("FAITS DES PHOTOS (o) :");
  for (const o of observations) lines.push(`${obsLine(o)}${o.statut === "douteux" ? " — INCERTAIN" : ""}`);
  lines.push("", "MARÉE ET LUMIÈRE AU MOMENT DES PHOTOS (t) :");
  lines.push(...(tFacts.length ? tFacts.map((x) => `${x.id} · ${x.t}`) : ["(aucun : heure de prise de vue inconnue)"]));
  lines.push("", "FICHE DU SPOT DANS LE GUIDE (f) :");
  lines.push(...(fFacts.length ? fFacts.map((x) => `${x.id} · ${x.t} [${x.kind}]`) : ["(aucune : spot hors du guide)"]));
  if (uFacts.length) { lines.push("", "CE QUE DIT LE PÊCHEUR (u) :"); lines.push(...uFacts.map((x) => `${x.id} · ${x.t}`)); }
  lines.push("", "Lis ce spot selon la méthode, en citant les identifiants des faits.");
  return [{ type: "text", text: lines.join("\n") }];
}

/**
 * Corps de requête Messages → entrée de la capacité « sample » d'une page claude.ai
 * (analyse par l'abonnement, sans clé ni crédit API) : pas de consigne système ni de format
 * imposé, donc consigne, contenu et schéma dans un seul texte ; les photos partent à part,
 * dans l'ordre.
 */
export function sampleInputOf(body) {
  const content = body.messages?.[0]?.content || [];
  const images = content.filter((b) => b.type === "image").map((b) => b.source.data);
  let n = 0;
  const parts = content.map((b) => (b.type === "text" ? b.text : `[photo ${++n} : ${n === 1 ? "1re" : `${n}e`} image jointe]`));
  const schema = body.output_config?.format?.schema;
  const text = [
    body.system, "",
    ...(images.length ? [`Les ${images.length} photo${images.length > 1 ? "s sont jointes" : " est jointe"} à ce message, dans l'ordre : la première image jointe est la photo 1, et ainsi de suite.`, ""] : []),
    parts.join("\n"),
    ...(schema ? ["", "Réponds uniquement par un objet JSON conforme à ce schéma JSON, sans texte avant ni après :", JSON.stringify(schema)] : []),
  ].join("\n");
  return { text, images, effort: body.output_config?.effort || null, schema: schema || null };
}

/** Corps d'une requête Messages (sans la clé). */
export function buildRequest({ model, system, content, schema, effort, maxTokens }) {
  const body = { model, max_tokens: maxTokens, system, messages: [{ role: "user", content }] };
  body.output_config = { ...(effort ? { effort } : {}), ...(schema ? { format: { type: "json_schema", schema } } : {}) };
  if (!Object.keys(body.output_config).length) delete body.output_config;
  return body;
}
export const apiHeaders = (key) => ({
  "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json",
  // Accès direct depuis le navigateur : la clé est celle de l'utilisateur, saisie sur son appareil.
  "anthropic-dangerous-direct-browser-access": "true",
});

/** Message d'erreur lisible pour une réponse de l'API. */
export function apiError(status, body) {
  const msg = String(body?.error?.message || "");
  if (/credit balance/i.test(msg)) return "Crédit API épuisé ou insuffisant : ajoute du crédit sur platform.claude.com/settings/billing (« Buy credits »).";
  if (status === 401) return "Clé API refusée : invalide ou révoquée.";
  if (status === 403) return "Accès refusé avec cette clé (permissions).";
  if (status === 413) return "Photos trop lourdes pour une requête : envoies-en moins.";
  if (status === 429) return "Trop de requêtes pour l'instant : réessaie dans une minute.";
  if (status === 529 || status === 503 || status === 502) return "Service d'Anthropic surchargé : réessaie dans quelques minutes.";
  if (status === 404 && /model/i.test(msg)) return "Modèle indisponible pour cette clé : choisis l'autre modèle.";
  return `Erreur de l'API (${status})${msg ? ` : ${msg}` : ""}.`;
}
/** Extrait le JSON d'une réponse (blocs « text » ; les blocs de réflexion sont ignorés). */
export function jsonFromMessage(msg) {
  const txt = (msg?.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  if (!txt) throw new Error("Réponse vide.");
  try { return JSON.parse(txt); } catch { /* repli ci-dessous */ }
  const a = txt.indexOf("{"), b = txt.lastIndexOf("}");
  if (a >= 0 && b > a) return JSON.parse(txt.slice(a, b + 1));
  throw new Error("Réponse illisible (pas de JSON).");
}

/**
 * Appel à l'API. Si le format structuré est refusé (400 qui le mentionne), un seul
 * nouvel essai sans format, avec la consigne de répondre en JSON seul : le schéma
 * est alors vérifié par l'application.
 */
export async function callClaude(key, body, { signal, fetchImpl = fetch } = {}) {
  const send = async (b) => {
    let res;
    try { res = await fetchImpl(API_URL, { method: "POST", headers: apiHeaders(key), body: JSON.stringify(b), signal }); }
    catch (e) { if (e?.name === "AbortError") throw e; throw new Error("Pas de réseau, ou requête bloquée par le navigateur."); }
    let j = null; try { j = await res.json(); } catch { /* corps vide */ }
    return { res, j };
  };
  let { res, j } = await send(body);
  if (res.status === 400 && body.output_config?.format && /output_config|format|schema/i.test(j?.error?.message || "")) {
    const b2 = { ...body, output_config: body.output_config.effort ? { effort: body.output_config.effort } : undefined };
    if (!b2.output_config) delete b2.output_config;
    b2.system = `${body.system}\n\nRéponds uniquement par un objet JSON conforme à ce schéma, sans texte autour :\n${JSON.stringify(body.output_config.format.schema)}`;
    ({ res, j } = await send(b2));
  }
  if (!res.ok) throw new Error(apiError(res.status, j));
  if (j?.stop_reason === "refusal") throw new Error("Le modèle a refusé d'analyser ces photos.");
  if (j?.stop_reason === "max_tokens") throw new Error("Réponse tronquée (trop longue) : réessaie avec moins de photos.");
  return { json: jsonFromMessage(j), usage: j?.usage || {}, model: j?.model || body.model };
}

/** Coût en dollars d'un ensemble d'appels. */
export function costOf(model, usages) {
  const P = CLAUDE_MODELS[model] || CLAUDE_MODELS[DEFAULT_MODEL];
  let tin = 0, tout = 0;
  for (const u of usages) {
    tin += (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
    tout += u.output_tokens || 0;
  }
  return { tin, tout, usd: (tin * P.in + tout * P.out) / 1e6 };
}

// ─────────────────────────────────────────────────────────────────────
// Contrôles des réponses
// (l'API peut renvoyer une valeur d'énumération avec une majuscule : tout est ramené
// en minuscules sans accents avant comparaison ; les identifiants aussi.)
// ─────────────────────────────────────────────────────────────────────
const norm = (x) => String(x ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
// Valeur d'une liste fermée : une clé propre de la table, jamais une propriété héritée (« __proto__ », « constructor »…)
// qu'un fichier importé pourrait glisser.
const isKey = (table, k) => typeof k === "string" && Object.prototype.hasOwnProperty.call(table, k);
const normId = (x) => String(x ?? "").trim().toLowerCase();
/** Passe 1 : observations numérotées par l'application (o1…), photos hors plage et champs vides écartés. */
export function cleanObservations(res, nPhotos) {
  const keep = [], dropped = [];
  for (const o0 of res?.observations || []) {
    const o = { ...o0, categorie: norm(o0?.categorie), confiance: norm(o0?.confiance) };
    // Position approximative : gardée seulement si elle est dans la photo.
    const inPct = (v) => Number.isFinite(v) && v >= 0 && v <= 100;
    if (!(inPct(o.x) && inPct(o.y))) { o.x = null; o.y = null; }
    if (!["elevee", "moyenne", "faible"].includes(o.confiance)) o.confiance = "faible";
    const ok = Number.isInteger(o?.photo) && o.photo >= 1 && o.photo <= nPhotos && String(o.zone || "").trim() && String(o.fait || "").trim() && isKey(OBS_CATS, o.categorie);
    (ok ? keep : dropped).push(o);
  }
  return {
    photos: (res?.photos || []).filter((p) => Number.isInteger(p?.photo) && p.photo >= 1 && p.photo <= nPhotos),
    observations: keep.map((o, i) => ({ ...o, id: `o${i + 1}` })),
    nonVisible: (res?.non_visible || []).filter((x) => String(x || "").trim()),
    dropped,
  };
}
/** Passe 2 : statut de chaque observation ; sans verdict, elle est traitée comme douteuse. */
export function applyVerdicts(observations, res) {
  const by = new Map((res?.verdicts || []).map((v) => [normId(v.id), v]));
  const kept = [], removed = [];
  for (const o of observations) {
    const v = by.get(o.id);
    const st = norm(v?.statut);
    const statut = st === "confirme" || st === "absent" ? st : "douteux";
    const x = { ...o, statut, raison: v?.raison || (v ? "" : "non contrôlée") };
    (statut === "absent" ? removed : kept).push(x);
  }
  return { kept, removed };
}
/** Valeur d'une proposition pour la fiche, ou null si elle n'est pas lisible. */
export function parseProposal(champ, valeur) {
  const v = norm(valeur);
  if (champ === "encombrement") { const n = parseInt(v, 10); return [1, 2, 3].includes(n) && /^\s*[123]\b/.test(v) ? n : null; }
  if (champ === "gratter") return isKey(GRATTER, v) ? v : null;
  if (champ === "couches") {
    const list = v.split(/[,;]| et /).map((x) => x.trim().replace(/\s+/g, "-")).filter(Boolean);
    if (!list.length || !list.every((x) => COUCHES.includes(x))) return null;
    return COUCHES.filter((c) => list.includes(c));   // ordre canonique, sans doublon
  }
  return null;
}
export function proposalLabel(champ, v) {
  if (champ === "encombrement") return `Encombrement ${v}/3 (${ENCOMBREMENT[v]})`;
  if (champ === "gratter") return GRATTER[v].label;
  if (champ === "couches") return `Couches pêchables : ${v.join(", ")}`;
  return String(v);
}
const sameTerrainValue = (champ, v, T) => (champ === "couches" ? (T.couches || []).join() === v.join() : T[champ] === v);
/**
 * Corrections de terrain validées par le pêcheur (onglet Photos), appliquées aux fiches :
 * { spotId: { encombrement?, gratter?, couches?, at, from } }. La fiche garde sa trace.
 */
/**
 * Passe 3 : chaque élément doit citer au moins un fait connu ; les références inconnues
 * sont retirées, et l'élément est écarté s'il n'en reste aucune. Un poste ou une consigne
 * qui ne repose que sur des observations incertaines est écarté aussi.
 */
export function validateLecture(res, facts, current = null) {
  const known = new Map(facts.map((f) => [f.id, f]));
  const dropped = [];
  const fix = (x, section, { needSolid = false, needObs = false } = {}) => {
    const r = [...new Set((x?.refs || []).map(normId).filter((s) => known.has(s)))];
    const solid = r.filter((id) => !(id.startsWith("o") && known.get(id)?.statut === "douteux"));
    // Proposition pour la fiche : il faut au moins une observation de photo confirmée (pas la fiche, l'heure ou tes notes seules).
    const obsOk = solid.some((id) => id.startsWith("o"));
    if (!r.length || (needSolid && !solid.length) || (needObs && !obsOk)) { dropped.push({ section, texte: x?.texte || x?.nom || x?.titre || x?.pourquoi || x?.point || "", refs: x?.refs || [] }); return null; }
    return { ...x, refs: r };
  };
  const ENUMS = ["nature", "confiance", "famille", "accord", "niveau"];
  const clean = (x) => { const y = { ...x }; for (const k of ENUMS) if (k in y) y[k] = norm(y[k]); return y; };
  const list = (k, opt) => (res?.[k] || []).map((x) => fix(clean(x), k, opt)).filter(Boolean);
  const out = {
    synthese: String(res?.synthese || "").trim(),
    lecture: list("lecture"),
    postes: list("postes", { needSolid: true }),
    approche: list("approche"),
    securite: list("securite", { needSolid: true }),
    accroche: null,
    leurres: list("leurres").filter((l) => isKey(FAMILLES, l.famille)),
    fiche: list("fiche"),
    aVerifier: (res?.a_verifier || []).filter((x) => String(x || "").trim()),
    propositions: [],
  };
  // Propositions pour la fiche : valeur lisible, fondée sur au moins une observation confirmée,
  // et différente de ce que dit déjà la fiche (sinon ce n'est pas une proposition).
  for (const p0 of res?.propositions || []) {
    const p = { ...p0, champ: norm(p0?.champ) };
    const v = parseProposal(p.champ, p.valeur);
    const f = v == null ? null : fix(p, "propositions", { needSolid: true, needObs: true });
    if (!f) { if (v == null) dropped.push({ section: "propositions", texte: `${p0?.champ} : ${p0?.valeur}`, refs: p0?.refs || [] }); continue; }
    if (current && sameTerrainValue(p.champ, v, current)) continue;
    out.propositions.push({ ...f, value: v, label: proposalLabel(p.champ, v) });
  }
  const a = res?.accroche ? clean(res.accroche) : null;
  if (a) {
    if (!["faible", "moyen", "fort"].includes(a.niveau)) out.accroche = { ...a, niveau: "indetermine", refs: (a.refs || []).map(normId).filter((s) => known.has(s)) };
    else out.accroche = fix(a, "accroche") || { niveau: "indetermine", raison: "Aucun fait cité pour juger du risque d'accroche.", refs: [] };
  }
  return { result: out, dropped };
}

/** Compte rendu en texte brut (à copier dans le journal ou un message). */
export function reportText(a) {
  const L = a.lecture || {};
  const facts = new Map((a.facts || []).map((f) => [f.id, f]));
  const cite = (refs) => (refs?.length ? ` [${refs.join(", ")}]` : "");
  const out = [`Analyse photo — ${a.spotName} — ${a.dateLabel}`, "", L.synthese || "", ""];
  const sec = (title, items, fmt) => { if (items?.length) { out.push(title); for (const x of items) out.push(`- ${fmt(x)}`); out.push(""); } };
  sec("Lecture du spot", L.lecture, (x) => `${x.titre} : ${x.texte}${cite(x.refs)}`);
  sec("Postes", L.postes, (x) => `${x.nom} (${x.emplacement}) : ${x.pourquoi} Moment : ${x.moment}${cite(x.refs)}`);
  sec("Approche", L.approche, (x) => `${x.texte}${cite(x.refs)}`);
  sec("Sécurité", L.securite, (x) => `${x.texte}${cite(x.refs)}`);
  if (L.accroche) { out.push(`Risque d'accroche : ${L.accroche.niveau} — ${L.accroche.raison}${cite(L.accroche.refs)}`, ""); }
  sec("Leurres", L.leurres, (x) => `${FAMILLES[x.famille]?.court || x.famille} : ${x.pourquoi}${cite(x.refs)}`);
  sec("À vérifier sur place", (L.aVerifier || []).map((t) => ({ t })), (x) => x.t);
  out.push("Faits cités :");
  for (const [id, f] of facts) out.push(`${id} · ${f.t || obsLine(f)}`);
  return out.join("\n");
}

// ─────────────────────────────────────────────────────────────────────
// Déroulé des trois passes, reprenable.
// `job.partial` garde le résultat de chaque passe terminée et les jetons consommés :
// une reprise (onglet fermé, téléphone en veille, erreur) ne refait — et ne refacture —
// que les passes manquantes.
// ─────────────────────────────────────────────────────────────────────
export const photoDateLabel = (ms) => { const iso = parisISO(ms); return `${frDate(iso)} à ${fmtH(localDecimal(ms, iso))}`; };
export const PASSES = [
  { n: 1, label: "Inventaire de ce qui est visible" },
  { n: 2, label: "Vérification de chaque observation sur les photos" },
  { n: 3, label: "Lecture du pêcheur, preuves à l'appui" },
];
export const nextPass = (partial) => (!partial?.inv ? 1 : !partial?.ver ? 2 : !partial?.lec ? 3 : null);

export async function runAnalysis(job, { key, call: caller = null, onProgress, signal, fetchImpl, spots = allSpots() } = {}) {
  const { model, photos } = job;
  const spot = job.spotId ? spots.find((s) => s.id === job.spotId) || null : null;
  const P = job.partial || (job.partial = {});
  P.usages ||= [];
  P.raw ||= {};
  // Appelant : l'API avec ta clé (par défaut), ou une autre voie qui renvoie { json, usage }
  // (page claude.ai qui passe par l'abonnement). La réponse est ramenée au schéma dans les deux cas.
  const send = caller || ((body) => callClaude(key, body, { signal, fetchImpl }));
  const call = async (body) => {
    const r = await send(body);
    P.usages.push(r.usage || {});
    const schema = body.output_config?.format?.schema;
    return schema ? conform(r.json, schema) : r.json;
  };
  const step = async (n, fn) => { onProgress?.({ step: n, phase: "start", partial: P }); await fn(); onProgress?.({ step: n, phase: "done", partial: P }); };
  if (!P.inv) await step(1, async () => {
    const r1 = await call(buildRequest({ model, system: SYS_OBS, content: contentObs(photos), schema: SCHEMA_OBS, effort: "high", maxTokens: 24000 }));
    P.raw.inv = r1;
    const inv = cleanObservations(r1, photos.length);
    if (!inv.observations.length) throw new Error("Aucune observation exploitable sur ces photos.");
    P.inv = inv;
  });
  if (!P.ver) await step(2, async () => {
    const r2 = await call(buildRequest({ model, system: SYS_VERIF, content: contentVerif(photos, P.inv.observations), schema: SCHEMA_VERIF, effort: "medium", maxTokens: 16000 }));
    P.raw.ver = r2;
    P.ver = applyVerdicts(P.inv.observations, r2);
  });
  if (!P.lec) await step(3, async () => {
    const tFacts = timeFacts(spot, photos);
    const fFacts = ficheFacts(spot);
    const uFacts = String(job.notes || "").trim() ? [{ id: "u1", t: String(job.notes).trim(), kind: "dit par toi" }] : [];
    const facts = [...P.ver.kept, ...tFacts, ...fFacts, ...uFacts];
    const r3 = await call(buildRequest({ model, system: SYS_LECTURE, content: contentLecture({ observations: P.ver.kept, tFacts, fFacts, uFacts }), schema: SCHEMA_LECTURE, effort: "medium", maxTokens: 20000 }));
    P.raw.lec = r3;
    P.lec = { ...validateLecture(r3, facts, spot ? terrainOf(spot) : null), tFacts, fFacts, uFacts, facts };
  });
  return assembleAnalysis(job, spot);
}

/** Analyse terminée, telle qu'elle est affichée et gardée dans l'historique (sans les images en pleine taille). */
export function assembleAnalysis(job, spot) {
  const P = job.partial;
  const first = job.photos.find((p) => Number.isFinite(p.when?.ms));
  return {
    id: job.id, at: Date.now(), site: SITE.id, spotId: spot?.id || null, spotName: spot?.name || "Spot hors du guide",
    dateLabel: first ? `photos du ${photoDateLabel(first.when.ms)}` : "date des photos inconnue",
    model: job.model, cost: costOf(job.model, P.usages || []),
    photos: job.photos.map((p) => ({ thumb: p.thumb, view: p.view || null, when: p.when })),
    views: (P.inv.photos || []).reduce((m, v) => { m[v.photo - 1] = v; return m; }, []),
    observations: P.ver.kept, removed: P.ver.removed, nonVisible: P.inv.nonVisible,
    tFacts: P.lec.tFacts, fFacts: P.lec.fFacts, uFacts: P.lec.uFacts, facts: P.lec.facts,
    lecture: P.lec.result, dropped: P.lec.dropped,
  };
}

/** Repères sur une photo : observations (x, y) et postes, placés au centre des observations qui les fondent. */
export function photoMarks(a, photoIndex) {
  const n = photoIndex + 1;
  const obs = a.observations.filter((o) => o.photo === n && o.x != null);
  const byId = new Map(a.observations.map((o) => [o.id, o]));
  const postes = [];
  (a.lecture?.postes || []).forEach((p, i) => {
    const pts = (p.refs || []).map((r) => byId.get(r)).filter((o) => o && o.x != null);
    if (!pts.length) return;
    // La photo qui porte le plus de faits du poste.
    const counts = {}; for (const o of pts) counts[o.photo] = (counts[o.photo] || 0) + 1;
    const best = +Object.entries(counts).sort((x, y) => y[1] - x[1] || x[0] - y[0])[0][0];
    if (best !== n) return;
    const on = pts.filter((o) => o.photo === n);
    postes.push({ id: `P${i + 1}`, nom: p.nom, x: on.reduce((s, o) => s + o.x, 0) / on.length, y: on.reduce((s, o) => s + o.y, 0) / on.length, refs: on.map((o) => o.id) });
  });
  return { obs, postes };
}

// ─────────────────────────────────────────────────────────────────────
// Analyse par l'abonnement Claude : faite dans une page claude.ai, rapportée par fichier.
// Le fichier porte les réponses BRUTES du modèle et les vignettes ; le guide recalcule
// lui-même les faits (marée, lumière, fiche) et repasse les mêmes contrôles que pour
// l'API. Rien d'autre n'est cru sur parole.
// ─────────────────────────────────────────────────────────────────────
// Page « Analyse photo du bar » publiée sur claude.ai (lien ouvert depuis l'onglet Photos).
export const STUDIO_URL = "https://claude.ai/artifact/6zzrJfqMW8cutSY9qoTGDH";
export const STUDIO_KEY = { "logonna-daoulas": "logonna", "pirou-plage": "pirou", plouguerneau: "plouguerneau", audierne: "audierne", carantec: "carantec", concarneau: "concarneau", crozon: "crozon" };
export const IMPORT_FORMAT = "guide-peche-bar/analyse-photo";
export const IMPORT_VERSION = 1;
export const VIA_ABONNEMENT = "abonnement";
const WHEN_SOURCES = ["exif", "exif-paris", "fichier", "saisie", "inconnue"];
const JPEG_URL = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/;

/** Fichier d'analyse produit par la page claude.ai, à importer dans le guide du site. */
export function buildExport(job, { createdAt = Date.now(), engine = "" } = {}) {
  const P = job.partial || {};
  if (!P.raw?.inv || !P.raw?.ver || !P.raw?.lec) throw new Error("Analyse incomplète : rien à exporter.");
  return {
    format: IMPORT_FORMAT, version: IMPORT_VERSION, engine,
    site: SITE.id, siteName: SITE.name, spotId: job.spotId || null, notes: String(job.notes || ""),
    createdAt, via: VIA_ABONNEMENT,
    photos: job.photos.map((p) => ({ thumb: p.thumb, view: p.view || null, when: p.when })),
    raw: P.raw,
  };
}

/** Lit un fichier d'analyse et la reconstruit comme si elle avait été faite dans le guide.
 *  Les faits de la fiche (f…) sont ceux de la fiche d'origine, que la page claude.ai a citée ; `spotsView`
 *  (fiches corrigées sur place) ne sert qu'à ne pas reproposer une correction déjà appliquée. */
export function importAnalysis(text, { spots = allSpots(), spotsView = null, now = Date.now() } = {}) {
  let o;
  try { o = typeof text === "string" ? JSON.parse(text) : text; } catch { throw new Error("Fichier illisible : ce n'est pas une analyse photo du guide."); }
  if (!o || o.format !== IMPORT_FORMAT) throw new Error("Ce fichier n'est pas une analyse photo du guide.");
  if (o.version !== IMPORT_VERSION) throw new Error("Analyse produite par une autre version : mets à jour le guide, puis réessaie.");
  if (o.site !== SITE.id) throw new Error(`Cette analyse concerne le guide ${typeof o.siteName === "string" ? `« ${o.siteName.slice(0, 60)} »` : "d'un autre site"} : importe-la depuis ce guide.`);
  if (!Array.isArray(o.photos) || !o.photos.length || o.photos.length > PHOTO.maxPhotos) throw new Error(`Analyse sans photos ou avec plus de ${PHOTO.maxPhotos} photos.`);
  const photos = o.photos.map((p, i) => {
    if (typeof p?.thumb !== "string" || p.thumb.length > 400000 || !JPEG_URL.test(p.thumb)) throw new Error(`Photo ${i + 1} : vignette absente ou invalide.`);
    const view = typeof p.view === "string" && p.view.length <= 2000000 && JPEG_URL.test(p.view) ? p.view : null;
    const w = p.when || {};
    // v8.9 : une date hors de 1990-2100 (fichier abîmé) est ignorée, jamais une erreur affichée.
    const ms = typeof w.ms === "number" && Number.isFinite(w.ms) && w.ms >= 631152000000 && w.ms <= 4102444800000 ? w.ms : null;
    const when = { ms, source: WHEN_SOURCES.includes(w.source) ? w.source : "inconnue", note: typeof w.note === "string" ? w.note.slice(0, 120) : "" };
    return { thumb: p.thumb, view, when };
  });
  const spot = typeof o.spotId === "string" ? spots.find((s) => s.id === o.spotId) || null : null;
  if (o.spotId && !spot) throw new Error("Le spot de cette analyse n'existe pas dans ce guide.");
  const notes = typeof o.notes === "string" ? o.notes.slice(0, 2000) : "";
  const raw = o.raw || {};
  const inv = cleanObservations(conform(raw.inv, SCHEMA_OBS), photos.length);
  if (!inv.observations.length) throw new Error("Aucune observation exploitable dans cette analyse.");
  const ver = applyVerdicts(inv.observations, conform(raw.ver, SCHEMA_VERIF));
  const tFacts = timeFacts(spot, photos);
  const fFacts = ficheFacts(spot);
  const uFacts = notes.trim() ? [{ id: "u1", t: notes.trim(), kind: "dit par toi" }] : [];
  const facts = [...ver.kept, ...tFacts, ...fFacts, ...uFacts];
  const spotNow = spot ? (spotsView || []).find((s) => s.id === spot.id) || spot : null;
  const lec = { ...validateLecture(conform(raw.lec, SCHEMA_LECTURE), facts, spotNow ? terrainOf(spotNow) : null), tFacts, fFacts, uFacts, facts };
  const at = typeof o.createdAt === "number" && Number.isFinite(o.createdAt) ? o.createdAt : now;
  const job = { id: `i${at}`, model: VIA_ABONNEMENT, photos, partial: { inv, ver, lec, usages: [] } };
  return { ...assembleAnalysis(job, spot), at, via: VIA_ABONNEMENT, importedAt: now };
}
