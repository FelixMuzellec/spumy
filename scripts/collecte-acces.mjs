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
// Spots à collecter : --ids=a,b,c, sinon la demande data/spots/collecte/demande.json ({ "ids": [...] }), sinon tous.
const F_DEMANDE = path.join(root, "data/spots/collecte/demande.json");
let filtre = (process.argv.find((a) => a.startsWith("--ids=")) || "").slice(6).split(",").filter(Boolean);
const DEMANDE = fs.existsSync(F_DEMANDE) ? JSON.parse(fs.readFileSync(F_DEMANDE, "utf8")) : {};
if (!filtre.length) filtre = DEMANDE.ids || [];
/** Requêtes de nom proposées à la main pour un spot (demande.requetes[id]), essayées avant les variantes. */
const requetes = (f) => [...(DEMANDE.requetes?.[f.id] || []), ...variantes(f.name)].filter((q, i, a) => a.indexOf(q) === i);

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
      const res = await fetch(url, { ...opts, headers: { "User-Agent": UA, Accept: "application/json", ...(opts.headers || {}) }, signal: AbortSignal.timeout(15000) });
      const ms = Math.round(performance.now() - t0);
      if (res.status === 429 || res.status >= 500) { await pause(5000 * (i + 1)); continue; }
      const texte = await res.text();
      try { return { statut: res.status, ms, json: JSON.parse(texte) }; } catch { return { statut: res.status, ms, erreur: "réponse non JSON", extrait: texte.slice(0, 200) }; }
    } catch (e) { if (i === essais - 1) return { erreur: e?.cause?.code || e?.message }; await pause(3000); }
  }
  return { erreur: "service saturé ou en panne après nouvel essai" };
}

/** Variantes du nom : complet, sans mot générique de tête, partie avant « : » ou « – ». */
function variantes(nom) {
  const v = [nom.replace(/\s*[:–-]\s*/g, " ").trim()];
  const sans = nom.replace(/^(Embouchures?|Estuaire|Plage|Anse|Baie|Rochers|Dunes|Sillon|Île)\s+(de la|de l'|des|du|de|d')\s*/i, "").replace(/\s*[:–-].*$/, "").trim();
  if (sans && !v.includes(sans)) v.push(sans);
  const avant = nom.split(/\s*[:–]\s*/)[0].trim();
  if (avant && !v.includes(avant)) v.push(avant);
  return v;
}

async function lieuxNommes(f) {
  const { lat, lon } = f.coordinates;
  const d = f.coordinates.precision_m && f.coordinates.precision_m > 1000 ? 0.06 : 0.04;
  const essais = [];
  let osm = [];
  for (const q of requetes(f)) {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&bounded=1&accept-language=fr&viewbox=${lon - d * 1.5},${lat + d},${lon + d * 1.5},${lat - d}&q=${encodeURIComponent(q)}`;
    const r = await json(url);
    await pause(1100);
    essais.push({ requete: q, statut: r.statut, erreur: r.erreur, n: Array.isArray(r.json) ? r.json.length : 0 });
    if (Array.isArray(r.json) && r.json.length) {
      osm = r.json.map((x) => ({ source: "osm", nom: x.display_name, categorie: `${x.category}/${x.type}`, osm: `${x.osm_type}/${x.osm_id}`, lat: +x.lat, lon: +x.lon, ecart_m: dist({ lat, lon }, { lat: +x.lat, lon: +x.lon }) }));
      break;
    }
  }
  // Toponymes officiels de l'IGN (index « poi » du géocodage de la Géoplateforme), autour du point.
  let ignPoi = [];
  for (const q of requetes(f).slice(0, 4)) {
    const r = await json(`https://data.geopf.fr/geocodage/search?index=poi&limit=5&lat=${lat}&lon=${lon}&q=${encodeURIComponent(q)}`);
    await pause(250);
    essais.push({ requete: `ign:${q}`, statut: r.statut, erreur: r.erreur, n: r.json?.features?.length || 0 });
    const fs_ = (r.json?.features || []).map((x) => ({ source: "ign", nom: x.properties?.toponym || x.properties?.name || x.properties?.label, categorie: [].concat(x.properties?.category || []).join(", "), lat: x.geometry?.coordinates?.[1], lon: x.geometry?.coordinates?.[0] }))
      .filter((x) => x.lat != null).map((x) => ({ ...x, ecart_m: dist({ lat, lon }, x) })).filter((x) => x.ecart_m <= 8000);
    if (fs_.length) { ignPoi = fs_; break; }
  }
  return { essais, resultats: [...osm, ...ignPoi].sort((a, b) => a.ecart_m - b.ecart_m) };
}

async function parkings(f) {
  const { lat, lon } = f.coordinates;
  const rayon = f.coordinates.precision_m && f.coordinates.precision_m > 1000 ? 2500 : 1500;
  const dLat = rayon / 111000, dLon = rayon / (111000 * Math.cos((lat * Math.PI) / 180));
  // 1. IGN, BD TOPO (équipements de transport de nature « Parking »), Licence Ouverte.
  const wfs = `https://data.geopf.fr/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=BDTOPO_V3:equipement_de_transport&OUTPUTFORMAT=application/json&COUNT=200&BBOX=${lat - dLat},${lon - dLon},${lat + dLat},${lon + dLon},urn:ogc:def:crs:EPSG::4326`;
  const r = await json(wfs);
  await pause(250);
  const centre = (g) => {
    if (!g) return null;
    if (g.type === "Point") return { lon: g.coordinates[0], lat: g.coordinates[1] };
    const pts = (g.type === "Polygon" ? g.coordinates[0] : g.type === "MultiPolygon" ? g.coordinates[0][0] : g.coordinates).filter((p) => Array.isArray(p));
    if (!pts.length) return null;
    return { lon: pts.reduce((a, p) => a + p[0], 0) / pts.length, lat: pts.reduce((a, p) => a + p[1], 0) / pts.length };
  };
  let res = (r.json?.features || []).filter((x) => /parking/i.test(x.properties?.nature || "")).map((x) => {
    const c = centre(x.geometry);
    return c && { source: "ign", ign: x.id, ...c, ecart_m: dist({ lat, lon }, c), nom: x.properties?.toponyme || x.properties?.nom || null, nature: x.properties?.nature || null, detail: x.properties?.nature_detaillee || null };
  }).filter(Boolean);
  let source = "ign-bdtopo";
  // 2. Sinon, OpenStreetMap (Overpass), un seul essai court.
  let overpass = null;
  if (!res.length) {
    const q = `[out:json][timeout:12];nwr(around:${rayon},${lat},${lon})[amenity=parking];out center tags;`;
    const o = await json("https://overpass-api.de/api/interpreter", { method: "POST", body: new URLSearchParams({ data: q }), headers: { "Content-Type": "application/x-www-form-urlencoded" } }, 1);
    await pause(1000);
    overpass = { statut: o.statut, erreur: o.erreur };
    res = (o.json?.elements || []).map((e) => {
      const p = e.type === "node" ? { lat: e.lat, lon: e.lon } : { lat: e.center?.lat, lon: e.center?.lon };
      const t = e.tags || {};
      return { source: "osm", osm: `${e.type}/${e.id}`, ...p, ecart_m: dist({ lat, lon }, p), nom: t.name || null, acces: t.access || null, payant: t.fee || null, capacite: t.capacity || null };
    }).filter((p) => p.lat != null && p.acces !== "private" && p.acces !== "no");
    source = "osm-overpass";
  }
  return { rayon_m: rayon, source, wfs: { statut: r.statut, erreur: r.erreur, n: r.json?.features?.length ?? null }, overpass, resultats: res.sort((a, b) => a.ecart_m - b.ecart_m).slice(0, 8) };
}

async function marche(f, liste) {
  const { lat, lon } = f.coordinates;
  const out = [];
  for (const p of liste.slice(0, 3)) {
    const ref = p.osm || p.ign;
    let meilleur = null;
    for (const resource of ["bdtopo-pgr", "bdtopo-valhalla"]) {
      const url = `https://data.geopf.fr/navigation/itineraire?resource=${resource}&profile=pedestrian&optimization=fastest&start=${p.lon},${p.lat}&end=${lon},${lat}`;
      const r = await json(url);
      await pause(300);
      const v = r.json ? ign.itineraire(r.json) : null;
      if (v?.ok) { meilleur = { parking: ref, resource, minutes: +v.value.minutes.toFixed(1), km: +v.value.km.toFixed(2) }; break; }
      meilleur = { parking: ref, resource, erreur: r.erreur || (v && !v.ok ? v.error.details.raison : `HTTP ${r.statut}`) };
    }
    out.push(meilleur);
    await pause(100);
  }
  return out;
}

const fiches = fs.readdirSync(DIR).filter((n) => n.endsWith(".json")).sort().map((n) => JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8")))
  .filter((f) => !filtre.length || filtre.includes(f.id));
const resultat = { date: new Date().toISOString(), agent: UA, sources: { bdtopo: "IGN, BD TOPO, équipements de transport (Licence Ouverte)", poi: "IGN, géocodage de la Géoplateforme, index poi", nominatim: "OpenStreetMap, Nominatim (ODbL, © contributeurs OpenStreetMap)", overpass: "OpenStreetMap, Overpass API (ODbL, © contributeurs OpenStreetMap)", ign: "IGN, Géoplateforme, itinéraire piéton" }, spots: [] };
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
