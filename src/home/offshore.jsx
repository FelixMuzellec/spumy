// v8.15 — Onglet Offshore de l'accueil : pêche en bateau, toutes espèces.
// Tes spots (ajoutés ici seulement), les conditions des 7 prochains jours (vent, vagues, houle, eau, pression, marée
// du port de guide le plus proche), tes sorties avec leurs prises, et un modèle EMPIRIQUE ajusté sur elles
// (src/engine/offshore.js) : pas de note tant que tes sorties ne suffisent pas, rien de supposé à l'avance.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { BOAT_TYPES, MIN_TRIPS, OFF_COLOR, OFF_FILE, OFF_SPOTS_KEY, OFF_TRIPS_KEY, SPECIES, SPECIES_BY, TECHNIQUES, VAR_BY,
  catchCount, conditionsOf, curveOf, effectsOf, fitModel, mergeById, newId, parisDate, parisMs, predictRate, reliabilityOf,
  sanitizeBoatSpot, sanitizeTrip, scoreOf, tripSpan } from "../engine/offshore.js";
import { ownerOf, parseUserCoords } from "../engine/myspots-core.js";
import { b64dec, b64enc, explain, getCfg, gh } from "../ghsync.js";
import { dir16, fetchPoints, isoAdd } from "../offshore/wx.js";
import { PickMap } from "../ui/MySpotForm.jsx";
import { Alert, C, Chip, fr, scoreColor } from "../ui/kit.jsx";

const engine = (key) => window.BAR_SITES?.[key] || null;
const WX_KEY = "bar:offshore:wx", WX_TTL = 90 * 6e4, TIDE_KM = 40;
const HOURS = [6, 9, 12, 15, 18, 21];
const box = { marginTop: 14, padding: "14px 16px", border: "1px solid #1e293b", borderRadius: 12, background: "rgba(10,20,38,0.6)" };
const h2 = { fontSize: 17, margin: "0 0 8px" };
const lbl = { display: "block", fontSize: 14, fontWeight: 700, color: C.strong, margin: "12px 0 6px" };
const inp = { width: "100%", boxSizing: "border-box", minHeight: 44, padding: "9px 11px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#060f1e", color: C.text, fontSize: 16 };
const btn = (color, solid) => ({ minHeight: 48, padding: "0 16px", borderRadius: 10, border: `1px solid ${color}`, background: solid ? `${color}30` : "none", color: solid ? C.strong : color, fontSize: 15, fontWeight: 700, cursor: "pointer" });
const muted = { fontSize: 13, color: C.muted, margin: "6px 0 0", lineHeight: 1.5 };
const hh = (ms) => new Date(ms).toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).replace(":", "h");
const dayLbl = (iso, i) => (i === 0 ? "Auj." : i === 1 ? "Dem." : new Date(iso + "T12:00Z").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }).replace(".", ""));
const longDay = (iso) => new Date(iso + "T12:00Z").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const shortDate = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const lsList = (k, san) => { try { const v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v.map(san).filter(Boolean) : []; } catch { return []; } };
const lsSave = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Sauvegarde GitHub (offshore.json, dans le dépôt du journal) : fusion par identifiant, des deux côtés. */
async function syncOffshore(cfg) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await gh(cfg, "GET", OFF_FILE);
    let remote = { spots: [], trips: [] }, sha = null;
    if (r.status === 200) {
      try { remote = JSON.parse(b64dec(r.json.content)); sha = r.json.sha; if (!remote || typeof remote !== "object") throw new Error("format"); }
      catch { return { ok: false, reason: "fichier offshore.json illisible sur GitHub" }; }
    } else if (r.status !== 404) return { ok: false, reason: explain(r.status, r.json) };
    const local = { spots: lsList(OFF_SPOTS_KEY, sanitizeBoatSpot), trips: lsList(OFF_TRIPS_KEY, sanitizeTrip) };
    const merged = { spots: mergeById(remote.spots, local.spots, sanitizeBoatSpot), trips: mergeById(remote.trips, local.trips, sanitizeTrip) };
    const pulled = !same(merged, { spots: mergeById([], local.spots, sanitizeBoatSpot), trips: mergeById([], local.trips, sanitizeTrip) });
    if (pulled) { lsSave(OFF_SPOTS_KEY, merged.spots); lsSave(OFF_TRIPS_KEY, merged.trips); }
    if (same(merged, { spots: mergeById(remote.spots, [], sanitizeBoatSpot), trips: mergeById(remote.trips, [], sanitizeTrip) })) return { ok: true, pulled };
    const put = await gh(cfg, "PUT", OFF_FILE, { message: `Offshore : ${merged.spots.filter((x) => !x.deleted).length} spots, ${merged.trips.filter((x) => !x.deleted).length} sorties`,
      content: b64enc(JSON.stringify(merged, null, 2) + "\n"), ...(sha ? { sha } : {}) });
    if (put.status === 200 || put.status === 201) return { ok: true, pulled, pushed: true };
    if (put.status === 409 || put.status === 422) continue;
    return { ok: false, reason: explain(put.status, put.json) };
  }
  return { ok: false, reason: "conflit d'écriture répété, réessaie" };
}

function BoatMap({ spots, scores, selected, onPick }) {
  const el = useRef(null), map = useRef(null), marks = useRef(new Map()), pick = useRef(onPick);
  pick.current = onPick;
  useEffect(() => {
    const m = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false, fadeAnimation: false, markerZoomAnimation: false }).setView([48.4, -4.4], 8);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 17, attribution: '© <a href="https://www.openstreetmap.org/copyright">contributeurs OpenStreetMap</a>' }).addTo(m);
    map.current = m;
    const cur = marks.current;
    const onTab = () => { if (window.BAR_TAB === "offshore") m.invalidateSize(false); };
    window.addEventListener("bar:tab", onTab);
    return () => { window.removeEventListener("bar:tab", onTab); try { m.stop(); m.off(); m.remove(); } catch { /* déjà détruite */ } map.current = null; cur.clear(); };
  }, []);
  useEffect(() => {
    const m = map.current; if (!m) return;
    const ids = new Set(spots.map((s) => s.id));
    for (const [id, x] of marks.current) if (!ids.has(id)) { x.remove(); marks.current.delete(id); }
    for (const s of spots) {
      let mk = marks.current.get(s.id);
      if (!mk) { mk = L.circleMarker([s.lat, s.lon], { radius: 10, weight: 2, className: `bspot bspot-${s.id}` }).addTo(m); mk.on("click", () => pick.current(s.id)); marks.current.set(s.id, mk); }
      else mk.setLatLng([s.lat, s.lon]);
      const sc = scores[s.id], on = s.id === selected;
      mk.setStyle({ color: on ? "#f8fafc" : "#020617", weight: on ? 3 : 2, fillColor: sc != null ? scoreColor(sc, true) : OFF_COLOR, fillOpacity: 0.95 });
      mk.unbindTooltip(); mk.bindTooltip(`${s.name}${sc != null ? ` · ${fr(sc)}` : ""}`, { permanent: on, direction: "auto", className: "spot-tip" });
    }
    if (spots.length && !m._fitted) { m.fitBounds(L.latLngBounds(spots.map((s) => [s.lat, s.lon])), { padding: [28, 28], maxZoom: 11, animate: false }); m._fitted = true; }
  }, [spots, scores, selected]);
  return <div ref={el} role="region" aria-label="Carte de tes spots bateau" style={{ position: "relative", zIndex: 0, isolation: "isolate", height: 280, borderRadius: 12, border: "1px solid #1e293b", overflow: "hidden", background: "#0b1626" }} />;
}

function BoatSpotForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || ""), [pos, setPos] = useState(initial ? { lat: initial.lat, lon: initial.lon, from: "fiche" } : null);
  const [type, setType] = useState(initial?.type || "roche"), [depth, setDepth] = useState(initial?.depth ? String(initial.depth) : ""), [notes, setNotes] = useState(initial?.notes || "");
  const [coordText, setCoordText] = useState(""), [gps, setGps] = useState({ state: "idle" }), [err, setErr] = useState("");
  const useGps = () => {
    if (!navigator.geolocation) { setGps({ state: "error", msg: "Ce navigateur ne donne pas la position." }); return; }
    setGps({ state: "busy" });
    navigator.geolocation.getCurrentPosition((p) => { setPos({ lat: +p.coords.latitude.toFixed(6), lon: +p.coords.longitude.toFixed(6), from: "gps" }); setGps({ state: "ok", acc: p.coords.accuracy }); setErr(""); },
      (e) => setGps({ state: "error", msg: e.code === 1 ? "Position refusée : autorise la localisation pour cette page, ou touche la carte." : "Position introuvable pour l'instant : réessaie, ou touche la carte." }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  };
  const place = () => { const c = parseUserCoords(coordText); if (!c) { setErr("Coordonnées illisibles : colle par exemple « 48.30, -4.80 » ou un lien Google Maps."); return; } setPos({ ...c, from: "texte" }); setErr(""); };
  const submit = (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("Donne un nom au spot (2 caractères au moins).");
    if (!pos) return setErr("Place le spot : ta position en mer, un appui sur la carte, ou des coordonnées.");
    const now = Date.now();
    const rec = sanitizeBoatSpot({ id: initial?.id || newId("b", now), name, lat: pos.lat, lon: pos.lon, type, depth: depth === "" ? null : +depth, notes, createdAt: initial?.createdAt || now, updatedAt: now });
    if (!rec) return setErr("Fiche incomplète : vérifie le nom et la position.");
    onSave(rec);
  };
  return (
    <form onSubmit={submit} aria-label={initial ? "Modifier ton spot bateau" : "Ajouter un spot bateau"} noValidate>
      <label htmlFor="bs-name" style={{ ...lbl, marginTop: 0 }}>Nom du spot</label>
      <input id="bs-name" style={inp} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="Ex. : l'épave du cargo, la basse aux lieus" autoComplete="off" />
      <span style={lbl}>Position</span>
      <button type="button" onClick={useGps} disabled={gps.state === "busy"} style={{ ...btn(C.accent, true), marginBottom: 8 }}>{gps.state === "busy" ? "Localisation…" : "📍 Ma position"}</button>
      <PickMap pos={pos} color={OFF_COLOR} center={{ lat: 48.4, lon: -4.4, zoom: 8 }} label="Carte : touche l'emplacement du spot bateau" onPick={(p) => { setPos(p); setErr(""); }} />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input aria-label="Coordonnées du spot bateau ou lien Google Maps" style={{ ...inp, flex: 1, minWidth: 0 }} value={coordText} onChange={(e) => setCoordText(e.target.value)} placeholder="48.30, -4.80 ou 48°18'N 4°48'W" autoComplete="off" autoCapitalize="off" spellCheck={false} />
        <button type="button" onClick={place} style={btn(C.accent, false)}>Placer</button>
      </div>
      <div role="status" aria-live="polite" style={{ fontSize: 13.5, marginTop: 8, color: C.text }}>
        {gps.state === "error" && <span style={{ color: "#fca5a5", display: "block" }}>{gps.msg}</span>}
        {pos && <span>Position : {pos.lat.toFixed(5).replace(".", ",")} / {pos.lon.toFixed(5).replace(".", ",")}{pos.from === "gps" && gps.acc ? ` (GPS, à ±${Math.round(gps.acc)} m)` : pos.from === "carte" ? " (carte)" : ""}</span>}
      </div>
      <span id="bs-type" style={lbl}>Type</span>
      <div role="group" aria-labelledby="bs-type" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(BOAT_TYPES).map(([k, l]) => <Chip key={k} color={OFF_COLOR} active={type === k} onClick={() => setType(k)}>{l}</Chip>)}
      </div>
      <label htmlFor="bs-depth" style={lbl}>Profondeur (m) <span style={{ fontWeight: 500, color: C.muted }}>(facultatif)</span></label>
      <input id="bs-depth" style={inp} type="number" inputMode="numeric" min="1" max="500" value={depth} onChange={(e) => setDepth(e.target.value)} />
      <label htmlFor="bs-notes" style={lbl}>Ce que tu en sais <span style={{ fontWeight: 500, color: C.muted }}>(facultatif)</span></label>
      <textarea id="bs-notes" style={{ ...inp, minHeight: 72, resize: "vertical" }} maxLength={600} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Courant, mouillage, dérive, montages…" />
      {err && <div style={{ marginTop: 10 }}><Alert tone={C.bad} role="alert">{err}</Alert></div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button type="submit" style={btn(C.good, true)}>{initial ? "Enregistrer" : "Ajouter ce spot"}</button>
        <button type="button" onClick={onCancel} style={btn(C.muted, false)}>Annuler</button>
      </div>
    </form>
  );
}

function TripForm({ spots, spotId, today, onSave, onCancel }) {
  const [sid, setSid] = useState(spotId || spots[0]?.id || ""), [date, setDate] = useState(today), [start, setStart] = useState(""), [end, setEnd] = useState("");
  const [rows, setRows] = useState([]), [tech, setTech] = useState([]), [notes, setNotes] = useState(""), [err, setErr] = useState("");
  const set = (i, k, v) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const submit = (e) => {
    e.preventDefault();
    if (!sid) return setErr("Choisis le spot de la sortie.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today) return setErr("Date invalide : une sortie se note une fois faite (aujourd'hui ou avant).");
    if (!start || !end) return setErr("Indique l'heure de début et de fin de pêche.");
    if (start === end) return setErr("Le début et la fin sont à la même heure.");
    if (rows.some((r) => !r.sp || !(+r.n >= 1))) return setErr("Chaque prise doit avoir une espèce et un nombre (1 ou plus).");
    const now = Date.now();
    const t = sanitizeTrip({ id: newId("t", now), spotId: sid, date, start, end, catches: rows.map((r) => ({ sp: r.sp, n: +r.n, size: r.size === "" ? null : +r.size, kept: r.kept })), tech, notes, cond: null, createdAt: now, updatedAt: now });
    if (!t) return setErr("Sortie incomplète : vérifie les champs.");
    onSave(t);
  };
  return (
    <form onSubmit={submit} aria-label="Enregistrer une sortie en bateau" noValidate>
      <label htmlFor="tr-spot" style={{ ...lbl, marginTop: 0 }}>Spot</label>
      <select id="tr-spot" style={inp} value={sid} onChange={(e) => setSid(e.target.value)}>{spots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
        <div><label htmlFor="tr-date" style={lbl}>Date</label><input id="tr-date" style={inp} type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label htmlFor="tr-start" style={lbl}>Début</label><input id="tr-start" style={inp} type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div>
        <div><label htmlFor="tr-end" style={lbl}>Fin</label><input id="tr-end" style={inp} type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
      </div>
      <span style={lbl}>Prises</span>
      {!rows.length && <p style={{ ...muted, marginTop: 0 }}>Aucune prise pour l'instant : enregistrée ainsi, la sortie compte comme un capot. Les capots sont utiles au modèle, note-les aussi.</p>}
      {rows.map((r, i) => (
        <fieldset key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: "8px 10px", margin: "0 0 8px" }}>
          <legend style={{ fontSize: 13, color: C.muted, padding: "0 4px" }}>Prise {i + 1}</legend>
          <label htmlFor={`tr-sp-${i}`} className="sr">Espèce de la prise {i + 1}</label>
          <select id={`tr-sp-${i}`} style={inp} value={r.sp} onChange={(e) => set(i, "sp", e.target.value)}>
            <option value="">Espèce…</option>
            {SPECIES.map((x) => <option key={x.id} value={x.id}>{x.name}{x.latin ? ` (${x.latin})` : ""}</option>)}
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8, marginTop: 8 }}>
            <div><label htmlFor={`tr-n-${i}`} style={{ ...lbl, margin: "0 0 4px", fontSize: 13 }}>Nombre</label><input id={`tr-n-${i}`} style={inp} type="number" inputMode="numeric" min="1" max="500" value={r.n} onChange={(e) => set(i, "n", e.target.value)} /></div>
            <div><label htmlFor={`tr-size-${i}`} style={{ ...lbl, margin: "0 0 4px", fontSize: 13 }}>Taille (cm, la plus grande)</label><input id={`tr-size-${i}`} style={inp} type="number" inputMode="numeric" min="1" max="400" value={r.size} onChange={(e) => set(i, "size", e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, fontSize: 14 }}><input type="checkbox" checked={r.kept} onChange={(e) => set(i, "kept", e.target.checked)} style={{ width: 20, height: 20 }} /> Gardé (sinon relâché)</label>
            <button type="button" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} style={{ ...btn(C.muted, false), minHeight: 44, marginLeft: "auto" }}>Retirer</button>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={() => setRows((r) => [...r, { sp: "", n: "1", size: "", kept: false }])} style={btn(OFF_COLOR, false)}>＋ Ajouter une prise</button>
      <span id="tr-tech" style={lbl}>Techniques <span style={{ fontWeight: 500, color: C.muted }}>(facultatif)</span></span>
      <div role="group" aria-labelledby="tr-tech" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(TECHNIQUES).map(([k, l]) => <Chip key={k} color={OFF_COLOR} active={tech.includes(k)} onClick={() => setTech((t) => (t.includes(k) ? t.filter((x) => x !== k) : [...t, k]))}>{l}</Chip>)}
      </div>
      <label htmlFor="tr-notes" style={lbl}>Notes <span style={{ fontWeight: 500, color: C.muted }}>(facultatif)</span></label>
      <textarea id="tr-notes" style={{ ...inp, minHeight: 64, resize: "vertical" }} maxLength={600} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Leurres, profondeur, dérive, oiseaux…" />
      {err && <div style={{ marginTop: 10 }}><Alert tone={C.bad} role="alert">{err}</Alert></div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button type="submit" style={btn(C.good, true)}>Enregistrer la sortie</button>
        <button type="button" onClick={onCancel} style={btn(C.muted, false)}>Annuler</button>
      </div>
      <p style={muted}>Les conditions de la sortie (vent, vagues, houle, eau, pression, marée) sont récupérées toutes seules auprès d'Open-Meteo : les vagues jusqu'à environ 80 jours en arrière, le vent au-delà aussi.</p>
    </form>
  );
}

function Curve({ cv }) {
  const W = 320, H = 170, P = { l: 38, r: 10, t: 10, b: 30 };
  const ymax = Math.max(...cv.pts.map((p) => p.y), ...cv.obs.map((o) => o.y), 0.1) * 1.08;
  const X = (x) => P.l + ((x - cv.lo) / (cv.hi - cv.lo)) * (W - P.l - P.r), Y = (y) => H - P.b - (y / ymax) * (H - P.t - P.b);
  const fx = (x) => (cv.k === "doy" ? new Date(Date.UTC(2026, 0, Math.round(x))).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }) : `${fr(x, VAR_BY[cv.k].d)}${cv.unit ? " " + cv.unit : ""}`);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Courbe de régression : prises par heure attendues selon ${cv.label.toLowerCase()}, de ${fx(cv.lo)} à ${fx(cv.hi)} ; points : tes sorties.`} style={{ width: "100%", maxWidth: 520, display: "block", marginTop: 8 }}>
      <line x1={P.l} y1={H - P.b} x2={W - P.r} y2={H - P.b} stroke="#334155" />
      <line x1={P.l} y1={P.t} x2={P.l} y2={H - P.b} stroke="#334155" />
      {[0, 0.5, 1].map((f) => <text key={f} x={P.l - 5} y={Y(ymax * f / 1.08) + 4} fontSize="10" fill="#94a3b8" textAnchor="end">{fr(ymax * f / 1.08)}</text>)}
      <text x={P.l} y={H - 8} fontSize="10" fill="#94a3b8">{fx(cv.lo)}</text>
      <text x={W - P.r} y={H - 8} fontSize="10" fill="#94a3b8" textAnchor="end">{fx(cv.hi)}</text>
      {cv.obs.map((o, i) => <circle key={i} cx={X(Math.min(cv.hi, Math.max(cv.lo, o.x)))} cy={Y(o.y)} r="3" fill="#64748b" />)}
      <polyline fill="none" stroke={OFF_COLOR} strokeWidth="2.5" points={cv.pts.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ")} />
    </svg>
  );
}

export function Offshore({ index }) {
  const [shown, setShown] = useState(window.BAR_TAB === "offshore");
  useEffect(() => { const f = () => { if (window.BAR_TAB === "offshore") setShown(true); }; window.addEventListener("bar:tab", f); return () => window.removeEventListener("bar:tab", f); }, []);
  const [spotsAll, setSpotsAll] = useState(() => lsList(OFF_SPOTS_KEY, sanitizeBoatSpot));
  const [tripsAll, setTripsAll] = useState(() => lsList(OFF_TRIPS_KEY, sanitizeTrip));
  const spots = useMemo(() => spotsAll.filter((s) => !s.deleted), [spotsAll]);
  const trips = useMemo(() => tripsAll.filter((t) => !t.deleted).sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start)), [tripsAll]);
  const today = parisDate(Date.now());
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => isoAdd(today, i)), [today]);
  const [dayI, setDayI] = useState(0), [sel, setSel] = useState(null), [form, setForm] = useState(null), [confirm, setConfirm] = useState(null);
  const [species, setSpecies] = useState("all"), [curveK, setCurveK] = useState(null);
  const [wx, setWx] = useState(() => { try { return JSON.parse(localStorage.getItem(WX_KEY) || "null"); } catch { return null; } });
  const [wxState, setWxState] = useState({ busy: false, error: null });
  const [sync, setSync] = useState({ state: getCfg() ? "idle" : "off" });
  const syncTimer = useRef(null);
  const selSpot = spots.find((s) => s.id === sel) || spots[0] || null;

  const doSync = useCallback(async () => {
    const cfg = getCfg(); if (!cfg) { setSync({ state: "off" }); return; }
    setSync({ state: "busy" });
    const r = await syncOffshore(cfg);
    if (r.ok && r.pulled) { setSpotsAll(lsList(OFF_SPOTS_KEY, sanitizeBoatSpot)); setTripsAll(lsList(OFF_TRIPS_KEY, sanitizeTrip)); }
    setSync(r.ok ? { state: "ok", at: Date.now() } : { state: "error", reason: r.reason });
  }, []);
  useEffect(() => { if (shown) doSync(); }, [shown, doSync]);
  const write = (key, list, setter) => { setter(list); lsSave(key, list); clearTimeout(syncTimer.current); syncTimer.current = setTimeout(doSync, 1500); };
  const saveSpots = (list) => write(OFF_SPOTS_KEY, list, setSpotsAll);
  const saveTrips = (list) => write(OFF_TRIPS_KEY, list, setTripsAll);

  // Marée du port de guide le plus proche (à moins de 40 km d'une fiche de guide), sur trois jours.
  const tideMemo = useRef(new Map());
  const tideAt = useCallback((s, dateISO) => {
    const key = `${s.id}|${s.lat},${s.lon}|${dateISO}`;
    if (tideMemo.current.has(key)) return tideMemo.current.get(key);
    let out = null;
    const own = ownerOf(s.lat, s.lon, index), e = own && own.km <= TIDE_KM ? engine(own.key) : null;
    if (e) { const n = e.nearest(s.lat, s.lon); const t = e.tide(dateISO, n?.tidePort); out = { ...t, guide: e.name }; }
    tideMemo.current.set(key, out);
    return out;
  }, [index]);

  // Météo et mer des 7 jours pour tous les spots (une requête atmosphère par modèle, une requête mer).
  const sig = spots.map((s) => `${s.id}:${s.lat},${s.lon}`).join("|");
  const loadWx = useCallback(async (force = false) => {
    if (!spots.length) return;
    if (!force && wx && wx.sig === sig && wx.start === isoAdd(today, -1) && Date.now() - wx.at < WX_TTL) return;
    setWxState({ busy: true, error: null });
    try {
      const r = await fetchPoints(spots.map((s) => ({ id: s.id, lat: s.lat, lon: s.lon })), isoAdd(today, -1), isoAdd(today, 6), today);
      const next = { sig, start: isoAdd(today, -1), at: Date.now(), model: r.model, marineOk: r.marineOk, byId: r.byId };
      setWx(next); setWxState({ busy: false, error: null });
      try { localStorage.setItem(WX_KEY, JSON.stringify(next)); } catch { /* stockage plein : gardé pour la session */ }
    } catch (e) {
      const offline = /failed to fetch|networkerror|load failed/i.test(String(e?.message || ""));
      setWxState({ busy: false, error: offline ? "Pas de réseau" : e?.isRateLimit ? "Open-Meteo sature : réessaie dans une minute" : String(e?.message || e) });
    }
  }, [spots, sig, today, wx]);
  useEffect(() => { if (shown) loadWx(); }, [shown, sig]);   // eslint-disable-line react-hooks/exhaustive-deps

  // Conditions d'une sortie : récupérées après l'enregistrement (et retentées à l'ouverture si le réseau manquait).
  const fillCond = useCallback(async (t) => {
    const s = spotsAll.find((x) => x.id === t.spotId && !x.deleted);
    if (!s) return false;
    try {
      const [t0, t1] = tripSpan(t);
      const r = await fetchPoints([{ id: s.id, lat: s.lat, lon: s.lon }], isoAdd(t.date, -1), isoAdd(t.date, 1), today);
      const tide = tideAt(s, t.date);
      const cond = conditionsOf(r.byId[s.id], t0, t1, tide);
      if (!cond) return false;
      cond.src = `Open-Meteo (${r.model})${r.marineOk ? "" : ", sans vagues"}${tide ? ` · marée de ${tide.label}` : " · sans marée (aucun port de guide à moins de 40 km)"}`;
      cond.at = Date.now();
      setTripsAll((all) => { const next = all.map((x) => (x.id === t.id ? sanitizeTrip({ ...x, cond, updatedAt: Date.now() }) : x)); lsSave(OFF_TRIPS_KEY, next); return next; });
      clearTimeout(syncTimer.current); syncTimer.current = setTimeout(doSync, 1500);
      return true;
    } catch { return false; }
  }, [spotsAll, today, tideAt, doSync]);
  const tried = useRef(new Set());
  useEffect(() => { if (!shown) return; for (const t of trips) if (!t.cond && !tried.current.has(t.id)) { tried.current.add(t.id); fillCond(t); } }, [shown, trips, fillCond]);

  // Modèle empirique et notes des spots pour le jour choisi.
  const speciesSeen = useMemo(() => SPECIES.filter((x) => trips.some((t) => catchCount(t, x.id) > 0)), [trips]);
  const model = useMemo(() => fitModel(trips, { species }), [trips, species]);
  const effects = useMemo(() => (model.ok ? effectsOf(model, trips) : []), [model, trips]);
  const dateISO = days[dayI];
  const windows = useMemo(() => {
    const out = {};
    if (!model.ok || !wx?.byId) return out;
    for (const s of spots) {
      const ser = wx.byId[s.id]; if (!ser) continue;
      const tide = tideAt(s, dateISO);
      let best = null;
      const per = {};
      for (let h = 5; h <= 20; h++) {
        const t0 = parisMs(dateISO, `${String(h).padStart(2, "0")}:00`), t1 = t0 + 3 * 36e5;
        if (dayI === 0 && t1 < Date.now()) continue;
        const c = conditionsOf(ser, t0, t1, tide); if (!c || c.wind == null) continue;
        const sc = scoreOf(model, predictRate(model, c, s.id));
        if (sc == null) continue;
        per[h] = sc;
        if (!best || sc > best.sc) best = { h, sc };
      }
      out[s.id] = { best, per };
    }
    return out;
  }, [model, wx, spots, dateISO, dayI, tideAt]);
  const mapScores = Object.fromEntries(Object.entries(windows).map(([k, v]) => [k, v.best?.sc ?? null]));

  const ser = selSpot && wx?.byId?.[selSpot.id];
  const tide = selSpot ? tideAt(selSpot, dateISO) : null;
  const rowAt = (h) => {
    if (!ser) return null;
    const ms = parisMs(dateISO, `${String(h).padStart(2, "0")}:00`), i = ser.time.indexOf(ms / 1000);
    if (i < 0) return null;
    return Object.fromEntries(["wind", "gust", "dir", "wave", "waveDir", "period", "swell", "swellPeriod", "sst", "pressure"].map((k) => [k, ser[k]?.[i] ?? null]));
  };
  const dayEvents = tide ? tide.events.filter((e) => parisDate(e.ms) === dateISO) : [];
  const dayCond = ser ? conditionsOf(ser, parisMs(dateISO, "06:00"), parisMs(dateISO, "21:00"), tide) : null;
  const cv = model.ok ? curveOf(model, trips, curveK || effects[0]?.k) : null;
  const spName = (id) => spotsAll.find((s) => s.id === id)?.name || "Spot supprimé";
  const catchTxt = (t) => (t.catches.length ? t.catches.map((c) => `${SPECIES_BY[c.sp]?.name || c.sp} × ${c.n}${c.size ? ` (${c.size} cm)` : ""}${c.kept ? ", gardé" : ""}`).join(" · ") : "capot (aucune prise)");
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ spots: spotsAll, trips: tripsAll }, null, 2)], { type: "application/json" });
    const u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = `peche-bateau-${today}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000);
  };

  if (!shown) return <p className="wait">Chargement de la pêche en bateau…</p>;
  return (
    <div>
      <p style={{ margin: "0 0 4px", fontSize: 14, color: "#cbd5e1", lineHeight: 1.55 }}>
        Pêche en bateau, toutes espèces. Les spots sont les tiens : aucune marque n'est fournie. Le modèle part de zéro et apprend de tes sorties, prises et capots compris ; la note n'apparaît qu'à partir de {MIN_TRIPS} sorties.
      </p>

      <section aria-labelledby="off-spots-h" style={box}>
        <h2 id="off-spots-h" style={h2}>Tes spots bateau</h2>
        {spots.length > 0 && <BoatMap spots={spots} scores={mapScores} selected={selSpot?.id} onPick={setSel} />}
        {!spots.length && form !== "spot" && <p style={{ ...muted, marginTop: 0 }}>Aucun spot pour l'instant. Ajoute ta première marque : en mer avec le GPS du téléphone, ou depuis la carte.</p>}
        {spots.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
            {spots.map((s) => {
              const w = windows[s.id];
              return (
                <button key={s.id} type="button" aria-pressed={s.id === selSpot?.id} onClick={() => setSel(s.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 48, padding: "6px 4px", border: "none", borderTop: `1px solid ${C.line2}`, background: s.id === selSpot?.id ? "#0f2540" : "none", color: C.text, textAlign: "left", cursor: "pointer" }}>
                  <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: "50%", background: w?.best ? scoreColor(w.best.sc, true) : OFF_COLOR, flexShrink: 0 }} />
                  <span style={{ flex: 1, minWidth: 0 }}><b style={{ color: C.strong }}>{s.name}</b><span style={{ display: "block", fontSize: 12.5, color: C.muted }}>{BOAT_TYPES[s.type]}{s.depth ? ` · ${s.depth} m` : ""}</span></span>
                  {w?.best && <span style={{ fontWeight: 800, color: scoreColor(w.best.sc, true), fontVariantNumeric: "tabular-nums" }}>{fr(w.best.sc)}</span>}
                </button>
              );
            })}
          </div>
        )}
        {form === "spot" || form?.edit ? (
          <div style={{ marginTop: 12 }}><BoatSpotForm initial={form?.edit || null} onCancel={() => setForm(null)}
            onSave={(rec) => { saveSpots([...spotsAll.filter((x) => x.id !== rec.id), rec]); setSel(rec.id); setForm(null); }} /></div>
        ) : <button type="button" onClick={() => setForm("spot")} style={{ ...btn(OFF_COLOR, true), width: "100%", marginTop: 10 }}>＋ Ajouter un spot bateau</button>}
      </section>

      {selSpot && (
        <section aria-labelledby="off-cond-h" style={box}>
          <h2 id="off-cond-h" style={h2}>Conditions · {selSpot.name}</h2>
          <div role="group" aria-label="Jour" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {days.map((d, i) => <Chip key={d} color={C.accent} active={dayI === i} onClick={() => setDayI(i)}>{dayLbl(d, i)}</Chip>)}
          </div>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.55 }}>
            <b>{longDay(dateISO).replace(/^./, (c) => c.toUpperCase())}</b>
            {windows[selSpot.id]?.best && <span> · meilleur moment {String(windows[selSpot.id].best.h).padStart(2, "0")}h–{String(windows[selSpot.id].best.h + 3).padStart(2, "0")}h, note <b style={{ color: scoreColor(windows[selSpot.id].best.sc, true) }}>{fr(windows[selSpot.id].best.sc)}</b></span>}
            {dayCond && <span style={{ display: "block", color: C.muted, fontSize: 13.5 }}>
              {dayCond.sst != null ? `Eau ${fr(dayCond.sst)} °C · ` : ""}{dayCond.pressure != null ? `pression ${Math.round(dayCond.pressure)} hPa` : ""}{dayCond.dp24 != null ? ` (${dayCond.dp24 >= 0 ? "+" : "−"}${fr(Math.abs(dayCond.dp24), 0)} sur 24 h)` : ""}</span>}
            <span style={{ display: "block", color: C.muted, fontSize: 13.5 }}>
              {tide ? <>Marée de {tide.label} (guide {tide.guide}) : {dayEvents.map((e) => `${e.type} ${hh(e.ms)}${e.type === "PM" && e.coef ? ` (coef ${e.coef})` : ""}`).join(" · ") || "—"}</> : "Marée : aucun port de guide à moins de 40 km."}
            </span>
          </div>
          {wxState.busy && !ser && <p style={muted}>Météo en cours de téléchargement…</p>}
          {wxState.error && <p style={{ ...muted, color: "#fbbf24" }}>{wxState.error}{wx?.at ? ` — météo affichée : celle de ${hh(wx.at)}` : ""}</p>}
          {ser ? (
            <div style={{ overflowX: "auto", marginTop: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, fontVariantNumeric: "tabular-nums" }}>
                <caption className="sr">Conditions heure par heure, {longDay(dateISO)}, {selSpot.name}</caption>
                <thead><tr style={{ color: C.muted, textAlign: "left" }}>
                  <th scope="col" style={{ padding: "4px 6px" }}>Heure</th><th scope="col" style={{ padding: "4px 6px" }}>Vent</th><th scope="col" style={{ padding: "4px 6px" }}>Vagues</th><th scope="col" style={{ padding: "4px 6px" }}>Houle</th>
                  {model.ok && <th scope="col" style={{ padding: "4px 6px" }}>Note</th>}
                </tr></thead>
                <tbody>
                  {HOURS.map((h) => { const r = rowAt(h), sc = windows[selSpot.id]?.per?.[h]; return (
                    <tr key={h} style={{ borderTop: `1px solid ${C.line2}` }}>
                      <th scope="row" style={{ padding: "6px", textAlign: "left", fontWeight: 600 }}>{String(h).padStart(2, "0")}h</th>
                      <td style={{ padding: "6px" }}>{r?.wind != null ? `${dir16(r.dir)} ${Math.round(r.wind)} km/h` : "–"}{r?.gust != null ? <span style={{ display: "block", color: C.muted, fontSize: 12.5 }}>raf. {Math.round(r.gust)}</span> : null}</td>
                      <td style={{ padding: "6px" }}>{r?.wave != null ? `${fr(r.wave)} m` : "–"}{r?.period != null ? <span style={{ display: "block", color: C.muted, fontSize: 12.5 }}>{fr(r.period, 0)} s · {dir16(r.waveDir)}</span> : null}</td>
                      <td style={{ padding: "6px" }}>{r?.swell != null ? `${fr(r.swell)} m` : "–"}{r?.swellPeriod != null ? <span style={{ display: "block", color: C.muted, fontSize: 12.5 }}>{fr(r.swellPeriod, 0)} s{r.swellDir != null ? ` · ${dir16(r.swellDir)}` : ""}</span> : null}</td>
                      {model.ok && <td style={{ padding: "6px", fontWeight: 800, color: sc != null ? scoreColor(sc, true) : C.faint }}>{sc != null ? fr(sc) : "–"}</td>}
                    </tr>); })}
                </tbody>
              </table>
            </div>
          ) : !wxState.busy && <p style={muted}>Météo non disponible pour l'instant.</p>}
          <p style={muted}>{wx?.at ? `Open-Meteo (${wx.model}), téléchargée à ${hh(wx.at)}${wx.marineOk ? "" : " · vagues indisponibles"}.` : ""}{model.ok ? ` Note : ${MIN_TRIPS} sorties au moins, 5 = ta moyenne, +2,5 par doublement des prises attendues (créneau de 3 h qui commence à l'heure dite).` : ""}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <button type="button" onClick={() => loadWx(true)} disabled={wxState.busy} style={btn(C.accent, false)}>↻ Météo</button>
            <button type="button" onClick={() => setForm({ edit: selSpot })} style={btn(C.accent, false)}>Modifier le spot</button>
            {confirm === selSpot.id ? (<>
              <button type="button" onClick={() => { saveSpots([...spotsAll.filter((x) => x.id !== selSpot.id), { id: selSpot.id, deleted: true, updatedAt: Date.now() }]); setConfirm(null); setSel(null); }} style={btn(C.bad, true)}>Oui, supprimer</button>
              <button type="button" onClick={() => setConfirm(null)} style={btn(C.muted, false)}>Non</button>
            </>) : <button type="button" onClick={() => setConfirm(selSpot.id)} style={btn(C.bad, false)}>Supprimer</button>}
          </div>
          {confirm === selSpot.id && <p role="status" style={muted}>Supprimer « {selSpot.name} » ? Ses sorties restent dans le modèle.</p>}
        </section>
      )}

      <section aria-labelledby="off-trips-h" style={box}>
        <h2 id="off-trips-h" style={h2}>Tes sorties</h2>
        {form === "trip" ? (
          <TripForm spots={spots} spotId={selSpot?.id} today={today} onCancel={() => setForm(null)} onSave={(t) => { saveTrips([...tripsAll, t]); setForm(null); tried.current.add(t.id); fillCond(t); }} />
        ) : spots.length ? <button type="button" onClick={() => setForm("trip")} style={{ ...btn(C.good, true), width: "100%" }}>＋ Enregistrer une sortie</button>
          : <p style={{ ...muted, marginTop: 0 }}>Ajoute d'abord un spot bateau.</p>}
        {trips.length > 0 && (
          <ul aria-label="Sorties enregistrées" style={{ listStyle: "none", margin: "12px 0 0", padding: 0 }}>
            {trips.slice(0, 30).map((t) => (
              <li key={t.id} style={{ padding: "8px 2px", borderTop: `1px solid ${C.line2}`, fontSize: 14, lineHeight: 1.5 }}>
                <b>{shortDate(t.date)} · {spName(t.spotId)}</b> <span style={{ color: C.muted }}>{t.start.replace(":", "h")}–{t.end.replace(":", "h")}</span>
                <span style={{ display: "block" }}>{catchTxt(t)}</span>
                <span style={{ display: "block", fontSize: 12.5, color: t.cond ? C.muted : "#fbbf24" }}>
                  {t.cond ? `Conditions : ${t.cond.wind != null ? `vent ${Math.round(t.cond.wind)} km/h` : "vent ?"}${t.cond.wave != null ? `, vagues ${fr(t.cond.wave)} m` : ""}${t.cond.coef != null ? `, coef ${Math.round(t.cond.coef)}` : ""}${t.cond.src ? ` — ${t.cond.src}` : ""}` : "Conditions à compléter (réseau indisponible ?)"}
                </span>
                <span style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  {!t.cond && <button type="button" onClick={() => fillCond(t)} style={{ ...btn(C.accent, false), minHeight: 44 }}>Compléter les conditions</button>}
                  {confirm === t.id ? (<>
                    <button type="button" onClick={() => { saveTrips([...tripsAll.filter((x) => x.id !== t.id), { id: t.id, deleted: true, updatedAt: Date.now() }]); setConfirm(null); }} style={{ ...btn(C.bad, true), minHeight: 44 }}>Oui, supprimer la sortie</button>
                    <button type="button" onClick={() => setConfirm(null)} style={{ ...btn(C.muted, false), minHeight: 44 }}>Non</button>
                  </>) : <button type="button" onClick={() => setConfirm(t.id)} aria-label={`Supprimer la sortie du ${shortDate(t.date)} à ${spName(t.spotId)}`} style={{ ...btn(C.muted, false), minHeight: 44 }}>Supprimer</button>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="off-model-h" style={box}>
        <h2 id="off-model-h" style={h2}>Ton modèle</h2>
        <label htmlFor="off-species" style={{ ...lbl, marginTop: 0 }}>Espèce</label>
        <select id="off-species" style={inp} value={species} onChange={(e) => { setSpecies(e.target.value); setCurveK(null); }}>
          <option value="all">Toutes espèces</option>
          {speciesSeen.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        {!model.ok ? (
          <div style={{ marginTop: 10 }}>
            <p style={{ margin: 0, fontSize: 14 }}>Pas encore de note : {model.reason}.</p>
            <div aria-hidden="true" style={{ height: 8, borderRadius: 4, background: C.line2, marginTop: 8 }}><div style={{ height: 8, borderRadius: 4, width: `${Math.min(100, (model.n / MIN_TRIPS) * 100)}%`, background: OFF_COLOR }} /></div>
            <p style={muted}>Le modèle relie le nombre de prises par heure aux conditions de chaque sortie (vent, rafales, vagues, période, houle, eau, pression et sa variation, nuages, coefficient, moment de la marée, heure, saison) et au spot. Note toutes tes sorties, même sans prise.</p>
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>Ajusté sur <b>{model.n} sorties</b> (fiabilité {reliabilityOf(model.n)}) · {model.totalCatch} prise{model.totalCatch > 1 ? "s" : ""} en {fr(model.hours)} h · ta moyenne : <b>{fr(model.meanRate, 2)} prise{model.meanRate >= 2 ? "s" : ""} par heure</b>.</p>
            <ul aria-label="Effet de chaque variable" style={{ margin: "10px 0 0", padding: "0 0 0 18px", fontSize: 13.5, lineHeight: 1.55 }}>
              {effects.slice(0, 6).map((e) => (
                <li key={e.k}><b>{e.label}</b> : prises × {fr(e.ratio)} entre le plus bas et le plus haut de la courbe —{" "}
                  {e.cyc ? `le mieux vers ${e.k === "tideH" ? `${fr(e.best)} h après la pleine mer` : e.k === "hour" ? `${Math.round(e.best) % 24} h` : new Date(Date.UTC(2026, 0, Math.round(e.best))).toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" })}`
                    : `${e.rising ? "plus la valeur est haute" : "plus la valeur est basse"}, plus tu prends (de ${fr(e.lo, e.d)} à ${fr(e.hi, e.d)}${e.unit ? " " + e.unit : ""})`}.</li>
              ))}
            </ul>
            {effects.length > 0 && (<>
              <label htmlFor="off-curve" style={lbl}>Courbe de régression</label>
              <select id="off-curve" style={inp} value={cv?.k || ""} onChange={(e) => setCurveK(e.target.value)}>
                {effects.map((e) => <option key={e.k} value={e.k}>{e.label}</option>)}
              </select>
              {cv && <Curve cv={cv} />}
              <p style={muted}>Ligne : prises par heure attendues quand cette variable change, les autres à leur moyenne. Points : tes sorties. Les effets sont amortis tant que les sorties sont peu nombreuses ; un lien n'est pas une cause.</p>
            </>)}
          </div>
        )}
      </section>

      <p style={{ ...muted, marginTop: 14 }}>
        {sync.state === "off" ? "Gardé sur cet appareil. Pour une copie sur GitHub, active la sauvegarde dans les Réglages d'un guide." : sync.state === "busy" ? "Sauvegarde GitHub en cours…" : sync.state === "ok" ? "Sauvegardé sur GitHub (offshore.json)." : sync.state === "error" ? `Sauvegarde GitHub impossible : ${sync.reason}.` : ""}
        {" "}<button type="button" onClick={exportJson} style={{ background: "none", border: "none", color: C.accent, fontSize: 13, textDecoration: "underline", cursor: "pointer", minHeight: 44, padding: 0 }}>Exporter (JSON)</button>
      </p>
    </div>
  );
}
