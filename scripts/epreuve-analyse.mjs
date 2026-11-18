// Phase 8 — Ce que le moteur v2 dit sur les journées de référence telles quelles (sans tirage) :
//   1. coût de la prudence : fréquence réelle des « à vérifier » et des « non recommandé », par guide, par mois et
//      par raison, et ce qu'ajoutent tes seuils (force 6, rafales de 60 km/h) par rapport à ceux de la v1 (7, 75) ;
//   2. paliers de favorabilité : leur fréquence réelle en saison (mai à octobre) et hors saison ;
//   3. v1 et v2 sur de vraies journées : même premier spot, trois premiers en commun ;
//   4. ton journal (Moulin Mer, trois sessions) : contrôle de vraisemblance, rien de plus ;
//   5. qualité des données : modèles, houle, eau.
// Usage : node scripts/epreuve-analyse.mjs <dossier des journées> [sortie.json]
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { SITES } from "./sites.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const [dataDir = path.join(root, "out/epreuve"), outFile = null] = process.argv.slice(2);
fs.mkdirSync(path.join(root, "tests/.build"), { recursive: true });
const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(1)} %` : "–");
const inSeason = (date) => { const m = +date.slice(5, 7); return m >= 5 && m <= 10; };
const out = { guides: {}, totals: {} };
const T = { spotDays: 0, eligible: 0, av: 0, avNew: 0, nr: 0, guideDays: 0, topAV: 0, noSure: 0, noneEligible: 0,
            reasons: {}, nrReasons: {}, byMonth: {}, bands: { saison: [0, 0, 0, 0, 0, 0], hors: [0, 0, 0, 0, 0, 0] }, topBands: { saison: [0, 0, 0, 0, 0, 0], hors: [0, 0, 0, 0, 0, 0] },
            v1v2: { n: 0, same1: 0, over3: 0 }, quality: { days: 0, arome: 0, ecmwfOnly: 0, marine: 0, sst: 0 }, favs: { saison: [], hors: [] } };
const reasonOf = (v) => (v.k === "vent" ? (/inconnu/.test(v.t) ? "vent inconnu" : /direction/.test(v.t) ? "direction inconnue" : /force 6\b/.test(v.t) ? "vent force 6" : "vent force 7")
  : v.k === "rafales" ? (/inconnues/.test(v.t) ? "rafales inconnues" : (+(v.t.match(/(\d+) km/)?.[1]) < 75 ? "rafales 60 à 74 km/h" : "rafales 75 à 89 km/h"))
  : v.k === "houle" ? (/inconnue/.test(v.t) ? "houle inconnue" : "houle au-dessus du maximum") : v.k);
const nrOf = (t) => (/Coup de vent/.test(t) ? "coup de vent (force 8 et plus)" : /Rafales à/.test(t) ? "rafales de 90 km/h et plus" : /Houle trop forte/.test(t) ? "houle au-delà du maximum"
  : /Houle inconnue/.test(t) ? "houle inconnue, spot engagé" : /Nuit sur un spot engagé/.test(t) ? "nuit, spot engagé" : /Retour coupé/.test(t) ? "retour coupé par la marée"
  : /^Coef/.test(t) ? "courant (limite de la fiche)" : /heures de pêche|passés/.test(t) ? "hors de tes heures" : "autre");

for (const s of SITES) {
  const f = path.join(dataDir, `${s.key}.json`);
  if (!fs.existsSync(f)) continue;
  const data = JSON.parse(fs.readFileSync(f, "utf8"));
  const file = path.join(root, "tests/.build", `an_${s.key}.mjs`);
  await build({ entryPoints: [path.join(root, "src/engine.js")], bundle: true, format: "esm", platform: "node", outfile: file, jsx: "automatic",
    external: ["react", "react/jsx-runtime", "react-dom"], logLevel: "warning",
    plugins: [{ name: "site", setup(b) { b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: path.join(root, s.config) })); } }] });
  const E = await import(file + `?t=${Date.now()}`);
  const G = (out.guides[s.key] = { days: 0, av: 0, eligible: 0, topAV: 0, noSure: 0, journal: [] });
  for (const [date, live] of Object.entries(data.days)) {
    if (!live || live.error) continue;
    const opts = { engine: "v2", hours: E.DEFAULT_HOURS, clock: Date.parse(`${date}T05:00:00Z`), pertinence: false };
    const day = E.rankDay(date, live, opts);
    if (live.journal) {
      // 4. Journal : la journée d'une session notée, pour le spot pêché.
      const sp = day.find((x) => x.id === "moulinmer");
      const e = (E.SITE.seedJournal || []).find((j) => j.date === date);
      const dusk = (sp?.windows || []).filter((w) => w.eligible && w.light?.band === "crepuscule").map((w) => ({ w: `${w.startFmt}–${w.endFmt}`, fav: w.score, verify: (w.verify || []).map((v) => v.t) }));
      G.journal.push({ date, fish: e?.fish ?? null, result: e?.result ?? null, rank: sp?.v2?.rank ?? null, of: day.filter((x) => x.eligible).length,
                       fav: sp?.score ?? null, conf: sp?.v2?.conf?.score ?? null, verify: (sp?.verify || []).map((v) => v.t), dusk, line: sp?.v2?.f?.line || sp?.reason || "" });
      continue;
    }
    // 5. Qualité des données.
    T.quality.days++;
    if ((live.models || []).includes("AROME")) T.quality.arome++; else T.quality.ecmwfOnly++;
    if (Object.values(live.series || {}).some((x) => x.wave?.some((v) => v != null))) T.quality.marine++;
    if (live.sst != null) T.quality.sst++;
    const m = date.slice(5, 7), BM = (T.byMonth[m] ||= { spotDays: 0, av: 0, avNew: 0, eligible: 0 });
    G.days++; T.guideDays++;
    const el = day.filter((x) => x.eligible);
    if (!el.length) T.noneEligible++;
    for (const x of day) {
      T.spotDays++; BM.spotDays++;
      if (!x.eligible) { T.nr++; const k = nrOf(x.reason || x.wxReason || ""); T.nrReasons[k] = (T.nrReasons[k] || 0) + 1; continue; }
      T.eligible++; G.eligible++; BM.eligible++;
      if (x.verify?.length) {
        T.av++; G.av++; BM.av++;
        const rs = [...new Set(x.verify.map(reasonOf))];
        for (const r of rs) T.reasons[r] = (T.reasons[r] || 0) + 1;
        // À vérifier seulement à cause de tes seuils (force 6, rafales de 60 à 74 km/h) : sans eux, la v1 n'aurait rien dit.
        if (rs.every((r) => r === "vent force 6" || r === "rafales 60 à 74 km/h")) { T.avNew++; BM.avNew++; }
      }
      const b = E.bandOf(x.score);
      const S = inSeason(date) ? "saison" : "hors";
      if (b) T.bands[S][b]++; else T.bands[S][0]++;
      if (x.score != null) T.favs[S].push(x.score);
    }
    if (el.length) {
      if (el[0].verify?.length) { T.topAV++; G.topAV++; }
      if (!el.some((x) => !x.verify?.length)) { T.noSure++; G.noSure++; }
      const b = E.bandOf(el[0].score); T.topBands[inSeason(date) ? "saison" : "hors"][b || 0]++;
      // 3. v1 et v2 sur la même journée réelle.
      const v1 = [...el].sort((a, c) => E.rankCompare({ ...a, ...a.v1 }, { ...c, ...c.v1 }));
      T.v1v2.n++; if (v1[0].id === el[0].id) T.v1v2.same1++;
      const t3 = new Set(v1.slice(0, 3).map((x) => x.id)); T.v1v2.over3 += el.slice(0, 3).filter((x) => t3.has(x.id)).length / Math.min(3, el.length);
    }
  }
}
// Résumé
const q = T.quality;
console.log(`[données] ${q.days} journées-guides · AROME présent ${pct(q.arome, q.days)} (sinon ECMWF seul) · houle ${pct(q.marine, q.days)} · eau ${pct(q.sst, q.days)}`);
console.log(`\n[1. coût de la prudence] ${T.spotDays} spots-journées · praticables ${pct(T.eligible, T.spotDays)} · non recommandés ${pct(T.nr, T.spotDays)}`);
console.log(`  à vérifier : ${pct(T.av, T.eligible)} des spots praticables ; dont à cause de tes seuils seulement (force 6, rafales 60 à 74 km/h) : ${pct(T.avNew, T.eligible)}`);
console.log(`  journées où le premier spot est à vérifier : ${pct(T.topAV, T.guideDays)} ; journées sans aucun spot sans doute : ${pct(T.noSure, T.guideDays)} ; sans aucun spot praticable : ${pct(T.noneEligible, T.guideDays)}`);
console.log("  raisons des « à vérifier » (un spot peut en avoir plusieurs) :");
for (const [k, v] of Object.entries(T.reasons).sort((a, b) => b[1] - a[1])) console.log(`    ${String(v).padStart(5)}  ${k}`);
console.log("  raisons des « non recommandé » :");
for (const [k, v] of Object.entries(T.nrReasons).sort((a, b) => b[1] - a[1])) console.log(`    ${String(v).padStart(5)}  ${k}`);
console.log("  par mois (à vérifier / praticables ; dont tes seuils seuls) :");
for (const [mo, v] of Object.entries(T.byMonth).sort()) console.log(`    ${mo} : ${pct(v.av, v.eligible)} ; ${pct(v.avNew, v.eligible)}`);
const bl = ["pas de note", "moins de 35", "35 à 49", "50 à 64", "65 à 79", "80 et plus"];
console.log(`\n[2. paliers] (tous spots praticables · premier du jour)`);
for (const S of ["saison", "hors"]) {
  const a = T.bands[S], b = T.topBands[S], na = a.reduce((x, y) => x + y, 0), nb = b.reduce((x, y) => x + y, 0);
  console.log(`  ${S === "saison" ? "mai à octobre" : "novembre à avril"} : ${bl.map((l, i) => `${l} ${pct(a[i], na)} · ${pct(b[i], nb)}`).join(" | ")}`);
  const v = [...T.favs[S]].sort((x, y) => x - y), qn = (p) => v[Math.min(v.length - 1, Math.floor(p * v.length))];
  if (v.length) console.log(`    favorabilité : 10e centile ${qn(0.1)}, médiane ${qn(0.5)}, 90e centile ${qn(0.9)}, maximum ${v[v.length - 1]}`);
}
console.log(`\n[3. v1 et v2 sur de vraies journées] même premier spot ${pct(T.v1v2.same1, T.v1v2.n)} · trois premiers en commun ${(100 * T.v1v2.over3 / Math.max(1, T.v1v2.n)).toFixed(1)} % (${T.v1v2.n} journées)`);
const J = out.guides.logonna?.journal || [];
console.log(`\n[4. journal] Moulin Mer :`);
for (const j of J) console.log(`  ${j.date} · ${j.fish} bar(s), ressenti ${j.result}/10 → favorabilité ${j.fav ?? "–"} (rang ${j.rank ?? "–"} sur ${j.of}), confiance ${j.conf ?? "–"}${j.verify.length ? `, à vérifier : ${j.verify.join(", ")}` : ""} ; crépuscule : ${j.dusk.map((d) => `${d.w} ${d.fav}`).join(", ") || "aucun créneau"}`);
out.totals = T;
if (outFile) fs.writeFileSync(outFile, JSON.stringify(out));
