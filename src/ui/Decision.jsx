// v9.2 — Écran Décision : l'ambiance du créneau, puis la comparaison des meilleurs spots.
// Tout ce qui est dessiné vient des données : la lumière (aube, jour, crépuscule, nuit) et le ciel du créneau retenu
// colorent la scène ; aucune photo, aucun paysage prétendant montrer le spot.
import { factorGroups } from "../engine/factors.js";
import { ScoreRing } from "./components.jsx";
import { Icon } from "./icons.jsx";
import { C, fr, num } from "./kit.jsx";

const SKY = {
  aube: ["#1e3a8a", "#9a3412", "#fdba74"], crepuscule: ["#0b1e3f", "#7c2d12", "#fb923c"],
  jour: ["#0c4a6e", "#0369a1", "#7dd3fc"], nuit: ["#020617", "#0b1530", "#1e3a5f"], inconnu: ["#0c4a6e", "#075985", "#38bdf8"],
};
/** Libellé de la note (mêmes seuils que les couleurs : 7 et 5). */
export const conditionLabel = (score) => (score >= 8 ? "Très bonnes conditions" : score >= 7 ? "Bonnes conditions" : score >= 5 ? "Conditions moyennes" : "Conditions difficiles");
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

function Scene({ band, sky }) {
  const [top, mid, low] = SKY[band] || SKY.inconnu;
  const overcast = sky === "overcast";
  const sun = band === "aube" || band === "crepuscule" ? { cx: band === "aube" ? 300 : 110, cy: 118, r: 26, fill: "#fed7aa" }
    : band === "jour" ? { cx: 320, cy: 44, r: 18, fill: "#fef9c3" } : null;
  return (
    <svg viewBox="0 0 400 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id="hz-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top}/><stop offset=".62" stopColor={mid}/><stop offset="1" stopColor={low}/></linearGradient>
        <linearGradient id="hz-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b2a4a"/><stop offset="1" stopColor="#030b17"/></linearGradient>
        <linearGradient id="hz-scrim" x1="0" y1="0" x2="0" y2="1"><stop offset=".25" stopColor="#030b17" stopOpacity="0"/><stop offset="1" stopColor="#030b17" stopOpacity=".88"/></linearGradient>
      </defs>
      <rect width="400" height="190" fill="url(#hz-sky)"/>
      {band === "nuit" && [[40, 30], [90, 18], [150, 40], [210, 22], [260, 52], [330, 30], [370, 60], [120, 70]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 0.9 : 1.4} fill="#e2e8f0" opacity=".7"/>)}
      {band === "nuit" && <path d="M322 34a16 16 0 1 0 14 24 13 13 0 1 1-14-24z" fill="#e2e8f0" opacity=".85"/>}
      {sun && <circle cx={sun.cx} cy={sun.cy} r={sun.r} fill={sun.fill} opacity={overcast ? 0.35 : 0.9}/>}
      {overcast && <rect width="400" height="120" fill="#94a3b8" opacity=".28"/>}
      <path d="M0 122 C60 116 120 126 200 120 C280 114 340 124 400 118 V190 H0Z" fill="url(#hz-sea)"/>
      {sun && <path d={`M${sun.cx - 40} 128 h80 M${sun.cx - 26} 136 h52 M${sun.cx - 14} 144 h28`} stroke={sun.fill} strokeWidth="2.4" strokeLinecap="round" opacity={overcast ? 0.2 : 0.55}/>}
      <path d="M0 150 C40 144 80 152 130 146 C190 139 240 150 300 144 C340 140 370 146 400 142" fill="none" stroke="#38bdf8" strokeOpacity=".22" strokeWidth="2"/>
      <path d="M0 190 V132 C22 128 40 120 64 124 C80 112 104 116 118 128 C134 126 150 136 160 150 L176 190Z" fill="#020617" opacity=".92"/>
      <rect width="400" height="190" fill="url(#hz-scrim)"/>
    </svg>
  );
}

/** En-tête de l'écran Décision : la réponse en une phrase, sur la lumière réelle du créneau. */
export function DecisionHero({ g, timing, toggle }) {
  const v = g.verdict;
  if (!v) return null;
  const { s, w } = v;
  const band = w?.light?.band || "inconnu";
  return (
    <section aria-labelledby="hero-h" style={{position:"relative",overflow:"hidden",borderRadius:20,minHeight:196,border:`1px solid ${C.line}`,background:"#030b17",isolation:"isolate"}}>
      <Scene band={band} sky={w?.zw?.sky}/>
      {toggle && <div style={{position:"absolute",top:12,right:12,zIndex:1}}>{toggle}</div>}
      <div style={{position:"relative",padding:"16px 16px 15px",display:"flex",flexDirection:"column",justifyContent:"flex-end",minHeight:196,boxSizing:"border-box"}}>
        <div style={{fontSize:12.5,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"#bae6fd",textShadow:"0 1px 2px #0008"}}>{w?.light?.label || "Meilleur créneau"}</div>
        <h2 id="hero-h" style={{margin:"3px 0 0",fontSize:"clamp(23px, 6.6vw, 28px)",lineHeight:1.12,fontWeight:850,color:"#fff",textWrap:"balance",textShadow:"0 2px 10px #000a"}}>
          {conditionLabel(s.score)} {whenLabel(w?.startDecimal, g.selectedDate, g.todayISO)}
        </h2>
        {w && <div style={{marginTop:6,fontSize:15.5,color:"#e2e8f0",textShadow:"0 1px 4px #000c",...num}}>
          Meilleure fenêtre <b style={{color:"#fff"}}>{w.startFmt} → {w.endFmt}</b> à <b style={{color:"#fff"}}>{s.name}</b></div>}
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:12,flexWrap:"wrap"}}>
          <button onClick={() => g.goToSpot(s.id)} style={{display:"inline-flex",alignItems:"center",gap:6,minHeight:46,padding:"0 18px",borderRadius:999,border:"none",
            background:"linear-gradient(90deg,#22d3ee,#0ea5e9)",color:"#03131f",fontSize:15.5,fontWeight:800,cursor:"pointer",boxShadow:"0 6px 18px rgba(14,165,233,0.35)"}}>
            Voir le spot <Icon name="chevron" size={17} stroke={2.4}/>
          </button>
          {timing && <span style={{fontSize:14.5,fontWeight:750,color:timing.col === C.good ? "#86efac" : "#bae6fd",textShadow:"0 1px 4px #000c"}}>{timing.t}</span>}
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
  const rows = items.map((x) => ({ ...x, f: factorGroups(x.w?.parts || x.s.bestParts) }));
  const fams = rows[0].f.map((f) => f.key);
  const maxAbs = Math.max(1, ...rows.flatMap((r) => r.f.map((f) => Math.abs(f.v))));
  // Ce qui sépare le premier du deuxième : la famille où l'écart est le plus grand.
  const gap = rows[0].f.map((f, i) => ({ label: f.label, d: f.v - rows[1].f[i].v })).sort((a, b) => b.d - a.d)[0];
  const bar = (val, label, name) => {
    const w = Math.min(50, (Math.abs(val) / maxAbs) * 50);
    return (
      <div role="img" aria-label={`${name}, ${label} : ${val >= 0 ? "+" : "−"}${fr(Math.abs(val))} point`} style={{position:"relative",height:10,borderRadius:5,background:"#13233a"}}>
        <span style={{position:"absolute",left:"50%",top:-2,bottom:-2,width:1,background:"#334155"}}/>
        {Math.abs(val) >= 0.05 && <span style={{position:"absolute",top:0,bottom:0,borderRadius:5,background:val >= 0 ? "linear-gradient(90deg,#0ea5e9,#38bdf8)" : "#64748b",
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
            <ScoreRing score={r.s.score} size={54} label=""/>
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
        {gap && gap.d >= 0.3 ? <>Ce qui fait la différence pour <b style={{color:C.strong}}>{rows[0].s.name}</b> : <b style={{color:C.strong}}>{gap.label.toLowerCase()}</b>.</>
          : <>Les deux premiers se valent sur chaque famille : prends le plus pratique.</>}
        <span style={{color:C.faint}}> Barres : ce que chaque famille ajoute (bleu) ou retire (gris) à la note du meilleur créneau.</span>
      </p>
      <button onClick={() => g.goTab("spots")} style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:6,minHeight:44,padding:0,border:"none",background:"none",color:C.accent,fontSize:14.5,fontWeight:700,cursor:"pointer"}}>
        Classement complet et carte <Icon name="chevron" size={16} stroke={2.2}/></button>
    </section>
  );
}
