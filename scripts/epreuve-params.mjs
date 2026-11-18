// Phase 8 — Entrées et hypothèses perturbées par l'épreuve Monte Carlo (scripts/epreuve-mc.mjs), lues aussi par la synthèse.
// Hypothèses perturbées : nom, niveau de preuve, amplitude relative (selon le niveau), et comment l'appliquer.
export const AMP = { 1: 0, 2: 0.2, 3: 0.3, 4: 0.4, 5: 0.6 };
export const HYP = [
  { k: "poids_fenetre", label: "Poids de la fenêtre de marée (25 / 15)", niveau: 4 },
  { k: "poids_coef", label: "Poids du coefficient (20)", niveau: 4 },
  { k: "plage_coef", label: "Plage utile du coefficient (±10 points)", niveau: 4, abs: 10 },
  { k: "fenetres", label: "Heures des fenêtres de marée (±30 min)", niveau: 4, abs: 0.5 },
  { k: "poids_lumiere", label: "Poids de la lumière (25)", niveau: 4 },
  { k: "nuit", label: "Valeur de la nuit (15 sur 25)", niveau: 4 },
  { k: "jour", label: "Valeur du plein jour (5 à 11 sur 25)", niveau: 4 },
  { k: "poids_vent", label: "Poids du vent et de la mer (30)", niveau: 4 },
  { k: "ampl_vent", label: "Amplitude du tableau vent et mer", niveau: 4 },
  { k: "saison", label: "Facteurs de saison", niveau: 4 },
  { k: "eau", label: "Paliers de température de l'eau", niveau: 4 },
];
export const INPUTS = [
  { k: "in_vent", label: "Force du vent (±1 Beaufort ou écart des modèles)" },
  { k: "in_dir", label: "Direction du vent (±1 secteur)" },
  { k: "in_houle", label: "Houle (±25 %)" },
  { k: "in_eau", label: "Température de l'eau (±1 °C)" },
  { k: "in_maree", label: "Heures de marée (±10 min)" },
];

