// v9.2 — Ce qui fait la note, regroupé par famille pour la comparaison des spots.
//
// La note d'un créneau est une somme de termes (parts) écrits par scoreWindow : coefficient, vent, rafales,
// ciel, lumière, saison ou eau, pression, journal, créneau prime. On les regroupe ici en quatre familles
// lisibles, sans rien recalculer : la barre de chaque famille est exactement la somme de ses termes, en points
// de note (positive : la famille aide ; négative : elle freine).

export const FACTOR_FAMILIES = [
  ["maree", "Marée"],
  ["vent", "Vent"],
  ["lumiere", "Lumière"],
  ["saison", "Saison et eau"],
];
const familyOf = (k) => {
  const s = String(k || "");
  if (/^Coef\b/.test(s) || s === "Fenêtre prime") return "maree";
  if (/^Vent\b|^Rafales\b/.test(s)) return "vent";
  if (/^Saison\b|^Eau\b/.test(s)) return "saison";
  if (/^Pression\b|^Journal\b/.test(s)) return "autre";
  return "lumiere";                     // ciel et terme de lumière (aube, crépuscule, nuit, plein soleil)
};

/**
 * parts → [{ key, label, v }] pour les quatre familles, dans l'ordre ; v en points de note, arrondi au dixième.
 * Phase 7 — moteur v2 : on passe la favorabilité du créneau (f) ; v = points gagnés sur 100 par la marée (fenêtre et
 * coefficient), le vent et la mer, la lumière, et, pour « saison et eau », ce que la présence du bar retire (négatif).
 */
export function factorGroups(parts) {
  if (parts && !Array.isArray(parts) && Array.isArray(parts.crit)) {
    const f = parts, pts = (ks) => f.crit.filter((c) => ks.includes(c.k)).reduce((a, c) => a + c.pts, 0);
    const scale = f.couverture > 0 ? 1 / f.couverture : 1;       // points ramenés sur 100 quand un critère manque
    const v = { maree: pts(["fenetre", "coef"]) * scale, vent: pts(["vent"]) * scale, lumiere: pts(["lumiere"]) * scale,
                saison: -(f.cond ?? 0) * (1 - (f.pres?.factor ?? 1)) };
    return FACTOR_FAMILIES.map(([key, label]) => ({ key, label, v: Math.round(v[key]) }));
  }
  const sum = Object.fromEntries(FACTOR_FAMILIES.map(([k]) => [k, 0]));
  for (const p of parts || []) {
    if (!p || !Number.isFinite(p.v)) continue;
    const f = familyOf(p.k);
    if (f in sum) sum[f] += p.v;
  }
  return FACTOR_FAMILIES.map(([key, label]) => ({ key, label, v: Math.round(sum[key] * 10) / 10 }));
}
