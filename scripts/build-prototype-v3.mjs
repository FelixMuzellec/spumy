// Phase 3 V3 — construit le prototype interactif (src/prototype-v3/) en deux sorties :
//   prototype-v3/          à publier avec le site : photos et logo lus dans ../assets, sans copie ;
//   <dossier> (--revue)    page autonome de revue (contenu seulement, publiée en artefact) : photos et logo copiés.
// Usage : node scripts/build-prototype-v3.mjs [--revue <dossier>]
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PHOTO_SET } from "../src/prototype-v3/data.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const revue = args.includes("--revue") ? path.resolve(args[args.indexOf("--revue") + 1]) : null;
const TITLE = "Prototype SPUMY V3";

async function bundle(outdir, defines) {
  fs.rmSync(outdir, { recursive: true, force: true });
  fs.mkdirSync(outdir, { recursive: true });
  await build({
    entryPoints: [path.join(root, "src/prototype-v3/app.jsx")], bundle: true, format: "iife", minify: true, outdir, entryNames: "app",
    jsx: "automatic", loader: { ".woff2": "file", ".woff": "file", ".json": "json" }, assetNames: "fonts/[name]-[hash]", logLevel: "warning",
    define: { "process.env.NODE_ENV": '"production"', ...Object.fromEntries(Object.entries(defines).map(([k, v]) => [k, JSON.stringify(v)])) },
    nodePaths: [path.join(root, "node_modules")],
  });
  // Ne garder que les sous-ensembles latins des polices (le prototype est en français).
  const css = path.join(outdir, "app.css");
  const kept = [];
  let text = fs.readFileSync(css, "utf8").replace(/@font-face\{[^}]*\}/g, (block) => {
    const m = block.match(/url\(["']?\.?\/?(fonts\/[^)"']+)["']?\)/);
    if (m && /-latin-/.test(m[1]) && !/-latin-ext-/.test(m[1])) { kept.push(m[1]); return block; }
    return "";
  });
  fs.writeFileSync(css, text);
  for (const f of fs.readdirSync(path.join(outdir, "fonts"))) if (!kept.some((k) => k.endsWith(f))) fs.rmSync(path.join(outdir, "fonts", f));
  const size = (f) => (fs.statSync(path.join(outdir, f)).size / 1024).toFixed(0);
  return { js: size("app.js"), css: size("app.css"), fonts: fs.readdirSync(path.join(outdir, "fonts")).length };
}

const pub = path.join(root, "prototype-v3");
const s1 = await bundle(pub, { PHOTO_BASE: "../assets/photos/", BRAND_BASE: "../assets/brand/v3/" });
fs.writeFileSync(path.join(pub, "index.html"), `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${TITLE}</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#172B3A">
<link rel="icon" type="image/png" sizes="32x32" href="../assets/brand/v3/favicon-32.png">
<link rel="apple-touch-icon" href="../assets/brand/v3/apple-touch-icon-180.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="stylesheet" href="app.css">
</head>
<body>
<div id="root"></div>
<script src="app.js"></script>
</body>
</html>
`);
// Icônes de l'application installée : exports V3 du logo BRAND (scripts/logos-v3.py, tests/brand.py).
fs.writeFileSync(path.join(pub, "manifest.webmanifest"), JSON.stringify({
  name: "SPUMY", short_name: "SPUMY", lang: "fr", start_url: "./index.html", scope: "./", display: "standalone",
  background_color: "#E9E2D2", theme_color: "#172B3A",
  icons: [
    { src: "../assets/brand/v3/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "../assets/brand/v3/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "../assets/brand/v3/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
}, null, 2) + "\n");
console.log(`prototype-v3/ : app.js ${s1.js} Ko, app.css ${s1.css} Ko, ${s1.fonts} polices`);

if (revue) {
  const s2 = await bundle(revue, { PHOTO_BASE: "photos/", BRAND_BASE: "brand/" });
  fs.mkdirSync(path.join(revue, "photos"), { recursive: true });
  for (const id of PHOTO_SET) for (const z of [720, 1600]) fs.copyFileSync(path.join(root, "assets/photos", `${id}-${z}.webp`), path.join(revue, "photos", `${id}-${z}.webp`));
  fs.mkdirSync(path.join(revue, "brand"), { recursive: true });
  for (const f of ["spumy-medaillon-128.png", "spumy-symbole-256.png", "spumy-logo-960.webp", "favicon-32.png", "apple-touch-icon-180.png", "inshore-256.webp", "offshore-256.webp", "inshore-128.webp", "offshore-128.webp"]) fs.copyFileSync(path.join(root, "assets/brand/v3", f), path.join(revue, "brand", f));
  fs.writeFileSync(path.join(revue, "index.html"), `<title>${TITLE}</title>
<link rel="icon" type="image/png" sizes="32x32" href="brand/favicon-32.png">
<link rel="apple-touch-icon" href="brand/apple-touch-icon-180.png">
<link rel="stylesheet" href="app.css">
<div id="root"></div>
<script src="app.js"></script>
`);
  console.log(`${path.relative(process.cwd(), revue) || revue} : app.js ${s2.js} Ko, app.css ${s2.css} Ko, ${s2.fonts} polices, ${PHOTO_SET.length} photos`);
}
