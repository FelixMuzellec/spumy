// Marée : horaires, hauteurs, coefficient, courbe et précision, port par port.
import { useState } from "react";
import { SITE } from "SITE_CONFIG";
import { allSpots } from "../../engine/myspots.js";
import { fmtH } from "../../engine/core.js";
import { localDecimal } from "../../engine/tide.js";
import { fmtLeft, TideChart } from "../components.jsx";
import { Alert, C, Card, Chip, Muted, Row, Stack, num } from "../kit.jsx";

const coefLabel = (c) => (c >= 95 ? "grande vive-eau" : c >= 80 ? "vive-eau" : c >= 60 ? "morte-eau forte" : "morte-eau");
const coefColor = (c) => (c >= 95 ? C.bad : c >= 80 ? C.warn : c >= 60 ? C.accent : C.muted);

export function Maree({ g }) {
  const ports = [...new Set([SITE.tide.defaultPort, ...allSpots().map((s) => s.tidePort).filter(Boolean)])];
  // v8.9 : ouvre sur le port du spot conseillé (ou du spot ouvert), pas sur celui du guide.
  const [port, setPort] = useState(() => g.activeSpot?.tidePort || g.verdict?.s?.tidePort || SITE.tide.defaultPort);
  const nowDec = Number.isFinite(g.nowMs) ? localDecimal(g.nowMs, g.selectedDate) : null;
  const t = g.tideFor(port);
  const spotsHere = allSpots().filter((s) => (s.tidePort || SITE.tide.defaultPort) === port).map((s) => s.name);
  const active = g.activeSpot && (g.activeSpot.tidePort || SITE.tide.defaultPort) === port ? g.activeSpot : null;
  const c = t.maxCoef || 0;
  const interp = t.method === "interp";
  const coefSource = g.coefCheck.accepted.length && g.coefCheck.accepted.length === g.coefCheck.computed.length ? "shom" : "calcul";
  return (
    <Stack>
      {ports.length > 1 && (
        <Card title="Port de marée">
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {ports.map((p) => <Chip key={p} color={C.accent} active={p === port} onClick={() => setPort(p)}>{SITE.tide.ports[p]?.label || p}</Chip>)}
          </div>
          <Muted>Spots sur ce port : {spotsHere.join(", ") || "aucun"}.</Muted>
        </Card>
      )}
      <Card kicker="Calculée sur l'appareil · heure de Paris" title={`Marée à ${t.label || port}`}>
        {t.error ? <Alert tone={C.bad}>Calcul de marée impossible : {t.error}</Alert> : (
          <>
            {nowDec != null && (() => { const nx = (t.events || []).filter((e) => e.dec > nowDec).sort((a, b) => a.dec - b.dec)[0];
              return nx ? <div style={{fontSize:17,fontWeight:800,color:C.strong,marginBottom:10,...num}}>{nx.type === "PM" ? "Pleine mer" : "Basse mer"} dans {fmtLeft(nx.dec - nowDec)} <span style={{color:C.muted,fontWeight:600}}>({fmtH(nx.dec)})</span> · {nx.type === "PM" ? "↗ la mer monte" : "↘ la mer descend"}</div> : null; })()}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {t.dayEvents.map((e, i) => {
                const col = e.type === "PM" ? C.warn : C.accent;
                return (
                  <div key={i} style={{padding:"10px 6px",borderRadius:12,border:`1px solid ${col}40`,background:C.card2,textAlign:"center"}}>
                    <div style={{fontSize:12.5,color:col,fontWeight:700}}>{e.type === "PM" ? "Pleine mer" : "Basse mer"}</div>
                    <div style={{fontSize:20,fontWeight:800,color:C.strong,...num}}>{fmtH(e.dec)}</div>
                    <div style={{fontSize:13,color:C.muted,...num}}>{interp ? "≈ " : ""}{e.h.toFixed(interp ? 1 : 2).replace(".", ",")} m</div>
                    {e.type === "PM" && e.coef != null && <div style={{fontSize:13,color:coefColor(e.coef),fontWeight:700}}>coef {e.coef}</div>}
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:12}}>
              <Row label="Coefficient" color={coefColor(c)}>{t.coefs.join(" · ") || "–"} · {coefLabel(c)}</Row>
              <Row label="Marnage">{interp ? "≈ " : ""}{t.marnage != null ? t.marnage.toFixed(1).replace(".", ",") : "–"} m</Row>
              <Row label="Origine du coefficient">{coefSource === "shom" ? "valeurs SHOM, concordantes avec le calcul" : "calculé (à ±1 de l'annuaire SHOM dans 90 % des cas)"}</Row>
            </div>
            {g.coefCheck.rejected.length > 0 && <Muted style={{color:"#fbbf24"}}>Coefficient reçu écarté ({g.coefCheck.rejected.map((r) => r.reason).join(" ; ")}) : la valeur calculée est conservée.</Muted>}
          </>
        )}
      </Card>
      <Card title="Courbe de la journée" kicker={active ? `Bandes orange : créneaux prime de ${active.name}` : "Hauteur d'eau heure par heure"}>
        <TideChart tideData={t.curve || []} windows={active?.windows || []} nowDec={nowDec}/>
      </Card>
      <Card title="Précision">
        <p style={{margin:0,fontSize:14,color:C.text,lineHeight:1.6}}>{t.accuracy}.</p>
        <Muted>Prédiction harmonique locale (constantes TICON-4, marégraphes REFMAR/UHSLC), sans réseau, identique à chaque ouverture. Chaque spot utilise la marée de son propre port.</Muted>
      </Card>
    </Stack>
  );
}
