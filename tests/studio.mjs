// Page « Analyse photo du bar » (claude.ai, abonnement) et import dans le guide.
// Le Claude de claude.ai est simulé (window.claude.use : sample et downloads) : on vérifie
// ce que la page envoie (photos, consignes, niveau de modèle), la reprise après une erreur,
// le fichier produit, puis son import dans le guide et les contrôles du guide.
// Usage : node scripts/build.mjs && node scripts/build-studio.mjs && node tests/studio.mjs
import { chromium, devices } from "playwright";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { omRespond } from "./om_mock.mjs";
import { SITE_FILES } from "../scripts/sites.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SHOTS = process.env.SHOTS || path.join(ROOT, "tests/shots");
fs.mkdirSync(SHOTS, { recursive: true });
const studio = fs.readFileSync(path.join(ROOT, "studio-build/analyse-photo.html"), "utf8");
// Squelette ajouté par claude.ai à la publication (charset, viewport, petit reset).
const wrapped = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${studio}</body></html>`;
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\//, "");
  if (p === "studio.html") { res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); return res.end(wrapped); }
  if (!SITE_FILES.includes(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": p.endsWith(".html") ? "text/html; charset=utf-8" : p.endsWith(".json") ? "application/json" : p.endsWith(".js") ? "text/javascript" : "image/png" });
  fs.createReadStream(path.join(ROOT, p)).pipe(res);
});
await new Promise((r) => server.listen(8771, r));
const BASE = "http://localhost:8771";
const results = [];
const ok = (c, l) => results.push([!!c, l]);
const T = (page) => page.evaluate(() => document.body.innerText);

// ── Claude simulé ──
function mockClaude() {
  window.__calls = []; window.__failLecture = 1;
  const OBS = {
    photos: [{ photo: 1, vue: "pointe vue d'en haut", qualite: "bonne", limites: "" }, { photo: 2, vue: "plan serré", qualite: "moyenne", limites: "" }],
    observations: [
      { photo: 1, zone: "centre, plan moyen", x: 52, y: 61, categorie: "surface_eau", fait: "Ligne d'écume le long des roches <img src=x onerror=window.__xss=1>", confiance: "elevee" },
      { photo: 2, zone: "premier plan droit", x: 80, y: 85, categorie: "roche", fait: "Blocs couverts d'algues", confiance: "moyenne" },
      { photo: 7, zone: "hors photo", x: 10, y: 10, categorie: "roche", fait: "Photo qui n'existe pas", confiance: "elevee" },
    ],
    non_visible: ["profondeur au pied des roches"],
  };
  const sample = async () => ({ text: "" });
  sample.limits = async () => ({ maxPromptBytes: 262144, images: { maxCount: 6, maxInputBytes: 20e6, mediaTypes: ["image/jpeg", "image/png", "image/webp"] } });
  sample.json = async (input, opts = {}) => {
    const pass = /INVENTORIER/.test(input) ? 1 : /contrôleur exigeant/.test(input) ? 2 : /FAITS numérotés/.test(input) ? 3 : 0;
    window.__calls.push({ pass, images: opts.images?.length || 0, blobs: (opts.images || []).every((b) => b instanceof Blob && b.type === "image/jpeg"), tier: opts.modelTier, effort: opts.effort || null,
      schema: /conforme à ce schéma JSON/.test(input), photoOrder: /première image jointe est la photo 1/.test(input) });
    await new Promise((r) => setTimeout(r, 120));
    if (pass === 1) return OBS;
    if (pass === 2) return { verdicts: [{ id: "o1", statut: "confirme", raison: "nette" }, { id: "o2", statut: "absent", raison: "pas d'algues visibles" }] };
    if (pass === 3) {
      if (window.__failLecture-- > 0) throw { code: "rate_limited", message: "limite" };
      return { synthese: "Pointe battue, écume sur les roches.", lecture: [{ titre: "Eau", texte: "Écume le long des roches.", nature: "observe", refs: ["o1"] }],
        postes: [{ nom: "Veine d'écume", emplacement: "pied de la pointe", pourquoi: "écume contre la roche", moment: "non déterminable avec ces photos", confiance: "moyenne", refs: ["o1", "x9"] },
                 { nom: "Poste sans fait", emplacement: "?", pourquoi: "intuition", moment: "?", confiance: "faible", refs: [] }],
        approche: [], securite: [{ texte: "Rochers mouillés par les embruns.", refs: ["o1"] }],
        accroche: { niveau: "fort", raison: "roche", refs: ["o1"] }, leurres: [{ famille: "weightless", pourquoi: "roche", refs: ["o1"] }, { famille: "inconnue", pourquoi: "?", refs: ["o1"] }],
        fiche: [], a_verifier: ["profondeur"], propositions: [], extra: "champ hors schéma" };
    }
    throw { code: "invalid_request", message: "?" };
  };
  window.claude = { use: async (name) => (name === "sample" ? sample
    : name === "downloads" ? { save: async ({ filename, data }) => { window.__saved = { filename, data }; return { status: "saved" }; } } : null) };
}

const browser = await chromium.launch();
let exported = null;
// ── 1. Page claude.ai : analyse par l'abonnement ──
{
  const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris" });
  await ctx.addInitScript(mockClaude);
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => { if (m.type() === "error" && !/fonts\.g/.test(m.text())) errors.push(m.text()); });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, body: "" }));
  await page.goto(`${BASE}/studio.html#audierne`);
  await page.waitForFunction(() => /Claude est disponible/.test(document.body.innerText), null, { timeout: 8000 }).catch(() => {});
  ok(/Claude est disponible/.test(await T(page)), "studio : Claude (abonnement) détecté, images permises");
  ok(await page.getAttribute('[data-guide="audierne"]', "aria-pressed") === "true", "studio : guide choisi d'après l'adresse (#audierne)");
  ok(await page.locator("#spot option").count() === 12, "studio : les 11 spots d'Audierne + « autre spot »");
  ok(await page.locator("[data-guide]").count() === 7, "studio : les sept guides proposés");
  // Clavier : le choix d'un guide garde le focus sur son bouton (le bloc est redessiné).
  await page.focus('[data-guide="carantec"]'); await page.keyboard.press("Enter"); await page.waitForTimeout(150);
  ok(await page.evaluate(() => document.activeElement?.dataset?.guide) === "carantec", "studio : focus clavier gardé après le choix d'un guide");
  await page.focus('[data-guide="audierne"]'); await page.keyboard.press("Enter"); await page.waitForTimeout(150);
  await page.selectOption("#spot", "raz");
  await page.setInputFiles("#file", [path.join(ROOT, "tests/ref/photos/exif_complet.jpg"), path.join(ROOT, "tests/ref/photos/sans_exif_grande.jpg")]);
  await page.waitForFunction(() => document.querySelectorAll("#thumbs figure").length === 2, null, { timeout: 15000 });
  const t1 = await T(page);
  ok(/Marée (montante|descendante) au port d'Audierne/.test(t1), "studio : marée au moment de la photo calculée (port d'Audierne)");
  ok(await page.isVisible("#manual"), "studio : heure à saisir pour la photo sans date d'appareil");
  const sw = await page.evaluate(() => [document.scrollingElement.scrollWidth, window.innerWidth]);
  ok(sw[0] <= sw[1] + 1, `studio : pas de défilement horizontal sur téléphone (${sw[0]} ≤ ${sw[1]})`);
  await page.click("#go");
  const locked = await page.evaluate(() => ({ spot: document.getElementById("spot").disabled, manual: document.getElementById("manual").disabled,
    notes: document.getElementById("notes").readOnly, add: document.getElementById("add").disabled, del: [...document.querySelectorAll("[data-del]")].every((b) => b.disabled) }));
  ok(Object.values(locked).every(Boolean), "studio : pendant l'analyse, spot, heure, notes et photos sont figés" + ` — ${JSON.stringify(locked)}`);
  await page.waitForFunction(() => !document.getElementById("err").hidden, null, { timeout: 15000 });
  ok(await page.isEnabled("#manual") && !(await page.evaluate(() => document.getElementById("notes").readOnly)), "studio : analyse arrêtée → champs de nouveau modifiables");
  ok(/Limite d'usage de ton abonnement/.test(await T(page)) && /Reprendre l'analyse/.test(await page.textContent("#go")), "studio : limite d'usage annoncée, reprise proposée");
  await page.click("#go");
  await page.waitForFunction(() => !document.getElementById("result").hidden, null, { timeout: 15000 });
  const calls = await page.evaluate(() => window.__calls);
  ok(calls.map((c) => c.pass).join() === "1,2,3,3", `studio : reprise sans refaire les passes faites (${calls.map((c) => c.pass).join()})`);
  ok(calls[0].images === 2 && calls[1].images === 2 && calls[2].images === 0 && calls.every((c) => c.blobs), "studio : photos jointes aux passes 1 et 2 seulement (JPEG)");
  ok(calls.every((c) => c.tier === "complex" && c.schema) && calls[0].effort === "high" && calls[0].photoOrder, "studio : modèle le plus capable, consigne d'effort, schéma JSON et ordre des photos dans le texte");
  const res = await T(page);
  ok(/Veine d'écume/.test(res) && !/Poste sans fait/.test(res), "studio : le poste sans fait cité est écarté");
  ok(/1 observation gardée/.test(res) && /1 retirée/.test(res), "studio : vérification appliquée (1 gardée, 1 retirée, photo inexistante ignorée)");
  ok(!(await page.evaluate(() => window.__xss)), "studio : texte du modèle affiché comme texte (aucun script)");
  await page.screenshot({ path: path.join(SHOTS, "studio-resultat.png"), fullPage: true });
  // Audit v8.8 : une note tapée après l'analyse ne la détruit plus ; l'écran dit qu'elle garde ses notes d'origine.
  await page.fill("#notes", "fond de sable");
  ok(await page.isVisible("#result") && await page.isEnabled("#save") && await page.isVisible("#notes-stale"), "studio : note tapée après l'analyse → résultat gardé, avis affiché");
  await page.click("#save");
  await page.waitForFunction(() => !!window.__saved, null, { timeout: 5000 });
  const saved = await page.evaluate(() => window.__saved);
  exported = saved.data;
  const ex = JSON.parse(saved.data);
  ok(/^analyse-audierne-raz-\d{8}-\d{4}\.json$/.test(saved.filename), `studio : fichier nommé d'après le guide et le spot (${saved.filename})`);
  ok(ex.format === "guide-peche-bar/analyse-photo" && ex.site === "audierne" && ex.spotId === "raz" && ex.photos.length === 2 && ex.raw.inv && ex.raw.ver && ex.raw.lec, "studio : fichier = réponses brutes + vignettes, pour le guide d'Audierne");
  ok(!/"b64"/.test(saved.data) && ex.photos.every((p) => /^data:image\/jpeg;base64,/.test(p.thumb)), "studio : pas de photo pleine taille dans le fichier, vignettes JPEG");
  ok(/Fichier enregistré/.test(await T(page)), "studio : enregistrement confirmé, marche à suivre affichée");
  ok(errors.length === 0, "studio : aucune erreur JavaScript" + (errors.length ? " — " + errors.slice(0, 2).join(" | ") : ""));
  await ctx.close();
}
// ── 2. Sans claude.ai (page copiée ailleurs) : explication, pas de bouton actif ──
{
  const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR" });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, body: "" }));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/studio.html#plouguerneau`);
  await page.waitForTimeout(500);
  ok(/Ouvre cette page dans claude\.ai/.test(await T(page)) && await page.isDisabled("#go") && await page.locator("#spot option").count() === 11, "studio hors claude.ai : explication, analyse désactivée ; guide Plouguerneau (10 spots)");
  await ctx.close();
}
// ── 3. Import dans le guide ──
{
  const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR", timezoneId: "Europe/Paris", serviceWorkers: "block" });
  await ctx.route(/open-meteo\.com/, async (route) => { const r = omRespond(route.request().url(), "nominal");
    await route.fulfill({ status: r.status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(r.body) }); });
  await ctx.route(/tile\.openstreetmap\.org/, (r) => r.fulfill({ status: 200, body: "" }));
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${BASE}/audierne.html#photos`);
  await page.waitForFunction(() => /Sans crédit API : ton abonnement Claude/.test(document.body.innerText), null, { timeout: 15000 });
  const link = await page.getAttribute('a:has-text("Analyse photo du bar")', "href").catch(() => null);
  ok(link && /^https:\/\/claude\.ai\/.+#audierne$/.test(link), `guide : lien vers la page claude.ai, guide présélectionné (${link})`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "imp-"));
  const f = (name, txt) => { const p = path.join(dir, name); fs.writeFileSync(p, txt); return p; };
  // Fichier d'un autre guide : refusé, avec le nom du bon guide.
  await page.setInputFiles('input[aria-label="Fichier d\'analyse"]', f("pirou.json", exported.replace('"site":"audierne"', '"site":"pirou-plage"').replace('"siteName":"Audierne"', '"siteName":"Pirou Plage"')));
  await page.waitForTimeout(400);
  ok(/concerne le guide « Pirou Plage »/.test(await T(page)), "import : analyse d'un autre guide refusée, guide nommé");
  // Vignette piégée : refusée.
  await page.setInputFiles('input[aria-label="Fichier d\'analyse"]', f("bad.json", exported.replace(/"thumb":"data:image\/jpeg;base64,/, '"thumb":"javascript:alert(1)//')));
  await page.waitForTimeout(400);
  ok(/vignette absente ou invalide/.test(await T(page)), "import : vignette qui n'est pas une image JPEG refusée");
  // Le bon fichier.
  await page.setInputFiles('input[aria-label="Fichier d\'analyse"]', f("ok.json", exported));
  await page.waitForFunction(() => /Analyse importée/.test(document.body.innerText), null, { timeout: 8000 }).catch(() => {});
  const t = await T(page);
  ok(/Analyse importée : Pointe du Raz/.test(t), "import : analyse acceptée, spot reconnu");
  ok(/Abonnement Claude · sans crédit API/.test(t), "import : origine affichée (abonnement, sans crédit)");
  ok(/Veine d'écume/.test(t) && !/Poste sans fait/.test(t), "import : lecture affichée, poste sans fait écarté par les contrôles du guide");
  const hist = await page.evaluate(() => new Promise((ok2) => { const r = indexedDB.open("guide-bar"); r.onsuccess = () => { try { const tx = r.result.transaction(r.result.objectStoreNames[0]); const st = tx.objectStore(r.result.objectStoreNames[0]); const g = st.get("photos:audierne"); g.onsuccess = () => ok2(g.result); g.onerror = () => ok2(null); } catch { ok2(null); } }; r.onerror = () => ok2(null); }));
  ok(Array.isArray(hist) ? hist.length === 1 && hist[0].via === "abonnement" : true, "import : analyse gardée dans l'historique de l'appareil");
  ok(!(await page.evaluate(() => window.__xss)), "import : texte importé affiché comme texte (aucun script)");
  await page.screenshot({ path: path.join(SHOTS, "photos-import-audierne.png"), fullPage: true });
  // Coller : même résultat.
  await page.reload(); await page.waitForTimeout(800);
  await page.getByText("Coller une analyse copiée").click();
  await page.fill('textarea[aria-label="Analyse copiée depuis claude.ai"]', exported);
  await page.getByRole("button", { name: "Importer le texte collé" }).click();
  await page.waitForTimeout(500);
  ok(/Analyse importée : Pointe du Raz/.test(await T(page)), "import : texte collé accepté");
  ok(errors.length === 0, "guide : aucune erreur JavaScript à l'import" + (errors.length ? " — " + errors.slice(0, 2).join(" | ") : ""));
  fs.rmSync(dir, { recursive: true, force: true });
  await ctx.close();
}
await browser.close(); server.close();
for (const [c, l] of results) console.log(`${c ? "  ✓" : "  ✗"} ${l}`);
const fails = results.filter(([c]) => !c);
console.log(`\nSTUDIO : ${results.length - fails.length}/${results.length}`);
process.exit(fails.length ? 1 : 0);
