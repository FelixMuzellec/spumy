// SPUMY V3 — fiche spot (UX-V3 § 9) et comparaison (UX-V3 § 10).
import { useState } from "react";
import { tierOf } from "../design/v3/tokens.js";
import { Gauge, Safety, Icon, photoSrc } from "./ui.jsx";
import { SPOT, TIDE, SUN, NOW, tideHeight, hhmm, span } from "./data.js";

/** Courbe de marée du jour : heures favorables coloriées au palier de leur Favorabilité, nuit, « maintenant ». */
function TideCurve({ s }) {
  const [hover, setHover] = useState(null);
  const W = 340, H = 130, x = (t) => 12 + (t / 24) * (W - 24), y = (h) => 100 - ((h - (TIDE.mean - TIDE.amp)) / (2 * TIDE.amp)) * 82;
  const pts = Array.from({ length: 97 }, (_, i) => i / 4).map((t) => `${x(t).toFixed(1)},${y(tideHeight(t)).toFixed(1)}`);
  const curve = `M${pts.join(" L")}`, area = `${curve} L${x(24)},100 L${x(0)},100 Z`;
  const bands = [s.win && { w: s.win, fav: s.fav }, s.second && { w: s.second, fav: Math.max(0, (s.fav ?? 0) - 30) }].filter(Boolean);
  const pick = (e) => { const r = e.currentTarget.getBoundingClientRect(); const t = Math.min(24, Math.max(0, (((e.clientX - r.left) / r.width) * W - 12) / (W - 24) * 24)); setHover(t); };
  const id = `under-${s.id}`;
  return (
    <div className="tide">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Marée du jour : basse mer ${hhmm(TIDE.bm)}, pleine mer ${hhmm(TIDE.pm)}, coefficient ${TIDE.coef}. Heures favorables : ${bands.map((b) => span(b.w)).join(", ") || "aucune"}.`}
        onPointerMove={pick} onPointerDown={pick} onPointerLeave={() => setHover(null)} data-noswipe>
        <defs><clipPath id={id}><path d={area} /></clipPath></defs>
        <rect x={x(0)} y="6" width={x(SUN.rise) - x(0)} height="94" fill="var(--surface-sunken)" />
        <rect x={x(SUN.set)} y="6" width={x(24) - x(SUN.set)} height="94" fill="var(--surface-sunken)" />
        {bands.map((b, i) => <rect key={i} x={x(b.w[0])} y="0" width={x(b.w[1]) - x(b.w[0])} height="100" clipPath={`url(#${id})`} fill={`var(--tier-${tierOf(b.fav).id})`} />)}
        <path d={curve} fill="none" stroke="var(--text-primary)" strokeWidth="2.5" />
        <line x1={x(0)} x2={x(24)} y1="100" y2="100" stroke="var(--border-strong)" />
        <line x1={x(NOW)} x2={x(NOW)} y1="4" y2="100" stroke="var(--gauge-index)" strokeWidth="2" strokeDasharray="4 3" />
        <text x={x(NOW) - 4} y="12" fontSize="12" textAnchor="end" fill="var(--text-secondary)">maintenant</text>
        <text x={x(TIDE.pm) + 6} y={y(tideHeight(TIDE.pm)) - 4} fontSize="12" fontWeight="700" fill="var(--text-primary)">PM {hhmm(TIDE.pm)}</text>
        <text x={x(0) + 2} y="96" fontSize="12" fontWeight="700" fill="var(--text-primary)">BM {hhmm(TIDE.bm)}</text>
        {[0, 6, 12, 18, 24].map((t) => <text key={t} x={x(t)} y="115" fontSize="12" fill="var(--text-muted)" textAnchor={t === 0 ? "start" : t === 24 ? "end" : "middle"}>{String(t).padStart(2, "0")}</text>)}
        {hover !== null && <g><line x1={x(hover)} x2={x(hover)} y1="4" y2="100" stroke="var(--text-primary)" />
          <text x={Math.min(x(hover) + 6, W - 104)} y="128" fontSize="12" fontWeight="700" fill="var(--text-primary)">{hhmm(hover)} · {tideHeight(hover).toFixed(1).replace(".", ",")} m</text></g>}
      </svg>
      <div className="row">{bands.map((b, i) => <span key={i} className="badge info"><i className="sw" style={{ background: `var(--tier-${tierOf(b.fav).id})` }} />
        <span className="num">{span(b.w)} · {b.fav} — {tierOf(b.fav).word}</span></span>)}{!bands.length && <span className="meta">Fenêtre non déterminable : {s.noWinWhy || s.nrWhy}</span>}</div>
      <p className="meta">Coloriées : heures favorables, dans la couleur du palier de leur Favorabilité. Grisé : nuit (lever {hhmm(SUN.rise)}, coucher {hhmm(SUN.set)}). Touche la courbe pour l'heure et la hauteur. Coefficient {TIDE.coef}.</p>
    </div>
  );
}

export function Fiche({ id, go, back }) {
  const s = SPOT[id] || SPOT.a;
  const status = s.status === "verify" ? "À vérifier" : s.status === "nr" ? "Non recommandé" : undefined;
  return (
    <div className="screen flush">
      <div className="row between" style={{ padding: "8px var(--gutter)" }}>
        <button className="btn small" onClick={back}><Icon name="left" size={18} />Retour</button>
        <button className="btn small" onClick={() => go("comparer", `c-${s.id === "c" ? "a" : s.id}`)}>Comparer</button>
      </div>
      <div style={{ position: "relative", height: 190, overflow: "hidden" }}>
        <img src={photoSrc(s.photo, 720)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <span className="badge photo-tag">Illustration : ce n'est pas le lieu</span>
      </div>
      <div className="screen">
        <h1>{s.name}</h1>
        <div className="row"><span className="badge info num">{s.verified ? `${s.route} min de route` : `~${s.route} min, estimation`} · {s.km} km</span><span className="badge info">{s.kind}</span><span className="badge info">bar</span></div>
        <div className="card">
          <Gauge size="big" label="Favorabilité" value={s.fav} word={status} />
          <Gauge size="thin" label="Confiance" value={s.conf} word={s.level} />
          <span className="meta">Confiance : qualité des données et des preuves. Elle ne change pas le rang.</span>
          <div className="row"><Safety s={s} /></div>
        </div>
        {(s.danger || s.verifyWhy || s.nrWhy) && (
          <div className="card" style={{ borderLeft: "5px solid var(--danger-ink)" }}>
            <b>{s.nrWhy || s.verifyWhy || "Sécurité"}</b>{s.danger && <span className="sec">{s.danger}</span>}
          </div>
        )}
        <div className="card"><b>Marée et heures favorables</b><TideCurve s={s} /></div>
        <div className="ind" aria-label="Indicateurs du jour">
          <div>Vent<b>{s.wind.from} {s.wind.bft} Bft</b>rafales {s.wind.gust} km/h · {s.wind.expo}</div>
          <div>Vagues<b>1,1 m · 9 s</b>houle O</div>
          <div>Eau<b>13 °C</b></div>
          <div>Pression<b>1 018 hPa ↗</b></div>
          <div>Ciel<b>couvert</b>pluie 0 mm</div>
          <div>Lune<b>gibbeuse</b>lever 08:22</div>
        </div>
        <details className="card" open><summary className="row between"><b>Approche</b><Icon name="down" /></summary>
          <p className="sec">Synthèse : se garer en haut du chemin côtier, descendre vers le platier par le sentier balisé, poste sur la pointe, prospecter du large vers le bord.</p>
          <p className="meta">Détail (démonstration) : départ, cheminement, repères, poste, sens de prospection, variantes selon la marée, précautions.</p></details>
        <div className="card"><b>Stratégie</b>
          <div className="seg2" role="tablist" aria-label="Niveau"><button role="tab" aria-selected="true">Vue rapide</button><button role="tab" aria-selected="false">Détails</button><button role="tab" aria-selected="false">Expert</button></div>
          <span className="sec">Leurre souple de 12 cm, récupération lente dans le courant, du large vers le bord.</span></div>
        <div className="card"><b>Leurres conseillés</b><span className="sec">Shad de 12 cm, couleur naturelle · jerkbait flottant de 12 cm si l'eau est claire.</span><span className="meta">Conseil générique, sans inventaire. Ta sélection viendra avec Matériel.</span></div>
        <details className="card"><summary className="row between"><b>Pourquoi ?</b><Icon name="down" /></summary>
          <span className="sec">{s.reason[0].toUpperCase() + s.reason.slice(1)}.</span><span className="meta">Composantes réellement calculées, couverture, données manquantes, provenance et âge : dans le prototype, ce texte est un exemple.</span></details>
        <div className="row"><button className="btn grow">Réglementation</button><button className="btn grow">Sources</button></div>
      </div>
    </div>
  );
}

export function Comparaison({ ids, back }) {
  const [a, b] = (ids || "c-a").split("-").map((k) => SPOT[k] || SPOT.a);
  const comparable = a.win && b.win && a.fav !== null && b.fav !== null && !a.status && !b.status;
  const rows = [
    ["Sécurité", (s) => <Safety s={s} />],
    ["Vent", (s) => <span className="num">{s.wind.from} {s.wind.bft} Bft · r. {s.wind.gust} km/h · <b>{s.wind.expo}</b></span>],
    ["Favorabilité", (s) => <span className="num">{s.fav ?? "—"}{tierOf(s.fav) ? ` — ${tierOf(s.fav).word}` : ""}</span>],
    ["Confiance", (s) => <span className="num">{s.conf} — {s.level} · météo 06:00</span>],
    ["Horaires", (s) => <span className="num">{span(s.win) || "non déterminable"}</span>],
    ["Route", (s) => <span className="num">{s.verified ? "" : "~"}{s.route} min · {s.km} km</span>],
    ["Règles", () => "—"],
    ["Raison du rang", (s) => s.reason],
  ];
  return (
    <div className="screen">
      <div className="row"><button className="btn small" onClick={back}><Icon name="left" size={18} />Retour</button></div>
      <h1>Comparer</h1>
      <p className="meta">Référence : {a.name} · alternative : {b.name} · aujourd'hui, même fenêtre de comparaison.</p>
      <div style={{ overflowX: "auto" }}>
        <table className="cmp">
          <thead><tr><th scope="col"><span className="vh">Critère</span></th><th scope="col">{a.name}</th><th scope="col">{b.name}</th></tr></thead>
          <tbody>{rows.map(([k, f]) => <tr key={k}><th scope="row">{k}</th><td>{f(a)}</td><td>{f(b)}</td></tr>)}</tbody>
        </table>
      </div>
      {comparable ? (
        <div className="card"><b className="num">{b.route - a.route >= 0 ? "+" : "−"}{Math.abs(b.route - a.route)} min de route ({b.km - a.km >= 0 ? "+" : "−"}{Math.abs(b.km - a.km)} km) pour {b.fav - a.fav >= 0 ? "+" : "−"}{Math.abs(b.fav - a.fav)} points de Favorabilité</b>
          <span className="sec">{b.reason[0].toUpperCase() + b.reason.slice(1)} ({b.name}) ; vent {b.wind.expo} sur {b.name}, {a.wind.expo} sur {a.name}.</span></div>
      ) : (
        <div className="card zone-verify"><b>Avantage non établi</b><span className="sec">Un des deux spots est à vérifier, sans note ou sans fenêtre : les scores ne sont pas comparables.</span></div>
      )}
      <p className="meta">Aucun verdict automatique, aucun trophée. La sécurité, la réglementation et l'accès ne se compensent pas.</p>
    </div>
  );
}
