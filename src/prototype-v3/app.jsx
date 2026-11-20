// SPUMY V3 — coque du prototype : en-tête (bascule, puce de position), barre défilante de 4 onglets visibles,
// routes par ancre (#home, #carte, #meteo, #profil, #journal, #spot-<id>, #comparer-<a>-<b>), feuilles et messages.
import "@fontsource-variable/roboto";
import "@fontsource-variable/roboto-condensed";
import "@fontsource-variable/montserrat";
import "./styles.css";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import catalogue from "../../data/photos/catalogue.json";
import { pickPhoto } from "../design/ds/ambiance.js";
import { Icon, brandSrc } from "./ui.jsx";
import { HomeBord, HomeBateau } from "./home.jsx";
import { Carte, Meteo } from "./map.jsx";
import { Fiche, Comparaison } from "./spot.jsx";
import { Journal, Profil, PositionSheet, QuickAdd, TAB_LABEL } from "./misc.jsx";
import { DEMO_NOTE, PHOTO_SET, JOURNAL, SPOT } from "./data.js";

const PHOTOS = catalogue.photos.filter((p) => PHOTO_SET.includes(p.id) && !p.remplacee_par);
const TAB_ICON = { home: "home", carte: "map", meteo: "wind", profil: "user", journal: "book" };
const TABS = ["home", "carte", "meteo", "profil", "journal"];
const parse = () => {
  const h = (location.hash || "#home").slice(1);
  if (h.startsWith("spot-")) return { page: "spot", arg: h.slice(5) };
  if (h.startsWith("comparer-")) return { page: "comparer", arg: h.slice(9) };
  return { page: TABS.includes(h) ? h : "home", arg: null };
};

function Nav({ order, page }) {
  const ref = useRef(null);
  const wrap = useRef(null);
  const drag = useRef(null);
  const [edge, setEdge] = useState({ l: false, r: true });
  const measure = useCallback(() => { const n = ref.current; if (n) setEdge({ l: n.scrollLeft > 2, r: n.scrollLeft + n.clientWidth < n.scrollWidth - 2 }); }, []);
  useLayoutEffect(() => {
    const a = ref.current?.querySelector('[aria-current="page"]');
    if (a && ref.current.scrollWidth > ref.current.clientWidth) a.scrollIntoView({ inline: "nearest", block: "nearest" });
    measure();
  }, [page, order, measure]);
  // Faire glisser la barre : au doigt (défilement natif), à la souris (glisser-déposer) et à la molette ; chevrons cliquables.
  const step = (d) => { const n = ref.current; n.scrollBy({ left: d * n.clientWidth / 4, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };
  const down = (e) => { if (e.pointerType !== "mouse") return; drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false }; };
  const move = (e) => { const d = drag.current; if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 4) { d.moved = true; ref.current.classList.add("dragging"); } ref.current.scrollLeft = d.left - dx; };
  const up = () => { const d = drag.current; drag.current = null; if (!d) return; ref.current.classList.remove("dragging");
    const n = ref.current, w = n.clientWidth / 4; n.scrollTo({ left: Math.round(n.scrollLeft / w) * w }); if (d.moved) { const stop = (ev) => { ev.preventDefault(); ev.stopPropagation(); }; const w = wrap.current; w.addEventListener("click", stop, { capture: true, once: true }); setTimeout(() => w.removeEventListener("click", stop, { capture: true }), 0); } };
  const wheel = (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && ref.current.scrollWidth > ref.current.clientWidth) { ref.current.scrollLeft += e.deltaY; } };
  return (
    <div className="navwrap" ref={wrap} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onWheel={wheel}>
      <nav className="nav" ref={ref} onScroll={measure} aria-label="Onglets (faire glisser la barre pour voir les autres)">
        {order.map((t) => (
          <a key={t} href={`#${t}`} draggable="false" aria-current={page === t ? "page" : undefined} onFocus={(e) => e.currentTarget.scrollIntoView({ inline: "nearest", block: "nearest" })}>
            <Icon name={TAB_ICON[t]} size={22} />{TAB_LABEL[t]}</a>
        ))}
      </nav>
      {edge.l && <button className="more l" tabIndex={-1} aria-hidden="true" onClick={() => step(-1)}><Icon name="left" size={20} /></button>}
      {edge.r && <button className="more r" tabIndex={-1} aria-hidden="true" onClick={() => step(1)}><Icon name="right" size={20} /></button>}
    </div>
  );
}

/** Écran de lancement : le logo complet d'origine sur son fond crème, puis l'application (1,5 s ; un appui le passe). */
function Launch({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1500); return () => clearTimeout(t); }, [onDone]);
  return <div className="launch" role="img" aria-label="SPUMY" onClick={onDone}><img src={brandSrc("spumy-logo-960.webp")} alt="" /></div>;
}

function App() {
  const [route, setRoute] = useState(parse);
  const [st, setSt] = useState({
    mode: "bord", tabs: ["home", "carte", "meteo", "profil", "journal"], hero: "auto", theme: "dark",
    pos: { mode: "auto", label: "Pirou", acc: "±30 m", state: "ok" }, demo: {},
  });
  const set = (patch) => setSt((s) => ({ ...s, ...patch }));
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState(null);
  const [sel, setSel] = useState(null);
  const [boat, setBoat] = useState({ choice: "saved", ready: false });
  const [journal, setJournal] = useState(JOURNAL);
  const [launch, setLaunch] = useState(() => !window.__NO_LAUNCH__);
  const timer = useRef(null);

  useEffect(() => { const f = () => { setRoute(parse()); window.scrollTo(0, 0); }; window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); }, []);
  // Titre de la page propre à chaque écran (WCAG 2.4.2), lu par les lecteurs d'écran au changement de vue.
  useEffect(() => {
    const t = route.page === "spot" ? (SPOT[route.arg] || SPOT.a).name : route.page === "comparer" ? "Comparaison" : TAB_LABEL[route.page] || "Home";
    document.title = `${t} · SPUMY`;
  }, [route]);
  useEffect(() => { const r = document.documentElement; if (st.theme === "system") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", st.theme); }, [st.theme]);
  const notify = useCallback((msg, undo) => { clearTimeout(timer.current); setToast({ msg, undo }); timer.current = setTimeout(() => setToast(null), 4500); }, []);
  const go = useCallback((page, arg) => {
    if (page === "carte" && arg) setSel(arg);
    location.hash = page === "spot" ? `spot-${arg}` : page === "comparer" ? `comparer-${arg}` : page;
  }, []);
  const back = () => (history.length > 1 ? history.back() : go("home"));

  const bateau = st.mode === "bateau";
  const heroPhoto = st.hero !== "auto" ? st.hero
    : pickPhoto(PHOTOS, { usage: "hero", mode: st.mode, lumiere: bateau ? "jour" : "aube", ciel: bateau ? "nuageux" : "clair", mer: "calme", lieu: bateau ? "large" : "rochers", cle: "home" })?.id;
  const p = st.pos;
  const chip = p.state === "ok" ? p.label
    : p.state === "pending" ? "Position…" : p.state === "refused" ? "Position refusée · choisir" : "Choisir une position";
  const page = route.page;
  const saveTrip = (state) => {
    const item = { id: `n${Date.now()}`, date: "Aujourd'hui", spot: "Pointe A", state, catches: state === "capture" ? "bar 44 cm" : null };
    setJournal((j) => [item, ...j]); setSheet(null);
    notify("Sortie enregistrée sur cet appareil", () => setJournal((j) => j.filter((x) => x.id !== item.id)));
  };

  let body;
  if (page === "spot") body = <Fiche id={route.arg} go={go} back={back} />;
  else if (page === "comparer") body = <Comparaison ids={route.arg} back={back} />;
  else if (page === "carte") body = <Carte st={st} go={go} sel={sel} setSel={setSel} notify={notify} />;
  else if (page === "meteo") body = <Meteo st={st} go={go} />;
  else if (page === "journal") body = <Journal items={journal} openAdd={() => setSheet("add")} />;
  else if (page === "profil") body = <Profil st={st} set={set} go={go} />;
  else body = bateau ? <HomeBateau st={st} go={go} boat={boat} setBoat={setBoat} heroPhoto={heroPhoto} />
    : <HomeBord st={st} go={go} heroPhoto={heroPhoto} openPos={() => setSheet("pos")} openJournal={() => setSheet("add")} />;

  return (
    <div className="app">
      {launch && <Launch onDone={() => setLaunch(false)} />}
      <div className="demo-bar">{DEMO_NOTE}</div>
      {st.demo.offline && <div className="banner" role="status"><Icon name="offline" size={18} />Hors ligne · données de 06:10 ; temps de route en estimation</div>}
      <header className="hdr">
        <div className="hdr-row">
          <a className="brand" href="#home" aria-label="SPUMY, accueil"><img src={brandSrc("spumy-medaillon-128.png")} alt="" width="44" height="44" /><span className="word">SPUMY</span></a>
          <button className={`poschip${p.state !== "ok" ? " attn" : ""}`} onClick={() => setSheet("pos")} aria-label={`Position de référence : ${chip}${p.state === "ok" ? (p.mode === "auto" ? ", automatique" : ", manuelle") : ""}${p.state === "ok" && p.mode === "auto" && p.acc ? `, précision ${p.acc}` : ""}`}
            title={p.state === "ok" ? `${chip} · ${p.mode === "auto" ? `automatique${p.acc ? ` · ${p.acc}` : ""}` : "manuelle"}` : chip}>
            <Icon name={p.state === "ok" && p.mode === "auto" ? "locate" : "pin"} size={18} /><span>{chip}</span></button>
        </div>
        <div className="mode" role="radiogroup" aria-label="Mode">
          {[["bord", "BORD"], ["bateau", "BATEAU"]].map(([k, l]) => <button key={k} role="radio" aria-checked={st.mode === k} onClick={() => { set({ mode: k }); setSel(null); }}>{l}</button>)}
        </div>
      </header>
      <main key={`${page}-${route.arg || ""}-${st.mode}`} className={page === "spot" || page === "comparer" ? "push" : "fade"}>{body}</main>
      <Nav order={st.tabs} page={page} />
      {sheet === "pos" && <PositionSheet pos={p} setPos={(v) => set({ pos: v })} onClose={() => setSheet(null)} notify={notify} />}
      {sheet === "add" && <QuickAdd onClose={() => setSheet(null)} onSave={saveTrip} />}
      {p.state === "pending" && (
        <>
          <div className="scrim" />
          <div className="modal" role="alertdialog" aria-label="Autorisation de position" style={{ bottom: "auto", top: "28%", borderRadius: 16, width: "min(340px, 90%)", textAlign: "center" }}>
            <b>« SPUMY » souhaite utiliser votre position</b>
            <span className="sec">Pour calculer les spots et les temps de route autour de vous. Elle reste sur l'appareil.</span>
            <div className="row"><button className="btn grow" onClick={() => set({ pos: { mode: "manual", label: "", state: "refused" } })}>Refuser</button>
              <button className="btn primary grow" onClick={() => set({ pos: { mode: "auto", label: "Pirou", acc: "±30 m", state: "ok" } })}>Autoriser</button></div>
            <span className="tag">Fenêtre du système, simulée pour le prototype</span>
          </div>
        </>
      )}
      {toast && <div className="toast" role="status">{toast.msg}{toast.undo && <button onClick={() => { toast.undo(); setToast(null); }}>Annuler</button>}</div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
