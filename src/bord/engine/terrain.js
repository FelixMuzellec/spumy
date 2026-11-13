// Corrections de terrain validées par le pêcheur (onglet Photos), appliquées aux fiches. Module séparé de photo.js
// (v8.14) : l'accueil en a besoin pour noter les spots comme le guide, sans embarquer l'analyse photo.
import { SITE } from "SITE_CONFIG";
import { terrainOf } from "./model.js";

export const TERRAIN_KEY = "bar:terrain:" + SITE.id;
/** Fiches corrigées sur le terrain : renvoie de NOUVEAUX spots, sans jamais modifier les fiches d'origine. */
export function withTerrainOverrides(spots, overrides) {
  return spots.map((s) => {
    const o = overrides?.[s.id];
    if (!o) return s;
    const t = { ...terrainOf(s) };
    for (const k of ["encombrement", "gratter", "couches"]) if (o[k] != null) t[k] = o[k];
    // Profondeur donnée sur place : classe ou mètres à mi-marée.
    if (o.prof && (o.prof.cls || o.prof.m > 0)) {
      t.prof = o.prof.m > 0 ? { m: +o.prof.m, fromUser: true, why: `Donnée par toi : ${String(o.prof.m).replace(".", ",")} m à mi-marée.` }
        : { cls: o.prof.cls, fromUser: true, why: "Classe choisie par toi sur place." };
    }
    const champs = ["encombrement", "gratter", "couches", "prof"].filter((k) => o[k] != null);
    if (!champs.length) return s;
    t.corrige = { at: o.at, from: o.from, champs, src: o.src || null };
    return { ...s, terrain: t };
  });
}
