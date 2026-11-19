// Phase 12 — Photos d'ambiance dans l'application (photos fournies par Félix, phase 11).
//
// Règle d'honnêteté (décision de Félix) : une photo d'ambiance n'est jamais présentée comme la photo réelle d'un spot,
// d'une prise ou d'une sortie. Elle suit la lumière, le ciel, la mer et le type de lieu du créneau ; une image
// reconnaissable (phare, port, granit…) ne va jamais sur un spot nommé ; chaque photo porte la marque « Illustration ».
// Les fichiers (assets/photos/, 720 px) ne sont pas dans le cache hors ligne : hors connexion, la miniature floue
// du catalogue (lqip) reste affichée.
import catalogue from "../../../data/photos/catalogue.json";
import { cielOf, lieuOfSpotType, lumiereOf, merOf, pickPhoto } from "../../design/ds/ambiance.js";

export const PHOTOS = catalogue.photos;
export const photoSrc = (p, size = 720) => `assets/photos/${p.id}-${size}.webp`;

const skyToCiel = (sky = "", rain) => {
  const s = String(sky).toLowerCase();
  if (/orage|storm|thunder/.test(s)) return "orage";
  if (/brume|fog|mist/.test(s)) return "brume";
  if (/pluie|rain|drizzle|shower|averse/.test(s) || (rain ?? 0) >= 1) return "pluie";
  if (/overcast|couvert|cloud|nuag/.test(s)) return "nuageux";
  return cielOf({});
};

/** Contexte d'ambiance d'un créneau sur un spot (champs du moteur : light.band, zw.sky, zw.houle, zw.wind_force). */
export function ambianceOf(spot, w) {
  const zw = w?.zw || spot?.zw || {};
  return {
    lumiere: lumiereOf(w?.light?.band || ""),
    ciel: skyToCiel(zw.sky, zw.rain),
    mer: merOf(zw.houleKnown === false ? null : zw.houle, zw.windKnown === false ? null : zw.wind_force),
    lieu: lieuOfSpotType(spot?.type || ""),
  };
}

/** Photo pour un spot nommé et un créneau (jamais une image reconnaissable). */
export function photoForSpot(spot, w, { usage = "spot", exclure = [] } = {}) {
  return pickPhoto(PHOTOS, { usage, mode: "bord", spotNomme: true, cle: spot?.id || spot?.name || "", exclure, ...ambianceOf(spot, w) });
}
