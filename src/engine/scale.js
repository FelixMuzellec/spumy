// SPUMY v9.0 — Repères de l'échelle des notes (/10 et /100) et calcul des 3 scores de décision :
// 1. Favorabilité Pêche (/100)
// 2. Pertinence Recommandation (/100)
// 3. Confiance (/100)
// Conserve TIE_DELTA, GOOD_SCORE et trendOf intacts pour 100 % de compatibilité avec les tests unitaires.

/** Écart de note sous lequel deux spots, ou deux jours, sont à égalité (précision du modèle). */
export const TIE_DELTA = 0.2;
/** Note à partir de laquelle un spot est « au vert » : rien ne bloque. */
export const GOOD_SCORE = 7;

/** Convertit une note /10 en score entier /100 borné [0, 100]. */
export function toScore100(score10) {
  if (score10 == null || !Number.isFinite(+score10) || +score10 <= 0) return 0;
  return Math.max(1, Math.min(100, Math.round(+score10 * 10)));
}

/** Bande visuelle d'opportunité SPUMY (Excellent / Bon / Modéré / Faible). */
export function opportunityBand(score100, eligible = true) {
  if (!eligible || !score100 || score100 <= 0) {
    return { key: "faible", label: "Conditions faibles", short: "Faible", color: "#ef4444" };
  }
  if (score100 >= 80) return { key: "excellent", label: "Conditions idéales", short: "Excellent", color: "#10b981" };
  if (score100 >= 65) return { key: "bon", label: "Bonnes conditions", short: "Bon", color: "#22c55e" };
  if (score100 >= 45) return { key: "modere", label: "Conditions modérées", short: "Modéré", color: "#f59e0b" };
  return { key: "faible", label: "Conditions faibles", short: "Faible", color: "#ef4444" };
}

/**
 * Calcule les trois scores distincts /100 de SPUMY :
 * - favorability100 : qualité halieutique intrinsèque du créneau (marée, lumière, vent, mer, présence)
 * - relevance100    : pertinence de la recommandation (favorabilité 75% + proximité 15% + sécurité 10%)
 * - confidence100   : fiabilité des données (accord AROME/ECMWF, houle connue, source terrain, journal)
 */
export function computeSpumyScores(spot, bestWin, ctx = {}) {
  if (!spot?.eligible) {
    return {
      favorability100: 0,
      relevance100: 0,
      confidence100: 50,
      band: opportunityBand(0, false),
    };
  }
  const favorability100 = toScore100(spot.score);

  const distMin = Number.isFinite(spot.distMin) ? spot.distMin : 25;
  const proxBonus = 15 * Math.exp(-distMin / 45);
  const safetyPts = spot.dangerLevel >= 3 ? 2 : spot.dangerLevel === 2 ? 6 : 10;
  const relevance100 = Math.max(1, Math.min(100, Math.round(0.75 * favorability100 + proxBonus + safetyPts)));

  const zw = bestWin?.zw || spot.zw || {};
  const spread = Number.isFinite(spot.spread) ? spot.spread : 0.8;
  const spreadF = zw.spreadF || 1;
  const modelPts = Math.max(10, 40 - Math.min(22, Math.round(spread * 9)) - (spreadF - 1) * 4);
  const houlePts = zw.houleKnown ? 15 : 5;
  const sstPts = ctx.sstConf === "mesure" || ctx.sstConf === "modele" ? 10 : 4;
  const confLevel = spot.terrain?.confidence || "inference";
  const fichePts = (confLevel === "verified" ? 16 : confLevel === "local_knowledge" ? 13 : 9)
    + (spot.orientSource ? 4 : 0);
  const nCalib = ctx.calib?.detail?.[spot.id]?.n || 0;
  const journalPts = Math.min(15, nCalib * 3);
  const confidence100 = Math.max(25, Math.min(99, Math.round(modelPts + houlePts + sstPts + fichePts + journalPts)));

  return {
    favorability100,
    relevance100,
    confidence100,
    band: opportunityBand(favorability100, true),
  };
}

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
