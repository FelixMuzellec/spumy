// v8.14 — Où va un point modifié depuis une fiche du guide : ici, ou dans un autre guide si la fiche d'origine
// la plus proche, tous guides confondus, est ailleurs (même règle que l'ajout depuis l'accueil).
/* global __SPOT_OWNERS__, __GUIDE_META__ */
import { SITE } from "SITE_CONFIG";
import { estimateFrom, estimateMinutes, MYSPOT_MAX_KM, MYSPOTS_MAX, nearestGuideSpot, noGuideMsg, ownerOf, sanitizeMySpot } from "../engine/myspots.js";

// Index de toutes les fiches d'origine ([clé, id, lat, lon, nom]) et des guides ({clé: {id, name, lat, lon}}), écrits à la construction.
export const OWNERS = typeof __SPOT_OWNERS__ !== "undefined" ? __SPOT_OWNERS__ : null;
export const GUIDE_META = typeof __GUIDE_META__ !== "undefined" ? __GUIDE_META__ : {};
const ME = Object.keys(GUIDE_META).find((k) => GUIDE_META[k].id === SITE.id) || null;
const PORTS = Object.fromEntries(Object.entries(SITE.tide?.ports || {}).map(([k, p]) => [k, { label: p.label }]));

/** Nombre de tes spots actifs dans un autre guide (lu dans son stockage, même origine). */
export function countIn(siteId) {
  try { const v = JSON.parse(localStorage.getItem("bar:myspots:" + siteId) || "[]"); return Array.isArray(v) ? v.filter((r) => r && !r.deleted).length : 0; }
  catch { return 0; }
}

/** Contexte du formulaire pour un point donné (voir MySpotForm). */
export function guideResolver(count) {
  return (pos) => {
    const own = OWNERS && ME ? ownerOf(pos.lat, pos.lon, OWNERS) : null;
    if (own && own.km > MYSPOT_MAX_KM) return { ok: false, msg: noGuideMsg(own, GUIDE_META[own.key]?.name || own.key) };
    if (own && own.key !== ME) {
      const g = GUIDE_META[own.key];
      return {
        ok: true, move: true, key: own.key, siteId: g.id, guideName: g.name, ports: {}, defaultPort: null,
        near: { name: own.spotName, km: own.km, tidePort: null }, count: countIn(g.id), max: MYSPOTS_MAX,
        estimate: (lat, lon) => estimateFrom(g, lat, lon),
        // Le port de marée et la zone météo seront ceux de la fiche la plus proche, dans ce guide-là.
        sanitize: (r) => { const x = sanitizeMySpot({ ...r, tidePort: null }); return x && { ...x, tidePort: null }; },
      };
    }
    const n = nearestGuideSpot(pos.lat, pos.lon);
    if (!OWNERS && n && n.km > MYSPOT_MAX_KM) return { ok: false, msg: `Ce point est à ${Math.round(n.km)} km du spot le plus proche de ce guide.` };
    return {
      ok: true, move: false, key: ME, siteId: SITE.id, guideName: SITE.name, ports: PORTS, defaultPort: SITE.tide.defaultPort,
      near: n ? { name: n.spot.name, km: n.km, tidePort: n.spot.tidePort } : null, count, max: MYSPOTS_MAX,
      estimate: estimateMinutes, sanitize: sanitizeMySpot,
    };
  };
}
export const guideCenter = { lat: SITE.lat, lon: SITE.lon, zoom: 11 };
