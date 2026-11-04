// SPUMY v9.0 — Design System & Composants UI Communs (cartes, tuiles, pilules, sources).
import { useState } from "react";

export const h = {
  bg: "#050d1a",
  card: "#0b1626",
  card2: "#071120",
  line: "#1e293b",
  line2: "#15233a",
  text: "#e2e8f0",
  strong: "#f8fafc",
  muted: "#94a3b8",
  faint: "#8a9bb1",
  accent: "#38bdf8",
  good: "#22c55e",
  warn: "#f59e0b",
  bad: "#ef4444",
  violet: "#a78bfa",
};

export const FONT = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
export const TabNum = { fontVariantNumeric: "tabular-nums" };
export const scoreColor = (s, eligible = true) => (eligible ? (s >= 7 ? h.good : s >= 5 ? h.warn : h.muted) : h.faint);
export const fmt = (v, d = 1) => (v == null || !Number.isFinite(+v) ? "–" : (+v).toFixed(d).replace(".", ","));

export function Card({ title, kicker, right, children, tone, onClick, style, id }) {
  const border = tone ? `${tone}66` : h.line;
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      id={id}
      onClick={onClick}
      style={{
        display: "block", width: "100%", textAlign: "left", color: "inherit",
        cursor: onClick ? "pointer" : "default",
        background: tone ? `linear-gradient(160deg,${tone}18 0%,${h.card} 60%)` : h.card,
        border: `1px solid ${border}`, borderRadius: 14, padding: "14px 15px", ...style,
      }}
    >
      {(title || kicker || right) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
          <div style={{ minWidth: 0 }}>
            {kicker && <div style={{ fontSize: 12, fontWeight: 600, color: tone || h.accent, letterSpacing: "0.04em", marginBottom: 2 }}>{kicker}</div>}
            {title && <div style={{ fontSize: 16, fontWeight: 700, color: h.strong, lineHeight: 1.3 }}>{title}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </Tag>
  );
}

export function Tile({ label, value, sub, color, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", gap: 2, minWidth: 0, textAlign: "left",
        padding: "11px 12px", borderRadius: 12, border: `1px solid ${h.line}`,
        background: h.card, color: h.text, cursor: onClick ? "pointer" : "default",
      }}
    >
      <span style={{ fontSize: 13, color: h.muted, display: "flex", justifyContent: "space-between", gap: 6 }}>
        <span>{icon} {label}</span>
        {onClick && <span aria-hidden={true} style={{ color: h.faint }}>›</span>}
      </span>
      <span style={{ fontSize: 19, fontWeight: 700, color: color || h.strong, lineHeight: 1.2, ...TabNum, overflowWrap: "anywhere" }}>{value}</span>
      {sub && <span style={{ fontSize: 13.5, color: h.muted, lineHeight: 1.35 }}>{sub}</span>}
    </button>
  );
}

export function Pill({ children, color = h.muted, active, onClick, title }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={title}
      aria-pressed={onClick ? !!active : undefined}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: onClick ? 13 : 12.5, fontWeight: 600, lineHeight: 1.2,
        padding: onClick ? "0 12px" : "3px 8px", minHeight: onClick ? 44 : undefined,
        borderRadius: 999, whiteSpace: "nowrap",
        color: active ? h.strong : color,
        background: active ? `${color}30` : `${color}14`,
        border: `1px solid ${active ? color : color + "40"}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {children}
    </Tag>
  );
}

export function Fold({ title, sub, children, defaultOpen = false, id }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} style={{ border: `1px solid ${h.line}`, borderRadius: 12, background: h.card, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((x) => !x)}
        aria-expanded={open}
        style={{
          width: "100%", minHeight: 48, display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: 10, padding: "13px 15px", background: "none", border: "none", color: h.text, cursor: "pointer", textAlign: "left",
        }}
      >
        <span>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: h.strong }}>{title}</span>
          {sub && <span style={{ display: "block", fontSize: 12.5, color: h.muted, marginTop: 2 }}>{sub}</span>}
        </span>
        <span aria-hidden={true} style={{ fontSize: 18, color: h.muted, transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>›</span>
      </button>
      {open && <div style={{ padding: "0 15px 14px" }}>{children}</div>}
    </div>
  );
}

const isNarrow = () => { try { return window.innerWidth < 360; } catch { return false; } };

export function Seg({ tabs, value, onChange }) {
  return (
    <div style={{
      ...(isNarrow() && tabs.length === 4 ? { display: "grid", gridTemplateColumns: "1fr 1fr" } : { display: "flex", flexWrap: "wrap" }),
      gap: 4, padding: 4, borderRadius: 10, background: h.card2, border: `1px solid ${h.line}`,
    }}>
      {tabs.map(([k, label]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          aria-pressed={value === k}
          style={{
            flex: "1 0 auto", minHeight: 44, padding: "8px 8px", borderRadius: 7, border: "none",
            background: value === k ? "#1e3a5f" : "transparent",
            color: value === k ? h.strong : h.muted, fontSize: 13.5, fontWeight: value === k ? 700 : 500,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function KV({ label, children, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderTop: `1px solid ${h.line2}`, fontSize: 14 }}>
      <span style={{ color: h.muted, flexShrink: 0 }}>{label}</span>
      <span style={{ color: color || h.text, textAlign: "right", ...TabNum }}>{children}</span>
    </div>
  );
}

export function Src({ src, prefix = "", short = false }) {
  if (!src) return null;
  const o = typeof src === "string" ? { label: src } : src;
  const label = short && o.short ? o.short : o.label;
  return (
    <span title={short ? o.label : undefined} style={{ fontSize: 12.5, color: h.faint, whiteSpace: short ? "nowrap" : "normal" }}>
      {prefix}
      {o.url ? (
        <a href={o.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", textDecorationColor: "#475569" }}>
          {label}
        </a>
      ) : label}
    </span>
  );
}

export function WhyList({ items, sources, compact = false }) {
  if (!items?.length) return null;
  return (
    <ul style={{ margin: compact ? "4px 0 0" : "6px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: compact ? 3 : 6 }}>
      {items.map((x, i) => (
        <li key={i} style={{ fontSize: 13.5, color: h.text, lineHeight: 1.5, paddingLeft: 14, position: "relative" }}>
          <span aria-hidden={true} style={{ position: "absolute", left: 0, color: h.faint }}>•</span>
          {x.t} {sources?.[x.s] && <Src src={sources[x.s]} prefix="· " short={true} />}
        </li>
      ))}
    </ul>
  );
}

export const Sub = ({ children, style }) => (
  <p style={{ margin: "8px 0 0", fontSize: 13, color: h.muted, lineHeight: 1.55, ...style }}>{children}</p>
);
export const Stack = ({ children, gap = 12, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>{children}</div>
);
export const Grid = ({ children, min = 150, gap = 8 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill,minmax(${min}px,1fr))`, gap }}>{children}</div>
);

export function MoreBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ marginTop: 4, minHeight: 44, background: "none", border: "none", padding: 0, color: h.accent, fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left" }}
    >
      {children} ›
    </button>
  );
}

export function Banner({ tone = h.warn, children, role = "status" }) {
  return (
    <div role={role} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${tone}80`, background: `${tone}1a`, fontSize: 13.5, color: h.strong, lineHeight: 1.5 }}>
      {children}
    </div>
  );
}
