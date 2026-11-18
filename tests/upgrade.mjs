// Mise à jour d'un téléphone (lot 3.5) : ce qui a été saisi avec la version publiée est toujours là après la
// mise à jour, et la nouvelle version marche hors ligne.
//
// 1. La version publiée (fichiers du site sur origin/main, ou UPGRADE_FROM=<réf. Git>) est servie à une adresse.
//    Dans un vrai navigateur (téléphone simulé, service worker actif), on ouvre le guide de Logonna et on note une
//    session au journal par l'interface, puis on relève tout le stockage du navigateur (clés bar:*).
// 2. À la même adresse (même origine, donc même stockage), on sert la nouvelle version (fichiers construits à la
//    racine). Le guide s'ouvre ; chaque clé d'avant est toujours là, le journal est intact et la session s'affiche ;
//    le service worker passe à la nouvelle version ; hors ligne, un autre guide s'ouvre depuis le cache.
// Usage : node tests/upgrade.mjs   (après npm run build ; il faut la branche main : git fetch origin main)
import { chromium, devices } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { omRespond } from "./om_mock.mjs";
import { SITE_FILES } from "../scripts/sites.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const FROM = process.env.UPGRADE_FROM || "origin/main";
const git = (...a) => execFileSync("git", a, { cwd: root, maxBuffer: 64 << 20 });

// Version publiée : les fichiers du site à la racine de la référence (pages, scripts, fiches, icônes, manifeste).
const OLD = fs.mkdtempSync(path.join(os.tmpdir(), "spumy-publie-"));
const NOT_SITE = new Set(["package.json", "package-lock.json", ".eslintrc.json"]);
const oldFiles = git("ls-tree", "--name-only", FROM).toString().split("\n").filter((f) => /\.(html|js|json|png)$/.test(f) && !NOT_SITE.has(f));
for (const f of oldFiles) fs.writeFileSync(path.join(OLD, f), git("show", `${FROM}:${f}`));
const oldBuild = (fs.readFileSync(path.join(OLD, "sw.js"), "utf8").match(/guide-bar-([0-9a-f]+)/) || [])[1];
const newBuild = (fs.readFileSync(path.join(root, "sw.js"), "utf8").match(/guide-bar-([0-9a-f]+)/) || [])[1];

let ROOT = OLD, FILES = new Set(oldFiles);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".png": "image/png" };
// Servi à la racine, comme sur GitHub Pages à l'adresse de l'organisation (spumy.github.io).
const PREFIX = "/";
const server = http.createServer((req, res) => {
  const full = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (!full.startsWith(PREFIX)) { res.writeHead(404); return res.end("404"); }
  const p = full.slice(PREFIX.length) || "index.html";
  if (!FILES.has(p)) { res.writeHead(404); return res.end("404"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream", "Cache-Control": "no-cache" });
  fs.createReadStream(path.join(ROOT, p)).pipe(res);
});
await new Promise((r) => server.listen(8767, r));
const BASE = "http://localhost:8767";

const results = [];
const ok = (c, label) => { results.push([!!c, label]); console.log(`${c ? "✓" : "✗"} ${label}`); };
const waitText = (page, re, ms = 20000) => page.waitForFunction((src) => new RegExp(src).test(document.body.innerText), re.source, { timeout: ms });
const parisToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const parisOffsetMs = (ms) => Date.parse(new Date(ms).toLocaleString("sv-SE", { timeZone: "Europe/Paris" }).replace(" ", "T") + "Z") - ms;
const NOW = (() => { const g = Date.parse(`${parisToday}T06:30:00Z`); return g - parisOffsetMs(g); })();
const READY = /Conditions du jour/;
const PNG1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "allow" });
await ctx.clock.install({ time: NOW });
await ctx.route(/tile\.openstreetmap\.org/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: PNG1 }));
await ctx.route(/open-meteo\.com/, async (route) => {
  const r = omRespond(route.request().url(), "nominal");
  await route.fulfill({ status: r.status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(r.body) });
});
const errors = [];
const page = await ctx.newPage();
page.on("pageerror", (e) => errors.push(e.message));
const storage = () => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith("bar:")).sort().map((k) => [k, localStorage.getItem(k)])));
const swCaches = () => page.evaluate(async () => (await caches.keys()).sort());
// Jamais d'attente sans fin : chaque lecture du service worker abandonne au bout de 15 s.
const swReady = () => page.evaluate(() => Promise.race([
  navigator.serviceWorker.ready.then(() => !!navigator.serviceWorker.controller),
  new Promise((r) => setTimeout(() => r(false), 15000)),
]));

try {
  // ── 1. Version publiée : une session notée par l'interface ──
  console.log(`version publiée : ${FROM} (construction ${oldBuild || "?"}, ${oldFiles.length} fichiers) → nouvelle : ${newBuild || "?"}`);
  await page.goto(`${BASE}/logonna.html`); await waitText(page, READY);
  await page.getByRole("tab", { name: "Journal", exact: true }).click(); await page.waitForTimeout(300);
  await page.fill('input[placeholder^="Asturie"]', "Essai mise à jour");
  await page.fill('input[type="time"]', "19:15");
  await page.getByRole("button", { name: /^Enregistrer$/ }).first().click(); await page.waitForTimeout(500);
  await page.goto(`${BASE}/logonna.html`); await waitText(page, READY);
  ok(await swReady(), "version publiée : le service worker contrôle la page (téléphone avec l'application en cache)");
  const before = await storage();
  const jKey = "bar:journal:logonna-daoulas";
  const jBefore = JSON.parse(before[jKey] || "[]");
  ok(jBefore.some((e) => e.lure === "Essai mise à jour"), `version publiée : session enregistrée (${jBefore.length} au journal, ${Object.keys(before).length} clés bar:*)`);
  const cachesBefore = await swCaches();

  // ── 2. Même adresse, nouvelle version ──
  ROOT = root; FILES = new Set(SITE_FILES);
  await page.goto(`${BASE}/logonna.html`); await waitText(page, READY);
  // Le service worker de la nouvelle version s'installe (sw.js a changé), puis prend la main.
  await page.evaluate(() => Promise.race([navigator.serviceWorker.getRegistration().then((r) => r?.update()), new Promise((r) => setTimeout(r, 15000))]));
  // Installé (cache de la nouvelle version rempli) puis activé (cache de l'ancienne supprimé) : attendre les deux.
  await page.waitForFunction(([b, o]) => caches.keys().then((ks) => ks.includes(`guide-bar-${b}`) && !ks.includes(`guide-bar-${o}`)), [newBuild, oldBuild], { timeout: 30000 }).catch(() => {});
  await page.reload(); await waitText(page, READY);
  // Une page encore servie par l'ancien service worker a pu recréer son cache : l'ouverture de page suivante, servie
  // par le nouveau, le supprime. On compte les ouvertures nécessaires (au plus trois tolérées).
  let opens = 1;
  while (opens < 4 && (await swCaches()).includes(`guide-bar-${oldBuild}`)) {
    await page.waitForTimeout(1500); await page.reload(); await waitText(page, READY); opens++;
    await page.waitForFunction((o) => caches.keys().then((ks) => !ks.includes(`guide-bar-${o}`)), oldBuild, { timeout: 5000 }).catch(() => {});
  }
  const isNew = await page.evaluate(() => !!document.querySelector('script[src="app.js"]') || !!document.documentElement.dataset.page);
  ok(isNew, "nouvelle version servie à la même adresse");
  const after = await storage();
  const lost = Object.keys(before).filter((k) => !(k in after));
  ok(!lost.length, `aucune clé du stockage perdue (${Object.keys(before).length} avant, ${Object.keys(after).length} après)${lost.length ? ` — perdues : ${lost.join(", ")}` : ""}`);
  const jAfter = JSON.parse(after[jKey] || "[]");
  const kept = jBefore.every((e) => jAfter.some((x) => JSON.stringify(x) === JSON.stringify(e)));
  ok(kept && jAfter.length >= jBefore.length, `journal intact : chaque session d'avant est là à l'identique (${jBefore.length} → ${jAfter.length})`);
  const same = Object.keys(before).filter((k) => !/^bar:(wx|offshore:wx|probe)/.test(k) && before[k] !== after[k]);
  ok(!same.length, `réglages et données inchangés (hors caches météo)${same.length ? ` — modifiées : ${same.join(", ")}` : ""}`);
  await page.getByRole("tab", { name: "Journal", exact: true }).click(); await page.waitForTimeout(400);
  ok(/Essai mise à jour/.test(await page.evaluate(() => document.body.innerText)), "la session notée avec la version publiée s'affiche dans la nouvelle");
  const cachesAfter = await swCaches();
  ok(cachesAfter.includes(`guide-bar-${newBuild}`) && !cachesAfter.some((k) => cachesBefore.includes(k) && k !== `guide-bar-${newBuild}`),
    `cache hors ligne passé à la nouvelle version (${cachesBefore.join(", ")} → ${cachesAfter.join(", ")}, ${opens} ouverture${opens > 1 ? "s" : ""} de page après la mise à jour)`);

  // ── 3. Hors ligne : un guide jamais ouvert depuis la mise à jour s'ouvre depuis le cache ──
  await ctx.setOffline(true);
  await page.goto(`${BASE}/pirou.html`); await waitText(page, READY).catch(() => {});
  const txt = await page.evaluate(() => document.body.innerText);
  ok(READY.test(txt) && /Pirou/.test(txt), "hors ligne : le guide de Pirou s'ouvre (page, application et fiche en cache)");
  await page.goto(`${BASE}/`); await waitText(page, /Chercher un spot/).catch(() => {});
  ok(/Chercher un spot/.test(await page.evaluate(() => document.body.innerText)) && await page.evaluate(() => document.querySelectorAll("details.dept a.card").length) === 7,
    "hors ligne : l'accueil s'ouvre, avec ses sept guides");
  await ctx.setOffline(false);
  ok(!errors.length, `aucune erreur JavaScript${errors.length ? ` — ${errors.slice(0, 3).join(" | ")}` : ""}`);
} catch (e) {
  ok(false, `parcours interrompu : ${e.message.split("\n")[0]}`);
  try { console.log("  page :", page.url(), "|", (await page.evaluate(() => document.body.innerText)).slice(0, 300).replace(/\n/g, " / "), "| erreurs :", errors.join(" ; ")); } catch { /* page fermée */ }
} finally {
  await browser.close(); server.close(); fs.rmSync(OLD, { recursive: true, force: true });
}
const pass = results.filter((r) => r[0]).length;
console.log(`\nMISE À JOUR : ${pass}/${results.length}`);
if (pass !== results.length) process.exitCode = 1;
