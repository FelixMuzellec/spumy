// Prototype — planches : système de design, BORD face à BATEAU, avant / après, conformité à la référence.
import { Alert, Banner, Button, Card, Chip, DemoMark, FactorBar, Icon, ICON_NAMES, Logo, Pastille, Photo, ScoreRing, Segmented, Skeleton, Stats } from "../design/ds/ui.jsx";
import { PHOTOS, CATALOGUE } from "./photos.js";
import { LureArt } from "./art.jsx";
/* global REF_BASE */
const REF = typeof REF_BASE === "string" ? REF_BASE : "ref/";

const SWATCHES = [
  ["Fonds", [["--bg-0", "Fond profond"], ["--bg-1", "Fond"], ["--bg-2", "Barre du bas"], ["--surface-solid", "Surface"], ["--surface-2", "Surface active"]]],
  ["Texte", [["--text-1", "Titres, chiffres"], ["--text-2", "Texte courant"], ["--text-3", "Secondaire"]]],
  ["Action", [["--accent", "Cyan"], ["--accent-2", "Bleu"], ["--accent-ink", "Lien, icône active"]]],
  ["Scores", [["--fav-a", "Favorabilité"], ["--pert-b", "Pertinence"], ["--conf-a", "Confiance"]]],
  ["Paliers de favorabilité", [["--fav-1", "< 45"], ["--fav-2", "45–54"], ["--fav-3", "55–64"], ["--fav-4", "65–74"], ["--fav-5", "≥ 75"]]],
  ["États", [["--good", "Recommandé"], ["--warn", "À vérifier"], ["--nr", "Non recommandé"], ["--danger", "Erreur de données"], ["--gold", "Conseil"]]],
];

export function SystemeBoard({ contrasts }) {
  return (
    <div className="p-board">
      <div className="s-row" style={{ gap: 18, flexWrap: "wrap" }}><Logo size={40} /><span className="s-chip s-chip--accent">Phase 11</span></div>
      <h1 className="s-h1" style={{ marginTop: 14 }}>Système de design</h1>
      <p className="s-body" style={{ maxWidth: 760, marginTop: 10 }}>Tiré de la maquette de référence : fond bleu nuit, surfaces vitrées, cyan lumineux pour l'action, typographie condensée grasse, gros chiffres, une action principale par carte. Deux thèmes : Nuit marine (défaut) et Plein soleil (dehors, au soleil). Toutes les valeurs : <code>src/design/ds/tokens.css</code>.</p>

      <h2 className="s-h2 p-board__h">Couleurs</h2>
      <div className="p-swatches">
        {SWATCHES.map(([g, list]) => (
          <div key={g} className="p-swatch-group"><div className="s-label">{g}</div>
            {list.map(([v, l]) => (
              <div key={v} className="p-swatch"><span style={{ background: `var(${v})` }} /><div><div style={{ color: "var(--text-1)", fontSize: 14 }}>{l}</div><code className="s-small">{v}</code>{contrasts?.[v] && <div className="s-small">{contrasts[v]}</div>}</div></div>
            ))}
          </div>
        ))}
      </div>

      <h2 className="s-h2 p-board__h">Typographie</h2>
      <Card>
        <div className="p-type">
          <div><span className="s-label">Titre d'écran · Roboto Condensed 750 · 30 px</span><div className="s-h1">Excellentes conditions à l'aube</div></div>
          <div><span className="s-label">Titre · 22 px</span><div className="s-h2">Pourquoi ce spot ?</div></div>
          <div><span className="s-label">Sous-titre · 18 px</span><div className="s-h3">Meilleure fenêtre</div></div>
          <div><span className="s-label">Chiffre · 800 · chiffres tabulaires</span><div className="s-num" style={{ fontSize: 64 }}>93<small>/100</small></div></div>
          <div><span className="s-label">Texte · Roboto 15 px · interligne 1,45</span><p className="s-body">Fenêtre « prime » de la fiche, coefficient 93, vent de mer force 3 : les trois critères forts du jour.</p></div>
          <div><span className="s-label">Libellé · 12 px · capitales espacées</span><div className="s-label">Favorabilité · très favorable</div></div>
        </div>
      </Card>

      <h2 className="s-h2 p-board__h">Espacements, rayons, élévations</h2>
      <div className="p-scale">
        {[4, 8, 12, 16, 20, 24, 32, 40, 48].map((n) => <div key={n}><span style={{ width: n, height: n }} /><code className="s-small">{n}</code></div>)}
      </div>
      <div className="p-radii">
        {[["8", "puce"], ["12", "tuile"], ["16", "carte"], ["20", "feuille"], ["28", "photo"], ["999", "bouton"]].map(([r, l]) => <div key={r} style={{ borderRadius: +r }}><code>{r}</code><span className="s-small">{l}</span></div>)}
      </div>

      <h2 className="s-h2 p-board__h">Composants</h2>
      <div className="p-comp-grid">
        <Card><div className="s-label">Boutons</div><div className="s-stack" style={{ marginTop: 10 }}><Button>Voir la recommandation</Button><button type="button" className="s-btn s-btn--secondary">Voir sur la carte</button><button type="button" className="s-btn s-btn--good">Je pêche ici</button><button type="button" className="s-btn s-btn--ghost">Comparer <Icon name="chevron-right" size={18} /></button><button type="button" className="s-btn s-btn--primary" disabled>Indisponible</button></div></Card>
        <Card><div className="s-label">Puces d'état</div><div className="p-wrap" style={{ marginTop: 10 }}><Chip tone="good">Recommandé</Chip><Chip tone="warn" icon="triangle-alert">À vérifier</Chip><Chip tone="nr" icon="ban">Non recommandé</Chip><Chip tone="accent" icon="target">Conseillé</Chip><Chip tone="good-soft" icon="circle-check">Ouvert</Chip><DemoMark /></div>
          <div className="s-label" style={{ marginTop: 16 }}>Pastilles (spécification v2, §8)</div>
          <div className="p-wrap" style={{ marginTop: 10, alignItems: "center", gap: 14 }}>{[40, 50, 60, 70, 88].map((v) => <Pastille key={v} value={v} size={34} />)}<Pastille value={72} status="verify" size={34} /><Pastille status="nr" size={34} /><Pastille value={null} size={34} /><Pastille value={93} size={38} selected /></div></Card>
        <Card><div className="s-label">Scores</div><div className="s-row" style={{ gap: 14, marginTop: 10, flexWrap: "wrap" }}><ScoreRing value={93} kind="fav" size={78} label="Favorabilité" /><ScoreRing value={83} kind="pert" size={78} label="Pertinence" /><ScoreRing value={67} kind="conf" size={78} label="Confiance" /><ScoreRing value={null} size={78} label="Sans note" /></div>
          <div className="s-stack" style={{ marginTop: 14 }}>{[0.95, 0.6, 0.3].map((v) => <FactorBar key={v} value={v} max={1} label={`Part ${v}`} />)}</div></Card>
        <Card><div className="s-label">Alertes</div><div className="s-stack" style={{ marginTop: 10 }}><Alert tone="warn" title="À surveiller">Coef 93, au-dessus de la plage utile.</Alert><Alert tone="gold" title="Notre conseil">Pen-Hir offre les meilleures conditions.</Alert><Alert tone="nr" title="Non recommandé">Houle trop forte (2,2 m ; max 1,5 m).</Alert></div></Card>
        <Card><div className="s-label">Navigation</div><div className="s-stack" style={{ marginTop: 10 }}><Segmented label="Exemple" value="a" options={[{ id: "a", label: "Vue rapide" }, { id: "b", label: "Détails" }, { id: "c", label: "Expert" }]} /><Segmented variant="pills" label="Filtres" value="a" options={[{ id: "a", label: "Tous 11" }, { id: "b", label: "Favorables 7" }, { id: "c", label: "Non recom. 1" }]} />
          <Stats items={[{ k: "Vent", icon: "wind", v: "13 km/h" }, { k: "Marée", icon: "maree-montante", v: "Montante" }, { k: "Eau", icon: "thermometer", v: "14,8 °C" }]} /></div></Card>
        <Card><div className="s-label">Bandeaux et chargement</div><div className="s-stack" style={{ marginTop: 10 }}><Banner tone="offline">Hors ligne · météo d'il y a 3 h</Banner><Banner tone="stale">Prévision de plus de 12 h</Banner><Banner tone="error">Open-Meteo injoignable</Banner><Skeleton h={14} w="80%" /><Skeleton h={14} w="60%" /></div></Card>
      </div>

      <h2 className="s-h2 p-board__h">Pictogrammes</h2>
      <p className="s-body">Lucide (licence ISC) pour l'interface, et des pictogrammes SPUMY dessinés sur la même grille (24 px, trait 2) : modes, leurre, jig, marée, gilet, houle. Plus aucun émoji.</p>
      <div className="p-modeicons">
        {[["mode-bord", "BORD", "Un pêcheur debout sur la roche, canne pliée, ligne dans les vagues"], ["mode-bateau", "BATEAU", "Une coque de pêche, sa cabine et une canne à l'arrière"]].map(([ic, l, d]) => (
          <Card key={ic}><div className="s-row" style={{ gap: 18 }}><span className="p-mode__icon"><Icon name={ic} size={44} stroke={2} /></span><div><div className="s-h2">{l}</div><p className="s-small">{d}</p><div className="s-row" style={{ gap: 12, marginTop: 8, color: "var(--accent-ink)" }}><Icon name={ic} size={16} /><Icon name={ic} size={20} /><Icon name={ic} size={28} /></div></div></div></Card>
        ))}
      </div>
      <div className="p-icons">{ICON_NAMES.map((n) => <div key={n} title={n}><Icon name={n} size={24} /><span>{n}</span></div>)}</div>

      <h2 className="s-h2 p-board__h">Leurres dessinés</h2>
      <div className="p-wrap" style={{ gap: 18 }}>{[["asturie", "Ghost Iwashi"], ["asturie", "Cabot"], ["zclaw", "Blanc nacré"], ["asturie", "Mackerel"], ["bavette", ""], ["cpt", "kaki"], ["spindle", "blanc"], ["dragmetal", ""]].map(([c, col], i) => <Card key={i} tight><LureArt cat={c} color={col} width={130} /><div className="s-small" style={{ textAlign: "center" }}>{c}{col ? ` · ${col}` : ""}</div></Card>)}</div>

      <h2 className="s-h2 p-board__h">Photos d'ambiance ({PHOTOS.length})</h2>
      <Alert tone="info" icon="image" title="Règle d'honnêteté">{CATALOGUE.regle}</Alert>
      <div className="p-photos">{PHOTOS.map((p) => (
        <figure key={p.id}><Photo photo={p} size={720} className="p-photos__img" mark={false} /><figcaption><b>{p.id}</b><span>{[p.mode, p.lumiere, p.ciel, p.mer, p.lieu, p.espece].filter(Boolean).join(" · ")}{p.reconnaissable ? " · reconnaissable" : ""}</span></figcaption></figure>
      ))}</div>
    </div>
  );
}

/** BORD face à BATEAU : même direction artistique, identités fonctionnelles distinctes. */
export function PlancheBoard({ Mini }) {
  const pairs = [["bord-decision", "bateau-sortir", "Décision : où et quand pêcher / Sortir ? La sécurité de la sortie d'abord"], ["bord-carte", "bateau-zones", "Carte : tes spots notés / tes zones et la distance d'un abri"], ["bord-spot", "bateau-zone", "Fiche : trois scores du spot / espèces ouvertes de la zone"], ["bord-journal", "bateau-sorties", "Journal : sessions du bord / sorties en mer et apprentissage"]];
  return (
    <div className="p-board">
      <h1 className="s-h1">BORD et BATEAU</h1>
      <p className="s-body" style={{ maxWidth: 760 }}>Une seule direction artistique, deux identités : le pictogramme du mode, la photo d'ambiance (rivage contre bateau), et ce qui passe en premier — le meilleur spot du bord, la sécurité de la sortie en mer.</p>
      <div className="p-pairs">
        {pairs.map(([a, b, t]) => (
          <div key={a} className="p-pair"><div className="p-pair__t">{t}</div><div className="p-pair__row"><Mini route={a} /><Mini route={b} /></div></div>
        ))}
      </div>
    </div>
  );
}

export function AvantApresBoard({ Mini }) {
  const rows = [["decision", "bord-decision", "Décision"], ["carte", "bord-carte", "Carte"], ["fiche", "bord-spot", "Fiche du spot"], ["journal", "bord-journal", "Journal"], ["terrain", "bord-terrain", "Mode terrain"]];
  return (
    <div className="p-board">
      <h1 className="s-h1">Avant / après</h1>
      <p className="s-body" style={{ maxWidth: 760 }}>À gauche, l'application d'aujourd'hui (v9.2, guide Logonna-Daoulas, iPhone 13, 13 novembre 2026 à 6 h 30, météo simulée des tests, fond de carte remplacé par un aplat vert ; scripts/avant-prototype.mjs) ; à droite, le prototype de la phase 11 (journée réelle du 16 mai 2026). Les données diffèrent : la comparaison porte sur la forme.</p>
      <div className="p-pairs">
        {rows.map(([k, r, t]) => (
          <div key={k} className="p-pair"><div className="p-pair__t">{t}</div>
            <div className="p-pair__row">
              <figure className="p-before"><img src={`${REF}avant-${k}.webp`} alt={`Avant : écran ${t} de l'application actuelle`} loading="lazy" /><figcaption>Avant (v9.2)</figcaption></figure>
              <div><Mini route={r} /><div className="p-before__cap">Après (prototype)</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MATRICE = [
  ["Identité générale", "Conforme", "Photo plein cadre en tête, fond bleu nuit, surfaces vitrées, cyan pour l'action, même ambiance premium et immersive."],
  ["Palette", "Conforme", "Couleurs mesurées sur la référence (cyan lumineux, bleu nuit, vert « Recommandé », ambre « À surveiller », or « Notre conseil »). Écart voulu : pastilles de favorabilité en bleus (spécification v2), jamais d'orange ni de rouge, réservés à la sécurité."],
  ["Typographie", "Conforme", "Roboto Condensed grasse pour titres, chiffres et libellés (la famille de la référence), Roboto pour les textes longs ; chiffres tabulaires, « /100 » en petit."],
  ["Composition", "Conforme", "Une action principale par écran (bouton cyan), gros blocs, trois niveaux d'information (Vue rapide, Détails, Expert) au lieu de paragraphes."],
  ["Composants", "Conforme", "Cartes vitrées à vignette, anneaux en dégradé, contrôles segmentés, tuiles d'accès, barres de facteurs, encadrés « À surveiller » et « Notre conseil »."],
  ["Navigation", "Conforme", "Barre du bas à cinq entrées (Décision, Carte, Journal, Matériel, Plus ; en mer : Sortie, Zones, Espèces, Sorties, Bateau), titres d'écran avec retour et action."],
  ["Iconographie", "Conforme", "Pictogrammes au trait d'un seul jeu (Lucide + SPUMY), deux pictogrammes de mode distincts. Plus d'émojis."],
  ["Photographies", "Partiellement conforme", "Tes photos donnent l'ambiance, choisies selon la lumière, le ciel, la mer et le lieu. Écart voulu : jamais présentées comme la photo d'un spot ou d'une prise (images générées), donc pas de « photo du Minou » ni de vignette de prise dans le journal ; leurres dessinés, pas photographiés."],
  ["Carte", "Partiellement conforme", "Trait de côte OpenStreetMap, pastilles du moteur, carte flottante du spot. Écart : pas de fond bathymétrique coloré, faute de donnée de profondeur ; la carte ne montre que ce qui est mesuré."],
  ["Interactions", "Conforme", "États prévus (chargement, hors ligne, obsolète, erreur, vide, permission refusée, succès, impossible), retour au toucher, mouvement réduit si l'appareil le demande."],
  ["Application globale", "Conforme dans le prototype", "Même langage sur les 18 écrans BORD et BATEAU et l'accueil. Reste à l'appliquer au code de l'application (phases 12 et 13)."],
];

export function ConformiteBoard({ Mini }) {
  const crops = [["Décision", "decision", "bord-decision"], ["Carte", "carte", "bord-carte"], ["Fiche du spot", "fiche", "bord-spot"], ["Comparaison", "comparaison", "bord-compare"],
    ["Ma stratégie", "strategie", "bord-strategie"], ["Matériel", "materiel", "bord-materiel"], ["Journal", "journal", "bord-journal"], ["Mode terrain", "terrain", "bord-terrain"]];
  return (
    <div className="p-board">
      <h1 className="s-h1">Conformité à la référence</h1>
      <p className="s-body" style={{ maxWidth: 760 }}>Matrice du prompt maître (§20), écran par écran face à ta maquette en huit écrans. Le dernier mot sur la direction artistique te revient.</p>
      <div className="p-pairs">{crops.map(([t, k, r]) => (
        <div key={k} className="p-pair"><div className="p-pair__t">{t}</div>
          <div className="p-pair__row">
            <figure className="p-before"><img src={`${REF}ref-${k}.webp`} alt={`Référence : écran ${t} de la maquette`} loading="lazy" /><figcaption>Référence (ta maquette)</figcaption></figure>
            <div><Mini route={r} /><div className="p-before__cap">Prototype</div></div>
          </div>
        </div>))}</div>
      <div className="p-matrix" role="table" aria-label="Matrice de conformité visuelle">
        <div role="row" className="p-matrix__head"><span role="columnheader">Critère</span><span role="columnheader">Résultat</span><span role="columnheader">Justification</span></div>
        {MATRICE.map(([c, r, j]) => (
          <div role="row" key={c}><span role="cell" style={{ color: "var(--text-1)", fontWeight: 600 }}>{c}</span><span role="cell"><Chip tone={r === "Conforme" ? "good-soft" : r.startsWith("Conforme") ? "accent" : "warn"}>{r}</Chip></span><span role="cell" className="s-small" style={{ color: "var(--text-2)" }}>{j}</span></div>
        ))}
      </div>
    </div>
  );
}
