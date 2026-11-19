// Phase 13 — Favorabilité par espèce, pertinence et confiance (docs/SPEC-MOTEUR-BATEAU.md, § 4 à 8).
//
// Favorabilité = conditions (0 à 100) × présence (0,3 à 1). Un critère dont la donnée manque sort du calcul ; quand
// moins de la moitié des critères sont calculés, il n'y a pas de note. Les poids sont des HYPOTHÈSES de départ
// (niveau 4) ; les données et la réglementation des espèces sont dans data/bateau/moteur.json. Les trois scores ne
// sont jamais fusionnés ; la confiance ne change jamais le rang.
import P from "../../../data/bateau/moteur.json";

export const ESPECES = P.especes;
const BY = Object.fromEntries(P.especes.map((e) => [e.id, e]));

/** Lumière d'une heure : aube et crépuscule (une heure autour du lever et du coucher), jour, nuit. */
export function lightOf(t, sun) {
  if (!sun?.rise || !sun?.set || !Number.isFinite(t)) return null;
  const H = 36e5;
  if (Math.abs(t - sun.rise) <= H) return "aube";
  if (Math.abs(t - sun.set) <= H) return "crepuscule";
  return t > sun.rise && t < sun.set ? "jour" : "nuit";
}
const mmdd = (iso) => iso.slice(5, 10);
const month = (iso) => +iso.slice(5, 7);
/** Espèce fermée à cette date (réglementation), avec la raison. */
export function closedOn(id, dateISO) {
  const e = BY[id];
  const f = (e?.reg?.ferme || []).find(([a, b]) => mmdd(dateISO) >= a && mmdd(dateISO) <= b);
  return f ? e.reg.ferme_texte : null;
}
const HARD = { epave: 1, roche: 1, tombant: 1 };
const lightPts = (l, map) => (l == null ? null : map[l]);

/**
 * Critères d'une espèce pour une zone et un créneau.
 * ctx = { zone: { type, depth, lat }, date, light, bf (vent max), wave (m max), sst (°C), tide: { phase: "etale"|"etabli"|"fort", coef } }
 * Chaque critère : { k, label, pts (null : donnée manquante), max, why }.
 */
export function criteria(id, ctx) {
  const { zone = {}, date, light, bf, wave, sst, tide = {} } = ctx;
  const type = zone.type || null, depth = Number.isFinite(zone.depth) ? zone.depth : null, m = month(date);
  const C = (k, label, max, pts, why) => ({ k, label, max, pts: pts == null ? null : Math.max(0, Math.min(max, pts)), why });
  switch (id) {
    case "lieu-jaune": return [
      C("structure", "Structure dure (épave, roche, tombant)", 30, type == null ? null : HARD[type] ? 30 : type === "banc" ? 15 : 10, "Adultes près des fonds durs et des épaves (FishBase, MarLIN)"),
      C("profondeur", "Profondeur", 20, depth == null ? null : depth >= 40 && depth <= 100 ? 20 : depth >= 15 && depth < 40 ? 12 : depth > 100 && depth <= 200 ? 14 : 4, "Habituellement 40 à 100 m ; têtes de roche par plus de 15 m"),
      C("maree", "Courant établi, pas au plus fort", 20, tide.phase == null ? null : tide.phase === "etabli" ? 20 : tide.phase === "fort" ? 8 : 6, "Pratique de pêcheur (source à trouver)"),
      C("lumiere", "Aube et crépuscule", 15, lightPts(light, { aube: 15, crepuscule: 15, jour: 7, nuit: 3 }), "Pratique de pêcheur (source à trouver)"),
      C("derive", "Dérive praticable", 15, bf == null ? null : bf <= 3 ? 15 : bf === 4 ? 9 : 3, "Pêche près du fond, remontée lente (hypothèse de seuil)"),
    ];
    case "lieu-noir": return [
      C("profondeur", "Profondeur", 35, depth == null ? null : depth >= 37 ? 35 : depth >= 20 ? 20 : 8, "37 à 364 m (FishBase)"),
      C("saison", "Printemps en côte, hiver au large", 25, m >= 3 && m <= 6 ? 25 : m >= 7 && m <= 9 ? 18 : m >= 10 && m <= 11 ? 12 : 5, "Entre en côte au printemps, regagne le large en hiver (FishBase)"),
      C("structure", "Structure", 20, type == null ? null : HARD[type] ? 20 : 10, "Pratique de pêcheur (source à trouver)"),
      C("maree-lumiere", "Marée et lumière", 20, tide.phase == null || light == null ? null : (tide.phase === "etabli" ? 10 : 5) + (light === "aube" || light === "crepuscule" ? 10 : 5), "Pratique de pêcheur (source à trouver)"),
    ];
    case "maquereau": return [
      C("saison-eau", "Saison et température de l'eau", 35, sst != null ? (sst >= 14 ? 35 : sst >= 11 ? 25 : 8) : m >= 4 && m <= 10 ? 25 : 5, "En côte quand l'eau est entre 11 et 14 °C et plus (FishBase) ; du printemps à octobre"),
      C("lumiere", "Le jour", 20, lightPts(light, { jour: 20, aube: 14, crepuscule: 14, nuit: 3 }), "Se nourrit surtout de jour (FishBase)"),
      C("profondeur", "Souvent 15 à 30 m", 20, depth == null ? null : depth >= 15 && depth <= 30 ? 20 : depth >= 5 && depth <= 60 ? 10 : 4, "Se pêche fréquemment entre 15 et 30 m (peche.com)"),
      C("mer", "Mer praticable (chasses en surface)", 15, wave == null ? null : wave <= 1 ? 15 : wave <= 1.5 ? 8 : 2, "Seuil de mer : hypothèse"),
      C("maree", "Marée", 10, tide.phase == null ? null : tide.phase === "etabli" ? 10 : 5, "Source à trouver"),
    ];
    case "bar": return [
      C("structure", "Plateaux et roches dans le courant", 30, type == null ? null : type === "roche" || type === "banc" ? 30 : type === "tombant" ? 20 : type === "chenal" ? 18 : 15, "Critère bateau à sourcer (hypothèse)"),
      C("courant", "Courant établi", 25, tide.phase == null ? null : tide.phase === "etabli" ? 25 : tide.phase === "fort" ? 18 : 6, "Critère bateau à sourcer (hypothèse)"),
      C("lumiere", "Lumière basse", 20, lightPts(light, { aube: 20, crepuscule: 20, nuit: 14, jour: 6 }), "Critère bateau à sourcer (hypothèse)"),
      C("mer", "Mer formée sur les hauts-fonds, sans danger", 15, wave == null ? null : wave >= 0.5 && wave <= 1.5 ? 15 : wave < 0.5 ? 8 : 4, "Critère bateau à sourcer (hypothèse)"),
      C("profondeur", "Moins de 20 m", 10, depth == null ? null : depth < 20 ? 10 : 4, "Critère bateau à sourcer (hypothèse)"),
    ];
    case "vieille": return [
      C("habitat", "Roche et laminaires, 2 à 30 m", 35, type == null ? null : type === "roche" ? (depth != null && depth >= 2 && depth <= 30 ? 35 : 18) : 6, "FishBase ; revue Devon and Severn IFCA (2016)"),
      C("lumiere", "Le jour", 25, lightPts(light, { jour: 25, aube: 15, crepuscule: 15, nuit: 2 }), "Plus active de jour (Morel et al. 2013)"),
      C("saison", "Printemps et été", 20, m >= 4 && m <= 9 ? 20 : m === 3 || m === 10 || m === 11 ? 12 : 4, "Plus active au printemps et en été (Morel et al. 2013)"),
      C("vives-eaux", "Vives-eaux", 10, !Number.isFinite(tide.coef) ? null : tide.coef >= 80 ? 10 : tide.coef >= 60 ? 6 : 3, "Plus détectée en vives-eaux (une seule étude, Jersey)"),
      C("mer", "Mer praticable sur la roche", 10, wave == null ? null : wave <= 1 ? 10 : 3, "Hypothèse"),
    ];
    case "saint-pierre": return [
      C("profondeur", "Près du fond, 50 à 150 m", 35, depth == null ? null : depth >= 50 && depth <= 150 ? 35 : depth >= 20 ? 20 : 6, "50 à 150 m, de 5 à 400 m (FishBase)"),
      C("proies", "Petits poissons en bancs", 25, null, "Sa proie (FishBase) : non mesurable par l'application"),
      C("saison", "Saison en côte", 20, null, "Inconnue : source à trouver"),
      C("maree-lumiere", "Marée et lumière", 20, null, "Source à trouver"),
    ];
    default: return [];
  }
}

/** Présence (0,3 à 1) : saison, eau, aire de l'espèce. */
export function presence(id, { date, sst }) {
  const m = month(date);
  switch (id) {
    case "lieu-jaune": return { f: m === 5 ? 0.85 : 1, why: m === 5 ? "Retour sur les épaves après le frai (février à mai)" : "Présent toute l'année hors fermeture" };
    case "lieu-noir": return { f: 0.3, why: "Rare : le golfe de Gascogne est à la limite sud de son aire (FishBase)" };
    case "maquereau": return m >= 4 && m <= 10 ? { f: sst == null || sst >= 11 ? 1 : 0.6, why: sst != null ? `Eau à ${String(sst).replace(".", ",")} °C` : "Saison de présence en côte" } : { f: 0.3, why: "Hiverne plus profond : rare en côte" };
    case "bar": return m >= 4 && m <= 11 ? { f: 1, why: "Saison côtière" } : { f: 0.4, why: "Frai en hiver au large" };
    case "vieille": return m >= 12 || m <= 2 ? { f: 0.6, why: "Peu active en hiver (dans les failles)" } : { f: 1, why: "Résidente toute l'année" };
    case "saint-pierre": return { f: 0.6, why: "Saison en côte inconnue" };
    default: return { f: 0.5, why: "" };
  }
}

/** Favorabilité d'une espèce : { fav (null : pas de note), conditions, presence, crit, part }. */
export function favorability(id, ctx) {
  const crit = criteria(id, ctx);
  const known = crit.filter((c) => c.pts != null);
  const pres = presence(id, ctx);
  if (!crit.length || known.length * 2 < crit.length) return { fav: null, conditions: null, presence: pres, crit, part: known.length / (crit.length || 1) };
  const max = known.reduce((s, c) => s + c.max, 0), got = known.reduce((s, c) => s + c.pts, 0);
  const conditions = Math.round((got / max) * 100);
  return { fav: Math.round(conditions * pres.f), conditions, presence: pres, crit, part: known.length / crit.length };
}

/** Poids de tête ou de jig nécessaire (g) : 1 g par mètre, 30 % de plus avec du vent pour la dérive (HYPOTHÈSE à sourcer). */
export const weightNeeded = (depth, bf) => (Number.isFinite(depth) ? Math.round(depth * (bf != null && bf >= 4 ? 1.3 : 1)) : null);

/** Pertinence (0 à 100) : technique et matériel 50, route 30, réglementation 20 ; parts inconnues hors du calcul. */
export function relevance(id, { zone = {}, profile = {}, bf, routeMin }) {
  const parts = [];
  const w = weightNeeded(zone.depth, bf), c = profile.canne || {};
  if (w != null && Number.isFinite(c.max)) parts.push({ k: "materiel", label: "Ta canne pour cette profondeur", max: 50, pts: w <= c.max && w >= (c.min || 0) * 0.5 ? 50 : 15, why: `≈ ${w} g nécessaires ; ta canne ${c.min || 0} à ${c.max} g` });
  const tMax = Number.isFinite(profile.tempsMaxMin) ? profile.tempsMaxMin : 60;
  if (Number.isFinite(routeMin)) parts.push({ k: "route", label: "Temps de route", max: 30, pts: routeMin <= tMax ? 30 : Math.max(0, Math.round(30 * (1 - (routeMin - tMax) / tMax))), why: `${Math.round(routeMin)} min de route (au plus ${tMax} min souhaitées)` });
  const reg = BY[id]?.reg;
  parts.push({ k: "reglementation", label: "Réglementation connue", max: 20, pts: reg?.statut === "VÉRIFIÉ" ? 20 : 10, why: reg?.texte || "" });
  const max = parts.reduce((s, p) => s + p.max, 0), got = parts.reduce((s, p) => s + p.pts, 0);
  return { score: Math.round((got / max) * 100), parts, provisoire: parts.length < 3 };
}

/** Confiance (0 à 100) : données 40, modèles 20, preuves 25, tes sorties 15. Ne change jamais le rang. */
export function confidence(id, { ageH, visibilityKnown = true, part = 1, modelsAgree = null, trips = 0 }) {
  const d = (!Number.isFinite(ageH) ? 12 : ageH <= 3 ? 40 : ageH <= 12 ? 28 : 12) - (visibilityKnown ? 0 : 8);
  const donnees = Math.max(0, Math.round(d * (0.5 + part / 2)));
  const modeles = modelsAgree == null ? 10 : modelsAgree ? 20 : 6;
  const preuves = BY[id]?.preuve ?? 8;
  const sorties = Math.round(Math.min(1, trips / 10) * 15);
  const score = donnees + modeles + preuves + sorties;
  return { score, label: score >= 70 ? "haute" : score >= 45 ? "moyenne" : "faible", parts: { donnees, modeles, preuves, sorties } };
}

/** Ajustement personnel (tes sorties) : ±10 au plus, seulement à partir de 8 sorties avec une prise de l'espèce. */
export const personalAdjust = (delta, tripsWithCatch) => (tripsWithCatch >= 8 && Number.isFinite(delta) ? Math.max(-10, Math.min(10, Math.round(delta))) : 0);

/**
 * Espèces d'une zone, classées : fermées et non proposées à part, avec leur raison ; triées par favorabilité
 * (sans note à la fin), la confiance affichée à côté sans jamais changer le rang.
 */
export function rankSpecies({ zone, profile, date, light, bf, wave, sst, tide, ageH, visibilityKnown, routeMin, caught = {}, trips = {} }) {
  const out = [], off = [];
  for (const e of P.especes) {
    const closed = closedOn(e.id, date);
    if (closed) { off.push({ id: e.id, nom: e.nom, reason: `${closed} (réglementation)` }); continue; }
    if (e.seulement_si_pris && !(caught[e.id] > 0)) { off.push({ id: e.id, nom: e.nom, reason: "Rare en Finistère : proposé seulement quand tes sorties en ont pris" }); continue; }
    const f = favorability(e.id, { zone, date, light, bf, wave, sst, tide });
    const adj = personalAdjust(null, trips[e.id] || 0);
    const r = relevance(e.id, { zone, profile, bf, routeMin });
    const c = confidence(e.id, { ageH, visibilityKnown, part: f.part, trips: trips[e.id] || 0 });
    out.push({ id: e.id, nom: e.nom, latin: e.latin, fav: f.fav == null ? null : Math.max(0, Math.min(100, f.fav + adj)), f, pert: r, conf: c, reg: e.reg, technique: e.technique, poids: weightNeeded(zone?.depth, bf) });
  }
  out.sort((a, b) => (a.fav == null) - (b.fav == null) || (b.fav ?? 0) - (a.fav ?? 0) || a.nom.localeCompare(b.nom, "fr"));
  return { especes: out, nonProposees: off };
}
