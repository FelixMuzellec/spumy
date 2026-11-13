// v8.15 — Open-Meteo sans guide : adresses, variables et requête (avec délai), partagés par les guides (weather.js)
// et la pêche en bateau de l'accueil (offshore).
export const WX = {
  forecast: "https://api.open-meteo.com/v1/forecast",
  archive: "https://historical-forecast-api.open-meteo.com/v1/forecast",
  marine: "https://marine-api.open-meteo.com/v1/marine",
  // Ordre de priorité : le premier modèle qui a une valeur pour l'heure gagne.
  // Chaque modèle liste ses identifiants possibles, essayés dans l'ordre
  // (Open-Meteo renomme parfois un modèle : on ne dépend pas d'un seul nom).
  models: [
    { label: "AROME", ids: ["meteofrance_seamless"] },
    { label: "ECMWF", ids: ["ecmwf_ifs", "ecmwf_ifs025"] },
  ],
  hourly: ["pressure_msl", "cloud_cover", "precipitation", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m", "temperature_2m"],
  marineFull: ["wave_height", "wave_direction", "wave_period", "swell_wave_height", "swell_wave_period", "sea_surface_temperature"],
  marineMin: ["wave_height", "wave_direction", "wave_period"],
  timeoutMs: 20000,
  marineMaxKm: 15,     // au-delà, la maille de houle ne représente plus le spot
  sstMaxKm: 30,        // la température de surface varie lentement dans l'espace
  dayFrom: 6, dayTo: 22, // période de référence des valeurs « du jour »
};
export function omUrl(host, params) {
  const q = Object.entries(params).filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(Array.isArray(v) ? v.join(",") : v)}`).join("&");
  return `${host}?${q}`;
}
export async function omFetch(url) {
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), WX.timeoutMs) : null;
  try {
    const res = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
    if (res.status === 429) { const e = new Error("429"); e.isRateLimit = true; throw e; }
    let body = null;
    try { body = await res.json(); } catch { /* corps illisible */ }
    if (!res.ok || body?.error) {
      const e = new Error(`HTTP ${res.status}${body?.reason ? " : " + body.reason : ""}`);
      e.status = res.status; throw e;
    }
    return Array.isArray(body) ? body : [body];
  } catch (e) {
    if (e?.name === "AbortError") throw new Error(`délai dépassé (${WX.timeoutMs / 1000} s)`);
    throw e;
  } finally { if (timer) clearTimeout(timer); }
}
