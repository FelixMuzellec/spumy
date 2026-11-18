// Phase 7 — Les deux moteurs sur les mêmes journées (spécification v2, §11) : quand le premier spot change entre la
// note sur 10 (v1) et la favorabilité sur 100 (v2), dire pourquoi.
//
// Journées : le 15 de chaque mois de 2026 (marée réelle calculée pour ce jour), × 8 directions de vent × 3 forces
// (1, 3, 5 Beaufort, rafales et houle qui vont avec), pour les sept guides. Météo de zone fixe sur la journée,
// température de l'eau estimée par mois (valeurs de saison de Brest arrondies, ESTIMATION, pas une mesure),
// pression stable à 1 015 hPa. Ce sont des journées d'essai, pas des journées réelles : les journées archivées
// d'Open-Meteo viendront en phase 8 (plan Monte Carlo).
//
// Pour chaque écart de premier spot (A premier en v1, B premier en v2), la cause retenue est, dans l'ordre :
//   « créneau »   : le meilleur créneau de A ou de B n'est pas le même dans les deux moteurs ;
//   « ensemble »  : la note ponctuelle de la v1 classait déjà B devant A ; c'est l'ensemble de météos plausibles de
//                   la v1 (±1 Beaufort, ±1 secteur) qui mettait A devant ;
//   sinon la famille dont le poids relatif a le plus bougé en faveur de B entre les deux moteurs (marée, vent et mer,
//   lumière, saison et eau, pression et autres termes retirés de la v2), écarts ramenés sur 100.
// Usage : node tests/compare-v1v2.mjs [rapport.json]
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { SITES } from "../scripts/sites.mjs";

const here = path.dirname(new URL(import.meta.url).pathname), root = path.resolve(here, "..");
fs.mkdirSync(path.join(here, ".build"), { recursive: true });
const DIRS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
const FORCES = { 1: { kmh: 4, gust: 12, houle: 0.4 }, 3: { kmh: 15, gust: 30, houle: 0.8 }, 5: { kmh: 34, gust: 50, houle: 1.5 } };
const SST = [11, 10.5, 10.5, 11.5, 13, 15, 16.5, 17.5, 17, 15.5, 13.5, 12];
const FAM = { maree: "marée", vent: "vent et mer", lumiere: "lumière", saison: "saison et eau", autre: "pression et autres termes retirés" };

const out = { cases: 0, compared: 0, top1Same: 0, top3Overlap: 0, spearman: 0, nSpear: 0, causes: {}, examples: {}, byGuide: {} };
for (const s of SITES) {
  const file = path.join(here, ".build", `cmp_${s.key}.mjs`);
  await build({ entryPoints: [path.join(root, "src/engine.js")], bundle: true, format: "esm", platform: "node", outfile: file, jsx: "automatic",
    external: ["react", "react/jsx-runtime", "react-dom"], logLevel: "warning",
    plugins: [{ name: "site", setup(b) { b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: path.join(root, s.config) })); } }] });
  const E = await import(file + `?t=${Date.now()}`);
  const g = (out.byGuide[s.key] = { cases: 0, compared: 0, top1Same: 0 });
  const fam1 = (parts) => {
    const v = { maree: 0, vent: 0, lumiere: 0, saison: 0, autre: 0 };
    for (const p of parts || []) {
      const k = String(p.k);
      if (/^Coef\b|^Fenêtre prime/.test(k)) v.maree += p.v; else if (/^Vent\b|^Rafales\b/.test(k)) v.vent += p.v;
      else if (/^Saison\b|^Eau\b/.test(k)) v.saison += p.v; else if (/^Pression\b|^Journal\b/.test(k)) v.autre += p.v; else v.lumiere += p.v;
    }
    for (const k in v) v[k] *= 10;            // points sur 10 → sur 100
    return v;
  };
  const fam2 = (f) => {
    const p = (ks) => f.crit.filter((c) => ks.includes(c.k)).reduce((a, c) => a + c.pts, 0) * f.pres.factor;
    return { maree: p(["fenetre", "coef"]), vent: p(["vent"]), lumiere: p(["lumiere"]), saison: -(f.cond ?? 0) * (1 - f.pres.factor), autre: 0 };
  };
  for (let m = 1; m <= 12; m++) {
    const date = `2026-${String(m).padStart(2, "0")}-15`;
    const tideFor = E.makeTideFor(date);
    for (const dir of DIRS) for (const [F, x] of Object.entries(FORCES)) {
      const live = { date, wind_dir: dir, wind_force: +F, wind_kmh: x.kmh, gust_kmh: x.gust, houle: x.houle, sky: "partly", sst: SST[m - 1], sst_confidence: "modele",
                     pressure: 1015, pressure_trend: "stable", _wxAt: Date.parse(`${date}T04:00:00Z`) };
      const day = E.rankDay(date, live, { engine: "v2", tideFor, hours: E.DEFAULT_HOURS, clock: Date.parse(`${date}T05:00:00Z`), pertinence: false });
      out.cases++; g.cases++;
      const el = day.filter((sp) => sp.eligible && sp.v2.fav != null);
      if (el.length < 2) continue;
      const v1 = [...el].sort((a, b) => E.rankCompare({ ...a, ...a.v1 }, { ...b, ...b.v1 }));
      const v2 = el;                          // déjà dans l'ordre de la v2
      out.compared++; g.compared++;
      const r1 = new Map(v1.map((sp, i) => [sp.id, i])), n = el.length;
      if (n >= 3) { const d2 = v2.reduce((a, sp, i) => a + (i - r1.get(sp.id)) ** 2, 0); out.spearman += 1 - (6 * d2) / (n * (n * n - 1)); out.nSpear++; }
      const t3 = new Set(v1.slice(0, 3).map((sp) => sp.id));
      out.top3Overlap += v2.slice(0, 3).filter((sp) => t3.has(sp.id)).length / Math.min(3, n);
      const A = v1[0], B = v2[0];
      if (A.id === B.id) { out.top1Same++; g.top1Same++; continue; }
      let cause;
      if (A.v1.bestWindowId !== A.bestWindowId || B.v1.bestWindowId !== B.bestWindowId) cause = "créneau";
      else {
        const pA = A.windows.find((w) => w.id === A.bestWindowId)?.pointScore, pB = B.windows.find((w) => w.id === B.bestWindowId)?.pointScore;
        if (Number.isFinite(pA) && Number.isFinite(pB) && pB >= pA) cause = "ensemble";
        else {
          const a1 = fam1(A.v1.bestParts), b1 = fam1(B.v1.bestParts), a2 = fam2(A.v2.f), b2 = fam2(B.v2.f);
          const shift = Object.keys(FAM).map((k) => [k, (b2[k] - a2[k]) - (b1[k] - a1[k])]).sort((x, y) => y[1] - x[1]);
          cause = FAM[shift[0][0]];
        }
      }
      out.causes[cause] = (out.causes[cause] || 0) + 1;
      (out.examples[cause] ||= []).length < 3 && out.examples[cause].push(`${s.key} ${date} ${dir} F${F} : v1 ${A.name} (${A.v1.score}) → v2 ${B.name} (${B.v2.fav} ; ${A.name} ${A.v2.fav})`);
    }
  }
}
const pct = (a, b) => `${((100 * a) / Math.max(1, b)).toFixed(1)} %`;
console.log(`[v1 / v2] ${out.cases} journées d'essai (7 guides × 12 mois × 24 météos), ${out.compared} avec au moins deux spots notés`);
console.log(`  même premier spot : ${out.top1Same} (${pct(out.top1Same, out.compared)}) · trois premiers en commun : ${(100 * out.top3Overlap / out.compared).toFixed(1)} % · corrélation de rang moyenne (Spearman) : ${(out.spearman / out.nSpear).toFixed(2)}`);
const diff = out.compared - out.top1Same;
console.log(`  premier spot différent : ${diff}, cause :`);
for (const [k, v] of Object.entries(out.causes).sort((a, b) => b[1] - a[1])) console.log(`    ${String(v).padStart(5)} (${pct(v, diff)})  ${k}${out.examples[k] ? `  — ex. ${out.examples[k][0]}` : ""}`);
for (const [k, v] of Object.entries(out.byGuide)) console.log(`  ${k.padEnd(13)} même premier spot ${pct(v.top1Same, v.compared)} (${v.compared} journées)`);
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
