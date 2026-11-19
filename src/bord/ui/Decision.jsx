// v9.2 — Écran Décision : l'ambiance du créneau, puis la comparaison des meilleurs spots.
// Phase 12 (v10) : la scène dessinée laisse place à une photo d'ambiance (photos de Félix), choisie d'après la lumière,
// le ciel, la mer et le type de lieu du créneau retenu ; jamais une image reconnaissable, toujours marquée « Illustration ».
import { factorGroups } from "../engine/factors.js";
import { isV2, NoteRing, noteLabel } from "./note.jsx";
import { Icon } from "../../design/icons.jsx";
import { C, fr, num } from "../../design/kit.jsx";
import { color, font } from "../../design/tokens.js";
import { AmbiancePhoto } from "./AmbiancePhoto.jsx";
import { photoForSpot } from "./ambiance.js";

/** « ce soir », « demain matin », « jeudi après-midi »… d'après le début du créneau. */
export function whenLabel(startDecimal, dateISO, todayISO) {
  const h = Number.isFinite(startDecimal) ? ((startDecimal % 24) + 24) % 24 : 12;
  const part = h < 5 || h >= 22 ? "nuit" : h < 12 ? "matin" : h < 18 ? "après-midi" : "soir";
  const off = Math.round((Date.parse(dateISO + "T12:00:00Z") - Date.parse(todayISO + "T12:00:00Z")) / 864e5);
  if (off === 0) return { nuit: "cette nuit", matin: "ce matin", "après-midi": "cet après-midi", soir: "ce soir" }[part];
  if (off === 1) return `demain ${part === "nuit" ? "dans la nuit" : part}`;
  const wd = new Date(dateISO + "T12:00:00Z").toLocaleDateString("fr-FR", { weekday: "long", timeZone: "UTC" });
  return part === "nuit" ? `dans la nuit de ${wd}` : `${wd} ${part}`;
}

/** En-tête de l'écran Décision : la réponse en une phrase, sur la lumière réelle du créneau. */
export function DecisionHero({ g, timing, toggle }) {
  const v = g.verdict;
  if (!v) return null;
  const { s, w } = v;
  const photo = photoForSpot(s, w, { usage: "hero" });
  return (
    <section aria-labelledby="hero-h" style={{position:"relative",overflow:"hidden",borderRadius:22,minHeight:248,border:`1px solid ${C.line}`,background:color.card2,isolation:"isolate"}}>
      <AmbiancePhoto photo={photo}/>
      {toggle && <div style={{position:"absolute",top:12,right:12,zIndex:1}}>{toggle}</div>}
      <div style={{position:"relative",padding:"16px 16px 15px",display:"flex",flexDirection:"column",justifyContent:"flex-end",minHeight:248,boxSizing:"border-box"}}>
        <div style={{fontSize:12.5,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:color.accentInk,textShadow:"0 1px 2px #0008"}}>{w?.light?.label || "Meilleur créneau"}</div>
        <h2 id="hero-h" style={{margin:"3px 0 0",fontFamily:font.display,fontSize:"clamp(26px, 7.4vw, 32px)",lineHeight:1.08,fontWeight:800,color:color.strong,textWrap:"balance",textShadow:"0 2px 10px #000a"}}>
          {noteLabel(s)} {whenLabel(w?.startDecimal, g.selectedDate, g.todayISO)}
        </h2>
        {w && <div style={{marginTop:6,fontSize:15.5,color:color.text,textShadow:"0 1px 4px #000c",...num}}>
          Meilleure fenêtre <b style={{color:color.strong}}>{w.startFmt} → {w.endFmt}</b> à <b style={{color:color.strong}}>{s.name}</b></div>}
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:12,flexWrap:"wrap"}}>
          <button onClick={() => g.goToSpot(s.id)} style={{display:"inline-flex",alignItems:"center",gap:6,minHeight:46,padding:"0 18px",borderRadius:999,border:"none",
            background:`linear-gradient(90deg,${color.accent},${color.accent2})`,color:color.onAccent,fontSize:15.5,fontWeight:800,cursor:"pointer",boxShadow:"0 6px 18px rgba(31,210,245,0.32)"}}>
            Voir le spot <Icon name="chevron" size={17} stroke={2.4}/>
          </button>
          {timing && <span style={{fontSize:14.5,fontWeight:750,color:timing.col === C.good ? C.good : color.accentInk,textShadow:"0 1px 4px #000c"}}>{timing.t}</span>}
        </div>
      </div>
    </section>
  );
}

/** « Pourquoi ce spot ? » et « À surveiller » : les termes de la note (keyFactors) et, en tête, les alertes de sécurité. */
export function WhyWatch({ factors, watch = [] }) {
  const plus = factors?.plus || [], minus = factors?.minus || [];
  const warn = [...watch, ...minus.map((m) => m.label)];
  if (!plus.length && !warn.length) return null;
  const li = { display:"flex",alignItems:"flex-start",gap:8,fontSize:14.5,lineHeight:1.4,color:C.text };
  return (
    <div style={{display:"grid",gap:10,marginTop:12}}>
      {plus.length > 0 && (
        <div>
          <div style={{fontSize:13,fontWeight:750,color:C.muted,letterSpacing:"0.02em",marginBottom:5}}>Pourquoi ce spot ?</div>
          <ul style={{margin:0,padding:0,listStyle:"none",display:"grid",gap:5}}>
            {plus.map((p, i) => <li key={i} style={li}><span style={{marginTop:1,color:"#22c55e"}}><Icon name="check" size={17} stroke={2.4}/></span><span>{p.label}</span></li>)}
          </ul>
        </div>
      )}
      {warn.length > 0 && (
        <div style={{padding:"9px 11px",borderRadius:12,background:"rgba(245,158,11,0.10)",border:"1px solid rgba(245,158,11,0.35)"}}>
          <div style={{fontSize:13,fontWeight:750,color:"#fcd34d",marginBottom:4}}>À surveiller</div>
          <ul style={{margin:0,padding:0,listStyle:"none",display:"grid",gap:4}}>
            {warn.slice(0, 3).map((t, i) => <li key={i} style={li}><span style={{marginTop:1,color:"#fbbf24"}}><Icon name="attention" size={16} stroke={2}/></span><span>{t}</span></li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Comparaison des meilleurs spots du jour : note, distance, et ce qui fait la note, famille par famille. */
export function CompareCard({ g }) {
  const v = g.verdict;
  if (!v) return null;
  const items = [v, ...(v.next || [])].filter((x) => x?.s).slice(0, 3);
  if (items.length < 2) return null;
  const rows = items.map((x) => ({ ...x, f: factorGroups(isV2(x.s) ? (x.w?.f || x.s.v2?.f) : (x.w?.parts || x.s.bestParts)) }));
  const v2 = isV2(items[0].s), fp = (x) => (v2 ? String(Math.round(x)) : fr(x));
  const fams = rows[0].f.map((f) => f.key);
  const maxAbs = Math.max(1, ...rows.flatMap((r) => r.f.map((f) => Math.abs(f.v))));
  // Ce qui sépare le premier du deuxième : la famille où l'écart est le plus grand.
  const gap = rows[0].f.map((f, i) => ({ label: f.label, d: f.v - rows[1].f[i].v })).sort((a, b) => b.d - a.d)[0];
  const minGap = v2 ? 3 : 0.3;
  const bar = (val, label, name) => {
    const w = Math.min(50, (Math.abs(val) / maxAbs) * 50);
    return (
      <div role="img" aria-label={`${name}, ${label} : ${val >= 0 ? "+" : "−"}${fp(Math.abs(val))} point${v2 ? "s sur 100" : ""}`} style={{position:"relative",height:10,borderRadius:5,background:"#13233a"}}>
        <span style={{position:"absolute",left:"50%",top:-2,bottom:-2,width:1,background:"#2c4a6b"}}/>
        {Math.abs(val) >= 0.05 && <span style={{position:"absolute",top:0,bottom:0,borderRadius:5,background:val >= 0 ? "linear-gradient(90deg,#2a9df4,#1fd2f5)" : "#7a8fa6",
          left:val >= 0 ? "50%" : `${50 - w}%`,width:`${w}%`}}/>}
      </div>
    );
  };
  const col = `minmax(68px,0.9fr) repeat(${rows.length}, minmax(0,1fr))`;
  return (
    <section aria-labelledby="cmp-h" style={{background:C.card,border:`1px solid ${C.line}`,borderRadius:16,padding:"14px 14px 12px"}}>
      <h2 id="cmp-h" style={{margin:0,fontSize:17,fontWeight:800,color:C.strong}}>Comparer les meilleurs spots</h2>
      <div style={{display:"grid",gridTemplateColumns:col,gap:"10px 8px",alignItems:"center",marginTop:12}}>
        <span/>
        {rows.map((r, i) => (
          <button key={r.s.id} onClick={() => g.goToSpot(r.s.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:0,border:"none",background:"none",color:C.text,cursor:"pointer",padding:0}}>
            <NoteRing s={r.s} size={54} label=""/>
            <span style={{fontSize:13.5,fontWeight:750,color:C.strong,textAlign:"center",lineHeight:1.2,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",maxWidth:"100%"}}>
              {i === 0 ? "★ " : ""}{r.s.name}</span>
            <span style={{fontSize:12,color:C.muted,...num}}>{r.w ? `${r.w.startFmt}–${r.w.endFmt}` : ""}</span>
          </button>
        ))}
        {fams.map((k, fi) => (
          <div key={k} style={{display:"contents"}}>
            <span style={{fontSize:13,color:C.muted,fontWeight:600}}>{rows[0].f[fi].label}</span>
            {rows.map((r) => <div key={r.s.id}>{bar(r.f[fi].v, r.f[fi].label, r.s.name)}</div>)}
          </div>
        ))}
      </div>
      <p style={{margin:"12px 0 0",fontSize:13.5,color:C.text,lineHeight:1.5}}>
        {gap && gap.d >= minGap ? <>Ce qui fait la différence pour <b style={{color:C.strong}}>{rows[0].s.name}</b> : <b style={{color:C.strong}}>{gap.label.toLowerCase()}</b>.</>
          : <>Les deux premiers se valent sur chaque famille : prends le plus pratique.</>}
        <span style={{color:C.faint}}> Barres : ce que chaque famille ajoute (bleu) ou retire (gris) à la note du meilleur créneau{v2 ? ` (points sur 100 ; « saison et eau » : ce que la présence du bar retire)` : ""}.</span>
      </p>
      <button onClick={() => g.goTab("spots")} style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:6,minHeight:44,padding:0,border:"none",background:"none",color:C.accent,fontSize:14.5,fontWeight:700,cursor:"pointer"}}>
        Classement complet et carte <Icon name="chevron" size={16} stroke={2.2}/></button>
    </section>
  );
}
