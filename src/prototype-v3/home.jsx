// SPUMY V3 — Home BORD et BATEAU (UX-V3 § 6).
import { useState } from "react";
import { Gauge, Safety, Hero, DayStrip, Icon } from "./ui.jsx";
import { SPOTS, MARKS, BOATS, ranking, verifyList, homePhrase, span } from "./data.js";

export function RecCard({ s, rank, first, go }) {
  return (
    <article className={`card rec${first ? " first" : ""}`} aria-label={`${rank}. ${s.name}`}>
      <div className="row between">
        {s.win ? <span className="time-big">{span(s.win)}</span> : <span className="time-none">Fenêtre non déterminable : {s.noWinWhy}</span>}
        {s.nearest ? <span className="badge dark">Le plus proche</span> : s.tie ? <span className="badge info">ex æquo</span> : <Safety s={s} />}
      </div>
      <div className="row"><span className="rank">{rank}</span><span className="spotname">{s.name}</span>
        <span className="meta num">· {s.verified ? `${s.route} min` : `~${s.route} min, estimation`} · bar</span></div>
      <Gauge label="Favorabilité" value={s.fav} />
      {first ? <Gauge size="thin" label="Confiance" note="ne change pas le rang" value={s.conf} word={s.level} />
        : <span className="meta num">Confiance {s.conf}/100 — {s.level}</span>}
      {(first || s.nearest) && <span className="why">{s.reason[0].toUpperCase() + s.reason.slice(1)}.</span>}
      {(s.nearest || s.tie) && <Safety s={s} />}
      <div className="row">
        <a className="btn grow" href={`#spot-${s.id}`} onClick={() => go("spot", s.id)}>Fiche</a>
        <button className="btn grow" onClick={() => go("carte", s.id)}>Sur la carte</button>
      </div>
    </article>
  );
}

function Skeletons() {
  return (<div className="cards2" aria-busy="true" aria-label="Calcul en cours">{[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 150, marginBottom: 12 }} />)}</div>);
}

export function HomeBord({ st, go, heroPhoto, openPos, openJournal }) {
  const [day, setDay] = useState("today");
  const noPos = st.pos.state !== "ok";
  if (noPos) {
    return (
      <div className="screen flush">
        <Hero photo={heroPhoto} title="Choisis ta position en haut à droite pour voir où pêcher" min={320}>
          <button className="btn small" onClick={openPos}><Icon name="pin" size={18} />Position</button>
        </Hero>
        <div className="screen"><p className="sec">Aucune position n'est devinée : ni adresse IP, ni guide par défaut. La position reste sur ton appareil.</p></div>
      </div>
    );
  }
  if (st.demo.far) {
    return (
      <div className="screen flush">
        <Hero photo={heroPhoto} title="Aucun spot BORD à moins d'1 h de route d'ici" sub="Le plus proche est à environ 3 h 40 (estimation)." min={240} />
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
      <Hero photo={heroPhoto} title={st.demo.loading ? "Calcul des spots autour de Pirou…" : phrase.text} sub={st.demo.loading ? null : `${phrase.sub} · vigilance : aucune (Météo-France, 06:00)`} />
      <div className="screen">
        <div className="chips" role="group" aria-label="Jour">
          {[["today", "Aujourd'hui"], ["tomorrow", "Demain"], ["week", "7 jours"]].map(([k, l]) => <button key={k} className="chip" aria-pressed={day === k} onClick={() => setDay(k)}>{l}</button>)}
          <span className="tag" style={{ alignSelf: "center" }}>≤ 60 min de route depuis Pirou</span>
        </div>
        {day !== "today" && <p className="badge info">Démonstration : seule la journée d'aujourd'hui est remplie.</p>}
        {st.demo.loading ? <Skeletons /> : (
          <>
            <DayStrip bands={cards.filter((c) => c.win).map((c) => ({ w: c.win, fav: c.fav }))} />
            {scarceWhy && <p className="why"><Icon name="info" size={16} /> {scarceWhy}</p>}
            <div className="cards2">
              {cards.map((s, i) => <RecCard key={s.id} s={s} rank={s.tie ? 3 : i + 1} first={i === 0} go={go} />)}
            </div>
            {extra > 0 && <button className="btn">+ {extra} autres à égalité</button>}
            <details className="card zone-verify">
              <summary><span>À vérifier ({verif.length})</span><Icon name="down" /></summary>
              <ul className="list">{verif.map((s) => (
                <li key={s.id} className="lrow"><span><b>{s.name}</b><br /><span className="meta">{s.verifyWhy}</span></span>
                  <a className="btn small" href={`#spot-${s.id}`} onClick={() => go("spot", s.id)}>Fiche</a></li>))}</ul>
              <p className="meta">Ces spots ne sont jamais promus parmi les recommandations.</p>
            </details>
            <div className="row">
              <button className="btn grow" onClick={() => go("comparer", `${cards[2]?.id || "c"}-${cards[1]?.id || "a"}`)}>Comparer</button>
              <button className="btn primary grow" onClick={openJournal}><Icon name="plus" size={18} />Noter une sortie</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BoatChooser({ boat, setBoat }) {
  const [choice, setChoice] = useState(boat.choice || "saved");
  return (
    <div className="screen">
      <h1>Avec quel bateau ?</h1>
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
      <p className="meta">Aucun verdict sans bateau. Champs exacts à fixer avec le moteur BATEAU (Phase 9).</p>
    </div>
  );
}

export function HomeBateau({ st, go, boat, setBoat, heroPhoto }) {
  if (!boat.ready) return <BoatChooser boat={boat} setBoat={setBoat} />;
  const ok = MARKS.filter((m) => !m.status).map((m) => ({ ...m, best: Math.max(...m.species.map((x) => x.fav)) })).sort((a, b) => b.best - a.best);
  const verif = MARKS.filter((m) => m.status === "verify");
  return (
    <div className="screen flush">
      <Hero photo={heroPhoto} title="Sortie possible : 07:00–12:00" sub={`pire moment 12:40 : vent 4 Bft, rafales 22 nds, houle 1,1 m · ${boat.choice === "custom" ? "bateau saisi" : BOATS[0].name}`} />
      <div className="screen">
        <div className="cards2">
          {ok.slice(0, 3).map((m, i) => (
            <article key={m.id} className={`card rec${i === 0 ? " first" : ""}`}>
              <div className="row between"><span className="time-big">{span(m.win)}</span><Safety s={m} /></div>
              <div className="row"><span className="rank">{i + 1}</span><span className="spotname">Marque « {m.name} »</span><span className="meta">· {m.depth} · {m.fond}</span></div>
              {m.species.map((x) => (
                <div key={x.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <Gauge label={x.name} value={x.fav} />
                  <span className="meta num">Confiance {x.conf}/100 — {x.level} · {x.rule}</span>
                </div>
              ))}
              <span className="meta num">Abri à {String(m.shelter).replace(".", ",")} MN · {Math.round((m.shelter / 15) * 60)} min à 15 nds</span>
            </article>
          ))}
        </div>
        <details className="card zone-verify"><summary><span>À vérifier ({verif.length})</span><Icon name="down" /></summary>
          <ul className="list">{verif.map((m) => <li key={m.id} className="lrow"><span><b>{m.name}</b><br /><span className="meta">{m.verifyWhy}</span></span></li>)}</ul></details>
        <div className="card"><span className="meta">Gilet · VHF canal 16 · BMS · itinéraire laissé à un proche</span></div>
        <div className="card zone-verify" style={{ borderStyle: "dashed" }}><b>Carte marine : épaves, hauts-fonds, balisage</b><span className="meta">Bonus à étudier (V3-024) : sources et licences à vérifier. Ne remplacerait jamais une carte marine officielle.</span></div>
        <button className="btn" onClick={() => setBoat({ ...boat, ready: false })}>Changer de bateau</button>
      </div>
    </div>
  );
}
