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

const fr1 = (x) => (x == null || !Number.isFinite(+x) ? "?" : (+x).toFixed(1).replace(".", ","));
const SRC_BEAUFORT = "échelle de Beaufort ; Météo-France émet un BMS côte dès la force 7";

// Phase 4 (demande de Félix, 13 nov. 2026) — LE VENT ET LES RAFALES RETIRENT UN SPOT, comme la houle.
// Filtre non compensable : un spot « non recommandé » ne revient pas grâce à une bonne marée ou à l'aube.
// « À vérifier » : le spot reste proposé, jamais au vert, et passe après ceux qui n'ont aucun doute.
//   vent moyen ≥ force 8 (≥ 62 km/h)  → non recommandé. Météo-France : « avis de coup de vent » dès 62 km/h.
//   rafales ≥ 90 km/h                 → non recommandé. Météo-France : sur terre, tempête au-delà de 90 km/h.
//   vent moyen force 7 (50 à 61 km/h) → à vérifier. Météo-France : BMS côte dès la force 7.
//   rafales ≥ 75 km/h                 → à vérifier. Vitesse d'un vent de force 9 ; seuil DÉDUIT (aucune
//                                        source ne fixe de rafale pour la pêche du bord), à valider par Félix.
//   houle inconnue en côte ouverte    → à vérifier (0 m n'est pas une mesure ; la rade a sa mer du vent calculée).
// Revue finale des phases 3 et 4 : une donnée de vent qui manque est un doute, jamais un calme supposé.
//   vent inconnu (aucune météo)       → à vérifier, rade comprise (sinon la rade passait au vert sans météo).
//   rafales inconnues                 → à vérifier : on ne peut pas savoir si elles dépassent 75 ou 90 km/h.
//   direction inconnue, force ≥ 2     → à vérifier : l'exposition du spot au vent n'est pas jugée.
// Sources : Météo-France, « Guide marine » (oct. 2022) et « Qu'est-ce qu'un vent violent ? » (vigilance.meteofrance.fr).
export const WIND_LIMITS = { blockForce: 8, blockGust: 90, doubtForce: 7, doubtGust: 75 };
export const SRC_WIND = "Météo-France : BMS côte dès la force 7, avis de coup de vent dès 62 km/h, tempête au-delà de 90 km/h de rafales";
const SRC_GUST_DOUBT = "seuil déduit de l'échelle de Beaufort (force 9 dès 75 km/h), à valider";

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
    if (Number.isFinite(f) && f >= WIND_LIMITS.doubtForce) verify.push({ k: "vent", t: `grand frais, force ${f}` });
    else if (zw.wind_dir === "?" && Number.isFinite(f) && f >= 2) verify.push({ k: "vent", t: "direction du vent inconnue" });
    if (Number.isFinite(g) && g >= WIND_LIMITS.doubtGust) verify.push({ k: "rafales", t: `rafales à ${g} km/h` });
    else if (!Number.isFinite(g)) verify.push({ k: "rafales", t: "rafales inconnues" });
  }
  if (zw && zw.houleKnown === false && !isRade(spot)) verify.push({ k: "houle", t: "houle inconnue" });
  return { block: null, verify };
}
const isRade = (spot) => SITE.zones?.[spot?.zone]?.sea === "rade";

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
 * Renvoie { level, label, items: [{ level: "alerte"|"prudence"|"info", t, s }] } : items triés du plus grave au moins grave.
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
    const g = zw.gust_kmh;
    if (Number.isFinite(g) && g >= WIND_LIMITS.blockGust) add("alerte", `Rafales à ${g} km/h : spot non recommandé.`, SRC_WIND);
    else if (Number.isFinite(g) && g >= WIND_LIMITS.doubtGust) add("prudence", `Rafales à ${g} km/h : lancer et équilibre difficiles, à vérifier sur place.`, SRC_GUST_DOUBT);
    if (zw.windKnown === false) add("prudence", "Vent inconnu pour ce créneau : regarde le plan d'eau avant de t'engager.", "SPUMY");
    else {
      if (!Number.isFinite(g)) add("prudence", "Rafales inconnues pour ce créneau (le modèle n'en donne pas) : à vérifier sur place.", "SPUMY");
      if (zw.wind_dir === "?" && Number.isFinite(f) && f >= 2 && f < 7) add("prudence", "Direction du vent inconnue : l'exposition du spot n'a pas pu être jugée.", "SPUMY");
    }
    if (zw.houleKnown === false) {
      if (!isRade(spot)) add("prudence", "Houle inconnue (modèle de vagues indisponible) : regarde la mer avant de t'engager.", "SPUMY");
    } else if (Number.isFinite(spot?.houleMax) && zw.houle > spot.houleMax) {
      add("prudence", `Houle ${fr1(zw.houle)} m, au-dessus du maximum ${mine ? "estimé" : "de la fiche"} (${fr1(spot.houleMax)} m).`, mine ? "estimation pour un spot ajouté" : "fiche du spot");
    }
  }
  if (spot?.dangerLevel >= 3) add("prudence", "Spot engagé : jamais seul, gilet, heure de retour laissée à un proche.", "prudence du guide");
  if (w?.light?.band === "nuit" && spot?.dangerLevel >= 2) add("prudence", "De nuit : n'y aller qu'après un repérage de jour.", "prudence du guide");
  for (const a of alerts) if (!a.conditional) add("info", a.t, a.s || "fiche du spot");

  const level = items.some((i) => i.level === "alerte") ? "alerte" : items.some((i) => i.level === "prudence") ? "prudence" : "neutre";
  const order = { alerte: 0, prudence: 1, info: 2 };
  items.sort((a, b) => order[a.level] - order[b.level]);
  return { level, label: SAFETY_LEVELS[level].label, items };
}
