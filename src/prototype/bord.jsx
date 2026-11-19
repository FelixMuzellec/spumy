// Prototype — écrans du mode BORD, sur la vraie journée du 16 mai 2026 passée au moteur v2.
import { useState } from "react";
import {
  Alert, BottomNav, Button, Card, Chip, Icon, IconButton, Logo, Pastille, Photo, Reasons, ScoreRing, ScoreTriplet,
  SectionTitle, Segmented, Stats, TopBar, FactorBar, favWord,
} from "../design/ds/ui.jsx";
import bord from "./data/bord.json";
import carte from "./data/carte-logonna.json";
import { photoFor } from "./photos.js";
import { HourlyBars, LureArt, MapView, TideCurve, WindowStrip } from "./art.jsx";
import { ambianceOf, dateShort, factorsOf, fr, headline, lieuLabel, momentOf, reasonsOf, watchOf } from "./util.js";

export const SPOTS = bord.spots;
export const ELIG = SPOTS.filter((s) => s.status !== "nr").sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
export const TOP = ELIG[0];
export const spotById = (id) => SPOTS.find((s) => s.id === id) || TOP;

export const NAV_BORD = [
  { id: "bord-decision", label: "Décision", icon: "house" },
  { id: "bord-carte", label: "Carte", icon: "map" },
  { id: "bord-journal", label: "Journal", icon: "book-open" },
  { id: "bord-materiel", label: "Matériel", icon: "leurre" },
  { id: "bord-plus", label: "Plus", icon: "ellipsis" },
];
const navFor = (route) => ({ "bord-spot": "bord-carte", "bord-compare": "bord-decision", "bord-strategie": "bord-materiel", "bord-terrain": "bord-decision" }[route] || route);
export function BordNav({ route, go }) {
  return <BottomNav items={NAV_BORD} current={navFor(route)} onSelect={(id) => go(id)} />;
}

/** Repère discret : la journée réelle et le moteur qui l'a notée (le prototype n'est pas l'application). */
export function DayMark({ light }) {
  return <span className={`p-daymark ${light ? "p-daymark--light" : ""}`}>Journée réelle du {dateShort(bord.meta.date)} · moteur v2</span>;
}

const spotPhoto = (s, usage = "spot", exclure = []) => photoFor({ ...ambianceOf(s, usage, { nomme: true }), exclure });

// ── 1. Décision ─────────────────────────────────────────────────
export function BordDecision({ go }) {
  const s = TOP;
  const hero = photoFor({ ...ambianceOf(s, "hero"), spotNomme: false, cle: "decision" });
  const nr = SPOTS.filter((x) => x.status === "nr");
  const others = ELIG.slice(1, 3);
  const factors = reasonsOf(s, 3);
  return (
    <div className="s-screen">
      <Photo photo={hero} fade eager className="p-hero" markPos="br">
        <div className="s-pad p-hero__top">
          <Logo size={26} />
          <IconButton icon="user" label="Profil et réglages" variant="on-photo" onClick={() => go("bord-plus")} />
        </div>
        <div className="s-pad p-hero__body">
          <DayMark light />
          <h1 className="s-h1 p-hero__title"><span className="s-grad-text">{headline(s.fav).split(" ")[0]}</span> {headline(s.fav).split(" ").slice(1).join(" ")} {momentOf(s.best?.light)}</h1>
          <p className="p-hero__sub">Fenêtre idéale de {s.best.start} à {s.best.end}, {s.name.replace(/^Pointe (de |du |des )?/, "pointe $1")}.</p>
          <Button onClick={() => go("bord-spot", { spot: s.id })}>Voir la recommandation</Button>
        </div>
      </Photo>

      <div className="s-pad s-stack" style={{ marginTop: -6 }}>
        <Card as="button" flush onClick={() => go("bord-spot", { spot: s.id })} aria-label={`${s.name} : favorabilité ${s.fav} sur 100, recommandé`}>
          <div className="p-spotcard">
            <Photo photo={spotPhoto(s, "spot", [hero?.id])} size={720} className="p-spotcard__img" markPos="bl" />
            <div className="p-spotcard__body">
              <h2 className="s-h3" style={{ fontSize: 19 }}>{s.name}</h2>
              <Chip tone="good" className="p-spotcard__chip" icon="circle-check">Recommandé</Chip>
              <div className="s-row" style={{ gap: 10, marginTop: 6 }}>
                <ScoreRing value={s.fav} kind="fav" size={78} stroke={7} suffix fontScale={0.3} label="Favorabilité" />
                <ul className="p-mini-reasons">
                  {factors.map((f, i) => <li key={i}><Icon name={["maree-montante", "sunrise", "wind"][i] || "circle-check"} size={15} />{f.t.replace(/^Fenêtre de marée « prime » de la fiche$/, "Marée : fenêtre prime").replace(/^Lumière de l'aube$/, "Aube").replace(/^vent de mer/i, "Vent de mer")}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <nav className="s-tiles" aria-label="Accès rapides">
          {[["bord-terrain", "Terrain", "locate-fixed"], ["bord-compare", "Comparer", "chart-column"], ["bord-strategie", "Stratégie", "target"], ["bord-plus-maree", "Marée", "maree-montante"]].map(([id, l, ic]) => (
            <button key={id} type="button" className="s-tile" onClick={() => go(id === "bord-plus-maree" ? "bord-plus" : id, id === "bord-strategie" ? { spot: s.id } : undefined)}><Icon name={ic} size={26} />{l}</button>
          ))}
        </nav>

        <SectionTitle action={<button type="button" className="s-btn s-btn--ghost s-btn--sm" onClick={() => go("bord-compare")}>Comparer<Icon name="chevron-right" size={18} /></button>}>Autres bons choix</SectionTitle>
        <div className="p-hscroll">
          {others.map((o) => (
            <Card key={o.id} as="button" tight onClick={() => go("bord-spot", { spot: o.id })} className="p-other">
              <div className="s-row" style={{ gap: 10 }}>
                <Pastille value={o.fav} status={o.status} size={38} />
                <div className="s-grow">
                  <div className="s-h3" style={{ fontSize: 16 }}>{o.name}</div>
                  <div className="s-small">{o.best.start}–{o.best.end} · {o.best.lightLabel?.toLowerCase()}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {nr.length > 0 && (
          <Alert tone="nr" title={`${nr.length} spot non recommandé aujourd'hui`}>
            {nr[0].name} : {nr[0].nrReason.replace(/ \(peche-poissons.com, 2022\)/, "").replace(/ : non proposée, par prudence/, "")}.
          </Alert>
        )}
      </div>
    </div>
  );
}

// ── 2. Carte ────────────────────────────────────────────────────
export function BordCarte({ go, params }) {
  const [filter, setFilter] = useState("tous");
  const [sel, setSel] = useState(params?.spot || TOP.id);
  const pts = SPOTS.filter((s) => filter === "tous" || (filter === "favorables" ? s.status !== "nr" && (s.fav ?? 0) >= 65 : s.status === "nr"))
    .map((s) => ({ id: s.id, name: s.name, lat: s.lat, lon: s.lon, value: s.fav, status: s.status }));
  const s = spotById(sel);
  const nFav = SPOTS.filter((x) => x.status !== "nr" && (x.fav ?? 0) >= 65).length, nNr = SPOTS.filter((x) => x.status === "nr").length;
  return (
    <div className="s-screen">
      <TopBar title="Carte interactive" actions={<IconButton icon="sliders-horizontal" label="Filtres" />}>
        <Icon name="map" size={24} style={{ color: "var(--accent-ink)" }} />
      </TopBar>
      <div className="s-pad" style={{ marginBottom: 10 }}>
        <Segmented variant="pills" label="Filtrer les spots" value={filter} onChange={setFilter}
          options={[{ id: "tous", label: `Tous ${SPOTS.length}` }, { id: "favorables", label: `Favorables ${nFav}` }, { id: "nr", label: `Non recom. ${nNr}` }]} />
      </div>
      <MapView carte={carte} points={pts} selected={sel} onSelect={setSel} height={430}>
        <div className="p-map__legend" aria-hidden="true">
          {[5, 4, 3, 2, 1].map((b) => <span key={b} className="s-pastille" data-band={b} style={{ "--size": "12px", boxShadow: "none" }} />)}
          <span>favorabilité</span>
        </div>
      </MapView>
      <div className="s-pad" style={{ marginTop: -86, position: "relative", zIndex: 5 }}>
        <Card as="button" flush onClick={() => go("bord-spot", { spot: s.id })}>
          <div className="p-spotcard p-spotcard--map">
            <Photo photo={spotPhoto(s)} size={720} className="p-spotcard__img" mark={false} />
            <div className="p-spotcard__body">
              <div className="s-row-between"><h2 className="s-h3">{s.name}</h2><Icon name="chevron-right" size={22} style={{ color: "var(--text-3)" }} /></div>
              {s.status === "nr"
                ? <div className="s-row" style={{ gap: 8, marginTop: 4 }}><Chip tone="nr" icon="ban">Non recommandé</Chip></div>
                : <div className="s-badge-score" style={{ fontSize: 30, color: "var(--accent-ink)" }}>{s.fav}<small>/100</small></div>}
              <div className="s-small" style={{ marginTop: 2 }}>{lieuLabel(s.type)} · {s.distMin} min · {s.status === "nr" ? "voir la raison" : `${s.best.start}–${s.best.end}`}</div>
            </div>
          </div>
        </Card>
      </div>
      <section className="s-pad" style={{ marginTop: 18, paddingBottom: 8 }} aria-label="Classement des spots affichés">
        <SectionTitle>Classement du jour</SectionTitle>
        <ul className="s-list">
          {SPOTS.filter((x) => pts.some((p) => p.id === x.id)).sort((a, b) => (a.status === "nr") - (b.status === "nr") || (b.fav ?? 0) - (a.fav ?? 0)).map((x) => (
            <li key={x.id}>
              <button type="button" className="s-li" aria-pressed={x.id === sel} onClick={() => { setSel(x.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                <Pastille value={x.fav} status={x.status} size={34} selected={x.id === sel} label="" />
                <span className="s-grow" style={{ minWidth: 0 }}>
                  <span style={{ display: "block", color: "var(--text-1)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16.5 }}>{x.name}</span>
                  <span className="s-small">{x.status === "nr" ? "Non recommandé · " + nrShort(x) : `${lieuLabel(x.type)} · ${x.distMin} min · ${x.best?.start}–${x.best?.end}`}</span>
                </span>
                <Icon name="chevron-right" className="s-li__chev" size={20} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// Raison courte d'un spot écarté, pour une ligne de liste (la raison complète, sourcée, reste sur la fiche).
const nrShort = (x) => {
  const m = /Coef (\d+)/.exec(x.nrReason || "");
  return m ? `accès incertain au coefficient ${m[1]}` : "voir la fiche";
};

// ── 3. Fiche du spot (trois niveaux) ────────────────────────────
export function BordSpot({ go, params }) {
  const s = spotById(params?.spot);
  const [level, setLevel] = useState(params?.level || "rapide");
  const [open, setOpen] = useState(null);
  const ph = spotPhoto(s);
  const why = reasonsOf(s, 3), watch = watchOf(s);
  return (
    <div className="s-screen">
      <Photo photo={ph} fade className="p-spothero" eager markPos="tl" markStyle={{ top: 66, left: 16 }}>
        <TopBar variant="over" title={s.name} onBack={() => go("bord-carte", { spot: s.id })} actions={<IconButton icon="heart" label="Ajouter aux favoris" variant="on-photo" />} />
        {s.status !== "nr" && <div className="p-spothero__badge"><Icon name="star" size={22} style={{ color: "var(--good)", fill: "var(--good)" }} /><span className="s-badge-score" style={{ fontSize: 28 }}>{s.fav}<small>/100</small></span></div>}
      </Photo>
      <div className="s-pad s-stack" style={{ marginTop: -46, position: "relative", zIndex: 3 }}>
        {s.status === "nr" ? (
          <Alert tone="nr" title="Non recommandé aujourd'hui">{s.nrReason}</Alert>
        ) : (
          <ScoreTriplet fav={s.fav} pert={s.pert?.score} conf={s.conf?.score} open={open} onOpen={(k) => { setOpen(k); if (k) setLevel("expert"); }} />
        )}
        <Segmented label="Niveau de détail" value={level} onChange={setLevel} options={[{ id: "rapide", label: "Vue rapide" }, { id: "details", label: "Détails" }, { id: "expert", label: "Expert" }]} />

        {level === "rapide" && s.status !== "nr" && <>
          <h2 className="s-h2">Pourquoi ce spot ?</h2>
          <Reasons items={why} />
          {watch.length > 0 && <Alert tone="warn" title="À surveiller">{watch[0].t}{watch[1] && <><br /><span style={{ color: "var(--text-2)" }}>{watch[1].t}</span></>}</Alert>}
          <div className="s-row-between">
            <h2 className="s-h3" style={{ fontSize: 20 }}>Meilleure fenêtre</h2>
            <span className="s-row" style={{ gap: 8, fontFamily: "var(--font-display)", fontSize: 19, color: "var(--text-1)" }}><Icon name="clock" size={20} style={{ color: "var(--accent-ink)" }} />{s.best.start} – {s.best.end}</span>
          </div>
          <Button block onClick={() => go("bord-strategie", { spot: s.id })}>Voir la stratégie</Button>
        </>}

        {level === "details" && <>
          <SectionTitle>Créneaux du jour</SectionTitle>
          <WindowStrip windows={s.windows} sun={bord.sun} best={s.best} />
          <SectionTitle>Marée à {bord.tide.port} · coef {bord.tide.coefs.join(" / ")}</SectionTitle>
          <Card tight><TideCurve tide={bord.tide} now={s.best ? +s.best.start.slice(0, 2) + 1 : 12} /></Card>
          <SectionTitle>Vent heure par heure</SectionTitle>
          <Card tight><HourlyBars hours={s.hourly} mark={s.best ? [+s.best.start.slice(0, 2), +s.best.end.slice(0, 2) + 1] : null} />
            <p className="s-small">Barre pleine : vent moyen ; barre claire : rafales (km/h). En bleu : la meilleure fenêtre.</p></Card>
          {s.access.length > 0 && <><SectionTitle>Accès</SectionTitle><Card tight><p className="s-body">{s.access[0]}</p></Card></>}
          {s.securite.length > 0 && <><SectionTitle>Sécurité du spot</SectionTitle><Reasons items={s.securite.map((t) => ({ t, icon: "shield-check", tone: "muted" }))} /></>}
        </>}

        {level === "expert" && s.status !== "nr" && <>
          <Card tight>
            <div className="s-label">Favorabilité · {favWord(s.fav)}</div>
            <p className="s-body" style={{ marginTop: 6 }}>{s.favLine}</p>
            <div className="p-crit">
              {s.crit.map((c) => (
                <div key={c.k} className="p-crit__row">
                  <span>{c.label}<small>{c.why} · preuve niveau {c.niveau}</small></span>
                  <span className="p-crit__val">{fr(c.pts, c.pts % 1 ? 1 : 0)}/{c.max}</span>
                  <FactorBar value={c.pts} max={c.max} label={c.label} />
                </div>
              ))}
            </div>
            {s.presence && <p className="s-small" style={{ marginTop: 8 }}>Présence × {fr(s.presence.factor, 2)} : {s.presence.label}.</p>}
          </Card>
          {s.pert && <Card tight><div className="s-label">Pertinence · {s.pert.score}/100</div>
            <div className="p-crit">{s.pert.parts.map((p) => <div key={p.label} className="p-crit__row"><span>{p.label}<small>{p.why}</small></span><span className="p-crit__val">{fr(p.pts, p.pts % 1 ? 1 : 0)}/{p.max}</span><FactorBar value={p.pts} max={p.max} /></div>)}</div></Card>}
          {s.conf && <Card tight><div className="s-label">Confiance · {s.conf.score}/100 · {s.conf.label}</div>
            <div className="p-crit">{s.conf.parts.map((p) => <div key={p.label} className="p-crit__row"><span>{p.label}<small>{p.why}</small></span><span className="p-crit__val">{fr(p.pts, p.pts % 1 ? 1 : 0)}/{p.max}</span><FactorBar value={p.pts} max={p.max} /></div>)}</div></Card>}
          {s.id === TOP.id && bord.meta.ens && <p className="s-small">Stabilité : sur {bord.meta.ens.members} météos plausibles, favorabilité de {bord.meta.ens.lo} à {bord.meta.ens.hi} ; ce spot reste premier dans {bord.meta.ens.firstShare} % des cas.</p>}
        </>}
      </div>
    </div>
  );
}

// ── 4. Comparaison ──────────────────────────────────────────────
export function BordCompare({ go }) {
  const top3 = ELIG.slice(0, 3);
  const best = top3[0], closest = [...top3].sort((a, b) => (a.distMin ?? 99) - (b.distMin ?? 99))[0];
  return (
    <div className="s-screen">
      <TopBar title="Comparaison de spots" onBack={() => go("bord-decision")} actions={<IconButton icon="sliders-horizontal" label="Choisir les spots" />} />
      <div className="s-pad s-stack">
        <div className="p-compare">
          {top3.map((s, i) => (
            <button key={s.id} type="button" className="p-compare__col" onClick={() => go("bord-spot", { spot: s.id })} aria-label={`${s.name}, ${s.fav} sur 100`}>
              <Photo photo={spotPhoto(s)} size={720} className="p-compare__img" mark={i === 0} markPos="tl" />
              <div className="p-compare__body">
                <div className="s-h3 p-compare__name">{s.name.replace(/^Pointe (de |du |des |de l')?/, "")}</div>
                <div className="s-row" style={{ gap: 6 }}><span className="s-badge-score" style={{ fontSize: 26, color: ["var(--good)", "var(--accent-ink)", "var(--warn-ink)"][i] }}>{s.fav}<small>/100</small></span></div>
                <div className="p-compare__bars">
                  {factorsOf(s).map((f) => (
                    <div key={f.k} className="p-compare__bar">
                      {i === 0 && <span className="p-compare__k"><Icon name={f.icon} size={16} />{f.k}</span>}
                      <FactorBar value={f.v ?? 0} max={1} label={`${s.name}, ${f.k}`} />
                    </div>
                  ))}
                </div>
                <div className="s-small" style={{ marginTop: 8 }}>{s.best.start}–{s.best.end}<br />{s.distMin} min</div>
              </div>
            </button>
          ))}
        </div>
        <Alert tone="gold" title="Notre conseil">
          {best.name} offre les meilleures conditions ({best.fav}) {momentOf(best.best.light)}.
          {closest.id !== best.id && <> {closest.name} est plus proche ({closest.distMin} min contre {best.distMin}).</>}
        </Alert>
        <Button block onClick={() => go("bord-spot", { spot: best.id })}>Voir le détail</Button>
        <p className="s-small">Barres : part obtenue de chaque famille de critères du moteur v2 (marée 45 points, lumière 25, vent et mer 30) et facteur de présence de la saison. Pas de barre « poissons » : aucune présence n'est mesurée spot par spot.</p>
      </div>
    </div>
  );
}

// ── 5. Ma stratégie ─────────────────────────────────────────────
export function BordStrategie({ go, params }) {
  const s = spotById(params?.spot);
  const L = s.lure;
  const [level, setLevel] = useState("rapide");
  const pickBox = bord.box.find((b) => L?.pick?.name?.startsWith(b.name.split(" ").slice(0, 2).join(" ")) && (!b.g || L.pick.weight?.startsWith(String(b.g).replace(".", ",")))) || null;
  return (
    <div className="s-screen">
      <TopBar title="Ma stratégie" onBack={() => go("bord-spot", { spot: s.id })} />
      <div className="s-pad s-stack">
        <p className="s-small" style={{ marginTop: -6 }}>{s.name} · {s.best.start}–{s.best.end} · {s.best.lightLabel?.toLowerCase()}</p>
        <Segmented label="Niveau de détail" value={level} onChange={setLevel} options={[{ id: "rapide", label: "Vue rapide" }, { id: "details", label: "Détails" }, { id: "expert", label: "Expert" }]} />
        <Card className="p-tech">
          <div className="s-row" style={{ gap: 8 }}><Icon name="zap" size={22} style={{ color: "var(--warn)" }} /><h2 className="s-h3" style={{ color: "var(--warn-ink)" }}>Technique recommandée</h2></div>
          <p className="s-body" style={{ color: "var(--text-1)", maxWidth: "58%", marginTop: 6 }}>{L.familyLabel} : {L.pick?.name}{L.pick?.color ? `, ${L.pick.named ? L.pick.color : "coloris contrasté"}` : ""}.</p>
          <div className="p-tech__lure"><LureArt cat={pickBox?.cat || "asturie"} color={L.pick?.named ? L.pick.color : "blanc"} width={176} /></div>
        </Card>
        {level === "rapide" && <>
          <h2 className="s-h3">Paramètres clés</h2>
          <Card tight>
            <dl className="p-params">
              <div><dt><Icon name="weight" size={18} />Poids</dt><dd>{L.weight}</dd></div>
              <div><dt><Icon name="ruler" size={18} />Taille</dt><dd>{L.size?.replace("Profil de ", "")}</dd></div>
              <div><dt><Icon name="sparkles" size={18} />Couleur</dt><dd>{L.color?.split(" :")[0]}</dd></div>
              <div><dt><Icon name="waves" size={18} />Animation</dt><dd>{L.anim[0]?.split(" :")[0].split(",")[0]}</dd></div>
            </dl>
          </Card>
          <Alert tone="gold" icon="lightbulb" title="Astuce Spumy">{L.colorWhy[0]}</Alert>
        </>}
        {level === "details" && <>
          <SectionTitle>Animation</SectionTitle>
          <Reasons items={L.anim.map((t) => ({ t, icon: "waves", tone: "muted" }))} />
          <SectionTitle>Plan B dans ta boîte</SectionTitle>
          <Card tight><ul className="s-list">{L.alts.map((a) => <li key={a.name}><div className="s-li" style={{ cursor: "default" }}><Icon name="leurre" size={22} style={{ color: "var(--accent-ink)" }} /><span className="s-grow"><span style={{ color: "var(--text-1)" }}>{a.name}</span><br /><span className="s-small">{a.weight}{a.color ? ` · ${a.color}` : ""}</span></span></div></li>)}</ul></Card>
        </>}
        {level === "expert" && <>
          <Card tight><div className="s-label">Couleur</div><Reasons items={L.colorWhy.map((t) => ({ t, icon: "info", tone: "muted" }))} /></Card>
          <Card tight><div className="s-label">Poids</div><Reasons items={L.weightWhy.map((t) => ({ t, icon: "info", tone: "muted" }))} /></Card>
          <p className="s-small">Conseil tiré de ta boîte (src/bord/engine/tackle.js) et des sources citées par le moteur de leurres (onglet Leurres de l'application).</p>
        </>}
      </div>
    </div>
  );
}

// ── 6. Matériel & leurres ───────────────────────────────────────
export function BordMateriel({ go }) {
  const [tab, setTab] = useState("boite");
  const picks = new Set(ELIG.slice(0, 5).map((s) => s.lure?.pick?.name).filter(Boolean));
  const named = bord.box.filter((b) => b.g);
  const conseil = (b) => [...picks].some((p) => p.startsWith(b.name.split(" ").slice(0, 2).join(" ")) && (!b.g || p));
  const list = tab === "boite" ? named : named.filter(conseil);
  return (
    <div className="s-screen">
      <TopBar title="Matériel & leurres"><Icon name="leurre" size={24} style={{ color: "var(--accent-ink)" }} /></TopBar>
      <div className="s-pad s-stack">
        <Segmented label="Matériel" value={tab} onChange={setTab} options={[{ id: "boite", label: "Ma boîte" }, { id: "conseil", label: "Conseillés aujourd'hui" }]} />
        <div className="p-lures">
          {list.map((b) => (
            <button key={b.id} type="button" className="p-lure" onClick={() => go("bord-strategie", { spot: TOP.id })}>
              <div className="p-lure__art"><LureArt cat={b.cat} color={b.colors[0] || ""} width={120} /></div>
              <div className="p-lure__name">{b.name.replace(/^(Xorus|Sakura|Fiiish|Megabass|DUO) /, "")}</div>
              <div className="s-small">{fr(b.g, b.g % 1 ? 1 : 0)} g{b.colors.length ? ` · ${b.colors.slice(0, 2).join(", ")}` : ""}</div>
              {conseil(b) && <Chip tone="accent" icon="target" style={{ marginTop: 6 }}>Conseillé</Chip>}
            </button>
          ))}
        </div>
        <SectionTitle>Mon matériel</SectionTitle>
        <Card tight>
          <ul className="s-list">
            <li><div className="s-li"><Icon name="mode-bord" size={24} style={{ color: "var(--accent-ink)" }} /><span className="s-grow"><span style={{ color: "var(--text-1)" }}>Canne du bord</span><br /><span className="s-small">{bord.canne.min} à {bord.canne.max} g</span></span><Icon name="chevron-right" className="s-li__chev" size={20} /></div></li>
            <li><div className="s-li"><Icon name="settings" size={24} style={{ color: "var(--accent-ink)" }} /><span className="s-grow"><span style={{ color: "var(--text-1)" }}>Moulinet Shimano Stradic 4000</span><br /><span className="s-small">tresse 8 brins</span></span><Icon name="chevron-right" className="s-li__chev" size={20} /></div></li>
          </ul>
        </Card>
        <p className="s-small">Pas d'étoiles : aucune note de leurre n'est mesurée. « Conseillé » = choisi par le moteur pour l'un des cinq meilleurs spots du jour. Dessins de leurres : illustrations, pas des photos de produit.</p>
      </div>
    </div>
  );
}

// ── 7. Journal ──────────────────────────────────────────────────
export function BordJournal({ go }) {
  const [tab, setTab] = useState("sorties");
  const J = [...bord.journal].sort((a, b) => b.date.localeCompare(a.date));
  const fish = J.reduce((a, j) => a + (j.fish || 0), 0);
  return (
    <div className="s-screen">
      <TopBar title="Journal de pêche" actions={<IconButton icon="plus" label="Noter une session" size={26} />}><Icon name="calendar" size={24} style={{ color: "var(--accent-ink)" }} /></TopBar>
      <div className="s-pad s-stack">
        <Segmented label="Journal" value={tab} onChange={setTab} options={[{ id: "sorties", label: "Mes sorties" }, { id: "stats", label: "Statistiques" }]} />
        {tab === "sorties" ? J.map((j) => (
          <Card key={j.id} as="button" tight onClick={() => go("bord-spot", { spot: j.spotId })}>
            <div className="p-jrow">
              <div className={`p-jrow__thumb p-jrow__thumb--${j.moment === "coucher" ? "dusk" : "day"}`} aria-hidden="true"><Icon name={j.moment === "coucher" ? "sunset" : "sun"} size={26} /></div>
              <div className="s-grow">
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}>{dateShort(j.date)}{j.moment === "coucher" ? " · coucher" : ""}</div>
                <div className="s-row" style={{ gap: 6, color: "var(--accent-ink)", fontSize: 15 }}><Icon name="map-pin" size={15} />{j.spotName}</div>
                <div className="s-small">{j.fish ? `${j.fish} bar${j.fish > 1 ? "s" : ""}` : "Bredouille"} · {j.lure}</div>
              </div>
              <span className={`p-jrow__mood ${j.fish ? "is-good" : ""}`}><Icon name={j.fish ? "smile" : "frown"} size={30} label={j.fish ? "Session positive" : "Bredouille"} /></span>
            </div>
          </Card>
        )).concat(<Button key="noter" variant="secondary" icon="plus" iconRight={null} block>Noter une session</Button>) : (
          <>
            <div className="s-stats">
              {[["Sessions", J.length], ["Bars", fish], ["Bars par session", fr(fish / J.length, 1)]].map(([k, v]) => <div key={k} className="s-stat"><div className="s-stat__k">{k}</div><div className="s-stat__v">{v}</div></div>)}
            </div>
            <Card tight><p className="s-body">Spot qui a le plus donné : <b style={{ color: "var(--text-1)" }}>Moulin Mer</b> (3 bars en 3 sessions ; les 3 bars pris au coucher du soleil).</p></Card>
            <Alert tone="info" title="Le journal compte dans la confiance">La part « ton journal » vaut jusqu'à 15 points : 1,5 point par session notée sur le spot, plafonnée à 10 sessions. Cette journée du prototype est calculée sans journal : 0/15 partout.</Alert>
          </>
        )}
        <p className="s-small">Tes vraies sessions, enregistrées dans la fiche du guide. Pas de photo : le journal n'en garde pas encore (ajout prévu, stockage sur le téléphone).</p>
      </div>
    </div>
  );
}

// ── 8. Mode terrain ─────────────────────────────────────────────
export function BordTerrain({ go }) {
  const s = TOP;
  const hr = s.hourly.find((x) => x.h === +s.best.start.slice(0, 2)) || s.hourly[0];
  const ph = photoFor({ ...ambianceOf(s, "hero"), spotNomme: false, cle: "terrain" });
  const tideNow = (() => { const t = +s.best.start.slice(0, 2) + 0.5; const ev = bord.tide.events; const prev = [...ev].reverse().find((e) => e.dec <= t); return prev?.type === "PM" ? "Baisse" : "Monte"; })();
  return (
    <div className="s-screen s-screen--nonav p-terrain">
      <Photo photo={ph} className="p-terrain__bg" scrim eager markPos="bl" />
      <div className="p-terrain__content s-pad">
        <div className="s-row-between" style={{ paddingTop: 12 }}>
          <Logo size={24} />
          <button type="button" className="s-chip s-chip--good" onClick={() => go("bord-decision")} aria-label="Quitter le mode terrain"><Icon name="radio" size={16} />Mode terrain</button>
        </div>
        <div className="p-terrain__ring">
          <ScoreRing value={s.fav} kind="good" size={210} stroke={16} suffix fontScale={0.3} label="Favorabilité" />
          <span className="s-chip s-chip--good p-terrain__pill">{favWord(s.fav)}</span>
        </div>
        <Stats items={[
          { k: "Vent", icon: "wind", v: `${hr.wind} km/h`, s: `rafales ${hr.gust}` },
          { k: "Marée", icon: tideNow === "Montante" ? "maree-montante" : "maree-descendante", v: tideNow, s: `coef ${bord.tide.coefs[0]}` },
          { k: "Eau", icon: "thermometer", v: `${fr(bord.live.sst, 1)} °C`, s: "surface" },
        ]} />
        <Card tone="good" as="button" onClick={() => go("bord-spot", { spot: s.id })} style={{ marginTop: 12 }}>
          <div className="s-row" style={{ gap: 14 }}>
            <Icon name="map-pin" size={34} style={{ color: "var(--good)" }} />
            <div className="s-grow"><div className="s-h3" style={{ fontSize: 20 }}>{s.name}</div><div className="s-small" style={{ color: "var(--text-2)" }}>{s.best.start}–{s.best.end} · {s.distMin} min de route</div></div>
            <Icon name="navigation" size={30} style={{ color: "var(--accent)" }} />
          </div>
        </Card>
        <button type="button" className="s-btn s-btn--secondary s-btn--block" style={{ marginTop: 12 }} onClick={() => go("bord-carte", { spot: s.id })}>Voir sur la carte</button>
        <p className="p-terrain__note">Distance à pied : demande ta position (refusée par défaut, vie privée).</p>
      </div>
    </div>
  );
}

// ── 9. Plus ─────────────────────────────────────────────────────
export function BordPlus({ go, theme, setTheme }) {
  const rows = [
    ["maree-montante", "Marée", `${bord.tide.port} · PM ${bord.tide.events.filter((e) => e.type === "PM").map((e) => e.time).join(", ")}`],
    ["cloud-sun", "Météo", `${bord.live.windDir} force ${bord.live.windForce} · ${bord.live.models.join(", ")}`],
    ["leaf", "Saison", `Eau ${fr(bord.live.sst, 1)} °C · présence côtière`],
    ["scale", "Règles", "Bar : 3 par jour au nord du 48e · 42 cm"],
    ["camera", "Analyse photo", "Ton spot, vu par Claude"],
    ["download", "Sauvegarde", "Journal et spots sur ton dépôt GitHub"],
  ];
  return (
    <div className="s-screen">
      <TopBar title="Plus"><Icon name="ellipsis" size={24} style={{ color: "var(--accent-ink)" }} /></TopBar>
      <div className="s-pad s-stack">
        <Card tight><ul className="s-list">{rows.map(([ic, t, sub]) => (
          <li key={t}><button type="button" className="s-li"><span className="p-li-ic"><Icon name={ic} size={22} /></span><span className="s-grow"><span style={{ color: "var(--text-1)", fontSize: 16 }}>{t}</span><br /><span className="s-small">{sub}</span></span><Icon name="chevron-right" className="s-li__chev" size={20} /></button></li>
        ))}</ul></Card>
        <SectionTitle>Affichage</SectionTitle>
        <Segmented label="Thème" value={theme} onChange={setTheme} options={[{ id: "nuit", label: "Nuit marine" }, { id: "soleil", label: "Plein soleil" }]} />
        <SectionTitle>Mode et guide</SectionTitle>
        <Card tight><ul className="s-list">
          <li><button type="button" className="s-li" onClick={() => go("bateau-sortir")}><span className="p-li-ic"><Icon name="mode-bateau" size={24} /></span><span className="s-grow"><span style={{ color: "var(--text-1)", fontSize: 16 }}>Passer en mode BATEAU</span><br /><span className="s-small">Sortir ? Où ? Quelle espèce ?</span></span><Icon name="chevron-right" className="s-li__chev" size={20} /></button></li>
          <li><button type="button" className="s-li" onClick={() => go("accueil")}><span className="p-li-ic"><Icon name="compass" size={22} /></span><span className="s-grow"><span style={{ color: "var(--text-1)", fontSize: 16 }}>Changer de guide</span><br /><span className="s-small">{bord.meta.guideName} · 7 guides</span></span><Icon name="chevron-right" className="s-li__chev" size={20} /></button></li>
        </ul></Card>
      </div>
    </div>
  );
}
