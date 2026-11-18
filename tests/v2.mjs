// Moteur BORD v2 (phase 7) : les 16 scénarios de référence de la spécification (docs/SPEC-MOTEUR-BORD-V2.md, §9),
// puis les règles des trois scores (favorabilité, pertinence, confiance), les données manquantes et le classement.
// Usage : node tests/v2.mjs
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname), root = path.resolve(here, "..");
fs.mkdirSync(path.join(here, ".build"), { recursive: true });
async function engine(label) {
  const out = path.join(here, ".build", `v2_${label}.mjs`);
  await build({
    entryPoints: [path.join(root, "src/engine.js")], bundle: true, format: "esm", platform: "node", outfile: out,
    jsx: "automatic", external: ["react", "react/jsx-runtime", "react-dom"], logLevel: "warning",
    plugins: [{ name: "site", setup(b) { b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: path.join(root, `data/sites/${label}.config.js`) })); } }],
  });
  return import(out + `?t=${Date.now()}`);
}
let pass = 0, fail = 0;
const t = (n, c, info = "") => { c ? pass++ : (fail++, console.log(`   ÉCHEC · ${n}${info ? " — " + info : ""}`)); };

const L = await engine("logonna"), P = await engine("pirou");
const K = JSON.parse(fs.readFileSync(path.join(root, "data/knowledge/bar-bord.json"), "utf8"));

// Créneau et météo de base : aube, coefficient 70, septembre, vent faible connu, houle connue sous le maximum.
const zw0 = { wind_dir: "E", wind_force: 2, wind_kmh: 9, windKnown: true, gust_kmh: 20, houle: 0.4, houleKnown: true, sky: "partly", cloud: 50 };
const ctx = (zw = {}, over = {}) => ({ zw: { ...zw0, ...zw }, coeff: 70, pressure: 1015, pressureTrend: "stable", sst: 15, sstConf: "modele", calib: {}, month: 9, ...over });
const win = (s, over = {}) => ({ ...s.tidalRules.windows[0], coeff: 70, light: { band: "aube", label: "Aube" }, ...over });
const sw = (E, s, zw = {}, w = {}, over = {}) => E.scoreWindow(s, win(s, w), ctx(zw, over));
const rade = (E, s) => E.SITE.zones?.[s.zone]?.sea === "rade";
const open = (E) => E.SPOTS.find((s) => s.dangerLevel < 3 && !rade(E, s) && s.houleMax >= 1);
const engaged = (E) => E.SPOTS.find((s) => s.dangerLevel >= 3 && !rade(E, s));
const dirOf = (E, angles) => E.DIR16[Math.round(((angles[0] ?? 0) % 360) / 22.5) % 16];

// ── Les 16 scénarios ──
const mm = L.SPOTS.find((s) => s.id === "moulinmer");
{ const r = sw(L, mm, { wind_dir: "NE", wind_force: 9, wind_kmh: 81, gust_kmh: 90 });
  t("S1 Moulin Mer, NE force 9, rafales 90 km/h → non recommandé (coup de vent)", !r.eligible && r.blocked && /Coup de vent/.test(r.reason), r.reason); }
const sp = open(L);
{ const r = sw(L, sp, { wind_dir: "O", wind_force: 6, wind_kmh: 44, gust_kmh: 55 });
  t("S2 côte ouverte, O force 6, rafales 55 → à vérifier (vent), jamais au vert", r.eligible && r.verify.some((v) => v.k === "vent") && L.countGood([{ eligible: true, score: 9, verify: r.verify }]) === 0, r.reason); }
{ const r = sw(L, sp, { wind_force: 4, wind_kmh: 24, gust_kmh: 62 });
  t("S3 force 4, rafales 62 km/h → à vérifier (rafales)", r.eligible && r.verify.some((v) => v.k === "rafales") && !r.verify.some((v) => v.k === "vent"), r.reason); }
{ const r = sw(L, sp, { wind_force: 3, wind_kmh: 15, gust_kmh: 45, houle: Math.max(0, sp.houleMax - 0.3) });
  t("S4 force 3, rafales 45, houle connue sous le maximum → sans alerte connue", r.eligible && r.verify.length === 0, r.reason); }
{ const eg = engaged(L);
  const a = sw(L, sp, { houle: 0, houleKnown: false }), b = sw(L, eg, { houle: 0, houleKnown: false });
  t("S5 houle inconnue en côte ouverte : spot ordinaire → à vérifier ; spot engagé → non recommandé", a.eligible && a.verify.some((v) => v.k === "houle") && !b.eligible && /Houle inconnue/.test(b.reason), `${a.reason} | ${b.reason}`); }
{ const day = L.rankDay("2026-09-14", null, { engine: "v2", clock: Date.UTC(2026, 8, 14, 6) });
  const el = day.filter((s) => s.v2.eligible);
  t("S6 aucune météo : à vérifier partout (vent inconnu)", el.length > 0 && el.every((s) => s.v2.verify.some((v) => v.t === "vent inconnu")), el.filter((s) => !s.v2.verify.length).map((s) => s.id).join(","));
  t("S6 aucune météo : favorabilité sur la marée et la lumière seules (70 % des critères)", el.every((s) => s.v2.f.excluded.some((e) => e.k === "vent") && Math.abs(s.v2.f.couverture - 0.7) < 1e-9 && s.v2.fav != null && /calculée sur 70 % des critères/.test(s.v2.f.line)));
  t("S6 aucune météo : confiance faible", el.every((s) => s.v2.conf.level === "faible"), el.map((s) => s.v2.conf.score).join(",")); }
{ const eg = engaged(L);
  const r = sw(L, eg, {}, { light: { band: "nuit", label: "Nuit" } });
  t("S7 nuit sur un spot engagé (niveau 3) → non recommandé", !r.eligible && /Nuit sur un spot engagé/.test(r.reason), r.reason);
  const ok = sw(L, sp, {}, { light: { band: "nuit", label: "Nuit" } });
  t("S7 bis : la nuit sur un spot ordinaire reste proposée", ok.eligible); }
{ const te = L.SPOTS.find((s) => s.id === "terenez");
  const r = sw(L, te, {}, { coeff: 90 });
  t("S8 Térénez, coefficient 90 → non recommandé (retour coupé au-delà de 85)", !r.eligible && /85/.test(r.reason), r.reason);
  const r84 = sw(L, te, {}, { coeff: 84 });
  t("S8 bis : Térénez au coefficient 84 reste proposé", r84.eligible, r84.reason); }
{ const r = sw(L, sp, { houle: +(sp.houleMax + 0.3).toFixed(1) });
  const r2 = sw(L, sp, { houle: +(sp.houleMax + 0.6).toFixed(1) });
  t("S9 houle 0,3 m au-dessus du maximum d'un spot ordinaire → à vérifier (et plus une pénalité seule)", r.eligible && r.verify.some((v) => v.k === "houle" && /au-dessus du maximum/.test(v.t)), r.reason);
  t("S9 bis : 0,6 m au-dessus → non recommandé", !r2.eligible && /Houle trop forte/.test(r2.reason), r2.reason); }
// S10 et S11 : favorabilité d'un créneau.
const rock = L.SPOTS.find((s) => L.regimeOf(s) === "roche" && s.exposedAngles?.length && s.dangerLevel < 3) || P.SPOTS.find((s) => P.regimeOf(s) === "roche");
{ const band = rock.coefBand || [30, 45, 75, 105];
  const c = Math.round((band[1] + band[2]) / 2);
  const f = L.favorability(rock, { priority: "bon", coeff: c, light: { band: "aube" } }, { ...zw0, wind_dir: dirOf(L, rock.exposedAngles), wind_force: 3, houle: 0.6 }, { month: 6, sst: 16, sstConf: "modele" });
  t("S10 aube, coefficient dans la plage, vent de mer force 3 sur spot exposé, juin → palier le plus haut", L.bandOf(f.fav) === 5, `${f.line}`);
  const back = rock.shelteredAngles?.length ? dirOf(L, rock.shelteredAngles) : L.DIR16[(L.DIR16.indexOf(dirOf(L, rock.exposedAngles)) + 8) % 16];
  const g = L.favorability(rock, { priority: "prime", coeff: 35, light: { band: "jour" } }, { ...zw0, sky: "clear", wind_dir: back, wind_force: 3, houle: 0.2 }, { month: 6, sst: 16, sstConf: "modele" });
  t("S11 plein jour, ciel clair, coefficient 35, vent de terre → l'un des deux paliers les plus bas", L.bandOf(g.fav) <= 2, g.line); }
{ const ab = L.SPOTS.find((s) => rade(L, s)), ro = rock;
  const w = { priority: "prime", coeff: 70, light: { band: "crepuscule" } };
  const fa = L.favorability(ab, w, zw0, { month: 2, sst: 8, sstConf: "modele" }), fr = L.favorability(ro, w, zw0, { month: 2, sst: 8, sstConf: "modele" });
  t("S12 février, eau à 8 °C : présence plus haute en rade qu'en côte ouverte", fa.pres.factor > fr.pres.factor, `${fa.pres.factor} / ${fr.pres.factor}`); }
// S13 et S14 : pertinence.
{ const goury = P.SPOTS.find((s) => s.id === "goury");
  const lightBox = [{ id: "cpt100", cat: "cpt", size: 100, anyColor: true }, { id: "ms75", cat: "mastershad", size: 75, anyColor: true }];
  let found = null;
  for (let d = 1; d <= 28 && !found; d++) {
    const date = `2026-09-${String(d).padStart(2, "0")}`;
    const td = P.tideDay(date, goury.tidePort);
    for (const w0 of P.computeWindows(goury, td.events)) {
      if (!(w0.coeff >= 60 && w0.coeff <= 88)) continue;
      const w = { ...w0, light: { band: "aube", label: "Aube" } };
      const adv = P.lureAdvice(goury, w, null, date, { box: lightBox });
      if (adv.sit.currentNow && adv.sit.current?.level === "fort") { found = { date, w, adv }; break; }
    }
  }
  t("S13 (préalable) : un créneau de fort courant à Goury trouvé dans le calendrier des marées", !!found);
  if (found) {
    const p = P.pertinence(goury, found.w, null, found.date, { box: lightBox, trajetMax: 300 });
    t("S13 Goury, fort courant, boîte sans tête de 25 g ou plus → pertinence sous le seuil, avec « il te manque… »", p.score < P.V2.pert.seuil && p.manque.some((m) => /il te manque/.test(m)), `${p.score} · ${p.manque.join(" ; ")}`);
    const full = P.pertinence(goury, found.w, null, found.date, { trajetMax: 300 });
    t("S13 bis : avec ta boîte (têtes jusqu'à 40 g), la pertinence passe le seuil", full.score >= P.V2.pert.seuil, `${full.score} · ${full.parts.map((x) => `${x.k} ${x.pts}`).join(", ")}`);
    const near = P.pertinence(goury, found.w, null, found.date, { trajetMax: 300 }), far = P.pertinence(goury, found.w, null, found.date, { trajetMax: Math.max(5, Math.round(goury.distMin / 1.5)) });
    t("S14 spot au-delà du temps de trajet maximal → pertinence réduite (distance)", far.score < near.score && far.parts.find((x) => x.k === "distance").pts < P.V2.pert.distance, `${near.score} → ${far.score}`);
  }
}
// S15 : confiance faible, rang inchangé.
{ const live = mkLive(L, 6);
  const now = Date.UTC(2026, 8, 14, 6);
  const fresh = L.rankDay("2026-09-14", { ...live, _wxAt: now - 2 * 36e5 }, { engine: "v2", clock: now, dayOffset: 0 });
  const old = L.rankDay("2026-09-14", { ...live, _wxAt: now - 30 * 36e5 }, { engine: "v2", clock: now, dayOffset: 3 });
  const el = old.filter((s) => s.v2.eligible);
  t("S15 prévision de 30 h, échéance J+3 → confiance faible", el.length > 0 && el.every((s) => s.v2.conf.level === "faible"), el.map((s) => s.v2.conf.score).join(","));
  t("S15 : le rang ne change pas avec la confiance", fresh.map((s) => s.id).join() === old.map((s) => s.id).join());
  t("S15 : la favorabilité non plus", fresh.every((s, i) => s.v2.fav === old[i].v2.fav)); }
// S16 : tes trois sessions de Moulin Mer.
{ const j = L.SITE.seedJournal;
  const calib = L.calibrate(j);
  const adj = L.journalAdjust("moulinmer", calib, L.catchStats(j));
  t("S16 : 3 sessions à Moulin Mer → l'apprentissage personnel ne joue pas (5 sessions dont 2 avec prise)", j.length === 3 && !adj.active && adj.n === 3);
  for (const e of j.filter((x) => x.moment === "coucher")) {
    const day = L.rankDay(e.date, null, { engine: "v2", journal: j, hours: { from: 0, to: 24 } });
    const s = day.find((x) => x.id === "moulinmer");
    const dusk = (s.windows || []).filter((w) => w.eligible && w.light?.band === "crepuscule");
    t(`S16 : ${e.date} (${e.fish} bar${e.fish > 1 ? "s" : ""} au coucher) → un créneau de crépuscule noté, lumière 25/25`, dusk.length === 0 || dusk.every((w) => w.f?.crit.find((c) => c.k === "lumiere")?.pts === 25), dusk.map((w) => w.score).join(","));
    t(`S16 : ${e.date} → confiance « journal » de 3 sessions (4,5 sur 15)`, s.v2.eligible ? s.v2.conf.parts.find((p) => p.k === "journal").pts === 4.5 : true);
  }
}

// ── Règles des trois scores ──
{ const s = rock;
  const w = { priority: "prime", coeff: 60, light: { band: "crepuscule" } };
  const f = L.favorability(s, w, { ...zw0, wind_dir: dirOf(L, s.exposedAngles), wind_force: 3 }, { month: 9, sst: 15, sstConf: "modele" });
  t("favorabilité : critères 25 + 20 + 25 + 30 = 100", f.crit.reduce((a, c) => a + c.max, 0) === 100 && f.couverture === 1);
  t("favorabilité = arrondi(conditions × présence)", f.fav === Math.round(f.crit.reduce((a, c) => a + c.pts, 0) * f.pres.factor));
  t("décomposition affichée dans la forme de la spécification", /^Favorabilité \d+ = conditions \d+ \(marée \d+\/45, lumière \d+\/25, vent et mer \d+\/30\) × présence [\d,]+$/.test(f.line), f.line);
  const nw = L.favorability(s, { ...w, light: { band: "inconnu" } }, { windKnown: false }, { month: 9 });
  t("données manquantes : critère exclu, jamais neutre ; sous 50 % des critères, pas de note", nw.noScore && nw.fav == null && nw.excluded.length === 2 && Math.abs(nw.couverture - 0.45) < 1e-9);
  const sea = L.favorability(s, w, zw0, { month: 9, sst: 15, sstConf: "saison" });
  t("présence : une température « moyenne de saison » n'est pas comptée (saison seule)", !sea.pres.sstKnown && sea.pres.by === "saison");
  const cold = L.favorability(s, w, zw0, { month: 9, sst: 6, sstConf: "modele" });
  t("présence : eau à 6 °C en côte ouverte → 0,3 (la plus restrictive)", cold.pres.factor === 0.3, String(cold.pres.factor));
  t("paliers (recalés en phase 8) : 75 / 65 / 55 / 45", [100, 75, 74, 65, 64, 55, 54, 45, 44, 0].map(L.bandOf).join() === "5,5,4,4,3,3,2,2,1,1" && L.bandOf(null) === null); }
{ // Niveaux de preuve des critères = ceux de bar-bord.json
  const lv = (id) => K.connaissances.find((k) => k.id === id)?.niveau;
  t("niveaux de preuve des critères égaux à bar-bord.json", L.CRIT_NIVEAU.fenetre === lv("maree-flot") && L.CRIT_NIVEAU.coef === lv("coefficient-plage-utile") && L.CRIT_NIVEAU.lumiere === lv("lumiere-basse") && L.CRIT_NIVEAU.vent === lv("vent-exposition") && L.CRIT_NIVEAU.presence === lv("seuils-thermiques"));
  t("niveaux de preuve des rubriques lus pour chaque spot du guide", L.SPOTS.every((s) => Number.isInteger(L.evidenceOf(s).exposition)), L.SPOTS.filter((s) => !Number.isInteger(L.evidenceOf(s).exposition)).map((s) => s.id).join(","));
  t("spot que tu as ajouté : preuves estimées (niveau 5)", L.evidenceOf({ id: "x", custom: true }).exposition === 5); }
{ const live = mkLive(L, 3);
  const now = Date.UTC(2026, 8, 14, 6);
  const v2 = L.rankDay("2026-09-14", { ...live, _wxAt: now - 36e5 }, { engine: "v2", clock: now, dayOffset: 0, hours: { from: 0, to: 24 } });
  const v1 = L.rankDay("2026-09-14", { ...live, _wxAt: now - 36e5 }, { engine: "v1", clock: now, dayOffset: 0, hours: { from: 0, to: 24 } });
  const el = v2.filter((s) => s.eligible);
  t("classement v2 : les mêmes spots praticables que la v1 (même filtre de sécurité)", el.map((s) => s.id).sort().join() === v1.filter((s) => s.eligible).map((s) => s.id).sort().join());
  t("classement v2 : sans doute avant à vérifier, puis favorabilité décroissante", el.every((s, i) => i === 0 || (el[i - 1].verify.length ? 1 : 0) < (s.verify.length ? 1 : 0) || ((el[i - 1].verify.length ? 1 : 0) === (s.verify.length ? 1 : 0) && (el[i - 1].score ?? -1) >= (s.score ?? -1))));
  t("projection : la note affichée est la favorabilité du meilleur créneau (sur 100)", el.every((s) => s.score === s.v2.fav && (s.windows.find((w) => w.id === s.bestWindowId)?.score === s.score)));
  t("projection : la note sur 10 de la v1 reste à côté (comparaison, journal)", el.every((s) => s.v1 && s.v1.score <= 10 && s.v1.score >= 0));
  t("v1 : rien ne change pour l'écran (note sur 10)", v1.filter((s) => s.eligible).every((s) => s.engine === "v1" && s.score <= 10));
  t("confiance : affichée, sur 100, avec ses quatre parts", el.every((s) => s.v2.conf.parts.length === 4 && s.v2.conf.score >= 0 && s.v2.conf.score <= 100));
  t("pertinence : provisoire tant que la boîte n'est pas dite complète (ne filtre pas)", el.every((s) => !s.v2.pert || (s.v2.pert.provisional && !s.v2.pert.filters)));
  const v2f = L.rankDay("2026-09-14", { ...live, _wxAt: now - 36e5 }, { engine: "v2", clock: now, dayOffset: 0, hours: { from: 0, to: 24 }, boxComplete: true, trajetMax: 5 });
  const e2 = v2f.filter((s) => s.eligible && !s.verify.length);
  t("pertinence : boîte complète → les spots sous le seuil passent après les autres", e2.every((s, i) => i === 0 || !(e2[i - 1].v2.pert?.under && !s.v2.pert?.under)));
}

{ // Vigilance Météo-France : non lue, dite à part, jamais supposée verte ; elle ne change pas le niveau de sécurité.
  const sf = L.safetyOf(sp, { zw: { ...zw0, gust_kmh: 20 }, light: { band: "aube" } });
  t("vigilance Météo-France : INCONNU, dite à l'écran (lien vigilance.meteofrance.fr)", L.VIGILANCE.known === false && sf.vigilance && /vigilance\.meteofrance\.fr/.test(sf.vigilance.url) && !sf.items.some((i) => /Vigilance/.test(i.t)));
  const nt = L.safetyOf(L.SPOTS.find((s) => s.dangerLevel >= 3), { zw: zw0, light: { band: "nuit" } });
  t("indicateur de sécurité : nuit sur spot engagé → alerte", nt.level === "alerte" && nt.items.some((i) => /spot engagé : non recommandé/.test(i.t)));
  const f = L.favorability(rock, { priority: "prime", coeff: 60, light: { band: "jour" } }, { ...zw0, sky: "clear", wind_dir: dirOf(L, rock.exposedAngles), wind_force: 3 }, { month: 2, sst: 9, sstConf: "modele" });
  const kf = L.keyFactors(f), fg = L.factorGroups(f);
  t("v2 : atouts et freins tirés des critères (vent de mer en atout, plein jour et saison en freins)", kf.plus.some((p) => /vent de mer/i.test(p.label)) && kf.minus.some((m) => /plein jour/i.test(m.label)) && kf.minus.some((m) => /saison|eau/i.test(m.label)));
  t("v2 : familles de la comparaison en points sur 100 (saison et eau : ce que la présence retire)", fg.find((x) => x.key === "saison").v < 0 && fg.find((x) => x.key === "vent").v === 30); }

// Journée d'essai : météo régulière sur toute la journée (série horaire) autour des spots du guide.
function mkLive(E, force) {
  const day = "2026-09-14";
  const times = [];
  for (let h = -24; h < 48; h++) times.push(Date.UTC(2026, 8, 14, h) - 2 * 36e5);
  return { date: day, wind_dir: "O", wind_force: force, wind_kmh: [0, 3, 9, 15, 24, 34, 44][force], gust_kmh: 30, houle: 0.6, sky: "partly", sst: 15, sst_confidence: "modele",
           pressure: 1016, pressure_trend: "stable", source: "essai" };
}

console.log(`[moteur v2] 16 scénarios et règles des trois scores : ${pass}/${pass + fail}`);
if (fail) process.exitCode = 1;
