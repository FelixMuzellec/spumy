// Pare-feu « aucun fichier inutile » (Félix, 24 nov. 2026, 22 h 26 ; référentiel § 12.2, nettoyage raisonné).
// Un fichier suivi par Git est « utilisé » s'il est un point d'entrée, s'il est cité par un autre fichier qui n'est pas de
// la documentation (nom complet, ou nom sans extension pour un module), ou s'il est lu par une lecture dynamique déclarée
// ci-dessous (lecture d'un dossier, nom construit). Sinon il doit être supprimé, ou inscrit avec sa raison au registre
// docs/socle/NETTOYAGE.md. Usage : node scripts/pare-feux/inutiles.mjs  (code 1 s'il reste un fichier sans usage ni raison)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// Documentation et configuration : leur raison d'être n'est pas d'être lues par du code (la documentation périmée relève
// de la revue de chaque phase et de la phase 15).
export const HORS_CHAMP = [
  [/^(docs|audit)\//, "documentation"],
  [/\.md$/, "documentation"],
  [/^\.github\//, "configuration GitHub (CI, Dependabot)"],
  [/^\.githooks\//, "crochets Git locaux (pare-feux)"],
  [/^(package(-lock)?\.json|\.nvmrc|\.gitignore|\.gitattributes|\.editorconfig|eslint\.config\.m?js|tsconfig[^/]*\.json|LICENSE[^/]*|CNAME|\.nojekyll|\.env\.example)$/, "configuration du dépôt"],
  [/^[^/]+\.html$/, "page publiée (point d'entrée du site)"],
  [/^(sw\.js|manifest\.json|robots\.txt|favicon\.ico)$/, "fichier publié lu par le navigateur"],
];

// Lectures dynamiques : dossiers lus en entier, ou noms construits par le code. Chaque motif cite le code qui lit.
export const LECTURES_DYNAMIQUES = [
  [/^data\/spots\/fiches\/[^/]+\.json$/, "fiches lues par dossier (scripts/registre-spots.mjs, tests/spots-v3.mjs)"],
  [/^data\/spots\/collecte\//, "collecte lue par dossier (scripts d'intégration et de qualification des fiches)"],
  [/^assets\/photos\//, "photos nommées par l'identifiant du catalogue (src/core, scripts/photos.py)"],
  [/^tests\/ref\/[^/]+\.txt$/, "tables de marée lues par nom construit (tests/unit.mjs)"],
  [/^data\/epreuve\//, "épreuve V2 relue par scripts/epreuve*.mjs (noms construits)"],
  [/^assets\/[a-z]+-192\.png$/, "icônes de guide lues par nom construit (scripts/build.mjs : assets/${key}-192.png)"],
  [/^assets\/brand\/web\//, "dossier copié en entier dans le prototype V2 (scripts/build-prototype.mjs)"],
  [/^assets\/brand\/v3\//, "jeu d'exports du logo V3 (scripts/logos-v3.py, logos-symbole-v6.py ; intégration aux phases 10 à 12)"],
];

const texte = /\.(m?js|jsx|ts|json|html|css|ya?ml|py|sh|txt|svg|webmanifest)$/i;

export function fichiersSansUsage(racine = RACINE) {
  // Fichiers suivis et nouveaux fichiers non ignorés : un fichier créé mais pas encore ajouté est déjà contrôlé.
  const fichiers = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: racine }).toString().trim().split("\n").filter(Boolean)
    .filter((f) => fs.existsSync(path.join(racine, f)));
  // Lecteurs : tout fichier texte sauf la documentation (une mention dans un document ne fait pas un usage).
  const doc = (f) => /^(docs|audit)\//.test(f) || /\.md$/.test(f);
  const lecteurs = fichiers.filter((f) => texte.test(f) && !doc(f) && fs.statSync(path.join(racine, f)).size < 3e6)
    .map((f) => [f, fs.readFileSync(path.join(racine, f), "utf8")]);
  const entrees = new Set();
  const pkg = JSON.parse(fs.readFileSync(path.join(racine, "package.json"), "utf8"));
  const ci = fs.existsSync(path.join(racine, ".github/workflows")) ? fs.readdirSync(path.join(racine, ".github/workflows")).map((w) => fs.readFileSync(path.join(racine, ".github/workflows", w), "utf8")).join("\n") : "";
  const commandes = Object.values(pkg.scripts || {}).join("\n") + "\n" + ci;
  for (const f of fichiers) if (commandes.includes(f)) entrees.add(f);
  const sans = [];
  for (const f of fichiers) {
    if (HORS_CHAMP.some(([re]) => re.test(f)) || LECTURES_DYNAMIQUES.some(([re]) => re.test(f)) || entrees.has(f)) continue;
    const base = path.basename(f), stem = base.replace(/\.(m?js|jsx|ts)$/, "");
    const cles = [base]; if (stem !== base) cles.push(`/${stem}"`, `/${stem}'`, `/${stem}\``);
    if (!lecteurs.some(([g, t]) => g !== f && cles.some((k) => t.includes(k)))) sans.push(f);
  }
  return sans;
}

export function gardesAuRegistre(racine = RACINE) {
  const reg = fs.readFileSync(path.join(racine, "docs/socle/NETTOYAGE.md"), "utf8");
  const garde = reg.split(/^## /m).find((s) => /^Gard/.test(s)) || "";
  return garde;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sans = fichiersSansUsage();
  const garde = gardesAuRegistre();
  const nonInscrits = sans.filter((f) => !garde.includes(f) && !garde.includes(path.basename(f)));
  for (const f of sans) console.log(`${nonInscrits.includes(f) ? "✗ sans usage ni raison" : "· gardé au registre  "}  ${f}`);
  console.log(`[inutiles] ${sans.length} fichier(s) sans lecteur, ${nonInscrits.length} sans raison inscrite`);
  process.exit(nonInscrits.length ? 1 : 0);
}
