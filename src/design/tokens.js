// Jetons de design (lot 3.7) : les valeurs de l'interface ACTUELLE, nommées une fois.
//
// Aucun nouveau look ici : chaque valeur est celle que l'interface utilisait déjà (captures d'écran identiques
// avant et après, tests/visual.mjs). La refonte visuelle (phases 11 et 13) changera ces valeurs à cet endroit,
// une fois, partout. Une couleur écrite en dur ailleurs que dans src/design/ est comptée par tests/layers.mjs :
// ce compte ne peut que baisser.

/** Couleurs (thème « nuit », celui de l'application ; le thème « plein soleil » est dans theme.js). */
export const color = {
  // Fonds et surfaces
  bg: "#020c18",        // fond de l'application
  page: "#020617",      // fond de la page (html, body), barre du navigateur
  card: "#0b1626",      // carte, tuile, bloc repliable
  card2: "#071120",     // creux (sous-onglets, champs)
  line: "#1e293b",      // bordure courante
  line2: "#15233a",     // séparateur de lignes dans une carte
  segment: "#1e3a5f",   // segment choisi des sous-onglets
  track: "#1b2b44",     // fond de la jauge de note
  // Texte
  text: "#e2e8f0",      // texte courant
  strong: "#f8fafc",    // titres, valeurs
  muted: "#94a3b8",     // texte secondaire
  faint: "#8a9bb1",     // texte tertiaire (source, note non proposée) : contraste AA sur card
  dim: "#64748b",       // pas de note
  underline: "#475569", // soulignement des liens de source
  // Sens
  accent: "#38bdf8",    // action, lien, focus
  good: "#22c55e",      // favorable (note ≥ 7), succès
  warn: "#f59e0b",      // moyen (note ≥ 5), attention
  bad: "#ef4444",       // défavorable, erreur, danger
  violet: "#a78bfa",    // journal
};

/** Typographie : une famille, une échelle de tailles (px). */
export const font = {
  family: "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
  familySvg: "system-ui,-apple-system,sans-serif",   // textes des graphiques SVG
  size: { xs: 12, sm: 12.5, md: 13, base: 13.5, lg: 14, xl: 14.5, title: 15, h3: 16, h2: 18, h1: 19 },
  weight: { normal: 500, semibold: 600, bold: 700, black: 800 },
  numbers: { fontVariantNumeric: "tabular-nums" },     // chiffres alignés
};

/** Rayons des angles (px). */
export const radius = { segment: 7, sm: 9, md: 10, lg: 12, xl: 14, round: 999 };

/** Cibles tactiles minimales (px) : 44 (recommandation iOS), 48 pour les actions principales. */
export const touch = { min: 44, main: 48 };

/** Durées d'animation (coupées si l'appareil demande moins de mouvement). */
export const motion = { fast: ".15s" };

/** Seuils de couleur d'une note sur 10 (les trois scores sur 100 viendront en phase 7). */
export const scoreBands = { good: 7, fair: 5 };
