// Page d'analyse claude.ai : un seul moteur pour tous les guides. Le moteur importe
// SITE, SPOTS et GENERAL_PRINCIPLES depuis « SITE_CONFIG » ; ici, ce module les fournit
// et les change selon le guide choisi (liaisons vivantes des modules ES).
import * as logonna from "../../data/sites/logonna.config.js";
import * as pirou from "../../data/sites/pirou.config.js";
import * as plouguerneau from "../../data/sites/plouguerneau.config.js";
import * as audierne from "../../data/sites/audierne.config.js";
import * as carantec from "../../data/sites/carantec.config.js";
import * as concarneau from "../../data/sites/concarneau.config.js";
import * as crozon from "../../data/sites/crozon.config.js";

export const CONFIGS = { logonna, pirou, plouguerneau, audierne, carantec, concarneau, crozon };
export let SITE = logonna.SITE;
export let SPOTS = logonna.SPOTS;
export let GENERAL_PRINCIPLES = logonna.GENERAL_PRINCIPLES;
export function selectSite(key) {
  const c = CONFIGS[key];
  if (!c) throw new Error(`Guide inconnu : ${key}`);
  SITE = c.SITE; SPOTS = c.SPOTS; GENERAL_PRINCIPLES = c.GENERAL_PRINCIPLES;
  return c;
}
