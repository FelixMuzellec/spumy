// Journal : session en cours, saisie, historique, prises par spot, recalibrage.
import { useEffect, useMemo, useRef } from "react";
import { SITE } from "SITE_CONFIG";
import { allSpots } from "../../engine/myspots.js";
import { fmtH } from "../../engine/core.js";
import { backupRawJournal, CALIB, catchStats, conditionsLine, sanitizeJournal, saveJournal, sessionConditions, sessionHour } from "../../engine/journal.js";
import { catalogWith } from "../../engine/tackle.js";
import { JournalForm, Pill, parisHHMM } from "../components.jsx";
import { Alert, C, Card, Muted, Row, Stack, fr, num } from "../kit.jsx";
import { Icon } from "../icons.jsx";
import { syncText, useSyncState } from "../TabBar.jsx";

// v9.2 — En tête du journal : ce que le journal dit déjà, en trois chiffres, et l'accès direct à la saisie.
function Summary({ journal, onNew }) {
  const st = useMemo(() => catchStats(journal), [journal]);
  const fish = journal.reduce((n, e) => n + (Number.isFinite(+e.fish) ? +e.fish : 0), 0);
  const top = Object.entries(st).filter(([, x]) => x.fish > 0).sort((a, b) => b[1].fish - a[1].fish || b[1].sessions - a[1].sessions)[0];
  const topName = top ? allSpots().find((x) => x.id === top[0])?.name : null;
  const tile = (v, l) => (
    <div style={{flex:"1 1 0",minWidth:0,padding:"10px 8px",borderRadius:12,background:C.card2,border:`1px solid ${C.line}`,textAlign:"center"}}>
      <div style={{fontSize:24,fontWeight:800,color:C.strong,lineHeight:1.1,...num}}>{v}</div>
      <div style={{fontSize:12.5,color:C.muted,marginTop:2}}>{l}</div>
    </div>
  );
  return (
    <section aria-labelledby="journal-h" style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <h2 id="journal-h" style={{flex:1,margin:"2px 2px 0",fontSize:22,fontWeight:800,color:C.strong}}>Journal de pêche</h2>
        <button onClick={onNew} style={{display:"flex",alignItems:"center",gap:6,minHeight:44,padding:"0 14px",borderRadius:999,border:"none",background:"#7c3aed",color:"#fff",fontSize:14.5,fontWeight:750,cursor:"pointer"}}>
          <span aria-hidden="true" style={{fontSize:19,lineHeight:1,marginTop:-2}}>+</span>Noter une session
        </button>
      </div>
      {journal.length > 0 && (
        <div style={{display:"flex",gap:8}}>
          {tile(journal.length, journal.length > 1 ? "sessions" : "session")}
          {tile(fish, fish > 1 ? "bars pris" : "bar pris")}
          {tile(Object.keys(st).length, Object.keys(st).length > 1 ? "spots pêchés" : "spot pêché")}
        </div>
      )}
      {topName && <div style={{fontSize:14,color:C.muted,margin:"0 2px"}}>Le spot qui t'a le plus donné : <b style={{color:C.text}}>{topName}</b> ({top[1].fish} bar{top[1].fish > 1 ? "s" : ""} en {top[1].sessions} session{top[1].sessions > 1 ? "s" : ""}).</div>}
    </section>
  );
}

function Stats({ journal, calib }) {
  const st = useMemo(() => catchStats(journal), [journal]);
  const rows = Object.entries(st).sort((a, b) => b[1].sessions - a[1].sessions);
  if (!rows.length) return null;
  return (
    <Card title="Prises par spot" kicker="Bars par heure : sur les sessions dont la durée est saisie">
      {rows.map(([id, s]) => {
        const sp = allSpots().find((x) => x.id === id), c = calib.detail?.[id];
        return (
          <Row key={id} label={sp?.name ?? "Spot supprimé"}>
            {s.fish} bar{s.fish > 1 ? "s" : ""} / {s.sessions} session{s.sessions > 1 ? "s" : ""}
            {s.cpue != null ? <span style={{color:C.good}}> · {fr(s.cpue, 2)} bar/h</span> : <span style={{color:C.faint}}> · durée non saisie</span>}
            {c?.bias != null && <span style={{color:C.violet}}> · recalibré ×{fr(c.bias, 2)}</span>}
          </Row>
        );
      })}
      <Muted>Le nombre de bars par heure de pêche est la mesure la plus fiable du journal ; la note ressentie reste subjective.</Muted>
    </Card>
  );
}

export function JournalTab({ g }) {
  const { journal, setJournal, jStatus, setJStatus, jReason, jError, setJError, calib, selectedDate, live, tideFor } = g;
  const add = async (e0) => {
    const sp = allSpots().find((s) => s.id === e0.spotId), hh = sessionHour(e0, selectedDate);
    const e = live && hh != null ? { ...e0, cond: sessionConditions(selectedDate, live, sp, hh, tideFor) } : e0;
    const n = [...journal, e]; setJournal(n); setJError("");
    const res = await saveJournal(n, jStatus);
    if (!res.ok) setJError(res.reason || "Échec d'enregistrement.");
    else { setJournal(res.entries); setJStatus("ok"); }
  };
  const imp = async (list0) => {
    const list = sanitizeJournal(list0);
    const byId = new Map([...journal, ...list].map((e) => [String(e.id), e]));
    const merged = [...byId.values()];
    setJournal(merged); setJError("");
    // Import de secours sur un journal illisible : la copie brute est d'abord mise de côté, puis on écrit.
    if (jStatus === "unavailable") await backupRawJournal();
    const res = await saveJournal(merged, jStatus === "unavailable" ? "ok" : jStatus);
    if (!res.ok) setJError((res.reason || "") + " — les entrées importées restent en mémoire pour cette session.");
    else setJournal(res.entries);
  };
  const exp = () => {
    const blob = new Blob([JSON.stringify(journal, null, 2)], { type: "application/json" });
    const u = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = u; a.download = `journal-bar-${SITE.id}.json`; a.click(); URL.revokeObjectURL(u);
  };
  const sessSpot = g.session ? allSpots().find((s) => s.id === g.session.spotId) : null;
  const sync = useSyncState();
  const formRef = useRef(null);
  const toForm = () => {
    const el = formRef.current; if (!el) return;
    try { el.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { /* sans effet */ }
    setTimeout(() => el.querySelector("select, input, textarea")?.focus({ preventScroll: true }), 350);
  };
  // Fin de session (« Terminer et noter ») : le formulaire est prérempli, on y descend.
  useEffect(() => { if (g.preset) { const t = setTimeout(toForm, 120); return () => clearTimeout(t); } return undefined; }, [g.preset?.nonce]); // eslint-disable-line react-hooks/exhaustive-deps
  const recent = [...journal].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 12);
  return (
    <Stack>
      <Summary journal={journal} onNew={toForm}/>
      {g.session ? (
        <Card tone={C.violet} kicker="Session en cours" title={sessSpot?.name ?? g.session.spotId}>
          <p style={{margin:0,fontSize:14.5}}>Depuis {parisHHMM(g.session.start).replace(":", "h")}.</p>
          <button onClick={g.endSession} style={{marginTop:10,padding:"10px 14px",borderRadius:9,border:`1px solid ${C.violet}`,background:`${C.violet}26`,color:C.strong,fontSize:14.5,fontWeight:700,cursor:"pointer"}}>Terminer et noter</button>
        </Card>
      ) : (
        <Muted style={{marginTop:0}}>Sur place, « Je pêche ici maintenant » (fiche du spot) démarre un chrono ; « Terminer et noter » remplit ce formulaire.</Muted>
      )}

      {journal.length > 0 && (
        <Card title="Dernières sessions">
          {recent.map((e, i) => {
            const sp = allSpots().find((x) => x.id === e.spotId);
            const dl = e.predicted != null && e.result != null ? e.result - e.predicted : null;
            const caught = Number.isFinite(+e.fish) && +e.fish > 0;
            return (
              <div key={e.id} style={{display:"flex",gap:12,padding:"12px 0",borderTop:i ? `1px solid ${C.line2}` : "none"}}>
                <span aria-hidden="true" style={{width:46,height:46,borderRadius:12,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                  background:caught ? "rgba(34,197,94,0.14)" : "rgba(148,163,184,0.10)",color:caught ? "#86efac" : "#94a3b8",border:`1px solid ${caught ? "rgba(34,197,94,0.35)" : C.line}`}}>
                  {caught ? <span style={{fontSize:20,fontWeight:800,...num}}>{e.fish}</span> : <Icon name="journal" size={21}/>}
                </span>
                <span style={{flex:1,minWidth:0}}>
                  <span style={{fontSize:13,color:C.muted,...num}}>{new Date(e.date + "T12:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span style={{display:"block",fontSize:15,fontWeight:700,color:C.strong}}>{sp?.name ?? "Spot supprimé"}
                    {e.fish != null && <span style={{fontWeight:600,color:e.fish > 0 ? C.good : C.muted}}> · {e.fish} bar{e.fish > 1 ? "s" : ""}{e.duree ? ` en ${fr(+e.duree, e.duree % 1 ? 1 : 0)} h` : ""}</span>}
                    {e.seed && <> <Pill color={C.violet}>Archivé</Pill></>}
                  </span>
                  {(e.heure || e.cond) && <span style={{display:"block",fontSize:13,color:"#7dd3fc",marginTop:2}}>{e.heure ? String(e.heure).replace(":", "h") : e.cond ? `≈ ${fmtH(e.cond.h)} (${e.moment === "coucher" ? "coucher du soleil" : "heure estimée"})` : ""}{e.cond ? " · " + conditionsLine(e.cond) : ""}</span>}
                  {!e.cond && (e.heure || e.moment) && <span style={{display:"block",fontSize:12.5,color:C.faint,marginTop:2}}>Conditions calculées à l'ouverture de ce jour (météo nécessaire).</span>}
                  {e.lure && <span style={{display:"block",fontSize:13.5,color:C.text,marginTop:2}}>🎣 {e.lure}</span>}
                  {e.note && <span style={{display:"block",fontSize:13.5,color:C.muted,marginTop:1}}>{e.note}</span>}
                </span>
                <span style={{textAlign:"right",flexShrink:0,maxWidth:84}}>
                  <span style={{fontSize:18,fontWeight:800,color:e.result >= 7 ? C.good : e.result >= 4 ? C.warn : C.muted,...num}}>{e.result}</span>
                  <span style={{display:"block",fontSize:12.5,color:dl != null && Math.abs(dl) > 2.5 ? "#f87171" : C.faint}}>{dl != null ? `${dl > 0 ? "+" : ""}${fr(dl)} vs prédit` : "prédit à compléter"}</span>
                </span>
              </div>
            );
          })}
        </Card>
      )}

      <div ref={formRef} style={{scrollMarginTop:"calc(12px + env(safe-area-inset-top))"}}><Card title="Nouvelle session" kicker={`${journal.length ? `${journal.length} session${journal.length > 1 ? "s" : ""} au journal` : "Aucune session au journal"}${calib.calibrated > 0 ? ` · ${calib.calibrated} spot${calib.calibrated > 1 ? "s" : ""} recalibré${calib.calibrated > 1 ? "s" : ""}` : ""}`}>
        {jStatus === "unavailable" && (
          <div style={{marginBottom:12}}><Alert tone={C.bad}><b>Sauvegarde indisponible :</b> le journal ne survivra pas à la fermeture. {jReason} L'écriture est bloquée pour ne pas écraser un historique illisible : exporte avant de fermer, importe à la prochaine ouverture.</Alert></div>
        )}
        {jStatus !== "unavailable" && jStatus !== "loading" && <div style={{fontSize:13.5,color:C.good,marginBottom:10}}>● Sauvegarde active{jStatus === "empty" ? (journal.length ? " — aucune session enregistrée sur cet appareil, seulement les sessions archivées" : " — journal vide") : ""}</div>}
        {sync.state !== "off" && <div role="status" style={{fontSize:13.5,marginTop:-6,marginBottom:10,color:sync.state === "error" ? "#fca5a5" : sync.state === "ok" ? "#86efac" : C.muted}}>{syncText(sync)}</div>}
        {jError && <div style={{marginBottom:12}}><Alert tone={C.bad}>{jError}</Alert></div>}
        <JournalForm spots={g.allScored} date={selectedDate} preset={g.preset} disabled={jStatus === "unavailable"} catalog={catalogWith(g.boxOv)}
          onAdd={add} onImport={imp} onExport={exp} hasEntries={journal.length > 0}/>
      </Card></div>

      <Stats journal={journal} calib={calib}/>

      <Muted>Recalibrage à partir de {CALIB.minN} sessions par spot. L'écart entre note ressentie et note prédite est ramené vers zéro d'autant plus fort qu'il y a peu de sessions (comme si chaque spot partait de {CALIB.prior} sessions neutres), et la correction reste bornée à ±{Math.round(CALIB.max * 100)} %. Le journal est la seule donnée qu'aucun modèle ne recalcule : exporte-le de temps en temps.</Muted>
    </Stack>
  );
}
