// Prototype — accueil SPUMY (choix du mode) et planche des états (chargement, hors ligne, erreur, vide…).
import { useState } from "react";
import { Alert, Banner, Button, Card, Chip, Icon, IconButton, Logo, Pastille, Photo, SectionTitle, Skeleton } from "../design/ds/ui.jsx";
import { PHOTO, photoFor } from "./photos.js";
import bord from "./data/bord.json";
import { TOP } from "./bord.jsx";
import { dateShort } from "./util.js";

// Les sept guides de l'application (data/sites/*.config.js) ; seule la journée de Logonna est calculée ici.
const GUIDES = [
  { id: "logonna", nom: "Logonna-Daoulas", dep: "Finistère", zone: "Rade de Brest", calc: true },
  { id: "crozon", nom: "Crozon – Douarnenez", dep: "Finistère", zone: "Presqu'île de Crozon" },
  { id: "plouguerneau", nom: "Plouguerneau", dep: "Finistère", zone: "Abers" },
  { id: "carantec", nom: "Carantec", dep: "Finistère", zone: "Haut-Léon" },
  { id: "audierne", nom: "Audierne", dep: "Finistère", zone: "Cap Sizun" },
  { id: "concarneau", nom: "Concarneau", dep: "Finistère", zone: "Cornouaille" },
  { id: "pirou", nom: "Pirou", dep: "Manche", zone: "Côte ouest du Cotentin" },
];

export function Accueil({ go }) {
  const [mode, setMode] = useState("bord");
  return (
    <div className="s-screen s-screen--nonav">
      <div className="s-pad" style={{ paddingTop: 14 }}>
        <div className="s-row-between"><Logo size={28} /><IconButton icon="search" label="Rechercher un spot" variant="glass" /></div>
        <h1 className="s-h1" style={{ marginTop: 18 }}>Où pêches-tu <span className="s-grad-text">aujourd'hui</span> ?</h1>
      </div>
      <div className="s-pad p-modes" role="radiogroup" aria-label="Mode de pêche">
        {[["bord", "Du bord", "mode-bord", "roche-ciel-bleu", "7 guides · 66 spots"], ["bateau", "En bateau", "mode-bateau", "semi-rigide-gilets", "Tes zones · 6 espèces"]].map(([id, label, ic, ph, sub]) => (
          <button key={id} type="button" role="radio" aria-checked={mode === id} className={`p-mode ${mode === id ? "is-on" : ""}`} onClick={() => setMode(id)}>
            <Photo photo={PHOTO[ph]} size={720} scrim className="p-mode__img" markPos="tr" />
            <span className="p-mode__body">
              <span className="p-mode__icon"><Icon name={ic} size={34} stroke={2.1} /></span>
              <span className="p-mode__label">{label}</span>
              <span className="p-mode__sub">{sub}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="s-pad s-stack" style={{ marginTop: 6 }}>
        {mode === "bord" ? <>
          <SectionTitle>Meilleur spot du jour</SectionTitle>
          <Card as="button" tight onClick={() => go("bord-decision")}>
            <div className="s-row" style={{ gap: 12 }}>
              <Pastille value={TOP.fav} size={44} />
              <div className="s-grow"><div className="s-h3">{TOP.name}</div><div className="s-small">Logonna-Daoulas · {TOP.best.start}–{TOP.best.end} · {dateShort(bord.meta.date)}</div></div>
              <Icon name="chevron-right" size={22} style={{ color: "var(--text-3)" }} />
            </div>
          </Card>
          <SectionTitle>Tes guides</SectionTitle>
          {["Finistère", "Manche"].map((dep) => (
            <Card key={dep} tight>
              <div className="s-label" style={{ marginBottom: 2 }}>{dep}</div>
              <ul className="s-list">
                {GUIDES.filter((g) => g.dep === dep).map((g) => (
                  <li key={g.id}><button type="button" className="s-li" onClick={() => g.calc && go("bord-decision")} aria-disabled={!g.calc}>
                    <span className="p-li-ic"><Icon name="map-pin" size={20} /></span>
                    <span className="s-grow"><span style={{ color: "var(--text-1)", fontSize: 16 }}>{g.nom}</span><br /><span className="s-small">{g.zone}</span></span>
                    {g.calc ? <Pastille value={TOP.fav} size={30} /> : <span className="s-small">non calculé ici</span>}
                    <Icon name="chevron-right" className="s-li__chev" size={20} />
                  </button></li>
                ))}
              </ul>
            </Card>
          ))}
        </> : <>
          <Card as="button" onClick={() => go("bateau-sortir")} tight>
            <div className="s-row" style={{ gap: 12 }}>
              <span className="p-mode__icon p-mode__icon--sm"><Icon name="mode-bateau" size={26} /></span>
              <div className="s-grow"><div className="s-h3">Sortir aujourd'hui ?</div><div className="s-small">Sécurité de la sortie, zones, espèces</div></div>
              <Chip tone="warn">À vérifier</Chip>
            </div>
          </Card>
          <Alert tone="info" title="Mode BATEAU : maquette">Le moteur par espèce est la phase 10 (reportée). Ces écrans montrent la spécification de la phase 9 avec des données d'exemple.</Alert>
        </>}
        <Button block onClick={() => go(mode === "bord" ? "bord-decision" : "bateau-sortir")}>{mode === "bord" ? "Ouvrir Logonna-Daoulas" : "Ouvrir le mode BATEAU"}</Button>
      </div>
    </div>
  );
}

// ── États : un mini-écran par état (prompt maître §7.3) ─────────
export function EtatsBoard() {
  const storm = photoFor({ usage: "etat", mer: "tempete", ciel: "orage", cle: "etat" });
  const S = ({ title, children }) => <div className="p-state"><div className="p-state__title">{title}</div><div className="p-state__screen s-app">{children}</div></div>;
  return (
    <div className="p-board">
      <h1 className="s-h1">États de l'interface</h1>
      <p className="s-body" style={{ maxWidth: 720 }}>Chaque écran prévoit ses états : chargement, données absentes, erreur, données obsolètes, hors ligne, permission refusée, résultat vide, action réussie ou impossible. Ici, la Décision du mode BORD dans chacun.</p>
      <div className="p-states">
        <S title="Chargement">
          <div className="s-pad s-stack" style={{ paddingTop: 16 }}>
            <Skeleton h={220} r={20} /><Skeleton h={22} w="70%" /><Skeleton h={16} w="90%" /><Skeleton h={52} r={999} />
            <div className="s-row"><Skeleton h={70} r={14} /><Skeleton h={70} r={14} /><Skeleton h={70} r={14} /></div>
            <p className="s-small" style={{ textAlign: "center" }}>Météo et marée en cours… la marée est calculée sur le téléphone, même sans réseau.</p>
          </div>
        </S>
        <S title="Hors ligne">
          <div className="s-pad s-stack" style={{ paddingTop: 16 }}>
            <Banner tone="offline">Hors ligne · dernière météo reçue il y a 3 h, marée calculée ici</Banner>
            <Card tight><div className="s-row" style={{ gap: 12 }}><Pastille value={TOP.fav} size={44} /><div><div className="s-h3">{TOP.name}</div><div className="s-small">d'après la météo de 03h00</div></div></div></Card>
            <p className="s-small">La note reste affichée avec l'âge des données ; la confiance baisse (part « Données »).</p>
          </div>
        </S>
        <S title="Données obsolètes">
          <div className="s-pad s-stack" style={{ paddingTop: 16 }}>
            <Banner tone="stale" action={<button type="button" className="s-btn s-btn--ghost s-btn--sm">Actualiser</button>}>Prévision de plus de 12 h</Banner>
            <Card tight><div className="s-row" style={{ gap: 12 }}><Pastille value={TOP.fav} status="verify" size={44} /><div><div className="s-h3">{TOP.name}</div><div className="s-small">À vérifier : prévision ancienne</div></div></div></Card>
          </div>
        </S>
        <S title="Erreur météo">
          <div className="s-pad s-stack" style={{ paddingTop: 16 }}>
            <Banner tone="error" action={<button type="button" className="s-btn s-btn--ghost s-btn--sm">Réessayer</button>}>Open-Meteo injoignable</Banner>
            <Alert tone="warn" title="Pas de note sans météo">Vent et houle inconnus : aucun spot au vert. La marée et la fiche des spots restent consultables.</Alert>
          </div>
        </S>
        <S title="Résultat vide (tempête)">
          <Photo photo={storm} scrim className="p-state__hero" markPos="br">
            <div className="s-pad" style={{ paddingTop: 70 }}><h2 className="s-h1" style={{ fontSize: 26, color: "var(--text-on-photo)" }}>Aucun spot recommandé</h2><p className="p-hero__sub">Coup de vent force 8 : tous les spots sont non recommandés.</p></div>
          </Photo>
          <div className="s-pad s-stack" style={{ marginTop: 12 }}>
            <Card tight><div className="s-row" style={{ gap: 12 }}><Pastille status="nr" size={36} /><div className="s-small">Raison écrite pour chaque spot, et la prochaine journée favorable.</div></div></Card>
          </div>
        </S>
        <S title="Permission refusée">
          <div className="s-pad s-stack" style={{ paddingTop: 16 }}>
            <Alert tone="info" icon="locate-fixed" title="Position non partagée">La distance à pied au spot demande ta position. Sans elle, SPUMY donne le temps de route depuis ton point de départ.</Alert>
            <button type="button" className="s-btn s-btn--secondary s-btn--block">Partager ma position une fois</button>
          </div>
        </S>
        <S title="Action réussie">
          <div className="s-pad s-stack" style={{ paddingTop: 16 }}>
            <Card tight><div className="s-row" style={{ gap: 12 }}><Icon name="book-open" size={26} style={{ color: "var(--accent-ink)" }} /><div><div className="s-h3">Session notée</div><div className="s-small">Moulin Mer · 1 bar · Z Claw blanc nacré</div></div></div></Card>
            <div className="s-toast" style={{ position: "static", transform: "none", alignSelf: "center" }}><Icon name="circle-check" size={18} style={{ color: "var(--good)" }} />Session enregistrée et sauvegardée</div>
          </div>
        </S>
        <S title="Action impossible">
          <div className="s-pad s-stack" style={{ paddingTop: 16 }}>
            <Alert tone="nr" title="Sauvegarde refusée">Ton dépôt de journal est public : SPUMY n'y écrit pas tes spots. Rends-le privé, puis réessaie.</Alert>
          </div>
        </S>
      </div>
    </div>
  );
}
