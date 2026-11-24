// Phase 6 V3 — Confiance PROPOSÉE (référentiel § 9.1.5 ; 01-CONTRAT § 4), hors application. Six dimensions notées de 0 à
// 100 par une règle écrite ; la Confiance est la plus basse (maillon le plus faible, D6-07), la dimension limitante est
// nommée. Elle ne lit jamais la Favorabilité et n'est jamais lue par le classement. Valeurs : choix provisoires (D6-17).

export const NIVEAU_FACTEUR = { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20 };   // échelle V2 (`NIVEAU_FACTEUR`), ramenée à 100
const STATUT_POSTE = { TOP_TIER: 100, corroboree: 80, a_verifier: 50, candidate: 30 };

/** Fraîcheur et échéance de la prévision : la plus basse des deux. Âge inconnu : 0 (on ne sait pas si elle est à jour). */
export function dimDonnees({ ageHeures = null, joursAvant = null }) {
  const fini = (x) => typeof x === "number" && Number.isFinite(x) && x >= 0;
  const age = !fini(ageHeures) ? 0 : ageHeures < 6 ? 100 : ageHeures < 24 ? 50 : 0;
  // Échéance inconnue : 0, comme l'âge (on ne sait pas de quel jour parle la prévision).
  const ech = !fini(joursAvant) ? 0 : joursAvant === 0 ? 100 : joursAvant >= 3 ? 50 : Math.round(100 * (1 - joursAvant / 6));
  return Math.min(age, ech);
}
/** Couverture : part des maximums de critères connus. */
export const dimCouverture = (couverture) => Math.round(100 * Math.max(0, Math.min(1, couverture)));
/** Accord AROME contre ECMWF (règle V2) ; un seul modèle : 40, sans corroboration (V2 : 0). */
export function dimAccord({ ecartBeaufort = null, ecartSecteurs = null, force = null }) {
  if (ecartBeaufort == null) return 40;
  const fF = ecartBeaufort === 0 ? 1 : ecartBeaufort === 1 ? 0.5 : 0;
  const fD = force != null && force <= 1 ? 1 : ecartSecteurs == null ? 0 : ecartSecteurs <= 1 ? 1 : ecartSecteurs === 2 ? 0.5 : 0;
  return Math.round(100 * (fF + fD) / 2);
}
/** Preuves des règles : moyenne des niveaux des critères pondérée par leur maximum, et niveau de la présence ; la plus basse. */
export function dimPreuvesRegles(criteres, niveauPresence) {
  const tot = criteres.reduce((a, c) => a + c.max, 0);
  const moy = tot ? criteres.reduce((a, c) => a + c.max * (NIVEAU_FACTEUR[c.niveau] ?? 20), 0) / tot : 20;
  return Math.round(Math.min(moy, NIVEAU_FACTEUR[niveauPresence] ?? 20));
}
/** Preuves du poste : qualification de la fiche (phase 5) ; position non contrôlée : 40 au plus. */
export function dimPreuvesPoste({ statut, positionControlee }) {
  const v = STATUT_POSTE[statut] ?? 30;
  return positionControlee === true ? v : Math.min(v, 40);
}
/** Domaine de validité et précision : extrapolations déclarées et maille de la donnée marine. */
export function dimDomaine({ plancherAbriUtilise = false, regimeDeduit = false, eauHorsDomaine = false, eauUtilisee = false, eauMailleKm = null }) {
  let v = 100;
  if (plancherAbriUtilise) v = Math.min(v, 60);
  if (regimeDeduit) v = Math.min(v, 80);
  if (eauHorsDomaine) v = Math.min(v, 60);
  // Une eau utilisée dont la maille est inconnue compte comme une maille lointaine.
  if (eauUtilisee && !(typeof eauMailleKm === "number" && Number.isFinite(eauMailleKm) && eauMailleKm <= 15)) v = Math.min(v, 60);
  return v;
}

export const DIMENSIONS = ["donnees", "couverture", "accord", "preuvesRegles", "preuvesPoste", "domaine"];

/** dims : { donnees, couverture, accord, preuvesRegles, preuvesPoste, domaine } → { score, niveau, limitante, dims }. */
export function confiance(dims) {
  const cles = Object.keys(dims || {});
  if (cles.length !== DIMENSIONS.length || !DIMENSIONS.every((k) => typeof dims[k] === "number" && Number.isFinite(dims[k]) && dims[k] >= 0 && dims[k] <= 100)) {
    throw new Error(`les six dimensions ${DIMENSIONS.join(", ")} sont exigées, chacune de 0 à 100`);
  }
  const e = DIMENSIONS.map((k) => [k, dims[k]]);
  const [limitante, score] = e.reduce((a, b) => (b[1] < a[1] ? b : a));
  return { score, niveau: score >= 70 ? "haute" : score >= 40 ? "moyenne" : "faible", limitante, dims };
}

/** La Confiance ne peut que baisser le niveau publié : faible → plus de nombre, la classe d'affichage à la place. */
export function publier(publicationA1, niveauConfiance) {
  // Seules une Confiance « haute » ou « moyenne » gardent le nombre ; tout autre niveau, inconnu compris, le retire.
  return publicationA1 === "nombre" && !["haute", "moyenne"].includes(niveauConfiance) ? "qualitatif" : publicationA1;
}
