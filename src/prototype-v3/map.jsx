// SPUMY V3 — Carte (UX-V3 § 7) et Météo (UX-V3 § 8), sur un fond schématique : le prototype n'appelle aucun service.
import { useState } from "react";
import { tierOf } from "../design/v3/tokens.js";
import { Gauge, Safety, Icon } from "./ui.jsx";
import { SPOTS, SPOT, MARKS, REF, favorable, windAt, waveAt, compass, hhmm, span, NOW } from "./data.js";

const COAST = [[380, 0], [320, 200], [292, 262], [360, 340], [372, 420], [300, 498], [262, 522], [430, 556], [452, 566], [500, 620], [516, 646], [360, 680], [322, 704], [420, 780], [556, 826], [440, 880], [414, 904], [600, 960], [606, 986], [640, 1080], [698, 1146], [560, 1190], [496, 1214], [520, 1300]];
const LAND = `M${COAST.map((p) => p.join(",")).join(" L")} L1000,1300 L1000,0 Z`;

function Base({ children, overlay }) {
  return (
    <div className="mapbox" data-noswipe>
      <svg className="map" viewBox="0 0 1000 1300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <rect className="sea" x="0" y="0" width="1000" height="1300" />
        <path className="land" d={LAND} strokeLinejoin="round" />
        {overlay}
      </svg>
      <div className="mklayer">{children}</div>
      <span className="maptag">Fond schématique · démonstration</span>
    </div>
  );
}

const pos = (x, y) => ({ left: `${x / 10}%`, top: `${y / 13}%` });

function Marker({ s, selected, onSelect, square }) {
  const t = tierOf(s.fav);
  const cls = ["mk", square || s.mine ? "sq" : "", s.status === "verify" ? "verify" : "", s.status === "nr" ? "nr" : "", !t ? "empty" : "", selected ? "sel" : ""].join(" ");
  const label = `${s.name}, ${s.fav ?? "sans note"}${t ? `/100, ${t.word}` : ""}${s.status === "verify" ? ", à vérifier" : s.status === "nr" ? ", non recommandé" : ""}${s.route ? `, à ${s.route} min` : ""}`;
  return (
    <button className={cls} style={{ ...pos(s.x, s.y), background: t ? `var(--tier-${t.id})` : undefined }} aria-label={label} aria-pressed={selected} onClick={() => onSelect(s.id)}>
      {s.status === "verify" && <span className="q" aria-hidden="true">?</span>}
    </button>
  );
}

export function Carte({ st, go, sel, setSel, notify }) {
  const bateau = st.mode === "bateau";
  const [filter, setFilter] = useState("all");
  const [list, setList] = useState(false);
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
      <aside className="side" aria-label="Liste classée">
        {ranked.map((s) => <button key={s.id} className="card" style={{ textAlign: "left" }} onClick={() => setSel(s.id)} aria-pressed={sel === s.id}>{preview(s)}</button>)}
      </aside>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="screen" style={{ gap: 8, paddingBottom: 8, flex: "none" }}>
          <label className="field"><span className="vh">Rechercher un spot</span><input placeholder="Rechercher un spot" /></label>
          <div className="chips" role="group" aria-label="Filtres">
            {chips.map(([k, l]) => <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l} <span className="num">{(F[k] || []).length}</span></button>)}
          </div>
        </div>
        <div className="mapwrap">
          <Base overlay={<circle cx={REF.x} cy={REF.y} r="16" fill="none" stroke="var(--text-primary)" strokeWidth="7" />}>
            {shown.map((s) => <Marker key={s.id} s={s} selected={sel === s.id} onSelect={setSel} square={bateau} />)}
            {!bateau && <button className="mk cluster" style={pos(560, 90)} aria-label="Groupe de 3 spots, zoomer" onClick={() => notify("Zoom sur le groupe de 3 spots (démonstration)")}>3</button>}
          </Base>
          <button className="fab" style={{ top: 12 }} aria-label="Recentrer sur ma position de référence" onClick={() => notify("Recentré sur Pirou")}><Icon name="pin" /></button>
          <button className="fab" style={{ top: 64 }} aria-label="Me géolocaliser" onClick={() => notify("Position du téléphone : ±30 m")}><Icon name="locate" /></button>
          <button className="fab" style={{ top: 116 }} aria-label="Couches" onClick={() => notify(bateau ? "Couches : plan, photo aérienne, carte marine (bonus à étudier)" : "Couches : plan, photo aérienne")}><Icon name="layers" /></button>
        </div>
        <div className="sheet">
          <button className="grip" aria-label={list ? "Réduire la liste" : "Afficher la liste classée"} onClick={() => setList(!list)} />
          <Legend />
          {list ? (
            <ul className="list" aria-label="Liste classée">{ranked.map((s, i) => (
              <li key={s.id}><button className="lrow" style={{ width: "100%", background: "none", border: 0, textAlign: "left" }} onClick={() => { setSel(s.id); setList(false); }}>
                <span><b>{i + 1}. {s.name}</b> <span className="meta num">{s.win ? span(s.win) : ""}</span></span><span className="num">{s.fav ?? "—"}</span></button></li>))}</ul>
          ) : cur ? preview(cur) : <p className="meta">Touche une pastille pour voir le spot, ou tire la poignée pour la liste classée.</p>}
        </div>
      </div>
    </div>
  );
}

export function Legend() {
  return (
    <div className="legend" aria-label="Légende">
      {["0–19", "20–39", "40–59", "60–74", "75–89", "90–100"].map((l, i) => <span key={l}><i style={{ background: `var(--tier-${i})` }} />{l}</span>)}
      <span><i style={{ background: "var(--marker-empty)", outline: "1.5px dashed var(--warning-ink)" }} />? à vérifier</span>
      <span>barré : non recommandé</span><span>vide : sans note</span><span>carré : mon spot</span>
    </div>
  );
}

/* Météo : flèches de vent sur une grille de points autour de la position de référence (aucune zone nommée). */
const GRID = [];
for (let gy = 140; gy <= 1220; gy += 216) for (let gx = 130; gx <= 870; gx += 185) GRID.push([gx, gy]);

function Arrow({ x, y, deg, len, warn, label, sub }) {
  const to = ((deg + 180) * Math.PI) / 180;
  const dx = Math.sin(to) * len / 2, dy = -Math.cos(to) * len / 2;
  const x1 = x - dx, y1 = y - dy, x2 = x + dx, y2 = y + dy;
  const a = Math.atan2(y2 - y1, x2 - x1), h = 22;
  const head = `${x2},${y2} ${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} ${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-primary)" strokeWidth={warn ? 9 : 6} strokeLinecap="round" />
      <polygon points={head} fill="var(--text-primary)" />
      <g transform={`translate(${x},${y + len / 2 + 34})`}>
        <rect x="-74" y="-26" width="148" height="36" rx="8" fill="var(--surface-card)" stroke={warn ? "var(--warning-ink)" : "none"} strokeWidth="4" strokeDasharray={warn ? "10 6" : undefined} />
        <text textAnchor="middle" y="0" fontSize="26" fontWeight="700" fill="var(--text-primary)" fontFamily="var(--font-numeric)">{label}{warn ? " ⚠" : ""}</text>
      </g>
      {sub && <title>{sub}</title>}
    </g>
  );
}

function Chart({ series, unit }) {
  const W = 320, H = 90, max = Math.max(...series.flatMap((s) => s.v)) * 1.1;
  const path = (v) => v.map((y, i) => `${i ? "L" : "M"}${(i / (v.length - 1)) * (W - 20) + 10},${H - 14 - (y / max) * (H - 26)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={series.map((s) => s.name).join(" et ")} data-noswipe>
      <line x1="10" x2={W - 10} y1={H - 14} y2={H - 14} stroke="var(--border-strong)" />
      {series.map((s) => <path key={s.name} d={path(s.v)} fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeDasharray={s.dash ? "5 4" : undefined} />)}
      {["maint.", "+6 h", "+12 h", "+18 h", "+24 h"].map((t, i) => <text key={t} x={10 + i * ((W - 20) / 4)} y={H - 2} fontSize="9" fill="var(--text-muted)" textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}>{t}</text>)}
      <text x={W - 10} y="10" fontSize="9" fill="var(--text-muted)" textAnchor="end">{series.map((s) => `${s.dash ? "pointillé" : "trait"} : ${s.name}`).join(" · ")} ({unit})</text>
    </svg>
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
      <div className="screen" style={{ gap: 8, paddingBottom: 8 }}>
        {bateau && <div className="seg2" role="tablist" aria-label="Couche"><button role="tab" aria-selected={layer === "vent"} onClick={() => setLayer("vent")}>Vent</button><button role="tab" aria-selected={layer === "mer"} onClick={() => setLayer("mer")}>Mer</button></div>}
        <div className="row between">
          <div className="chips" role="group" aria-label="Jour">{[["Aujourd'hui", 0], ["Demain", 24 - Math.floor(NOW) + 9], ["7 jours", null]].map(([l, v]) => <button key={l} className="chip" aria-pressed={v !== null && (v === 0 ? off < 24 - Math.floor(NOW) : off >= 24 - Math.floor(NOW))} onClick={() => v !== null && setOff(v)}>{l}</button>)}</div>
          <span className="num" style={{ fontWeight: 800, fontSize: 20 }}>{off >= 24 - Math.floor(NOW) ? "demain " : ""}{hhmm(h)}</span>
        </div>
        <label className="field" data-noswipe><span className="vh">Heure</span><input className="slider" type="range" min="0" max="47" value={off} onChange={(e) => setOff(+e.target.value)} aria-valuetext={hhmm(h)} /></label>
      </div>
      <div className="mapwrap">
        <Base overlay={<g>
          {GRID.map(([x, y]) => {
            if (sea) { const w = waveAt(x, y, h); return <Arrow key={`${x}${y}`} x={x} y={y} deg={w.fromDeg} len={60 + w.m * 40} label={`${String(w.m).replace(".", ",")} m · ${w.s} s`} />; }
            const w = windAt(x, y, h);
            return <Arrow key={`${x}${y}`} x={x} y={y} deg={w.fromDeg} len={50 + w.kmh * 2.2} warn={w.bft >= 6} label={`${w.bft} · r. ${w.gust}`} sub={`Vent de ${compass(w.fromDeg)}, force ${w.bft}, ${w.kmh} km/h, rafales ${w.gust} km/h`} />;
          })}
          {(bateau ? MARKS : SPOTS).map((s) => bateau ? <rect key={s.id} x={s.x - 12} y={s.y - 12} width="24" height="24" rx="4" fill="var(--surface-card)" stroke="var(--text-primary)" strokeWidth="5" /> : <circle key={s.id} cx={s.x} cy={s.y} r="11" fill="var(--surface-card)" stroke="var(--text-primary)" strokeWidth="5" />)}
          <circle cx={REF.x} cy={REF.y} r="16" fill="none" stroke="var(--text-primary)" strokeWidth="8" />
        </g>} />
      </div>
      <div className="screen">
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
        <p className="meta">Flèches : sens dans lequel souffle le vent ; chiffres : force Beaufort et rafales en km/h. À partir de force 6 : signe d'avertissement (seuil de sécurité en vigueur). Grille de points de prévision, sans zone nommée.</p>
        {!bateau && <button className="btn" onClick={() => go("carte")}>Voir les spots sur la carte</button>}
      </div>
    </div>
  );
}

export { SPOT };
