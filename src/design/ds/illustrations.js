// Couleurs des dessins (phase 11) : robes des leurres dessinés et fond de la carte. Elles restent ici, dans la couche
// design, pour que les écrans n'aient aucune couleur en dur (tests/layers.mjs). Réservées aux illustrations : jamais
// pour un texte, un statut ou une action (ceux-là passent par tokens.css).

/** Robe d'un leurre d'après le nom du coloris de ta boîte (dos, flanc, ventre, motif). */
export const ROBES = {
  "ghost iwashi": { back: "#5aa9d6", mid: "#cfe9f7", belly: "#f4fbff", spot: "#2c6f9e", tr: 0.82 },
  "blanc": { back: "#e9eef3", mid: "#f6f8fa", belly: "#ffffff", spot: "#c9d3dc" },
  "blanc nacré": { back: "#e7e1f2", mid: "#f5f2fb", belly: "#ffffff", spot: "#c7bfe0", pearl: true },
  "cabot": { back: "#55606a", mid: "#a6b0b8", belly: "#eef1f3", spot: "#2f363c" },
  "anchois": { back: "#2f6b78", mid: "#9cc8cf", belly: "#f1f7f8", spot: "#1f4b55" },
  "mackerel": { back: "#1f6b4f", mid: "#8fc7b1", belly: "#f2f7f5", spot: "#0e3b2b", tiger: true },
  // Coloris non renseigné dans ta boîte : robe neutre « sardine » (bleu-argent), sans prétendre que c'est la tienne.
  "default": { back: "#1d57b5", mid: "#8fbdf0", belly: "#f1f6fc", spot: "#0f346f" },
  "lancon": { back: "#6d7f3d", mid: "#c7cf9a", belly: "#f6f6e8", spot: "#3d4a1f" },
};

/** Détails communs des leurres : reflet, métal du jig, œil, pupille, hameçons. */
export const LEURRE = { reflet: "#ffffff", metal: ["#dfe9f2", "#8fa7bc", "#f5f9fc"], oeil: "#f6d34a", pupille: "#0b0b0b", hamecon: "#9aa6b2" };

/** Carte (thème Nuit marine ; Plein soleil la recolore en CSS) : mer en dégradé, terre, trait de côte lumineux. */
export const CARTE = { mer: ["#0b3155", "#071f3a", "#05172b"], terre: ["#30465f", "#22364c"], cote: "#5fc8f0" };
