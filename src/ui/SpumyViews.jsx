// SPUMY v9.0 — Composants visuels signature de la maquette SPUMY (31576.png) :
// - SpumyGauge100 : jauge circulaire /100 avec badge d'opportunité
// - SpumyTripleScore : les 3 scores distincts /100 (Favorabilité, Pertinence, Confiance)
// - SpumySpotComparison : comparateur côte-à-côte de 3 spots (Écran 4)
// - SpumyStrategyCard : carte Ma Stratégie & Paramètres clés (Écran 5)
// - SpumyFieldMode : interface mobile épurée Mode Terrain (Écran 8)
// - SpumyBottomNav : barre de navigation basse 5 piliers (Décision, Carte, Journal, Matériel, Plus)

import { h, Card, Pill, TabNum, fmt } from "./kit.jsx";
import { computeSpumyScores, opportunityBand, toScore100 } from "../engine/scale.js";

export function SpumyGauge100({ score100, label, color = "#10b981", size = 124 }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const filled = Math.max(0, Math.min(100, score100 || 0)) / 100 * arc;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 120 102" role="img" aria-label={`Score SPUMY ${score100} sur 100`}>
        <circle
          cx="60" cy="56" r={r} fill="none" stroke="#1e293b" strokeWidth="9"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={-circ * 0.375} strokeLinecap="round"
        />
        <circle
          cx="60" cy="56" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${filled} ${circ}`} strokeDashoffset={-circ * 0.375} strokeLinecap="round"
        />
        <text x="60" y="57" textAnchor="middle" fontSize="27" fontWeight="900" fill="#f8fafc" fontFamily="system-ui,sans-serif">
          {score100 || "–"}
          <tspan fontSize="13" fontWeight="600" fill="#94a3b8">/100</tspan>
        </text>
      </svg>
      {label && (
        <span style={{
          marginTop: -4, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
          background: `${color}22`, color, border: `1px solid ${color}55`, whiteSpace: "nowrap",
        }}>
          ● {label}
        </span>
      )}
    </div>
  );
}

export function SpumyTripleScore({ spumy }) {
  if (!spumy) return null;
  const items = [
    ["Favorabilité", spumy.favorability100, "Potentiel halieutique météo, marée, lumière et saison"],
    ["Pertinence", spumy.relevance100, "Adéquation du spot, proximité et confort de pêche"],
    ["Confiance", spumy.confidence100, "Concordance AROME/ECMWF, houle et niveau de preuve terrain"],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 10 }}>
      {items.map(([title, val, hint]) => {
        const b = opportunityBand(val, val > 0);
        return (
          <div key={title} title={hint} style={{
            padding: "8px 8px", borderRadius: 10, background: h.card2, border: `1px solid ${h.line}`, textAlign: "center",
          }}>
            <div style={{ fontSize: 11.5, color: h.muted, fontWeight: 600 }}>{title}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: b.color, ...TabNum }}>
              {val}<small style={{ fontSize: 11, color: h.faint }}>/100</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SpumySpotComparison({ spots, live, calib, onSelectSpot }) {
  const top = (spots || []).filter((s) => s.eligible).slice(0, 3);
  if (top.length < 2) return null;
  const meter = (ratio, color) => (
    <div style={{ flex: 1, height: 6, borderRadius: 999, background: "#1e293b", overflow: "hidden" }}>
      <div style={{ width: `${Math.max(14, Math.min(100, Math.round(ratio * 100)))}%`, height: "100%", background: color, borderRadius: 999 }} />
    </div>
  );
  return (
    <Card kicker="SPUMY · Comparateur" title="Comparaison de spots">
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${top.length}, minmax(0, 1fr))`, gap: 8 }}>
        {top.map((s, idx) => {
          const w = (s.windows || []).find((x) => x.id === s.bestWindowId);
          const sc = computeSpumyScores(s, w, { sstConf: live?.sst_confidence, calib });
          const zw = w?.zw || s.zw || {};
          const seaScore = zw.houleKnown ? Math.max(0.15, 1 - (zw.houle || 0) / Math.max(1.5, s.houleMax || 1.5)) : 0.6;
          const windScore = Math.max(0.15, Math.min(1, ((w?.windMod ?? 0) + 2.5) / 4));
          const tempScore = s.presence?.effective ?? 0.8;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSpot(s.id)}
              style={{
                display: "flex", flexDirection: "column", gap: 7, padding: "11px 9px", borderRadius: 12,
                background: idx === 0 ? "linear-gradient(180deg, rgba(14,165,233,0.16) 0%, #071120 100%)" : h.card2,
                border: `1px solid ${idx === 0 ? h.accent : h.line}`, color: h.text, textAlign: "left", cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 800, color: h.strong, lineHeight: 1.25, minHeight: 34 }}>{s.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 17, fontWeight: 900, color: sc.band.color, ...TabNum }}>{sc.favorability100}</span>
                <span style={{ fontSize: 11, color: h.muted }}>/100</span>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: sc.band.color, marginLeft: "auto" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }} title="Mer">{meter(seaScore, "#38bdf8")}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }} title="Vent">{meter(windScore, "#22c55e")}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }} title="Eau & saison">{meter(tempScore, "#f59e0b")}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }} title="Confiance">{meter(sc.confidence100 / 100, "#a78bfa")}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{
        marginTop: 11, padding: "10px 12px", borderRadius: 10, background: "rgba(245,158,11,0.12)",
        border: "1px solid rgba(245,158,11,0.35)", display: "flex", gap: 10, alignItems: "center",
      }}>
        <span style={{ fontSize: 20 }} aria-hidden="true">🏆</span>
        <div style={{ fontSize: 13.5, lineHeight: 1.45 }}>
          <b style={{ color: "#fcd34d", display: "block" }}>Notre conseil</b>
          <span>{top[0].name} offre les meilleures conditions aujourd'hui ({toScore100(top[0].score)}/100, note {fmt(top[0].score)}/10).</span>
        </div>
      </div>
    </Card>
  );
}

export function SpumyStrategyCard({ advice, onMore }) {
  if (!advice) return null;
  const p = advice.pick;
  const sit = advice.sit;
  return (
    <Card tone={h.warn} kicker="Ma stratégie SPUMY" title={`Technique recommandée : ${advice.best.label}`}>
      <div style={{ fontSize: 14, color: h.text, lineHeight: 1.5 }}>
        <b style={{ color: h.strong }}>Pourquoi ? </b>
        Eau {sit.clarity}, {sit.seaLabel || "mer modérée"}, {sit.current?.label || "courant modéré"}
        {sit.prey?.[0] ? ` et présence de ${sit.prey[0].name.toLowerCase()}` : ""}.
      </div>
      <div style={{
        marginTop: 10, paddingTop: 10, borderTop: `1px solid ${h.line}`,
        display: "grid", gap: 6, fontSize: 14,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span style={{ color: h.muted }}>⚓ Profondeur</span>
          <b style={{ color: h.strong }}>{sit.depthEst?.label || "1 à 4 m"}</b>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span style={{ color: h.muted }}>〰️ Animation</span>
          <b style={{ color: h.strong }}>{p?.layer === "surface" ? "Walking the dog" : "Linéaire / dent de scie"}</b>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span style={{ color: h.muted }}>🐟 Leurre</span>
          <b style={{ color: h.strong }}>{p ? p.name : advice.size.text}</b>
        </div>
      </div>
      {onMore && (
        <button
          type="button"
          onClick={onMore}
          style={{
            marginTop: 12, width: "100%", minHeight: 44, borderRadius: 999, border: "none",
            background: "linear-gradient(90deg, #0284c7, #38bdf8)", color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: "pointer",
          }}
        >
          Voir plus de détails →
        </button>
      )}
    </Card>
  );
}

export function SpumyFieldMode({ g, onClose }) {
  const v = g.verdict;
  const s = v?.s || g.activeSpot;
  const w = v?.w;
  const sc = s ? computeSpumyScores(s, w, { sstConf: g.live?.sst_confidence, calib: g.calib }) : null;
  const zw = w?.zw || s?.zw || g.live || {};
  return (
    <div style={{
      padding: "16px 14px 20px", borderRadius: 18, border: `1px solid ${h.good}66`,
      background: "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.20) 0%, #050d1a 72%)",
      display: "flex", flexDirection: "column", gap: 14, marginBottom: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: "0.06em", color: h.strong }}>SPUMY · MODE TERRAIN</span>
        <button type="button" onClick={onClose} style={{
          minHeight: 36, padding: "0 12px", borderRadius: 999, border: `1px solid ${h.line}`,
          background: h.card, color: h.text, fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>Fermer</button>
      </div>

      {sc && <SpumyGauge100 score100={sc.favorability100} label={sc.band.label} color={sc.band.color} size={148} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        <div style={{ padding: "10px 6px", borderRadius: 12, background: h.card, border: `1px solid ${h.line}`, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: h.muted }}>💨 Vent</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: h.strong, marginTop: 2, ...TabNum }}>
            {zw.wind_kmh != null ? `${zw.wind_kmh} km/h` : "–"}
          </div>
        </div>
        <div style={{ padding: "10px 6px", borderRadius: 12, background: h.card, border: `1px solid ${h.line}`, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: h.muted }}>⚓ Marée</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: h.strong, marginTop: 2 }}>
            {w?.tidePhaseType === "descendant" ? "Descendante" : "Montante"}
          </div>
        </div>
        <div style={{ padding: "10px 6px", borderRadius: 12, background: h.card, border: `1px solid ${h.line}`, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: h.muted }}>🌡️ Eau</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: h.strong, marginTop: 2, ...TabNum }}>
            {g.sst != null ? `${fmt(g.sst)}°C` : "–"}
          </div>
        </div>
      </div>

      {s && (
        <div style={{
          padding: "12px 14px", borderRadius: 14, background: "rgba(16,185,129,0.14)",
          border: "1px solid rgba(16,185,129,0.45)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
        }}>
          <div>
            <div style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 700 }}>📍 Spot recommandé</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: h.strong }}>{s.name}</div>
            <div style={{ fontSize: 13, color: h.muted }}>{s.distance} · {w ? `${w.startFmt} → ${w.endFmt}` : ""}</div>
          </div>
          {g.verdictLure?.pick && <Pill color={h.accent}>{g.verdictLure.pick.name}</Pill>}
        </div>
      )}

      <button
        type="button"
        onClick={() => { onClose(); g.goTab("spots"); }}
        style={{
          width: "100%", minHeight: 46, borderRadius: 12, border: `1px solid ${h.accent}`,
          background: "rgba(14,165,233,0.18)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer",
        }}
      >
        Voir sur la carte
      </button>
    </div>
  );
}
