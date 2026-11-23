// Erreur commune de SPUMY (ARCHITECTURE-V3 § 11.4) : un code stable, un message pour la personne (en français, qui dit
// quoi faire), la cause d'origine et des détails de diagnostic sans donnée personnelle (ni coordonnée précise, ni jeton,
// ni contenu du journal). Une erreur de service dégrade l'affichage ; elle ne bloque jamais l'écran.

/**
 * @typedef {"POSITION_REFUSEE" | "POSITION_INDISPONIBLE" | "POSITION_IMPRECISE"
 *   | "RESEAU_HORS_LIGNE" | "RESEAU_DELAI"
 *   | "SERVICE_ERREUR" | "SERVICE_QUOTA" | "SERVICE_REPONSE_INVALIDE"
 *   | "DONNEE_INCONNUE" | "DONNEE_PERIMEE" | "DONNEE_INVALIDE"
 *   | "STOCKAGE_PLEIN" | "STOCKAGE_INDISPONIBLE"
 *   | "VALIDATION"} CodeErreur
 */

/** Messages par défaut, pour la personne. @type {Record<CodeErreur, string>} */
export const MESSAGES = {
  POSITION_REFUSEE: "Position refusée : choisis une position à la main.",
  POSITION_INDISPONIBLE: "Position introuvable pour l'instant : réessaie ou choisis une position à la main.",
  POSITION_IMPRECISE: "Position trop imprécise : les temps de route sont des estimations.",
  RESEAU_HORS_LIGNE: "Hors ligne : les données affichées sont les dernières reçues, avec leur heure.",
  RESEAU_DELAI: "Le service met trop de temps à répondre : réessaie dans un moment.",
  SERVICE_ERREUR: "Le service ne répond pas correctement : les données concernées restent inconnues.",
  SERVICE_QUOTA: "Le service est saturé : réessaie plus tard.",
  SERVICE_REPONSE_INVALIDE: "Réponse du service inutilisable : les données concernées restent inconnues.",
  DONNEE_INCONNUE: "Donnée inconnue : la sécurité reste « à vérifier ».",
  DONNEE_PERIMEE: "Donnée trop ancienne : elle n'est plus utilisée pour la note.",
  DONNEE_INVALIDE: "Donnée invalide : elle n'est pas utilisée.",
  STOCKAGE_PLEIN: "Mémoire de l'appareil pleine : exporte ton journal, puis libère de la place.",
  STOCKAGE_INDISPONIBLE: "Mémoire de l'appareil indisponible (navigation privée ?) : rien ne sera gardé.",
  VALIDATION: "Saisie invalide.",
};

/** Clés de détails jamais gardées (données personnelles ou secrets). */
const INTERDITS = /token|jeton|secret|password|journal|notes?$/i;
/** Coordonnées gardées arrondies au centième de degré (environ 1 km). */
const COORD = /^(lat|lon|latitude|longitude)$/i;

/**
 * Détails de diagnostic expurgés : secrets et contenus personnels retirés, coordonnées arrondies.
 * @param {Record<string, unknown>} [details]
 * @returns {Record<string, unknown>}
 */
export function expurger(details = {}) {
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [k, v] of Object.entries(details)) {
    if (INTERDITS.test(k)) continue;
    out[k] = COORD.test(k) && typeof v === "number" ? Math.round(v * 100) / 100 : v;
  }
  return out;
}

export class SpumyError extends Error {
  /**
   * @param {CodeErreur} code
   * @param {{ message?: string, cause?: unknown, details?: Record<string, unknown> }} [opts]
   */
  constructor(code, opts = {}) {
    super(opts.message || MESSAGES[code] || code, opts.cause === undefined ? undefined : { cause: opts.cause });
    this.name = "SpumyError";
    /** @type {CodeErreur} */
    this.code = code;
    /** @type {Record<string, unknown>} */
    this.details = expurger(opts.details);
  }
}

/**
 * @param {unknown} e
 * @returns {e is SpumyError}
 */
export const isSpumyError = (e) => e instanceof SpumyError;

/**
 * Résultat d'une opération qui peut échouer, sans exception.
 * @template T
 * @typedef {{ ok: true, value: T } | { ok: false, error: SpumyError }} Result
 */

/**
 * @template T
 * @param {T} value
 * @returns {Result<T>}
 */
export const ok = (value) => ({ ok: true, value });

/**
 * @template T
 * @param {SpumyError} error
 * @returns {Result<T>}
 */
export const fail = (error) => ({ ok: false, error });
