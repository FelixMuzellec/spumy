// v8.14 — Moteur d'un guide, sans interface, pour l'accueil : la note du jour de chaque spot (exactement
// comme le guide la calcule : même météo en cache, mêmes réglages de l'appareil, même journal) et l'ajout
// d'un de tes spots. Lot 3.5 : compilé une seule fois, la fiche en paramètre (makeSiteApi, scripts/build.mjs) ; l'accueil en crée une instance par guide.
/* global __SITE_KEY__ */
import { SITE } from "SITE_CONFIG";
import { calibrate, loadJournal } from "../bord/engine/journal.js";
import { DEFAULT_HOURS, loadOrient, makeTideFor, scoreDay, withEauObs } from "../bord/engine/model.js";
import { allSpots, applyMyRecords, estimateMinutes, loadMyRecords, MYSPOTS_MAX, nearestGuideSpot, sanitizeMySpot, saveMyRecords } from "../bord/engine/myspots.js";
import { TERRAIN_KEY, withTerrainOverrides } from "../bord/engine/terrain.js";
import { reconcileCoefs, tideDay } from "../core/tide.js";
import { fetchWeekCached, getCached, isoAddDays, loadStore, localTodayISO, spotLatLon } from "../bord/engine/weather.js";

const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
const PORTS = Object.fromEntries(Object.entries(SITE.tide?.ports || {}).map(([k, p]) => [k, { label: p.label }]));

/** Réglages de cet appareil pour ce guide, lus comme le guide les lit (App.jsx). */
function devicePrefs() {
  const h = lsGet("bar:heures:" + SITE.id);
  const hours = h && Number.isFinite(h.from) && Number.isFinite(h.to) && h.from < h.to ? h : DEFAULT_HOURS;
  return { hours, orient: loadOrient(), terrain: lsGet(TERRAIN_KEY) || {}, eau: lsGet("bar:eau:" + SITE.id) || {} };
}

/**
 * Notes d'une journée (aujourd'hui : offset 0 ; demain : 1) pour tous les spots du guide, les tiens compris.
 * Météo : celle du guide en cache si elle est fraîche et connaît tous les spots, sinon téléchargée (et gardée pour le guide).
 */
async function day(offset = 0, { nowMs = Date.now(), force = false } = {}) {
  await loadStore();
  applyMyRecords(loadMyRecords());
  const today = localTodayISO(), dateISO = isoAddDays(today, offset);
  let live = null, wxError = null, stale = false;
  const cached = force ? null : getCached(dateISO);
  const complete = cached && (!cached.series || allSpots().every((s) => cached.series[s.id]));
  if (cached && complete) live = cached;
  else {
    // La semaine entière, en une série de requêtes (comme la tendance du guide) : le guide s'ouvre ensuite sans rien
    // redemander, ni le jour ni la semaine, et « Demain » est déjà là.
    try {
      for (const wait of [0, 2000, 4000, 8000]) {   // Open-Meteo saturé (429) : on patiente, comme le guide
        if (wait) await new Promise((r) => setTimeout(r, wait));
        try { await fetchWeekCached(today, { force: true }); break; }
        catch (e) { if (!e?.isRateLimit || wait === 8000) throw e; }
      }
      live = getCached(dateISO);
      if (!live) throw new Error("Météo indisponible pour ce jour");
    }
    catch (e) {
      const old = getCached(dateISO, { stale: true });
      if (old) { live = old; stale = true; }
      const offline = /failed to fetch|networkerror|load failed|réseau/i.test(String(e?.message || ""));
      wxError = offline ? "Pas de réseau" : e?.isRateLimit || e?.message === "429" ? "Open-Meteo sature" : String(e?.message || e).split("\n")[0];
    }
  }
  const d = live && live.date === dateISO ? live : null;
  const p = devicePrefs();
  const journal = await loadJournal();
  const calib = calibrate(journal.entries);
  const spots = withEauObs(withTerrainOverrides(allSpots(), p.terrain), p.eau);
  const tideFor = makeTideFor(dateISO, reconcileCoefs(dateISO, d?.coef_shom).override);
  const now = offset === 0 ? Math.floor(nowMs / 6e4) * 6e4 : null;
  const scored = scoreDay(dateISO, d, { calib, hours: p.hours, tideFor, orient: p.orient, spots, now });
  return {
    key: __SITE_KEY__, siteId: SITE.id, dateISO, wxAt: d?._wxAt || null, stale, wxError, hasWx: !!d,
    spots: scored.map((s) => {
      const c = spotLatLon(s), w = (s.windows || []).find((x) => x.id === s.bestWindowId);
      return { id: s.id, name: s.name, mine: !!s.custom, lat: c?.lat ?? null, lon: c?.lon ?? null, eligible: !!s.eligible, score: s.score,
               best: w ? `${w.startFmt} → ${w.endFmt}` : null, reason: s.eligible ? (s.wxReason || "") : (s.reason || ""), danger: s.dangerLevel };
    }),
  };
}

/** Ajoute (ou remplace) une de tes fiches dans ce guide ; renvoie la fiche enregistrée ou une erreur. */
function addRecord(rec) {
  const clean = sanitizeMySpot(rec);
  if (!clean || clean.deleted) return { error: "Fiche incomplète : vérifie le nom, la position et le côté de l'eau." };
  const recs = loadMyRecords();
  const others = recs.filter((r) => r.id !== clean.id);
  if (others.filter((r) => !r.deleted).length >= MYSPOTS_MAX) return { error: `Tu as déjà ${MYSPOTS_MAX} spots dans le guide ${SITE.name}.` };
  if (!saveMyRecords([...others, clean])) return { error: "Stockage du navigateur plein ou refusé : le spot n'a pas été enregistré." };
  applyMyRecords(loadMyRecords());
  return { rec: clean };
}

const api = {
  key: __SITE_KEY__, id: SITE.id, name: SITE.name, lat: SITE.lat, lon: SITE.lon, ports: PORTS, defaultPort: SITE.tide.defaultPort, max: MYSPOTS_MAX,
  nearest(lat, lon) { const n = nearestGuideSpot(lat, lon); return n ? { name: n.spot.name, km: n.km, tidePort: n.spot.tidePort } : null; },
  estimate: estimateMinutes, sanitize: sanitizeMySpot,
  records: () => loadMyRecords(),
  count: () => loadMyRecords().filter((r) => !r.deleted).length,
  addRecord, day,
  // v8.15 — Marée d'un port du guide sur trois jours (veille, jour, lendemain), pour la pêche en bateau de l'accueil.
  tide(dateISO, port) {
    const key = port || SITE.tide.defaultPort, events = [];
    for (const d of [isoAddDays(dateISO, -1), dateISO, isoAddDays(dateISO, 1)]) {
      let t = null; try { t = tideDay(d, key); } catch { /* port indisponible ce jour-là */ }
      // Une même pleine ou basse mer revient dans les calculs de deux jours voisins (à quelques secondes près) : gardée une fois.
      for (const e of t?.events || []) if (!events.some((x) => x.type === e.type && Math.abs(x.ms - e.ms) < 3600e3)) events.push({ type: e.type, ms: e.ms, h: e.h, coef: e.coef ?? null });
    }
    return { port: key, label: SITE.tide.ports?.[key]?.label || key, events: events.sort((a, b) => a.ms - b.ms) };
  },
};
(window.BAR_SITES = window.BAR_SITES || {})[api.key] = api;
