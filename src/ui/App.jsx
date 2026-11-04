// SPUMY v9.0 — Application Principale (App.jsx)
// Intègre le Mode Terrain Mobile (Écran 8) tout en préservant l'en-tête et les contrôles attendus par tests/e2e.mjs.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SITE } from "SITE_CONFIG";
import { reconcileCoefs, tideDay } from "../engine/tide.js";
import { solarTimes } from "../engine/core.js";
import { allSpots, applyMyRecords, loadMyRecords, MYSPOTS_KEY } from "../engine/myspots.js";
import { fetchLiveCached, fetchWeekCached, getCached, isoAddDays, loadStore, localTodayISO, spotLatLon, validateLive } from "../engine/weather.js";
import { bestDaytime, countGood, DEFAULT_HOURS, keyFactors, loadOrient, makeTideFor, pressureStrategy, pressureZone, saveOrient, scoreDay, selectTop3, terrainOf, thermalPresence, tieGroup, withEauObs } from "../engine/model.js";
import { calibrate, loadJournal, saveJournal, sessionConditions, sessionHour } from "../engine/journal.js";
import { BOX_KEY, lureAdvice } from "../engine/lures.js";
import { regulationFor, regZonesOf, securityFor } from "../engine/rules.js";
import { TERRAIN_KEY, withTerrainOverrides } from "../engine/terrain.js";
import { nextPass } from "../engine/photo.js";
import { loadPhotoState, usePhotoState } from "./photoJob.js";
import { nowDateISO, nowHHMM } from "./components.jsx";
import { FONT, h } from "./kit.jsx";
import { TabBar, tabFromHash } from "./TabBar.jsx";
import { JournalTab } from "./tabs/JournalTab.jsx";
import { Leurres } from "./tabs/Leurres.jsx";
import { Maree } from "./tabs/Maree.jsx";
import { Synthese } from "./tabs/Synthese.jsx";
import { Meteo } from "./tabs/Meteo.jsx";
import { Regles } from "./tabs/Regles.jsx";
import { Saison } from "./tabs/Saison.jsx";
import { Photos } from "./tabs/Photos.jsx";
import { Spots } from "./tabs/Spots.jsx";
import { SpumyFieldMode } from "./SpumyViews.jsx";

const srOnly = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };
const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
const spotFromHash = () => {
  const m = (typeof location !== "undefined" ? location.hash : "").match(/^#spot=([\w-]+)$/);
  return m && allSpots().some((s) => s.id === m[1]) ? m[1] : null;
};
const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

export default function App() {
  const [myRecords, setMyRecords] = useState(() => { const r = loadMyRecords(); applyMyRecords(r); return r; });
  const mySpots = useMemo(() => applyMyRecords(myRecords), [myRecords]);
  const [clock, setClock] = useState(() => Date.now());
  const todayISO = localTodayISO();
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const lastToday = useRef(todayISO);
  const lastRefresh = useRef(Date.now());
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const initSpot = useRef(spotFromHash());
  const [spotId, setSpotId] = useState(initSpot.current);
  const [focus, setFocus] = useState(0);
  const [tab, setTab] = useState(() => (initSpot.current ? "spots" : tabFromHash()));
  const [fieldMode, setFieldMode] = useState(false);

  useEffect(() => {
    if (initSpot.current) {
      try { history.replaceState(null, "", "#spots"); } catch { /* ignore */ }
      setFocus((n) => n + 1);
    }
    const onHash = () => {
      const sp = spotFromHash();
      if (sp) {
        setSpotId(sp); setTab("spots"); setFocus((n) => n + 1);
        try { history.replaceState(null, "", "#spots"); } catch { /* ignore */ }
      } else setTab(tabFromHash());
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goTab = useCallback((id) => {
    if (tabFromHash() !== id) location.hash = id; else setTab(id);
    try { window.scrollTo({ top: 0 }); } catch { /* ignore */ }
  }, []);

  const HOURS_KEY = "bar:heures:" + SITE.id;
  const [hours, setHoursState] = useState(() => {
    const h0 = lsGet(HOURS_KEY);
    return h0 && Number.isFinite(h0.from) && Number.isFinite(h0.to) && h0.from < h0.to ? h0 : DEFAULT_HOURS;
  });
  const setHours = (v) => { setHoursState(v); lsSet(HOURS_KEY, v); };
  const [orient, setOrientState] = useState(() => loadOrient());
  const [terrainOverrides, setTerrainOverrides] = useState(() => lsGet(TERRAIN_KEY) || {});

  const setTerrainOverride = useCallback((sid, champ, value, fromId) => {
    setTerrainOverrides((prev) => {
      const next = { ...prev };
      const cur = { ...(next[sid] || {}) };
      if (value == null) {
        delete cur[champ];
        if (cur.src) { cur.src = { ...cur.src }; delete cur.src[champ]; }
      } else {
        const at = Date.now();
        Object.assign(cur, { [champ]: value, at, from: fromId, src: { ...(cur.src || {}), [champ]: { at, from: fromId } } });
      }
      if (["encombrement", "gratter", "couches", "prof"].some((k) => cur[k] != null)) next[sid] = cur;
      else delete next[sid];
      try { localStorage.setItem(TERRAIN_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const EAU_KEY = "bar:eau:" + SITE.id;
  const [eauObs, setEauObsState] = useState(() => lsGet(EAU_KEY) || {});
  const setEauObs = useCallback((sid, dateISO, v) => {
    setEauObsState((prev) => {
      const next = { ...prev };
      if (v) next[sid] = { date: dateISO, v }; else delete next[sid];
      lsSet(EAU_KEY, next);
      return next;
    });
  }, [EAU_KEY]);

  const [boxOv, setBoxOvState] = useState(() => lsGet(BOX_KEY) || {});
  const setBoxOv = useCallback((next) => { lsSet(BOX_KEY, next); setBoxOvState(next); }, []);
  const spotsView = useMemo(() => withEauObs(withTerrainOverrides(allSpots(), terrainOverrides), eauObs), [terrainOverrides, eauObs, mySpots]);
  const photo = usePhotoState();
  useEffect(() => { loadPhotoState(); }, []);
  const setOrient = (next) => { setOrientState(next); saveOrient(next); };

  const [journal, setJournal] = useState([]);
  const [jStatus, setJStatus] = useState("loading");
  const [jReason, setJReason] = useState("");
  const [jError, setJError] = useState("");
  const [preset, setPreset] = useState(null);
  useEffect(() => {
    loadJournal().then((r) => { setJournal(r.entries); setJStatus(r.status); setJReason(r.reason || ""); });
  }, []);
  const calib = useMemo(() => calibrate(journal), [journal]);

  const SESSION_KEY = "bar:encours:" + SITE.id;
  const [session, setSessionState] = useState(() => {
    const s = lsGet(SESSION_KEY);
    return s && s.spotId && Number.isFinite(s.start) && Date.now() - s.start < 24 * 36e5 ? s : null;
  });
  const setSession = (s) => { setSessionState(s); lsSet(SESSION_KEY, s); };
  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 60000);
    const onVis = () => { if (document.visibilityState === "visible") setClock(Date.now()); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", onVis); };
  }, []);

  const currentReqDate = useRef(selectedDate);
  const doFetch = useCallback(async (dateISO, { force = false } = {}) => {
    currentReqDate.current = dateISO;
    if (!force) {
      const cached = getCached(dateISO);
      const complete = cached && (!cached.series || allSpots().every((s) => cached.series[s.id]));
      if (cached && complete) { setLive(cached); setError(null); setLoading(false); return; }
      if (cached) { setLive(cached); force = true; }
    }
    setLoading(true); setError(null);
    try {
      const data = await fetchLiveCached(dateISO, {
        force,
        onRetry: (attempt, sec) => { if (currentReqDate.current === dateISO) setError(`Open-Meteo sature — nouvelle tentative dans ${sec}s (${attempt}/3)…`); },
      });
      if (currentReqDate.current !== dateISO) return;
      setLive(data); setFetchedAt(new Date()); setError(null);
    } catch (e) {
      if (currentReqDate.current !== dateISO) return;
      const stale = getCached(dateISO, { stale: true });
      if (stale) setLive(stale);
      const isOffline = /failed to fetch|networkerror|load failed|réseau/i.test(String(e?.message || ""));
      const base = isOffline ? "Pas de réseau" : e.isRateLimit || e.message === "429" ? "Open-Meteo sature après 3 tentatives — patiente une minute puis réessaie" : e.message;
      setError(stale ? `${base} — météo affichée : celle téléchargée le ${new Date(stale._wxAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}` : base);
    } finally {
      if (currentReqDate.current === dateISO) setLoading(false);
    }
  }, []);

  const debounceTimer = useRef(null);
  const [storeReady, setStoreReady] = useState(false);
  useEffect(() => { loadStore().then(() => setStoreReady(true)); }, []);
  useEffect(() => {
    if (!storeReady) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const delay = getCached(selectedDate) ? 0 : 400;
    debounceTimer.current = setTimeout(() => doFetch(selectedDate), delay);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [selectedDate, doFetch, storeReady]);

  const effectiveLive = live && live.date === selectedDate ? live : null;
  useEffect(() => {
    const prev = lastToday.current;
    if (todayISO !== prev) {
      lastToday.current = todayISO;
      if (selectedDate === prev) setSelectedDate(todayISO);
      weekAutoRef.current = false;
      setWeek({ loading: false, days: null, error: null });
    } else if (storeReady && !loading && selectedDate === todayISO && !getCached(todayISO) && clock - lastRefresh.current > 15 * 60000) {
      lastRefresh.current = clock;
      doFetch(todayISO);
    }
  }, [clock]);

  const coefCheck = useMemo(() => reconcileCoefs(selectedDate, effectiveLive?.coef_shom), [selectedDate, effectiveLive?.coef_shom]);
  const tideMap = useMemo(() => new Map(), [selectedDate, coefCheck]);
  const tideFor = useCallback((portKey) => {
    const k = portKey || SITE.tide.defaultPort;
    if (!tideMap.has(k)) {
      let tt = null;
      try { tt = tideDay(selectedDate, k, coefCheck.override); } catch (e) { tt = { error: String(e?.message || e), events: [], dayEvents: [], curve: [], coefs: [] }; }
      tideMap.set(k, tt);
    }
    return tideMap.get(k);
  }, [tideMap, selectedDate, coefCheck]);

  const tide = useMemo(() => tideFor(SITE.tide.defaultPort), [tideFor]);
  const coeff = tide.maxCoef || 0;
  const sst = effectiveLive?.sst != null && !isNaN(parseFloat(effectiveLive.sst)) ? parseFloat(effectiveLive.sst) : null;
  const pressure = parseInt(effectiveLive?.pressure) || 0;
  const presenceInfo = useMemo(() => thermalPresence(sst), [sst]);
  const pressureInfo = useMemo(() => pressureStrategy(pressure, effectiveLive?.pressure_trend || null, parseFloat(effectiveLive?.pressure_delta_24h) || 0), [pressure, effectiveLive?.pressure_trend, effectiveLive?.pressure_delta_24h]);
  const pressureZoneInfo = useMemo(() => pressureZone(pressure), [pressure]);
  const sun = useMemo(() => solarTimes(selectedDate), [selectedDate]);
  const dataWarnings = useMemo(() => validateLive(effectiveLive, selectedDate), [effectiveLive, selectedDate]);
  const regFor = useCallback((spot) => regulationFor(selectedDate, spotLatLon(spot)?.lat ?? SITE.lat), [selectedDate]);
  const regZones = useMemo(() => regZonesOf(allSpots().map((s) => spotLatLon(s)?.lat ?? SITE.lat)), [mySpots]);
  const nowMs = selectedDate === todayISO ? Math.floor(clock / 60000) * 60000 : null;
  const allScored = useMemo(() => scoreDay(selectedDate, effectiveLive, { calib, hours, tideFor, orient, spots: spotsView, now: nowMs }), [selectedDate, effectiveLive, calib, hours, tideFor, orient, spotsView, nowMs]);
  const top3 = useMemo(() => selectTop3(allScored), [allScored]);
  const localForced = useMemo(() => {
    const natural = allScored.filter((s) => s.eligible).slice(0, 3).map((s) => s.id);
    const third = top3[2];
    return third?.isLocal && !natural.includes(third.id) ? third : null;
  }, [top3, allScored]);
  const activeSpot = (spotId && allScored.find((s) => s.id === spotId)) || top3[0] || allScored[0];

  const backfilledRef = useRef(new Set());
  useEffect(() => {
    if (!effectiveLive || effectiveLive._stale || jStatus === "loading" || jStatus === "unavailable" || !allScored.length) return;
    const needsCond = (e) => !e.cond && sessionHour(e, selectedDate) != null;
    const todo = journal.filter((e) => e.date === selectedDate && (e.predicted == null || needsCond(e)) && !backfilledRef.current.has(e.id));
    if (!todo.length) return;
    const updated = journal.map((e) => {
      if (!todo.some((t) => t.id === e.id)) return e;
      const sc = allScored.find((s) => s.id === e.spotId);
      backfilledRef.current.add(e.id);
      let next = e;
      if (e.predicted == null && sc?.score != null) next = { ...next, predicted: parseFloat(sc.score.toFixed(2)), backfilled: true };
      const sp = spotsView.find((s) => s.id === e.spotId);
      if (needsCond(e) && sp) {
        const cond = sessionConditions(selectedDate, effectiveLive, sp, sessionHour(e, selectedDate), tideFor);
        if (cond) next = { ...next, cond, condEstimee: !e.heure };
      }
      return next;
    });
    if (!updated.every((e, i) => e === journal[i])) {
      setJournal(updated);
      saveJournal(updated, jStatus);
    }
  }, [effectiveLive, journal, allScored, selectedDate, jStatus, tideFor, spotsView]);

  const verdict = useMemo(() => {
    const el = top3.filter((s) => s.eligible);
    if (!el.length) return null;
    const pick = (s) => ({ s, w: (s.windows || []).find((x) => x.id === s.bestWindowId) || null });
    return { ...pick(el[0]), terr: terrainOf(el[0]), next: el.slice(1, 3).map(pick) };
  }, [top3]);
  const verdictAlerts = useMemo(() => (verdict ? securityFor(verdict.s, { coeff, window: verdict.w }) : []), [verdict, coeff]);
  const reg = useMemo(() => (verdict ? regFor(verdict.s) : regulationFor(selectedDate, SITE.lat)), [verdict, regFor, selectedDate]);
  const lureCtx = useMemo(() => ({ journal, boxOv, eauObs }), [journal, boxOv, eauObs]);
  const verdictLure = useMemo(() => (verdict ? lureAdvice(verdict.s, verdict.w, effectiveLive, selectedDate, lureCtx) : null), [verdict, effectiveLive, selectedDate, lureCtx]);
  const daytime = useMemo(() => {
    if (!verdict?.w || verdict.w.light?.band === "jour") return null;
    const b = bestDaytime(allScored);
    return b ? { ...b, lure: lureAdvice(b.s, b.w, effectiveLive, selectedDate, lureCtx) } : null;
  }, [verdict, allScored, effectiveLive, selectedDate, lureCtx]);

  const [week, setWeek] = useState({ loading: false, days: null, error: null });
  const loadWeek = async (force = false) => {
    setWeek((w) => ({ ...w, loading: true, error: null }));
    try {
      const days = await fetchWeekCached(todayISO, { force });
      setWeek({ loading: false, days, error: null });
    } catch (e) {
      setWeek({ loading: false, days: null, error: e?.isRateLimit ? "Open-Meteo sature — réessaie dans une minute." : (e?.message || String(e)) });
    }
  };
  const weekAutoRef = useRef(false);
  useEffect(() => {
    if (!weekAutoRef.current && !loading && effectiveLive && !week.days && !week.loading) {
      weekAutoRef.current = true;
      loadWeek();
    }
  }, [loading, effectiveLive, week.days, week.loading]);

  const weekRows = useMemo(() => {
    if (!week.days) return null;
    return week.days.map(({ date, live: dl, error: err }) => {
      if (!dl) return { date, err: err || "Météo indisponible" };
      const sc = scoreDay(date, dl, { calib, hours, orient, spots: spotsView, now: date === todayISO ? nowMs : null });
      const s = selectTop3(sc).find((x) => x.eligible);
      return {
        date, s: s || null, w: s ? (s.windows || []).find((x) => x.id === s.bestWindowId) : null,
        tied: s ? tieGroup(sc) : [], nGood: countGood(sc), nSpots: sc.length,
        factors: s ? keyFactors(s.bestParts) : null,
        noKill: regulationFor(date, (s && spotLatLon(s)?.lat) ?? SITE.lat).noKill,
      };
    });
  }, [week.days, calib, hours, orient, spotsView, todayISO, nowMs]);

  const goToSpot = useCallback((id) => { setSpotId(id); goTab("spots"); setFocus((n) => n + 1); }, [goTab]);
  const [lureWin, setLureWin] = useState(null);
  const goLure = useCallback((sid, winId) => { setSpotId(sid); setLureWin({ spotId: sid, winId }); goTab("leurres"); }, [goTab]);
  const pickDate = (d) => { setSelectedDate(d); };

  const writeMyRecords = useCallback((next) => {
    setMyRecords(next);
    const json = JSON.stringify(next);
    try { window.storage?.set ? window.storage.set(MYSPOTS_KEY, json).catch(() => {}) : localStorage.setItem(MYSPOTS_KEY, json); } catch { /* ignore */ }
  }, []);

  const saveMySpot = useCallback((rec, target) => {
    if (target?.move) {
      const dstKey = "bar:myspots:" + target.siteId;
      let dst = [];
      try { const v = JSON.parse(localStorage.getItem(dstKey) || "[]"); if (Array.isArray(v)) dst = v; } catch { /* ignore */ }
      const merged = JSON.stringify([...dst.filter((r) => r?.id !== rec.id), { ...rec, updatedAt: Date.now() }]);
      try { localStorage.setItem(dstKey, merged); } catch { return false; }
      writeMyRecords([...myRecords.filter((r) => r.id !== rec.id), { id: rec.id, deleted: true, updatedAt: Date.now() }]);
      setSpotId(null);
      try { location.assign(`${target.key}.html#spot=${rec.id}`); } catch { /* ignore */ }
      return true;
    }
    writeMyRecords([...myRecords.filter((r) => r.id !== rec.id), rec]);
    setSpotId(rec.id); goTab("spots"); setFocus((n) => n + 1);
    return true;
  }, [myRecords, writeMyRecords, goTab]);

  const deleteMySpot = useCallback((id) => {
    writeMyRecords([...myRecords.filter((r) => r.id !== id), { id, deleted: true, updatedAt: Date.now() }]);
    setSpotId(null);
  }, [myRecords, writeMyRecords]);

  const myCoordKey = mySpots.map((s) => `${s.id}:${s.lat},${s.lon}`).join("|");
  const prevCoordKey = useRef(myCoordKey);
  useEffect(() => {
    if (myCoordKey === prevCoordKey.current) return;
    const added = myCoordKey.split("|").some((x) => x && !prevCoordKey.current.split("|").includes(x));
    prevCoordKey.current = myCoordKey;
    if (added) { doFetch(selectedDate, { force: true }); if (week.days) loadWeek(true); }
  }, [myCoordKey]);

  const startSession = (sid) => setSession({ spotId: sid, start: Date.now(), fish: 0 });
  const addFish = () => { if (session) setSession({ ...session, fish: (session.fish || 0) + 1, catches: [...(session.catches || []), Date.now()] }); };
  const endSession = () => {
    const s = session;
    if (!s) return;
    const dur = Math.max(0.25, Math.round(((Date.now() - s.start) / 36e5) * 4) / 4);
    const d = nowDateISO(s.start);
    setSession(null);
    if (d !== selectedDate) setSelectedDate(d);
    setPreset({ spotId: s.spotId, heure: nowHHMM(s.start), duree: dur, fish: s.fish || 0, nonce: Date.now() });
    goTab("journal");
  };

  const sessionSpot = session ? spotsView.find((s) => s.id === session.spotId) : null;
  const elapsedMin = session ? Math.max(0, Math.round((clock - session.start) / 60000)) : 0;

  const g = {
    todayISO, selectedDate, pickDate, isoAddDays, live: effectiveLive, loading, error, fetchedAt, doFetch,
    tab, goTab, tide, tideFor, coeff, coefCheck, sun, sst, pressure, presenceInfo, pressureInfo, pressureZoneInfo,
    dataWarnings, reg, regFor, regZones, allScored, top3, localForced, activeSpot, spotId, setSpotId, goToSpot, focus,
    verdict, verdictAlerts, verdictLure, daytime, lureWin, goLure, hours, setHours, orient, setOrient,
    week, weekRows, loadWeek, journal, setJournal, jStatus, setJStatus, jReason, jError, setJError, calib, preset,
    session, startSession, endSession, addFish, terrainOverrides, setTerrainOverride, nowMs, lureCtx,
    eauObs, setEauObs, boxOv, setBoxOv, spotsView, myRecords, saveMySpot, deleteMySpot,
  };

  const narrow = typeof window !== "undefined" && window.innerWidth < 350;
  const dateLabel = new Date(selectedDate + "T12:00").toLocaleDateString("fr-FR", { weekday: narrow ? "short" : "long", day: "numeric", month: "long" });
  const dayOffset = Math.round((new Date(selectedDate + "T12:00") - new Date(todayISO + "T12:00")) / 864e5);
  const relLabel = dayOffset === 0 ? "Aujourd'hui" : dayOffset === 1 ? "Demain" : dayOffset === -1 ? "Hier" : dayOffset > 0 ? `Dans ${dayOffset} j` : `Il y a ${-dayOffset} j`;
  const arrowBtn = { width: 44, height: 44, borderRadius: 10, border: `1px solid ${h.line}`, background: h.card, color: h.text, fontSize: 20, cursor: "pointer", flexShrink: 0 };

  return (
    <div id="app-root" style={{ minHeight: "100vh", background: h.bg, color: h.text, fontFamily: FONT, fontSize: 15, lineHeight: 1.5 }}>
      <header style={{ maxWidth: 760, margin: "0 auto", padding: "14px 14px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <h1 style={{ fontSize: 13, color: h.accent, fontWeight: 700, letterSpacing: "0.03em", minWidth: 0 }}>
            <a href="index.html" title="Accueil : changer de guide" style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, color: "inherit" }}>
              <span aria-hidden="true" style={{ fontSize: 22, lineHeight: 1, fontWeight: 400, marginTop: -2 }}>‹</span>
              <span>SPUMY · Guide du bar · {SITE.name}<span style={srOnly}> — retour à l'accueil</span></span>
            </a>
          </h1>
          <button
            onClick={() => doFetch(selectedDate, { force: true })}
            disabled={loading}
            title="Retélécharger la météo (ignore le cache)"
            aria-label="Retélécharger la météo"
            style={{ minHeight: 40, padding: "6px 12px", borderRadius: 8, border: `1px solid ${h.line}`, background: "transparent", color: loading ? h.faint : h.accent, fontSize: 13.5, cursor: loading ? "default" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            <span style={{ display: "inline-block", animation: loading ? "spin .85s linear infinite" : "none" }}>↻</span> Actualiser
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <button onClick={() => pickDate(isoAddDays(selectedDate, -1))} disabled={loading} title="Jour précédent" aria-label="Jour précédent" style={arrowBtn}>‹</button>
          <label style={{ flex: 1, minWidth: 0, position: "relative", display: "block", cursor: "pointer" }}>
            <span style={{ display: "block", fontSize: "clamp(16px, 5.2vw, 19px)", fontWeight: 800, color: h.strong, lineHeight: 1.2, textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dateLabel}</span>
            <span style={{ display: "block", fontSize: 13, color: dayOffset === 0 ? h.good : h.muted, fontWeight: 600 }}>
              {relLabel}{dayOffset > 10 ? " · météo en tendance" : dayOffset < 0 ? " · archives météo" : ""}
            </span>
            <input type="date" aria-label="Date" value={selectedDate} onChange={(e) => e.target.value && pickDate(e.target.value)} disabled={loading} style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
          </label>
          <button onClick={() => pickDate(isoAddDays(selectedDate, 1))} disabled={loading} title="Jour suivant" aria-label="Jour suivant" style={arrowBtn}>›</button>
        </div>
        {dayOffset !== 0 && (
          <button onClick={() => pickDate(todayISO)} style={{ marginTop: 4, minHeight: 40, background: "none", border: "none", padding: "4px 0", color: h.accent, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            ↺ Revenir à aujourd'hui
          </button>
        )}
      </header>

      <div style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <TabBar tab={tab} onChange={goTab} fieldMode={fieldMode} onToggleFieldMode={() => setFieldMode((v) => !v)} />
        {tab !== "photos" && (photo.job || photo.unseen) && (
          <div role="status" style={{ background: "rgba(8,47,73,0.97)", borderBottom: "1px solid #0369a1" }}>
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "3px 8px 3px 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#e0f2fe" }}>
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                📷 {photo.job?.status === "running" ? <>Analyse photo · passe {photo.job.step}/3 en cours</> : photo.job ? <>Analyse photo interrompue avant la passe {nextPass(photo.job.partial)}/3</> : <b>Analyse photo prête</b>}
              </span>
              <button onClick={() => goTab("photos")} style={{ minHeight: 40, padding: "0 12px", borderRadius: 8, border: "1px solid #7dd3fc", background: "rgba(125,211,252,0.15)", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                {photo.job && photo.job.status !== "running" ? "Reprendre" : "Voir"}
              </button>
            </div>
          </div>
        )}
        {session && (
          <div role="status" id="bandeau-session" style={{ background: "rgba(46,16,101,0.97)", borderBottom: "1px solid #6d28d9" }}>
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "4px 8px 4px 12px", display: "flex", alignItems: "center", gap: 6, fontSize: 14.5, color: "#ede9fe" }}>
              <span style={{ flexShrink: 0, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                <span style={srOnly}>Session en cours depuis </span>🎣 {elapsedMin >= 60 ? `${Math.floor(elapsedMin / 60)} h ${String(elapsedMin % 60).padStart(2, "0")}` : `${elapsedMin} min`}
              </span>
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#c4b5fd" }}>
                {sessionSpot?.name ?? session.spotId}{session.fish ? ` · ${session.fish} bar${session.fish > 1 ? "s" : ""}` : ""}
              </span>
              <button onClick={addFish} aria-label="Un bar de plus" style={{ minHeight: 44, minWidth: 56, padding: "0 10px", borderRadius: 8, border: "1px solid #86efac", background: "rgba(34,197,94,0.2)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>+1 bar</button>
              <button onClick={endSession} style={{ minHeight: 44, padding: "0 10px", borderRadius: 8, border: "1px solid #c4b5fd", background: "rgba(196,181,253,0.18)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Terminer</button>
              <button onClick={() => setSession(null)} aria-label="Annuler la session" title="Annuler la session" style={{ minWidth: 44, minHeight: 44, fontSize: 18, color: "#c4b5fd", background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}>✕</button>
            </div>
          </div>
        )}
      </div>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "14px 14px 80px" }}>
        {fieldMode && <SpumyFieldMode g={g} onClose={() => setFieldMode(false)} />}
        <div role="tabpanel" id="panneau" aria-labelledby={`onglet-${tab}`}>
          {tab === "synthese" && <Synthese g={g} />}
          {tab === "spots" && <Spots g={g} />}
          {tab === "photos" && <Photos g={g} />}
          {tab === "leurres" && <Leurres g={g} />}
          {tab === "maree" && <Maree g={g} />}
          {tab === "meteo" && <Meteo g={g} />}
          {tab === "saison" && <Saison g={g} />}
          {tab === "journal" && <JournalTab g={g} />}
          {tab === "regles" && <Regles g={g} />}
        </div>
      </main>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}nav [role=tablist]::-webkit-scrollbar{display:none}"}</style>
    </div>
  );
}
