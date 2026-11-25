// Toutes les vérifications en une commande, une ligne par suite (Félix, 25 nov. 2026, 20 h 36 : mêmes contrôles, moins
// de jetons). Le détail d'une suite ne s'affiche que si elle échoue (ses 40 dernières lignes). Mêmes suites que le gate
// de phase : construction sans écart, npm test, accessibilité, mise à jour, prototypes, marque, indicateurs.
// Usage : npm run -s verifier [-- --rapide]   (--rapide : sans npm test complet ni prototypes, pour les retouches)
import { spawnSync, execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rapide = process.argv.includes("--rapide");
const git = (...a) => execFileSync("git", a, { cwd: RACINE }).toString();
const propre = (f) => git("status", "--porcelain", "--", f).trim() === "";

// La construction ne doit rien changer aux fichiers publiés : on compare l'état Git avant et après (ce qui était déjà
// modifié avant la commande n'est pas compté).
const avant = git("status", "--porcelain");
const SUITES = [
  ["construction sans écart", "npm run -s build >/dev/null && git status --porcelain", false, (sortie) => sortie.split("\n").filter((l) => l.trim() && !avant.includes(l) && !l.endsWith("prototype/app.js")).length === 0],
  ["npm test (lint, couches, données, pare-feux, sabotage, unitaires, e2e…)", "npm test", true],
  ["lint et pare-feux (mode rapide)", "npm run -s lint && npm run -s test:pare-feux", "rapide"],
  ["accessibilité", "npm run -s test:a11y"],
  ["mise à jour sans perte", "npm run -s test:upgrade"],
  ["prototype V2", "npm run -s test:prototype", true],
  ["prototype V3", "npm run -s test:prototype-v3", true],
  ["marque (logo)", "python3 -I tests/brand.py"],
  ["indicateurs (cliquet, seuils)", "node scripts/kpi/mesurer.mjs --verifier"],
];

const prototypePropre = propre("prototype/app.js");
let echecs = 0;
for (const [nom, cmd, lourd, valide] of SUITES) {
  if (lourd === "rapide" ? !rapide : rapide && lourd) { if (rapide) console.log(`· ${nom} : sautée (--rapide)`); continue; }
  const t0 = Date.now();
  const r = spawnSync("bash", ["-c", cmd], { cwd: RACINE, encoding: "utf8", maxBuffer: 256e6 });
  const sortie = `${r.stdout}\n${r.stderr}`;
  const resume = sortie.split("\n").filter((l) => /\d+\/\d+|\[[^\]]+\]|violation|aucun écart/i.test(l)).slice(-3).map((l) => l.trim().slice(0, 90)).join(" ; ");
  const ok = r.status === 0 && (!valide || valide(r.stdout));
  if (!ok) echecs++;
  console.log(`${ok ? "✓" : "✗"} ${nom} (${Math.round((Date.now() - t0) / 1000)} s, code ${r.status})${resume ? " — " + resume : ""}`);
  if (!ok) console.log(sortie.split("\n").slice(-40).map((l) => `    ${l}`).join("\n"));
}
// La reconstruction du prototype V2 recalcule les dates de sa journée (écart connu, sans lien avec le code) : rendu tel quel.
if (prototypePropre && !propre("prototype/app.js")) git("checkout", "-q", "--", "prototype/app.js");
const lancees = SUITES.filter(([, , l]) => (l === "rapide" ? rapide : !(rapide && l))).length;
console.log(`[verifier] ${lancees - echecs}/${lancees} suites au vert${rapide ? " (mode rapide)" : ""}`);
process.exit(echecs ? 1 : 0);
