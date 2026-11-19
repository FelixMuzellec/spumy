// Prototype — écrans du mode BATEAU, d'après la spécification de la phase 9. Données d'exemple (voir data/bateau.js).
import { useState } from "react";
import { Alert, BottomNav, Button, Card, Chip, DemoMark, Icon, IconButton, Logo, Photo, Reasons, ScoreRing, ScoreTriplet, SectionTitle, Segmented, Stats, TopBar } from "../design/ds/ui.jsx";
import carte from "./data/carte-bateau.json";
import bord from "./data/bord.json";
import { ABRIS, BOAT, ESPECES, HOURS, SORTIE, SORTIES, ZONES, zoneSafety } from "./data/bateau.js";
import { PHOTO, photoFor } from "./photos.js";
import { MapView, SpeciesArt } from "./art.jsx";
import { dateShort, fr } from "./util.js";
import savoir from "../../data/knowledge/bateau.json";

export const NAV_BATEAU = [
  { id: "bateau-sortir", label: "Sortie", icon: "anchor" },
  { id: "bateau-zones", label: "Zones", icon: "map" },
  { id: "bateau-especes", label: "Espèces", icon: "fish" },
  { id: "bateau-sorties", label: "Sorties", icon: "book-open" },
  { id: "bateau-profil", label: "Bateau", icon: "mode-bateau" },
];
const navFor = (r) => ({ "bateau-securite": "bateau-sortir", "bateau-zone": "bateau-zones", "bateau-technique": "bateau-especes" }[r] || r);
export function BateauNav({ route, go }) { return <BottomNav items={NAV_BATEAU} current={navFor(route)} onSelect={(id) => go(id)} />; }

const ST = { ok: { tone: "good", label: "OK", icon: "circle-check" }, verify: { tone: "warn", label: "À vérifier", icon: "triangle-alert" }, nr: { tone: "nr", label: "Non recommandé", icon: "ban" } };
const zoneById = (id) => ZONES.find((z) => z.id === id) || ZONES[0];
const espById = (id) => ESPECES.find((e) => e.id === id) || ESPECES[0];

function Demo() { return <div className="p-demo"><Icon name="info" size={15} />Exemple : bateau, zones et sorties inventés · météo réelle du {dateShort(bord.meta.date)}</div>; }

// ── 1. Sortir ? ─────────────────────────────────────────────────
export function BateauSortir({ go }) {
  const v = SORTIE.verdict;
  const hero = photoFor({ usage: "hero", mode: "bateau", lumiere: "aube", ciel: "clair", mer: "calme", cle: "bateau" });
  const z = ZONES[0], zs = zoneSafety(z);
  const top = ESPECES.filter((e) => e.fav != null).sort((a, b) => b.fav - a.fav).slice(0, 3);
  const maxWind = Math.max(...HOURS.map((h) => h.wind)), maxGust = Math.max(...HOURS.map((h) => h.gust)), maxWave = Math.max(...HOURS.map((h) => h.wave));
  return (
    <div className="s-screen">
      <Photo photo={hero} fade eager className="p-hero p-hero--boat" markPos="br">
        <div className="s-pad p-hero__top"><Logo size={26} /><span className="s-chip s-chip--accent"><Icon name="mode-bateau" size={17} />Bateau</span></div>
        <div className="s-pad p-hero__body">
          <Demo />
          <h1 className="s-h1 p-hero__title">Sortie <span className="s-grad-text">possible</span>, à vérifier</h1>
          <p className="p-hero__sub">De {SORTIE.depart} à {SORTIE.retour} : vent et mer dans tes limites. {SORTIE.raisons.length} point{SORTIE.raisons.length > 1 ? "s" : ""} à vérifier avant de partir.</p>
          <Button onClick={() => go("bateau-securite")} iconRight="arrow-right">Voir la sécurité de la sortie</Button>
        </div>
      </Photo>
      <div className="s-pad s-stack" style={{ marginTop: -6 }}>
        <Card tone={v === "nr" ? "nr" : v === "verify" ? "warn" : "good"} tight>
          <div className="s-row" style={{ gap: 12, alignItems: "flex-start" }}>
            <Icon name={ST[v].icon} size={28} style={{ color: v === "verify" ? "var(--warn)" : v === "nr" ? "var(--text-1)" : "var(--good)", marginTop: 2 }} />
            <div className="s-grow">
              <div className="s-alert__title" style={{ color: v === "verify" ? "var(--warn-ink)" : undefined }}>{v === "verify" ? "À vérifier, jamais au vert sans tout savoir" : ST[v].label}</div>
              <ul className="p-bullets">{SORTIE.raisons.map((r) => <li key={r.id}><b>{r.t}</b> — {r.d.split(".")[0]}.</li>)}</ul>
            </div>
          </div>
        </Card>
        <Stats items={[
          { k: "Vent max", icon: "wind", v: `${maxWind} km/h`, s: `rafales ${maxGust}` },
          { k: "Mer max", icon: "houle", v: `${fr(maxWave, 1)} m`, s: "peu agitée" },
          { k: "Visibilité", icon: "cloud-fog", v: "Inconnue", s: "modèle sans visibilité" },
        ]} />
        <SectionTitle action={<button type="button" className="s-btn s-btn--ghost s-btn--sm" onClick={() => go("bateau-zones")}>Zones<Icon name="chevron-right" size={18} /></button>}>Où et quoi</SectionTitle>
        <Card as="button" onClick={() => go("bateau-zone", { zone: z.id })} tight>
          <div className="s-row-between"><div><div className="s-h3">{z.nom}</div><div className="s-small">{z.type} · {z.prof} m · {fr(zs.d, 1)} mille{zs.d >= 2 ? "s" : ""} d'un abri</div></div><Chip tone="demo">exemple</Chip></div>
          <div className="p-species-row">
            {top.map((e) => (
              <div key={e.id} className="p-species-mini">
                <ScoreRing value={e.fav} kind="fav" size={54} stroke={5.5} />
                <span>{e.nom}</span>
              </div>
            ))}
          </div>
        </Card>
        <Alert tone="info" icon="gilet" title="Avant de partir">Une aide à la flottabilité par personne · VHF canal 16 · 196 depuis la terre · donne ton itinéraire à un proche.</Alert>
      </div>
    </div>
  );
}

// ── 2. Sécurité de la sortie ────────────────────────────────────
export function BateauSecurite({ go }) {
  const cell = (st) => <span role="img" className={`p-cell p-cell--${st}`} aria-label={st === "ok" ? "dans les limites" : st === "nr" ? "non recommandé" : st === "inconnu" ? "inconnu" : "à vérifier"} />;
  return (
    <div className="s-screen">
      <TopBar title="Sécurité de la sortie" onBack={() => go("bateau-sortir")} />
      <div className="s-pad s-stack">
        <Demo />
        <p className="s-small">Toute la sortie est jugée, du départ au retour, au pire moment. Un seul « non recommandé » empêche la sortie ; un seul « à vérifier » interdit le vert.</p>
        <Card tight>
          <div className="p-hgrid" role="table" aria-label="Conditions heure par heure" tabIndex={0}>
            <div role="row" className="p-hgrid__row p-hgrid__head"><span role="columnheader">Heure</span>{HOURS.map((h) => <span role="columnheader" key={h.h} className={h.h >= SORTIE.creneau[0] && h.h < SORTIE.creneau[1] ? "is-on" : ""}>{h.h}h</span>)}</div>
            <div role="row" className="p-hgrid__row"><span role="rowheader">Vent</span>{HOURS.map((h) => <span role="cell" key={h.h}>{h.wind}</span>)}</div>
            <div role="row" className="p-hgrid__row"><span role="rowheader">Rafales</span>{HOURS.map((h) => <span role="cell" key={h.h}>{h.gust}</span>)}</div>
            <div role="row" className="p-hgrid__row"><span role="rowheader">Vent</span>{HOURS.map((h) => <span role="cell" key={h.h}>{cell(h.vent)}</span>)}</div>
            <div role="row" className="p-hgrid__row"><span role="rowheader">Mer (m)</span>{HOURS.map((h) => <span role="cell" key={h.h}>{fr(h.wave, 1)}</span>)}</div>
            <div role="row" className="p-hgrid__row"><span role="rowheader">Visibilité</span>{HOURS.map((h) => <span role="cell" key={h.h}>{cell("inconnu")}</span>)}</div>
          </div>
          <p className="s-small" style={{ marginTop: 8 }}>km/h · cellule de la Pointe de Pen-Hir (AROME), créneau en surbrillance.</p>
        </Card>
        <SectionTitle>Règles de sécurité en mer</SectionTitle>
        <Card tight>
          <ul className="s-list">
            {SORTIE.regles.map((r) => (
              <li key={r.id}><div className="s-li" style={{ alignItems: "flex-start", cursor: "default" }}>
                <Icon name={ST[r.st].icon} size={22} style={{ color: r.st === "ok" ? "var(--good)" : r.st === "verify" ? "var(--warn)" : "var(--text-1)", marginTop: 2 }} />
                <span className="s-grow"><span style={{ color: "var(--text-1)", fontSize: 16, fontWeight: 500 }}>{r.t}</span> <span className="s-small" style={{ fontFamily: "var(--font-display)" }}>{r.id}</span><br /><span className="s-small" style={{ color: "var(--text-2)" }}>{r.d}</span></span>
              </div></li>
            ))}
          </ul>
        </Card>
        <Alert tone="info" icon="radio" title="Toujours affiché">Gilet par personne · VHF canal 16 (CROSS) · 196 depuis la terre · itinéraire donné à un proche.</Alert>
      </div>
    </div>
  );
}

// ── 3. Carte des zones ──────────────────────────────────────────
export function BateauZones({ go, params }) {
  const [sel, setSel] = useState(params?.zone || ZONES[0].id);
  const [W, S, E, N] = carte.bbox, [, , VW, VH] = carte.viewBox;
  const P = (lat, lon) => [((lon - W) / (E - W)) * VW, ((N - lat) / (N - S)) * VH];
  const unitPerMille = (VW / ((E - W) * 111.32 * carte.kx)) * 1.852;
  const rings = ABRIS.map((a) => { const [x, y] = P(a.lat, a.lon); return (
    <g key={a.nom}>
      <circle cx={x} cy={y} r={6 * unitPerMille} fill="rgba(31,210,245,.05)" stroke="var(--accent)" strokeOpacity=".55" strokeDasharray="6 6" strokeWidth="1.4" />
      <circle cx={x} cy={y} r={2 * unitPerMille} fill="none" stroke="var(--accent)" strokeOpacity=".35" strokeDasharray="3 5" strokeWidth="1.2" />
    </g>); });
  const pts = [...ZONES.map((z) => ({ id: z.id, name: z.nom, lat: z.lat, lon: z.lon, icon: zoneSafety(z).ok ? "target" : "ban" })),
               ...ABRIS.map((a, i) => ({ id: `abri${i}`, name: a.nom, short: a.nom.replace("Port du ", "").replace("Port de ", ""), lat: a.lat, lon: a.lon, icon: "anchor" }))];
  const z = zoneById(sel.startsWith("abri") ? ZONES[0].id : sel), zs = zoneSafety(z);
  return (
    <div className="s-screen">
      <TopBar title="Tes zones" actions={<IconButton icon="plus" label="Ajouter une zone" size={24} />}><Icon name="map" size={24} style={{ color: "var(--accent-ink)" }} /></TopBar>
      <MapView carte={carte} points={pts} selected={sel} onSelect={setSel} height={440} rings={rings} labels>
        <div className="p-map__legend"><span className="p-dash" />6 milles · <span className="p-dash p-dash--s" />2 milles d'un abri</div>
      </MapView>
      <div className="s-pad" style={{ marginTop: -78, position: "relative", zIndex: 5 }}>
        <Card as="button" onClick={() => go("bateau-zone", { zone: z.id })} tone={zs.ok ? undefined : "nr"}>
          <div className="s-row-between"><div className="s-h3">{z.nom}</div><Chip tone="demo">exemple</Chip></div>
          <div className="s-small" style={{ marginTop: 2 }}>{z.type} · {z.prof} m · {fr(zs.d, 1)} milles de l'abri le plus proche</div>
          {!zs.ok && <div className="s-row" style={{ gap: 8, marginTop: 8 }}><Chip tone="nr" icon="ban">Non recommandé</Chip><span className="s-small">au-delà de 6 milles (armement côtier)</span></div>}
        </Card>
      </div>
      <section className="s-pad" style={{ marginTop: 18, paddingBottom: 8 }} aria-label="Tes zones enregistrées">
        <SectionTitle action={<Chip tone="demo">exemples</Chip>}>Zones enregistrées</SectionTitle>
        <ul className="s-list">
          {ZONES.map((x) => { const xs = zoneSafety(x); return (
            <li key={x.id}>
              <button type="button" className="s-li" aria-pressed={x.id === sel} onClick={() => { setSel(x.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                <span className={`p-map__mark ${x.id === sel ? "is-sel" : ""}`} style={xs.ok ? undefined : { borderColor: "var(--nr)", color: "var(--nr)" }}><Icon name={xs.ok ? "target" : "ban"} size={18} /></span>
                <span className="s-grow" style={{ minWidth: 0 }}>
                  <span style={{ display: "block", color: "var(--text-1)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16.5 }}>{x.nom}</span>
                  <span className="s-small">{x.type} · {x.prof} m · {fr(xs.d, 1)} milles{xs.ok ? "" : " · hors limite"}</span>
                </span>
                <Icon name="chevron-right" className="s-li__chev" size={20} />
              </button>
            </li>); })}
        </ul>
      </section>
    </div>
  );
}

// ── 4. Une zone : les espèces ouvertes, classées ────────────────
export function BateauZone({ go, params }) {
  const z = zoneById(params?.zone), zs = zoneSafety(z);
  const list = ESPECES.filter((e) => e.statut !== "decision");
  const [open, setOpen] = useState(null);
  const top = list[0];
  return (
    <div className="s-screen">
      <Photo photo={photoFor({ usage: "hero", mode: "bateau", lumiere: "jour", ciel: "nuageux", mer: "calme", spotNomme: true, cle: z.id })} fade className="p-spothero" eager markPos="tl" markStyle={{ top: 66, left: 16 }}>
        <TopBar variant="over" title={z.nom} onBack={() => go("bateau-zones", { zone: z.id })} actions={<IconButton icon="heart" label="Favori" variant="on-photo" />} />
      </Photo>
      <div className="s-pad s-stack" style={{ marginTop: -40, position: "relative", zIndex: 3 }}>
        <Demo />
        {!zs.ok && <Alert tone="nr" title="Zone non recommandée">À {fr(zs.d, 1)} milles de l'abri le plus proche : au-delà de la limite de ton armement {BOAT.armement} ({zs.lim} milles, division 240).</Alert>}
        <div className="s-row-between"><h2 className="s-h2">Espèces du jour</h2><span className="s-small">{z.type} · {z.prof} m</span></div>
        <ScoreTriplet fav={top.fav} pert={top.pert} conf={top.conf} open={open} onOpen={setOpen} />
        <p className="s-small" style={{ marginTop: -4 }}>Scores de l'espèce en tête : {top.nom}.</p>
        {list.map((e) => (
          <Card key={e.id} as="button" tight onClick={() => go("bateau-technique", { esp: e.id, zone: z.id })}>
            <div className="s-row" style={{ gap: 12 }}>
              <ScoreRing value={e.fav} kind="fav" size={52} stroke={5.5} />
              <div className="s-grow">
                <div className="s-row" style={{ gap: 8 }}><span className="s-h3" style={{ fontSize: 17 }}>{e.nom}</span>{e.statut === "inconnu" && <Chip tone="warn">règle inconnue</Chip>}</div>
                <div className="s-small">{e.reg}</div>
              </div>
              <Icon name="chevron-right" size={20} style={{ color: "var(--text-3)" }} />
            </div>
          </Card>
        ))}
        <Alert tone="info" title="Lieu noir non proposé">Rare à la limite sud de son aire : proposé seulement si tes sorties en ont déjà pris (à décider).</Alert>
      </div>
    </div>
  );
}

// ── 5. Espèces ──────────────────────────────────────────────────
export function BateauEspeces({ go }) {
  return (
    <div className="s-screen">
      <TopBar title="Espèces"><Icon name="fish" size={24} style={{ color: "var(--accent-ink)" }} /></TopBar>
      <div className="s-pad s-stack">
        <p className="s-small">Réglementation 2026 réelle (DDTM du Finistère, service-public.fr). Présence et techniques sourcées : les références sont dans chaque fiche (niveau Expert).</p>
        <div className="p-species">
          {ESPECES.map((e) => (
            <button key={e.id} type="button" className="p-species__card" onClick={() => go("bateau-technique", { esp: e.id })}>
              {e.photo ? <Photo photo={PHOTO[e.photo]} size={720} className="p-species__img" markPos="tl" /> : <div className="p-species__img p-species__art"><SpeciesArt id={e.art} size={130} /></div>}
              <div className="p-species__body">
                <div className="s-h3" style={{ fontSize: 17 }}>{e.nom}</div>
                <div className="s-small" style={{ fontStyle: "italic" }}>{e.latin}</div>
                <div style={{ marginTop: 6 }}>
                  {e.statut === "ouvert" && <Chip tone="good-soft" icon="circle-check">Ouvert</Chip>}
                  {e.statut === "inconnu" && <Chip tone="warn" icon="circle-help">Règle inconnue</Chip>}
                  {e.statut === "decision" && <Chip tone="nr" icon="circle-slash">À décider</Chip>}
                </div>
              </div>
            </button>
          ))}
        </div>
        <Alert tone="warn" title="Lieu jaune : fermé du 1er janvier au 30 avril">Même relâché. L'espèce n'est alors pas proposée, et la raison est dite.</Alert>
      </div>
    </div>
  );
}

// ── 6. Technique (espèce × zone × ton matériel) ─────────────────
export function BateauTechnique({ go, params }) {
  const e = espById(params?.esp), z = zoneById(params?.zone);
  const [level, setLevel] = useState("rapide");
  return (
    <div className="s-screen">
      <TopBar title={e.nom} onBack={() => go(params?.zone ? "bateau-zone" : "bateau-especes", { zone: params?.zone })} />
      <div className="s-pad s-stack">
        {e.photo ? <Photo photo={PHOTO[e.photo]} className="p-techphoto" markPos="tr" /> : <Card className="p-techphoto p-species__art"><SpeciesArt id={e.art} size={200} /></Card>}
        <Segmented label="Niveau de détail" value={level} onChange={setLevel} options={[{ id: "rapide", label: "Vue rapide" }, { id: "details", label: "Détails" }, { id: "expert", label: "Expert" }]} />
        {level === "rapide" && <>
          <ScoreTriplet fav={e.fav} pert={e.pert} conf={e.conf} />
          <Card tight><div className="s-row" style={{ gap: 8 }}><Icon name="jig" size={22} style={{ color: "var(--warn)" }} /><h2 className="s-h3" style={{ color: "var(--warn-ink)" }}>Technique</h2></div><p className="s-body" style={{ color: "var(--text-1)", marginTop: 6 }}>{e.technique}</p></Card>
          <Card tight><dl className="p-params">
            <div><dt><Icon name="ruler" size={18} />Profondeur</dt><dd>{z.prof} m</dd></div>
            <div><dt><Icon name="weight" size={18} />Jig conseillé</dt><dd>{z.prof >= 40 ? "150 à 200 g" : z.prof >= 25 ? "100 à 150 g" : "40 à 80 g"}</dd></div>
            <div><dt><Icon name="mode-bateau" size={18} />Ta canne</dt><dd>Megaforce 170 · 90–210 g</dd></div>
            <div><dt><Icon name="scale" size={18} />Règle</dt><dd>{e.reg.split(" · ").slice(0, 2).join(" · ")}</dd></div>
          </dl></Card>
          <p className="s-small">Poids du jig : règle d'exemple (profondeur et dérive), hypothèse de la spécification à sourcer.</p>
        </>}
        {level === "details" && <>
          <SectionTitle>Pourquoi aujourd'hui</SectionTitle>
          {e.why.length ? <Reasons items={e.why.map((t) => ({ t }))} /> : <p className="s-small">Pas de raison chiffrée : trop de critères inconnus.</p>}
          {e.watch.length > 0 && <Alert tone="warn" title="À surveiller">{e.watch.join(" · ")}</Alert>}
          <Card tight><div className="s-label">Présence</div><p className="s-body">{e.presence}</p></Card>
        </>}
        {level === "expert" && <>
          <Card tight><div className="s-label">Réglementation 2026</div><p className="s-body">{e.reg}{e.regNote ? `. ${e.regNote}` : ""}</p></Card>
          <Card tight><div className="s-label">Critères (spécification BATEAU, §4)</div><p className="s-small">Poids des critères : hypothèses de départ, à éprouver comme ceux du BORD. Confiance faible tant que la saison en côte ou l'effet de la marée ne sont pas sourcés.</p></Card>
          <SectionTitle>Ce que le moteur sait</SectionTitle>
          {savoir.connaissances.filter((k) => k.espece === e.id).map((k) => (
            <Card key={k.id} tight>
              <div className="s-row-between" style={{ gap: 8 }}><span className="s-label">{k.domaine}</span><Chip tone={k.statut === "VÉRIFIÉ" ? "good-soft" : k.statut === "INCONNU" ? "nr" : "warn"}>{k.statut}</Chip></div>
              <p className="s-body" style={{ marginTop: 6 }}>{k.enonce}</p>
              {k.sources?.length > 0 && <ul className="p-sources">{k.sources.map((src) => <li key={src.ref}><a href={src.url} target="_blank" rel="noreferrer">{src.ref}</a></li>)}</ul>}
            </Card>
          ))}
        </>}
        <DemoMark>Scores d'exemple</DemoMark>
      </div>
    </div>
  );
}

// ── 7. Sorties (journal bateau) ─────────────────────────────────
export function BateauSorties() {
  const [tab, setTab] = useState("sorties");
  return (
    <div className="s-screen">
      <TopBar title="Sorties" actions={<IconButton icon="plus" label="Noter une sortie" size={26} />}><Icon name="calendar" size={24} style={{ color: "var(--accent-ink)" }} /></TopBar>
      <div className="s-pad s-stack">
        <Demo />
        <Segmented label="Sorties" value={tab} onChange={setTab} options={[{ id: "sorties", label: "Mes sorties" }, { id: "appris", label: "Ce que j'apprends" }]} />
        {tab === "sorties" ? SORTIES.map((s) => (
          <Card key={s.date} tight>
            <div className="p-jrow">
              <div className="p-jrow__thumb p-jrow__thumb--sea" aria-hidden="true"><Icon name="mode-bateau" size={28} /></div>
              <div className="s-grow">
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}>{dateShort(s.date)} · {s.h}</div>
                <div className="s-row" style={{ gap: 6, color: "var(--accent-ink)", fontSize: 15 }}><Icon name="target" size={15} />{s.zone}</div>
                <div className="s-small">{s.prises.map((p) => `${p.e} ${p.n}${p.g ? ` (${p.g} gardé${p.g > 1 ? "s" : ""})` : ""}`).join(" · ")} · {s.meteo}</div>
                {s.note && <div className="s-small" style={{ color: "var(--warn-ink)" }}>{s.note}</div>}
              </div>
            </div>
          </Card>
        )) : (
          <>
            <Card tight><div className="s-row" style={{ gap: 14 }}><ScoreRing value={38} kind="accent" size={64} stroke={6} /><div><div className="s-h3">3 sorties sur 8</div><p className="s-small">L'apprentissage personnel commence à 8 sorties avec conditions et au moins une prise de l'espèce : un ajustement de ±10 au plus, jamais sur la sécurité.</p></div></div></Card>
            <Alert tone="info" title="Une prise par mauvais temps n'apprend rien sur la sécurité">Le modèle de tes sorties ajuste la favorabilité, jamais les règles SEC_*.</Alert>
          </>
        )}
      </div>
    </div>
  );
}

// ── 8. Profil du bateau ─────────────────────────────────────────
export function BateauProfil({ go }) {
  const [seul, setSeul] = useState(BOAT.seul);
  const row = (ic, k, v, sub) => (
    <li><button type="button" className="s-li"><span className="p-li-ic"><Icon name={ic} size={22} /></span><span className="s-grow"><span style={{ color: "var(--text-1)", fontSize: 16 }}>{k}</span><br /><span className="s-small">{sub}</span></span><span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text-1)", fontSize: 17, whiteSpace: "nowrap" }}>{v}</span><Icon name="chevron-right" className="s-li__chev" size={20} /></button></li>
  );
  return (
    <div className="s-screen">
      <TopBar title="Ton bateau"><Icon name="mode-bateau" size={26} style={{ color: "var(--accent-ink)" }} /></TopBar>
      <div className="s-pad s-stack">
        <Demo />
        <p className="s-small">Sans profil, le moteur ne note pas : il ne suppose ni catégorie ni armement.</p>
        <Card tight><ul className="s-list">
          {row("shield-check", "Catégorie de conception", BOAT.categorie, "Plaque du constructeur · C : force 6 et 2 m au plus")}
          {row("life-buoy", "Armement embarqué", "Côtier", "Jusqu'à 6 milles d'un abri")}
          {row("anchor", "Port d'attache et abris", "2", ABRIS.map((a) => a.nom.replace("Port du ", "").replace("Port de ", "")).join(" · "))}
          {row("gauge", "Vitesse de route", `${BOAT.vitesse} nds`, "Temps de route et heure de retour")}
          {row("wind", "Tes limites", `F${BOAT.limites.vent} · ${fr(BOAT.limites.mer, 1)} m`, "Plus strictes que celles du bateau")}
        </ul></Card>
        <Card tight>
          <div className="s-row-between">
            <div><div className="s-h3" style={{ fontSize: 17 }}>Seul à bord</div><div className="s-small">Seuils serrés d'un cran (à décider)</div></div>
            <button type="button" role="switch" aria-checked={seul} className={`p-switch ${seul ? "is-on" : ""}`} onClick={() => setSeul(!seul)}><span className="s-sr">Seul à bord</span></button>
          </div>
        </Card>
        <SectionTitle>Matériel</SectionTitle>
        <Card tight><ul className="s-list">{BOAT.materiel.map((m) => <li key={m.t}><div className="s-li" style={{ cursor: "default" }}><span className="p-li-ic"><Icon name="jig" size={22} /></span><span className="s-grow"><span style={{ color: "var(--text-1)" }}>{m.t}</span><br /><span className="s-small">{m.s}</span></span></div></li>)}</ul></Card>
        <button type="button" className="s-btn s-btn--secondary s-btn--block" onClick={() => go("bord-decision")}><Icon name="mode-bord" size={22} />Passer en mode BORD</button>
      </div>
    </div>
  );
}
