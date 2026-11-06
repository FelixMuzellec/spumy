// Construit la page « Analyse photo du bar » publiée sur claude.ai (analyse par l'abonnement
// Claude, sans clé API). Elle n'est pas servie par GitHub Pages : sortie dans studio-build/.
// Usage : node scripts/build-studio.mjs
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const VERSION = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version.replace(/\.0$/, "");
const r = await build({
  entryPoints: [path.join(root, "src/studio/studio.js")], bundle: true, minify: true, format: "iife", write: false,
  target: ["es2019", "safari15"], jsx: "automatic", loader: { ".js": "jsx" }, legalComments: "none", logLevel: "warning",
  define: { __STUDIO_VERSION__: JSON.stringify(VERSION), "process.env.NODE_ENV": '"production"' },
  plugins: [{ name: "site", setup(b) {
    b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: path.join(root, "src/studio/site-shim.js") }));
  } }],
});
const js = r.outputFiles[0].text.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");
const page = fs.readFileSync(path.join(root, "src/studio/page.html"), "utf8");
if (!page.includes("__STUDIO_SCRIPT__")) throw new Error("page.html : emplacement du script absent");
const out = page.replace("__STUDIO_SCRIPT__", () => js);
fs.mkdirSync(path.join(root, "studio-build"), { recursive: true });
fs.writeFileSync(path.join(root, "studio-build/analyse-photo.html"), out);
console.log(`studio-build/analyse-photo.html : ${(out.length / 1024).toFixed(0)} Ko (v${VERSION})`);
