// Phase 6 V3 — architectures candidates de la Favorabilité BORD (PROVISOIRES, hors application).
// Toutes partent des mêmes composantes, calculées par le vrai moteur V2 (`favorability` de src/bord/engine/v2.js) :
// critères de conditions (points, maximum, critères exclus) et présence (saison, eau). Seule la façon de les combiner
// et de publier change. Aucune n'est calibrée sur une vérité terrain : elles se comparent en structure et en robustesse.

/** Paliers de Favorabilité V2 (75, 65, 55, 45), gardés jusqu'à la phase 8 V3 (registre des décisions). */
export const PALIERS = [75, 65, 55, 45];
export const palier = (v) => (v == null ? null : v >= 75 ? 5 : v >= 65 ? 4 : v >= 55 ? 3 : v >= 45 ? 2 : 1);

/** Les quatre critères de conditions V2 et leur maximum (C1 à C4). */
export const MAX = { fenetre: 25, coef: 20, lumiere: 25, vent: 30 };

/**
 * Composantes d'un créneau, depuis la sortie de `favorability` : points connus par critère, critères exclus,
 * présence (facteur et sa part saison).
 */
export function composantes(f) {
  const pts = {}, exclus = new Set(f.excluded.map((e) => e.k));
  for (const c of f.crit) pts[c.k] = c.pts;
  return { pts, exclus, presence: f.pres.factor, saison: f.pres.season.factor, eauConnue: !!f.pres.thermal };
}

/**
 * B-V2, la baseline à auditer : arrondi(Conditions × Présence), Conditions renormalisées sur les critères connus.
 * `echelle` : multiplicateurs des points d'un critère (analyse de sensibilité) ; `kPresence` rapproche ou éloigne la
 * présence de 1 (même convention que V2.mc.kSeason).
 */
export function bV2(c, { echelle = {}, kPresence = 1 } = {}) {
  let got = 0, max = 0;
  for (const [k, m] of Object.entries(MAX)) {
    if (c.exclus.has(k) || c.pts[k] == null) continue;
    const e = echelle[k] ?? 1;
    got += c.pts[k] * e; max += m * e;
  }
  if (max === 0 || max / 100 < 0.5) return { valeur: null };
  const p = Math.max(0.3, Math.min(1, 1 - (1 - c.presence) * kPresence));
  return { valeur: Math.round((got / max) * 100 * p) };
}

/** B-simple, la baseline la plus simple : calendrier (présence de saison seule) × (fenêtre de marée + lumière). */
export function bSimple(c) {
  if (c.exclus.has("lumiere") || c.pts.fenetre == null || c.pts.lumiere == null) return { valeur: null };
  return { valeur: Math.round(((c.pts.fenetre + c.pts.lumiere) / (MAX.fenetre + MAX.lumiere)) * 100 * c.saison) };
}

/** Plancher de la présence V2 : borne basse de P quand l'eau est inconnue et qu'aucune climatologie sourcée ne la resserre (D6-03). */
export const PRESENCE_PLANCHER = 0.3;

/**
 * A1 — mêmes composantes, sans imputation : un critère manquant donne un intervalle (critère à 0 ou à son maximum),
 * jamais une renormalisation ; une eau inconnue donne P entre le plancher et la saison (D6-03). La note n'existe que si
 * tout est connu (largeur 0) : c'est alors elle qui est publiée et qui sert au rang. Sinon : fourchette jusqu'à
 * `largeurMax` points, qualitatif au-delà, « — » sous la moitié des maximums connue.
 */
export function a1(c, { largeurMax = 20 } = {}) {
  let got = 0, manque = 0;
  for (const [k, m] of Object.entries(MAX)) {
    if (c.exclus.has(k) || c.pts[k] == null) manque += m; else got += c.pts[k];
  }
  const pHaut = c.eauConnue === false ? c.saison : c.presence, pBas = c.eauConnue === false ? Math.min(PRESENCE_PLANCHER, pHaut) : c.presence;
  const bas = Math.round(got * pBas), haut = Math.round((got + manque) * pHaut);
  const largeur = haut - bas;
  const publication = manque > 50 ? "aucune" : largeur === 0 ? "nombre" : largeur <= largeurMax ? "fourchette" : "qualitatif";
  return { valeur: largeur === 0 && manque <= 50 ? bas : null, bas, haut, largeur, publication };
}

/**
 * A2 — ordinal : la disponibilité biologique d'abord (présence forte ≥ 0,9, moyenne ≥ 0,6, faible sinon), puis les
 * conditions (bonnes ≥ 70, moyennes ≥ 45, faibles sinon). Rang lexicographique, sans nombre : 9 cases ordonnées.
 */
export function a2(c) {
  const v = bV2(c, { kPresence: 0 }).valeur;   // conditions seules (présence ramenée à 1)
  if (v == null) return { valeur: null, classe: null };
  const d = c.presence >= 0.9 ? 2 : c.presence >= 0.6 ? 1 : 0, k = v >= 70 ? 2 : v >= 45 ? 1 : 0;
  return { valeur: d * 3 + k, classe: `${["faible", "moyenne", "forte"][d]} disponibilité, conditions ${["faibles", "moyennes", "bonnes"][k]}` };
}

/**
 * A3 — structure probabiliste ZIP non calibrée (illustration de § 9.1.8) : ψ ← présence (proxy), Λ = E λ₀ exp(β (C − 50) / 25),
 * P(Y ≥ 1) = ψ (1 − e^(−Λ)). Paramètres d'illustration, sans valeur prédictive : seule la forme est comparée.
 */
export function a3(c, { E = 2, lambda0 = 0.3, beta = 1 } = {}) {
  const C = bV2(c, { kPresence: 0 }).valeur;
  if (C == null) return { valeur: null };
  const L = E * lambda0 * Math.exp(beta * (C - 50) / 25);
  return { valeur: c.presence * (1 - Math.exp(-L)), Lambda: L };
}

/** Rangs moyens (ex æquo partagés) puis corrélation de Spearman entre deux séries appariées sans valeurs nulles. */
export function spearman(xs, ys) {
  const ok = xs.map((x, i) => [x, ys[i]]).filter(([x, y]) => x != null && y != null);
  const rang = (v) => { const o = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]); const r = new Array(v.length);
    for (let i = 0; i < o.length;) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (let t = i; t <= j; t++) r[o[t][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
  const a = rang(ok.map((p) => p[0])), b = rang(ok.map((p) => p[1])), n = ok.length;
  const ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return da && db ? num / Math.sqrt(da * db) : null;
}
