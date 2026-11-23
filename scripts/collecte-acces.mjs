// Phase 5 V3, sous-tâche 5.7 : collecte des données d'accès de chaque spot, depuis la CI (le bac à sable de Claude
// n'atteint ni l'IGN ni OpenStreetMap ; GitHub Actions, si). Lancé par .github/workflows/collecte-spots.yml.
//
// Pour chaque fiche de data/spots/fiches/ :
//   1. lieux nommés proches portant le nom du spot (Nominatim d'OpenStreetMap, 1 requête par seconde, politique
//      d'usage respectée : agent identifié, résultats bornés au voisinage) ;
//   2. parkings à 1,5 km au plus (Overpass d'OpenStreetMap : amenity=parking, avec accès, payant, capacité) ;
//   3. temps de marche réel, des trois parkings les plus proches jusqu'au spot (itinéraire piéton de l'IGN), puis
//      temps de voiture depuis un centre-ville public de référence n'est PAS calculé ici (étalonnage, après la phase 5).
// Rien n'est décidé ici : le script ne fait que collecter, avec l'heure et la source de chaque donnée.
// Sortie : out/collecte-acces.json, et une ligne « COLLECTE <json> » par spot dans le journal (lu par la session).
//   node scripts/collecte-acces.mjs [--ids=a,b,c]
import fs from "node:fs";
import path from "node:path";
import * as ign from "../src/core/ign/reponses.js";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIR = path.join(root, "data/spots/fiches");
const UA = "SPUMY-audit-spots/1.0 (https://github.com/FelixMuzellec/spumy ; audit ponctuel de 66 lieux publics)";
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const filtre = (process.argv.find((a) => a.startsWith("--ids=")) || "").slice(6).split(",").filter(Boolean);

/** Distance en mètres (haversine). */
const dist = (a, b) => {
  const R = 6371000, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
};

async function json(url, opts = {}, essais = 2) {
  for (let i = 0; i < essais; i++) {
    try {
      const t0 = performance.now();
      const res = await fetch(url, { ...opts, headers: { "User-Agent": UA, Accept: "application/json", ...(opts.headers || {}) }, signal: AbortSignal.timeout(30000) });
      const ms = Math.round(performance.now() - t0);
      if (res.status === 429 || res.status >= 500) { await pause(5000 * (i + 1)); continue; }
      const texte = await res.text();
      try { return { statut: res.status, ms, json: JSON.parse(texte) }; } catch { return { statut: res.status, ms, erreur: "réponse non JSON", extrait: texte.slice(0, 200) }; }
    } catch (e) { if (i === essais - 1) return { erreur: e?.cause?.code || e?.message }; await pause(3000); }
  }
  return { erreur: "service saturé ou en panne après nouvel essai" };
}

async function lieuxNommes(f) {
  const { lat, lon } = f.coordinates;
  const d = f.coordinates.precision_m && f.coordinates.precision_m > 1000 ? 0.06 : 0.04;
  const q = f.name.replace(/\s*[:–-]\s*/g, " ").trim();
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&bounded=1&accept-language=fr&viewbox=${lon - d * 1.5},${lat + d},${lon + d * 1.5},${lat - d}&q=${encodeURIComponent(q)}`;
  const r = await json(url);
  await pause(1100);
  return {
    requete: q, statut: r.statut, erreur: r.erreur,
    resultats: Array.isArray(r.json) ? r.json.map((x) => ({ nom: x.display_name, categorie: `${x.category}/${x.type}`, osm: `${x.osm_type}/${x.osm_id}`, lat: +x.lat, lon: +x.lon, ecart_m: dist({ lat, lon }, { lat: +x.lat, lon: +x.lon }) })) : [],
  };
}

async function parkings(f) {
  const { lat, lon } = f.coordinates;
  const rayon = f.coordinates.precision_m && f.coordinates.precision_m > 1000 ? 2500 : 1500;
  const q = `[out:json][timeout:25];nwr(around:${rayon},${lat},${lon})[amenity=parking];out center tags;`;
  const r = await json("https://overpass-api.de/api/interpreter", { method: "POST", body: new URLSearchParams({ data: q }), headers: { "Content-Type": "application/x-www-form-urlencoded" } }, 3);
  await pause(1500);
  const els = r.json?.elements || [];
  return {
    rayon_m: rayon, statut: r.statut, erreur: r.erreur,
    resultats: els.map((e) => {
      const p = e.type === "node" ? { lat: e.lat, lon: e.lon } : { lat: e.center?.lat, lon: e.center?.lon };
      const t = e.tags || {};
      return { osm: `${e.type}/${e.id}`, ...p, ecart_m: dist({ lat, lon }, p), nom: t.name || null, acces: t.access || null, payant: t.fee || null, capacite: t.capacity || null, revetement: t.surface || null, type: t.parking || null };
    }).filter((p) => p.lat != null && p.acces !== "private" && p.acces !== "no").sort((a, b) => a.ecart_m - b.ecart_m).slice(0, 8),
  };
}

async function marche(f, liste) {
  const { lat, lon } = f.coordinates;
  const out = [];
  for (const p of liste.slice(0, 3)) {
    let meilleur = null;
    for (const resource of ["bdtopo-pgr", "bdtopo-valhalla"]) {
      const url = `https://data.geopf.fr/navigation/itineraire?resource=${resource}&profile=pedestrian&optimization=fastest&start=${p.lon},${p.lat}&end=${lon},${lat}`;
      const r = await json(url);
      await pause(300);
      const v = r.json ? ign.itineraire(r.json) : null;
      if (v?.ok) { meilleur = { osm: p.osm, resource, minutes: +v.value.minutes.toFixed(1), km: +v.value.km.toFixed(2) }; break; }
      meilleur = { osm: p.osm, resource, erreur: r.erreur || (v && !v.ok ? v.error.details.raison : `HTTP ${r.statut}`) };
    }
    out.push(meilleur);
  }
  return out;
}

const fiches = fs.readdirSync(DIR).filter((n) => n.endsWith(".json")).sort().map((n) => JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8")))
  .filter((f) => !filtre.length || filtre.includes(f.id));
const resultat = { date: new Date().toISOString(), agent: UA, sources: { nominatim: "OpenStreetMap, Nominatim (ODbL, © contributeurs OpenStreetMap)", overpass: "OpenStreetMap, Overpass API (ODbL, © contributeurs OpenStreetMap)", ign: "IGN, Géoplateforme, itinéraire piéton" }, spots: [] };
for (const f of fiches) {
  const nommes = await lieuxNommes(f);
  const parks = await parkings(f);
  const pied = await marche(f, parks.resultats);
  const s = { id: f.id, nom: f.name, point: { lat: f.coordinates.lat, lon: f.coordinates.lon, precision_m: f.coordinates.precision_m }, nommes, parkings: parks, marche: pied };
  resultat.spots.push(s);
  console.log(`COLLECTE ${JSON.stringify(s)}`);
}
fs.mkdirSync(path.join(root, "out"), { recursive: true });
fs.writeFileSync(path.join(root, "out/collecte-acces.json"), JSON.stringify(resultat, null, 1) + "\n");
const avecParking = resultat.spots.filter((s) => s.parkings.resultats.length).length;
const avecMarche = resultat.spots.filter((s) => s.marche.some((m) => m.minutes != null)).length;
console.log(`[collecte] ${resultat.spots.length} spots ; avec parking OSM : ${avecParking} ; avec temps de marche IGN : ${avecMarche}`);
