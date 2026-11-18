// MOTEUR BORD v2 (phase 7) — trois scores sur 100, jamais fusionnés : favorabilité, pertinence, confiance.
//
// Spécification : docs/SPEC-MOTEUR-BORD-V2.md, validée par Félix le 18 nov. 2026. Chaque point, palier et seuil
// ci-dessous est une HYPOTHÈSE de départ (niveau 4 de l'échelle de preuve, sauf mention), à éprouver en phase 8
// (Monte Carlo, journal). Les valeurs vivent ici, une seule fois.
//
// Le circuit :
//   1. sécurité (safety.js, windowSafety), commune aux deux moteurs : non recommandé → retiré ; à vérifier → classé
//      après les spots sans doute, jamais au vert ;
//   2. favorabilité = conditions × présence : marée (fenêtre 25, coefficient 20), lumière 25, vent et mer 30 ;
//      présence 0,3 à 1, la plus restrictive de la saison et de la température de l'eau ;
//   3. pertinence = ta boîte (couverture technique 50, poids et lancer 25) et la distance (25) ;
//   4. confiance = données (40), accord des modèles (20), preuves (25), journal (15) : affichée, ne change pas le rang.
// Un critère dont la donnée manque sort du calcul (jamais « neutre ») : la note dit sur quelle part elle est calculée.
//
// Ce module s'ajoute au moteur v1 (model.js) sans le modifier : rankDay() calcule les deux sur la même journée,
// classe selon le moteur choisi (réglage, v2 par défaut) et garde l'autre à côté (s.v1, s.v2) pour la comparaison.
import { SITE } from "SITE_CONFIG";
import { angDist, toAngle } from "../../core/core.js";
import { engineMode } from "../../core/scale.js";
import { calibrate, catchStats } from "./journal.js";
import { lureAdvice } from "./lures.js";
import { makeTideFor, rankCompare as rankCompareV1, regimeOf, scoreDay, seasonPresence, thermalPresence } from "./model.js";
import { CANNE } from "./tackle.js";
import { bandOf, BOX_COMPLETE_KEY, loadV2Prefs, saveV2Pref, TRAJET_KEY, V2 } from "./v2-params.js";
export { bandOf, BOX_COMPLETE_KEY, loadV2Prefs, saveV2Pref, TRAJET_KEY, V2 };
import { beaufortOf } from "./weather.js";
import NIVEAUX from "../../../data/knowledge/preuves-niveaux.json";

// Valeurs de départ (spécification v2, sections 4 à 8) : v2-params.js (sans fiche de guide : l'accueil les lit aussi).

// C4 — Vent et mer, sur 30, par régime du spot, exposition au vent et force (0 à 7). Au-delà de la force 5, c'est la
// sécurité qui décide (à vérifier dès 6, non recommandé dès 8) ; les colonnes 6 et 7 restent faibles.
// Principe (niveau 2, peche.com) : un vent de mer modéré lève du clapot et met le bar en chasse sur un spot exposé ;
// vent de terre, mer plate et eau claire : poisson méfiant de jour. Valeurs : hypothèses (niveau 4), reprises de la
// courbe de la v1 (ONSHORE, core.js) à l'échelle de 30 points.
export const VENT_MER = {
  //               F0  F1  F2  F3  F4  F5  F6  F7
  roche: { face:    [15, 18, 24, 30, 26, 18, 10, 5],
           travers: [15, 17, 20, 22, 20, 15, 9, 5],
           dos:     [15, 14, 12, 10, 9, 8, 6, 4] },
  plage: { face:    [15, 16, 22, 28, 22, 14, 8, 4],
           travers: [15, 16, 19, 21, 18, 13, 8, 4],
           dos:     [15, 14, 12, 10, 9, 8, 6, 4] },
  abri:  { face:    [15, 16, 18, 16, 12, 8, 5, 3],
           travers: [15, 16, 17, 16, 13, 9, 6, 3],
           dos:     [15, 15, 14, 13, 12, 10, 7, 4] },
};
const EXPO_LABEL = { face: "vent de mer", travers: "vent de travers", dos: "vent de terre" };

// Niveau de preuve des critères (data/knowledge/bar-bord.json ; contrôlé par tests/v2.mjs).
export const CRIT_NIVEAU = { fenetre: 2, coef: 4, lumiere: 2, vent: 2, presence: 4 };
export const NIVEAU_FACTEUR = { 1: 1, 2: 0.8, 3: 0.6, 4: 0.4, 5: 0.2 };
export const NIVEAU_LABEL = { 1: "scientifique ou institutionnel", 2: "observation documentée", 3: "retour local identifiable", 4: "hypothèse", 5: "heuristique" };
// Rubriques de la fiche que la confiance regarde (spécification v2, §6).
const RUBRIQUES_CONF = ["exposition", "courant", "bars"];

const r1 = (x) => Math.round(x * 10) / 10;
const frn = (x) => String(r1(x)).replace(".", ",");
const isRade = (spot) => SITE.zones?.[spot?.zone]?.sea === "rade";

/** Niveaux de preuve des rubriques d'un spot ({ exposition: 2, … }) ; un spot que tu as ajouté : estimé (5). */
export function evidenceOf(spot) {
  if (!spot) return {};
  if (spot.custom) return { exposition: 5, courant: 5, bars: 5, fond: 5, structure: 5, terrain: 5 };
  return NIVEAUX[`${SITE.id}/${spot.id}`] || {};
}

/** Exposition du spot à un vent : « face » (vent de mer), « dos » (vent de terre), « travers », ou null (direction inconnue). */
export function exposureOf(spot, dir) {
  const ang = toAngle(dir);
  if (ang < 0) return null;
  const exp = spot?.exposedAngles || [], sh = spot?.shelteredAngles || [];
  const de = exp.length ? Math.min(...exp.map((a) => angDist(ang, a))) : 180;
  const ds = sh.length ? Math.min(...sh.map((a) => angDist(ang, a))) : 180;
  if (de < 45 && de <= ds) return "face";
  if (ds < 45) return "dos";
  return "travers";
}


// ═══════════════════════════════════════════════════════════════════
// Favorabilité d'un créneau
// ═══════════════════════════════════════════════════════════════════
/** Présence du bar (0,3 à 1) : la plus restrictive de la saison et de la température de l'eau. */
export function presenceV2(spot, { month, sst, sstConf }) {
  const regime = regimeOf(spot);
  const s0 = seasonPresence(month, regime);
  const season = V2.mc.kSeason === 1 ? s0 : { ...s0, factor: Math.max(0.3, Math.min(1, 1 - (1 - s0.factor) * V2.mc.kSeason)) };
  // Température : seulement une valeur mesurée ou prévue par un modèle. Une moyenne de saison n'ajoute rien à la
  // saison elle-même : elle n'est pas comptée deux fois, et la confiance baisse.
  const known = sst != null && Number.isFinite(+sst) && (sstConf === "mesure" || sstConf === "modele");
  let thermal = null;
  if (known) {
    const t = thermalPresence(+sst);
    let f = t.factor, why = t.label;
    // Abri l'hiver (spécification v2, §4) : des bars restent en rade, ria ou havre sous 7 °C (suivis jusqu'à 6,5 °C,
    // hivernage à 6,9 °C). Plancher porté à 0,5 sous 7,5 °C, et 0,6 de 7,5 à 9,5 °C, pour que l'abri garde une
    // présence plus haute que la côte ouverte au cœur de l'hiver (scénario S12). Hypothèse à éprouver.
    if (regime === "abri" && +sst < 9.5) { f = Math.max(f, +sst < 7.5 ? 0.5 : 0.6); why = `${t.label} (abri : des bars y restent l'hiver)`; }
    if (V2.mc.kThermal !== 1) f = Math.max(0.3, Math.min(1, 1 - (1 - f) * V2.mc.kThermal));
    thermal = { factor: f, label: why, sst: +sst };
  }
  const factor = thermal ? Math.min(season.factor, thermal.factor) : season.factor;
  const by = !thermal || season.factor <= thermal.factor ? "saison" : "eau";
  return { factor: r1(factor * 100) / 100, season, thermal, by, regime, sstKnown: known,
           label: by === "saison" ? `saison : ${season.label}` : `eau à ${frn(thermal.sst)} °C : ${thermal.label.toLowerCase()}` };
}

/**
 * Favorabilité d'un créneau (0 à 100) = conditions × présence.
 * win : créneau (priority, coeff, light) ; zw : météo du créneau ; ctx : { coeff, month, sst, sstConf }.
 * Renvoie { fav, cond, pres, crit: [{ k, label, pts, max, why, niveau }], excluded: [{ k, label, why }], couverture, noScore, line }.
 */
export function favorability(spot, win, zw, ctx = {}) {
  const crit = [], excluded = [];
  const add = (k, label, pts, max, why) => crit.push({ k, label, pts: r1(pts), max, why, niveau: CRIT_NIVEAU[k] });
  const out = (k, label, why) => excluded.push({ k, label, why });
  // C1 — fenêtre de marée de la fiche
  add("fenetre", "Marée : fenêtre", win?.priority === "prime" ? V2.maree.prime : V2.maree.bon, V2.maree.prime,
      win?.priority === "prime" ? "fenêtre « prime » de la fiche" : "« bonne » fenêtre de la fiche");
  // C2 — coefficient dans la plage utile du spot
  const c = win?.coeff ?? ctx.coeff;
  if (!Number.isFinite(c)) out("coef", "Marée : coefficient", "coefficient inconnu");
  else {
    const sh = V2.mc.coefShift;
    const [lo, o1, o2, hi] = (spot.coefBand || [30, spot.coefMin ?? 45, spot.coefIdeal ?? 75, spot.coefMax ?? 105]).map((x) => x + sh);
    const M = V2.maree.coef;
    const pts = c <= lo ? 0 : c < o1 ? M * (c - lo) / Math.max(o1 - lo, 1) : c <= o2 ? M : c < hi ? M * (hi - c) / Math.max(hi - o2, 1) : 0;
    add("coef", "Marée : coefficient", pts, M, c < o1 ? `coef ${c}, sous la plage utile (${o1} à ${o2})` : c <= o2 ? `coef ${c}, dans la plage utile (${o1} à ${o2})` : `coef ${c}, au-dessus de la plage utile (${o1} à ${o2})`);
  }
  // C3 — lumière
  const band = win?.light?.band;
  const L = V2.lumiere;
  const fr = win?.light?.frac;
  if (!band || band === "inconnu") out("lumiere", "Lumière", "heure de lever ou de coucher inconnue");
  else if (V2.lumiereProrata && band === "jour" && fr && fr.jour < 0.95) {
    // Phase 8 : créneau de plein jour qui mord sur l'aube, le crépuscule ou la nuit. Au lieu de sauter d'un coup de
    // 5 à 25 points quand la basse lumière passe la moitié du créneau, la note monte en rampe : de la note de jour
    // (0 % de basse lumière) à celle de la basse lumière dominante (50 % et plus). Les créneaux majoritairement à
    // l'aube, au crépuscule ou de nuit gardent leur note entière, comme dans la spécification.
    const couvert = zw?.sky === "overcast" ? L.couvert : 0;
    const h = zw && zw.houleKnown !== false && Number.isFinite(zw.houle) ? zw.houle : 0;
    const jour = L.jour + couvert + Math.round(L.merFormee * Math.min(1, Math.max(0, h)));
    const low = fr.aube + fr.crepuscule + fr.nuit;
    const dom = [["aube", fr.aube], ["crepuscule", fr.crepuscule], ["nuit", fr.nuit]].sort((x, y) => y[1] - x[1])[0][0];
    const lowVal = Math.max(jour, L[dom]);
    const pts = Math.round((jour + (lowVal - jour) * Math.min(1, low / 0.5)) * 10) / 10;
    const nom = { aube: "aube", crepuscule: "crépuscule", nuit: "nuit" }[dom];
    add("lumiere", "Lumière", pts, L.aube, `plein jour, ${Math.round(low * 100)} % du créneau en ${nom} ou basse lumière`);
  }
  else if (band === "aube" || band === "crepuscule") add("lumiere", "Lumière", L[band], L.aube, band === "aube" ? "aube" : "crépuscule");
  else if (band === "nuit") add("lumiere", "Lumière", L.nuit, L.aube, "nuit");
  else {
    const couvert = zw?.sky === "overcast" ? L.couvert : 0;
    const h = zw && zw.houleKnown !== false && Number.isFinite(zw.houle) ? zw.houle : 0;
    const mer = Math.round(L.merFormee * Math.min(1, Math.max(0, h)));
    add("lumiere", "Lumière", L.jour + couvert + mer, L.aube,
        `plein jour${couvert ? ", ciel couvert" : ""}${mer ? `, mer formée (${frn(h)} m)` : ""}`);
  }
  // C4 — vent et mer
  const regime = regimeOf(spot);
  if (!zw || zw.windKnown === false) out("vent", "Vent et mer", "vent inconnu");
  else if (zw.houleKnown === false && !isRade(spot)) out("vent", "Vent et mer", "houle inconnue");
  else {
    const f = Math.max(0, Math.round(zw.wind_force || 0));
    const expo = exposureOf(spot, zw.wind_dir) || (f <= 1 ? "travers" : null);
    if (!expo) out("vent", "Vent et mer", "direction du vent inconnue");
    else {
      const tab = (VENT_MER[regime] || VENT_MER.roche)[expo];
      const t0 = tab[0], amp = V2.mc.ventAmp, k = V2.vent / 30;   // tableau écrit sur 30 points
      const v = Math.max(0, Math.min(30, t0 + (tab[Math.min(f, tab.length - 1)] - t0) * amp)) * k;
      add("vent", "Vent et mer", v, V2.vent, f === 0 ? "calme plat" : `${EXPO_LABEL[expo]} force ${f}`);
    }
  }
  const got = crit.reduce((a, x) => a + x.pts, 0), max = crit.reduce((a, x) => a + x.max, 0);
  const couverture = max / 100;
  const cond = max > 0 ? (got / max) * 100 : null;
  const pres = presenceV2(spot, ctx);
  const noScore = cond == null || couverture < V2.minCouverture;
  const fav = noScore ? null : Math.round(cond * pres.factor);
  return { fav, cond: cond == null ? null : Math.round(cond), pres, crit, excluded, couverture, noScore, line: favLine({ fav, cond, pres, crit, couverture, noScore }) };
}

/** « Favorabilité 72 = conditions 80 (marée 38/45, lumière 25/25, vent et mer 17/30) × présence 0,9 ». */
export function favLine({ fav, cond, pres, crit, couverture, noScore }) {
  if (noScore) return "Pas de note : trop peu de critères connus pour ce créneau.";
  const m = crit.filter((x) => x.k === "fenetre" || x.k === "coef");
  const parts = [];
  if (m.length) parts.push(`marée ${Math.round(m.reduce((a, x) => a + x.pts, 0))}/${m.reduce((a, x) => a + x.max, 0)}`);
  for (const x of crit) if (x.k === "lumiere" || x.k === "vent") parts.push(`${x.k === "vent" ? "vent et mer" : "lumière"} ${Math.round(x.pts)}/${x.max}`);
  const p = String(pres.factor).replace(".", ",");
  return `Favorabilité ${fav} = conditions ${Math.round(cond)} (${parts.join(", ")}) × présence ${p}${couverture < 0.999 ? ` · calculée sur ${Math.round(couverture * 100)} % des critères` : ""}`;
}

// ═══════════════════════════════════════════════════════════════════
// Pertinence : ta boîte et la distance
// ═══════════════════════════════════════════════════════════════════
const SOFT = new Set(["shad", "weightless"]);
/** Une option de la boîte se pêche-t-elle vraiment ici, à ce créneau ? (poids dans la fourchette, tenue dans le courant) */
function practicable(o, adv) {
  const tgt = adv.target, sit = adv.sit, g = o.weight?.g;
  const strong = sit.currentNow && sit.current?.level === "fort";
  const rough = sit.currentNow || sit.sea === "agitée";
  if (o.rig === "sans plomb") return !rough;
  if (SOFT.has(o.fam) || o.weight?.head) {
    if (!Number.isFinite(g) || g <= 0) return !rough;
    if (g < tgt.lo || g > Math.min(tgt.hi, CANNE.max)) return false;
    return !strong || g >= 0.8 * tgt.start;
  }
  return !Number.isFinite(g) || g <= CANNE.max;
}
/** Le poids nécessaire tient-il dans ta boîte et dans la plage de ta canne ? 25, 12 (fourchette seulement) ou 0. */
function weightFit(o, adv) {
  const tgt = adv.target, g = o.weight?.g;
  if (!Number.isFinite(g)) return 0;
  if (SOFT.has(o.fam) || o.weight?.head) {
    if (g > CANNE.max) return 0;
    if (Math.abs(g - tgt.start) <= Math.max(3, 0.25 * tgt.start)) return V2.pert.poids;
    return g >= tgt.lo && g <= tgt.hi ? V2.pert.poidsProche : 0;
  }
  if (g > CANNE.max) return 0;
  return g >= CANNE.min ? V2.pert.poids : V2.pert.poidsProche;
}

/**
 * Pertinence d'un spot pour un créneau (0 à 100) : P1 couverture technique (50), P2 poids et lancer (25), P3 distance (25).
 * opts : { boxOv, journal, box, trajetMax } ; adv : conseil de leurres déjà calculé (sinon calculé ici).
 * Renvoie { score, parts, manque: [texte], top: [3 meilleurs leurres de la boîte], adv }.
 */
export function pertinence(spot, w, live, dateISO, { boxOv, journal, box, trajetMax = V2.trajetMax, adv = null } = {}) {
  const a = adv || lureAdvice(spot, w, live, dateISO, { boxOv, journal, box });
  const P = V2.pert, parts = [], manque = [];
  const bestFams = new Set(a.tiedTop.map((f) => f.k));
  const opts = a.boxRanked || [];
  const ok = opts.filter((o) => practicable(o, a));
  const okBest = ok.filter((o) => bestFams.has(o.fam));
  const okOther = ok.filter((o) => !bestFams.has(o.fam) && o.famScore > 0);
  const famName = a.best.court.toLowerCase();
  const p1 = okBest.length ? P.couverture : okOther.length ? P.remplacant : P.aucun;
  parts.push({ k: "couverture", label: "Ta boîte : la bonne technique", pts: p1, max: P.couverture,
               why: okBest.length ? `${okBest[0].name} : ${famName}, le premier choix ici` : okOther.length ? `seulement un remplaçant (${okOther[0].name}) : le premier choix ici est un ${famName}` : "rien dans ta boîte ne se pêche bien ici à ce créneau" });
  const cand = okBest.length ? okBest : okOther.length ? okOther : opts.filter((o) => bestFams.has(o.fam));
  const p2 = cand.reduce((m, o) => Math.max(m, weightFit(o, a)), 0);
  const tgt = a.target;
  parts.push({ k: "poids", label: "Ta boîte : poids et lancer", pts: p2, max: P.poids,
               why: p2 === P.poids ? `${tgt.start} g visés, dans ta boîte et dans la plage de ta canne (${CANNE.min} à ${CANNE.max} g)`
                 : p2 ? `${tgt.start} g visés : ta boîte n'a que la fourchette (${tgt.lo} à ${tgt.hi} g)` : `${tgt.start} g visés : rien d'adapté dans ta boîte` });
  const strong = a.sit.currentNow && a.sit.current?.level === "fort";
  if (!okBest.length) manque.push(strong && opts.some((o) => bestFams.has(o.fam))
    ? `il te manque une tête d'au moins ${Math.round(tgt.start)} g pour ce courant`
    : `il te manque un ${famName} praticable ici (${a.best.label.toLowerCase()})`);
  else if (p2 < P.poids) manque.push(`il te manque ${SOFT.has(a.best.k) ? "une tête" : "un leurre"} d'environ ${Math.round(tgt.start)} g`);
  // P3 — distance (temps de trajet estimé de la fiche)
  const d = spot.distMin, T = Math.max(5, trajetMax);
  let p3 = null;
  if (Number.isFinite(d)) {
    p3 = d <= T ? P.distance : d >= 2 * T ? 0 : P.distance * (2 * T - d) / T;
    parts.push({ k: "distance", label: "Distance", pts: r1(p3), max: P.distance,
                 why: d <= T ? `${d} min de trajet, dans ton maximum (${T} min)` : `${d} min de trajet, au-delà de ton maximum (${T} min)` });
  }
  const got = parts.reduce((s, x) => s + x.pts, 0), max = parts.reduce((s, x) => s + x.max, 0);
  const score = Math.round((got / max) * 100);
  const seen = new Set();
  const top = ok.filter((o) => (seen.has(o.boxId) ? false : (seen.add(o.boxId), true))).slice(0, 3)
    .map((o) => {
      const fam = a.fams.find((f) => f.k === o.fam), fw = fam?.why?.find((x) => x.v > 0);
      const why = o.why?.[0] || fw || null;
      return { name: o.name, weight: o.weight?.text || "", color: o.color?.named ? o.color.name : "", fam: o.fam, famLabel: fam?.court || o.fam,
               why: why?.t || "", src: why?.s || null, warn: o.warn || [] };
    });
  return { score, parts, manque, top, adv: a, seuil: P.seuil, under: score < P.seuil };
}

// ═══════════════════════════════════════════════════════════════════
// Confiance
// ═══════════════════════════════════════════════════════════════════
/**
 * Confiance (0 à 100) dans la favorabilité d'un créneau. Ne change jamais le rang.
 * f : résultat de favorability ; opts : { live, dayOffset, now, sessions }.
 */
export function confidenceV2(spot, w, f, { live = null, dayOffset = 0, now = Date.now(), sessions = 0 } = {}) {
  const K = V2.conf, parts = [];
  // Données (40) : âge de la prévision, échéance, part des critères calculés.
  let age = 0, ageWhy = "pas de météo";
  if (live) {
    if (Number.isFinite(live._wxAt)) {
      const h = Math.max(0, (now - live._wxAt) / 36e5);
      age = h < 6 ? K.age : h < 24 ? K.age / 2 : 0;
      ageWhy = `prévision téléchargée il y a ${h < 1 ? "moins d'une heure" : `${Math.round(h)} h`}`;
    } else { age = K.age / 2; ageWhy = "âge de la prévision inconnu"; }
  }
  const ech = !live ? 0 : dayOffset <= 0 ? K.echeance : dayOffset >= 3 ? K.echeance / 2 : K.echeance * (1 - dayOffset / 6);
  const cov = K.couverture * (f?.couverture ?? 0);
  parts.push({ k: "donnees", label: "Données", pts: r1(age + ech + cov), max: K.age + K.echeance + K.couverture,
               why: `${ageWhy} ; ${dayOffset <= 0 ? "aujourd'hui" : `J+${dayOffset}`} ; ${Math.round((f?.couverture ?? 0) * 100)} % des critères calculés` });
  // Accord entre modèles (20) : AROME et ECMWF sur la force et la direction du vent.
  const zw = w?.zw || spot?.zw || null;
  let mod = 0, modWhy = "un seul modèle de vent : accord inconnu";
  if (zw?.alt && Number.isFinite(zw.alt.kmh) && zw.windKnown !== false) {
    const dF = Math.abs((beaufortOf(zw.alt.kmh) ?? 0) - (zw.wind_force ?? 0));
    const a1 = toAngle(zw.wind_dir), a2 = toAngle(zw.alt.dir);
    const dD = a1 >= 0 && a2 >= 0 ? Math.round(angDist(a1, a2) / 22.5) : null;
    const fF = dF === 0 ? 1 : dF === 1 ? 0.5 : 0;
    const fD = (zw.wind_force ?? 0) <= 1 ? 1 : dD == null ? 0 : dD <= 1 ? 1 : dD === 2 ? 0.5 : 0;
    mod = K.modeles * (fF + fD) / 2;
    modWhy = `AROME et ECMWF : ${dF} Beaufort d'écart${dD != null ? `, ${dD} secteur${dD > 1 ? "s" : ""} de direction` : ""}`;
  }
  parts.push({ k: "modeles", label: "Accord des modèles", pts: r1(mod), max: K.modeles, why: modWhy });
  // Preuves (25) : niveau de preuve des rubriques du spot et des critères calculés.
  const ev = evidenceOf(spot);
  const lv = [...RUBRIQUES_CONF.map((k) => ev[k]).filter(Number.isFinite), ...(f?.crit || []).map((c) => c.niveau).filter(Number.isFinite)];
  const fac = lv.length ? lv.reduce((a, n) => a + (NIVEAU_FACTEUR[n] ?? 0.2), 0) / lv.length : NIVEAU_FACTEUR[5];
  parts.push({ k: "preuves", label: "Preuves", pts: r1(K.preuves * fac), max: K.preuves,
               why: spot?.custom ? "spot que tu as ajouté : exposition, fond et créneaux estimés" : `exposition ${ev.exposition ?? "?"}, courant ${ev.courant ?? "?"}, bars ${ev.bars ?? "?"} sur l'échelle de 1 à 5` });
  // Journal (15) : tes sessions sur ce spot.
  const n = Math.max(0, sessions | 0);
  parts.push({ k: "journal", label: "Ton journal", pts: r1(K.journal * Math.min(1, n / 10)), max: K.journal,
               why: n ? `${n} session${n > 1 ? "s" : ""} sur ce spot` : "aucune session notée ici" });
  const score = Math.round(parts.reduce((a, x) => a + x.pts, 0));
  const level = score >= K.haute ? "haute" : score >= K.moyenne ? "moyenne" : "faible";
  return { score, level, label: { haute: "Haute", moyenne: "Moyenne", faible: "Faible" }[level], parts };
}

/** Apprentissage personnel : « ton journal sur ce spot : +6 », à partir de 5 sessions dont 2 avec prise ; ±10. */
export function journalAdjust(spotId, calib, stats) {
  const st = stats?.[spotId], d = calib?.detail?.[spotId];
  const n = st?.sessions || 0, withFish = st?.withFish || 0;
  if (n < V2.journal.sessions || withFish < V2.journal.prises || d?.bias == null) return { active: false, n, withFish, pts: 0 };
  // Rapport observé / prédit du journal (calibrate, borné à ±18 %) ramené à ±10 points.
  const pts = Math.max(-V2.journal.max, Math.min(V2.journal.max, Math.round((d.bias - 1) / 0.18 * V2.journal.max)));
  return { active: true, n, withFish, pts };
}

// ═══════════════════════════════════════════════════════════════════
// Une journée : les deux moteurs, le classement du moteur choisi
// ═══════════════════════════════════════════════════════════════════
const okWin = (w) => w.eligible && !w.outOfHours && !w.past && !w.tooLate;

/** Favorabilité de chaque créneau d'un spot noté par la v1 (même sécurité) ; meilleur créneau v2. */
export function spotV2(s, ctx) {
  const wins = (s.windows || []).map((w) => {
    if (!w.eligible) return { id: w.id, eligible: false, reason: w.reason };
    const f = favorability(s, w, w.zw || s.zw, ctx);
    return { id: w.id, eligible: true, verify: w.verify || [], f };
  });
  const byId = new Map(wins.map((x) => [x.id, x]));
  const ok = (s.windows || []).filter(okWin).map((w) => ({ w, x: byId.get(w.id) }));
  if (!ok.length) return { eligible: false, windows: wins, bestWindowId: null };
  const sure = ok.filter((o) => !o.x.verify.length);
  const pool = sure.length ? sure : ok;
  const val = (o) => (o.x.f.noScore ? -1 : o.x.f.fav);
  const best = pool.reduce((a, b) => (val(b) > val(a) ? b : a));
  return { eligible: true, windows: wins, bestWindowId: best.w.id, best: best.x, verify: best.x.verify };
}

/** Classement v2 : sans doute avant à vérifier ; pertinents avant les autres (si ta boîte est complète) ; favorabilité ; distance. */
export function rankCompareV2(a, b) {
  const ea = !!a.v2?.eligible, eb = !!b.v2?.eligible;
  if (ea !== eb) return ea ? -1 : 1;
  if (!ea) return String(a.id).localeCompare(String(b.id));
  const dv = (a.v2.verify?.length ? 1 : 0) - (b.v2.verify?.length ? 1 : 0);
  if (dv) return dv;
  const pu = (x) => (x.v2.pert?.filters && x.v2.pert.under ? 1 : 0);
  const dp = pu(a) - pu(b);
  if (dp) return dp;
  const fa = a.v2.fav ?? -1, fb = b.v2.fav ?? -1;
  if (fa !== fb) return fb - fa;
  const dm = (a.distMin ?? 999) - (b.distMin ?? 999);
  if (dm) return dm;
  return String(a.id).localeCompare(String(b.id));
}

/** Raison courte du meilleur créneau v2 (sous la note) : doutes, puis atouts et freins. */
function reasonV2(best) {
  const f = best.f, out = [];
  if (best.verify?.length) out.push(`⚠ À vérifier : ${best.verify.map((v) => v.t).join(", ")}`);
  if (f.noScore) { out.push("pas assez de données pour noter"); return out.join(" · "); }
  for (const c of f.crit) if (c.pts >= 0.8 * c.max) out.push(`✅ ${c.why}`);
  for (const c of f.crit) if (c.pts <= 0.4 * c.max) out.push(`▼ ${c.why}`);
  if (f.pres.factor < 0.85) out.push(`🗓 ${f.pres.label}`);
  for (const e of f.excluded) out.push(`? ${e.why}`);
  return out.join(" · ");
}

/** Projection pour l'écran : les champs lus par l'interface (score, windows[].score, verify…) prennent les valeurs v2. */
function project(s) {
  const v = s.v2;
  const v1 = { score: s.score, rawScore: s.rawScore, robust: s.robust, verify: s.verify, reason: s.reason, bestWindowId: s.bestWindowId,
               eligible: s.eligible, bestParts: s.bestParts, worst: s.worst, best: s.best, spread: s.spread, stability: s.stability };
  if (!v.eligible) return { ...s, v1, engine: "v2" };
  const byId = new Map(v.windows.map((x) => [x.id, x]));
  const windows = (s.windows || []).map((w) => {
    const x = byId.get(w.id);
    if (!x?.eligible) return { ...w, v1score: w.score };
    return { ...w, v1score: w.score, score: x.f.fav, rawScore: x.f.fav, f: x.f, verify: x.verify };
  });
  const bw = windows.find((w) => w.id === v.bestWindowId);
  return {
    ...s, v1, engine: "v2", windows, bestWindowId: v.bestWindowId, verify: v.verify || [],
    score: v.fav, rawScore: v.fav ?? -1, robust: v.fav ?? -1, pointScore: v.fav,
    reason: reasonV2(v.best), wxReason: reasonV2(v.best),
    bestParts: v.best.f.crit.map((c) => ({ k: c.label, v: c.pts, max: c.max, why: c.why })),
    bestLabel: bw?.label, bestFmt: bw ? `${bw.startFmt} → ${bw.endFmt}` : s.bestFmt,
  };
}

/**
 * Classement complet d'une journée (remplace scoreDay pour l'interface et l'accueil).
 * Options de scoreDay, plus : engine ("v1" | "v2", réglage de l'appareil par défaut), boxOv, journal (sessions),
 * box (une autre boîte), boxComplete (la boîte est-elle l'inventaire complet ? sinon la pertinence ne filtre pas),
 * trajetMax (minutes), dayOffset (écart au jour même), clock (heure de l'appareil, ms : âge de la prévision).
 */
export function rankDay(dateISO, live, opts = {}) {
  const engine = opts.engine || engineMode();
  const tf = opts.tideFor || makeTideFor(dateISO);
  const v1sorted = scoreDay(dateISO, live, { ...opts, tideFor: tf });
  const sst = live?.sst != null && !isNaN(parseFloat(live.sst)) ? parseFloat(live.sst) : null;
  const ctx = { month: +dateISO.slice(5, 7), sst, sstConf: live?.sst_confidence || "inconnue", coeff: tf(SITE.tide.defaultPort).maxCoef || null };
  const calib = opts.calib || calibrate(opts.journal || []);
  const stats = catchStatsPlus(opts.journal || []);
  const withV2 = v1sorted.map((s, i) => {
    const v = spotV2(s, ctx);
    v.v1rank = i + 1;
    if (v.eligible) {
      const bw = s.windows.find((w) => w.id === v.bestWindowId);
      v.fav = v.best.f.fav;
      v.f = v.best.f;
      if (opts.pertinence !== false) {
        try {
          const p = pertinence(s, bw, live, dateISO, { boxOv: opts.boxOv, journal: opts.journal, box: opts.box, trajetMax: opts.trajetMax });
          v.pert = { ...p, adv: undefined, filters: !!opts.boxComplete, provisional: !opts.boxComplete };
        } catch { v.pert = null; }
      }
      v.conf = confidenceV2(s, bw, v.best.f, { live, dayOffset: opts.dayOffset ?? 0, now: opts.clock ?? opts.now ?? Date.now(), sessions: stats[s.id]?.sessions || 0 });
      v.journal = journalAdjust(s.id, calib, stats);
    }
    return { ...s, v2: v };
  });
  if (engine !== "v2") return withV2.map((s) => ({ ...s, engine: "v1" }));
  const sorted = [...withV2].sort(rankCompareV2);
  return sorted.map((s, i) => { const p = project(s); p.v2.rank = i + 1; return p; });
}
/** Sessions, prises et sessions avec prise par spot (pour la confiance et l'apprentissage personnel). */
function catchStatsPlus(entries) {
  const by = catchStats(entries);
  for (const e of entries || []) {
    if (!e?.spotId || !by[e.spotId]) continue;
    const f = Number.isFinite(+e.fish) && e.fish !== "" && e.fish != null ? +e.fish : null;
    if (f != null && f > 0) by[e.spotId].withFish = (by[e.spotId].withFish || 0) + 1;
  }
  return by;
}

/** Comparaison v1 / v2 d'une journée classée par rankDay : rang de chaque spot dans chaque moteur. */
export function compareEngines(sorted) {
  const v1 = [...sorted].sort((a, b) => rankCompareV1(a.v1 ? { ...a, ...a.v1 } : a, b.v1 ? { ...b, ...b.v1 } : b));
  const v2 = [...sorted].sort(rankCompareV2);
  return { v1: v1.map((s) => s.id), v2: v2.map((s) => s.id) };
}
