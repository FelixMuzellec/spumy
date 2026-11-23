// Phase 4 V3 — mesure AVANT des performances (référentiel § 10.3 ; ARCHITECTURE-V3 § 7).
//
// Méthode : un petit serveur local sert le dépôt **compressé en gzip** (comme GitHub Pages) ; Chromium (Playwright) charge
// chaque page avec la limitation « téléphone moyen en 4G lente » de Lighthouse mobile : processeur ralenti 4 fois,
// 1,6 Mbit/s descendant, 750 kbit/s montant, 150 ms d'aller-retour. Cache vidé à chaque passage ; 3 passages, médiane.
// Mesures : premier affichage (FCP), plus grand affichage (LCP), DOMContentLoaded, chargement, octets transférés
// (compressés), mémoire JavaScript utilisée.
//
// Usage : node scripts/mesure-perf.mjs [sortie.json]   (par défaut : docs/socle/perf-avant.json)
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = process.argv[2] || path.join(root, "docs/socle/perf-avant.json");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".jpg": "image/jpeg" };
const COMPRESS = new Set([".html", ".js", ".css", ".json", ".svg", ".webmanifest"]);

const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  const ext = path.extname(p), body = fs.readFileSync(p);
  const gz = COMPRESS.has(ext) && /gzip/.test(req.headers["accept-encoding"] || "");
  res.writeHead(200, { "content-type": TYPES[ext] || "application/octet-stream", "cache-control": "no-store", ...(gz ? { "content-encoding": "gzip" } : {}) });
  res.end(gz ? zlib.gzipSync(body, { level: 9 }) : body);
}).listen(0);
const BASE = `http://localhost:${server.address().port}`;

const PAGES = [
  { id: "v2-accueil", url: "/index.html", label: "Accueil V2 (en ligne)" },
  { id: "v2-guide-pirou", url: "/pirou.html", label: "Guide de Pirou V2 (en ligne)" },
  { id: "v3-prototype-home", url: "/prototype-v3/index.html#home", label: "Home du prototype V3" },
  { id: "v3-prototype-carte", url: "/prototype-v3/index.html#carte", label: "Carte du prototype V3" },
];
const RUNS = 3;
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

const browser = await chromium.launch();
const result = { date: new Date().toISOString().slice(0, 10), methode: "Chromium (Playwright), processeur ralenti ×4, 1,6 Mbit/s, 150 ms, gzip, cache vide, médiane de 3", pages: {} };
for (const pg of PAGES) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await ctx.addInitScript(() => {
      window.__NO_LAUNCH__ = true;
      window.__lcp = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    let bytes = 0;
    cdp.on("Network.loadingFinished", (e) => { bytes += e.encodedDataLength || 0; });
    await page.goto(BASE + pg.url, { waitUntil: "load", timeout: 120000 });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0], fcp = performance.getEntriesByName("first-contentful-paint")[0];
      return { fcp: fcp ? fcp.startTime : null, lcp: window.__lcp || null, dcl: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, heap: performance.memory ? performance.memory.usedJSHeapSize : null };
    });
    runs.push({ ...m, bytes });
    await ctx.close();
  }
  const pick = (k) => med(runs.map((r) => r[k]).filter((v) => v != null));
  result.pages[pg.id] = { label: pg.label, fcpMs: Math.round(pick("fcp")), lcpMs: Math.round(pick("lcp")), dclMs: Math.round(pick("dcl")), loadMs: Math.round(pick("load")), transferKo: Math.round(pick("bytes") / 1024), heapMo: Math.round((pick("heap") / 1048576) * 10) / 10 };
  console.log(pg.id, JSON.stringify(result.pages[pg.id]));
}
await browser.close();
server.close();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
console.log(`→ ${path.relative(root, out)}`);
