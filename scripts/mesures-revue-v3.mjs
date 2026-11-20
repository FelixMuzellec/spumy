// Phase 3 V3 — mesures objectives pour les revues structurées (docs/design/REVUES-V3.md).
// Ce script mesure, il ne juge pas : cibles tactiles, ordre et visibilité du focus, focus masqué (WCAG 2.4.11),
// espacement du texte (1.4.12), mouvement réduit, titres et repères, tailles de texte, poids chargé par écran.
// Usage : node scripts/build-prototype-v3.mjs && node scripts/mesures-revue-v3.mjs   (écrit docs/design/revue-v3-mesures.json)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".webp": "image/webp", ".png": "image/png", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(res);
}).listen(0);
const BASE = `http://127.0.0.1:${server.address().port}/prototype-v3/index.html`;
const ROUTES = ["home", "carte", "meteo", "profil", "journal", "spot-a", "spot-e", "comparer-c-a"];
const browser = await chromium.launch();

async function open(hash, { width = 390, height = 844, reduce = "reduce", scheme = "dark" } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, reducedMotion: reduce });
  await ctx.addInitScript(() => { window.__NO_LAUNCH__ = true; });
  const page = await ctx.newPage();
  let bytes = 0;
  page.on("response", async (r) => { try { bytes += (await r.body()).length; } catch { /* réponse sans corps */ } });
  await page.goto(`${BASE}#${hash}`);
  await page.waitForSelector(".app");
  await page.waitForLoadState("networkidle");
  return { ctx, page, bytes: () => bytes };
}

const SEL = "button, a[href], input, select, textarea, [role=button], [role=tab], [role=radio], [role=switch], [tabindex='0']";
const out = { date: new Date().toISOString(), viewport: "390 × 844", routes: {} };

for (const r of ROUTES) {
  const { ctx, page, bytes } = await open(r);
  const m = await page.evaluate((SEL) => {
    const label = (e) => (e.getAttribute("aria-label") || e.textContent || e.getAttribute("title") || e.tagName).trim().replace(/\s+/g, " ").slice(0, 40);
    const vis = [...document.querySelectorAll(SEL)].filter((e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width > 0 && b.height > 0 && cs.visibility !== "hidden" && !e.closest("[aria-hidden=true]"); });
    // Cible effective : boîte de l'élément, étendue par un pseudo-élément absolu (zone invisible ou lien étendu) ou par son <label>.
    const target = (e) => {
      let { left, top, right, bottom } = e.getBoundingClientRect();
      for (const ps of ["::before", "::after"]) {
        const c = getComputedStyle(e, ps); if (c.content === "none" || c.position !== "absolute") continue;
        const host = getComputedStyle(e).position !== "static" ? e : e.offsetParent; if (!host) continue;
        const h = host.getBoundingClientRect(), px = (v, base) => (v === "auto" ? null : parseFloat(v));
        const t = px(c.top), r = px(c.right), bo = px(c.bottom), l = px(c.left);
        if ([t, r, bo, l].some((v) => v === null)) continue;
        left = Math.min(left, h.left + l); top = Math.min(top, h.top + t); right = Math.max(right, h.right - r); bottom = Math.max(bottom, h.bottom - bo);
      }
      const lab = e.closest("label");
      if (lab) { const lb = lab.getBoundingClientRect(); left = Math.min(left, lb.left); top = Math.min(top, lb.top); right = Math.max(right, lb.right); bottom = Math.max(bottom, lb.bottom); }
      return { width: right - left, height: bottom - top };
    };
    const small = (n) => vis.map((e) => ({ e, b: target(e) })).filter(({ b }) => Math.min(b.width, b.height) < n - 0.5).map(({ e, b }) => `${label(e)} (${Math.round(b.width)}×${Math.round(b.height)})`);
    const sizes = new Map();
    const walker = document.createTreeWalker(document.querySelector(".app"), NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode; if (!n.textContent.trim()) continue;
      const el = n.parentElement; if (el.closest("[aria-hidden=true]")) continue;
      const b = el.getBoundingClientRect(); if (!b.width) continue;
      const fs = Math.round(parseFloat(getComputedStyle(el).fontSize)); sizes.set(fs, (sizes.get(fs) || 0) + 1);
    }
    return {
      interactifs: vis.length,
      sous24: small(24), sous44: small(44),
      h1: document.querySelectorAll("h1").length, h2: document.querySelectorAll("h2").length,
      main: !!document.querySelector("main"), nav: !!document.querySelector("nav"), header: !!document.querySelector("header"),
      lang: document.documentElement.lang, titre: document.title,
      taillesTexte: Object.fromEntries([...sizes].sort((a, b) => a[0] - b[0])),
    };
  }, SEL);
  m.octetsCharges = bytes();
  out.routes[r] = m;
  await ctx.close();
}

// Clavier sur Home : 40 tabulations ; focus visible ; focus entièrement caché par l'en-tête ou la barre (2.4.11).
{
  const { ctx, page } = await open("home", { height: 700 });
  const steps = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    steps.push(await page.evaluate(() => {
      const e = document.activeElement; if (!e || e === document.body) return null;
      const cs = getComputedStyle(e); const b = e.getBoundingClientRect();
      const visible = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== "none";
      const covers = [...document.querySelectorAll("nav, header, .navwrap, .hdr")].filter((c) => !c.contains(e)).map((c) => c.getBoundingClientRect())
        .some((c) => c.top <= b.top && c.bottom >= b.bottom && c.left <= b.left && c.right >= b.right && ["fixed", "sticky"].includes(getComputedStyle(document.querySelector("nav")).position));
      return { nom: (e.getAttribute("aria-label") || e.textContent || e.tagName).trim().replace(/\s+/g, " ").slice(0, 36), visible, cache: covers };
    }));
  }
  out.clavierHome = { pas: steps.filter(Boolean).length, sansFocusVisible: steps.filter((s) => s && !s.visible).map((s) => s.nom), caches: steps.filter((s) => s && s.cache).map((s) => s.nom), ordre: steps.filter(Boolean).map((s) => s.nom) };
  await ctx.close();
}

// Espacement du texte (1.4.12) : débordements horizontaux et textes coupés à 390 px.
out.espacementTexte = {};
for (const r of ["home", "carte", "spot-a", "profil"]) {
  const { ctx, page } = await open(r);
  await page.addStyleTag({ content: "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}" });
  await page.waitForTimeout(150);
  out.espacementTexte[r] = await page.evaluate(() => {
    // Texte coupé : un élément porteur de texte qui dépasse d'un ancêtre à débordement masqué (hors textes masqués exprès, .vh).
    const owners = [...document.querySelectorAll(".app *")].filter((e) => !e.closest(".vh") && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
    const cut = owners.filter((e) => {
      const b = e.getBoundingClientRect(); if (!b.width) return false;
      for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (/auto|scroll/.test(cs.overflowX + cs.overflowY)) return false; // atteignable en faisant défiler
        if (/hidden|clip/.test(cs.overflowX + cs.overflowY)) { const r = a.getBoundingClientRect(); if (b.left < r.left - 1 || b.right > r.right + 1 || b.top < r.top - 1 || b.bottom > r.bottom + 1) return !/auto|scroll/.test(cs.overflowY); }
      }
      return getComputedStyle(e).textOverflow !== "ellipsis" && e.scrollWidth > e.clientWidth + 1 && /hidden|clip/.test(getComputedStyle(e).overflowX);
    }).map((e) => e.textContent.trim().slice(0, 32));
    return { defilementHorizontal: document.documentElement.scrollWidth > innerWidth, textesCoupes: [...new Set(cut)].slice(0, 12) };
  });
  await ctx.close();
}

// Mouvement réduit : durées de transition sans et avec la préférence.
out.mouvement = {};
for (const reduce of ["no-preference", "reduce"]) {
  const { ctx, page } = await open("carte", { reduce });
  out.mouvement[reduce] = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--t-base").trim());
  await ctx.close();
}

await browser.close();
server.close();
const file = path.join(root, "docs/design/revue-v3-mesures.json");
fs.writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
for (const [r, m] of Object.entries(out.routes)) console.log(`${r.padEnd(14)} interactifs ${String(m.interactifs).padStart(3)} · <24 px ${m.sous24.length} · <44 px ${m.sous44.length} · h1 ${m.h1} · ${Math.round(m.octetsCharges / 1024)} Ko · textes ${Object.keys(m.taillesTexte).join("/")} px`);
console.log("clavier Home :", out.clavierHome.pas, "pas ; sans focus visible", out.clavierHome.sansFocusVisible.length, "; cachés", out.clavierHome.caches.length);
console.log("espacement :", JSON.stringify(out.espacementTexte));
console.log("mouvement :", JSON.stringify(out.mouvement));
console.log("écrit", path.relative(root, file));
