// v8.11 — Ajouter (ou modifier) un de tes spots : position (GPS, carte, coordonnées collées), type, côté de
// l'eau, danger, fond, profondeur, moment de marée. Chaque choix a un « je ne sais pas » : rien n'est inventé.
// v8.14 — Le formulaire ne connaît plus de guide : `resolve(position)` dit à quel guide va le point (accueil :
// le guide de la fiche d'origine la plus proche ; guide : celui-ci, ou un autre si le spot y est déplacé),
// avec ses ports de marée, son estimation du temps de route et sa validation.
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { DIRS8, MY_DANGER, MY_FONDS, MY_PHASES, MY_PROFS, MY_TYPES, MYSPOT_COLOR, MYSPOT_WARN_KM, newMySpotId, parseUserCoords } from "./myspots-core.js";
import { Alert, C, Chip, Muted, num } from "../design/kit.jsx";
import { buttonStyle } from "../design/components.jsx";

const lbl = { display: "block", fontSize: 14, fontWeight: 700, color: C.strong, margin: "14px 0 6px" };
const inp = { width: "100%", boxSizing: "border-box", minHeight: 44, padding: "9px 11px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#060f1e", color: C.text, fontSize: 16 };
const btn = buttonStyle;   // lot 3.7 : style commun (src/design/components.jsx)
const fr1 = (x) => String(Math.round(x * 10) / 10).replace(".", ",");

/** Petite carte : un appui place le spot. */
export function PickMap({ pos, onPick, center, color = MYSPOT_COLOR, label = "Carte : touche l'emplacement du spot" }) {
  const box = useRef(null), map = useRef(null), mk = useRef(null), pick = useRef(onPick);
  pick.current = onPick;
  useEffect(() => {
    if (!box.current || map.current) return undefined;
    const m = L.map(box.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false, fadeAnimation: false, markerZoomAnimation: false })
      .setView(pos ? [pos.lat, pos.lon] : [center.lat, center.lon], pos ? 14 : center.zoom || 11);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 17, attribution: '© <a href="https://www.openstreetmap.org/copyright">contributeurs OpenStreetMap</a>' }).addTo(m);
    m.on("click", (e) => pick.current({ lat: +e.latlng.lat.toFixed(6), lon: +e.latlng.lng.toFixed(6), from: "carte" }));
    map.current = m;
    return () => { try { m.stop(); m.off(); m.remove(); } catch { /* déjà détruite */ } map.current = null; mk.current = null; };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const m = map.current; if (!m) return;
    if (!pos) { if (mk.current) { mk.current.remove(); mk.current = null; } return; }
    if (!mk.current) mk.current = L.circleMarker([pos.lat, pos.lon], { radius: 11, weight: 3, color: "#f8fafc", fillColor: color, fillOpacity: 0.95, className: "myspot-pick" }).addTo(m);
    else mk.current.setLatLng([pos.lat, pos.lon]);
    if (pos.from !== "carte") m.setView([pos.lat, pos.lon], Math.max(m.getZoom(), 14), { animate: false });
  }, [pos]);
  return <div ref={box} role="region" aria-label={label} style={{ position: "relative", zIndex: 0, isolation: "isolate", height: 230, borderRadius: 10, border: `1px solid ${C.line}`, overflow: "hidden", background: "#0b1626" }} />;
}

function Choices({ id, label, value, onChange, items, color = C.accent, hint }) {
  return (
    <div>
      <span id={`ms-${id}`} style={lbl}>{label}</span>
      {hint && <Muted style={{ margin: "-2px 0 6px" }}>{hint}</Muted>}
      <div role="group" aria-labelledby={`ms-${id}`} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {items.map(([k, l]) => <Chip key={k} color={color} active={value === k} onClick={() => onChange(k)}>{l}</Chip>)}
      </div>
    </div>
  );
}

export function MySpotForm({ initial, onSave, onCancel, resolve, center, home = false }) {
  const editing = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [pos, setPos] = useState(initial ? { lat: initial.lat, lon: initial.lon, from: "fiche" } : null);
  const [coordText, setCoordText] = useState("");
  const [gps, setGps] = useState({ state: "idle" });
  const [type, setType] = useState(initial?.type || "pointe");
  const [water, setWater] = useState(initial?.water ?? null);
  const [danger, setDanger] = useState(String(initial?.danger || 2));
  const [fond, setFond] = useState(initial?.fond || "inconnu");
  const [prof, setProf] = useState(initial?.prof || "inconnu");
  const [phase, setPhase] = useState(initial?.phase || "inconnu");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [port, setPort] = useState(initial?.tidePort || "");
  const [minutes, setMinutes] = useState(initial?.minutes ? String(initial.minutes) : "");
  const [err, setErr] = useState("");
  const ctx = pos ? resolve(pos) : null;
  const far = !!ctx && !ctx.ok;
  const near = ctx?.ok ? ctx.near : null;
  const farish = !!near && near.km > MYSPOT_WARN_KM;
  const autoPort = near?.tidePort || ctx?.defaultPort;
  const ports = ctx?.ok ? Object.entries(ctx.ports || {}) : [];
  // Le point change de guide : le port choisi n'existe plus là-bas, on revient au port automatique.
  const ctxKey = ctx?.ok ? ctx.key : null, lastKey = useRef(ctxKey);
  useEffect(() => { if (lastKey.current && ctxKey && lastKey.current !== ctxKey) setPort(""); if (ctxKey) lastKey.current = ctxKey; }, [ctxKey]);

  const useGps = () => {
    if (!navigator.geolocation) { setGps({ state: "error", msg: "Ce navigateur ne donne pas la position." }); return; }
    setGps({ state: "busy" });
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos({ lat: +p.coords.latitude.toFixed(6), lon: +p.coords.longitude.toFixed(6), from: "gps" }); setGps({ state: "ok", acc: p.coords.accuracy }); setErr(""); },
      (e) => setGps({ state: "error", msg: e.code === 1 ? "Position refusée : autorise la localisation pour cette page dans les réglages du navigateur, ou touche la carte." : "Position introuvable pour l'instant (pas de signal ?) : réessaie, ou touche la carte." }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  };
  const useCoords = () => {
    const c = parseUserCoords(coordText);
    if (!c) { setErr(/goo\.gl|maps\.app/.test(coordText) ? "Lien court Google Maps : ouvre-le, fais un appui long sur le point, puis copie les coordonnées affichées (48.23…, -4.57…)." : "Coordonnées illisibles : colle par exemple « 48.2319, -4.5708 » ou un lien Google Maps."); return; }
    setPos({ ...c, from: "texte" }); setErr("");
  };
  const submit = (e) => {
    e?.preventDefault?.();
    if (name.trim().length < 2) return setErr("Donne un nom au spot (2 caractères au moins).");
    if (!pos) return setErr("Place le spot : ta position, un appui sur la carte, ou des coordonnées.");
    if (far) return setErr(ctx.msg);
    if (water == null) return setErr("Indique de quel côté est l'eau quand tu regardes le large depuis ton poste.");
    if ((!editing || ctx.move) && ctx.count >= ctx.max) return setErr(`Tu as déjà ${ctx.max} spots dans le guide ${ctx.guideName} : supprimes-en un pour en ajouter un autre.`);
    const now = Date.now();
    const rec = ctx.sanitize({ id: initial?.id || newMySpotId(now), name, lat: pos.lat, lon: pos.lon, water, type, danger: +danger, fond, prof, phase, notes,
      tidePort: port || null, minutes: minutes ? +minutes : null, createdAt: initial?.createdAt || now, updatedAt: now });
    if (!rec) return setErr("Fiche incomplète : vérifie le nom et la position.");
    onSave(rec, ctx);
  };

  return (
    <form onSubmit={submit} aria-label={editing ? "Modifier ton spot" : "Ajouter un spot"} noValidate>
      <label htmlFor="ms-name" style={{ ...lbl, marginTop: 0 }}>Nom du spot</label>
      <input id="ms-name" style={inp} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="Ex. : la cale du moulin" autoComplete="off" />

      <span style={lbl}>Position</span>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <button type="button" onClick={useGps} disabled={gps.state === "busy"} style={btn(C.accent, true)}>{gps.state === "busy" ? "Localisation…" : "📍 Ma position"}</button>
      </div>
      <PickMap pos={pos} center={center} onPick={(p) => { setPos(p); setErr(""); }} />
      <Muted style={{ marginTop: 6 }}>Touche la carte pour placer le spot, ou colle des coordonnées :</Muted>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <input aria-label="Coordonnées ou lien Google Maps" style={{ ...inp, flex: 1, minWidth: 0 }} value={coordText} onChange={(e) => setCoordText(e.target.value)} placeholder="48.2319, -4.5708 ou lien Maps" autoComplete="off" autoCapitalize="off" spellCheck={false} />
        <button type="button" onClick={useCoords} style={btn(C.accent, false)}>Placer</button>
      </div>
      <div role="status" aria-live="polite" style={{ fontSize: 13.5, color: C.text, marginTop: 8, lineHeight: 1.5, ...num }}>
        {gps.state === "error" && <span style={{ color: "#fca5a5", display: "block" }}>{gps.msg}</span>}
        {pos && <span style={{ display: "block" }}>Position : {String(pos.lat.toFixed(5)).replace(".", ",")} / {String(pos.lon.toFixed(5)).replace(".", ",")}
          {pos.from === "gps" && gps.acc ? ` (GPS, à ±${Math.round(gps.acc)} m)` : pos.from === "carte" ? " (carte)" : ""}</span>}
        {far && <span style={{ display: "block", color: "#fca5a5" }}>{ctx.msg}</span>}
        {ctx?.ok && (home || ctx.move) && <span data-guide={ctx.key} style={{ display: "block", color: C.strong }}>
          {ctx.move ? <>Ce point relève du guide <b>{ctx.guideName}</b> : le spot y sera déplacé.</> : <>Ce spot ira dans le guide <b>{ctx.guideName}</b>.</>}</span>}
        {near && <span style={{ display: "block", color: farish ? "#fbbf24" : C.muted }}>
          Spot du guide le plus proche : {near.name}, à {fr1(near.km)} km{farish ? " — un peu loin : la marée et la zone météo sont celles de ce spot." : "."}</span>}
      </div>

      <Choices id="type" label="Type" value={type} onChange={setType} items={Object.entries(MY_TYPES).map(([k, v]) => [k, v.label])} />
      <Choices id="eau" label="Où est l'eau, face au large ?" value={water == null ? null : String(water)} onChange={(v) => setWater(+v)} items={DIRS8.map(([l, d]) => [String(d), l])}
        hint="Debout sur ton poste, regarde le large : c'est ce côté qui donne le vent et la houle de face." />
      <Choices id="danger" label="Niveau de danger" value={danger} onChange={setDanger} color={C.warn} items={Object.entries(MY_DANGER)}
        hint="Engagé : falaise, vagues ou courant. Le guide ne le propose jamais quand la houle est inconnue ou au-dessus de 1,5 m." />
      <Choices id="fond" label="Fond" value={fond} onChange={setFond} items={Object.entries(MY_FONDS).map(([k, v]) => [k, v.label])} />
      <Choices id="prof" label="Profondeur au poste" value={prof} onChange={setProf} items={Object.entries(MY_PROFS).map(([k, v]) => [k, v.label])} />
      <Choices id="phase" label="Quand ça prend, selon toi" value={phase} onChange={setPhase} color={C.violet} items={Object.entries(MY_PHASES).map(([k, v]) => [k, v.label])}
        hint="Sans réponse, les créneaux suivent la règle générale du bar (3 premières heures de montante, 3 dernières de descendante) ; ton journal les recalera." />

      <label htmlFor="ms-notes" style={lbl}>Ce que tu en sais <span style={{ fontWeight: 500, color: C.muted }}>(facultatif)</span></label>
      <textarea id="ms-notes" style={{ ...inp, minHeight: 84, resize: "vertical" }} maxLength={600} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Accès, parking, postes, leurres qui marchent, dangers…" />

      <details style={{ marginTop: 12 }}>
        <summary style={{ minHeight: 44, display: "flex", alignItems: "center", cursor: "pointer", color: C.accent, fontWeight: 600, fontSize: 14 }}>Marée et temps de route</summary>
        <label htmlFor="ms-port" style={lbl}>Port de marée</label>
        <select id="ms-port" style={inp} value={port} onChange={(e) => setPort(e.target.value)}>
          <option value="">{!ctx?.ok ? "Automatique (place d'abord le spot)" : ctx.ports[autoPort] ? `Automatique : ${ctx.ports[autoPort].label}${near ? ` (celui de ${near.name})` : ""}` : `Automatique : celui de ${near ? near.name : "la fiche la plus proche"}`}</option>
          {ports.map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
        </select>
        <label htmlFor="ms-min" style={lbl}>Temps de route (minutes)</label>
        <input id="ms-min" style={inp} type="number" inputMode="numeric" min="1" max="300" value={minutes} onChange={(e) => setMinutes(e.target.value)}
          placeholder={ctx?.ok ? `Estimé : ${ctx.estimate(pos.lat, pos.lon)} min depuis ${ctx.guideName}` : "Depuis le village du guide"} />
      </details>

      {err && <div style={{ marginTop: 12 }}><Alert tone={C.bad} role="alert">{err}</Alert></div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        <button type="submit" style={btn(C.good, true)}>{editing ? "Enregistrer les modifications" : "Ajouter ce spot"}</button>
        <button type="button" onClick={onCancel} style={btn(C.muted, false)}>Annuler</button>
      </div>
      <Muted>{home ? "Le spot reste sur cet appareil. Si la sauvegarde GitHub est activée, il part avec ton journal à la prochaine ouverture de son guide." : "Le spot reste sur cet appareil, et part avec ton journal sur GitHub si la sauvegarde est activée."}</Muted>
    </form>
  );
}
