// Jetons de design : nommés une fois, utilisés partout (lot 3.7).
//
// Phase 12 (v10) : la charte de la phase 11 (docs/DIRECTION-ARTISTIQUE.md) appliquée à l'application. Bleu nuit
// « Nuit marine » tiré de la maquette de référence de Félix, cyan pour l'action, orange et crème de ses logos pour la
// marque. Une couleur écrite en dur ailleurs que dans src/design/ est comptée par tests/layers.mjs : ce compte ne peut
// que baisser. Contrastes (texte sur les cartes) : texte 13,6:1, secondaire 7,5:1, tertiaire 6,3:1, cyan 8,9:1.

/** Couleurs (thème « Nuit marine », celui de l'application ; le thème « plein soleil » est dans theme.js). */
export const color = {
  // Fonds et surfaces
  bg: "#071427",        // fond de l'application
  page: "#071427",      // fond de la page (html, body), barre du navigateur
  card: "#0e2139",      // carte, tuile, bloc repliable
  card2: "#0a1b31",     // creux (sous-onglets, champs)
  line: "#22405f",      // bordure courante
  line2: "#1a3350",     // séparateur de lignes dans une carte
  segment: "#1e3b60",   // segment choisi des sous-onglets
  track: "#1a3350",     // fond de la jauge de note
  // Texte
  text: "#e3ecf5",      // texte courant
  strong: "#f3f8fc",    // titres, valeurs
  muted: "#9fb3c8",     // texte secondaire
  faint: "#8ea3bb",     // texte tertiaire (source, note non proposée) : contraste AA sur card
  dim: "#7a8fa6",       // pas de note
  underline: "#4d6a8a", // soulignement des liens de source
  // Sens
  accent: "#1fd2f5",    // action, lien, focus (cyan de la référence)
  accent2: "#2a9df4",   // fin du dégradé des boutons principaux
  accentInk: "#7ee7ff", // texte cyan sur fond sombre (onglet actif)
  onAccent: "#032036",  // texte sur un bouton cyan
  good: "#35e07c",      // favorable (note ≥ 7), succès
  warn: "#ffc53d",      // moyen (note ≥ 5), attention, « à vérifier »
  bad: "#ff7a7a",       // défavorable, erreur, danger
  violet: "#b9a4ff",    // journal
  // Marque (logos de Félix) : jamais pour un statut ni une alerte
  brand: "#d9772f",     // orange du disque SPUMY et du soleil
  cream: "#efe7d8",     // crème des logos
  navy: "#14283c",      // bleu marine des logos
};

/** Typographie : une famille, une échelle de tailles (px). */
export const font = {
  family: "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
  display: "'Roboto Condensed',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif", // titres et chiffres (auto-hébergée)
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

/** Seuils de couleur d'une note sur 10 (moteur v1, et note du mode BATEAU). */
export const scoreBands = { good: 7, fair: 5 };

/**
 * Phase 7 — Pastilles du moteur v2 (spécification v2, §8). La couleur de remplissage dit la favorabilité, en cinq
 * paliers d'une seule teinte (bleu), du plus faible au plus fort : sur le fond sombre, le plus fort est le plus clair.
 * Ni vert, ni orange, ni rouge : la sécurité a sa propre forme (contour pointillé et « ? » : à vérifier ; pastille
 * grise barrée : non recommandé ; pastille vide : pas de note). Rampe contrôlée (luminosité monotone, écarts visibles,
 * palier le plus sombre à 2:1 sur le fond des cartes, cerné d'un anneau du fond) ; le chiffre reste écrit en couleur de texte, jamais en bleu.
 */
export const favBands = ["#184f95", "#256abf", "#3987e5", "#6da7ec", "#b7d3f6"];
export const pastille = { nr: "#64748b", nrBar: "#e3ecf5", none: "#64748b", verify: "#ffc53d", ring: "#071427" };
