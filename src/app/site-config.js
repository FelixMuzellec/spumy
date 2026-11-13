// Lot 3.5 — Fiche du guide ouvert (SITE, GENERAL_PRINCIPLES, SPOTS), lue à l'exécution.
//
// Jusqu'à la v9.2, chaque guide était construit avec sa fiche intégrée (un paquet de 790 Ko par guide).
// Désormais une seule application (app.js) sert les sept guides : entry.jsx télécharge la fiche du guide
// (<guide>.json, produite par la construction depuis data/sites/) AVANT de démarrer le moteur, qui la lit
// ici. Ce module n'est évalué qu'à ce moment-là (import dynamique) : jamais sur l'accueil.
/* global __SPUMY_SITE__ */
const data = typeof __SPUMY_SITE__ !== "undefined" ? __SPUMY_SITE__ : null;
if (!data) throw new Error("Fiche du guide non chargée");
export const SITE = data.SITE;
export const GENERAL_PRINCIPLES = data.GENERAL_PRINCIPLES;
export const SPOTS = data.SPOTS;
