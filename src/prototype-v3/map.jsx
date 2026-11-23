// SPUMY V3 — Carte et Météo de la version 5 (fond schématique). REMPLACÉ en version 6 par carte6.jsx et geomap.jsx (V3-028) :
// plus importé, gardé pour mémoire jusqu'à la revalidation de la version 6.
import { useEffect, useRef, useState } from "react";
import { tierOf, FAVORABLE_MIN } from "../design/v3/tokens.js";
import { Gauge, Safety, Icon } from "./ui.jsx";
import { SPOTS, SPOT, MARKS, REF, favorable, windAt, waveAt, compass, hhmm, span, NOW } from "./data.js";

const COAST = [[380, 0], [320, 200], [292, 262], [360, 340], [372, 420], [300, 498], [262, 522], [430, 556], [452, 566], [500, 620], [516, 646], [360, 680], [322, 704], [420, 780], [556, 826], [440, 880], [414, 904], [600, 960], [606, 986], [640, 1080], [698, 1146], [560, 1190], [496, 1214], [520, 1300]];
function smooth(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}
const SHORE = smooth(COAST);
const LAND = `${SHORE} L1000,1300 L1000,0 Z`;
const DEPTHS = [60, 130, 210].map((o) => smooth(COAST.map(([x, y]) => [Math.max(0, x - o), y])));

/**
 * Fond de carte déplaçable et zoomable : glisser (doigt ou souris), molette, pincement, double-clic, boutons + et −.
 * Les pastilles gardent leur taille à l'écran (--k). Un glissement n'ouvre pas la pastille sous le doigt.
 */
export function Base({ children, overlay, items, renderItem, compact, start }) {
  const box = useRef(null), ptrs = useRef(new Map()), g = useRef(null);
  const [v, setV] = useState({ k: 1, x: 0, y: 0 });
  // Le contenu garde les proportions de la carte (1000 × 1300) sur toute la largeur ; la fenêtre peut être plus basse.
  // Zoom minimal = vue d'ensemble (toute la carte visible) ; au-delà, la carte se déplace dans ses limites.
  const dims = () => { const r = box.current.getBoundingClientRect(); return { w: r.width, h: r.height, kMin: Math.min(1, r.height / (r.width * 1.3)) }; };
  const [width, setWidth] = useState(0);
  const clamp = (k, x, y) => {
    const { w, h, kMin } = dims(), kk = Math.min(4, Math.max(kMin, k)), cw = w * kk, ch = w * 1.3 * kk;
    const cx = cw <= w ? (w - cw) / 2 : Math.min(0, Math.max(w - cw, x)), cy = ch <= h ? (h - ch) / 2 : Math.min(0, Math.max(h - ch, y));
    return { k: kk, x: cx, y: cy };
  };
  const fit = () => {
    const { w, h, kMin } = dims();
    if (start) { const sc = (w * start.k) / 1000; setV(clamp(start.k, w / 2 - start.x * sc, h / 2 - start.y * sc)); }
    else setV(clamp(kMin, 0, 0));
  };
  useEffect(() => { const f = () => { setWidth(box.current.getBoundingClientRect().width); fit(); }; f(); const ro = new ResizeObserver(f); ro.observe(box.current); return () => ro.disconnect(); }, []);
  // Regroupement : les pastilles à moins de 48 px l'une de l'autre à l'écran forment un groupe avec leur nombre.
  const groups = [];
  if (items && width) {
    const sc = (width * v.k) / 1000;
    for (const it of [...items].sort((a, b) => (b.fav ?? -1) - (a.fav ?? -1))) {
      const g = groups.find((q) => Math.hypot(q.sx - it.x * sc, q.sy - it.y * sc) < 48);
      if (g) { g.items.push(it); g.sx = g.items.reduce((m, i) => m + i.x * sc, 0) / g.items.length; g.sy = g.items.reduce((m, i) => m + i.y * sc, 0) / g.items.length; }
      else groups.push({ items: [it], sx: it.x * sc, sy: it.y * sc });
    }
  }
  const zoomAt = (f, cx, cy, from) => { const v0 = from || v, { kMin } = dims(), k = Math.min(4, Math.max(kMin, v0.k * f)), q = k / v0.k; setV(clamp(k, cx - (cx - v0.x) * q, cy - (cy - v0.y) * q)); };
  const local = (e) => { const r = box.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  useEffect(() => {
    const el = box.current;
    const wheel = (e) => { e.preventDefault(); const [cx, cy] = local(e); setV((v0) => { const k = Math.min(4, Math.max(dims().kMin, v0.k * Math.exp(-e.deltaY * 0.0015))), q = k / v0.k; return clamp(k, cx - (cx - v0.x) * q, cy - (cy - v0.y) * q); }); };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);
  const down = (e) => {
    ptrs.current.set(e.pointerId, local(e));
    const pts = [...ptrs.current.values()];
    g.current = pts.length === 1 ? { mode: "pan", s: pts[0], v0: v, moved: false } : { mode: "pinch", d0: Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]), c: [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2], v0: v, moved: true };
  };
  const move = (e) => {
    if (!ptrs.current.has(e.pointerId) || !g.current) return;
    ptrs.current.set(e.pointerId, local(e));
    const G = g.current, pts = [...ptrs.current.values()];
    if (G.mode === "pan") {
      const dx = pts[0][0] - G.s[0], dy = pts[0][1] - G.s[1];
      if (!G.moved && Math.abs(dx) + Math.abs(dy) > 5) { G.moved = true; box.current.setPointerCapture?.(e.pointerId); box.current.classList.add("panning"); }
      if (G.moved) setV(clamp(G.v0.k, G.v0.x + dx, G.v0.y + dy));
    } else if (pts.length >= 2) {
      const d = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
      zoomAt(d / G.d0, G.c[0], G.c[1], G.v0);
    }
  };
  const up = (e) => {
    ptrs.current.delete(e.pointerId);
    const G = g.current;
    if (!ptrs.current.size) { g.current = null; box.current.classList.remove("panning"); }
    if (G?.moved) { const el = box.current, stop = (ev) => { ev.preventDefault(); ev.stopPropagation(); }; el.addEventListener("click", stop, { capture: true, once: true }); setTimeout(() => el.removeEventListener("click", stop, { capture: true }), 0); }
  };
  const center = () => { const r = box.current.getBoundingClientRect(); return [r.width / 2, r.height / 2]; };
  return (
    <div className="mapbox" ref={box} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDoubleClick={(e) => { const [cx, cy] = local(e); zoomAt(2, cx, cy); }}>
      <div className="pz" style={{ transform: `translate(${v.x}px, ${v.y}px) scale(${v.k})`, "--k": v.k }}>
        <svg className="map" viewBox="0 0 1000 1300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <defs><linearGradient id="seaGrad" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="var(--map-sea)" stopOpacity="1" /><stop offset="1" stopColor="var(--map-sea)" stopOpacity=".7" /></linearGradient></defs>
          <rect className="sea" x="0" y="0" width="1000" height="1300" />
          {DEPTHS.map((d, i) => <path key={i} className="depth" d={d} />)}
          <path className="land" d={LAND} strokeLinejoin="round" />
          {overlay}
        </svg>
        <div className="mklayer">{items ? groups.map((g) => g.items.length === 1 ? renderItem(g.items[0]) : (
          <button key={g.items.map((i) => i.id).join("-")} className="mk cluster" style={pos(g.sx / ((width * v.k) / 1000), g.sy / ((width * v.k) / 1000))}
            aria-label={`Groupe de ${g.items.length} spots : ${g.items.map((i) => i.name).join(", ")} ; zoomer`} data-n={g.items.length}
            onClick={() => zoomAt(2.2, v.x + g.sx, v.y + g.sy)}>{g.items.length}</button>)) : children}</div>
      </div>
      {!compact && <div className="zoom" onPointerDown={(e) => e.stopPropagation()}>
        <button aria-label="Zoomer" onClick={() => zoomAt(1.5, ...center())}><Icon name="plus" size={20} /></button>
        <button aria-label="Dézoomer" onClick={() => zoomAt(1 / 1.5, ...center())}><Icon name="minus" size={20} /></button>
        <button aria-label="Vue d'ensemble" onClick={fit}><Icon name="fit" size={20} /></button>
      </div>}
      {!compact && <span className="maptag">Fond schématique · démonstration</span>}
    </div>
  );
}

const PEEK = 132;
/** Règle d'inclusion de chaque filtre (référentiel § 6.9) : dite sous la carte et lue avec le filtre. */
const RULE = {
  all: "Tous : les spots à 1 h de route ou moins de ta position.",
  fav: `Favorables : ${FAVORABLE_MIN} ou plus, sécurité OK et rien à vérifier.`,
  verify: "À vérifier : sécurité, accès ou données à confirmer avant d'y aller ; leur score ne change pas.",
  mine: "Mes spots : ceux que tu as ajoutés.",
};
const pos = (x, y) => ({ left: `${x / 10}%`, top: `${y / 13}%` });

function Marker({ s, selected, onSelect }) {
  const t = tierOf(s.fav);
  const cls = ["mk", s.status === "verify" ? "verify" : "", s.status === "nr" ? "nr" : "", !t ? "empty" : "", selected ? "sel" : ""].join(" ");
  const label = `${s.name}, ${s.fav ?? "sans note"}${t ? `/100, ${t.word}` : ""}${s.status === "verify" ? ", à vérifier" : s.status === "nr" ? ", non recommandé" : ""}${s.route ? `, à ${s.route} min` : ""}`;
  return (
    <button className={cls} style={pos(s.x, s.y)} aria-label={label} aria-pressed={selected} onClick={() => onSelect(s.id)}>
      <span className="cap" style={t && s.status !== "nr" ? { background: `var(--tier-${t.id})` } : undefined} />
      {s.status === "verify" && <span className="ic" aria-hidden="true"><Icon name="warn" size={14} /></span>}
      <span className="lbl">{s.fav ?? "–"}</span>
    </button>
  );
}

export function Carte({ st, go, sel, setSel, notify }) {
  const bateau = st.mode === "bateau";
  const [filter, setFilter] = useState("all");
  const [list, setList] = useState(false);
  const [search, setSearch] = useState(false);
  // Feuille glissante : trois hauteurs (réduite, à moitié, ouverte), au doigt ou à la souris, puis aimantée.
  const [snap, setSnap] = useState("peek");
  const [drag, setDrag] = useState(null);
  const sheet = useRef(null), sd = useRef(null);
  const heights = () => { const H = sheet.current.parentElement.getBoundingClientRect().height; return { peek: PEEK, half: Math.round(H * 0.55), full: Math.round(H * 0.92) }; };
  const sDown = (e) => { if (e.target.closest("button")) return; sd.current = { y: e.clientY, h: sheet.current.getBoundingClientRect().height }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const sMove = (e) => { if (!sd.current) return; const hs = heights(); setDrag(Math.max(hs.peek, Math.min(hs.full, sd.current.h - (e.clientY - sd.current.y)))); };
  const sUp = () => { if (!sd.current) return; sd.current = null; if (drag !== null) { const hs = heights(); const best = Object.entries(hs).sort((a, b) => Math.abs(a[1] - drag) - Math.abs(b[1] - drag))[0][0]; setSnap(best); setList(best === "full"); } setDrag(null); };
  const items = bateau ? MARKS.map((m) => ({ ...m, fav: m.status ? null : Math.max(...m.species.map((x) => x.fav)), mine: true })) : SPOTS;
  const F = bateau ? { all: items } : { all: items, fav: items.filter(favorable), verify: items.filter((s) => s.status === "verify"), mine: items.filter((s) => s.mine) };
  const shown = F[filter] || items;
  const ranked = [...shown].sort((a, b) => (b.fav ?? -1) - (a.fav ?? -1));
  const cur = items.find((s) => s.id === sel) || null;
  const chips = bateau ? [["all", "Mes marques"]] : [["all", "Tous"], ["fav", "Favorables"], ["verify", "À vérifier"], ["mine", "Mes spots"]];
  const preview = (s) => (
    <div className="card" style={{ boxShadow: "none", border: 0, padding: 0 }}>
      <div className="row between"><span className="spotname">{bateau ? `Marque « ${s.name} »` : s.name}</span>{s.win && <span className="time-big" style={{ fontSize: 20 }}>{span(s.win)}</span>}</div>
      <Gauge label={bateau ? "Meilleure espèce" : "Favorabilité"} value={s.fav} word={s.status === "verify" ? "À vérifier" : s.status === "nr" ? "Non recommandé" : undefined} />
      <div className="row"><Safety s={s} />{!bateau && <span className="meta num">{s.verified ? `${s.route} min` : `~${s.route} min`} · Confiance {s.conf} — {s.level}</span>}</div>
      {!bateau && <div className="row"><a className="btn primary grow" href={`#spot-${s.id}`} onClick={() => go("spot", s.id)}>Ouvrir la fiche</a><button className="btn" onClick={() => setList(true)}>Liste</button></div>}
    </div>
  );
  return (
    <div className="screen flush split">
      <h1 className="vh">Carte des spots</h1>
      <aside className="side" aria-label="Liste classée">
        {ranked.map((s) => <button key={s.id} className="card" style={{ textAlign: "left" }} onClick={() => setSel(s.id)} aria-pressed={sel === s.id}>{preview(s)}</button>)}
      </aside>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="screen" style={{ gap: 8, paddingBottom: 8, flex: "none" }}>
          {search && <label className="field"><span className="vh">Rechercher un spot</span><input autoFocus placeholder="Rechercher un spot" /></label>}
          <div className="chips" role="group" aria-label="Filtres">
            <button className="chip" aria-pressed={search} aria-label="Rechercher un spot" onClick={() => setSearch(!search)}><Icon name="search" size={18} /></button>
            {chips.map(([k, l]) => <button key={k} className="chip" aria-pressed={filter === k} title={RULE[k]} aria-description={RULE[k]} onClick={() => setFilter(k)}>{l} <span className="num">{(F[k] || []).length}</span></button>)}
          </div>
        </div>
        <div className="stage">
        <div className="mapwrap" style={{ paddingBottom: PEEK }}>
          <Base overlay={<circle cx={REF.x} cy={REF.y} r="16" fill="none" stroke="var(--text-primary)" strokeWidth="7" />}
            items={shown} renderItem={(s) => <Marker key={s.id} s={s} selected={sel === s.id} onSelect={(id) => { setSel(id); setSnap("half"); setList(false); }} />} />
          <button className="fab" style={{ top: 12 }} aria-label="Me géolocaliser" onClick={() => notify("Position du téléphone : ±30 m")}><Icon name="locate" /></button>
          <button className="fab" style={{ top: 64 }} aria-label="Couches" onClick={() => notify(bateau ? "Couches : plan, photo aérienne, carte marine (bonus à étudier)" : "Couches : plan, photo aérienne")}><Icon name="layers" /></button>
        </div>
        <div className={`sheet snap-${snap}`} ref={sheet} style={drag !== null ? { height: drag } : undefined}>
          <div className="sheet-head" onPointerDown={sDown} onPointerMove={sMove} onPointerUp={sUp} onPointerCancel={sUp}>
            <button className="grip" aria-label={`Panneau : ${snap === "peek" ? "réduit" : snap === "half" ? "à moitié" : "ouvert"} ; toucher pour changer`} onClick={() => setSnap(snap === "peek" ? "half" : snap === "half" ? "full" : "peek")} />
            <Legend />
          </div>
          <div className="sheet-body" tabIndex={0} role="region" aria-label="Spot choisi ou liste classée">
          {list || snap === "full" ? (
            <ul className="list" aria-label="Liste classée">{ranked.map((s, i) => (
              <li key={s.id}><button className="lrow" style={{ width: "100%", background: "none", border: 0, textAlign: "left" }} onClick={() => { setSel(s.id); setList(false); }}>
                <span><b>{i + 1}. {s.name}</b> <span className="meta num">{s.win ? span(s.win) : ""}</span></span><span className="num">{s.fav ?? "—"}</span></button></li>))}</ul>
          ) : cur ? preview(cur) : <p className="meta">{!bateau && <><b>{RULE[filter]}</b><br /></>}Touche une pastille pour voir le spot, ou fais glisser le panneau vers le haut pour la liste classée.</p>}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export function Legend() {
  return (
    <div className="legend" aria-label="Légende">
      {["0–19", "20–39", "40–59", "60–74", "75–89", "90–100"].map((l, i) => <span key={l}><i style={{ background: `var(--tier-${i})` }} />{l}</span>)}
      <span><Icon name="warn" size={14} />à vérifier</span><span><s>45</s> non recommandé</span><span>– sans note</span>
    </div>
  );
}

/* Météo : flèches de vent sur une grille de points autour de la position de référence (aucune zone nommée). */
const GRID = [];
for (let gy = 140; gy <= 1220; gy += 216) for (let gx = 130; gx <= 870; gx += 185) GRID.push([gx, gy]);

function Arrow({ x, y, deg, len, strength, warn, label, sub }) {
  const to = ((deg + 180) * Math.PI) / 180, ux = Math.sin(to), uy = -Math.cos(to), px = -uy, py = ux;
  const L = len, w = 7 + strength * 7, tipX = x + ux * L / 2, tipY = y + uy * L / 2, tailX = x - ux * L / 2, tailY = y - uy * L / 2;
  const nX = tipX - ux * 30, nY = tipY - uy * 30;
  const shape = [[tailX + px * w * 0.35, tailY + py * w * 0.35], [nX + px * w * 0.5, nY + py * w * 0.5], [nX + px * w * 1.5, nY + py * w * 1.5], [tipX, tipY],
    [nX - px * w * 1.5, nY - py * w * 1.5], [nX - px * w * 0.5, nY - py * w * 0.5], [tailX - px * w * 0.35, tailY - py * w * 0.35]].map((q) => q.map((v) => v.toFixed(1)).join(",")).join(" ");
  return (
    <g>
      <polygon points={shape} fill="var(--text-primary)" fillOpacity={0.35 + strength * 0.65} />
      <g transform={`translate(${tailX - ux * 26},${tailY - uy * 26})`}>
        <rect x="-30" y="-19" width="60" height="38" rx="19" fill={warn ? "var(--warning-soft)" : "var(--surface-card)"} stroke={warn ? "var(--warning-ink)" : "var(--border-strong)"} strokeWidth="3" />
        <text textAnchor="middle" y="9" fontSize="25" fontWeight="800" fill={warn ? "var(--warning-ink)" : "var(--text-primary)"} fontFamily="var(--font-numeric)">{label}</text>
      </g>
      {sub && <title>{sub}</title>}
    </g>
  );
}

function Chart({ series, unit }) {
  const W = 320, H = 92, max = Math.max(...series.flatMap((s) => s.v)) * 1.1;
  const path = (v) => v.map((y, i) => `${i ? "L" : "M"}${(i / (v.length - 1)) * (W - 20) + 10},${H - 14 - (y / max) * (H - 26)}`).join(" ");
  return (
    <figure className="chart"><figcaption className="meta">{series.map((s) => `${s.dash ? "pointillé" : "trait"} : ${s.name}`).join(" · ")} ({unit}), sur 24 h</figcaption>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={series.map((s) => s.name).join(" et ")} data-noswipe>
      <line x1="10" x2={W - 10} y1={H - 14} y2={H - 14} stroke="var(--border-strong)" />
      {series.map((s) => <path key={s.name} d={path(s.v)} fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeDasharray={s.dash ? "5 4" : undefined} />)}
      {["maint.", "+6 h", "+12 h", "+18 h", "+24 h"].map((t, i) => <text key={t} x={10 + i * ((W - 20) / 4)} y={H - 1} fontSize="12" fill="var(--text-muted)" textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}>{t}</text>)}
      </svg></figure>
  );
}

export function Meteo({ st, go }) {
  const bateau = st.mode === "bateau";
  const [off, setOff] = useState(0);
  const [layer, setLayer] = useState("vent");
  const h = Math.floor(NOW) + off;
  const here = windAt(REF.x, REF.y, h), wv = waveAt(REF.x - 300, REF.y, h);
  const sea = bateau && layer === "mer";
  return (
    <div className="screen flush">
      <h1 className="vh">Météo : vent heure par heure</h1>
      <div className="screen" style={{ gap: 8, paddingBottom: 8 }}>
        {bateau && <div className="seg2" role="tablist" aria-label="Couche"><button role="tab" aria-selected={layer === "vent"} onClick={() => setLayer("vent")}>Vent</button><button role="tab" aria-selected={layer === "mer"} onClick={() => setLayer("mer")}>Mer</button></div>}
        <div className="row between">
          <div className="chips" role="group" aria-label="Jour">{[["Aujourd'hui", 0], ["Demain", 24 - Math.floor(NOW) + 9], ["7 jours", null]].map(([l, v]) => <button key={l} className="chip" aria-pressed={v !== null && (v === 0 ? off < 24 - Math.floor(NOW) : off >= 24 - Math.floor(NOW))} onClick={() => v !== null && setOff(v)}>{l}</button>)}</div>
          <span className="num" style={{ fontWeight: 800, fontSize: 20 }}>{off >= 24 - Math.floor(NOW) ? "demain " : ""}{hhmm(h)}</span>
        </div>
        <label className="field" data-noswipe><span className="vh">Heure</span><input className="slider" type="range" min="0" max="47" value={off} onChange={(e) => setOff(+e.target.value)} aria-valuetext={hhmm(h)} /></label>
      </div>
      <div className="mapwrap meteo-map">
        <Base overlay={<g>
          {GRID.map(([x, y]) => {
            if (sea) { const w = waveAt(x, y, h); return <Arrow key={`${x}${y}`} x={x} y={y} deg={w.fromDeg} len={70 + w.m * 25} strength={Math.min(1, w.m / 2)} label={String(w.m).replace(".", ",")} sub={`Vagues ${w.m} m, période ${w.s} s, de ${compass(w.fromDeg)}`} />; }
            const w = windAt(x, y, h);
            return <Arrow key={`${x}${y}`} x={x} y={y} deg={w.fromDeg} len={70 + w.kmh * 0.9} strength={Math.min(1, w.bft / 7)} warn={w.bft >= 6} label={String(w.bft)} sub={`Vent de ${compass(w.fromDeg)}, force ${w.bft}, ${w.kmh} km/h, rafales ${w.gust} km/h`} />;
          })}
          {(bateau ? MARKS : SPOTS).map((s) => <g key={s.id}><circle cx={s.x} cy={s.y} r="10" fill="var(--accent)" stroke="var(--palette-navy)" strokeWidth="4" /></g>)}
          <circle cx={REF.x} cy={REF.y} r="16" fill="none" stroke="var(--text-primary)" strokeWidth="8" />
        </g>} />
      </div>
      <div className="screen">
        <div className="wlegend" aria-label="Légende">
          {sea ? <><span><b>Flèche</b> sens des vagues</span><span><b>1,4</b> hauteur en mètres</span></>
            : <><span><b>Flèche</b> sens où souffle le vent, plus marquée s'il est plus fort</span><span><b>4</b> force Beaufort</span><span className="badge warn"><Icon name="warn" size={14} />force 6 et plus</span></>}
          <span><svg width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="var(--accent)" stroke="var(--palette-navy)" strokeWidth="2" /></svg>{bateau ? "tes marques" : "tes spots"}</span>
          <span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="var(--text-primary)" strokeWidth="2.5" /></svg>ta position</span>
        </div>
        {bateau && <p className="meta">Couche <b>Vent</b> : force et sens du vent. Couche <b>Mer</b> : hauteur et sens des vagues. Les deux décrivent la même zone, heure par heure.</p>}
        <div className="row between"><b>Pirou, {hhmm(h)}</b><span className="meta">{sea ? "Open-Meteo Marine" : "Open-Meteo (AROME)"}, 06:00 · démonstration</span></div>
        <div className="ind">
          <div>Vent<b>{compass(here.fromDeg)} {here.bft} Bft</b>{here.kmh} km/h · r. {here.gust}</div>
          <div>Vagues<b>{String(wv.m).replace(".", ",")} m · {wv.s} s</b>houle {compass(wv.fromDeg)}</div>
          <div>Eau<b>13 °C</b></div>
          <div>Pression<b>1 018 hPa ↗</b></div>
          <div>Pluie<b>0 mm</b>couvert</div>
          <div>Vigilance<b>aucune</b>Météo-France 06:00</div>
        </div>
        <div className="card">
          <b>{sea ? "Vagues, 24 h" : "Vent et rafales, 24 h"}</b>
          {sea ? <Chart unit="m" series={[{ name: "hauteur", v: Array.from({ length: 25 }, (_, i) => waveAt(REF.x - 300, REF.y, NOW + i).m) }]} />
            : <Chart unit="km/h" series={[{ name: "vent", v: Array.from({ length: 25 }, (_, i) => windAt(REF.x, REF.y, NOW + i).kmh) }, { name: "rafales", dash: true, v: Array.from({ length: 25 }, (_, i) => windAt(REF.x, REF.y, NOW + i).gust) }]} />}
        </div>
        <p className="meta">Points de prévision régulièrement espacés autour de ta position, sans zone nommée. Rafales et détails : touche une flèche, ou lis le résumé ci-dessus.</p>
        {!bateau && <button className="btn" onClick={() => go("carte")}>Voir les spots sur la carte</button>}
      </div>
    </div>
  );
}

export { SPOT };
