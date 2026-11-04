// SPUMY v9.0 — Construit le site statique à la RACINE du dépôt (GitHub Pages : Branch main, / (root)).
// Identité : SPUMY (tout en préservant les clés et la compatibilité des tests).
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const OUT = root;
const LEAFLET_CSS = fs.readFileSync(path.join(root, "node_modules/leaflet/dist/leaflet.css"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s*\n\s*/g, "").replace(/\s{2,}/g, " ");
const MAP_CSS = ".leaflet-container{font:12px system-ui,sans-serif}.leaflet-tooltip.spot-tip{background:#0b1626;color:#e2e8f0;border:1px solid #334155;"
  + "box-shadow:none;font-weight:600;padding:2px 6px}.leaflet-tooltip.spot-tip::before{display:none}.leaflet-control-attribution{font-size:11.5px}";

export const CONNECT = [
  "https://api.open-meteo.com", "https://marine-api.open-meteo.com",
  "https://historical-forecast-api.open-meteo.com", "https://api.github.com", "https://api.anthropic.com",
];
const sha = (txt) => `'sha256-${crypto.createHash("sha256").update(txt, "utf8").digest("base64")}'`;
export function cspFor(script, { connect = [], img = [], selfScript = false } = {}) {
  return [
    "default-src 'none'", `script-src ${sha(script)}${selfScript ? " 'self'" : ""}`, "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${img.join(" ")}`.trim(), `connect-src 'self' ${connect.join(" ")}`.trim(),
    "manifest-src 'self'", "worker-src 'self'", "base-uri 'none'", "form-action 'none'", "object-src 'none'",
  ].join("; ");
}
const scriptOf = (html) => {
  const m = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
  if (m.length !== 1) throw new Error(`CSP : ${m.length} scripts en ligne, 1 attendu`);
  return m[0].slice(8, -9);
};
const withCsp = (html, policy) => html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${policy}">`);

import { SITES, SITE_FILES } from "./sites.mjs";
export { SITE_FILES };
const VERSION = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version.replace(/\.0$/, "");
const APP = { name: "SPUMY — Intelligence Pêche du Bar", short: "SPUMY" };

const DEPTS = { "29": "Finistère", "50": "Manche" };
const escH = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const guides = [];
for (const s of SITES) {
  const m = await import(pathToFileURL(path.join(root, s.config)).href);
  const code = String(m.SITE.dept || "").slice(0, 2);
  if (!DEPTS[code]) throw new Error(`${s.key} : département inconnu (${m.SITE.dept})`);
  guides.push({ s, m, code, dept: DEPTS[code] });
}
const byDept = Object.keys(DEPTS).map((code) => ({
  code, name: DEPTS[code],
  list: guides.filter((g) => g.code === code).sort((a, b) => b.m.SITE.lat - a.m.SITE.lat),
})).filter((d) => d.list.length);

const guidesHtml = byDept.map((d) => {
  const n = d.list.reduce((a, g) => a + g.m.SPOTS.length, 0);
  return `<details class="dept" data-dept="${d.code}">\n <summary><h2 id="dept-${d.code}">${escH(d.name)} (${d.code}) <small>${d.list.length}&nbsp;guide${d.list.length > 1 ? "s" : ""} · ${n}&nbsp;spots</small></h2></summary>\n <div class="cards">\n`
    + d.list.map((g) => ` <a class="card" href="${g.s.key}.html"><img src="${g.s.key}.png" alt=""><div><strong>${escH(g.m.SITE.name)}</strong><span>${escH(g.s.blurb)} · ${g.m.SPOTS.length}&nbsp;spots</span></div></a>`).join("\n")
    + "\n </div>\n </details>";
}).join("\n ");

const posOf = (p) => {
  if (Number.isFinite(p.lat) && Number.isFinite(p.lon)) return [p.lat, p.lon];
  const m = String(p.coords || "").match(/(\d+)°(\d+(?:[.,]\d+)?)'?\s*([NS])\s+(\d+)°(\d+(?:[.,]\d+)?)'?\s*([EWO])/i);
  if (!m) return null;
  const v = (d, mn) => +d + +mn.replace(",", ".") / 60;
  return [+(v(m[1], m[2]) * (/s/i.test(m[3]) ? -1 : 1)).toFixed(5), +(v(m[4], m[5]) * (/[wo]/i.test(m[6]) ? -1 : 1)).toFixed(5)];
};
const spotIndex = byDept.flatMap((d) => d.list.flatMap((g) => g.m.SPOTS.map((p) => {
  const z = g.m.SITE.zones?.[p.zone], pos = posOf(p);
  if (!pos) throw new Error(`${g.s.key}/${p.id} : position introuvable pour la recherche autour de soi`);
  return [g.s.key, p.id, p.name, p.subtitle || "", g.m.SITE.name, d.name, [z?.label, z?.anchor, g.m.SITE.region].filter(Boolean).join(" "), +pos[0].toFixed(5), +pos[1].toFixed(5)];
})));
for (const r of spotIndex) if (!/^[\w-]+$/.test(r[1])) throw new Error(`identifiant de spot inutilisable dans un lien : ${r[1]}`);
const spotJson = JSON.stringify(spotIndex).replace(/</g, "\\u003c");
const guideIds = JSON.stringify(byDept.flatMap((d) => d.list.map((g) => [g.s.key, g.s.id, g.m.SITE.name, d.name]))).replace(/</g, "\\u003c");
const owners = spotIndex.map((r) => [r[0], r[1], r[7], r[8], r[2]]);
const guideMeta = Object.fromEntries(guides.map((g) => [g.s.key, { id: g.s.id, name: g.m.SITE.name, lat: g.m.SITE.lat, lon: g.m.SITE.lon }]));
const homeGuides = byDept.flatMap((d) => d.list.map((g) => ({ key: g.s.key, id: g.s.id, name: g.m.SITE.name })));
const stamp = crypto.createHash("sha256");

for (const s of SITES) {
  const engine = path.join(root, "src/ui/App.jsx"), config = path.join(root, s.config);
  const r = await build({
    entryPoints: [path.join(root, "src/main.jsx")],
    bundle: true, minify: true, format: "iife", target: ["es2019", "safari15"], write: false,
    jsx: "automatic", loader: { ".js": "jsx" },
    define: { __SITE_ID__: JSON.stringify(s.id), "process.env.NODE_ENV": '"production"', __SPOT_OWNERS__: JSON.stringify(owners), __GUIDE_META__: JSON.stringify(guideMeta) },
    plugins: [{ name: "site", setup(b) {
      b.onResolve({ filter: /^APP$/ }, () => ({ path: engine }));
      b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: config }));
    } }],
    legalComments: "none", logLevel: "warning",
  });
  const js = r.outputFiles[0].text.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");
  stamp.update(js);
  const page = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${s.title}</title>
<meta name="description" content="SPUMY — Aide à la décision pour la pêche du bar aux leurres, marée calculée, météo Open-Meteo par spot.">
<meta name="theme-color" content="#050d1a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${APP.short}">
<link rel="manifest" href="manifest.json">
<link rel="icon" type="image/png" href="${s.key}.png">
<link rel="apple-touch-icon" href="icon-maskable.png">
<style>
*,::before,::after{box-sizing:border-box;border:0 solid #1e293b}html{line-height:1.5;-webkit-text-size-adjust:100%}
h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}
button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}
button,select{text-transform:none}button,[type=button]{-webkit-appearance:button;background-color:transparent;background-image:none}button{cursor:pointer}
blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}ol,ul{list-style:none;margin:0;padding:0}img,svg,video,canvas{display:block;vertical-align:middle}
html,body{margin:0;background:#050d1a;color:#e2e8f0}#boot{font:13px system-ui,sans-serif;color:#64748b;padding:40px 16px;text-align:center}@media (pointer:coarse){input,select,textarea{font-size:16px!important}}
:focus-visible{outline:2px solid #38bdf8;outline-offset:2px}@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;animation:none!important}}
${LEAFLET_CSS}${MAP_CSS}</style>
</head>
<body>
<div id="root"><div id="boot">Chargement de SPUMY…</div></div>
<noscript><p style="padding:16px">Cette application nécessite JavaScript.</p></noscript>
<script>
${js}
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(OUT, `${s.key}.html`), withCsp(page, cspFor(scriptOf(page), { connect: CONNECT, img: ["https://tile.openstreetmap.org"] })));
  fs.copyFileSync(path.join(root, `assets/${s.key}-512.png`), path.join(OUT, `${s.key}.png`));
  console.log(`${s.key}.html : ${(fs.statSync(path.join(OUT, `${s.key}.html`)).size / 1024).toFixed(0)} Ko`);
}

const manifest = JSON.stringify({
  name: APP.name, short_name: APP.short, lang: "fr", dir: "ltr",
  description: "SPUMY : aide à la décision pour la pêche du bar aux leurres — sept guides en Finistère et dans la Manche.",
  start_url: "./", scope: "./", display: "standalone", background_color: "#050d1a", theme_color: "#050d1a",
  icons: [
    { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
  shortcuts: SITES.map((s) => ({ name: s.title.replace(/^SPUMY · |^Bar · /, ""), url: `./${s.key}.html`, icons: [{ src: `${s.key}.png`, sizes: "512x512", type: "image/png" }] })),
}, null, 2) + "\n";
stamp.update(manifest);
fs.writeFileSync(path.join(OUT, "manifest.json"), manifest);
for (const f of ["icon-192.png", "icon-512.png", "icon-maskable.png"]) {
  stamp.update(fs.readFileSync(path.join(root, "assets", f)));
  fs.copyFileSync(path.join(root, "assets", f), path.join(OUT, f));
}

const homeParts = [];
for (const g of homeGuides) {
  const s0 = SITES.find((x) => x.key === g.key);
  const r = await build({
    entryPoints: [path.join(root, "src/home/site-api.js")],
    bundle: true, minify: true, format: "iife", target: ["es2019", "safari15"], write: false, loader: { ".js": "jsx" }, jsx: "automatic",
    define: { __SITE_KEY__: JSON.stringify(g.key), __SITE_ID__: JSON.stringify(g.id), "process.env.NODE_ENV": '"production"' },
    plugins: [{ name: "site", setup(b) { b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: path.join(root, s0.config) })); } }],
    legalComments: "none", logLevel: "warning",
  });
  homeParts.push(r.outputFiles[0].text);
}
{
  const r = await build({
    entryPoints: [path.join(root, "src/home/main.jsx")],
    bundle: true, minify: true, format: "iife", target: ["es2019", "safari15"], write: false, loader: { ".js": "jsx" }, jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"', __HOME_INDEX__: JSON.stringify(owners), __HOME_GUIDES__: JSON.stringify(homeGuides) },
    plugins: [{ name: "no-site", setup(b) { b.onResolve({ filter: /^SITE_CONFIG$/ }, (a) => { throw new Error(`home.js ne doit dépendre d'aucun guide (${a.importer})`); }); } }],
    legalComments: "none", logLevel: "warning",
  });
  homeParts.push(r.outputFiles[0].text);
}
fs.writeFileSync(path.join(OUT, "home.js"), homeParts.join("\n"));

const home = fs.readFileSync(path.join(root, "src/index.html"), "utf8");
stamp.update(home);
for (const f of SITE_FILES.filter((f) => f !== "sw.js" && f !== "index.html")) stamp.update(fs.readFileSync(path.join(OUT, f)));
stamp.update(fs.readFileSync(path.join(root, "src/sw.template.js")));
const buildId = stamp.digest("hex").slice(0, 12);
const shell = ["./", ...SITE_FILES.filter((f) => f !== "sw.js").map((f) => `./${f}`)];
const sw = fs.readFileSync(path.join(root, "src/sw.template.js"), "utf8").replace("__BUILD__", buildId).replace('"__SHELL__"', JSON.stringify(shell).slice(1, -1));
fs.writeFileSync(path.join(OUT, "sw.js"), sw);
const homeOut = home.replace("/*__LEAFLET_CSS__*/", LEAFLET_CSS + MAP_CSS).replace("__VERSION__", `${VERSION} · ${buildId}`).replace("<!--__GUIDES__-->", guidesHtml).replace("/*__SPOTS__*/[]", spotJson).replace("/*__GUIDE_IDS__*/[]", guideIds);
fs.writeFileSync(path.join(OUT, "index.html"), withCsp(homeOut, cspFor(scriptOf(homeOut), { selfScript: true, connect: CONNECT.filter((u) => /open-meteo|api\.github\.com/.test(u)), img: ["https://tile.openstreetmap.org"] })));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
console.log("SPUMY build", buildId);
