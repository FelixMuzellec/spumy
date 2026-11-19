// SPUMY — composants d'interface (phase 11). Aucun ne connaît le moteur : ils reçoivent des valeurs déjà calculées.
import React, { useId, useState } from "react";
import { LUCIDE } from "./lucide.js";
import { GLYPHS } from "./glyphs.js";

const ICONS = { ...LUCIDE, ...GLYPHS };
export const ICON_NAMES = Object.keys(ICONS);

/** Pictogramme au trait (Lucide ou SPUMY). Décoratif par défaut ; `label` le rend lisible par un lecteur d'écran. */
export function Icon({ name, size = 22, stroke = 2, label, className, style }) {
  const node = ICONS[name];
  if (!node) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" className={className} style={{ display: "block", flex: "none", ...style }}
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"} focusable="false">
      {node.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...svgAttrs(attrs) }))}
    </svg>
  );
}
const svgAttrs = (a) => Object.fromEntries(Object.entries(a).map(([k, v]) => [k === "stroke-dasharray" ? "strokeDasharray" : k, v]));

/** Marque SPUMY : une crête d'écume (spume) qui déferle sur une ligne d'eau, au dégradé cyan. */
export function LogoMark({ size = 36 }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size * 1.4} height={size} viewBox="0 0 56 40" aria-hidden="true" focusable="false" style={{ display: "block", flex: "none" }}>
      <defs>
        <linearGradient id={`lg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7ef0ff" /><stop offset="0.55" stopColor="var(--accent, #1fd2f5)" /><stop offset="1" stopColor="var(--accent-2, #2a9df4)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#lg${id})`} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 25C11 13 22 6.5 33 8.2c7.4 1.1 11.6 6.6 9.8 11.8-1.4 4-6.4 5.3-9.4 2.7-2.3-2-1.6-5.6 1.4-6.2" strokeWidth="5" />
        <path d="M4 33.5c6.5-4 12.5-4 19 0s12.5 4 19 0c3.6-2.2 6.8-3 10-2.4" strokeWidth="4.2" />
      </g>
      <g fill="#e9fbff"><circle cx="47.5" cy="9" r="2.2" /><circle cx="51.8" cy="14" r="1.5" /><circle cx="44.2" cy="4.6" r="1.3" /></g>
    </svg>
  );
}
export function Logo({ size = 30, href, onClick }) {
  const inner = (<><LogoMark size={size} /><span className="s-logo__word" style={{ fontSize: size * 0.84 }}>SPUMY</span></>);
  return href || onClick ? <a className="s-logo" href={href || "#"} onClick={onClick} aria-label="SPUMY, accueil">{inner}</a> : <span className="s-logo">{inner}</span>;
}

export function Button({ variant = "primary", size, block, icon, iconRight = "arrow-right", children, ...rest }) {
  const cls = ["s-btn", `s-btn--${variant}`, size === "sm" && "s-btn--sm", block && "s-btn--block"].filter(Boolean).join(" ");
  return (
    <button type="button" className={cls} {...rest}>
      {icon && <Icon name={icon} size={20} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={19} stroke={2.4} />}
    </button>
  );
}

export function IconButton({ icon, label, variant, size = 22, ...rest }) {
  return (
    <button type="button" className={["s-iconbtn", variant && `s-iconbtn--${variant}`].filter(Boolean).join(" ")} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={size} />
    </button>
  );
}

export function Chip({ tone, icon, children, className, style, ...rest }) {
  return (
    <span className={["s-chip", tone && `s-chip--${tone}`, className].filter(Boolean).join(" ")} style={style} {...rest}>
      {icon && <Icon name={icon} size={15} stroke={2.4} />}{children}
    </span>
  );
}

/** Mention « données fictives » : toute valeur inventée pour une maquette la porte (§7.4 du prompt maître). */
export const DemoMark = ({ children = "Données fictives" }) => <Chip tone="demo">{children}</Chip>;

export function Card({ tone, flush, tight, as = "div", className, children, ...rest }) {
  const Tag = as;
  const cls = ["s-card", tone && `s-card--${tone}`, flush && "s-card--flush", tight && "s-card--tight", as === "button" && "s-card--interactive", className].filter(Boolean).join(" ");
  return <Tag className={cls} {...(as === "button" ? { type: "button" } : {})} {...rest}>{children}</Tag>;
}

export function Alert({ tone = "warn", icon, title, children }) {
  const ic = icon || { warn: "triangle-alert", gold: "trophy", nr: "ban", info: "info" }[tone];
  return (
    <Card tone={tone === "warn" ? "warn" : tone === "gold" ? "gold" : tone === "nr" ? "nr" : undefined} tight>
      <div className={`s-alert s-alert--${tone}`}>
        <span className="s-alert__icon"><Icon name={ic} size={26} stroke={2.2} /></span>
        <div className="s-stack" style={{ gap: 2 }}>
          {title && <div className="s-alert__title">{title}</div>}
          <div style={{ color: "var(--text-1)", fontSize: 15, lineHeight: 1.35 }}>{children}</div>
        </div>
      </div>
    </Card>
  );
}

export function Tiles({ items, onSelect }) {
  return (
    <nav className="s-tiles" aria-label="Accès rapides">
      {items.map((t) => (
        <button key={t.id} type="button" className="s-tile" onClick={() => onSelect?.(t.id)}>
          <Icon name={t.icon} size={26} />{t.label}
        </button>
      ))}
    </nav>
  );
}

export function Stats({ items }) {
  return (
    <div className="s-stats">
      {items.map((s) => (
        <div key={s.k} className="s-stat">
          <div className="s-stat__k"><Icon name={s.icon} size={17} />{s.k}</div>
          <div className="s-stat__v">{s.v}</div>
          {s.s && <div className="s-stat__s">{s.s}</div>}
        </div>
      ))}
    </div>
  );
}

export function Segmented({ options, value, onChange, label, variant }) {
  return (
    <div className={["s-seg", variant && `s-seg--${variant}`].filter(Boolean).join(" ")} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" className="s-seg__btn" aria-pressed={o.id === value} onClick={() => onChange?.(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

export function TopBar({ title, onBack, actions, variant, children }) {
  return (
    <header className={["s-topbar", "s-pad", variant && `s-topbar--${variant}`].filter(Boolean).join(" ")}>
      {onBack && <IconButton icon="arrow-left" label="Retour" onClick={onBack} variant={variant === "over" ? "on-photo" : undefined} size={24} />}
      {title && <h1 className="s-topbar__title">{title}</h1>}
      {children}
      {actions}
    </header>
  );
}

export function BottomNav({ items, current, onSelect }) {
  return (
    <nav className="s-nav" aria-label="Navigation principale">
      {items.map((it) => (
        <button key={it.id} type="button" className="s-nav__item" aria-current={it.id === current ? "page" : undefined} onClick={() => onSelect?.(it.id)}>
          <Icon name={it.icon} size={25} stroke={it.id === current ? 2.3 : 1.9} />{it.label}
        </button>
      ))}
    </nav>
  );
}

/**
 * Photo d'ambiance : aperçu flou immédiat puis image nette ; marquée « Illustration » (décision : jamais présentée comme
 * la photo réelle d'un spot ou d'une prise). `focus` = point d'intérêt en % pour le recadrage.
 */
export function Photo({ photo, size = 1600, fade, scrim, mark = true, markPos = "tr", className, style, children, eager }) {
  const [loaded, setLoaded] = useState(false);
  if (!photo) return <div className={["s-photo", className].filter(Boolean).join(" ")} style={style}>{children}</div>;
  const pos = `${photo.focus?.[0] ?? 50}% ${photo.focus?.[1] ?? 50}%`;
  const corner = { tr: { top: 10, right: 10 }, tl: { top: 10, left: 10 }, br: { bottom: 10, right: 10 }, bl: { bottom: 10, left: 10 } }[markPos];
  return (
    <div className={["s-photo", fade && "s-photo--fade", scrim && "s-photo--scrim", className].filter(Boolean).join(" ")} style={style}>
      {photo.lqip && <img className="s-photo__lqip" src={photo.lqip} alt="" aria-hidden="true" style={{ objectPosition: pos, opacity: loaded ? 0 : 1 }} />}
      <img src={photo.src(size)} alt={photo.alt} loading={eager ? "eager" : "lazy"} decoding="async" onLoad={() => setLoaded(true)}
        style={{ objectPosition: pos, opacity: loaded ? 1 : 0 }} />
      {mark && <span className="s-chip s-chip--photo" style={corner} title="Image générée : ambiance, pas une photo de ce lieu">Illustration</span>}
      {children && <div className="s-photo__content">{children}</div>}
    </div>
  );
}

const RING = {
  fav: ["var(--fav-a)", "var(--fav-b)"],
  pert: ["var(--pert-a)", "var(--pert-b)"],
  conf: ["var(--conf-a)", "var(--conf-b)"],
  accent: ["var(--accent)", "var(--accent-2)"],
  good: ["var(--good)", "var(--fav-a)"],
};

/** Anneau de score sur 100 : arc de 300°, longueur = la valeur. `null` : pas de note (anneau vide, tiret). */
export function ScoreRing({ value, kind = "fav", size = 72, stroke = 7, suffix = false, label, fontScale = 0.36 }) {
  const id = useId().replace(/:/g, "");
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, span = 300 / 360;
  const v = value == null ? 0 : Math.max(0, Math.min(100, value));
  const [a, b] = RING[kind] || RING.fav;
  return (
    <span className="s-ring" style={{ width: size, height: size }} role="img" aria-label={label ? `${label} : ${value == null ? "pas de note" : `${value} sur 100`}` : undefined}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs><linearGradient id={`rg${id}`} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
        <g transform={`rotate(120 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * span} ${c}`} />
          {value != null && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#rg${id})`} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${Math.max(0.001, c * span * (v / 100))} ${c}`} style={{ transition: "stroke-dasharray var(--t-slow) var(--ease)" }} />}
        </g>
      </svg>
      <span className="s-ring__val" aria-hidden="true">
        <span className="s-ring__num" style={{ fontSize: size * fontScale }}>{value == null ? "–" : value}{suffix && value != null && <small>/100</small>}</span>
      </span>
    </span>
  );
}

/** Les trois scores côte à côte, chacun ouvrable pour sa décomposition. */
export function ScoreTriplet({ fav, pert, conf, open, onOpen, size = 66 }) {
  const items = [["fav", "Favorabilité", fav], ["pert", "Pertinence", pert], ["conf", "Confiance", conf]];
  return (
    <div className="s-scores">
      {items.map(([k, l, v]) => (
        <button key={k} type="button" className="s-score" aria-pressed={open === k} onClick={() => onOpen?.(open === k ? null : k)} aria-label={`${l} : ${v == null ? "pas de note" : `${v} sur 100`}. Voir le détail`}>
          <ScoreRing value={v} kind={k} size={size} stroke={6.5} />
          <span className="s-score__label">{l}</span>
        </button>
      ))}
    </div>
  );
}

/** Palier de favorabilité (spécification v2 recalée en phase 8) : 75, 65, 55, 45. */
export const favBand = (v) => (v == null ? 0 : v >= 75 ? 5 : v >= 65 ? 4 : v >= 55 ? 3 : v >= 45 ? 2 : 1);
export const favWord = (v) => (v == null ? "Pas de note" : v >= 75 ? "Très favorable" : v >= 65 ? "Favorable" : v >= 55 ? "Correct" : v >= 45 ? "Moyen" : "Peu favorable");

/** Pastille de carte et de liste : favorabilité par palier ; « à vérifier » et « non recommandé » par la forme. */
export function Pastille({ value, status = "ok", size = 30, selected, label }) {
  const cls = ["s-pastille", status === "verify" && "s-pastille--verify", status === "nr" && "s-pastille--nr", value == null && status !== "nr" && "s-pastille--none", selected && "s-pastille--selected"].filter(Boolean).join(" ");
  const txt = status === "nr" ? "" : value == null ? "–" : value;
  const aria = label || (status === "nr" ? "Non recommandé" : value == null ? "Pas de note" : `Favorabilité ${value}${status === "verify" ? ", à vérifier" : ""}`);
  return <span className={cls} data-band={status === "nr" ? undefined : favBand(value)} style={{ "--size": `${size}px` }} role="img" aria-label={aria}>{txt}</span>;
}

export function FactorBar({ value, max = 1, label }) {
  const p = Math.max(0, Math.min(1, value / max));
  const level = p >= 0.7 ? "hi" : p >= 0.45 ? "mid" : "lo";
  return <div className="s-bar" data-level={level} role="img" aria-label={label ? `${label} : ${Math.round(p * 100)} %` : undefined}><span style={{ width: `${Math.round(p * 100)}%` }} /></div>;
}

export function Reasons({ items, icon = "circle-check" }) {
  return (
    <ul className="s-reasons">
      {items.map((it, i) => (
        <li key={i}><Icon name={it.icon || icon} size={22} stroke={2.2} style={it.tone === "warn" ? { color: "var(--warn)" } : it.tone === "muted" ? { color: "var(--text-3)" } : undefined} />
          <span>{it.t}{it.s && <small>{it.s}</small>}</span></li>
      ))}
    </ul>
  );
}

export function Banner({ tone = "offline", icon, children, action }) {
  const ic = icon || { offline: "wifi-off", stale: "history", error: "cloud-off" }[tone];
  return (
    <div className={`s-banner s-banner--${tone}`} role="status">
      <Icon name={ic} size={19} /><div className="s-grow">{children}</div>{action}
    </div>
  );
}

export const Skeleton = ({ h = 16, w = "100%", r }) => <div className="s-skel" style={{ height: h, width: w, borderRadius: r }} aria-hidden="true" />;

export function SectionTitle({ children, action }) {
  return <div className="s-section-title"><h2 className="s-h3">{children}</h2>{action}</div>;
}
