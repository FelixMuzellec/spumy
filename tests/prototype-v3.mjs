// Phase 3 V3 — parcours du prototype interactif, version 6 (prototype-v3/, construit par scripts/build-prototype-v3.mjs).
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
const ROUTES = ["home", "carte", "meteo", "profil", "journal", "spot-agon", "spot-portbail", "spot-surtainville", "comparer-carteret-agon", "comparer-carteret-portbail"];
const VIEWS = [["320", { width: 320, height: 640 }], ["375", { width: 375, height: 812 }], ["390", { width: 390, height: 844 }], ["bureau", { width: 1280, height: 800 }]];

async function open(view, scheme, hash, launch = false, motion = false) {
  const ctx = await browser.newContext({ viewport: view, colorScheme: scheme, reducedMotion: motion ? "no-preference" : "reduce" });
  if (!launch) await ctx.addInitScript(() => { window.__NO_LAUNCH__ = true; });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(`${BASE}#${hash}`);
  await page.waitForSelector(".app");
  // Mesures de mise en page avec les vraies polices, jamais la police de secours (CI du 23 nov. : 5 px de débordement).
  await page.evaluate(() => document.fonts.ready);
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

// 2. Règles de Home, de la Carte, de la Météo et de la fiche (390 px) — version 6 (V3-028, V3-029, V3-030).
const { SPOT, SPOTS: ALL, span: spanOf } = await import("../src/prototype-v3/data.js");
const { meteo: meteoOf } = await import("../src/prototype-v3/effets.js");
const shownSpots = (page) => page.evaluate(() => [...document.querySelectorAll(".map6 .ring")].reduce((m, b) => m + (b.classList.contains("cluster") ? Number(b.getAttribute("aria-label").match(/Groupe de (\d+)/)[1]) : 1), 0));
const vbox = (page) => page.locator(".geo").evaluate((e) => e.getAttribute("viewBox").split(" ").map(Number));
{
  const { ctx, page, errors } = await open({ width: 390, height: 844 }, "light", "home");
  const txt = await page.textContent("main");
  t("Home : phrase de synthèse avec horaires", /bonne matinée pour le bar\s:\s\d\d:\d\d–\d\d:\d\d/i.test(txt));
  t("Home : slogan de V3-028, et aucun autre", txt.includes("Read the sea.") && txt.includes("Fish the moment."));
  const modes = await page.locator(".modecard6").evaluateAll((els) => els.map((e) => [e.textContent, e.getAttribute("aria-checked"), e.querySelector("img").complete && e.querySelector("img").naturalWidth > 0]));
  t("Home : cartes Shore et Offshore avec les logos d'origine", modes.length === 2 && /Shore/.test(modes[0][0]) && modes[0][1] === "true" && /Offshore/.test(modes[1][0]) && modes.every((m) => m[2]), JSON.stringify(modes));
  const logo = await page.locator(".hbrand6").evaluate((e) => [e.querySelector(".word6").textContent, e.querySelector("img").getBoundingClientRect().width, e.querySelector("img").naturalWidth > 0]);
  t("Home : médaillon et mot SPUMY", logo[0] === "SPUMY" && logo[1] >= 44 && logo[2], JSON.stringify(logo));
  t("Home : champ de lieu avec la position", (await page.locator(".place6-f").textContent()).includes("Pirou"));
  t("Home : jours Aujourd'hui, Demain, 7 jours", (await page.locator(".days6 .chip6").allTextContents()).join(",") === "Aujourd'hui,Demain,7 jours");
  const band = await page.locator(".band6-bar").evaluate((e) => [e.querySelectorAll(".fv").length, e.getAttribute("aria-label")]);
  t("Home : bande de 24 h colorée heure par heure selon le score", band[0] >= 1 && /\d\d:\d\d–\d\d:\d\d \(/.test(band[1]), JSON.stringify(band));
  t("Home : place réservée « Le plus proche » (V3-016)", txt.includes("Le plus proche"));
  t("Home : 3 cartes de recommandation", (await page.locator("article.rc").count()) === 3);
  t("Home : spots « à vérifier » hors des cartes", !(await page.locator("article.rc", { hasText: SPOT.portbail.name }).count()) && txt.includes("À vérifier (1)"));
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
  t("Home : la bande fixe est cachée en haut de page", (await page.locator(".hbar6.on").count()) === 0);
  await page.evaluate(() => scrollTo(0, 900)); await page.waitForTimeout(300);
  t("Home : en faisant défiler, la partie haute reste fixe en se resserrant", (await page.locator(".hbar6.on").count()) === 1 && (await page.locator(".hbar6").evaluate((e) => e.getBoundingClientRect().top)) >= 0);
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
  t("Home : elle reprend sa taille en remontant", (await page.locator(".hbar6.on").count()) === 0);

  await page.evaluate(() => { location.hash = "carte"; });
  await page.waitForSelector(".map6 .ring");
  const hdr = await page.locator(".hdr6").evaluate((e) => [e.querySelector(".word6").textContent, [...e.querySelectorAll(".mode6 [role=radio]")].map((b) => b.textContent).join("/")]);
  t("en-tête : SPUMY et bascule Shore / Offshore", hdr[0] === "SPUMY" && hdr[1] === "Shore/Offshore", JSON.stringify(hdr));
  const favChip = page.locator(".chip6", { hasText: "Favorables" });
  const n = Number((await favChip.locator("b").textContent()).trim());
  await favChip.click(); await page.waitForTimeout(150);
  t("Carte : « Favorables » = 3 (seuil 75, sécurité, pas à vérifier)", n === 3, String(n));
  t("Carte : compteur égal aux pastilles affichées (groupes comptés)", (await shownSpots(page)) === n);
  t("Carte : la règle du filtre est affichée", (await page.locator(".rule6").textContent()).includes("Favorables : 75 ou plus"));
  await page.locator(".chip6", { hasText: "Tous" }).click(); await page.waitForTimeout(150);
  const all = Number((await page.locator(".chip6", { hasText: "Tous" }).locator("b").textContent()).trim());
  t("Carte : les 8 vrais spots à 1 h de route, tous affichés", all === 8 && (await shownSpots(page)) === all, String(all));
  const col = await page.evaluate(() => ({ clusters: document.querySelectorAll(".map6 .ring.cluster").length, left: document.querySelectorAll(".map6 .nm.left").length, ring: document.querySelector(".map6 .ring").getBoundingClientRect().width }));
  t("Carte : vue d'ensemble en colonne le long de la côte, noms à gauche, sans regroupement (maquette)", col.clusters === 0 && col.left >= 6 && col.ring === 46, JSON.stringify(col));
  t("Carte : chaque pastille porte son score", (await page.locator(".map6 .ring .v").allTextContents()).every((x) => /^\d+$|^–$/.test(x)));
  const labels = await page.locator(".map6 .ring .nm").count();
  t("Carte : des noms à côté des pastilles", labels >= 2, String(labels));
  t("Carte : « à vérifier » marqué (⚠) ou dans un groupe", (await page.locator(".ring.verify .badge-warn").count()) === 1 || (await page.locator(".ring.cluster").evaluateAll((els) => els.some((e) => e.getAttribute("aria-label").includes("Portbail")))));
  t("Carte : « non recommandé » barré ou dans un groupe", (await page.locator(".ring.nr").count()) === 1 || (await page.locator(".ring.cluster").evaluateAll((els) => els.some((e) => e.getAttribute("aria-label").includes("Surtainville")))));
  t("Carte : trait de côte réel (IGN) et attribution", (await page.locator(".land6").count()) === 1 && (await page.locator(".attrib").textContent()).includes("IGN"));
  const mb = await page.locator(".map6").boundingBox();
  const v0 = await vbox(page);
  await page.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2); await page.mouse.wheel(0, -400); await page.waitForTimeout(150);
  const v1 = await vbox(page);
  t("Carte : la molette zoome", v1[2] < 0.85 * v0[2], `${v0[2]} → ${v1[2]}`);
  await page.mouse.move(mb.x + 60, mb.y + mb.height / 2); await page.mouse.down(); await page.mouse.move(mb.x + 150, mb.y + mb.height / 2 + 40, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(100);
  const v2 = await vbox(page);
  t("Carte : glisser déplace la carte", Math.abs(v2[0] - v1[0]) > 5, `${v1[0]} → ${v2[0]}`);
  t("Carte : le zoom ne change pas le nombre de spots", (await shownSpots(page)) === all);
  await page.locator(".map6").focus(); await page.keyboard.press("ArrowLeft"); await page.waitForTimeout(80);
  t("Carte : les flèches du clavier déplacent la carte (CR-03)", (await vbox(page))[0] !== v2[0]);
  t("Carte : les pastilles gardent leur taille à l'écran", (await page.locator(".map6 .ring").first().evaluate((e) => e.getBoundingClientRect().width)) <= 56);
  await page.getByRole("button", { name: "Vue d'ensemble" }).click(); await page.waitForTimeout(120);
  t("Carte : « Vue d'ensemble » montre tous les spots", (await page.locator(".map6 .ring").evaluateAll((els, r) => els.every((e) => { const b = e.getBoundingClientRect(); return b.top >= r.y - 1 && b.bottom <= r.y + r.height + 1 && b.left >= r.x - 1 && b.right <= r.x + r.width + 1; }), mb)));
  const pirou = page.getByRole("button", { name: /^Pirou Plage, / });
  await pirou.click(); await page.waitForTimeout(150);
  const pop = await page.locator(".pop6").innerText();
  t("Carte : la bulle montre distance, sorties, poissons, meilleur moment", /Pirou Plage/.test(pop) && /Sur place|km · \d+ min/.test(pop) && /sortie/.test(pop) && /poisson/.test(pop) && /Meilleur moment/.test(pop), pop.replace(/\n/g, " | "));
  const pb = await page.locator(".pop6").boundingBox(), rb = await pirou.boundingBox();
  t("Carte : la bulle ne cache pas le spot touché", pb.x >= rb.x + rb.width - 2 || pb.x + pb.width <= rb.x + 2);
  t("Carte : bulle sans croix, comme la maquette (fermeture au second toucher, Échap ou fond de carte)", (await page.locator(".pop6 button").count()) === 0);
  t("Carte : sous la carte, pourquoi ce spot est bon aujourd'hui", /Pirou Plage/.test(await page.locator("#h-terrain").textContent()));
  await pirou.click(); await page.waitForTimeout(120);
  t("Carte : retoucher le spot ferme la bulle", (await page.locator(".pop6").count()) === 0);
  const sec = await page.locator(".sec6").first().evaluate((e) => ({ top: e.getBoundingClientRect().top, facts: e.querySelectorAll(".fact6").length, eff: [...e.querySelectorAll(".fact6 .eff b")].map((b) => b.textContent), lvls: e.querySelectorAll(".lvl").length, srcs: e.querySelectorAll(".srcs6 li").length }));
  const navTop = await page.locator(".navwrap").evaluate((e) => e.getBoundingClientRect().top);
  t("Carte : la carte occupe le premier écran, les détails viennent dessous (V3-029)", sec.top >= navTop - 2, `${sec.top} / ${navTop}`);
  const hdr6 = await page.locator(".hdr6").evaluate((e) => [getComputedStyle(e).position, e.getBoundingClientRect().top]);
  t("Carte : en-tête et champ posés sur la carte, sans bandeau au-dessus (maquette)", hdr6[0] === "absolute" && hdr6[1] === 0 && (await page.locator(".demo-bar").count()) === 0 && (await page.locator(".map6").evaluate((e) => e.getBoundingClientRect().top)) === 0);
  t("Carte : terrain croisé avec le jour, un effet par ligne (signe et mot)", sec.facts === 4 && sec.eff.every((g) => /^[+−=?]$/.test(g)), JSON.stringify(sec.eff));
  t("Carte : niveaux de preuve et sources affichés", sec.lvls >= 4 && sec.srcs >= 1, `${sec.lvls} niveaux, ${sec.srcs} sources`);

  await page.evaluate(() => { location.hash = "meteo"; });
  await page.waitForSelector(".map6 .ring");
  await page.waitForTimeout(300);
  const field = await page.locator("canvas.wind-field").evaluate((c) => { const d = c.getContext("2d").getImageData(c.width / 2, c.height / 2, 1, 1).data; return d[3]; });
  t("Météo : vent animé en couleurs (nappe et traînées)", field > 0 && (await page.locator("canvas.wind-parts").count()) === 1);
  t("Météo : jours Aujourd'hui, Demain, 7 jours", (await page.locator(".chip6.day").count()) === 3);
  const p2 = page.getByRole("button", { name: /^Pirou Plage, / });
  await p2.click(); await page.waitForTimeout(250);
  const rows = await page.locator(".panel6 .p6-l").allTextContents();
  t("Météo : panneau du spot touché, sécurité d'abord, sans doublon", rows[0] === "Sécurité" && rows.length >= 7 && new Set(rows).size === rows.length && (await page.locator(".panel6-h b").textContent()) === "Pirou Plage", rows.join(","));
  const ptxt = await page.locator(".panel6").innerText();
  t("Météo : vent en nœuds, source et heure écrites", /\d+ nds/.test(ptxt) && /AROME/.test(ptxt) && /06:00/.test(ptxt));
  const panel = await page.locator(".panel6").boundingBox(), r2 = await p2.boundingBox();
  t("Météo : le spot touché reste visible à gauche du panneau", r2.x + r2.width <= panel.x + 2, `${r2.x + r2.width} / ${panel.x}`);
  const X = meteoOf(SPOT.pirou), F = X.formula;
  const why = await page.locator(".why6p").innerText();
  t("Météo : le panneau dit pourquoi la note (points de chaque critère, conditions × présence)", why.includes(`Pourquoi ${SPOT.pirou.fav}`) && (await page.locator(".why6p li").count()) === X.crit.length + X.excluded.length && why.replace(/\s+/g, " ").includes(`= ${F.fav}`), why.replace(/\n/g, " | "));
  const msec = (await page.locator("#h-meteo").evaluate((h) => h.closest("section").innerText)).replace(/\s+/g, " ");
  const critPts = await page.locator(".w6 .w6-row .w6-n b").allTextContents();
  t("Météo : sous la carte, chaque critère, son poids, ses points du jour et pourquoi ; la somme et la formule rendent compte de la note (moteur)",
    msec.includes(`Pourquoi ${SPOT.pirou.fav} aujourd'hui`) && X.crit.every((x) => msec.includes(`Pourquoi ce critère pèse ${x.max} points`)) &&
    Math.abs(X.crit.reduce((a, x) => a + x.pts, 0) - F.got) < 0.01 && Math.round((F.got / F.max) * 100) === F.cond && Math.round(F.cond * F.pres) === F.fav && F.fav === SPOT.pirou.fav &&
    critPts.length === X.crit.length + 1 && msec.includes(`= ${F.fav}/100`), `${critPts.join(",")} → ${F.got}/${F.max} = ${F.cond} × ${F.pres} = ${F.fav}`);
  await p2.click(); await page.waitForTimeout(150);
  t("Météo : retoucher le spot ferme le panneau", (await page.locator(".panel6").count()) === 0);

  const agon = SPOT.agon;
  await page.evaluate(() => { location.hash = "spot-agon"; });
  await page.waitForSelector(".tide svg");
  const ft = await page.textContent("main");
  t("Fiche : courbe de marée et horaires favorables coloriés", ft.includes("Marée et heures favorables") && ft.includes(`${spanOf(agon.win)} · ${agon.fav}`), spanOf(agon.win));
  t("Fiche : danger (fiche du spot) avant la marée", ft.indexOf(agon.danger.slice(0, 24)) > -1 && ft.indexOf(agon.danger.slice(0, 24)) < ft.indexOf("Marée et heures favorables"));
  t("Fiche : Confiance ne change pas le rang", ft.includes("ne change pas le rang"));
  await page.evaluate(() => { location.hash = "spot-portbail"; });
  await page.waitForTimeout(80);
  t("Fiche : « à vérifier » affiché avec sa note calculée (Confiance 69, fixture § 6.7.2)", (await page.textContent("main")).includes(`${SPOT.portbail.fav}/100 — À vérifier`));
  await page.evaluate(() => { location.hash = "comparer-carteret-agon"; });
  await page.waitForTimeout(80);
  const ct = await page.textContent("main");
  t("Comparaison : ligne Vent en nœuds", ct.includes("Vent") && /\d+ nds/.test(ct));
  t("Comparaison : écart chiffré", /points/.test(ct));
  await page.evaluate(() => { location.hash = "comparer-carteret-portbail"; });
  await page.waitForTimeout(80);
  t("Comparaison : « avantage non établi » si un spot est à vérifier", (await page.textContent("main")).includes("Avantage non établi"));
  t("parcours 390 : aucune erreur", errors.length === 0, errors.join(" | "));
  await ctx.close();
}
// Le modèle du prototype est celui du moteur : mêmes points, même tableau vent et mer, mêmes facteurs de présence.
{
  const M = await import("../src/prototype-v3/modele.js");
  const { V2 } = await import("../src/bord/engine/v2-params.js");
  const v2src = fs.readFileSync(path.join(root, "src/bord/engine/v2.js"), "utf8"), modsrc = fs.readFileSync(path.join(root, "src/bord/engine/model.js"), "utf8");
  const tab = (src, reg, exp) => { const m = src.match(new RegExp(`${reg}:\\s*\\{?\\s*face:\\s*\\[([^\\]]+)\\],\\s*travers:\\s*\\[([^\\]]+)\\],\\s*dos:\\s*\\[([^\\]]+)\\]`)); return m && JSON.stringify(m.slice(1, 4).map((x) => x.split(",").map(Number))) === JSON.stringify([exp.face, exp.travers, exp.dos]); };
  const season = (reg) => { const m = modsrc.match(new RegExp(`\\n\\s*${reg}:\\s*\\[([^\\]]+)\\]`)); return m && JSON.stringify(m[1].split(",").map(Number)) === JSON.stringify(M.SEASON[reg]); };
  t("modèle du prototype = moteur v2 : points de marée, lumière, vent et mer", M.PTS.fenetre.prime === V2.maree.prime && M.PTS.fenetre.bon === V2.maree.bon && M.PTS.coef === V2.maree.coef && M.PTS.vent === V2.vent && JSON.stringify(M.PTS.lumiere) === JSON.stringify(V2.lumiere));
  t("modèle du prototype = moteur v2 : tableau vent et mer (3 régimes)", ["roche", "plage", "abri"].every((r) => tab(v2src, r, M.VENT_MER[r])));
  t("modèle du prototype = moteur v2 : présence (saison, 3 régimes ; paliers d'eau)", ["roche", "plage", "abri"].every(season) && [[7, 0.3], [9, 0.5], [11, 0.75], [13, 0.92], [15, 1], [20, 0.9], [23, 0.72]].every(([t0, f]) => M.thermal(t0).factor === f && modsrc.includes(`factor: ${f.toFixed(2)}`)));
  t("modèle : chaque note = conditions × présence, sur le meilleur créneau du jour", ALL.every((x) => x.model && x.fav === Math.round(x.model.cond * x.model.pres.factor) && Math.round((x.model.got / x.model.max) * 100) === x.model.cond));
}
t("données : 8 spots V2 à moins d'1 h, positions des fiches", ALL.length === 8 && ALL.every((x) => x.v2 && x.route <= 60 && Number.isFinite(x.x) && Number.isFinite(x.y)));

// 3. Barre défilante, ordre des onglets, Journal, Offshore.
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
  const jt = await page.textContent("main");
  t("barre : Journal ouvert au toucher", jt.includes("Sortie en cours"));
  t("Journal : la note de SPUMY ce jour-là, face au résultat (JRN-06)", jt.includes("Les notes de SPUMY face à tes sorties") && jt.includes("Note de SPUMY ce jour-là") && /par heure/.test(jt));
  t("Journal : aucune conclusion sous le seuil de sorties", jt.includes("Pas encore de conclusion"));
  await page.evaluate(() => { location.hash = "profil"; });
  await page.waitForTimeout(80);
  await page.getByRole("button", { name: "Monter Journal" }).click();
  const order = await page.locator(".nav a").allTextContents();
  t("Profil : ordre des onglets modifié", order.join(",") === "Home,Carte,Météo,Journal,Profil", order.join(","));
  await page.evaluate(() => { location.hash = "home"; });
  await page.waitForTimeout(80);
  await page.getByRole("radio", { name: /Offshore/ }).first().click();
  await page.waitForTimeout(80);
  t("Offshore : choix du bateau avant tout verdict", (await page.textContent("main")).includes("Avec quel bateau ?"));
  await page.getByRole("button", { name: "Voir si je peux sortir" }).click();
  t("Offshore : verdict de sortie après le choix", /Sortie possible\s: 07:00–12:00/.test(await page.textContent("main")));
  t("parcours barre, Journal, Offshore : aucune erreur", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// Champ de lieu : un nom de commune long reste lisible en entier (320, 375 et 390 px).
for (const w of [320, 375, 390]) {
  const { ctx, page } = await open({ width: w, height: 812 }, "dark", "carte");
  await page.locator(".place6-f").click();
  await page.locator(".modal input").fill("Saint-Pi");
  await page.locator(".suggest button", { hasText: "Saint-Pierre-Quiberon" }).click();
  await page.getByRole("button", { name: "Utiliser cette position" }).click();
  const fit = await page.locator(".place6-f span").evaluate((e) => [e.textContent, e.scrollWidth <= e.clientWidth + 1]);
  t(`${w} px : « Saint-Pierre-Quiberon » entier dans le champ de lieu`, fit[0] === "Saint-Pierre-Quiberon" && fit[1], JSON.stringify(fit));
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
  const tie = ranking(SPOTS, { tie: true }), scarce = ranking(SPOTS, { scarce: true });
  t("règle : égalité au dernier rang, 4 ou 5 cartes marquées « égalité »", tie.cards.length >= 4 && tie.cards.length <= 5 && tie.cards.slice(2).every((c) => c.tie), String(tie.cards.length));
  t("règle : moins de 3 spots admissibles, aucune carte inventée et une raison", scarce.cards.length < 3 && !!scarce.scarceWhy, String(scarce.cards.length));
  t("règle : la Confiance ne change pas les égalités", ids(ranking(SPOTS, { tie: true })) === ids(ranking(SPOTS.map((s) => ({ ...s, conf: 100 - s.conf })), { tie: true })));

  const { ctx, page } = await open({ width: 390, height: 844 }, "dark", "spot-portbail");
  const fe = await page.locator("main").innerText();
  t("fixture § 6.7.2 : Favorabilité 53 — À vérifier, Confiance 69 — Moyenne, sans effet sur le rang",
    /53/.test(fe) && fe.includes("À vérifier") && /69/.test(fe) && fe.includes("Moyenne") && fe.includes("ne change pas le rang"));
  { // Phase 7, audit du mode BATEAU : règles des espèces des marques de démonstration égales à celles de 2026 (bateau.json).
    const marques = fs.readFileSync(path.join(root, "src/prototype-v3/data.js"), "utf8");
    const attendu = { "Lieu jaune": /42 cm.*2 par jour.*1er janvier au 30 avril/, "Lieu noir": /35 cm/, Maquereau: /20 cm.*10 par jour/, Bar: /42 cm/ };
    const regles = [...marques.matchAll(/name: "([^"]+)", fav: \d+, conf: \d+, level: "[^"]+", rule: "([^"]*)"/g)];
    t("BATEAU : règle de chaque espèce des marques conforme à 2026 (lieu jaune 42 cm, 2 par jour, fermé du 1er janvier au 30 avril ; lieu noir 35 cm ; maquereau 20 cm ; bar 42 cm)",
      regles.length >= 5 && regles.every(([, n, r]) => !attendu[n] || attendu[n].test(r)), regles.map(([, n, r]) => `${n} : ${r}`).join(" | "));
  }
  const TITLES = { home: "Home", carte: "Carte", meteo: "Météo", profil: "Profil", journal: "Journal", "spot-agon": SPOT.agon.name, "spot-portbail": SPOT.portbail.name, "comparer-carteret-agon": "Comparaison" };
  for (const r of ["home", "carte", "meteo", "profil", "journal", "spot-agon", "spot-portbail", "comparer-carteret-agon"]) {
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
      const txt = document.querySelector(".app").innerText;
      return { small, h1: document.querySelectorAll("h1").length, title: document.title, minText: Math.min(...sizes), legacy: /Pertinence|\b\d{1,2}\s?\/\s?10\b|sur 10\b|\bV2\b|\bphase\b/i.test(txt) };
    });
    t(`cibles #${r} : 44 px au moins (TOUCH.min)`, m.small.length === 0, m.small.join(" ; "));
    t(`titres #${r} : un seul h1 et un titre de page`, m.h1 === 1 && m.title === `${TITLES[r]} · SPUMY`, `${m.h1} h1, « ${m.title} »`);
    t(`texte #${r} : 12 px au moins`, m.minText >= 12, `${m.minText} px`);
    t(`héritage #${r} : ni Pertinence, ni note sur 10, ni « V2 » ni « phase » à l'écran`, !m.legacy);
  }
  await ctx.close();
}

// 4. Accessibilité (axe-core), deux thèmes.
if (AXE) {
  const axeSrc = fs.readFileSync(path.join(root, "node_modules/axe-core/axe.min.js"), "utf8");
  for (const scheme of ["light", "dark"]) for (const r of ["home", "carte", "meteo", "profil", "spot-agon", "comparer-carteret-agon"]) {
    const { ctx, page } = await open({ width: 390, height: 844 }, scheme, r);
    await page.waitForTimeout(150);
    if (r === "home") await page.locator(".place6-f").click(); // feuille de position ouverte : ses couleurs passent aussi au contrôle
    if (r === "carte") await page.getByRole("button", { name: /^Pirou Plage, / }).click(); // bulle ouverte
    if (r === "meteo") await page.getByRole("button", { name: /^Pirou Plage, / }).click(); // panneau ouvert
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
{ // Phase 7, audit du mode BATEAU : PF-26 vérifié aussi sur Home BATEAU (hors captures), et seuils dits « à valider » (PF-37).
  const { ctx, page } = await open({ width: 390, height: 844 }, "dark", "home");
  await page.getByRole("radio", { name: /Offshore/ }).first().click();
  await page.getByRole("button", { name: "Voir si je peux sortir" }).click();
  await page.waitForTimeout(150);
  const tb = await page.locator(".app").innerText();
  t("héritage Home BATEAU : ni Pertinence, ni note sur 10, ni « V2 » à l'écran (PF-26)", !/Pertinence|\b\d{1,2}\s?\/\s?10\b|sur 10\b|\bV2\b/i.test(tb));
  t("Home BATEAU : les seuils de sécurité sont dits « à valider » (PF-37)", tb.includes("seuils de sécurité à valider"));
  await ctx.close();
}
if (CAP) {
  fs.mkdirSync(CAP, { recursive: true });
  const shots = [["home", "dark", "01-home-bord"], ["carte", "dark", "02-carte"], ["meteo", "dark", "03-meteo"], ["spot-agon", "dark", "04-fiche-spot"], ["comparer-carteret-agon", "dark", "05-comparaison"],
    ["profil", "dark", "06-profil"], ["journal", "dark", "07-journal"], ["home", "light", "08-home-bord-clair"], ["carte", "light", "09-carte-claire"]];
  for (const [r, scheme, name] of shots) {
    const { ctx, page } = await open({ width: 390, height: 844 }, scheme, r);
    await page.addStyleTag({ content: ".navwrap{position:relative!important}" }); // capture pleine page : la barre à sa place, en bas
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(CAP, `${name}.png`), fullPage: true });
    await ctx.close();
  }
  const { ctx, page } = await open({ width: 390, height: 844 }, "dark", "home");
  await page.getByRole("radio", { name: /Offshore/ }).first().click();
  await page.getByRole("button", { name: "Voir si je peux sortir" }).click();
  await page.addStyleTag({ content: ".navwrap{position:relative!important}" });
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(CAP, "10-home-bateau.png"), fullPage: true });
  await ctx.close();
  // Premiers écrans, comme les maquettes de Félix : bulle de la Carte, panneau de la Météo, haut de Home resserré.
  for (const [r, name, act] of [["carte", "12-carte-bulle", "tap"], ["meteo", "13-meteo-panneau", "tap"], ["home", "14-home-defile", "scroll"], ["meteo", "15-meteo-vent", "none"], ["meteo", "16-meteo-pourquoi", "why"]]) {
    const o = await open({ width: 390, height: 844 }, "dark", r, false, r === "meteo" && act !== "why"); // Météo : vent animé, comme la maquette vidéo
    if (act === "tap" || act === "why") { await o.page.waitForSelector(".map6 .ring"); await o.page.getByRole("button", { name: /^Pointe d'Agon, / }).first().click(); }
    if (act === "why") { await o.page.waitForTimeout(300); await o.page.evaluate(() => document.getElementById("h-meteo").scrollIntoView()); }
    else if (act === "scroll") await o.page.evaluate(() => scrollTo(0, 900));
    await o.page.waitForTimeout(r === "meteo" ? 1800 : 400);
    await o.page.screenshot({ path: path.join(CAP, `${name}.png`) });
    await o.ctx.close();
  }
  const d = await open({ width: 1280, height: 800 }, "dark", "carte");
  await d.page.waitForTimeout(250);
  await d.page.screenshot({ path: path.join(CAP, "11-carte-bureau.png") });
  await d.ctx.close();
}

await browser.close();
server.close();
console.log(`[prototype v3] parcours, règles et largeurs : ${ok}/${ok + fail}`);
process.exit(fail ? 1 : 0);
