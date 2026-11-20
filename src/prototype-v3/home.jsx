// SPUMY V3 — Home BORD et BATEAU (UX-V3 § 6), refonte visuelle après le jalon 2 : cartes à photo, disque de score.
import { useState } from "react";
import { Score, Safety, Hero, DayStrip, Icon, photoSrc } from "./ui.jsx";
import { SPOTS, MARKS, BOATS, SPECIES_PHOTO, ranking, verifyList, homePhrase, span } from "./data.js";

export function RecCard({ s, rank, go }) {
  return (
    <article className="rc" aria-label={`${rank}. ${s.name}`}>
      <div className="rc-media">
        <img src={photoSrc(s.photo, 1600)} alt="" loading="lazy" />
        <span className={`rc-rank${s.nearest ? " near" : ""}`}>{s.nearest ? `${rank} · Le plus proche` : s.tie ? `${rank} · ex æquo` : rank}</span>
        <span className="rc-illus">Illustration</span>
        <div className="rc-over">
          <span className="rc-time">{s.win ? span(s.win) : "Fenêtre non déterminable"}</span>
          <span className="rc-name"><a href={`#spot-${s.id}`} onClick={() => go("spot", s.id)}>{s.name}</a></span>
        </div>
      </div>
      <div className="rc-body">
        <div className="row between" style={{ flexWrap: "nowrap" }}>
          <Score value={s.fav} conf={s.conf} level={s.level} />
          <button className="btn small rc-map" aria-label={`${s.name} sur la carte`} onClick={() => go("carte", s.id)}><Icon name="map" size={18} /></button>
        </div>
        <div className="row"><Safety s={s} /><span className="rc-meta num">{s.verified ? `${s.route} min de route` : `~${s.route} min, estimation`} · bar</span></div>
        {!s.win && <span className="rc-meta">Raison : {s.noWinWhy}</span>}
        <span className="rc-meta">{s.reason[0].toUpperCase() + s.reason.slice(1)}.</span>
      </div>
    </article>
  );
}

function Skeletons() {
  return (<div className="cards2" aria-busy="true" aria-label="Calcul en cours">{[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 290 }} />)}</div>);
}

export function HomeBord({ st, go, heroPhoto, openPos, openJournal }) {
  const [day, setDay] = useState("today");
  if (st.pos.state !== "ok") {
    return (
      <div className="screen flush">
        <Hero photo={heroPhoto} title="Choisis ta position en haut à droite pour voir où pêcher" min={420}>
          <button className="btn small" onClick={openPos}><Icon name="pin" size={18} />Position</button>
        </Hero>
        <div className="screen"><p className="sec">Aucune position n'est devinée : ni adresse IP, ni guide par défaut. La position reste sur ton appareil.</p></div>
      </div>
    );
  }
  if (st.demo.far) {
    return (
      <div className="screen flush">
        <Hero photo={heroPhoto} title="Aucun spot BORD à moins d'1 h de route d'ici" sub="Le plus proche est à environ 3 h 40 (estimation)." />
        <div className="screen">
          <button className="btn" onClick={openPos}>Changer de position</button>
          <details className="card"><summary className="row between"><b>Les plus proches au-delà d'1 h</b><Icon name="down" /></summary>
            <p className="meta">Liste à part, marquée « au-delà d'1 h » ; jamais mélangée aux recommandations.</p></details>
        </div>
      </div>
    );
  }
  const { cards, extra, scarceWhy } = ranking(SPOTS, { scarce: st.demo.scarce, tie: st.demo.tie });
  const phrase = homePhrase(cards, { scarce: st.demo.scarce });
  const verif = verifyList();
  return (
    <div className="screen flush">
      <Hero photo={heroPhoto} title={st.demo.loading ? "Calcul des spots autour de Pirou…" : phrase.text} sub={st.demo.loading ? null : `${phrase.sub} · vigilance : aucune (Météo-France, 06:00)`}>
        {!st.demo.loading && <div style={{ width: "100%", maxWidth: 420, marginTop: 10 }}><DayStrip bands={cards.filter((c) => c.win).map((c) => ({ w: c.win, fav: c.fav }))} /></div>}
      </Hero>
      <div className="screen home">
        <div className="chips" role="group" aria-label="Jour">
          {[["today", "Aujourd'hui"], ["tomorrow", "Demain"], ["week", "7 jours"]].map(([k, l]) => <button key={k} className="chip" aria-pressed={day === k} onClick={() => setDay(k)}>{l}</button>)}
        </div>
        {day !== "today" && <p className="badge info">Démonstration : seule la journée d'aujourd'hui est remplie.</p>}
        {st.demo.loading ? <Skeletons /> : (
          <>
            <section className="sect" aria-labelledby="h-reco">
              <div><h2 className="sect-h" id="h-reco">Où pêcher</h2><p className="sect-sub">{cards.length} spot{cards.length > 1 ? "s" : ""} à moins d'1 h de route, classés par Favorabilité</p></div>
              {scarceWhy && <p className="why"><Icon name="info" size={16} /> {scarceWhy}</p>}
              <div className="cards2">{cards.map((s, i) => <RecCard key={s.id} s={s} rank={s.tie ? 3 : i + 1} go={go} />)}</div>
              {extra > 0 && <button className="btn">+ {extra} autres à égalité</button>}
            </section>
            <section className="sect" aria-labelledby="h-verif">
              <div><h2 className="sect-h" id="h-verif">À vérifier avant d'y aller</h2><p className="sect-sub">Jamais promus parmi les recommandations</p></div>
              <details className="card zone-verify">
                <summary><span>À vérifier ({verif.length})</span><Icon name="down" /></summary>
                <ul className="list">{verif.map((s) => (
                  <li key={s.id} className="lrow"><span><b>{s.name}</b><br /><span className="meta">{s.verifyWhy}</span></span>
                    <a className="btn small" href={`#spot-${s.id}`} onClick={() => go("spot", s.id)}>Fiche</a></li>))}</ul>
              </details>
            </section>
            <section className="sect" aria-labelledby="h-next">
              <h2 className="sect-h" id="h-next">Et ensuite</h2>
              <div className="row">
                <button className="btn grow" onClick={() => go("comparer", `${cards[2]?.id || "c"}-${cards[1]?.id || "a"}`)}>Comparer deux spots</button>
                <button className="btn primary grow" onClick={openJournal}><Icon name="plus" size={18} />Noter une sortie</button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function BoatChooser({ boat, setBoat, heroPhoto }) {
  const [choice, setChoice] = useState(boat.choice || "saved");
  return (
    <div className="screen flush">
      <Hero photo={heroPhoto} title="Avec quel bateau ?" sub="Aucun verdict de sortie sans bateau." min={220} />
      <div className="screen">
        <div role="radiogroup" aria-label="Bateau de la sortie" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="radio" role="radio" aria-checked={choice === "saved"} onClick={() => setChoice("saved")}><span className="dot" />
            <span><b>Mon bateau : {BOATS[0].name}</b><br /><span className="meta">enregistré dans Profil · par défaut · {BOATS[0].speed} nds · catégorie {BOATS[0].cat}</span></span></button>
          <button className="radio" role="radio" aria-checked={choice === "custom"} onClick={() => setChoice("custom")}><span className="dot" />
            <span><b>Saisir pour cette sortie</b><br /><span className="meta">le bateau d'un ami, une location…</span></span></button>
        </div>
        {choice === "custom" && (
          <div className="card">
            {["Catégorie de conception (C, D…)", "Longueur et motorisation", "Armement de sécurité", "Vitesse de croisière (nœuds)", "Port ou cale de départ"].map((l) => <label key={l} className="field">{l}<input /></label>)}
            <label className="row"><input type="checkbox" /> Enregistrer ce bateau dans Profil</label>
          </div>
        )}
        <button className="btn primary" onClick={() => setBoat({ choice, ready: true })}>Voir si je peux sortir</button>
        <p className="meta">Champs exacts à fixer avec le moteur BATEAU (Phase 9).</p>
      </div>
    </div>
  );
}

export function HomeBateau({ go, boat, setBoat, heroPhoto }) {
  if (!boat.ready) return <BoatChooser boat={boat} setBoat={setBoat} heroPhoto={heroPhoto} />;
  const ok = MARKS.filter((m) => !m.status).map((m) => ({ ...m, best: Math.max(...m.species.map((x) => x.fav)) })).sort((a, b) => b.best - a.best);
  const verif = MARKS.filter((m) => m.status === "verify");
  return (
    <div className="screen flush">
      <Hero photo={heroPhoto} title="Sortie possible : 07:00–12:00" sub={`pire moment 12:40 : vent 4 Bft, rafales 22 nds, houle 1,1 m · ${boat.choice === "custom" ? "bateau saisi" : BOATS[0].name}`} />
      <div className="screen home">
        <section className="sect" aria-labelledby="h-zones">
        <div><h2 className="sect-h" id="h-zones">Où aller</h2><p className="sect-sub">Tes marques, classées par la meilleure espèce ouverte</p></div>
        <div className="cards2">
          {ok.slice(0, 3).map((m, i) => (
            <article key={m.id} className="rc">
              <div className="rc-body" style={{ paddingTop: 14 }}>
                <div className="row between"><span className="row"><span className="rank">{i + 1}</span><span className="rc-name">Marque « {m.name} »</span></span><Safety s={m} short /></div>
                <span className="rc-time">{span(m.win)}</span>
                <span className="rc-meta num">{m.depth} · {m.fond} · abri à {String(m.shelter).replace(".", ",")} MN, {Math.round((m.shelter / 15) * 60)} min à 15 nds</span>
                {m.species.map((x) => (
                  <div key={x.name} className="sp">
                    <img className="thumb" src={photoSrc(SPECIES_PHOTO[x.name], 720)} alt="" />
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div className="row between"><b>{x.name}</b></div>
                      <Score value={x.fav} conf={x.conf} level={x.level} />
                      <span className="rc-meta">{x.rule}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        </section>
        <section className="sect" aria-labelledby="h-bverif"><h2 className="sect-h" id="h-bverif">À vérifier avant de partir</h2>
        <details className="card zone-verify"><summary><span>À vérifier ({verif.length})</span><Icon name="down" /></summary>
          <ul className="list">{verif.map((m) => <li key={m.id} className="lrow"><span><b>{m.name}</b><br /><span className="meta">{m.verifyWhy}</span></span></li>)}</ul></details>
        </section>
        <section className="sect" aria-labelledby="h-secu"><h2 className="sect-h" id="h-secu">Avant de larguer</h2>
        <div className="card"><span className="meta">Gilet · VHF canal 16 · BMS · itinéraire laissé à un proche</span></div>
        <div className="card zone-verify"><b>Carte marine : épaves, hauts-fonds, balisage</b><span className="meta">Bonus à étudier (V3-024) : sources et licences à vérifier. Ne remplacerait jamais une carte marine officielle.</span></div>
        <button className="btn" onClick={() => setBoat({ ...boat, ready: false })}>Changer de bateau</button>
        <button className="btn ghost" onClick={() => go("meteo")}>Voir la mer heure par heure</button>
        </section>
      </div>
    </div>
  );
}
