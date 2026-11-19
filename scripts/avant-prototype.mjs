// Phase 11 — Captures « avant » : l'application actuelle (site construit à la racine), premier écran, pour la planche
// Avant / après du prototype. Mêmes conditions figées que tests/visual.mjs (iPhone 13, 13 novembre 2026 6 h 30,
// météo simulée « nominal », tuiles remplacées par un pixel) ; seule l'image du premier écran est gardée.
//   node scripts/avant-prototype.mjs      → docs/reference/avant-{decision,carte,fiche,journal,terrain}.webp
import { chromium, devices } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { omRespond } from "../tests/om_mock.mjs";
import { SITE_FILES } from "./sites.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outDir = path.join(root, "docs/reference");
const NOW = Date.parse("2026-11-13T05:30:00Z");
const PNG1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
const tab = (t) => async (p) => { await p.getByRole("tab", { name: t, exact: true }).click(); };

const VIEWS = [
  ["decision", null, null],
  ["carte", null, tab("Carte")],
  // La « fiche » d'aujourd'hui : le détail de la note du premier spot, sur l'onglet Décision.
  ["fiche", null, async (p) => { const b = p.getByRole("button", { name: /^(Détail des trois scores|Détail de la note)$/ }).first(); await b.scrollIntoViewIfNeeded(); await b.click(); await p.waitForTimeout(200);
    await p.evaluate(() => { const el = [...document.querySelectorAll("button")].find((x) => /^Masquer/.test(x.textContent)); if (el) window.scrollBy(0, el.getBoundingClientRect().top - 260); }); }],
  ["journal", null, tab("Journal")],
  ["terrain", "1", null],
];

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".png": "image/png" };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, "") || "index.html";
  if (!SITE_FILES.includes(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(path.join(root, p)).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "avant-"));
const browser = await chromium.launch();
for (const [name, terrain, act] of VIEWS) {
  const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "block", reducedMotion: "reduce", deviceScaleFactor: 2 });
  await ctx.clock.setFixedTime(NOW);
  if (terrain) await ctx.addInitScript(() => { try { localStorage.setItem("bar:terrain-mode", "1"); } catch { /* sans effet */ } });
  await ctx.route(/tile\.openstreetmap\.org/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: PNG1 }));
  await ctx.route(/open-meteo\.com/, async (route) => {
    const r = omRespond(route.request().url(), "nominal");
    await route.fulfill({ status: r.status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(r.body) });
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/logonna.html`);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForFunction(() => /🌬 [A-Z]{1,3} \d+ km\/h/.test(document.body.innerText), null, { timeout: 20000 }).catch(() => {});
  if (act) await act(page);
  await page.waitForTimeout(600);
  const png = path.join(tmp, `${name}.png`);
  await page.screenshot({ path: png, animations: "disabled", caret: "hide" });
  // WebP (Pillow) : 780 px de large, qualité 72.
  execFileSync("python3", ["-I", "-c", "import sys\nfrom PIL import Image\ni=Image.open(sys.argv[1]).convert('RGB')\ni=i.resize((780, round(i.height*780/i.width)))\ni.save(sys.argv[2],'WEBP',quality=72)", png, path.join(outDir, `avant-${name}.webp`)]);
  console.log(`avant-${name}.webp`);
  await ctx.close();
}
await browser.close(); server.close();
fs.rmSync(tmp, { recursive: true, force: true });
