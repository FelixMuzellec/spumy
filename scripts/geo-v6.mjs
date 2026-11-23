// Prototype V6 — génère src/prototype-v3/geo.js : le trait de côte réel de la côte ouest du Cotentin, projeté dans le
// repère de la carte du prototype.
// Source : IGN Admin Express COG 2018 (licence ouverte Etalab), contours du département de la Manche convertis et
// simplifiés par le projet france-geojson (https://github.com/gregoiredavid/france-geojson).
// Usage : curl -sSo /chemin/manche.geojson https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements/50-manche/departement-50-manche.geojson
//         node scripts/geo-v6.mjs /chemin/manche.geojson
// Aucune courbe de profondeur n'est produite : il n'y en aura qu'avec des données réelles (V3-028).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = process.argv[2];
if (!src) { console.error("usage : node scripts/geo-v6.mjs <manche.geojson>"); process.exit(1); }

// Emprise : de Granville au nord de Surtainville, de la mer au bocage. Repère : 1 000 unités par degré de latitude.
const BOX = { west: -1.98, east: -1.38, north: 49.52, south: 48.78 };
const LAT0 = (BOX.north + BOX.south) / 2, KX = Math.cos((LAT0 * Math.PI) / 180) * 1000, KY = 1000;
const W = Math.round((BOX.east - BOX.west) * KX), H = Math.round((BOX.north - BOX.south) * KY);
const proj = ([lon, lat]) => [(lon - BOX.west) * KX, (BOX.north - lat) * KY];

// Découpage d'un anneau par le rectangle (Sutherland-Hodgman), avec une marge pour ne pas voir le bord.
const M = 30, edges = [
  [(p) => p[0] >= -M, (a, b) => [-M, a[1] + ((b[1] - a[1]) * (-M - a[0])) / (b[0] - a[0])]],
  [(p) => p[0] <= W + M, (a, b) => [W + M, a[1] + ((b[1] - a[1]) * (W + M - a[0])) / (b[0] - a[0])]],
  [(p) => p[1] >= -M, (a, b) => [a[0] + ((b[0] - a[0]) * (-M - a[1])) / (b[1] - a[1]), -M]],
  [(p) => p[1] <= H + M, (a, b) => [a[0] + ((b[0] - a[0]) * (H + M - a[1])) / (b[1] - a[1]), H + M]],
];
function clip(ring) {
  let out = ring;
  for (const [inside, cut] of edges) {
    const pts = out; out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b); } else if (inside(a)) out.push(cut(a, b));
    }
    if (!out.length) break;
  }
  return out;
}

const gj = JSON.parse(fs.readFileSync(src, "utf8"));
const geom = gj.geometry || gj.features[0].geometry;
const polys = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
const r1 = (v) => Math.round(v * 10) / 10;
let points = 0;
const d = polys.map((poly) => poly.map((ring) => clip(ring.map(proj))).filter((r) => r.length > 2)
  .map((r) => { points += r.length; return "M" + r.map((p) => `${r1(p[0])},${r1(p[1])}`).join("L") + "Z"; }).join("")).filter(Boolean).join("");

const out = `// FICHIER GÉNÉRÉ par scripts/geo-v6.mjs : ne pas modifier à la main.
// Trait de côte réel : IGN Admin Express COG 2018, licence ouverte Etalab, via france-geojson (simplifié). ${points} points.
export const GEO = Object.freeze({
  box: ${JSON.stringify(BOX)},
  width: ${W}, height: ${H}, lat0: ${LAT0}, kx: ${KX.toFixed(4)}, ky: ${KY},
  land: ${JSON.stringify(d)},
  source: "Trait de côte : IGN Admin Express 2018 (licence ouverte), simplifié",
});
/** Latitude et longitude en degrés décimaux → point du repère de la carte. */
export const project = (lat, lon) => ({ x: (lon - GEO.box.west) * GEO.kx, y: (GEO.box.north - lat) * GEO.ky });
/** « 49°01'N 1°35'W » ou « 48°50,0'N 1°36,9'W » → { lat, lon } en degrés décimaux. */
export function parseDM(s) {
  const m = String(s).match(/(\\d+)°(\\d+(?:[.,]\\d+)?)'([NS])\\s+(\\d+)°(\\d+(?:[.,]\\d+)?)'([EW])/);
  if (!m) return null;
  const v = (d, mn, h, neg) => (Number(d) + Number(mn.replace(",", ".")) / 60) * (h === neg ? -1 : 1);
  return { lat: v(m[1], m[2], m[3], "S"), lon: v(m[4], m[5], m[6], "W") };
}
`;
fs.writeFileSync(path.join(root, "src/prototype-v3/geo.js"), out);
console.log(`geo.js : ${W} × ${H}, ${points} points, ${Math.round(out.length / 1024)} Ko`);
