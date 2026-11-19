// Moteur BORD v2 (phase 7) — valeurs de départ et réglages de l'appareil, sans fiche de guide : lus par le moteur
// (v2.js), par l'accueil et par les réglages. Chaque valeur est une HYPOTHÈSE de départ de la spécification v2
// (docs/SPEC-MOTEUR-BORD-V2.md, sections 4 à 8), à éprouver en phase 8.
import { BOX_KEY } from "./tackle.js";

export const V2 = {
  maree: { prime: 25, bon: 15, coef: 20 },                 // C1 (fenêtre) et C2 (coefficient) : 45 points
  lumiere: { aube: 25, crepuscule: 25, nuit: 15, jour: 5, couvert: 3, merFormee: 3 },   // C3 : 25 ; plein jour 5 à 11
  vent: 30,                                                // C4 : tableau VENT_MER
  minCouverture: 0.5,                                      // sous la moitié des critères : pas de note (pastille vide)
  bands: [75, 65, 55, 45],                                 // paliers de favorabilité (cinq), recalés en phase 8 sur les journées réelles
  bon: 65,                                                 // « favorable » : les deux paliers du haut
  egalite: 3,                                              // écart sous lequel deux spots sont annoncés à égalité
  pert: { seuil: 50, couverture: 50, remplacant: 30, aucun: 10, poids: 25, poidsProche: 12, distance: 25 },
  trajetMax: 45,                                           // minutes : réglage (question 3 de la phase 6, sans réponse)
  conf: { age: 15, echeance: 10, couverture: 15, modeles: 20, preuves: 25, journal: 15, haute: 70, moyenne: 40 },
  journal: { sessions: 5, prises: 2, max: 10 },            // apprentissage personnel : ±10, à partir de 5 sessions dont 2 prises
  // Phase 8 — réglages de l'épreuve Monte Carlo (scripts/epreuve-mc.mjs), neutres dans l'application :
  //   coefShift : déplace la plage utile du coefficient (±10 points) ; ventAmp : amplitude du tableau VENT_MER autour
  //   du calme (1 = tableau tel quel) ; kSeason, kThermal : multiplient ce que la saison et l'eau retirent à la présence.
  mc: { coefShift: 0, ventAmp: 1, kSeason: 1, kThermal: 1 },
};

/** Palier de favorabilité : 5 (75 et plus) à 1 (moins de 45) ; null sans note. */
export function bandOf(v) {
  if (v == null || !Number.isFinite(v)) return null;
  const [a, b, c, d] = V2.bands;
  return v >= a ? 5 : v >= b ? 4 : v >= c ? 3 : v >= d ? 2 : 1;
}

// Réglages de l'appareil lus par le moteur v2 (communs à tous les guides) : la boîte est-elle l'inventaire complet,
// temps de trajet maximal. Sans réglage : boîte « à compléter » (la pertinence ne filtre pas), 45 min.
export const BOX_COMPLETE_KEY = "bar:boite-complete", TRAJET_KEY = "bar:trajet-max";
export function loadV2Prefs() {
  const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  let boxOv = {};
  try { boxOv = JSON.parse(get(BOX_KEY) || "{}") || {}; } catch { boxOv = {}; }
  const tm = parseInt(get(TRAJET_KEY), 10);
  return { boxOv, boxComplete: get(BOX_COMPLETE_KEY) === "1", trajetMax: Number.isFinite(tm) && tm >= 5 && tm <= 600 ? tm : V2.trajetMax };
}
export function saveV2Pref(key, v) {
  try { if (v == null || v === false) localStorage.removeItem(key); else localStorage.setItem(key, v === true ? "1" : String(v)); return true; } catch { return false; }
}

