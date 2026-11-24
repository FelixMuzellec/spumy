// Phase 6 V3 — contrat de sécurité BORD PROPOSÉ (référentiel § 9.5), hors application. Il reprend les règles V2 qui
// existent et sont sourcées ou validées (src/bord/engine/safety.js), sans en inventer, et les range dans les cinq
// états V3. Une donnée de sécurité inconnue n'est jamais SAFE ; un état ne se compense jamais par la Favorabilité.
// Mêmes seuils que src/bord/engine/safety.js (WIND_LIMITS, HOULE_MARGE), recopiés parce que ce module lit la configuration
// d'un guide ; tests/etude-moteur-bord.mjs vérifie qu'ils restent égaux à ceux du moteur.
export const WIND_LIMITS = { blockForce: 8, blockGust: 90, doubtForce: 6, doubtGust: 60 };
export const HOULE_MARGE = 0.5;

export const ETATS = ["SAFE", "CAUTION", "INSUFFICIENT_DATA", "DANGER", "BLOCKED"];   // du moins au plus sévère (provisoire)

/**
 * c : { ventConnu, force, rafalesKmh (null = inconnues), directionConnue, coteOuverte, houleConnue, houleM, houleMaxM (null = inconnue),
 *       engagement (1 | 2 | 3 | null = inconnu), coef, coefMaxDur (null = aucun), isolement (true | false | null = inconnu),
 *       nuit, fermetureOfficielle (true | false | null = non lue), }
 * Renvoie { etat, raisons: [{ etat, regle, texte, source }] } : l'état le plus sévère, et toutes les raisons.
 */
export function etatSecurite(c) {
  const r = [];
  const add = (etat, regle, texte, source) => r.push({ etat, regle, texte, source });
  const W = WIND_LIMITS, MF = "Météo-France (BMS côte dès la force 7 ; tempête au-delà de 90 km/h)", FX = "prudence validée par Félix, 13 nov. 2026";
  // Règles bloquantes : fermeture ou interdiction officielle à la date (arrêté lu).
  if (c.fermetureOfficielle === true) add("BLOCKED", "fermeture", "fermeture ou interdiction officielle à cette date", "arrêté lu dans la fiche");
  // Vent et rafales.
  if (!c.ventConnu) add("INSUFFICIENT_DATA", "vent", "vent inconnu", FX);
  else {
    if (c.force >= W.blockForce) add("DANGER", "vent", `force ${c.force}`, MF);
    else if (c.force >= W.doubtForce) add("CAUTION", "vent", `force ${c.force}`, FX);
    if (c.rafalesKmh == null) add("INSUFFICIENT_DATA", "rafales", "rafales inconnues", FX);
    else if (c.rafalesKmh >= W.blockGust) add("DANGER", "rafales", `rafales ${c.rafalesKmh} km/h`, MF);
    else if (c.rafalesKmh >= W.doubtGust) add("CAUTION", "rafales", `rafales ${c.rafalesKmh} km/h`, FX);
    if (!c.directionConnue && c.force >= 2) add("INSUFFICIENT_DATA", "direction", "direction du vent inconnue", FX);
  }
  // Engagement du poste : inconnu, il ne vaut jamais « non engagé » (la V2 le lisait comme non engagé).
  const engage = c.engagement == null ? null : c.engagement >= 3;
  if (c.engagement == null) add("INSUFFICIENT_DATA", "engagement", "niveau d'engagement du poste inconnu", "contrat V3 (§ 9.5)");
  // Houle.
  if (c.coteOuverte && !c.houleConnue) add(engage ? "DANGER" : "INSUFFICIENT_DATA", "houle", engage ? "houle inconnue sur un spot engagé" : "houle inconnue en côte ouverte", "règle V2 (spécification v2, § 3)");
  else if (c.houleConnue && c.houleMaxM == null && c.coteOuverte) add("INSUFFICIENT_DATA", "houle", "houle maximale du poste inconnue", "contrat V3 (§ 9.5)");
  else if (c.houleConnue && c.houleMaxM != null && c.houleM > c.houleMaxM) {
    if (engage || c.houleM > c.houleMaxM + HOULE_MARGE) add("DANGER", "houle", `houle ${c.houleM} m > maximum ${c.houleMaxM} m${engage ? " (spot engagé)" : ` + ${HOULE_MARGE} m`}`, "fiche du poste, règle V2");
    else add(engage === null ? "INSUFFICIENT_DATA" : "CAUTION", "houle", `houle ${c.houleM} m au-dessus du maximum ${c.houleMaxM} m`, "fiche du poste, règle V2");
  }
  // Courant (coefficient au-delà de la limite documentée du poste) et isolement par la marée.
  if (c.coefMaxDur != null && c.coef > c.coefMaxDur) add("DANGER", "courant", `coefficient ${c.coef} > ${c.coefMaxDur}`, "fiche du poste");
  if (c.isolement === true) add("DANGER", "isolement", "le flot coupe le retour pendant le créneau", "fiche du poste (accès selon la marée)");
  else if (c.isolement == null) add("INSUFFICIENT_DATA", "isolement", "accès selon la marée inconnu", "contrat V3 (§ 9.5)");
  // Nuit.
  if (c.nuit && engage === true) add("DANGER", "nuit", "nuit sur un spot engagé", "règle V2 (validée)");
  else if (c.nuit && engage === null) add("INSUFFICIENT_DATA", "nuit", "nuit sur un poste dont l'engagement est inconnu", "contrat V3 (§ 9.5)");
  // Vigilance Météo-France : non lue par SPUMY tant que V3-011 n'est pas réalisé : rappel, jamais « aucune vigilance ».
  const etat = r.reduce((e, x) => (ETATS.indexOf(x.etat) > ETATS.indexOf(e) ? x.etat : e), "SAFE");
  return { etat, raisons: r, rappel: "Vigilance Météo-France non lue par SPUMY : consulte-la avant de partir." };
}
