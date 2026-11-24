// Phase 5 V3, sous-tâche 5.1 : inventaire exhaustif et sauvegarde logique des spots V2 (référentiel § 7.3, § 15).
//
// Lit les sept guides V2 (data/sites/*.config.js) et écrit :
//   data/spots/v2/sauvegarde.json  copie exacte de chaque spot (JSON canonique), avec les métadonnées de son guide ;
//   data/spots/v2/inventaire.json  une ligne par spot (identifiant, guide, nom, coordonnées, champs, empreinte SHA-256)
//                                  et les anomalies mesurées (coordonnées numériques absentes, champs rares).
// La sauvegarde complète l'étiquette Git `v2-final` (bb4f940) : elle est lisible sans Git et sert de référence
// pour comparer avant/après chaque identifiant, coordonnée et champ.
//
//   node scripts/inventaire-spots-v2.mjs             régénère les deux fichiers
//   node scripts/inventaire-spots-v2.mjs --verifier  vérifie que les guides V2 et la sauvegarde n'ont pas changé
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { SITES } from "./sites.mjs";
import { loadSite } from "./site-data.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIR = path.join(root, "data/spots/v2");
const F_SAUV = path.join(DIR, "sauvegarde.json");
const F_INV = path.join(DIR, "inventaire.json");
const REF_GIT = { etiquette: "v2-final", commit: "bb4f9409a2d5f174588f8f31c82951001e76261c" };

/** JSON canonique : clés triées à chaque niveau, pour une empreinte stable. */
const canon = (v) => Array.isArray(v) ? v.map(canon)
  : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v;
const json = (v) => JSON.stringify(canon(v));
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

async function lire() {
  const guides = {};
  const lignes = [];
  for (const s of SITES) {
    const m = await loadSite(s.config);
    const { id, name, region, lat, lon, tidePort, zones } = m.SITE;
    guides[s.key] = { fichier: path.relative(root, s.config), site: { id, name, region, lat, lon, tidePort, zones }, spots: m.SPOTS.map(canon) };
    for (const sp of m.SPOTS) {
      lignes.push({
        id: sp.id, guide: s.key, name: sp.name, subtitle: sp.subtitle ?? null,
        lat: typeof sp.lat === "number" ? sp.lat : null, lon: typeof sp.lon === "number" ? sp.lon : null,
        coordsTexte: sp.coords ?? null, type: sp.type ?? null, zone: sp.zone ?? null, dangerLevel: sp.dangerLevel ?? null,
        tidePort: sp.tidePort ?? null, champs: Object.keys(sp).sort(), empreinte: sha(json(sp)),
      });
    }
  }
  return { guides, lignes };
}

function inventaire(lignes, sauvegardeSha) {
  const frequence = {};
  for (const l of lignes) for (const k of l.champs) frequence[k] = (frequence[k] || 0) + 1;
  const ids = lignes.map((l) => l.id);
  return {
    "//": "Inventaire des spots V2 (phase 5, 5.1). Régénéré par scripts/inventaire-spots-v2.mjs ; vérifié par --verifier dans npm test.",
    reference: { ...REF_GIT, sauvegarde: "data/spots/v2/sauvegarde.json", sauvegardeSha256: sauvegardeSha },
    totaux: {
      spots: lignes.length, guides: new Set(lignes.map((l) => l.guide)).size, identifiantsUniques: new Set(ids).size,
      parGuide: Object.fromEntries([...new Set(lignes.map((l) => l.guide))].map((g) => [g, lignes.filter((l) => l.guide === g).length])),
    },
    anomalies: {
      sansCoordonneesNumeriques: lignes.filter((l) => l.lat == null || l.lon == null).map((l) => ({ id: l.id, guide: l.guide, coordsTexte: l.coordsTexte })),
      identifiantsEnDouble: ids.filter((v, i) => ids.indexOf(v) !== i),
      champsRares: Object.entries(frequence).filter(([, n]) => n < lignes.length).sort((a, b) => a[1] - b[1]).map(([k, n]) => ({ champ: k, spots: n })),
    },
    spots: lignes,
  };
}

const { guides, lignes } = await lire();
const sauvegarde = JSON.stringify({ "//": "Sauvegarde logique des spots V2 (phase 5, 5.1) : copie exacte, JSON canonique. Ne pas modifier.", reference: REF_GIT, guides }, null, 1) + "\n";
const inv = JSON.stringify(inventaire(lignes, sha(sauvegarde)), null, 1) + "\n";

if (process.argv.includes("--verifier")) {
  const ecarts = [];
  const avant = JSON.parse(fs.readFileSync(F_INV, "utf8"));
  if (fs.readFileSync(F_SAUV, "utf8") !== sauvegarde) ecarts.push("la sauvegarde ne correspond plus aux guides V2 (ou a été modifiée)");
  if (sha(fs.readFileSync(F_SAUV, "utf8")) !== avant.reference.sauvegardeSha256) ecarts.push("empreinte de la sauvegarde différente de celle de l'inventaire");
  const maintenant = new Map(lignes.map((l) => [l.id, l]));
  for (const a of avant.spots) {
    const m = maintenant.get(a.id);
    if (!m) { ecarts.push(`spot V2 disparu : ${a.id} (${a.guide})`); continue; }
    for (const k of ["guide", "name", "lat", "lon", "coordsTexte"]) if (JSON.stringify(a[k]) !== JSON.stringify(m[k])) ecarts.push(`${a.id} : ${k} changé (${JSON.stringify(a[k])} → ${JSON.stringify(m[k])})`);
    if (a.empreinte !== m.empreinte) ecarts.push(`${a.id} : contenu changé (empreinte)`);
  }
  for (const id of maintenant.keys()) if (!avant.spots.some((a) => a.id === id)) ecarts.push(`spot V2 ajouté hors inventaire : ${id}`);
  for (const e of ecarts) console.error(`✗ ${e}`);
  console.log(`[spots V2] ${avant.spots.length} spots inventoriés, sauvegarde et guides comparés : ${ecarts.length ? `${ecarts.length} écart(s)` : "identiques"}`);
  process.exit(ecarts.length ? 1 : 0);
}

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(F_SAUV, sauvegarde);
fs.writeFileSync(F_INV, inv);
const i = JSON.parse(inv);
console.log(`[spots V2] ${i.totaux.spots} spots, ${i.totaux.guides} guides, ${i.totaux.identifiantsUniques} identifiants uniques ; sans coordonnées numériques : ${i.anomalies.sansCoordonneesNumeriques.length}`);
