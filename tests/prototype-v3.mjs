// Phase 3 V3 — parcours du prototype interactif (prototype-v3/, construit par scripts/build-prototype-v3.mjs).
// Chaque écran s'ouvre sans erreur à 320, 375, 390 px et sur bureau, dans les deux thèmes, sans défilement horizontal ;
// règles vérifiées : place réservée « Le plus proche », zone « À vérifier » séparée, filtre « Favorables » (75, V3-021)
// égal au nombre de pastilles, barre défilante de 4 onglets visibles (V3-023), ordre des onglets modifiable, choix du bateau.
// Options : --axe (axe-core, échec sur les violations graves ou critiques), --captures <dossier> (images WebP 390 × 844).
// Usage : node scripts/build-prototype-v3.mjs && node tests/prototype-v3.mjs [--axe] [--captures docs/design/prototype-v3]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const AXE = args.includes("--axe");
const CAP = args.includes("--captures") ? path.resolve(args[args.indexOf("--captures") + 1]) : null;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".webp": "image/webp", ".png": "image/png", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(res);
}).listen(0);
const BASE = `http://127.0.0.1:${server.address().port}/prototype-v3/index.html`;

let ok = 0, fail = 0;
const t = (name, cond, info = "") => { if (cond) ok++; else { fail++; console.log(`   ÉCHEC · ${name}${info ? " — " + info : ""}`); } };
const browser = await chromium.launch();
const ROUTES = ["home", "carte", "meteo", "profil", "journal", "spot-a", "spot-e", "spot-g", "comparer-c-a", "comparer-c-e"];
const VIEWS = [["320", { width: 320, height: 640 }], ["375", { width: 375, height: 812 }], ["390", { width: 390, height: 844 }], ["bureau", { width: 1280, height: 800 }]];

async function open(view, scheme, hash, launch = false) {
  const ctx = await browser.newContext({ viewport: view, colorScheme: scheme, reducedMotion: "reduce" });
  if (!launch) await ctx.addInitScript(() => { window.__NO_LAUNCH__ = true; });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(`${BASE}#${hash}`);
  await page.waitForSelector(".app");
  // Le prototype s'ouvre en « nuit marine » ; le thème clair est imposé comme le ferait Profil, Affichage.
  await page.evaluate((s) => document.documentElement.setAttribute("data-theme", s), scheme);
  return { ctx, page, errors };
}

// 1. Chaque écran, chaque largeur, chaque thème : aucune erreur, aucun défilement horizontal.
for (const [vn, view] of VIEWS) for (const scheme of ["light", "dark"]) {
  const { ctx, page, errors } = await open(view, scheme, "home");
  for (const r of ROUTES) {
    await page.evaluate((h) => { location.hash = h; }, r);
    await page.waitForTimeout(60);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    t(`${vn} ${scheme} #${r} : pas de défilement horizontal`, sw <= 0, `${sw} px`);
  }
  t(`${vn} ${scheme} : aucune erreur de page`, errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// 2. Règles de Home, de la Carte et de la fiche (390 px).
{
  const { ctx, page, errors } = await open({ width: 390, height: 844 }, "light", "home");
  const txt = await page.textContent("main");
  t("Home : phrase de synthèse avec horaires", /bonne matinée pour le bar\s:\s\d\d:\d\d–\d\d:\d\d/i.test(txt));
  t("Home : place réservée « Le plus proche » (V3-016)", txt.includes("Le plus proche"));
  t("Home : 3 cartes de recommandation", (await page.locator("article.rc").count()) === 3);
  t("Home : spots « à vérifier » hors des cartes", !(await page.locator("article.rc", { hasText: "Pointe E" }).count()) && txt.includes("À vérifier (2)"));
  t("Home : horaires en tête de chaque carte", (await page.locator("article.rc .rc-time").count()) === 3);
  t("Home : une photo par carte", (await page.locator("article.rc .rc-media img").count()) === 3);
  const levels = await page.locator("article.rc").evaluateAll((cards) => cards.map((c) => {
    const sizes = new Set();
    c.querySelectorAll("*").forEach((el) => { if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) sizes.add(getComputedStyle(el).fontSize); });
    return [...sizes];
  }));
  t("Home : au plus trois tailles de texte par carte", levels.every((l) => l.length <= 3), JSON.stringify(levels));
  t("Home : rythme de 16 px dans l'écran, sections séparées", (await page.locator(".screen.home").evaluate((e) => getComputedStyle(e).rowGap)) === "16px" && (await page.locator(".sect").count()) === 3);
  t("transition d'écran présente (fondu)", (await page.locator("main.fade").count()) === 1);
  t("Home : 32 px entre deux spots", (await page.locator(".cards2").first().evaluate((e) => getComputedStyle(e).rowGap)) === "32px");
  const bodies = await page.locator("article.rc .rc-body").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  t("Home : partie sous la photo compacte (≤ 110 px)", bodies.every((h) => h <= 110), bodies.join(","));
  t("Home : score posé sur la photo", (await page.locator("article.rc .rc-media .disc").count()) === 3);
  const logo = await page.locator("header .brand").evaluate((e) => { const i = e.querySelector("img"); return [e.textContent.trim(), i.getBoundingClientRect().width, i.complete && i.naturalWidth > 0, e.getAttribute("aria-label")]; });
  t("logo SPUMY dans l'en-tête : médaillon de 44 px et mot SPUMY", logo[0] === "SPUMY" && logo[1] >= 44 && logo[2] && /SPUMY/.test(logo[3]), JSON.stringify(logo));
  await page.evaluate(() => { location.hash = "carte"; });
  await page.waitForSelector(".mk");
  const favChip = page.locator(".chip", { hasText: "Favorables" });
  const n = Number((await favChip.locator(".num").textContent()).trim());
  await favChip.click();
  t("Carte : « Favorables » = 3 (seuil 75, sécurité, pas à vérifier)", n === 3, String(n));
  t("Carte : compteur égal aux pastilles affichées (groupes comptés)", (await page.locator(".mklayer .mk:not(.cluster)").count()) + (await page.locator(".mklayer .mk.cluster").evaluateAll((els) => els.reduce((m, e) => m + Number(e.dataset.n), 0))) === n);
  t("Carte : chaque pastille porte son score", (await page.locator(".mklayer .mk:not(.cluster) .lbl").allTextContents()).every((x) => /^\d+$|^–$/.test(x)));
  await page.locator(".chip", { hasText: "Tous" }).click();
  const all = Number((await page.locator(".chip", { hasText: "Tous" }).locator(".num").textContent()).trim());
  t("Carte : « Tous » égal aux pastilles affichées (groupes comptés)", (await page.locator(".mklayer .mk:not(.cluster)").count()) + (await page.locator(".mklayer .mk.cluster").evaluateAll((els) => els.reduce((m, e) => m + Number(e.dataset.n), 0))) === all, String(all));
  const box = await page.locator(".mapbox").boundingBox(), sheet = await page.locator(".sheet").boundingBox();
  const hidden = await page.locator(".mklayer .mk").evaluateAll((els, lim) => els.filter((e) => e.getBoundingClientRect().bottom > lim).length, Math.min(box.y + box.height, sheet.y));
  t("Carte : aucune pastille cachée sous la feuille", hidden === 0, String(hidden));
  t("Carte : pastilles « à vérifier » avec le signe d'avertissement (hors groupes)", (await page.locator(".mk.verify .ic").count()) + (await page.locator(".mk.cluster", { hasText: /./ }).evaluateAll((els) => els.filter((e) => /Pointe E|Anse J/.test(e.getAttribute("aria-label"))).length)) >= 2);
  const mb = await page.locator(".mapbox").boundingBox();
  const scaleOf = () => page.locator(".pz").evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a);
  const kInit = await scaleOf();
  await page.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2); await page.mouse.wheel(0, -400); await page.waitForTimeout(150);
  const k1 = await scaleOf();
  t("Carte : la molette zoome", k1 > 1.2 * kInit, `${kInit} → ${k1}`);
  const tx0 = await page.locator(".pz").evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).e);
  await page.mouse.down(); await page.mouse.move(mb.x + mb.width / 2 + 90, mb.y + mb.height / 2 + 40, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(100);
  const tx1 = await page.locator(".pz").evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).e);
  t("Carte : glisser déplace la carte", Math.abs(tx1 - tx0) > 40, `${tx0} → ${tx1}`);
  t("Carte : le zoom ne change pas le nombre de spots", (await page.locator(".mklayer .mk:not(.cluster)").count()) + (await page.locator(".mklayer .mk.cluster").evaluateAll((els) => els.reduce((m, e) => m + Number(e.dataset.n), 0))) === all);
  const pw = await page.locator(".mk:not(.cluster)").first().evaluate((e) => e.getBoundingClientRect().width);
  t("Carte : les pastilles gardent leur taille à l'écran", pw < 80, String(pw));
  await page.getByRole("button", { name: "Vue d'ensemble" }).click(); await page.waitForTimeout(100);
  const kFit = await scaleOf();
  t("Carte : « Vue d'ensemble » montre toute la carte, groupes compris", kFit <= 1 && (await page.locator(".mklayer .mk").evaluateAll((els, r) => els.every((e) => { const b = e.getBoundingClientRect(); return b.top >= r.y - 1 && b.bottom <= r.y + r.height + 1; }), mb)), String(kFit));
  const hb = await page.locator(".sheet-head").boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height - 6); await page.mouse.down();
  await page.mouse.move(hb.x + hb.width / 2, hb.y - 420, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(350);
  t("Carte : la feuille se tire vers le haut et s'aimante (liste classée)", (await page.locator(".sheet.snap-full").count()) === 1 && (await page.locator(".sheet-body .list").count()) === 1);
  await page.locator(".sheet .grip").click(); await page.waitForTimeout(350);
  t("Carte : la poignée referme la feuille", (await page.locator(".sheet.snap-peek").count()) === 1);
  t("Carte : pastille barrée pour « non recommandé » (ou dans un groupe)", (await page.locator(".mk.nr").count()) === 1 || (await page.locator(".mk.cluster").evaluateAll((els) => els.some((e) => /Roche G/.test(e.getAttribute("aria-label"))))));
  t("Carte : pastille vide sans note (ou dans un groupe)", (await page.locator(".mk.empty").count()) === 1 || (await page.locator(".mk.cluster").evaluateAll((els) => els.some((e) => /Plage H/.test(e.getAttribute("aria-label"))))));
  await page.evaluate(() => { location.hash = "spot-a"; });
  await page.waitForSelector(".tide svg");
  const ft = await page.textContent("main");
  t("Fiche : courbe de marée et horaires favorables coloriés", ft.includes("Marée et heures favorables") && /07:30–11:00 · 82/.test(ft));
  t("Fiche : danger avant la marée", ft.indexOf("Accès coupé") < ft.indexOf("Marée et heures favorables"));
  t("Fiche : Confiance ne change pas le rang", ft.includes("ne change pas le rang"));
  await page.evaluate(() => { location.hash = "spot-e"; });
  await page.waitForTimeout(80);
  t("Fiche : fixture « 53/100 — À vérifier »", (await page.textContent("main")).includes("53/100 — À vérifier"));
  await page.evaluate(() => { location.hash = "comparer-c-a"; });
  await page.waitForTimeout(80);
  const ct = await page.textContent("main");
  t("Comparaison : ligne Vent", ct.includes("Vent") && ct.includes("abrité") && ct.includes("de face"));
  t("Comparaison : écart chiffré", /\+15 min de route \(\+13 km\) pour \+24 points/.test(ct), ct.match(/\+\d+ min[^.]*/)?.[0]);
  await page.evaluate(() => { location.hash = "comparer-c-e"; });
  await page.waitForTimeout(80);
  t("Comparaison : « avantage non établi » si un spot est à vérifier", (await page.textContent("main")).includes("Avantage non établi"));
  t("parcours 390 : aucune erreur", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// 3. Barre défilante, ordre des onglets, Météo, BATEAU.
{
  const { ctx, page, errors } = await open({ width: 390, height: 844 }, "light", "home");
  const vis = await page.evaluate(() => { const n = document.querySelector(".nav"); const r = n.getBoundingClientRect();
    return [...n.querySelectorAll("a")].map((a) => { const b = a.getBoundingClientRect(); return [a.textContent, b.left >= r.left - 1 && b.right <= r.right + 1]; }); });
  t("barre : 4 onglets visibles, Journal hors champ", vis.filter((v) => v[1]).length === 4 && vis.find((v) => v[0] === "Journal")?.[1] === false, JSON.stringify(vis));
  t("barre : chevron de suite à droite", (await page.locator(".navwrap .more.r").count()) === 1);
  const nb = await page.locator(".nav").boundingBox();
  await page.mouse.move(nb.x + nb.width - 20, nb.y + nb.height / 2); await page.mouse.down();
  await page.mouse.move(nb.x + 40, nb.y + nb.height / 2, { steps: 8 }); await page.mouse.up();
  await page.waitForTimeout(250);
  t("barre : glissée à la souris, elle défile (Journal visible, chevron gauche)", (await page.locator(".navwrap .more.l").count()) === 1);
  await page.locator(".navwrap .more.l").click();
  await page.waitForTimeout(400);
  t("barre : le chevron gauche ramène le début", (await page.locator(".nav").evaluate((n) => n.scrollLeft)) < 5);
  await page.locator(".navwrap .more.r").click();
  await page.waitForTimeout(400);
  await page.locator(".nav a", { hasText: "Journal" }).click();
  await page.waitForTimeout(80);
  t("barre : Journal ouvert au toucher", (await page.textContent("main")).includes("Sortie en cours"));
  await page.evaluate(() => { location.hash = "profil"; });
  await page.waitForTimeout(80);
  await page.getByRole("button", { name: "Monter Journal" }).click();
  const order = await page.locator(".nav a").allTextContents();
  t("Profil : ordre des onglets modifié", order.join(",") === "Home,Carte,Météo,Journal,Profil", order.join(","));
  await page.evaluate(() => { location.hash = "meteo"; });
  await page.waitForTimeout(80);
  t("Météo : grille de flèches de vent", (await page.locator(".mapbox polygon").count()) >= 20);
  await page.locator('input[type="range"]').fill("5");
  t("Météo : le curseur change l'heure", (await page.textContent("main")).includes("Pirou, 14:00"));
  await page.getByRole("radio", { name: "BATEAU" }).click();
  await page.evaluate(() => { location.hash = "home"; });
  await page.waitForTimeout(80);
  t("BATEAU : choix du bateau avant tout verdict", (await page.textContent("main")).includes("Avec quel bateau ?"));
  await page.getByRole("button", { name: "Voir si je peux sortir" }).click();
  t("BATEAU : verdict de sortie après le choix", /Sortie possible\s: 07:00–12:00/.test(await page.textContent("main")));
  await page.evaluate(() => { location.hash = "meteo"; });
  await page.waitForTimeout(80);
  await page.getByRole("tab", { name: "Mer" }).click();
  t("Météo BATEAU : couche Mer", (await page.textContent("main")).includes("Open-Meteo Marine"));
  t("parcours barre, Météo, BATEAU : aucune erreur", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// Puce de position : un nom de commune long reste lisible en entier, sur deux lignes au besoin (320, 375 et 390 px).
for (const w of [320, 375, 390]) {
  const { ctx, page } = await open({ width: w, height: 812 }, "dark", "home");
  await page.locator(".poschip").click();
  await page.locator(".modal input").fill("Saint-Pi");
  await page.locator(".suggest button", { hasText: "Saint-Pierre-Quiberon" }).click();
  await page.getByRole("button", { name: "Utiliser cette position" }).click();
  const fit = await page.locator(".poschip span").evaluate((e) => [e.textContent, e.scrollWidth <= e.clientWidth + 1 && e.scrollHeight <= e.clientHeight + 1]);
  t(`${w} px : « Saint-Pierre-Quiberon » entier dans la puce de position`, fit[0] === "Saint-Pierre-Quiberon" && fit[1], JSON.stringify(fit));
  await ctx.close();
}

// Écran de lancement : le logo complet d'origine sur son fond crème, puis l'application.
{
  const { ctx, page, errors } = await open({ width: 390, height: 844 }, "dark", "home", true);
  const shown = await page.locator(".launch img").evaluate((i) => i.complete && i.naturalWidth > 0 && getComputedStyle(i.parentElement).backgroundColor);
  t("lancement : logo complet sur le fond crème d'origine", shown === "rgb(233, 226, 210)", String(shown));
  await page.waitForSelector(".launch", { state: "detached", timeout: 4000 });
  t("lancement : l'application suit", (await page.locator("article.rc").count()) === 3 && errors.length === 0);
  await ctx.close();
}

// Icônes de l'application : favicon, icône iOS et manifeste pointent vers les exports V3 du logo, qui existent.
{
  const html = fs.readFileSync(path.join(root, "prototype-v3/index.html"), "utf8");
  const man = JSON.parse(fs.readFileSync(path.join(root, "prototype-v3/manifest.webmanifest"), "utf8"));
  const refs = [...html.matchAll(/<link rel="(icon|apple-touch-icon)"[^>]*href="([^"]+)"/g)].map((m) => m[2]);
  t("icônes : favicon et icône iOS déclarés", refs.length === 2 && html.includes('rel="manifest"'));
  t("icônes : fichiers présents", [...refs, ...man.icons.map((i) => i.src)].every((r) => fs.existsSync(path.join(root, "prototype-v3", r))));
  t("manifeste : nom SPUMY, icône adaptative", man.name === "SPUMY" && man.icons.some((i) => i.purpose === "maskable"));
}

// Revues de la phase 3 (docs/design/REVUES-V3.md) : fixture § 6.7.2, Confiance sans effet sur le rang, cibles tactiles,
// un titre h1 et un titre de page par écran, texte de 12 px au moins.
{
  const { ranking, SPOTS } = await import("../src/prototype-v3/data.js");
  const ids = (r) => r.cards.map((c) => c.id).join(",");
  const base = ids(ranking(SPOTS));
  const variants = [SPOTS.map((s) => ({ ...s, conf: 100 - s.conf })), SPOTS.map((s, i) => ({ ...s, conf: (i * 37) % 101 })), SPOTS.map((s) => ({ ...s, conf: 0 }))];
  t("règle : la Confiance ne change jamais le rang (3 jeux de Confiance)", variants.every((v) => ids(ranking(v)) === base), base);
  t("règle : la Confiance ne change pas les égalités", ids(ranking(SPOTS, { tie: true })) === ids(ranking(SPOTS.map((s) => ({ ...s, conf: 100 - s.conf })), { tie: true })));

  {
    const c = await open({ width: 390, height: 844 }, "dark", "carte");
    await c.page.getByRole("button", { name: /^Favorables/ }).click();
    const rule = await c.page.locator(".sheet-body").innerText();
    t("Carte : la règle d'inclusion du filtre est affichée (§ 6.9)", rule.includes("Favorables : 75 ou plus") && (await c.page.getByRole("button", { name: /^Favorables/ }).getAttribute("title")).includes("75"));
    await c.ctx.close();
  }
  const { ctx, page } = await open({ width: 390, height: 844 }, "dark", "spot-e");
  const fe = await page.locator("main").innerText();
  t("fixture § 6.7.2 : Favorabilité 53 — À vérifier, Confiance 69 — Moyenne, sans effet sur le rang",
    /53/.test(fe) && fe.includes("À vérifier") && /69/.test(fe) && fe.includes("Moyenne") && fe.includes("ne change pas le rang"));
  const TITLES = { home: "Home", carte: "Carte", meteo: "Météo", profil: "Profil", journal: "Journal", "spot-a": "Pointe A", "spot-e": "Pointe E", "comparer-c-a": "Comparaison" };
  for (const r of ["home", "carte", "meteo", "profil", "journal", "spot-a", "spot-e", "comparer-c-a"]) {
    await page.evaluate((h) => { location.hash = h; }, r);
    await page.waitForTimeout(80);
    const m = await page.evaluate(() => {
      const SEL = "button, a[href], input, select, textarea, [role=button], [role=tab], [role=radio], [tabindex='0']";
      const target = (e) => {
        let { left, top, right, bottom } = e.getBoundingClientRect();
        for (const ps of ["::before", "::after"]) {
          const c = getComputedStyle(e, ps); if (c.content === "none" || c.position !== "absolute") continue;
          const host = getComputedStyle(e).position !== "static" ? e : e.offsetParent; if (!host) continue;
          const h = host.getBoundingClientRect(), v = [c.top, c.right, c.bottom, c.left].map(parseFloat); if (v.some(Number.isNaN)) continue;
          left = Math.min(left, h.left + v[3]); top = Math.min(top, h.top + v[0]); right = Math.max(right, h.right - v[1]); bottom = Math.max(bottom, h.bottom - v[2]);
        }
        const lab = e.closest("label"); if (lab) { const b = lab.getBoundingClientRect(); left = Math.min(left, b.left); top = Math.min(top, b.top); right = Math.max(right, b.right); bottom = Math.max(bottom, b.bottom); }
        return Math.min(right - left, bottom - top);
      };
      const vis = [...document.querySelectorAll(SEL)].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && !e.closest("[aria-hidden=true]"); });
      const small = vis.filter((e) => target(e) < 43.5).map((e) => (e.getAttribute("aria-label") || e.textContent).trim().slice(0, 30));
      const sizes = [...document.querySelectorAll(".app *")].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !e.closest(".vh, [aria-hidden=true]") && e.getBoundingClientRect().width)
        .map((e) => parseFloat(getComputedStyle(e).fontSize));
      return { small, h1: document.querySelectorAll("h1").length, title: document.title, minText: Math.min(...sizes) };
    });
    t(`cibles #${r} : 44 px au moins (TOUCH.min)`, m.small.length === 0, m.small.join(" ; "));
    t(`titres #${r} : un seul h1 et un titre de page`, m.h1 === 1 && m.title === `${TITLES[r]} · SPUMY`, `${m.h1} h1, « ${m.title} »`);
    t(`texte #${r} : 12 px au moins`, m.minText >= 12, `${m.minText} px`);
  }
  await ctx.close();
}

// 4. Accessibilité (axe-core), deux thèmes.
if (AXE) {
  const axeSrc = fs.readFileSync(path.join(root, "node_modules/axe-core/axe.min.js"), "utf8");
  for (const scheme of ["light", "dark"]) for (const r of ["home", "carte", "meteo", "profil", "spot-a", "comparer-c-a"]) {
    const { ctx, page } = await open({ width: 390, height: 844 }, scheme, r);
    await page.waitForTimeout(150);
    if (r === "home") await page.locator(".poschip").click(); // feuille de position ouverte : ses couleurs passent aussi au contrôle
    await page.waitForTimeout(100);
    await page.addScriptTag({ content: axeSrc });
    const res = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })).violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length })));
    const grave = res.filter((v) => v.impact === "serious" || v.impact === "critical");
    t(`axe ${scheme} #${r} : aucune violation grave`, grave.length === 0, JSON.stringify(grave));
    if (res.length > grave.length) console.log(`   (axe ${scheme} #${r} : ${JSON.stringify(res.filter((v) => !grave.includes(v)))})`);
    await ctx.close();
  }
}

// 5. Captures pour la revue.
if (CAP) {
  fs.mkdirSync(CAP, { recursive: true });
  const shots = [["home", "dark", "01-home-bord"], ["carte", "dark", "02-carte"], ["meteo", "dark", "03-meteo"], ["spot-a", "dark", "04-fiche-spot"], ["comparer-c-a", "dark", "05-comparaison"],
    ["profil", "dark", "06-profil"], ["journal", "dark", "07-journal"], ["home", "light", "08-home-bord-clair"], ["carte", "light", "09-carte-claire"]];
  for (const [r, scheme, name] of shots) {
    const { ctx, page } = await open({ width: 390, height: 844 }, scheme, r);
    await page.addStyleTag({ content: ".navwrap{position:relative!important}" }); // capture pleine page : la barre à sa place, en bas
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(CAP, `${name}.png`), fullPage: true });
    await ctx.close();
  }
  const { ctx, page } = await open({ width: 390, height: 844 }, "dark", "home");
  await page.getByRole("radio", { name: "BATEAU" }).click();
  await page.getByRole("button", { name: "Voir si je peux sortir" }).click();
  await page.addStyleTag({ content: ".navwrap{position:relative!important}" });
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(CAP, "10-home-bateau.png"), fullPage: true });
  await ctx.close();
  const d = await open({ width: 1280, height: 800 }, "dark", "carte");
  await d.page.waitForTimeout(250);
  await d.page.screenshot({ path: path.join(CAP, "11-carte-bureau.png") });
  await d.ctx.close();
}

await browser.close();
server.close();
console.log(`[prototype v3] parcours, règles et largeurs : ${ok}/${ok + fail}`);
process.exit(fail ? 1 : 0);
