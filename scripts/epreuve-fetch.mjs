// Phase 8 — Journées de référence de l'épreuve du moteur (spécification v2, §10) : la météo réellement prévue
// sur des journées passées, telle que l'application l'aurait téléchargée ce jour-là.
//
// Pour chaque guide et chaque date de data/epreuve/journees.json : prévisions archivées d'Open-Meteo (AROME et
// ECMWF, au point de chaque spot), houle et température de surface archivées (Open-Meteo Marine), passées par le
// code de l'application (fetchRaw, deriveDay). Une seule différence : la houle et l'eau sont demandées aussi pour
// les dates de plus de 80 jours (l'application ne le fait pas).
//
// Le bac à sable de Claude n'atteint pas Open-Meteo : ce script tourne dans l'intégration continue
// (.github/workflows/epreuve.yml), qui garde le résultat en artefact.
// Usage : node scripts/epreuve-fetch.mjs <dossier de sortie> [guide…]
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { SITES } from "./sites.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const [outDir = path.join(root, "out/epreuve"), ...only] = process.argv.slice(2);
const DATES = JSON.parse(fs.readFileSync(path.join(root, "data/epreuve/journees.json"), "utf8")).dates;
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(root, "tests/.build"), { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const addDays = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const report = [];
for (const s of SITES.filter((x) => !only.length || only.includes(x.key))) {
  const file = path.join(root, "tests/.build", `epreuve_${s.key}.mjs`);
  await build({ entryPoints: [path.join(root, "src/engine.js")], bundle: true, format: "esm", platform: "node", outfile: file, jsx: "automatic",
    external: ["react", "react/jsx-runtime", "react-dom"], logLevel: "warning",
    plugins: [{ name: "site", setup(b) { b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: path.join(root, s.config) })); } }] });
  const E = await import(file + `?t=${Date.now()}`);
  const days = {};
  let ok = 0, fail = 0, noMarine = 0;
  for (const date of DATES) {
    let live = null, lastErr = null;
    for (const pause of [0, 15000, 45000, 90000]) {
      if (pause) await wait(pause);
      try { live = E.deriveDay(await E.fetchRaw(addDays(date, -1), addDays(date, 1), date, { marineArchive: true }), date); break; }
      catch (e) { lastErr = e; if (!e?.isRateLimit && !/délai|fetch failed|ECONN|ETIMEDOUT|5\d\d/.test(String(e?.message))) break; }
    }
    if (live) {
      ok++;
      if (live.sst == null || !Object.values(live.series).some((x) => x.wave?.some((v) => v != null))) noMarine++;
      days[date] = live;
    } else { fail++; days[date] = { error: String(lastErr?.message || lastErr).slice(0, 300) }; }
    await wait(700);   // Open-Meteo gratuit : au plus quelques centaines d'appels par minute
  }
  fs.writeFileSync(path.join(outDir, `${s.key}.json`), JSON.stringify({ guide: s.key, siteId: E.SITE.id, fetchedAt: new Date().toISOString(), days }));
  const line = `${s.key} : ${ok} journées, ${fail} en échec, ${noMarine} sans houle ou sans eau`;
  report.push(line); console.log(line);
}
fs.writeFileSync(path.join(outDir, "RESUME.txt"), report.join("\n") + "\n");
