// Captures d'écran de référence (lot 3.7) : prouver qu'un changement de code ne change pas le rendu.
//
//   node tests/visual.mjs capture <dossier>        capture les vues du site construit à la racine
//   node tests/visual.mjs compare <avant> <après>  compare pixel par pixel ; échoue à la moindre différence
//
// Tout est figé pour que deux passages donnent les mêmes pixels : date et heure (13 novembre 2026, 6 h 30 à
// Paris, horloge arrêtée), météo simulée (fonction du temps absolu), tuiles de carte remplacées par un pixel, animations coupées,
// téléphone simulé (iPhone 13), service worker bloqué, stockage vide.
import { chromium, devices } from "playwright";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import zlib from "node:zlib";
import { omRespond } from "./om_mock.mjs";
import { SITE_FILES } from "../scripts/sites.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const [mode, a, b] = process.argv.slice(2);
const NOW = Date.parse("2026-11-13T05:30:00Z");   // 6 h 30 à Paris
const PNG1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

// Vues : [nom, page, onglet ou action]
const GUIDE_TABS = ["Décision", "Carte", "Journal", "Matériel"];
const PLUS = ["Marée", "Météo", "Saison", "Règles", "Photos"];
const VIEWS = [
  ["accueil", "index.html", null],
  ["accueil-offshore", "index.html", async (p) => { await p.getByRole("tab", { name: /Offshore/ }).first().click(); }],
  ...["logonna", "pirou"].flatMap((g) => [
    ...GUIDE_TABS.map((t) => [`${g}-${t}`, `${g}.html`, async (p) => { await p.getByRole("tab", { name: t, exact: true }).click(); }]),
    [`${g}-Plus`, `${g}.html`, async (p) => { await p.getByRole("tab", { name: "Plus", exact: true }).click(); }],
    ...PLUS.map((t) => [`${g}-${t}`, `${g}.html`, async (p) => {
      await p.getByRole("tab", { name: "Plus", exact: true }).click(); await p.waitForTimeout(150);
      await p.getByRole("button", { name: new RegExp(`^${t}`) }).first().click();
    }]),
  ]),
];

async function capture(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".png": "image/png" };
  const server = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, "") || "index.html";
    if (!SITE_FILES.includes(p)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
    fs.createReadStream(path.join(root, p)).pipe(res);
  });
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();
  let n = 0;
  for (const [name, url, act] of VIEWS) {
    const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "block", reducedMotion: "reduce", deviceScaleFactor: 1 });
    await ctx.clock.setFixedTime(NOW);   // Date.now() constant, minuteries actives : mêmes textes (« il reste… ») à chaque passage
    await ctx.route(/tile\.openstreetmap\.org/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: PNG1 }));
    await ctx.route(/open-meteo\.com/, async (route) => {
      const r = omRespond(route.request().url(), "nominal");
      await route.fulfill({ status: r.status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(r.body) });
    });
    const page = await ctx.newPage();
    await page.goto(`${base}/${url}`);
    await page.waitForLoadState("networkidle").catch(() => {});
    if (url !== "index.html") await page.waitForFunction(() => /🌬 [A-Z]{1,3} \d+ km\/h/.test(document.body.innerText), null, { timeout: 20000 }).catch(() => {});
    else await page.waitForFunction(() => /Notes du jour calculées pour les 7 guides|7 guides/.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});
    if (act) { await act(page); }
    // L'identifiant de construction (bas de l'accueil, Réglages) change avec le moindre octet du code : masqué.
    await page.evaluate(() => {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) if (/\b[0-9a-f]{12}\b/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/\b[0-9a-f]{12}\b/g, "000000000000");
    });
    await page.waitForTimeout(600);
    await page.evaluate(() => document.fonts?.ready);
    await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true, animations: "disabled", caret: "hide" });
    n++;
    await ctx.close();
  }
  await browser.close(); server.close();
  console.log(`${n} vues capturées dans ${dir}`);
}

// PNG → pixels bruts (RGBA 8 bits, sans entrelacement : ce que produit Chromium).
function decode(file) {
  const buf = fs.readFileSync(file);
  let i = 8, w = 0, h = 0, bpp = 4; const idat = [];
  while (i < buf.length) {
    const len = buf.readUInt32BE(i), type = buf.toString("ascii", i + 4, i + 8), data = buf.subarray(i + 8, i + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bpp = data[9] === 6 ? 4 : data[9] === 2 ? 3 : 0; if (!bpp || data[8] !== 8 || data[12]) throw new Error(`${file} : format PNG non pris en charge`); }
    if (type === "IDAT") idat.push(data);
    i += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), prev = y ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const left = x >= bpp ? out[y * stride + x - bpp] : 0, up = prev ? prev[x] : 0, ul = prev && x >= bpp ? prev[x - bpp] : 0;
      const p = left + up - ul, pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - ul);
      const pred = f === 0 ? 0 : f === 1 ? left : f === 2 ? up : f === 3 ? (left + up) >> 1 : pa <= pb && pa <= pc ? left : pb <= pc ? up : ul;
      out[y * stride + x] = (line[x] + pred) & 255;
    }
  }
  return { w, h, bpp, px: out };
}

function compare(dirA, dirB) {
  const names = [...new Set([...fs.readdirSync(dirA), ...fs.readdirSync(dirB)])].filter((f) => f.endsWith(".png")).sort();
  let bad = 0;
  for (const f of names) {
    const pa = path.join(dirA, f), pb = path.join(dirB, f);
    if (!fs.existsSync(pa) || !fs.existsSync(pb)) { console.log(`✗ ${f} : absente ${fs.existsSync(pa) ? "après" : "avant"}`); bad++; continue; }
    const A = decode(pa), B = decode(pb);
    if (A.w !== B.w || A.h !== B.h) { console.log(`✗ ${f} : taille ${A.w}×${A.h} → ${B.w}×${B.h}`); bad++; continue; }
    let diff = 0;
    for (let k = 0; k < A.px.length; k += A.bpp) if (A.px[k] !== B.px[k] || A.px[k + 1] !== B.px[k + 1] || A.px[k + 2] !== B.px[k + 2]) diff++;
    if (diff) { console.log(`✗ ${f} : ${diff} pixels différents sur ${A.w * A.h}`); bad++; } else console.log(`✓ ${f} (${A.w}×${A.h}) identique`);
  }
  console.log(`\nCAPTURES : ${names.length - bad}/${names.length} identiques`);
  if (bad) process.exitCode = 1;
}

if (mode === "capture" && a) await capture(path.resolve(a));
else if (mode === "compare" && a && b) compare(path.resolve(a), path.resolve(b));
else { console.log("usage : node tests/visual.mjs capture <dossier> | compare <avant> <après>"); process.exitCode = 2; }
