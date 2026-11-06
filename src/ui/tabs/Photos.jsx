// Analyse photo d'un spot : inventaire, vérification, lecture du pêcheur.
// Chaque élément de la lecture cite ses faits (o = photo vérifiée, t = marée et
// lumière calculées, f = fiche du guide, u = tes notes) ; les autres sont écartés.
// L'analyse elle-même vit dans photoJob.js : elle continue quand on change d'onglet.
import { useEffect, useMemo, useRef, useState } from "react";
import { SITE } from "SITE_CONFIG";
import { allSpots } from "../../engine/myspots.js";
import { FAMILLES } from "../../engine/lures.js";
import {
  BILLING_URL, CLAUDE_CFG_KEY, CLAUDE_MODELS, DEFAULT_MODEL, KEYS_URL, MODELS_URL, OBS_CATS, PASSES, PHOTO, apiError, apiHeaders, costOf,
  STUDIO_KEY, STUDIO_URL, VIA_ABONNEMENT, importAnalysis, nearestSpot, nextPass, photoDateLabel, photoMarks, reportText,
  parisInputMs,
} from "../../engine/photo.js";
import { Alert, C, Card, Chip, Disclosure, Muted, Stack, fr } from "../kit.jsx";
import { addImported, cancelJob, deleteAnalysis, dropJob, loadPhotoState, markSeen, resumeJob, setDraft, showAnalysis, startJob, usePhotoState } from "../photoJob.js";
import { preparePhoto } from "../photoPrep.js";

export { preparePhoto };

const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
const CONF = { elevee: ["élevée", C.good], moyenne: ["moyenne", C.warn], faible: ["faible", C.muted] };
const OTHER = "__autre__";
const usd = (x) => (x > 0 && x < 0.01 ? "moins de 0,01 $" : `${(x || 0).toFixed(2).replace(".", ",")} $`);
const mmss = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const plural = (n, w) => `${n} ${w}${n > 1 ? "s" : ""}`;
const inp = { width:"100%", boxSizing:"border-box", minHeight:44, padding:"8px 10px", borderRadius:8, border:`1px solid ${C.line}`, background:"#0b1220", color:C.text, fontSize:15 };
const btn = (tone = C.accent, filled = false) => ({ minHeight:44, padding:"0 14px", borderRadius:9, border:`1px solid ${tone}`, background:filled ? `${tone}30` : "transparent", color:tone, fontSize:14.5, fontWeight:700, cursor:"pointer" });
const refColor = (r) => (r[0] === "o" ? C.accent : r[0] === "t" ? C.violet : r[0] === "f" ? C.warn : C.good);

const visualTokens = (p) => Math.ceil(p.w / 28) * Math.ceil(p.h / 28);
const hasExifTime = (p) => p.when?.source === "exif" || p.when?.source === "exif-paris";

// ── Réglage de la clé ──
function KeyCard({ cfg, setCfg }) {
  const [key, setKey] = useState(""), [model, setModel] = useState(cfg?.model || DEFAULT_MODEL);
  const [state, setState] = useState(null);
  const test = async () => {
    const k = key.trim() || cfg?.key;
    if (!k) return;
    setState({ busy: true });
    try {
      const r = await fetch(MODELS_URL, { headers: apiHeaders(k) });
      if (!r.ok) { let j = null; try { j = await r.json(); } catch { /* vide */ } throw new Error(apiError(r.status, j)); }
      setCfg({ key: k, model }); setKey(""); setState({ ok: "Clé acceptée et enregistrée sur cet appareil." });
    } catch (e) { setState({ err: e.message || "Échec du test." }); }
  };
  return (
    <Card title="Clé API Claude" kicker="Pour analyser les photos">
      {!cfg?.key ? (
        <div style={{fontSize:14.5,lineHeight:1.6,color:C.text}}>
          Avec une clé API, l'analyse se fait ici même. Ce compte est distinct d'un abonnement Claude (qui ne couvre pas l'API, sauf les crédits inclus dans Max) et se paie à l'usage.
          <div style={{marginTop:6}}>1. <a href={KEYS_URL} target="_blank" rel="noopener noreferrer" style={{color:C.accent,fontWeight:700}}>Créer une clé sur platform.claude.com ↗</a> : se connecter (ou créer le compte), puis « Create key ». La clé (sk-ant-…) ne s'affiche qu'une fois : copie-la tout de suite.</div>
          <div style={{marginTop:4}}>2. <a href={BILLING_URL} target="_blank" rel="noopener noreferrer" style={{color:C.accent,fontWeight:700}}>Ajouter du crédit ↗</a> : « Buy credits ». Sans crédit, l'analyse s'arrête dès la première passe.</div>
          <div style={{marginTop:4}}>3. Coller la clé ci-dessous, puis « Enregistrer et tester » (le test vérifie la clé, pas le crédit).</div>
          <Muted>Chaque analyse coûte quelques dizaines de centimes, estimés avant et affichés après. Crédits prépayés, non remboursables, valables un an.</Muted>
        </div>
      ) : (
        <Muted style={{marginTop:0}}>Clé enregistrée sur cet appareil : …{cfg.key.slice(-4)}. Elle sert à tous les guides et ne part que vers api.anthropic.com.</Muted>
      )}
      <label style={{display:"block",marginTop:10,fontSize:13.5,color:C.muted}}>{cfg?.key ? "Remplacer la clé" : "Clé API"}
        <input style={{...inp,fontFamily:"monospace",marginTop:4}} type="password" value={key} placeholder="sk-ant-…" onChange={(e) => setKey(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false}/>
      </label>
      <label style={{display:"block",marginTop:10,fontSize:13.5,color:C.muted}}>Modèle
        <select style={{...inp,marginTop:4}} value={model} onChange={(e) => { setModel(e.target.value); if (cfg?.key) setCfg({ ...cfg, model: e.target.value }); }}>
          {Object.entries(CLAUDE_MODELS).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </select>
      </label>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
        <button style={btn(C.accent, true)} disabled={state?.busy || (!key.trim() && !cfg?.key)} onClick={test}>{state?.busy ? "Test…" : "Enregistrer et tester"}</button>
        {cfg?.key && <button style={btn(C.muted)} onClick={() => { setCfg(null); setState({ ok: "Clé supprimée de cet appareil." }); }}>Supprimer la clé</button>}
      </div>
      {state?.ok && <div style={{marginTop:10}}><Alert tone={C.good}>{state.ok}</Alert></div>}
      {state?.err && <div style={{marginTop:10}}><Alert tone={C.bad} role="alert">{state.err}</Alert></div>}
      <Muted>Les photos sont envoyées à Anthropic pour l'analyse, réduites et sans leurs métadonnées (date, position). Anthropic n'entraîne pas ses modèles sur les données envoyées par l'API.</Muted>
    </Card>
  );
}

// ── Sans clé API : l'analyse faite par l'abonnement Claude, sur claude.ai, puis importée ici ──
function SubscriptionCard({ g, open = true }) {
  const fileRef = useRef(null);
  const [paste, setPaste] = useState("");
  const [state, setState] = useState(null);
  const studio = STUDIO_URL.startsWith("https://") ? `${STUDIO_URL}#${STUDIO_KEY[SITE.id] || ""}` : null;
  const doImport = async (text) => {
    setState(null);
    try {
      const a = importAnalysis(text, { spots: allSpots(), spotsView: g.spotsView });
      await addImported(a);
      setPaste("");
      setState({ ok: `Analyse importée : ${a.spotName}, ${a.dateLabel}. Elle s'affiche plus haut.` });
    } catch (e) { setState({ err: e?.message || "Import impossible." }); }
  };
  const onFile = async (f) => {
    if (!f) return;
    if (f.size > 8e6) { setState({ err: "Fichier trop lourd pour une analyse photo du guide." }); return; }
    try { await doImport(await f.text()); } finally { if (fileRef.current) fileRef.current.value = ""; }
  };
  const body = (
    <>
      <div style={{fontSize:14.5,lineHeight:1.6,color:C.text}}>
        Sans crédit API, l'analyse peut passer par ton abonnement Claude, dans une page de claude.ai. Mêmes trois passes ; le guide recalcule la marée et refait les contrôles à l'import.
        <div style={{marginTop:6}}>1. {studio ? <a href={studio} target="_blank" rel="noopener noreferrer" style={{color:C.accent,fontWeight:700}}>Ouvrir la page « Analyse photo du bar » ↗</a> : <b>Page « Analyse photo du bar » sur claude.ai</b>}, connecté à ton compte. Ce guide y est déjà choisi.</div>
        <div style={{marginTop:4}}>2. Choisis le spot et les photos, puis « Analyser avec Claude » : c'est compté dans l'usage de ton abonnement.</div>
        <div style={{marginTop:4}}>3. « Enregistrer le fichier pour le guide », puis reviens ici.</div>
      </div>
      <input ref={fileRef} type="file" accept=".json,application/json" aria-label="Fichier d'analyse" style={{display:"none"}} onChange={(e) => onFile(e.target.files?.[0])}/>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
        <button style={btn(C.accent, true)} onClick={() => fileRef.current?.click()}>Importer une analyse</button>
      </div>
      <details style={{marginTop:10}}>
        <summary style={{cursor:"pointer",color:C.accent,fontSize:14,fontWeight:600,minHeight:40,display:"flex",alignItems:"center"}}>Coller une analyse copiée</summary>
        <textarea aria-label="Analyse copiée depuis claude.ai" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Colle ici le texte copié avec « Copier pour le guide »"
          style={{...inp,minHeight:90,marginTop:6,fontFamily:"monospace",fontSize:13}}/>
        <button style={{...btn(C.accent),marginTop:8}} disabled={!paste.trim()} onClick={() => doImport(paste)}>Importer le texte collé</button>
      </details>
      {state?.ok && <div style={{marginTop:10}}><Alert tone={C.good}>{state.ok}</Alert></div>}
      {state?.err && <div style={{marginTop:10}}><Alert tone={C.bad} role="alert">{state.err}</Alert></div>}
    </>
  );
  return open ? <Card title="Sans crédit API : ton abonnement Claude" kicker="Analyse photo">{body}</Card>
    : <Disclosure title="Analyser avec ton abonnement Claude" sub="Sans crédit API : page claude.ai, puis import du fichier">{body}</Disclosure>;
}

// ── Photo avec repères (positions approximatives) ──
// Repères interactifs seulement dans la visionneuse ; ailleurs, simples pastilles (jamais un bouton dans un bouton).
function Marked({ src, alt, obs = [], postes = [], active, onMark, big = false }) {
  const Tag = onMark ? "button" : "span";
  const base = (x, y) => ({ position:"absolute", left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", display:"inline-flex", alignItems:"center", justifyContent:"center",
    lineHeight:1, fontWeight:800, color:"#fff", cursor:onMark ? "pointer" : "default", boxSizing:"border-box" });
  return (
    <div style={{position:"relative",lineHeight:0}}>
      <img src={src} alt={alt} style={{width:"100%",borderRadius:big ? 0 : 8,display:"block"}}/>
      {obs.map((o) => (
        <Tag key={o.id} {...(onMark ? { onClick: () => onMark(o.id), "aria-label": `Repère ${o.id}` } : { "aria-hidden": true })}
          style={{...base(o.x, o.y),minWidth:big ? 32 : 12,height:big ? 32 : 12,padding:big ? "0 4px" : 0,borderRadius:999,
            border:`2px solid ${active === o.id ? "#fff" : C.accent}`,background:active === o.id ? C.accent : "rgba(2,12,24,0.75)",fontSize:12.5}}>
          {big ? o.id : ""}
        </Tag>
      ))}
      {postes.map((p) => (
        <Tag key={p.id} {...(onMark ? { onClick: () => onMark(p.id), "aria-label": `Poste ${p.id} : ${p.nom}` } : { "aria-hidden": true })}
          style={{...base(p.x, p.y),minWidth:big ? 38 : 20,height:big ? 38 : 20,padding:"0 4px",borderRadius:8,
            border:`2px solid ${active === p.id ? "#fff" : C.good}`,background:active === p.id ? C.good : "rgba(6,40,20,0.85)",fontSize:big ? 13 : 10}}>
          {p.id}
        </Tag>
      ))}
    </div>
  );
}

// ── Visionneuse plein écran ──
function Viewer({ a, start, focus, onClose }) {
  const [i, setI] = useState(start), [zoom, setZoom] = useState(false), [active, setActive] = useState(focus || null);
  const closeRef = useRef(null);
  const n = a.photos.length;
  const marks = photoMarks(a, i);
  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowRight") setI((x) => (x + 1) % n); if (e.key === "ArrowLeft") setI((x) => (x - 1 + n) % n); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [n, onClose]);
  const legend = [...marks.postes.map((p) => ({ id: p.id, t: p.nom, c: C.good })), ...a.observations.filter((o) => o.photo === i + 1).map((o) => ({ id: o.id, t: `${o.zone} · ${o.fait}${o.statut === "douteux" ? " (incertain)" : ""}${o.x == null ? " · position non repérée" : ""}`, c: C.accent }))];
  const p = a.photos[i];
  return (
    <div role="dialog" aria-modal="true" aria-label={`Photo ${i + 1} sur ${n}`} style={{position:"fixed",inset:0,zIndex:2000,background:"#020814",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"calc(env(safe-area-inset-top) + 6px) 8px 6px",borderBottom:`1px solid ${C.line}`}}>
        <button ref={closeRef} onClick={onClose} aria-label="Fermer" style={{...btn(C.text),minWidth:44,padding:0,fontSize:18}}>✕</button>
        <b style={{flex:1,color:C.strong,fontSize:15}}>Photo {i + 1} / {n}</b>
        <button onClick={() => setZoom((z) => !z)} aria-pressed={zoom} style={btn(C.accent, zoom)}>{zoom ? "Ajuster" : "Zoom ×2"}</button>
        {n > 1 && <button onClick={() => { setI((x) => (x - 1 + n) % n); setActive(null); }} aria-label="Photo précédente" style={{...btn(C.text),minWidth:44,padding:0}}>‹</button>}
        {n > 1 && <button onClick={() => { setI((x) => (x + 1) % n); setActive(null); }} aria-label="Photo suivante" style={{...btn(C.text),minWidth:44,padding:0}}>›</button>}
      </div>
      <div style={{flex:1,overflow:"auto",WebkitOverflowScrolling:"touch"}}>
        <div style={{width:zoom ? "200%" : "100%",maxWidth:zoom ? "none" : 900,margin:zoom ? 0 : "0 auto"}}>
          <Marked src={p.view || p.thumb} alt={`Photo ${i + 1}`} obs={marks.obs} postes={marks.postes} active={active} onMark={setActive} big/>
        </div>
        <div style={{padding:"10px 14px 30px",maxWidth:900,margin:"0 auto"}}>
          <div style={{fontSize:12.5,color:C.muted,marginBottom:6}}>Repères placés par l'analyse : positions approximatives. Les postes (P) sont au centre des observations qui les fondent.</div>
          {!p.view && <div style={{fontSize:12.5,color:C.warn,marginBottom:6}}>Image en petite taille : cette analyse date d'avant la visionneuse.</div>}
          {legend.map((x) => (
            <button key={x.id} onClick={() => setActive(x.id)} aria-pressed={active === x.id}
              style={{display:"block",width:"100%",textAlign:"left",minHeight:40,padding:"6px 8px",margin:"2px 0",borderRadius:8,border:"none",background:active === x.id ? "#1e3a5f" : "transparent",color:C.text,fontSize:14,lineHeight:1.45,cursor:"pointer"}}>
              <b style={{color:x.c}}>{x.id}</b> · {x.t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Faits : affichés sur place quand on touche un repère ──
function FactLine({ a, id, onPhoto }) {
  const f = a.facts.find((x) => x.id === id);
  if (!f) return null;
  const isObs = id[0] === "o";
  return (
    <div style={{display:"flex",gap:8,alignItems:"flex-start",margin:"6px 0 0",padding:"7px 9px",borderRadius:8,background:"#0f2540",borderLeft:`3px solid ${refColor(id)}`,fontSize:13.5,lineHeight:1.5,color:C.text}}>
      {isObs && a.photos[f.photo - 1] && (
        <button onClick={() => onPhoto(f.photo - 1, id)} aria-label={`Voir ${id} sur la photo ${f.photo}`} style={{width:76,flexShrink:0,padding:0,border:"none",background:"none",cursor:"pointer"}}>
          <Marked src={a.photos[f.photo - 1].thumb} alt="" obs={f.x != null ? [{ ...f }] : []}/>
        </button>
      )}
      <span><b style={{color:C.strong}}>{id}</b> · {isObs ? <><span style={{color:C.muted}}>photo {f.photo}, {f.zone} · {typeof OBS_CATS[f.categorie] === "string" && Object.prototype.hasOwnProperty.call(OBS_CATS, f.categorie) ? OBS_CATS[f.categorie] : String(f.categorie ?? "")} · </span>{f.fait}{f.statut === "douteux" ? <span style={{color:C.warn}}> (incertain)</span> : ""}</> : <>{f.t}{f.kind ? <span style={{fontSize:12,color:C.muted}}> [{f.kind}]</span> : null}</>}</span>
    </div>
  );
}
function Item({ a, refs, children, tag, onPhoto }) {
  const [open, setOpen] = useState([]);
  const toggle = (r) => setOpen((o) => (o.includes(r) ? o.filter((x) => x !== r) : [...o, r]));
  return (
    <div style={{padding:"8px 0",borderTop:`1px solid ${C.line2}`,fontSize:14.5,lineHeight:1.55,color:C.text}}>
      {tag}{children}
      {refs?.length > 0 && (
        <span style={{display:"inline-flex",gap:4,flexWrap:"wrap",marginLeft:4,verticalAlign:"middle"}}>
          {refs.map((r) => (
            <button key={r} onClick={() => toggle(r)} aria-expanded={open.includes(r)} aria-label={`Fait ${r}`}
              style={{minHeight:28,minWidth:32,padding:"0 8px",borderRadius:999,border:`1px solid ${refColor(r)}${open.includes(r) ? "" : "70"}`,background:open.includes(r) ? `${refColor(r)}30` : "transparent",color:open.includes(r) ? C.strong : C.muted,fontSize:12.5,fontWeight:700,cursor:"pointer"}}>{r}</button>
          ))}
        </span>
      )}
      {open.map((r) => <FactLine key={r} a={a} id={r} onPhoto={onPhoto}/>)}
    </div>
  );
}
const NATURE = { observe: ["vu", C.accent], deduit: ["déduit", C.violet] };

// ── Propositions pour la fiche du spot ──
function Proposals({ a, g, onPhoto }) {
  const props = a.lecture.propositions || [];
  if (!props.length || !a.spotId) return null;
  const ov = g.terrainOverrides?.[a.spotId] || {};
  return (
    <Card title="Proposé pour la fiche du spot" kicker="Rien ne change sans ton accord">
      {props.map((p, i) => {
        const applied = JSON.stringify(ov[p.champ]) === JSON.stringify(p.value) && (ov.src?.[p.champ]?.from ?? ov.from) === a.id;
        return (
          <Item key={i} a={a} refs={p.refs} onPhoto={onPhoto} tag={<b style={{color:C.strong}}>{p.label}. </b>}>
            {p.raison}
            <div style={{marginTop:6}}>
              {applied ? (
                <span style={{fontSize:14,color:C.good,fontWeight:700}}>✓ Appliqué à la fiche <button style={{...btn(C.muted),minHeight:36,marginLeft:8}} onClick={() => g.setTerrainOverride(a.spotId, p.champ, null, a.id)}>Annuler</button></span>
              ) : (
                <button style={{...btn(C.good, true),minHeight:40}} onClick={() => g.setTerrainOverride(a.spotId, p.champ, p.value, a.id)}>Appliquer à la fiche</button>
              )}
            </div>
          </Item>
        );
      })}
      <Muted>Une correction appliquée change le classement et le conseil leurres de ce spot, sur cet appareil. La fiche indique qu'elle a été corrigée sur le terrain.</Muted>
    </Card>
  );
}

// ── Compte rendu ──
export function AnalysisView({ a, g, onCopy }) {
  const L = a.lecture;
  const [viewer, setViewer] = useState(null);
  const onPhoto = (i, focus) => setViewer({ i, focus });
  const nConf = a.observations.filter((o) => o.statut === "confirme").length, nDoute = a.observations.length - nConf;
  return (
    <Stack>
      {viewer && <Viewer a={a} start={viewer.i} focus={viewer.focus} onClose={() => setViewer(null)}/>}
      <Card tone={C.accent} kicker={`Analyse photo · ${a.dateLabel}`} title={a.spotName}>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:10}}>
          {a.photos.map((p, i) => (
            <button key={i} onClick={() => onPhoto(i)} aria-label={`Agrandir la photo ${i + 1}`} style={{flex:"0 0 auto",width:a.photos.length > 2 ? 104 : 150,padding:0,border:"none",background:"none",cursor:"pointer",position:"relative"}}>
              <Marked src={p.thumb} alt={`Photo ${i + 1}`} {...photoMarks(a, i)}/>
              <span style={{position:"absolute",left:4,bottom:4,padding:"1px 6px",borderRadius:6,background:"rgba(2,12,24,0.8)",color:"#fff",fontSize:12,fontWeight:700,lineHeight:1.5}}>{i + 1} ⤢</span>
            </button>
          ))}
        </div>
        <p style={{margin:0,fontSize:15,lineHeight:1.6,color:C.strong}}>{L.synthese || "Pas de synthèse."}</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
          <Chip color={C.good}>{nConf} fait{nConf > 1 ? "s" : ""} confirmé{nConf > 1 ? "s" : ""}</Chip>
          {nDoute > 0 && <Chip color={C.warn}>{plural(nDoute, "incertain")}</Chip>}
          {(a.removed.length + a.dropped.length) > 0 && <Chip color={C.muted}>{plural(a.removed.length + a.dropped.length, "écarté")}</Chip>}
          <Chip color={C.muted}>{a.via === VIA_ABONNEMENT ? "Abonnement Claude · sans crédit API" : `${CLAUDE_MODELS[a.model]?.label.split(" —")[0] || a.model} · ${usd(a.cost.usd)}`}{a.durationMs ? ` · ${mmss(a.durationMs)}` : ""}</Chip>
        </div>
        <Muted>Lecture déduite des photos, à confirmer sur place. Touche un repère (o2, t1…) pour afficher le fait qui la fonde ; touche une photo pour l'agrandir avec ses repères.</Muted>
        {onCopy && <button style={{...btn(C.accent),marginTop:10}} onClick={onCopy}>Copier le compte rendu</button>}
      </Card>

      {L.lecture.length > 0 && (
        <Card title="Lecture du spot">
          {L.lecture.map((x, i) => <Item key={i} a={a} refs={x.refs} onPhoto={onPhoto} tag={<b style={{color:C.strong}}>{x.titre} <span style={{fontSize:12,color:NATURE[x.nature]?.[1]}}>({NATURE[x.nature]?.[0]})</span> : </b>}>{x.texte}</Item>)}
        </Card>
      )}
      {L.postes.length > 0 && (
        <Card title="Postes" kicker="Où le bar a des raisons de se tenir">
          {L.postes.map((x, i) => (
            <Item key={i} a={a} refs={x.refs} onPhoto={onPhoto}>
              <b style={{color:C.good}}>P{i + 1}</b> <b style={{color:C.strong}}>{x.nom}</b> <span style={{fontSize:12.5,color:CONF[x.confiance]?.[1]}}>· confiance {CONF[x.confiance]?.[0]}</span>
              <div style={{color:C.muted,fontSize:13.5}}>{x.emplacement}</div>
              <div>{x.pourquoi}</div>
              {x.moment && <div style={{fontSize:13.5,color:C.muted}}>Moment : {x.moment}</div>}
            </Item>
          ))}
        </Card>
      )}
      {(L.approche.length > 0 || L.securite.length > 0) && (
        <Card title="Approche et sécurité">
          {L.approche.map((x, i) => <Item key={`a${i}`} a={a} refs={x.refs} onPhoto={onPhoto}>{x.texte}</Item>)}
          {L.securite.map((x, i) => <Item key={`s${i}`} a={a} refs={x.refs} onPhoto={onPhoto} tag={<span style={{color:"#fca5a5"}}>⚠ </span>}>{x.texte}</Item>)}
        </Card>
      )}
      {(L.accroche || L.leurres.length > 0) && (
        <Card title="Accroches et leurres">
          {L.accroche && <Item a={a} refs={L.accroche.refs} onPhoto={onPhoto} tag={<b style={{color:C.strong}}>Risque d'accroche : {L.accroche.niveau === "indetermine" ? "indéterminé" : L.accroche.niveau}. </b>}>{L.accroche.raison}</Item>}
          {L.leurres.map((x, i) => <Item key={i} a={a} refs={x.refs} onPhoto={onPhoto} tag={<b style={{color:C.strong}}>{FAMILLES[x.famille]?.court} : </b>}>{x.pourquoi}</Item>)}
          <Muted>Le détail (couleur, taille, montage) selon la marée et la météo du jour est dans l'onglet Leurres.</Muted>
        </Card>
      )}
      {L.fiche.length > 0 && (
        <Card title="Photos et fiche du guide" kicker="Ce qui confirme ou contredit la fiche">
          {L.fiche.map((x, i) => (
            <Item key={i} a={a} refs={x.refs} onPhoto={onPhoto} tag={<b style={{color:x.accord === "accord" ? C.good : x.accord === "desaccord" ? C.bad : C.warn}}>{x.accord === "accord" ? "✓ " : x.accord === "desaccord" ? "✗ " : "? "}{x.point} : </b>}>
              <span style={{color:C.muted}}>fiche : {x.fiche_dit}</span> · photos : {x.photos_montrent}
            </Item>
          ))}
        </Card>
      )}
      {g && <Proposals a={a} g={g} onPhoto={onPhoto}/>}
      {(L.aVerifier.length > 0 || a.nonVisible.length > 0) && (
        <Card title="À vérifier sur place">
          <ul style={{margin:0,paddingLeft:18,listStyle:"disc"}}>{L.aVerifier.map((x, i) => <li key={i} style={{fontSize:14.5,lineHeight:1.55,marginBottom:4}}>{x}</li>)}</ul>
          {a.nonVisible.length > 0 && <>
            <div style={{fontSize:13,fontWeight:700,color:C.muted,marginTop:L.aVerifier.length ? 10 : 0}}>Ce que les photos ne disent pas</div>
            <ul style={{margin:"4px 0 0",paddingLeft:18,listStyle:"disc"}}>{a.nonVisible.map((x, i) => <li key={i} style={{fontSize:14,lineHeight:1.55,marginBottom:4,color:C.text}}>{x}</li>)}</ul>
          </>}
        </Card>
      )}

      <Disclosure title="Tous les faits" sub={`${plural(a.observations.length, "observation")} · ${plural(a.tFacts.length, "fait calculé")} · ${plural(a.fFacts.length, "point")} de la fiche${a.uFacts.length ? " · tes notes" : ""}`}>
        {a.photos.map((p, i) => (
          <div key={i} style={{marginTop:i ? 12 : 0}}>
            <div style={{fontSize:13.5,color:C.muted,lineHeight:1.5}}><b style={{color:C.strong}}>Photo {i + 1}</b>{a.views?.[i] ? ` · ${a.views[i].vue} · qualité ${a.views[i].qualite}${a.views[i].limites ? ` · ${a.views[i].limites}` : ""}` : ""}</div>
            {a.observations.filter((o) => o.photo === i + 1).map((o) => <FactLine key={o.id} a={a} id={o.id} onPhoto={onPhoto}/>)}
          </div>
        ))}
        {[...a.tFacts, ...a.fFacts, ...a.uFacts].map((f) => <FactLine key={f.id} a={a} id={f.id} onPhoto={onPhoto}/>)}
      </Disclosure>
      {(a.removed.length > 0 || a.dropped.length > 0) && (
        <Disclosure title="Écarté" sub={`${plural(a.removed.length, "observation")} non retrouvée${a.removed.length > 1 ? "s" : ""} sur les photos · ${plural(a.dropped.length, "élément")} sans fait pour le fonder`}>
          {a.removed.map((o) => <div key={o.id} style={{fontSize:13.5,lineHeight:1.5,padding:"5px 0",color:C.muted}}><s>photo {o.photo} · {o.zone} · {o.fait}</s>{o.raison ? ` — ${o.raison}` : ""}</div>)}
          {a.dropped.map((x, i) => <div key={i} style={{fontSize:13.5,lineHeight:1.5,padding:"5px 0",color:C.muted}}><s>{x.section} : {x.texte}</s> — aucun fait valable cité{x.refs?.length ? ` (${x.refs.join(", ")})` : ""}</div>)}
        </Disclosure>
      )}
    </Stack>
  );
}

// ── Analyse en cours : ce qui est déjà acquis s'affiche passe après passe ──
function JobPanel({ job, cfg, spots }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { if (job.status !== "running") return undefined; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [job.status]);
  const P = job.partial || {};
  const next = nextPass(P);
  const spent = costOf(job.model, P.usages || []);
  const inv = P.inv, ver = P.ver;
  const obs = ver ? [...ver.kept, ...ver.removed].sort((x, y) => +x.id.slice(1) - +y.id.slice(1)) : inv?.observations || [];
  const running = job.status === "running";
  return (
    <Card tone={running ? C.accent : C.warn} kicker={running ? `Analyse en cours · ${mmss(now - job.startedAt)}` : "Analyse interrompue"} title={running ? `Passe ${job.step} sur 3` : `Arrêtée avant la passe ${next} sur 3`}>
      <div role="status" aria-live="polite">
        {PASSES.map((s) => {
          const done = s.n < (running ? job.step : next), cur = running && s.n === job.step;
          return (
            <div key={s.n} style={{display:"flex",gap:8,fontSize:14,lineHeight:1.8,color:done ? C.good : cur ? C.strong : C.faint}}>
              <span style={{width:18}}>{done ? "✓" : cur ? "…" : "○"}</span>
              <span style={{flex:1}}>{s.n}. {s.label}</span>
              <span style={{fontVariantNumeric:"tabular-nums",color:C.muted}}>{done && job.stepTimes?.[s.n] ? mmss(job.stepTimes[s.n]) : cur ? mmss(now - job.stepAt) : ""}</span>
            </div>
          );
        })}
      </div>
      {running && <Muted>Tu peux changer d'onglet : l'analyse continue, et un bandeau te prévient quand elle est prête. Chaque passe terminée est gardée.</Muted>}
      {!running && (
        <div style={{marginTop:8}}>
          <Alert tone={job.status === "error" ? C.bad : C.warn} role="alert">{job.error}{spent.usd > 0 ? ` Déjà facturé : ${usd(spent.usd)} (passes terminées, gardées).` : ""}</Alert>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
            <button style={btn(C.good, true)} disabled={!cfg?.key} onClick={() => resumeJob({ ...cfg, spots })}>Reprendre à la passe {next}</button>
            <button style={btn(C.muted)} onClick={() => dropJob()}>Abandonner</button>
          </div>
        </div>
      )}
      {running && <button style={{...btn(C.muted),marginTop:10}} onClick={() => cancelJob()}>Arrêter</button>}

      {inv && (
        <div style={{marginTop:14}}>
          <div style={{fontSize:13.5,fontWeight:700,color:C.strong}}>{ver ? "Inventaire vérifié" : "Inventaire, pas encore vérifié"}</div>
          <div style={{display:"flex",gap:6,overflowX:"auto",margin:"8px 0"}}>
            {job.photos.map((p, i) => (
              <div key={i} style={{flex:"0 0 auto",width:104,position:"relative"}}>
                <Marked src={p.thumb} alt={`Photo ${i + 1}`} obs={obs.filter((o) => o.photo === i + 1 && o.x != null && o.statut !== "absent")}/>
                <span style={{position:"absolute",left:4,bottom:4,padding:"1px 6px",borderRadius:6,background:"rgba(2,12,24,0.8)",color:"#fff",fontSize:12,fontWeight:700,lineHeight:1.5}}>{i + 1}</span>
              </div>
            ))}
          </div>
          {obs.map((o) => (
            <div key={o.id} style={{fontSize:13.5,lineHeight:1.5,padding:"4px 0",color:o.statut === "absent" ? C.faint : C.text}}>
              <b style={{color:C.strong}}>{o.id}</b> · <span style={{color:C.muted}}>photo {o.photo}, {o.zone} · </span>
              {o.statut === "absent" ? <s>{o.fait}</s> : o.fait}
              <span style={{fontSize:12,fontWeight:700,color:!o.statut ? C.faint : o.statut === "confirme" ? C.good : o.statut === "douteux" ? C.warn : C.faint}}>
                {!o.statut ? " · à vérifier" : o.statut === "confirme" ? " ✓ confirmé" : o.statut === "douteux" ? " ? incertain" : " ✗ écarté"}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Onglet ──
export function Photos({ g }) {
  const ph = usePhotoState();
  const [cfg, setCfgState] = useState(() => lsGet(CLAUDE_CFG_KEY));
  const setCfg = (c) => { setCfgState(c); lsSet(CLAUDE_CFG_KEY, c); };
  const [prepErr, setPrepErr] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);
  const resultRef = useRef(null);
  useEffect(() => { loadPhotoState(); }, []);
  // Un résultat arrivé pendant qu'on était ailleurs : on le montre et on retire le bandeau.
  useEffect(() => { if (ph.unseen && ph.result) { markSeen(); setTimeout(() => resultRef.current?.scrollIntoView({ block: "start" }), 50); } }, [ph.unseen, ph.result]);

  const D = ph.draft;
  const spotId = D.spotId || g.activeSpot?.id || allSpots()[0].id;
  const spot = spotId === OTHER ? null : (g.spotsView || allSpots()).find((s) => s.id === spotId) || null;
  const photos = D.photos;
  const gpsHint = useMemo(() => {
    const p = photos.find((x) => x.exif?.lat != null);
    if (!p) return null;
    const n = nearestSpot(p.exif.lat, p.exif.lon);
    return n ? { ...n, photo: photos.indexOf(p) + 1 } : null;
  }, [photos]);
  const manualMs = parisInputMs(D.manual);   // heure de Paris, quel que soit le fuseau de l'appareil
  const effPhotos = photos.map((p) => (Number.isFinite(manualMs) && !hasExifTime(p) ? { ...p, when: { ms: manualMs, source: "saisie", note: "heure saisie par toi" } } : p));
  const needsTime = photos.some((p) => !hasExifTime(p));

  const addFiles = async (files) => {
    setPrepErr(null); setPreparing(true);
    const list = [...files].slice(0, Math.max(0, PHOTO.maxPhotos - photos.length));
    const out = [];
    for (const f of list) {
      if (!/^image\//.test(f.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(f.name)) { setPrepErr(`${f.name} n'est pas une image.`); continue; }
      try { out.push(await preparePhoto(f)); } catch (e) { setPrepErr(e.message); }
    }
    if (files.length > list.length) setPrepErr(`${PHOTO.maxPhotos} photos au plus par analyse.`);
    setDraft((d) => ({ photos: [...d.photos, ...out] })); setPreparing(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const model = cfg?.model || DEFAULT_MODEL;
  const est = useMemo(() => {
    if (!photos.length) return null;
    const vt = photos.reduce((s, p) => s + visualTokens(p), 0);
    const P = CLAUDE_MODELS[model];
    const tin = 2 * vt + 9000;
    return { lo: (tin * P.in + 6000 * P.out) / 1e6, hi: (tin * P.in + 24000 * P.out) / 1e6 };
  }, [photos, model]);
  const job = ph.job;
  const busy = job?.status === "running";
  const launch = () => { setCopied(false); startJob({ key: cfg.key, model, spots: g.spotsView }, { spotId: spot?.id || null, photos: effPhotos, notes: D.notes }); };
  const copy = async (a) => { try { await navigator.clipboard.writeText(reportText(a)); setCopied(true); } catch { setCopied(false); } };

  return (
    <Stack>
      {!job && !ph.result && (
        <Card title="Analyse photo d'un spot" kicker="Méthode en trois passes">
          {[["Inventaire", "ce qui est visible, photo par photo et zone par zone, sans interprétation."],
            ["Vérification", "un second examen, indépendant, retire ce qui n'est pas sur les photos."],
            ["Lecture du pêcheur", "courant, structures, postes, approche, sécurité, accroches, leurres. Chaque élément cite ses faits ; l'appli écarte ceux qui n'en citent pas."]].map(([k, v], i) => (
            <div key={k} style={{display:"flex",gap:8,fontSize:14.5,lineHeight:1.55,color:C.text,marginTop:i ? 6 : 0}}>
              <b style={{color:C.accent,flexShrink:0}}>{i + 1}.</b><span><b>{k}</b> : {v}</span>
            </div>
          ))}
          <Muted>La marée et la lumière au moment de la photo sont calculées par l'appli à partir de la date de prise de vue, pas devinées. Rien ne remplace un repérage sur place : la profondeur et le fond sous l'eau ne se voient pas sur une photo.</Muted>
        </Card>
      )}

      {!cfg?.key && !busy && <SubscriptionCard g={g}/>}
      {!cfg?.key && <KeyCard cfg={cfg} setCfg={setCfg}/>}
      {job && <JobPanel job={job} cfg={cfg} spots={g.spotsView}/>}

      <div ref={resultRef} style={{scrollMarginTop:110}}/>
      {ph.result && !job && <AnalysisView a={ph.result} g={g} onCopy={() => copy(ph.result)}/>}
      {copied && <Alert tone={C.good}>Compte rendu copié.</Alert>}

      {cfg?.key && !busy && (
        <Card title={ph.result ? "Analyser d'autres photos" : "Nouvelle analyse"}>
          <label style={{display:"block",fontSize:13.5,color:C.muted}}>Spot
            <select aria-label="Spot analysé" style={{...inp,marginTop:4}} value={spotId} onChange={(e) => setDraft({ spotId: e.target.value })}>
              {allSpots().map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              <option value={OTHER}>Autre spot, hors du guide</option>
            </select>
          </label>
          {gpsHint && (
            <div style={{marginTop:8,fontSize:13.5,color:C.muted,lineHeight:1.5}}>
              📍 Photo {gpsHint.photo} prise à {fr(gpsHint.km)} km du spot le plus proche : <b style={{color:C.strong}}>{gpsHint.spot.name}</b>.
              {gpsHint.spot.id !== spotId && gpsHint.km <= 3 && <button style={{...btn(C.accent),minHeight:36,marginLeft:8}} onClick={() => setDraft({ spotId: gpsHint.spot.id })}>Choisir ce spot</button>}
              {gpsHint.km > 3 && " Loin des spots du guide : vérifie le spot choisi."}
            </div>
          )}
          <div style={{marginTop:12}}>
            <input ref={fileRef} type="file" accept="image/*" multiple aria-label="Photos du spot" style={{display:"none"}} onChange={(e) => addFiles(e.target.files)}/>
            <button style={btn(C.accent, true)} disabled={preparing || photos.length >= PHOTO.maxPhotos} onClick={() => fileRef.current?.click()}>
              {preparing ? "Préparation…" : photos.length ? "Ajouter des photos" : "Choisir ou prendre des photos"}
            </button>
            <span style={{fontSize:13,color:C.faint,marginLeft:10}}>{photos.length}/{PHOTO.maxPhotos}</span>
          </div>
          {!photos.length && <Muted>Conseil : une vue d'ensemble prise de haut, puis des vues plus serrées des zones qui t'intéressent (pointe, veine, bordure).</Muted>}
          {prepErr && <div style={{marginTop:8}}><Alert tone={C.warn}>{prepErr}</Alert></div>}
          {photos.length > 0 && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8,marginTop:10}}>
              {photos.map((p, i) => (
                <div key={i} style={{position:"relative",fontSize:12.5,color:C.muted,lineHeight:1.4}}>
                  <img src={p.thumb} alt={`Photo ${i + 1}`} style={{width:"100%",borderRadius:8,display:"block"}}/>
                  <button aria-label={`Retirer la photo ${i + 1}`} onClick={() => setDraft((d) => ({ photos: d.photos.filter((_, j) => j !== i) }))}
                    style={{position:"absolute",top:4,right:4,width:36,height:36,borderRadius:999,border:"none",background:"rgba(2,12,24,0.8)",color:"#fff",fontSize:16,cursor:"pointer"}}>✕</button>
                  <div style={{marginTop:3}}><b style={{color:C.strong}}>Photo {i + 1}</b> · {Number.isFinite(effPhotos[i].when.ms) ? photoDateLabel(effPhotos[i].when.ms) : "heure inconnue"}</div>
                  <div>{effPhotos[i].when.note}{p.exif?.lat != null ? " · position GPS lue" : ""}</div>
                </div>
              ))}
            </div>
          )}
          {needsTime && (
            <label style={{display:"block",marginTop:10,fontSize:13.5,color:C.muted}}>Heure de prise de vue des photos sans date d'appareil photo (pour la marée)
              <input type="datetime-local" style={{...inp,marginTop:4}} value={D.manual} onChange={(e) => setDraft({ manual: e.target.value })}/>
            </label>
          )}
          <label style={{display:"block",marginTop:10,fontSize:13.5,color:C.muted}}>Ce que tu sais du spot (facultatif : profondeur, fond, courant, prises…)
            <textarea style={{...inp,minHeight:70,marginTop:4,fontFamily:"inherit"}} value={D.notes} onChange={(e) => setDraft({ notes: e.target.value })}/>
          </label>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginTop:12}}>
            <button style={btn(C.good, true)} disabled={!photos.length || !!job} onClick={launch}>Analyser</button>
            {est && <span style={{fontSize:13.5,color:C.muted}}>coût estimé : {usd(est.lo)} à {usd(est.hi)} ({CLAUDE_MODELS[model].label.split(" —")[0]})</span>}
          </div>
          {job && !busy && <Muted>Une analyse interrompue attend plus haut : reprends-la ou abandonne-la avant d'en lancer une autre.</Muted>}
        </Card>
      )}

      {ph.history.length > 0 && (
        <Card title="Analyses enregistrées" kicker="Sur cet appareil, les six dernières">
          {ph.history.map((a, i) => (
            <div key={a.id} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderTop:i ? `1px solid ${C.line2}` : "none"}}>
              {a.photos[0]?.thumb && <img src={a.photos[0].thumb} alt="" style={{width:56,height:42,objectFit:"cover",borderRadius:6,flexShrink:0}}/>}
              <button onClick={() => { showAnalysis(a); setCopied(false); setTimeout(() => resultRef.current?.scrollIntoView({ block: "start" }), 50); }}
                style={{flex:1,minHeight:44,textAlign:"left",background:"none",border:"none",color:C.text,cursor:"pointer",padding:0,fontSize:14.5}}>
                <b style={{color:C.strong}}>{a.spotName}</b><br/><span style={{fontSize:13,color:C.muted}}>{a.dateLabel} · {plural(a.photos.length, "photo")} · {a.via === VIA_ABONNEMENT ? "abonnement" : usd(a.cost.usd)}</span>
              </button>
              <button aria-label={`Supprimer l'analyse ${a.spotName}`} onClick={() => deleteAnalysis(a.id)}
                style={{minWidth:44,minHeight:44,background:"none",border:"none",color:C.faint,fontSize:16,cursor:"pointer"}}>✕</button>
            </div>
          ))}
        </Card>
      )}

      {cfg?.key && !busy && <SubscriptionCard g={g} open={false}/>}
      {cfg?.key && <Disclosure title="Clé API et modèle" sub={`${CLAUDE_MODELS[model]?.label.split(" —")[0]} · clé …${cfg.key.slice(-4)}`}><KeyCard cfg={cfg} setCfg={setCfg}/></Disclosure>}
    </Stack>
  );
}
