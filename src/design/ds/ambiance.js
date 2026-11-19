// Choix de la photo d'ambiance (phase 11) : la photo suit la lumière, le ciel, la mer et le type de lieu du moment.
//
// Règle d'honnêteté (décision de Félix, rappelée dans data/photos/catalogue.json) : une photo d'ambiance n'est jamais
// présentée comme la photo réelle d'un spot, d'une prise ou d'une sortie. Conséquences ici :
//   - une image reconnaissable (phare, port, granit…) n'est jamais choisie pour un spot nommé ;
//   - une photo de poisson ne sert qu'aux fiches d'espèce, jamais au journal comme « ta prise » ;
//   - le résultat est déterministe (même contexte, même photo) : pas de photo qui change à chaque ouverture.

/** Type de lieu d'un spot à partir du champ `type` des fiches (« POINTE ROCHEUSE / FALAISE »…). */
export function lieuOfSpotType(type = "") {
  const t = type.toUpperCase();
  if (/PLAGE|GR[ÈE]VE|SILLON|ANSE/.test(t) && !/POINTE ROCHEUSE/.test(t)) return "plage";
  if (/RIA|ESTUAIRE|BAIE|RIVI/.test(t)) return "estuaire";
  if (/FALAISE|PROMONTOIRE/.test(t)) return "falaise";
  if (/PORT|DIGUE|QUAI/.test(t)) return "port";
  if (/RAZ|COURANT/.test(t)) return "rochers";
  return "rochers";
}

/** Bande de lumière du moteur (aube, jour, crépuscule, nuit…) vers celle du catalogue. */
export function lumiereOf(band = "") {
  if (/aube|lever/.test(band)) return "aube";
  if (/crep|coucher|soir/.test(band)) return "crepuscule";
  if (/nuit/.test(band)) return "nuit";
  return "jour";
}

/** État de la mer d'après la hauteur des vagues (m) et la force du vent (Beaufort). */
export function merOf(waveM, beaufort) {
  if ((waveM ?? 0) >= 3 || (beaufort ?? 0) >= 8) return "tempete";
  if ((waveM ?? 0) >= 1.25 || (beaufort ?? 0) >= 6) return "formee";
  return "calme";
}

/** Ciel d'après la nébulosité (%), la pluie (mm) et l'orage. */
export function cielOf({ cloud, rainMm, storm, fog } = {}) {
  if (storm) return "orage";
  if (fog) return "brume";
  if ((rainMm ?? 0) >= 1) return "pluie";
  if ((cloud ?? 0) >= 60) return "nuageux";
  return "clair";
}

const LIEUX_PROCHES = { rochers: ["pointe", "falaise", "crique", "digue"], pointe: ["rochers", "falaise"], falaise: ["rochers", "pointe"],
  plage: ["estuaire"], estuaire: ["plage"], port: ["digue"], large: ["cote"], cote: ["large"] };

const hash = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

/**
 * Meilleure photo pour un contexte.
 * ctx = { usage: "hero"|"spot"|"espece"|"materiel"|"journal"|"etat", mode: "bord"|"bateau", lumiere, ciel, mer, lieu,
 *         espece, spotNomme: bool, cle: chaîne de départage }
 */
export function pickPhoto(photos, ctx = {}) {
  const { usage = "hero", mode = "bord", lumiere, ciel, mer, lieu, espece, spotNomme = false, cle = "" } = ctx;
  const ok = photos.filter((p) => {
    if (spotNomme && p.reconnaissable) return false;
    if (usage === "espece") return p.sujet === "poisson" && (!espece || p.espece === espece);
    if (usage === "materiel") return p.sujet === "leurres";
    if (p.sujet === "poisson" || p.sujet === "leurres") return false;
    if (usage === "etat") return true;
    if (mode === "bateau") return p.mode === "bateau" || p.mode === "tous";
    return p.mode === "bord" || p.mode === "tous";
  });
  if (!ok.length) return null;
  const score = (p) => {
    let s = 0;
    if (lumiere) s += p.lumiere === lumiere ? 6 : (lumiere === "aube" && p.lumiere === "crepuscule") || (lumiere === "crepuscule" && p.lumiere === "aube") ? 3 : 0;
    if (ciel) s += p.ciel === ciel ? 4 : (ciel === "pluie" && p.ciel === "orage") || (ciel === "orage" && p.ciel === "pluie") ? 2 : 0;
    if (mer) s += p.mer === mer ? 4 : (mer === "tempete" && p.mer === "formee") || (mer === "formee" && p.mer === "tempete") ? 1 : 0;
    if (lieu) s += p.lieu === lieu ? 3 : (LIEUX_PROCHES[lieu] || []).includes(p.lieu) ? 1.5 : 0;
    if (usage === "etat" && mer === "tempete") s += p.mer === "tempete" ? 6 : 0;
    if (usage === "hero" && p.sujet === "pecheur") s += 1;
    return s;
  };
  const best = Math.max(...ok.map(score));
  const top = ok.filter((p) => score(p) === best).sort((a, b) => a.id.localeCompare(b.id));
  return top[hash(cle) % top.length];
}
