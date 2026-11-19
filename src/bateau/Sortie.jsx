// Phase 13 — « Sortir aujourd'hui ? » (onglet Offshore) : le profil de ton bateau, puis, pour un créneau, la sécurité de
// la sortie zone par zone (non compensable), et les espèces ouvertes avec leurs trois scores. Moteur : src/bateau/engine/.
// Sans profil complet, aucun verdict : le moteur ne suppose ni catégorie, ni armement, ni abri.
import { useMemo, useState } from "react";
import { evaluateTrip, profileProblems, RAPPELS, sunAt, thresholds, tidePhase } from "./engine/index.js";
import { parseUserCoords } from "../core/myspots-core.js";
import { Alert, C, Chip, fr } from "../design/kit.jsx";
import { buttonStyle } from "../design/components.jsx";
import { color, font } from "../design/tokens.js";

export const PROFILE_KEY = "bar:offshore:profil";
export function loadProfile() { try { const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); return p && typeof p === "object" ? p : null; } catch { return null; } }
const saveProfile = (p) => { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch { /* stockage refusé : gardé pour la session */ } };

const CAT = { A: "A · haute mer", B: "B · au large", C: "C · à proximité des côtes", D: "D · eaux protégées" };
const ARM = { basique: "Basique (2 milles)", cotier: "Côtier (6 milles)", semi: "Semi-hauturier (60 milles)", hauturier: "Hauturier" };
const STC = { ok: color.good, verify: color.warn, nr: color.bad };
const STL = { ok: "Au vert", verify: "À vérifier", nr: "Non recommandé" };
const box = { marginTop: 14, padding: "14px 16px", border: `1px solid ${C.line}`, borderRadius: 14, background: C.card };
const lbl = { display: "block", fontSize: 14, fontWeight: 700, color: C.strong, margin: "12px 0 6px" };
const inp = { width: "100%", boxSizing: "border-box", minHeight: 44, padding: "9px 11px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.card2, color: C.text, fontSize: 16 };
const muted = { fontSize: 13, color: C.muted, margin: "6px 0 0", lineHeight: 1.5 };
const num = (v) => { const x = parseFloat(String(v).replace(",", ".")); return Number.isFinite(x) ? x : null; };

function ProfileForm({ initial, onSave, onCancel }) {
  const p0 = initial || {};
  const [cat, setCat] = useState(p0.categorie || ""), [arm, setArm] = useState(p0.armement || "");
  const [port, setPort] = useState(p0.abris?.[0]?.name || ""), [coords, setCoords] = useState(p0.abris?.[0] ? `${p0.abris[0].lat}, ${p0.abris[0].lon}` : "");
  const [v, setV] = useState(p0.vitesseNds ?? ""), [tmax, setTmax] = useState(p0.tempsMaxMin ?? 60);
  const [lv, setLv] = useState(p0.limites?.ventBf ?? ""), [lm, setLm] = useState(p0.limites?.merM ?? "");
  const [seul, setSeul] = useState(!!p0.seul), [cmin, setCmin] = useState(p0.canne?.min ?? ""), [cmax, setCmax] = useState(p0.canne?.max ?? "");
  const [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const pos = parseUserCoords(coords);
    if (!CAT[cat] || !ARM[arm]) return setErr("Choisis la catégorie de conception et l'armement embarqué.");
    if (!pos) return setErr("Position du port d'attache illisible : colle des coordonnées (48.39, -4.43) ou un lien de carte.");
    onSave({ categorie: cat, armement: arm, abris: [{ name: port.trim() || "Port d'attache", lat: pos.lat, lon: pos.lon }], vitesseNds: num(v), tempsMaxMin: num(tmax) ?? 60,
      limites: { ventBf: num(lv), merM: num(lm) }, seul, canne: { min: num(cmin), max: num(cmax) }, updatedAt: Date.now() });
  };
  return (
    <form onSubmit={submit} aria-label="Ton bateau">
      <span style={lbl}>Catégorie de conception (plaque du constructeur)</span>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{Object.entries(CAT).map(([k, l]) => <Chip key={k} color={C.accent} active={cat === k} onClick={() => setCat(k)}>{l}</Chip>)}</div>
      <span style={lbl}>Armement embarqué</span>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{Object.entries(ARM).map(([k, l]) => <Chip key={k} color={C.accent} active={arm === k} onClick={() => setArm(k)}>{l}</Chip>)}</div>
      <label style={lbl} htmlFor="pf-port">Port d'attache (abri)</label>
      <input id="pf-port" style={inp} value={port} onChange={(e) => setPort(e.target.value)} placeholder="Le Moulin Blanc"/>
      <label style={lbl} htmlFor="pf-coords">Position du port</label>
      <input id="pf-coords" style={inp} value={coords} onChange={(e) => setCoords(e.target.value)} placeholder="48.3903, -4.4318" inputMode="text"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,alignItems:"end"}}>
        <div><label style={lbl} htmlFor="pf-v">Vitesse de route (nœuds)</label><input id="pf-v" style={inp} value={v} onChange={(e) => setV(e.target.value)} inputMode="decimal"/></div>
        <div><label style={lbl} htmlFor="pf-t">Route au plus (min)</label><input id="pf-t" style={inp} value={tmax} onChange={(e) => setTmax(e.target.value)} inputMode="numeric"/></div>
        <div><label style={lbl} htmlFor="pf-lv">Ta limite de vent (force)</label><input id="pf-lv" style={inp} value={lv} onChange={(e) => setLv(e.target.value)} inputMode="numeric" placeholder="4"/></div>
        <div><label style={lbl} htmlFor="pf-lm">Ta limite de mer (m)</label><input id="pf-lm" style={inp} value={lm} onChange={(e) => setLm(e.target.value)} inputMode="decimal" placeholder="1"/></div>
        <div><label style={lbl} htmlFor="pf-cmin">Canne : poids mini (g)</label><input id="pf-cmin" style={inp} value={cmin} onChange={(e) => setCmin(e.target.value)} inputMode="numeric"/></div>
        <div><label style={lbl} htmlFor="pf-cmax">Canne : poids maxi (g)</label><input id="pf-cmax" style={inp} value={cmax} onChange={(e) => setCmax(e.target.value)} inputMode="numeric"/></div>
      </div>
      <label style={{...lbl,display:"flex",alignItems:"center",gap:10,minHeight:44}}><input type="checkbox" checked={seul} onChange={(e) => setSeul(e.target.checked)} style={{width:22,height:22}}/>Seul à bord</label>
      {err && <Alert tone={C.bad} role="alert">{err}</Alert>}
      <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
        <button type="submit" style={buttonStyle(C.accent, true)}>Enregistrer ton bateau</button>
        {onCancel && <button type="button" onClick={onCancel} style={buttonStyle(C.muted)}>Annuler</button>}
      </div>
      <p style={muted}>Gardé sur ce téléphone. Ces réponses servent seulement à la sécurité et aux conseils ; rien n'est supposé à ta place.</p>
    </form>
  );
}

const Score = ({ k, v, sub }) => (
  <span style={{display:"inline-flex",flexDirection:"column",minWidth:64}}>
    <span style={{fontSize:11.5,fontWeight:700,color:C.muted,letterSpacing:"0.03em"}}>{k}</span>
    <span style={{fontFamily:font.display,fontSize:20,fontWeight:700,color:C.strong,lineHeight:1.1}}>{v == null ? "–" : v}<span style={{fontSize:11,color:C.muted}}>{v == null ? "" : "/100"}</span></span>
    {sub && <span style={{fontSize:11.5,color:C.muted}}>{sub}</span>}
  </span>
);

/** Heures d'une zone pour le moteur (séries Open-Meteo de l'onglet : temps en secondes). */
function hoursOf(ser) {
  if (!ser?.time) return [];
  return ser.time.map((s, i) => ({ t: s * 1000, wind: ser.wind?.[i] ?? null, gust: ser.gust?.[i] ?? null, wave: ser.wave?.[i] ?? null, period: ser.period?.[i] ?? null,
    visibility: ser.visibility?.[i] ?? null, code: ser.code?.[i] ?? null, cape: ser.cape?.[i] ?? null, sst: ser.sst?.[i] ?? null }));
}

export function Sortie({ spots, wx, dateISO, isToday, tideAt, trips = [], parisMs, catchCount }) {
  const [profile, setProfile] = useState(loadProfile);
  const [editing, setEditing] = useState(false);
  const nowH = Math.min(20, Math.max(5, new Date(Date.now() + 36e5).toLocaleString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", hour12: false }) * 1 || 7));
  const [h0, setH0] = useState(isToday ? nowH : 7), [h1, setH1] = useState(isToday ? Math.min(23, nowH + 4) : 12);
  const problems = profileProblems(profile);
  const caught = useMemo(() => Object.fromEntries(["lieu-noir", "lieu-jaune", "maquereau", "bar", "vieille", "saint-pierre"].map((id) => [id, trips.reduce((s, t) => s + catchCount(t, id), 0)])), [trips, catchCount]);
  const tripsBy = useMemo(() => Object.fromEntries(Object.keys(caught).map((id) => [id, trips.filter((t) => catchCount(t, id) > 0).length])), [trips, caught, catchCount]);

  const res = useMemo(() => {
    if (problems.length || !spots.length || !wx?.byId) return null;
    const start = parisMs(dateISO, `${String(h0).padStart(2, "0")}:00`), end = parisMs(dateISO, `${String(h1).padStart(2, "0")}:00`);
    if (!(end > start)) return null;
    const zones = spots.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lon: s.lon, type: s.type, depth: s.depth ?? null, raz: /raz/i.test(`${s.name} ${s.notes || ""}`) }));
    // Chaque zone a sa météo : on l'évalue seule, puis on assemble.
    const ageH = wx.at ? (Date.now() - wx.at) / 36e5 : null;
    const all = zones.map((zone) => {
      const hours = hoursOf(wx.byId[zone.id]);
      const tide = tideAt(spots.find((x) => x.id === zone.id), dateISO);
      const mid = (start + end) / 2;
      const pm = tide?.events?.filter((e) => e.type === "PM" && Math.abs(e.ms - mid) < 13 * 36e5).sort((a, b) => Math.abs(a.ms - mid) - Math.abs(b.ms - mid))[0];
      const sstv = hours.filter((h) => h.t >= start && h.t <= end && Number.isFinite(h.sst)).map((h) => h.sst);
      return evaluateTrip({ profile, zones: [zone], hours, start, end, sun: sunAt(dateISO, zone.lat, zone.lon), ageH, date: dateISO,
        tide: { phase: tidePhase(tide?.events, mid), coef: pm?.coef ?? null }, sst: sstv.length ? sstv.reduce((a, b) => a + b, 0) / sstv.length : null, caught, trips: tripsBy }).zones[0];
    });
    const order = { ok: 0, verify: 1, nr: 2 };
    all.sort((a, b) => order[a.safety.status] - order[b.safety.status] || (b.species.especes[0]?.fav ?? -1) - (a.species.especes[0]?.fav ?? -1));
    return { zones: all, status: all[0]?.safety.status || "verify", start, end };
  }, [problems.length, spots, wx, dateISO, h0, h1, profile, tideAt, parisMs, caught, tripsBy]);

  const T = thresholds(profile || {});
  const hours = Array.from({ length: 19 }, (_, i) => i + 5);
  const best = res?.zones[0];
  const reasons = best ? best.safety.rules.filter((r) => r.status !== "ok") : [];
  return (
    <section aria-labelledby="off-sortie-h" style={{...box,borderColor:res ? `${STC[res.status]}88` : C.line}}>
      <h2 id="off-sortie-h" style={{fontSize:19,margin:"0 0 6px",fontFamily:font.display}}>{isToday ? "Sortir aujourd'hui ?" : "Sortir ce jour-là ?"}</h2>
      {(!profile || editing) ? (
        <>
          {!profile && <p style={{...muted,marginTop:0}}>Pour juger une sortie, le moteur a besoin de ton bateau : catégorie, armement, port d'attache. Il ne suppose rien.</p>}
          <ProfileForm initial={profile} onSave={(p) => { saveProfile(p); setProfile(p); setEditing(false); }} onCancel={profile ? () => setEditing(false) : null}/>
        </>
      ) : (
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap",fontSize:13.5,color:C.muted}}>
            <span>Catégorie {profile.categorie} · {ARM[profile.armement]} · {profile.abris?.[0]?.name}{profile.seul ? " · seul à bord" : ""}</span>
            <button type="button" onClick={() => setEditing(true)} style={{...buttonStyle(C.accent),minHeight:40,fontSize:14}}>Modifier ton bateau</button>
          </div>
          {problems.length > 0 && <div style={{marginTop:10}}><Alert tone={C.warn}>Profil incomplet : {problems.join(" ; ")}.</Alert></div>}
          <div style={{display:"flex",gap:10,marginTop:10,flexWrap:"wrap",alignItems:"flex-end"}}>
            <label style={{fontSize:13.5,color:C.muted}}>Départ<select value={h0} onChange={(e) => setH0(+e.target.value)} style={{...inp,width:110,display:"block",marginTop:4}}>{hours.map((h) => <option key={h} value={h}>{h} h</option>)}</select></label>
            <label style={{fontSize:13.5,color:C.muted}}>Retour<select value={h1} onChange={(e) => setH1(+e.target.value)} style={{...inp,width:110,display:"block",marginTop:4}}>{hours.filter((h) => h > h0).map((h) => <option key={h} value={h}>{h} h</option>)}</select></label>
          </div>
          {!spots.length && <p style={muted}>Ajoute une zone (tes spots bateau, ci-dessous) : la sécurité se juge zone par zone.</p>}
          {spots.length > 0 && !wx?.byId && <p style={muted}>Conditions en cours de chargement…</p>}
          {res && (
            <div role="status" style={{marginTop:12,padding:"12px 14px",borderRadius:12,background:`${STC[res.status]}1f`,border:`1px solid ${STC[res.status]}88`}}>
              <div style={{fontFamily:font.display,fontSize:21,fontWeight:700,color:C.strong}}>
                {res.status === "ok" ? `Oui, de ${h0} h à ${h1} h` : res.status === "verify" ? "À vérifier avant de partir" : "Non : sortie non recommandée"}
              </div>
              {best && <div style={{fontSize:14,color:C.text,marginTop:2}}>{res.status === "nr" ? "Même la zone la plus sûre" : "Meilleure zone"} : <b>{best.zone.name}</b>{best.safety.distanceMilles != null ? ` · ${fr(best.safety.distanceMilles)} milles de l'abri` : ""}{best.routeMin != null ? ` · ${Math.round(best.routeMin)} min de route` : ""}</div>}
              {reasons.length > 0 && <ul style={{margin:"8px 0 0",paddingLeft:18,fontSize:13.5,color:C.text,lineHeight:1.5}}>{reasons.map((r) => <li key={r.id}><b style={{color:STC[r.status]}}>{STL[r.status]}</b> · {r.label} : {r.reason}</li>)}</ul>}
            </div>
          )}
          {res?.zones.map(({ zone, safety, species }) => (
            <details key={zone.id} style={{marginTop:10,border:`1px solid ${C.line}`,borderRadius:12,background:C.card2}}>
              <summary style={{cursor:"pointer",padding:"11px 12px",minHeight:44,display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",color:C.strong,fontWeight:700}}>
                <span>{zone.name}</span><span style={{fontSize:13,color:STC[safety.status]}}>{STL[safety.status]}</span>
              </summary>
              <div style={{padding:"0 12px 12px"}}>
                <div style={{fontSize:12.5,fontWeight:700,color:C.muted,letterSpacing:"0.04em",margin:"4px 0 4px"}}>SÉCURITÉ (PIRE MOMENT DU CRÉNEAU)</div>
                <ul style={{margin:0,padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:4}}>
                  {safety.rules.map((r) => <li key={r.id} style={{fontSize:13.5,color:C.text,lineHeight:1.45}}><span style={{color:STC[r.status],fontWeight:700}}>{r.status === "ok" ? "✓" : r.status === "verify" ? "?" : "✕"}</span> {r.label} — {r.reason}</li>)}
                </ul>
                <div style={{fontSize:12.5,fontWeight:700,color:C.muted,letterSpacing:"0.04em",margin:"12px 0 6px"}}>ESPÈCES OUVERTES</div>
                {species.especes.map((e) => (
                  <div key={e.id} style={{padding:"9px 0",borderTop:`1px solid ${C.line2}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,color:C.strong}}>{e.nom} <i style={{fontWeight:400,color:C.muted,fontSize:12.5}}>{e.latin}</i></span>
                      <span style={{display:"flex",gap:10}}>
                        <Score k="Favorabilité" v={safety.status === "nr" ? null : e.fav} sub={safety.status === "nr" ? "sortie non recommandée" : e.fav == null ? "trop peu de critères" : null}/>
                        <Score k="Pertinence" v={e.pert.score} sub={e.pert.provisoire ? "provisoire" : null}/>
                        <Score k="Confiance" v={e.conf.score} sub={e.conf.label}/>
                      </span>
                    </div>
                    <div style={{fontSize:13,color:C.text,marginTop:4,lineHeight:1.45}}>{e.technique}{e.poids ? ` · ≈ ${e.poids} g` : ""}</div>
                    <div style={{fontSize:12.5,color:e.reg.statut === "VÉRIFIÉ" ? C.muted : C.warn,marginTop:2}}>⚖ {e.reg.texte}</div>
                  </div>
                ))}
                {species.nonProposees.length > 0 && <p style={muted}>Non proposées : {species.nonProposees.map((x) => `${x.nom} (${x.reason})`).join(" ; ")}.</p>}
              </div>
            </details>
          ))}
          <p style={muted}>Seuils de vent et de mer : ceux proposés par la spécification, à valider par toi (à vérifier dès la force {T.verBf}, non recommandé dès la force {T.nonBf} ou {T.nonGust} km/h de rafales ; mer agitée dès {fr(T.merVer, 2)} m). Ta limite et la catégorie du bateau passent avant.</p>
        </>
      )}
      <div style={{marginTop:12,padding:"10px 12px",borderRadius:12,border:`1px solid ${C.line}`}}>
        <div style={{fontSize:12.5,fontWeight:700,color:C.muted,letterSpacing:"0.04em",marginBottom:4}}>TOUJOURS</div>
        <ul style={{margin:0,paddingLeft:18,fontSize:13.5,color:C.text,lineHeight:1.5}}>
          {RAPPELS.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </div>
    </section>
  );
}
