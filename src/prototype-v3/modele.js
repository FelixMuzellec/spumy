// Prototype V6 — la Favorabilité telle que la calcule le moteur BORD v2 (src/bord/engine/v2.js ; spécification
// docs/SPEC-MOTEUR-BORD-V2.md § 4, validée par Félix le 18 nov. 2026), appliquée aux conditions de démonstration du jour.
//
//   Favorabilité = conditions × présence
//   conditions (0 à 100) = points des critères connus ÷ somme de leurs maximums × 100
//     marée : fenêtre de la fiche 25 (« prime » 25, « bonne » 15) et coefficient 20 (plateau dans la plage utile du spot)
//     lumière 25 (aube ou crépuscule 25, nuit 15, plein jour 5, + 3 si ciel couvert, + jusqu'à 3 si mer formée)
//     vent et mer 30 (tableau par régime du spot, exposition au vent et force)
//   présence (0,3 à 1) = la plus restrictive de la saison et de la température de l'eau
//   pression, rafales sous 60 km/h, clarté de l'eau : 0 point (information seulement)
//
// Le prototype n'importe aucun moteur (règle de couches) : les valeurs sont recopiées ici, une fois, et
// tests/prototype-v3.mjs vérifie qu'elles sont identiques à celles du moteur. Toutes sont des hypothèses de départ
// (niveau 4), éprouvées en phase 8.

/** @typedef {"roche" | "plage" | "abri"} Regime */
/** @typedef {"face" | "travers" | "dos"} Expo */
/** @typedef {"aube" | "crepuscule" | "nuit" | "jour"} Bande */
/** @typedef {import("../core/contracts/index.js").CritereFavorabilite} CritereFavorabilite */
/**
 * Fenêtre de marée de la fiche, posée sur la marée du jour (heures décimales locales).
 * @typedef {{ from: number, to: number, priority: string, label: string }} Fenetre
 */
/**
 * Ce que le calcul lit : la fiche, le créneau et les conditions du jour.
 * @typedef {object} CtxFav
 * @property {{ regime?: string, type?: string, coefBand?: number[], exposedAngles?: number[], shelteredAngles?: number[] }} v2
 * @property {Fenetre} win
 * @property {number} coef
 * @property {string} sky
 * @property {number | null} swell
 * @property {boolean} [rade]
 * @property {number} windDeg
 * @property {number} windBft
 * @property {number} month 1 à 12
 * @property {number} sst °C
 * @property {{ dawn: number, rise: number, set: number, dusk: number }} sun
 */

export const PTS = { fenetre: { prime: 25, bon: 15 }, coef: 20, lumiere: { aube: 25, crepuscule: 25, nuit: 15, jour: 5, couvert: 3, merFormee: 3 }, vent: 30 };

// Vent et mer, sur 30 : régime du spot × exposition × force (Beaufort 0 à 7), copie de VENT_MER (v2.js).
/** @type {Record<Regime, Record<Expo, number[]>>} */
export const VENT_MER = {
  roche: { face: [15, 18, 24, 30, 26, 18, 10, 5], travers: [15, 17, 20, 22, 20, 15, 9, 5], dos: [15, 14, 12, 10, 9, 8, 6, 4] },
  plage: { face: [15, 16, 22, 28, 22, 14, 8, 4], travers: [15, 16, 19, 21, 18, 13, 8, 4], dos: [15, 14, 12, 10, 9, 8, 6, 4] },
  abri: { face: [15, 16, 18, 16, 12, 8, 5, 3], travers: [15, 16, 17, 16, 13, 9, 6, 3], dos: [15, 15, 14, 13, 12, 10, 7, 4] },
};

// Présence : saison (marquages Ifremer, programme Bargip) et température de l'eau, copies de SEASON et thermalPresence (model.js).
/** @type {{ label: string[] } & Record<Regime, number[]>} */
export const SEASON = {
  label: ["départ au frai", "frai au large", "frai au large", "retour", "retour", "présence côtière", "présence côtière",
    "présence côtière", "présence côtière", "présence côtière", "présence côtière", "départ au frai"],
  roche: [0.6, 0.5, 0.55, 0.75, 0.95, 1, 1, 1, 1, 1, 0.95, 0.75],
  plage: [0.6, 0.5, 0.55, 0.75, 0.95, 1, 1, 1, 1, 1, 0.95, 0.75],
  abri: [0.675, 0.575, 0.625, 0.8, 0.975, 1, 1, 1, 1, 1, 0.975, 0.825],
};
/**
 * @param {number} sst
 * @returns {{ factor: number, label: string }}
 */
export function thermal(sst) {
  if (sst < 7.5) return { factor: 0.3, label: "population côtière au plus bas" };
  if (sst < 9.5) return { factor: 0.5, label: "présence résiduelle" };
  if (sst < 11.5) return { factor: 0.75, label: "retour en cours" };
  if (sst < 13.5) return { factor: 0.92, label: "montée en activité" };
  if (sst <= 19) return { factor: 1, label: "présence côtière pleine" };
  if (sst <= 21.5) return { factor: 0.9, label: "eau chaude" };
  return { factor: 0.72, label: "eau très chaude" };
}

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
/** @param {number} x @param {number} [d] */
const fr = (x, d = 2) => String(Math.round(x * 10 ** d) / 10 ** d).replace(".", ",");
/** @param {number} a @param {number} b */
const angDist = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

/** Régime du spot d'après le type de la fiche (regimeOf, model.js). */
/**
 * @param {{ regime?: string, type?: string }} v2
 * @returns {Regime}
 */
export function regimeOf(v2) {
  if (v2.regime === "roche" || v2.regime === "plage" || v2.regime === "abri") return v2.regime;
  const ty = String(v2.type || "").toUpperCase();
  if (/HAVRE|RIA|ESTUAIRE|EMBOUCHURE/.test(ty)) return "abri";
  if (/PLAGE|ESTRAN SABLEUX|POINTE SABLEUSE/.test(ty)) return "plage";
  return "roche";
}
export const REGIME_LABEL = { roche: "spot rocheux", plage: "plage ou banc de sable", abri: "havre ou estuaire abrité" };

/** Exposition au vent (exposureOf, v2.js) : face (vent de mer), dos (vent de terre) ou travers ; 45° de part et d'autre. */
/**
 * @param {{ exposedAngles?: number[], shelteredAngles?: number[] }} v2
 * @param {number} deg direction d'où vient le vent
 * @returns {Expo}
 */
export function exposureOf(v2, deg) {
  const exp = v2.exposedAngles || [], sh = v2.shelteredAngles || [];
  const de = exp.length ? Math.min(...exp.map((a) => angDist(deg, a))) : 180;
  const ds = sh.length ? Math.min(...sh.map((a) => angDist(deg, a))) : 180;
  if (de < 45 && de <= ds) return "face";
  if (ds < 45) return "dos";
  return "travers";
}
export const EXPO_LABEL = { face: "vent de mer", travers: "vent de travers", dos: "vent de terre" };

/** Bande de lumière d'un créneau (windowLight, core.js) : celle qui le recouvre le plus. */
/**
 * @param {number} from
 * @param {number} to
 * @param {{ dawn: number, rise: number, set: number, dusk: number }} sun
 * @returns {Bande}
 */
export function lightBand(from, to, sun) {
  /** @param {number} a @param {number} b */
  const ov = (a, b) => Math.max(0, Math.min(to, b) - Math.max(from, a));
  const agg = { aube: ov(sun.dawn, sun.rise + 0.75), crepuscule: ov(sun.set - 0.75, sun.dusk), nuit: ov(sun.dusk, sun.dawn + 24) + ov(sun.dusk - 24, sun.dawn), jour: ov(sun.rise + 0.75, sun.set - 0.75) };
  return /** @type {Bande} */ (Object.entries(agg).sort((a, b) => b[1] - a[1])[0][0]);
}

/**
 * Favorabilité d'un créneau. ctx : { v2, win {from, to, priority, label}, coef, sky, swell (null : inconnue), rade, windDeg, windBft, month, sst, sun }.
 * Renvoie { fav, cond, got, max, couverture, crit: [{ k, label, pts, max, why }], excluded, pres }.
 */
/** @param {CtxFav} ctx */
export function favorability(ctx) {
  const { v2, win, coef, sky, swell, windDeg, windBft, month, sst, sun } = ctx;
  /** @type {CritereFavorabilite[]} */
  const crit = [];
  /** @type {{ k: string, label: string, why: string }[]} */
  const excluded = [];
  /** @param {string} k @param {string} label @param {number} pts @param {number} max @param {string} why */
  const add = (k, label, pts, max, why) => crit.push({ k, label, pts: Math.round(pts * 10) / 10, max, why });
  add("fenetre", "Marée : fenêtre", win.priority === "prime" ? PTS.fenetre.prime : PTS.fenetre.bon, PTS.fenetre.prime,
    `${win.priority === "prime" ? "fenêtre « prime »" : "« bonne » fenêtre"} de la fiche : « ${win.label} »`);
  const [lo, o1, o2, hi] = v2.coefBand || [30, 45, 75, 105];
  const cp = coef <= lo ? 0 : coef < o1 ? PTS.coef * (coef - lo) / (o1 - lo) : coef <= o2 ? PTS.coef : coef < hi ? PTS.coef * (hi - coef) / (hi - o2) : 0;
  add("coef", "Marée : coefficient", cp, PTS.coef, `coefficient ${coef}, ${coef < o1 ? "sous" : coef <= o2 ? "dans" : "au-dessus de"} la plage utile du spot (${o1} à ${o2})`);
  const band = lightBand(win.from, win.to, sun), L = PTS.lumiere;
  if (band === "jour") {
    const couvert = sky === "couvert" ? L.couvert : 0, h = swell == null ? 0 : swell, mer = Math.round(L.merFormee * Math.min(1, Math.max(0, h)));
    add("lumiere", "Lumière", L.jour + couvert + mer, L.aube, `plein jour${couvert ? ", ciel couvert" : ""}${mer ? `, mer formée (${fr(h, 1)} m)` : ""}`);
  } else add("lumiere", "Lumière", L[band], L.aube, { aube: "aube", crepuscule: "crépuscule", nuit: "nuit" }[band]);
  const regime = regimeOf(v2);
  if (swell == null && !ctx.rade) excluded.push({ k: "vent", label: "Vent et mer", why: "houle non documentée : critère retiré du calcul (et sécurité « à vérifier »)" });
  else {
    const expo = exposureOf(v2, windDeg), f = Math.max(0, Math.min(7, Math.round(windBft)));
    add("vent", "Vent et mer", VENT_MER[regime][expo][f], PTS.vent, f === 0 ? "calme plat" : `${EXPO_LABEL[expo]} force ${f} sur un ${REGIME_LABEL[regime]}`);
  }
  const got = crit.reduce((a, x) => a + x.pts, 0), max = crit.reduce((a, x) => a + x.max, 0);
  const cond = (got / max) * 100;
  const season = { factor: SEASON[regime][month - 1], label: SEASON.label[month - 1], month: MOIS[month - 1] };
  const th = thermal(sst);
  const by = season.factor <= th.factor ? "saison" : "eau";
  const pres = { factor: Math.min(season.factor, th.factor), season, thermal: { ...th, sst }, by, regime };
  return { fav: Math.round(cond * pres.factor), cond: Math.round(cond), got: Math.round(got * 10) / 10, max, couverture: max / 100, crit, excluded, pres, band, win };
}

/** Le meilleur créneau du jour parmi les fenêtres de la fiche (celui qui donne la plus haute Favorabilité ; à égalité, le plus tôt). */
/**
 * @param {Fenetre[]} wins
 * @param {Omit<CtxFav, "win">} ctx
 */
export function bestOf(wins, ctx) {
  return wins.map((win) => favorability({ ...ctx, win })).sort((a, b) => b.fav - a.fav || a.win.from - b.win.from)[0] || null;
}
