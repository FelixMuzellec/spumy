// Essais de sabotage des pare-feux (PF-42, PF-45) : chaque essai viole volontairement une consigne de Félix dans une
// copie jetable du dépôt (git worktree de HEAD) ; tests/pare-feux.mjs doit échouer avec le bon message. Un pare-feu
// qui laisse passer une violation simulée est un trou : ce test le dit.
// Usage : node tests/pare-feux-sabotage.mjs   (sur l'état commité : HEAD)
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REGLES } from "./pare-feux/regles.mjs";
import { EXIGENCES } from "./pare-feux/exigences.mjs";
import { phaseAutorisee } from "../scripts/pare-feux/branche.mjs";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COPIE = fs.mkdtempSync(path.join(os.tmpdir(), "spumy-sabotage-"));
const git = (...a) => execFileSync("git", a, { cwd: COPIE, stdio: ["ignore", "pipe", "pipe"] }).toString();
execFileSync("git", ["worktree", "add", "-q", "--detach", COPIE, "HEAD"], { cwd: RACINE });
if (fs.existsSync(path.join(RACINE, "node_modules"))) fs.symlinkSync(path.join(RACINE, "node_modules"), path.join(COPIE, "node_modules"));

const f = (p) => path.join(COPIE, p);
const lire = (p) => fs.readFileSync(f(p), "utf8");
const ecrire = (p, x) => fs.writeFileSync(f(p), x);
const remplacer = (p, de, vers) => { const x = lire(p); if (!(typeof de === "string" ? x.includes(de) : de.test(x))) throw new Error(`essai mal posé : motif absent de ${p}`); ecrire(p, x.replace(de, vers)); };
const ajouter = (p, x) => fs.appendFileSync(f(p), x);

const rapports = new Set(fs.readdirSync(path.join(RACINE, "docs/rapports/v3")).map((x) => /^PHASE-(\d+)\.md$/.exec(x)?.[1]).filter(Boolean).map(Number));
const phasePrevue = Math.min(...REGLES.flatMap((r) => Object.values(r.versions)).filter((e) => e.etat === "prevu" && !rapports.has(e.phase)).map((e) => e.phase));
const exigencesTexte = fs.readFileSync(path.join(RACINE, "docs/REQUIREMENTS.md"), "utf8");
const aFaire = [...exigencesTexte.matchAll(/^\| ([A-Z]+-\d+) \|.*\| (\d+) \|$/gm)].map((m) => [m[1], Number(m[2])]).find(([id, p]) => !EXIGENCES[id] && !rapports.has(p));
const prochaineDecision = `V3-${String(Math.max(...[...fs.readFileSync(path.join(RACINE, "docs/DECISIONS_LOG.md"), "utf8").matchAll(/^\| V3-(\d{3}) \|/gm)].map((m) => Number(m[1]))) + 1).padStart(3, "0")}`;
const rapportOuvert = (() => { let n = 7; while (rapports.has(n)) n++; return n; })();
const fauxAudit = JSON.stringify({ metadata: { vulnerabilities: { high: 1 } }, vulnerabilities: { "paquet-piege": { severity: "high", via: [{ source: 1, url: "https://github.com/advisories/GHSA-essai" }] } } });
const BIBLIO = ["scripts/pare-feux/bibliotheques.mjs", "--rapport", "audit-essai.json"];
const fiche = fs.readdirSync(path.join(RACINE, "data/spots/fiches")).find((x) => fs.readFileSync(path.join(RACINE, "data/spots/fiches", x), "utf8").includes("\"src-ign-geocodage-poi\""));

const ESSAIS = [
  ["fichier inutile ajouté", "fichier sans usage : scripts/vieux.mjs", () => { ecrire("scripts/vieux.mjs", "export const x = 1;\n"); git("add", "scripts/vieux.mjs"); }],
  ["décision validée retirée", "décision validée retirée ou rétrogradée : V3-021", () => remplacer("docs/DECISIONS_LOG.md", /^\| V3-021 \|.*\n/m, "")],
  ["décision validée rétrogradée", "décision validée retirée ou rétrogradée : V3-016", () => remplacer("docs/DECISIONS_LOG.md", /^(\| V3-016 \|.*\| )VALIDÉE/m, "$1À DÉCIDER")],
  ["consigne datée de Félix sans règle", "« 25 nov. 2026, 23 h 59 »", () => remplacer("docs/DECISIONS_LOG.md", /^\| — \|/m, "| — | Félix, 25 nov. 2026, 23 h 59 : nouvelle consigne | VALIDÉE |\n| — |")],
  ["décision validée sans règle", `décision validée ${prochaineDecision}`, () => remplacer("docs/DECISIONS_LOG.md", /^\| V3-001 \|/m, `| ${prochaineDecision} | Nouvelle décision | VALIDÉE (Félix, 25 nov. 2026, 23 h 59) |\n| V3-001 |`)],
  ["règle ajoutée à CLAUDE.md sans pare-feu", "CLAUDE.md « Toute nouvelle règle", () => remplacer("CLAUDE.md", "- Poser tout de suite une question", "- Toute nouvelle règle de test.\n- Poser tout de suite une question")],
  ["nouvelle version sans revue des règles", "PF-01 : situé pour chaque version", () => remplacer("tests/pare-feux/regles.mjs", "export const INTERFACE_V3", "VERSIONS.v4 = { nom: \"V4\", chemins: [] };\nexport const INTERFACE_V3")],
  [`phase ${phasePrevue} close sans son pare-feu prévu`, `la phase ${phasePrevue} n'est pas close`, () => ecrire(`docs/rapports/v3/PHASE-${phasePrevue}.md`, "# rapport\n")],
  ...(aFaire ? [[`phase ${aFaire[1]} close sans la preuve de ${aFaire[0]}`, `exigence ${aFaire[0]} (phase`, () => ecrire(`docs/rapports/v3/PHASE-${aFaire[1]}.md`, "# rapport\n")]] : []),
  ["exigence ajoutée sans preuve", "exigence UX-99 (phase 3)", () => remplacer("docs/REQUIREMENTS.md", /^(\| UX-01 \|.*)$/m, "$1\n| UX-99 | Nouvelle exigence | IND | essai | essai | U | — | 3 |")],
  ["preuve d'une exigence acceptée perdue", "exigence OFF-01", () => remplacer("tests/upgrade.mjs", "la nouvelle version marche hors ligne", "la nouvelle version")],
  ...(phaseAutorisee() < 10 ? [["moteur modifié avant le jeton de la phase 10", "moteur modifié avant l'approbation qui suit la phase 9 : src/bord/engine/safety.js", () => ajouter("src/bord/engine/safety.js", "// x\n")]] : []),
  ["découpage par secteur dans l'interface V3", "découpage géographique dans l'interface V3 : src/prototype-v3/home.jsx", () => ajouter("src/prototype-v3/home.jsx", "// Filtrer par secteur\n")],
  ["second slogan", "slogan écrit ailleurs qu'en tête de Home", () => ajouter("src/prototype-v3/carte6.jsx", "// Read the sea. Fish the moment.\n")],
  ["courbes de profondeur", "courbe de profondeur dans l'interface V3", () => ajouter("src/prototype-v3/carte6.jsx", "// isobathes\n")],
  ["icône de guide remplacée", "icône de guide différente de l'icône SPUMY : crozon.png", () => fs.copyFileSync(f("icon-512.png"), f("crozon.png"))],
  ["localisation par l'adresse IP", "localisation par l'adresse IP : src/core/core.js", () => ajouter("src/core/core.js", "\nfetch(\"https://ipinfo.io/json\");\n")],
  ["mesure d'audience", "publicité, mesure d'audience ou paiement : index.html", () => remplacer("index.html", "</head>", "<script src=\"https://www.googletagmanager.com/gtag/js\"></script></head>")],
  ["lien Drive dans le référentiel public", "lien Drive dans le référentiel public", () => ajouter("docs/SPUMY_MASTER_PROMPT.md", "\nhttps://drive.google.com/x\n")],
  ["Dependabot sur npm", "Dependabot hors des actions GitHub", () => ajouter(".github/dependabot.yml", "  - package-ecosystem: \"npm\"\n    directory: \"/\"\n")],
  ["contrôle cité qui perd sa marque", "contient toujours « le rang ne change pas avec la confiance", () => remplacer("tests/v2.mjs", "le rang ne change pas avec la confiance", "le rang bouge")],
  ["contrôle cité supprimé", "contrôle tests/brand.py présent", () => git("rm", "-q", "tests/brand.py")],
  ["contrôle qui n'est plus lancé par la CI", "tests/v2.mjs lancé par la CI", () => remplacer(".github/workflows/tests.yml", /^ *run: npm run -s test:v2\n/m, "")],
  ["crochets Git plus activés", "activé par l'entrée de session", () => remplacer("CLAUDE.md", "git config core.hooksPath .githooks", "git config X")],
  ["position d'une fiche tirée de carnet-de-peche.com", "coordonnées tirées de carnet-de-peche.com", () => remplacer(`data/spots/fiches/${fiche}`, "\"src-ign-geocodage-poi\"", "\"src-carnet-de-peche-berchis\"")],
  ["tableau des pare-feux modifié à la main", "PARE-FEUX.md à jour", () => ajouter("docs/regles/PARE-FEUX.md", "x\n")],
  ["qualité des photos abaissée pour aller plus vite", "qualité graphique abaissée : qualité WebP des photos", () => remplacer("scripts/photos.py", "(1600, 74)", "(1600, 60)")],
  ["photo d'en-tête servie trop petite", "qualité graphique abaissée : photo d'en-tête servie en 1 600 px", () => remplacer("src/prototype-v3/ui.jsx", "size = 1600", "size = 720")],
  ["rééchantillonnage grossier des logos", "rééchantillonnage grossier dans scripts/logos.py", () => remplacer("scripts/logos.py", "Image.LANCZOS", "Image.NEAREST")],
  ["verrou npm pointant hors du registre officiel", "vient du registre npm officiel", () => remplacer("package-lock.json", "\"resolved\": \"https://registry.npmjs.org/", "\"resolved\": \"http://miroir.example/")],
  ["installation qui exécute les scripts des bibliothèques", "installe sans exécuter les scripts des bibliothèques", () => remplacer(".github/workflows/tests.yml", "npm ci --ignore-scripts", "npm ci")],
  ["nom de branche inséré dans un script de workflow", "passée par l'environnement, jamais dans un script", () => remplacer(".github/workflows/tests.yml", "      - name: Contrôle du code\n", "      - name: Essai\n        run: echo ${{ github.head_ref }}\n      - name: Contrôle du code\n")],
  ["workflow planté (GhostAction)", "workflow security-audit.yml inscrit au registre", () => ecrire(".github/workflows/security-audit.yml", "on: push\npermissions:\n  contents: read\njobs:\n  a:\n    runs-on: ubuntu-24.04\n    steps:\n      - run: echo ${{ secrets.NPM_TOKEN }}\n")],
  ["workflow avec droits d'écriture", "tests.yml déclare des droits en lecture seule", () => remplacer(".github/workflows/tests.yml", "  contents: read\n", "  contents: write\n")],
  ["politique de sécurité affaiblie (unsafe-eval)", "page publiée sans politique de sécurité stricte : index.html", () => remplacer("index.html", "script-src ", "script-src 'unsafe-eval' ")],
  [`rapport de la phase ${rapportOuvert} sans solutions comparées`, `rapport de phase sans solutions comparées : PHASE-${rapportOuvert}.md`, () => ecrire(`docs/rapports/v3/PHASE-${rapportOuvert}.md`, "# Rapport\n\n## 4. Justification des changements\n\nTexte.\n\n## 10. Red-team et risques\n\nTexte.\n")],
  ["faille grave dans une bibliothèque", "paquet-piege : faille high", () => ecrire("audit-essai.json", fauxAudit), BIBLIO],
  ["faille grave acceptée sans date de fin valable", "acceptation sans raison ou échue", () => { ecrire("audit-essai.json", fauxAudit);
    ecrire("tests/pare-feux/failles-acceptees.json", JSON.stringify({ acceptees: [{ paquet: "paquet-piege", avis: "https://github.com/advisories/GHSA-essai", raison: "essai", jusqu_au: "2020-01-01" }] })); }, BIBLIO],
];

let arretees = 0;
const trous = [];
try {
  for (const [nom, attendu, saboter, commande = ["tests/pare-feux.mjs"]] of ESSAIS) {
    git("reset", "-q", "--hard", "HEAD"); git("clean", "-q", "-fd", "-e", "node_modules");
    saboter();
    const r = spawnSync(process.execPath, commande, { cwd: COPIE, encoding: "utf8" });
    if (r.status !== 0 && r.stdout.includes(attendu)) arretees++;
    else trous.push(`${nom} (code ${r.status}, attendu « ${attendu} »)`);
  }
} finally {
  execFileSync("git", ["worktree", "remove", "--force", COPIE], { cwd: RACINE });
  execFileSync("git", ["worktree", "prune"], { cwd: RACINE });
}
for (const t of trous) console.log(`   ✗ violation passée : ${t}`);
console.log(`[sabotage] ${arretees}/${ESSAIS.length} violations arrêtées`);
process.exit(trous.length ? 1 : 0);
