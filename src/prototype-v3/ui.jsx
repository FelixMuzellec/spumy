// SPUMY V3 — composants de base du prototype (Design System V3, § 7).
import { useEffect, useRef } from "react";
import { tierOf, displayValue, gaugeWidth, TIER_INK } from "../design/v3/tokens.js";
import { SUN, NOW, span } from "./data.js";

/* global PHOTO_BASE, BRAND_BASE */
export const photoSrc = (id, size = 1600) => `${typeof PHOTO_BASE === "string" ? PHOTO_BASE : "photos/"}${id}-${size}.webp`;
export const brandSrc = (f) => `${typeof BRAND_BASE === "string" ? BRAND_BASE : "brand/"}${f}`;

// Pictogrammes au trait (famille Lucide, licence ISC), 24 px, épaisseur 1,75.
const P = {
  home: ["M3 10.5 12 3l9 7.5", "M5 9.5V21h14V9.5", "M9.5 21v-6h5v6"],
  map: ["M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z", "M8 2v16", "M16 6v16"],
  wind: ["M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2", "M9.6 4.6A2 2 0 1 1 11 8H2", "M12.6 19.4A2 2 0 1 0 14 16H2"],
  book: ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  user: ["M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1", "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  pin: ["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z", "M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  right: ["m9 18 6-6-6-6"], left: ["m15 18-6-6 6-6"], up: ["m18 15-6-6-6 6"], down: ["m6 9 6 6 6-6"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10", "m9 12 2 2 4-4"],
  warn: ["m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z", "M12 9v4", "M12 17h.01"],
  stop: ["M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z", "M12 8v4", "M12 16h.01"],
  ban: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "m4.9 4.9 14.2 14.2"],
  help: ["M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3", "M12 17h.01"],
  info: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 16v-4", "M12 8h.01"],
  locate: ["M12 2v3", "M12 19v3", "M2 12h3", "M19 12h3", "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  layers: ["m12 2 10 5-10 5L2 7z", "m2 17 10 5 10-5", "m2 12 10 5 10-5"],
  plus: ["M12 5v14", "M5 12h14"], x: ["M18 6 6 18", "m6 6 12 12"],
  grip: ["M9 6h.01", "M9 12h.01", "M9 18h.01", "M15 6h.01", "M15 12h.01", "M15 18h.01"],
  boat: ["M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1", "M19.4 17 22 12H2l2.6 5", "M12 12V4l6 8"],
  offline: ["M2 2l20 20", "M8.5 16.5a5 5 0 0 1 7 0", "M2 8.82a15 15 0 0 1 4.17-2.65", "M10.66 5c4.01-.36 8.14.9 11.34 3.76", "M12 20h.01"],
};
export function Icon({ name, size = 20, label, dashed }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === "grip" ? 3 : 1.75} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      {dashed && <circle cx="12" cy="12" r="10" strokeDasharray="3 2.5" />}
      {(P[name] || []).map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

/** Jauge : chiffre et mot écrits, remplissage d'une seule couleur au palier, repère de valeur (DS § 3.3). */
export function Gauge({ label, value, word, size = "", note }) {
  const d = displayValue(value), t = tierOf(value), w = gaugeWidth(value);
  const text = d === null ? word || "Sans note" : `${d}/100 — ${word || t.word}`;
  return (
    <div className={`gauge ${size}`}>
      <div className="lbl"><span>{label}{note && <span className="muted"> · {note}</span>}</span><span className="val">{text}</span></div>
      {d !== null && (
        <div className="track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={d} aria-valuetext={text}>
          <div className="fill" style={{ width: `${w}%`, background: `var(--tier-${t.id})` }} />
          <div className="index" style={{ left: `${w}%` }} />
        </div>
      )}
    </div>
  );
}

/** Disque de score : chiffre de 20 px gras (grand texte) sur le palier, mot et Confiance à côté. */
export function Score({ value, word, conf, level }) {
  const d = displayValue(value), t = tierOf(value);
  return (
    <div className="score">
      <span className="disc" style={t ? { background: `var(--tier-${t.id})`, color: `var(--palette-${TIER_INK[t.id] === "navy" ? "navy" : "off-white"})` } : { background: "var(--surface-sunken)" }}
        role="img" aria-label={`Favorabilité ${d ?? "sans note"}${d !== null ? " sur 100" : ""}`}>{d ?? "–"}</span>
      <span className="txt"><b>{word || (t ? t.word : "Sans note")}</b>{conf !== undefined && <span>Confiance {String(level).toLowerCase()} ({conf}) · ne change pas le rang</span>}</span>
    </div>
  );
}

/** Pastille de statut : toujours un pictogramme et un mot. */
export function Safety({ s, short }) {
  if (s.status === "verify") return <span className="badge verify"><Icon name="help" size={16} dashed />À vérifier</span>;
  if (s.status === "nr") return <span className="badge danger"><Icon name="ban" size={16} />Non recommandé</span>;
  if (s.safety === "ok") return <span className="badge ok"><Icon name="shield" size={16} />{short ? "OK" : "Sécurité OK"}</span>;
  if (s.safety === "prudence") return <span className="badge warn"><Icon name="warn" size={16} />Prudence</span>;
  if (s.safety === "danger") return <span className="badge danger"><Icon name="stop" size={16} />Danger</span>;
  return <span className="badge verify"><Icon name="help" size={16} dashed />Sécurité à vérifier</span>;
}

export function Hero({ photo, title, sub, children, min }) {
  return (
    <section className="hero" style={min ? { minHeight: min } : undefined}>
      {photo && <img src={photoSrc(photo, 1600)} alt="" loading="eager" />}
      <span className="illus">Illustration</span>
      <div className="inner"><h1>{title}</h1>{sub && <p>{sub}</p>}{children}</div>
    </section>
  );
}

/** Frise du jour : nuit grisée, heures favorables coloriées au palier, repère « maintenant ». */
export function DayStrip({ bands }) {
  const pct = (h) => `${(h / 24) * 100}%`;
  return (
    <div>
      <div className="strip" role="img" aria-label={`Heures favorables : ${bands.map((b) => span(b.w)).join(", ")}`}>
        <span className="night" style={{ left: 0, width: pct(SUN.rise) }} /><span className="night" style={{ left: pct(SUN.set), right: 0 }} />
        {bands.map((b, i) => <span key={i} className="fav" style={{ left: pct(b.w[0]), width: pct(b.w[1] - b.w[0]), background: `var(--tier-${tierOf(b.fav).id})` }} />)}
        <span className="now" style={{ left: pct(NOW) }} />
      </div>
      <div className="ticks num" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
    </div>
  );
}

/** Feuille modale : voile, Échap ferme, focus sur le titre. */
export function Sheet({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <button className="grip" aria-label="Fermer" onClick={onClose} />
        <div className="row between"><h2 tabIndex={-1} ref={ref}>{title}</h2><button className="btn ghost" onClick={onClose}>Fermer</button></div>
        {children}
      </div>
    </>
  );
}
