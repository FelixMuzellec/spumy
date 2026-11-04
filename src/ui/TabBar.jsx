import { useEffect, useRef } from "react";
import { h } from "./kit.jsx";

// SPUMY v9.0 — Navigation par onglets avec identité SPUMY, bouton Mode Terrain et barre basse 5 piliers.
// Les 9 onglets (Synthèse, Spots, Leurres, Marée, Météo, Journal, Saison, Règles, Photos) restent accessibles
// par leur nom et leur ancre (#synthese, #spots, etc.) pour garantir 100 % de compatibilité avec les tests E2E.
export const TABS = [
  ["synthese", "Synthèse"],
  ["spots", "Spots"],
  ["leurres", "Leurres"],
  ["maree", "Marée"],
  ["meteo", "Météo"],
  ["journal", "Journal"],
  ["saison", "Saison"],
  ["regles", "Règles"],
  ["photos", "Photos"],
];

export const tabFromHash = () => {
  const k = (typeof location !== "undefined" ? location.hash : "").replace(/^#/, "");
  return TABS.some(([id]) => id === k) ? k : "synthese";
};

export function TabBar({ tab, onChange, fieldMode, onToggleFieldMode }) {
  const refs = useRef({});
  useEffect(() => {
    try { refs.current[tab]?.scrollIntoView({ block: "nearest", inline: "center" }); } catch { /* ignore */ }
  }, [tab]);

  const onKey = (e) => {
    const i = TABS.findIndex(([id]) => id === tab);
    const next = e.key === "ArrowRight" ? (i + 1) % TABS.length
      : e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length
      : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    const id = TABS[next][0];
    onChange(id);
    refs.current[id]?.focus();
  };

  return (
    <nav aria-label="Onglets du guide" style={{
      background: "rgba(5,13,26,0.97)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      borderBottom: `1px solid ${h.line}`, paddingTop: "env(safe-area-inset-top)",
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 12px 0" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <span aria-hidden="true" style={{
            width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#38bdf8,#0284c7)",
            display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#020617",
          }}>S</span>
          <span style={{ fontWeight: 900, letterSpacing: "0.08em", fontSize: 14, color: h.strong }}>SPUMY</span>
        </div>
        {onToggleFieldMode && (
          <button
            type="button"
            onClick={onToggleFieldMode}
            aria-pressed={!!fieldMode}
            style={{
              minHeight: 32, padding: "0 11px", borderRadius: 999,
              border: `1px solid ${fieldMode ? h.good : h.line}`,
              background: fieldMode ? "rgba(16,185,129,0.22)" : "rgba(15,23,42,0.8)",
              color: fieldMode ? "#6ee7b7" : h.muted, fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >
            ● Mode terrain
          </button>
        )}
      </div>
      <div
        role="tablist"
        aria-label="Onglets du guide"
        onKeyDown={onKey}
        style={{
          maxWidth: 760, margin: "0 auto", display: "flex", gap: 2, padding: "4px 24px 4px 6px",
          overflowX: "auto", scrollbarWidth: "none",
          WebkitMaskImage: "linear-gradient(to right,#000 88%,transparent)",
          maskImage: "linear-gradient(to right,#000 88%,transparent)",
        }}
      >
        {TABS.map(([id, label]) => {
          const on = tab === id;
          return (
            <button
              key={id}
              ref={(el) => { refs.current[id] = el; }}
              role="tab"
              id={`onglet-${id}`}
              aria-selected={on}
              aria-controls="panneau"
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(id)}
              style={{
                flex: "0 0 auto", minHeight: 44, padding: "0 clamp(8px, 2.6vw, 13px)", borderRadius: 9, border: "none",
                background: on ? "#1e3a5f" : "transparent",
                color: on ? h.strong : h.muted, fontSize: "clamp(13.5px, 3.9vw, 14.5px)",
                fontWeight: on ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
