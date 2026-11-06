// Accessibilité : axe-core (WCAG 2.0 à 2.2 A et AA + bonnes pratiques) sur l'accueil, BATEAU (Offshore), chaque onglet
// des sept guides, les formulaires et le mode plein soleil. Météo simulée (tests/om_mock.mjs), tuiles remplacées.
// Usage : npm run test:a11y   (SITES=logonna,pirou pour limiter). Code de sortie 1 s'il reste une violation.
import { chromium } from "playwright";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { omRespond } from "./om_mock.mjs";
const require = createRequire(import.meta.url);
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const T = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".json": "application/json", ".js": "text/javascript" };
const srv = http.createServer((q, r) => { let p = new URL(q.url, "http://x").pathname; if (p === "/") p = "/index.html"; const f = path.join(DOCS, p); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "Content-Type": T[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, r));
const BASE = `http://localhost:${srv.address().port}`;
const b = await chromium.launch();
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
let total = 0;
async function run(pg, label) {
  await pg.evaluate(AXE);
  const res = await pg.evaluate(async (tags) => { const r = await window.axe.run(document, { runOnly: { type: "tag", values: tags } });
    return r.violations.map((v) => `[${v.impact}] ${v.id} (${v.nodes.length}) ${v.nodes.slice(0, 2).map((n) => n.target.join(" ") + " " + (n.any[0]?.message || n.failureSummary || "").slice(0, 140)).join(" | ")}`); }, TAGS);
  total += res.length;
  console.log(`== ${label} (${res.length})`); for (const x of res) console.log("  ", x);
}
const mk = async (theme) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "block" });
  if (theme) await ctx.addInitScript((t) => localStorage.setItem("bar:theme", t), theme);
  await ctx.route(/open-meteo/, async (rt) => { const x = omRespond(rt.request().url(), "nominal"); await rt.fulfill({ status: x.status, contentType: "application/json", body: JSON.stringify(x.body) }); });
  await ctx.route(/openstreetmap/, (rt) => rt.fulfill({ status: 200, contentType: "image/png", body: png }));
  return ctx;
};
const homeReady = (pg) => pg.waitForFunction(() => /calculées pour les 7 guides/.test(document.body.innerText), null, { timeout: 40000 }).catch(() => console.log("  (carte : calcul non terminé)"));
{ const ctx = await mk(); const pg = await ctx.newPage(); await pg.goto(`${BASE}/`); await homeReady(pg);
  await run(pg, "accueil · carte calculée"); await pg.fill("#q", "pointe"); await pg.waitForTimeout(200); await run(pg, "accueil · résultats"); await pg.fill("#q", "xyz"); await run(pg, "accueil · aucun résultat");
  await pg.fill("#q", "");
  const bb = await pg.locator("path.gspot-concarneau-trevignon").boundingBox().catch(() => null); if (bb) { await pg.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(300); }
  await run(pg, "accueil · spot choisi sur la carte");
  await pg.getByRole("button", { name: "＋ Ajouter un spot" }).click(); await pg.waitForTimeout(500); await run(pg, "accueil · formulaire ajouter un spot");
  const f = pg.locator('form[aria-label="Ajouter un spot"]');
  await f.getByRole("button", { name: "Ajouter ce spot", exact: true }).click(); await pg.waitForTimeout(300); await run(pg, "accueil · formulaire avec erreur");
  await f.getByLabel("Coordonnées ou lien Google Maps").fill("48.6005, -4.5655"); await f.getByRole("button", { name: "Placer", exact: true }).click(); await pg.waitForTimeout(400);
  await run(pg, "accueil · formulaire, point placé (guide choisi)");
  await pg.fill("#ms-name", "Spot axe"); await f.getByRole("button", { name: "S", exact: true }).click(); await f.getByRole("button", { name: "Ajouter ce spot", exact: true }).click(); await pg.waitForTimeout(800);
  await run(pg, "accueil · spot ajouté");
  await pg.goto(`${BASE}/plouguerneau.html#spots`); await pg.waitForTimeout(3000); await run(pg, "plouguerneau · tes spots (lien vers l'accueil)");
  const rid = await pg.evaluate(() => JSON.parse(localStorage.getItem("bar:myspots:plouguerneau") || "[]")[0]?.id);
  if (rid) { await pg.getByRole("button", { name: "Spot axe", exact: true }).click(); await pg.waitForTimeout(600); await pg.getByRole("button", { name: "Modifier ce spot" }).click(); await pg.waitForTimeout(500); await run(pg, "plouguerneau · modifier ton spot"); }
  await ctx.close(); }
{ const ctx = await mk(); const pg = await ctx.newPage(); await pg.goto(`${BASE}/#offshore`); await pg.waitForTimeout(1500);
  await run(pg, "offshore · vide");
  await pg.getByRole("button", { name: "＋ Ajouter un spot bateau" }).click(); await pg.waitForTimeout(300); await run(pg, "offshore · formulaire spot");
  await pg.fill("#bs-name", "Basse axe"); await pg.getByLabel("Coordonnées du spot bateau ou lien Google Maps").fill("48.20, -4.80"); await pg.getByRole("button", { name: "Placer", exact: true }).click();
  await pg.getByRole("button", { name: "Ajouter ce spot", exact: true }).click(); await pg.waitForTimeout(2500); await run(pg, "offshore · spot et conditions");
  await pg.getByRole("button", { name: "＋ Enregistrer une sortie" }).click(); await pg.getByRole("button", { name: "＋ Ajouter une prise" }).click(); await pg.waitForTimeout(300); await run(pg, "offshore · formulaire sortie");
  await pg.getByRole("button", { name: "Annuler" }).last().click();
  const sid = await pg.evaluate(() => JSON.parse(localStorage.getItem("bar:offshore:spots"))[0].id);
  await pg.evaluate((s) => { const L = []; for (let k = 0; k < 12; k++) { const wave = 0.5 + (k % 4) * 0.5; L.push({ id: "t-axe" + String(k).padStart(3, "0"), spotId: s, date: "2026-10-" + String(10 + k).padStart(2, "0"), start: "07:00", end: "10:00",
    catches: k % 3 === 0 ? [] : [{ sp: "lieu-jaune", n: 1 + Math.round(wave * 2) }], tech: [], notes: "", cond: { wind: 10 + k * 2, gust: 20 + k * 3, wave, period: 8 + (k % 3), coef: 50 + k * 4, tideH: k % 12, hour: 8.5, doy: 283 + k, sst: 14 + (k % 2), pressure: 1010 + k }, createdAt: 1, updatedAt: 1 }); }
    localStorage.setItem("bar:offshore:trips", JSON.stringify(L)); }, sid);
  await pg.reload(); await pg.waitForTimeout(3000); await run(pg, "offshore · modèle, courbe, notes");
  await ctx.close(); }
const SITES = (process.env.SITES || "logonna,pirou,plouguerneau,audierne,carantec,concarneau,crozon").split(",");
const TABS = ["plus", "synthese", "spots", "leurres", "maree", "meteo", "journal", "saison", "regles", "photos"];
for (const site of SITES) {
  const ctx = await mk(); const pg = await ctx.newPage();
  await pg.goto(`${BASE}/${site}.html`); await pg.waitForFunction(() => /Conditions du jour/.test(document.body.innerText), null, { timeout: 15000 }).catch(() => {});
  await pg.waitForTimeout(1500);
  for (const t of TABS) { await pg.evaluate((k) => { location.hash = k; }, t); await pg.waitForTimeout(900); await run(pg, `${site}#${t}`); }
  // v8.11 : formulaire « Ajouter un spot » ouvert, puis la fiche d'un de tes spots.
  await pg.evaluate(() => { location.hash = "spots"; }); await pg.waitForTimeout(600);
  const add = pg.getByRole("button", { name: "＋ Ajouter un spot" });
  if (await add.count()) {
    await add.click(); await pg.waitForTimeout(500); await run(pg, `${site} · formulaire ajouter un spot`);
    const f = pg.locator('form[aria-label="Ajouter un spot"]');
    await pg.fill("#ms-name", "Spot axe"); await f.getByLabel("Coordonnées ou lien Google Maps").fill(await pg.evaluate(() => "")); 
    await f.getByRole("button", { name: "Ajouter ce spot", exact: true }).click(); await pg.waitForTimeout(300); await run(pg, `${site} · formulaire avec erreur`);
  }
  await ctx.close();
}
{ const ctx = await mk("sun"); const pg = await ctx.newPage(); await pg.goto(`${BASE}/concarneau.html`); await pg.waitForTimeout(4000); await run(pg, "concarneau plein soleil"); await pg.goto(`${BASE}/`); await homeReady(pg); await run(pg, "accueil plein soleil"); await ctx.close(); }
console.log("TOTAL violations:", total);
await b.close(); srv.close();
if (total > 0) process.exitCode = 1;
