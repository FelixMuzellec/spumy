// SPUMY — prototype consultable de la phase 11 (direction artistique et écrans).
// Ce n'est pas l'application : une maquette interactive, qui montre les écrans cibles sur de vraies données BORD et
// des données d'exemple BATEAU. Navigation par l'adresse (#bord-decision…), écran entier sur téléphone, cadre sur
// ordinateur avec la liste des écrans et la note de chacun.
import "../design/ds/tokens.css";
import "../design/ds/components.css";
import "./prototype.css";
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Icon, Logo } from "../design/ds/ui.jsx";
import { BordDecision, BordCarte, BordSpot, BordCompare, BordStrategie, BordMateriel, BordJournal, BordTerrain, BordPlus, BordNav } from "./bord.jsx";
import { BateauSortir, BateauSecurite, BateauZones, BateauZone, BateauEspeces, BateauTechnique, BateauSorties, BateauProfil, BateauNav } from "./bateau.jsx";
import { Accueil, EtatsBoard } from "./accueil.jsx";
import { SystemeBoard, PlancheBoard, AvantApresBoard, ConformiteBoard } from "./boards.jsx";
import contrasts from "./data/contrastes.json";

export const SCREENS = [
  { id: "accueil", group: "Accueil", title: "Accueil SPUMY", C: Accueil, note: "Choix du mode avec les deux pictogrammes (§5.5), meilleur spot du jour, guides par département." },
  { id: "bord-decision", group: "BORD", title: "Décision", C: BordDecision, nav: "bord", note: "Verdict du jour sur la photo d'ambiance choisie par la lumière du créneau (aube), le ciel et la mer. Une action principale. Données : journée réelle, moteur v2." },
  { id: "bord-carte", group: "BORD", title: "Carte", C: BordCarte, nav: "bord", note: "Trait de côte OpenStreetMap, pastilles du moteur (cinq paliers de bleu ; non recommandé barré), carte flottante du spot." },
  { id: "bord-spot", group: "BORD", title: "Fiche du spot", C: BordSpot, nav: "bord", note: "Trois scores sur 100 jamais fusionnés, trois niveaux (Vue rapide, Détails, Expert). Chaque anneau ouvre sa décomposition." },
  { id: "bord-compare", group: "BORD", title: "Comparaison", C: BordCompare, nav: "bord", note: "Les trois premiers côte à côte ; barres = part obtenue des familles de critères du moteur ; « Notre conseil » écrit d'après les scores." },
  { id: "bord-strategie", group: "BORD", title: "Ma stratégie", C: BordStrategie, nav: "bord", note: "Leurre de ta boîte choisi par le moteur de leurres pour ce spot et ce créneau ; poids, taille, couleur, animation ; plan B." },
  { id: "bord-materiel", group: "BORD", title: "Matériel & leurres", C: BordMateriel, nav: "bord", note: "Ta boîte réelle, dessinée ; « Conseillé » = choisi pour un des cinq meilleurs spots du jour. Pas d'étoiles inventées." },
  { id: "bord-journal", group: "BORD", title: "Journal", C: BordJournal, nav: "bord", note: "Tes trois vraies sessions de Moulin Mer. Pas de photo de prise : le journal n'en garde pas encore." },
  { id: "bord-terrain", group: "BORD", title: "Mode terrain", C: BordTerrain, note: "Lecture à un mètre, en plein soleil, gants : grand anneau, trois chiffres, une destination, un bouton." },
  { id: "bord-plus", group: "BORD", title: "Plus", C: BordPlus, nav: "bord", note: "Marée, météo, saison, règles, analyse photo, sauvegarde ; thème Plein soleil ; passage en mode BATEAU." },
  { id: "bateau-sortir", group: "BATEAU", title: "Sortir ?", C: BateauSortir, nav: "bateau", note: "La sécurité de la sortie d'abord (§3 de la spécification BATEAU). Ici « à vérifier » : visibilité inconnue, BMS non lu." },
  { id: "bateau-securite", group: "BATEAU", title: "Sécurité de la sortie", C: BateauSecurite, nav: "bateau", note: "Heure par heure sur tout le créneau, au pire moment ; les règles SEC_* avec leur raison. Météo réelle, règles appliquées à la main." },
  { id: "bateau-zones", group: "BATEAU", title: "Tes zones", C: BateauZones, nav: "bateau", note: "Tes marques (exemples) et les cercles de 2 et 6 milles autour des abris choisis : la limite de l'armement se voit." },
  { id: "bateau-zone", group: "BATEAU", title: "Une zone", C: BateauZone, nav: "bateau", note: "Espèces ouvertes, classées ; réglementation réelle 2026 ; lieu noir non proposé (décision à prendre)." },
  { id: "bateau-especes", group: "BATEAU", title: "Espèces", C: BateauEspeces, nav: "bateau", note: "Tes photos pour le lieu jaune, le lieu noir, le maquereau et le bar ; dessins pour la vieille et le saint-pierre." },
  { id: "bateau-technique", group: "BATEAU", title: "Technique", C: BateauTechnique, nav: "bateau", note: "Espèce × zone × ton matériel (Megaforce 170, 90–210 g). Poids du jig : hypothèse de la spécification." },
  { id: "bateau-sorties", group: "BATEAU", title: "Sorties", C: BateauSorties, nav: "bateau", note: "Journal des sorties (exemples) et l'apprentissage personnel : à partir de 8 sorties, ±10 au plus, jamais sur la sécurité." },
  { id: "bateau-profil", group: "BATEAU", title: "Ton bateau", C: BateauProfil, nav: "bateau", note: "Catégorie, armement, abris, vitesse, limites, seul à bord, matériel. Sans profil, pas de note." },
  { id: "etats", group: "Planches", title: "États", C: EtatsBoard, board: true },
  { id: "systeme", group: "Planches", title: "Système de design", C: SystemeBoard, board: true },
  { id: "planche", group: "Planches", title: "BORD et BATEAU", C: PlancheBoard, board: true },
  { id: "avant-apres", group: "Planches", title: "Avant / après", C: AvantApresBoard, board: true },
  { id: "conformite", group: "Planches", title: "Conformité", C: ConformiteBoard, board: true },
];
const BY = Object.fromEntries(SCREENS.map((s) => [s.id, s]));

function parseHash() {
  const h = (location.hash || "").replace(/^#/, "");
  return BY[h] ? h : null;
}

/** Un écran de l'application, avec sa barre du bas. */
function Screen({ id, params, go, theme, setTheme }) {
  const S = BY[id];
  const C = S.C;
  return (
    <div className="s-app p-screenroot" data-theme={theme}>
      <C go={go} params={params} theme={theme} setTheme={setTheme} />
      {S.nav === "bord" && <BordNav route={id} go={go} />}
      {S.nav === "bateau" && <BateauNav route={id} go={go} />}
    </div>
  );
}

/** Écran réduit pour les planches (rendu réel, sans interaction). */
function Mini({ route, theme = "nuit", scale = 0.5 }) {
  return (
    <div className="p-mini" style={{ width: 390 * scale, height: 844 * scale }} aria-hidden="true" inert="">
      <div className="p-mini__inner" style={{ transform: `scale(${scale})` }}>
        <div className="p-device__screen" style={{ width: 390, height: 844 }}><Screen id={route} params={{}} go={() => {}} theme={theme} setTheme={() => {}} /></div>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(parseHash() || "accueil");
  const [params, setParams] = useState({});
  const [theme, setThemeState] = useState(() => { try { return localStorage.getItem("spumy-proto-theme") || "nuit"; } catch { return "nuit"; } });
  const [menu, setMenu] = useState(false);
  const wide = useMedia("(min-width: 900px)");
  const setTheme = (t) => { setThemeState(t); try { localStorage.setItem("spumy-proto-theme", t); } catch {} };
  useEffect(() => {
    const on = () => { const h = parseHash(); if (h) { setRoute(h); window.scrollTo(0, 0); document.querySelector(".p-device__screen")?.scrollTo(0, 0); } };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const go = (id, p) => { setParams(p || {}); setMenu(false); if (location.hash !== `#${id}`) location.hash = id; else { setRoute(id); } };
  const S = BY[route];
  const groups = useMemo(() => [...new Set(SCREENS.map((s) => s.group))], []);
  const content = S.board ? <div className="s-app p-boardroot" data-theme={theme}><S.C Mini={Mini} contrasts={contrasts} /></div> : <Screen id={route} params={params} go={go} theme={theme} setTheme={setTheme} />;

  const Menu = (
    <nav className="p-side" aria-label="Écrans du prototype">
      <div className="p-side__brand"><Logo size={26} /><span className="p-side__tag">Prototype · phase 11</span></div>
      <p className="p-side__intro">Maquette interactive, pas l'application. BORD : journée réelle du 16 mai 2026 (Logonna-Daoulas), moteur v2. BATEAU : données d'exemple.</p>
      {groups.map((g) => (
        <div key={g} className="p-side__group">
          <div className="p-side__gtitle">{g === "BORD" ? <Icon name="mode-bord" size={16} /> : g === "BATEAU" ? <Icon name="mode-bateau" size={16} /> : null}{g}</div>
          {SCREENS.filter((s) => s.group === g).map((s) => (
            <a key={s.id} href={`#${s.id}`} className="p-side__link" aria-current={s.id === route ? "page" : undefined} onClick={() => setMenu(false)}>{s.title}</a>
          ))}
        </div>
      ))}
      <div className="p-side__group">
        <div className="p-side__gtitle">Thème</div>
        <div className="p-side__themes">
          {[["nuit", "Nuit marine"], ["soleil", "Plein soleil"]].map(([t, l]) => <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>{l}</button>)}
        </div>
      </div>
    </nav>
  );

  if (!wide) {
    return (
      <div className={`p-mobile ${S.board ? "is-board" : ""}`} data-theme={theme}>
        <main>{content}</main>
        <aside aria-label="Menu du prototype">
          <button type="button" className="p-fab" aria-label="Écrans du prototype" aria-expanded={menu} onClick={() => setMenu(!menu)}><Icon name={menu ? "x" : "layers"} size={menu ? 22 : 18} /></button>
          {menu && <div className="p-drawer" data-theme={theme}>{Menu}</div>}
        </aside>
      </div>
    );
  }
  return (
    <div className="p-desk" data-theme={theme}>
      {Menu}
      <main className="p-stage">
        {S.board ? content : (
          <div className="p-stage__device">
            <div className="p-device"><div className="p-device__screen">{content}</div></div>
            <aside className="p-note">
              <div className="p-note__group">{S.group}</div>
              <h1 className="p-note__title">{S.title}</h1>
              <p>{S.note}</p>
              {S.group === "BATEAU" && <p className="p-note__demo">Données d'exemple : le moteur BATEAU est la phase 10.</p>}
              {S.group === "BORD" && <p className="p-note__demo">Journée réelle archivée (Open-Meteo, AROME) passée au moteur v2 de l'application.</p>}
              <p className="p-note__hint">Tout est cliquable dans l'écran. Les photos sont des illustrations (images générées), jamais la photo d'un spot ou d'une prise.</p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function useMedia(q) {
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => { const mq = window.matchMedia(q); const on = () => setM(mq.matches); mq.addEventListener("change", on); return () => mq.removeEventListener("change", on); }, [q]);
  return m;
}

createRoot(document.getElementById("root")).render(<App />);
