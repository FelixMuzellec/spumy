// Dessins du prototype : leurres, espèces sans photo, carte, courbe de marée, météo horaire, créneaux.
// Tout est vectoriel et marqué comme dessin : aucun ne se fait passer pour une photo de produit ou de lieu.
import React, { useId, useState } from "react";
import { Icon, Pastille, favBand } from "../design/ds/ui.jsx";
import { CARTE, LEURRE, ROBES } from "../design/ds/illustrations.js";

// ── Leurres ─────────────────────────────────────────────────────
// Robe d'après le nom du coloris (ta boîte) ; forme d'après la famille du catalogue.
const robeOf = (c = "") => ROBES[c.toLowerCase()] || (/blanc/i.test(c) ? ROBES.blanc : /vert|kaki|lan[cç]on/i.test(c) ? ROBES.lancon : ROBES.default);

export function LureArt({ cat, color, width = 150 }) {
  const id = useId().replace(/:/g, "");
  const R = robeOf(color);
  const h = width * 0.42;
  const shape = /bavette/.test(cat) ? "minnow" : /cpt|mastershad|blackminnow|darksleeper/.test(cat) ? "shad" : /spindle|curly|xlayer/.test(cat) ? "worm"
    : /craw/.test(cat) ? "craw" : /dragmetal/.test(cat) ? "jig" : "stick";
  const body = {
    stick: "M8 31C20 18 52 12 96 13c22 .5 38 5 46 14 3 3.5 3 7 0 10-8 9-24 13-46 13.6C52 52 20 45 8 32.5Z",
    minnow: "M14 31C26 19 56 14 98 15c20 .5 34 5 42 13 3 3 3 6 0 9-8 8-22 12-42 12.6C56 50 26 44 14 32Z",
    shad: "M10 31c10-11 34-16 70-15 14 .4 22 3 28 7l14-9c-2 7-2 15 0 22l-14-9c-6 4-14 7-28 7.4-36 1-60-4-70-15Z",
    worm: "M8 31c16-8 40-11 66-9 20 1.6 38 2 66-2-22 9-44 12-66 11.4C48 31 24 35 8 31Z",
    craw: "M30 31c8-8 22-11 40-10 14 .8 24 5 30 10-6 5-16 9-30 10-18 1-32-2-40-10Zm70 0 22-10M100 31l22 10M30 31 12 22M30 31 12 40",
    jig: "M10 31c14-9 44-14 80-12 20 1 36 5 48 12-12 7-28 11-48 12-36 2-66-3-80-12Z",
  }[shape];
  return (
    <svg width={width} height={h} viewBox="0 0 150 63" role="img" aria-label={`Dessin d'un leurre${color ? `, coloris ${color}` : ""}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={R.back} /><stop offset="0.3" stopColor={R.back} /><stop offset="0.58" stopColor={R.mid} /><stop offset="1" stopColor={R.belly} />
        </linearGradient>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={LEURRE.reflet} stopOpacity="0" /><stop offset="0.5" stopColor={LEURRE.reflet} stopOpacity=".55" /><stop offset="1" stopColor={LEURRE.reflet} stopOpacity="0" /></linearGradient>
        {shape === "jig" && <linearGradient id={`m${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={LEURRE.metal[0]} /><stop offset=".5" stopColor={LEURRE.metal[1]} /><stop offset="1" stopColor={LEURRE.metal[2]} /></linearGradient>}
      </defs>
      <g opacity={R.tr || 1}>
        <path d={body} fill={shape === "jig" ? `url(#m${id})` : `url(#b${id})`} stroke="rgba(0,0,0,.25)" strokeWidth="0.8" />
        {R.tiger && [30, 46, 62, 78, 94].map((x) => <path key={x} d={`M${x} 17c3 4 3 8 0 12`} stroke={R.spot} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />)}
        {R.pearl && <path d={body} fill="url(#s${id})" opacity=".35" />}
        {shape !== "worm" && shape !== "craw" && <>
          <pattern id={`k${id}`} width="7" height="5" patternUnits="userSpaceOnUse"><path d="M0 5c1.8-3 5.2-3 7 0" fill="none" stroke={LEURRE.reflet} strokeOpacity=".22" strokeWidth=".7" /></pattern>
          <path d={body} fill={`url(#k${id})`} />
          <path d="M30 17.5c30-4 66-5 102 2" stroke={R.spot} strokeOpacity=".55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </>}
        <path d="M24 24c24-6 60-8 104-3" stroke={`url(#s${id})`} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {shape === "minnow" && <path d="M14 31 2 40l6 2 9-8z" fill="rgba(220,240,255,.55)" stroke="rgba(0,0,0,.25)" strokeWidth=".6" />}
      {(shape === "stick" || shape === "minnow" || shape === "jig") && <>
        <circle cx={shape === "jig" ? 22 : 26} cy="27" r="5.4" fill={LEURRE.oeil} stroke="rgba(0,0,0,.35)" strokeWidth=".8" />
        <circle cx={shape === "jig" ? 22 : 26} cy="27" r="2.6" fill={LEURRE.pupille} />
        <g stroke={LEURRE.hamecon} strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M66 50v6" /><path d="M62 60c0-3 2-4 4-4s4 1 4 4" /><path d="M66 56v6" />
          <path d="M118 46v6" /><path d="M114 56c0-3 2-4 4-4s4 1 4 4" />
        </g>
      </>}
      {shape === "shad" && <circle cx="22" cy="28" r="3.6" fill={LEURRE.pupille} stroke={LEURRE.oeil} strokeWidth="1.4" />}
    </svg>
  );
}

// ── Espèces sans photo : silhouettes au trait ───────────────────
export function SpeciesArt({ id, size = 120 }) {
  const paths = {
    "vieille": "M10 34c8-14 26-22 46-22 18 0 32 6 42 14l14-10-3 18 3 18-14-10c-10 8-24 14-42 14-20 0-38-8-46-22ZM40 14c8-6 20-8 30-6M28 30h0",
    "saint-pierre": "M16 36c6-18 22-28 40-28 20 0 36 12 40 28l14-10v20l-14-10c-4 16-20 28-40 28-18 0-34-10-40-28ZM44 8l-6-6M58 8l2-7M70 10l8-6M56 36a5 5 0 1 0 0.1 0",
  };
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 124 72" role="img" aria-label={`Dessin : ${id}`} style={{ display: "block" }}>
      <path d={paths[id] || paths.vieille} fill="none" stroke="var(--accent-ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={id === "saint-pierre" ? 30 : 24} cy="30" r="2.6" fill="var(--accent-ink)" />
    </svg>
  );
}

// ── Carte : terres OpenStreetMap, pastilles du moteur ───────────
// Le cadre visible garde exactement les proportions du conteneur (mesuré) : les pastilles, posées en HTML par-dessus,
// tombent au bon endroit du trait de côte, quelle que soit la largeur de l'écran.
export function MapView({ carte, points, selected, onSelect, height = 420, rings, labels = false, children }) {
  const [W, S, E, N] = carte.bbox, [, , VW, VH] = carte.viewBox;
  const [zoom, setZoom] = useState(1);
  const [cw, setCw] = useState(390);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setCw(Math.max(200, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const P = (lat, lon) => [((lon - W) / (E - W)) * VW, ((N - lat) / (N - S)) * VH];
  const aspect = height / cw;
  const w0 = Math.min(VW, VH / aspect);
  const w = w0 / zoom, h = w * aspect;
  const sel = points.find((p) => p.id === selected);
  const c = zoom > 1 && sel ? P(sel.lat, sel.lon) : [VW / 2, VH / 2];
  const vx = Math.max(0, Math.min(VW - w, c[0] - w / 2)), vy = Math.max(0, Math.min(VH - h, c[1] - h / 2));
  const kmPerUnit = ((E - W) * 111.32 * carte.kx) / VW;
  // Pastilles trop proches (spots voisins à faible zoom) : on les écarte, la pastille choisie ne bouge pas, et un trait
  // fin relie chaque pastille déplacée à sa vraie position (point). Calcul déterministe, en pixels du conteneur.
  const placed = points.map((p) => {
    const [x, y] = P(p.lat, p.lon);
    const x0 = ((x - vx) / w) * cw, y0 = ((y - vy) / h) * height;
    const r = (p.icon ? 17 : p.id === selected ? 18 : 14) + 6; // + marge du bouton
    // Boîte occupée : la pastille, plus l'étiquette dessous quand il y en a (largeur estimée, police condensée 12 px).
    const lw = labels ? ((p.short || p.name).length * 6.3 + 8) / 2 : 0;
    return { p, x0, y0, x: x0, y: y0, hw: Math.max(r, lw), up: r, down: labels ? r + 16 : r };
  }).filter((o) => o.x0 > -12 && o.x0 < cw + 12 && o.y0 > -12 && o.y0 < height + 12);
  for (let it = 0; it < 80; it++) {
    let moved = false;
    for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i], b = placed[j];
      const ox = Math.min(a.x + a.hw, b.x + b.hw) - Math.max(a.x - a.hw, b.x - b.hw) - 6;
      const oy = Math.min(a.y + a.down, b.y + b.down) - Math.max(a.y - a.up, b.y - b.up) - 6;
      if (ox <= 0 || oy <= 0) continue;
      const wa = a.p.id === selected ? 0 : b.p.id === selected ? 1 : 0.5;
      // On écarte selon l'axe qui demande le moins de déplacement (les étiquettes larges se décalent plutôt en hauteur).
      if (ox < oy) { const sx = b.x >= a.x ? 1 : -1; a.x -= sx * ox * wa; b.x += sx * ox * (1 - wa); }
      else { const sy = b.y >= a.y ? 1 : -1; a.y -= sy * oy * wa; b.y += sy * oy * (1 - wa); }
      moved = true;
    }
    if (!moved) break;
  }
  const leaders = placed.filter((o) => Math.hypot(o.x - o.x0, o.y - o.y0) > 4);
  return (
    <div className="p-map" style={{ height }} ref={ref}>
      <svg viewBox={`${vx} ${vy} ${w} ${h}`} preserveAspectRatio="xMidYMid meet" width="100%" height="100%" aria-hidden="true">
        <defs>
          <radialGradient id="sea" cx="45%" cy="45%" r="75%"><stop offset="0" stopColor={CARTE.mer[0]} /><stop offset="0.6" stopColor={CARTE.mer[1]} /><stop offset="1" stopColor={CARTE.mer[2]} /></radialGradient>
          <linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={CARTE.terre[0]} /><stop offset="1" stopColor={CARTE.terre[1]} /></linearGradient>
          <filter id="glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="rgba(130,185,235,.06)" strokeWidth="1" /></pattern>
        </defs>
        <rect x="0" y="0" width={VW} height={VH} fill="url(#sea)" className="p-map__sea" />
        <rect x="0" y="0" width={VW} height={VH} fill="url(#grid)" />
        <path d={carte.land} fill="url(#land)" className="p-map__land" stroke={CARTE.cote} strokeOpacity=".6" strokeWidth={1.6 / zoom} filter="url(#glow)" />
        {rings}
      </svg>
      {leaders.length > 0 && (
        <svg className="p-map__leaders" width={cw} height={height} aria-hidden="true">
          {leaders.map((o) => (
            <g key={o.p.id}><line x1={o.x0} y1={o.y0} x2={o.x} y2={o.y} /><circle cx={o.x0} cy={o.y0} r="3" /></g>
          ))}
        </svg>
      )}
      <div className="p-map__pins">
        {placed.map(({ p, x, y }) => {
          return (
            <button key={p.id} type="button" className={`p-map__pin ${p.id === selected ? "is-sel" : ""}`} style={{ left: x, top: y }} onClick={() => onSelect?.(p.id)}
              aria-label={`${p.name}${p.value != null ? `, favorabilité ${p.value}` : ""}${p.status === "nr" ? ", non recommandé" : p.status === "verify" ? ", à vérifier" : ""}`} aria-pressed={p.id === selected}>
              {p.icon ? <span className={`p-map__mark ${p.id === selected ? "is-sel" : ""}`}><Icon name={p.icon} size={18} /></span>
                : <Pastille value={p.value} status={p.status} size={p.id === selected ? 36 : 28} selected={p.id === selected} label="" />}
              {labels && <span className="p-map__label">{p.short || p.name}</span>}
            </button>
          );
        })}
      </div>
      <div className="p-map__zoom">
        <button type="button" className="s-iconbtn s-iconbtn--glass" aria-label="Zoomer" onClick={() => setZoom((z) => Math.min(4, z * 1.6))}><Icon name="plus" size={22} /></button>
        <button type="button" className="s-iconbtn s-iconbtn--glass" aria-label="Dézoomer" onClick={() => setZoom((z) => Math.max(1, z / 1.6))}><Icon name="minus" size={22} /></button>
      </div>
      <div className="p-map__scale" aria-hidden="true"><span style={{ width: `${(5 / kmPerUnit / w) * 100}%` }} />5 km</div>
      <p className="p-map__attr">{carte.attribution}</p>
      {children}
    </div>
  );
}

// ── Courbe de marée de la journée ───────────────────────────────
export function TideCurve({ tide, now = 6.5, height = 96 }) {
  const pts = tide.curve.filter(([hh]) => hh != null);
  const maxH = Math.max(...pts.map((p) => p[1])), minH = Math.min(...pts.map((p) => p[1]));
  const X = (hh) => (hh / 24) * 340 + 10, Y = (v) => 10 + (1 - (v - minH) / (maxH - minH || 1)) * (height - 34);
  const d = pts.map(([hh, v], i) => `${i ? "L" : "M"}${X(hh).toFixed(1)},${Y(v).toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 360 ${height}`} width="100%" height={height} role="img" aria-label={`Marée à ${tide.port} : ${tide.events.map((e) => `${e.type} ${e.time} (${e.h} m)`).join(", ")}`}>
      <defs><linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity=".35" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs>
      <path d={`${d}L${X(24)},${height - 22}L${X(0)},${height - 22}Z`} fill="url(#tideFill)" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.2" />
      <line x1={X(now)} x2={X(now)} y1="6" y2={height - 22} stroke="var(--text-1)" strokeDasharray="3 3" strokeWidth="1.2" />
      {tide.events.map((e) => (
        <g key={e.time}>
          <circle cx={X(e.dec)} cy={Y(e.h)} r="3.5" fill="var(--bg-1)" stroke="var(--accent)" strokeWidth="2" />
          <text x={X(e.dec)} y={height - 6} textAnchor="middle" fontSize="11" fill="var(--text-3)" fontFamily="var(--font-display)">{e.type} {e.time}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Météo horaire (vent, rafales, vagues) ───────────────────────
export function HourlyBars({ hours, from = 5, to = 23, mark, height = 110 }) {
  const hs = hours.filter((h) => h.h >= from && h.h <= to);
  const maxW = Math.max(40, ...hs.map((h) => h.gust ?? h.wind ?? 0));
  const bw = 340 / hs.length;
  return (
    <svg viewBox={`0 0 360 ${height}`} width="100%" height={height} role="img" aria-label={`Vent heure par heure, de ${from} h à ${to} h : maximum ${Math.max(...hs.map((h) => h.wind ?? 0))} km/h, rafales ${Math.max(...hs.map((h) => h.gust ?? 0))} km/h`}>
      {hs.map((h, i) => {
        const x = 10 + i * bw, base = height - 20;
        const gh = ((h.gust ?? 0) / maxW) * (base - 12), wh = ((h.wind ?? 0) / maxW) * (base - 12);
        const on = mark && h.h >= mark[0] && h.h < mark[1];
        return (
          <g key={h.h}>
            <rect x={x + 2} y={base - gh} width={bw - 4} height={gh} rx="3" fill="var(--accent)" opacity={on ? 0.28 : 0.14} />
            <rect x={x + 2} y={base - wh} width={bw - 4} height={wh} rx="3" fill={on ? "var(--accent)" : "var(--text-3)"} opacity={on ? 1 : 0.55} />
            {(i % 3 === 0) && <text x={x + bw / 2} y={height - 5} textAnchor="middle" fontSize="11" fill="var(--text-3)" fontFamily="var(--font-display)">{h.h}h</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ── Créneaux de la journée ──────────────────────────────────────
export function WindowStrip({ windows, sun, best }) {
  const X = (hh) => `${((hh - 5) / 19) * 100}%`;
  const dec = (s) => (s ? +s.slice(0, 2) + +s.slice(3, 5) / 60 : null);
  return (
    <div className="s-timeline" role="img" aria-label={`Créneaux du jour : ${windows.filter((w) => w.ok).map((w) => `${w.startFmt}–${w.endFmt} favorabilité ${w.fav}`).join(", ")}`}>
      <div className="p-strip__night" style={{ left: 0, width: X(dec(sun.sunrise)) }} />
      <div className="p-strip__night" style={{ left: X(dec(sun.sunset)), right: 0 }} />
      {windows.map((w, i) => (
        <div key={i} className={`p-strip__win ${w.startFmt === best?.start ? "is-best" : ""}`} data-band={w.ok ? favBand(w.fav) : 0}
          style={{ left: X(w.start), width: `calc(${X(w.end)} - ${X(w.start)})` }}>
          {w.startFmt === best?.start && <span>{w.fav}</span>}
        </div>
      ))}
      {[6, 9, 12, 15, 18, 21].map((hh) => <span key={hh} className="p-strip__tick" style={{ left: X(hh) }}>{hh}h</span>)}
    </div>
  );
}
