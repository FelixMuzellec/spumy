// Phase 11 — Construit le prototype consultable (src/prototype/) en deux sorties :
//   prototype/            publiée avec le site (GitHub Pages) : photos et références lues dans ../assets/photos et
//                         ../docs/reference, sans copie ;
//   <dossier donné>       page autonome pour la revue (option --revue <dossier>) : photos, références et polices copiées.
// Usage : node scripts/build-prototype.mjs [--revue <dossier>]
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const revue = args.includes("--revue") ? path.resolve(args[args.indexOf("--revue") + 1]) : null;

const TITLE = "SPUMY · prototype";
const head = `<title>${TITLE}</title>
<meta name="description" content="SPUMY, phase 11 : direction artistique et écrans BORD et BATEAU (prototype interactif).">
<meta name="theme-color" content="#040b16">`;

async function bundle(outdir, defines) {
  fs.rmSync(outdir, { recursive: true, force: true });
  fs.mkdirSync(outdir, { recursive: true });
  await build({
    entryPoints: [path.join(root, "src/prototype/main.jsx")], bundle: true, format: "iife", minify: true, outdir, entryNames: "app",
    jsx: "automatic", loader: { ".woff2": "file", ".json": "json" }, assetNames: "fonts/[name]-[hash]", logLevel: "warning",
    define: { "process.env.NODE_ENV": '"production"', ...Object.fromEntries(Object.entries(defines).map(([k, v]) => [k, JSON.stringify(v)])) },
    nodePaths: [path.join(root, "node_modules")],
  });
  const size = (f) => (fs.statSync(path.join(outdir, f)).size / 1024).toFixed(0);
  return { js: size("app.js"), css: size("app.css") };
}

// 1. Sortie publiée avec le site.
const pub = path.join(root, "prototype");
const s1 = await bundle(pub, { PHOTO_BASE: "../assets/photos/", REF_BASE: "../docs/reference/" });
fs.writeFileSync(path.join(pub, "index.html"), `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
<link rel="stylesheet" href="app.css">
</head>
<body>
<div id="root"></div>
<script src="app.js"></script>
</body>
</html>
`);
console.log(`prototype/ : app.js ${s1.js} Ko, app.css ${s1.css} Ko`);

// 2. Page de revue autonome (le squelette du document est ajouté à la publication : contenu seulement).
if (revue) {
  const s2 = await bundle(revue, { PHOTO_BASE: "photos/", REF_BASE: "ref/" });
  fs.mkdirSync(path.join(revue, "photos"), { recursive: true });
  for (const f of fs.readdirSync(path.join(root, "assets/photos"))) fs.copyFileSync(path.join(root, "assets/photos", f), path.join(revue, "photos", f));
  fs.mkdirSync(path.join(revue, "ref"), { recursive: true });
  for (const f of fs.readdirSync(path.join(root, "docs/reference")).filter((f) => /^(ref|avant)-.*\.webp$/.test(f))) fs.copyFileSync(path.join(root, "docs/reference", f), path.join(revue, "ref", f));
  fs.writeFileSync(path.join(revue, "index.html"), `${head}
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="app.css">
<style>:root{background:#040b16}body{background:#040b16}</style>
<div id="root"></div>
<script src="app.js"></script>
`);
  console.log(`${path.relative(process.cwd(), revue) || revue} : app.js ${s2.js} Ko, app.css ${s2.css} Ko, ${fs.readdirSync(path.join(revue, "photos")).length} photos`);
}
