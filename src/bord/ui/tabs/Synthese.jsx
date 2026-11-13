// Synthèse : la réponse (où, quand, avec quoi), puis les conditions du jour en
// six tuiles. Chaque tuile ouvre l'onglet qui détaille ce paramètre.
import { SITE } from "SITE_CONFIG";
import { fmtH } from "../../../core/core.js";
import { windSide } from "../../engine/lures.js";
import { GOOD_SCORE, keyFactors, TIE_DELTA, tieGroup } from "../../engine/model.js";
import { regulationForZone } from "../../../core/rules.js";
import { localDecimal, tideNow } from "../../../core/tide.js";
import { fmtLeft, ModelSpread, parisHHMM } from "../components.jsx";
import { Loader, Pill, ScoreRing } from "../../../design/components.jsx";
import { Alert, C, Card, Chip, GoLink, Grid, Muted, Stack, Tile, fr, num, scoreColor } from "../../../design/kit.jsx";
import { ConfidencePanel, SafetyPanel } from "../Indicators.jsx";
import { CompareCard, conditionLabel, DecisionHero, WhyWatch } from "../Decision.jsx";
import { Icon } from "../../../design/icons.jsx";

export { TIE_DELTA };
const TREND = { falling_fast: "chute rapide", falling: "en baisse", stable: "stable", rising: "en hausse", rising_fast: "hausse rapide" };
const SIDE = { face: "de face pour ce poste", dos: "de dos pour ce poste", travers: "de travers pour ce poste" };
const LIGHT_ICON = { aube: "🌅", crepuscule: "🌅", nuit: "🌙", jour: "☀" };
// v8.9 : les trois niveaux de la fiche, mêmes mots partout (verdict, fiche, accès).
export const DANGER_LABEL = { 1: "Facile", 2: "Modéré", 3: "Engagé" };
/** Où en est le créneau par rapport à maintenant (aujourd'hui seulement). */
export function windowTiming(w, nowMs, dateISO) {
  if (!w || !Number.isFinite(nowMs)) return null;
  if (w.ongoing) return { t: `En cours · encore ${fmtLeft(w.remainingH)}`, col: C.good };
  const now = localDecimal(nowMs, dateISO);
  if (w.startDecimal > now) return { t: `Dans ${fmtLeft(w.startDecimal - now)}`, col: C.accent };
  return null;
}

function VerdictCard({ g, degraded }) {
  const { s, w } = g.verdict;
  // Égalité : tous les spots à 0,2 point ou moins du premier, et le plus proche d'entre eux.
  const tied = tieGroup(g.allScored);
  const nearest = tied.length ? [...tied].sort((a, b) => (a.distMin ?? 999) - (b.distMin ?? 999))[0] : null;
  const col = scoreColor(s.score, true, s.verify?.length);
  const timing = windowTiming(w, g.nowMs, g.selectedDate);
  const side = w?.zw ? windSide(s, w.zw).side : null;
  return (
    <Card tone={col} kicker={tied.length > 1 ? "Meilleur choix · à égalité" : "Meilleur choix"} right={<span style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}}>
      {s.dangerLevel >= 2 && <Pill color={s.dangerLevel === 3 ? C.bad : C.warn} title="Difficulté du spot">{DANGER_LABEL[s.dangerLevel]}</Pill>}</span>}>
      {degraded && <div style={{marginBottom:10}}><Alert tone={C.warn} role="alert"><b>Sans météo</b> : conseil sur la marée et la lumière seules. Vent et houle inconnus ; les spots engagés ne sont pas proposés.</Alert></div>}
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <ScoreRing score={s.score} size={88} verify={!!s.verify?.length}/>
        <div style={{flex:1,minWidth:0}}>
          <h2 style={{margin:0,fontSize:23,fontWeight:800,color:C.strong,lineHeight:1.15}}>{s.name}</h2>
          {w && <div style={{display:"flex",alignItems:"center",gap:6,fontSize:20,fontWeight:800,color:C.strong,marginTop:5,...num}}><Icon name="horloge" size={18} color="#7dd3fc"/>{w.startFmt} → {w.endFmt}</div>}
          {timing && <div style={{fontSize:15,fontWeight:700,color:timing.col,marginTop:2}}>{timing.t}</div>}
        </div>
      </div>
      {w && <div style={{fontSize:15,color:C.text,marginTop:8}}>{w.label}{w.light && w.light.band !== "inconnu" ? ` · ${LIGHT_ICON[w.light.band] || ""} ${w.light.label.toLowerCase()}` : ""}</div>}
      {w?.clipped && <div style={{fontSize:13.5,color:C.muted,marginTop:2}}>Créneau de marée {w.tideStartFmt} → {w.tideEndFmt}, ramené à tes heures de pêche.</div>}
      {w?.zw?.fromSpot && (
        <div style={{fontSize:15,color:"#7dd3fc",marginTop:9,...num}}>
          🌬 {w.zw.wind_dir} {w.zw.wind_kmh} km/h (F{w.zw.wind_force}){side ? <b style={{color:side === "face" && w.zw.wind_force >= 4 ? C.warn : "#bae6fd"}}> · {SIDE[side]}</b> : ""}{w.zw.gust_kmh != null ? ` · rafales ${w.zw.gust_kmh}` : ""} · 🌊 {w.zw.houleKnown ? `${fr(w.zw.houle)} m` : "houle inconnue"}{w.coeff != null ? ` · coef ${w.coeff}` : ""}
        </div>
      )}
      {w?.zw && <ModelSpread zw={w.zw}/>}
      <WhyWatch factors={keyFactors(w?.parts || s.bestParts)}/>
      {tied.length > 1 && (
        <Muted><b style={{color:C.strong}}>≈ Égalité</b> (écart sous la précision du modèle, {fr(TIE_DELTA)} point) : {tied.map((x) => `${x.name} ${fr(x.score)}`).join(" · ")}.
          {nearest && nearest.id !== s.id ? <> Le plus proche, <b style={{color:C.strong}}>{nearest.name}</b> ({nearest.distance}), vaut autant avec moins de route.</> : <> C'est aussi le plus proche.</>}</Muted>
      )}
      <SafetyPanel safety={g.verdictSafety} id="securite-verdict"/>
      <ConfidencePanel conf={g.verdictConf}/>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
        <button onClick={() => g.goToSpot(s.id)} style={{flex:"1 1 140px",minHeight:48,borderRadius:10,border:`1px solid ${C.accent}88`,background:`${C.accent}18`,color:C.strong,fontSize:15,fontWeight:700,cursor:"pointer"}}>Fiche du spot</button>
        {g.selectedDate === g.todayISO && !g.session && <button onClick={() => { g.startSession(s.id); }} style={{flex:"1 1 140px",minHeight:48,borderRadius:10,border:`1px solid ${C.violet}`,background:`${C.violet}26`,color:"#ede9fe",fontSize:15,fontWeight:700,cursor:"pointer"}}>🎣 Je pêche ici</button>}
      </div>
    </Card>
  );
}

// v9.1 — MODE TERRAIN : le verdict en gros caractères, pour un coup d'œil sur les rochers (gants, soleil, embruns).
// Uniquement des valeurs du moteur ; ce qui manque s'affiche « — », jamais une valeur par défaut.
function FieldCard({ g }) {
  const { s, w } = g.verdict;
  const col = scoreColor(s.score, true, s.verify?.length);
  const timing = windowTiming(w, g.nowMs, g.selectedDate);
  const today = g.selectedDate === g.todayISO;
  const t = today ? tideNow(g.tideFor(s.tidePort)?.events, g.nowMs) : null;
  const zw = w?.zw;
  const side = zw ? windSide(s, zw).side : null;
  const pick = g.verdictLure?.pick;
  const safety = g.verdictSafety;
  const big = { fontSize: 26, fontWeight: 800, color: C.strong, lineHeight: 1.15, ...num };
  const cell = (label, value, sub) => (
    <div style={{padding:"10px 12px",borderRadius:12,background:C.card2,border:`1px solid ${C.line}`,minWidth:0}}>
      <div style={{fontSize:13,fontWeight:700,color:C.muted}}>{label}</div>
      <div style={{fontSize:22,fontWeight:800,color:C.strong,lineHeight:1.2,...num}}>{value}</div>
      {sub && <div style={{fontSize:14,color:C.text,marginTop:2}}>{sub}</div>}
    </div>
  );
  return (
    <Card tone={col} kicker="Mode terrain · meilleur choix" id="mode-terrain" right={<FieldToggle g={g}/>}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:4}}>
        <ScoreRing score={s.score} size={148} verify={!!s.verify?.length}/>
        <div style={{fontSize:20,fontWeight:800,color:col,marginTop:6}}>{conditionLabel(s.score, s.verify)}</div>
        <h2 style={{margin:0,fontSize:30,fontWeight:800,color:C.strong,lineHeight:1.1}}>{s.name}</h2>
        {w && <div style={{...big,marginTop:2}}>{w.startFmt} → {w.endFmt}</div>}
        {timing && <div style={{fontSize:18,fontWeight:800,color:timing.col}}>{timing.t}</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8,marginTop:14}}>
        {cell("Marée", t ? (t.rising ? "Montante" : "Descendante") : w?.label || "—",
          t?.next ? `${t.next.type === "PM" ? "Pleine mer" : "Basse mer"} à ${parisHHMM(t.next.ms)}` : w?.coeff != null ? `coef ${w.coeff}` : null)}
        {cell("Vent", zw ? `${zw.wind_dir} ${zw.wind_kmh} km/h` : "—", zw ? `force ${zw.wind_force}${side ? ` · ${SIDE[side].replace(" pour ce poste", "")}` : ""}${zw.gust_kmh != null ? ` · raf. ${zw.gust_kmh}` : ""}` : "pas de météo")}
        {cell("Houle", zw ? (zw.houleKnown ? `${fr(zw.houle)} m` : "inconnue") : "—", null)}
        {cell("Eau", g.sst != null ? `${fr(g.sst)} °C` : "—", g.sst != null ? "modèle, pas une mesure" : "non disponible")}
      </div>
      <div style={{marginTop:8}}>{cell("Leurre", pick ? pick.name : g.verdictLure ? g.verdictLure.best.court : "—", pick?.weight?.text || null)}</div>
      {safety && (
        <div style={{marginTop:10,fontSize:16,fontWeight:700,color:C.strong}}>
          Sécurité · {safety.label}{safety.items.find((i) => i.level !== "info") ? ` : ${safety.items.find((i) => i.level !== "info").t}` : ""}
          <div style={{fontSize:14,fontWeight:500,color:"#cbd5e1",marginTop:2}}>Vérifie sur place.</div>
        </div>
      )}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
        <button onClick={() => g.goToSpot(s.id)} style={{flex:"1 1 140px",minHeight:52,borderRadius:12,border:`1px solid ${C.accent}88`,background:`${C.accent}18`,color:C.strong,fontSize:16,fontWeight:700,cursor:"pointer"}}>Fiche du spot</button>
        {today && !g.session && <button onClick={() => g.startSession(s.id)} style={{flex:"1 1 140px",minHeight:52,borderRadius:12,border:`1px solid ${C.violet}`,background:`${C.violet}26`,color:"#ede9fe",fontSize:16,fontWeight:700,cursor:"pointer"}}>🎣 Je pêche ici</button>}
      </div>
    </Card>
  );
}
function FieldToggle({ g, onPhoto }) {
  const on = !!g.fieldMode;
  return (
    <button type="button" onClick={() => g.setFieldMode(!on)} aria-pressed={on}
      style={{display:"inline-flex",alignItems:"center",gap:6,minHeight:36,padding:"0 12px",borderRadius:999,cursor:"pointer",fontSize:13,fontWeight:750,whiteSpace:"nowrap",
        border:`1px solid ${on ? "#4ade80" : onPhoto ? "rgba(255,255,255,0.35)" : C.line}`,background:on ? "rgba(34,197,94,0.18)" : onPhoto ? "rgba(3,11,23,0.55)" : "transparent",
        color:on ? "#bbf7d0" : onPhoto ? "#f8fafc" : C.muted,backdropFilter:onPhoto ? "blur(6px)" : undefined,WebkitBackdropFilter:onPhoto ? "blur(6px)" : undefined}}>
      <Icon name="cible" size={15} stroke={2}/>{on ? "Mode terrain activé" : "Mode terrain"}<span style={{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0 0 0 0)"}}> · gros caractères</span>
    </button>
  );
}

function LureCard({ g }) {
  const a = g.verdictLure;
  if (!a) return null;
  const p = a.pick;
  return (
    <Card kicker="Leurre conseillé pour ce créneau" title={p ? p.name : a.best.court}>
      {p ? (
        <div style={{display:"grid",gap:6,fontSize:14.5}}>
          <div><span style={{color:C.muted}}>Poids · </span><b>{p.weight?.text || "—"}</b></div>
          <div><span style={{color:C.muted}}>Couleur · </span>{p.color.named ? <b>{p.color.name}</b> : p.color.name}</div>
          <div><span style={{color:C.muted}}>Nage · </span>{p.layerLabel}</div>
          {p.warn.length > 0 && <div style={{color:C.warn}}>{p.warn.join(" ; ")}</div>}
          {a.alts[0] && <div><span style={{color:C.muted}}>{a.alts[0].role} · </span>{a.alts[0].name} · {a.alts[0].weight?.text}</div>}
        </div>
      ) : (
        <div style={{display:"grid",gap:6,fontSize:14.5}}>
          <div><span style={{color:C.muted}}>Couleur · </span>{a.color.label}</div>
          <div><span style={{color:C.muted}}>Montage · </span>{a.weight.text}</div>
        </div>
      )}
      <div style={{fontSize:12,color:C.faint,marginTop:8}}>Choisi dans ta boîte d'après le courant, le vent, la mer, la lumière et la saison ; raisons et sources dans l'onglet Leurres.</div>
      <GoLink onClick={() => g.goTab("leurres")}>Tout le conseil leurres</GoLink>
    </Card>
  );
}

/** Le verdict tombe presque toujours en basse lumière : le meilleur créneau de plein jour, pour qui pêche de jour. */
function DaytimeCard({ g }) {
  const { s, w, lure } = g.daytime;
  return (
    <Card kicker="Si tu pêches en plein jour" title={`${s.name} · ${w.startFmt} → ${w.endFmt}`}
      right={<span style={{fontSize:20,fontWeight:800,color:scoreColor(w.score, true, w.verify?.length),...num}} title="Note de ce créneau">{fr(w.score)}</span>}>
      <div style={{display:"grid",gap:5,fontSize:14.5}}>
        <div>{w.label}</div>
        <div><span style={{color:C.muted}}>Leurre · </span>{lure.pick ? `${lure.pick.name}${lure.pick.color.named ? ` ${lure.pick.color.name}` : ""}` : lure.best.court}</div>
        <div><span style={{color:C.muted}}>Poids · </span>{lure.weight.text}</div>
      </div>
      <Muted>En plein jour, le bar est moins actif qu'en basse lumière : la note de ce créneau est plus basse que celle du verdict.</Muted>
      <GoLink onClick={() => g.goLure(s.id, w.id)}>Le conseil leurres de ce créneau</GoLink>
    </Card>
  );
}

// Tendance de la semaine : en tête de la synthèse, chargée d'office. Une colonne par jour (note du
// meilleur créneau), le meilleur jour de la semaine en clair, et le détail jour par jour à déplier.
export function WeekTrend({ g }) {
  const { week, weekRows } = g;
  const refresh = <button onClick={() => g.loadWeek(true)} aria-label="Retélécharger la semaine" style={{background:"none",border:`1px solid ${C.line}`,borderRadius:8,color:C.accent,fontSize:13.5,cursor:"pointer",minHeight:44,padding:"0 10px"}}>↻ Semaine</button>;
  if (!weekRows) {
    return (
      <Card kicker="Tendance de la semaine" title="Les 7 prochains jours">
        {week.loading ? <Loader msg="Prévision des 7 prochains jours…"/>
          : <button onClick={() => g.loadWeek()} style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${C.accent}66`,background:`${C.accent}14`,color:C.strong,fontSize:14.5,fontWeight:700,cursor:"pointer"}}>Afficher la semaine</button>}
        {week.error && <Muted style={{color:"#fca5a5"}}>{week.error}</Muted>}
      </Card>
    );
  }
  const scored = weekRows.filter((r) => r.s);
  const best = scored.length ? scored.reduce((a, b) => (b.s.score > a.s.score ? b : a)) : null;
  // v8.9 — Sous la précision du modèle (0,2 point), deux jours se valent : on le dit, on ne tranche pas.
  const ties = best ? scored.filter((r) => best.s.score - r.s.score <= TIE_DELTA + 1e-9) : [];
  const shortDay = (d) => new Date(d + "T12:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" });
  const max = Math.max(10, ...scored.map((r) => r.s.score));
  const pick = (date) => { g.pickDate(date); try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { /* sans effet */ } };
  // v8.14 — Semaine « toute verte » : le vert dit « rien ne bloque », pas « ça mord ». On aide à départager.
  const starred = new Set((ties.length > 1 ? ties : best ? [best] : []).map((r) => r.date));
  const allGreen = scored.length >= 3 && scored.length === weekRows.length && scored.every((r) => r.s.score >= GOOD_SCORE);
  const fv = (v) => `${v > 0 ? "+" : "−"}${fr(Math.abs(v))}`;
  const long = (d) => new Date(d + "T12:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return (
    <Card kicker="Tendance de la semaine" title={!best ? "Aucun créneau praticable cette semaine" : ties.length > 1 ? `Meilleurs jours, à égalité : ${ties.map((r) => shortDay(r.date)).join(" ou ")}` : `Meilleur jour : ${long(best.date)}`} right={refresh}>
      {best && (
        <div style={{fontSize:14.5,color:C.text,marginTop:-2,marginBottom:10}}>
          <b style={{color:C.strong}}>{best.s.name}</b>{best.w ? <span style={{...num}}> · {best.w.startFmt} → {best.w.endFmt}{best.w.light && best.w.light.band !== "inconnu" ? ` · ${LIGHT_ICON[best.w.light.band] || ""} ${best.w.light.label.toLowerCase()}` : ""}</span> : ""} · note <b style={{color:scoreColor(best.s.score),...num}}>{fr(best.s.score)}</b>{best.s.dangerLevel === 3 ? <span style={{color:C.bad}}> · ⚠ spot engagé</span> : ""}{best.noKill ? <span style={{color:C.warn}}> · no-kill</span> : ""}
          {Number.isFinite(best.nGood) && <span style={{...num}}> · {best.nGood} spot{best.nGood > 1 ? "s" : ""} au vert sur {best.nSpots}</span>}
          {best.factors && (best.factors.plus.length > 0 || best.factors.minus.length > 0) && (
            <div style={{fontSize:13.5,color:C.muted,marginTop:4,lineHeight:1.45,...num}}>
              {best.factors.plus.length > 0 && <span>Ce qui porte la note : {best.factors.plus.map((p) => `${p.label} (${fv(p.v)})`).join(", ")}.</span>}
              {best.factors.minus.length > 0 && <span> Freins : {best.factors.minus.map((p) => `${p.label} (${fv(p.v)})`).join(", ")}.</span>}
            </div>
          )}
        </div>
      )}
      {allGreen && (
        <Muted style={{marginTop:-4,marginBottom:10}}>
          Toute la semaine est au vert : le vert veut dire « rien ne bloque » (marée dans la plage utile, vent et houle tenables), pas « ça mord à coup sûr ».
          Pour choisir : la note (au-delà de 8, plusieurs atouts s'additionnent), le nombre de spots au vert ce jour-là, et la ★. Sous {fr(TIE_DELTA)} point d'écart, deux jours se valent.
        </Muted>
      )}
      <div role="group" aria-label="Note du meilleur créneau, jour par jour" style={{display:"grid",gridTemplateColumns:`repeat(${weekRows.length},minmax(0,1fr))`,gap:4}}>
        {weekRows.map((r) => {
          const d = new Date(r.date + "T12:00");
          const sel = r.date === g.selectedDate;
          const v = r.s ? r.s.score : null;
          const col = v != null ? scoreColor(v, true, r.s?.verify?.length) : C.faint;
          const star = starred.has(r.date);
          const label = `${long(r.date)} : ${r.s ? `${r.s.name}, note ${fr(v)}${r.w ? `, ${r.w.startFmt} à ${r.w.endFmt}` : ""}${Number.isFinite(r.nGood) ? `, ${r.nGood} spot${r.nGood > 1 ? "s" : ""} au vert sur ${r.nSpots}` : ""}${star ? ", meilleur jour" : ""}` : (r.err || "aucun créneau praticable")}`;
          return (
            <button key={r.date} onClick={() => pick(r.date)} aria-pressed={sel} aria-label={label} title={label}
              style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 0 7px",minHeight:44,borderRadius:9,
                      border:`1px solid ${sel ? C.accent : C.line2}`,background:sel ? "#0f2540" : "transparent",color:C.text,cursor:"pointer"}}>
              {star && <span aria-hidden="true" data-star="1" style={{position:"absolute",top:1,right:3,fontSize:11,color:C.warn,lineHeight:1}}>★</span>}
              <span style={{fontSize:12,color:sel ? C.accent : C.muted,textTransform:"capitalize"}}>{d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}</span>
              <span style={{fontSize:12,color:sel ? C.muted : C.faint,...num}}>{d.getDate()}</span>
              <span aria-hidden="true" style={{width:"62%",height:34,display:"flex",alignItems:"flex-end",borderRadius:4,background:C.line2}}>
                <span style={{width:"100%",height:`${v != null ? Math.max(8, (v / max) * 100) : 0}%`,background:col,borderRadius:4}}/>
              </span>
              <span style={{fontSize:14,fontWeight:800,color:col,...num}}>{v != null ? fr(v) : "–"}</span>
              {r.s && Number.isFinite(r.nGood) && <span aria-hidden="true" style={{fontSize:11,color:C.muted,...num}}>{r.nGood}/{r.nSpots}</span>}
              {r.w?.light && LIGHT_ICON[r.w.light.band] && <span aria-hidden="true" style={{fontSize:12}}>{LIGHT_ICON[r.w.light.band]}{r.s?.dangerLevel === 3 ? "⚠" : ""}</span>}
              {r.noKill && <span style={{fontSize:11,color:C.warn}}>no-kill</span>}
            </button>
          );
        })}
      </div>
      {scored.length > 0 && <Muted style={{marginTop:6}}>★ meilleur jour · sous la note : spots au vert (note ≥ {GOOD_SCORE}) sur le nombre de spots du guide, ce jour-là.</Muted>}
      <details style={{marginTop:10}}>
        <summary style={{cursor:"pointer",color:C.accent,fontSize:14.5,fontWeight:600,minHeight:44,display:"flex",alignItems:"center"}}>Détail jour par jour</summary>
        <div style={{display:"flex",flexDirection:"column"}}>
          {weekRows.map((r) => {
            const lbl = new Date(r.date + "T12:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
            const sel = r.date === g.selectedDate;
            return (
              <button key={r.date} onClick={() => pick(r.date)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 4px",border:"none",borderTop:`1px solid ${C.line2}`,background:sel ? "#0f2540" : "none",color:C.text,cursor:"pointer",textAlign:"left"}}>
                <span style={{width:84,flexShrink:0,fontSize:14,color:sel ? C.accent : C.muted,textTransform:"capitalize"}}>{lbl}</span>
                {r.s ? (
                  <>
                    <span style={{flex:1,minWidth:0,fontSize:14,lineHeight:1.35}}>{starred.has(r.date) && <span style={{color:C.warn}}>★ </span>}<b style={{color:C.strong}}>{r.s.name}</b>{r.w ? <span style={{color:C.muted}}> · {r.w.startFmt} → {r.w.endFmt}{r.w.light && LIGHT_ICON[r.w.light.band] ? ` ${LIGHT_ICON[r.w.light.band]}` : ""}</span> : ""}{r.s.dangerLevel === 3 ? <span style={{color:C.bad}}> · ⚠ engagé</span> : ""}{r.noKill ? <span style={{color:C.warn}}> · no-kill</span> : ""}
                      {Number.isFinite(r.nGood) && <span style={{display:"block",fontSize:12.5,color:C.muted,...num}}>{r.nGood} spot{r.nGood > 1 ? "s" : ""} au vert sur {r.nSpots}{r.factors?.plus.length ? ` · ${r.factors.plus.map((p) => p.label).join(", ")}` : ""}</span>}</span>
                    <span style={{fontSize:17,fontWeight:800,color:scoreColor(r.s.score, true, r.s.verify?.length),...num}}>{fr(r.s.score)}</span>
                  </>
                ) : <span style={{flex:1,fontSize:14,color:C.muted}}>{r.err || "Aucun créneau praticable"}</span>}
              </button>
            );
          })}
        </div>
      </details>
      <Muted>Même calcul que la vue du jour : touche un jour pour l'afficher. Écart de {fr(TIE_DELTA)} point ou moins : égalité. Au-delà de 2 à 3 jours, le vent prévu est une tendance.</Muted>
    </Card>
  );
}
// Ancien nom, gardé pour les autres onglets qui l'importeraient.
export const WeekCompact = WeekTrend;

export function Synthese({ g }) {
  const { live: d, loading, error, verdict, reg, tide, sun, sst, presenceInfo, pressure, pressureInfo, dataWarnings } = g;
  const evs = (tide.dayEvents || []).slice(0, 4).map((e) => `${e.type} ${fmtH(e.dec)}`).join(" · ");
  // Site à cheval sur le 48e parallèle : le no-kill du nord s'annonce même si le spot recommandé est au sud.
  const mixedNoKill = g.regZones?.length > 1 && regulationForZone(g.selectedDate, "nord").noKill;
  return (
    <Stack>
      {mixedNoKill ? <Alert tone={C.warn} role="alert">⚖ <b>No-kill obligatoire jusqu'au 31 mars sur les spots au nord du 48e parallèle</b> ; au sud, {regulationForZone(g.selectedDate, "sud").quota} bars par pêcheur et par jour. Chaque fiche de spot indique son régime.</Alert>
        : reg.noKill && <Alert tone={C.warn} role="alert">⚖ <b>No-kill obligatoire jusqu'au 31 mars</b> : tout bar est relâché.</Alert>}
      {g.jStatus === "unavailable" && <Alert>Sauvegarde indisponible ({g.jReason || "raison non communiquée"}) : le journal ne sera pas conservé. Exporte-le avant de fermer.</Alert>}
      <div aria-live="polite" aria-busy={loading ? "true" : "false"}>
        {loading && <Card><Loader msg="Téléchargement de la météo, spot par spot… La marée est calculée sur l'appareil."/></Card>}
      </div>
      {error && (
        <Card tone={C.bad} kicker={d ? "Météo non mise à jour" : "Météo indisponible"}>
          <div role="alert" style={{fontSize:15,color:C.strong,fontWeight:700,lineHeight:1.45}}>{/^Pas de réseau/.test(error) ? "Pas de réseau" : "La météo n'a pas pu être téléchargée"}{d ? " — la dernière météo téléchargée reste affichée." : " — conseil sur la marée et la lumière seules."}</div>
          <details style={{marginTop:6}}><summary style={{cursor:"pointer",minHeight:40,display:"flex",alignItems:"center",color:C.muted,fontSize:13.5}}>Détail</summary>
            <p style={{margin:0,fontSize:13.5,color:"#fecaca",whiteSpace:"pre-line",lineHeight:1.5}}>{error}</p></details>
          <button onClick={() => g.doFetch(g.selectedDate, { force: true })} style={{marginTop:8,minHeight:44,padding:"0 14px",borderRadius:9,border:`1px solid ${C.bad}`,background:`${C.bad}22`,color:C.strong,fontSize:14.5,cursor:"pointer"}}>Réessayer</button>
        </Card>
      )}
      {!loading && verdict && (d || error) && !g.fieldMode && <DecisionHero g={g} timing={windowTiming(verdict.w, g.nowMs, g.selectedDate)} toggle={<FieldToggle g={g} onPhoto/>}/>}
      {!loading && verdict && (d || error) && (g.fieldMode ? <FieldCard g={g}/> : <VerdictCard g={g} degraded={!d}/>)}
      {!loading && d && verdict && !g.fieldMode && <CompareCard g={g}/>}
      {!loading && (d || error) && !verdict && (
        g.allScored.some((x) => (x.windows || []).some((w) => w.eligible && (w.past || w.tooLate))) && g.selectedDate === g.todayISO
          ? <Alert tone={C.warn}>Les bons créneaux d'aujourd'hui sont passés. <button onClick={() => g.pickDate(g.isoAddDays(g.todayISO, 1))} style={{minHeight:44,marginLeft:4,padding:"0 12px",borderRadius:8,border:`1px solid ${C.accent}`,background:`${C.accent}18`,color:C.strong,fontSize:14,fontWeight:700,cursor:"pointer"}}>Voir demain ›</button></Alert>
          : <Alert tone={C.bad}>Aucun spot praticable selon le modèle (houle ou courant hors limites, ou aucun créneau dans tes heures). L'onglet Spots détaille la raison spot par spot.</Alert>
      )}
      {!loading && d && verdict && <LureCard g={g}/>}
      {!loading && d && verdict && g.daytime && <DaytimeCard g={g}/>}
      <WeekTrend g={g}/>

      <section aria-labelledby="cond-h">
        <h2 id="cond-h" style={{fontSize:17,fontWeight:800,color:C.strong,margin:"6px 2px 10px"}}>Conditions du jour</h2>
        <Grid min={150}>
          <Tile icon="🌬" label="Vent moyen du jour" value={d ? `${d.wind_dir} ${d.wind_kmh} km/h` : "–"} sub={d ? `${d.gust_kmh != null ? `rafales ${d.gust_kmh} · ` : ""}6 h-22 h, spot local` : "météo non chargée"} onClick={() => g.goTab("meteo")}/>
          <Tile icon="🌊" label={SITE.zones?.local?.sea === "rade" ? "Mer (rade)" : "Houle"} value={d ? (d.houle != null ? `${fr(d.houle)} m` : "inconnue") : "–"} sub={SITE.zones?.local?.sea === "rade" ? "mer du vent, plan d'eau abrité" : "au large du spot local"} onClick={() => g.goTab("meteo")}/>
          <Tile icon="↕" label="Marée" value={tide.coefs?.length ? `coef ${tide.coefs.join(" · ")}` : "–"} sub={evs || tide.label} onClick={() => g.goTab("maree")}/>
          <Tile icon="☀" label="Soleil" value={`${fmtH(sun.sunrise)} → ${fmtH(sun.sunset)}`} sub="lever → coucher, heure de Paris" onClick={() => g.goTab("saison")}/>
          <Tile icon="🌡" label="Eau et saison" value={sst != null ? `${fr(sst)} °C` : "–"} sub={presenceInfo.label} onClick={() => g.goTab("saison")}/>
          <Tile icon="◔" label="Pression" value={pressure ? `${pressure} hPa` : "–"} sub={pressureInfo ? TREND[d?.pressure_trend] || pressureInfo.trendLabel : ""} onClick={() => g.goTab("meteo")}/>
        </Grid>
        {dataWarnings.length > 0 && <div style={{marginTop:8}}><Alert tone={C.bad}>{dataWarnings.length} alerte{dataWarnings.length > 1 ? "s" : ""} de cohérence des données : voir l'onglet Météo.</Alert></div>}
      </section>

      {verdict && verdict.next.length > 0 && (!d || g.fieldMode) && (
        <Card title="Autres choix">
          {verdict.next.map((n, i) => (
            <button key={n.s.id} onClick={() => g.goToSpot(n.s.id)} style={{display:"flex",width:"100%",justifyContent:"space-between",alignItems:"center",gap:10,padding:"10px 0",border:"none",borderTop:i ? `1px solid ${C.line2}` : "none",background:"none",color:C.text,cursor:"pointer",textAlign:"left"}}>
              <span style={{minWidth:0}}><b style={{color:C.strong,fontSize:15}}>#{i + 2} {n.s.name}</b><br/><span style={{fontSize:13.5,color:C.muted}}>{n.w ? `${n.w.startFmt} → ${n.w.endFmt} · ` : ""}{n.s.distance}</span></span>
              <span style={{fontSize:20,fontWeight:800,color:scoreColor(n.s.score, true, n.s.verify?.length),...num}}>{fr(n.s.score)}</span>
            </button>
          ))}
          <GoLink onClick={() => g.goTab("spots")}>Classement complet et carte</GoLink>
        </Card>
      )}

      <button onClick={() => g.goTab("regles")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"12px 14px",borderRadius:12,border:`1px solid ${C.line}`,background:C.card,color:C.text,cursor:"pointer",textAlign:"left"}}>
        <span>⚖ <b>{reg.headline}</b>{reg.stale ? <span style={{color:C.warn}}> · règles 2026, à revérifier</span> : ""}</span>
        <Chip color={C.accent}>Règles ›</Chip>
      </button>
    </Stack>
  );
}
