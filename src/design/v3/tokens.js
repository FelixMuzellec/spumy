// SPUMY V3 — jetons de design, source unique (Phase 3, docs/design/DESIGN-SYSTEM-V3.md).
//
// `scripts/tokens-v3.mjs` en tire `src/design/v3/tokens.css` ; `tests/design-v3.mjs` vérifie l'un et l'autre.
// Statuts (référentiel § 6.8) : APPROUVÉ (palette de Félix, § 6.2), PROTÉGÉ (logo BRAND, mesuré),
// RÈGLE (code chromatique des jauges, § 6.7.5.1 : seuils fixés, teintes imposées), PROPOSITION À TESTER (tout le reste).
// Aucune valeur n'est figée avant le jalon 2 (direction visuelle, principes du Design System, prototypes).

/** @typedef {`#${string}`} Hex */

/** Palette principale approuvée (§ 6.2). Statut : APPROUVÉ. */
export const PALETTE = Object.freeze({
  accentOrange: /** @type {Hex} */ ("#F07824"),
  navy: /** @type {Hex} */ ("#172B3A"),
  slate: /** @type {Hex} */ ("#344B5A"),
  offWhite: /** @type {Hex} */ ("#F3F1EB"),
});

/**
 * Jetons de marque protégés (§ 6.1.1, § 6.2.1). Statut : PROTÉGÉ.
 * `brandLogoOrange` est mesuré sur assets/brand/sources/spumy.jpg (docs/design/BRAND-MANIFEST.md, tests/brand.py).
 * Il sert seulement à documenter et à vérifier : le logo s'affiche toujours depuis ses exports, jamais recoloré.
 * Aucun thème ne peut le redéfinir (vérifié par tests/design-v3.mjs).
 */
export const BRAND = Object.freeze({
  brandLogoOrange: /** @type {Hex} */ ("#C76A31"),
  brandFishMark: "assets/brand/v3/spumy-medaillon-*.png",
});

/**
 * Paliers des jauges et des pastilles (§ 6.7.5.1, § 6.7.5.2).
 * Seuils et familles de teintes : RÈGLE du référentiel. Valeurs hexadécimales : PROPOSITION À TESTER,
 * choisies pour séparer les paliers en vision normale (ΔE OKLab ≥ 15) et en vision des couleurs altérée
 * (ΔE ≥ 8,9 en protanopie et deutéranopie), mesures consignées dans DESIGN-SYSTEM-V3.md § 3.
 * Mêmes valeurs dans les deux thèmes : un spot garde la même couleur partout.
 */
export const TIERS = Object.freeze([
  { id: 0, min: 0, max: 19, family: "anthracite", word: "Très faible", hex: /** @type {Hex} */ ("#2B3034") },
  { id: 1, min: 20, max: 39, family: "rouge", word: "Faible", hex: /** @type {Hex} */ ("#A82E2A") },
  { id: 2, min: 40, max: 59, family: "orange", word: "Moyen", hex: /** @type {Hex} */ ("#F5962A") },
  { id: 3, min: 60, max: 74, family: "jaune", word: "Bon", hex: /** @type {Hex} */ ("#F8D757") },
  { id: 4, min: 75, max: 89, family: "vert", word: "Très bon", hex: /** @type {Hex} */ ("#21915A") },
  { id: 5, min: 90, max: 100, family: "bleu", word: "Excellent", hex: /** @type {Hex} */ ("#2C60C2") },
]);

/**
 * Valeur affichée d'un score sur 100 : entier de 0 à 100, ou null (sans note).
 * Le chiffre, la longueur remplie et la couleur viennent tous de cette valeur (§ 6.7.5.1).
 * @param {unknown} v
 * @returns {number | null}
 */
export function displayValue(v) {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  const r = Math.round(v);
  return r < 0 || r > 100 ? null : r;
}

/**
 * Palier d'un score, ou null s'il n'y a pas de note fiable (pastille neutre, jauge absente).
 * @param {unknown} v
 */
export function tierOf(v) {
  const d = displayValue(v);
  if (d === null) return null;
  return TIERS.find((t) => d >= t.min && d <= t.max) ?? null;
}

/**
 * Largeur remplie de la jauge, en pour cent : la valeur affichée elle-même, sans arrondi visuel.
 * @param {unknown} v
 */
export function gaugeWidth(v) {
  const d = displayValue(v);
  return d === null ? 0 : d;
}

/**
 * Libellé principal de la Favorabilité (PROPOSITION, UX-V3 § 8) : le statut s'il y en a un, sinon le mot du palier.
 * « 53/100 — À vérifier » (fixture § 6.7.2) ; « 72/100 — Bon ».
 * @param {unknown} v
 * @param {{ status?: "verify" | "nr" | null }} [o]
 */
export function favorabilityLabel(v, o = {}) {
  const d = displayValue(v);
  const t = tierOf(v);
  const word = o.status === "verify" ? "À vérifier" : o.status === "nr" ? "Non recommandé" : t ? t.word : "Sans note";
  return d === null ? word : `${d}/100 — ${word}`;
}

/**
 * Libellé de la Confiance : le niveau vient du moteur (Haute, Moyenne, Faible), jamais du palier de couleur.
 * « 69/100 — Moyenne » (fixture § 6.7.2).
 * @param {unknown} v
 * @param {"Haute" | "Moyenne" | "Faible"} level
 */
export function confidenceLabel(v, level) {
  const d = displayValue(v);
  return d === null ? "Confiance inconnue" : `${d}/100 — ${level}`;
}

/**
 * Thèmes. Clair (« plein jour ») et sombre (« nuit marine ») ; par défaut, celui du système.
 * Statut : PROPOSITION À TESTER, sauf les valeurs de la palette approuvée qu'ils réutilisent.
 * Chaque clé devient une variable CSS `--<clé en kebab-case>`.
 */
const LIGHT = {
  bgApp: PALETTE.offWhite, // fond de lecture (approuvé)
  surfaceCard: "#FBFAF7", // carte posée sur le fond
  surfaceSunken: "#E9E5DC", // champ, piste de jauge, zone repliée
  surfaceInverse: PALETTE.navy, // barre de navigation, en-têtes forts
  textPrimary: PALETTE.navy,
  textSecondary: PALETTE.slate,
  textMuted: "#56656F",
  textOnInverse: PALETTE.offWhite,
  textOnAccent: PALETTE.navy, // texte sur l'orange : 5,1:1
  border: "#D3CEC3",
  borderStrong: "#7A848B",
  accent: PALETTE.accentOrange, // remplissage d'action, repère actif ; jamais en texte sur fond clair (2,5:1)
  accentInk: PALETTE.navy, // lien et icône active sur fond clair (l'orange n'y atteint pas 3:1)
  focusRing: PALETTE.navy,
  gaugeTrack: "#DDD8CE",
  // Repère de valeur : trait de 2 px au bout de la portion remplie. Certains paliers se confondent avec la piste
  // (jaune sur piste claire 1,0:1) ; le repère garde la position lisible sans découper le remplissage.
  gaugeIndex: PALETTE.navy,
  successInk: "#2F6B45", successSoft: "#E1ECE2",
  warningInk: "#7F5300", warningSoft: "#F5E7C4",
  dangerInk: "#A12C26", dangerSoft: "#F5DDD9",
  infoInk: PALETTE.slate, infoSoft: "#E2E6E8",
  markerRingInner: PALETTE.offWhite, markerRingOuter: PALETTE.navy,
  markerEmpty: "#FBFAF7",
  scrim: "rgba(23, 43, 58, 0.45)",
};

const DARK = {
  bgApp: PALETTE.navy, // fond sombre structurant (approuvé)
  surfaceCard: PALETTE.slate, // cartes et panneaux (approuvé)
  surfaceSunken: "#203545",
  surfaceInverse: "#0F1E29",
  textPrimary: PALETTE.offWhite,
  textSecondary: "#D5DADD",
  textMuted: "#B4BEC4",
  textOnInverse: PALETTE.offWhite,
  textOnAccent: PALETTE.navy,
  border: "#4C6372",
  borderStrong: "#8597A3",
  accent: PALETTE.accentOrange,
  accentInk: PALETTE.accentOrange, // sur le marine seulement (5,1:1) ; sur l'ardoise, 3,2:1 : icônes et grands textes
  focusRing: PALETTE.accentOrange,
  gaugeTrack: "#1E3342",
  gaugeIndex: PALETTE.offWhite,
  successInk: "#9BD3AC", successSoft: "#2C4A3C",
  warningInk: "#F2C772", warningSoft: "#4B3F22",
  dangerInk: "#F3A79E", dangerSoft: "#4F2E2E",
  infoInk: "#CBD5DB", infoSoft: "#2B4353",
  markerRingInner: PALETTE.offWhite, markerRingOuter: PALETTE.navy,
  markerEmpty: "#FBFAF7",
  scrim: "rgba(8, 16, 22, 0.6)",
};

export const THEMES = Object.freeze({ light: Object.freeze(LIGHT), dark: Object.freeze(DARK) });

/** Typographie (PROPOSITION À TESTER). Roboto et Roboto Condensed sont déjà embarquées (hors ligne, sans service tiers). */
export const TYPE = Object.freeze({
  fontText: '"Roboto", system-ui, -apple-system, "Segoe UI", sans-serif',
  fontNumeric: '"Roboto Condensed", "Arial Narrow", system-ui, sans-serif',
  // Mot SPUMY : sans-serif géométrique large et gras, comme le mot du logo source (ressemblance INFÉRÉE,
  // aucun fichier de police fourni). Montserrat est la proposition ; à embarquer avant intégration.
  fontBrand: '"Montserrat", "Roboto", system-ui, sans-serif',
  size: { caption: 12, label: 13, small: 14, body: 16, bodyLg: 18, titleS: 18, title: 22, headline: 28, score: 34 },
  lineHeight: { tight: 1.1, snug: 1.25, body: 1.5 },
  weight: { regular: 400, medium: 500, bold: 700, black: 800 },
  brandTracking: "0.12em",
});

/** Espacements (pas de 4), rayons, élévations, mouvement, points de rupture, cibles tactiles (PROPOSITION À TESTER). */
export const SPACE = Object.freeze({ 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 });
export const RADIUS = Object.freeze({ xs: 6, sm: 10, md: 16, lg: 20, pill: 999 });
export const ELEVATION = Object.freeze({
  0: "none",
  1: "0 1px 2px rgba(15, 30, 41, 0.12), 0 2px 8px rgba(15, 30, 41, 0.10)",
  2: "0 2px 6px rgba(15, 30, 41, 0.16), 0 12px 32px rgba(15, 30, 41, 0.22)",
});
export const MOTION = Object.freeze({ fast: 120, base: 200, slow: 280, ease: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
export const BREAKPOINTS = Object.freeze({ min: 320, phone: 375, phoneL: 390, tablet: 600, desktop: 1024 });
export const TOUCH = Object.freeze({ min: 44, main: 52 });
export const LAYOUT = Object.freeze({ gutter: 16, readingMax: 680, desktopList: 400, navHeight: 64 });
