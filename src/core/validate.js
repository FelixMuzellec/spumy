// Validation des entrées aux frontières (ARCHITECTURE-V3 § 11.1) : saisie de la personne, réponses des services,
// fichiers importés. Chaque fonction renvoie un `Result` : jamais d'exception, jamais de valeur devinée.
import { SpumyError, ok, fail } from "./errors.js";

/** @typedef {import("./errors.js").SpumyError} SpumyErrorT */

/**
 * @param {string} champ
 * @param {string} message
 * @param {Record<string, unknown>} [details]
 */
const invalide = (champ, message, details = {}) => new SpumyError("VALIDATION", { message, details: { champ, ...details } });

/**
 * Nombre fini dans un intervalle fermé.
 * @param {unknown} v
 * @param {number} min
 * @param {number} max
 * @param {string} champ
 * @returns {import("./errors.js").Result<number>}
 */
export function borne(v, min, max, champ) {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v.replace(",", ".")) : v;
  if (typeof n !== "number" || !Number.isFinite(n)) return fail(invalide(champ, `${champ} : un nombre est attendu.`));
  if (n < min || n > max) return fail(invalide(champ, `${champ} : entre ${min} et ${max}.`, { min, max }));
  return ok(n);
}

/**
 * Coordonnées WGS 84 en degrés décimaux (virgule ou point acceptés).
 * @param {unknown} lat
 * @param {unknown} lon
 * @returns {import("./errors.js").Result<{ lat: number, lon: number }>}
 */
export function coordonnees(lat, lon) {
  const a = borne(lat, -90, 90, "latitude");
  if (!a.ok) return a;
  const b = borne(lon, -180, 180, "longitude");
  if (!b.ok) return b;
  return ok({ lat: a.value, lon: b.value });
}

/**
 * Coefficient de marée (20 à 120, entier).
 * @param {unknown} v
 * @returns {import("./errors.js").Result<number>}
 */
export function coefficient(v) {
  const r = borne(v, 20, 120, "coefficient");
  if (!r.ok) return r;
  if (!Number.isInteger(r.value)) return fail(invalide("coefficient", "coefficient : un entier est attendu."));
  return r;
}

/**
 * Heure ISO 8601 avec fuseau (« 2026-11-23T06:00:00Z », « 2026-11-23T07:00:00+01:00 »).
 * @param {unknown} v
 * @param {string} [champ]
 * @returns {import("./errors.js").Result<string>}
 */
export function heureIso(v, champ = "heure") {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(v) || Number.isNaN(Date.parse(v))) {
    return fail(invalide(champ, `${champ} : heure ISO 8601 avec fuseau attendue.`));
  }
  return ok(v);
}

/**
 * Clé de cache d'une position, arrondie à environ 100 m (3 décimales) : la position exacte n'est jamais gardée.
 * @param {{ lat: number, lon: number }} p
 * @returns {string}
 */
export const cle100m = (p) => `${p.lat.toFixed(3)},${p.lon.toFixed(3)}`;
