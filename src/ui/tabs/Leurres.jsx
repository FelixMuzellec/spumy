// Leurres : le conseil complet pour un spot et un créneau (type, couleur,
// taille, montage, animation), ta boîte, la fiche du spot, les proies du mois
// et les repères qui fondent chaque conseil, avec leurs sources.
import { useMemo, useState } from "react";
import { SITE } from "SITE_CONFIG";
import { BOITE, CANNE, catalogWith, DEPTH_CLASS, FAMILLES, LURE_SOURCES, lureAdvice } from "../../engine/lures.js";
import { origSize } from "../../engine/tackle.js";
import { adviceForSpot, preyForMonth } from "../../engine/model.js";
import { Pill } from "../components.jsx";
import { Alert, C, Card, Chip, Disclosure, Muted, Src, Stack, Why, fr, num } from "../kit.jsx";

const S = LURE_SOURCES;
const LIGHT = { nuit: "nuit", basse: "basse lumière", couvert: "ciel couvert", soleil: "plein soleil", jour: "jour" };
const CUR = { fort: ["↯ courant fort", C.bad], soutenu: ["↯ courant soutenu", C.warn], faible: ["≈ près de l'étale", C.good] };
const WIND = { face: "de face", dos: "de dos", travers: "de travers" };
// Une animation « générale » n'est pas propre au leurre : on le dit.
const anim = (items) => (items || []).map((x) => (x.gen ? { ...x, t: `${x.t} (conseil général, aucune consigne du fabricant relevée)` } : x));

/** Corrections de ta boîte : poids pesés (copies comprises), nage du balsa, tes leurres à bavette. */
function BoxEditor({ g }) {
  const ov = g.boxOv || {};
  const CATALOGUE = catalogWith(ov);
  const save = (patch) => g.setBoxOv({ ...ov, ...patch });
  const inp = { background:C.card2, color:C.text, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px 10px", fontSize:15, width:"100%", minHeight:40 };
  // Leurres durs de ta boîte, taille par taille (le poids d'un souple dépend de sa tête).
  const hard = [];
  for (const b of BOITE) {
    const c = CATALOGUE[b.cat];
    const sizes = b.allSizes ? Object.keys(c.sizes) : b.size ? [String(b.size)] : [];
    for (const len of sizes) { const sp = origSize(b.cat, len); if (sp && !sp.heads && !sp.weights && sp.g != null && c.fam !== "weightless") hard.push({ key: `${b.cat}:${len}`, label: `${c.name} ${len}${c.sizeIsWeight ? " g" : ""}`, g: sp.g }); }
  }
  const [bav, setBav] = useState(() => (Array.isArray(ov.bavettes) && ov.bavettes.length ? ov.bavettes : [{ nom: "", len: "", g: "" }]));
  const num = (v) => { const x = parseFloat(String(v).replace(",", ".")); return Number.isFinite(x) && x > 0 ? x : null; };
  return (
    <Disclosure title="Corriger ta boîte" sub="Poids pesés, nage du balsa, tes leurres à bavette — commun à tous les guides">
      <div style={{fontSize:13.5,fontWeight:700,color:C.strong}}>Poids pesés</div>
      <Muted style={{marginTop:2}}>Laisse vide pour garder le poids du fabricant. Utile pour les copies.</Muted>
      <div style={{display:"grid",gap:6,marginTop:6}}>
        {hard.map((h) => (
          <label key={h.key} style={{display:"grid",gridTemplateColumns:"1fr 96px",gap:8,alignItems:"center",fontSize:14}}>
            <span>{h.label} <span style={{color:C.faint}}>· fiche {String(h.g).replace(".", ",")} g</span></span>
            <input aria-label={`Poids pesé ${h.label}`} inputMode="decimal" placeholder="g" defaultValue={ov.poids?.[h.key] != null ? String(ov.poids[h.key]).replace(".", ",") : ""} style={inp}
              onBlur={(e) => { const p = { ...(ov.poids || {}) }; const v = num(e.target.value); if (v) p[h.key] = v; else delete p[h.key]; save({ poids: p }); }}/>
          </label>
        ))}
      </div>
      <div style={{fontSize:13.5,fontWeight:700,color:C.strong,marginTop:14}}>Leurre balsa 130 (20 g) : comment nage-t-il ?</div>
      <select aria-label="Nage du leurre balsa" value={ov.balsa?.nage || ""} onChange={(e) => save({ balsa: e.target.value ? { nage: e.target.value } : null })} style={{...inp,marginTop:6}}>
        <option value="">Je ne sais pas (jamais conseillé)</option>
        <option value="surface">En surface (stickbait, pencil)</option>
        <option value="sous-surface">Sous la surface (minnow flottant)</option>
        <option value="coulant">Il coule</option>
      </select>
      <div style={{fontSize:13.5,fontWeight:700,color:C.strong,marginTop:14}}>Tes leurres à bavette</div>
      <div style={{display:"grid",gap:6,marginTop:6}}>
        {bav.map((x, i) => (
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 72px 72px 40px",gap:6}}>
            <input aria-label={`Nom du leurre à bavette ${i + 1}`} placeholder="Artist FR80…" value={x.nom} onChange={(e) => setBav(bav.map((y, j) => (j === i ? { ...y, nom: e.target.value } : y)))} style={inp}/>
            <input aria-label={`Taille en mm ${i + 1}`} inputMode="numeric" placeholder="mm" value={x.len} onChange={(e) => setBav(bav.map((y, j) => (j === i ? { ...y, len: e.target.value } : y)))} style={inp}/>
            <input aria-label={`Poids en g ${i + 1}`} inputMode="decimal" placeholder="g" value={x.g} onChange={(e) => setBav(bav.map((y, j) => (j === i ? { ...y, g: e.target.value } : y)))} style={inp}/>
            <button aria-label={`Retirer le leurre ${i + 1}`} onClick={() => setBav(bav.length > 1 ? bav.filter((_, j) => j !== i) : [{ nom: "", len: "", g: "" }])} style={{border:`1px solid ${C.line}`,borderRadius:8,background:"none",color:C.muted,minHeight:40,cursor:"pointer"}}>✕</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
        <button onClick={() => setBav([...bav, { nom: "", len: "", g: "" }])} style={{minHeight:40,padding:"0 12px",borderRadius:8,border:`1px solid ${C.line}`,background:"none",color:C.text,cursor:"pointer"}}>+ Ajouter</button>
        <button onClick={() => save({ bavettes: bav.map((x) => ({ nom: x.nom.trim(), len: num(x.len), g: num(x.g) })).filter((x) => x.len && x.g) })}
          style={{minHeight:40,padding:"0 14px",borderRadius:8,border:`1px solid ${C.accent}`,background:`${C.accent}22`,color:C.strong,fontWeight:700,cursor:"pointer"}}>Enregistrer les bavettes</button>
      </div>
      <Muted>Ces corrections restent sur ce téléphone et servent à tous les guides.</Muted>
    </Disclosure>
  );
}
/** Le leurre de ta boîte pour ce créneau : modèle, poids, couleur, nage, et pourquoi. */
export function PickBlock({ p, a, compact = false }) {
  if (!p) return <Muted style={{marginTop:0}}>Rien dans ta boîte ne se pêche ici dans ces conditions.</Muted>;
  // v9.2 — Paramètres clés en tuiles : on les lit d'un coup d'œil, sur l'eau.
  const tile = (k, v, sub) => (
    <div style={{padding:"9px 10px",borderRadius:12,background:C.card2,border:`1px solid ${C.line}`,minWidth:0}}>
      <div style={{fontSize:12.5,fontWeight:700,color:C.muted}}>{k}</div>
      <div style={{fontSize:16,fontWeight:800,color:C.strong,lineHeight:1.25,marginTop:2,overflowWrap:"anywhere"}}>{v}</div>
      {sub && <div style={{fontSize:12.5,color:C.muted,marginTop:2}}>{sub}</div>}
    </div>
  );
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(96px,1fr))",gap:8}}>
        {tile("Poids", p.weight?.text || "—")}
        {tile("Nage", p.layerLabel, p.kind)}
        {tile("Couleur", p.color.name, p.color.named ? null : "tu as « un peu de tout »")}
      </div>
      {p.warn.map((w, i) => <div key={i} style={{marginTop:8}}><Alert tone={C.warn}>{w.charAt(0).toUpperCase() + w.slice(1)}.</Alert></div>)}
      {!compact && <Why items={[...(p.sizeWhy ? [p.sizeWhy] : []), ...p.why, ...(a.weight.why.slice(0, 1)), ...(p.weight?.use ? [p.weight.use] : [])]} sources={S} compact/>}
      {!compact && p.note && <Muted>{p.note}</Muted>}
    </div>
  );
}

function Ref({ rows }) {
  return (
    <div style={{display:"flex",flexDirection:"column"}}>
      {rows.map(([k, v, s], i) => (
        <div key={i} style={{padding:"9px 0",borderTop:i ? `1px solid ${C.line2}` : "none"}}>
          <div style={{fontSize:14,fontWeight:700,color:C.strong}}>{k}</div>
          <div style={{fontSize:14,color:C.text,lineHeight:1.5,marginTop:2}}>{v}</div>
          {s && <Src src={S[s]} short/>}
        </div>
      ))}
    </div>
  );
}

export function Leurres({ g }) {
  const spot = g.activeSpot;
  const winsDay = (spot?.windows || []).filter((w) => Math.abs(w.offsetBefore) < 50 && Number.isFinite(w.startDecimal));
  // v8.12 : les créneaux déjà finis ne sont plus proposés ; s'ils le sont tous, le conseil porte sur le dernier.
  const wins = winsDay.filter((w) => !w.past);
  const allGone = winsDay.length > 0 && !wins.length;
  // Créneau demandé depuis la synthèse (« meilleur créneau de plein jour »), sinon le meilleur du spot.
  const [winId, setWinId] = useState(() => (g.lureWin && g.lureWin.spotId === spot?.id ? g.lureWin.winId : null));
  const w = wins.find((x) => x.id === winId) || wins.find((x) => x.id === spot?.bestWindowId) || wins[0] || winsDay[winsDay.length - 1];
  const a = useMemo(() => (spot ? lureAdvice(spot, w, g.live, g.selectedDate, g.lureCtx) : null), [spot, w, g.live, g.selectedDate, g.lureCtx]);
  if (!spot || !a) return <Muted>Aucun spot à conseiller.</Muted>;
  const sit = a.sit;
  const second = a.fams[1];
  const month = sit.month;
  const prey = preyForMonth(month);
  const sel = { background:C.card2, color:C.text, border:`1px solid ${C.line}`, borderRadius:8, padding:"8px 10px", fontSize:15, width:"100%" };
  const CATALOGUE = catalogWith(g.boxOv);

  return (
    <Stack>
      <Card title="Pour quel spot, quel créneau ?">
        <select aria-label="Spot" value={spot.id} onChange={(e) => { g.setSpotId(e.target.value); setWinId(null); }} style={sel}>
          {g.allScored.map((s) => <option key={s.id} value={s.id}>{s.name}{s.eligible ? ` · ${fr(s.score)}` : ""}</option>)}
        </select>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
          {wins.map((x) => (
            <Chip key={x.id} color={x.id === spot.bestWindowId ? C.good : C.accent} active={x.id === w?.id} onClick={() => setWinId(x.id)}>
              {x.startFmt}–{x.endFmt}{x.light && x.light.band !== "inconnu" ? ` · ${x.light.label.toLowerCase()}` : ""}
            </Chip>
          ))}
        </div>
        {allGone && <Muted style={{marginTop:0}}>Tous les créneaux d'aujourd'hui sur ce spot sont passés : le conseil porte sur le dernier.{" "}
          <button onClick={() => g.pickDate(g.isoAddDays(g.todayISO, 1))} style={{background:"none",border:"none",padding:0,minHeight:44,color:C.accent,fontSize:13,fontWeight:600,cursor:"pointer",textDecoration:"underline"}}>Voir demain</button></Muted>}
        {!g.live && <Muted>Sans météo : le conseil s'appuie sur la lumière, le fond et la saison seulement.</Muted>}
      </Card>

      <Card tone={C.good} kicker="Dans ta boîte, pour ce créneau" title={a.pick ? a.pick.name : "Aucun leurre adapté"}>
        <PickBlock p={a.pick} a={a}/>
        {a.pick && (
          <>
            <div style={{fontSize:12.5,fontWeight:600,color:C.muted,marginTop:12}}>Animation</div>
            <Why items={anim(a.anim)} sources={S} compact/>
          </>
        )}
        {a.alts.map((x) => (
          <div key={x.role} style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.line}`}}>
            <div style={{fontSize:12.5,fontWeight:600,color:C.muted}}>{x.role}</div>
            <div style={{fontSize:15,fontWeight:700,color:C.strong}}>{x.name} · {x.weight?.text}{x.color.named ? ` · ${x.color.name}` : ""}</div>
            <Why items={x.why.slice(0, 2)} sources={S} compact/>
            {x.warn.length > 0 && <div style={{fontSize:13,color:C.warn,marginTop:3}}>{x.warn.join(" ; ")}</div>}
          </div>
        ))}
        {a.pick && a.pick.fam !== a.best.k && (
          <Muted>La famille la mieux placée est « {a.best.court.toLowerCase()} » ; dans ta boîte, {a.pick.name} colle mieux à ce créneau (taille, poids, vent ou couleur).</Muted>
        )}
      </Card>

      <Card kicker="La situation" title={`${spot.name}${w ? ` · ${w.startFmt} → ${w.endFmt}` : ""}`}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <Chip color={C.warn}>{sit.light === "nuit" ? "🌙" : sit.light === "basse" ? "🌅" : "☀"} {LIGHT[sit.light]}</Chip>
          {sit.sea && <Chip color={C.accent}>🌊 {sit.seaLabel} ({sit.seaWhy})</Chip>}
          <Chip color={C.accent}>💧 eau {sit.clarity} (estimée)</Chip>
          {(sit.strongCurrent || sit.current.level === "faible") && CUR[sit.current.level] && <Chip color={CUR[sit.current.level][1]} title={sit.current.label}>{CUR[sit.current.level][0]}</Chip>}
          {sit.wind?.side && <Chip color={sit.wind.face && sit.wind.F >= 4 ? C.warn : C.muted}>🌬 vent {WIND[sit.wind.side]} F{sit.wind.F}</Chip>}
          {sit.depthEst && <Chip color={C.muted} title={sit.depthEst.why}>↧ {sit.depthEst.label}{sit.depthEst.level != null ? ` · marée à ${Math.round(sit.depthEst.level * 100)} %` : ""}</Chip>}
          <Chip color={sit.terr.gratter === "non" ? C.bad : sit.terr.gratter === "texan" ? C.warn : C.good}>🪨 {sit.terr.gratter === "non" ? "pas de grattage" : sit.terr.gratter === "texan" ? "texan sur fond mixte" : "fond dégagé"}</Chip>
          {sit.prey[0] && <Chip color={C.good}>🐟 {sit.prey[0].name.toLowerCase()}{sit.prey[0].size !== "—" ? ` ${sit.prey[0].size}` : ""}</Chip>}
          {sit.sst != null && <Chip color={C.muted}>🌡 eau {fr(sit.sst)} °C{sit.cold ? " · froide" : ""}</Chip>}
        </div>
        <div style={{marginTop:10}}>
          <div style={{fontSize:12.5,fontWeight:600,color:C.muted,marginBottom:4}}>L'eau, vue sur place aujourd'hui</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["claire", "teintée", "chargée"].map((v) => {
              const on = spot.eauObs?.date === g.selectedDate && spot.eauObs.v === v;
              return <Chip key={v} color={C.accent} active={on} onClick={() => g.setEauObs(spot.id, g.selectedDate, on ? null : v)}>{v}</Chip>;
            })}
          </div>
          {!sit.eauObservee && <div style={{fontSize:12.5,color:C.faint,marginTop:4}}>Sans ton observation, la clarté est estimée (ci-dessous).</div>}
        </div>
        <Why items={[...sit.clarityWhy, ...(sit.currentWhy ? [sit.currentWhy] : []), ...sit.current.why,
          ...(sit.depthEst ? [{ t: `Profondeur estimée d'après la fiche, aucune sonde : ${sit.depthEst.why}`, s: "fiche" }] : [])]} sources={S} compact/>
      </Card>

      <Card kicker="Famille de leurre" title={a.best.label}>
        <Why items={a.best.why} sources={S}/>
        {second && second.score > 0 && (
          <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.line}`}}>
            <div style={{fontSize:12.5,fontWeight:600,color:C.muted}}>{second.score === a.best.score ? "À égalité (la fiche du spot a départagé)" : "Second choix"}</div>
            <div style={{fontSize:15,fontWeight:700,color:C.strong}}>{second.label}</div>
            <Why items={second.why.filter((x) => x.v > 0)} sources={S} compact/>
          </div>
        )}
        <Muted>Le classement des familles croise ces règles ; il est déduit, les règles sont sourcées.</Muted>
      </Card>

      <Card kicker="Couleur" title={a.color.label}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{a.color.palette.map((p) => <Chip key={p} color={C.accent}>{p}</Chip>)}</div>
        <Why items={a.color.why} sources={S}/>
      </Card>

      <Card kicker="Taille et poids">
        <div style={{fontSize:12.5,fontWeight:600,color:C.muted}}>Taille</div>
        <p style={{margin:"1px 0 0",fontSize:15,color:C.strong,lineHeight:1.45}}>{a.size.text}</p>
        <Why items={a.size.why} sources={S} compact/>
        <div style={{fontSize:12.5,fontWeight:600,color:C.muted,marginTop:12}}>Poids et montage</div>
        <p style={{margin:"1px 0 0",fontSize:15,color:C.strong,lineHeight:1.45}}>{a.weight.text}</p>
        <Why items={a.weight.why.filter((x) => x.t !== a.weight.text)} sources={S} compact/>
      </Card>

      <Disclosure title="Toute ta boîte, classée pour ce créneau" sub={`${a.boxRanked.length} leurres possibles ici, sur ${BOITE.length} déclarés le 26/10/2026`}>
        {a.boxRanked.map((o, i) => (
          <div key={o.id} style={{padding:"9px 0",borderTop:i ? `1px solid ${C.line2}` : "none"}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
              <b style={{fontSize:15,color:C.strong}}>{o.name}</b>
              <span style={{fontSize:13,color:C.muted}}>{FAMILLES[o.fam].court.toLowerCase()} · {o.layerLabel}</span>
            </div>
            <div style={{fontSize:14,color:C.text,marginTop:2}}>{o.weight?.text || "poids non relevé"}{o.color.named ? ` · ${o.color.name}` : ""}</div>
            {o.warn.length > 0 && <div style={{fontSize:13,color:C.warn,marginTop:2}}>{o.warn.join(" ; ")}</div>}
          </div>
        ))}
        {BOITE.filter((b) => !a.boxRanked.some((o) => o.boxId === b.id)).length > 0 && (
          <Muted>Pas proposés ici : {BOITE.filter((b) => !a.boxRanked.some((o) => o.boxId === b.id)).map((b) => {
            const c = CATALOGUE[b.cat];
            const why = !c.layer ? "nage à préciser" : c.layer === "surface" ? "surface impraticable selon la fiche" : c.layer === "fond" ? "fond trop encroché" : "";
            return `${c.name}${b.size ? ` ${b.size}` : ""}${why ? ` (${why})` : ""}`;
          }).join(", ")}.</Muted>
        )}
      </Disclosure>

      <BoxEditor g={g}/>

      <Disclosure title="Fiches techniques de ta boîte" sub={`Poids, nage et consignes des fabricants, avec leurs sources · ta canne : ${CANNE.min} à ${CANNE.max} g`}>
        {Object.entries(CATALOGUE).filter(([k]) => BOITE.some((b) => b.cat === k)).map(([k, c], i) => (
          <div key={k} style={{padding:"9px 0",borderTop:i ? `1px solid ${C.line2}` : "none"}}>
            <b style={{fontSize:15,color:C.strong}}>{c.name}</b>
            <div style={{fontSize:13.5,color:C.muted,marginTop:2}}>{c.kind}{c.float ? ` · ${c.float}` : ""}</div>
            <div style={{fontSize:14,color:C.text,marginTop:3}}>{Object.entries(c.sizes).map(([len, sp]) => c.sizeIsWeight ? `${len} g` : `${len} mm : ${sp.g != null ? `${String(sp.g).replace(".", ",")} g` : sp.heads ? `têtes ${sp.heads.map(([n, g]) => `${n} ${String(g).replace(".", ",")}`).join(", ")} g` : sp.weights ? `${sp.weights.map((g) => String(g).replace(".", ",")).join(", ")} g` : "poids non relevé"}`).join(" · ") || "tailles à préciser"}</div>
            {[...new Set(Object.values(c.sizes).map((sp) => sp.alt).filter(Boolean))].map((t) => <div key={t} style={{fontSize:13,color:C.muted,marginTop:2}}>Selon les sources : {t}.</div>)}
            <Why items={[...c.facts, ...[...new Set(Object.values(c.sizes).map((sp) => sp.s).filter(Boolean))].map((k) => ({ t: "Poids et tailles relevés ici.", s: k }))]} sources={S} compact/>
          </div>
        ))}
      </Disclosure>

      {a.models.length > 0 && (
        <Disclosure title="Modèles cités par les sources" sub={`${a.models.length} référence${a.models.length > 1 ? "s" : ""} pour cette situation`}>
          <Why items={a.models} sources={S}/>
        </Disclosure>
      )}

      <Disclosure title="Leurres de la fiche du spot" sub={`${a.spotLures.length} leurres, classés pour ce créneau`}>
        {a.spotLures.map((l, i) => (
          <div key={i} style={{padding:"9px 0",borderTop:i ? `1px solid ${C.line2}` : "none"}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
              <b style={{fontSize:15,color:C.strong}}>{l.name}</b>
              {i === 0 && l.fit > 0 && <Pill color={C.good}>Le plus adapté</Pill>}
            </div>
            <div style={{fontSize:13.5,color:C.muted,marginTop:2}}>{FAMILLES[l.fam].court} · {l.color} · {l.weight}</div>
            <div style={{fontSize:14,color:C.text,marginTop:3,lineHeight:1.5}}>{l.technique}</div>
          </div>
        ))}
      </Disclosure>

      <Disclosure title="Ce que mange le bar ce mois-ci" sub={`Proies du mois, adaptées au fond de ce spot${prey[0] ? ` · surtout ${prey[0].name.toLowerCase()}` : ""}`}>
        {prey.map((p, i) => { const ad = adviceForSpot(spot, p); return (
          <div key={p.name} style={{padding:"9px 0",borderTop:i ? `1px solid ${C.line2}` : "none"}}>
            <div style={{display:"flex",gap:6,alignItems:"baseline",flexWrap:"wrap"}}>
              <b style={{fontSize:15,color:C.strong}}>{p.name}</b>
              <span style={{fontSize:13,color:C.muted}}>{p.size !== "—" ? p.size + " · " : ""}{p.couche}</span>
              {i === 0 && <Pill color={C.good}>Dominante</Pill>}
            </div>
            {ad.adapted && <div style={{fontSize:14,color:ad.replaces ? "#fca5a5" : "#fcd34d",marginTop:3,lineHeight:1.5}}>{ad.note}</div>}
            <div style={{fontSize:14,color:C.muted,marginTop:3,lineHeight:1.5}}>{ad.replaces ? "Ailleurs : " : ""}{ad.text}</div>
          </div>
        ); })}
      </Disclosure>

      <Disclosure title="Créneau par créneau" sub="Le conseil résumé pour chaque créneau du jour">
        {wins.map((x, i) => {
          const ax = lureAdvice(spot, x, g.live, g.selectedDate, g.lureCtx);
          return (
            <button key={x.id} onClick={() => { setWinId(x.id); try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { /* sans effet */ } }}
              style={{display:"flex",width:"100%",justifyContent:"space-between",gap:10,padding:"10px 0",border:"none",borderTop:i ? `1px solid ${C.line2}` : "none",background:"none",color:C.text,cursor:"pointer",textAlign:"left"}}>
              <span style={{...num,fontWeight:700,color:C.strong,flexShrink:0}}>{x.startFmt}–{x.endFmt}</span>
              <span style={{fontSize:14,textAlign:"right"}}>{ax.summary}<br/><span style={{fontSize:12.5,color:C.muted}}>{x.light?.label?.toLowerCase()}{x.eligible ? ` · note ${fr(x.score)}` : " · non praticable"}</span></span>
            </button>
          );
        })}
      </Disclosure>

      <Disclosure title="Repères : les couleurs" sub="Selon l'eau, la lumière et la proie">
        <Ref rows={[
          ["Eau claire, plein soleil", "Naturel, translucide ou légèrement pailleté. Bleu sardine, blanc, gris, vert ayu.", "couleurMeteo"],
          ["Eau teintée ou ciel couvert", "Plus visible.", "couleurMeteo"],
          ["Eau très trouble ou faible lumière", "Plus contrasté, plus flashy : blanc, chartreuse, jaune, orange, rose.", "couleurMeteo"],
          ["Aube et crépuscule", "Contrastés ou chauds. Le blanc reste efficace en eau claire par faible luminosité.", "coloris"],
          ["Nuit", "Le blanc se distingue largement.", "nuit"],
          ["Eau chargée et agitée", "Rose.", "coloris"],
          ["Règle simple", "« Temps clair, leurre clair ; temps sombre, leurre sombre. »", "couleurDebut"],
          ["Proie : lançon", "Vert ou kaki (Crazy Sand Eel, Crazy Paddle Tail) ; un blanc peut aussi l'imiter.", "coloris"],
          ["Proie : sprat, sardine, maquereau", "Vert ; Blue Herring par temps ensoleillé sur les sprats ; argenté ou bleuté sur les petits poissons.", "coloris"],
          ["Proie : crustacés, début de saison", "Marron.", "coloris"],
          ["Tes notes Asturie", "Ghost Iwashi : plein soleil et eau claire seulement. Cabot : changements de lumière. Ghost Lançon : le plus polyvalent.", "felix"],
        ]}/>
      </Disclosure>

      <Disclosure title="Repères : le poids des têtes" sub="Profondeur, courant, vent, vagues">
        <Ref rows={[
          ["Base", "À la volée, sans vent et peu de courant : 1 g par mètre de fond. Aucun poids standard : un point de départ à ajuster.", "grammage"],
          ["Du bord, 1 à 4 m", "Départ à 5 g en linéaire ; entre 3 et 10 g selon la session. Slug : 2 g de moins. À gratter en travers du courant : 2 g de plus.", "grammage"],
          ["Tombant, 5 à 15 m", "10 à 20 g.", "grammageMer"],
          ["Bord, courant moyen", "15 à 25 g.", "grammageMer"],
          ["Courant fort (2 à 4 nœuds)", "En bateau, 10 m de fond, au lancer : 20 g de départ, à moduler selon la météo et l'humeur du poisson. Par courant faible, la même source fait varier le poids de la moitié au double.", "grammage"],
          ["Vent", "Le grand ennemi du pêcheur aux leurres : des têtes plus lourdes pour continuer à sentir le fond.", "grammage"],
          ["Vagues", "Shad de 120 à 140 mm sur tête de 18 à 25 g.", "vagues"],
          ["Nuit", "Têtes de 5 à 10 g en zones peu profondes.", "nuit"],
          ["Profondeur de tes spots", `Jamais mesurée : chaque fiche porte une classe estimée d'après sa description — ${Object.values(DEPTH_CLASS).map((d) => d.label).join(", ")}. La marée du créneau (règle des douzièmes) place le poids dans la fourchette.`, "deduit"],
        ]}/>
      </Disclosure>

      <Disclosure title="Repères : quelle famille, quand" sub="Mer, courant, profondeur, lumière">
        <Ref rows={[
          ["Surface : stickbait, popper", "Mer calme, belle à peu agitée ; idéal à l'aube et au crépuscule. Plateaux rocheux de 2 à 8 m, et même très peu d'eau. Walking the dog : environ deux coups de scion par seconde ; long-slide pour les gros poissons.", "stickbait"],
          ["Coulants : jerkbait, casting jig", "Zones profondes et courants forts. Jerkbait : coups de scion secs.", "merConseils"],
          ["Métal : cuiller, jig", "Parfaits pour la pêche dans les vagues. Laisser couler, puis récupérer vite.", "merConseils"],
          ["Shad à palette dans les vagues", "Vent du large établi, autour de la mi-marée : Black Minnow 120 ou 140 sur tête de 18 à 25 g, linéaire canne basse. Pêcher plus loin du bord, garder un œil sur la vague plus grosse que les autres.", "vagues"],
          ["Petits souples de nuit", "85 à 100 mm sur têtes de 5 à 10 g, zones peu profondes, récupération saccadée.", "nuit"],
          ["Ouverture, eau froide", "Shad à palette de 9 à 12 cm ou finesse de 10 à 14 cm, animations lentes ; tête légère en eau peu profonde, plus lourde dans le courant.", "ouverture"],
          ...(Object.values(SITE.zones || {}).some((z) => z.eauClaire) ? [["Eaux claires de la rade", "Matériel léger, leurres petits et discrets, approche silencieuse ; souple non lesté entre les goémons.", "rade"]] : []),
        ]}/>
      </Disclosure>

      <Disclosure title="Repères : saison par saison">
        <Ref rows={[
          ["Hiver", "Les bars se regroupent au large pour le frai et quittent presque la côte ; l'auteur conseille de les laisser tranquilles jusqu'à début avril.", "saisons"],
          ["Hiver, les résidents", `Tous les bars ne migrent pas : « certains sont résidents » (sans proportion ni lieu précisés).${SITE.id === "logonna-daoulas" ? " Tu as d'ailleurs pris 2 bars à Moulin Mer le 27/12/2025." : ""}`, "ifremer"],
          ["Printemps", "Retour dès fin mars, d'abord au petit large en eau assez profonde, puis parcs conchylicoles et bancs de sable à lançon. Proies : éperlans et lançons, puis crabes et crevettes. Petits leurres, animations lentes.", "saisons"],
          ["Été", "Bars à la côte ; chaleur, soleil et journées sans vent freinent l'activité de jour. Les coups du matin et du soir sont les meilleurs, surtout en bon coefficient ; la nuit est une bonne option.", "saisons"],
          ["Automne", "Réserves avant l'hiver : les premiers froids déclenchent souvent un pic d'activité. Estuaires, parcs, roches bordées de sable. Proies : crabes, petits maquereaux, merlans. Prospecter vite : une dizaine de lancers sans touche, on change de poste.", "automne"],
        ]}/>
      </Disclosure>

      <Card title="Sources des conseils leurres">
        <ul style={{margin:0,padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:6}}>
          {Object.values(S).filter((s) => s.url).map((s) => <li key={s.url}><Src src={s}/></li>)}
          <li style={{fontSize:12.5,color:C.faint}}>« Tes notes » : ce que tu as dit de tes leurres et de tes sessions. « Fiche du spot » : la fiche terrain et ses propres sources. « Déduit » : un seuil ou un raisonnement du guide.</li>
        </ul>
      </Card>
    </Stack>
  );
}

