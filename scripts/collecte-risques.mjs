// Phase 5 V3, sous-tâche 5.7 (sécurité) : risques naturels officiels autour de chaque spot, depuis l'API Géorisques
// (ministère de la Transition écologique, BRGM ; base georisques.gouv.fr/api/v1, accès « Ouvert », Licence Ouverte 2.0).
// Deux lectures, sans clé :
//   1. /mvt : mouvements de terrain recensés (BDMvt : éboulements, chutes de blocs, glissements, érosion de berges)
//      dans un rayon de 500 m (le rayon des rapports de risques Géorisques) autour du point du spot ;
//   2. /gaspar/risques : risques recensés pour la commune du point (DDRM), à l'échelle de la commune, pas du poste.
// Rien n'est affiché tel quel : l'intégration garde les faits et leur portée (poste ou commune). Lancé par la CI quand
// data/spots/collecte/demande.json contient « "risques": true ». Sortie : une ligne « RISQUES <json> » par spot.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIR = path.join(root, "data/spots/fiches");
const BASE = "https://georisques.gouv.fr/api/v1";
const RAYON = 500;
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(chemin, params) {
  const url = `${BASE}${chemin}?${new URLSearchParams(params)}`;
  const t0 = Date.now();
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(20000) });
    const ms = Date.now() - t0;
    if (!r.ok) return { erreur: `HTTP ${r.status}`, ms, url };
    return { json: await r.json(), ms, url };
  } catch (e) { return { erreur: e?.cause?.code || e?.name || e?.message, ms: Date.now() - t0, url }; }
}
const champs = (o) => (o && typeof o === "object" ? Object.keys(o) : []);
let forme = false;

const fiches = fs.readdirSync(DIR).filter((n) => n.endsWith(".json")).sort().map((n) => JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8")));
for (const f of fiches) {
  const { lat, lon } = f.coordinates;
  const latlon = `${lon},${lat}`;
  const mvt = await get("/mvt", { latlon, rayon: String(RAYON), page: "1", page_size: "50" });
  await pause(150);
  let gaspar = await get("/gaspar/risques", { latlon, rayon: "1", page: "1", page_size: "10" });
  let rayonCommune = 1;
  await pause(150);
  if (!gaspar.erreur && !(gaspar.json?.data || []).length) {
    // Point en mer (pointe, embouchure) : hors de toute commune ; repli sur les communes à 1 km, signalé comme tel.
    gaspar = await get("/gaspar/risques", { latlon, rayon: "1000", page: "1", page_size: "10" });
    rayonCommune = 1000;
    await pause(150);
  }
  if (!forme) {
    // Forme réelle des réponses, une fois, pour écrire l'intégration sur ce qui existe et non sur ce qu'on suppose.
    console.log(`FORME ${JSON.stringify({ mvt: { cles: champs(mvt.json), item: champs(mvt.json?.data?.[0]) }, gaspar: { cles: champs(gaspar.json), item: champs(gaspar.json?.data?.[0]), sous: champs(gaspar.json?.data?.[0]?.risques_detail?.[0]) } })}`);
    forme = true;
  }
  const evts = (mvt.json?.data || []).map((x) => ({
    id: x.identifiant ?? x.id ?? null, type: x.type ?? null, date: x.date_debut ?? x.date ?? null, fiabilite: x.fiabilite ?? null,
    precision: x.precision_lieu ?? x.precision ?? null, lieu: x.lieu ?? null, commentaire: String(x.commentaire_mvt ?? x.commentaire ?? "").slice(0, 240) || null,
    commune: x.libelle_commune ?? null, code_insee: x.code_insee ?? null, lat: x.latitude ?? null, lon: x.longitude ?? null,
  }));
  const communes = (gaspar.json?.data || []).map((c) => ({
    code_insee: c.code_insee ?? null, commune: c.libelle_commune ?? null,
    risques: (c.risques_detail || []).map((r) => ({ num: r.num_risque ?? null, libelle: r.libelle_risque_long ?? r.libelle_risque ?? null })),
  }));
  console.log(`RISQUES ${JSON.stringify({ id: f.id, nom: f.name, rayon_m: RAYON, mvt: { erreur: mvt.erreur || null, ms: mvt.ms, total: mvt.json?.results ?? evts.length, evenements: evts }, gaspar: { erreur: gaspar.erreur || null, ms: gaspar.ms, rayon_m: rayonCommune, communes } })}`);
}
console.log(`[risques] ${fiches.length} spots interrogés`);
