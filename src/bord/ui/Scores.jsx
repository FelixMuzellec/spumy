// Phase 7 — Les trois scores du moteur v2, côte à côte et jamais fusionnés (spécification v2, §1 et §8) :
// favorabilité (où et quand le bar a le plus de chances d'être là), pertinence (ta boîte et la distance),
// confiance (à quel point croire la favorabilité). Chacun se décompose ; la confiance ne change pas le rang.
import { useState } from "react";
import { C, num } from "../../design/kit.jsx";
import { color, favBands } from "../../design/tokens.js";
import { NIVEAU_LABEL, V2 } from "../engine/v2.js";
import { NoteDot, noteLabel } from "./note.jsx";

const fr0 = (x) => String(Math.round(x * 10) / 10).replace(".", ",");
const Bar = ({ pts, max, label }) => (
  <div role="img" aria-label={`${label} : ${fr0(pts)} sur ${max}`} style={{height:8,borderRadius:4,background:color.track,overflow:"hidden"}}>
    <span style={{display:"block",height:"100%",width:`${Math.max(0, Math.min(100, (pts / max) * 100))}%`,background:favBands[2],borderRadius:4}}/>
  </div>
);
function Part({ p }) {
  return (
    <li style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:"2px 10px",alignItems:"center"}}>
      <span style={{fontSize:13.5,color:C.text}}>{p.label}</span>
      <span style={{fontSize:13.5,fontWeight:700,color:C.strong,...num}}>{fr0(p.pts)}/{p.max}</span>
      <span style={{gridColumn:"1 / -1"}}><Bar pts={p.pts} max={p.max} label={p.label}/></span>
      {p.why && <span style={{gridColumn:"1 / -1",fontSize:12.5,color:C.muted}}>{p.why}{p.niveau ? ` · preuve niveau ${p.niveau} (${NIVEAU_LABEL[p.niveau]})` : ""}</span>}
    </li>
  );
}
const head = { fontSize:13, fontWeight:750, color:C.muted, letterSpacing:"0.02em" };
const big = { fontSize:22, fontWeight:800, color:C.strong, lineHeight:1.1, ...num };

/** Les trois scores du créneau retenu d'un spot noté par la v2 (s.v2). */
export function ScoresPanel({ s, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const v = s?.v2;
  if (!v?.eligible) return null;
  const f = v.f, p = v.pert, c = v.conf;
  return (
    <section aria-label="Les trois scores du créneau" style={{marginTop:10,padding:"10px 12px",borderRadius:12,border:`1px solid ${C.line}`,background:C.card2}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>
        <div style={{minWidth:0}}>
          <div style={head}>Favorabilité</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}><NoteDot s={s} size={16}/><span style={big}>{f.noScore ? "–" : f.fav}</span><span style={{fontSize:12,color:C.muted}}>/100</span></div>
          <div style={{fontSize:12.5,color:C.muted}}>{noteLabel(s).toLowerCase()}</div>
        </div>
        <div style={{minWidth:0}}>
          <div style={head}>Pertinence</div>
          <div style={{display:"flex",alignItems:"baseline",gap:4}}><span style={big}>{p ? p.score : "–"}</span><span style={{fontSize:12,color:C.muted}}>/100</span></div>
          <div style={{fontSize:12.5,color:C.muted}}>{!p ? "inconnue" : p.provisional ? "provisoire (boîte à compléter)" : p.under ? `sous le seuil (${V2.pert.seuil})` : "ta boîte convient"}</div>
        </div>
        <div style={{minWidth:0}}>
          <div style={head}>Confiance</div>
          <div style={{display:"flex",alignItems:"baseline",gap:4}}><span style={big}>{c.score}</span><span style={{fontSize:12,color:C.muted}}>/100</span></div>
          <div style={{fontSize:12.5,color:C.muted}}>{c.label.toLowerCase()} · ne change pas le rang</div>
        </div>
      </div>
      <div style={{fontSize:13,color:C.text,marginTop:8,...num}}>{f.line}</div>
      {v.journal?.active && <div style={{fontSize:13,color:C.violet,marginTop:4}}>Ton journal sur ce spot : {v.journal.pts > 0 ? "+" : ""}{v.journal.pts} (à part de la favorabilité ; {v.journal.n} sessions)</div>}
      {p?.manque?.length > 0 && <div style={{fontSize:13.5,color:C.warn,marginTop:4}}>{p.manque.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(" · ")}.</div>}
      <button type="button" onClick={() => setOpen((x) => !x)} aria-expanded={open}
        style={{marginTop:4,minHeight:44,padding:0,border:"none",background:"none",color:C.accent,fontSize:14,fontWeight:700,cursor:"pointer"}}>
        {open ? "Masquer le détail des trois scores" : "Détail des trois scores"}</button>
      {open && (
        <div style={{display:"grid",gap:12,marginTop:4}}>
          <div>
            <div style={head}>Favorabilité = conditions × présence</div>
            <ul style={{margin:"6px 0 0",padding:0,listStyle:"none",display:"grid",gap:8}}>
              {f.crit.map((x) => <Part key={x.k} p={x}/>)}
              {f.excluded.map((x) => <li key={x.k} style={{fontSize:13,color:C.muted}}>{x.label} : non calculé ({x.why}), sorti du calcul — jamais compté « neutre ».</li>)}
              <li style={{fontSize:13.5,color:C.text}}>Présence du bar : <b style={{color:C.strong,...num}}>{String(f.pres.factor).replace(".", ",")}</b> — {f.pres.label}{f.pres.sstKnown ? "" : " (température de l'eau non comptée)"}</li>
            </ul>
          </div>
          {p && (
            <div>
              <div style={head}>Pertinence : ta boîte et la distance{p.provisional ? " (provisoire)" : ""}</div>
              <ul style={{margin:"6px 0 0",padding:0,listStyle:"none",display:"grid",gap:8}}>{p.parts.map((x) => <Part key={x.k} p={x}/>)}</ul>
              {p.provisional && <div style={{fontSize:12.5,color:C.muted,marginTop:4}}>Calculée sur la boîte enregistrée dans SPUMY. Tant que tu ne l'as pas dite complète (Réglages → Moteur de notes), elle ne change pas le classement.</div>}
              {p.top?.length > 0 && (
                <>
                  <div style={{...head,marginTop:10}}>Les meilleurs leurres de ta boîte pour ce créneau</div>
                  <ol style={{margin:"6px 0 0",paddingLeft:20,display:"grid",gap:6,fontSize:13.5,color:C.text}}>
                    {p.top.map((x, i) => (
                      <li key={i}><b style={{color:C.strong}}>{x.name}</b>{x.weight ? ` · ${x.weight}` : ""}{x.color ? ` · ${x.color}` : ""}
                        {x.why && <span style={{display:"block",fontSize:12.5,color:C.muted}}>{x.why}</span>}</li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          )}
          <div>
            <div style={head}>Confiance</div>
            <ul style={{margin:"6px 0 0",padding:0,listStyle:"none",display:"grid",gap:8}}>{c.parts.map((x) => <Part key={x.k} p={x}/>)}</ul>
            <div style={{fontSize:12.5,color:C.muted,marginTop:4}}>Paliers : haute dès {V2.conf.haute}, moyenne dès {V2.conf.moyenne}. La confiance décrit les données de la note ; ce n'est pas une probabilité de prise.</div>
          </div>
          <div style={{fontSize:12,color:C.faint}}>Points, paliers et seuils : hypothèses de départ de la spécification v2, éprouvées en phase 8.</div>
        </div>
      )}
    </section>
  );
}
