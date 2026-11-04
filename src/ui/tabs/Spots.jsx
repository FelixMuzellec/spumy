// SPUMY v9.0 — Carte Interactive, Comparateur de Spots Côte-à-Côte, Classement & Fiche Spot (Spots.jsx)
import { useEffect, useRef, useState } from "react";
import { ALL_HOURS } from "../../engine/model.js";
import { MYSPOT_COLOR, MYSPOTS_MAX } from "../../engine/myspots.js";
import { Badge } from "../components.jsx";
import { Card, fmt, h, scoreColor, Stack, Sub, TabNum } from "../kit.jsx";
import { MapView } from "../MapView.jsx";
import { SpotDetail } from "./SpotDetail.jsx";
import { SpumySpotComparison } from "../SpumyViews.jsx";

function HoursPicker({ g }) {
  const { hours, setHours } = g;
  const sel = { background: h.card2, color: h.text, border: `1px solid ${h.line}`, borderRadius: 8, padding: "0 8px", minHeight: 40, fontSize: 15 };
  const lim = hours.from > 0 || hours.to < 24;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 14.5, color: h.muted }}>
      <span style={{ flexBasis: "100%", fontSize: 15, fontWeight: 700, color: h.strong }}>🕑 Mes heures de pêche</span>
      <select aria-label="Début" value={hours.from} onChange={(e) => { const f = +e.target.value; setHours({ from: f, to: Math.max(f + 1, hours.to) }); }} style={sel}>
        {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")} h</option>)}
      </select>
      <span>→</span>
      <select aria-label="Fin" value={hours.to} onChange={(e) => { const t = +e.target.value; setHours({ from: Math.min(hours.from, t - 1), to: t }); }} style={sel}>
        {Array.from({ length: 24 }, (_, i) => i + 1).map((i) => <option key={i} value={i}>{String(i).padStart(2, "0")} h</option>)}
      </select>
      {lim && (
        <button onClick={() => setHours(ALL_HOURS)} style={{ minHeight: 40, fontSize: 13.5, color: h.accent, background: "none", border: "none", padding: "0 4px", cursor: "pointer", textDecoration: "underline" }}>
          toutes heures, nuit comprise
        </button>
      )}
    </div>
  );
}

function MySpotsCard({ g }) {
  const active = (g.myRecords || []).filter((r) => !r.deleted);
  return (
    <Card id="tes-spots" title="Tes spots" kicker={active.length ? `${active.length} dans ce guide` : null}>
      {!active.length && (
        <Sub style={{ marginTop: 0 }}>
          Un poste que tu connais et qui n'est pas dans le guide : ajoute-le depuis l'accueil. Il ira tout seul dans le guide le plus proche, classé avec les autres, avec sa propre météo.
        </Sub>
      )}
      {active.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {active.map((r) => (
            <button
              key={r.id}
              onClick={() => g.goToSpot(r.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, padding: "6px 2px", border: "none", borderTop: `1px solid ${h.line2}`, background: "none", color: h.text, fontSize: 14.5, textAlign: "left", cursor: "pointer" }}
            >
              <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: MYSPOT_COLOR, flexShrink: 0 }} />
              {r.name}
            </button>
          ))}
        </div>
      )}
      {active.length >= MYSPOTS_MAX ? (
        <Sub>Maximum atteint dans ce guide ({MYSPOTS_MAX} spots) : supprimes-en un depuis sa fiche pour en ajouter un autre.</Sub>
      ) : (
        <a
          href="index.html#ajouter"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 10, width: "100%", minHeight: 48, borderRadius: 10, border: `1px solid ${MYSPOT_COLOR}`, background: `${MYSPOT_COLOR}22`, color: h.strong, fontSize: 15, fontWeight: 700 }}
        >
          ＋ Ajouter un spot (depuis l'accueil)
        </a>
      )}
    </Card>
  );
}

export function Spots({ g }) {
  const [showAll, setShowAll] = useState(false);
  const detailRef = useRef(null);
  const list = showAll ? g.allScored : g.top3;
  const active = g.activeSpot;

  useEffect(() => {
    if (!g.focus) return;
    const t = setTimeout(() => { try { detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { /* ignore */ } }, 80);
    return () => clearTimeout(t);
  }, [g.focus]);

  return (
    <Stack>
      <Card>
        <HoursPicker g={g} />
        <Sub>Les créneaux hors de ces heures sont grisés et jamais proposés.</Sub>
      </Card>

      <Card title="Carte des spots">
        <MapView spots={g.allScored} activeId={active?.id} onPick={g.goToSpot} />
      </Card>

      <SpumySpotComparison spots={g.allScored} live={g.live} calib={g.calib} onSelectSpot={g.goToSpot} />

      <MySpotsCard g={g} />

      <Card
        title={showAll ? `Les ${g.allScored.length} spots, classés` : "Top 3 du jour"}
        right={
          <button
            onClick={() => setShowAll((v) => !v)}
            style={{ fontSize: 13.5, color: h.accent, background: "none", border: `1px solid ${h.line}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", flexShrink: 0 }}
          >
            {showAll ? "Top 3" : `Voir les ${g.allScored.length}`}
          </button>
        }
      >
        {!g.live && <Sub style={{ marginTop: 0, marginBottom: 8 }}>Sans météo : classement sur la marée et la lumière seules.</Sub>}
        {list.map((s, i) => {
          const on = active?.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => g.goToSpot(s.id)}
              style={{
                display: "flex", width: "100%", alignItems: "center", gap: 12, padding: "11px 6px",
                border: "none", borderTop: i ? `1px solid ${h.line2}` : "none",
                background: on ? "#0f2540" : "none", color: h.text, cursor: "pointer", textAlign: "left", borderRadius: 8,
              }}
            >
              <span style={{ width: 34, flexShrink: 0, paddingLeft: 6, borderLeft: `3px solid ${s.eligible ? s.color : h.line}`, fontSize: 17, fontWeight: 800, color: s.eligible ? h.strong : h.faint, ...TabNum }}>
                #{i + 1}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <b style={{ fontSize: 15, color: h.strong }}>{s.name}</b>
                  {s.isLocal && <Badge color={h.good}>Local</Badge>}
                  {s.custom && <Badge color={MYSPOT_COLOR}>Ton spot</Badge>}
                  {g.localForced?.id === s.id && <Badge color={h.warn} title="Le TOP 3 garantit un spot local">Local garanti</Badge>}
                </span>
                <span style={{ display: "block", fontSize: 13, color: h.muted, marginTop: 2 }}>{s.distance} · {s.type.toLowerCase()}</span>
                {s.wxReason && <span style={{ display: "block", fontSize: 13, color: s.eligible ? h.text : "#fca5a5", marginTop: 2 }}>{s.wxReason}</span>}
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor(s.score, s.eligible), ...TabNum }}>
                {s.eligible ? fmt(s.score) : "–"}
              </span>
            </button>
          );
        })}
      </Card>

      {active && <SpotDetail key={active.id} g={g} spot={active} detailRef={detailRef} />}
    </Stack>
  );
}
