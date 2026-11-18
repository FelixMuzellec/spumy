// Phase 8 — Épreuve Monte Carlo du moteur v2 (spécification v2, §10).
//
// Sur les journées de référence (prévisions archivées, scripts/epreuve-fetch.mjs), chaque guide et chaque journée
// sont notés une fois tels quels (le classement « nominal »), puis N fois avec :
//   - les ENTRÉES perturbées selon leur incertitude : vent ±1 Beaufort (ou l'écart AROME/ECMWF s'il est plus grand),
//     direction ±1 secteur, houle ±25 %, eau ±1 °C, heures de marée ±10 min ;
//   - les HYPOTHÈSES perturbées selon leur niveau de preuve (niveau 2 : ±20 %, 4 : ±40 %, 5 : ±60 % ; niveau 1 fixe) :
//     poids de chaque critère, forme de la lumière, amplitude du vent et de la mer, présence (saison, eau), plage de
//     coefficient (±10 points), fenêtres de marée (±30 min).
// Chaque tirage tire tout au hasard, uniformément dans ces bornes, et indépendamment.
//
// Mesures : probabilité que le premier, et les trois premiers, restent ceux du classement nominal ; corrélation de
// rang (Spearman) ; stabilité du palier de chaque spot ; part de la variance de la favorabilité expliquée par chaque
// entrée et chaque hypothèse (corrélation au carré, normalisée) ; ce qui fait changer le premier.
// Critères (spécification) : trois premiers inchangés dans au moins 80 % des tirages ; une hypothèse de niveau 4 ou 5
// qui explique plus de 30 % de la variance est signalée.
//
// Usage : node scripts/epreuve-mc.mjs <dossier des journées> [tirages=1000] [mode=tout|entrees|hypotheses] [sortie.json] [guide,guide…]
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { SITES } from "./sites.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const [dataDir = path.join(root, "out/epreuve"), nArg = "1000", mode = "tout", outFile = null, onlyArg = ""] = process.argv.slice(2);
const ONLY = onlyArg ? onlyArg.split(",") : null;
const N = +nArg;
const useIn = mode !== "hypotheses", useHyp = mode !== "entrees";
fs.mkdirSync(path.join(root, "tests/.build"), { recursive: true });

// Générateur reproductible (mulberry32) : mêmes tirages d'un passage à l'autre.
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const U = (r) => 2 * r() - 1;   // uniforme sur [−1, 1]

// Hypothèses perturbées : nom, niveau de preuve, amplitude relative (selon le niveau), et comment l'appliquer.
const AMP = { 1: 0, 2: 0.2, 3: 0.3, 4: 0.4, 5: 0.6 };
export const HYP = [
  { k: "poids_fenetre", label: "Poids de la fenêtre de marée (25 / 15)", niveau: 4 },
  { k: "poids_coef", label: "Poids du coefficient (20)", niveau: 4 },
  { k: "plage_coef", label: "Plage utile du coefficient (±10 points)", niveau: 4, abs: 10 },
  { k: "fenetres", label: "Heures des fenêtres de marée (±30 min)", niveau: 4, abs: 0.5 },
  { k: "poids_lumiere", label: "Poids de la lumière (25)", niveau: 4 },
  { k: "nuit", label: "Valeur de la nuit (15 sur 25)", niveau: 4 },
  { k: "jour", label: "Valeur du plein jour (5 à 11 sur 25)", niveau: 4 },
  { k: "poids_vent", label: "Poids du vent et de la mer (30)", niveau: 4 },
  { k: "ampl_vent", label: "Amplitude du tableau vent et mer", niveau: 4 },
  { k: "saison", label: "Facteurs de saison", niveau: 4 },
  { k: "eau", label: "Paliers de température de l'eau", niveau: 4 },
];
export const INPUTS = [
  { k: "in_vent", label: "Force du vent (±1 Beaufort ou écart des modèles)" },
  { k: "in_dir", label: "Direction du vent (±1 secteur)" },
  { k: "in_houle", label: "Houle (±25 %)" },
  { k: "in_eau", label: "Température de l'eau (±1 °C)" },
  { k: "in_maree", label: "Heures de marée (±10 min)" },
];

const BASE = (E) => JSON.parse(JSON.stringify({ maree: E.V2.maree, lumiere: E.V2.lumiere, vent: E.V2.vent }));
function applyHyp(E, base, z) {
  const a = (k) => 1 + AMP[HYP.find((h) => h.k === k).niveau] * (z[k] || 0);
  E.V2.maree.prime = base.maree.prime * a("poids_fenetre"); E.V2.maree.bon = base.maree.bon * a("poids_fenetre");
  E.V2.maree.coef = base.maree.coef * a("poids_coef");
  const L = base.lumiere, kl = a("poids_lumiere"), top = L.aube * kl;
  E.V2.lumiere.aube = top; E.V2.lumiere.crepuscule = L.crepuscule * kl;
  E.V2.lumiere.nuit = Math.min(top, L.nuit * kl * a("nuit"));
  const kj = Math.min(a("jour"), top / ((L.jour + L.couvert + L.merFormee) * kl));   // le plein jour ne dépasse jamais l'aube
  E.V2.lumiere.jour = L.jour * kl * kj; E.V2.lumiere.couvert = L.couvert * kl * kj; E.V2.lumiere.merFormee = L.merFormee * kl * kj;
  E.V2.vent = base.vent * a("poids_vent");
  E.V2.mc.ventAmp = a("ampl_vent"); E.V2.mc.kSeason = a("saison"); E.V2.mc.kThermal = a("eau");
  E.V2.mc.coefShift = (z.plage_coef || 0) * 10;
}
function resetHyp(E, base) {
  Object.assign(E.V2.maree, base.maree); Object.assign(E.V2.lumiere, base.lumiere); E.V2.vent = base.vent;
  Object.assign(E.V2.mc, { coefShift: 0, ventAmp: 1, kSeason: 1, kThermal: 1 });
}
// Entrées perturbées : une seule erreur par journée et par guide (l'erreur d'une prévision est régionale).
function perturbLive(live, z) {
  const series = {};
  for (const [key, s] of Object.entries(live.series || {})) {
    const o = { ...s };
    if (z.in_vent) o.wind = s.wind.map((v, i) => { if (v == null) return v; const w2 = s.wind2?.[i]; const sp = Math.max(0.3 * v, w2 != null ? Math.abs(v - w2) : 0); return Math.max(0, v + z.in_vent * sp); });
    if (z.in_vent && s.gust) o.gust = s.gust.map((g, i) => (g == null || s.wind[i] == null || s.wind[i] === 0 ? g : Math.max(0, g * o.wind[i] / s.wind[i])));
    if (z.in_dir) o.dir = s.dir.map((d) => (d == null ? d : (d + 22.5 * z.in_dir + 360) % 360));
    if (z.in_houle) { o.wave = s.wave?.map((h) => (h == null ? h : h * (1 + 0.25 * z.in_houle))); o.swell = s.swell?.map((h) => (h == null ? h : h * (1 + 0.25 * z.in_houle))); }
    if (z.in_eau) o.sst = s.sst?.map((t) => (t == null ? t : t + z.in_eau));
    series[key] = o;
  }
  return { ...live, series, sst: live.sst != null && z.in_eau ? live.sst + z.in_eau : live.sst };
}
function shiftedTide(base, hours) {
  if (!hours) return base;
  const cache = new Map();
  return (port) => {
    if (!cache.has(port)) {
      const t = base(port);
      cache.set(port, { ...t, events: (t.events || []).map((e) => ({ ...e, dec: e.dec + hours, ms: Number.isFinite(e.ms) ? e.ms + hours * 36e5 : e.ms })) });
    }
    return cache.get(port);
  };
}
function spearman(a, b) {
  const common = a.filter((x) => b.includes(x));
  const n = common.length; if (n < 3) return null;
  const ra = new Map(a.filter((x) => common.includes(x)).map((x, i) => [x, i])), rb = new Map(b.filter((x) => common.includes(x)).map((x, i) => [x, i]));
  let d2 = 0; for (const x of common) d2 += (ra.get(x) - rb.get(x)) ** 2;
  return 1 - (6 * d2) / (n * (n * n - 1));
}
const corr = (x, y) => {
  const n = x.length; if (n < 3) return 0;
  let mx = 0, my = 0; for (let i = 0; i < n; i++) { mx += x[i]; my += y[i]; } mx /= n; my /= n;
  let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { const a = x[i] - mx, b = y[i] - my; sxy += a * b; sxx += a * a; syy += b * b; }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
};

const KEYS = [...(useHyp ? HYP.map((h) => h.k) : []), ...(useIn ? INPUTS.map((x) => x.k) : [])];
const out = { mode, N, keys: KEYS, guides: {}, dates: 0 };
const t0 = Date.now();
for (const s of SITES.filter((x) => !ONLY || ONLY.includes(x.key))) {
  const f = path.join(dataDir, `${s.key}.json`);
  if (!fs.existsSync(f)) { console.log(`${s.key} : pas de journées (${f})`); continue; }
  const data = JSON.parse(fs.readFileSync(f, "utf8"));
  const file = path.join(root, "tests/.build", `mc_${s.key}.mjs`);
  await build({ entryPoints: [path.join(root, "src/engine.js")], bundle: true, format: "esm", platform: "node", outfile: file, jsx: "automatic",
    external: ["react", "react/jsx-runtime", "react-dom"], logLevel: "warning",
    plugins: [{ name: "site", setup(b) { b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: path.join(root, s.config) })); } }] });
  const E = await import(file + `?t=${Date.now()}`);
  const base = BASE(E);
  const G = (out.guides[s.key] = { days: [] });
  let seed = 1;
  for (const [date, live] of Object.entries(data.days)) {
    if (!live || live.error || live.journal) continue;
    const opts = { engine: "v2", hours: E.DEFAULT_HOURS, robust: false, pertinence: false, clock: Date.parse(`${date}T05:00:00Z`) };
    const tide0 = E.makeTideFor(date);
    resetHyp(E, base);
    const nom = E.rankDay(date, live, { ...opts, tideFor: tide0 }).filter((x) => x.eligible && x.v2.fav != null);
    if (nom.length < 2) { G.days.push({ date, n: nom.length, skipped: true }); continue; }
    const nomIds = nom.map((x) => x.id), top3 = new Set(nomIds.slice(0, 3));
    // Groupes d'égalité du classement nominal (3 points ou moins, comme l'écran) : un tirage qui ne fait que permuter
    // des spots à égalité ne change pas le conseil.
    const tie1 = new Set(nom.filter((x) => !x.verify?.length === !nom[0].verify?.length && nom[0].v2.fav - x.v2.fav <= 3).map((x) => x.id));
    const third = nom[Math.min(2, nom.length - 1)];
    const tie3 = new Set([...top3, ...nom.filter((x) => !x.verify?.length === !third.verify?.length && third.v2.fav - x.v2.fav <= 3).map((x) => x.id)]);
    const nomBand = Object.fromEntries(nom.map((x) => [x.id, E.bandOf(x.v2.fav)]));
    const r = rng(1000 * (seed++) + s.key.length);
    let same1 = 0, same3 = 0, spSum = 0, spN = 0, tie1Ok = 0, tie3Ok = 0;
    const bandSame = Object.fromEntries(nomIds.map((id) => [id, 0])), bandN = Object.fromEntries(nomIds.map((id) => [id, 0]));
    const Z = [], fav = Object.fromEntries(nomIds.map((id) => [id, []])), zFor = Object.fromEntries(nomIds.map((id) => [id, []])), flip = [];
    for (let i = 0; i < N; i++) {
      const z = {};
      for (const k of KEYS) z[k] = U(r);
      if (useHyp) applyHyp(E, base, z); else resetHyp(E, base);
      const lv = useIn ? perturbLive(live, z) : live;
      const tide = shiftedTide(tide0, (useIn ? (z.in_maree || 0) * 10 / 60 : 0) + (useHyp ? (z.fenetres || 0) * 0.5 : 0));
      const day = E.rankDay(date, lv, { ...opts, tideFor: tide }).filter((x) => x.eligible && x.v2.fav != null);
      const ids = day.map((x) => x.id);
      const s1 = ids[0] === nomIds[0], s3 = ids.slice(0, 3).every((id) => top3.has(id)) && ids.length >= Math.min(3, nomIds.length);
      same1 += s1; same3 += s3; flip.push(s1 ? 0 : 1); Z.push(z);
      if (tie1.has(ids[0])) tie1Ok++;
      if (ids.slice(0, 3).every((id) => tie3.has(id))) tie3Ok++;
      const sp = spearman(nomIds, ids); if (sp != null) { spSum += sp; spN++; }
      for (const x of day) if (fav[x.id]) { fav[x.id].push(x.v2.fav); zFor[x.id].push(z); bandN[x.id]++; if (E.bandOf(x.v2.fav) === nomBand[x.id]) bandSame[x.id]++; }
    }
    resetHyp(E, base);
    // Part de variance de la favorabilité par entrée et par hypothèse (corrélation au carré, normalisée), pondérée
    // par la variance de chaque spot ; ce qui fait changer le premier (corrélation avec l'indicateur « premier changé »).
    const share = Object.fromEntries(KEYS.map((k) => [k, 0])); let wsum = 0;
    for (const id of nomIds) {
      const y = fav[id]; if (y.length < 30) continue;
      const m = y.reduce((a, b) => a + b, 0) / y.length, v = y.reduce((a, b) => a + (b - m) ** 2, 0) / y.length;
      if (v < 1e-9) continue;
      const c2 = KEYS.map((k) => corr(zFor[id].map((z) => z[k]), y) ** 2), tot = c2.reduce((a, b) => a + b, 0) || 1;
      KEYS.forEach((k, j) => { share[k] += v * c2[j] / tot; }); wsum += v;
    }
    for (const k of KEYS) share[k] = wsum ? share[k] / wsum : 0;
    const flipC = Object.fromEntries(KEYS.map((k) => [k, Math.abs(corr(Z.map((z) => z[k]), flip))]));
    G.days.push({ date, n: nomIds.length, top1: nomIds[0], gap12: +(nom[0].v2.fav - nom[1].v2.fav).toFixed(1), p1: same1 / N, p3: same3 / N, p1t: tie1Ok / N, p3t: tie3Ok / N, spearman: spN ? spSum / spN : null,
                  band: Object.fromEntries(nomIds.map((id) => [id, bandN[id] ? bandSame[id] / bandN[id] : null])), share, flipC });
    out.dates++;
  }
  const d = G.days.filter((x) => !x.skipped);
  const mean = (f) => d.reduce((a, x) => a + f(x), 0) / Math.max(1, d.length);
  G.summary = { days: d.length, p1: mean((x) => x.p1), p3: mean((x) => x.p3), p1t: mean((x) => x.p1t), p3t: mean((x) => x.p3t), spearman: mean((x) => x.spearman ?? 0), ok80: d.filter((x) => x.p3 >= 0.8).length, ok80t: d.filter((x) => x.p3t >= 0.8).length,
                share: Object.fromEntries(KEYS.map((k) => [k, mean((x) => x.share[k])])), flipC: Object.fromEntries(KEYS.map((k) => [k, mean((x) => x.flipC[k])])) };
  console.log(`${s.key.padEnd(13)} ${String(d.length).padStart(3)} journées · premier inchangé ${(100 * G.summary.p1).toFixed(0)} % (à égalité près ${(100 * G.summary.p1t).toFixed(0)} %) · trois premiers ${(100 * G.summary.p3).toFixed(0)} % (${(100 * G.summary.p3t).toFixed(0)} %) · journées ≥ 80 % : ${G.summary.ok80} (${G.summary.ok80t}) · Spearman ${G.summary.spearman.toFixed(2)} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
// Agrégat des sept guides.
const all = Object.values(out.guides).flatMap((g) => g.days.filter((x) => !x.skipped));
const m = (f) => all.reduce((a, x) => a + f(x), 0) / Math.max(1, all.length);
out.summary = { days: all.length, p1: m((x) => x.p1), p3: m((x) => x.p3), p1t: m((x) => x.p1t), p3t: m((x) => x.p3t), spearman: m((x) => x.spearman ?? 0),
                ok80: all.filter((x) => x.p3 >= 0.8).length, ok80t: all.filter((x) => x.p3t >= 0.8).length,
                share: Object.fromEntries(KEYS.map((k) => [k, m((x) => x.share[k])])), flipC: Object.fromEntries(KEYS.map((k) => [k, m((x) => x.flipC[k])])),
                bandStable: (() => { const v = all.flatMap((x) => Object.values(x.band).filter((b) => b != null)); return v.reduce((a, b) => a + b, 0) / Math.max(1, v.length); })(),
                closeTop: all.filter((x) => x.gap12 <= 3).length };
const label = Object.fromEntries([...HYP, ...INPUTS].map((h) => [h.k, h.label]));
console.log(`\n[Monte Carlo · ${mode} · ${N} tirages] ${all.length} journées-guides`);
console.log(`  premier inchangé : ${(100 * out.summary.p1).toFixed(1)} % (dans le groupe d'égalité : ${(100 * out.summary.p1t).toFixed(1)} %) · trois premiers inchangés : ${(100 * out.summary.p3).toFixed(1)} % (${(100 * out.summary.p3t).toFixed(1)} %)`);
console.log(`  journées où les trois premiers tiennent dans 80 % des tirages : ${out.summary.ok80}/${all.length} (à égalité près : ${out.summary.ok80t}/${all.length})`);
console.log(`  Spearman moyen : ${out.summary.spearman.toFixed(2)} · palier inchangé : ${(100 * out.summary.bandStable).toFixed(1)} % · premier et deuxième à 3 points ou moins : ${out.summary.closeTop}/${all.length}`);
console.log("  part de la variance de la favorabilité :");
for (const [k, v] of Object.entries(out.summary.share).sort((a, b) => b[1] - a[1])) {
  const h = HYP.find((x) => x.k === k), flag = h && h.niveau >= 4 && v > 0.3 ? "  ⚠ niveau ≥ 4 et plus de 30 %" : "";
  console.log(`    ${(100 * v).toFixed(1).padStart(5)} %  ${label[k]}${h ? ` (niveau ${h.niveau})` : " (entrée)"}${flag}`);
}
console.log("  ce qui fait changer le premier (corrélation avec « premier changé ») :");
for (const [k, v] of Object.entries(out.summary.flipC).sort((a, b) => b[1] - a[1]).slice(0, 6)) console.log(`    ${v.toFixed(2)}  ${label[k]}`);
if (outFile) fs.writeFileSync(outFile, JSON.stringify(out));
