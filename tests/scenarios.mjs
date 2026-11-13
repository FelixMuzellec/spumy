// Grille de scénarios du moteur BORD (phase 4) : chaque spot des sept guides passé sur une grille de météos,
// pour voir ce que le moteur propose quand le vent, les rafales ou la houle deviennent dangereux ou inconnus.
//
//   node tests/scenarios.mjs <fichier.json>             écrit tous les résultats (une ligne par spot et scénario)
//   node tests/scenarios.mjs --compare <avant> <après>   compte et classe les différences entre deux passages
//
// Grille : 8 directions × 7 forces de vent moyen (0 à 9 Beaufort) × 5 rafales (45, 60, 75, 90 km/h, inconnues)
// × 4 houles (0,5 m, 1,5 m, 3 m, inconnue) = 1 120 météos par spot, plus un cas « aucune météo » (Open-Meteo
// injoignable, sans cache), sur son premier créneau « prime » (coefficient 70, aube, septembre, eau 15 °C,
// pression 1 015 hPa stable, sans journal).
// Revue finale des phases 3 et 4 : les rafales « aucune » de la phase 4 (valeur absente) sont devenues ce qu'elles
// sont, des rafales inconnues ; les rafales faibles connues sont représentées par 45 km/h.
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { SITES } from "../scripts/sites.mjs";

const here = path.dirname(new URL(import.meta.url).pathname), root = path.resolve(here, "..");
const DIRS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
const FORCES = [0, 2, 4, 6, 7, 8, 9];
const KMH = { 0: 0, 2: 9, 4: 24, 6: 44, 7: 55, 8: 68, 9: 81 };   // milieu de chaque force (Météo-France, guide marine)
const GUSTS = [45, 60, 75, 90, null];
const HOULES = [0.5, 1.5, 3, null];
const GOOD = 7;

async function run(outFile) {
  fs.mkdirSync(path.join(here, ".build"), { recursive: true });
  const rows = [];
  for (const s of SITES) {
    const out = path.join(here, ".build", `scen_${s.key}.mjs`);
    await build({
      entryPoints: [path.join(root, "src/engine.js")], bundle: true, format: "esm", platform: "node", outfile: out,
      jsx: "automatic", external: ["react", "react/jsx-runtime", "react-dom"], logLevel: "warning",
      plugins: [{ name: "site", setup(b) { b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: path.join(root, s.config) })); } }],
    });
    const E = await import(out + `?t=${Date.now()}`);
    for (const spot of E.SPOTS) {
      const w0 = spot.tidalRules.windows.find((w) => w.priority === "prime") || spot.tidalRules.windows[0];
      const sea = E.SITE.zones?.[spot.zone]?.sea || "?";
      for (const dir of DIRS) for (const f of FORCES) for (const gust of GUSTS) for (const h of HOULES) {
        const zw = { wind_dir: dir, wind_force: f, wind_kmh: KMH[f], windKnown: true, gust_kmh: gust, houle: h ?? 0, houleKnown: h != null, sky: "partly", cloud: 50 };
        const win = { ...w0, coeff: 70, light: { band: "aube", label: "Aube" } };
        const ctx = { zw, coeff: 70, pressure: 1015, pressureTrend: "stable", sst: 15, sstConf: "modele", calib: {}, month: 9 };
        const r = E.scoreWindow(spot, win, ctx);
        const safety = E.safetyOf ? E.safetyOf(spot, { zw, light: win.light }, {}) : null;
        rows.push({ g: s.key, id: spot.id, sea, dl: spot.dangerLevel, dir, f, gust, h,
          el: r.eligible, sc: r.eligible ? r.score : null, raw: r.eligible ? r.rawScore : null,
          ver: (r.verify || []).map((v) => v.k || v).join("|") || "", why: r.eligible ? "" : r.reason, safe: safety?.level || "" });
      }
      // Aucune météo : ce que le guide fait quand Open-Meteo ne répond pas et qu'il n'a rien en cache.
      const zn = E.zoneWeather(null, spot), win = { ...w0, coeff: 70, light: { band: "aube", label: "Aube" } };
      const rn = E.scoreWindow(spot, win, { zw: zn, coeff: 70, pressure: null, pressureTrend: null, sst: null, sstConf: null, calib: {}, month: 9 });
      rows.push({ g: s.key, id: spot.id, sea, dl: spot.dangerLevel, dir: "-", f: null, gust: null, h: null, nowx: true,
        el: rn.eligible, sc: rn.eligible ? rn.score : null, raw: rn.eligible ? rn.rawScore : null,
        ver: (rn.verify || []).map((v) => v.k || v).join("|") || "", why: rn.eligible ? "" : rn.reason, safe: E.safetyOf(spot, { zw: zn, light: win.light }, { degraded: true }).level });
    }
  }
  fs.writeFileSync(outFile, JSON.stringify(rows));
  summarize(rows, "résultats");
}

function summarize(rows, title) {
  const nowx = rows.filter((r) => r.nowx), all = rows; rows = rows.filter((r) => !r.nowx);
  const n = all.length;
  const danger = rows.filter((r) => r.f >= 8 || r.gust >= 90);
  const doubt = rows.filter((r) => !(r.f >= 8 || r.gust >= 90) && (r.f === 7 || r.gust === 75 || r.gust == null || (r.h == null && r.sea !== "rade")));
  const calm = rows.filter((r) => r.f <= 4 && r.gust === 45 && r.h === 0.5);
  const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(1)} %` : "–");
  const line = (label, set) => {
    const el = set.filter((r) => r.el).length, green = set.filter((r) => r.el && r.sc >= GOOD && !r.ver).length;
    console.log(`  ${label.padEnd(64)} ${String(set.length).padStart(6)} cas · proposés ${String(el).padStart(6)} (${pct(el, set.length)}) · au vert ${String(green).padStart(6)} (${pct(green, set.length)})`);
  };
  console.log(`\n${title} : ${n} cas (${new Set(rows.map((r) => r.g + "/" + r.id)).size} spots)`);
  line("Danger annoncé (vent moyen ≥ force 8 ou rafales ≥ 90 km/h)", danger);
  line("Doute (force 7, rafales ≥ 75 km/h ou inconnues, houle inconnue en côte ouverte)", doubt);
  line("Calme et connu (force ≤ 4, rafales 45 km/h, houle 0,5 m)", calm);
  line("Sans aucune météo (Open-Meteo injoignable, rien en cache)", nowx);
  line("  dont spots de rade", nowx.filter((r) => r.sea === "rade"));
  line("Rafales inconnues, vent et houle connus", rows.filter((r) => r.gust == null && r.f <= 6 && r.h != null));
  const pm = rows.find((r) => r.g === "logonna" && r.id === "moulinmer" && r.dir === "NE" && r.f === 9 && r.gust === 90 && r.h === 0.5);
  if (pm) console.log(`  Cas de la phase 1 — Moulin Mer, NE force 9, rafales 90 km/h : ${pm.el ? `proposé, note ${pm.sc}` : `non proposé (${pm.why})`} ; sécurité « ${pm.safe} »`);
  const hu = rows.filter((r) => r.h == null && r.sea !== "rade" && r.f <= 2 && r.gust === 45 && r.el && r.sc >= GOOD && !r.ver);
  console.log(`  Houle inconnue, vent faible, côte ouverte : ${hu.length} cas au vert${hu[0] ? ` (ex. ${hu[0].g}/${hu[0].id} ${hu[0].dir} F${hu[0].f} : ${hu[0].sc})` : ""}`);
}

function compare(a, b) {
  const A = JSON.parse(fs.readFileSync(a, "utf8")), B = JSON.parse(fs.readFileSync(b, "utf8"));
  if (A.length !== B.length) throw new Error(`grilles différentes : ${A.length} / ${B.length}`);
  summarize(A, "avant"); summarize(B, "après");
  const cls = {};
  let same = 0;
  for (let i = 0; i < A.length; i++) {
    const x = A[i], y = B[i];
    if (x.g !== y.g || x.id !== y.id || x.dir !== y.dir || x.f !== y.f || x.gust !== y.gust || x.h !== y.h) throw new Error(`ligne ${i} : scénarios désalignés`);
    if (x.el === y.el && x.sc === y.sc && x.ver === y.ver && x.safe === y.safe) { same++; continue; }
    const k = x.el && !y.el ? `retiré : ${y.why.split(" (")[0].split(" :")[0]}` : !x.el && y.el ? "remis" : x.ver !== y.ver ? `à vérifier : ${y.ver || "plus"}` : x.sc !== y.sc ? "note changée" : `sécurité ${x.safe} → ${y.safe}`;
    cls[k] = (cls[k] || 0) + 1;
  }
  console.log(`\nIdentiques : ${same} / ${A.length}`);
  for (const [k, v] of Object.entries(cls).sort((p, q) => q[1] - p[1])) console.log(`  ${String(v).padStart(6)}  ${k}`);
  const calmChanged = A.filter((x, i) => !x.nowx && x.f <= 4 && x.gust != null && x.gust < 75 && x.h != null && (x.el !== B[i].el || x.sc !== B[i].sc || x.ver !== B[i].ver)).length;
  console.log(`Changements par temps calme, rafales et houle connues (force ≤ 4, rafales < 75 km/h) : ${calmChanged}`);
  const sureIdx = A.map((x, i) => (!x.nowx && !(x.f >= 7) && x.gust != null && x.gust < 75 && (x.h != null || x.sea === "rade") ? i : -1)).filter((i) => i >= 0);
  const sure = sureIdx.map((i) => A[i]);
  const sureSame = sureIdx.filter((i) => A[i].el === B[i].el && A[i].sc === B[i].sc && A[i].ver === B[i].ver && A[i].safe === B[i].safe).length;
  console.log(`Cas sans aucun doute (force ≤ 6, rafales connues < 75 km/h, houle connue ou rade) : ${sureSame} identiques sur ${sure.length}`);
}

const args = process.argv.slice(2);
if (args[0] === "--compare") compare(args[1], args[2]);
else if (args[0]) await run(args[0]);
else console.log("usage : node tests/scenarios.mjs <fichier.json> | --compare <avant.json> <après.json>");
