// Contrat IGN (Géoplateforme) — phase 4 V3, sous-tâche 4.14.
// Vérifie contre les VRAIS services ce dont dépend la V3 pour le classement BORD (V3-009, RTE-01 à RTE-04) :
//   1. les services répondent depuis la CI (le bac à sable de Claude ne les atteint pas) ;
//   2. un navigateur peut les appeler depuis l'origine du site publié (CORS), sans relais.
// Le point 2 décide de l'architecture : s'il échoue, il faut le relais du plan B (V3-009), décision de Félix.
// Les positions de test sont des lieux publics (centres-villes), jamais un spot personnel.
//
// Lancé par .github/workflows/contrat-ign.yml (propositions, chaque matin, à la main).
//   node tests/contrat-ign.mjs            réseau réel ; compte rendu dans out/contrat-ign.json
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const here = path.dirname(new URL(import.meta.url).pathname), root = path.resolve(here, "..");
const ORIGINE = "https://felixmuzellec.github.io";
const DEPART = { nom: "Coutances, centre", lon: -1.445, lat: 49.048 };
const ARRIVEE = { nom: "Granville, centre", lon: -1.597, lat: 48.838 };
const BASE = "https://data.geopf.fr";
const APPELS = {
  capacites: `${BASE}/navigation/getcapabilities`,
  geocodage: `${BASE}/geocodage/search?q=${encodeURIComponent("Coutances")}&limit=1`,
  itineraire: `${BASE}/navigation/itineraire?resource=bdtopo-osrm&start=${DEPART.lon},${DEPART.lat}&end=${ARRIVEE.lon},${ARRIVEE.lat}&profile=car&optimization=fastest`,
  isochrone: `${BASE}/navigation/isochrone?resource=bdtopo-valhalla&point=${DEPART.lon},${DEPART.lat}&costType=time&costValue=3600&timeUnit=second&profile=car&direction=departure`,
};

let pass = 0, fail = 0;
const lignes = [];
const t = (n, c, info = "") => {
  if (c) pass++; else fail++;
  const l = `  ${c ? "✓" : "✗"} ${n}${info ? " — " + info : ""}`;
  lignes.push(l); console.log(l);
};
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const compte = { date: new Date().toISOString(), origine: ORIGINE, depart: DEPART.nom, arrivee: ARRIVEE.nom, serveur: {}, navigateur: {} };

// 1. Depuis la CI (Node), avec l'en-tête Origin du site publié : réponse, contenu, en-tête CORS renvoyé.
console.log("[ign] services, depuis la CI");
for (const [nom, url] of Object.entries(APPELS)) {
  const r = { url };
  try {
    const res = await fetch(url, { headers: { Origin: ORIGINE, Accept: "application/json" } });
    r.statut = res.status;
    r.acao = res.headers.get("access-control-allow-origin");
    const texte = await res.text();
    try { r.json = JSON.parse(texte); } catch { r.extrait = texte.slice(0, 200); }
  } catch (e) {
    r.erreur = e?.cause?.code || e?.cause?.message || e?.message;
  }
  compte.serveur[nom] = r;
  await pause(400); // la Géoplateforme limite à 5 requêtes par seconde et par adresse
}
const s = compte.serveur;
t("capacités de navigation", s.capacites.statut === 200 && !!s.capacites.json,
  s.capacites.erreur || `HTTP ${s.capacites.statut}`);
if (s.capacites.json) {
  const res = (s.capacites.json.resources || []).map((x) => x.id);
  compte.ressources = res;
  t("ressources bdtopo-osrm et bdtopo-valhalla annoncées", res.includes("bdtopo-osrm") && res.includes("bdtopo-valhalla"), res.join(", ") || "liste vide");
}
const g = s.geocodage.json;
t("géocodage : un résultat pour « Coutances »", s.geocodage.statut === 200 && (g?.features?.length || 0) > 0,
  s.geocodage.erreur || `HTTP ${s.geocodage.statut}${g?.features?.[0]?.properties?.label ? ", " + g.features[0].properties.label : ""}`);
const it = s.itineraire.json;
t("itinéraire voiture : durée et distance", s.itineraire.statut === 200 && typeof it?.duration === "number" && typeof it?.distance === "number",
  s.itineraire.erreur || `HTTP ${s.itineraire.statut}${it ? `, durée ${it.duration} ${it.timeUnit || ""}, distance ${it.distance} ${it.distanceUnit || ""}` : ""}${it && typeof it.duration !== "number" ? ", champs : " + Object.keys(it).join(", ") : ""}`);
const iso = s.isochrone.json;
t("isochrone voiture 60 min : un polygone", s.isochrone.statut === 200 && /Polygon/.test(iso?.geometry?.type || ""),
  s.isochrone.erreur || `HTTP ${s.isochrone.statut}${iso?.geometry?.type ? ", " + iso.geometry.type : ""}${iso && !iso.geometry ? ", champs : " + Object.keys(iso).join(", ") : ""}`);
for (const nom of Object.keys(APPELS)) compte.serveur[nom].json = compte.serveur[nom].json ? "(reçu)" : undefined;
console.log("  en-têtes Access-Control-Allow-Origin : " + Object.entries(s).map(([n, r]) => `${n} = ${r.acao ?? "absent"}`).join(" ; "));

// 2. Depuis un vrai navigateur (Chromium), dans une page de l'origine du site publié : c'est le navigateur qui
// applique le CORS. La page est servie localement par Playwright à l'adresse du site ; les appels à l'IGN partent
// vraiment sur le réseau.
console.log("[ign] appels depuis une page de " + ORIGINE + " (Chromium)");
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.route(`${ORIGINE}/**`, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>contrat IGN</title>" }));
  await page.goto(`${ORIGINE}/spumy/contrat-ign.html`);
  for (const [nom, url] of Object.entries(APPELS)) {
    if (nom === "capacites") continue;
    const r = await page.evaluate(async (u) => {
      try { const res = await fetch(u); const j = await res.json().catch(() => null); return { statut: res.status, lu: !!j }; }
      catch (e) { return { erreur: String(e?.message || e) }; }
    }, url);
    compte.navigateur[nom] = r;
    t(`navigateur → ${nom} (CORS)`, r.statut === 200 && r.lu, r.erreur ? `bloqué ou injoignable : ${r.erreur}` : `HTTP ${r.statut}`);
    await pause(400);
  }
} finally {
  await browser.close();
}

compte.resultat = { reussis: pass, echecs: fail };
fs.mkdirSync(path.join(root, "out"), { recursive: true });
fs.writeFileSync(path.join(root, "out", "contrat-ign.json"), JSON.stringify(compte, null, 2) + "\n");
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Contrat IGN — ${pass}/${pass + fail}\n\n\`\`\`\n${lignes.join("\n")}\n\`\`\`\n`);
}
console.log(`Contrat IGN : ${pass}/${pass + fail}`);
if (fail) process.exit(1);
