// Prototype V6 — carte réelle de la côte (trait de côte IGN), déplaçable et zoomable, pour la Carte et la Météo.
// Repère : 1 unité = 1/1000 de degré de latitude (≈ 111 m). Vue { k, x, y } : écran = x + monde × k.
// Le dessin reste net à tout zoom (viewBox recalculée) ; les pastilles et les noms sont posés en coordonnées d'écran.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { tierOf, TIERS } from "../design/v3/tokens.js";
import { GEO } from "./geo.js";
import { REF } from "./data.js";
import { Icon } from "./ui.jsx";

const K_MAX = 7;

/** Pastille à anneau : disque sombre, score crème, anneau de la couleur du palier ; nom à côté (V3-028). */
export function Ring({ s, selected, onSelect, showLabel, labelSide, ripple, decor }) {
  const t = tierOf(s.fav), nr = s.status === "nr", verify = s.status === "verify";
  const label = `${s.name}, ${s.fav ?? "sans note"}${t ? `/100, ${t.word}` : ""}${verify ? ", à vérifier" : nr ? ", non recommandé" : ""}`;
  // decor : pastille d'illustration (titre des détails, panneau), sans rôle de bouton ; le texte voisin dit la note.
  const Tag = decor ? "span" : "button";
  const act = decor ? { "aria-hidden": true } : { "aria-label": label, "aria-pressed": selected, onClick: () => onSelect(s.id) };
  return (
    <Tag className={`ring${selected ? " sel" : ""}${nr ? " nr" : ""}${verify ? " verify" : ""}${!t ? " empty" : ""}`}
      style={{ "--tier": t && !nr ? `var(--tier-${t.id})` : "var(--v6-ring-muted)", "--fill": t ? (s.fav || 0) / 100 : 0 }}
      {...act}>
      {ripple && <span className="ripple" aria-hidden="true" key={ripple} />}
      <svg className="arc" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="21" className="track" />
        <circle cx="24" cy="24" r="21" className="val" pathLength="100" strokeDasharray={`${t ? s.fav : 0} 100`} />
      </svg>
      <span className="v num">{s.fav ?? "–"}</span>
      {verify && <span className="badge-warn" aria-hidden="true"><Icon name="warn" size={13} /></span>}
      {showLabel && <span className={`nm ${labelSide}`} aria-hidden="true">{s.name}</span>}
    </Tag>
  );
}

/** Légende dépliable : les 6 paliers (et l'échelle du vent sur la Météo). */
export function Legend({ wind }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`legend6${open ? " open" : ""}`} onPointerDown={(e) => e.stopPropagation()}>
      {open && (
        <div className="lg-body" id="lg-body">
          <b>Favorabilité</b>
          <ul>{[...TIERS].reverse().map((t) => <li key={t.id}><i style={{ background: `var(--tier-${t.id})` }} /><span>{t.word}</span><span className="num">{t.min}–{t.max}</span></li>)}</ul>
          <p className="lg-note"><Icon name="warn" size={13} /> à vérifier · <s>45</s> non recommandé · – sans note</p>
          {wind && <><b>Vent (nœuds)</b><div className="wind-scale" aria-hidden="true" /><div className="wind-ticks num"><span>0</span><span>10</span><span>20</span><span>30</span><span>40+</span></div></>}
        </div>
      )}
      <button className="lg-btn" aria-expanded={open} aria-controls="lg-body" onClick={() => setOpen((o) => !o)}>
        <span className="dots" aria-hidden="true">{TIERS.map((t) => <i key={t.id} style={{ background: `var(--tier-${t.id})` }} />)}</span>
        <span>Légende</span><Icon name={open ? "down" : "up"} size={16} />
      </button>
    </div>
  );
}

const R = 23, GAP = 50; // rayon de pastille, pas vertical entre deux pastilles
// Largeur d'un nom (16 px, police du texte), mesurée une fois les polices chargées ; estimation avant.
const widths = new Map();
let ctx2d = null;
const LBL = (it) => {
  const hit = widths.get(it.name);
  if (hit) return hit;
  let wpx = it.name.length * 8.3 + 6;
  try {
    ctx2d = ctx2d || document.createElement("canvas").getContext("2d");
    ctx2d.font = `400 16px ${getComputedStyle(document.documentElement).getPropertyValue("--font-text") || "sans-serif"}`;
    wpx = Math.ceil(ctx2d.measureText(it.name).width) + 2;
    if (document.fonts?.status === "loaded") widths.set(it.name, wpx);
  } catch { /* estimation */ }
  return wpx;
};

/**
 * Disposition à l'écran (maquette de Félix : une colonne de pastilles le long de la côte, noms à gauche) :
 * deux pastilles qui se chevauchent sont écartées verticalement, un trait les relie à leur vraie position ;
 * le regroupement (« +N ») ne sert qu'en dernier recours, quand l'écart ne tient pas dans l'écran.
 */
function arrange(items, scr, yMin, yMax) {
  let nodes = items.map((it) => { const { sx, sy } = scr(it); return { items: [it], sx, sy, x: sx, y: sy }; });
  const relax = () => {
    nodes.forEach((n) => { n.y = n.sy; });
    for (let it = 0; it < 160; it++) {
      let moved = false;
      nodes.sort((a, b) => a.y - b.y || a.sy - b.sy || a.sx - b.sx);
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        if (Math.abs(a.x - b.x) >= 2 * R + 2 || b.y - a.y >= GAP - 0.01) continue;
        const d = (GAP - (b.y - a.y)) / 2; a.y -= d; b.y += d; moved = true;
      }
      if (!moved) return true;
    }
    return false;
  };
  for (let round = 0; round <= items.length; round++) {
    const ok = relax();
    const inside = (n) => n.sy < yMin - R || n.sy > yMax + R || (n.y >= yMin && n.y <= yMax && Math.abs(n.y - n.sy) <= 96);
    if (ok && nodes.every(inside)) break;
    // Dernier recours : réunir les deux spots les plus proches.
    let best = null;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].sx - nodes[j].sx, nodes[i].sy - nodes[j].sy);
      if (!best || d < best.d) best = { i, j, d };
    }
    if (!best || best.d > 3 * GAP) break;
    const a = nodes[best.i], b = nodes[best.j], m = [...a.items, ...b.items].sort((p, q) => (q.fav ?? -1) - (p.fav ?? -1));
    const pts = m.map(scr), sx = pts.reduce((t, p) => t + p.sx, 0) / m.length, sy = pts.reduce((t, p) => t + p.sy, 0) / m.length;
    nodes = nodes.filter((n) => n !== a && n !== b).concat({ items: m, sx, sy, x: sx, y: sy });
  }
  return nodes;
}

/**
 * Carte de base. items : spots { id, x, y, fav, name } ; selected ; onSelect(id).
 * popover(item, pos) : bulle ancrée au spot choisi ; panelW : largeur réservée à droite (panneau Météo) ;
 * Layer : calque dessiné sous les pastilles (vent), reçoit la vue courante ; legend : nœud en bas à gauche ;
 * top : hauteur de l'en-tête posé sur la carte ; focusX : abscisse maximale du spot choisi (bulle ou panneau à sa droite).
 */
export function GeoMap({ items, selected, onSelect, popover, panel, panelW = 0, Layer, legend, onLocate, onLayers, tag, compact, top = 0, focusX, focusBox }) {
  const box = useRef(null), ptrs = useRef(new Map()), g = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [v, setV] = useState({ k: 1, x: 0, y: 0 });
  const [ripple, setRipple] = useState(null);
  const view = useRef(v); view.current = v;

  // Le monde visible : l'emprise, avec 560 unités de marge à l'est et à l'ouest et 460 au nord et au sud (côte tracée jusque-là).
  const kMin = (w, h) => 0.6 * Math.min(w / (GEO.width + 60), h / (GEO.height + 60));
  const clamp = useCallback((k, x, y, w = size.w, h = size.h) => {
    const kk = Math.min(K_MAX, Math.max(kMin(w, h), k)), cw = (GEO.width + 1120) * kk, ch = (GEO.height + 920) * kk, ox = -560 * kk, oy = -460 * kk;
    const cx = cw <= w ? (w - cw) / 2 - ox : Math.min(-ox, Math.max(w - cw - ox, x));
    const cy = ch <= h ? (h - ch) / 2 - oy : Math.min(-oy, Math.max(h - ch - oy, y));
    return { k: kk, x: cx, y: cy };
  }, [size]);
  // Vue d'ensemble : centrée en hauteur sur la position de référence et cadrée sur les spots retenus (CR-02) ;
  // en largeur, la colonne de pastilles laisse la place des noms à gauche et des boutons à droite.
  // Bande des pastilles : sous les puces, au-dessus du bas d'écran (cadrage un peu plus serré que l'écartement permis).
  const band = (h) => [top + R + 4, h - 44 - R];
  const fitBand = (h) => [top + R + 16, h - 76 - R];
  const fit = useCallback((w = size.w, h = size.h) => {
    if (!w || !h) return;
    if (compact) { const k = 2.2; setV(clamp(k, w / 2 - REF.x * k, h / 2 - REF.y * k, w, h)); return; } // mini-carte de la position
    // Cadrage sur l'emprise des spots et de la position (elle reste dedans) : le haut de la colonne passe juste sous
    // les puces, et la côte remonte jusqu'en haut de l'écran, sous l'en-tête (maquette).
    const [y0, y1] = fitBand(h), pts = [...items, REF];
    const top0 = Math.min(...pts.map((p) => p.y)), bot0 = Math.max(...pts.map((p) => p.y)), dy = Math.max(bot0 - top0, 1);
    let k = Math.min(K_MAX, Math.max(kMin(w, h), (y1 - y0) / dy)), X0 = w / 2;
    for (let i = 0; i < 24; i++) {
      const lo = Math.max(...items.map((it) => 14 + LBL(it) + 9 + R - (it.x - REF.x) * k), R + 14);
      const hi = Math.min(...items.map((it) => w - 74 - R - (it.x - REF.x) * k), w - 74 - R);
      if (lo <= hi || !items.length) { X0 = items.length ? lo + 0.3 * (hi - lo) : w / 2; break; }
      k *= 0.9;
    }
    setV(clamp(k, X0 - REF.x * k, (y0 + y1) / 2 - ((top0 + bot0) / 2) * k, w, h));
  }, [items, size, clamp, top]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const f = () => { const r = box.current.getBoundingClientRect(); setSize({ w: r.width, h: r.height }); };
    f(); const ro = new ResizeObserver(f); ro.observe(box.current); return () => ro.disconnect();
  }, []);
  // Tant que la personne n'a pas déplacé ni zoomé la carte, la vue d'ensemble suit la taille de l'écran.
  const touched = useRef(false);
  useEffect(() => { if (size.w && !touched.current) fit(size.w, size.h); }, [size]); // eslint-disable-line react-hooks/exhaustive-deps

  // Le spot choisi glisse à gauche de sa bulle ou du panneau ; au second toucher, la carte revient où elle était
  // (si la personne ne l'a pas déplacée entre-temps).
  const before = useRef(null);
  useEffect(() => {
    const s = items.find((i) => i.id === selected);
    if (!s) { if (before.current && !before.current.moved) setV(before.current.v); before.current = null; return; }
    if (!size.w) return;
    const sx = v.x + s.x * v.k, sy = v.y + s.y * v.k, maxX = focusX ? focusX(size.w) : size.w - panelW - 56, [y0, y1] = fitBand(size.h);
    const tx = Math.min(maxX, Math.max(6 + LBL(s) + 9 + R, sx)), ty = Math.min(y1 - 120, Math.max(y0, sy));
    if (tx !== sx || ty !== sy) {
      if (!before.current) before.current = { v, moved: false };
      setV((v0) => clamp(v0.k, v0.x + (tx - sx), v0.y + (ty - sy)));
    }
  }, [selected, panelW]); // eslint-disable-line react-hooks/exhaustive-deps

  const local = (e) => { const r = box.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const zoomAt = (f, cx, cy, from) => { touched.current = true; if (before.current) before.current.moved = true; const v0 = from || view.current, k = Math.min(K_MAX, Math.max(kMin(size.w, size.h), v0.k * f)), q = k / v0.k; setV(clamp(k, cx - (cx - v0.x) * q, cy - (cy - v0.y) * q)); };
  useEffect(() => {
    const el = box.current;
    const wheel = (e) => { e.preventDefault(); const [cx, cy] = local(e); zoomAt(Math.exp(-e.deltaY * 0.0015), cx, cy); };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  });
  const down = (e) => {
    if (e.target.closest(".ctl6, .legend6, .pop6, .panel6, .top6")) return;
    ptrs.current.set(e.pointerId, local(e));
    const pts = [...ptrs.current.values()];
    g.current = pts.length === 1 ? { mode: "pan", s: pts[0], v0: view.current, moved: false }
      : { mode: "pinch", d0: Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]), c: [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2], v0: view.current, moved: true };
  };
  const move = (e) => {
    if (!ptrs.current.has(e.pointerId) || !g.current) return;
    ptrs.current.set(e.pointerId, local(e));
    const G = g.current, pts = [...ptrs.current.values()];
    if (G.mode === "pan") {
      const dx = pts[0][0] - G.s[0], dy = pts[0][1] - G.s[1];
      if (!G.moved && Math.abs(dx) + Math.abs(dy) > 5) { G.moved = true; touched.current = true; if (before.current) before.current.moved = true; box.current.setPointerCapture?.(e.pointerId); box.current.classList.add("panning"); }
      if (G.moved) setV(clamp(G.v0.k, G.v0.x + dx, G.v0.y + dy));
    } else if (pts.length >= 2) zoomAt(Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]) / G.d0, G.c[0], G.c[1], G.v0);
  };
  const up = (e) => {
    ptrs.current.delete(e.pointerId);
    const G = g.current;
    if (!ptrs.current.size) { g.current = null; box.current.classList.remove("panning"); }
    // Toucher le fond de carte referme la bulle ou le panneau.
    if (G && !G.moved && G.mode === "pan" && selected && !e.target.closest("button, .pop6, .panel6, .top6, .legend6, .ctl6")) onSelect(selected);
    if (G?.moved) { const el = box.current, stop = (ev) => { ev.preventDefault(); ev.stopPropagation(); }; el.addEventListener("click", stop, { capture: true, once: true }); setTimeout(() => el.removeEventListener("click", stop, { capture: true }), 0); }
  };
  // Clavier : flèches pour déplacer, + et − pour zoomer (CR-03).
  const key = (e) => {
    const st = 60, m = { ArrowLeft: [st, 0], ArrowRight: [-st, 0], ArrowUp: [0, st], ArrowDown: [0, -st] }[e.key];
    if (m) { e.preventDefault(); setV((v0) => clamp(v0.k, v0.x + m[0], v0.y + m[1])); }
    if (e.key === "+" || e.key === "=") zoomAt(1.4, size.w / 2, size.h / 2);
    if (e.key === "-") zoomAt(1 / 1.4, size.w / 2, size.h / 2);
    if (e.key === "Escape" && selected) onSelect(selected);
  };

  // Colonne de pastilles écartées (voir arrange) ; noms à gauche (côté mer), sinon à droite, sinon cachés.
  const scr = (p) => ({ sx: v.x + p.x * v.k, sy: v.y + p.y * v.k });
  const [yMin, yMax] = band(size.h);
  const groups = size.w ? arrange(items, scr, yMin, yMax) : [];
  const at = Object.fromEntries(groups.flatMap((G) => G.items.map((i) => [i.id, G])));
  // Zones réservées : pastilles, en-tête, boutons à droite, légende en bas à gauche, panneau.
  const boxes = groups.map((G) => [G.x - R, G.y - R, G.x + R, G.y + R]);
  boxes.push([0, 0, size.w, top], [size.w - 70, size.h - 290, size.w, size.h], [0, size.h - 84, 168, size.h], [size.w - panelW - 12, 0, size.w, size.h]);
  const hit = (b) => boxes.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
  const labels = {};
  const selG = selected && at[selected];
  if (selG && focusBox) boxes.push(focusBox({ sx: selG.x, sy: selG.y }));
  // Le nom du spot choisi d'abord, puis les meilleurs scores.
  const rank = (G) => (G.items[0].id === selected ? 1000 : G.items[0].fav ?? -1);
  for (const G of [...groups].filter((q) => q.items.length === 1).sort((a, b) => rank(b) - rank(a))) {
    const it = G.items[0], wpx = LBL(it);
    const L = [G.x - R - 9 - wpx, G.y - 11, G.x - R - 8, G.y + 11], Rt = [G.x + R + 8, G.y - 11, G.x + R + 9 + wpx, G.y + 11];
    const side = L[0] >= 4 && !hit(L) ? "left" : Rt[2] < size.w - panelW - 74 && !hit(Rt) ? "right" : null;
    if (side && v.k > 0.3) { labels[it.id] = side; boxes.push(side === "left" ? L : Rt); }
  }
  const sel = items.find((i) => i.id === selected);
  const select = (id) => { setRipple(id === selected ? null : `${id}-${Date.now()}`); onSelect(id); };
  const vb = `${-v.x / v.k} ${-v.y / v.k} ${size.w / v.k || 1} ${size.h / v.k || 1}`;
  const refS = scr(REF);
  const lead = groups.filter((G) => G.items.length === 1 && Math.abs(G.y - G.sy) > 3);

  return (
    <div className="map6" ref={box} tabIndex={0} role="application" aria-label="Carte : flèches pour déplacer, + et − pour zoomer"
      onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDoubleClick={(e) => { if (!e.target.closest("button")) { const [cx, cy] = local(e); zoomAt(2, cx, cy); } }}>
      <svg className="geo" viewBox={vb} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="sea6" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="var(--v6-sea-2)" /><stop offset="1" stopColor="var(--v6-sea)" /></linearGradient>
          <filter id="coastGlow" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.4" /></filter>
        </defs>
        <rect x={-700} y={-700} width={GEO.width + 1400} height={GEO.height + 1400} fill="url(#sea6)" />
        <path d={GEO.land} className="land-glow" filter="url(#coastGlow)" />
        <path d={GEO.land} className="land6" vectorEffect="non-scaling-stroke" />
      </svg>
      {Layer && size.w > 0 && <Layer v={v} w={size.w} h={size.h} />}
      {Layer && <svg className="geo coast6" viewBox={vb} preserveAspectRatio="none" aria-hidden="true"><path d={GEO.land} className="shade" /><path d={GEO.land} vectorEffect="non-scaling-stroke" /></svg>}
      <span className="ref6" style={{ left: refS.sx, top: refS.sy }} aria-hidden="true" />
      {lead.length > 0 && (
        <svg className="lead6" width={size.w} height={size.h} aria-hidden="true">
          {lead.map((G) => { const t = tierOf(G.items[0].fav), c = t && G.items[0].status !== "nr" ? `var(--tier-${t.id})` : "var(--v6-ring-muted)", up = G.y < G.sy;
            return <g key={G.items[0].id}><line x1={G.x} y1={G.sy} x2={G.x} y2={G.y + (up ? R : -R)} /><circle cx={G.sx} cy={G.sy} r="4" style={{ fill: c }} /></g>; })}
        </svg>
      )}
      <div className="mk6">
        {groups.map((G) => G.items.length === 1 ? (
          <div key={G.items[0].id} className="mk6-at" style={{ left: G.x, top: G.y }}>
            <Ring s={G.items[0]} selected={selected === G.items[0].id} onSelect={select} showLabel={!!labels[G.items[0].id]} labelSide={labels[G.items[0].id]} ripple={ripple?.startsWith(G.items[0].id + "-") ? ripple : null} />
          </div>
        ) : (
          <div key={G.items.map((i) => i.id).join("-")} className="mk6-at" style={{ left: G.x, top: G.y }}>
            <button className="ring cluster" style={{ "--tier": tierOf(G.items[0].fav) ? `var(--tier-${tierOf(G.items[0].fav).id})` : "var(--v6-ring-muted)" }}
              aria-label={`Groupe de ${G.items.length} spots : ${G.items.map((i) => `${i.name} ${i.fav ?? "sans note"}`).join(", ")} ; zoomer`} onClick={() => zoomAt(2.4, G.x, G.y)}>
              <svg className="arc" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" className="track" /><circle cx="24" cy="24" r="21" className="val" pathLength="100" strokeDasharray={`${G.items[0].fav ?? 0} 100`} /></svg>
              <span className="v num">{G.items[0].fav ?? "–"}</span><span className="more6 num" aria-hidden="true">+{G.items.length - 1}</span></button>
          </div>
        ))}
      </div>
      {sel && popover && at[sel.id] && popover(sel, { sx: at[sel.id].x, sy: at[sel.id].y, w: size.w, h: size.h })}
      {panel}
      {!compact && <><div className="ctl6">
        <button className="ctlb" aria-label="Me localiser" onClick={onLocate}><Icon name="locate" size={24} /></button>
        <button className="ctlb" aria-label="Couches" onClick={onLayers}><Icon name="layers" size={24} /></button>
        <div className="ctlg">
          <button aria-label="Zoomer" onClick={() => zoomAt(1.5, size.w / 2, size.h / 2)}><Icon name="plus" size={24} /></button>
          <button aria-label="Dézoomer" onClick={() => zoomAt(1 / 1.5, size.w / 2, size.h / 2)}><Icon name="minus" size={24} /></button>
          <button aria-label="Vue d'ensemble" onClick={() => { touched.current = false; before.current = null; fit(); }}><Icon name="fit" size={22} /></button>
        </div>
      </div>
      {legend}</>}
      <span className="attrib">{tag || "Données démo · côte © IGN"}</span>
    </div>
  );
}
