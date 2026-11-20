// SPUMY V3 — Journal, Profil, feuille de position, saisie rapide (UX-V3 § 5 et § 11).
import { useState } from "react";
import { Sheet, Icon, photoSrc } from "./ui.jsx";
import { PLACES, JOURNAL, STATE_LABEL, BOATS, REF } from "./data.js";
import { Base } from "./map.jsx";

export const TAB_LABEL = { home: "Home", carte: "Carte", meteo: "Météo", profil: "Profil", journal: "Journal" };

export function PositionSheet({ pos, setPos, onClose, notify }) {
  const [mode, setMode] = useState(pos.mode);
  const [q, setQ] = useState(pos.state === "ok" ? pos.label : "");
  const [typing, setTyping] = useState(false);
  const [pin, setPin] = useState(false);
  const sugg = typing && q.length >= 2 ? PLACES.filter((p) => p.name.toLowerCase().startsWith(q.toLowerCase())) : [];
  const locate = () => { setMode("auto"); setQ("Pirou"); setTyping(false); setPin(false); notify("Position du téléphone : Pirou, ±30 m"); };
  const use = () => { setPos({ mode, label: q || "Pirou", acc: mode === "auto" ? "±30 m" : null, state: "ok" }); onClose(); };
  return (
    <Sheet title="Position" onClose={onClose}>
      <div className="seg2" role="group" aria-label="Mode"><button aria-pressed={mode === "auto"} onClick={() => setMode("auto")}>Automatique</button><button aria-pressed={mode === "manual"} onClick={() => setMode("manual")}>Manuelle</button></div>
      <button className="optrow" onClick={locate}>
        <span className="optic"><Icon name="locate" size={20} /></span>
        <span className="grow"><b>Me géolocaliser</b><br /><span className="meta">{mode === "auto" ? "Position du téléphone · ±30 m" : "Repasser en automatique"}</span></span>
        <Icon name="right" size={18} />
      </button>
      <label className="searchf"><Icon name="search" size={20} /><span className="vh">Ville, adresse, code postal ou coordonnées</span>
        <input value={q} onChange={(e) => { setQ(e.target.value); setTyping(true); setMode("manual"); }} placeholder="Ville, adresse, code postal…" autoComplete="off" />
        {q && <button className="iconbtn small" aria-label="Effacer" onClick={() => { setQ(""); setTyping(true); }}><Icon name="x" size={16} /></button>}
      </label>
      {sugg.length > 0 && <div className="suggest" role="listbox" aria-label="Propositions">{sugg.map((p) => (
        <button key={p.name} role="option" aria-selected="false" onClick={() => { setQ(p.name); setTyping(false); setPin(false); }}><Icon name="pin" size={18} /><span><b>{p.name}</b> <span className="meta">{p.sub}</span></span></button>))}</div>}
      <div className="minimap">
        <Base compact start={{ x: REF.x, y: REF.y, k: 1.6 }} overlay={<g><circle cx={REF.x} cy={REF.y} r="70" fill="var(--accent)" fillOpacity=".16" /><circle cx={REF.x} cy={REF.y} r="16" fill="var(--accent)" stroke="var(--palette-navy)" strokeWidth="6" /></g>} />
        <button className={`btn small pinbtn${pin ? " on" : ""}`} onClick={() => { setMode("manual"); setPin(true); setQ("47,62° N ; 1,59° O"); }}><Icon name="pin" size={18} />{pin ? "Épingle posée" : "Poser l'épingle ici"}</button>
      </div>
      <div className="chips" aria-label="Positions récentes, sur cet appareil">
        {["Pirou", "Crozon"].map((r) => <button key={r} className="chip" onClick={() => { setQ(r); setMode("manual"); setTyping(false); }}>{r}</button>)}
        <button className="chip" aria-label="Effacer les positions récentes">Effacer</button>
      </div>
      <button className="btn primary" onClick={use}>Utiliser cette position</button>
      <p className="meta" style={{ margin: 0 }}>Jamais de géolocalisation par adresse IP. La position reste sur cet appareil.</p>
    </Sheet>
  );
}

export function QuickAdd({ onClose, onSave }) {
  const [state, setState] = useState("capture");
  return (
    <Sheet title="Noter une sortie" onClose={onClose}>
      <div className="seg2" role="group" aria-label="Résultat">{["capture", "sans_capture", "resultat_inconnu"].map((k) => <button key={k} aria-pressed={state === k} onClick={() => setState(k)}>{STATE_LABEL[k]}</button>)}</div>
      <label className="field">Spot<select defaultValue="Pointe A"><option>Pointe A</option><option>Platier B</option><option>Crique C</option></select></label>
      {state === "capture" && <label className="field">Prises<input defaultValue="bar 44 cm" /></label>}
      <button className="btn">Ajouter une photo</button>
      <button className="btn primary" onClick={() => onSave(state)}>Enregistrer sur cet appareil</button>
      <p className="meta">Tout le reste se complète plus tard. « Non renseigné » n'est jamais une bredouille.</p>
    </Sheet>
  );
}

export function Journal({ items, openAdd }) {
  return (
    <div className="screen">
      <h1>Journal</h1>
      <div className="card" style={{ borderLeft: "5px solid var(--accent)" }}>
        <div className="row between"><b>Sortie en cours · Pointe A</b><span className="num" style={{ fontWeight: 800 }}>01:12</span></div>
        <div className="row"><button className="btn primary grow" onClick={openAdd}><Icon name="plus" size={18} />Ajouter une prise</button><button className="btn">Terminer</button></div>
      </div>
      <div className="row"><button className="btn grow" onClick={openAdd}>Noter une sortie</button><button className="btn">Par photo</button></div>
      <ul className="list">{items.map((j) => (
        <li key={j.id} className="card">{j.photo && <img src={photoSrc(j.photo, 1600)} alt="" style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 12 }} />}<div className="row between"><b>{j.date} · {j.spot}</b>
          <span className={`badge ${j.state === "capture" ? "dark" : j.state === "resultat_inconnu" || j.state === "incomplete" ? "verify" : "info"}`}>{STATE_LABEL[j.state]}</span></div>
          {(j.catches || j.hours) && <span className="meta num">{[j.catches, j.hours].filter(Boolean).join(" · ")}</span>}
          {(j.state === "resultat_inconnu" || j.state === "incomplete") && <button className="btn ghost" style={{ alignSelf: "flex-start" }}>Compléter</button>}</li>))}</ul>
      <p className="meta">Export du journal : emplacement à tester (menu du Journal ou Profil, Mes données).</p>
    </div>
  );
}

const PHOTO_CHOICES = ["platier-aube-frontale", "roche-ciel-bleu", "falaises-couchant", "jigging-console-sondeur"];

export function Profil({ st, set, go }) {
  const order = st.tabs;
  const move = (i, d) => { const o = [...order]; const j = i + d; if (j < 0 || j >= o.length) return; [o[i], o[j]] = [o[j], o[i]]; set({ tabs: o }); };
  const demo = (k) => set({ demo: { ...st.demo, [k]: !st.demo[k] } });
  return (
    <div className="screen">
      <h1>Profil</h1>
      <button className="card lrow" style={{ textAlign: "left" }} onClick={() => go("journal")}><b>Journal</b><span className="meta">{JOURNAL.length} sorties <Icon name="right" size={16} /></span></button>
      <div className="card"><b>Statistiques personnelles</b><span className="meta">Contenu à définir après étude (PRO-02).</span></div>
      <div className="card lrow"><b>Mes spots et mes marques</b><span className="meta">1 spot · 4 marques</span></div>
      <div className="card lrow"><b>Mes bateaux</b><span className="meta">{BOATS[0].name} (par défaut)</span></div>
      <section className="card" aria-labelledby="aff"><b id="aff">Affichage</b>
        <span className="sec">Ordre des onglets : les 4 premiers sont visibles sans faire défiler la barre.</span>
        <ol className="list" aria-label="Ordre des onglets">{order.map((t, i) => (
          <li key={t} className="lrow" style={{ borderTop: i ? "1px solid var(--border)" : 0 }}>
            <span className="row"><span className="muted" aria-hidden="true"><Icon name="grip" size={18} /></span><span className="num muted">{i + 1}</span><b>{TAB_LABEL[t]}</b>{i >= 4 && <span className="tag">en faisant défiler</span>}</span>
            <span className="row"><button className="btn small" aria-label={`Monter ${TAB_LABEL[t]}`} disabled={i === 0} onClick={() => move(i, -1)}><Icon name="up" size={18} /></button>
              <button className="btn small" aria-label={`Descendre ${TAB_LABEL[t]}`} disabled={i === order.length - 1} onClick={() => move(i, 1)}><Icon name="down" size={18} /></button></span>
          </li>))}</ol>
        <span className="sec">Photo de fond de Home</span>
        <div className="chips" role="group" aria-label="Photo de fond">
          <button className="chip" aria-pressed={st.hero === "auto"} onClick={() => set({ hero: "auto" })}>Automatique</button>
          {PHOTO_CHOICES.map((p) => <button key={p} className="chip" aria-pressed={st.hero === p} onClick={() => set({ hero: p })} style={{ padding: 3 }} aria-label={`Photo ${p}`}><img src={photoSrc(p, 720)} alt="" style={{ width: 56, height: 32, objectFit: "cover", borderRadius: 999 }} /></button>)}
        </div>
        <span className="sec">Thème</span>
        <div className="seg2" role="group" aria-label="Thème">{[["system", "Système"], ["light", "Clair"], ["dark", "Sombre"]].map(([k, l]) => <button key={k} aria-pressed={st.theme === k} onClick={() => set({ theme: k })}>{l}</button>)}</div>
      </section>
      <div className="card"><b>Mes données</b><span className="meta">Sauvegarde · transfert · export du journal · tout effacer (confirmation dans la page)</span></div>
      <details className="card"><summary className="row between"><b>Démonstration : états</b><Icon name="down" /></summary>
        <span className="meta">Pour éprouver les écrans ; n'existe pas dans l'application.</span>
        {[["offline", "Hors ligne"], ["loading", "Chargement"], ["scarce", "Moins de 3 spots"], ["tie", "Égalité au dernier rang"], ["far", "Aucun spot à ≤ 1 h"]].map(([k, l]) => (
          <label key={k} className="lrow"><span>{l}</span><input type="checkbox" checked={!!st.demo[k]} onChange={() => demo(k)} /></label>))}
        <div className="row"><button className="btn grow" onClick={() => set({ pos: { mode: "auto", label: "", state: "pending" } })}>Simuler : premier lancement</button>
          <button className="btn grow" onClick={() => set({ pos: { ...st.pos, state: "refused" } })}>Simuler : position refusée</button></div>
      </details>
      <section className="card" aria-label="À propos"><div className="about-logo"><img src={`${typeof BRAND_BASE === "string" ? BRAND_BASE : "brand/"}spumy-logo-960.webp`} alt="SPUMY" /></div>
        <span className="meta">Aide et règles · à propos · sources des données · version de démonstration</span></section>
    </div>
  );
}
/* global BRAND_BASE */
