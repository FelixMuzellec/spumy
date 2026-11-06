// Fiche d'un spot, en quatre sous-onglets : Créneaux, Terrain, Leurres, Accès.
import { useState } from "react";
import { deNom } from "../../engine/photo.js";
import { SITE } from "SITE_CONFIG";
import { allSpots, MYSPOT_COLOR } from "../../engine/myspots.js";
import { MySpotForm } from "../MySpotForm.jsx";
import { guideCenter, guideResolver } from "../myspotCtx.js";
import { DEPTH_CLASS, FAMILLES, lureAdvice } from "../../engine/lures.js";
import { securityFor } from "../../engine/rules.js";
import { safetyOf } from "../../engine/safety.js";
import { SafetyPanel } from "../Indicators.jsx";
import { localDecimal } from "../../engine/tide.js";
import { DayStrip, Pill, ScoreRing, TerrainBlock, TopoBlock, WindowRow } from "../components.jsx";
import { keyFactors } from "../../engine/model.js";
import { conditionLabel, WhyWatch } from "../Decision.jsx";
import { Icon } from "../icons.jsx";
import { Alert, C, Disclosure, GoLink, Muted, Stack, SubTabs, fr } from "../kit.jsx";
import { Orientation } from "../Orientation.jsx";
// Une adresse web citée dans une source devient un lien.
const linkify = (txt) => String(txt).split(/(https?:\/\/[^\s)]+)/).map((p, i) => (i % 2
  ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" style={{textDecoration:"underline",wordBreak:"break-all"}}>lien</a> : p));

const DANGER = ["", ["Facile", C.good], ["Modéré", C.warn], ["Engagé", C.bad]];

function Creneaux({ g, spot }) {
  // v8.12 : les créneaux déjà finis ne sont plus affichés (ils étaient barrés) ; la frise du jour reste complète.
  const day = spot.windows.filter((w) => Math.abs(w.offsetBefore) < 50);
  const shown = day.filter((w) => !w.past);
  const gone = day.length - shown.length;
  const restricted = g.hours.from > 0 || g.hours.to < 24;
  return (
    <Stack gap={10}>
      <div style={{padding:"10px 10px 6px",background:C.card2,border:`1px solid ${C.line}`,borderRadius:12}}>
        <div style={{fontSize:14,fontWeight:700,color:C.strong,marginBottom:4}}>La journée sur ce spot</div>
        <DayStrip spot={spot} date={g.selectedDate} live={g.live} tide={g.tideFor(spot.tidePort)} sun={g.sun} hours={g.hours} nowDec={Number.isFinite(g.nowMs) ? localDecimal(g.nowMs, g.selectedDate) : null}/>
        <div style={{fontSize:12.5,color:C.muted,marginTop:4,lineHeight:1.5}}>En haut : nuit, basse lumière (violet), jour. Courbe : marée du port du spot. Bandes : créneaux notés{restricted ? " (assombri : hors de tes heures)" : ""}. Flèches : vent toutes les 3 heures, pointées vers où il souffle (le texte donne d'où il vient). Trait blanc : maintenant.</div>
      </div>
      {shown.map((w, i) => <WindowRow key={`${w.id}-${i}`} w={w} lure={g.live && w.eligible ? lureAdvice(spot, w, g.live, g.selectedDate, g.lureCtx).summary : null}/>)}
      {!day.length && <Muted>Données de marée manquantes.</Muted>}
      {day.length > 0 && !shown.length && (
        <div style={{padding:"12px 13px",background:C.card2,border:`1px solid ${C.line}`,borderRadius:12}}>
          <div style={{fontSize:14.5,color:C.text,lineHeight:1.5}}>Tous les créneaux d'aujourd'hui sur ce spot sont passés.</div>
          <GoLink onClick={() => g.pickDate(g.isoAddDays(g.todayISO, 1))}>Voir demain</GoLink>
        </div>
      )}
      {gone > 0 && shown.length > 0 && <Muted style={{marginTop:0}}>{gone === 1 ? "1 créneau déjà passé aujourd'hui n'est plus affiché." : `${gone} créneaux déjà passés aujourd'hui ne sont plus affichés.`}</Muted>}
      <Disclosure title="Conseil et règle de marée du spot" sub={spot.tidalRules.typeHeure}>
        <p style={{margin:0,fontSize:14,color:C.text,lineHeight:1.6}}>{spot.tidalRules.montantOuDescendant}</p>
        <p style={{margin:"8px 0 0",fontSize:14,color:C.text,lineHeight:1.6}}>💡 {spot.tidalRules.lifeHack}</p>
        <p style={{margin:"8px 0 0",fontSize:14,color:C.muted,lineHeight:1.6}}>{spot.tidalRules.description}</p>
      </Disclosure>
    </Stack>
  );
}

/** Profondeur où tu pêches : la fiche l'estime, toi tu la connais. Elle fixe la base du poids des têtes. */
function DepthEditor({ g, spot }) {
  const p = spot.terrain?.prof;
  const ov = g.terrainOverrides?.[spot.id]?.prof || null;
  const [m, setM] = useState(ov?.m ? String(ov.m).replace(".", ",") : "");
  const set = (v) => g.setTerrainOverride(spot.id, "prof", v, "toi");
  const cur = p?.m ? `${String(p.m).replace(".", ",")} m à mi-marée (donné par toi)` : DEPTH_CLASS[p?.cls]?.label || "non estimée";
  const btn = (on) => ({ minHeight:40, padding:"0 12px", borderRadius:999, border:`1px solid ${on ? C.accent : C.line}`, background:on ? `${C.accent}26` : "none", color:on ? C.strong : C.text, fontSize:13.5, fontWeight:600, cursor:"pointer" });
  return (
    <div style={{padding:"12px 13px",background:C.card2,border:`1px solid ${C.line}`,borderRadius:12}}>
      <div style={{fontSize:15,fontWeight:700,color:C.strong}}>Profondeur où tu pêches</div>
      <div style={{fontSize:14,color:C.text,marginTop:4}}>{cur}{!ov && p?.why ? <span style={{color:C.muted}}> — estimée d'après la fiche : {p.why}</span> : null}</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
        {Object.entries(DEPTH_CLASS).map(([k, d]) => <button key={k} style={btn(!ov?.m && (ov?.cls || null) === k)} onClick={() => { setM(""); set({ cls: k }); }}>{d.label.replace(/ \(.*\)/, "")}</button>)}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginTop:8,flexWrap:"wrap"}}>
        <label style={{fontSize:14,color:C.muted}}>ou environ
          <input aria-label="Profondeur en mètres à mi-marée" inputMode="decimal" value={m} onChange={(e) => setM(e.target.value.replace(/[^\d.,]/g, ""))} placeholder="3"
            style={{width:70,margin:"0 6px",background:C.card,color:C.text,border:`1px solid ${C.line}`,borderRadius:8,padding:"8px",fontSize:15,minHeight:40}}/> m à mi-marée
        </label>
        <button style={btn(false)} onClick={() => { const v = parseFloat(m.replace(",", ".")); if (Number.isFinite(v) && v > 0 && v < 100) set({ m: v }); }}>Enregistrer</button>
        {ov && <button style={{...btn(false),color:C.muted}} onClick={() => { setM(""); set(null); }}>Revenir à l'estimation</button>}
      </div>
      <div style={{fontSize:12.5,color:C.muted,marginTop:6}}>Elle fixe le poids des têtes conseillé (1 g par mètre sans vent ni courant ; la marée du créneau l'ajuste).</div>
    </div>
  );
}

function Terrain({ g, spot }) {
  return (
    <Stack gap={10}>
      <TerrainBlock spot={spot}/>
      <DepthEditor g={g} spot={spot}/>
      <Orientation spot={spot} base={allSpots().find((s) => s.id === spot.id) || spot} orient={g.orient} onChange={g.setOrient}/>
      <TopoBlock title="Fond" data={spot.topology.fond}/>
      <TopoBlock title="Structure et comportement" data={spot.topology.structure}/>
      <TopoBlock title="Courant" data={spot.topology.courant}/>
      <TopoBlock title="Exposition" data={spot.topology.exposition}/>
      <TopoBlock title="Population" data={spot.topology.bars}/>
      <Disclosure title="Sources utilisées pour ce spot">
        <ul style={{margin:0,paddingLeft:18,fontSize:13,color:C.muted,lineHeight:1.7,listStyle:"disc"}}>
          {spot.sources.map((s, i) => <li key={i}>{linkify(s)}</li>)}
        </ul>
      </Disclosure>
    </Stack>
  );
}

function LeurresSpot({ g, spot }) {
  const w = (spot.windows || []).find((x) => x.id === spot.bestWindowId) || spot.windows?.[0];
  const a = lureAdvice(spot, w, g.live, g.selectedDate, g.lureCtx);
  return (
    <Stack gap={10}>
      <div style={{padding:"12px 13px",background:C.card2,border:`1px solid ${C.accent}55`,borderRadius:12}}>
        <div style={{fontSize:13,color:C.accent,fontWeight:600}}>Dans ta boîte, pour le meilleur créneau{w ? ` (${w.startFmt} → ${w.endFmt})` : ""}</div>
        <div style={{fontSize:18,fontWeight:800,color:C.strong,marginTop:2}}>{a.pick ? a.pick.name : a.best.label}</div>
        <div style={{fontSize:14.5,marginTop:6,lineHeight:1.55}}>
          <div><span style={{color:C.muted}}>Poids · </span>{a.weight.text}</div>
          <div><span style={{color:C.muted}}>Couleur · </span>{a.pick ? a.pick.color.name : a.color.label}</div>
          <div><span style={{color:C.muted}}>Famille · </span>{a.best.label}</div>
        </div>
        <GoLink onClick={() => { g.setSpotId(spot.id); g.goTab("leurres"); }}>Conseil détaillé et sources</GoLink>
      </div>
      <div style={{fontSize:15,fontWeight:700,color:C.strong,margin:"4px 2px 0"}}>Leurres cités par la fiche (types, pas forcément dans ta boîte), classés pour aujourd'hui</div>
      {a.spotLures.map((l, i) => (
        <div key={i} style={{padding:"11px 13px",background:C.card2,border:`1px solid ${i === 0 && l.fit > 0 ? C.good + "66" : C.line}`,borderRadius:12}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <b style={{fontSize:15,color:C.strong}}>{l.name}</b>
            {i === 0 && l.fit > 0 && <Pill color={C.good}>En tête de la fiche aujourd'hui</Pill>}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",margin:"6px 0"}}>
            <Pill color={C.accent}>{FAMILLES[l.fam].court}</Pill><Pill color={C.muted}>{l.color}</Pill><Pill color={C.muted}>{l.weight}</Pill>
          </div>
          <p style={{margin:0,fontSize:14,color:C.muted,lineHeight:1.5}}>{l.technique}</p>
        </div>
      ))}
    </Stack>
  );
}

function Acces({ g, spot }) {
  const best = (spot.windows || []).find((w) => w.id === spot.bestWindowId);
  const rules = securityFor(spot, { coeff: g.coeff, window: best });
  const dg = DANGER[spot.dangerLevel];
  // v9.1 — État de sécurité du meilleur créneau du jour (les consignes de la fiche sont détaillées juste dessous).
  const safety = safetyOf(spot, best, { alerts: rules, degraded: !g.live });
  return (
    <Stack gap={10}>
      <div style={{marginTop:-10}}><SafetyPanel safety={safety} standing={false}/></div>
      <div style={{padding:"12px 13px",background:C.card2,border:`1px solid ${C.line}`,borderRadius:12}}>
        <div style={{fontSize:15,fontWeight:700,color:C.strong,marginBottom:5}}>Accès</div>
        <p style={{margin:0,fontSize:14.5,color:C.text,lineHeight:1.6}}>{spot.access}</p>
      </div>
      {rules.length > 0 && (
        <div style={{padding:"12px 13px",background:C.card2,border:`1px solid ${rules.some((r) => r.active) ? C.bad + "88" : C.line}`,borderRadius:12}}>
          <div style={{fontSize:15,fontWeight:700,color:C.strong,marginBottom:6}}>Sécurité sur ce spot</div>
          {rules.map((r, i) => (
            <div key={i} style={{fontSize:14,lineHeight:1.55,marginBottom:7,color:r.active ? "#fecaca" : C.text}}>
              {r.active ? <b>⚠ Aujourd'hui : </b> : r.conditional ? <span style={{color:C.muted}}>Si {r.when.coefAbove != null ? `coef > ${r.when.coefAbove}` : `marée ${r.when.phase}e`} : </span> : "• "}
              {r.t} <span style={{fontSize:12,color:C.faint,fontStyle:"italic"}}>— {r.s}</span>
            </div>
          ))}
        </div>
      )}
      {spot.dangerLevel === 3 && <Alert tone={C.bad}><b>Spot engagé — prudence du guide.</b> Ne pas pêcher seul. Gilet, téléphone étanche, itinéraire et heure de retour laissés à un proche. Respecter strictement les créneaux de marée ; plus proposé dès que la houle dépasse {String(spot.houleMax).replace(".", ",")} m.</Alert>}
      {spot.dangerLevel === 2 && <Alert><b>Spot modéré — prudence du guide.</b> Une sortie de repérage par conditions calmes avant une pêche en vive-eau ou au crépuscule.</Alert>}
      {dg && <Muted>Difficulté : {dg[0]}.</Muted>}
    </Stack>
  );
}

// v8.11 — Ton spot : modifier ou supprimer (confirmation dans la page ; ton journal garde ses sessions).
function MineBar({ g, spot, onEdit }) {
  const [ask, setAsk] = useState(false);
  const b = (color, solid) => ({ minHeight: 44, padding: "0 14px", borderRadius: 10, border: `1px solid ${color}`, background: solid ? `${color}26` : "none", color: solid ? C.strong : color, fontSize: 14.5, fontWeight: 700, cursor: "pointer" });
  return (
    <div style={{marginTop:11,padding:"10px 12px",borderRadius:12,border:`1px solid ${MYSPOT_COLOR}66`,background:`${MYSPOT_COLOR}12`}}>
      <div style={{fontSize:13.5,color:C.text,lineHeight:1.5}}>Spot ajouté par toi : marée du port de {SITE.tide.ports[spot.tidePort]?.label || spot.tidePort}, créneaux {/règle générale/.test(spot.tidalRules.windows[0]?.label || "") ? "de la règle générale" : "de ton expérience"}.</div>
      {!ask ? (
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
          <button onClick={onEdit} style={b(MYSPOT_COLOR, true)}>Modifier ce spot</button>
          <button onClick={() => setAsk(true)} style={b(C.bad, false)}>Supprimer</button>
        </div>
      ) : (
        <div role="alert" style={{marginTop:8}}>
          <div style={{fontSize:14,color:C.strong,fontWeight:700}}>Supprimer « {spot.name} » ? Les sessions de ton journal sont gardées.</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
            <button onClick={() => g.deleteMySpot(spot.id)} style={b(C.bad, true)}>Oui, supprimer</button>
            <button onClick={() => setAsk(false)} style={b(C.muted, false)}>Non</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SpotDetail({ g, spot, detailRef }) {
  const [sub, setSub] = useState("creneaux");
  const [editing, setEditing] = useState(false);
  const dg = DANGER[spot.dangerLevel];
  const today = g.selectedDate === g.todayISO;
  const here = g.session?.spotId === spot.id;
  const best = (spot.windows || []).find((w) => w.id === spot.bestWindowId) || null;
  return (
    <div ref={detailRef} style={{scrollMarginTop:`calc(${g.session ? 112 : 60}px + env(safe-area-inset-top))`,background:C.card,border:`1px solid ${spot.color}55`,borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"15px 15px 12px",background:`linear-gradient(160deg,${spot.color}18 0%,transparent 60%)`}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
            <ScoreRing score={spot.eligible ? spot.score : null} size={84}/>
            {spot.eligible && <span style={{fontSize:11.5,fontWeight:700,color:C.muted,maxWidth:96,textAlign:"center",lineHeight:1.2}}>{conditionLabel(spot.score)}</span>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <h2 style={{margin:0,fontSize:21,fontWeight:800,color:C.strong,lineHeight:1.15}}>{spot.name}</h2>
            <div style={{fontSize:13.5,color:C.muted,marginTop:3}}>{spot.subtitle} · {spot.distance}{/^sur place/.test(spot.distance || "") ? "" : ` ${deNom(SITE.name)}`}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:7}}>
              <Pill color={spot.color}>{spot.type}</Pill>
              {dg && <Pill color={dg[1]}>{dg[0]}</Pill>}
              {spot.isLocal && <Pill color={C.good}>Local</Pill>}
              {spot.custom && <Pill color={MYSPOT_COLOR}>Ton spot</Pill>}
              {g.regZones?.length > 1 && (() => { const rz = g.regFor(spot); return <Pill color={rz.noKill ? C.warn : C.accent} title={rz.zoneLabel}>⚖ {rz.zoneKey === "sud" ? "Sud" : "Nord"} du 48e : {rz.noKill ? "no-kill" : `${rz.quota} bars/j`}</Pill>; })()}
              {spot.orientSource && <Pill color={C.violet} title="Orientation confirmée ou corrigée sur place">Orientation {spot.orientSource === "confirmé" ? "confirmée" : "corrigée"}</Pill>}
            </div>
          </div>
        </div>
        {!spot.eligible && spot.wxReason && <div style={{marginTop:9}}><Alert tone={C.bad}>{spot.wxReason}</Alert></div>}
        {spot.eligible && spot.wxReason && <Muted style={{color:C.text}}>{spot.wxReason}</Muted>}
        {spot.eligible && best && (
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:12,padding:"10px 12px",borderRadius:12,background:C.card2,border:`1px solid ${C.line}`}}>
            <span style={{color:"#7dd3fc"}}><Icon name="horloge" size={22}/></span>
            <span style={{flex:1,minWidth:0}}>
              <span style={{display:"block",fontSize:12.5,fontWeight:700,color:C.muted}}>Meilleure fenêtre</span>
              <span style={{display:"block",fontSize:18,fontWeight:800,color:C.strong,fontVariantNumeric:"tabular-nums"}}>{best.startFmt} → {best.endFmt}</span>
              {best.light?.label && <span style={{display:"block",fontSize:13,color:C.muted}}>{best.light.label}{best.coeff != null ? ` · coef ${best.coeff}` : ""}</span>}
            </span>
          </div>
        )}
        {spot.eligible && best && <WhyWatch factors={keyFactors(best.parts)}/>}
        {spot.zw?.fromSpot && (
          <div style={{fontSize:14,color:"#7dd3fc",marginTop:8}}>Ici (6 h-22 h) : 🌬 {spot.zw.wind_dir} {spot.zw.wind_kmh} km/h{spot.zw.gust_kmh != null ? ` · raf. ${spot.zw.gust_kmh}` : ""} · 🌊 {spot.zw.houleKnown ? `${fr(spot.zw.houle)} m` : "houle inconnue"}</div>
        )}
        <Muted><b style={{color:C.text}}>Exposition :</b> {spot.weatherNote}</Muted>
        {spot.custom && !editing && <MineBar g={g} spot={spot} onEdit={() => setEditing(true)}/>}
        {spot.custom && editing && (
          <div style={{marginTop:11,padding:"12px",borderRadius:12,border:`1px solid ${MYSPOT_COLOR}66`,background:C.card2}}>
            <MySpotForm initial={spot.mine} resolve={guideResolver((g.myRecords || []).filter((r) => !r.deleted).length)} center={guideCenter}
              onCancel={() => setEditing(false)} onSave={(rec, ctx) => { setEditing(false); g.saveMySpot(rec, ctx); }}/>
          </div>
        )}
        {spot.eligible && best && (
          <button onClick={() => g.goLure(spot.id, spot.bestWindowId)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:12,width:"100%",minHeight:48,borderRadius:10,border:"none",background:"#0ea5e9",color:"#03111f",fontSize:15.5,fontWeight:800,cursor:"pointer"}}>
            <Icon name="materiel" size={20} stroke={2}/>Voir la stratégie
          </button>
        )}
        {today && (
          <button onClick={() => g.startSession(spot.id)} disabled={here} style={{marginTop:11,width:"100%",minHeight:48,padding:"11px",borderRadius:10,border:`1px solid ${C.violet}`,background:here ? `${C.violet}10` : `${C.violet}26`,color:here ? C.violet : "#ede9fe",fontSize:15,fontWeight:700,cursor:here ? "default" : "pointer"}}>
            {here ? "🎣 Session en cours ici" : "🎣 Je pêche ici maintenant"}
          </button>
        )}
      </div>
      <div style={{padding:"0 12px 12px"}}>
        <SubTabs tabs={[["creneaux", "Créneaux"], ["terrain", "Terrain"], ["leurres", "Leurres"], ["acces", "Accès"]]} value={sub} onChange={setSub}/>
        <div style={{marginTop:12}}>
          {sub === "creneaux" && <Creneaux g={g} spot={spot}/>}
          {sub === "terrain" && <Terrain g={g} spot={spot}/>}
          {sub === "leurres" && <LeurresSpot g={g} spot={spot}/>}
          {sub === "acces" && <Acces g={g} spot={spot}/>}
        </div>
      </div>
    </div>
  );
}
