// Composants d'interface réutilisables (graphiques, créneau, terrain, formulaire du journal).
import { useEffect, useRef, useState } from "react";
import { ENCOMBREMENT, GRATTER, terrainOf } from "../engine/model.js";
import { msAtLocal, parisParts } from "../../core/tide.js";
import { beaufortOf, idxAt } from "../engine/weather.js";
import { BOITE, CATALOGUE as BASE_CATALOGUE } from "../engine/tackle.js";
import { C, num, scoreColor } from "../../design/kit.jsx";
import { Pill } from "../../design/components.jsx";

export function ConfidenceBadge({ level }) {
  const cfg = {
    verified: { color: C.good, label: "Sourcé", title: "Information tirée d'une source citée" },
    local_knowledge: { color: C.violet, label: "Terrain", title: "Savoir terrain, à valider par repérage" },
    inference: { color: C.muted, label: "Déduit", title: "Déduit des principes généraux" },
  };
  const c = cfg[level] || cfg.inference;
  return <Pill color={c.color} title={c.title}>{c.label}</Pill>;
}
export function TideChart({ tideData, windows, nowDec }) {
  // v8.9 : viewBox à l'échelle d'un écran de téléphone (340) : les chiffres s'affichent à leur taille réelle.
  const W=340, H=132, pad={left:30,right:6,top:10,bottom:22};
  const cW=W-pad.left-pad.right, cH=H-pad.top-pad.bottom;
  // v5 : l'échelle était figée à 9 m — la courbe était écrêtée en Cotentin,
  // où les pleines mers dépassent 13 m. Elle suit maintenant le marnage réel.
  const yMax = Math.max(9, Math.ceil(Math.max(0, ...tideData.map(p=>p.height)) / 3) * 3);
  const yTicks = Array.from({length: yMax/3 + 1}, (_, i) => i * 3);
  const toX=h=>pad.left+(h/24)*cW, toY=v=>pad.top+cH-(Math.min(v,yMax)/yMax)*cH;
  if (!tideData.length) return <div style={{height:100,display:"flex",alignItems:"center",justifyContent:"center",color:"#7b8ba1",fontSize:12,fontFamily:"monospace"}}>Marée indisponible</div>;
  const pathD = tideData.reduce((a,p,i)=>a+(i===0?`M ${toX(p.hour).toFixed(1)},${toY(p.height).toFixed(1)}`:`L ${toX(p.hour).toFixed(1)},${toY(p.height).toFixed(1)}`), "");
  const primes = windows.filter(w=>w.priority==="prime" && isFinite(w.startDecimal) && isFinite(w.endDecimal) && Math.abs(w.offsetBefore)<50);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      <defs>
        <linearGradient id="tg6" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.03"/>
        </linearGradient>
      </defs>
      {primes.map((w,i)=>{
        const x1=toX(Math.max(0,w.startDecimal)), x2=toX(Math.min(24,w.endDecimal));
        return x2>x1?<rect key={i} x={x1.toFixed(1)} y={pad.top} width={(x2-x1).toFixed(1)} height={cH} fill="#f59e0b" opacity="0.15"/>:null;
      })}
      {[0,3,6,9,12,15,18,21,24].map(t=><line key={t} x1={toX(t)} x2={toX(t)} y1={pad.top} y2={pad.top+cH} stroke="#0f172a" strokeWidth="1"/>)}
      {yTicks.map(v=><line key={v} x1={pad.left} x2={pad.left+cW} y1={toY(v)} y2={toY(v)} stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3,3"/>)}
      <path d={`${pathD} L ${toX(24)},${toY(0)} L ${toX(0)},${toY(0)} Z`} fill="url(#tg6)"/>
      <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="1.8"/>
      {[0,6,12,18,24].map(t=><text key={t} x={toX(t).toFixed(1)} y={H-5} textAnchor={t===0?"start":t===24?"end":"middle"} fontSize="13" fill="#94a3b8" fontFamily="system-ui,sans-serif">{`${String(t).padStart(2,"0")}h`}</text>)}
      {yTicks.map(v=><text key={v} x={pad.left-3} y={toY(v)+4} textAnchor="end" fontSize="12" fill="#94a3b8" fontFamily="system-ui,sans-serif">{v}m</text>)}
      {Number.isFinite(nowDec) && nowDec>=0 && nowDec<=24 && <g>
        <line x1={toX(nowDec)} x2={toX(nowDec)} y1={pad.top} y2={pad.top+cH} stroke="#f8fafc" strokeWidth="1.6" strokeDasharray="4,3"/>
        <text x={Math.min(W-4,Math.max(pad.left+2,toX(nowDec)))} y={pad.top+10} textAnchor={nowDec>20?"end":nowDec<3?"start":"middle"} fontSize="12" fontWeight="700" fill="#f8fafc" fontFamily="system-ui,sans-serif">maintenant</text>
      </g>}
    </svg>
  );
}
// ═══════════════════════════════════════════════════════════════════
// v6.2 — FRISE DE LA JOURNÉE SUR UN SPOT
// Une seule image pour décider quand partir : lumière, marée du port du spot,
// créneaux notés et vent heure par heure aux coordonnées du spot.
// ═══════════════════════════════════════════════════════════════════
export function DayStrip({ spot, date, live, tide, sun, hours, nowDec }) {
  // v8.9 : viewBox à l'échelle d'un écran de téléphone (340) : textes de 12 à 14 px réels, plus de 6 px illisibles.
  const W = 340, padL = 30, padR = 6, cw = W - padL - padR;
  const yLight = 2, hLight = 12, yTide = 18, hTide = 78, yWind = 102, hWind = 34, H = 152;
  const X = (h) => padL + (Math.max(0, Math.min(24, h)) / 24) * cw;
  const curve = tide?.curve || [];
  const yMax = Math.max(1, ...curve.map((p) => p.height));
  const Y = (v) => yTide + hTide - (v / yMax) * (hTide - 6);
  const path = curve.map((p, i) => `${i ? "L" : "M"}${X(p.hour).toFixed(1)},${Y(p.height).toFixed(1)}`).join(" ");
  const ser = live?.series?.[spot.id];
  const wind = [];
  if (ser) for (let h = 1.5; h < 24; h += 3) {
    const i = idxAt(ser, msAtLocal(date, h));
    if (i >= 0 && ser.wind[i] != null) wind.push({ h, kmh: ser.wind[i], dir: ser.dir[i], f: beaufortOf(ser.wind[i]) });
  }
  const bands = [];
  if (sun?.sunrise != null && sun?.sunset != null) {
    bands.push({ a: 0, b: sun.dawn ?? sun.sunrise, c: "#0b1020" }, { a: sun.dawn ?? sun.sunrise, b: sun.sunrise + 0.75, c: "#7c3aed" },
               { a: sun.sunrise + 0.75, b: sun.sunset - 0.75, c: "#1e3a5f" }, { a: sun.sunset - 0.75, b: sun.dusk ?? sun.sunset, c: "#7c3aed" },
               { a: sun.dusk ?? sun.sunset, b: 24, c: "#0b1020" });
  }
  const wins = (spot.windows || []).filter((w) => Number.isFinite(w.startDecimal) && Math.abs(w.offsetBefore) < 50);
  const restricted = hours && (hours.from > 0 || hours.to < 24);
  const col = (w) => (!w.eligible ? "#64748b" : w.score >= 7 ? "#22c55e" : w.score >= 5 ? "#f59e0b" : "#94a3b8");
  const fCol = (f) => (f >= 6 ? "#f87171" : f >= 4 ? "#f59e0b" : "#7dd3fc");
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Journée sur ${spot.name} : lumière, marée, créneaux et vent`} style={{display:"block"}}>
      {bands.map((b, i) => b.b > b.a ? <rect key={i} x={X(b.a)} y={yLight} width={X(b.b) - X(b.a)} height={hLight} fill={b.c} opacity={b.c === "#7c3aed" ? 0.55 : 0.9} /> : null)}
      <text x={padL - 4} y={yLight + 12} textAnchor="end" fontSize="12" fill="#8a9ab0" fontFamily="system-ui,sans-serif">☀</text>
      {restricted && <>
        <rect x={X(0)} y={yTide} width={X(hours.from) - X(0)} height={hTide} fill="#000" opacity="0.35" />
        <rect x={X(hours.to)} y={yTide} width={X(24) - X(hours.to)} height={hTide} fill="#000" opacity="0.35" />
      </>}
      {wins.map((w, i) => {
        const x1 = X(w.startDecimal), x2 = X(w.endDecimal);
        if (x2 - x1 < 1) return null;
        return (
          <g key={i} opacity={w.outOfHours ? 0.35 : 1}>
            <rect x={x1} y={yTide} width={x2 - x1} height={hTide} fill={col(w)} opacity="0.16" />
            <rect x={x1} y={yTide} width={x2 - x1} height="3" fill={col(w)} />
            {w.eligible && x2 - x1 > 24 && <text x={(x1 + x2) / 2} y={yTide + 17} textAnchor="middle" fontSize="14" fontWeight="800" fill={col(w)} fontFamily="system-ui,sans-serif">{w.score.toFixed(1).replace(".", ",")}</text>}
          </g>
        );
      })}
      {path && <path d={`${path} L${X(24)},${yTide + hTide} L${X(0)},${yTide + hTide} Z`} fill="#0ea5e9" opacity="0.12" />}
      {path && <path d={path} fill="none" stroke="#38bdf8" strokeWidth="2" />}
      {(tide?.dayEvents || []).map((e, i) => (
        <text key={i} x={X(e.dec)} y={e.type === "PM" ? Math.min(yTide + hTide - 4, Y(e.h ?? yMax) + 16) : yTide + hTide - 4} textAnchor="middle" fontSize="12" fill="#cbd5e1" fontFamily="system-ui,sans-serif">{e.type}</text>
      ))}
      {wind.map((w, i) => {
        const len = 6 + Math.min(10, w.f * 2), cx = X(w.h), cy = yWind + 10;
        return (
          <g key={i}>
            <g transform={`rotate(${(w.dir ?? 0) + 180} ${cx} ${cy})`}>
              <line x1={cx} y1={cy - len / 2} x2={cx} y2={cy + len / 2} stroke={fCol(w.f)} strokeWidth="2.2" />
              <path d={`M${cx - 4},${cy + len / 2 - 5} L${cx},${cy + len / 2} L${cx + 4},${cy + len / 2 - 5}`} fill="none" stroke={fCol(w.f)} strokeWidth="2.2" />
            </g>
            <text x={cx} y={yWind + hWind - 2} textAnchor="middle" fontSize="12" fill={fCol(w.f)} fontFamily="system-ui,sans-serif">{Math.round(w.kmh)}</text>
          </g>
        );
      })}
      {!wind.length && <text x={padL + cw / 2} y={yWind + 20} textAnchor="middle" fontSize="13" fill="#8a9ab0" fontFamily="system-ui,sans-serif">vent : météo non chargée</text>}
      <text x={padL - 4} y={yWind + 14} textAnchor="end" fontSize="12" fill="#8a9ab0" fontFamily="system-ui,sans-serif">km/h</text>
      {[0, 6, 12, 18, 24].map((h) => <text key={h} x={X(h)} y={H - 2} textAnchor={h === 0 ? "start" : h === 24 ? "end" : "middle"} fontSize="13" fill="#94a3b8" fontFamily="system-ui,sans-serif">{String(h).padStart(2, "0")}h</text>)}
      {Number.isFinite(nowDec) && nowDec >= 0 && nowDec <= 24 && <g>
        <line x1={X(nowDec)} x2={X(nowDec)} y1={yLight} y2={yWind + hWind - 14} stroke="#f8fafc" strokeWidth="1.6" strokeDasharray="4,3" />
        <text x={Math.min(W - 2, Math.max(padL + 2, X(nowDec)))} y={yTide + hTide - 18} textAnchor={nowDec > 20 ? "end" : nowDec < 3 ? "start" : "middle"} fontSize="12" fontWeight="700" fill="#f8fafc" fontFamily="system-ui,sans-serif">maintenant</text>
      </g>}
    </svg>
  );
}
/** Heure murale de Paris « HH:MM » d'un instant. */
export const parisHHMM = (ms) => { const p = parisParts(ms); return `${String(p.hh).padStart(2,"0")}:${String(p.mi).padStart(2,"0")}`; };
export const parisISO = (ms) => { const p = parisParts(ms); return `${p.y}-${String(p.m).padStart(2,"0")}-${String(p.d).padStart(2,"0")}`; };

const lbl = { display:"block", fontSize:13, color:C.muted, marginBottom:5, fontWeight:600 };
const inp = { background:C.card2, color:C.text, border:`1px solid ${C.line}`, borderRadius:8, padding:"9px 10px", fontSize:15, width:"100%" };
const btn = (color, filled) => ({ padding:"10px 16px", borderRadius:9, border:`1px solid ${color}`, background:filled ? color + "26" : "transparent", color:filled ? C.strong : C.muted, cursor:"pointer", fontSize:14, fontWeight:700 });

// Leurres de ta boîte, taille par taille, pour le journal : ce qui permet au conseil d'apprendre de tes sessions.
export function boxChoices(CATALOGUE = BASE_CATALOGUE) {
  const out = [];
  for (const b of BOITE) {
    const c = CATALOGUE[b.cat];
    if (!c) continue;
    const sizes = b.allSizes ? Object.keys(c.sizes) : b.size ? [String(b.size)] : [""];
    for (const len of sizes.length ? sizes : [""]) {
      const sp = len ? c.sizes[len] : null;
      out.push({ key: `${b.cat}:${len}`, cat: b.cat, len: len ? +len : null, label: `${c.name}${len ? ` ${len}${c.sizeIsWeight ? " g" : ""}` : ""}`,
                 g: sp?.g != null && !c.sizeIsWeight ? `${String(sp.g).replace(".", ",")} g` : "" });
    }
  }
  return out;
}
export function JournalForm({ spots, date, onAdd, onExport, onImport, hasEntries, disabled, preset, catalog }) {
  const fileRef = useRef(null);
  const [spotId, setSpotId] = useState(preset?.spotId ?? spots[0]?.id ?? "");
  // v8.9 : la note ressentie est facultative — non touchée, elle n'est pas enregistrée (et ne recalibre rien).
  const [result, setResult] = useState(null);
  const [fish, setFish] = useState(preset?.fish ?? 0);
  const [lure, setLure] = useState("");
  const [lureKey, setLureKey] = useState("");
  const [lureW, setLureW] = useState("");
  const [lureColor, setLureColor] = useState("");
  const choices = boxChoices(catalog);
  const [note, setNote] = useState("");
  const [duree, setDuree] = useState(preset?.duree != null ? String(preset.duree).replace(".",",") : "");
  const [heure, setHeure] = useState(()=> preset?.heure ?? (parisISO(Date.now()) === date ? parisHHMM(Date.now()) : ""));
  // « Je pêche ici maintenant » → « Terminer » : le formulaire arrive prérempli.
  useEffect(()=>{
    if (!preset?.nonce) return;
    if (preset.spotId) setSpotId(preset.spotId);
    if (preset.heure) setHeure(preset.heure);
    if (preset.duree != null) setDuree(String(preset.duree).replace(".",","));
    if (preset.fish != null) setFish(preset.fish);
  },[preset?.nonce]);   // eslint-disable-line react-hooks/exhaustive-deps
  const [saved, setSaved] = useState(false);
  const predicted = spots.find(s=>s.id===spotId)?.score ?? null;
  const submit = async () => {
    const h = parseFloat(String(duree).replace(",","."));
    const ch = choices.find((c)=>c.key===lureKey);
    const main = ch ? [ch.label, lureW.trim(), lureColor.trim()].filter(Boolean).join(" · ") : "";
    const lureText = [main, lure.trim() ? (main ? `autres : ${lure.trim()}` : lure.trim()) : ""].filter(Boolean).join(" — ");
    await onAdd({ id:`log-${date}-${spotId}-${Date.now().toString(36)}`, spotId, date, result, fish,
                  lure:lureText, predicted: predicted!=null?parseFloat(predicted.toFixed(2)):null, note:note.trim(),
                  ...(ch ? { lureRef: { cat: ch.cat, len: ch.len }, lureW: lureW.trim(), lureColor: lureColor.trim() } : {}),
                  ...(heure ? { heure } : {}), ...(Number.isFinite(h) && h > 0 && h <= 24 ? { duree: h } : {}) });
    setNote(""); setLure(""); setLureKey(""); setLureW(""); setLureColor(""); setFish(0); setDuree(""); setResult(null); setSaved(true); setTimeout(()=>setSaved(false),6000);
  };
  return (
    <div style={{display:"grid",gap:12}}>
      <label><span style={lbl}>Spot pêché</span>
        <select value={spotId} onChange={e=>setSpotId(e.target.value)} style={inp}>
          {spots.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <div>
        <label><span style={lbl}>Résultat ressenti : {result==null ? <span style={{color:C.faint,fontWeight:500}}>non noté (facultatif)</span> : `${result}/10`}{predicted!=null && <span style={{color:C.accent,fontWeight:500}}> · prédit {predicted.toFixed(1).replace(".", ",")}</span>}</span>
          <input type="range" min="0" max="10" step="1" value={result ?? 5} onChange={e=>setResult(+e.target.value)} onClick={e=>setResult(+e.currentTarget.value)} aria-valuetext={result==null?"non noté":`${result} sur 10`} style={{width:"100%",height:44,accentColor:C.violet}}/>
        </label>
        {result!=null && <button type="button" onClick={()=>setResult(null)} style={{minHeight:40,background:"none",border:"none",padding:0,color:C.accent,fontSize:13.5,cursor:"pointer"}}>Ne pas noter</button>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
        <label><span style={lbl}>Heure</span><input type="time" value={heure} onChange={e=>setHeure(e.target.value)} style={inp}/></label>
        <label><span style={lbl}>Durée (h)</span><input type="text" inputMode="decimal" aria-label="Durée de la session en heures" placeholder="2,5" value={duree} onChange={e=>setDuree(e.target.value.replace(/[^\d.,]/g,""))} style={inp}/></label>
        <label><span style={lbl}>Prises</span><input type="number" min="0" max="99" value={fish} onChange={e=>setFish(Math.max(0,parseInt(e.target.value)||0))} style={inp}/></label>
      </div>
      <label><span style={lbl}>Leurre principal (celui qui a pris, sinon le plus pêché)</span>
        <select aria-label="Leurre principal" value={lureKey} onChange={e=>{ const k=e.target.value; setLureKey(k); setLureW(choices.find(c=>c.key===k)?.g || ""); }} style={inp}>
          <option value="">—</option>
          {choices.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </label>
      {lureKey && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          <label><span style={lbl}>Poids ou tête</span><input type="text" aria-label="Poids ou tête du leurre" value={lureW} onChange={e=>setLureW(e.target.value)} placeholder="tête Search 18 g" style={inp}/></label>
          <label><span style={lbl}>Couleur</span><input type="text" aria-label="Couleur du leurre" value={lureColor} onChange={e=>setLureColor(e.target.value)} placeholder="Blanc" style={inp}/></label>
        </div>
      )}
      <label><span style={lbl}>{lureKey ? "Autres leurres essayés" : "Leurre(s), en texte libre"}</span><input type="text" value={lure} onChange={e=>setLure(e.target.value)} placeholder="Asturie 130 blanc…" style={inp}/></label>
      <label><span style={lbl}>Ce que le modèle n'a pas vu</span>
        <textarea rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Chasses en surface, taille des proies, poste précis…" style={{...inp,resize:"vertical"}}/>
      </label>
      <div style={{fontSize:12.5,color:C.muted,lineHeight:1.5}}>Avec l'heure, la marée, le vent, la houle, la pression et la lumière du moment sont enregistrés avec la session. Le leurre, son poids, sa couleur et tes prises servent ensuite au conseil leurres, dans des conditions proches.</div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <button onClick={submit} disabled={disabled} title={disabled?"Sauvegarde indisponible : importe d'abord ton journal exporté":""}
          style={{...btn(C.violet, !disabled), cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.5:1}}>Enregistrer</button>
        {hasEntries && <button onClick={onExport} style={btn(C.line)}>Exporter</button>}
        <button onClick={()=>fileRef.current?.click()} style={btn(C.line)}>Importer</button>
        <input ref={fileRef} type="file" accept="application/json,.json" style={{display:"none"}}
          onChange={async(ev)=>{
            const f=ev.target.files?.[0]; if(!f) return;
            try{
              const txt=await f.text(); const list=JSON.parse(txt);
              if(!Array.isArray(list)) throw new Error("format inattendu");
              const clean=list.filter(x=>x&&typeof x==="object"&&x.spotId&&x.date);
              if(!clean.length) throw new Error("aucune entrée valide (spot et date requis)");
              await onImport(clean);
            }catch(e){ alert("Import impossible : "+(e?.message||e)); }
            ev.target.value="";
          }}/>
        <span role="status" aria-live="polite" style={{fontSize:14,color:C.good,fontWeight:700}}>{saved ? "✓ Session enregistrée" : ""}</span>
      </div>
    </div>
  );
}
/** Désaccord entre les deux modèles météo sur le vent du créneau. */
export function ModelSpread({ zw }) {
  if (!zw?.alt || !((zw.spreadF || 1) >= 2 || (zw.spreadD || 1) >= 2)) return null;
  return (
    <div title="Quand les deux modèles divergent, le classement est éprouvé sur une plage de vent plus large" style={{fontSize:13,color:"#fbbf24",marginTop:4}}>
      ⚠ Modèles en désaccord : l'autre annonce {zw.alt.dir || "?"} {zw.alt.kmh} km/h
    </div>
  );
}
const PHASE = { descendant:"↘ descendant", montant:"↗ montant", renversement:"↔ étale", variable:"~ variable" };
/** Durée restante lisible : « 1 h 20 », « 45 min ». */
export const fmtLeft = (h) => { const m = Math.max(0, Math.round((h || 0) * 60)); return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`; };
/** Un créneau de marée noté. */
export function WindowRow({ w, lure }) {
  const [open, setOpen] = useState(false);
  const prime = w.priority === "prime";
  return (
    // Hors de tes heures : cadre en pointillés et fond effacé, mais texte au contraste normal (lisible au soleil,
    // WCAG 1.4.3) — l'ancienne transparence à 55 % faisait tomber tout le texte sous 4,5:1.
    <div style={{padding:"12px 13px",background:w.outOfHours || w.past ? "transparent" : C.card2,border:`1px ${w.outOfHours || w.past ? "dashed" : "solid"} ${w.ongoing ? C.good + "88" : prime && !w.outOfHours && !w.past ? C.warn + "55" : C.line}`,borderRadius:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:10}}>
        <span style={{fontSize:17,fontWeight:800,color:w.past ? C.muted : C.strong,...num,textDecoration:w.past ? "line-through" : "none"}}>{w.startFmt} → {w.endFmt}</span>
        {w.eligible && w.score!=null
          ? <span title="Note de ce créneau : marée, lumière, vent et pression ensemble" style={{fontSize:18,fontWeight:800,color:scoreColor(w.score, true, w.verify?.length),...num}}>{w.score.toFixed(1).replace(".", ",")}</span>
          : <span style={{fontSize:13,color:C.faint}}>non praticable</span>}
      </div>
      <div style={{fontSize:14,color:C.text,marginTop:3}}>{w.label}{w.clipped ? <span style={{color:C.muted}}> · dans tes heures (créneau de marée {w.tideStartFmt} → {w.tideEndFmt})</span> : null}</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
        {prime && <Pill color={C.warn}>Prime</Pill>}
        <Pill color={C.muted}>{PHASE[w.tidePhaseType] || w.tidePhaseType}</Pill>
        {w.light && w.light.band!=="inconnu" && <Pill color={w.light.color}>{w.light.label}</Pill>}
        {w.outOfHours && <Pill color={C.faint} title="Hors de tes heures de pêche : jamais proposé">Hors de tes heures</Pill>}
        {w.past && <Pill color={C.faint} title="Créneau déjà fini : plus proposé">Passé</Pill>}
        {w.tooLate && <Pill color={C.faint} title="Il finit avant que tu sois sur place (route et installation) : plus proposé">Fin avant ton arrivée</Pill>}
        {w.ongoing && !w.tooLate && <Pill color={C.good} title="Créneau en cours">En cours · encore {fmtLeft(w.remainingH)}</Pill>}
      </div>
      {w.zw?.fromSpot && (
        <div title={`Météo prévue sur ce créneau, aux coordonnées du spot${w.zw.model?` (${w.zw.model})`:""}`} style={{fontSize:13.5,color:"#7dd3fc",marginTop:7,...num}}>
          🌬 {w.zw.wind_dir} {w.zw.wind_kmh} km/h{w.zw.gust_kmh!=null?` · raf. ${w.zw.gust_kmh}`:""} · 🌊 {w.zw.houleKnown?`${String(w.zw.houle).replace(".",",")} m`:"?"}{w.zw.cloud!=null?` · ☁ ${w.zw.cloud} %`:""}{w.zw.rain>=0.5?` · 🌧 ${String(w.zw.rain).replace(".",",")} mm`:""}
        </div>
      )}
      {w.zw?.fromSpot && <ModelSpread zw={w.zw}/>}
      {w.zw?.rain36 >= 5 && <div style={{fontSize:13,color:C.muted,marginTop:4}}>🌧 {String(w.zw.rain36).replace(".",",")} mm de pluie dans les 36 h précédentes{w.zw.rain36 >= 15 ? " : eau probablement teintée près des rivières (déduit)" : ""}</div>}
      {lure && <div style={{fontSize:13.5,color:C.text,marginTop:6}}>🎣 <b>{lure}</b></div>}
      {w.light?.mismatch && (
        <div style={{marginTop:7,padding:"7px 9px",borderRadius:8,background:"rgba(127,29,29,0.2)",border:"1px solid #7f1d1d",fontSize:13,color:"#fecaca",lineHeight:1.5}}>
          Libellé trompeur à cette date : ce créneau annonce de la basse lumière mais tombe en {w.light.label.toLowerCase()}.
        </div>
      )}
      {w.note && <p style={{margin:"7px 0 0",fontSize:13.5,color:C.muted,lineHeight:1.5}}>{w.note}</p>}
      {w.parts?.length>0 && (
        <button onClick={()=>setOpen(v=>!v)} aria-expanded={open} style={{marginTop:2,minHeight:40,background:"none",border:"none",padding:0,color:C.accent,fontSize:13.5,cursor:"pointer"}}>{open?"Masquer":"Détail de la note"}</button>
      )}
      {open && (
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:6}}>
          {w.parts.filter(p=>Math.abs(p.v)>=0.05).map((p,i)=>(
            <span key={i} style={{fontSize:12.5,padding:"2px 7px",borderRadius:6,border:`1px solid ${C.line}`,color:p.v>0?"#4ade80":"#f87171",...num}}>{p.k} {p.v>0?"+":""}{p.v}</span>
          ))}
        </div>
      )}
    </div>
  );
}
// Trace d'une correction de fiche, champ par champ : « Corrigé le … (profondeur), par toi, sur place ; (couches), d'après… ».
const FIELD_NAME = { prof: "profondeur", encombrement: "encombrement", gratter: "pêche à gratter", couches: "couches" };
function correctionTrace(c) {
  const by = (k) => c.src?.[k]?.from ?? c.from;
  const atOf = (k) => c.src?.[k]?.at ?? c.at;
  const latest = Math.max(...c.champs.map(atOf).filter(Number.isFinite), 0) || c.at;
  const groups = [["toi", "par toi, sur place"], ["photo", "d'après une analyse photo validée par toi"]]
    .map(([kind, label]) => [c.champs.filter((k) => (by(k) === "toi") === (kind === "toi")), label])
    .filter(([ks]) => ks.length).map(([ks, label]) => `(${ks.map((k) => FIELD_NAME[k] || k).join(", ")}), ${label}`);
  return `Corrigé le ${new Date(latest).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })} ${groups.join(" ; ")}.`;
}
export function TerrainBlock({ spot, compact = false }) {
  const t = terrainOf(spot);
  const g = GRATTER[t.gratter] || GRATTER.texan;
  return (
    <div style={{padding:"12px 13px",background:C.card2,border:`1px solid ${g.color}55`,borderRadius:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:6}}>
        <span style={{fontSize:15,fontWeight:700,color:C.strong}}>Terrain · encombrement {t.encombrement}/3</span>
        <ConfidenceBadge level={t.confidence} />
      </div>
      <div style={{fontSize:14,color:g.color,fontWeight:700,marginBottom:6}}>{g.label}</div>
      {t.corrige && <div style={{fontSize:13,color:C.good,marginBottom:6}}>{correctionTrace(t.corrige)}</div>}
      {!compact && <p style={{margin:"0 0 6px",fontSize:14,color:C.text,lineHeight:1.55}}>{t.fond} <span style={{color:C.muted}}>({ENCOMBREMENT[t.encombrement]})</span></p>}
      <div style={{fontSize:14,color:C.text,lineHeight:1.55}}>
        <b>Couches à pêcher :</b> {t.couches.join(", ")}.
        {t.montage && <><br/><b>Montage :</b> {t.montage}</>}
      </div>
      {!compact && t.conseils.length>0 && (
        <ul style={{margin:"8px 0 0",paddingLeft:18,fontSize:14,color:C.text,lineHeight:1.55,listStyle:"disc"}}>
          {t.conseils.map((c,i)=><li key={i}>{c}</li>)}
        </ul>
      )}
      {!compact && (t.faits||[]).length>0 && (
        <div style={{marginTop:10,paddingTop:9,borderTop:`1px solid ${C.line}`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.good,marginBottom:5}}>Ce que disent les sources</div>
          {t.faits.map((f,i)=>(
            <div key={i} style={{fontSize:13.5,color:C.text,lineHeight:1.5,marginBottom:6}}>{f.t} <span style={{fontSize:12,color:C.faint,fontStyle:"italic"}}>— {f.s}</span></div>
          ))}
        </div>
      )}
      {!compact && <div style={{fontSize:12.5,color:C.muted,marginTop:7}}>Classement du terrain : {t.confidence==="local_knowledge"?"observation de terrain":"déduit des descriptions"} · {t.source}</div>}
    </div>
  );
}
export function TopoBlock({ title, data }) {
  if (!data?.text) return null;
  return (
    <div style={{padding:"12px 13px",background:C.card2,border:`1px solid ${C.line}`,borderRadius:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5,flexWrap:"wrap",gap:6}}>
        <span style={{fontSize:14,fontWeight:700,color:C.strong}}>{title}</span>
        <ConfidenceBadge level={data.confidence} />
      </div>
      <p style={{margin:0,fontSize:14,color:C.text,lineHeight:1.6}}>{data.text}</p>
    </div>
  );
}
