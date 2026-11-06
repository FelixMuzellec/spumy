// Écran principal : données du jour (calculées une fois) et navigation par onglets.
// Chaque onglet reçoit le même objet `g` ; aucun ne refait de calcul lourd.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SITE } from "SITE_CONFIG";
import { solarTimes } from "../engine/core.js";
import { calibrate, loadJournal, saveJournal, sessionConditions, sessionHour } from "../engine/journal.js";
import { lureAdvice } from "../engine/lures.js";
import { BOX_KEY } from "../engine/tackle.js";
import { bestDaytime, countGood, DEFAULT_HOURS, keyFactors, loadOrient, pressureStrategy, pressureZone, saveOrient, scoreDay, selectTop3, terrainOf, thermalPresence, tieGroup, withEauObs } from "../engine/model.js";
import { regulationFor, regZonesOf, securityFor } from "../engine/rules.js";
import { safetyOf } from "../engine/safety.js";
import { confidenceOf } from "../engine/confidence.js";
import { reconcileCoefs, tideDay } from "../engine/tide.js";
import { fetchLiveCached, fetchWeekCached, getCached, isoAddDays, loadStore, localTodayISO, spotLatLon, validateLive } from "../engine/weather.js";
import { parisHHMM, parisISO } from "./components.jsx";
import { C, FONT } from "./kit.jsx";
import { BottomNav, MoreHeader, MORE, NAV_H, pillarOf, PlusHub, tabFromHash } from "./TabBar.jsx";
import { JournalTab } from "./tabs/JournalTab.jsx";
import { Leurres } from "./tabs/Leurres.jsx";
import { Maree } from "./tabs/Maree.jsx";
import { Meteo } from "./tabs/Meteo.jsx";
import { Regles } from "./tabs/Regles.jsx";
import { Saison } from "./tabs/Saison.jsx";
import { Photos } from "./tabs/Photos.jsx";
import { loadPhotoState, usePhotoState } from "./photoJob.js";
import { nextPass, TERRAIN_KEY, withTerrainOverrides } from "../engine/photo.js";
import { allSpots, applyMyRecords, loadMyRecords, MYSPOTS_KEY } from "../engine/myspots.js";
import { Spots } from "./tabs/Spots.jsx";
import { Synthese } from "./tabs/Synthese.jsx";

// Texte lu par les lecteurs d'écran, invisible à l'écran.
const SR = { position:"absolute", width:1, height:1, padding:0, margin:-1, overflow:"hidden", clip:"rect(0 0 0 0)", whiteSpace:"nowrap", border:0 };
const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
// v8.9 — Lien direct vers une fiche (recherche de l'accueil) : guide.html#spot=<id>.
const spotFromHash = () => {
  const m = (typeof location !== "undefined" ? location.hash : "").match(/^#spot=([\w-]+)$/);
  return m && allSpots().some((s) => s.id === m[1]) ? m[1] : null;
};
const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage refusé : sans effet */ } };

// v9.1 — Clé du guide (logonna, pirou…) : icône de l'en-tête. Absente des constructions de test.
/* global __SITE_KEY__ */
const SITE_KEY = typeof __SITE_KEY__ !== "undefined" ? __SITE_KEY__ : null;

export default function FishingGuide() {
  // v8.11 — Tes spots (ajoutés sur le téléphone) : lus avant tout le reste, pour que le moteur (météo, classement,
  // lien #spot=…) les voie dès le premier rendu.
  const [myRecords, setMyRecords] = useState(() => { const r = loadMyRecords(); applyMyRecords(r); return r; });
  const myBuilt = useMemo(() => applyMyRecords(myRecords), [myRecords]);
  // v8.9 — L'heure compte : un créneau fini n'est plus proposé, et l'application passe d'elle-même
  // au jour suivant si elle reste ouverte la nuit (ou se rouvre le lendemain).
  const [nowMs, setNowMs] = useState(() => Date.now());
  const todayISO = localTodayISO();
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const lastToday = useRef(todayISO), lastAuto = useRef(Date.now());
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const linked = useRef(spotFromHash());
  const [spotId, setSpotId] = useState(linked.current);
  const [focus, setFocus] = useState(0);   // incrémenté pour faire défiler jusqu'à la fiche du spot

  // ── Onglet courant, inscrit dans l'adresse ──
  const [tab, setTabState] = useState(() => (linked.current ? "spots" : tabFromHash()));
  useEffect(() => {
    // Arrivée par un lien #spot=… : onglet Spots, fiche du spot ; l'adresse redevient #spots
    // (le bouton « retour » ramène à l'accueil, pas à une fiche figée).
    if (linked.current) { try { history.replaceState(null, "", "#spots"); } catch { /* sans effet */ } setFocus((x) => x + 1); }
    const f = () => {
      const id = spotFromHash();
      if (id) { setSpotId(id); setTabState("spots"); setFocus((x) => x + 1); try { history.replaceState(null, "", "#spots"); } catch { /* sans effet */ } }
      else setTabState(tabFromHash());
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const goTab = useCallback((k) => {
    if (tabFromHash() !== k) location.hash = k; else setTabState(k);
    try { window.scrollTo({ top: 0 }); } catch { /* sans effet */ }
  }, []);

  // ── Réglages de cet appareil ──
  const hoursKey = "bar:heures:" + SITE.id;
  const [hours, setHoursState] = useState(() => {
    const v = lsGet(hoursKey);
    return v && Number.isFinite(v.from) && Number.isFinite(v.to) && v.from < v.to ? v : DEFAULT_HOURS;
  });
  const setHours = (h) => { setHoursState(h); lsSet(hoursKey, h); };
  const [orient, setOrientState] = useState(() => loadOrient());
  // Corrections de terrain validées dans l'onglet Photos : appliquées aux fiches dès l'ouverture.
  const [terrainOverrides, setTerrainOv] = useState(() => lsGet(TERRAIN_KEY) || {});
  const setTerrainOverride = useCallback((spotId, champ, value, from) => {
    setTerrainOv((prev) => {
      const all = { ...prev }, cur = { ...(all[spotId] || {}) };
      // Origine gardée champ par champ (src) : deux analyses, ou une analyse puis ta profondeur, ne se confondent pas.
      if (value == null) { delete cur[champ]; if (cur.src) { cur.src = { ...cur.src }; delete cur.src[champ]; } }
      else { const at = Date.now(); Object.assign(cur, { [champ]: value, at, from, src: { ...(cur.src || {}), [champ]: { at, from } } }); }
      if (!["encombrement", "gratter", "couches", "prof"].some((k) => cur[k] != null)) delete all[spotId]; else all[spotId] = cur;
      try { localStorage.setItem(TERRAIN_KEY, JSON.stringify(all)); } catch { /* stockage refusé */ }
      return all;
    });
  }, []);
  // Eau observée sur place, spot par spot, pour la journée : elle remplace l'estimation.
  const eauKey = "bar:eau:" + SITE.id;
  const [eauObs, setEauObsState] = useState(() => lsGet(eauKey) || {});
  const setEauObs = useCallback((spotId, date, v) => {
    setEauObsState((prev) => {
      const all = { ...prev };
      if (v) all[spotId] = { date, v }; else delete all[spotId];
      lsSet(eauKey, all);
      return all;
    });
  }, [eauKey]);
  // Ta boîte corrigée dans l'application (poids pesés, balsa, bavettes) : commune à tous les guides.
  const [boxOv, setBoxOvState] = useState(() => lsGet(BOX_KEY) || {});
  const setBoxOv = useCallback((v) => { lsSet(BOX_KEY, v); setBoxOvState(v); }, []);
  // Les fiches telles que tu les as corrigées : de nouveaux objets, les fiches d'origine ne changent jamais.
  const spotsView = useMemo(() => withEauObs(withTerrainOverrides(allSpots(), terrainOverrides), eauObs), [terrainOverrides, eauObs, myBuilt]);   // eslint-disable-line react-hooks/exhaustive-deps
  // Analyse photo : elle vit hors de l'onglet ; l'en-tête la signale depuis les autres onglets.
  const ph = usePhotoState();
  useEffect(() => { loadPhotoState(); }, []);
  const setOrient = (o) => { setOrientState(o); saveOrient(o); };

  // ── Journal ──
  const [journal, setJournal] = useState([]);
  const [jStatus, setJStatus] = useState("loading");   // loading|ok|empty|unavailable
  const [jReason, setJReason] = useState("");
  const [jError, setJError] = useState("");
  const [preset, setPreset] = useState(null);
  useEffect(() => { loadJournal().then((r) => { setJournal(r.entries); setJStatus(r.status); setJReason(r.reason || ""); }); }, []);
  const calib = useMemo(() => calibrate(journal), [journal]);

  // ── Session en cours (« Je pêche ici maintenant ») ──
  const sessKey = "bar:encours:" + SITE.id;
  const [session, setSessionState] = useState(() => {
    const v = lsGet(sessKey);
    return v && v.spotId && Number.isFinite(v.start) && Date.now() - v.start < 24 * 36e5 ? v : null;
  });
  const setSession = (v) => { setSessionState(v); lsSet(sessKey, v); };
  // Horloge : une minute de résolution suffit (fin des créneaux, chrono de session, changement de jour).
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 60000);
    const vis = () => { if (document.visibilityState === "visible") setNowMs(Date.now()); };
    document.addEventListener("visibilitychange", vis); window.addEventListener("focus", vis);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", vis); window.removeEventListener("focus", vis); };
  }, []);

  // ── Météo ──
  // v8.9 — Seule la réponse du jour demandé en dernier est retenue : revenir à aujourd'hui pendant
  // un téléchargement lent d'un autre jour ne fait plus disparaître le verdict.
  const wantDate = useRef(selectedDate);
  const doFetch = useCallback(async (dateISO, { force = false } = {}) => {
    wantDate.current = dateISO;
    if (!force) {
      const cached = getCached(dateISO);
      // v8.11 : une météo en cache qui ne connaît pas un de tes spots (ajouté depuis) est redemandée.
      // v8.14 : vraiment redemandée (le cache encore frais était rendu tel quel), cas d'un spot arrivé d'un autre guide.
      const complete = cached && (!cached.series || allSpots().every((s) => cached.series[s.id]));
      if (cached && complete) { setLive(cached); setError(null); setLoading(false); return; }
      if (cached) { setLive(cached); force = true; }
    }
    setLoading(true); setError(null);
    try {
      const data = await fetchLiveCached(dateISO, { force, onRetry: (attempt, seconds) => { if (wantDate.current === dateISO) setError(`Open-Meteo sature — nouvelle tentative dans ${seconds}s (${attempt}/3)…`); } });
      if (wantDate.current !== dateISO) return;
      setLive(data); setFetchedAt(new Date()); setError(null);
    } catch (e) {
      if (wantDate.current !== dateISO) return;
      // Sans réseau : la dernière météo téléchargée pour ce jour reste affichée, avec sa date.
      const old = getCached(dateISO, { stale: true });
      if (old) setLive(old);
      const offline = /failed to fetch|networkerror|load failed|réseau/i.test(String(e?.message || ""));
      const msg = offline ? "Pas de réseau" : e.isRateLimit || e.message === "429" ? "Open-Meteo sature après 3 tentatives — patiente une minute puis réessaie" : e.message;
      setError(old ? `${msg} — météo affichée : celle téléchargée le ${new Date(old._wxAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}` : msg);
    } finally { if (wantDate.current === dateISO) setLoading(false); }
  }, []);
  const debounceRef = useRef(null);
  const [storeReady, setStoreReady] = useState(false);
  useEffect(() => { loadStore().then(() => setStoreReady(true)); }, []);
  useEffect(() => {
    if (!storeReady) return undefined;   // ne pas partir en requête avant d'avoir lu le cache
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doFetch(selectedDate), getCached(selectedDate) ? 0 : 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [selectedDate, doFetch, storeReady]);
  // Jamais la météo d'un autre jour : pendant un téléchargement ou après un échec, rien plutôt que faux.
  const d = live && live.date === selectedDate ? live : null;
  // Changement de jour (application restée ouverte, ou rouverte le lendemain) : on suit aujourd'hui, et la météo
  // trop ancienne est redemandée au retour sur l'application.
  useEffect(() => {
    const prev = lastToday.current;
    if (todayISO !== prev) {
      lastToday.current = todayISO;
      if (selectedDate === prev) setSelectedDate(todayISO);
      weekAuto.current = false; setWeek({ loading: false, days: null, error: null });
    } else if (storeReady && !loading && selectedDate === todayISO && !getCached(todayISO) && nowMs - lastAuto.current > 15 * 6e4) {
      lastAuto.current = nowMs; doFetch(todayISO);
    }
  }, [nowMs]);   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Marée calculée localement (sans réseau) ──
  const coefCheck = useMemo(() => reconcileCoefs(selectedDate, d?.coef_shom), [selectedDate, d?.coef_shom]);
  const tideCache = useMemo(() => new Map(), [selectedDate, coefCheck]);   // eslint-disable-line react-hooks/exhaustive-deps
  const tideFor = useCallback((port) => {
    const key = port || SITE.tide.defaultPort;
    if (!tideCache.has(key)) {
      let t = null;
      try { t = tideDay(selectedDate, key, coefCheck.override); } catch (e) { t = { error: String(e?.message || e), events: [], dayEvents: [], curve: [], coefs: [] }; }
      tideCache.set(key, t);
    }
    return tideCache.get(key);
  }, [tideCache, selectedDate, coefCheck]);
  const tide = useMemo(() => tideFor(SITE.tide.defaultPort), [tideFor]);
  const coeff = tide.maxCoef || 0;

  const sst = d?.sst != null && !isNaN(parseFloat(d.sst)) ? parseFloat(d.sst) : null;
  const pressure = parseInt(d?.pressure) || 0;
  const presenceInfo = useMemo(() => thermalPresence(sst), [sst]);
  const pressureInfo = useMemo(() => pressureStrategy(pressure, d?.pressure_trend || null, parseFloat(d?.pressure_delta_24h) || 0), [pressure, d?.pressure_trend, d?.pressure_delta_24h]);
  const pressureZoneInfo = useMemo(() => pressureZone(pressure), [pressure]);
  const sun = useMemo(() => solarTimes(selectedDate), [selectedDate]);
  const dataWarnings = useMemo(() => validateLive(d, selectedDate), [d, selectedDate]);
  // Réglementation : celle du spot (nord ou sud du 48e parallèle) ; un site peut couvrir les deux.
  const regFor = useCallback((spot) => regulationFor(selectedDate, spotLatLon(spot)?.lat ?? SITE.lat), [selectedDate]);
  const regZones = useMemo(() => regZonesOf(allSpots().map((s) => spotLatLon(s)?.lat ?? SITE.lat)), [myBuilt]);   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Classement : chaque spot noté sur la météo de ses coordonnées et sa meilleure fenêtre ──
  // Aujourd'hui : l'heure courante, arrondie à la minute, écarte les créneaux déjà finis.
  const nowForDay = selectedDate === todayISO ? Math.floor(nowMs / 6e4) * 6e4 : null;
  const allScored = useMemo(() => scoreDay(selectedDate, d, { calib, hours, tideFor, orient, spots: spotsView, now: nowForDay }), [selectedDate, d, calib, hours, tideFor, orient, spotsView, nowForDay]);
  const top3 = useMemo(() => selectTop3(allScored), [allScored]);
  const localForced = useMemo(() => {
    const pure3ids = allScored.filter((s) => s.eligible).slice(0, 3).map((s) => s.id);
    const slot3 = top3[2];
    return slot3?.isLocal && !pure3ids.includes(slot3.id) ? slot3 : null;
  }, [top3, allScored]);
  const activeSpot = (spotId && allScored.find((s) => s.id === spotId)) || top3[0] || allScored[0];

  // Une session archivée sans score prédit est complétée dès que sa date est ouverte.
  const backfilled = useRef(new Set());
  useEffect(() => {
    // Une prévision ancienne (sans réseau) ne sert pas à archiver les conditions d'une session.
    if (!d || d._stale || jStatus === "loading" || jStatus === "unavailable" || !allScored.length) return;
    const needCond = (e) => !e.cond && sessionHour(e, selectedDate) != null;
    const todo = journal.filter((e) => e.date === selectedDate && (e.predicted == null || needCond(e)) && !backfilled.current.has(e.id));
    if (!todo.length) return;
    const next = journal.map((e) => {
      if (!todo.some((x) => x.id === e.id)) return e;
      const sc = allScored.find((s) => s.id === e.spotId);
      backfilled.current.add(e.id);
      let out = e;
      if (e.predicted == null && sc?.score != null) out = { ...out, predicted: parseFloat(sc.score.toFixed(2)), backfilled: true };
      const sp = spotsView.find((s) => s.id === e.spotId);
      if (needCond(e) && sp) { const c = sessionConditions(selectedDate, d, sp, sessionHour(e, selectedDate), tideFor); if (c) out = { ...out, cond: c, condEstimee: !e.heure }; }
      return out;
    });
    if (next.every((e, i) => e === journal[i])) return;
    setJournal(next);
    saveJournal(next, jStatus);
  }, [d, journal, allScored, selectedDate, jStatus, tideFor, spotsView]);

  // ── Verdict : le meilleur spot, SON créneau, ses consignes, SON leurre ──
  const verdict = useMemo(() => {
    const ok = top3.filter((s) => s.eligible);
    if (!ok.length) return null;
    const pack = (s) => ({ s, w: (s.windows || []).find((w) => w.id === s.bestWindowId) || null });
    return { ...pack(ok[0]), terr: terrainOf(ok[0]), next: ok.slice(1, 3).map(pack) };
  }, [top3]);
  const verdictAlerts = useMemo(() => (verdict ? securityFor(verdict.s, { coeff, window: verdict.w }) : []), [verdict, coeff]);
  // v9.1 — Mode terrain (Synthèse en gros caractères) : réglage de l'appareil, commun à tous les guides.
  const [fieldMode, setFieldModeState] = useState(() => { try { return localStorage.getItem("bar:terrain-mode") === "1"; } catch { return false; } });
  const setFieldMode = (v) => { setFieldModeState(!!v); try { v ? localStorage.setItem("bar:terrain-mode", "1") : localStorage.removeItem("bar:terrain-mode"); } catch { /* session seulement */ } };
  // v9.1 — Sécurité et confiance du conseil : deux indicateurs à part de la note (engine/safety.js, engine/confidence.js).
  const dayOff = Math.round((new Date(selectedDate + "T12:00") - new Date(todayISO + "T12:00")) / 86400000);
  const verdictSafety = useMemo(() => (verdict ? safetyOf(verdict.s, verdict.w, { alerts: verdictAlerts, degraded: !d }) : null), [verdict, verdictAlerts, d]);
  const verdictConf = useMemo(() => (verdict ? confidenceOf(verdict.s, verdict.w, { live: d, dayOffset: dayOff, calib, now: nowMs }) : null), [verdict, d, dayOff, calib, nowMs]);
  // Règles affichées en tête : celles du spot recommandé (à défaut, celles du site).
  const reg = useMemo(() => (verdict ? regFor(verdict.s) : regulationFor(selectedDate, SITE.lat)), [verdict, regFor, selectedDate]);
  // Contexte du conseil leurres : ton journal (ce qui t'a fait prendre du poisson) ; la boîte et l'eau observée sont déjà appliquées.
  const lureCtx = useMemo(() => ({ journal, boxOv, eauObs }), [journal, boxOv, eauObs]);
  const verdictLure = useMemo(() => (verdict ? lureAdvice(verdict.s, verdict.w, d, selectedDate, lureCtx) : null), [verdict, d, selectedDate, lureCtx]);
  // Le verdict tombe presque toujours à l'aube, au crépuscule ou de nuit (la lumière
  // départage les créneaux de marée d'un spot) : on montre aussi le meilleur créneau de plein jour.
  const daytime = useMemo(() => {
    if (!verdict?.w || verdict.w.light?.band === "jour") return null;
    const b = bestDaytime(allScored);
    return b ? { ...b, lure: lureAdvice(b.s, b.w, d, selectedDate, lureCtx) } : null;
  }, [verdict, allScored, d, selectedDate, lureCtx]);

  // ── Semaine ──
  const [week, setWeek] = useState({ loading: false, days: null, error: null });
  const loadWeek = async (force = false) => {
    setWeek((w) => ({ ...w, loading: true, error: null }));
    try { const days = await fetchWeekCached(todayISO, { force }); setWeek({ loading: false, days, error: null }); }
    catch (e) { setWeek({ loading: false, days: null, error: e?.isRateLimit ? "Open-Meteo sature — réessaie dans une minute." : (e?.message || String(e)) }); }
  };
  // La tendance de la semaine est en tête de la synthèse : chargée d'office, une fois, dès que la
  // météo du jour est arrivée (les deux téléchargements ne partent pas en même temps).
  const weekAuto = useRef(false);
  useEffect(() => {
    if (weekAuto.current || loading || !d || week.days || week.loading) return;
    weekAuto.current = true;
    loadWeek();
  }, [loading, d, week.days, week.loading]);   // eslint-disable-line react-hooks/exhaustive-deps
  const weekRows = useMemo(() => (week.days ? week.days.map(({ date, live: lv, error: err }) => {
    if (!lv) return { date, err: err || "Météo indisponible" };
    const all = scoreDay(date, lv, { calib, hours, orient, spots: spotsView, now: date === todayISO ? nowForDay : null });
    const best = selectTop3(all).find((s) => s.eligible);
    return { date, s: best || null, w: best ? (best.windows || []).find((x) => x.id === best.bestWindowId) : null, tied: best ? tieGroup(all) : [],
             nGood: countGood(all), nSpots: all.length, factors: best ? keyFactors(best.bestParts) : null,
             noKill: regulationFor(date, (best && spotLatLon(best)?.lat) ?? SITE.lat).noKill };
  }) : null), [week.days, calib, hours, orient, spotsView, todayISO, nowForDay]);

  // ── Navigation vers un spot ──
  const goToSpot = useCallback((id) => { setSpotId(id); goTab("spots"); setFocus((x) => x + 1); }, [goTab]);
  // Ouvre l'onglet Leurres sur un spot et un créneau précis.
  const [lureWin, setLureWin] = useState(null);
  const goLure = useCallback((id, winId) => { setSpotId(id); setLureWin({ spotId: id, winId }); goTab("leurres"); }, [goTab]);
  const pickDate = (date) => { setSelectedDate(date); };

  // ── Tes spots : ajout, modification, suppression (une suppression reste notée, pour la sauvegarde GitHub) ──
  const writeMy = useCallback((next) => {
    setMyRecords(next);
    const json = JSON.stringify(next);
    try { if (window.storage?.set) window.storage.set(MYSPOTS_KEY, json).catch(() => {}); else localStorage.setItem(MYSPOTS_KEY, json); } catch { /* stockage plein : gardé pour la session */ }
  }, []);
  const saveMySpot = useCallback((rec, ctx) => {
    if (ctx?.move) {
      // v8.14 — Le point relève d'un autre guide : la fiche y est écrite, une suppression est notée ici, et on y va.
      const key = "bar:myspots:" + ctx.siteId;
      let theirs = [];
      try { const v = JSON.parse(localStorage.getItem(key) || "[]"); if (Array.isArray(v)) theirs = v; } catch { /* illisible : remplacé */ }
      const json = JSON.stringify([...theirs.filter((r) => r?.id !== rec.id), { ...rec, updatedAt: Date.now() }]);
      try { localStorage.setItem(key, json); } catch { return false; }
      writeMy([...myRecords.filter((r) => r.id !== rec.id), { id: rec.id, deleted: true, updatedAt: Date.now() }]);
      setSpotId(null);
      try { location.assign(`${ctx.key}.html#spot=${rec.id}`); } catch { /* navigation refusée */ }
      return true;
    }
    writeMy([...myRecords.filter((r) => r.id !== rec.id), rec]); setSpotId(rec.id); goTab("spots"); setFocus((x) => x + 1);
    return true;
  }, [myRecords, writeMy, goTab]);
  const deleteMySpot = useCallback((id) => { writeMy([...myRecords.filter((r) => r.id !== id), { id, deleted: true, updatedAt: Date.now() }]); setSpotId(null); }, [myRecords, writeMy]);
  // Un spot ajouté ou déplacé : sa météo est demandée tout de suite (le jour et la semaine).
  const mySig = myBuilt.map((s) => `${s.id}:${s.lat},${s.lon}`).join("|");
  const lastSig = useRef(mySig);
  useEffect(() => {
    if (mySig === lastSig.current) return;
    const added = mySig.split("|").some((x) => x && !lastSig.current.split("|").includes(x));
    lastSig.current = mySig;
    if (!added) return;
    doFetch(selectedDate, { force: true });
    if (week.days) loadWeek(true);
  }, [mySig]);   // eslint-disable-line react-hooks/exhaustive-deps

  const startSession = (id) => setSession({ spotId: id, start: Date.now(), fish: 0 });
  // Un bar pris : un appui, l'heure est gardée (la session garde le compte jusqu'au journal).
  const addFish = () => { if (session) setSession({ ...session, fish: (session.fish || 0) + 1, catches: [...(session.catches || []), Date.now()] }); };
  const endSession = () => {
    const s = session; if (!s) return;
    const duree = Math.max(0.25, Math.round((Date.now() - s.start) / 36e5 * 4) / 4);
    const date = parisISO(s.start);
    setSession(null);
    if (date !== selectedDate) setSelectedDate(date);
    setPreset({ spotId: s.spotId, heure: parisHHMM(s.start), duree, fish: s.fish || 0, nonce: Date.now() });
    goTab("journal");
  };
  const sessSpot = session ? spotsView.find((s) => s.id === session.spotId) : null;
  const elapsed = session ? Math.max(0, Math.round((nowMs - session.start) / 60000)) : 0;

  const g = {
    todayISO, selectedDate, pickDate, isoAddDays, live: d, loading, error, fetchedAt, doFetch, tab, goTab,
    tide, tideFor, coeff, coefCheck, sun, sst, pressure, presenceInfo, pressureInfo, pressureZoneInfo, dataWarnings, reg, regFor, regZones,
    allScored, top3, localForced, activeSpot, spotId, setSpotId, goToSpot, focus, verdict, verdictAlerts, verdictSafety, verdictConf, fieldMode, setFieldMode, verdictLure, daytime, lureWin, goLure,
    hours, setHours, orient, setOrient, week, weekRows, loadWeek,
    journal, setJournal, jStatus, setJStatus, jReason, jError, setJError, calib, preset,
    session, startSession, endSession, addFish, terrainOverrides, setTerrainOverride, nowMs: nowForDay,
    lureCtx, eauObs, setEauObs, boxOv, setBoxOv, spotsView, myRecords, saveMySpot, deleteMySpot,
  };

  // Très petit écran (< 350 px) : jour de la semaine abrégé, pour que la date tienne sur une ligne.
  const narrow = typeof window !== "undefined" && window.innerWidth < 350;
  const dateLabel = new Date(selectedDate + "T12:00").toLocaleDateString("fr-FR", { weekday: narrow ? "short" : "long", day: "numeric", month: "long" });
  const daysOffset = Math.round((new Date(selectedDate + "T12:00") - new Date(todayISO + "T12:00")) / 86400000);
  const rel = daysOffset === 0 ? "Aujourd'hui" : daysOffset === 1 ? "Demain" : daysOffset === -1 ? "Hier" : daysOffset > 0 ? `Dans ${daysOffset} j` : `Il y a ${-daysOffset} j`;
  const arrowBtn = { width:44, height:44, borderRadius:10, border:`1px solid ${C.line}`, background:C.card, color:C.text, fontSize:20, cursor:"pointer", flexShrink:0 };

  return (
    <div id="app-root" style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:FONT,fontSize:15,lineHeight:1.5}}>
      {/* EN-TÊTE : lieu et date, communs à tous les onglets */}
      <header style={{maxWidth:760,margin:"0 auto",padding:"calc(12px + env(safe-area-inset-top)) 14px 6px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
          {/* Le titre ramène à l'accueil (choix du guide) : indispensable dans l'application installée, sans barre d'adresse. */}
          <h1 style={{fontSize:14,color:C.accent,fontWeight:700,minWidth:0}}>
            <a href="index.html" title="Accueil : changer de guide" style={{display:"inline-flex",alignItems:"center",gap:8,minHeight:44,color:"inherit"}}>
              <span aria-hidden="true" style={{fontSize:22,lineHeight:1,fontWeight:400,marginTop:-2}}>‹</span>
              {SITE_KEY && <img src={`${SITE_KEY}.png`} width={30} height={30} alt="" style={{borderRadius:8,flexShrink:0}}/>}
              <span style={{display:"flex",flexDirection:"column",minWidth:0,lineHeight:1.15}}>
                <b style={{fontSize:11.5,fontWeight:800,letterSpacing:"0.18em",color:C.accent}}>SPUMY</b><span style={SR}> · </span>
                <span style={{fontSize:16,fontWeight:800,color:C.strong,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{SITE.name}</span>
                <span style={SR}> — retour à l'accueil</span>
              </span>
            </a>
          </h1>
          <button onClick={() => doFetch(selectedDate, { force: true })} disabled={loading} title="Retélécharger la météo (ignore le cache)" aria-label="Retélécharger la météo"
            style={{minHeight:40,minWidth:44,padding:"6px 12px",borderRadius:8,border:`1px solid ${C.line}`,background:"transparent",color:loading ? C.faint : C.accent,fontSize:13.5,cursor:loading ? "default" : "pointer",whiteSpace:"nowrap",flexShrink:0}}>
            <span style={{display:"inline-block",animation:loading ? "spin .85s linear infinite" : "none"}}>↻</span><span className="lbl-refresh"> Actualiser</span>
          </button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
          <button onClick={() => pickDate(isoAddDays(selectedDate, -1))} disabled={loading} title="Jour précédent" aria-label="Jour précédent" style={arrowBtn}>‹</button>
          <label style={{flex:1,minWidth:0,position:"relative",display:"block",cursor:"pointer"}}>
            <span style={{display:"block",fontSize:"clamp(16px, 5.2vw, 19px)",fontWeight:800,color:C.strong,lineHeight:1.2,textTransform:"capitalize",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{dateLabel}</span>
            <span style={{display:"block",fontSize:13,color:daysOffset === 0 ? C.good : C.muted,fontWeight:600}}>{rel}{daysOffset > 10 ? " · météo en tendance" : daysOffset < 0 ? " · archives météo" : ""}</span>
            <input type="date" aria-label="Date" value={selectedDate} onChange={(e) => e.target.value && pickDate(e.target.value)} disabled={loading}
              style={{position:"absolute",inset:0,opacity:0,width:"100%",height:"100%",cursor:"pointer"}}/>
          </label>
          <button onClick={() => pickDate(isoAddDays(selectedDate, 1))} disabled={loading} title="Jour suivant" aria-label="Jour suivant" style={arrowBtn}>›</button>
        </div>
        {daysOffset !== 0 && (
          <button onClick={() => pickDate(todayISO)} style={{marginTop:4,minHeight:40,background:"none",border:"none",padding:"4px 0",color:C.accent,fontSize:14,fontWeight:600,cursor:"pointer"}}>↺ Revenir à aujourd'hui</button>
        )}
      </header>

      {/* Barre d'onglets et session en cours dans un même bloc collant : pas de chevauchement. */}
      {/* v9.2 — Zone de la barre d'état (application installée) : peinte, le contenu ne passe pas dessous. */}
      <div aria-hidden="true" style={{position:"fixed",top:0,left:0,right:0,height:"env(safe-area-inset-top)",background:"rgba(3,11,23,0.96)",zIndex:60}}/>
      <div style={{position:"sticky",top:"env(safe-area-inset-top)",zIndex:50}}>
        {tab !== "photos" && (ph.job || ph.unseen) && (
          <div role="status" style={{background:"rgba(8,47,73,0.97)",borderBottom:"1px solid #0369a1"}}>
            <div style={{maxWidth:760,margin:"0 auto",padding:"3px 8px 3px 14px",display:"flex",alignItems:"center",gap:8,fontSize:14,color:"#e0f2fe"}}>
              <span style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                📷 {ph.job?.status === "running" ? <>Analyse photo · passe {ph.job.step}/3 en cours</> : ph.job ? <>Analyse photo interrompue avant la passe {nextPass(ph.job.partial)}/3</> : <b>Analyse photo prête</b>}
              </span>
              <button onClick={() => goTab("photos")} style={{minHeight:40,padding:"0 12px",borderRadius:8,border:"1px solid #7dd3fc",background:"rgba(125,211,252,0.15)",color:"#fff",fontSize:13.5,fontWeight:700,cursor:"pointer",flexShrink:0}}>{ph.job && ph.job.status !== "running" ? "Reprendre" : "Voir"}</button>
            </div>
          </div>
        )}
        {session && (
          <div role="status" id="bandeau-session" style={{background:"rgba(46,16,101,0.97)",borderBottom:"1px solid #6d28d9"}}>
            <div style={{maxWidth:760,margin:"0 auto",padding:"4px 8px 4px 12px",display:"flex",alignItems:"center",gap:6,fontSize:14.5,color:"#ede9fe"}}>
              {/* Le chrono d'abord : c'est lui qu'on lit d'un coup d'œil ; le nom du spot se tronque, jamais le temps. */}
              <span style={{flexShrink:0,fontWeight:800,...{fontVariantNumeric:"tabular-nums"}}}><span style={SR}>Session en cours depuis </span>🎣 {elapsed >= 60 ? `${Math.floor(elapsed / 60)} h ${String(elapsed % 60).padStart(2, "0")}` : `${elapsed} min`}</span>
              <span style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#c4b5fd"}}>{sessSpot?.name ?? session.spotId}{session.fish ? ` · ${session.fish} bar${session.fish > 1 ? "s" : ""}` : ""}</span>
              <button onClick={addFish} aria-label="Un bar de plus" style={{minHeight:44,minWidth:56,padding:"0 10px",borderRadius:8,border:"1px solid #86efac",background:"rgba(34,197,94,0.2)",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",flexShrink:0}}>+1 bar</button>
              <button onClick={endSession} style={{minHeight:44,padding:"0 10px",borderRadius:8,border:"1px solid #c4b5fd",background:"rgba(196,181,253,0.18)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",flexShrink:0}}>Terminer</button>
              <button onClick={() => setSession(null)} aria-label="Annuler la session" title="Annuler la session" style={{minWidth:44,minHeight:44,fontSize:18,color:"#c4b5fd",background:"none",border:"none",padding:0,cursor:"pointer",flexShrink:0}}>✕</button>
            </div>
          </div>
        )}
      </div>

      <main style={{maxWidth:760,margin:"0 auto",padding:`14px 14px calc(${NAV_H + 28}px + env(safe-area-inset-bottom))`}}>
        <div role="tabpanel" id="panneau" aria-labelledby={`onglet-${pillarOf(tab)}`}>
          {tab === "plus" && <PlusHub onOpen={goTab}/>}
          {MORE.some(([k]) => k === tab) && <MoreHeader tab={tab} onOpen={goTab}/>}
          {tab === "synthese" && <Synthese g={g}/>}
          {tab === "spots" && <Spots g={g}/>}
          {tab === "photos" && <Photos g={g}/>}
          {tab === "leurres" && <Leurres g={g}/>}
          {tab === "maree" && <Maree g={g}/>}
          {tab === "meteo" && <Meteo g={g}/>}
          {tab === "saison" && <Saison g={g}/>}
          {tab === "journal" && <JournalTab g={g}/>}
          {tab === "regles" && <Regles g={g}/>}
        </div>
      </main>
      <BottomNav tab={tab} onChange={goTab}/>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}nav [role=tablist]::-webkit-scrollbar{display:none}@media (max-width:359px){.lbl-refresh{display:none}}"}</style>
    </div>
  );
}
