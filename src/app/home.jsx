// v8.14 — Accueil : carte de tous les spots des guides (les tiens compris), chacun avec la pastille de sa note
// du jour, et ajout d'un spot qui va tout seul dans le guide de la fiche d'origine la plus proche.
// Les notes viennent du moteur de chaque guide (src/app/site-api.js), avec la même météo en cache, les mêmes
// réglages de l'appareil et le même journal que le guide : la pastille est celle que le guide affiche.
/* global __HOME_INDEX__, __HOME_GUIDES__ */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import L from "leaflet";
import { installStorage } from "../core/storage.js";
import { MYSPOT_COLOR, MYSPOT_MAX_KM, noGuideMsg, ownerOf } from "../core/myspots-core.js";
import { trendOf } from "../core/scale.js";
import { MySpotForm } from "../core/MySpotForm.jsx";
import { Offshore } from "../bateau/Offshore.jsx";
import { C, fr, scoreColor } from "../design/kit.jsx";

const INDEX = __HOME_INDEX__;     // fiches d'origine : [[clé du guide, id, lat, lon, nom], …]
const GUIDES = __HOME_GUIDES__;   // [{ key, id, name }, …], dans l'ordre de l'accueil
const GBY = Object.fromEntries(GUIDES.map((g) => [g.key, g]));
const engine = (key) => window.BAR_SITES?.[key] || null;
const DAYS = [["0", "Aujourd'hui"], ["1", "Demain"]];
const UNKNOWN = "#475569";
const PAR = 3;   // guides calculés en même temps (Open-Meteo limite les rafales)

const btn = (color, solid) => ({ minHeight: 48, padding: "0 16px", borderRadius: 10, border: `1px solid ${color}`, background: solid ? `${color}30` : "none",
  color: solid ? C.strong : color, fontSize: 15, fontWeight: 700, cursor: "pointer" });
const timeFr = (ms) => new Date(ms).toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });

/** Spots connus sans note (avant calcul, ou guide en échec) : fiches d'origine et tes spots enregistrés. */
function staticSpots(key) {
  const out = INDEX.filter((r) => r[0] === key).map((r) => ({ id: r[1], name: r[4], lat: r[2], lon: r[3], mine: false, score: null, eligible: false }));
  for (const r of engine(key)?.records() || []) if (!r.deleted) out.push({ id: r.id, name: r.name, lat: r.lat, lon: r.lon, mine: true, score: null, eligible: false });
  return out;
}

function GlobalMap({ spots, selected, onPick }) {
  const box = useRef(null), map = useRef(null), marks = useRef(new Map()), pick = useRef(onPick);
  pick.current = onPick;
  const [ready, setReady] = useState(false), [tilesFailed, setTilesFailed] = useState(false);
  useEffect(() => {
    const m = L.map(box.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false, fadeAnimation: false, markerZoomAnimation: false });
    const pts = INDEX.map((r) => [r[2], r[3]]);
    const fit = () => { m.invalidateSize(false); m.fitBounds(L.latLngBounds(pts), { padding: [16, 16], animate: false }); m._fitOk = box.current?.offsetWidth > 0; };
    if (box.current.offsetWidth > 0) fit(); else m.setView([48.5, -3.5], 7);
    // v8.15 — Accueil ouvert sur l'onglet Offshore : la carte, créée cachée, est recadrée à son premier affichage.
    const onTab = () => { if (window.BAR_TAB === "inshore") { m.invalidateSize(false); if (!m._fitOk) fit(); } };
    window.addEventListener("bar:tab", onTab);
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 17, attribution: '© <a href="https://www.openstreetmap.org/copyright">contributeurs OpenStreetMap</a>' });
    let errs = 0;
    tiles.on("tileerror", () => { if (++errs >= 4) setTilesFailed(true); });
    tiles.on("tileload", () => { errs = 0; setTilesFailed(false); });
    tiles.addTo(m);
    map.current = m; setReady(true);
    const cur = marks.current;
    return () => { window.removeEventListener("bar:tab", onTab); try { m.stop(); m.off(); m.remove(); } catch { /* déjà détruite */ } map.current = null; cur.clear(); };
  }, []);
  useEffect(() => {
    const m = map.current; if (!m) return;
    const ids = new Set(spots.map((s) => s.uid));
    for (const [uid, x] of marks.current) if (!ids.has(uid)) { try { x.remove(); x._hit.remove(); } catch { /* déjà retiré */ } marks.current.delete(uid); }
    for (const s of spots) {
      if (!Number.isFinite(s.lat) || !Number.isFinite(s.lon)) continue;
      let mk = marks.current.get(s.uid);
      if (!mk) {
        // Appui : le disque le plus proche du doigt (les zones de toucher se chevauchent à petite échelle).
        const tap = (e) => {
          let best = s.uid, dmin = Infinity;
          const at = e?.containerPoint;
          if (at) for (const [uid, x] of marks.current) { const d = at.distanceTo(m.latLngToContainerPoint(x.getLatLng())); if (d < dmin) { dmin = d; best = uid; } }
          pick.current(best);
        };
        const hit = L.circleMarker([s.lat, s.lon], { radius: 18, stroke: false, fillOpacity: 0, className: `gspot-hit gspot-hit-${s.key}-${s.id}` }).addTo(m);
        hit.on("click", tap);
        mk = L.circleMarker([s.lat, s.lon], { radius: 9, weight: 2, className: `gspot gspot-${s.key}-${s.id}` }).addTo(m);
        mk.on("click", tap); mk._hit = hit;
        marks.current.set(s.uid, mk);
      } else {
        const p = mk.getLatLng();
        if (Math.abs(p.lat - s.lat) > 1e-7 || Math.abs(p.lng - s.lon) > 1e-7) { mk.setLatLng([s.lat, s.lon]); mk._hit.setLatLng([s.lat, s.lon]); }
      }
      const on = s.uid === selected, known = s.score != null;
      mk.setStyle({ color: on ? "#f8fafc" : s.mine ? MYSPOT_COLOR : "#020617", weight: on || s.mine ? 3 : 2,
                    fillColor: known ? scoreColor(s.score, s.eligible) : UNKNOWN, fillOpacity: known ? (s.eligible ? 0.95 : 0.5) : 0.55 });
      const el = mk.getElement?.();
      if (el) { el.setAttribute("data-score", known ? (s.eligible ? fr(s.score) : "–") : "?"); el.setAttribute("data-name", s.name); }
      mk.unbindTooltip();
      mk.bindTooltip(`${s.name} · ${known ? (s.eligible ? fr(s.score) : "–") : "…"}`, { permanent: on, direction: "auto", className: "spot-tip" });
      if (on) mk.bringToFront();
    }
  }, [spots, selected, ready]);
  return (
    <div>
      <div ref={box} role="region" aria-label="Carte interactive : touche un spot pour sa note" style={{ position: "relative", zIndex: 0, isolation: "isolate", height: 360, borderRadius: 12, border: "1px solid #1e293b", overflow: "hidden", background: "#0b1626" }} />
      <p style={{ fontSize: 13, color: "#94a3b8", margin: "8px 2px 0", lineHeight: 1.5 }}>
        Disque vert : note ≥ 7 · orange ≥ 5 · gris foncé en dessous ou non proposé · gris clair : note en cours de calcul. Contour rose : tes spots. Touche un spot pour sa note et sa fiche.
        {tilesFailed && <span style={{ color: "#fbbf24" }}> Fond de carte indisponible (hors ligne ?) : les spots restent placés.</span>}
      </p>
    </div>
  );
}

/** Pastille d'un résultat de recherche : note du jour, flèche vers demain (sous 0,2 point d'écart : stable). */
function scoreBadge(t, m) {
  const tr = trendOf(t, m);
  const today = t.eligible ? fr(t.score) : "–", tomorrow = m ? (m.eligible ? fr(m.score) : "–") : null;
  const label = [t.eligible ? `Note du jour ${today}` : "Plus de créneau praticable aujourd'hui",
    tr ? `${tr.word} : demain ${tomorrow}${tr.why ? ` (${tr.why})` : ""}` : tomorrow != null ? `demain ${tomorrow}` : ""].filter(Boolean).join(", ");
  return { txt: today, color: scoreColor(t.score, t.eligible), arrow: tr?.arrow || "", tomorrow, label };
}

function SpotLink({ s, rank }) {
  const col = s.score != null ? scoreColor(s.score, s.eligible) : UNKNOWN;
  return (
    <a href={`${s.key}.html#spot=${s.id}`} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 52, padding: "8px 12px", color: "inherit", textDecoration: "none", borderTop: rank ? "1px solid #1e293b" : "none", background: "rgba(10,20,38,0.85)" }}>
      <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: "50%", background: col, border: s.mine ? `2px solid ${MYSPOT_COLOR}` : "none", flexShrink: 0 }} />
      <span style={{ minWidth: 0, flex: 1 }}>
        <strong style={{ display: "block", fontSize: 15 }}>{s.name}</strong>
        <span style={{ display: "block", fontSize: 13, color: "#94a3b8" }}>Guide {GBY[s.key]?.name}{s.mine ? " · ton spot" : ""}{s.best ? ` · ${s.best}` : ""}</span>
      </span>
      <span style={{ fontSize: 17, fontWeight: 800, color: col, fontVariantNumeric: "tabular-nums" }}>{s.score != null && s.eligible ? fr(s.score) : "–"}</span>
    </a>
  );
}

function resolveHome(pos) {
  const own = ownerOf(pos.lat, pos.lon, INDEX);
  if (!own) return { ok: false, msg: "Aucun guide disponible." };
  const g = GBY[own.key], e = engine(own.key);
  if (own.km > MYSPOT_MAX_KM) return { ok: false, msg: noGuideMsg(own, g?.name || own.key) };
  if (!e) return { ok: false, msg: "Le moteur de ce guide n'a pas pu se charger : recharge la page." };
  return { ok: true, move: false, key: own.key, siteId: e.id, guideName: e.name, ports: e.ports, defaultPort: e.defaultPort,
           near: e.nearest(pos.lat, pos.lon), count: e.count(), max: e.max, estimate: e.estimate, sanitize: e.sanitize };
}
const HOME_CENTER = (() => {
  const la = INDEX.map((r) => r[2]), lo = INDEX.map((r) => r[3]);
  return { lat: (Math.min(...la) + Math.max(...la)) / 2, lon: (Math.min(...lo) + Math.max(...lo)) / 2, zoom: 7 };
})();

function AddSpot({ open, setOpen, onAdded }) {
  const [done, setDone] = useState(null), [err, setErr] = useState("");
  const ref = useRef(null);
  useEffect(() => { if (open) { try { ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { /* sans effet */ } } }, [open]);
  const save = (rec, ctx) => {
    const r = engine(ctx.key)?.addRecord(rec);
    if (!r || r.error) { setErr(r?.error || "Enregistrement impossible."); return; }
    setErr(""); setOpen(false); setDone({ rec: r.rec, key: ctx.key, guideName: ctx.guideName });
    onAdded(ctx.key);
  };
  return (
    <section ref={ref} id="ajouter" aria-labelledby="ajouter-h" style={{ marginTop: 14, padding: "14px 16px", border: `1px solid ${MYSPOT_COLOR}55`, borderRadius: 12, background: "rgba(10,20,38,0.6)", scrollMarginTop: 12 }}>
      <h2 id="ajouter-h" style={{ fontSize: 17, margin: "0 0 6px" }}>{open ? "Ajouter un spot" : "Tes spots"}</h2>
      {done && !open && (
        <div role="status" style={{ marginBottom: 10, fontSize: 14.5, lineHeight: 1.5 }}>
          « {done.rec.name} » est ajouté au guide <b>{done.guideName}</b>, classé avec les autres spots du guide.
          <a href={`${done.key}.html#spot=${done.rec.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 10, minHeight: 48, borderRadius: 10, border: "1px solid #0ea5e9", background: "rgba(14,165,233,0.12)", color: "#e0f2fe", fontWeight: 700, textDecoration: "none" }}>Voir le spot dans le guide {done.guideName} →</a>
        </div>
      )}
      {open ? (
        <>
          <MySpotForm home resolve={resolveHome} center={HOME_CENTER} onCancel={() => { setOpen(false); setErr(""); }} onSave={save} />
          {err && <p role="alert" style={{ color: "#fca5a5", margin: "10px 0 0" }}>{err}</p>}
        </>
      ) : (
        <>
          {!done && <p style={{ margin: "0 0 4px", fontSize: 14, color: "#cbd5e1" }}>Un poste que tu connais et qui n'est pas dans les guides : place-le (ta position, la carte ou des coordonnées). Il va tout seul dans le guide du spot le plus proche, avec sa propre météo et sa note.</p>}
          <button type="button" onClick={() => { setDone(null); setOpen(true); }} style={{ ...btn(MYSPOT_COLOR, true), width: "100%", marginTop: 8 }}>＋ {done ? "Ajouter un autre spot" : "Ajouter un spot"}</button>
        </>
      )}
    </section>
  );
}

function Home() {
  const [offset, setOffset] = useState("0");
  const [boards, setBoards] = useState({});     // `${offset}:${clé}` → { status, data?, error? }
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(() => location.hash === "#ajouter");
  const [rev, setRev] = useState(0);             // tes spots ont changé : liste statique à relire
  const lastRun = useRef({});
  const run = useCallback(async (off, { force = false, only = null } = {}) => {
    const keys = only ? [only] : GUIDES.map((g) => g.key);
    lastRun.current[off] = Date.now();
    setBoards((b) => { const n = { ...b }; for (const k of keys) n[`${off}:${k}`] = { ...(n[`${off}:${k}`] || {}), status: "busy" }; return n; });
    const queue = [...keys];
    const worker = async () => {
      while (queue.length) {
        const k = queue.shift(), e = engine(k);
        let next;
        try { next = e ? { status: "ok", data: await e.day(+off, { force }) } : { status: "error", error: "moteur absent" }; }
        catch (err) { next = { status: "error", error: String(err?.message || err).split("\n")[0] }; }
        setBoards((b) => ({ ...b, [`${off}:${k}`]: next }));
      }
    };
    await Promise.all(Array.from({ length: PAR }, worker));
  }, []);
  // Aujourd'hui, puis demain (sans réseau : la semaine est déjà téléchargée) pour la tendance de chaque spot.
  const both = useCallback(async (opts) => { await run("0", opts); await run("1", { ...opts, force: false }); }, [run]);
  useEffect(() => { both(); }, [both]);
  useEffect(() => { if (!lastRun.current[offset]) run(offset); }, [offset, run]);
  // Retour sur l'accueil après un moment : les créneaux passés et la météo vieillissent, on recalcule (le cache sert).
  useEffect(() => {
    const vis = () => { if (document.visibilityState === "visible" && Date.now() - (lastRun.current["0"] || 0) > 15 * 6e4) both(); };
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, [both]);
  // v8.15 — Notes du jour et tendance vers demain, pour la recherche de l'accueil (script de la page, hors React).
  useEffect(() => {
    const out = {};
    for (const g of GUIDES) {
      const b0 = boards[`0:${g.key}`], b1 = boards[`1:${g.key}`];
      const t = b0?.status === "ok" ? b0.data.spots : [], m = b1?.status === "ok" ? b1.data.spots : [];
      const mBy = Object.fromEntries(m.map((x) => [x.id, x]));
      for (const x of t) out[`${g.key}/${x.id}`] = scoreBadge(x, mBy[x.id] || null);
    }
    window.BAR_SCORES = out;
    try { window.dispatchEvent(new Event("bar:scores")); } catch { /* sans effet */ }
  }, [boards]);
  useEffect(() => {
    const f = () => { if (location.hash === "#ajouter") setOpen(true); };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);

  const spots = useMemo(() => GUIDES.flatMap((g) => {
    const b = boards[`${offset}:${g.key}`];
    const list = b?.status === "ok" ? b.data.spots : staticSpots(g.key);
    return list.map((s) => ({ ...s, key: g.key, uid: `${g.key}/${s.id}` }));
  }), [boards, offset, rev]);   // eslint-disable-line react-hooks/exhaustive-deps
  const states = GUIDES.map((g) => ({ g, b: boards[`${offset}:${g.key}`] }));
  const nOk = states.filter((x) => x.b?.status === "ok").length;
  const busy = states.some((x) => x.b?.status === "busy");
  const top = spots.filter((s) => s.score != null && s.eligible).sort((a, b) => b.score - a.score).slice(0, 5);
  const sel = spots.find((s) => s.uid === selected) || null;
  const notes = states.flatMap(({ g, b }) => {
    if (b?.status === "error") return [`${g.name} : calcul impossible (${b.error}).`];
    if (b?.status !== "ok") return [];
    const d = b.data;
    if (!d.hasWx) return [`${g.name} : ${d.wxError || "météo indisponible"} — notes sur la marée et la lumière seules.`];
    if (d.stale) return [`${g.name} : ${d.wxError || "météo non rafraîchie"} — météo téléchargée à ${timeFr(d.wxAt)}.`];
    return [];
  });
  const dayLbl = offset === "0" ? "aujourd'hui" : "demain", dayOf = offset === "0" ? "d'aujourd'hui" : "de demain";
  const onAdded = (key) => { setRev((x) => x + 1); try { window.barReindex?.(); } catch { /* recherche : à la prochaine ouverture */ } both({ only: key }); };

  return (
    <>
      <div role="group" aria-label="Jour affiché" style={{ display: "flex", gap: 8, margin: "0 0 10px", flexWrap: "wrap", alignItems: "center" }}>
        {DAYS.map(([k, l]) => (
          <button key={k} type="button" aria-pressed={offset === k} onClick={() => { setOffset(k); setSelected(null); }}
            style={{ minHeight: 44, padding: "0 14px", borderRadius: 999, border: `1px solid ${offset === k ? "#38bdf8" : "#334155"}`, background: offset === k ? "rgba(56,189,248,0.16)" : "transparent", color: offset === k ? "#e0f2fe" : "#cbd5e1", fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>{l}</button>
        ))}
        <button type="button" onClick={() => both({ force: true })} disabled={busy} aria-label="Retélécharger la météo et recalculer les notes"
          style={{ marginLeft: "auto", minHeight: 44, padding: "0 12px", borderRadius: 10, border: "1px solid #334155", background: "none", color: "#38bdf8", fontSize: 14, cursor: busy ? "progress" : "pointer" }}>↻ Météo</button>
      </div>
      <GlobalMap spots={spots} selected={selected} onPick={setSelected} />
      <p id="map-status" role="status" aria-live="polite" style={{ margin: "8px 2px 0", fontSize: 13, color: "#94a3b8" }}>
        {busy ? `Calcul des notes ${dayOf} : ${nOk} guide${nOk > 1 ? "s" : ""} sur ${GUIDES.length}…` : nOk === GUIDES.length ? `Notes ${dayOf} calculées pour les ${GUIDES.length} guides, avec la météo de chaque spot.` : `Notes ${dayOf} : ${nOk} guide${nOk > 1 ? "s" : ""} sur ${GUIDES.length}.`}
      </p>
      {notes.length > 0 && <ul style={{ margin: "6px 0 0", padding: "0 0 0 18px", fontSize: 13, color: "#fbbf24" }}>{notes.map((t) => <li key={t}>{t}</li>)}</ul>}
      {sel && (
        <div role="region" aria-label="Spot choisi sur la carte" aria-live="polite" style={{ marginTop: 10, padding: "12px 14px", border: "1px solid #334155", borderRadius: 12, background: "rgba(10,20,38,0.85)" }}>
          <strong style={{ fontSize: 16 }}>{sel.name}</strong>
          <div style={{ fontSize: 13.5, color: "#94a3b8" }}>Guide {GBY[sel.key]?.name}{sel.mine ? " · ton spot" : ""}</div>
          <div style={{ fontSize: 14.5, marginTop: 4 }}>
            {sel.score == null ? "Note en cours de calcul…"
              : sel.eligible ? <>Note <b style={{ color: scoreColor(sel.score, true) }}>{fr(sel.score)}</b>{sel.best ? ` · meilleur créneau ${sel.best}` : ""}{sel.reason ? <span style={{ display: "block", fontSize: 13, color: "#cbd5e1" }}>{sel.reason}</span> : null}</>
              : <>Non proposé {dayLbl} : {sel.reason || "aucun créneau praticable"}</>}
          </div>
          <a href={`${sel.key}.html#spot=${sel.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 10, minHeight: 48, borderRadius: 10, border: "1px solid #0ea5e9", background: "rgba(14,165,233,0.12)", color: "#e0f2fe", fontWeight: 700, textDecoration: "none" }}>Ouvrir la fiche dans le guide {GBY[sel.key]?.name} →</a>
        </div>
      )}
      <h3 style={{ fontSize: 15.5, margin: "16px 0 8px" }}>Meilleurs spots {dayLbl}, tous guides confondus</h3>
      {top.length ? (
        <nav aria-label={`Meilleurs spots ${dayLbl}`} style={{ border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
          {top.map((s, i) => <SpotLink key={s.uid} s={s} rank={i} />)}
        </nav>
      ) : <p style={{ margin: 0, fontSize: 13.5, color: "#94a3b8" }}>{busy || nOk === 0 ? "Calcul en cours…" : `Aucun spot praticable ${dayLbl} dans tes heures de pêche.`}</p>}
      <p style={{ margin: "8px 2px 0", fontSize: 12.5, color: "#94a3b8" }}>Le vert veut dire « rien ne bloque » (marée dans la plage utile, vent et houle tenables), pas « ça mord à coup sûr ». Sous 0,2 point d'écart, deux spots se valent.</p>
      <AddSpot open={open} setOpen={setOpen} onAdded={onAdded} />
    </>
  );
}

installStorage();
const rootEl = document.getElementById("home-app");
if (rootEl) createRoot(rootEl).render(<Home />);
// v8.15 — Onglet Offshore : pêche en bateau (src/bateau/Offshore.jsx).
const offEl = document.getElementById("offshore-app");
if (offEl) createRoot(offEl).render(<Offshore index={INDEX} />);
