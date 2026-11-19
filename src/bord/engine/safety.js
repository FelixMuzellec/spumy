// v9.1 — SÉCURITÉ DU BORD : un indicateur à part, qui n'est pas une note.
//
// La note dit où et quand le bar a le plus de chances d'être là. La sécurité dit ce que le guide SAIT
// des dangers du créneau retenu, et rien de plus. Elle se construit uniquement à partir des données du
// moteur : consignes de la fiche (actives selon le coefficient et la phase), houle prévue face au maximum
// de la fiche, vent moyen sur l'échelle de Beaufort, lumière, niveau du spot, météo manquante.
//
// Trois états, jamais de feu vert :
//   « alerte »   un danger annoncé (coup de vent, force 8 et plus) ;
//   « prudence » une consigne active, une limite de la fiche dépassée, une donnée qui manque, un spot engagé ;
//   « neutre »   aucune alerte connue — ce qui ne veut pas dire sûr : le guide ne voit ni l'état réel de la
//                mer, ni l'accès, ni la fatigue. D'où « vérifie sur place », dans tous les cas.
//
// Seuils : uniquement des seuils publiés. Beaufort (force 7 « grand frais », 28 à 33 nœuds ; force 8
// « coup de vent », 34 à 40 nœuds) et la règle de Météo-France : un bulletin météorologique spécial (BMS)
// côte est émis dès que le vent atteint ou atteindra la force 7. La houle se juge contre le maximum écrit
// dans la fiche du spot (estimé pour un spot que tu as ajouté, et dit comme tel).
import { SITE } from "SITE_CONFIG";
import { securityFor } from "../../core/rules.js";

const fr1 = (x) => (x == null || !Number.isFinite(+x) ? "?" : (+x).toFixed(1).replace(".", ","));
const SRC_BEAUFORT = "échelle de Beaufort ; Météo-France émet un BMS côte dès la force 7";

// Phase 4 (demande de Félix, 13 nov. 2026) — LE VENT ET LES RAFALES RETIRENT UN SPOT, comme la houle.
// Filtre non compensable : un spot « non recommandé » ne revient pas grâce à une bonne marée ou à l'aube.
// « À vérifier » : le spot reste proposé, jamais au vert, et passe après ceux qui n'ont aucun doute.
// Phase 7 (spécification v2, §3, validée par Félix le 18 nov. 2026) — seuils plus prudents, décision de Félix
// du 13 nov. 2026 :
//   vent moyen ≥ force 8 (≥ 62 km/h)  → non recommandé. Météo-France : « avis de coup de vent » dès 62 km/h.
//   rafales ≥ 90 km/h                 → non recommandé. Météo-France : sur terre, tempête au-delà de 90 km/h.
//   vent moyen force 6 ou 7           → à vérifier. Choix de prudence de Félix (Météo-France : BMS côte dès la force 7).
//   rafales de 60 à 89 km/h           → à vérifier. Choix de prudence de Félix (aucune source ne fixe de rafale
//                                        pour la pêche du bord ; la v1 disait 75 km/h, seuil déduit).
//   houle inconnue en côte ouverte    → à vérifier (0 m n'est pas une mesure ; la rade a sa mer du vent calculée).
// Revue finale des phases 3 et 4 : une donnée de vent qui manque est un doute, jamais un calme supposé.
//   vent inconnu (aucune météo)       → à vérifier, rade comprise (sinon la rade passait au vert sans météo).
//   rafales inconnues                 → à vérifier : on ne peut pas savoir si elles dépassent 60 ou 90 km/h.
//   direction inconnue, force ≥ 2     → à vérifier : l'exposition du spot au vent n'est pas jugée.
// Sources : Météo-France, « Guide marine » (oct. 2022) et « Qu'est-ce qu'un vent violent ? » (vigilance.meteofrance.fr).
export const WIND_LIMITS = { blockForce: 8, blockGust: 90, doubtForce: 6, doubtGust: 60 };
export const SRC_WIND = "Météo-France : BMS côte dès la force 7, avis de coup de vent dès 62 km/h, tempête au-delà de 90 km/h de rafales";
const SRC_GUST_DOUBT = "choix de prudence de Félix (13 nov. 2026) : à vérifier dès 60 km/h de rafales";
const SRC_FORCE_DOUBT = "choix de prudence de Félix (13 nov. 2026) : à vérifier dès la force 6 ; Météo-France émet un BMS côte dès la force 7";

/**
 * Filtre de sécurité d'un créneau, avant toute note : { block: raison | null, verify: [{ k, t }] }.
 * zw : météo du créneau ; spot : fiche.
 */
export function windSafety(spot, zw) {
  const f = zw?.wind_force, kmh = zw?.wind_kmh, g = zw?.gust_kmh;
  if (Number.isFinite(f) && f >= WIND_LIMITS.blockForce)
    return { block: `Coup de vent : force ${f}${Number.isFinite(kmh) ? ` (${kmh} km/h de vent moyen)` : ""}, non recommandé`, verify: [] };
  if (Number.isFinite(g) && g >= WIND_LIMITS.blockGust) return { block: `Rafales à ${g} km/h, non recommandé`, verify: [] };
  const verify = [];
  if (!zw || zw.windKnown === false) verify.push({ k: "vent", t: "vent inconnu" });
  else {
    if (Number.isFinite(f) && f >= WIND_LIMITS.doubtForce) verify.push({ k: "vent", t: `${f >= 7 ? "grand frais" : "vent frais"}, force ${f}` });
    else if (zw.wind_dir === "?" && Number.isFinite(f) && f >= 2) verify.push({ k: "vent", t: "direction du vent inconnue" });
    if (Number.isFinite(g) && g >= WIND_LIMITS.doubtGust) verify.push({ k: "rafales", t: `rafales à ${g} km/h` });
    else if (!Number.isFinite(g)) verify.push({ k: "rafales", t: "rafales inconnues" });
  }
  if (zw && zw.houleKnown === false && !isRade(spot)) verify.push({ k: "houle", t: "houle inconnue" });
  return { block: null, verify };
}
const isRade = (spot) => SITE.zones?.[spot?.zone]?.sea === "rade";

/**
 * Phase 7 — FILTRE DE SÉCURITÉ D'UN CRÉNEAU (spécification v2, §3), commun aux deux moteurs de notes : revenir à la
 * note sur 10 ne ramène jamais les anciens seuils. Il passe avant toute note et ne se compense jamais.
 *   vent, rafales, vent inconnu, houle inconnue en côte ouverte : windSafety ci-dessus ;
 *   coefficient au-delà de la limite de courant documentée (coefHardMax de la fiche)   → non recommandé ;
 *   retour coupé par la marée (consigne de la fiche marquée « isolement », active)    → non recommandé ;
 *   houle au-dessus du maximum de la fiche : spot engagé → non recommandé ; ailleurs à vérifier jusqu'à +0,5 m,
 *     non recommandé au-delà (la v1 cachait ce dépassement dans une pénalité de la note) ;
 *   houle inconnue en côte ouverte sur un spot engagé                                  → non recommandé ;
 *   nuit sur un spot engagé (niveau 3)                                                  → non recommandé (la v1 ne
 *     retirait que le bonus de nuit).
 * La vigilance Météo-France n'est pas lue par l'application (INCONNU, VIGILANCE ci-dessous).
 * spot : fiche ; win : créneau (coeff, light, tidePhaseType) ; zw : météo du créneau ; coeff : repli (max du jour).
 * Renvoie { block: raison | null, kind, verify: [{ k, t }] }.
 */
export const HOULE_MARGE = 0.5;
export function windowSafety(spot, win, zw, { coeff } = {}) {
  const ws = windSafety(spot, zw);
  if (ws.block) return { block: ws.block, kind: "vent", verify: [] };
  const verify = [...ws.verify];
  const c = win?.coeff ?? coeff;
  const engaged = spot?.dangerLevel >= 3;
  if (zw && zw.houleKnown !== false && Number.isFinite(spot?.houleMax) && zw.houle > spot.houleMax) {
    if (engaged || zw.houle > spot.houleMax + HOULE_MARGE)
      return { block: `Houle trop forte (${zw.houle} m ; max ${spot.houleMax} m${engaged ? ", spot engagé" : ""})`, kind: "houle", verify: [] };
    verify.push({ k: "houle", t: `houle ${fr1(zw.houle)} m, au-dessus du maximum ${spot.custom ? "estimé" : "de la fiche"} (${fr1(spot.houleMax)} m)` });
  }
  if (spot?.coefHardMax && c > spot.coefHardMax)
    return { block: spot.coefHardMaxWhy ? `Coef ${c} : ${spot.coefHardMaxWhy}` : `Coef ${c} > ${spot.coefHardMax} — courant hors de portée du bord ici`, kind: "courant", verify: [] };
  const iso = securityFor(spot, { coeff: c, window: win }).find((a) => a.isolement && a.active);
  if (iso) return { block: `Retour coupé par la marée : ${iso.t}`, kind: "isolement", verify: [] };
  if (zw && zw.houleKnown === false && !isRade(spot) && engaged)
    return { block: "Houle inconnue (modèle de vagues indisponible) : spot engagé non proposé par prudence", kind: "houle", verify: [] };
  if (engaged && win?.light?.band === "nuit") return { block: "Nuit sur un spot engagé : non recommandé (repérage de jour, jamais seul)", kind: "nuit", verify: [] };
  return { block: null, kind: null, verify };
}
/** Vigilance Météo-France (vent, vagues-submersion) : non lue par SPUMY. Dit à l'écran, jamais supposée verte. */
export const VIGILANCE = { known: false, t: "Vigilance Météo-France non lue par SPUMY : consulte-la avant de partir (vent, vagues-submersion).",
  s: "vigilance.meteofrance.fr", url: "https://vigilance.meteofrance.fr/fr" };

export const SAFETY_LEVELS = {
  alerte: { label: "Alerte sécurité", rank: 2 },
  prudence: { label: "Prudence", rank: 1 },
  neutre: { label: "Aucune alerte connue", rank: 0 },
};
export const ON_SITE = "Vérifie sur place : état de la mer, accès, et ton retour avant que la marée ne coupe le passage.";

/**
 * État de sécurité d'un créneau sur un spot.
 * spot : spot noté (dangerLevel, houleMax, zone, custom) ; w : créneau retenu (zw, light) ou null ;
 * alerts : securityFor(spot, …) ; degraded : aucune météo.
 * Renvoie { level, label, items: [{ level: "alerte"|"prudence"|"info", t, s }], vigilance } : items triés du plus grave au moins grave.
 */
export function safetyOf(spot, w, { alerts = [], degraded = false } = {}) {
  const items = [];
  const add = (level, t, s) => items.push({ level, t, s });
  const zw = w?.zw || spot?.zw || null;
  const mine = !!spot?.custom;

  for (const a of alerts) if (a.active) add("prudence", `Aujourd'hui : ${a.t}`, a.s || "fiche du spot");

  if (degraded || !zw) add("prudence", "Sans météo : vent et houle inconnus pour ce créneau.", "SPUMY");
  else {
    const f = zw.wind_force, kmh = zw.wind_kmh;
    if (f >= 8) add("alerte", `Coup de vent annoncé : force ${f} (${kmh} km/h de vent moyen). Spot non recommandé.`, SRC_BEAUFORT);
    else if (f >= 7) add("prudence", `Grand frais annoncé : force 7 (${kmh} km/h de vent moyen) — bulletin spécial côte probable.`, SRC_BEAUFORT);
    else if (f >= WIND_LIMITS.doubtForce) add("prudence", `Vent frais annoncé : force ${f} (${kmh} km/h de vent moyen) : à vérifier sur place.`, SRC_FORCE_DOUBT);
    const g = zw.gust_kmh;
    if (Number.isFinite(g) && g >= WIND_LIMITS.blockGust) add("alerte", `Rafales à ${g} km/h : spot non recommandé.`, SRC_WIND);
    else if (Number.isFinite(g) && g >= WIND_LIMITS.doubtGust) add("prudence", `Rafales à ${g} km/h : lancer et équilibre difficiles, à vérifier sur place.`, SRC_GUST_DOUBT);
    if (zw.windKnown === false) add("prudence", "Vent inconnu pour ce créneau : regarde le plan d'eau avant de t'engager.", "SPUMY");
    else {
      if (!Number.isFinite(g)) add("prudence", "Rafales inconnues pour ce créneau (le modèle n'en donne pas) : à vérifier sur place.", "SPUMY");
      if (zw.wind_dir === "?" && Number.isFinite(f) && f >= 2 && f < WIND_LIMITS.doubtForce) add("prudence", "Direction du vent inconnue : l'exposition du spot n'a pas pu être jugée.", "SPUMY");
    }
    if (zw.houleKnown === false) {
      if (!isRade(spot)) add("prudence", "Houle inconnue (modèle de vagues indisponible) : regarde la mer avant de t'engager.", "SPUMY");
    } else if (Number.isFinite(spot?.houleMax) && zw.houle > spot.houleMax) {
      const over = spot.dangerLevel >= 3 || zw.houle > spot.houleMax + HOULE_MARGE;
      add(over ? "alerte" : "prudence", `Houle ${fr1(zw.houle)} m, au-dessus du maximum ${mine ? "estimé" : "de la fiche"} (${fr1(spot.houleMax)} m)${over ? " : spot non recommandé." : " : à vérifier sur place."}`, mine ? "estimation pour un spot ajouté" : "fiche du spot");
    }
  }
  if (spot?.dangerLevel >= 3) add("prudence", "Spot engagé : jamais seul, gilet, heure de retour laissée à un proche.", "prudence du guide");
  if (w?.light?.band === "nuit" && spot?.dangerLevel >= 3) add("alerte", "De nuit sur un spot engagé : non recommandé.", "cahier des charges de SPUMY (spécification v2, §3)");
  else if (w?.light?.band === "nuit" && spot?.dangerLevel >= 2) add("prudence", "De nuit : n'y aller qu'après un repérage de jour.", "prudence du guide");
  for (const a of alerts) if (a.active && a.isolement) add("alerte", "Retour coupé par la marée pendant ce créneau : spot non recommandé.", a.s || "fiche du spot");
  for (const a of alerts) if (!a.conditional) add("info", a.t, a.s || "fiche du spot");

  const level = items.some((i) => i.level === "alerte") ? "alerte" : items.some((i) => i.level === "prudence") ? "prudence" : "neutre";
  const order = { alerte: 0, prudence: 1, info: 2 };
  items.sort((a, b) => order[a.level] - order[b.level]);
  // Vigilance Météo-France : non lue (INCONNU), dite à part des consignes de la fiche, jamais supposée verte.
  return { level, label: SAFETY_LEVELS[level].label, items, vigilance: VIGILANCE.known ? null : VIGILANCE };
}
