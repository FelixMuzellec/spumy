// Validation des réponses de la Géoplateforme IGN (ARCHITECTURE-V3 § 4 et § 5, décision de Félix du 23 nov. 2026).
// Une réponse absurde ne devient jamais un « temps vérifié » : elle est refusée (SERVICE_REPONSE_INVALIDE) et
// l'appelant passe au mode dégradé, marqué « temps estimé ». Utilisé dès maintenant par le contrat IGN de la CI,
// puis par l'adaptateur IGN (phases 9 à 12).
import { SpumyError, ok, fail } from "../errors.js";

/** France métropolitaine, avec une marge (les spots BORD y sont tous). */
export const EMPRISE = Object.freeze({ lonMin: -6, lonMax: 10, latMin: 41, latMax: 52 });
/** Bornes de cohérence d'un trajet en voiture. */
export const BORNES = Object.freeze({ minutesMax: 600, kmMax: 1500, vitesseMinKmh: 3, vitesseMaxKmh: 140 });

const DUREE = { second: 1 / 60, minute: 1, hour: 60 };
const DISTANCE = { meter: 1 / 1000, kilometer: 1 };

/**
 * @param {string} service
 * @param {string} raison
 * @param {Record<string, unknown>} [details]
 */
const invalide = (service, raison, details = {}) =>
  fail(new SpumyError("SERVICE_REPONSE_INVALIDE", { details: { service, raison, ...details } }));

/** @param {unknown} v @returns {v is number} */
const fini = (v) => typeof v === "number" && Number.isFinite(v);

/**
 * Réponse de `navigation/itineraire` → durée en minutes et distance en km.
 * @param {unknown} json
 * @returns {import("../errors.js").Result<{ minutes: number, km: number }>}
 */
export function itineraire(json) {
  if (!json || typeof json !== "object") return invalide("itineraire", "réponse vide ou non JSON");
  const j = /** @type {Record<string, unknown>} */ (json);
  const fd = DUREE[/** @type {keyof typeof DUREE} */ (String(j.timeUnit ?? "second"))];
  const fk = DISTANCE[/** @type {keyof typeof DISTANCE} */ (String(j.distanceUnit ?? "meter"))];
  if (!fd || !fk) return invalide("itineraire", "unité inconnue", { timeUnit: j.timeUnit, distanceUnit: j.distanceUnit });
  if (!fini(j.duration) || !fini(j.distance)) return invalide("itineraire", "durée ou distance absente");
  const minutes = j.duration * fd, km = j.distance * fk;
  if (minutes <= 0 || minutes > BORNES.minutesMax) return invalide("itineraire", "durée hors bornes", { minutes });
  if (km <= 0 || km > BORNES.kmMax) return invalide("itineraire", "distance hors bornes", { km });
  const vitesse = km / (minutes / 60);
  if (km >= 1 && (vitesse < BORNES.vitesseMinKmh || vitesse > BORNES.vitesseMaxKmh)) return invalide("itineraire", "vitesse moyenne incohérente", { vitesse });
  return ok({ minutes, km });
}

/**
 * Le point est-il dans un anneau (lancer de rayon) ?
 * @param {[number, number]} p [lon, lat]
 * @param {number[][]} anneau
 */
function dansAnneau(p, anneau) {
  let dedans = false;
  for (let i = 0, k = anneau.length - 1; i < anneau.length; k = i++) {
    const [xi, yi] = anneau[i], [xk, yk] = anneau[k];
    if ((yi > p[1]) !== (yk > p[1]) && p[0] < ((xk - xi) * (p[1] - yi)) / (yk - yi) + xi) dedans = !dedans;
  }
  return dedans;
}

/**
 * Le point est-il dans la zone (Polygon ou MultiPolygon GeoJSON, trous compris) ?
 * @param {{ lon: number, lat: number }} point
 * @param {{ type: string, coordinates: number[][][] | number[][][][] }} geometrie
 */
export function dansZone(point, geometrie) {
  const polys = geometrie.type === "Polygon" ? [/** @type {number[][][]} */ (geometrie.coordinates)] : /** @type {number[][][][]} */ (geometrie.coordinates);
  /** @type {[number, number]} */
  const p = [point.lon, point.lat];
  return polys.some(([ext, ...trous]) => dansAnneau(p, ext) && !trous.some((t) => dansAnneau(p, t)));
}

/**
 * Réponse de `navigation/isochrone` → géométrie vérifiée (fermée, en France, contenant le départ).
 * @param {unknown} json
 * @param {{ lon: number, lat: number }} depart
 * @returns {import("../errors.js").Result<{ type: "Polygon" | "MultiPolygon", coordinates: number[][][] | number[][][][] }>}
 */
export function isochrone(json, depart) {
  if (!json || typeof json !== "object") return invalide("isochrone", "réponse vide ou non JSON");
  const g = /** @type {{ geometry?: { type?: unknown, coordinates?: unknown } }} */ (json).geometry;
  if (!g || (g.type !== "Polygon" && g.type !== "MultiPolygon") || !Array.isArray(g.coordinates)) return invalide("isochrone", "géométrie absente ou d'un autre type", { type: g?.type });
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  for (const poly of polys) {
    if (!Array.isArray(poly) || !poly.length) return invalide("isochrone", "polygone vide");
    for (const anneau of poly) {
      if (!Array.isArray(anneau) || anneau.length < 4) return invalide("isochrone", "anneau de moins de 4 points");
      for (const pt of anneau) {
        if (!Array.isArray(pt) || !fini(pt[0]) || !fini(pt[1])) return invalide("isochrone", "point non numérique");
        if (pt[0] < EMPRISE.lonMin || pt[0] > EMPRISE.lonMax || pt[1] < EMPRISE.latMin || pt[1] > EMPRISE.latMax) return invalide("isochrone", "point hors de France métropolitaine");
      }
      const [a, z] = [anneau[0], anneau[anneau.length - 1]];
      if (a[0] !== z[0] || a[1] !== z[1]) return invalide("isochrone", "anneau non fermé");
    }
  }
  const geometrie = /** @type {{ type: "Polygon" | "MultiPolygon", coordinates: number[][][] | number[][][][] }} */ ({ type: g.type, coordinates: g.coordinates });
  if (!dansZone(depart, geometrie)) return invalide("isochrone", "la zone ne contient pas le point de départ");
  return ok(geometrie);
}

/**
 * Résultat d'un géocodage (`geocodage/search`) → premier lieu, ou erreur si rien d'utilisable.
 * @param {unknown} json
 * @returns {import("../errors.js").Result<{ label: string, lon: number, lat: number }>}
 */
export function geocodage(json) {
  const f = /** @type {{ features?: { geometry?: { coordinates?: unknown[] }, properties?: { label?: unknown } }[] }} */ (json || {}).features?.[0];
  const c = f?.geometry?.coordinates;
  if (!f || !Array.isArray(c) || !fini(c[0]) || !fini(c[1]) || typeof f.properties?.label !== "string") return invalide("geocodage", "aucun lieu utilisable");
  if (c[0] < EMPRISE.lonMin || c[0] > EMPRISE.lonMax || c[1] < EMPRISE.latMin || c[1] > EMPRISE.latMax) return invalide("geocodage", "lieu hors de France métropolitaine");
  return ok({ label: f.properties.label, lon: c[0], lat: c[1] });
}
