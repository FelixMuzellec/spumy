// Phase 5 V3, sous-tâche 5.12 : position des candidats (data/spots/candidats-v3.json) par le géocodage de l'IGN
// (index des toponymes « poi » de la Géoplateforme, Licence Ouverte), filtrée sur le département du candidat.
// Aucune position n'est prise dans une source de pêche. Sortie : une ligne « CANDIDAT <json> » par candidat.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const { candidats } = JSON.parse(fs.readFileSync(path.join(root, "data/spots/candidats-v3.json"), "utf8"));
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function chercher(c, requete) {
  const url = `https://data.geopf.fr/geocodage/search?index=poi&limit=10&q=${encodeURIComponent(requete)}`;
  const res = { erreur: null, toponymes: [] };
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000) });
    const j = r.ok ? await r.json() : null;
    res.erreur = r.ok ? null : `HTTP ${r.status}`;
    res.toponymes = (j?.features || []).map((x) => {
      const p = x.properties || {};
      return { nom: p.toponym || p.name || p.label, categorie: [].concat(p.category || []).join(", "), postcode: [].concat(p.postcode || [])[0] || null,
        commune: [].concat(p.city || [])[0] || null, citycode: [].concat(p.citycode || [])[0] || null, lat: x.geometry?.coordinates?.[1], lon: x.geometry?.coordinates?.[0] };
    }).filter((t) => t.lat != null && String(t.postcode || t.citycode || "").startsWith(c.departement));
  } catch (e) { res.erreur = e?.cause?.code || e?.message; }
  return res;
}
// « requete » d'abord, puis les « autres_requetes » éventuelles (variantes du même nom) : les toponymes sont réunis sans doublon.
for (const c of candidats) {
  const res = { erreur: null, toponymes: [] };
  const vus = new Set();
  for (const q of [c.requete, ...(c.autres_requetes || [])]) {
    const r = await chercher(c, q);
    res.erreur ??= r.erreur;
    for (const t of r.toponymes) { const k = `${t.nom}|${t.lat}|${t.lon}`; if (!vus.has(k)) { vus.add(k); res.toponymes.push(t); } }
    await pause(300);
  }
  console.log(`CANDIDAT ${JSON.stringify({ id: c.id, requete: c.requete, departement: c.departement, ...res })}`);
}
