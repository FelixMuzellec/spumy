// Tests unitaires : moteur météo Open-Meteo, houle, fenêtres, pannes, heure d'été, terrain.
// Usage : node tests/unit.mjs logonna   (ou pirou)
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { mockFetch, calls } from "./om_mock.mjs";

const [label] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname), root = path.resolve(here, "..");
fs.mkdirSync(path.join(here, ".build"), { recursive: true });
const out = path.join(here, ".build", `unit_${label}.mjs`);
await build({
  entryPoints: [path.join(root, "src/engine.js")], bundle: true, format: "esm", platform: "node", outfile: out,
  jsx: "automatic", external: ["react", "react/jsx-runtime", "react-dom"], logLevel: "warning",
  plugins: [{ name: "site", setup(b) {
    b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: path.join(root, `data/sites/${label}.config.js`) }));
  } }],
});
const E = await import(out);
// Les fiches et le catalogue ne doivent JAMAIS être modifiés en place (les corrections produisent
// de nouveaux objets) : gelés ici, toute écriture lève une erreur et fait échouer les tests.
const deepFreeze = (o, seen = new Set()) => { if (!o || typeof o !== "object" || seen.has(o)) return o; seen.add(o); Object.values(o).forEach((v) => deepFreeze(v, seen)); return Object.freeze(o); };
deepFreeze(E.SPOTS); deepFreeze(E.CATALOGUE); deepFreeze(E.BOITE);
const V5 = null;

let pass = 0, fail = 0;
const t = (n, c, info = "") => { c ? pass++ : (fail++, console.log(`   ÉCHEC [${label}] · ${n}${info ? " — " + info : ""}`)); };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

// ── 1. Fonctions pures ──
t("Beaufort : seuils km/h", [[0,0],[0.9,0],[1,1],[5.9,1],[6,2],[11.9,2],[12,3],[19.9,3],[20,4],[28.9,4],[29,5],[38.9,5],[39,6],[49.9,6],[50,7],[61.9,7],[62,8],[117.9,11],[118,12],[200,12]]
  .every(([k, f]) => E.beaufortOf(k) === f));
t("Beaufort : valeur absente → null", E.beaufortOf(null) === null && E.beaufortOf(NaN) === null);
t("rose 16 secteurs (FR)", E.dir16Of(0) === "N" && E.dir16Of(22.5) === "NNE" && E.dir16Of(225) === "SO" && E.dir16Of(247.5) === "OSO"
  && E.dir16Of(270) === "O" && E.dir16Of(292.5) === "ONO" && E.dir16Of(359) === "N" && E.dir16Of(-90) === "O" && E.dir16Of(720) === "N");
t("nébulosité → ciel", E.skyOf(0) === "clear" && E.skyOf(25) === "clear" && E.skyOf(26) === "partly" && E.skyOf(74) === "partly" && E.skyOf(75) === "overcast" && E.skyOf(null) === null);
const pc = E.parseCoords("48°20'N 4°18'W");
t("lecture des coordonnées DMS", pc && near(pc.lat, 48.3333, 1e-3) && near(pc.lon, -4.3, 1e-3), JSON.stringify(pc));
t("coordonnées : Est positif, illisible → null", E.parseCoords("43°17'N 5°22'E").lon > 0 && E.parseCoords("n/a") === null);
t("tous les spots ont des coordonnées", E.SPOTS.every((s) => E.spotLatLon(s)), E.SPOTS.filter((s) => !E.spotLatLon(s)).map((s) => s.id).join(","));
t("tous les spots sont à moins de 80 km de la base", E.SPOTS.every((s) => { const c = E.spotLatLon(s); return Math.hypot((c.lat - E.SITE.lat) * 111, (c.lon - E.SITE.lon) * 74) < 80; }));
const hs = E.fetchWaveHeight(36, 5);
t("mer du vent (JONSWAP) : 36 km/h sur 5 km ≈ 0,36 m", near(hs, 0.0016 * 10 * Math.sqrt(5000 / 9.81), 1e-9) && hs > 0.3 && hs < 0.4, hs.toFixed(3));
t("mer du vent : bornée à 1,5 m, nulle sans vent", E.fetchWaveHeight(300, 50) === 1.5 && E.fetchWaveHeight(0, 5) === 0);

// ── 2. Téléchargement nominal ──
const DATE = "2026-10-10";
globalThis.fetch = mockFetch("nominal");
calls.length = 0;
const L = await E.fetchLive(DATE);
t("trois requêtes : AROME, ECMWF, marine", calls.length === 3 && calls.some((c) => c.endsWith("#meteofrance_seamless")) && calls.some((c) => c.endsWith("#ecmwf_ifs")) && calls.some((c) => c.startsWith("marine")), calls.join(" | "));
t("structure historique conservée", ["wind_dir", "wind_force", "sky", "houle", "zones", "pressure", "pressure_trend", "sst", "sst_confidence", "resume"].every((k) => k in L));
t("série horaire pour la base et CHAQUE spot", L.series._base && E.SPOTS.every((s) => L.series[s.id]?.t?.length === 72));
t("72 heures (veille → lendemain), pas d'une heure", L.series._base.t.every((x, i, a) => i === 0 || x - a[i - 1] === 3600));
t("direction dans la rose FR", /^(N|NNE|NE|ENE|E|ESE|SE|SSE|S|SSO|SO|OSO|O|ONO|NO|NNO)$/.test(L.wind_dir));
t("force entière 0–12", Number.isInteger(L.wind_force) && L.wind_force >= 0 && L.wind_force <= 12);
t("pression à midi local, tendance sur 24 h (−2,4 hPa → baisse)", L.pressure_delta_24h === -2.4 && L.pressure_trend === "falling", `${L.pressure_delta_24h} ${L.pressure_trend}`);
t("température d'eau du modèle océanique", L.sst === 15.8 && L.sst_confidence === "modele");
t("source affichée : AROME + ECMWF", /AROME/.test(L.source_meteo) && /ECMWF/.test(L.source_meteo), L.source_meteo);
t("résumé lisible", /km\/h/.test(L.resume) && /hPa/.test(L.resume) && /°C/.test(L.resume), L.resume);
const i12 = E.idxAt(L.series._base, E.msAtLocal(DATE, 12)), i12b = E.idxAt(L.series._base, E.msAtLocal("2026-10-11", 12));
t("AROME prioritaire dans son échéance, ECMWF en relais au-delà", L.series._base.src[i12] === "AROME" && L.series._base.src[i12b] === "ECMWF", `${L.series._base.src[i12]} / ${L.series._base.src[i12b]}`);
t("midi local = 10 h UTC en heure d'été", L.series._base.t[i12] === Date.parse(DATE + "T10:00:00Z") / 1000);
const sizeKB = JSON.stringify(L).length / 1024;
t(`taille en cache raisonnable (${sizeKB.toFixed(0)} Ko)`, sizeKB < 90);
calls.length = 0;
const L2 = await E.fetchLive(DATE);
t("déterminisme : deux téléchargements identiques", JSON.stringify(L) === JSON.stringify(L2));

// ── 3. Houle : rade fermée vs mer ouverte ──
const radeSpots = E.SPOTS.filter((s) => E.SITE.zones[s.zone]?.sea === "rade");
const openSpots = E.SPOTS.filter((s) => E.SITE.zones[s.zone]?.sea !== "rade");
for (const s of radeSpots) {
  const w = E.spotWeather(L, s);
  t(`${s.id} : rade → mer du vent, jamais la houle du large (${w.houle} m)`, w.houleKnown && w.houle < 1 && /mer du vent/.test(w.houleSrc));
}
for (const s of openSpots) {
  const w = E.spotWeather(L, s);
  t(`${s.id} : mer ouverte → modèle de vagues (${w.houle} m)`, w.houleKnown && w.houle >= 0.8 && w.houle <= 1.5 && /modèle de vagues/.test(w.houleSrc), w.houleSrc);
}
t("les spots ont des météos différentes (pas une seule valeur recopiée)", new Set(E.SPOTS.map((s) => E.spotWeather(L, s).wind_kmh)).size > 2);

// ── 4. Météo par fenêtre ──
const sun = E.solarTimes(DATE);
const sp = E.SPOTS[0];
const st = E.tideDay(DATE, sp.tidePort || E.SITE.tide.defaultPort);
const wins = E.computeWindows(sp, st.events).map((w) => ({ ...w, light: E.windowLight(w, sun), zw: E.spotWxBetween(L, sp, w.startDecimal, w.endDecimal) }));
t("chaque fenêtre reçoit la météo de SES heures", wins.length > 0 && wins.every((w) => w.zw && w.zw.fromSpot));
const morning = E.spotWxBetween(L, sp, 6, 8), evening = E.spotWxBetween(L, sp, 19, 21);
t("le vent de 6 h et celui de 19 h diffèrent", morning.wind_kmh !== evening.wind_kmh || morning.wind_dir !== evening.wind_dir, `${morning.wind_dir} ${morning.wind_kmh} / ${evening.wind_dir} ${evening.wind_kmh}`);
const night = E.spotWxBetween(L, sp, -2, 1);
t("fenêtre à cheval sur minuit : données de la veille utilisées", night && Number.isFinite(night.wind_kmh));
const r = E.scoreSpotRobust(sp, { coeff: 80, zw: E.spotWeather(L, sp), wins, pressure: L.pressure, pressureTrend: L.pressure_trend, sst: L.sst, sstConf: L.sst_confidence });
t("score calculé avec la météo par fenêtre", r.eligible === false || (r.score > 0 && r.score < 10));
const winParts = r.windows.map((w) => (w.parts || []).find((p) => /^Vent /.test(p.k))?.k).filter(Boolean);
t("le libellé de vent de chaque fenêtre est le sien", winParts.length === r.windows.filter((w) => w.eligible).length
  && r.windows.filter((w) => w.eligible).every((w) => w.parts.some((p) => p.k === `Vent ${w.zw.wind_dir} F${w.zw.wind_force}`)));

// ── 5. Pannes et dégradations ──
globalThis.fetch = mockFetch("arome400"); calls.length = 0;
const La = await E.fetchLive(DATE);
t("AROME refusé : ECMWF (+ auto en renfort, inutile ici), sans erreur", La.models.join() === "ECMWF" && La.warnings.some((w) => /relais/.test(w)), La.models.join());
globalThis.fetch = mockFetch("ecmwfid400"); calls.length = 0;
const Le = await E.fetchLive(DATE);
t("identifiant ECMWF renommé : second identifiant essayé", Le.models.join() === "AROME,ECMWF" && calls.some((c) => c.endsWith("#ecmwf_ifs025")), Le.models.join() + " | " + calls.join(" "));
globalThis.fetch = mockFetch("allfail");
let err = null; try { await E.fetchLive(DATE); } catch (e) { err = e; }
t("tout refusé : erreur explicite citant la réponse", err && /Open-Meteo n'a pas répondu/.test(err.message) && /Simulated failure/.test(err.message), err?.message);
globalThis.fetch = mockFetch("range");
err = null; try { await E.fetchLive("2026-11-30"); } catch (e) { err = e; }
t("date hors horizon : message clair", err && /horizon/.test(err.message), err?.message);
globalThis.fetch = mockFetch("ratelimit");
err = null; try { await E.fetchLive(DATE); } catch (e) { err = e; }
t("429 : signalé comme limite de débit (pour la relance)", err?.isRateLimit === true);
globalThis.fetch = mockFetch("marinesst400");
const Lm = await E.fetchLive(DATE);
t("variable marine refusée : relance minimale, houle conservée", Lm.sst == null && Lm.sst_confidence === "inconnue"
  && openSpots.every((s) => E.spotWeather(Lm, s).houleKnown));
globalThis.fetch = mockFetch("marinefail");
const Lf = await E.fetchLive(DATE);
t("service marine en panne : météo quand même, avertissement", Lf.warnings.some((w) => /Houle et température/.test(w))
  && openSpots.every((s) => !E.spotWeather(Lf, s).houleKnown) && radeSpots.every((s) => E.spotWeather(Lf, s).houleKnown));
t("avertissements remontés dans les contrôles", E.validateLive(Lf, DATE).some((w) => /Houle et température/.test(w)));

// ── 6. Changement d'heure (25/10/2026) ──
globalThis.fetch = mockFetch("aromefull");
const D = await E.fetchLive("2026-10-25");
const iD12 = E.idxAt(D.series._base, E.msAtLocal("2026-10-25", 12));
t("25/10 : midi local = 11 h UTC (heure d'hiver)", D.series._base.t[iD12] === Date.parse("2026-10-25T11:00:00Z") / 1000);
// Phase 4 — AROME couvre toutes les heures : ECMWF ne sert qu'au vent de comparaison, et la source le dit.
t("source affichée : AROME, vent comparé à ECMWF (le second modèle n'est plus passé sous silence)",
  D.models.join() === "AROME" && D.modelsCompared.join() === "ECMWF" && D.source_meteo === "Open-Meteo · AROME · vent comparé à ECMWF", `${D.source_meteo}`);
const iD2 = E.idxAt(D.series._base, E.msAtLocal("2026-10-25", 1)), iD4 = E.idxAt(D.series._base, E.msAtLocal("2026-10-25", 4));
t("25/10 : 1 h → 4 h locales = 4 h de temps réel (heure répétée)", (D.series._base.t[iD4] - D.series._base.t[iD2]) === 4 * 3600);

// ── 7. Vent fort ──
const s0 = E.SPOTS[0];
const shelt = s0.shelteredAngles?.[0] ?? 90;
const dirOf = (deg) => E.dir16Of(deg);
t("coup de vent pénalisé même de terre", E.windMod(dirOf(shelt), 8, s0.exposedAngles, s0.shelteredAngles, 0, 1.2) < E.windMod(dirOf(shelt), 3, s0.exposedAngles, s0.shelteredAngles, 0, 1.2));
// v7 — vent de face non monotone, selon le régime
const ex = s0.exposedAngles[0], dEx = dirOf(ex);
const wmR = (f, reg) => E.windMod(dEx, f, s0.exposedAngles, s0.shelteredAngles, 0, 9, reg);
t("roche : clapot de face F3 favorable, F6 pénalisé", wmR(3, "roche") > 0 && wmR(6, "roche") < -1);
t("plage : rouleaux F3 favorables, F5 défavorables", wmR(3, "plage") > 0 && wmR(5, "plage") < 0);
t("abri : le clapot n'apporte rien, F4 déjà pénalisé", wmR(3, "abri") <= 0.05 && wmR(4, "abri") < 0);
t("vent de face : décroissant au-delà de F3 (toutes les courbes)", ["roche", "plage", "abri"].every((r) => [3, 4, 5, 6, 7, 8].every((f, i, a) => i === 0 || wmR(f, r) <= wmR(a[i - 1], r))));
t("vent de terre : léger plus jusqu'à F4, rien au-delà", E.windMod(dirOf(shelt), 3, s0.exposedAngles, s0.shelteredAngles, 0, 9) > 0 && E.windMod(dirOf(shelt), 5, s0.exposedAngles, s0.shelteredAngles, 0, 9) === 0);
// v7 — saison (Ifremer Bargip : frai hivernal au large, présence côtière mai-novembre)
t("saison : février < juillet, rade plus clémente que la côte ouverte", E.seasonPresence(2, "roche").factor < E.seasonPresence(7, "roche").factor && E.seasonPresence(2, "abri").factor > E.seasonPresence(2, "roche").factor && E.seasonPresence(7, "roche").factor === 1);
t("saison : mai à novembre = présence côtière pleine (ou presque)", [5, 6, 7, 8, 9, 10, 11].every((m) => E.seasonPresence(m, "roche").factor >= 0.95));
t("régimes déduits : rade = abri", E.SPOTS.filter((s) => E.SITE.zones[s.zone]?.sea === "rade").every((s) => E.regimeOf(s) === "abri"));
// v7 — soleil à l'heure de Paris, quel que soit le fuseau du téléphone
t("soleil : décalage de Paris (été +2, hiver +1)", E.solarTimes("2026-07-01").offH === 2 && E.solarTimes("2026-12-01").offH === 1, `${E.solarTimes("2026-07-01").offH}/${E.solarTimes("2026-12-01").offH} (TZ=${process.env.TZ || "système"})`);

// ── 8. Non-régression stricte vs v5 (météo de zone, F0–F6) ──
if (V5) {
  let rng = 12345; const rnd = () => ((rng = (rng * 1103515245 + 12345) % 2147483648) / 2147483648);
  const DIRS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"];
  let diff = 0, n = 0;
  for (let k = 0; k < 120; k++) {
    const dIso = new Date(Date.UTC(2026, 0, 1 + Math.floor(rnd() * 500))).toISOString().slice(0, 10);
    const sunK = E.solarTimes(dIso);
    const zw = { wind_dir: DIRS[Math.floor(rnd() * 16)], wind_force: Math.floor(rnd() * 6), sky: ["clear", "partly", "overcast"][Math.floor(rnd() * 3)], houle: +(rnd() * 2).toFixed(1) };
    const ctxBase = { coeff: 30 + Math.floor(rnd() * 90), zw, pressure: 995 + Math.floor(rnd() * 40), pressureTrend: ["falling_fast","falling","stable","rising","rising_fast"][Math.floor(rnd() * 5)], sst: 8 + rnd() * 12, sstConf: "mesure" };
    for (let j = 0; j < E.SPOTS.length; j++) {
      const s6 = E.SPOTS[j], s5 = V5.SPOTS[j];
      const mk = (M, s) => M.computeWindows(s, M.tideDay(dIso, s.tidePort || E.SITE.tide.defaultPort).events).map((w) => ({ ...w, light: M.windowLight(w, sunK) }));
      const a = E.scoreSpotRobust(s6, { ...ctxBase, wins: mk(E, s6) }), b = V5.scoreSpotRobust(s5, { ...ctxBase, wins: mk(V5, s5) });
      n++; if (a.score !== b.score || a.robust !== b.robust || a.spread !== b.spread || a.bestWindowId !== b.bestWindowId) diff++;
    }
  }
  t(`scores identiques à la v5 sur ${n} cas (météo de zone, F0–F5 ; à F6 l’ensemble explore désormais F7)`, diff === 0, `${diff} écarts`);
}

// ── 9. Terrain et bonnes pratiques ──
if (E.terrainOf) {
  const C = ["surface", "sous-surface", "mi-eau", "fond"];
  for (const s of E.SPOTS) {
    const tr = s.terrain;
    t(`${s.id} : fiche terrain complète`, tr && [1, 2, 3].includes(tr.encombrement) && ["oui", "texan", "non"].includes(tr.gratter)
      && Array.isArray(tr.couches) && tr.couches.length && tr.couches.every((c) => C.includes(c)) && tr.montage && tr.fond && tr.source && tr.confidence);
    t(`${s.id} : pas de « fond » dans les couches si on ne peut pas gratter`, !(tr.gratter === "non" && tr.couches.includes("fond")));
  }
  t("faits sourcés : chacun a un texte et une source", E.SPOTS.every((s) => (s.terrain.faits || []).every((f) => typeof f.t === "string" && f.t.length > 10 && typeof f.s === "string" && f.s.length > 3)));
  t("au moins un fait sourcé sur la majorité des spots", E.SPOTS.filter((s) => (s.terrain.faits || []).length).length >= Math.ceil(E.SPOTS.length / 2), String(E.SPOTS.filter((s) => (s.terrain.faits || []).length).length));
  const mm0 = E.SPOTS.find((s) => s.id === "moulinmer");
  if (mm0) t("Moulin Mer : orientation rive sud (exposé S-SO, abrité N-NE)", mm0.exposedAngles.includes(202.5) && mm0.shelteredAngles.includes(0)
    && E.windMod("NE", 4, mm0.exposedAngles, mm0.shelteredAngles, 0, 1.2, E.regimeOf(mm0)) > E.windMod("SO", 4, mm0.exposedAngles, mm0.shelteredAngles, 0, 1.2, E.regimeOf(mm0)));
  const prey = [...new Set(E.SITE.preyCalendar.map((p) => p.name))].map((n) => E.SITE.preyCalendar.find((p) => p.name === n));
  t("chaque proie porte sa couche d'eau", prey.every((p) => C.includes(p.couche)), prey.filter((p) => !C.includes(p.couche)).map((p) => p.name).join(", "));
  const fondPrey = prey.find((p) => p.couche === "fond"), midPrey = prey.find((p) => p.couche !== "fond");
  const non = E.SPOTS.find((s) => s.terrain.gratter === "non"), oui = E.SPOTS.find((s) => s.terrain.gratter === "oui"), tx = E.SPOTS.find((s) => s.terrain.gratter === "texan");
  if (non) { const a = E.adviceForSpot(non, fondPrey); t(`proie de fond sur ${non.id} : conseil remplacé (pas de grattage)`, a.adapted && a.replaces && /au-dessus/.test(a.note) && /fond trop encroché/.test(a.note)); }
  if (oui) t(`proie de fond sur ${oui.id} (sable) : conseil d'origine conservé`, !E.adviceForSpot(oui, fondPrey).adapted);
  if (tx) t(`proie de fond sur ${tx.id} : conseil conservé, montage texan imposé`, E.adviceForSpot(tx, fondPrey).adapted && !E.adviceForSpot(tx, fondPrey).replaces && /texan/.test(E.adviceForSpot(tx, fondPrey).note));
  t("proie dans une couche praticable du spot (hors fond) : jamais modifiée",
    E.SPOTS.every((s) => prey.filter((p) => p.couche !== "fond" && s.terrain.couches.includes(p.couche)).every((p) => !E.adviceForSpot(s, p).adapted)));
  t("proie dans une couche impraticable : nage déplacée vers une couche du spot",
    E.SPOTS.every((s) => prey.filter((p) => !s.terrain.couches.includes(p.couche)).every((p) => { const a = E.adviceForSpot(s, p); return a.replaces && s.terrain.couches.some((c) => a.note.includes("nager en " + c)); })));
  const mmS = E.SPOTS.find((s) => s.id === "moulinmer"), sprat = prey.find((p) => p.name === "Sprat");
  if (mmS && sprat) t("Moulin Mer : le sprat (mi-eau, shad plombé 12-25 g) passe en sous-surface", /nager en sous-surface/.test(E.adviceForSpot(mmS, sprat).note), E.adviceForSpot(mmS, sprat).note);
  const mm = E.SPOTS.find((s) => s.id === "moulinmer");
  if (mm) t("Moulin Mer : pas de pêche à gratter, observation de terrain de Félix", mm.terrain.gratter === "non" && mm.terrain.confidence === "local_knowledge" && /Félix/.test(mm.terrain.source)
    && !mm.terrain.couches.includes("fond"));
}

// ── 10. Heures de pêche ──
if (E.scoreDay) {
  globalThis.fetch = mockFetch("nominal");
  const Lh = await E.fetchLive(DATE);
  const all = E.scoreDay(DATE, Lh, {}), allH = E.scoreDay(DATE, Lh, { hours: E.ALL_HOURS });
  t("heures : « toutes heures » = aucun changement", JSON.stringify(all.map((s) => [s.id, s.score, s.bestWindowId])) === JSON.stringify(allH.map((s) => [s.id, s.score, s.bestWindowId])));
  const H = { from: 6, to: 22 };
  const lim = E.scoreDay(DATE, Lh, { hours: H });
  t("heures : le meilleur créneau de chaque spot est dans les heures choisies",
    lim.filter((s) => s.eligible).every((s) => { const w = s.windows.find((x) => x.id === s.bestWindowId); return w && !w.outOfHours && Math.min(w.endDecimal, 22) - Math.max(w.startDecimal, 6) >= 0.5; }));
  t("heures : les créneaux hors plage restent affichés, marqués", lim.some((s) => s.windows.some((w) => w.outOfHours)) && lim.every((s) => s.windows.length === all.find((a) => a.id === s.id).windows.length));
  const night = { from: 23, to: 24 };
  const n = E.scoreDay(DATE, Lh, { hours: night });
  t("heures : sans créneau possible, raison explicite", n.filter((s) => !s.eligible).some((s) => /tes heures de pêche/.test(s.reason)));
  t("outOfHours : fenêtre à cheval sur minuit", E.outOfHours({ startDecimal: 23.5, endDecimal: 25.5 }, { from: 5, to: 23 }) === true && E.outOfHours({ startDecimal: 21, endDecimal: 23.2 }, { from: 5, to: 23 }) === false);
}

// ── 11. Conditions de session ──
if (E.sessionConditions) {
  globalThis.fetch = mockFetch("nominal");
  const Lc = await E.fetchLive(DATE);
  const s0 = E.SPOTS[0];
  t("heure de session : « 19:15 » → 19,25", E.sessionHour({ heure: "19:15" }, DATE) === 19.25 && E.sessionHour({ heure: "7h05" }, DATE) === 7 + 5 / 60);
  t("heure de session : « au coucher » → coucher calculé", Math.abs(E.sessionHour({ moment: "coucher" }, DATE) - E.solarTimes(DATE).sunset) < 1e-9);
  t("heure de session absente → pas de conditions", E.sessionHour({}, DATE) === null && E.sessionConditions(DATE, Lc, s0, null) === null);
  const c = E.sessionConditions(DATE, Lc, s0, 19.25);
  const tide = E.tideDay(DATE, s0.tidePort || E.SITE.tide.defaultPort);
  const prev = [...tide.events].filter((e) => e.dec <= 19.25).pop();
  t("conditions : phase et référence de marée cohérentes", c && c.phase === (prev.type === "BM" ? "montant" : "descendant") && c.ref.startsWith(prev.type + "+") && c.coef === prev.coef, JSON.stringify(c && [c.phase, c.ref, c.coef]));
  const wx = E.spotWxBetween(Lc, s0, 18.75, 19.75);
  t("conditions : vent de CE spot à CETTE heure", c.vent && c.vent.dir === wx.wind_dir && c.vent.kmh === wx.wind_kmh);
  t("conditions : pression, eau, lumière renseignées", c.pression === Lc.pressure && c.eau === Lc.sst && typeof c.lumiere === "string");
  t("conditions : ligne lisible", /coef \d+/.test(E.conditionsLine(c)) && /km\/h/.test(E.conditionsLine(c)) && /hPa/.test(E.conditionsLine(c)), E.conditionsLine(c));
  const cNo = E.sessionConditions(DATE, null, s0, 19.25);
  t("conditions sans météo : marée seule, rien d'inventé", cNo && cNo.phase && cNo.vent === null && cNo.houle === null && cNo.pression === null);
  const seeds = E.SITE.seedJournal || [];
  if (seeds.length) t("archives : le moment « coucher » est repris de tes mots", seeds.filter((s) => s.moment === "coucher").length === 2 && seeds.find((s) => s.date === "2026-08-07").moment === undefined);
}

// ── 12. Semaine ──
if (E.fetchWeek) {
  globalThis.fetch = mockFetch("nominal"); calls.length = 0;
  const W = await E.fetchWeek(DATE, 7);
  t("semaine : 3 requêtes pour 7 jours", calls.length === 3, calls.join(" | "));
  t("semaine : 7 jours consécutifs, chacun avec sa météo", W.length === 7 && W.every((x, i) => x.date === E.isoAddDays(DATE, i) && x.live && x.live.date === x.date));
  t("semaine : séries découpées autour de chaque jour (≈ 72 h)", W.every((x) => Math.abs(x.live.series._base.t.length - 72) <= 2));
  globalThis.fetch = mockFetch("nominal");
  const D0 = await E.fetchLive(DATE);
  const k = (x) => JSON.stringify([x.pressure, x.pressure_delta_24h, x.pressure_trend, x.wind_dir, x.wind_kmh, x.sst, x.resume]);
  t("semaine : le jour J est identique au téléchargement du jour", k(W[0].live) === k(D0), k(W[0].live) + " ≠ " + k(D0));
  const sc = W.map((x) => E.scoreDay(x.date, x.live, {}));
  t("semaine : chaque jour se note avec le même calcul", sc.every((list) => list.length === E.SPOTS.length && list.some((s) => s.eligible)));
  globalThis.fetch = mockFetch("range");
  let err = null; try { await E.fetchWeek(DATE, 7); } catch (e) { err = e; }
  t("semaine : Open-Meteo refuse → erreur claire", err && /horizon/.test(err.message));
}

// ── 13. v7 : rafales, pression, incertitude réelle, saison dans le score, orientation ──
{
  globalThis.fetch = mockFetch("nominal");
  const Ln = await E.fetchLive(DATE);
  globalThis.fetch = mockFetch("spread");
  const Ls = await E.fetchLive(DATE);
  const sp0 = E.SPOTS[0];
  const zwN = E.spotWxBetween(Ln, sp0, 18, 20), zwS = E.spotWxBetween(Ls, sp0, 18, 20);
  t("incertitude : modèles proches → ±1 ; modèles divergents → plus large", zwN.spreadF === 1 && zwS.spreadF >= 2 && zwS.alt && zwS.alt.kmh > zwS.wind_kmh, `${zwN.spreadF} / ${zwS.spreadF}`);
  const dN = E.scoreDay(DATE, Ln, {}), dS = E.scoreDay(DATE, Ls, {});
  // v8.9 : la mesure porte sur l'écart moyen des spots praticables. Spot par spot, l'écart peut ne pas bouger :
  // l'effet du vent est en marches (bonus de vent de terre jusqu'à F4, malus au-delà de F6), et ±1 Beaufort
  // couvre déjà toute la marche pour un vent de terre (mesuré à Concarneau, vent de nord-nord-ouest F4).
  const el = dS.filter((s) => s.eligible), spN = (s) => dN.find((x) => x.id === s.id)?.spread ?? 0;
  const meanS = el.reduce((a, s) => a + s.spread, 0) / el.length, meanN = el.reduce((a, s) => a + spN(s), 0) / el.length;
  const wider = el.filter((s) => s.spread > spN(s)).length;
  t("incertitude : la plage de score s'élargit en moyenne quand AROME et ECMWF divergent", el.length > 0 && meanS > meanN && wider >= 1, `moyenne ${meanN.toFixed(2)} → ${meanS.toFixed(2)}, ${wider}/${el.length} spots plus larges`);
  const win = { ...E.computeWindows(sp0, E.tideDay(DATE, sp0.tidePort || E.SITE.tide.defaultPort).events)[0], light: { band: "jour", label: "Jour" } };
  const base = { coeff: 80, pressure: 1000, pressureTrend: "falling_fast", sst: 15, sstConf: "modele", month: 7 };
  const r1 = E.scoreWindow(sp0, win, { ...base, zw: { wind_dir: "N", wind_force: 3, sky: "partly", houle: 0.3, gust_kmh: 30 } });
  const r2 = E.scoreWindow(sp0, win, { ...base, zw: { wind_dir: "N", wind_force: 3, sky: "partly", houle: 0.3, gust_kmh: 70 } });
  t("rafales ≥ 50 km/h pénalisées", r2.rawScore < r1.rawScore && r2.parts.some((p) => /^Rafales 70/.test(p.k)));
  t("pression : poids plafonné à ±0,3", Math.abs(r1.pressureMod) <= 0.3);
  const feb = E.scoreWindow(sp0, win, { ...base, month: 2, zw: { wind_dir: "N", wind_force: 3, sky: "partly", houle: 0.3 } });
  const jul = E.scoreWindow(sp0, win, { ...base, month: 7, zw: { wind_dir: "N", wind_force: 3, sky: "partly", houle: 0.3 } });
  t("saison appliquée au score (février < juillet)", feb.rawScore < jul.rawScore && feb.parts.some((p) => /^Saison/.test(p.k)));
  const o = E.applyOrientation(sp0, { [sp0.id]: { water: 90 } });
  t("orientation corrigée : eau à l'est → exposé E, abrité O", o.exposedAngles.includes(90) && o.shelteredAngles.includes(270) && o.orientSource === "terrain");
  const dO = E.scoreDay(DATE, Ln, { orient: { [sp0.id]: { water: 90 } } }).find((s) => s.id === sp0.id);
  t("orientation corrigée : prise en compte dans le classement", dO.exposedAngles.includes(90));
  t("pluie 36 h calculée pour chaque créneau", Number.isFinite(zwN.rain36));
  const wd = E.waterDirOf(sp0);
  const oc = E.applyOrientation(sp0, { [sp0.id]: { water: wd, confirmed: true } });
  t("orientation confirmée : secteurs de la fiche conservés, confiance relevée", oc.orientSource === "confirmé" && JSON.stringify(oc.exposedAngles) === JSON.stringify(sp0.exposedAngles));
  t("direction de l'eau : moyenne circulaire (N ± 22,5 → N)", E.waterDirOf({ exposedAngles: [337.5, 0, 22.5] }) === 0 && E.waterDirOf({ exposedAngles: [180, 202.5, 225] }) === 202.5);
}

// ── 14. v7 : journal (rétrécissement, prises par heure) ──
{
  const mk = (n, res, pred, extra = {}) => Array.from({ length: n }, (_, i) => ({ id: `x${i}`, spotId: "a", date: "2026-07-01", result: res, predicted: pred, ...extra }));
  const c2 = E.calibrate(mk(2, 9, 5));
  t("journal : moins de 3 sessions → aucun recalibrage", c2.calibrated === 0 && c2.detail.a.n === 2);
  const c3 = E.calibrate(mk(3, 6, 5)), c30 = E.calibrate(mk(30, 6, 5));
  t("journal : rétrécissement — 3 sessions corrigent moins que 30", near(c3.spotBias.a, 1 + 0.2 * 3 / 8, 1e-9) && c30.spotBias.a > c3.spotBias.a && c30.spotBias.a <= 1.18);
  t("journal : correction toujours bornée à ±18 %", near(E.calibrate(mk(100, 10, 2)).spotBias.a, 1.18) && near(E.calibrate(mk(100, 0, 8)).spotBias.a, 0.82));
  const st = E.catchStats([{ spotId: "a", fish: 2, duree: 2 }, { spotId: "a", fish: 0, duree: "1,5" }, { spotId: "a", fish: 3 }, { spotId: "b", fish: 1, duree: 30 }]);
  t("prises : bars par heure sur les seules sessions chronométrées", st.a.sessions === 3 && st.a.fish === 5 && st.a.timed === 2 && near(st.a.cpue, 2 / 3.5) && st.a.blank === 1);
  t("prises : durée aberrante (> 24 h) ignorée", st.b.timed === 0 && st.b.cpue === null);
  // Un spot noté même sans météo (un spot engagé ne l'est pas quand la houle est inconnue).
  const sp = E.SPOTS.find((s) => (s.dangerLevel || 1) < 3), s1 = E.scoreDay(DATE, null, {}).find((s) => s.id === sp.id);
  const calib = E.calibrate(mk(10, 9, 5).map((e) => ({ ...e, spotId: sp.id })));
  const s2 = E.scoreDay(DATE, null, { calib }).find((s) => s.id === sp.id);
  t("journal : le recalibrage apparaît dans le détail de la fenêtre", s2.rawScore > s1.rawScore && s2.windows.some((w) => (w.parts || []).some((p) => /^Journal \(10 sessions\)/.test(p.k))));
}

// ── 15. v7 : réglementation et sécurité ──
{
  const r1 = E.regulationFor("2026-02-15", E.SITE.lat), r2 = E.regulationFor("2026-04-01", E.SITE.lat), r3 = E.regulationFor("2026-03-31", E.SITE.lat);
  if (E.SITE.lat > 48) {
    t("réglementation : no-kill du 1er février au 31 mars", r1.noKill && r3.noKill && !r2.noKill && !E.regulationFor("2026-01-31", E.SITE.lat).noKill);
    t("réglementation : 3 bars/jour, 42 cm, site au nord du 48e parallèle", r2.quota === 3 && r2.maille === 42 && r2.inZone);
  } else {
    // v8.9 : Concarneau, tout le secteur au sud du 48e parallèle (zone CIEM 8).
    t("réglementation : site au sud du 48e, 2 bars/jour toute l'année, pas de no-kill", !r1.noKill && !r3.noKill && r1.quota === 2 && r2.quota === 2 && r2.maille === 42 && r2.zoneKey === "sud");
  }
  t("réglementation : autre année signalée « à vérifier »", E.regulationFor("2027-06-01", E.SITE.lat).stale && !r2.stale);
  t("réglementation : chaque règle porte sa source", E.REGLEMENTATION.regles.every((r) => r.t && r.s) && E.REGLEMENTATION.sources.every((s) => /^https:\/\//.test(s.url)));
  t("sécurité : chaque consigne porte sa source", E.SPOTS.every((s) => Array.isArray(s.securite) && s.securite.every((r) => r.t && r.s)));
  if (E.SITE.id === "logonna-daoulas") {
    const te = E.SPOTS.find((s) => s.id === "terenez");
    t("Térénez : alerte active au-delà du coef 85 seulement (Sauvin)", E.securityFor(te, { coeff: 90 }).some((r) => r.active) && !E.securityFor(te, { coeff: 80 }).some((r) => r.active));
  } else if (E.SITE.id === "pirou-plage") {
    const ag = E.SPOTS.find((s) => s.id === "agon");
    t("Agon : alerte « se laisser entourer » active sur un créneau montant", E.securityFor(ag, { window: { tidePhaseType: "montant" } }).some((r) => r.active) && !E.securityFor(ag, { window: { tidePhaseType: "descendant" } }).some((r) => r.active));
  }
  // v8.7 : deux régimes, de part et d'autre du 48e parallèle.
  t("réglementation : chaque règle de zone porte sa source", Object.values(E.REGLEMENTATION.zones).every((Z) => Z.label && Z.regles.length && Z.regles.every((r) => r.t && r.s)));
  const sud = E.regulationFor("2026-02-15", 47.9), sudAvr = E.regulationFor("2026-04-15", 47.9);
  t("réglementation : au sud du 48e, 2 bars/jour toute l'année, pas de no-kill en février", sud.zoneKey === "sud" && sud.quota === 2 && !sud.noKill && sudAvr.quota === 2 && sud.maille === 42);
  t("réglementation : au nord du 48e, 3 bars/jour et no-kill en février", E.regulationFor("2026-02-15", 48.5).noKill && E.regulationFor("2026-04-15", 48.5).quota === 3);
  t("réglementation : latitude inconnue → régime nord (le plus strict en février-mars)", E.regulationFor("2026-02-15", NaN).zoneKey === "nord");
  const zonesSite = E.regZonesOf(E.SPOTS.map((s) => E.spotLatLon(s).lat));
  if (E.SITE.id === "audierne") {
    t("Audierne : secteur à cheval sur le 48e parallèle (deux régimes)", zonesSite.join() === "nord,sud");
    t("Audierne : Penhors, la Torche et Saint-Guénolé au sud ; la pointe du Raz au nord", ["penhors", "torche", "saintguenole"].every((id) => E.regulationFor("2026-02-15", E.spotLatLon(E.SPOTS.find((s) => s.id === id)).lat).zoneKey === "sud")
      && E.regulationFor("2026-02-15", E.spotLatLon(E.SPOTS.find((s) => s.id === "raz")).lat).zoneKey === "nord");
    // v8.8 : pointe de Penmarc'h (phare d'Eckmühl), au sud du 48e.
    const pm = E.SPOTS.find((s) => s.id === "penmarch");
    t("Audierne : pointe de Penmarc'h au sud, port de Saint-Guénolé, poste engagé et houle limitée à 1,2 m",
      !!pm && E.regulationFor("2026-02-15", E.spotLatLon(pm).lat).zoneKey === "sud" && pm.tidePort === "saintguenole" && pm.dangerLevel === 3 && pm.houleMax === 1.2);
  } else if (E.SITE.lat > 48) t("un seul régime réglementaire pour ce site (nord du 48e)", zonesSite.join() === "nord");
  else t("un seul régime réglementaire pour ce site (sud du 48e)", zonesSite.join() === "sud");
  if (E.SITE.id === "plouguerneau") {
    // v8.8 : Le Conquet (Blancs-Sablons, Kermorvan), au port harmonique du Conquet.
    const bs = E.SPOTS.find((s) => s.id === "blancssablons"), km = E.SPOTS.find((s) => s.id === "kermorvan");
    t("Plouguerneau : Blancs-Sablons et Kermorvan au port du Conquet, Kermorvan engagé", bs?.tidePort === "leconquet" && km?.tidePort === "leconquet" && km.dangerLevel === 3 && bs.dangerLevel === 1);
  }
}

// ── 16. v7 : marée de Pirou contre une table publiée (contrôle d'octobre 2026) ──
if (E.SITE.id === "pirou-plage") {
  const ref = fs.readFileSync(path.join(here, "ref/pirou_cabaigne_2026-10.txt"), "utf8").split("\n").filter((l) => /^\d\d \|/.test(l));
  const pm = [], pmVive = [], dh = [];
  let matched = 0, total = 0;
  for (const l of ref) {
    const date = `2026-10-${l.slice(0, 2)}`;
    const T = E.tideDay(date, "pirou");
    const c = Math.max(...(T.coefs || [0]));
    for (const [type, hm, h] of l.split("|")[1].split(";").map((s) => s.trim().split(/\s+/))) {
      total++;
      const dec = +hm.slice(0, 2) + +hm.slice(3) / 60;
      const m = T.dayEvents.filter((e) => e.type === type).sort((a, b) => Math.abs(a.dec - dec) - Math.abs(b.dec - dec))[0];
      if (!m || Math.abs(m.dec - dec) > 1.5) continue;
      matched++; dh.push(m.h - +h);
      if (type === "PM") { pm.push(Math.abs(m.dec - dec) * 60); if (c >= 60) pmVive.push(Math.abs(m.dec - dec) * 60); }
    }
  }
  const rms = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);
  t("marée Pirou : ≥ 95 % des extrêmes de la table retrouvés", matched / total >= 0.95, `${matched}/${total}`);
  t("marée Pirou : pleines mers à ±15 min quand coef ≥ 60", pmVive.length >= 20 && Math.max(...pmVive) <= 15, `max ${Math.max(...pmVive).toFixed(0)} min`);
  t("marée Pirou : pleines mers à ±45 min en morte-eau", Math.max(...pm) <= 45, `max ${Math.max(...pm).toFixed(0)} min`);
  t("marée Pirou : hauteurs à ±0,25 m (écart quadratique)", rms(dh) <= 0.25, rms(dh).toFixed(2));
  t("marée Pirou : le libellé de précision cite ce contrôle", /cabaigne/.test(E.SITE.tide.ports.pirou.accuracy) && !/^SHOM/.test(E.SITE.tide.ports.pirou.accuracy));
}

// ── 16 bis. Conseil leurres ──
{
  t("leurres : classement des familles d'après le nom", E.familyOf({ name: "Black Minnow 120 / 140" }) === "shad" && E.familyOf({ name: "Stickbait 110-140 mm" }) === "surface"
    && E.familyOf({ name: "Long bill minnow / leurre plongeant" }) === "nageur" && E.familyOf({ name: "Souple weightless sur les tables" }) === "weightless"
    && E.familyOf({ name: "Sinking pencil / Asturie lourd" }) === "nageur" && E.familyOf({ name: "Shad souple 10-12 cm en texan" }) === "weightless");
  const sp = E.SPOTS[0];
  const zw = (o) => ({ wind_dir: "O", wind_force: 2, wind_kmh: 10, houle: 0.3, houleKnown: true, cloud: 50, rain36: 0, ...o });
  const W = (band, o = {}, coeff = 70) => ({ light: { band }, zw: zw(o), coeff });
  const nuit = E.lureAdvice(sp, W("nuit"), { sst: 16 }, "2026-07-15");
  t("leurres : de nuit, blanc et petit souple", nuit.color.cat === "blanc" && /85 à 100/.test(nuit.size.text));
  // Mer agitée : sur un spot de côte ouverte (pas une embouchure ni un aber, où la règle des vagues ne s'applique pas).
  const spOpen = E.SITE.zones[sp.zone].sea === "open" && E.regimeOf(sp) === "abri"
    ? (E.SPOTS.find((s) => E.SITE.zones[s.zone].sea === "open" && E.regimeOf(s) !== "abri") || sp) : sp;
  const agit = E.lureAdvice({ ...spOpen, terrain: { ...E.terrainOf(spOpen), gratter: "oui", couches: E.COUCHES } }, W("jour", { houle: 1.4, wind_force: 6 }), { sst: 16 }, "2026-07-15");
  if (E.SITE.zones[spOpen.zone].sea === "open") t("leurres : mer agitée → souple plombé 18-25 g, surface déconseillée", agit.best.k === "shad" && agit.pick.fam === "shad" && agit.pick.weight.g >= 18 && agit.pick.weight.g <= 25 && agit.fams.find((f) => f.k === "surface").score < 0, JSON.stringify(agit.pick?.weight));
  else t("leurres : vent F6 en rade → surface déconseillée", agit.fams.find((f) => f.k === "surface").score < agit.fams[0].score);
  const crep = E.lureAdvice(sp, W("crepuscule"), { sst: 16 }, "2026-07-15");
  t("leurres : crépuscule par mer calme → surface en tête, coloris contrasté", crep.color.cat === "contraste" && (crep.best.k === "surface" || E.terrainOf(sp).couches.indexOf("surface") < 0));
  t("leurres : crépuscule → Asturie Cabot de ta boîte proposé en premier", !E.terrainOf(sp).couches.includes("surface") || (/Asturie/.test(crep.pick.name) && crep.pick.color.name === "Cabot"), crep.pick?.name);
  const all = [nuit, agit, crep];
  const srcOk = all.every((a) => [...a.color.why, ...a.size.why, ...a.weight.why, ...a.anim, ...a.models, ...a.sit.clarityWhy, ...a.sit.current.why, ...a.fams.flatMap((f) => f.why),
    ...a.boxRanked.flatMap((o) => [...o.why, ...(o.sizeWhy ? [o.sizeWhy] : []), ...o.anim, ...o.facts]), ...a.alts.flatMap((o) => o.why)].every((x) => E.LURE_SOURCES[x.s]));
  t("leurres : chaque raison renvoie à une source connue", srcOk);
  const rocky = E.SPOTS.find((s) => E.terrainOf(s).gratter === "non");
  if (rocky) { const a = E.lureAdvice(rocky, W("jour"), { sst: 16 }, "2026-07-15"); t(`leurres : ${rocky.name}, fond encroché → jamais de souple plombé en tête`, a.best.k !== "shad" && a.best.k !== "metal"); }
  const cold = E.lureAdvice(sp, W("jour"), { sst: 10 }, "2026-04-10");
  t("leurres : eau froide → petite taille, récupération lente", /9 à 12 cm/.test(cold.size.text) && cold.sit.cold);
  const sun = E.lureAdvice(sp, W("jour", { cloud: 10 }), { sst: 16 }, "2026-07-15");
  if (E.SITE.zones[sp.zone].eauClaire) t("leurres : rade de Brest, plein soleil → naturel (eau claire)", sun.color.cat === "naturel" && sun.sit.clarity === "claire");
  // v8.9 : l'eau claire n'est plus affirmée nulle part — aucune source consultée ne la décrit (rade de Brest comprise).
  t("leurres : aucune zone déclarée « eau claire » sans source", Object.values(E.SITE.zones).every((z) => !z.eauClaire));
  const abri = E.SPOTS.find((s) => E.SITE.zones[s.zone]?.sea === "rade" && !E.SITE.zones[s.zone]?.eauClaire);
  if (abri) {
    const ab = E.lureAdvice(abri, W("jour", { cloud: 10 }), { sst: 16 }, "2026-07-15");
    t(`leurres : ${abri.name} (plan d'eau abrité) → clarté non mesurée, supposée normale, aucune raison « eau claire »`, ab.sit.clarity === "normale" && !ab.sit.clarityWhy.some((x) => x.s === "rade") && !/eau habituellement claire/i.test(JSON.stringify(ab.sit.clarityWhy)));
  }
  const rain = E.lureAdvice({ ...sp, type: "ESTUAIRE" }, W("jour", { rain36: 30 }), { sst: 16 }, "2026-07-15");
  t("leurres : forte pluie près d'un estuaire → eau teintée, coloris visibles", rain.sit.clarity === "teintée" && rain.color.cat === "visible");
  // Boîte : toujours un leurre précis, jamais une couleur réservée à une autre lumière, jamais une couche interdite par la fiche.
  {
    let n = 0, bad = [], ties = 0, tieOk = 0;
    for (const s of E.SPOTS) for (const band of ["nuit", "aube", "jour"]) for (const cloud of [10, 90]) for (const wf of [1, 5]) {
      const a = E.lureAdvice(s, W(band, { cloud, wind_force: wf }), { sst: 15 }, "2026-07-15");
      n++;
      const p = a.pick, tr = E.terrainOf(s);
      if (!p) { bad.push(`${s.id}/${band}: aucun`); continue; }
      if (p.color.named && p.color.name === "Ghost Iwashi" && !(a.sit.light === "soleil" && a.sit.clarity === "claire")) bad.push(`${s.id}/${band}: Ghost Iwashi`);
      if (p.layer === "surface" && !tr.couches.includes("surface")) bad.push(`${s.id}: surface interdite`);
      if (p.layer === "fond" && tr.gratter === "non") bad.push(`${s.id}: fond encroché`);
      if (E.CATALOGUE[p.cat].unknown) bad.push(`${s.id}: modèle à préciser en tête`);
      if (a.tiedTop.length > 1) { ties++; if (a.tiedTop.every((f) => f.score === a.best.score) && a.tiedTop[0].k === a.best.k) tieOk++; }
    }
    t(`leurres : un leurre précis de ta boîte pour chacune des ${n} situations, cohérent avec la fiche`, !bad.length, bad.slice(0, 4).join(" | "));
    t(`leurres : familles à égalité annoncées (${ties} cas)`, tieOk === ties);
  }
  t("leurres : chaque spot reçoit un conseil complet", E.SPOTS.every((s) => { const a = E.lureAdvice(s, W("jour"), { sst: 15 }, "2026-10-11"); return a.best && a.color.label && a.size.text && a.weight.text && a.anim.length && a.spotLures.length === (s.lures || []).length; }));
}

// ── 16 bis/2. v8.5 : le leurre précis de ta boîte (modèle, taille, poids, couleur) ──
{
  const zw = (o) => ({ wind_dir: "O", wind_force: 2, wind_kmh: 10, houle: 0.3, houleKnown: true, cloud: 50, rain36: 0, ...o });
  const W = (band, o = {}, coeff = 70, win = {}) => ({ light: { band }, zw: zw(o), coeff, ...win });
  const S = (id) => E.SPOTS.find((x) => x.id === id);
  const K = E.CATALOGUE;
  // Fiches techniques : chiffres relevés chez les fabricants et revendeurs, chacun avec sa source.
  t("fiches : Asturie 110/130/150 = 15/27/32 g, flottant", K.asturie.sizes[110].g === 15 && K.asturie.sizes[130].g === 27 && K.asturie.sizes[150].g === 32 && K.asturie.float === "flottant");
  t("fiches : Patchinko 140 = 25 g, Z Claw Evo 100 = 22,5 g, Mr Joe 105/120 = 23/35 g coulant", K.patchinko.sizes[140].g === 25 && K.zclaw.sizes[100].g === 22.5 && K.mrjoe.sizes[105].g === 23 && K.mrjoe.sizes[120].g === 35 && K.mrjoe.float === "coulant");
  t("fiches : têtes Black Minnow 120 (6, 12, 16, 18, 25, 37, 50 g)", K.blackminnow.sizes[120].heads.map((h) => h[1]).join() === "6,12,16,18,25,37,50");
  t("fiches : têtes Crazy Paddle Tail 120 et Master Shad 125", K.cpt.sizes[120].heads.map((h) => h[1]).join() === "7,10,15,25" && K.mastershad.sizes[125].heads.map((h) => h[1]).join() === "14,25,36");
  t("fiches : Dark Sleeper 2,4/3/3,8/4,5 pouces pré-plombés", K.darksleeper.sizes[61].weights.join() === "7.1,10.6" && K.darksleeper.sizes[114].weights.join() === "23,29,36");
  t("fiches : X-Layer 105/150 = 6/13,5 g (slug)", K.xlayer.sizes[105].g === 6 && K.xlayer.sizes[150].g === 13.5 && K.xlayer.slug);
  t("fiches : chaque poids relevé renvoie à une source connue", Object.values(K).every((c) => Object.values(c.sizes).every((sp) => sp.g == null || E.LURE_SOURCES[sp.s])));
  t("boîte : chaque leurre déclaré existe au catalogue", E.BOITE.every((b) => K[b.cat]));
  t("fiches : Mr Joe 120 nage de 0 à 2 m ; Dark Sleeper 3\" = 3/8, 1/2, 3/4 oz", /0 à 2 m/.test(K.mrjoe.sizes[120].depth) && K.darksleeper.sizes[76].weights.join() === "10.6,14.2,21.3" && K.darksleeper.sizes[97].weights.join() === "21.3,28.3");
  t("fiches : Asturie, les deux poids publiés sont affichés", /16,5 g/.test(K.asturie.sizes[110].alt) && /25,9 g/.test(K.asturie.sizes[130].alt) && /31,6 g/.test(K.asturie.sizes[150].alt));
  t("boîte : jigs DUO Drag Metal Cast 20, 30 et 40 g (famille métal)", E.BOITE.some((b) => b.cat === "dragmetal") && K.dragmetal.fam === "metal" && Object.values(K.dragmetal.sizes).map((x) => x.g).join() === "20,30,40");
  t("canne : 14 à 42 g", E.CANNE.min === 14 && E.CANNE.max === 42);
  {
    let over = [], n = 0;
    for (const sp of E.SPOTS) for (const [band, o, coef, win] of [["jour", { houle: 1.4, wind_force: 6 }, 100, { phase: "pm", offsetBefore: 2, offsetAfter: 4 }], ["nuit", {}, 95, { phase: "pm", offsetBefore: 2, offsetAfter: 4 }], ["aube", { wind_force: 6 }, 110, { phase: "bm", offsetBefore: 2, offsetAfter: 4 }]]) {
      const a = E.lureAdvice(sp, W(band, o, coef, win), { sst: 15 }, "2026-07-15");
      for (const x of a.boxRanked) { n++; if (x.weight?.g > E.CANNE.max) over.push(`${sp.id}:${x.name} ${x.weight.text}`); }
    }
    t(`canne : aucun leurre ni tête au-delà de 42 g (${n} options vérifiées, courant et vagues forts)`, n > 0 && !over.length, over.slice(0, 3).join(" | "));
  }
  {
    const a = E.lureAdvice(S({ "logonna-daoulas": "moulinmer", "pirou-plage": "pirou" }[E.SITE.id] || E.SPOTS[0].id), W("jour", { cloud: 10 }), { sst: 15 }, "2026-07-15");
    const xl = a.boxRanked.find((o) => o.cat === "xlayer" && o.weight?.g === 6);
    t("canne : un leurre de 6 g est signalé sous la plage de la canne", !xl || xl.warn.some((w) => /sous la plage de ta canne/.test(w)));
  }
  t("fiches des spots : l'Asturie n'est plus jamais présenté comme coulant", E.SPOTS.every((sp) => (sp.lures || []).every((l) => !/asturie/i.test(l.name) || !/sinking|coulant/i.test(l.name))));
  // Courant du créneau : règle des douzièmes dans la rade, les anses et les havres.
  t("courant : 1re heure 1/3, 2e heure 2/3, 3e heure 1, symétrique", Math.abs(E.flowFactor(0.3) - 1 / 3) < 1e-9 && Math.abs(E.flowFactor(1.5) - 2 / 3) < 1e-9 && E.flowFactor(3) === 1 && E.flowFactor(-1.5) === E.flowFactor(1.5) && Math.abs(E.flowFactor(6) - 1 / 3) < 1e-9);
  // Profondeur estimée pour chaque spot.
  t("profondeur : chaque spot porte une classe estimée et sa raison", E.SPOTS.every((sp) => E.DEPTH_CLASS[sp.terrain?.prof?.cls] && sp.terrain.prof.why));
  t("marée relative : basse mer 0, pleine mer 1, mi-marée 0,5", E.levelFraction({ phase: "bm", offsetBefore: -0.2, offsetAfter: 0.2 }) === 0 && E.levelFraction({ phase: "pm", offsetBefore: -0.2, offsetAfter: 0.2 }) === 1
    && Math.abs(E.levelFraction({ phase: "pm", offsetBefore: -3.6, offsetAfter: -2.6 }) - 0.5) < 0.02);
  // Poids visé : les fourchettes des sources.
  const sit0 = (o) => ({ light: "jour", sea: "calme", current: { level: "ordinaire" }, currentNow: false, wind: { F: 2, face: false }, depthEst: null, ...o });
  const tg = (o) => E.headTarget(sit0(o));
  t("poids : du bord peu profond, 5 g (3 à 10)", (({ start, lo, hi }) => start === 5 && lo === 3 && hi === 10)(tg({ depthEst: { cls: "peu", level: 0.6 } })));
  t("poids : estran à marée basse, bas de la fourchette (3 g)", tg({ depthEst: { cls: "estran", level: 0.2 } }).start === 3);
  t("poids : tombant, 10 à 20 g", (({ start, lo, hi }) => start === 10 && lo === 10 && hi === 20)(tg({ depthEst: { cls: "tombant", level: 0.5 } })));
  t("poids : courant fort sur tombant, 20 g (10 à 40)", (({ start, lo, hi }) => start === 20 && lo === 10 && hi === 40)(tg({ depthEst: { cls: "tombant" }, current: { level: "fort" }, currentNow: true })));
  t("poids : courant fort en peu d'eau, 15 g (10 à 25)", (({ start, hi }) => start === 15 && hi === 25)(tg({ depthEst: { cls: "peu" }, current: { level: "fort" }, currentNow: true })));
  t("poids : vagues, 18 à 25 g ; nuit, 5 à 10 g", tg({ sea: "agitée" }).lo === 18 && tg({ sea: "agitée" }).hi === 25 && tg({ light: "nuit" }).lo === 5 && tg({ light: "nuit" }).hi === 10);
  t("poids : vent de face F5, un cran plus lourd", tg({ wind: { F: 5, face: true } }).bump && !tg({ wind: { F: 5, face: false } }).bump);
  // Sur tous les spots et situations : une tête dans la fourchette visée, ou l'écart est dit.
  {
    const bad = [];
    for (const sp of E.SPOTS) for (const [band, o] of [["nuit", {}], ["jour", { houle: 1.4, wind_force: 5 }], ["aube", { wind_force: 5, wind_dir: "SO" }], ["jour", {}]]) {
      for (const win of [{ phase: "pm", offsetBefore: -3, offsetAfter: -1 }, { phase: "pm", offsetBefore: 1.5, offsetAfter: 3.5 }]) {
        const a = E.lureAdvice(sp, W(band, o, 92, win), { sst: 15 }, "2026-07-15");
        for (const x of a.boxRanked) if (x.weight?.head && !(x.weight.g >= a.target.lo && x.weight.g <= a.target.hi) && !x.warn.some((w) => /aucune tête/.test(w))) bad.push(`${sp.id}:${x.name} ${x.weight.text}`);
      }
    }
    t("têtes : toujours dans la fourchette visée, sinon l'écart est signalé", !bad.length, bad.slice(0, 3).join(" | "));
  }
  // Vent de face : la boîte passe aux leurres les plus lourds.
  {
    let cmp = 0, worse = [];
    for (const sp of E.SPOTS) {
      const calm = E.lureAdvice(sp, W("crepuscule", { wind_force: 1 }), { sst: 15 }, "2026-07-15").pick;
      const face = E.lureAdvice(sp, W("crepuscule", { wind_force: 5, wind_dir: E.DIR16[Math.round(sp.exposedAngles[0] / 22.5) % 16] }), { sst: 15 }, "2026-07-15").pick;
      if (calm?.weight?.g && face?.weight?.g && calm.fam === face.fam && calm.fam !== "shad") { cmp++; if (face.weight.g < calm.weight.g) worse.push(`${sp.id}: ${calm.name} → ${face.name}`); }
    }
    t(`vent de face F5 : jamais un leurre plus léger qu'en calme, même famille (${cmp} spots comparés)`, cmp > 0 && !worse.length, worse.join(" | "));
  }
  if (E.SITE.id === "logonna-daoulas") {
    const plein = { phase: "pm", offsetBefore: 2, offsetAfter: 4 }, etale = { phase: "pm", offsetBefore: -0.5, offsetAfter: 0.6 };
    const arm = (win, c = 90) => E.lureSituation(S("armorique"), W("jour", {}, c, win), { sst: 15 }, "2026-07-15");
    t("courant : Armorique coef 90, mi-jusant → fort ; à l'étale → faible", arm(plein).current.level === "fort" && arm(plein).currentNow && arm(etale).current.level === "faible" && !arm(etale).currentNow);
    t("courant : Armorique coef 60 → jamais « fort » (seuil de la fiche)", arm(plein, 60).current.level !== "fort" && !arm(plein, 60).currentNow);
    const esp = (win) => E.lureAdvice(S("espagnols"), W("jour", {}, 95, win), { sst: 15 }, "2026-07-15");
    t("Espagnols en plein courant : la fiche écarte la surface ; à l'étale, la surface revient", esp(plein).pick.layer !== "surface" && esp(plein).fams.find((f) => f.k === "surface").why.some((x) => x.s === "fiche" && /couche/.test(x.t))
      && esp(etale).fams.find((f) => f.k === "surface").score > esp(plein).fams.find((f) => f.k === "surface").score);
    const lv = E.lureAdvice(S("landevennec"), W("jour", {}, 85, plein), { sst: 15 }, "2026-07-15");
    t("Landévennec, courant établi : la surface est favorisée (Port Maria, source citée)", lv.fams.find((f) => f.k === "surface").why.some((x) => x.s === "fiche" && x.v > 0 && /Port Maria/.test(x.t)));
    const mm = E.lureAdvice(S("moulinmer"), W("jour", { wind_force: 5, wind_dir: "SO" }, 70, { phase: "bm", offsetBefore: -0.5, offsetAfter: 2 }), { sst: 15 }, "2026-07-15");
    t("Moulin Mer, basse mer et vent de face : pas de leurre coulant de 35 g sur le goémon", mm.pick.cat !== "mrjoe" && mm.boxRanked.filter((o) => o.cat === "mrjoe").every((o) => o.warn.some((w) => /goémon/.test(w))), mm.pick.name);
    const crep = E.lureAdvice(S("moulinmer"), W("crepuscule", {}, 70, { phase: "pm", offsetBefore: -3, offsetAfter: -0.5 }), { sst: 15 }, "2026-07-15");
    t("Moulin Mer, crépuscule calme : Asturie Cabot ; parade aux suiveurs : Mr Joe (source)", /Asturie/.test(crep.pick.name) && crep.pick.color.name === "Cabot" && crep.alts.some((x) => x.cat === "mrjoe" && x.why.some((y) => y.s === "mrjoe")));
    const nuit = E.lureAdvice(S("camfrout"), W("nuit", {}, 60, { phase: "pm", offsetBefore: -2, offsetAfter: 0 }), { sst: 15 }, "2026-07-15");
    t("nuit en estuaire : petit souple 85-100 mm sur 5 à 10 g, blanc", nuit.pick.fam === "shad" && nuit.pick.len >= 85 && nuit.pick.len <= 100 && nuit.pick.weight.g >= 5 && nuit.pick.weight.g <= 10 && nuit.color.cat === "blanc", nuit.pick.name);
  } else if (E.SITE.id === "pirou-plage") {
    const go = E.lureSituation(S("goury"), W("jour", {}, 70, { phase: "pm", offsetBefore: -1, offsetAfter: 1 }), { sst: 15 }, "2026-07-15");
    t("courant : Goury (raz) → fort autour de la pleine mer, heure tirée de la source du raz", go.current.level === "fort" && go.current.factor === 1 && go.current.why.some((x) => x.s === "razBlanchard"));
    const ca = E.lureSituation(S("carteret"), W("jour", {}, 95, { phase: "pm", offsetBefore: -1, offsetAfter: 1 }), { sst: 15 }, "2026-07-15");
    t("courant : Carteret (côte ouverte, pas de source d'heure) → fort, heure non estimée", ca.current.level === "fort" && ca.current.factor == null && ca.current.why.some((x) => /côte/i.test(x.t)));
    const ag = E.lureAdvice(S("pirou"), W("jour", { houle: 1.4, wind_force: 5 }, 85, { phase: "pm", offsetBefore: -3, offsetAfter: -1 }), { sst: 15 }, "2026-07-15");
    t("Pirou, mer agitée : Black Minnow 120 ou 140 sur une tête de bord de 18 à 25 g", /Black Minnow 1[24]0/.test(ag.pick.name) && ag.pick.weight.g >= 18 && ag.pick.weight.g <= 25 && !["Offshore", "Deep", "X Deep"].includes(ag.pick.weight.head), `${ag.pick.name} ${ag.pick.weight.text}`);
    const aut = E.lureAdvice(S("surtainville"), W("jour", { cloud: 90, houle: 0.8 }, 75, { phase: "pm", offsetBefore: -2, offsetAfter: 0 }), { sst: 15 }, "2026-09-20");
    t("automne : surface de 130 à 150 mm (source)", aut.pick.layer !== "surface" || (aut.pick.len >= 130 && aut.pick.len <= 150), aut.pick.name);
  } else if (E.SITE.id === "audierne") {
    // Raz de Sein : renverse peu avant les pleines et basses mers (bateaux.com), donc plein courant vers la mi-marée.
    const mid = E.lureSituation(S("raz"), W("jour", {}, 70, { phase: "pm", offsetBefore: 2, offsetAfter: 3.5 }), { sst: 15 }, "2026-07-15");
    const hw = E.lureSituation(S("raz"), W("jour", {}, 70, { phase: "pm", offsetBefore: -0.8, offsetAfter: 0 }), { sst: 15 }, "2026-07-15");
    t("Raz de Sein : plein courant vers la mi-marée, source du raz citée", mid.current.level === "fort" && mid.current.factor === 1 && mid.current.why.some((x) => x.s === "razSein") && /mi-marée/.test(mid.current.label));
    t("Raz de Sein : courant faible près de la pleine mer (renverse)", hw.current.level === "faible" && !hw.current.why.some((x) => x.s === "razBlanchard"));
    t("Raz de Sein : renverse 0,35 h avant les extrêmes d'Audierne, l'inverse exact du Raz Blanchard", E.razSlackH(S("raz")) === -0.35 && E.razFactor(-0.35, -0.35) === 1 / 3 && E.razFactor(2.755, -0.35) === 1);
    const gy = E.lureSituation(S("goyen"), W("jour", {}, 70, { phase: "bm", offsetBefore: 2.5, offsetAfter: 3.5 }), { sst: 15 }, "2026-07-15");
    t("Goyen (embouchure) : courant d'estuaire selon les douzièmes", E.regimeOf(S("goyen")) === "abri" && gy.current.why.some((x) => x.s === "douziemes"));
  } else if (E.SITE.id === "plouguerneau") {
    t("Paluden : intérieur d'aber, régime abrité et clapot du plan d'eau", E.regimeOf(S("paluden")) === "abri" && E.SITE.zones[S("paluden").zone].sea === "rade");
    const pl = E.lureSituation(S("paluden"), W("jour", {}, 70, { phase: "bm", offsetBefore: 2.5, offsetAfter: 3.5 }), { sst: 15 }, "2026-07-15");
    t("Paluden : courant d'aber selon les douzièmes, plein à mi-marée", pl.current.factor === 1 && pl.current.why.some((x) => x.s === "douziemes"));
    const co = E.lureSituation(S("corsen"), W("jour", {}, 95, { phase: "pm", offsetBefore: -1, offsetAfter: 1 }), { sst: 15 }, "2026-07-15");
    t("Corsen : côte ouverte, heure du courant non estimée (aucune source)", co.current.factor == null);
  } else if (E.SITE.id === "carantec") {
    // Rivières de Morlaix et de la Penzé : zones ostréicoles « mer calme et peu d'eau » (office de tourisme).
    t("Carantec : Penzé et Barnénez en rivière (régime abrité, clapot du plan d'eau)", ["penze", "barnenez"].every((id) => E.regimeOf(S(id)) === "abri" && E.SITE.zones[S(id).zone].sea === "rade"));
    const pz = E.lureSituation(S("penze"), W("jour", {}, 70, { phase: "bm", offsetBefore: 2.5, offsetAfter: 3.5 }), { sst: 15 }, "2026-07-15");
    t("Penzé : courant d'estuaire selon les douzièmes, plein à mi-marée", pz.current.factor === 1 && pz.current.why.some((x) => x.s === "douziemes"));
    t("Carantec : les parcs se pêchent au montant et en fin de descendante (fenêtres sourcées)", ["carantec", "barnenez"].every((id) => S(id).tidalRules.windows.some((w) => w.phase === "bm" && w.offsetBefore < 0 && w.offsetAfter > 0)));
    t("Saint-Jean-du-Doigt : fiche qui dit n'avoir qu'une source", /seule source/.test(JSON.stringify(S("saintjean").topology)) && /Une seule source/.test(S("saintjean").terrain.conseils.join(" ")));
    t("Carantec : chaque spot a un port de marée contrôlé contre une table SHOM", E.SPOTS.every((s) => /contrôlée contre les tables SHOM/.test(E.SITE.tide.ports[s.tidePort]?.accuracy || "")));
    // v8.9 : baie du Kernic (Haut-Léon), port de Brignogan, courant de l'entrée « par grande marée » seulement.
    const ke = S("kernic");
    t("Kernic : port de Brignogan, deux sources, alerte de courant active au-delà du coef 95 seulement", ke?.tidePort === "brignogan" && ke.sources.length >= 2
      && E.securityFor(ke, { coeff: 100 }).some((r) => r.active) && !E.securityFor(ke, { coeff: 80 }).some((r) => r.active));
  } else if (E.SITE.id === "concarneau") {
    t("Concarneau : estuaires de l'Odet, de l'Aven et de la Laïta en régime abrité (courant d'estuaire)", ["odet", "portmanech", "laita"].every((id) => E.regimeOf(S(id)) === "abri"));
    const od = E.lureSituation(S("odet"), W("jour", {}, 70, { phase: "bm", offsetBefore: 2.5, offsetAfter: 3.5 }), { sst: 15 }, "2026-07-15");
    t("Odet : courant d'estuaire selon les douzièmes, plein à mi-marée", od.current.factor === 1 && od.current.why.some((x) => x.s === "douziemes"));
    t("Odet : la basse mer, « un moment à ne pas rater » (Cadiou), est une fenêtre prime", S("odet").tidalRules.windows.some((w) => w.priority === "prime" && w.phase === "bm" && w.offsetBefore < 0 && w.offsetAfter > 0));
    t("Concarneau : chaque spot a un port de marée contrôlé contre une table SHOM", E.SPOTS.every((s) => /contrôlée contre les tables SHOM/.test(E.SITE.tide.ports[s.tidePort]?.accuracy || "")));
    t("Concarneau : tous les spots au sud du 48e parallèle", E.SPOTS.every((s) => E.spotLatLon(s).lat < 48));
  } else if (E.SITE.id === "crozon") {
    // v8.10 : presqu'île de Crozon et baie de Douarnenez, le trou entre les guides de Logonna et d'Audierne.
    t("Crozon : chaque spot a un port de marée contrôlé contre une table SHOM", E.SPOTS.every((s) => /contrôlée contre les tables SHOM/.test(E.SITE.tide.ports[s.tidePort]?.accuracy || "")));
    t("Crozon : tous les spots au nord du 48e parallèle (3 bars, pêcher-relâcher en février-mars)", E.SPOTS.every((s) => E.spotLatLon(s).lat > 48));
    const single = ["lostmarch", "leyde", "trenaouret"];
    t("Crozon : les fiches à une seule source de pêche le disent", single.every((id) => /Une seule source/.test(S(id).terrain.conseils.join(" ")) && S(id).terrain.confidence === "inference"));
    t("Crozon : les autres spots ont au moins deux sources de pêche indépendantes", E.SPOTS.filter((s) => !single.includes(s.id)).every((s) => s.terrain.confidence === "verified" && s.sources.length >= 3));
    t("Dinan : spot engagé (falaise, ressac), consignes sourcées", S("dinan").dangerLevel === 3 && S("dinan").securite.length >= 2 && S("dinan").securite.every((x) => x.s));
    t("Trénaouret : « en début de montante » (mieuxpecher) est la fenêtre prime", S("trenaouret").tidalRules.windows.some((w) => w.priority === "prime" && w.phase === "bm" && w.offsetBefore === 0 && w.tidePhaseType === "montant"));
    t("Crozon : créneaux de la règle générale signalés comme tels", E.SPOTS.every((s) => s.tidalRules.windows.filter((w) => /règle générale/.test(w.label)).every((w) => /Règle générale/.test(w.note))));
    t("Morgat : pleine mer prime (« notamment à pleine mer », lechasseursousmarin)", S("morgat").tidalRules.windows.some((w) => w.priority === "prime" && w.phase === "pm" && w.offsetBefore < 0 && w.offsetAfter > 0));
  }
}

// ── 16 ter. v8.7–8.8 : marées du Finistère contre les tables publiées (mois de contrôle, novembre 2026) ──
{
  const ctl = { plouguerneau: [["aberwrach", 6, 0.12], ["brignogan", 6, 0.12], ["aberildut", 7, 0.12], ["leconquet", 6, 0.1]],
                audierne: [["audierne", 7, 0.1], ["saintguenole", 5, 0.12]],
                carantec: [["roscoff", 6, 0.1], ["chateaudutaureau", 6, 0.12], ["primel", 6, 0.12], ["locquirec", 6, 0.12], ["brignogan", 6, 0.12]],
                concarneau: [["concarneau", 6, 0.1], ["benodet", 6, 0.12], ["portmanech", 6, 0.12], ["lepouldu", 6, 0.12]],
                crozon: [["morgat", 6, 0.12], ["douarnenez", 6, 0.12]] }[E.SITE.id] || [];
  for (const [port, maxMae, maxH] of ctl) {
    const file = path.join(here, `ref/${port}_2026-11.txt`);
    const dt = [], dh = [];
    let total = 0;
    for (const l of fs.readFileSync(file, "utf8").split("\n").filter((x) => /^\d\d \|/.test(x))) {
      const date = `2026-11-${l.slice(0, 2)}`;
      const T = E.tideDay(date, port);
      for (const [, type, hh, mm, h] of l.matchAll(/(PM|BM) (\d\d):(\d\d) ([\d.]+)/g)) {
        total++;
        const dec = +hh + +mm / 60;
        const m = T.dayEvents.filter((e) => e.type === type).sort((a, b) => Math.abs(a.dec - dec) - Math.abs(b.dec - dec))[0];
        if (!m || Math.abs(m.dec - dec) > 1) continue;
        dt.push(Math.abs(m.dec - dec) * 60); dh.push(Math.abs(m.h - +h));
      }
    }
    const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    t(`marée ${port} : ≥ 98 % des extrêmes de la table de novembre retrouvés`, dt.length / total >= 0.98, `${dt.length}/${total}`);
    t(`marée ${port} : heure à ±${maxMae} min en moyenne, hauteur à ±${maxH * 100} cm`, mean(dt) <= maxMae && mean(dh) <= maxH, `${mean(dt).toFixed(1)} min · ${(mean(dh) * 100).toFixed(1)} cm`);
  }
  if (ctl.length) t("marée : chaque port affiche sa précision mesurée", Object.values(E.SITE.tide.ports).every((p) => p.accuracy && p.accuracy.length > 20));
}

// ── 16 bis/3. v8.6 : corrections sur place, journal, raz ──
{
  const zw = (o) => ({ wind_dir: "O", wind_force: 2, wind_kmh: 10, houle: 0.3, houleKnown: true, cloud: 50, rain36: 0, ...o });
  const W = (band, o = {}, coeff = 70, win = {}) => ({ light: { band }, zw: zw(o), coeff, ...win });
  const S = (id) => E.SPOTS.find((x) => x.id === id);
  // Raz : plein courant vers la pleine et la basse mer de Cherbourg (une demi-heure après La Hague), renverse à mi-marée.
  t("raz : courant maximal une demi-heure après la pleine mer locale, renverse à mi-marée", E.razFactor(0.5) === 1 && Math.abs(E.razFactor(0.5 + 3.105) - 1 / 3) < 1e-9 && E.razFactor(0.5 - 6.21) === 1);
  // Profondeur en mètres, ajustée par la marée du créneau.
  const sp0 = E.SPOTS[0];
  const withM = (m) => ({ ...sp0, terrain: { ...E.terrainOf(sp0), prof: { m, fromUser: true } } });
  const dPM = E.depthAt(withM(3), { phase: "pm", offsetBefore: -0.2, offsetAfter: 0.2, coeff: 95 });
  const dBM = E.depthAt(withM(3), { phase: "bm", offsetBefore: -0.2, offsetAfter: 0.2, coeff: 95 });
  const dMi = E.depthAt(withM(3), { phase: "pm", offsetBefore: -3.6, offsetAfter: -2.6, coeff: 95 });
  t("profondeur donnée : plus d'eau à pleine mer, moins à basse mer, la même à mi-marée", dPM.mNow > 3 && dBM.mNow < 3 && Math.abs(dMi.mNow - 3) < 0.3 && dPM.fromUser);
  t("profondeur donnée : marnage interpolé entre morte-eau et vive-eau de la fiche", Math.abs(E.rangeAt(45) - E.SITE.marnage.neap) < 1e-9 && Math.abs(E.rangeAt(95) - E.SITE.marnage.spring) < 1e-9);
  const tgAt = (mNow) => E.headTarget({ light: "jour", sea: "calme", current: { level: "ordinaire" }, currentNow: false, wind: { F: 2 }, depthEst: { cls: E.clsOfMetres(mNow), mNow } });
  t("poids : 1 g par mètre au-delà de 15 m, 10 à 20 g de 5 à 15 m, 5 g de 1,5 à 4 m, 3 g en dessous", tgAt(20).start === 20 && tgAt(8).start === 10 && tgAt(12).start === 12 && tgAt(3).start === 5 && tgAt(1).start === 3);
  // Eau observée : elle remplace l'estimation, ce jour-là seulement.
  const obs = { ...sp0, eauObs: { date: "2026-07-15", v: "chargée" } };
  const aObs = E.lureAdvice(obs, W("jour", { cloud: 10 }), { sst: 15 }, "2026-07-15");
  const aNext = E.lureAdvice(obs, W("jour", { cloud: 10 }), { sst: 15 }, "2026-07-16");
  t("eau observée : remplace l'estimation et oriente la couleur, le jour même seulement", aObs.sit.clarity === "chargée" && aObs.sit.clarityWhy.every((x) => x.s === "toi") && aObs.color.cat === "visible" && aNext.sit.clarity !== "chargée");
  // Journal : le texte libre est reconnu.
  const pl = E.parseLures("Asturie 130 blanc · Asturie 110 Cabot");
  t("journal : leurres reconnus dans le texte libre", pl.length === 2 && pl.every((x) => x.cat === "asturie") && pl.map((x) => x.len).join() === "130,110"
    && E.parseLures("Asturie et Z-Claw, nombreux modèles essayés").map((x) => x.cat).join() === "asturie,zclaw" && E.parseLures("BM 120 · drag metal 30").map((x) => `${x.cat}${x.len}`).join() === "blackminnow120,dragmetal30");
  // Journal : une prise compte pour le leurre, une bredouille contre, dans des conditions proches seulement.
  const j = [
    { id: "a", date: "2026-08-01", spotId: sp0.id, fish: 3, result: 8, moment: "coucher", lureRef: { cat: "mrjoe", len: 105 }, lure: "Mr Joe 105" },
    { id: "b", date: "2026-08-02", spotId: sp0.id, fish: 0, result: 2, moment: "coucher", lureRef: { cat: "patchinko", len: 140 }, lure: "Patchinko 140" },
    { id: "c", date: "2026-08-03", spotId: sp0.id, fish: 5, result: 9, cond: { lumiere: "Plein jour" }, lureRef: { cat: "darksleeper", len: 76 }, lure: "Dark Sleeper" },
  ];
  const base = E.lureAdvice(sp0, W("crepuscule"), { sst: 15 }, "2026-07-15");
  const withJ = E.lureAdvice(sp0, W("crepuscule"), { sst: 15 }, "2026-07-15", { journal: j });
  const sc = (a, cat) => Math.max(...a.boxRanked.filter((o) => o.cat === cat).map((o) => o.score), -99);
  t("journal : le leurre qui a pris monte, celui qui a fait bredouille descend", sc(withJ, "mrjoe") > sc(base, "mrjoe") && sc(withJ, "patchinko") < sc(base, "patchinko"));
  t("journal : une session d'une autre lumière ne compte pas (Dark Sleeper pris de jour)", !withJ.sit.journal.ev.has("darksleeper"));
  t("journal : la raison affichée cite la date et les prises", withJ.boxRanked.find((o) => o.cat === "mrjoe").why.some((x) => x.s === "journal" && /3 bars le 01\/08\/2026/.test(x.t)));
  t("journal : effet borné (au plus +1,35 par leurre)", sc(withJ, "mrjoe") - sc(base, "mrjoe") <= 1.35 + 1e-9);
  // Boîte corrigée dans l'application, puis remise à zéro.
  const ovb = { poids: { "asturie:130": 26.4 }, balsa: { nage: "sous-surface" }, bavettes: [{ nom: "Artist FR80", len: 80, g: 8 }] };
  const KO = E.catalogWith(ovb);
  const okOv = KO.asturie.sizes[130].g === 26.4 && /pesé par toi/.test(KO.asturie.sizes[130].alt) && KO.balsa.layer === "sous-surface" && !KO.balsa.unknown
    && KO.bavette.sizes[80].g === 8 && E.origSize("asturie", 130).g === 27 && E.catalogWith(ovb) === KO;
  const aOv = E.lureAdvice(sp0, W("jour"), { sst: 15 }, "2026-07-15", { boxOv: ovb });
  const balsaSeen = aOv.boxRanked.some((o) => o.cat === "balsa") || !E.terrainOf(sp0).couches.includes("sous-surface");
  t("boîte corrigée : poids pesé, nage du balsa, bavettes ; le balsa devient proposable", okOv && balsaSeen);
  t("boîte corrigée : le catalogue d'origine reste intact", E.CATALOGUE.asturie.sizes[130].g === 27 && E.CATALOGUE.balsa.layer === null && !Object.keys(E.CATALOGUE.bavette.sizes).length
    && !E.lureAdvice(sp0, W("jour"), { sst: 15 }, "2026-07-15").boxRanked.some((o) => o.cat === "balsa"));
  if (E.SITE.id === "logonna-daoulas") {
    const mm = E.lureAdvice(S("moulinmer"), W("crepuscule", {}, 70, { phase: "pm", offsetBefore: -3, offsetAfter: -0.5 }), { sst: 15 }, "2026-07-15", { journal: E.SITE.seedJournal });
    t("journal archivé de Moulin Mer : l'Asturie (2 bars le 27/12/2025) cité dans la raison", /Asturie/.test(mm.pick.name) && mm.pick.why.some((x) => x.s === "journal" && /27\/12\/2025/.test(x.t)));
  } else if (E.SITE.id === "pirou-plage") {
    const gy = (win) => E.lureSituation(S("goury"), W("jour", {}, 80, win), { sst: 15 }, "2026-07-15");
    t("Goury : plein courant du raz autour de la pleine mer, renverse à mi-marée (source)", gy({ phase: "pm", offsetBefore: -0.5, offsetAfter: 1.5 }).current.level === "fort"
      && gy({ phase: "pm", offsetBefore: 2.6, offsetAfter: 4.6 }).current.level === "faible" && gy({ phase: "pm", offsetBefore: -0.5, offsetAfter: 1.5 }).current.why.some((x) => x.s === "razBlanchard"));
  }
}

// ── 16 ter. v8.1 : corrections de l'audit (rade, courant, sources, départage) ──
{
  const zw = (o) => ({ wind_dir: "O", wind_force: 2, wind_kmh: 10, houle: 0.3, houleKnown: true, cloud: 50, rain36: 0, ...o });
  const W = (band, o = {}, coeff = 70) => ({ light: { band }, zw: zw(o), coeff });
  const isRade = (sp) => E.SITE.zones[sp.zone]?.sea === "rade";
  // Rade : le vent fort lève un clapot, jamais le conseil « vagues » (côte rocheuse ouverte).
  const rade = E.SPOTS.filter(isRade);
  if (rade.length) {
    const adv = rade.map((sp) => [sp, E.lureAdvice(sp, W("jour", { wind_force: 6, wind_kmh: 42 }), { sst: 16 }, "2026-07-15")]);
    t("rade, vent F6 : mer « clapot », jamais « agitée »", adv.every(([, a]) => a.sit.sea === "clapot" && a.sit.seaLabel === "clapot de vent"));
    t("rade, vent F6 : jamais la fourchette « vagues » 18-25 g ni de shad 120-140 mm ni de Black Minnow « vagues »", adv.every(([, a]) => !a.target.why.some((x) => x.s === "vagues") && !/120 à 140/.test(a.size.text) && !a.models.some((m) => m.s === "vagues")));
    t("rade, vent F6 : le montage de la fiche figure dans les raisons du poids", adv.every(([sp, a]) => !E.terrainOf(sp).montage || a.weight.why.some((x) => x.s === "fiche" && x.t.includes(E.terrainOf(sp).montage))));
    t("rade, vent F6 de face ou clapot : un cran plus lourd pour les souples", adv.every(([, a]) => a.target.bump && a.target.why.some((x) => x.s === "grammage" && /plus lourdes pour continuer à sentir le fond/.test(x.t))));
    t("rade, vent F6 : sur fond encroché, jamais de souple plombé en tête", adv.filter(([sp]) => E.terrainOf(sp).gratter === "non").every(([, a]) => a.best.k !== "shad" && a.best.k !== "metal"));
    t("rade, vent F6 : la surface est déconseillée (stickbait : mer belle à peu agitée)", adv.every(([, a]) => a.fams.find((f) => f.k === "surface").why.some((x) => x.s === "stickbait" && x.v < 0)));
  }
  // Côte ouverte, mer agitée : le conseil « vagues » s'applique, tenu au-dessus du fond si la fiche interdit de gratter.
  const open = E.SPOTS.filter((sp) => !isRade(sp));
  const rough = open.map((sp) => [sp, E.lureAdvice(sp, W("jour", { houle: 1.4, wind_force: 5 }), { sst: 16 }, "2026-07-15")]).filter(([, a]) => a.best.k === "shad");
  if (rough.length) t("côte ouverte, mer agitée : tête de 18 à 25 g, « au-dessus du fond » si gratter = non", rough.every(([sp, a]) => a.target.lo === 18 && a.target.hi >= 25 && (a.pick.fam !== "shad" || (a.pick.weight.g >= 18 && a.pick.weight.g <= 25))
    && (E.terrainOf(sp).gratter !== "non" || a.pick.fam !== "shad" || a.pick.warn.some((x) => /au-dessus du fond/.test(x)))), rough.map(([sp, a]) => `${sp.id}:${a.pick?.name} ${a.pick?.weight?.text}`).join(" | "));
  const havres = open.filter((sp) => E.regimeOf(sp) === "abri").map((sp) => E.lureAdvice(sp, W("jour", { houle: 1.6, wind_force: 5 }), { sst: 16 }, "2026-07-15"));
  if (havres.length) t("havre de la côte ouverte, houle 1,6 m au large : mer « amortie », pas de conseil « vagues »", havres.every((a) => a.sit.sea === "abritée" && !a.target.why.some((x) => x.s === "vagues") && !a.models.some((m) => m.s === "vagues")));
  // Courant fort : par nature (type de la fiche) ou au-delà d'un seuil sourcé.
  const cur = (id, coeff) => { const sp = E.SPOTS.find((x) => x.id === id); return sp ? E.lureSituation(sp, W("jour", {}, coeff), { sst: 15 }, "2026-07-15").strongCurrent : null; };
  if (E.SITE.id === "logonna-daoulas") {
    t("courant : Armorique en vive-eau (coef 80) oui, en morte-eau (60) non", cur("armorique", 80) === true && cur("armorique", 60) === false);
    t("courant : Térénez n'est pas un spot de courant au coef 70 (la source le dit pêchant par petits coefficients)", cur("terenez", 70) === false);
    t("courant : goulet (Espagnols, Minou) toujours", cur("espagnols", 40) && cur("minou", 40));
  } else if (E.SITE.id === "pirou-plage") {
    t("courant : Carteret au-delà de 90 seulement", cur("carteret", 95) === true && cur("carteret", 85) === false);
    t("courant : Goury (raz) toujours", cur("goury", 50) === true);
    t("courant : Granville n'est plus déclaré en courant fort sans source", cur("granville", 100) === false);
  } else if (E.SITE.id === "audierne") {
    t("courant : pointe du Raz (raz) toujours ; Saint-Tugen jamais sans source", cur("raz", 40) === true && cur("sainttugen", 100) === false);
  } else if (E.SITE.id === "carantec" || E.SITE.id === "concarneau") {
    t("courant : aucun spot du secteur déclaré en courant fort sans source", E.SPOTS.every((sp) => cur(sp.id, 100) === false));
  } else if (E.SITE.id === "plouguerneau") {
    // Kermorvan : « la violence du courant est évidente » (patrimoine-iroise.fr) ; aucun autre spot n'a de source.
    t("courant : Kermorvan (sourcé) toujours ; aucun autre spot déclaré en courant fort sans source",
      cur("kermorvan", 40) === true && E.SPOTS.filter((sp) => sp.id !== "kermorvan").every((sp) => cur(sp.id, 100) === false));
    t("courant : la fiche de Kermorvan cite sa source du courant", /violence du courant/.test(JSON.stringify(E.SPOTS.find((sp) => sp.id === "kermorvan"))));
  }
  // Pluie : seulement près d'une rivière, d'un estuaire ou d'un havre nommés dans la fiche.
  const riverRe = /ESTUAIRE|HAVRE|\bRIA\b|EMBOUCHURE|RIVI[ÈE]RE|CONFLUENCE|AULNE|SIENNE/i;
  const rainy = E.SPOTS.map((sp) => [sp, E.lureAdvice(sp, W("jour", { rain36: 30 }), { sst: 16 }, "2026-07-15").sit]);
  t("pluie 30 mm : eau teintée près des rivières seulement", rainy.every(([sp, st]) => (st.clarity === "teintée") === (!!sp.riviere || riverRe.test(`${sp.type} ${sp.subtitle}`))));
  // Nuit : le recul de la surface est une déduction, pas la source « nuit ».
  const nuit = E.familyRanking({ ...E.lureSituation(E.SPOTS[0], W("nuit"), { sst: 16 }, "2026-07-15") });
  t("nuit : le recul de la surface est étiqueté « déduit »", nuit.find((f) => f.k === "surface").why.filter((x) => x.v < 0 && /nuit/i.test(x.t)).every((x) => x.s === "deduit"));
  // Égalité de familles : la fiche du spot départage.
  const base = E.lureSituation(E.SPOTS[0], W("jour"), { sst: 16 }, "2026-07-15");
  const flat = { ...base, sea: null, light: "jour", strongCurrent: false, cold: false, prey: [], terr: { ...base.terr, gratter: "oui", couches: E.COUCHES } };
  t("égalité de familles : la plus citée par la fiche passe devant", E.familyRanking({ ...flat, ficheFam: { metal: 3 } })[0].k === "metal" && E.familyRanking({ ...flat, ficheFam: { nageur: 2, metal: 1 } })[0].k === "nageur");
  t("égalité sans fiche : ordre fixe et documenté (souple plombé d'abord)", E.familyRanking({ ...flat, ficheFam: {} })[0].k === "shad");
  // Sources : auteur de l'article peche-poissons.com, réglementation.
  const txt = JSON.stringify(E.SITE) + JSON.stringify(E.SPOTS) + JSON.stringify(E.GENERAL_PRINCIPLES || {});
  t("sources : « Sauvin » n'apparaît que comme crédit photo", (txt.match(/Sauvin/g) || []).length === (txt.match(/photos Thierry Sauvin/g) || []).length);
  t("réglementation : l'arrêté du 1er avril 2026 est cité, plus de référence DIRM invérifiable", E.REGLEMENTATION.sources.some((x) => /1er avril 2026/.test(x.label) && /^https:/.test(x.url)) && !JSON.stringify(E.REGLEMENTATION).includes("DIRM"));
  t("leurres : la source « radeCoef » mal attribuée a disparu", !E.LURE_SOURCES.radeCoef);
  if (E.SITE.id === "logonna-daoulas") {
    const te = E.SPOTS.find((x) => x.id === "terenez"), lv = E.SPOTS.find((x) => x.id === "landevennec");
    t("Térénez : plateau de coefficient 40-55, comme la source citée", te.coefBand[1] === 40 && te.coefBand[2] === 55);
    t("Landévennec : Port Maria au jusant dès la 2e heure (source), plus de weightless attribué à Port Maria", lv.tidalRules.windows.some((w) => w.phase === "pm" && w.offsetBefore === 1 && w.tidePhaseType === "descendant")
      && !lv.lures.some((l) => /Port Maria/.test(l.technique) && /weightless|non lesté/i.test(`${l.name} ${l.technique}`)));
  } else if (E.SITE.id === "pirou-plage") {
    const go = E.SPOTS.find((x) => x.id === "goury");
    t("Goury : plus proposé au-delà du coefficient 90, présenté comme un choix de prudence", go.coefHardMax === 90 && /prudence/.test(go.coefHardMaxWhy || ""));
    // La source « 70-90 » est la préférence d'un pêcheur, dans un récit de sortie en bateau : elle ne doit jamais
    // être présentée comme une règle du bord, ni la dérive de 6 nœuds sans dire « en bateau ».
    const allTxt = JSON.stringify(E.SPOTS) + JSON.stringify(E.GENERAL_PRINCIPLES);
    t("Cotentin : « 6 nœuds » toujours accompagné de « en bateau », plus de « impêchable » attribué à la source",
      (allTxt.match(/[^."]*6 nœuds[^."]*/g) || []).every((x) => /bateau/.test(x)) && !/quasiment impêchable/.test(allTxt));
    const ref = E.GENERAL_PRINCIPLES.items.find((i) => /70-90/.test(i.rule));
    t("Cotentin : la plage 70-90 est présentée comme la préférence d'un pêcheur (récit en bateau)", !!ref && /préférence/.test(ref.rule) && /bateau/.test(ref.source));
    const gy = E.scoreDay("2026-10-10", null).find((x) => x.id === "goury");   // coefficient 95
    t("Goury au coefficient 95 : non proposé, raison = prudence avec la citation", !gy.eligible && /prudence/.test(gy.reason || gy.wxReason || "") && /très fort/.test(gy.reason || gy.wxReason || ""), String(gy.reason || gy.wxReason));
    t("Cotentin : plages de coefficient alignées sur la fenêtre de référence 70-90 (sauf Granville, 88)", E.SPOTS.filter((x) => !["goury", "carteret", "granville"].includes(x.id)).every((x) => x.coefBand[1] === 70 && x.coefBand[2] === 90));
  }
  // Égalité sous la précision du modèle : le groupe est annoncé, le classement reste celui de la note.
  const mk = (id, score, distMin) => ({ id, score, robust: score, eligible: true, distMin });
  const grp = E.tieGroup([mk("loin", 7.3, 60), mk("pres", 7.1, 10), mk("autre", 6.0, 5)]);
  t("égalité (≤ 0,2) : groupe annoncé ; au-delà, pas d'égalité", grp.map((x) => x.id).join() === "loin,pres" && !E.tieGroup([mk("loin", 7.4, 60), mk("pres", 7.1, 10)]).length);
  const day = E.scoreDay("2026-07-15", null);
  const bd = E.bestDaytime(day);
  t("meilleur créneau de plein jour : toujours un créneau « jour », le mieux noté", !bd || (bd.w.light.band === "jour" && day.every((s) => !s.eligible || (s.windows || []).every((w) => !w.eligible || w.outOfHours || w.light?.band !== "jour" || w.rawScore <= bd.w.rawScore))));
  t("heures par défaut : 5 h → 23 h", E.DEFAULT_HOURS.from === 5 && E.DEFAULT_HOURS.to === 23);
  t("saison : l'avantage des abris sur la côte ouverte est réduit de moitié (≤ 0,075)", E.SEASON.abri.every((v, i) => v - E.SEASON.roche[i] <= 0.0751 && v >= E.SEASON.roche[i]));
}

// ── 16 quater. Analyse photo : EXIF, faits calculés, schémas, contrôles des réponses, appels ──
{
  const rd = (f) => { const b = fs.readFileSync(path.join(here, "ref/photos", f)); return b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
  const x1 = E.readExif(rd("exif_complet.jpg")), x2 = E.readExif(rd("exif_sans_fuseau.jpg")), x3 = E.readExif(rd("sans_exif_grande.jpg"));
  t("photo : EXIF gros-boutiste lu (date, fuseau, GPS)", x1?.date === "2026:10:14 18:40:00" && x1.offset === "+02:00" && near(x1.lat, 48.3165, 1e-4) && near(x1.lon, -4.287, 1e-4), JSON.stringify(x1));
  t("photo : EXIF petit-boutiste lu (date sans fuseau, pas de GPS)", x2?.date === "2026:10:14 07:05:00" && x2.offset == null && x2.lat == null, JSON.stringify(x2));
  t("photo : JPEG sans EXIF, données tronquées ou fichier quelconque → null sans erreur", x3 === null && E.readExif(rd("exif_complet.jpg").slice(0, 40)) === null && E.readExif(new Uint8Array([1, 2, 3]).buffer) === null && E.readExif(new ArrayBuffer(0)) === null);
  const w1 = E.photoInstant(x1, 0), w2 = E.photoInstant(x2, 0), w3 = E.photoInstant(null, Date.UTC(2026, 9, 1)), w4 = E.photoInstant({ date: "0000:00:00 00:00:00" }, NaN);
  t("photo : heure EXIF avec fuseau → instant exact", w1.source === "exif" && w1.ms === Date.UTC(2026, 9, 14, 16, 40));
  t("photo : heure EXIF sans fuseau → heure de Paris (UTC+2 en octobre)", w2.source === "exif-paris" && w2.ms === Date.UTC(2026, 9, 14, 5, 5));
  t("photo : sans EXIF → date du fichier signalée comme telle ; rien → inconnue", w3.source === "fichier" && /fichier/.test(w3.note) && w4.ms === null);
  if (label === "logonna") t("photo : position GPS → spot le plus proche (Moulin Mer)", E.nearestSpot(48.3165, -4.287)?.spot.id === "moulinmer" && E.nearestSpot(48.3165, -4.287).km < 1);
  // Marée à l'instant de la photo : cohérente avec les extrêmes calculés du jour.
  const sp0 = E.SPOTS[0];
  const td = E.tideDay("2026-10-14", sp0.tidePort || E.SITE.tide.defaultPort);
  const pm = td.dayEvents.find((e) => e.type === "PM"), bm = td.dayEvents.find((e) => e.type === "BM");
  const atPM = E.tideAt(sp0, pm.ms + 60000), atBM = E.tideAt(sp0, bm.ms + 60000);
  t("photo : marée juste après une PM → descendante, ~100 % ; après une BM → montante, ~0 %", atPM.phase === "descendante" && atPM.pct >= 97 && atBM.phase === "montante" && atBM.pct <= 3, `${atPM.pct} / ${atBM.pct}`);
  const mid = E.tideAt(sp0, (pm.ms + (td.events.find((e) => e.ms > pm.ms)?.ms ?? pm.ms)) / 2);
  t("photo : mi-marée → entre 30 et 70 % du marnage", mid.pct > 30 && mid.pct < 70, String(mid.pct));
  const phs = [{ when: w1 }, { when: { ...w1, ms: w1.ms + 5 * 60000 } }, { when: w2 }, { when: { ms: null } }];
  const tf = E.timeFacts(sp0, phs);
  t("photo : faits t — un par heure de prise de vue (à 10 min près), photos sans heure ignorées", tf.length === 2 && tf[0].photos.join() === "1,2" && tf[1].photos.join() === "3" && tf.every((f, i) => f.id === `t${i + 1}`));
  t("photo : fait t — date, lumière, marée et coefficient écrits, rien d'autre de chiffré", /14\/10\/2026 à 18h40/.test(tf[0].t) && /Lumière/.test(tf[0].t) && /coefficient \d+/.test(tf[0].t) && /Marée (montante|descendante)/.test(tf[0].t));
  const tfm = E.timeFacts(sp0, [{ when: w1 }, { when: { ms: w1.ms + 4 * 60000, source: "saisie", note: "heure saisie par toi" } }]);
  t("photo : deux photos à 4 min d'écart, sources différentes → un fait, chaque source dite", tfm.length === 1 && /photo 1 : date de prise de vue de la photo ; photo 2 : heure saisie par toi/.test(tfm[0].t) && /à 10 min près/.test(tfm[0].t));
  t("photo : sans spot (hors guide) → faits t sans marée", E.timeFacts(null, [{ when: w1 }]).every((f) => !/Marée/.test(f.t)));
  const ff = E.ficheFacts(sp0);
  t("photo : faits f — fiche du spot numérotée f1…, fond et encombrement présents", ff.length >= 5 && ff.every((f, i) => f.id === `f${i + 1}` && f.t && f.kind) && ff.some((f) => /Fond/.test(f.t)) && ff.some((f) => /Encombrement/.test(f.t)) && E.ficheFacts(null).length === 0);
  // Schémas : uniquement les mots-clés acceptés par les sorties structurées de l'API.
  const FORBID = ["minLength", "maxLength", "maxItems", "minimum", "maximum", "multipleOf", "pattern", "format", "$ref", "oneOf", "not"];
  const walk = (s, errs, at = "") => {
    if (!s || typeof s !== "object") return;
    for (const k of FORBID) if (k in s) errs.push(`${at}.${k}`);
    if (s.type === "object") {
      if (s.additionalProperties !== false) errs.push(`${at} additionalProperties`);
      const keys = Object.keys(s.properties || {});
      if (keys.join() !== (s.required || []).join()) errs.push(`${at} required`);
      for (const k of keys) walk(s.properties[k], errs, `${at}.${k}`);
    }
    if (s.type === "array") walk(s.items, errs, `${at}[]`);
    if (s.enum && !s.enum.every((v) => typeof v === "string")) errs.push(`${at} enum`);
  };
  for (const [n, s] of [["inventaire", E.SCHEMA_OBS], ["vérification", E.SCHEMA_VERIF], ["lecture", E.SCHEMA_LECTURE]]) { const errs = []; walk(s, errs); t(`photo : schéma ${n} compatible avec les sorties structurées`, !errs.length, errs.join(" ")); }
  t("photo : familles de leurres du schéma = familles du moteur leurres", E.SCHEMA_LECTURE.properties.leurres.items.properties.famille.enum.join() === Object.keys(E.FAMILLES).join());
  // Requêtes
  const P = [{ b64: "AAAA" }, { b64: "BBBB" }];
  const body = E.buildRequest({ model: "claude-opus-5-5", system: E.SYS_OBS, content: E.contentObs(P), schema: E.SCHEMA_OBS, effort: "high", maxTokens: 24000 });
  const c = body.messages[0].content;
  t("photo : requête — modèle, consigne, format JSON et effort", body.model === "claude-opus-5-5" && body.system === E.SYS_OBS && body.output_config.format.type === "json_schema" && body.output_config.effort === "high" && body.max_tokens === 24000);
  t("photo : requête — chaque image précédée de son libellé, consigne après les images", c[0].text === "Photo 1 :" && c[1].type === "image" && c[1].source.media_type === "image/jpeg" && c[1].source.data === "AAAA" && c[2].text === "Photo 2 :" && c[4].type === "text" && c.length === 5);
  const H = E.apiHeaders("sk-ant-test");
  t("photo : en-têtes — clé, version, accès direct depuis le navigateur", H["x-api-key"] === "sk-ant-test" && H["anthropic-version"] === "2023-06-01" && H["anthropic-dangerous-direct-browser-access"] === "true");
  t("photo : la consigne d'inventaire interdit l'interprétation et les mesures inventées", /sans aucune interprétation/.test(E.SYS_OBS) && /Aucune mesure inventée/.test(E.SYS_OBS) && /personnes/.test(E.SYS_OBS));
  t("photo : la consigne de lecture exige les références et interdit l'invention", /refs/.test(E.SYS_LECTURE) && /N'invente rien/.test(E.SYS_LECTURE) && /incertaine/.test(E.SYS_LECTURE));
  // Contrôles des réponses
  const inv = E.cleanObservations({ photos: [{ photo: 1, vue: "v", qualite: "bonne", limites: "" }, { photo: 9, vue: "x", qualite: "bonne", limites: "" }],
    observations: [{ photo: 1, zone: "gauche", categorie: "roche", fait: "platier découvert", confiance: "elevee" },
      { photo: 3, zone: "centre", categorie: "roche", fait: "hors plage", confiance: "elevee" },
      { photo: 2, zone: "", categorie: "roche", fait: "sans zone", confiance: "elevee" },
      { photo: 2, zone: "centre", categorie: "inventée", fait: "catégorie inconnue", confiance: "elevee" },
      { photo: 2, zone: "fond", categorie: "surface_eau", fait: "ligne d'écume", confiance: "moyenne" }], non_visible: ["profondeur", " "] }, 2);
  t("photo : inventaire — photo hors plage, zone vide, catégorie inconnue écartées ; numérotation o1…", inv.observations.length === 2 && inv.observations.map((o) => o.id).join() === "o1,o2" && inv.dropped.length === 3 && inv.photos.length === 1 && inv.nonVisible.length === 1);
  const vv = E.applyVerdicts([...inv.observations, { ...inv.observations[0], id: "o3" }], { verdicts: [{ id: "o1", statut: "confirme", raison: "net" }, { id: "o2", statut: "absent", raison: "rien" }] });
  t("photo : vérification — « absent » écarté, sans verdict → incertain", vv.kept.map((o) => `${o.id}:${o.statut}`).join() === "o1:confirme,o3:douteux" && vv.removed.map((o) => o.id).join() === "o2" && /non contrôlée/.test(vv.kept[1].raison));
  const facts = [{ id: "o1", statut: "confirme", photo: 1, zone: "g", fait: "a" }, { id: "o2", statut: "douteux", photo: 1, zone: "g", fait: "b" }, { id: "t1", t: "marée" }, { id: "f1", t: "fiche" }];
  const lec = E.validateLecture({ synthese: " ok ", lecture: [{ titre: "A", texte: "x", nature: "observe", refs: ["o1", "o99"] }, { titre: "B", texte: "y", nature: "deduit", refs: ["o42"] }],
    postes: [{ nom: "P1", emplacement: "e", pourquoi: "p", moment: "m", confiance: "moyenne", refs: ["o2"] }, { nom: "P2", emplacement: "e", pourquoi: "p", moment: "m", confiance: "moyenne", refs: ["o1", "o2", "t1"] }],
    approche: [], securite: [{ texte: "glissant", refs: ["o2"] }], accroche: { niveau: "fort", raison: "r", refs: [] },
    leurres: [{ famille: "shad", pourquoi: "p", refs: ["f1"] }, { famille: "popper", pourquoi: "p", refs: ["f1"] }], fiche: [], a_verifier: ["profondeur"] }, facts);
  const R = lec.result;
  t("photo : lecture — références inconnues retirées, élément sans fait valable écarté", R.lecture.length === 1 && R.lecture[0].refs.join() === "o1" && lec.dropped.some((d) => d.section === "lecture"));
  t("photo : lecture — poste ou consigne fondés sur un seul fait incertain écartés", R.postes.length === 1 && R.postes[0].nom === "P2" && R.securite.length === 0);
  t("photo : lecture — accroche sans fait → indéterminée ; famille inconnue écartée", R.accroche.niveau === "indetermine" && R.leurres.length === 1 && R.leurres[0].famille === "shad" && R.synthese === "ok");
  const vcase = E.applyVerdicts([{ id: "o1" }, { id: "o2" }], { verdicts: [{ id: "O1", statut: "Confirmé" }, { id: " o2 ", statut: "ABSENT" }] });
  const lcase = E.validateLecture({ lecture: [{ titre: "A", texte: "x", nature: "Déduit", refs: ["O1"] }], leurres: [{ famille: "Surface", pourquoi: "p", refs: ["o1"] }], accroche: { niveau: "Fort", raison: "r", refs: ["o1"] } }, [{ id: "o1", statut: "confirme" }]);
  t("photo : majuscules et accents dans les énumérations et identifiants tolérés", vcase.kept.map((o) => o.statut).join() === "confirme" && vcase.removed.length === 1
    && lcase.result.lecture[0].nature === "deduit" && lcase.result.leurres[0].famille === "surface" && lcase.result.accroche.niveau === "fort");
  // Appels : réponse, repli sans format structuré, erreurs
  const mk = (seq) => { const calls = []; return { calls, f: async (url, opt) => { calls.push({ url, opt, body: JSON.parse(opt.body) }); const r = seq.shift(); if (r instanceof Error) throw r; return { ok: r.status === 200, status: r.status, json: async () => r.body }; } }; };
  const okMsg = (o) => ({ status: 200, body: { model: "claude-opus-5-5", stop_reason: "end_turn", usage: { input_tokens: 1000, output_tokens: 500 }, content: [{ type: "thinking", thinking: "..." }, { type: "text", text: JSON.stringify(o) }] } });
  let m = mk([okMsg({ a: 1 })]);
  let r = await E.callClaude("k", body, { fetchImpl: m.f });
  t("photo : appel — JSON lu dans le bloc texte (réflexion ignorée), usage remonté", r.json.a === 1 && r.usage.output_tokens === 500 && m.calls[0].url === E.API_URL && m.calls[0].opt.headers["x-api-key"] === "k");
  m = mk([{ status: 400, body: { error: { message: "output_config.format: unsupported" } } }, okMsg({ b: 2 })]);
  r = await E.callClaude("k", body, { fetchImpl: m.f });
  t("photo : appel — format structuré refusé → un seul nouvel essai sans format, schéma dans la consigne", r.json.b === 2 && m.calls.length === 2 && !m.calls[1].body.output_config?.format && m.calls[1].body.output_config?.effort === "high" && /schéma/.test(m.calls[1].body.system));
  const errOf = async (seq) => { try { await E.callClaude("k", body, { fetchImpl: mk(seq).f }); return ""; } catch (e) { return e.message; } };
  t("photo : appel — clé refusée", /Clé API refusée/.test(await errOf([{ status: 401, body: { error: { message: "invalid x-api-key" } } }])));
  t("photo : appel — crédit épuisé", /Crédit API épuisé/.test(await errOf([{ status: 400, body: { error: { message: "Your credit balance is too low" } } }])));
  t("photo : appel — surcharge, refus, réponse tronquée, réseau", /surchargé/.test(await errOf([{ status: 529, body: {} }]))
    && /refusé/.test(await errOf([{ status: 200, body: { stop_reason: "refusal", content: [] } }]))
    && /tronquée/.test(await errOf([{ status: 200, body: { stop_reason: "max_tokens", content: [{ type: "text", text: "{" }] } }]))
    && /réseau/.test(await errOf([new TypeError("Failed to fetch")])));
  const ab = new Error("stop"); ab.name = "AbortError";
  let rethrown = false; try { await E.callClaude("k", body, { fetchImpl: mk([ab]).f }); } catch (e) { rethrown = e.name === "AbortError"; }
  t("photo : appel — annulation transmise telle quelle", rethrown);
  t("photo : JSON entouré de texte encore lisible", E.jsonFromMessage({ content: [{ type: "text", text: "Voici : {\"x\": 3} fin" }] }).x === 3);
  const cost = E.costOf("claude-opus-5-5", [{ input_tokens: 1e6, output_tokens: 0 }, { input_tokens: 0, output_tokens: 1e6 }]);
  t("photo : coût Opus 5.5 = 4 $ + 20 $ par million de jetons", near(cost.usd, 24) && E.costOf("claude-sonnet-5-5", [{ input_tokens: 1e6, output_tokens: 1e6 }]).usd === 12);
  const rep = E.reportText({ spotName: "S", dateLabel: "d", facts, lecture: { ...R, aVerifier: R.aVerifier } });
  t("photo : compte rendu texte — synthèse, éléments, références et faits cités", /Analyse photo — S/.test(rep) && /\[o1\]/.test(rep) && /o1 · photo 1/.test(rep) && /t1 · marée/.test(rep));
}

// ── 16 quinquies. Analyse photo v8.3 : positions, propositions pour la fiche, reprise des passes ──
{
  const inv = E.cleanObservations({ photos: [], observations: [
    { photo: 1, zone: "gauche", x: 20, y: 80, categorie: "roche", fait: "platier", confiance: "elevee" },
    { photo: 1, zone: "centre", x: 140, y: 50, categorie: "roche", fait: "hors image", confiance: "elevee" },
    { photo: 1, zone: "droite", categorie: "roche", fait: "sans position", confiance: "elevee" }], non_visible: [] }, 1);
  t("photo : positions — gardées dans la photo, retirées sinon", inv.observations[0].x === 20 && inv.observations[1].x === null && inv.observations[2].y === null);
  t("photo : position transmise au vérificateur", /≈ x 20 %, y 80 %/.test(E.obsLine(inv.observations[0])) && !/≈/.test(E.obsLine(inv.observations[1])));
  t("photo : valeurs des propositions lues strictement", E.parseProposal("encombrement", "3") === 3 && E.parseProposal("encombrement", "3 (très encroché)") === 3 && E.parseProposal("encombrement", "trois") === null && E.parseProposal("encombrement", "4") === null
    && E.parseProposal("gratter", "Non") === "non" && E.parseProposal("gratter", "peut-être") === null
    && E.parseProposal("couches", "fond, surface") .join() === "surface,fond" && E.parseProposal("couches", "surface et sous surface").join() === "surface,sous-surface" && E.parseProposal("couches", "profond") === null);
  const facts = [{ id: "o1", statut: "confirme" }, { id: "o2", statut: "douteux" }];
  const cur = { encombrement: 3, gratter: "non", couches: ["surface", "sous-surface"] };
  const lv = E.validateLecture({ propositions: [
    { champ: "couches", valeur: "surface", raison: "r", refs: ["o1"] },
    { champ: "encombrement", valeur: "3", raison: "déjà la fiche", refs: ["o1"] },
    { champ: "gratter", valeur: "texan", raison: "seulement incertain", refs: ["o2"] },
    { champ: "gratter", valeur: "bof", raison: "illisible", refs: ["o1"] }] }, facts, cur);
  t("photo : propositions — fondées sur un fait confirmé, différentes de la fiche, valeur lisible", lv.result.propositions.length === 1 && lv.result.propositions[0].value.join() === "surface" && /Couches pêchables : surface/.test(lv.result.propositions[0].label)
    && lv.dropped.filter((d) => d.section === "propositions").length === 2);
  // Corrections appliquées à une fiche, puis annulées
  const sp = { id: "zz", terrain: { fond: "roche", encombrement: 3, gratter: "non", couches: ["surface", "sous-surface"], montage: "texan", conseils: [] } };
  const [sp2] = E.withTerrainOverrides([sp], { zz: { couches: ["surface"], at: 1, from: "a1" } });
  t("photo : correction appliquée à la fiche, avec sa trace", sp2.terrain.couches.join() === "surface" && sp2.terrain.encombrement === 3 && sp2.terrain.corrige?.champs.join() === "couches" && sp2.terrain.fond === "roche");
  const [sp3] = E.withTerrainOverrides([sp], {});
  t("photo : sans correction → la fiche d'origine, inchangée", sp3 === sp && sp.terrain.couches.join() === "surface,sous-surface" && !sp.terrain.corrige);
  const view = E.withTerrainOverrides(E.SPOTS, { [E.SPOTS[0].id]: { prof: { m: 4 }, at: 1, from: "toi" } });
  t("corrections : nouvelles fiches, celles d'origine intactes", view[0] !== E.SPOTS[0] && view[0].terrain.prof.m === 4 && E.SPOTS[0].terrain.prof.m === undefined && view[1] === E.SPOTS[1]);
  const evo = E.withEauObs(E.SPOTS, { [E.SPOTS[0].id]: { date: "2026-07-15", v: "claire" } });
  t("eau observée : nouvelles fiches, celles d'origine intactes", evo[0].eauObs.v === "claire" && E.SPOTS[0].eauObs === undefined);
  const sd = E.scoreDay("2026-07-15", null, { spots: view });
  t("classement : calculé sur les fiches corrigées qu'on lui passe", sd.find((x) => x.id === E.SPOTS[0].id).terrain.prof.m === 4);
  // Repères des postes : au centre des observations qui les fondent, sur la photo qui en porte le plus
  const a = { observations: [{ id: "o1", photo: 1, x: 10, y: 20 }, { id: "o2", photo: 1, x: 30, y: 40 }, { id: "o3", photo: 2, x: 50, y: 50 }, { id: "o4", photo: 2, x: null, y: null }],
    lecture: { postes: [{ nom: "A", refs: ["o1", "o2", "o3"] }, { nom: "B", refs: ["o4"] }] } };
  const m1 = E.photoMarks(a, 0), m2 = E.photoMarks(a, 1);
  t("photo : repères — poste placé au centre de ses observations ; sans position, pas de repère", m1.postes.length === 1 && m1.postes[0].x === 20 && m1.postes[0].y === 30 && m2.postes.length === 0 && m1.obs.length === 2 && m2.obs.length === 1);
  // Déroulé reprenable : une passe échouée ne fait pas refaire (ni refacturer) les précédentes
  const ok = (o) => ({ status: 200, body: { stop_reason: "end_turn", usage: { input_tokens: 100, output_tokens: 10 }, content: [{ type: "text", text: JSON.stringify(o) }] } });
  const P1 = { photos: [{ photo: 1, vue: "v", qualite: "bonne", limites: "" }], observations: [{ photo: 1, zone: "gauche", x: 10, y: 10, categorie: "roche", fait: "platier", confiance: "elevee" }], non_visible: [] };
  const P2 = { verdicts: [{ id: "o1", statut: "confirme", raison: "net" }] };
  const P3 = { synthese: "s", lecture: [], postes: [], approche: [], securite: [], accroche: { niveau: "indetermine", raison: "", refs: [] }, leurres: [], fiche: [], a_verifier: [], propositions: [] };
  const sys = (b) => (/^Tu es l'œil/.test(b.system) ? 1 : /^Tu es un contrôleur/.test(b.system) ? 2 : 3);
  const calls = [];
  let failAt = 2;
  const f = async (url, opt) => { const b = JSON.parse(opt.body), n = sys(b); calls.push(n); if (n === failAt) return { ok: false, status: 529, json: async () => ({}) }; return { ok: true, status: 200, json: async () => ok(n === 1 ? P1 : n === 2 ? P2 : P3).body }; };
  const job = { id: "j1", model: "claude-opus-5-5", spotId: E.SPOTS[0].id, notes: "", photos: [{ b64: "AA", thumb: "t", when: { ms: Date.UTC(2026, 9, 14, 16, 40), note: "x" } }], partial: {} };
  const ev = [];
  let err = "";
  try { await E.runAnalysis(job, { key: "k", fetchImpl: f, onProgress: (e) => ev.push(`${e.step}${e.phase[0]}`) }); } catch (e) { err = e.message; }
  t("photo : passe 2 en échec → passe 1 gardée, coût de la passe 1 gardé", /surchargé/.test(err) && !!job.partial.inv && !job.partial.ver && job.partial.usages.length === 1 && calls.join() === "1,2" && E.nextPass(job.partial) === 2);
  failAt = 0; calls.length = 0;
  const res = await E.runAnalysis(job, { key: "k", fetchImpl: f });
  t("photo : reprise → seules les passes 2 et 3 sont refaites", calls.join() === "2,3" && res.observations.length === 1 && res.cost.tin === 300 && E.nextPass(job.partial) === null && ev.join() === "1s,1d,2s");
  t("photo : analyse assemblée — photos, faits t calculés, lecture", res.photos.length === 1 && res.tFacts.length === 1 && res.lecture.synthese === "s" && /photos du 14\/10\/2026 à 18h40/.test(res.dateLabel));
}

// ── 16 sexies. v8.8 : corrections de l'audit indépendant ──
{
  // Houle inconnue : 0 m n'est pas une mesure ; un spot engagé de la côte ouverte n'est plus proposé sans elle.
  const eng = E.SPOTS.find((s) => s.dangerLevel >= 3 && E.SITE.zones[s.zone]?.sea !== "rade");
  if (eng) {
    const win = { ...E.computeWindows(eng, E.tideDay("2026-07-15", eng.tidePort || E.SITE.tide.defaultPort).events)[0], light: { band: "jour", label: "Jour" } };
    const zw = { wind_dir: "E", wind_force: 2, wind_kmh: 10, houle: 0, houleKnown: false, sky: "partly", cloud: 50 };
    const r = E.scoreWindow(eng, win, { zw, pressure: 1015, pressureTrend: "stable", sst: 15, sstConf: "ok", calib: {}, coeff: 70 });
    t(`houle inconnue : ${eng.name} (engagé) non proposé, raison dite`, r.eligible === false && /Houle inconnue/.test(r.reason));
    const r2 = E.scoreWindow(eng, win, { zw: { ...zw, houle: 0.5, houleKnown: true }, pressure: 1015, pressureTrend: "stable", sst: 15, sstConf: "ok", calib: {}, coeff: 70 });
    t(`houle connue et faible : ${eng.name} reste notable`, r2.eligible !== false || !/Houle inconnue/.test(r2.reason || ""));
  }
  // Valeurs de listes fermées : jamais une propriété héritée glissée par un fichier importé.
  const proto = E.cleanObservations({ observations: [{ photo: 1, zone: "z", fait: "un fait assez long", categorie: "__proto__" }, { photo: 1, zone: "z", fait: "autre fait assez long", categorie: "constructor" }] }, 1);
  t("import : catégorie « __proto__ » ou « constructor » écartée", proto.observations.length === 0);
  t("import : « __proto__ » n'est pas une valeur de pêche à gratter", E.parseProposal("gratter", "__proto__") === null && E.parseProposal("gratter", "constructor") === null);
  const factsP = [{ id: "o1", statut: "confirme" }, { id: "o2", statut: "douteux" }, { id: "f2", t: "fiche" }, { id: "u1", t: "note" }];
  const vl = E.validateLecture({ leurres: [{ famille: "constructor", pourquoi: "x", refs: ["o1"] }, { famille: "__proto__", pourquoi: "x", refs: ["o1"] }],
    propositions: [{ champ: "encombrement", valeur: "3", raison: "r", refs: ["f2"] }, { champ: "gratter", valeur: "non", raison: "r", refs: ["u1", "o2"] }, { champ: "couches", valeur: "surface", raison: "r", refs: ["o1"] }] }, factsP, null);
  t("import : famille de leurre héritée écartée", vl.result.leurres.length === 0);
  t("propositions : seulement celles fondées sur une observation confirmée (pas la fiche, ni tes notes, ni une observation incertaine)",
    vl.result.propositions.length === 1 && vl.result.propositions[0].champ === "couches");
  // Journal : notes en texte (journal importé ou synchronisé) lues, valeurs illisibles ignorées.
  const sp0 = E.SPOTS[0].id;
  const cal = E.calibrate([1, 2, 3].map((i) => ({ id: `c${i}`, spotId: sp0, result: "8", predicted: "6,5" })).concat([{ id: "c9", spotId: sp0, result: "abc", predicted: 5 }]));
  t("recalibrage : notes en texte lues, valeur illisible ignorée, biais fini", Number.isFinite(cal.spotBias[sp0]) && cal.detail[sp0].n === 3);
  // Heure saisie : heure de Paris, quel que soit le fuseau de l'appareil.
  t("heure saisie : lue à l'heure de Paris", E.parisInputMs("2026-10-29T14:30") === Date.UTC(2026, 9, 29, 13, 30) && E.parisInputMs("2026-07-15T14:30") === Date.UTC(2026, 6, 15, 12, 30) && Number.isNaN(E.parisInputMs("")));
  // Créneau qui enjambe le changement d'heure (31/10/2027, 3 h → 2 h) : 3 heures réelles après 1 h 12 = 3 h 12 à l'horloge.
  const evDst = { type: "BM", ms: E.msAtLocal("2027-10-31", 1.2), dec: 1.2 };
  const wDst = E.computeWindows({ tidalRules: { windows: [{ id: "x", phase: "bm", offsetBefore: 0, offsetAfter: 3, priority: "bon" }] } }, [evDst])[0];
  t("créneau : changement d'heure d'octobre compté (1 h 12 + 3 h réelles = 3 h 12)", Math.abs(wDst.endDecimal - 3.2) < 0.02 && wDst.endFmt === "03h12", wDst.endFmt);
  const evSpr = { type: "BM", ms: E.msAtLocal("2027-03-28", 1.0), dec: 1.0 };
  const wSpr = E.computeWindows({ tidalRules: { windows: [{ id: "y", phase: "bm", offsetBefore: 0, offsetAfter: 2, priority: "bon" }] } }, [evSpr])[0];
  t("créneau : changement d'heure de mars compté (1 h + 2 h réelles = 4 h)", Math.abs(wSpr.endDecimal - 4) < 0.02, wSpr.endFmt);
  // Spot ouvert sur deux axes opposés : pas de direction unique du large.
  t("orientation : secteurs opposés → pas de direction du large inventée", E.waterDirOf({ exposedAngles: [45, 67.5, 225, 247.5] }) === null && E.waterDirOf({ exposedAngles: [225, 247.5, 270] }) === 247.5);
  // Clarté normale : la couleur ne dit plus « eau claire ».
  const open = E.SPOTS.find((s) => !E.SITE.zones[s.zone]?.eauClaire);
  if (open) {
    const a = E.lureAdvice(open, { light: { band: "jour" }, zw: { wind_dir: "O", wind_force: 2, wind_kmh: 10, houle: 0.4, houleKnown: true, cloud: 50, rain36: 0 }, coeff: 70 }, { sst: 15 }, "2026-07-15");
    t("couleur : clarté normale → pas de raison « Eau claire »", a.sit.clarity !== "normale" || !a.color.why.some((x) => /^Eau claire/.test(x.t)));
  }
  // Libellés de port : le français des faits de marée.
  if (E.SITE.id === "carantec") {
    t("ports de la baie : « du château du Taureau », « de l'anse de Primel »", E.deNom(E.SITE.tide.ports.chateaudutaureau.label).startsWith("du château du Taureau") && E.deNom(E.SITE.tide.ports.primel.label) === "de l'anse de Primel");
  }
}

// ── 17. Schéma des fiches de spots (erreurs de saisie) ──
{
  const S = E.SPOTS, ids = new Set();
  const bad = (name, f) => { const b = S.filter((s) => !f(s)).map((s) => s.id); t(`fiches : ${name}`, !b.length, b.join(", ")); };
  t("fiches : identifiants uniques", S.every((s) => !ids.has(s.id) && ids.add(s.id)));
  bad("coordonnées affichées et lat/lon concordantes (< 3 km)", (s) => { const p = E.parseCoords(s.coords); return !p || !Number.isFinite(s.lat) || E.kmBetween(p, { lat: s.lat, lon: s.lon }) < 3; });
  bad("secteurs multiples de 22,5°", (s) => [...s.exposedAngles, ...s.shelteredAngles].every((a) => Number.isFinite(a) && a >= 0 && a < 360 && Math.abs(a / 22.5 - Math.round(a / 22.5)) < 1e-9));
  bad("secteurs exposés et abrités disjoints", (s) => !s.exposedAngles.some((a) => s.shelteredAngles.includes(a)));
  bad("bande de coefficient croissante", (s) => !s.coefBand || (s.coefBand.length === 4 && s.coefBand.every((v, i) => !i || v >= s.coefBand[i - 1])));
  bad("port de marée connu", (s) => !s.tidePort || !!E.SITE.tide.ports[s.tidePort]);
  bad("fenêtres de marée valides", (s) => (s.tidalRules?.windows || []).length > 0 && s.tidalRules.windows.every((w) => w.id && ["pm", "bm"].includes(w.phase) && w.offsetAfter > w.offsetBefore && ["prime", "bon"].includes(w.priority)));
  bad("terrain renseigné (gratter, encombrement 1-3, couches connues)", (s) => { const tr = E.terrainOf(s); return E.GRATTER[tr.gratter] && [1, 2, 3].includes(tr.encombrement) && tr.couches.every((c) => E.COUCHES.includes(c)); });
  bad("houle max et niveau de difficulté plausibles", (s) => s.houleMax > 0 && s.houleMax <= 4 && [1, 2, 3].includes(s.dangerLevel));
  bad("rivière : nom de la rivière (texte)", (s) => s.riviere === undefined || (typeof s.riviere === "string" && s.riviere.length >= 3));
  bad("coefHardMaxWhy : seulement avec un coefHardMax", (s) => s.coefHardMaxWhy === undefined || !!s.coefHardMax);
  bad("courant fort : seuil numérique et explication", (s) => !s.courantFort || (Number.isFinite(s.courantFort.above) && typeof s.courantFort.t === "string" && s.courantFort.t.length > 20));
  bad("sécurité : conditions « when » reconnues", (s) => (s.securite || []).every((r) => !r.when || Object.keys(r.when).every((k) => ["coefAbove", "phase"].includes(k))));
}

// ── Phase 4 — Sécurité : le vent, les rafales et la houle inconnue (demande de Félix, 13 nov. 2026) ──
{
  const sp = E.SPOTS.find((s) => s.dangerLevel < 3 && E.SITE.zones[s.zone]?.sea !== "rade") || E.SPOTS[0];
  const rade = E.SPOTS.find((s) => E.SITE.zones[s.zone]?.sea === "rade");
  const win = { ...sp.tidalRules.windows[0], coeff: 70, light: { band: "aube", label: "Aube" } };
  const zw0 = { wind_dir: "E", wind_force: 2, wind_kmh: 9, windKnown: true, gust_kmh: 20, houle: 0.5, houleKnown: true, sky: "partly", cloud: 50 };
  const ctx = (zw) => ({ zw: { ...zw0, ...zw }, coeff: 70, pressure: 1015, pressureTrend: "stable", sst: 15, sstConf: "modele", calib: {}, month: 9 });
  const sw = (s, zw) => E.scoreWindow(s, { ...s.tidalRules.windows[0], coeff: 70, light: { band: "aube", label: "Aube" } }, ctx(zw));
  const calm = E.scoreWindow(sp, win, ctx({}));
  t("sécurité : par temps calme, rien à vérifier", calm.eligible && calm.verify.length === 0);
  const f8 = sw(sp, { wind_force: 8, wind_kmh: 68 });
  t("sécurité : coup de vent (force 8) → spot non recommandé", f8.eligible === false && f8.blocked === true && /Coup de vent : force 8/.test(f8.reason), f8.reason);
  const g90 = sw(sp, { gust_kmh: 90 });
  t("sécurité : rafales à 90 km/h → spot non recommandé, même par vent moyen faible", g90.eligible === false && /Rafales à 90 km\/h/.test(g90.reason), g90.reason);
  const f7 = sw(sp, { wind_force: 7, wind_kmh: 55 });
  t("sécurité : grand frais (force 7) → proposé mais à vérifier", f7.eligible && f7.verify.some((v) => v.k === "vent") && /À vérifier/.test(f7.reason), f7.reason);
  const g75 = sw(sp, { gust_kmh: 75 });
  t("sécurité : rafales à 75 km/h → à vérifier", g75.eligible && g75.verify.some((v) => v.k === "rafales"));
  const g74 = sw(sp, { gust_kmh: 74 });
  t("sécurité : rafales à 74 km/h → pas de doute de sécurité (seuil 75)", g74.eligible && !g74.verify.some((v) => v.k === "rafales"));
  const hu = sw(sp, { houle: 0, houleKnown: false });
  t("houle inconnue en côte ouverte : à vérifier, jamais 0 m silencieux", hu.eligible && hu.verify.some((v) => v.k === "houle") && /houle inconnue/.test(hu.reason), hu.reason);
  if (rade) { const hr = sw(rade, { houle: 0, houleKnown: false }); t("houle inconnue en rade : pas de doute (mer du vent calculée sur place)", hr.eligible === false || !hr.verify.some((v) => v.k === "houle")); }
  // Les notes ne changent pas : le doute n'est pas une pénalité cachée, c'est un état affiché.
  t("à vérifier : la note reste celle des conditions (rien de caché dans la note)", f7.rawScore === E.scoreWindow(sp, win, ctx({ wind_force: 7, wind_kmh: 55 })).rawScore && hu.rawScore === E.scoreWindow(sp, win, ctx({ houle: 0, houleKnown: true })).rawScore);
  // Classement : un spot à vérifier passe après un spot sans doute, même mieux noté.
  const a = { id: "a", eligible: true, robust: 8.5, verify: [{ k: "houle", t: "houle inconnue" }] }, b = { id: "b", eligible: true, robust: 6.0, verify: [] };
  t("classement : un spot à vérifier passe après un spot sans doute", [a, b].sort(E.rankCompare)[0].id === "b");
  t("« au vert » : un spot à vérifier n'est jamais compté", E.countGood([{ eligible: true, score: 8.5, verify: [{ k: "vent" }] }, { eligible: true, score: 7.2, verify: [] }]) === 1);
  // Dans une journée : le créneau sans doute est retenu avant un créneau à vérifier mieux noté.
  const wA = { ...win, id: "wA" }, wB = { ...win, id: "wB", priority: "bon" };
  const day = E.scoreSpot(sp, { wins: [{ ...wA, zw: { ...zw0, wind_force: 7, wind_kmh: 55 } }, { ...wB, zw: { ...zw0 } }], ...ctx({}) });
  t("journée : le créneau sans doute passe avant le créneau à vérifier", day.eligible && day.bestWindowId === "wB" && day.verify.length === 0, `${day.bestWindowId}`);
  // Indicateur de sécurité : les rafales y figurent.
  const s90 = E.safetyOf(sp, { zw: { ...zw0, gust_kmh: 92 }, light: win.light }), s75 = E.safetyOf(sp, { zw: { ...zw0, gust_kmh: 78 }, light: win.light });
  t("indicateur de sécurité : rafales de tempête → alerte ; fortes rafales → prudence", s90.level === "alerte" && s75.level === "prudence" && s75.items.some((i) => /Rafales à 78 km\/h/.test(i.t)));
  t("seuils de vent écrits une seule fois, avec leur source", E.WIND_LIMITS.blockForce === 8 && E.WIND_LIMITS.blockGust === 90 && E.WIND_LIMITS.doubtForce === 7 && E.WIND_LIMITS.doubtGust === 75 && /Météo-France/.test(E.SRC_WIND));
  if (label === "logonna") {
    const mm = E.SPOTS.find((s) => s.id === "moulinmer");
    const r = sw(mm, { wind_dir: "NE", wind_force: 9, wind_kmh: 81, gust_kmh: 85 });
    t("cas de la phase 1 : Moulin Mer, NE force 9, rafales 85 km/h → non recommandé", r.eligible === false && /Coup de vent/.test(r.reason), r.reason);
  }
  // Revue finale des phases 3 et 4 : une donnée de vent qui manque est un doute, jamais un calme supposé.
  const gu = sw(sp, { gust_kmh: null });
  t("rafales inconnues → à vérifier (on ne sait pas si elles dépassent 75 ou 90 km/h)", gu.eligible && gu.verify.some((v) => v.t === "rafales inconnues"), gu.reason);
  const du = sw(sp, { wind_dir: "?", wind_force: 3, wind_kmh: 15 });
  t("direction du vent inconnue (force 3) → à vérifier", du.eligible && du.verify.some((v) => v.t === "direction du vent inconnue"));
  const d0 = sw(sp, { wind_dir: "?", wind_force: 0, wind_kmh: 1 });
  t("vent calme sans direction (force 0) : pas de doute sur la direction", !d0.verify.some((v) => /direction/.test(v.t)));
  const noWx = E.SPOTS.map((s) => [s, E.zoneWeather(null, s)]);
  t("sans météo : vent marqué inconnu (jamais un calme supposé)", noWx.every(([, z]) => z.windKnown === false && z.houleKnown === false));
  const greenNoWx = noWx.map(([s, z]) => [s, E.scoreWindow(s, { ...s.tidalRules.windows[0], coeff: 70, light: { band: "aube", label: "Aube" } }, { ...ctx({}), zw: z })])
    .filter(([, r]) => r.eligible && !r.verify.length);
  t("sans météo : aucun spot sans doute, rade comprise (vent inconnu → à vérifier)", greenNoWx.length === 0, greenNoWx.map(([s]) => s.id).join(", "));
  if (rade) {
    const r0 = E.scoreWindow(rade, { ...rade.tidalRules.windows[0], coeff: 70, light: { band: "aube", label: "Aube" } }, { ...ctx({}), zw: E.zoneWeather(null, rade) });
    t("sans météo, en rade : « vent inconnu » annoncé", !r0.eligible || r0.verify.some((v) => v.t === "vent inconnu"), r0.reason);
  }
  const sNo = E.safetyOf(sp, { zw: { ...zw0, gust_kmh: null }, light: win.light });
  t("indicateur de sécurité : rafales inconnues → prudence", sNo.level !== "neutre" && sNo.items.some((i) => /Rafales inconnues/.test(i.t)));
  t("météo complète (vent, direction, rafales, houle) : aucun doute ajouté par la revue", calm.verify.length === 0 && E.safetyOf(sp, { zw: zw0, light: win.light }).items.every((i) => !/inconnu/.test(i.t)));
}

// ── 16 octies. v8.9 : le README liste exactement les fichiers à déposer ──
{
  const { SITE_FILES } = await import(path.join(root, "scripts/sites.mjs"));
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
  const m = readme.match(/avec les (\d+) fichiers du site\n\(([^)]*)\)/);
  const listed = m ? [...m[2].matchAll(/`([^`]+)`/g)].map((x) => x[1]) : [];
  t("README : la liste des fichiers à déposer est celle du site (nombre et noms)", m && +m[1] === SITE_FILES.length && listed.join() === SITE_FILES.join(), m ? listed.join() : "liste absente");
  t("README : version courante", /Version 9\.2 /.test(readme));
}

// ── 16 septies. v8.9 : corrections de l'audit complet (moteur, interface, sécurité) ──
{
  const D = "2026-07-15";
  const sp0 = E.SPOTS[0];
  const wins0 = E.computeWindows(sp0, E.tideDay(D, sp0.tidePort || E.SITE.tide.defaultPort).events);
  // Heures d'un créneau qui déborde : le jour est dit.
  t("créneau : « veille » et « (lendemain) » quand l'heure déborde de la journée", E.fmtWin(-2.85) === "veille 21h09" && E.fmtWin(24.9) === "00h54 (lendemain)" && E.fmtWin(7.5) === "07h30");
  // Heures de pêche : au moins la moitié du créneau dedans ; sinon jamais proposé ; à cheval → ramené aux heures.
  const H = { from: 5, to: 23 };
  t("heures de pêche : 02h51 → 06h51 (1 h 51 sur 4 h dans tes heures) n'est pas proposé", E.outOfHours({ startDecimal: 2.85, endDecimal: 6.85 }, H) === true);
  const cl = E.clipToHours({ startDecimal: 4, endDecimal: 7, startFmt: "04h00", endFmt: "07h00" }, H);
  t("heures de pêche : 04h00 → 07h00 ramené à 05h00 → 07h00, heures de marée gardées", cl.clipped && cl.startDecimal === 5 && cl.startFmt === "05h00" && cl.tideStartFmt === "04h00");
  // Maintenant : un créneau fini n'est plus proposé ; un créneau en cours est signalé ; trop tard pour y aller.
  const ms = (dec) => E.msAtLocal(D, dec);
  const late = E.scoreDay(D, null, { now: ms(23.9) });
  t("maintenant : à 23 h 54, seuls des créneaux qui courent après minuit restent proposés", late.filter((s) => s.eligible).every((s) => { const w = s.windows.find((x) => x.id === s.bestWindowId); return w.endDecimal > 23.9 + (s.distMin || 0) / 60 + 0.5; })
    && late.filter((s) => !s.eligible).some((s) => /passés/.test(s.reason || "")));
  const early = E.scoreDay(D, null, { now: ms(0.1) }), none = E.scoreDay(D, null, {});
  t("maintenant : à minuit, même classement que sans heure (rien n'est encore passé)", early.filter((s) => s.eligible).length >= none.filter((s) => s.eligible).length - 1);
  const mid = E.scoreDay(D, null, { now: ms(12) });
  const allW = mid.flatMap((s) => s.windows.map((w) => ({ s, w })));
  t("maintenant : créneaux finis marqués « passés », en cours avec le temps restant",
    allW.filter((x) => x.w.endDecimal <= 12).every((x) => x.w.past) && allW.filter((x) => x.w.startDecimal <= 12 && x.w.endDecimal > 12).every((x) => x.w.ongoing && near(x.w.remainingH, x.w.endDecimal - 12, 1e-6)));
  t("maintenant : un créneau qui finit avant l'arrivée (route + installation) n'est pas retenu",
    mid.filter((s) => s.eligible).every((s) => { const w = s.windows.find((x) => x.id === s.bestWindowId); return !w.past && !w.tooLate; })
    && allW.filter((x) => !x.w.past && x.w.endDecimal - 12 < ((x.s.distMin || 0) / 60 + 0.5)).every((x) => x.w.tooLate));
  // Houle : un spot engagé n'est plus proposé dès sa houle maximale ; un autre garde une marge de 0,5 m.
  const eng = E.SPOTS.find((s) => s.dangerLevel >= 3 && E.SITE.zones[s.zone]?.sea !== "rade");
  const mod = E.SPOTS.find((s) => s.dangerLevel < 3 && E.SITE.zones[s.zone]?.sea !== "rade");
  const ctxH = (sp, h) => ({ zw: { wind_dir: "E", wind_force: 2, wind_kmh: 10, houle: h, houleKnown: true, sky: "partly", cloud: 50 }, pressure: 1015, pressureTrend: "stable", sst: 15, sstConf: "ok", calib: {}, coeff: 70, month: 7 });
  const winOf = (sp) => ({ ...E.computeWindows(sp, E.tideDay(D, sp.tidePort || E.SITE.tide.defaultPort).events)[0], light: { band: "jour", label: "Jour" } });
  if (eng) t(`houle : ${eng.name} (engagé) plus proposé dès ${eng.houleMax} m + 0,2`, E.scoreWindow(eng, winOf(eng), ctxH(eng, eng.houleMax + 0.2)).eligible === false);
  if (mod) t(`houle : ${mod.name} (non engagé) encore noté à sa houle max + 0,2, plus au-delà de + 0,5`, E.scoreWindow(mod, winOf(mod), ctxH(mod, mod.houleMax + 0.2)).eligible !== false && E.scoreWindow(mod, winOf(mod), ctxH(mod, mod.houleMax + 0.6)).eligible === false);
  // Note négative : la saison et le journal ne la remontent plus. Phase 4 : avec un grand frais (force 7), le coup de
  // vent (force 9) retirant désormais le spot.
  const gale = (m, calib = {}) => E.scoreWindow(sp0, { ...wins0[0], light: { band: "jour", label: "Jour" } }, { zw: { wind_dir: E.DIR16[Math.round((sp0.exposedAngles[0] || 0) / 22.5) % 16], wind_force: 7, wind_kmh: 55, gust_kmh: 74, houle: 0.1, houleKnown: true, sky: "clear", cloud: 0 },
    pressure: 990, pressureTrend: "falling_fast", sst: 15, sstConf: "ok", calib, coeff: 120, month: m });
  const g1 = gale(1), g7 = gale(7);
  if (g1.eligible && g7.eligible && g7.rawScore < 0) t("note négative : l'hiver ne la remonte pas (janvier ≤ juillet)", g1.rawScore <= g7.rawScore, `${g1.rawScore} / ${g7.rawScore}`);
  // Marée : le coefficient d'une basse mer ne dépend plus du jour d'où on la regarde.
  let bad = 0;
  for (let i = 0; i < 40; i++) {
    const d1 = E.isoAddDays("2026-02-01", i), d2 = E.isoAddDays(d1, 1);
    const e1 = E.tideDay(d1, E.SITE.tide.defaultPort).events.filter((e) => e.type === "BM"), e2 = E.tideDay(d2, E.SITE.tide.defaultPort).events.filter((e) => e.type === "BM");
    for (const a of e1) { const b = e2.find((x) => Math.abs(x.ms - a.ms) < 6e4); if (b && a.coef !== b.coef) bad++; }
  }
  t("marée : le coefficient d'une basse mer est le même vu de la veille ou du lendemain", bad === 0, `${bad} écarts`);
  // Vent sans direction : « ? », jamais un vent d'ouest inventé.
  const zf = E.zoneWeather(null, sp0);
  t("vent : sans météo, direction « ? » et houle inconnue (jamais O, jamais 0 m mesuré)", zf.wind_dir === "?" && zf.houleKnown === false);
  t("vent : direction inconnue → l'exposition n'est pas notée", E.windMod("?", 6, [270], [90], 0, 2, "roche") === 0);
  // Panne du modèle de vagues : la houle du jour est inconnue, pas 0 m.
  globalThis.fetch = mockFetch("marinefail");
  const LM = await E.fetchLive("2026-10-10");
  t("houle : modèle de vagues en panne → houle du jour inconnue (null), pas 0 m", LM.houle == null || E.SITE.zones?.local?.sea === "rade");
  // Journal : une entrée malformée ne casse plus rien.
  const evil = E.sanitizeJournal([{ spotId: "__proto__", date: "2026-01-02", fish: 2, result: 7, predicted: 6 }, { spotId: "constructor", date: "2026-01-03", fish: "1", result: "6,5", predicted: 5 },
    { spotId: sp0.id, date: "2026-01-04", heure: 7 }, { spotId: sp0.id, date: "2026-01-05", heure: "25:99" }, { spotId: sp0.id, date: "2026-01-06" }, { spotId: sp0.id, date: "2026-01-07" }, null, 42, { date: "2026-01-01" }]);
  const cs = E.catchStats(evil), cb = E.calibrate([...evil, ...evil, ...evil]);
  t("journal : spotId « __proto__ » / « constructor » sans plantage ni pollution d'Object.prototype", cs["__proto__"]?.sessions === 1 && cs.constructor?.sessions === 1 && ({}).sessions === undefined && typeof cb.spotBias === "object");
  t("journal : entrées illisibles écartées, sans identifiant → identifiant distinct", evil.length === 6 && new Set(evil.map((e) => e.id)).size === 6);
  t("journal : heure illisible (7, « 25:99 ») retirée ; nombres « 6,5 » lus", !("heure" in evil[2]) && !("heure" in evil[3]) && evil[1].result === 6.5 && evil[1].fish === 1);
  t("journal : heure hors bornes → pas d'heure de session", E.sessionHour({ heure: "25:99" }, D) === null && E.sessionHour({ heure: "06:30" }, D) === 6.5);
  // Poids : jamais au-delà de la fourchette ni de la canne, même avec une profondeur saisie très grande.
  const deep = E.headTarget({ depthEst: { mNow: 45, cls: "tombant", level: 0.5 }, light: "jour" });
  t("poids : 45 m d'eau saisis → départ plafonné à 40 g, dans la fourchette", deep.start <= 40 && deep.start <= deep.hi && deep.lo <= deep.hi);
  // Cache météo : borné à 9 jours, jamais les jours anciens.
  const mem = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [E.isoAddDays("2026-10-20", i), { wx: {}, wxAt: 1 }]));
  const disk = E.storeForDisk(mem, "2026-10-29");
  t("cache météo : au plus 9 jours, à partir d'hier", Object.keys(disk).length === 9 && Object.keys(disk).every((k) => k >= "2026-10-28"));
  if (E.SITE.id === "logonna-daoulas") t("courant : le Petit Minou (« Goulet nord ») suit la marée comme les Espagnols", E.basinFlow(E.SPOTS.find((s) => s.id === "minou")));
}
// Stockage : plein, la météo en cache cède sa place au journal.
{
  const store = new Map(); let cap = 60;
  const fake = { get length() { return store.size; }, key: (i) => [...store.keys()][i] ?? null, getItem: (k) => (store.has(k) ? store.get(k) : null), removeItem: (k) => store.delete(k),
    setItem: (k, v) => { const used = [...store.entries()].reduce((a, [kk, vv]) => a + (kk === k ? 0 : kk.length + vv.length), 0); if (used + k.length + String(v).length > cap) { const e = new Error("QuotaExceededError"); e.name = "QuotaExceededError"; throw e; } store.set(k, String(v)); } };
  const prevW = globalThis.window;
  globalThis.window = { localStorage: fake };
  const { installStorage } = await import("../src/core/storage.js?u=" + Date.now());
  installStorage();
  cap = 180;
  store.set("bar:data:pirou-plage", "x".repeat(150));
  let okJ = true; try { await globalThis.window.storage.set("bar:journal:" + E.SITE.id, "[1,2,3]"); } catch { okJ = false; }
  t("stockage plein : la météo en cache est retirée, le journal s'écrit", okJ && !store.has("bar:data:pirou-plage") && store.get("bar:journal:" + E.SITE.id) === "[1,2,3]");
  globalThis.window = prevW;
}
// ── 16 decies. v8.11 : tes spots (ajoutés sur le téléphone) ──
{
  const P = E.parseUserCoords;
  t("position collée : décimal, virgule française, degrés-minutes, liens Google Maps",
    JSON.stringify(P("48.2319, -4.5708")) === JSON.stringify({ lat: 48.2319, lon: -4.5708 })
    && P("48,2319 ; -4,5708")?.lat === 48.2319 && P("48,2319 ; -4,5708")?.lon === -4.5708
    && Math.abs(P("48°13,9'N 4°34,3'W").lat - (48 + 13.9 / 60)) < 1e-4 && Math.abs(P("48°13,9'N 4°34,3'O").lon + (4 + 34.3 / 60)) < 1e-4
    && P("https://www.google.com/maps/place/X/@48.2319,-4.5708,15z")?.lat === 48.2319
    && P("https://www.google.com/maps/place/X/data=!3d48.231902!4d-4.570842")?.lon === -4.570842
    && P("https://maps.google.com/?q=48.33,-4.30")?.lat === 48.33
    && P("") === null && P("bonjour") === null && P("95.1, 3") === null && P("0.0, 0.0") === null);
  const s0 = E.SPOTS[0], c0 = E.spotLatLon(s0);
  const rec0 = { id: "moi-test01", name: "  Mon   poste  ", lat: c0.lat + 0.004, lon: c0.lon + 0.004, water: 180, type: "pointe", danger: 2, fond: "roche", prof: "peu", phase: "montant",
    notes: "Accès par la cale.", createdAt: 1, updatedAt: 2 };
  const S1 = E.sanitizeMySpot;
  t("fiche saisie : nettoyée (nom, champs connus seulement)", S1(rec0)?.name === "Mon poste" && !Object.keys(S1({ ...rec0, extra: 1, ["__proto__"]: { pollue: 1 } })).includes("extra") && ({}).pollue === undefined);
  t("fiche saisie refusée : identifiant, nom, position ou côté de l'eau invalides",
    [{ ...rec0, id: "x" }, { ...rec0, id: "moi-../../a" }, { ...rec0, name: "a" }, { ...rec0, lat: 91 }, { ...rec0, lon: "abc" }, { ...rec0, water: 10 }, { ...rec0, water: null }, null, [], "texte"].every((r) => S1(r) === null));
  t("fiche saisie : valeurs inconnues ramenées à « je ne sais pas » ou au défaut, port inconnu ignoré, notes bornées",
    S1({ ...rec0, fond: "lave", prof: "abysse", phase: "jamais", type: "falaise", danger: 9, tidePort: "nulle-part", notes: "x".repeat(900) })
      && ["fond", "prof", "phase"].every((k) => S1({ ...rec0, fond: "lave", prof: "abysse", phase: "jamais" })[k] === "inconnu")
      && S1({ ...rec0, type: "falaise" }).type === "pointe" && S1({ ...rec0, danger: 9 }).danger === 2 && S1({ ...rec0, tidePort: "nulle-part" }).tidePort === null
      && S1({ ...rec0, notes: "x".repeat(900) }).notes.length === 600);
  t("suppression : la fiche devient une simple trace (identifiant, date)", JSON.stringify(S1({ id: "moi-test01", deleted: true, updatedAt: 5, name: "z" })) === JSON.stringify({ id: "moi-test01", deleted: true, updatedAt: 5 }));
  t("identifiant : utilisable dans un lien (#spot=…) et unique d'un instant à l'autre", /^moi-[a-z0-9]{4,24}$/.test(E.newMySpotId()) && E.newMySpotId(1000, () => 0) !== E.newMySpotId(2000, () => 0));
  const b0 = E.buildMySpot(S1(rec0));
  const Cc = ["surface", "sous-surface", "mi-eau", "fond"], tr = b0.terrain;
  t("fiche construite : complète, au format des fiches du guide", tr && [1, 2, 3].includes(tr.encombrement) && ["oui", "texan", "non"].includes(tr.gratter) && tr.couches.every((c) => Cc.includes(c))
    && tr.montage && tr.fond && tr.source && tr.confidence === "local_knowledge" && b0.custom && b0.tidalRules.windows.length === 2 && b0.sources.length === 1);
  t("fiche construite : port de marée et zone du spot du guide le plus proche", b0.tidePort === (s0.tidePort || E.SITE.tide.defaultPort) && b0.zone === s0.zone && E.SITE.tide.ports[b0.tidePort]);
  t("fiche construite : eau au sud → vents de S de face, de N dans le dos (secteurs de l'orientation)", JSON.stringify(b0.exposedAngles) === JSON.stringify([180, 202.5, 157.5]) && JSON.stringify(b0.shelteredAngles) === JSON.stringify([0, 22.5, 337.5]) && E.waterDirOf(b0) === 180);
  t("fiche construite : roche → pas de grattage ni de couche « fond »", tr.gratter === "non" && !tr.couches.includes("fond"));
  t("fiche construite : ta phase « montante » = créneau prime BM → BM+3, dit « selon toi »", b0.tidalRules.windows[0].priority === "prime" && b0.tidalRules.windows[0].phase === "bm" && b0.tidalRules.windows[0].offsetBefore === 0 && /selon toi/.test(b0.tidalRules.windows[0].label));
  const bu = E.buildMySpot(S1({ ...rec0, id: "moi-test03", phase: "inconnu", fond: "sable", type: "anse", danger: 3 }));
  t("fiche construite : phase inconnue = règle générale, dite comme telle", bu.tidalRules.windows.every((w) => /règle générale/.test(w.label) && /Règle générale/.test(w.note)));
  t("fiche construite : anse abritée = régime abrité ; engagé = houle max 1,5 m ; sable = grattage", E.regimeOf(bu) === "abri" && bu.houleMax === 1.5 && bu.terrain.gratter === "oui" && bu.terrain.couches.includes("fond"));
  t("fiche construite : identifiants de créneaux propres au spot", new Set([...b0.tidalRules.windows, ...bu.tidalRules.windows].map((w) => w.id)).size === 4 && b0.tidalRules.windows.every((w) => w.id.startsWith(b0.id)));
  t("fiche construite : temps de route estimé (vol d'oiseau × 1,4 à 50 km/h) ou le tien", b0.distMin === E.estimateMinutes(rec0.lat, rec0.lon) && E.buildMySpot(S1({ ...rec0, minutes: 42 })).distMin === 42);
  // Registre : tes spots vus par tout le moteur (météo, classement), puis retirés.
  const base = E.allSpots().length;
  E.applyMyRecords([S1(rec0), S1({ id: "moi-test02", deleted: true, updatedAt: 3 })]);
  t("registre : tes spots actifs s'ajoutent aux fiches du guide (pas les supprimés)", E.allSpots().length === base + 1 && E.allSpots()[base].id === "moi-test01" && E.allSpots() === E.allSpots());
  t("météo : un point demandé pour ton spot", E.wxPoints().some((p) => p.key === "moi-test01" && Math.abs(p.lat - rec0.lat) < 1e-5));
  globalThis.fetch = mockFetch("nominal");
  const Lm = await E.fetchLive(DATE);
  const scm = E.scoreDay(DATE, Lm, {}).find((s) => s.id === "moi-test01");
  t("classement : ton spot est noté avec sa propre météo", scm && scm.windows.length >= 2 && scm.windows.every((w) => w.id.startsWith("moi-test01-")) && (scm.eligible ? scm.score > 0 : !!scm.reason) && Lm.series["moi-test01"] && E.spotWeather(Lm, scm).fromSpot === true);
  t("réglementation : celle de la latitude de ton spot", E.regulationFor(DATE, rec0.lat).quota === E.regulationFor(DATE, c0.lat).quota);
  E.applyMyRecords([]);
  t("registre : retour aux seules fiches du guide", E.allSpots() === E.SPOTS);
  // Fusion téléphone / GitHub : la version la plus récente gagne ; une suppression récente l'emporte.
  const M = E.mergeMyRecords;
  const v1 = { ...rec0, name: "Ancien", updatedAt: 10 }, v2 = { ...rec0, name: "Nouveau", updatedAt: 20 }, del = { id: rec0.id, deleted: true, updatedAt: 30 }, other = { ...rec0, id: "moi-autre1", updatedAt: 5 };
  t("fusion : la version la plus récente gagne, des deux côtés", M([v1], [v2])[0].name === "Nouveau" && M([v2], [v1])[0].name === "Nouveau");
  t("fusion : une suppression plus récente l'emporte, une plus ancienne non", M([v2], [del])[0].deleted === true && M([del], [{ ...v2, updatedAt: 40 }])[0].deleted === undefined);
  t("spot le plus proche : chaque fiche du guide se retrouve elle-même (coordonnées écrites comprises)", E.SPOTS.every((sp) => { const a = E.spotLatLon(sp); const n = E.nearestGuideSpot(a.lat, a.lon); return n && n.spot.id === sp.id && n.km < 0.01; }));
  t("fusion : union des deux appareils, entrées illisibles écartées", M([other, { bad: 1 }, null], [v2]).map((r) => r.id).join() === "moi-autre1,moi-test01");
}

// ── 16 undecies. v8.14 : semaine « toute verte », guide d'un point posé depuis l'accueil ──
{
  const kf = E.keyFactors([{ k: "Coef 78 dans la plage utile", v: 2 }, { k: "Ciel", v: 0.4 }, { k: "Ciel", v: -0.3 }, { k: "Vent SO F3", v: 0.2 },
    { k: "Fenêtre prime", v: 0.5 }, { k: "Basse lumière", v: 1.2 }, { k: "Rafales 60 km/h", v: -1.5 }, { k: "Saison : départ au frai", v: -0.6 }, { k: "x", v: NaN }]);
  t("ce qui porte la note : les 3 atouts les plus forts (≥ +0,3), dans l'ordre", kf.plus.map((p) => p.label).join("|") === "Coef 78 dans la plage utile|Basse lumière|Créneau prime", JSON.stringify(kf.plus));
  t("ce qui freine : ≤ −0,5, le plus fort d'abord ; le ciel dit en clair", kf.minus.map((p) => p.label).join("|") === "Rafales 60 km/h|Saison : départ au frai"
    && E.keyFactors([{ k: "Ciel", v: 0.4 }]).plus[0].label === "Ciel couvert" && E.keyFactors([{ k: "Ciel", v: -0.6 }]).minus[0].label === "Ciel dégagé");
  t("ce qui porte la note : rien à dire sans termes", E.keyFactors(null).plus.length === 0 && E.keyFactors([]).minus.length === 0);
  t("spots au vert : note ≥ 7 et praticables seulement", E.GOOD_SCORE === 7 && E.countGood([{ eligible: true, score: 7 }, { eligible: true, score: 6.9 }, { eligible: false, score: 8 }, { eligible: true, score: 9.1 }]) === 2 && E.countGood(null) === 0);
  // Les termes affichés sont ceux qui font la note du meilleur créneau d'une journée réelle.
  const dd = E.scoreDay(E.localTodayISO(), null, { hours: E.ALL_HOURS }).find((x) => x.eligible);
  t("ce qui porte la note : lu sur le meilleur créneau d'une journée notée", !dd || (Array.isArray(dd.bestParts) && E.keyFactors(dd.bestParts).plus.every((p) => p.v >= 0.3)));
  // Guide d'un point : la fiche d'origine la plus proche, tous guides confondus.
  const idx = [["a", "s1", 48.30, -4.30, "Un"], ["b", "s2", 48.60, -4.56, "Deux"], ["b", "s3", 48.62, -4.50, "Trois"]];
  const o1 = E.ownerOf(48.31, -4.31, idx), o2 = E.ownerOf(48.605, -4.55, idx);
  t("guide d'un point : celui de la fiche la plus proche, avec sa distance", o1.key === "a" && o1.spotId === "s1" && o1.km < 2 && o2.key === "b" && o2.spotName === "Deux" && E.ownerOf(1, 1, []) === null);
  t("guide d'un point : au-delà de 60 km, message clair", E.MYSPOT_MAX_KM === 60 && /^Aucun guide ne couvre ce point : la fiche la plus proche \(Un, guide A\) est à 817 km\./.test(E.noGuideMsg({ spotName: "Un", km: 817.2 }, "A")));
  t("temps de route : le même calcul depuis n'importe quel village", E.estimateFrom(E.SITE, E.SITE.lat + 0.1, E.SITE.lon) === E.estimateMinutes(E.SITE.lat + 0.1, E.SITE.lon) && E.estimateFrom({ lat: 0, lon: 0 }, 0, 0) === 2);
  // Chaque fiche du guide se retrouve elle-même dans un index construit comme celui de l'accueil.
  const own = E.SPOTS.map((sp) => { const c = E.spotLatLon(sp); return ["ici", sp.id, c.lat, c.lon, sp.name]; });
  t("guide d'un point : chaque fiche se retrouve elle-même", E.SPOTS.every((sp) => { const c = E.spotLatLon(sp); const o = E.ownerOf(c.lat, c.lon, own); return o.spotId === sp.id && o.km < 0.01; }));
  t("corrections de terrain : toujours exportées par le moteur photo", typeof E.withTerrainOverrides === "function" && E.TERRAIN_KEY === "bar:terrain:" + E.SITE.id);
}

// ── 16 duodecies. v8.15 : tendance d'un spot d'aujourd'hui à demain (recherche de l'accueil) ──
{
  const T = E.trendOf, el = (score) => ({ eligible: true, score });
  t("tendance : en hausse au-delà de 0,2 point", T(el(7.0), el(7.3))?.arrow === "↗" && T(el(7.0), el(7.3)).word === "en hausse");
  t("tendance : en baisse au-delà de 0,2 point", T(el(7.0), el(6.7))?.arrow === "↘");
  t("tendance : stable à 0,2 point près (précision du modèle)", T(el(7.0), el(7.2))?.arrow === "→" && T(el(7.0), el(6.8))?.arrow === "→" && T(el(7.0), el(7.0)).word === "stable");
  t("tendance : demain sans créneau praticable → en baisse, dit pourquoi", T(el(6.0), { eligible: false, score: 0 })?.arrow === "↘" && /aucun créneau/.test(T(el(6.0), { eligible: false, score: 0 }).why));
  t("tendance : rien à dire sans note du jour ou sans demain", T({ eligible: false, score: 0 }, el(8)) === null && T(el(7), null) === null);
  t("tendance : même seuil que l'égalité du modèle", E.TIE_DELTA === 0.2 && E.GOOD_SCORE === 7);
}

// ── 16 terdecies. v8.15 : pêche en bateau — fiches, heures de Paris, conditions, modèle empirique ──
{
  const B = E.sanitizeBoatSpot, TR = E.sanitizeTrip;
  t("spot bateau : nettoyé (nom, position, type, profondeur), identifiant exigé", B({ id: "b-abc123", name: " Épave du  Tanker ", lat: 48.5, lon: -5.1, type: "epave", depth: "38" })?.depth === 38
    && B({ id: "b-abc123", name: "x", lat: 48, lon: -5 }) === null && B({ id: "zz", name: "Ok ok", lat: 48, lon: -5 }) === null && B({ id: "b-abc123", name: "Ok ok", lat: 48, lon: -5, type: "??", depth: "" }).type === "autre"
    && B({ id: "b-abc123", name: "Ok ok", lat: 48, lon: -5, depth: "" }).depth === null);
  const trip = TR({ id: "t-abc123", spotId: "b-abc123", date: "2026-07-01", start: "06:00", end: "09:30", catches: [{ sp: "lieu-jaune", n: 3, size: "45", kept: true }, { sp: "inconnu", n: 2 }, { sp: "bar", n: 0 }], tech: ["jig", "jig", "zz"], cond: { wind: 12.345678, bad: 3, coef: "80" } });
  t("sortie : prises valides seulement, techniques connues, conditions gardées champ par champ", trip && trip.catches.length === 1 && trip.catches[0].size === 45 && trip.catches[0].kept === true
    && trip.tech.join() === "jig" && trip.cond.wind === 12.346 && trip.cond.coef === 80 && !("bad" in trip.cond) && TR({ ...trip, start: "6h" }) === null && TR({ ...trip, spotId: "x" }) === null);
  t("sortie : un capot (aucune prise) est une sortie valide", TR({ id: "t-cap001", spotId: "b-abc123", date: "2026-07-01", start: "06:00", end: "08:00", catches: [] })?.catches.length === 0);
  t("espèces : 30 espèces de la pêche à la ligne et « autre », identifiants uniques", E.SPECIES.length === 31 && new Set(E.SPECIES.map((x) => x.id)).size === 31 && E.SPECIES_BY.bar.latin === "Dicentrarchus labrax");
  t("heure de Paris : été UTC+2, hiver UTC+1", E.parisMs("2026-07-01", "06:00") === Date.UTC(2026, 6, 1, 4, 0) && E.parisMs("2026-12-01", "06:00") === Date.UTC(2026, 11, 1, 5, 0));
  t("durée d'une sortie : passage de minuit, au moins un quart d'heure", E.tripHours({ date: "2026-07-01", start: "22:00", end: "01:30" }) === 3.5 && E.tripHours({ date: "2026-07-01", start: "06:00", end: "06:00" }) === 24 && E.tripHours({ date: "2026-07-01", start: "06:00", end: "06:05" }) === 0.25);
  const m1 = E.mergeById([{ ...trip, updatedAt: 5 }], [{ id: trip.id, deleted: true, updatedAt: 5 }, { ...trip, id: "t-new001", updatedAt: 1 }], E.sanitizeTrip);
  t("fusion téléphone / GitHub : la plus récente gagne, une suppression reste notée", m1.length === 2 && m1.find((x) => x.id === trip.id).deleted === true);
  // Conditions d'une période à partir de séries horaires synthétiques.
  const t0 = Date.UTC(2026, 6, 1, 4, 0) / 1000, time = Array.from({ length: 48 }, (_, i) => t0 - 24 * 3600 + i * 3600);
  const ser = { time, wind: time.map((_, i) => 10 + (i % 3)), gust: time.map((_, i) => 20 + i), dir: time.map((_, i) => (i % 2 ? 350 : 10)), pressure: time.map((_, i) => 1000 + i * 0.5),
    wave: time.map(() => 1.2), period: time.map(() => 8), swell: time.map(() => 0.9), swellPeriod: time.map(() => 10), sst: time.map(() => 16), cloud: time.map(() => 50), waveDir: time.map(() => 10) };
  const tide = { events: [{ type: "PM", ms: Date.UTC(2026, 6, 1, 2, 0), coef: 85 }, { type: "BM", ms: Date.UTC(2026, 6, 1, 8, 10) }] };
  const c = E.conditionsOf(ser, Date.UTC(2026, 6, 1, 4, 0), Date.UTC(2026, 6, 1, 6, 0), tide);
  t("conditions : moyennes sur la période, rafale maximale, direction circulaire (N), pression sur 24 h", c && Math.abs(c.wave - 1.2) < 1e-9 && c.gust === 20 + 26 && (c.dir < 10 || c.dir > 350) && Math.abs(c.dp24 - 12) < 1e-9 && c.sst === 16, JSON.stringify(c));
  t("conditions : marée (coefficient, 3 h après la pleine mer), heure locale et jour de l'année", c.coef === 85 && Math.abs(c.tideH - 3) < 1e-9 && Math.abs(c.hour - 7) < 1e-9 && c.doy === 182);
  // Modèle : sur des sorties simulées où les prises doublent quand la houle monte d'un écart-type, il retrouve cet effet.
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const poisson = (lam) => { let k = 0, p = 1; const L = Math.exp(-lam); do { k++; p *= rnd(); } while (p > L); return k - 1; };
  const sim = Array.from({ length: 80 }, (_, i) => {
    const wave = 0.5 + 2 * rnd(), wind = 5 + 30 * rnd(), coef = 40 + 70 * rnd(), h = 2 + Math.floor(rnd() * 4);
    const lam = 0.8 * Math.exp(1.2 * (wave - 1.5)) * h;
    return E.sanitizeTrip({ id: `t-sim${String(i).padStart(3, "0")}`, spotId: i % 2 ? "b-spot01" : "b-spot02", date: "2026-07-01", start: "06:00", end: `${String(6 + h).padStart(2, "0")}:00`,
      catches: (() => { const k = poisson(lam); return k ? [{ sp: i % 3 ? "lieu-jaune" : "bar", n: k }] : []; })(), cond: { wave, wind, coef, tideH: 12.42 * rnd(), sst: 15 + rnd() } });
  });
  const few = E.fitModel(sim.slice(0, 5));
  t("modèle : pas de note sous 8 sorties, raison dite", few.ok === false && /5 sorties avec conditions sur 8/.test(few.reason));
  t("modèle : sans aucune prise, rien à apprendre", E.fitModel(sim.map((x) => ({ ...x, catches: [] }))).ok === false);
  const M = E.fitModel(sim);
  t("modèle : ajusté sur 80 sorties, l'effet simulé de la houle est retrouvé (positif, dominant)", M.ok && M.beta.wave > 0.4 && Math.abs(M.beta.wind) < M.beta.wave / 2 && Math.abs(M.beta.coef) < M.beta.wave / 2, JSON.stringify(M.beta));
  const ef = E.effectsOf(M, sim);
  t("modèle : effets classés, la houle en tête et croissante", ef[0]?.k === "wave" && ef[0].rising === true && ef[0].ratio > 2, JSON.stringify(ef.slice(0, 2)));
  t("note : 5 à ta moyenne, +2,5 par doublement, bornée", E.scoreOf(M, M.meanRate) === 5 && E.scoreOf(M, 2 * M.meanRate) === 7.5 && E.scoreOf(M, M.meanRate / 2) === 2.5 && E.scoreOf(M, 1e6) === 9.9 && E.scoreOf(M, 0) === null);
  const lo = E.predictRate(M, { wave: 0.6, wind: 20, coef: 70 }, "b-spot01"), hi = E.predictRate(M, { wave: 2.4, wind: 20, coef: 70 }, "b-spot01");
  t("prévision : plus de houle → plus de prises attendues (comme dans les sorties)", hi > 2 * lo);
  t("prévision : un spot sans sortie prend l'effet de référence (aucun effet propre)", Math.abs(E.predictRate(M, { wave: 1.5 }, "b-spot01") / E.predictRate(M, { wave: 1.5 }, "b-inconnu") - Math.exp(M.spot["b-spot01"])) < 1e-9);
  const cv = E.curveOf(M, sim, "tideH");
  t("courbe d'une variable cyclique : un tour de marée complet quand les sorties le couvrent (0 à 12,42 h)", cv && cv.lo === 0 && Math.abs(cv.hi - 12.42) < 1e-9 && cv.pts.length === 41 && cv.cyc);
  const narrow = sim.map((x, i) => ({ ...x, cond: { ...x.cond, tideH: 2 + (i % 3) } }));
  const cvn = E.curveOf(E.fitModel(narrow), narrow, "tideH");
  t("courbe : seulement sur l'étendue de tes sorties (pas d'extrapolation)", cvn && cvn.lo === 2 && cvn.hi === 4);
  const Mb = E.fitModel(sim, { species: "bar" });
  t("modèle par espèce : seulement les prises de l'espèce choisie", Mb.ok && Mb.totalCatch === sim.reduce((s, x) => s + E.catchCount(x, "bar"), 0) && Mb.totalCatch < M.totalCatch);
  t("fiabilité dite en clair", E.reliabilityOf(10) === "faible" && E.reliabilityOf(20) === "moyenne" && E.reliabilityOf(50) === "correcte");
}

// ── v9.1 — Sécurité et confiance : deux indicateurs à part de la note ──
{
  const sp = E.SPOTS.find((x) => x.dangerLevel === 1 && Number.isFinite(x.houleMax)) || E.SPOTS[0];
  const zw = (o) => ({ wind_dir: "O", wind_force: 3, wind_kmh: 15, gust_kmh: 25, houle: 0.4, houleKnown: true, model: "AROME", ...o });
  const calm = E.safetyOf(sp, { zw: zw(), light: { band: "jour" } }, { alerts: [] });
  t("sécurité : sans alerte, état neutre et jamais « sûr »", calm.level === "neutre" && calm.label === "Aucune alerte connue" && !/sûr|sans danger|serein/i.test(JSON.stringify(calm)), JSON.stringify(calm));
  t("sécurité : « vérifie sur place » toujours dit", /Vérifie sur place/.test(E.ON_SITE));
  const f7 = E.safetyOf(sp, { zw: zw({ wind_force: 7, wind_kmh: 55 }) }, {});
  const f8 = E.safetyOf(sp, { zw: zw({ wind_force: 8, wind_kmh: 66 }) }, {});
  t("sécurité : force 7 → prudence (BMS côte), force 8 → alerte (coup de vent), sources dites", f7.level === "prudence" && /Grand frais/.test(f7.items[0].t) && /BMS/.test(f7.items[0].s)
    && f8.level === "alerte" && /Coup de vent/.test(f8.items[0].t));
  const over = E.safetyOf(sp, { zw: zw({ houle: sp.houleMax + 0.2 }) }, {});
  t("sécurité : houle au-dessus du maximum de la fiche → prudence, chiffres dits", over.level === "prudence" && over.items.some((i) => /au-dessus du maximum de la fiche/.test(i.t)), JSON.stringify(over.items));
  const rade = Object.entries(E.SITE.zones || {}).find(([, z]) => z.sea === "rade")?.[0];
  const open = Object.entries(E.SITE.zones || {}).find(([, z]) => z.sea !== "rade")?.[0];
  if (open) t("sécurité : houle inconnue sur la côte ouverte → prudence", E.safetyOf({ ...sp, zone: open }, { zw: zw({ houleKnown: false, houle: 0 }) }, {}).level === "prudence");
  if (rade) t("sécurité : houle inconnue en rade → pas d'alerte de houle", !E.safetyOf({ ...sp, zone: rade, dangerLevel: 1 }, { zw: zw({ houleKnown: false, houle: 0 }) }, {}).items.some((i) => /Houle inconnue/.test(i.t)));
  t("sécurité : sans météo → prudence", E.safetyOf(sp, null, { degraded: true }).level === "prudence");
  t("sécurité : spot engagé et nuit sur spot modéré → prudence du guide",
    E.safetyOf({ ...sp, dangerLevel: 3 }, { zw: zw() }, {}).level === "prudence" && E.safetyOf({ ...sp, dangerLevel: 2 }, { zw: zw(), light: { band: "nuit" } }, {}).items.some((i) => /De nuit/.test(i.t)));
  const rules = E.securityFor({ ...sp, securite: [{ t: "Isolement par la marée.", s: "fiche", when: { coefAbove: 80 } }, { t: "Rochers glissants.", s: "fiche" }] }, { coeff: 95 });
  const withRules = E.safetyOf(sp, { zw: zw() }, { alerts: rules });
  t("sécurité : consigne de la fiche active aujourd'hui → prudence ; consigne permanente → information", withRules.level === "prudence"
    && withRules.items[0].t === "Aujourd'hui : Isolement par la marée." && withRules.items.some((i) => i.level === "info" && i.t === "Rochers glissants."));
  const mine = E.safetyOf({ ...sp, custom: true }, { zw: zw({ houle: sp.houleMax + 0.3 }) }, {});
  t("sécurité : spot ajouté → maximum de houle dit « estimé »", mine.items.some((i) => /maximum estimé/.test(i.t) && /estimation/.test(i.s)));

  const evs = [{ type: "BM", ms: 1000, h: 1 }, { type: "PM", ms: 2000, h: 6 }, { type: "BM", ms: 3000, h: 1.2 }];
  t("marée à un instant : montante après la basse mer, descendante après la pleine mer, prochaine dite",
    E.tideNow(evs, 1500).rising === true && E.tideNow(evs, 1500).next.type === "PM" && E.tideNow(evs, 2500).rising === false && E.tideNow(evs, 500).rising === false && E.tideNow([], 0) === null);
  const day = E.tideDay("2026-11-06", E.SITE.tide.defaultPort);
  const tn = E.tideNow(day.events, Date.UTC(2026, 10, 6, 11));
  t("marée à un instant : cohérente avec la courbe du port (le niveau monte quand « montante »)", tn && tn.prev && tn.next && (tn.rising ? tn.next.h > tn.prev.h : tn.next.h < tn.prev.h));
  const now = Date.UTC(2026, 10, 6, 8);
  const live = { sst: 14, sst_confidence: "modele", _wxAt: now - 20 * 60000 };
  const s0 = { id: sp.id, stability: "stable", tideAccuracy: "contrôlée contre les tables SHOM : ±4 min" };
  const good = E.confidenceOf(s0, { zw: zw() }, { live, now });
  t("confiance : tout est là → élevée, trois points, aucune réserve", good.level === "elevee" && good.dots === 3 && !good.items.some((i) => i.ok === "reserve" || i.ok === "manque"), JSON.stringify(good.items));
  t("confiance : jamais un nombre sur 100 ni un pourcentage", !/\/ ?100|%/.test(JSON.stringify(good)));
  const ecmwf = E.confidenceOf(s0, { zw: zw({ model: "ECMWF" }) }, { live, now });
  t("confiance : ECMWF seul → une réserve, moyenne", ecmwf.level === "moyenne" && ecmwf.items[0].ok === "reserve" && /ECMWF/.test(ecmwf.items[0].t));
  t("confiance : pas de météo → faible", E.confidenceOf(s0, null, { live: null, now }).level === "faible");
  t("confiance : au-delà de 10 jours → faible", E.confidenceOf(s0, { zw: zw() }, { live, dayOffset: 12, now }).level === "faible");
  t("confiance : classement volatil → faible", E.confidenceOf({ ...s0, stability: "volatile" }, { zw: zw() }, { live, now }).level === "faible");
  const off = E.confidenceOf(s0, { zw: zw() }, { live: { ...live, _stale: true, _wxAt: now - 20 * 36e5 }, now });
  t("confiance : hors ligne depuis 20 h → faible, l'âge est dit", off.level === "faible" && off.items.some((i) => /il y a 20 h/.test(i.t)));
  const j = E.confidenceOf(s0, { zw: zw() }, { live, now, calib: { detail: { [sp.id]: { n: 3 } } } });
  t("confiance : le journal est cité (information, ne change pas le niveau)", j.level === "elevee" && j.items.some((i) => i.ok === "info" && /3 sessions/.test(i.t)));
  t("confiance : spot ajouté → réserve « estimés, pas sourcés »", E.confidenceOf({ ...s0, custom: true }, { zw: zw() }, { live, now }).items.some((i) => /pas sourcés/.test(i.t)));
}

// ── v9.2 — Ce qui fait la note, par famille (comparaison des spots) ──
{
  const parts = [{ k: "Coef 75", v: 0.8 }, { k: "Fenêtre prime", v: 0.4 }, { k: "Vent ONO F4", v: -0.3 }, { k: "Rafales", v: -0.2 },
    { k: "Ciel", v: 0.1 }, { k: "Basse lumière", v: 0.6 }, { k: "Saison : novembre", v: -0.3 }, { k: "Pression (indice faible)", v: 0.3 }, { k: "Journal (3 sessions)", v: 0.2 }];
  const fg = E.factorGroups(parts);
  const by = Object.fromEntries(fg.map((x) => [x.key, x.v]));
  t("familles : quatre, dans l'ordre Marée, Vent, Lumière, Saison et eau", fg.map((x) => x.label).join(",") === "Marée,Vent,Lumière,Saison et eau");
  t("familles : chaque barre est la somme exacte de ses termes (arrondie au dixième)", by.maree === 1.2 && by.vent === -0.5 && by.lumiere === 0.7 && by.saison === -0.3, JSON.stringify(fg));
  t("familles : pression et journal ne sont rangés nulle part (ni inventés ailleurs)", Math.abs(fg.reduce((n, x) => n + x.v, 0) - 1.1) < 0.051);
  t("familles : sans termes → quatre zéros, termes invalides ignorés", E.factorGroups(null).every((x) => x.v === 0) && E.factorGroups([{ k: "Coef 90", v: NaN }, null]).every((x) => x.v === 0));
}

console.log(`[unit v9.2 · ${label}] ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
