// v8.15 — Repères de l'échelle des notes, sans dépendance à un guide (aussi utilisés par l'accueil).
/** Écart de note sous lequel deux spots, ou deux jours, sont à égalité (précision du modèle). */
export const TIE_DELTA = 0.2;
/** Note à partir de laquelle un spot est « au vert » : rien ne bloque. */
export const GOOD_SCORE = 7;

/**
 * Tendance d'un spot d'aujourd'hui à demain, à partir des deux notes (null : pas encore calculée ;
 * { eligible, score } sinon). Sous TIE_DELTA d'écart, la note est dite stable.
 */
export function trendOf(today, tomorrow) {
  if (!today?.eligible || !tomorrow) return null;
  if (!tomorrow.eligible) return { arrow: "↘", word: "en baisse", why: "demain, aucun créneau praticable" };
  const d = tomorrow.score - today.score;
  return d > TIE_DELTA + 1e-9 ? { arrow: "↗", word: "en hausse" } : d < -TIE_DELTA - 1e-9 ? { arrow: "↘", word: "en baisse" } : { arrow: "→", word: "stable" };
}
