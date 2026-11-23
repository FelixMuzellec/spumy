// Prototype V6 — Carte (vue pêche) et Météo (vue conditions), d'après les maquettes de Félix (V3-028), avec leur
// finalité (V3-029) : la carte au premier écran, le spot et sa note au toucher, puis, en faisant défiler sous la carte,
// la justification et le détail sourcé. Données du jour : démonstration.
import { useEffect, useRef, useState } from "react";
import { tierOf, FAVORABLE_MIN, ILLUSTRATION as IL } from "../design/v3/tokens.js";
import { Icon } from "./ui.jsx";
import { GeoMap, Ring, Legend } from "./geomap.jsx";
import { SPOTS, favorable, verifyList, ranking, windAt, compass, hhmm, span, NOW } from "./data.js";
import { terrain, meteo, conditions, EFFECT, ptsEffect, KN } from "./effets.js";
import { ECHELLE } from "./connaissances.js";

const fr = (n) => String(n).replace(".", ",");
const RULE = {
  all: "Tous : les spots à 1 h de route ou moins de ta position.",
  fav: `Favorables : ${FAVORABLE_MIN} ou plus, sécurité OK et rien à vérifier.`,
  verify: "À vérifier : sécurité, accès ou données à confirmer avant d'y aller ; leur score ne change pas.",
  mine: "Mes spots : ceux que tu as ajoutés.",
};
const levelWord = (n) => (n == null ? null : n <= 2 ? "fait sourcé" : n === 3 ? "retour local" : "hypothèse");
function Level({ n, prefix }) {
  if (n == null) return null;
  return <span className={`lvl lvl${n}`} title={ECHELLE[n]}>{prefix ? `${prefix} ` : ""}niveau {n} · {levelWord(n)}</span>;
}
function Effect({ e, small }) {
  const E = EFFECT[e];
  return <span className={`eff eff-${e}${small ? " sm" : ""}`} role="img" aria-label={E.word}><b aria-hidden="true">{E.glyph}</b>{!small && <span aria-hidden="true">{E.word}</span>}</span>;
}

/**
 * Champ de lieu : position de référence. Carte et Météo : loupe et bouton de visée orange (maquette Carte) ;
 * Home : épingle de position, sans bouton (maquette Home).
 */
export function PlaceField({ pos, openPos, home }) {
  const label = pos.state === "ok" ? pos.label : pos.state === "pending" ? "Position…" : "Saint-Malo, Granville, Cancale…";
  return (
    <div className={`place6${home ? " home" : ""}`}>
      <button className="place6-f" onClick={openPos} aria-label={`Position de référence : ${pos.state === "ok" ? pos.label : "aucune"}${pos.state === "ok" ? (pos.mode === "auto" ? ", automatique" : ", manuelle") : ""} ; modifier`}>
        <Icon name={home ? "pinTarget" : "search"} size={home ? 24 : 22} /><span className={pos.state === "ok" ? "" : "ph"}>{label}</span>
      </button>
      {!home && <button className="place6-loc" onClick={openPos} aria-label="Me géolocaliser"><Icon name="locate" size={24} /></button>}
    </div>
  );
}

const TOP = 198; // en-tête, champ et puces posés sur la carte (maquettes) : les pastilles restent dessous
const BW = 184; // largeur de la bulle (maquette Carte)
const PW = 196; // largeur du panneau Météo (maquette vidéo)

const shown = (filter) => SPOTS.filter((s) => (filter === "fav" ? favorable(s) : filter === "verify" ? s.status === "verify" : filter === "mine" ? s.mine : true));

/** Carte : la vue pêche. */
export function Carte({ st, sel, setSel, notify, openPos }) {
  const bateau = st.mode === "bateau";
  const [filter, setFilter] = useState("all");
  const items = shown(filter);
  const chips = [["all", "Tous", SPOTS.length], ["fav", "Favorables", SPOTS.filter(favorable).length], ["verify", "À vérifier", verifyList().length], ["mine", "Mes spots", 0]];
  const focus = SPOTS.find((s) => s.id === sel) || ranking(SPOTS).cards[0];
  if (bateau) return <BateauNotice />;
  return (
    <div className="screen6">
      <div className="mapwrap6">
        <h1 className="vh">Carte des spots : le terrain et ses effets sur la pêche</h1>
        <GeoMap items={items} selected={sel} onSelect={(id) => setSel(sel === id ? null : id)} top={TOP} focusX={(w) => w - 14 - BW - 12 - 23} focusBox={(p) => [p.sx + 30, p.sy - 40, p.sx + 40 + BW, p.sy + 190]}
          onLocate={() => notify("Position : Pirou, automatique (±30 m) · démonstration")} onLayers={() => notify("Couches de terrain : aucune donnée réelle disponible pour l'instant (fonds, profondeurs, estran)")}
          popover={(s, p) => <Bubble s={s} p={p} onClose={() => setSel(null)} />} legend={<Legend />} />
        <div className="top6">
          <PlaceField pos={st.pos} openPos={openPos} />
          <div className="chips6" role="group" aria-label="Filtres">
            {chips.map(([k, l, n]) => (
              <button key={k} className="chip6" aria-pressed={filter === k} title={RULE[k]} aria-description={RULE[k]} onClick={() => { setFilter(k); setSel(null); }}>
                {k === "fav" && <i className="dot6" aria-hidden="true" />}{k === "verify" && <span className="warn6" aria-hidden="true"><Icon name="warn" size={18} /></span>}
                {l}<b className="num">{n}</b></button>
            ))}
          </div>
        </div>
        {filter !== "all" && <p className="rule6" role="status">{RULE[filter]}</p>}
        {filter === "mine" && <p className="rule6 empty">Aucun spot ajouté pour l'instant.</p>}
      </div>
      {focus && <TerrainSections s={focus} />}
    </div>
  );
}

function BateauNotice() {
  return <div className="screen6"><div className="sec6"><h1 className="h6">Carte Offshore</h1><p className="sec">Les marques Offshore arrivent dans la vue pêche de cette version au même niveau de détail ; la version 5 du prototype les montrait sur le fond dessiné.</p></div></div>;
}

/** Bulle de la vue pêche : distance, ton journal, meilleur moment (maquette de Félix). */
function Bubble({ s, p, onClose }) {
  const right = p.sx + 23 + 12 + BW <= p.w - 12, left = right ? p.sx + 23 + 12 : Math.max(12, p.sx - 23 - 12 - BW);
  const top = Math.min(Math.max(TOP - 4, p.sy - 34), p.h - 232);
  return (
    <div className={`pop6 ${right ? "r" : "l"}`} style={{ left, top, width: BW, "--ay": `${p.sy - top}px` }} role="dialog" aria-label={s.name} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <b className="pop6-t">{s.name}</b>
      <ul>
        <li><Icon name="pin" size={20} /><span className="num">{s.route === 0 ? "Sur place" : `${s.km} km · ${s.route} min`}</span></li>
        <li><span className="cnt num" aria-hidden="true">{s.trips}</span><span>{s.trips} sortie{s.trips > 1 ? "s" : ""}</span></li>
        <li><span className="fishc" aria-hidden="true"><Icon name="fish" size={14} /></span><span>{s.fish} poisson{s.fish > 1 ? "s" : ""}</span></li>
        <li className="best6"><Icon name="clock" size={20} /><span>{s.win ? <>Meilleur moment<br /><b className="num">{span(s.win)}</b></> : s.status === "nr" ? "Non recommandé aujourd'hui" : "Pas de fenêtre aujourd'hui"}</span></li>
      </ul>
      <p className="pop6-src">km à vol d'oiseau · démo</p>
    </div>
  );
}

/** Sous la carte : pourquoi ce spot est bon aujourd'hui par son terrain (V3-029). */
function TerrainSections({ s }) {
  const T = terrain(s), t = tierOf(s.fav), good = s.fav >= 60 && !s.status;
  return (
    <section className="sec6" aria-labelledby="h-terrain">
      <div className="sec6-head">
        <span className="eyebrow6">Le terrain · {s.name}</span>
        <h2 id="h-terrain">{good ? `Pourquoi ${s.name} est bon aujourd'hui` : `Le terrain de ${s.name} aujourd'hui`}</h2>
        <div className="verdict6"><Ring s={s} decor /><p><b>{s.fav ?? "–"}/100 · {t ? t.word : "sans note"}</b><br />{T.verdict}</p></div>
      </div>
      <ol className="facts6">
        {T.rows.map((r) => (
          <li key={r.key} className="fact6">
            <div className="fact6-top"><Effect e={r.effect} /><h3>{r.title}</h3></div>
            <p className="today6">{r.today}</p>
            {r.key === "maree" && <TideWindows w={r.windows} />}
            {r.fiche && <p className="fiche6"><span>La fiche :</span> {r.fiche} <Level n={r.level} /></p>}
            <details className="why6"><summary>Pourquoi, et d'où ça vient</summary>
              <p><b>Règle générale.</b> {r.rule.enonce} <Level n={r.rule.niveau} prefix="règle," /></p>
              {r.rule2 && <p>{r.rule2.enonce} <Level n={r.rule2.niveau} prefix="règle," /></p>}
              <Sources list={[...r.rule.sources, ...(r.rule2?.sources || [])]} />
            </details>
          </li>
        ))}
      </ol>
      <div className="ctx6">
        <h3>Ce que dit la fiche du spot</h3>
        {T.ctx.map((c) => <p key={c.key}><b>{c.title}.</b> {c.text} <Level n={c.level} /></p>)}
        {T.securite.length > 0 && <div className="sec-list6"><b><Icon name="shield" size={16} /> Sécurité</b><ul>{T.securite.map((x, i) => <li key={i}>{x.t} <span className="src6">({x.s})</span></li>)}</ul></div>}
        <details className="why6"><summary>Sources de la fiche ({T.sources.length})</summary><ul className="srcs6">{T.sources.map((x, i) => <li key={i}>{x}</li>)}</ul></details>
      </div>
      <p className="demo6">Terrain : fiche du spot, niveaux de preuve de 1 (scientifique) à 5 (règle de pêcheur). Marée, vent, houle et note du jour : démonstration.</p>
    </section>
  );
}
function TideWindows({ w }) {
  return (
    <ul className="tw6">{w.map((x) => (
      <li key={x.id} className={`${x.priority}${x.now ? " now" : ""}`}><span className="num">{hhmm(x.from)}–{hhmm(x.to)}</span><span>{x.label}</span>{x.priority === "prime" && <span className="tag6">prime</span>}</li>
    ))}</ul>
  );
}
function Sources({ list }) {
  if (!list.length) return <p className="src6">Source : règle de pêcheur, sans source publiée.</p>;
  return <ul className="srcs6">{list.map((x, i) => <li key={i}>{x.url ? <a href={x.url} target="_blank" rel="noreferrer">{x.ref}</a> : x.ref}</li>)}</ul>;
}

/** Vent animé : nappe de couleurs (force) et traînées (direction), dessinés en coordonnées d'écran. */
// Échelle en nœuds, d'après la maquette vidéo : violet, bleu, sarcelle, vert, puis jaune, orange et rouge pour le vent fort.
const STOPS = [[0, [42, 37, 88]], [6, [59, 47, 120]], [10, [62, 69, 144]], [13, [59, 90, 146]], [16, [52, 110, 138]], [19, [52, 131, 138]], [22, [61, 146, 133]], [26, [75, 154, 110]], [31, [168, 154, 74]], [36, [184, 116, 62]], [42, [168, 70, 64]]];
export function windColor(kn) {
  for (let i = 1; i < STOPS.length; i++) {
    if (kn <= STOPS[i][0]) { const [a, ca] = STOPS[i - 1], [b, cb] = STOPS[i], f = (kn - a) / (b - a); return ca.map((c, j) => Math.round(c + (cb[j] - c) * f)); }
  }
  return STOPS.at(-1)[1];
}
function WindLayer({ v, w, h }) {
  const field = useRef(null), parts = useRef(null), vr = useRef(v), P = useRef([]);
  vr.current = v;
  useEffect(() => { // nappe de couleurs, redessinée à chaque changement de vue
    const c = field.current, dpr = Math.min(2, devicePixelRatio || 1);
    c.width = w * dpr; c.height = h * dpr;
    const cols = Math.ceil(w / 16), rows = Math.ceil(h / 16), off = document.createElement("canvas");
    off.width = cols; off.height = rows;
    const o = off.getContext("2d"), img = o.createImageData(cols, rows);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const wx = ((i + 0.5) * 16 - v.x) / v.k, wy = ((j + 0.5) * 16 - v.y) / v.k, rgb = windColor(KN(windAt(wx, wy, NOW).kmh)), q = (j * cols + i) * 4;
      img.data[q] = rgb[0]; img.data[q + 1] = rgb[1]; img.data[q + 2] = rgb[2]; img.data[q + 3] = 255;
    }
    o.putImageData(img, 0, 0);
    const ctx = c.getContext("2d"); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(off, 0, 0, c.width, c.height);
    parts.current?.getContext("2d").clearRect(0, 0, parts.current.width, parts.current.height);
  }, [v, w, h]);
  useEffect(() => { // traînées : particules portées par le vent ; image fixe si « moins d'animations »
    const c = parts.current, dpr = Math.min(2, devicePixelRatio || 1), ctx = c.getContext("2d");
    c.width = w * dpr; c.height = h * dpr; ctx.scale(dpr, dpr);
    const seed = () => ({ x: (Math.random() * w - vr.current.x) / vr.current.k, y: (Math.random() * h - vr.current.y) / vr.current.k, age: Math.random() * 80 });
    P.current = Array.from({ length: Math.round((w * h) / 760) }, seed);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepOne = (p, len) => {
      const V = vr.current, ww = windAt(p.x, p.y, NOW), dir = ((ww.fromDeg + 180) * Math.PI) / 180, px = (ww.kmh * 0.045 * len) / V.k;
      return [p.x + Math.sin(dir) * px, p.y - Math.cos(dir) * px];
    };
    if (still) {
      ctx.strokeStyle = IL.trail; ctx.lineWidth = 1.2;
      for (let y = 18; y < h; y += 30) for (let x = 18; x < w; x += 30) {
        const V = vr.current, p = { x: (x - V.x) / V.k, y: (y - V.y) / V.k }, [nx, ny] = stepOne(p, 9);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(V.x + nx * V.k, V.y + ny * V.k); ctx.stroke();
      }
      return undefined;
    }
    let raf = 0, run = true;
    const frame = () => {
      if (!run) return;
      if (!document.hidden) {
        const V = vr.current;
        ctx.globalCompositeOperation = "destination-in"; ctx.fillStyle = IL.fade; ctx.fillRect(0, 0, w, h); // traînée courte, comme la maquette
        ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = IL.trail; ctx.lineWidth = 1.1; ctx.lineCap = "round"; ctx.beginPath();
        for (const p of P.current) {
          const [nx, ny] = stepOne(p, 1), sx = V.x + p.x * V.k, sy = V.y + p.y * V.k, ex = V.x + nx * V.k, ey = V.y + ny * V.k;
          if (++p.age > 40 || ex < 0 || ey < 0 || ex > w || ey > h) Object.assign(p, seed(), { age: 0 });
          else { ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); p.x = nx; p.y = ny; }
        }
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { run = false; cancelAnimationFrame(raf); };
  }, [w, h]);
  return <><canvas className="wind-field" ref={field} aria-hidden="true" /><canvas className="wind-parts" ref={parts} aria-hidden="true" /></>;
}

/** Météo : la vue conditions. */
export function Meteo({ st, notify, openPos }) {
  const [day, setDay] = useState("today");
  const [sel, setSel] = useState(null);
  const s = SPOTS.find((x) => x.id === sel);
  const focus = s || ranking(SPOTS).cards[0];
  if (st.mode === "bateau") return <BateauNotice />;
  return (
    <div className="screen6">
      <div className="mapwrap6">
        <h1 className="vh">Météo : le vent et les conditions de chaque spot</h1>
        <GeoMap items={SPOTS} selected={sel} onSelect={(id) => setSel(sel === id ? null : id)} Layer={WindLayer} panelW={s ? PW : 0} top={TOP} focusX={(w) => w - 12 - PW - 6 - 23}
          panel={s ? <Panel s={s} onClose={() => setSel(null)} /> : null} legend={<Legend wind />}
          onLocate={() => notify("Position : Pirou, automatique (±30 m) · démonstration")} onLayers={() => notify("Couches : vent (affiché) · mer et houle à venir avec les vraies prévisions")}
          tag="Vent : démo · côte © IGN" />
        <div className="top6">
          <PlaceField pos={st.pos} openPos={openPos} />
          <div className="chips6" role="group" aria-label="Jour">
            {[["today", "Aujourd'hui"], ["tomorrow", "Demain"], ["week", "7 jours"]].map(([k, l]) => (
              <button key={k} className="chip6 day" aria-pressed={day === k} onClick={() => { setDay(k); if (k !== "today") notify("Démonstration : seule la journée d'aujourd'hui est remplie"); }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <MeteoSections s={focus} />
    </div>
  );
}

function SkyIcon() {
  return (
    <svg className="sky6" viewBox="0 0 96 72" aria-hidden="true">
      <defs><radialGradient id="sun6" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor={IL.sunCore} /><stop offset="1" stopColor={IL.sunEdge} /></radialGradient>
        <linearGradient id="cl6" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={IL.cloudTop} /><stop offset="1" stopColor={IL.cloudBottom} /></linearGradient></defs>
      <g stroke={IL.sunRay} strokeWidth="3" strokeLinecap="round">{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1={38 + Math.cos((a * Math.PI) / 180) * 17} y1={24 + Math.sin((a * Math.PI) / 180) * 17} x2={38 + Math.cos((a * Math.PI) / 180) * 23} y2={24 + Math.sin((a * Math.PI) / 180) * 23} />)}</g>
      <circle cx="38" cy="24" r="13" fill="url(#sun6)" />
      <path d="M30 52h44a12 12 0 0 0 0-24 16 16 0 0 0-30-4 11 11 0 0 0-14 28z" fill="url(#cl6)" />
      <g stroke={IL.rain} strokeWidth="2.6" strokeLinecap="round">{[40, 50, 60, 70].map((x, i) => <line key={x} x1={x} y1={58 + (i % 2) * 2} x2={x - 3} y2={66 + (i % 2) * 2} />)}</g>
    </svg>
  );
}

/**
 * Panneau Météo (maquette vidéo, 3e temps) : le spot et sa note, le ciel, puis une ligne « Libellé : valeur » par
 * élément, la sécurité d'abord (V3-028). Le sens et le poids de chaque élément sont expliqués sous la carte.
 */
function Panel({ s, onClose }) {
  const c = conditions(s);
  const safety = s.status === "nr" ? "non recommandé" : s.status === "verify" ? "à vérifier" : { ok: "OK", prudence: "prudence", danger: "danger" }[s.safety] || "à vérifier";
  const rows = [
    ["shield", "Sécurité", safety],
    ["thermo", "Temp. de l'air", `${c.air}\u202f°C`],
    ["waves", "Temp. de l'eau", `${c.water}\u202f°C`],
    ["arrow", "Vent", `${c.windKn} nds ${compass(c.windFrom)}`, c.windFrom],
    ["wind", "Rafales", `${KN(c.gustKmh)} nds`],
    ["waves", "Houle", c.swell == null ? "non documentée" : `${fr(c.swell)} m`],
    ["gauge", "Pression", `${c.pressure} hPa`],
    ["tide", "Marée", c.tide],
  ];
  return (
    <aside className="panel6" style={{ width: PW }} aria-label={`Conditions à ${s.name}`} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="panel6-h"><b>{s.name}</b><Ring s={s} decor /></div>
      <SkyIcon />
      <p className="sky6-t">{c.sky}</p>
      <p className="sky6-s num">Pluie : {c.rain} %</p>
      <ul className="p6-rows">{rows.map(([ic, l, val, deg]) => (
        <li key={l}><span className="p6-ic" style={deg != null ? { transform: `rotate(${deg + 180}deg)` } : undefined}><Icon name={ic} size={17} /></span>
          <span><span className="p6-l">{l}</span> : <span className="p6-v num">{val}</span></span></li>
      ))}</ul>
      <p className="p6-src">AROME et Shom, 06:00 · démo</p>
      <button className="vh-focus" onClick={onClose}>Fermer le panneau</button>
    </aside>
  );
}

/** Sous la carte : comment chaque élément a pesé dans la note (V3-029). */
function MeteoSections({ s }) {
  const M = meteo(s), t = tierOf(s.fav), max = Math.max(...M.items.map((i) => Math.abs(i.pts || 0)), 1);
  return (
    <section className="sec6" aria-labelledby="h-meteo">
      <div className="sec6-head">
        <span className="eyebrow6">La météo · {s.name}</span>
        <h2 id="h-meteo">Comment la météo a pesé dans la note</h2>
        <div className="verdict6"><Ring s={s} decor />
          <p><b>{s.fav ?? "–"}/100 · {t ? t.word : "sans note"}</b><br />Les conditions du jour comptent pour <b className="num">{M.sum >= 0 ? "+" : "−"}{Math.abs(M.sum)}</b> points ; le reste (<span className="num">{M.base}</span>) vient du terrain et de la saison.</p></div>
        <div className="compo6" aria-hidden="true"><span className="b" style={{ width: `${M.base}%` }} /><span className={`m ${M.sum < 0 ? "neg" : ""}`} style={{ width: `${Math.abs(M.sum)}%` }} /></div>
        <div className="compo6-l num" aria-hidden="true"><span>terrain et saison {M.base}</span><span>conditions du jour {M.sum >= 0 ? "+" : "−"}{Math.abs(M.sum)}</span></div>
      </div>
      <ol className="w6">
        {M.items.map((i) => (
          <li key={i.key} className="w6-row">
            <details>
              <summary>
                <span className="w6-l">{i.label}</span><span className="w6-v num">{i.value}</span>
                <span className="w6-bar" aria-hidden="true"><i className={i.pts > 0 ? "p" : i.pts < 0 ? "n" : "z"} style={{ width: `${(Math.abs(i.pts || 0) / max) * 50}%` }} /></span>
                <span className="w6-p num">{i.pts == null ? "–" : i.pts > 0 ? `+${i.pts}` : i.pts < 0 ? `−${-i.pts}` : "0"}</span>
                <Effect e={ptsEffect(i.pts)} small />
              </summary>
              <div className="w6-why">
                <p><b>Ici, aujourd'hui.</b> {i.why}.</p>
                <p><b>Règle générale.</b> {i.rule.enonce} <Level n={i.rule.niveau} prefix="règle," /></p>
                <Sources list={i.rule.sources} />
              </div>
            </details>
          </li>
        ))}
      </ol>
      <p className="demo6">Poids de démonstration : les vrais poids viendront du calcul de la note. Règles et sources : connaissances sourcées du projet ({M.items.length} éléments ; « – » : aucun effet annoncé faute de donnée).</p>
    </section>
  );
}
