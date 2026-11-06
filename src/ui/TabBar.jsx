// v9.2 — Navigation : une barre en bas de l'écran, à portée du pouce, cinq entrées.
//   Décision (synthese) · Carte (spots) · Journal · Matériel (leurres) · Plus
// « Plus » ouvre un sommaire : Marée, Météo, Saison, Règles, Photos, et les réglages.
// L'écran affiché reste inscrit dans l'adresse (#maree…) : le bouton « retour » du téléphone revient à l'écran précédent,
// et les liens directs des versions précédentes (#synthese, #spots, #leurres…) marchent toujours.
import { useEffect, useState } from "react";
import { Icon } from "./icons.jsx";
import { C } from "./kit.jsx";

export const PILLARS = [
  ["synthese", "Décision", "decision"], ["spots", "Carte", "carte"], ["journal", "Journal", "journal"],
  ["leurres", "Matériel", "materiel"], ["plus", "Plus", "plus"],
];
export const MORE = [
  ["maree", "Marée", "maree", "Pleines et basses mers, coefficients, courbe du jour"],
  ["meteo", "Météo", "meteo", "Vent et houle spot par spot, modèles, fiabilité"],
  ["saison", "Saison", "saison", "Température de l'eau, présence du bar, soleil"],
  ["regles", "Règles", "regles", "Taille minimale, quotas, no-kill, sources"],
  ["photos", "Photos", "photos", "Analyse photo d'un spot (marée, fond, courant)"],
];
export const TABS = [...PILLARS.map(([k, l]) => [k, l]), ...MORE.map(([k, l]) => [k, l])];
export const pillarOf = (tab) => (MORE.some(([k]) => k === tab) ? "plus" : tab);
export const tabFromHash = () => {
  const h = (typeof location !== "undefined" ? location.hash : "").replace(/^#/, "");
  return TABS.some(([k]) => k === h) ? h : "synthese";
};
/** Hauteur de la barre (sans la zone du geste d'accueil). */
export const NAV_H = 64;

export function BottomNav({ tab, onChange }) {
  const cur = pillarOf(tab);
  // Clavier (motif « onglets » WAI-ARIA) : flèches, début, fin ; l'onglet suit le focus.
  const onKey = (e) => {
    const i = PILLARS.findIndex(([k]) => k === cur);
    const j = e.key === "ArrowRight" ? (i + 1) % PILLARS.length : e.key === "ArrowLeft" ? (i - 1 + PILLARS.length) % PILLARS.length
      : e.key === "Home" ? 0 : e.key === "End" ? PILLARS.length - 1 : -1;
    if (j < 0) return;
    e.preventDefault();
    const k = PILLARS[j][0];
    onChange(k);
    requestAnimationFrame(() => document.getElementById(`onglet-${k}`)?.focus());
  };
  return (
    <nav aria-label="Navigation du guide" className="bottom-nav" style={{position:"fixed",left:0,right:0,bottom:0,zIndex:900,background:"rgba(3,11,23,0.94)",
      backdropFilter:"blur(14px) saturate(140%)",WebkitBackdropFilter:"blur(14px) saturate(140%)",borderTop:`1px solid ${C.line}`,paddingBottom:"env(safe-area-inset-bottom)"}}>
      <div role="tablist" aria-label="Navigation du guide" onKeyDown={onKey} style={{maxWidth:640,margin:"0 auto",display:"flex",height:NAV_H,padding:"0 max(4px, env(safe-area-inset-left)) 0 max(4px, env(safe-area-inset-right))"}}>
        {PILLARS.map(([k, lbl, ic]) => {
          const on = cur === k;
          return (
            <button key={k} role="tab" id={`onglet-${k}`} aria-selected={on} aria-controls="panneau" tabIndex={on ? 0 : -1} onClick={() => onChange(k)}
              style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,border:"none",background:"none",cursor:"pointer",
                color:on ? "#7dd3fc" : "#94a3b8",padding:0}}>
              <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:54,height:30,borderRadius:999,background:on ? "rgba(56,189,248,0.16)" : "transparent",transition:"background .15s"}}>
                <Icon name={ic} size={23} stroke={on ? 2 : 1.8}/>
              </span>
              <span style={{fontSize:12,fontWeight:on ? 750 : 550,letterSpacing:"0.01em",color:on ? "#e0f2fe" : "#94a3b8",lineHeight:1}}>{lbl}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/** État de la sauvegarde du journal, publié par la barre de sauvegarde (sync.jsx). */
export function useSyncState() {
  const [st, setSt] = useState(() => (typeof window !== "undefined" && window.__barSync) || { state: "off" });
  useEffect(() => {
    const on = (e) => setSt(e.detail || { state: "off" });
    window.addEventListener("bar:sync-state", on);
    return () => window.removeEventListener("bar:sync-state", on);
  }, []);
  return st;
}
export const syncText = (st) => (st.state === "ok" ? "Journal sauvegardé sur GitHub" : st.state === "syncing" ? "Sauvegarde GitHub…"
  : st.state === "error" ? `Sauvegarde GitHub en échec : ${st.msg || "erreur"}` : "Journal gardé sur cet appareil (sans copie GitHub)");

/** Sommaire « Plus » : les écrans de référence, puis les réglages. */
export function PlusHub({ onOpen }) {
  const st = useSyncState();
  const row = { display:"flex",alignItems:"center",gap:14,width:"100%",minHeight:68,padding:"12px 14px",border:"none",borderTop:`1px solid ${C.line2}`,background:"none",color:C.text,textAlign:"left",cursor:"pointer" };
  const badge = (ic) => <span style={{width:42,height:42,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(56,189,248,0.12)",color:"#7dd3fc",flexShrink:0}}><Icon name={ic} size={22}/></span>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <h2 style={{margin:"2px 2px 0",fontSize:22,fontWeight:800,color:C.strong}}>Plus</h2>
      <div style={{background:C.card,border:`1px solid ${C.line}`,borderRadius:16,overflow:"hidden"}}>
        {MORE.map(([k, lbl, ic, sub], i) => (
          <button key={k} onClick={() => onOpen(k)} style={{...row,borderTop:i ? row.borderTop : "none"}}>
            {badge(ic)}
            <span style={{flex:1,minWidth:0}}><span style={{display:"block",fontSize:16,fontWeight:700,color:C.strong}}>{lbl}</span>
              <span style={{display:"block",fontSize:13.5,color:C.muted,marginTop:1}}>{sub}</span></span>
            <span style={{color:C.faint}}><Icon name="chevron" size={18}/></span>
          </button>
        ))}
      </div>
      <div style={{background:C.card,border:`1px solid ${C.line}`,borderRadius:16,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px"}}>
          {badge("reglages")}
          <span style={{flex:1,minWidth:0}}><span style={{display:"block",fontSize:16,fontWeight:700,color:C.strong}}>Affichage et sauvegarde</span>
            <span role="status" style={{display:"block",fontSize:13.5,color:st.state === "error" ? "#fca5a5" : st.state === "ok" ? "#86efac" : C.muted,marginTop:1}}>{syncText(st)}</span></span>
          <button onClick={() => window.dispatchEvent(new Event("bar:reglages"))} style={{flexShrink:0,minHeight:44,padding:"0 14px",borderRadius:10,border:`1px solid ${C.line}`,background:"none",color:C.text,fontSize:14,fontWeight:600,cursor:"pointer"}}>Réglages</button>
        </div>
      </div>
      <a href="index.html" style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",minHeight:56,background:C.card,border:`1px solid ${C.line}`,borderRadius:16,color:C.text,textDecoration:"none"}}>
        {badge("carte")}
        <span style={{flex:1,minWidth:0}}><span style={{display:"block",fontSize:16,fontWeight:700,color:C.strong}}>Changer de guide</span>
          <span style={{display:"block",fontSize:13.5,color:C.muted,marginTop:1}}>Accueil : les sept guides, la carte de tous les spots, la pêche en bateau</span></span>
        <span style={{color:C.faint}}><Icon name="chevron" size={18}/></span>
      </a>
    </div>
  );
}

/** En-tête d'un écran de « Plus » : retour au sommaire et accès direct aux autres écrans. */
export function MoreHeader({ tab, onOpen }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,overflowX:"auto",scrollbarWidth:"none",margin:"0 -14px 12px",padding:"0 14px"}}>
      <button onClick={() => onOpen("plus")} aria-label="Retour au sommaire Plus" style={{display:"flex",alignItems:"center",gap:2,flexShrink:0,minHeight:40,padding:"0 10px 0 4px",borderRadius:999,border:"none",background:"none",color:"#7dd3fc",fontSize:14,fontWeight:700,cursor:"pointer"}}>
        <Icon name="retour" size={18}/>Plus
      </button>
      {MORE.map(([k, lbl]) => {
        const on = tab === k;
        return (
          <button key={k} onClick={() => onOpen(k)} aria-current={on ? "page" : undefined}
            style={{flexShrink:0,minHeight:40,padding:"0 14px",borderRadius:999,border:`1px solid ${on ? "#38bdf8" : C.line}`,background:on ? "rgba(56,189,248,0.16)" : "transparent",
              color:on ? C.strong : C.muted,fontSize:14,fontWeight:on ? 700 : 550,cursor:"pointer",whiteSpace:"nowrap"}}>{lbl}</button>
        );
      })}
    </div>
  );
}
