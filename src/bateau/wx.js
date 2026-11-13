// v8.15 — Météo et mer des spots bateau (Open-Meteo) : vent, rafales, pression, nuages, vagues, houle, eau.
// Une requête atmosphère (AROME, à défaut le choix automatique d'Open-Meteo) et une requête mer pour tous les
// spots à la fois. Sans guide : ne dépend que de wxcore.js.
import { omFetch, omUrl, WX } from "../core/wxcore.js";

export const OFF_HOURLY = ["wind_speed_10m", "wind_gusts_10m", "wind_direction_10m", "pressure_msl", "cloud_cover", "precipitation", "temperature_2m"];
export const OFF_MARINE = ["wave_height", "wave_direction", "wave_period", "swell_wave_height", "swell_wave_period", "swell_wave_direction", "sea_surface_temperature"];
const MAP_F = { wind: "wind_speed_10m", gust: "wind_gusts_10m", dir: "wind_direction_10m", pressure: "pressure_msl", cloud: "cloud_cover", precip: "precipitation", temp: "temperature_2m" };
const MAP_M = { wave: "wave_height", waveDir: "wave_direction", period: "wave_period", swell: "swell_wave_height", swellPeriod: "swell_wave_period", swellDir: "swell_wave_direction", sst: "sea_surface_temperature" };
const isoAdd = (iso, n) => { const t = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) + n)); return t.toISOString().slice(0, 10); };
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const r1 = (v) => (v == null || !Number.isFinite(v) ? null : Math.round(v * 10) / 10);

/**
 * Séries horaires de chaque point entre startISO et endISO (dates de Paris), aujourd'hui = todayISO.
 * points : [{ id, lat, lon }] ; renvoie { byId: { id: série }, model, marineOk, marineKm: { id: km } }.
 */
export async function fetchPoints(points, startISO, endISO, todayISO) {
  if (!points.length) return { byId: {}, model: null, marineOk: false };
  const lat = points.map((p) => p.lat), lon = points.map((p) => p.lon);
  const age = daysBetween(startISO, todayISO);
  const host = age > 80 ? WX.archive : WX.forecast;
  const common = { latitude: lat, longitude: lon, start_date: startISO, end_date: endISO, timeformat: "unixtime", wind_speed_unit: "kmh", timezone: "GMT" };
  // Comme les guides : AROME d'abord (fine maille, ~4 jours), ECMWF pour les heures qu'il ne couvre pas ;
  // à défaut, le choix automatique d'Open-Meteo.
  let lastErr = null;
  const runs = (await Promise.all(WX.models.map(async (m) => {
    for (const id of m.ids) {
      try { return { label: m.label, locs: await omFetch(omUrl(host, { ...common, hourly: OFF_HOURLY, models: id, cell_selection: "sea" })) }; }
      catch (e) { lastErr = e; if (e.isRateLimit) throw e; }
    }
    return null;
  }))).filter(Boolean);
  if (!runs.length) {
    try { runs.push({ label: "Open-Meteo", locs: await omFetch(omUrl(host, { ...common, hourly: OFF_HOURLY })) }); }
    catch (e) { lastErr = e; if (e.isRateLimit) throw e; }
  }
  if (!runs.length) throw lastErr || new Error("Open-Meteo n'a pas répondu");
  const model = runs.map((r) => r.label).join(" + ");
  // Une heure prend la valeur du premier modèle qui en a une.
  const locs = runs[0].locs.map((loc, i) => {
    const time = loc?.hourly?.time || [], hourly = { time };
    for (const v of OFF_HOURLY) hourly[v] = time.map((t, j) => { for (const r of runs) { const h = r.locs[i]?.hourly; const k = h?.time?.[j] === t ? j : h?.time?.indexOf(t); const x = k >= 0 ? h?.[v]?.[k] : null; if (x != null) return x; } return null; });
    return { ...loc, hourly };
  });
  // Mer : prévision jusqu'à J+7, et le passé récent ; au-delà de 80 jours, pas de vagues (dit dans la fiche de la sortie).
  let marine = null;
  const mEnd = [endISO, isoAdd(todayISO, 7)].sort()[0];
  if (age <= 80 && mEnd >= startISO) {
    for (const vars of [OFF_MARINE, ["wave_height", "wave_direction", "wave_period"]]) {
      try { marine = await omFetch(omUrl(WX.marine, { latitude: lat, longitude: lon, start_date: startISO, end_date: mEnd, timeformat: "unixtime", hourly: vars })); break; }
      catch (e) { if (e.isRateLimit) throw e; }
    }
  }
  const byId = {};
  points.forEach((p, i) => {
    const h = locs[i]?.hourly || {}, time = h.time || [];
    const ser = { time };
    for (const [k, v] of Object.entries(MAP_F)) ser[k] = time.map((_, j) => r1(h[v]?.[j]));
    const mh = marine?.[i]?.hourly, at = new Map((mh?.time || []).map((t, j) => [t, j]));
    for (const [k, v] of Object.entries(MAP_M)) ser[k] = time.map((t) => { const j = at.get(t); return j == null ? null : r1(mh[v]?.[j]); });
    const ml = marine?.[i];
    ser.marineKm = ml?.latitude != null ? Math.round(km(p, { lat: ml.latitude, lon: ml.longitude }) * 10) / 10 : null;
    byId[p.id] = ser;
  });
  return { byId, model, marineOk: !!marine };
}
function km(a, b) {
  const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
export const DIR16 = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
export const dir16 = (deg) => (deg == null || !Number.isFinite(deg) ? "?" : DIR16[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16]);
export { isoAdd };
