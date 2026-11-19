// Lever et coucher du soleil en un point (algorithme du NOAA, comme src/core/core.js, sans dépendre d'un guide).
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
function eventUT(y, m, d, lat, lon, rising, zenith = 90.833) {
  const N = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 864e5), lngHour = lon / 15;
  const t = N + ((rising ? 6 : 18) - lngHour) / 24, M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * D2R) + 0.02 * Math.sin(2 * M * D2R) + 282.634; L = ((L % 360) + 360) % 360;
  let RA = R2D * Math.atan(0.91764 * Math.tan(L * D2R)); RA = ((RA % 360) + 360) % 360;
  RA = (RA + (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90)) / 15;
  const sinDec = 0.39782 * Math.sin(L * D2R), cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(zenith * D2R) - sinDec * Math.sin(lat * D2R)) / (cosDec * Math.cos(lat * D2R));
  if (cosH > 1 || cosH < -1) return null;
  const H = (rising ? 360 - R2D * Math.acos(cosH) : R2D * Math.acos(cosH)) / 15;
  return ((H + RA - 0.06571 * t - 6.622 - lngHour) % 24 + 24) % 24;
}
/** { rise, set } en millisecondes (UTC) pour une date ISO et un point. */
export function sunAt(dateISO, lat, lon) {
  const [y, m, d] = dateISO.split("-").map(Number), day0 = Date.UTC(y, m - 1, d);
  const r = eventUT(y, m, d, lat, lon, true), s = eventUT(y, m, d, lat, lon, false);
  return { rise: r == null ? null : day0 + r * 36e5, set: s == null ? null : day0 + (s < (r ?? 0) ? s + 24 : s) * 36e5 };
}
/** Phase de la marée à un instant : étale (une heure autour d'une pleine ou basse mer), plein courant (3e et 4e heures), établi. */
export function tidePhase(events, t) {
  if (!events?.length || !Number.isFinite(t)) return null;
  const prev = [...events].filter((e) => e.ms <= t).pop(), next = events.find((e) => e.ms > t);
  if (!prev || !next) return null;
  const H = 36e5, since = (t - prev.ms) / H, until = (next.ms - t) / H;
  if (since <= 1 || until <= 1) return "etale";
  return since >= 2 && since <= 4 ? "fort" : "etabli";
}
