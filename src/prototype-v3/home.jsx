// SPUMY V3 — Home BORD et BATEAU (UX-V3 § 6), refonte visuelle après le jalon 2 : cartes à photo, disque de score.
import { useEffect, useRef, useState } from "react";
import { Score, Safety, Hero, Icon, photoSrc, brandSrc } from "./ui.jsx";
import { SPOTS, MARKS, BOATS, SPECIES_PHOTO, ranking, verifyList, homePhrase, span, hhmm, SUN, NOW } from "./data.js";
import { tierOf } from "../design/v3/tokens.js";
import { PlaceField } from "./carte6.jsx";

const DAYS = [["today", "Aujourd'hui"], ["tomorrow", "Demain"], ["week", "7 jours"]];
const MODES = [["bord", "Shore", "Du bord · Bar", "inshore"], ["bateau", "Offshore", "En bateau · Toutes espèces", "offshore"]];

/**
 * Haut de Home (maquette de Félix, V3-028) : logo, SPUMY et slogan, cartes Shore et Offshore, lieu, jours.
 * En faisant défiler, il se resserre en une bande fixe (mode, lieu, jour) et reprend sa taille en remontant.
 */
export function HomeTop({ st, setMode, openPos, day, setDay, notify }) {
  const end = useRef(null);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setCompact(!e.isIntersecting && e.boundingClientRect.top < 0));
    if (end.current) io.observe(end.current);
    return () => io.disconnect();
  }, []);
  const pick = (k) => { setDay(k); if (k !== "today") notify?.("Démonstration : seule la journée d'aujourd'hui est remplie"); };
  return (
    <>
      <div className="htop6">
        <div className="hbrand6">
          <img src={brandSrc("spumy-symbole-256.png")} alt="" width="60" height="60" />
          <span className="word6">SPUMY</span><span className="sep6" aria-hidden="true" />
          <p className="slogan6"><span>Read the sea.</span><span className="o">Fish the moment.</span></p>
        </div>
        <div className="modes6" role="radiogroup" aria-label="Mode">
          {MODES.map(([k, l, sub, logo]) => (
            <button key={k} className="modecard6" role="radio" aria-checked={st.mode === k} onClick={() => setMode(k)}>
              <img src={brandSrc(`${logo}-256.webp`)} alt="" width="96" height="96" /><b>{l}</b><span>{sub}</span>
            </button>
          ))}
        </div>
        <PlaceField pos={st.pos} openPos={openPos} home />
        <div className="chips6 days6" role="group" aria-label="Jour">
          {DAYS.map(([k, l]) => <button key={k} className="chip6 day" aria-pressed={day === k} onClick={() => pick(k)}>{l}</button>)}
        </div>
        <span ref={end} className="htop6-end" aria-hidden="true" />
      </div>
      <div className={`hbar6${compact ? " on" : ""}`} aria-hidden={!compact} inert={compact ? undefined : ""}>
        <div className="mode6 sm" role="radiogroup" aria-label="Mode">
          {MODES.map(([k, l, , logo]) => <button key={k} role="radio" aria-checked={st.mode === k} onClick={() => setMode(k)}><img src={brandSrc(`${logo}-128.webp`)} alt="" width="22" height="22" />{l}</button>)}
        </div>
        <button className="hbar6-place" onClick={openPos}><Icon name="pin" size={18} /><span>{st.pos.state === "ok" ? st.pos.label : "Position"}</span></button>
        <button className="hbar6-day" onClick={() => pick(DAYS[(DAYS.findIndex(([k]) => k === day) + 1) % 3][0])}>{DAYS.find(([k]) => k === day)[1]}</button>
      </div>
    </>
  );
}

/** Bande de 24 h : chaque quart d'heure prend la couleur du meilleur score de spot à cette heure ; nuit grisée ; « maintenant ». */
export function DayBand({ cards }) {
  const pct = (h) => `${(h / 24) * 100}%`;
  const segs = [];
  for (let q = 0; q < 96; q++) {
    const h = q / 4, best = cards.filter((c) => c.win && h >= c.win[0] && h < c.win[1]).sort((a, b) => b.fav - a.fav)[0];
    const tier = best ? tierOf(best.fav).id : null, last = segs.at(-1);
    if (last && last.tier === tier) last.to = h + 0.25; else segs.push({ from: h, to: h + 0.25, tier, name: best?.name });
  }
  const favs = segs.filter((s) => s.tier != null);
  return (
    <div className="band6">
      <div className="band6-bar" role="img" aria-label={`Heures favorables : ${favs.map((s) => `${hhmm(s.from)}–${hhmm(s.to)} (${s.name})`).join(", ")}`}>
        <span className="nt" style={{ left: 0, width: pct(SUN.rise) }} /><span className="nt" style={{ left: pct(SUN.set), right: 0 }} />
        {favs.map((s, i) => <span key={i} className="fv" style={{ left: pct(s.from), width: pct(s.to - s.from), background: `var(--tier-${s.tier})` }} />)}
        <span className="nw" style={{ left: pct(NOW) }} />
      </div>
      <div className="band6-h num" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
    </div>
  );
}

export function RecCard({ s, rank, go }) {
  const t = tierOf(s.fav);
  return (
    <article className="rc" aria-label={`${rank}. ${s.name}`}>
      <div className="rc-media">
        <img src={photoSrc(s.photo, 1600)} alt="" loading="lazy" />
        <div className="rc-tags"><span className={`rc-rank${s.nearest ? " near" : ""}`}>{s.nearest ? `${rank} · Le plus proche` : s.tie ? `${rank} · ex æquo` : rank}</span>
          <span className="rc-illus">Illustration</span></div>
        <button className="rc-map" aria-label={`${s.name} sur la carte`} onClick={() => go("carte", s.id)}><Icon name="map" size={20} /></button>
        <div className="rc-over">
          <div className="rc-id">
            <span className="rc-time">{s.win ? span(s.win) : "Fenêtre non déterminable"}</span>
            <span className="rc-name"><a href={`#spot-${s.id}`} onClick={() => go("spot", s.id)}>{s.name}</a></span>
          </div>
          <div className="rc-score"><Score value={s.fav} compact /><span className="rc-word">{t ? t.word : "Sans note"}</span></div>
        </div>
      </div>
      <div className="rc-body">
        <div className="rc-facts num">
          <Safety s={s} short />
          <span>{s.route === 0 ? "sur place" : s.verified ? `${s.route} min` : `~${s.route} min, estim.`}</span>
          <span>Confiance {String(s.level).toLowerCase()} ({s.conf})</span>
        </div>
        <span className="rc-meta">{s.win ? s.reason[0].toUpperCase() + s.reason.slice(1) : `Raison : ${s.noWinWhy}`}.</span>
      </div>
    </article>
  );
}

function Skeletons() {
  return (<div className="cards2" aria-busy="true" aria-label="Calcul en cours">{[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 290 }} />)}</div>);
}

export function HomeBord({ st, go, heroPhoto, openPos, openJournal, setMode, notify }) {
  const [day, setDay] = useState("today");
  const top = <HomeTop st={st} setMode={setMode} openPos={openPos} day={day} setDay={setDay} notify={notify} />;
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
    <div className="screen flush home6">
      {top}
      <section className="heroc6" aria-label="Synthèse du jour">
        {heroPhoto && <img src={photoSrc(heroPhoto, 1600)} alt="" />}
        <span className="illus6">Illustration</span><span className="demo6c">Données démo</span>
        <div className="heroc6-in">
          <h1>{st.demo.loading ? "Calcul des spots autour de Pirou…" : phrase.text}</h1>
          {!st.demo.loading && <><p className="heroc6-sub">{phrase.sub}</p><p className="heroc6-sub">vigilance : aucune (Météo-France, 06:00)</p><DayBand cards={cards} /></>}
        </div>
      </section>
      <div className="screen home">
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
                <button className="btn grow" onClick={() => go("comparer", `${cards[2]?.id || "carteret"}-${cards[1]?.id || "agon"}`)}>Comparer deux spots</button>
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
        <p className="meta">Champs exacts à fixer avec le moteur BATEAU.</p>
      </div>
    </div>
  );
}

export function HomeBateau({ st, go, boat, setBoat, heroPhoto, setMode, openPos, notify }) {
  const [day, setDay] = useState("today");
  const top = <HomeTop st={st} setMode={setMode} openPos={openPos} day={day} setDay={setDay} notify={notify} />;
  if (!boat.ready) return <div className="home6">{top}<BoatChooser boat={boat} setBoat={setBoat} heroPhoto={heroPhoto} /></div>;
  const ok = MARKS.filter((m) => !m.status).map((m) => ({ ...m, best: Math.max(...m.species.map((x) => x.fav)) })).sort((a, b) => b.best - a.best);
  const verif = MARKS.filter((m) => m.status === "verify");
  return (
    <div className="screen flush home6">
      {top}
      <Hero photo={heroPhoto} title={"Sortie possible\u00a0: 07:00–12:00"} sub={`pire moment 12:40 : vent 4 Bft, rafales 22 nds, houle 1,1 m · ${boat.choice === "custom" ? "bateau saisi" : BOATS[0].name}`} />
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
