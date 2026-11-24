// Phase 6 V3 — contrat de sécurité BORD PROPOSÉ (référentiel § 9.5), hors application. Il reprend les règles V2 qui
// existent et sont sourcées ou validées (src/bord/engine/safety.js : windowSafety, windSafety, safetyOf), sans en
// inventer, et les range dans les cinq états V3. Une donnée de sécurité inconnue, absente ou illisible n'est jamais SAFE ;
// un état ne se compense jamais par la Favorabilité. SAFE veut dire « aucune alerte connue sur les facteurs évalués » :
// les facteurs du § 9.5 que le contrat n'évalue pas sont toujours listés à côté (nonEvalues).

// Mêmes seuils que src/bord/engine/safety.js (WIND_LIMITS, HOULE_MARGE), recopiés parce que ce module lit la configuration
// d'un guide ; tests/etude-moteur-bord.mjs vérifie qu'ils restent égaux à ceux du moteur.
export const WIND_LIMITS = { blockForce: 8, blockGust: 90, doubtForce: 6, doubtGust: 60 };
export const HOULE_MARGE = 0.5;

export const ETATS = ["SAFE", "CAUTION", "INSUFFICIENT_DATA", "DANGER", "BLOCKED"];   // du moins au plus sévère (provisoire, D6-09)
export const NON_EVALUES = ["période et direction de la houle", "exposition et orientation du poste", "ressac et rochers glissants",
  "mouvements de terrain (chutes de blocs, éboulements)", "échappatoire et repli", "visibilité (brouillard)",
  "limite de courant du poste quand la fiche n'en documente pas"];

// Normalisation : une mesure n'est connue que si c'est un nombre fini et physiquement possible (≥ 0). Un tableau (les
// heures du créneau) n'est connu que si tous ses éléments le sont : une heure sans valeur rend la mesure inconnue.
// Une limite ou un maximum de la fiche est un seul nombre, jamais un tableau ni un texte. Un oui-non n'est connu que s'il
// vaut true ou false.
const valide = (x) => typeof x === "number" && Number.isFinite(x) && x >= 0;
const pire = (v) => { const a = Array.isArray(v) ? v : [v]; return a.length && a.every(valide) ? Math.max(...a) : null; };
const unique = (v) => (valide(v) ? v : null);
const tri = (v) => (v === true ? true : v === false ? false : null);
// Modèle principal (obligatoire) et second modèle (facultatif : absent, il est accepté et la Confiance le dit ; déclaré
// mais illisible, la mesure devient inconnue). On lit le plus fort des deux (D6-14).
const deuxModeles = (principal, autre) => {
  const a = pire(principal);
  if (a == null) return null;
  if (autre === undefined) return a;
  const b = pire(autre);
  return b == null ? null : Math.max(a, b);
};

/**
 * c : {
 *   ventConnu, force (nombre, ou tableau des heures du créneau, modèle principal), forceAutreModele (facultatif, idem),
 *   rafalesKmh, rafalesAutreModele (idem), directionConnue,
 *   rade (true : rade abritée au sens V2 ; false : côte ouverte ; null : inconnu, lu comme côte ouverte),
 *   houleConnue, houleM, houleMaxM (nombre ou null = inconnu),
 *   engagement (1 | 2 | 3 | null = inconnu), coef, coefMaxDur (nombre ; null ou absent : aucune limite documentée, NON_EVALUES),
 *   isolement (true : le flot coupe le retour pendant le créneau ; false : accès selon la marée connu, et le créneau situé
 *              hors de toute contrainte de marée par une règle documentée ; null : accès inconnu, ou contrainte de marée
 *              connue mais que rien ne situe par rapport au créneau),
 *   consignesActives : [texte] (consignes de la fiche actives pour ce coefficient et cette phase),
 *   nuit (true | false | null = heure de lever ou de coucher inconnue),
 *   fermetureOfficielle (true : fermeture ou interdiction applicable au poste à la date ; false : réglementation locale lue,
 *                        aucune ; null : non lue ou application au poste « à vérifier »),
 * }
 * Renvoie { etat, niveauAffiche, raisons: [{ etat, regle, texte, source }], prudences: [{ texte, source }], nonEvalues, rappel }.
 * `prudences` reprend l'indicateur « prudence » de la V2 (consignes actives, poste engagé, nuit sur un poste de niveau 2) :
 * sans changer l'état ni le rang, mais avec le même libellé qu'en V2 au premier niveau, « Prudence » (SEC-04, D6-19).
 * `niveauAffiche` : « Non recommandé » (DANGER, BLOCKED), « À vérifier » (INSUFFICIENT_DATA, CAUTION), « Prudence » (SAFE avec
 * prudences), « Aucune alerte connue » (SAFE sans prudence) : jamais un vert ni le mot « sûr ».
 */
export function etatSecurite(c) {
  const r = [], prudences = [];
  const add = (etat, regle, texte, source) => r.push({ etat, regle, texte, source });
  const W = WIND_LIMITS, MF = "Météo-France (BMS côte dès la force 7 ; tempête au-delà de 90 km/h)", FX = "prudence validée par Félix, 13 nov. 2026";
  // Réglementation.
  const ferme = tri(c.fermetureOfficielle);
  if (ferme === true) add("BLOCKED", "fermeture", "fermeture ou interdiction officielle applicable au poste à cette date", "arrêté lu dans la fiche");
  else if (ferme === null) add("INSUFFICIENT_DATA", "fermeture", "réglementation locale non lue, ou application au poste à vérifier", "contrat V3 (§ 9.5)");
  // Vent et rafales : le plus fort des modèles et des heures du créneau (D6-14).
  const force = deuxModeles(c.force, c.forceAutreModele), rafales = deuxModeles(c.rafalesKmh, c.rafalesAutreModele);
  if (c.ventConnu !== true || force == null) add("INSUFFICIENT_DATA", "vent", "vent inconnu", FX);
  else {
    if (force >= W.blockForce) add("DANGER", "vent", `force ${force}`, MF);
    else if (force >= W.doubtForce) add("CAUTION", "vent", `force ${force}`, FX);
    if (tri(c.directionConnue) !== true && force >= 2) add("INSUFFICIENT_DATA", "direction", "direction du vent inconnue", FX);
  }
  if (rafales == null) add("INSUFFICIENT_DATA", "rafales", "rafales inconnues", FX);
  else if (rafales >= W.blockGust) add("DANGER", "rafales", `rafales ${rafales} km/h`, MF);
  else if (rafales >= W.doubtGust) add("CAUTION", "rafales", `rafales ${rafales} km/h`, FX);
  // Engagement du poste : inconnu, il ne vaut jamais « non engagé » (la V2 le lisait comme non engagé, audit A12).
  const niveau = [1, 2, 3].includes(c.engagement) ? c.engagement : null;
  const engage = niveau == null ? null : niveau >= 3;
  if (niveau == null) add("INSUFFICIENT_DATA", "engagement", "niveau d'engagement du poste inconnu", "contrat V3 (§ 9.5)");
  // Houle : côte ouverte sauf rade connue (définition V2, isRade) ; un havre ou une embouchure hors rade est côte ouverte.
  const coteOuverte = tri(c.rade) !== true;
  const houle = pire(c.houleM), houleConnue = tri(c.houleConnue) === true && houle != null, hmax = unique(c.houleMaxM);
  if (!houleConnue) {
    if (coteOuverte) add(engage === true ? "DANGER" : "INSUFFICIENT_DATA", "houle", engage === true ? "houle inconnue sur un poste engagé" : "houle inconnue en côte ouverte", "règle V2 (spécification v2, § 3)");
  } else if (hmax == null) {
    if (coteOuverte) add("INSUFFICIENT_DATA", "houle", "houle maximale du poste inconnue", "contrat V3 (§ 9.5)");
  } else if (houle > hmax) {
    if (engage === true || houle > hmax + HOULE_MARGE) add("DANGER", "houle", `houle ${houle} m > maximum ${hmax} m${engage === true ? " (poste engagé)" : ` + ${HOULE_MARGE} m`}`, "fiche du poste, règle V2");
    else add(engage === null ? "INSUFFICIENT_DATA" : "CAUTION", "houle", `houle ${houle} m au-dessus du maximum ${hmax} m`, "fiche du poste, règle V2");
  }
  // Courant : coefficient au-delà de la limite documentée ; coefficient inconnu face à une limite documentée.
  const limDeclaree = c.coefMaxDur !== undefined && c.coefMaxDur !== null, lim = unique(c.coefMaxDur), coef = pire(c.coef);
  if (limDeclaree && lim == null) add("INSUFFICIENT_DATA", "courant", "limite de courant du poste illisible", "fiche du poste");
  else if (lim != null && coef == null) add("INSUFFICIENT_DATA", "courant", "coefficient inconnu sur un poste à limite de courant", "fiche du poste");
  else if (lim != null && coef > lim) add("DANGER", "courant", `coefficient ${coef} > ${lim}`, "fiche du poste");
  // Isolement par la marée.
  const iso = tri(c.isolement);
  if (iso === true) add("DANGER", "isolement", "le flot coupe le retour pendant le créneau", "fiche du poste (accès selon la marée)");
  else if (iso === null) add("INSUFFICIENT_DATA", "isolement", "accès selon la marée inconnu, ou contrainte de marée que rien ne situe par rapport au créneau", "contrat V3 (§ 9.5)");
  // Nuit.
  const nuit = tri(c.nuit);
  if (nuit === true && engage === true) add("DANGER", "nuit", "nuit sur un poste engagé", "règle V2 (validée)");
  else if (nuit === true && engage === null) add("INSUFFICIENT_DATA", "nuit", "nuit sur un poste dont l'engagement est inconnu", "contrat V3 (§ 9.5)");
  else if (nuit === null && engage !== false) add("INSUFFICIENT_DATA", "nuit", "heure de lever ou de coucher inconnue sur un poste engagé ou d'engagement inconnu", "contrat V3 (§ 9.5)");
  // Prudences V2 (indicateur, sans effet sur l'état) : consignes actives, poste engagé, nuit sur un poste de niveau 2.
  for (const t of c.consignesActives || []) prudences.push({ texte: `aujourd'hui : ${t}`, source: "fiche du poste" });
  if (engage === true) prudences.push({ texte: "poste engagé : jamais seul, gilet, heure de retour laissée à un proche", source: "prudence du guide (V2)" });
  if (nuit === true && niveau === 2) prudences.push({ texte: "de nuit : n'y aller qu'après un repérage de jour", source: "prudence du guide (V2)" });
  // Vigilance Météo-France : non lue par SPUMY tant que V3-011 n'est pas réalisé : rappel, jamais « aucune vigilance ».
  const etat = r.reduce((e, x) => (ETATS.indexOf(x.etat) > ETATS.indexOf(e) ? x.etat : e), "SAFE");
  const niveauAffiche = etat === "DANGER" || etat === "BLOCKED" ? "Non recommandé" : etat !== "SAFE" ? "À vérifier" : prudences.length ? "Prudence" : "Aucune alerte connue";
  return { etat, niveauAffiche, raisons: r, prudences, nonEvalues: NON_EVALUES, rappel: "Vigilance Météo-France non lue par SPUMY : consulte-la avant de partir." };
}
