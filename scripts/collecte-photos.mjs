// Phase 5 V3, sous-tâche 5.7 : inventaire des photos librement réutilisables proches de chaque spot (§ 15 : « identifier
// les photos réellement disponibles pour chaque spot et leur provenance ; ne jamais présenter une image générique comme
// une photo du lieu »). Source : Wikimedia Commons (recherche géographique, fichiers à 400 m au plus du point), avec la
// licence, l'auteur et la description de chaque fichier. Rien n'est téléchargé ni affiché : c'est un inventaire.
// Une photo proche n'est pas une photo du lieu : l'intégration ne garde que celles dont le titre ou la description
// porte le nom du spot. Lancé par la CI quand data/spots/collecte/demande.json contient « "photos": true ».
// Sortie : une ligne « PHOTOS <json> » par spot dans le journal du passage.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIR = path.join(root, "data/spots/fiches");
const UA = "SPUMY-audit-photos/1.0 (https://github.com/FelixMuzellec/spumy ; inventaire ponctuel)";
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const API = "https://commons.wikimedia.org/w/api.php";
async function get(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
    return r.ok ? await r.json() : { erreur: `HTTP ${r.status}` };
  } catch (e) { return { erreur: e?.cause?.code || e?.message }; }
}
const texte = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);

const fiches = fs.readdirSync(DIR).filter((n) => n.endsWith(".json")).sort().map((n) => JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8")));
for (const f of fiches) {
  const { lat, lon } = f.coordinates;
  const g = await get({ action: "query", list: "geosearch", gscoord: `${lat}|${lon}`, gsradius: "400", gsnamespace: "6", gslimit: "12" });
  await pause(300);
  const titres = (g.query?.geosearch || []).map((x) => ({ titre: x.title, distance_m: Math.round(x.dist) }));
  let infos = [];
  if (titres.length) {
    const ii = await get({ action: "query", prop: "imageinfo", iiprop: "url|extmetadata", iiextmetadatafilter: "LicenseShortName|Artist|ImageDescription|DateTimeOriginal|ObjectName", titles: titres.map((t) => t.titre).join("|") });
    await pause(300);
    infos = (ii.query?.pages || []).map((p) => {
      const m = p.imageinfo?.[0]?.extmetadata || {};
      const t = titres.find((x) => x.titre === p.title);
      return { titre: p.title, distance_m: t?.distance_m ?? null, page: p.imageinfo?.[0]?.descriptionurl || null, licence: m.LicenseShortName?.value || null, auteur: texte(m.Artist?.value), date: texte(m.DateTimeOriginal?.value), description: texte(m.ImageDescription?.value || m.ObjectName?.value) };
    }).sort((a, b) => (a.distance_m ?? 9e9) - (b.distance_m ?? 9e9));
  }
  console.log(`PHOTOS ${JSON.stringify({ id: f.id, nom: f.name, erreur: g.erreur || null, photos: infos })}`);
}
console.log(`[photos] ${fiches.length} spots interrogés`);
