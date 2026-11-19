// Phase 11 — Parcours du prototype : chaque écran s'ouvre sans erreur, à 390 et 320 px, dans les deux thèmes ;
// accessibilité (axe-core) ; captures pour la revue (tests/shots/proto/).
// Usage : node tests/prototype.mjs [--shots] [--axe]
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const SHOTS = args.includes("--shots"), AXE = args.includes("--axe");
const outDir = path.join(root, "tests/shots/proto");
if (SHOTS) fs.mkdirSync(outDir, { recursive: true });

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".woff2": "font/woff2", ".png": "image/png", ".json": "application/json" };
const server = http.createServer((req, res) => {
  let p = path.join(root, decodeURIComponent(req.url.split("?")[0].split("#")[0]));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}/prototype/`;

const ROUTES = ["accueil", "bord-decision", "bord-carte", "bord-spot", "bord-compare", "bord-strategie", "bord-materiel", "bord-journal", "bord-terrain", "bord-plus",
  "bateau-sortir", "bateau-securite", "bateau-zones", "bateau-zone", "bateau-especes", "bateau-technique", "bateau-sorties", "bateau-profil",
  "etats", "systeme", "planche", "avant-apres", "conformite"];

let pass = 0, fail = 0;
const t = (name, ok, info = "") => { ok ? pass++ : fail++; if (!ok) console.log(`✗ ${name} ${info}`); };

const browser = await chromium.launch();
for (const [w, h] of [[390, 844], [320, 640]]) {
  for (const theme of ["nuit", "soleil"]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: SHOTS && w === 390 ? 2 : 1 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("requestfailed", (r) => errors.push(`échec ${r.url()}`));
    await page.addInitScript((th) => { try { localStorage.setItem("spumy-proto-theme", th); } catch {} }, theme);
    for (const r of ROUTES) {
      await page.goto(`${base}#${r}`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(250);
      const ok = await page.evaluate(() => !!document.querySelector(".s-app") && document.body.innerText.length > 40);
      t(`${r} ${w}px ${theme} : rendu`, ok);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      t(`${r} ${w}px ${theme} : pas de défilement horizontal`, overflow <= 0, `(${overflow} px)`);
      if (SHOTS && w === 390 && (theme === "nuit" || ["bord-decision", "bord-spot", "bord-carte", "bateau-sortir", "bord-terrain"].includes(r))) {
        await page.screenshot({ path: path.join(outDir, `${r}-${theme}.png`), fullPage: !r.startsWith("bord-terrain") });
      }
    }
    t(`${w}px ${theme} : aucune erreur dans la console`, errors.length === 0, errors.slice(0, 3).join(" | "));
    await page.close();
  }
}

// Interactions principales (390 px, nuit).
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${base}#bord-decision`);
  await page.getByRole("button", { name: "Voir la recommandation" }).click();
  await page.waitForTimeout(150);
  t("Décision → fiche du spot", (await page.evaluate(() => location.hash)) === "#bord-spot");
  await page.getByRole("button", { name: /^Confiance/ }).click();
  t("Fiche : un anneau ouvre la décomposition (Expert)", await page.getByText("Accord des modèles").isVisible());
  await page.getByRole("button", { name: "Détails" }).click();
  t("Fiche : niveau Détails (créneaux, marée)", await page.getByText(/Marée à Brest/).isVisible());
  await page.getByRole("button", { name: "Carte" }).first().click();
  t("Barre du bas → carte", (await page.evaluate(() => location.hash)) === "#bord-carte");
  await page.getByRole("button", { name: "Île de Térénez, non recommandé" }).click();
  t("Carte : spot non recommandé sélectionné", await page.getByText("Non recommandé").first().isVisible());
  await page.locator(".s-li", { hasText: "Pointe du Petit Minou" }).click();
  await page.waitForTimeout(400);
  t("Carte : le classement sélectionne un spot", (await page.locator(".p-spotcard--map h2").textContent()) === "Pointe du Petit Minou");
  // Pastilles voisines écartées : aucune ne chevauche une autre (boîtes des boutons).
  const overlap = await page.evaluate(() => { const r = [...document.querySelectorAll(".p-map__pin .s-pastille")].map((e) => e.getBoundingClientRect()); let n = 0;
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) if (r[i].left < r[j].right - 1 && r[j].left < r[i].right - 1 && r[i].top < r[j].bottom - 1 && r[j].top < r[i].bottom - 1) n++; return n; });
  t("Carte : aucune pastille n'en masque une autre", overlap === 0, `(${overlap} chevauchements)`);
  await page.goto(`${base}#bord-plus`);
  await page.getByRole("button", { name: "Plein soleil" }).click();
  t("Plus : thème Plein soleil", (await page.evaluate(() => document.querySelector(".s-app")?.dataset.theme)) === "soleil");
  await page.goto(`${base}#bateau-zones`);
  await page.getByRole("button", { name: /^Basse de l'Iroise/ }).first().click();
  t("Zones : zone au-delà de 6 milles non recommandée", await page.getByText(/au-delà de 6 milles/).isVisible());
  await page.goto(`${base}#accueil`);
  await page.getByRole("radio", { name: /En bateau/ }).click();
  t("Accueil : choix du mode BATEAU", await page.getByText("Sortir aujourd'hui ?").isVisible());
  await page.close();
}

if (AXE) {
  const axeSrc = fs.readFileSync(path.join(root, "node_modules/axe-core/axe.min.js"), "utf8");
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const theme of ["nuit", "soleil"]) {
    await page.addInitScript((th) => { try { localStorage.setItem("spumy-proto-theme", th); } catch {} }, theme);
    for (const r of ROUTES) {
      await page.goto(`${base}#${r}`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(200);
      await page.addScriptTag({ content: axeSrc });
      const v = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations.map((x) => `${x.id} (${x.nodes.length}) ${x.nodes[0]?.target?.join(" ")}`));
      t(`axe ${r} ${theme}`, v.length === 0, v.slice(0, 4).join(" | "));
    }
  }
  await page.close();
}

// Version ordinateur : cadre de téléphone et planches.
if (SHOTS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  for (const r of ["bord-decision", "systeme", "conformite", "planche"]) {
    await page.goto(`${base}#${r}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, `desk-${r}.png`), fullPage: r !== "bord-decision" });
  }
  await page.close();
}

await browser.close();
server.close();
console.log(`[prototype] ${ROUTES.length} écrans × 2 largeurs × 2 thèmes${AXE ? ", axe" : ""} : ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
