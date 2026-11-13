// v8.14 — Partie de « tes spots » qui ne dépend d'aucun guide : constantes du formulaire, lecture des
// coordonnées collées, et choix du guide d'un point (accueil, et guide qui modifie un spot).
// Le reste (fiche complète, port de marée, registre) vit dans myspots.js, propre à chaque guide.
export const MYSPOTS_MAX = 30;
export const MYSPOT_COLOR = "#f472b6";
const ALL = ["surface", "sous-surface", "mi-eau", "fond"], NOFOND = ["surface", "sous-surface", "mi-eau"];

export const MY_TYPES = {
  pointe:   { label: "Pointe rocheuse", type: "POINTE ROCHEUSE", houle: 2.0 },
  plage:    { label: "Plage", type: "PLAGE", houle: 2.5 },
  estuaire: { label: "Estuaire ou embouchure", type: "EMBOUCHURE", houle: 2.0 },
  digue:    { label: "Digue, jetée ou port", type: "DIGUE / PORT", houle: 2.0 },
  anse:     { label: "Anse ou plan d'eau abrité", type: "ANSE ABRITÉE", houle: 1.5, regime: "abri" },
};
export const MY_FONDS = {
  sable:   { label: "Sable", enc: 1, gratter: "oui", couches: ALL, fond: "Sable" },
  mixte:   { label: "Roche et sable", enc: 2, gratter: "texan", couches: ALL, fond: "Roche et sable" },
  roche:   { label: "Roche, goémon", enc: 3, gratter: "non", couches: NOFOND, fond: "Roche et goémon" },
  vase:    { label: "Vase", enc: 1, gratter: "oui", couches: ALL, fond: "Vase" },
  inconnu: { label: "Je ne sais pas", enc: 2, gratter: "non", couches: NOFOND, fond: "Non renseigné" },
};
export const MY_PROFS = {
  inconnu: { label: "Je ne sais pas" },
  estran:  { label: "Peu d'eau, découvre à marée basse" },
  peu:     { label: "1,5 à 4 m" },
  tombant: { label: "Profond (tombant)" },
};
export const MY_PHASES = {
  inconnu:    { label: "Je ne sais pas (règle générale)" },
  montant:    { label: "À la montante" },
  descendant: { label: "À la descendante" },
  pm:         { label: "Autour de la pleine mer" },
  bm:         { label: "Autour de la basse mer" },
};
export const MY_DANGER = { 1: "Facile", 2: "Modéré", 3: "Engagé" };
// Vers où est l'eau quand on regarde le large depuis le poste (8 directions suffisent au téléphone).
export const DIRS8 = [["N", 0], ["NE", 45], ["E", 90], ["SE", 135], ["S", 180], ["SO", 225], ["O", 270], ["NO", 315]];
export const DIR_FR = { 0: "nord", 22.5: "nord-nord-est", 45: "nord-est", 67.5: "est-nord-est", 90: "est", 112.5: "est-sud-est", 135: "sud-est", 157.5: "sud-sud-est",
  180: "sud", 202.5: "sud-sud-ouest", 225: "sud-ouest", 247.5: "ouest-sud-ouest", 270: "ouest", 292.5: "ouest-nord-ouest", 315: "nord-ouest", 337.5: "nord-nord-ouest" };

export const haversineKm = (a, b) => {
  const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
// Position d'une fiche : lat/lon, ou ses coordonnées écrites (« 49°10,5'N 1°35,4'W », fiches du Cotentin).
export const posOf = (s) => (Number.isFinite(s?.lat) && Number.isFinite(s?.lon) ? { lat: s.lat, lon: s.lon } : s?.coords ? parseUserCoords(s.coords) : null);

/** Temps de route estimé depuis un village : vol d'oiseau × 1,4, à 50 km/h (comme les fiches). */
export function estimateFrom(base, lat, lon) {
  const km = haversineKm({ lat: base.lat, lon: base.lon }, { lat, lon }) * 1.4;
  const m = Math.max(2, Math.round(km / 50 * 60));
  return m > 20 ? Math.round(m / 5) * 5 : m;
}
// Posée depuis l'accueil, un spot va dans le guide de la fiche d'origine la plus proche ; au-delà, aucun guide ne le couvre.
export const MYSPOT_MAX_KM = 60;
export const MYSPOT_WARN_KM = 25;
/**
 * Guide d'un point : celui de la fiche d'origine la plus proche, tous guides confondus.
 * index : [[clé du guide, id du spot, lat, lon, nom du spot], …] ; renvoie { key, spotId, spotName, km } ou null.
 */
export function ownerOf(lat, lon, index) {
  let best = null;
  for (const r of index || []) {
    const km = haversineKm({ lat, lon }, { lat: r[2], lon: r[3] });
    if (!best || km < best.km) best = { key: r[0], spotId: r[1], spotName: r[4], km };
  }
  return best;
}
/** Message quand aucun guide ne couvre le point (fiche d'origine la plus proche au-delà de MYSPOT_MAX_KM). */
export function noGuideMsg(own, guideName) {
  return `Aucun guide ne couvre ce point : la fiche la plus proche (${own.spotName}, guide ${guideName}) est à ${Math.round(own.km)} km. Au-delà de ${MYSPOT_MAX_KM} km d'un spot des guides, le spot n'est pas ajouté.`;
}
/**
 * Position collée par l'utilisateur : « 48.2319, -4.5708 », « 48,2319 ; -4,5708 », « 48°13,9'N 4°34,3'W »,
 * ou un lien Google Maps (…/@48.23,-4.57,15z, ?q=48.23,-4.57, !3d48.23!4d-4.57). null si rien n'est lisible.
 */
export function parseUserCoords(text) {
  const s = String(text || "").trim();
  if (!s) return null;
  const ok = (lat, lon) => (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && !(lat === 0 && lon === 0)
    ? { lat: +lat.toFixed(6), lon: +lon.toFixed(6) } : null);
  let m = s.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (m) return ok(+m[1], +m[2]);
  m = s.match(/[@=](-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/);
  if (m) return ok(+m[1], +m[2]);
  m = s.match(/(-?\d{1,2}\.\d+)\s*[,; ]\s*(-?\d{1,3}\.\d+)/);
  if (m) return ok(+m[1], +m[2]);
  m = s.match(/(-?\d{1,2},\d+)\s*[; ]\s*(-?\d{1,3},\d+)/);
  if (m) return ok(+m[1].replace(",", "."), +m[2].replace(",", "."));
  // Degrés, minutes (et secondes) : 48°13,9'N 4°34,3'W — O pour ouest accepté.
  const re = /(\d{1,3})\s*°\s*(?:(\d{1,2}(?:[.,]\d+)?)\s*['′])?\s*(?:(\d{1,2}(?:[.,]\d+)?)\s*(?:"|″|''))?\s*([NSEOW])/gi;
  const parts = [...s.matchAll(re)].map((x) => {
    const v = +x[1] + (x[2] ? +x[2].replace(",", ".") / 60 : 0) + (x[3] ? +x[3].replace(",", ".") / 3600 : 0);
    const h = x[4].toUpperCase();
    return { v: /[SWO]/.test(h) ? -v : v, axis: /[NS]/.test(h) ? "lat" : "lon" };
  });
  const la = parts.find((p) => p.axis === "lat"), lo = parts.find((p) => p.axis === "lon");
  return la && lo ? ok(la.v, lo.v) : null;
}

export function newMySpotId(now = Date.now(), rnd = Math.random) {
  return "moi-" + now.toString(36) + Math.floor(rnd() * 1296).toString(36).padStart(2, "0");
}

