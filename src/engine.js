// Point d'entrée du moteur (utilisé par les tests) : tout ce qui ne dépend pas de l'interface.
// La configuration du site (SITE, GENERAL_PRINCIPLES, SPOTS) vient de data/sites/<site>.config.js,
// résolue au moment de la construction : le moteur est strictement commun à tous les guides.
export * from "./core/core.js";
export * from "./core/tide.js";
export * from "./bord/engine/model.js";
export * from "./bord/engine/weather.js";
export * from "./core/persist.js";
export * from "./bord/engine/journal.js";
export * from "./core/rules.js";
export * from "./bord/engine/lures.js";
export { SITE, SPOTS, GENERAL_PRINCIPLES } from "SITE_CONFIG";
export * from "./bord/engine/photo.js";
export * from "./bord/engine/myspots.js";
export { trendOf } from "./core/scale.js";
export * from "./bateau/offshore.js";
export * from "./bord/engine/safety.js";
export * from "./bord/engine/confidence.js";
export * from "./bord/engine/factors.js";
