// Garde-fou d'architecture (lot 3.4) : chaque couche n'importe que ce qu'elle a le droit d'utiliser.
//
//   design  → design                      composants et style neutres, sans métier
//   core    → core, design                commun au bord et au bateau (marée, soleil, stockage, synchronisation…)
//   bord    → bord, core, design          pêche du bord : moteur et interface des guides
//   bateau  → bateau, core, design        pêche en bateau : moteur, météo du large, interface
//   app     → tout                        coquille : points d'entrée, accueil, service hors ligne
//   studio  → bord, core, design          page d'analyse photo (non publiée)
//
// Le bord et le bateau ne s'importent jamais l'un l'autre : deux moteurs séparés.
// Usage : node tests/layers.mjs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = path.join(root, "src");
const ALLOWED = {
  design: ["design"], core: ["core", "design"], bord: ["bord", "core", "design"], bateau: ["bateau", "core", "design"],
  app: ["app", "core", "bord", "bateau", "design", "data"], studio: ["studio", "bord", "core", "design", "data"],
};
const layerOf = (abs) => {
  const rel = path.relative(root, abs).split(path.sep);
  if (rel[0] === "data") return "data";
  if (rel[0] !== "src") return "dehors";
  return rel.length === 2 ? "engine" : rel[1];
};
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(src).filter((f) => /\.(m?js|jsx)$/.test(f));
let bad = 0, edges = 0;
for (const f of files) {
  const from = layerOf(f);
  if (from === "engine") continue; // src/engine.js : tout le moteur sans interface, pour les tests
  if (!ALLOWED[from]) { console.log(`✗ ${path.relative(root, f)} : dossier inconnu « ${from} »`); bad++; continue; }
  const txt = fs.readFileSync(f, "utf8");
  for (const m of txt.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)["'](\.{1,2}\/[^"']+)["']/g)) {
    const tgt = path.resolve(path.dirname(f), m[1].replace(/\?.*$/, ""));
    edges++;
    if (!fs.existsSync(tgt)) { console.log(`✗ ${path.relative(root, f)} : fichier introuvable ${m[1]}`); bad++; continue; }
    const to = layerOf(tgt);
    if (!ALLOWED[from].includes(to)) { console.log(`✗ ${path.relative(root, f)} (${from}) importe ${path.relative(root, tgt)} (${to})`); bad++; }
  }
}
console.log(`${files.length} fichiers, ${edges} imports relatifs, ${bad} écart${bad > 1 ? "s" : ""} aux règles de couches`);
if (bad) process.exitCode = 1;
