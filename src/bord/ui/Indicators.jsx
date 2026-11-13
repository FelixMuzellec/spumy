// v9.1 — Sécurité et confiance : deux indicateurs à part de la note, jamais confondus avec elle.
// La note garde seule l'échelle vert / orange / gris (scoreColor). La sécurité n'a pas de vert ; la
// confiance n'a pas de couleur d'état du tout (des points, des mots, la liste de ce qui manque).
import { useState } from "react";
import { ON_SITE } from "../engine/safety.js";
import { C } from "../../design/kit.jsx";

const TONE = { alerte: C.bad, prudence: C.warn, neutre: "#64748b" };
const Shield = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{flexShrink:0,display:"block"}}>
    <path d="M12 2.5 4.5 5.4v5.9c0 4.7 3.1 8.6 7.5 10.2 4.4-1.6 7.5-5.5 7.5-10.2V5.4z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 8v5.2M12 16.4v.1" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);

/** Sécurité du créneau : niveau, ce qui le justifie, consignes de la fiche, et toujours « vérifie sur place ». */
export function SafetyPanel({ safety, standing = true, id }) {
  if (!safety) return null;
  const tone = TONE[safety.level];
  const main = safety.items.filter((i) => i.level !== "info");
  const infos = standing ? safety.items.filter((i) => i.level === "info").slice(0, 3) : [];
  return (
    <section id={id} aria-label={`Sécurité : ${safety.label}`} role={safety.level === "alerte" ? "alert" : undefined}
      style={{marginTop:10,padding:"10px 12px",borderRadius:12,border:`1px solid ${tone}88`,background:`${tone}14`,color:C.strong,fontSize:14,lineHeight:1.5}}>
      <div style={{display:"flex",alignItems:"center",gap:7,fontWeight:800}}>
        <Shield color={safety.level === "neutre" ? "#94a3b8" : tone}/>
        <span>Sécurité · {safety.label}</span>
      </div>
      {main.length > 0 && (
        <ul style={{margin:"6px 0 0",padding:0,listStyle:"none",display:"grid",gap:4}}>
          {main.map((i, k) => <li key={k}>• {i.t} <span style={{fontSize:12.5,color:C.muted}}>— {i.s}</span></li>)}
        </ul>
      )}
      {infos.length > 0 && (
        <div style={{marginTop:7}}>
          <div style={{fontSize:12.5,fontWeight:700,color:C.muted}}>Consignes de la fiche</div>
          <ul style={{margin:"2px 0 0",padding:0,listStyle:"none",display:"grid",gap:3,fontSize:13.5,color:C.text}}>
            {infos.map((i, k) => <li key={k}>• {i.t} <span style={{fontSize:12,color:C.faint}}>— {i.s}</span></li>)}
          </ul>
        </div>
      )}
      <div style={{marginTop:7,fontSize:13,color:"#cbd5e1"}}>{ON_SITE}</div>
    </section>
  );
}

const MARK = { ok: ["✓", "#7dd3fc"], reserve: ["!", "#cbd5e1"], manque: ["✕", "#f8fafc"], info: ["·", C.muted] };
const Dots = ({ n }) => (
  <span aria-hidden="true" style={{display:"inline-flex",gap:3,verticalAlign:"middle"}}>
    {[1, 2, 3].map((i) => <span key={i} style={{width:8,height:8,borderRadius:4,background:i <= n ? "#7dd3fc" : "transparent",border:"1.5px solid #7dd3fc"}}/>)}
  </span>
);

/** Confiance dans le conseil : trois mots et la liste de ce que le conseil avait, ou pas. */
export function ConfidencePanel({ conf }) {
  const [open, setOpen] = useState(false);
  if (!conf) return null;
  const reserves = conf.items.filter((i) => i.ok === "manque" || i.ok === "reserve");
  return (
    <div style={{marginTop:10,padding:"9px 12px",borderRadius:12,border:`1px solid ${C.line}`,background:C.card2,fontSize:14,lineHeight:1.5}}>
      <button type="button" onClick={() => setOpen((x) => !x)} aria-expanded={open}
        style={{display:"flex",alignItems:"center",gap:8,width:"100%",minHeight:40,padding:0,border:0,background:"none",color:C.strong,textAlign:"left",cursor:"pointer"}}>
        <Dots n={conf.dots}/>
        <span style={{flex:1,minWidth:0}}><b>Confiance {conf.label.toLowerCase()}</b>
          <span style={{color:C.muted,fontSize:13}}> · {reserves.length ? `${reserves.length} réserve${reserves.length > 1 ? "s" : ""}` : "rien ne manque"}</span></span>
        <span aria-hidden="true" style={{color:C.accent,fontSize:13,fontWeight:700}}>{open ? "Masquer" : "Détail"}</span>
      </button>
      {!open && reserves[0] && <div style={{fontSize:13,color:C.text}}>{reserves[0].t}</div>}
      {open && (
        <ul style={{margin:"4px 0 0",padding:0,listStyle:"none",display:"grid",gap:4}}>
          {conf.items.map((i, k) => (
            <li key={k} style={{display:"flex",gap:8,fontSize:13.5,color:i.ok === "info" ? C.muted : C.text}}>
              <span aria-hidden="true" style={{width:14,flexShrink:0,textAlign:"center",fontWeight:800,color:MARK[i.ok][1]}}>{MARK[i.ok][0]}</span>
              <span><span style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0 0 0 0)"}}>{i.ok === "ok" ? "Acquis : " : i.ok === "info" ? "" : i.ok === "manque" ? "Manque : " : "Réserve : "}</span>{i.t}</span>
            </li>
          ))}
          <li style={{fontSize:12,color:C.faint,marginTop:2}}>La confiance décrit les données du conseil ; ce n'est pas une probabilité de prise.</li>
        </ul>
      )}
    </div>
  );
}
