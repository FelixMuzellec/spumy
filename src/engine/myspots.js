// v8.11 — Tes spots : ajoutés depuis le téléphone, gardés sur l'appareil (et dans le dépôt GitHub du journal
// si la sauvegarde est activée). Ce module construit, à partir de quelques choix, une fiche complète que le
// moteur traite comme les autres : classement, météo propre au spot, marée, leurres, journal.
// Rien n'y est inventé : ce que tu ne sais pas reste « je ne sais pas », et la marée suit alors la règle
// générale du bar (Vidal), dite comme telle.
import { SITE, SPOTS } from "SITE_CONFIG";
import { DIR_FR, estimateFrom, haversineKm, MY_FONDS, MY_PHASES, MY_PROFS, MY_TYPES, MYSPOT_COLOR, MYSPOTS_MAX, posOf } from "./myspots-core.js";
export * from "./myspots-core.js";

export const MYSPOTS_KEY = "bar:myspots:" + SITE.id;
/** Spot du guide (fiches d'origine) le plus proche : il donne le port de marée et la zone météo. */
export function nearestGuideSpot(lat, lon, spots = SPOTS) {
  let best = null;
  for (const s of spots) { const c = posOf(s); if (!c) continue; const km = haversineKm({ lat, lon }, c); if (!best || km < best.km) best = { spot: s, km }; }
  return best;
}
/** Temps de route estimé depuis le village du guide : vol d'oiseau × 1,4, à 50 km/h (comme les fiches). */
export function estimateMinutes(lat, lon) { return estimateFrom(SITE, lat, lon); }
const fmtMin = (m) => (m < 60 ? `≈ ${m} min` : `≈ ${Math.floor(m / 60)} h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`);
const dm = (v, pos, neg) => { const a = Math.abs(v), d = Math.floor(a), mn = (a - d) * 60; return `${d}°${mn.toFixed(1).replace(".", ",")}'${v >= 0 ? pos : neg}`; };

const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
/** Fiche saisie par l'utilisateur, nettoyée champ par champ ; null si elle est inutilisable. */
export function sanitizeMySpot(r) {
  if (!r || typeof r !== "object" || Array.isArray(r)) return null;
  const id = String(r.id || "");
  if (!/^moi-[a-z0-9]{4,24}$/.test(id)) return null;
  const updatedAt = Number.isFinite(+r.updatedAt) ? +r.updatedAt : 0;
  if (r.deleted === true) return { id, deleted: true, updatedAt };
  const name = clean(r.name, 60);
  const lat = +r.lat, lon = +r.lon;
  if (name.length < 2 || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  // Côté de l'eau : un nombre (ou un texte de chiffres) multiple de 22,5° ; null, "" ou absent sont refusés (+null vaut 0, le nord).
  const wRaw = typeof r.water === "number" ? r.water : typeof r.water === "string" && /^\d+(\.\d+)?$/.test(r.water.trim()) ? +r.water : NaN;
  const water = Number.isFinite(wRaw) && wRaw >= 0 && wRaw < 360 && (wRaw * 2) % 45 === 0 ? wRaw : null;
  if (water == null) return null;
  const pick = (v, dict, dflt) => (Object.prototype.hasOwnProperty.call(dict, v) ? v : dflt);
  const minutes = Number.isFinite(+r.minutes) && +r.minutes >= 1 && +r.minutes <= 300 ? Math.round(+r.minutes) : null;
  const port = Object.prototype.hasOwnProperty.call(SITE.tide?.ports || {}, r.tidePort) ? r.tidePort : null;
  return {
    id, name, lat: +lat.toFixed(6), lon: +lon.toFixed(6), water,
    type: pick(r.type, MY_TYPES, "pointe"), danger: [1, 2, 3].includes(+r.danger) ? +r.danger : 2,
    fond: pick(r.fond, MY_FONDS, "inconnu"), prof: pick(r.prof, MY_PROFS, "inconnu"), phase: pick(r.phase, MY_PHASES, "inconnu"),
    notes: clean(r.notes, 600), tidePort: port, minutes,
    createdAt: Number.isFinite(+r.createdAt) ? +r.createdAt : updatedAt, updatedAt,
  };
}
/** Créneaux : ta phase de marée si tu la connais, sinon la règle générale du bar en Bretagne (Vidal), dite comme telle. */
function windowsFor(id, phase) {
  const w = (n, label, ph, b, a, type, priority, note) => ({ id: `${id}-${n}`, label, phase: ph, offsetBefore: b, offsetAfter: a, tidePhaseType: type, priority, note });
  const toi = "Selon toi.";
  switch (phase) {
    case "montant": return [w(1, "Montant, selon toi (BM → BM+3)", "bm", 0, 3, "montant", "prime", toi), w(2, "Fin du montant (BM+3 → BM+5,5)", "bm", 3, 5.5, "montant", "bon", toi)];
    case "descendant": return [w(1, "Descendant, selon toi (PM → PM+3)", "pm", 0, 3, "descendant", "prime", toi), w(2, "Fin du descendant (PM+3 → PM+5,5)", "pm", 3, 5.5, "descendant", "bon", toi)];
    case "pm": return [w(1, "Pleine mer, selon toi (PM−1,5 → PM+1,5)", "pm", -1.5, 1.5, "variable", "prime", toi), w(2, "Fin du montant (PM−3 → PM−1,5)", "pm", -3, -1.5, "montant", "bon", toi)];
    case "bm": return [w(1, "Basse mer, selon toi (BM−1,5 → BM+1,5)", "bm", -1.5, 1.5, "variable", "prime", toi), w(2, "Début du montant (BM+1,5 → BM+3)", "bm", 1.5, 3, "montant", "bon", toi)];
    default: return [
      w(1, "Montant, règle générale (BM → BM+3)", "bm", 0, 3, "montant", "prime", "Règle générale (Vidal), non propre à ce poste."),
      w(2, "Fin de descendant, règle générale (BM−3 → BM)", "bm", -3, 0, "descendant", "bon", "Règle générale (Vidal), non propre à ce poste."),
    ];
  }
}

/** Fiche complète, au format des fiches du guide, à partir de ta saisie. */
export function buildMySpot(rec, spots = SPOTS) {
  const T = MY_TYPES[rec.type], F = MY_FONDS[rec.fond];
  const near = nearestGuideSpot(rec.lat, rec.lon, spots);
  const tidePort = rec.tidePort || near?.spot.tidePort || SITE.tide.defaultPort;
  const zone = near?.spot.zone || Object.keys(SITE.zones)[0];
  const minutes = rec.minutes || estimateMinutes(rec.lat, rec.lon);
  const w = rec.water, back = (w + 180) % 360, ring = (c) => [c, (c + 22.5) % 360, (c + 337.5) % 360];
  const day = new Date(rec.createdAt || Date.now()).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", year: "numeric" });
  const known = (k) => rec[k] && rec[k] !== "inconnu";
  const houleMax = rec.danger >= 3 ? 1.5 : T.houle;
  const nearTxt = near ? `${near.spot.name}, à ${String(Math.round(near.km * 10) / 10).replace(".", ",")} km` : "";
  return {
    id: rec.id, custom: true, mine: rec, tidePort, zone, isLocal: false, dangerLevel: rec.danger,
    ...(T.regime ? { regime: T.regime } : {}),
    name: rec.name, subtitle: `Ton spot · ajouté le ${day}`,
    distance: fmtMin(minutes), distMin: minutes,
    coords: `${dm(rec.lat, "N", "S")} ${dm(rec.lon, "E", "W")}`, lat: rec.lat, lon: rec.lon,
    type: T.type, color: MYSPOT_COLOR,
    terrain: {
      fond: `${F.fond} (ton choix).${rec.notes ? " " + rec.notes : ""}`,
      encombrement: F.enc, gratter: F.gratter, couches: F.couches,
      ...(known("prof") ? { prof: { cls: rec.prof, fromUser: true, why: "Classe choisie par toi." } } : {}),
      montage: F.gratter === "oui" ? "Souple sur tête plombée ou texan : le fond permet de gratter (ton choix de fond)."
        : F.gratter === "texan" ? "Texan ou souple léger sur la limite roche–sable (ton choix de fond)."
        : "Leurres de nage, sans gratter le fond (fond rocheux ou non renseigné).",
      conseils: [
        "Spot ajouté par toi : le guide n'a pas de source sur ce poste. Ton journal le recalera à partir de 3 sessions.",
        known("phase") ? `Moment de marée : ${MY_PHASES[rec.phase].label.toLowerCase()} (ton expérience).` : "Moment de marée inconnu : règle générale du bar (Vidal), à recaler avec ton journal.",
      ],
      confidence: "local_knowledge",
      source: "Toi (spot ajouté sur le téléphone)",
      faits: [
        ...(rec.notes ? [{ t: rec.notes, s: "Tes notes" }] : []),
        { t: `Position : ${rec.lat.toFixed(5).replace(".", ",")} / ${rec.lon.toFixed(5).replace(".", ",")}.`, s: "Ta saisie" },
        ...(near ? [{ t: `Marée du port de ${SITE.tide.ports[tidePort]?.label || tidePort} et zone météo « ${SITE.zones[zone]?.label || zone} » : celles du spot du guide le plus proche (${nearTxt}).`, s: "Calcul du guide" }] : []),
      ],
    },
    coefBand: [30, 50, 80, 100],
    houleMax,
    exposedAngles: ring(w), shelteredAngles: ring(back),
    weatherNote: `L'eau est vers le ${DIR_FR[w]} (ton choix) : vent et houle de ce côté de face, vent du ${DIR_FR[back]} dans le dos.`,
    sources: [`Toi — spot ajouté le ${day}`],
    topology: {
      fond: { text: `${F.fond} (ton choix).`, confidence: rec.fond === "inconnu" ? "inference" : "local_knowledge" },
      structure: { text: `${T.label} (ton choix).`, confidence: "local_knowledge" },
      exposition: { text: `Eau vers le ${DIR_FR[w]} (ton choix).`, confidence: "local_knowledge" },
      courant: { text: "Pas de source.", confidence: "inference" },
      bars: { text: "Poste de ton expérience.", confidence: "local_knowledge" },
    },
    tidalRules: {
      typeHeure: known("phase") ? MY_PHASES[rec.phase].label.toUpperCase() : "RÈGLE GÉNÉRALE (À RECALER)",
      montantOuDescendant: known("phase") ? `Selon toi : ${MY_PHASES[rec.phase].label.toLowerCase()}.` : "Aucune source : règle générale du bar en Bretagne (Vidal), les 3 premières heures de montante et les 3 dernières de descendante.",
      description: "Spot ajouté par toi.",
      windows: windowsFor(rec.id, rec.phase),
      lifeHack: "Note tes sessions ici : le journal recale ce spot à partir de 3 sessions.",
    },
    lures: [],
    access: rec.notes ? "Voir tes notes." : "Accès non renseigné.",
    securite: [],
  };
}

// ── Registre : les fiches du guide + tes spots, vus par tout le moteur ──
let extra = [];
const memo = { src: null, ex: null, all: SPOTS };
/** Tous les spots du guide, les tiens compris (même tableau tant que rien ne change). */
export function allSpots() {
  if (memo.src !== SPOTS || memo.ex !== extra) { memo.src = SPOTS; memo.ex = extra; memo.all = extra.length ? [...SPOTS, ...extra] : SPOTS; }
  return memo.all;
}
export const isMine = (spot) => !!spot?.custom;
/** Applique tes fiches (actives) au moteur ; renvoie les fiches construites. */
export function applyMyRecords(records) {
  extra = (records || []).filter((r) => r && !r.deleted).slice(0, MYSPOTS_MAX).map((r) => buildMySpot(r));
  return extra;
}
export function loadMyRecords() {
  try {
    const v = JSON.parse(localStorage.getItem(MYSPOTS_KEY) || "[]");
    return Array.isArray(v) ? v.map(sanitizeMySpot).filter(Boolean) : [];
  } catch { return []; }
}
export function saveMyRecords(records) {
  try { localStorage.setItem(MYSPOTS_KEY, JSON.stringify(records)); return true; } catch { return false; }
}
/** Fusion des deux copies (téléphone, GitHub) : par identifiant, la plus récente gagne ; une suppression reste une suppression. */
export function mergeMyRecords(remote, local) {
  const by = new Map();
  for (const r of [...(remote || []), ...(local || [])].map(sanitizeMySpot).filter(Boolean)) {
    const cur = by.get(r.id);
    if (!cur || r.updatedAt > cur.updatedAt || (r.updatedAt === cur.updatedAt && r.deleted && !cur.deleted)) by.set(r.id, r);
  }
  return [...by.values()].sort((a, b) => a.id.localeCompare(b.id));
}
