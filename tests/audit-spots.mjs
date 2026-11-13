// Audit des données de chaque spot (phase 4, lecture seule) : niveau de preuve, sources, position, marée, limites.
//   node tests/audit-spots.mjs [--json <fichier>]
// Ne modifie rien : lit data/sites/*.config.js (données et commentaires) et imprime un tableau par guide.
import fs from "node:fs";
import path from "node:path";
import { SITES } from "../scripts/sites.mjs";
import { loadSite } from "../scripts/site-data.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const rows = [];
const count = (arr, v) => arr.filter((x) => x === v).length;
for (const s of SITES) {
  const m = await loadSite(s.config);
  const text = fs.readFileSync(path.join(root, s.config), "utf8");
  for (const sp of m.SPOTS) {
    // Bloc de texte de la fiche (de « id: "<id>" » au spot suivant) : pour les mentions « à confirmer ».
    const i = text.indexOf(`id: "${sp.id}"`) >= 0 ? text.indexOf(`id: "${sp.id}"`) : text.indexOf(`id:"${sp.id}"`);
    const next = text.indexOf("\n  {", i + 10);
    const block = i >= 0 ? text.slice(i, next > 0 ? next : undefined) : "";
    const conf = [sp.terrain.confidence, ...Object.values(sp.topology).map((x) => x.confidence)];
    const port = sp.tidePort || m.SITE.tide.defaultPort, P = m.SITE.tide.ports[port];
    rows.push({
      guide: s.key, id: sp.id, name: sp.name, zone: m.SITE.zones[sp.zone]?.sea, danger: sp.dangerLevel,
      verified: count(conf, "verified"), inference: count(conf, "inference"), local: count(conf, "local_knowledge"),
      sources: sp.sources.length, faits: sp.terrain.faits?.length || 0, securite: sp.securite.length,
      position: Number.isFinite(sp.lat) ? "précise" : "degrés-minutes", port: `${port} (${P?.kind})`,
      houleMax: sp.houleMax, coefBand: sp.coefBand.join("/"), coefHardMax: sp.coefHardMax ?? "",
      aConfirmer: (block.match(/[àa] confirmer|à vérifier|non vérifi|hypoth/gi) || []).length,
      prof: sp.terrain.prof.cls,
    });
  }
}
const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
console.log(`${rows.length} spots, ${SITES.length} guides`);
console.log(`niveaux de preuve (terrain + 5 rubriques de topographie, ${rows.length * 6} au total) : vérifié ${sum("verified")}, déduit ${sum("inference")}, connaissance locale ${sum("local")}`);
console.log(`spots sans aucune rubrique vérifiée : ${rows.filter((r) => r.verified === 0).length}`);
console.log(`positions : ${rows.filter((r) => r.position === "précise").length} précises, ${rows.filter((r) => r.position !== "précise").length} en degrés-minutes seulement`);
console.log(`sources par spot : min ${Math.min(...rows.map((r) => r.sources))}, médiane ${rows.map((r) => r.sources).sort((a, b) => a - b)[Math.floor(rows.length / 2)]}, max ${Math.max(...rows.map((r) => r.sources))}`);
console.log(`consignes de sécurité par spot : ${rows.filter((r) => r.securite === 0).length} spots sans aucune, médiane ${rows.map((r) => r.securite).sort((a, b) => a - b)[Math.floor(rows.length / 2)]}`);
console.log(`mentions « à confirmer / à vérifier / hypothèse » dans les commentaires : ${sum("aConfirmer")} (sur ${rows.filter((r) => r.aConfirmer).length} spots)`);
console.log(`limite de courant documentée (coefHardMax) : ${rows.filter((r) => r.coefHardMax !== "").length} spots`);
const kinds = {}; for (const r of rows) { const k = r.port.match(/\((\w+)\)/)?.[1]; kinds[k] = (kinds[k] || 0) + 1; }
console.log(`ports de marée des spots : ${Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(", ")}`);
console.log(`spots engagés (niveau 3) : ${rows.filter((r) => r.danger === 3).length} ; côte ouverte : ${rows.filter((r) => r.zone === "open").length}, rade : ${rows.filter((r) => r.zone === "rade").length}`);
const by = {}; for (const r of rows) { by[r.guide] ||= { n: 0, v: 0, i: 0, l: 0, z: 0 }; const b = by[r.guide]; b.n++; b.v += r.verified; b.i += r.inference; b.l += r.local; b.z += r.verified === 0 ? 1 : 0; }
for (const [g, b] of Object.entries(by)) console.log(`  ${g.padEnd(13)} ${String(b.n).padStart(2)} spots · vérifié ${b.v} · déduit ${b.i} · local ${b.l} · spots sans rubrique vérifiée ${b.z}`);
const j = process.argv.indexOf("--json");
if (j > 0) fs.writeFileSync(process.argv[j + 1], JSON.stringify(rows, null, 1));
