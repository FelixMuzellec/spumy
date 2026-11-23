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
export function Ring({ s, selected, onSelect, showLabel, labelSide, ripple }) {
  const t = tierOf(s.fav), nr = s.status === "nr", verify = s.status === "verify";
  const label = `${s.name}, ${s.fav ?? "sans note"}${t ? `/100, ${t.word}` : ""}${verify ? ", à vérifier" : nr ? ", non recommandé" : ""}`;
  return (
    <button className={`ring${selected ? " sel" : ""}${nr ? " nr" : ""}${verify ? " verify" : ""}${!t ? " empty" : ""}`}
      style={{ "--tier": t && !nr ? `var(--tier-${t.id})` : "var(--v6-ring-muted)", "--fill": t ? (s.fav || 0) / 100 : 0 }}
      aria-label={label} aria-pressed={selected} onClick={() => onSelect(s.id)}>
      {ripple && <span className="ripple" aria-hidden="true" key={ripple} />}
      <svg className="arc" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="21" className="track" />
        <circle cx="24" cy="24" r="21" className="val" pathLength="100" strokeDasharray={`${t ? s.fav : 0} 100`} />
      </svg>
      <span className="v num">{s.fav ?? "–"}</span>
      {verify && <span className="badge-warn" aria-hidden="true"><Icon name="warn" size={13} /></span>}
      {showLabel && <span className={`nm ${labelSide}`} aria-hidden="true">{s.name}</span>}
    </button>
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

/**
 * Carte de base. items : spots { id, x, y, fav, name } ; selected ; onSelect(id).
 * popover(item, pos) : bulle ancrée au spot choisi ; panelW : largeur réservée à droite (panneau Météo) ;
 * Layer : calque dessiné sous les pastilles (vent), reçoit la vue courante ; legend : nœud en bas à gauche.
 */
export function GeoMap({ items, selected, onSelect, popover, panel, panelW = 0, Layer, legend, onLocate, onLayers, tag, cx = 0.5, compact }) {
  const box = useRef(null), ptrs = useRef(new Map()), g = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [v, setV] = useState({ k: 1, x: 0, y: 0 });
  const [ripple, setRipple] = useState(null);
  const view = useRef(v); view.current = v;

  // Le monde visible : l'emprise, avec 560 unités de marge à l'est et à l'ouest et 200 au nord et au sud.
  const kMin = (w, h) => 0.6 * Math.min(w / (GEO.width + 60), h / (GEO.height + 60));
  const clamp = useCallback((k, x, y, w = size.w, h = size.h) => {
    const kk = Math.min(K_MAX, Math.max(kMin(w, h), k)), cw = (GEO.width + 1120) * kk, ch = (GEO.height + 400) * kk, ox = -560 * kk, oy = -200 * kk;
    const cx = cw <= w ? (w - cw) / 2 - ox : Math.min(-ox, Math.max(w - cw - ox, x));
    const cy = ch <= h ? (h - ch) / 2 - oy : Math.min(-oy, Math.max(h - ch - oy, y));
    return { k: kk, x: cx, y: cy };
  }, [size]);
  // Vue d'ensemble : centrée sur la position de référence, cadrée sur les spots retenus (CR-02).
  const fit = useCallback((w = size.w, h = size.h) => {
    if (!w || !h) return;
    if (compact) { const k = 2.2; setV(clamp(k, w / 2 - REF.x * k, h / 2 - REF.y * k, w, h)); return; } // mini-carte de la position
    const pts = [...items, REF];
    // Marges d'écran : noms à gauche, boutons à droite, légende et début des détails en bas.
    const dx = Math.max(...pts.map((p) => Math.abs(p.x - REF.x))), dy = Math.max(...pts.map((p) => Math.abs(p.y - REF.y)));
    const k = Math.min(K_MAX, Math.max(kMin(w, h), Math.min((w - panelW - 2 * 86) / (2 * dx || 1), (h - 56 - 150) / (2 * dy || 1))));
    setV(clamp(k, (w - panelW) * cx - REF.x * k, 56 + (h - 56 - 150) / 2 - REF.y * k, w, h));
  }, [items, panelW, size, clamp]);
  useLayoutEffect(() => {
    const f = () => { const r = box.current.getBoundingClientRect(); setSize({ w: r.width, h: r.height }); };
    f(); const ro = new ResizeObserver(f); ro.observe(box.current); return () => ro.disconnect();
  }, []);
  // Tant que la personne n'a pas déplacé ni zoomé la carte, la vue d'ensemble suit la taille de l'écran.
  const touched = useRef(false);
  useEffect(() => { if (size.w && !touched.current) fit(size.w, size.h); }, [size]); // eslint-disable-line react-hooks/exhaustive-deps

  // Garder le spot choisi visible à gauche du panneau.
  useEffect(() => {
    const s = items.find((i) => i.id === selected);
    if (!s || !size.w) return;
    const sx = v.x + s.x * v.k, sy = v.y + s.y * v.k, maxX = size.w - panelW - 56;
    if (sx > maxX || sx < 56 || sy < 56 || sy > size.h - 56) setV((v0) => clamp(v0.k, v0.x + (Math.min(maxX, Math.max(56, sx)) - sx), v0.y + (Math.min(size.h - 56, Math.max(56, sy)) - sy)));
  }, [selected, panelW]); // eslint-disable-line react-hooks/exhaustive-deps

  const local = (e) => { const r = box.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const zoomAt = (f, cx, cy, from) => { touched.current = true; const v0 = from || view.current, k = Math.min(K_MAX, Math.max(kMin(size.w, size.h), v0.k * f)), q = k / v0.k; setV(clamp(k, cx - (cx - v0.x) * q, cy - (cy - v0.y) * q)); };
  useEffect(() => {
    const el = box.current;
    const wheel = (e) => { e.preventDefault(); const [cx, cy] = local(e); zoomAt(Math.exp(-e.deltaY * 0.0015), cx, cy); };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  });
  const down = (e) => {
    if (e.target.closest(".ctl, .legend6, .pop6, .panel6")) return;
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
      if (!G.moved && Math.abs(dx) + Math.abs(dy) > 5) { G.moved = true; touched.current = true; box.current.setPointerCapture?.(e.pointerId); box.current.classList.add("panning"); }
      if (G.moved) setV(clamp(G.v0.k, G.v0.x + dx, G.v0.y + dy));
    } else if (pts.length >= 2) zoomAt(Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]) / G.d0, G.c[0], G.c[1], G.v0);
  };
  const up = (e) => {
    ptrs.current.delete(e.pointerId);
    const G = g.current;
    if (!ptrs.current.size) { g.current = null; box.current.classList.remove("panning"); }
    if (G?.moved) { const el = box.current, stop = (ev) => { ev.preventDefault(); ev.stopPropagation(); }; el.addEventListener("click", stop, { capture: true, once: true }); setTimeout(() => el.removeEventListener("click", stop, { capture: true }), 0); }
  };
  // Clavier : flèches pour déplacer, + et − pour zoomer (CR-03).
  const key = (e) => {
    const st = 60, m = { ArrowLeft: [st, 0], ArrowRight: [-st, 0], ArrowUp: [0, st], ArrowDown: [0, -st] }[e.key];
    if (m) { e.preventDefault(); setV((v0) => clamp(v0.k, v0.x + m[0], v0.y + m[1])); }
    if (e.key === "+" || e.key === "=") zoomAt(1.4, size.w / 2, size.h / 2);
    if (e.key === "-") zoomAt(1 / 1.4, size.w / 2, size.h / 2);
  };

  // Regroupement sous 44 px ; noms posés à gauche (côté mer), sinon à droite, sinon cachés (chevauchement, dézoom).
  const scr = (p) => ({ sx: v.x + p.x * v.k, sy: v.y + p.y * v.k });
  const groups = [];
  for (const it of [...items].sort((a, b) => (b.fav ?? -1) - (a.fav ?? -1))) {
    const { sx, sy } = scr(it), q = groups.find((G) => Math.hypot(G.sx - sx, G.sy - sy) < 44);
    if (q) { q.items.push(it); q.sx = q.items.reduce((m, i) => m + scr(i).sx, 0) / q.items.length; q.sy = q.items.reduce((m, i) => m + scr(i).sy, 0) / q.items.length; }
    else groups.push({ items: [it], sx, sy });
  }
  // Zones réservées : pastilles, boutons à droite, légende en bas à gauche.
  const boxes = groups.map((G) => [G.sx - 24, G.sy - 24, G.sx + 24, G.sy + 24]);
  boxes.push([size.w - 72, 0, size.w, 290], [0, size.h - 96, 190, size.h], [size.w - panelW, 0, size.w, size.h]);
  const hit = (b) => boxes.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
  const labels = {};
  for (const G of groups.filter((q) => q.items.length === 1)) {
    const it = G.items[0], wpx = it.name.length * 8.6 + 14;
    const L = [G.sx - 28 - wpx, G.sy - 12, G.sx - 28, G.sy + 12], R = [G.sx + 28, G.sy - 12, G.sx + 28 + wpx, G.sy + 12];
    const side = L[0] > 4 && !hit(L) ? "left" : R[2] < size.w - panelW - 60 && !hit(R) ? "right" : null;
    if (side && v.k > 0.3) { labels[it.id] = side; boxes.push(side === "left" ? L : R); }
  }
  const sel = items.find((i) => i.id === selected);
  const select = (id) => { setRipple(id === selected ? null : `${id}-${Date.now()}`); onSelect(id); };
  const vb = `${-v.x / v.k} ${-v.y / v.k} ${size.w / v.k || 1} ${size.h / v.k || 1}`;
  const refS = scr(REF);

  return (
    <div className="map6" ref={box} tabIndex={0} role="application" aria-label="Carte : flèches pour déplacer, + et − pour zoomer"
      onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDoubleClick={(e) => { if (!e.target.closest("button")) { const [cx, cy] = local(e); zoomAt(2, cx, cy); } }}>
      <svg className="geo" viewBox={vb} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="sea6" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="var(--v6-sea-2)" /><stop offset="1" stopColor="var(--v6-sea)" /></linearGradient>
          <filter id="coastGlow" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.4" /></filter>
        </defs>
        <rect x={-400} y={-400} width={GEO.width + 800} height={GEO.height + 800} fill="url(#sea6)" />
        <path d={GEO.land} className="land-glow" filter="url(#coastGlow)" />
        <path d={GEO.land} className="land6" vectorEffect="non-scaling-stroke" />
      </svg>
      {Layer && size.w > 0 && <Layer v={v} w={size.w} h={size.h} />}
      <span className="ref6" style={{ left: refS.sx, top: refS.sy }} aria-hidden="true" />
      <div className="mk6">
        {groups.map((G) => G.items.length === 1 ? (
          <div key={G.items[0].id} className="mk6-at" style={{ left: G.sx, top: G.sy }}>
            <Ring s={G.items[0]} selected={selected === G.items[0].id} onSelect={select} showLabel={!!labels[G.items[0].id]} labelSide={labels[G.items[0].id]} ripple={ripple?.startsWith(G.items[0].id + "-") ? ripple : null} />
          </div>
        ) : (
          <div key={G.items.map((i) => i.id).join("-")} className="mk6-at" style={{ left: G.sx, top: G.sy }}>
            <button className="ring cluster" style={{ "--tier": tierOf(G.items[0].fav) ? `var(--tier-${tierOf(G.items[0].fav).id})` : "var(--v6-ring-muted)" }}
              aria-label={`Groupe de ${G.items.length} spots : ${G.items.map((i) => `${i.name} ${i.fav ?? "sans note"}`).join(", ")} ; zoomer`} onClick={() => zoomAt(2.4, G.sx, G.sy)}>
              <svg className="arc" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" className="track" /><circle cx="24" cy="24" r="21" className="val" pathLength="100" strokeDasharray={`${G.items[0].fav ?? 0} 100`} /></svg>
              <span className="v num">{G.items[0].fav ?? "–"}</span><span className="more6 num" aria-hidden="true">+{G.items.length - 1}</span></button>
          </div>
        ))}
      </div>
      {sel && popover && popover(sel, { ...scr(sel), w: size.w, h: size.h })}
      {panel}
      {!compact && <><div className="ctl ctl-main">
        <button aria-label="Me localiser" onClick={onLocate}><Icon name="locate" size={22} /></button>
        <button aria-label="Couches" onClick={onLayers}><Icon name="layers" size={22} /></button>
        <button aria-label="Vue d'ensemble" onClick={() => fit()}><Icon name="fit" size={22} /></button>
      </div>
      <div className="ctl ctl-zoom">
        <button aria-label="Zoomer" onClick={() => zoomAt(1.5, size.w / 2, size.h / 2)}><Icon name="plus" size={18} /></button>
        <button aria-label="Dézoomer" onClick={() => zoomAt(1 / 1.5, size.w / 2, size.h / 2)}><Icon name="minus" size={18} /></button>
      </div>
      {legend}</>}
      <span className="attrib">{tag || "Côte © IGN Admin Express"}</span>
    </div>
  );
}
