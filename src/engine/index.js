// Point d'entrée du moteur (utilisé par les tests) : tout ce qui ne dépend pas de l'interface.
// La configuration du site (SITE, GENERAL_PRINCIPLES, SPOTS) vient de src/sites/<site>.config.js,
// résolue au moment de la construction : le moteur est strictement commun à tous les guides.
export * from "./core.js";
export * from "./tide.js";
export * from "./model.js";
export * from "./weather.js";
export * from "./persist.js";
export * from "./journal.js";
export * from "./rules.js";
export * from "./lures.js";
export { SITE, SPOTS, GENERAL_PRINCIPLES } from "SITE_CONFIG";
export * from "./photo.js";
export * from "./myspots.js";
export { trendOf } from "./scale.js";
export * from "./offshore.js";
export * from "./safety.js";
export * from "./confidence.js";
export * from "./factors.js";
