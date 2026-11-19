// v8.15 — Repères de l'échelle des notes, sans dépendance à un guide (aussi utilisés par l'accueil).
// Phase 7 — Deux échelles : la note sur 10 du moteur v1 et la favorabilité sur 100 du moteur v2 (spécification v2).
// Le moteur affiché est un réglage de l'appareil, commun à tous les guides : v2 par défaut, v1 tant que la v2
// n'est pas validée par la phase 8, si tu préfères y revenir (Réglages → Moteur de notes).

/** Écart de note sous lequel deux spots, ou deux jours, sont à égalité (précision du modèle) — note sur 10. */
export const TIE_DELTA = 0.2;
/** Note à partir de laquelle un spot est « au vert » : rien ne bloque — note sur 10. */
export const GOOD_SCORE = 7;

export const ENGINE_KEY = "bar:moteur";
/** Moteur de notes choisi sur cet appareil : « v2 » (par défaut) ou « v1 ». */
export function engineMode() {
  try { return localStorage.getItem(ENGINE_KEY) === "v1" ? "v1" : "v2"; } catch { return "v2"; }
}
export function setEngineMode(v) {
  try { if (v === "v1") localStorage.setItem(ENGINE_KEY, "v1"); else localStorage.removeItem(ENGINE_KEY); return true; } catch { return false; }
}

/**
 * Échelle du moteur choisi : bornes, seuils, format du chiffre.
 *   v1 : note sur 10 (une décimale) ; « au vert » dès 7 ; égalité sous 0,2.
 *   v2 : favorabilité sur 100 (entier) ; « favorable » dès 65 (les deux paliers du haut) ; égalité sous 3 points.
 */
export const SCALES = {
  v1: { engine: "v1", max: 10, good: GOOD_SCORE, tie: TIE_DELTA, unit: "sur 10", goodWord: "au vert", fmt: (v) => (+v).toFixed(1).replace(".", ",") },
  v2: { engine: "v2", max: 100, good: 65, tie: 3, unit: "sur 100", goodWord: "favorables", fmt: (v) => String(Math.round(+v)) },
};
export const scaleOf = (engine = engineMode()) => SCALES[engine] || SCALES.v2;
/** Chiffre d'une note dans l'échelle du moteur (« 7,4 » ou « 74 ») ; « – » sans note. */
export const fmtScore = (v, engine) => (v == null || !Number.isFinite(+v) ? "–" : scaleOf(engine).fmt(v));

/**
 * Tendance d'un spot d'aujourd'hui à demain, à partir des deux notes (null : pas encore calculée ;
 * { eligible, score } sinon). Sous l'écart d'égalité de l'échelle, la note est dite stable.
 */
export function trendOf(today, tomorrow, engine) {
  if (!today?.eligible || !tomorrow) return null;
  if (!tomorrow.eligible) return { arrow: "↘", word: "en baisse", why: "demain, aucun créneau praticable" };
  if (today.score == null || tomorrow.score == null) return { arrow: "→", word: "stable" };
  const tie = scaleOf(engine).tie;
  const d = tomorrow.score - today.score;
  return d > tie + 1e-9 ? { arrow: "↗", word: "en hausse" } : d < -tie - 1e-9 ? { arrow: "↘", word: "en baisse" } : { arrow: "→", word: "stable" };
}
