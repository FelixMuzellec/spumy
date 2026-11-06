// Spots : carte, classement du jour, fiche du spot choisi.
import { useEffect, useRef, useState } from "react";
import { ALL_HOURS } from "../../engine/model.js";
import { MYSPOT_COLOR, MYSPOTS_MAX } from "../../engine/myspots.js";
import { Pill } from "../components.jsx";
import { C, Card, Muted, Stack, fr, num, scoreColor } from "../kit.jsx";
import { MapView } from "../MapView.jsx";
import { SpotDetail } from "./SpotDetail.jsx";

function Hours({ g }) {
  const { hours, setHours } = g;
  const sel = { background:C.card2, color:C.text, border:`1px solid ${C.line}`, borderRadius:8, padding:"0 8px", minHeight:40, fontSize:15 };
  const restricted = hours.from > 0 || hours.to < 24;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",fontSize:14.5,color:C.muted}}>
      <span style={{flexBasis:"100%",fontSize:15,fontWeight:700,color:C.strong}}>🕑 Mes heures de pêche</span>
      <select aria-label="Début" value={hours.from} onChange={(e) => { const f = +e.target.value; setHours({ from: f, to: Math.max(f + 1, hours.to) }); }} style={sel}>
        {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")} h</option>)}
      </select>
      <span>→</span>
      <select aria-label="Fin" value={hours.to} onChange={(e) => { const to = +e.target.value; setHours({ from: Math.min(hours.from, to - 1), to }); }} style={sel}>
        {Array.from({ length: 24 }, (_, h) => h + 1).map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")} h</option>)}
      </select>
      {restricted && <button onClick={() => setHours(ALL_HOURS)} style={{minHeight:40,fontSize:13.5,color:C.accent,background:"none",border:"none",padding:"0 4px",cursor:"pointer",textDecoration:"underline"}}>toutes heures, nuit comprise</button>}
    </div>
  );
}

// v8.11 — Tes spots. v8.14 : on les ajoute depuis l'accueil (le point va tout seul dans le bon guide) ;
// ici, la liste mène à leurs fiches, où ils se modifient et se suppriment.
function MySpots({ g }) {
  const mine = (g.myRecords || []).filter((r) => !r.deleted);
  return (
    <Card id="tes-spots" title="Tes spots" kicker={mine.length ? `${mine.length} dans ce guide` : null}>
      {!mine.length && <Muted style={{marginTop:0}}>Un poste que tu connais et qui n'est pas dans le guide : ajoute-le depuis l'accueil. Il ira tout seul dans le guide le plus proche, classé avec les autres, avec sa propre météo.</Muted>}
      {mine.length > 0 && (
        <div style={{display:"flex",flexDirection:"column"}}>
          {mine.map((r) => (
            <button key={r.id} onClick={() => g.goToSpot(r.id)} style={{display:"flex",alignItems:"center",gap:8,minHeight:44,padding:"6px 2px",border:"none",borderTop:`1px solid ${C.line2}`,background:"none",color:C.text,fontSize:14.5,textAlign:"left",cursor:"pointer"}}>
              <span aria-hidden="true" style={{width:10,height:10,borderRadius:"50%",background:MYSPOT_COLOR,flexShrink:0}}/>{r.name}
            </button>
          ))}
        </div>
      )}
      {mine.length >= MYSPOTS_MAX ? <Muted>Maximum atteint dans ce guide ({MYSPOTS_MAX} spots) : supprimes-en un depuis sa fiche pour en ajouter un autre.</Muted> : (
        <a href="index.html#ajouter" style={{display:"flex",alignItems:"center",justifyContent:"center",marginTop:10,width:"100%",minHeight:48,borderRadius:10,border:`1px solid ${MYSPOT_COLOR}`,background:`${MYSPOT_COLOR}22`,color:C.strong,fontSize:15,fontWeight:700}}>＋ Ajouter un spot (depuis l'accueil)</a>
      )}
    </Card>
  );
}

// v9.2 — Filtres de la carte : tous les spots, ceux au vert (note ≥ 7, praticables), tes spots.
const FILTERS = [["tous", "Tous"], ["vert", "Au vert"], ["miens", "Tes spots"]];
const filterSpots = (xs, f) => (f === "vert" ? xs.filter((s) => s.eligible && s.score >= 7) : f === "miens" ? xs.filter((s) => s.custom) : xs);
function MapFilters({ g, value, onChange }) {
  const all = g.allScored || [];
  const n = { tous: all.length, vert: filterSpots(all, "vert").length, miens: filterSpots(all, "miens").length };
  return (
    <div role="group" aria-label="Filtrer la carte" style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
      {FILTERS.filter(([k]) => k !== "miens" || n.miens > 0).map(([k, lbl]) => {
        const on = value === k;
        return (
          <button key={k} onClick={() => onChange(k)} aria-pressed={on} style={{minHeight:40,padding:"0 14px",borderRadius:999,cursor:"pointer",fontSize:14,fontWeight:on ? 750 : 600,
            border:`1px solid ${on ? "#38bdf8" : C.line}`,background:on ? "rgba(56,189,248,0.16)" : "transparent",color:on ? C.strong : C.muted}}>
            {lbl} <span style={{...num,fontWeight:500,color:on ? "#bae6fd" : C.faint}}>{n[k]}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Spots({ g }) {
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState("tous");
  const detailRef = useRef(null);
  const list = showAll ? g.allScored : g.top3;
  const active = g.activeSpot;
  const f = filter === "miens" && !(g.allScored || []).some((s) => s.custom) ? "tous" : filter;
  // Un spot choisi ailleurs (synthèse, carte, liste) : on descend jusqu'à sa fiche.
  useEffect(() => {
    if (!g.focus) return undefined;
    const t = setTimeout(() => { try { detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { /* sans effet */ } }, 80);
    return () => clearTimeout(t);
  }, [g.focus]);
  return (
    <Stack>
      <Card title="Carte des spots">
        <MapFilters g={g} value={f} onChange={setFilter}/>
        <MapView spots={filterSpots(g.allScored, f)} activeId={active?.id} onPick={g.goToSpot}/>
      </Card>
      <Card title={showAll ? `Les ${g.allScored.length} spots, classés` : "Top 3 du jour"} right={
        <button onClick={() => setShowAll((v) => !v)} style={{fontSize:13.5,color:C.accent,background:"none",border:`1px solid ${C.line}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",flexShrink:0}}>
          {showAll ? "Top 3" : `Voir les ${g.allScored.length}`}
        </button>}>
        {!g.live && <Muted style={{marginTop:0,marginBottom:8}}>Sans météo : classement sur la marée et la lumière seules.</Muted>}
        {/* v8.10 : un spot non proposé n'est plus estompé (texte illisible au soleil) : rang grisé, note « – » et raison en rouge suffisent. */}
        {list.map((s, i) => {
          const on = active?.id === s.id;
          return (
            <button key={s.id} onClick={() => g.goToSpot(s.id)} style={{display:"flex",width:"100%",alignItems:"center",gap:12,padding:"11px 6px",border:"none",borderTop:i ? `1px solid ${C.line2}` : "none",background:on ? "#0f2540" : "none",color:C.text,cursor:"pointer",textAlign:"left",borderRadius:8}}>
              <span style={{width:34,flexShrink:0,paddingLeft:6,borderLeft:`3px solid ${s.eligible ? s.color : C.line}`,fontSize:17,fontWeight:800,color:s.eligible ? C.strong : C.faint,...num}}>#{i + 1}</span>
              <span style={{flex:1,minWidth:0}}>
                <span style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <b style={{fontSize:15,color:C.strong}}>{s.name}</b>
                  {s.isLocal && <Pill color={C.good}>Local</Pill>}
                  {s.custom && <Pill color={MYSPOT_COLOR}>Ton spot</Pill>}
                  {g.localForced?.id === s.id && <Pill color={C.warn} title="Le TOP 3 garantit un spot local">Local garanti</Pill>}
                </span>
                <span style={{display:"block",fontSize:13,color:C.muted,marginTop:2}}>{s.distance} · {s.type.toLowerCase()}</span>
                {s.wxReason && <span style={{display:"block",fontSize:13,color:s.eligible ? C.text : "#fca5a5",marginTop:2}}>{s.wxReason}</span>}
              </span>
              <span style={{fontSize:20,fontWeight:800,color:scoreColor(s.score, s.eligible),...num}}>{s.eligible ? fr(s.score) : "–"}</span>
            </button>
          );
        })}
      </Card>
      {active && <SpotDetail key={active.id} g={g} spot={active} detailRef={detailRef}/>}
      <MySpots g={g}/>
      <Card><Hours g={g}/><Muted>Les créneaux hors de ces heures sont grisés et jamais proposés.</Muted></Card>
    </Stack>
  );
}
