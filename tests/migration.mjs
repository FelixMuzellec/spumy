// Changement d'adresse (organisation GitHub « spumy », spumy.github.io) : le journal saisi à l'ancienne adresse
// (felixmuzellec.github.io/guide-peche-bar/, v8.15) passe à la nouvelle sans rien perdre.
//
// Une autre adresse est une autre origine : le navigateur ne partage pas le stockage. Le passage se fait par le
// fichier du journal : « Exporter » dans l'ancienne application, « Importer » dans la nouvelle, guide par guide.
// 1. Ancienne version (UPGRADE_FROM, v8.15 par défaut) servie sous /guide-peche-bar/ sur une origine A : une session
//    est notée dans deux guides, puis chaque journal est exporté (fichier téléchargé).
// 2. Nouvelle version (fichiers construits à la racine) servie à la racine d'une origine B, comme spumy.github.io :
//    le stockage y est vide ; chaque fichier est importé ; chaque session d'avant est là, à l'identique, et s'affiche.
// Usage : node tests/migration.mjs   (après npm run build ; il faut la v8.15 : voir .github/workflows/tests.yml)
import { chromium, devices } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { omRespond } from "./om_mock.mjs";
import { SITE_FILES } from "../scripts/sites.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const FROM = process.env.UPGRADE_FROM || "gpb/v8.15";
const git = (...a) => execFileSync("git", a, { cwd: root, maxBuffer: 64 << 20 });
const OLD = fs.mkdtempSync(path.join(os.tmpdir(), "spumy-ancienne-"));
const NOT_SITE = new Set(["package.json", "package-lock.json", ".eslintrc.json"]);
const oldFiles = git("ls-tree", "--name-only", FROM).toString().split("\n").filter((f) => /\.(html|js|json|png)$/.test(f) && !NOT_SITE.has(f));
for (const f of oldFiles) fs.writeFileSync(path.join(OLD, f), git("show", `${FROM}:${f}`));
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".png": "image/png" };
const serve = (dir, files, prefix, port) => new Promise((r) => {
  const s = http.createServer((req, res) => {
    const full = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (!full.startsWith(prefix)) { res.writeHead(404); return res.end("404"); }
    const p = full.slice(prefix.length) || "index.html";
    if (!files.has(p)) { res.writeHead(404); return res.end("404"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream", "Cache-Control": "no-cache" });
    fs.createReadStream(path.join(dir, p)).pipe(res);
  });
  s.listen(port, () => r(s));
});
const A = "http://localhost:8770/guide-peche-bar", B = "http://127.0.0.1:8771";
const sA = await serve(OLD, new Set(oldFiles), "/guide-peche-bar/", 8770);
const sB = await serve(root, new Set(SITE_FILES), "/", 8771);

const results = [];
const ok = (c, label) => { results.push([!!c, label]); console.log(`${c ? "✓" : "✗"} ${label}`); };
const waitText = (page, re, ms = 20000) => page.waitForFunction((src) => new RegExp(src).test(document.body.innerText), re.source, { timeout: ms });
const parisToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const parisOffsetMs = (ms) => Date.parse(new Date(ms).toLocaleString("sv-SE", { timeZone: "Europe/Paris" }).replace(" ", "T") + "Z") - ms;
const NOW = (() => { const g = Date.parse(`${parisToday}T06:30:00Z`); return g - parisOffsetMs(g); })();
const READY = /Conditions du jour/;
const PNG1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
const GUIDES = [{ key: "logonna", id: "logonna-daoulas" }, { key: "pirou", id: "pirou-plage" }];

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "block", acceptDownloads: true });
await ctx.clock.install({ time: NOW });
await ctx.route(/tile\.openstreetmap\.org/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: PNG1 }));
await ctx.route(/open-meteo\.com/, async (route) => {
  const r = omRespond(route.request().url(), "nominal");
  await route.fulfill({ status: r.status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(r.body) });
});
const errors = [];
const page = await ctx.newPage();
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", (d) => { errors.push(`boîte de dialogue : ${d.message()}`); d.dismiss().catch(() => {}); });
const journalOf = (id) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "[]"), `bar:journal:${id}`);
const tabJournal = () => page.getByRole("tab", { name: "Journal", exact: true }).click().then(() => page.waitForTimeout(400));
const key = (e) => JSON.stringify([e.id, e.spotId, e.date, e.time ?? e.heure ?? null, e.lure ?? null, e.fish ?? null]);
const files = {}, before = {};

try {
  console.log(`ancienne adresse : ${FROM} sous ${A}/ → nouvelle : construction du dépôt à la racine de ${B}/`);
  // ── 1. Ancienne adresse : une session par guide, puis export du journal ──
  for (const g of GUIDES) {
    await page.goto(`${A}/${g.key}.html`); await waitText(page, READY);
    await tabJournal();
    await page.fill('input[placeholder^="Asturie"]', `Migration ${g.key}`);
    await page.fill('input[type="time"]', "19:15");
    await page.getByRole("button", { name: /^Enregistrer$/ }).first().click(); await page.waitForTimeout(600);
    before[g.key] = await journalOf(g.id);
    ok(before[g.key].some((e) => e.lure === `Migration ${g.key}`), `${g.key}, ancienne adresse : session notée (${before[g.key].length} au journal)`);
    const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 10000 }), page.getByRole("button", { name: /^Exporter$/ }).first().click()]);
    files[g.key] = path.join(OLD, `export-${g.key}.json`); await dl.saveAs(files[g.key]);
    const exported = JSON.parse(fs.readFileSync(files[g.key], "utf8"));
    ok(Array.isArray(exported) && exported.length === before[g.key].length, `${g.key}, ancienne adresse : journal exporté en un fichier (${exported.length} entrées)`);
  }
  // ── 2. Nouvelle adresse : stockage vide, import, contrôle ──
  for (const g of GUIDES) {
    await page.goto(`${B}/${g.key}.html`); await waitText(page, READY);
    const empty = !(await journalOf(g.id)).some((e) => e.lure === `Migration ${g.key}`);
    ok(empty, `${g.key}, nouvelle adresse : autre origine, le journal de l'ancienne n'y est pas avant l'import`);
    await tabJournal();
    await page.setInputFiles('input[type="file"][accept="application/json,.json"]', files[g.key]); await page.waitForTimeout(800);
    const after = await journalOf(g.id);
    const have = new Set(after.map(key));
    const lost = before[g.key].filter((e) => !have.has(key(e)));
    ok(!lost.length, `${g.key}, nouvelle adresse : chaque session d'avant est là, à l'identique (${before[g.key].length} → ${after.length})${lost.length ? ` — manquent : ${lost.map((e) => e.id).join(", ")}` : ""}`);
    await page.goto(`${B}/${g.key}.html`); await waitText(page, READY); await tabJournal();
    ok(new RegExp(`Migration ${g.key}`).test(await page.evaluate(() => document.body.innerText)), `${g.key}, nouvelle adresse : la session importée s'affiche, et reste après rechargement`);
  }
  ok(!errors.length, `aucune erreur JavaScript ni boîte de dialogue${errors.length ? ` — ${errors.slice(0, 3).join(" | ")}` : ""}`);
} catch (e) {
  ok(false, `parcours interrompu : ${e.message.split("\n")[0]}`);
  try { console.log("  page :", page.url(), "|", (await page.evaluate(() => document.body.innerText)).slice(0, 300).replace(/\n/g, " / ")); } catch { /* page fermée */ }
} finally {
  await browser.close(); sA.close(); sB.close(); fs.rmSync(OLD, { recursive: true, force: true });
}
const pass = results.filter((r) => r[0]).length;
console.log(`\nCHANGEMENT D'ADRESSE : ${pass}/${results.length}`);
if (pass !== results.length) process.exitCode = 1;
