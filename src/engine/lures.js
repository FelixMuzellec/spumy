// Conseil leurres : quel type, quelle couche, quelle taille, quelle couleur,
// quel poids et quelle animation, pour CE spot à CE créneau.
//
// Chaque règle porte sa source. Le moteur ne fait que les croiser avec la
// situation du créneau (lumière, mer, clarté de l'eau, courant, fond, proie
// du mois, température) ; l'ordre de préférence entre familles qui en sort
// est une déduction, et l'interface le dit.
import { SITE } from "SITE_CONFIG";
import { allSpots } from "./myspots.js";
import { angDist, toAngle } from "./core.js";
import { preyForMonth, regimeOf, seasonPresence, terrainOf } from "./model.js";
import { BOITE, CANNE, CATALOGUE, catalogWith, HEAD_USE, SPEC_SOURCES } from "./tackle.js";
export { BOITE, BOX_KEY, CANNE, CATALOGUE, catalogWith, HEAD_USE, origSize } from "./tackle.js";

export const LURE_SOURCES = {
  couleurMeteo: { short: "peche.com, 2026", label: "peche.com — Quelle couleur choisir selon l'eau et la météo ? (L. Duclos, 03/06/2026)",
    url: "https://www.peche.com/article/52017/peche-aux-leurres-quelle-couleur-choisir-selon-l-eau-et-la-meteo" },
  couleurDebut: { short: "peche.com, 2025", label: "peche.com — Début de saison : la bonne couleur de leurre souple (F. Tynilla, 27/03/2025)",
    url: "https://www.peche.com/article/48479/peche-au-bar-en-debut-de-saison-choisir-la-bonne-couleur-de-leurre-souple" },
  coloris: { short: "peche.com, 2024", label: "peche.com — Mes coloris favoris de leurres souples pour le bar en mer (B. Le Provost, 13/12/2024)",
    url: "https://www.peche.com/article/47815/mes-coloris-favoris-de-leurres-souples-pour-la-peche-du-bar-en-mer" },
  nuit: { short: "peche.com, 2026", label: "peche.com — 5 leurres souples pour pêcher le bar de nuit en été (Y. Nabusset, 16/06/2026)",
    url: "https://www.peche.com/article/49585/5-leurres-souples-pour-pecher-le-bar-de-nuit-en-ete" },
  stickbait: { short: "peche.com, 2026", label: "peche.com — Le stickbait, un leurre qui fait fondre les bars en surface (G. Fourrier, 21/08/2026)",
    url: "https://www.peche.com/article/47337/stickbait-le-leurre-qui-fait-fondre-les-bars-en-surface" },
  vagues: { short: "peche.com, 2021", label: "peche.com — La pêche du bar dans les vagues (11/06/2021)",
    url: "https://www.peche.com/article/37249/la-peche-du-bar-dans-les-vagues-des-conditions-difficiles-souvent-payantes" },
  merConseils: { short: "peche.com, 2026", label: "peche.com — Pêche aux leurres en mer : les conseils essentiels (L. Duclos, 29/07/2026)",
    url: "https://www.peche.com/article/52087/peche-aux-leurres-en-mer-les-conseils-essentiels-pour-bien-debuter" },
  automne: { short: "peche.com, 2026", label: "peche.com — Pêcher le bar du bord en automne (B. Le Provost, 16/09/2026)",
    url: "https://www.peche.com/article/46921/comment-cibler-les-bars-du-bord-en-automne" },
  saisons: { short: "peche.com, 2024", label: "peche.com — La pêche du bar en fonction des saisons (T. Cendrier, 08/10/2024)",
    url: "https://www.peche.com/article/32987/la-peche-du-bar-en-fonction-des-saisons" },
  ouverture: { short: "Figaro Nautisme, 2026", label: "Le Figaro Nautisme — Pêche au bar à l'ouverture : bien choisir ses leurres souples (23/02/2026)",
    url: "https://figaronautisme.meteoconsult.fr/actus-nautisme-loisirs/2026-02-23/85977-peche-au-bar-a-louverture-bien-choisir-ses-leurres-souples-pour-demarrer-la-saison" },
  ifremer: { short: "Ifremer", label: "Ifremer — synthèse des marquages de bars adultes (programme Bargip)",
    url: "https://bar.ifremer.fr/content/download/116111/file/4PagesMarquageAdultes_Final-3.pdf" },
  rade: { short: "brestfishing, Desperadiens", label: "peche.com (Nicolas, brestfishing) et Relec29-Desperadiens — eaux claires de la rade de Brest", url: null },
  grammage: { short: "peche.com, 2024", label: "peche.com — Quel grammage de tête plombée faut-il utiliser pour la pêche du bar ? (T. Cendrier, 06/06/2024)",
    url: "https://www.peche.com/article/34833/quel-grammage-de-tete-plombee-faut-il-utiliser-pour-la-peche-du-bar" },
  grammageMer: { short: "Les Bredouilleurs", label: "Les Bredouilleurs — Comment choisir le grammage de sa tête plombée pour la pêche en mer ? (non daté)",
    url: "https://lesbredouilleurs.com/blogs/infos/comment-choisir-le-grammage-de-sa-tete-plombee-pour-la-peche-en-mer" },
  douziemes: { short: "peche.com", label: "peche.com — Comprendre et calculer les niveaux des marées avec la règle des douzièmes",
    url: "https://peche.com/article/43574/comprendre-et-calculer-les-niveaux-des-marees-avec-la-regle-des-douziemes" },
  shomCoef: { short: "bateaux.com, 2020", label: "bateaux.com — Savoir lire un atlas des courants de marée du SHOM (O. Tourchon, 08/10/2020)",
    url: "https://www.bateaux.com/article/34870/decouvrir-la-carte-des-courants-de-maree" },
  razBlanchard: { short: "Wikipédia", label: "Wikipédia — Raz Blanchard (flot maximal vers la pleine mer de Cherbourg, jusant vers la basse mer, renverse vers la mi-marée)",
    url: "https://fr.wikipedia.org/wiki/Raz_Blanchard" },
  razSein: { short: "bateaux.com, 2025", label: "bateaux.com — Le Raz de Sein, les bons conseils pour ce passage délicat (C. Fernbach, 08/07/2025) : renverse 20 min avant la basse mer et 45 min avant la pleine mer de Brest, 6 nœuds en vive-eau",
    url: "https://www.bateaux.com/article/32097/le-raz-de-sein-les-bons-conseils-pour-ce-passage-delicat" },
  toi: { short: "toi, sur place", label: "Ce que tu as observé ou corrigé sur le terrain", url: null },
  journal: { short: "ton journal", label: "Tes sessions : leurre, poids, couleur et prises, dans des conditions proches", url: null },
  ...SPEC_SOURCES,
  felix: { short: "tes notes", label: "Tes notes : coloris Asturie et sessions de ton journal", url: null },
  fiche: { short: "fiche du spot", label: "Fiche terrain du spot", url: null },
  deduit: { short: "déduit", label: "Déduit (seuil ou raisonnement du guide, pas d'une source)", url: null },
};

export const FAMILLES = {
  surface:    { label: "Surface : stickbait, pencil", court: "Stickbait", couche: "surface" },
  nageur:     { label: "Poisson nageur : minnow, jerkbait, coulant", court: "Poisson nageur", couche: "sous-surface" },
  weightless: { label: "Souple non plombé ou monté texan", court: "Souple weightless / texan", couche: "sous-surface" },
  shad:       { label: "Souple plombé : shad, slug", court: "Souple plombé", couche: "mi-eau à fond" },
  metal:      { label: "Métal : jig, cuiller, casting jig", court: "Métal", couche: "mi-eau" },
};

/** Famille d'un leurre de fiche, d'après son nom et sa technique. */
export function familyOf(l) {
  const n = `${l?.name || ""} ${l?.technique || ""}`.toLowerCase();
  if (/black minnow|sand eel|paddle tail|nitro shad/.test(n)) return "shad";
  if (/weightless|texan|sans plomb|non lesté|weedless/.test(n)) return "weightless";
  if (/sinking|coulant/.test(n) && /pencil|stickbait|asturie/.test(n)) return "nageur";
  if (/stickbait|pencil|popper|surface|walk/.test(n)) return "surface";
  if (/minnow|jerkbait|poisson nageur|long bill|plongeant|bavette|nageur/.test(n)) return "nageur";
  if (/\bjig\b|cuiller|métal|metal|casting/.test(n) && !/souple|shad|slug/.test(n)) return "metal";
  if (/shad|souple|slug|pintail|tête|leurre \d/.test(n)) return "shad";
  return "shad";
}

const r = (t, s) => ({ t, s });
const SEA_LABEL = { calme: "mer calme", "peu agitée": "mer peu agitée", "agitée": "mer agitée", clapot: "clapot de vent", "abritée": "mer formée au large, amortie ici" };
// Spots de rivière, d'estuaire ou de havre : c'est là qu'une forte pluie trouble l'eau.
const RIVER_RE = /ESTUAIRE|HAVRE|\bRIA\b|EMBOUCHURE|RIVI[ÈE]RE|CONFLUENCE|AULNE|SIENNE/i;
// Ordre de départage fixe, après le score et la fiche du spot.
const FAM_ORDER = ["shad", "weightless", "surface", "nageur", "metal"];

/** Situation d'un créneau, vue du pêcheur aux leurres. */
export function lureSituation(spot, w, live, dateISO) {
  const month = +String(dateISO).slice(5, 7);
  const regime = regimeOf(spot);
  const zone = SITE.zones?.[spot.zone] || {};
  const rade = zone.sea === "rade";
  // Eau claire : seulement là où une source le dit (rade de Brest : zone.eauClaire dans la configuration).
  // Les autres plans d'eau abrités (intérieur des abers, rivières de Morlaix) ne sont pas décrits : clarté normale.
  const eauClaire = rade && zone.eauClaire === true;
  const zw = w?.zw || spot.zw || null;
  const band = w?.light?.band || "inconnu";
  const cloud = zw?.cloud ?? null;
  const light = band === "nuit" ? "nuit" : band === "aube" || band === "crepuscule" ? "basse"
    : cloud != null && cloud >= 75 ? "couvert" : cloud != null && cloud <= 25 ? "soleil" : "jour";
  const coeff = w?.coeff ?? null;

  // État de la mer : houle sur la côte ouverte, vent sur le plan d'eau abrité.
  // En rade, le vent fort lève un clapot court : ce n'est pas la mer qui
  // déferle sur une côte rocheuse ouverte, seule situation décrite par la
  // source « vagues ». Les deux ne reçoivent donc pas le même conseil.
  let sea = null, seaWhy = "";
  if (rade) {
    const f = zw?.wind_force;
    if (f != null) { sea = f <= 2 ? "calme" : f <= 4 ? "peu agitée" : "clapot"; seaWhy = `vent F${f} sur un plan d'eau abrité`; }
  } else if (zw?.houleKnown) {
    const h = zw.houle;
    sea = h < 0.5 ? "calme" : h < 1.2 ? "peu agitée" : "agitée"; seaWhy = `houle ${String(h).replace(".", ",")} m`;
    // Havre ou estuaire de la côte ouverte : la houle du large y arrive amortie.
    if (sea === "agitée" && regime === "abri") { sea = "abritée"; seaWhy = `houle ${String(h).replace(".", ",")} m au large`; }
  }

  // Clarté de l'eau : jamais mesurée ; estimée et signalée comme telle.
  let clarity = eauClaire ? "claire" : "normale";
  const clarityWhy = [];
  if (eauClaire) clarityWhy.push(r("Eau habituellement claire en rade de Brest.", "rade"));
  else clarityWhy.push(r(rade ? "Clarté non mesurée sur ce plan d'eau abrité : supposée normale." : "Clarté non mesurée sur cette côte : supposée normale.", "deduit"));
  const rain = zw?.rain36;
  if (rain != null && rain >= 15 && (spot.riviere || RIVER_RE.test(`${spot.type || ""} ${spot.subtitle || ""}`))) {
    clarity = "teintée"; clarityWhy.push(r(`${String(rain).replace(".", ",")} mm de pluie en 36 h : eau probablement teintée près des rivières.`, "deduit"));
  }
  if (!rade && zw?.houleKnown && zw.houle >= 1.5) { clarity = "chargée"; clarityWhy.push(r("Houle d'au moins 1,5 m : eau remuée, probablement chargée.", "deduit")); }
  if (coeff != null && coeff >= 95 && clarity === (eauClaire ? "claire" : "normale") && regime !== "roche") {
    clarity = "teintée"; clarityWhy.push(r(`Coefficient ${coeff} : les gros coefficients peuvent troubler l'eau (seuil 95 et effet supposés, aucune source relue ne le chiffre).`, "deduit"));
  }
  // Ce que tu as vu sur place prime sur toute estimation.
  const obs = spot.eauObs?.date === dateISO ? spot.eauObs.v : null;
  if (obs && ["claire", "teintée", "chargée"].includes(obs)) {
    clarityWhy.length = 0; clarity = obs;
    clarityWhy.push(r(`Eau ${obs} : observée par toi aujourd'hui sur ce spot.`, "toi"));
  }

  // Courant fort : spot de courant par nature (type de la fiche), ou seuil de
  // coefficient porté par la fiche avec sa source (spot.courantFort).
  const staticCurrent = /COURANT|GOULET|RAZ/i.test(`${spot.type} ${spot.subtitle}`);
  const cf = spot.courantFort;
  const coefCurrent = !!cf && coeff != null && coeff > cf.above;
  const strongCurrent = staticCurrent || coefCurrent;
  const currentWhy = staticCurrent ? r(`Spot de courant (${String(spot.type).toLowerCase()}).`, "fiche")
    : coefCurrent ? r(`Coefficient ${coeff} > ${cf.above} : ${cf.t}`, "fiche") : null;
  const current = currentAt(spot, w, { strongCurrent, coeff, coefCurrent });
  const wind = windSide(spot, zw);
  const depthEst = depthAt(spot, w);

  const terr = terrainOf(spot);
  const prey = preyForMonth(month);
  const sst = live?.sst != null && Number.isFinite(+live.sst) ? +live.sst : null;
  const cold = (sst != null && sst < 12) || month === 3 || month === 4;
  // Familles citées par la fiche du spot : elles départagent les égalités.
  const ficheFam = {};
  for (const l of spot.lures || []) { const k = familyOf(l); ficheFam[k] = (ficheFam[k] || 0) + 1; }
  return { month, regime, rade, eauClaire, light, band, cloud, sea, seaLabel: SEA_LABEL[sea] || null, seaWhy, clarity, clarityWhy, strongCurrent, currentWhy, ficheFam, coeff, terr, prey, sst, cold,
           season: seasonPresence(month, regime), windF: zw?.wind_force ?? null, houle: zw?.houleKnown ? zw.houle : null,
           // Courant pendant CE créneau : le spot de courant n'est « en courant » qu'en dehors des étales.
           current, currentNow: strongCurrent && current.level !== "faible", wind, depthEst, courantSurface: spot.courantSurface || null, eauObservee: !!obs };
}

// ── Courant du créneau ────────────────────────────────────────────────
// Règle des douzièmes : la mer monte de 1, 2, 3, 3, 2, 1 douzièmes du marnage d'heure en heure
// (peche.com). Dans une anse, une ria ou la rade, l'eau qui entre ou sort suit cette vitesse de
// montée : le courant y est le plus fort aux 3e et 4e heures, le plus faible près des étales
// (déduction physique ; Térénez le confirme : « une heure avant et après les étales. Au-delà, le
// courant s'accélère »). Sur la côte ouverte du Cotentin, le courant longe la côte et son heure
// ne suit pas la marée locale : le moment n'y est pas estimé.
const HALF_TIDE = 6.21;   // demi-cycle semi-diurne moyen, en heures
export function flowFactor(offsetH) {
  const a = ((Math.abs(offsetH) % HALF_TIDE) + HALF_TIDE) % HALF_TIDE;
  const d = Math.min(a, HALF_TIDE - a);          // heures depuis l'étale la plus proche
  return [1, 2, 3][Math.min(2, Math.floor(d / (HALF_TIDE / 6)))] / 3;
}
export function basinFlow(spot) {
  // v8.9 : « goulet » lu dans le type ET le sous-titre, comme pour le courant fort (Petit Minou : « Goulet nord »).
  return SITE.zones?.[spot.zone]?.sea === "rade" || /GOULET/i.test(`${spot.type || ""} ${spot.subtitle || ""}`) || regimeOf(spot) === "abri";
}
const RAZ_LABEL = { 1: "plein courant du raz (vers la pleine ou la basse mer)", 2: "courant du raz qui forcit ou faiblit", 0: "près de la renverse du raz (vers la mi-marée)" };
const FLOW_LABEL = { 1: "plein courant (3e ou 4e heure de la marée)", 2: "courant qui forcit ou faiblit (2e ou 5e heure)", 0: "près de l'étale (1re ou 6e heure)" };
// Raz Blanchard (Goury) : « le maximum [du flot] survient aux environs de l'heure de la pleine
// mer de Cherbourg », le jusant « vers l'heure de la basse mer », et « la renverse se situe vers
// les heures de mi-marée » ; la pleine mer de Cherbourg suit celle de La Hague d'environ une
// demi-heure (Wikipédia). L'inverse exact d'une anse : plein courant aux étales locales.
const RAZ_LAG_H = 0.5;
export const razFlow = (spot) => /RAZ/i.test(spot.type || "");
// Renverse du raz, en heures après la pleine (ou basse) mer du port du spot. Par défaut celle du
// Raz Blanchard (vers la mi-marée) ; un autre raz la porte dans sa fiche (spot.raz.slackH), avec sa source.
export const razSlackH = (spot) => (Number.isFinite(spot?.raz?.slackH) ? spot.raz.slackH : RAZ_LAG_H + HALF_TIDE / 2);
export function razFactor(offsetH, slackH = RAZ_LAG_H + HALF_TIDE / 2) { return flowFactor(offsetH - slackH); }
export function currentAt(spot, w, { strongCurrent, coeff, coefCurrent }) {
  const why = [];
  let fMax = null, fStart = null, fEnd = null;
  const raz = razFlow(spot);
  if ((basinFlow(spot) || raz) && w && Number.isFinite(w.offsetBefore) && Number.isFinite(w.offsetAfter) && w.offsetAfter > w.offsetBefore) {
    const pts = [];
    const slack = razSlackH(spot);
    for (let o = w.offsetBefore; o <= w.offsetAfter + 1e-9; o += 0.25) pts.push(raz ? razFactor(o, slack) : flowFactor(o));
    fMax = Math.max(...pts); fStart = pts[0]; fEnd = pts[pts.length - 1];
  }
  const key = fMax == null ? null : fMax > 0.9 ? 1 : fMax > 0.5 ? 2 : 0;
  let level, label;
  if (fMax == null) {
    level = strongCurrent ? "fort" : "ordinaire";
    label = strongCurrent ? "courant fort (heure non estimée sur ce spot)" : "courant de la fiche";
    if (strongCurrent && !basinFlow(spot)) why.push(r("Côte ouverte : aucune source ne donne l'heure de ce courant, le guide ne l'estime pas ; il est supposé présent pendant tout le créneau.", "deduit"));
  } else {
    level = !strongCurrent ? (key === 0 ? "faible" : "ordinaire") : key === 1 ? "fort" : key === 2 ? "soutenu" : "faible";
    const RL = spot.raz?.labels || RAZ_LABEL;
    label = raz ? RL[key] : FLOW_LABEL[key];
    const trend = fStart !== fEnd ? (fEnd > fStart ? ", en train de forcir" : ", en train de faiblir") : "";
    if (raz && spot.raz) {
      why.push(r(`Pendant ce créneau : ${RL[key]}${trend}. ${spot.raz.why}`, spot.raz.src || "fiche"));
      if (spot.raz.deduit) why.push(r(spot.raz.deduit, "deduit"));
    } else if (raz) {
      why.push(r(`Pendant ce créneau : ${RAZ_LABEL[key]}${trend}. Dans le raz, le flot est maximal vers la pleine mer de Cherbourg, le jusant vers la basse mer, et la renverse tombe vers la mi-marée.`, "razBlanchard"));
      why.push(r("Pleine mer de Cherbourg environ une demi-heure après La Hague (même source) ; la forme du courant entre ces repères est déduite.", "deduit"));
    } else {
      why.push(r(`Pendant ce créneau : ${FLOW_LABEL[key]}${trend}. La mer monte et descend le plus vite aux 3e et 4e heures (règle des douzièmes).`, "douziemes"));
      why.push(r("Dans une anse ou une rade, l'eau qui entre ou sort suit cette vitesse : courant maximal à mi-marée, minimal aux étales.", "deduit"));
    }
  }
  if (strongCurrent && coeff != null) why.push(r(`Coefficient ${coeff} : la vitesse croît avec lui (exemple d'un atlas du SHOM : 1,8 nœud à coefficient 45, 3,5 nœuds à 95).`, "shomCoef"));
  if (!strongCurrent && coefCurrent === false && spot.courantFort && coeff != null) why.push(r(`Coefficient ${coeff} sous le seuil de courant de la fiche (${spot.courantFort.above}).`, "fiche"));
  return { level, label, factor: fMax, why };
}

// ── Vent par rapport au pêcheur : de face (vers la côte), de dos, de travers ──
export function windSide(spot, zw) {
  const F = zw?.wind_force ?? null, ang = toAngle(zw?.wind_dir);
  if (F == null || ang < 0) return { F, side: null, face: false };
  const near = (list) => ((list || []).length ? Math.min(...list.map((a) => angDist(ang, a))) : 180);
  const side = near(spot.exposedAngles) < 45 ? "face" : near(spot.shelteredAngles) < 45 ? "dos" : "travers";
  return { F, dir: zw.wind_dir, side, face: side === "face" };
}

/** Couleurs : catégorie dominante, palette, raisons sourcées. */
export function colorAdvice(sit) {
  const why = [];
  let cat, palette;
  if (sit.light === "nuit") {
    cat = "blanc"; palette = ["blanc", "bone", "sardine"];
    why.push(r("De nuit, « le coloris blanc se distingue largement ».", "nuit"));
  } else if (sit.clarity === "chargée" || sit.clarity === "teintée") {
    cat = "visible"; palette = ["blanc", "chartreuse", "jaune", "orange", "rose"];
    why.push(r("Eau teintée ou chargée : des coloris qui ressortent nettement (blanc, chartreuse, jaune, orange, rose).", "couleurMeteo"));
    if (sit.sea === "agitée") why.push(r("Rose quand l'eau est chargée et agitée.", "coloris"));
    why.push(r("« Temps sombre, leurre sombre » : un coloris sombre reste visible en eau trouble.", "couleurDebut"));
  } else if (sit.light === "basse") {
    cat = "contraste"; palette = ["blanc", "coloris contrastés", "tons chauds"];
    why.push(r("Aube et crépuscule : coloris contrastés ou chauds, qui restent visibles en lumière douce.", "couleurMeteo"));
    why.push(r("Blanc, efficace en eau claire par faible luminosité, le soir ou le matin.", "coloris"));
    why.push(r("Cabot : meilleur aux changements de lumière.", "felix"));
  } else if (sit.light === "couvert") {
    cat = "visible"; palette = ["blanc", "coloris vifs", "sombre"];
    why.push(r("Ciel couvert : les teintes plus vives deviennent plus lisibles pour le poisson.", "couleurMeteo"));
    why.push(r("« Temps sombre, leurre sombre ».", "couleurDebut"));
  } else if (sit.light === "soleil" && sit.clarity === "claire") {
    cat = "naturel"; palette = ["naturel", "translucide", "légèrement pailleté", "bleu sardine", "gris", "vert ayu"];
    why.push(r("Eau claire et plein soleil : naturel, translucide ou légèrement pailleté.", "couleurMeteo"));
    why.push(r("Bleu sardine, blanc, gris ou vert ayu, surtout en eau claire.", "couleurDebut"));
    why.push(r("Ghost Iwashi : réservé au plein soleil en eau claire.", "felix"));
  } else {
    cat = "naturel"; palette = ["naturel", "imitation de la proie du moment"];
    why.push(sit.clarity === "claire"
      ? r("Eau claire : un leurre imitatif, proche des proies locales, inspire davantage confiance.", "couleurMeteo")
      : r("Clarté non mesurée, plein jour : coloris naturel, proche des proies locales — la source donne ce conseil pour l'eau claire ; il est repris ici faute de mieux.", "couleurMeteo"));
  }
  // La proie du moment affine la couleur.
  const p = sit.prey?.[0]?.name || "";
  if (/lançon|équille/i.test(p)) why.push(r("Sur les zones à lançon : vert ou kaki (Crazy Sand Eel, Crazy Paddle Tail) ; un leurre blanc peut aussi imiter un lançon.", "coloris"));
  else if (/sprat/i.test(p)) why.push(r(sit.light === "soleil" ? "Sprats et soleil : Blue Herring (Nitro Shad)." : "Petits poissons : souple argenté ou bleuté.", sit.light === "soleil" ? "coloris" : "couleurDebut"));
  else if (/sardine|maquereau/i.test(p)) why.push(r("Sardine, maquereau ou sprat : vert.", "coloris"));
  else if (/crabe|crevette|crustac/i.test(p) && (sit.month <= 5)) why.push(r("Début de saison, bars sur les crustacés : marron.", "coloris"));
  if (sit.clarity === "claire") why.push(r("Eau claire : éviter les leurres trop gros ou trop voyants.", "merConseils"));
  const label = { blanc: "Blanc", visible: "Visible : blanc ou vif", contraste: "Contrastée : blanc, Cabot ou tons chauds", naturel: "Naturelle, proche de la proie" }[cat];
  return { cat, label, palette, why };
}

/** Familles de leurres classées pour la situation. */
export function familyRanking(sit) {
  const sc = { surface: 0, nageur: 0, weightless: 0, shad: 0, metal: 0 };
  const why = { surface: [], nageur: [], weightless: [], shad: [], metal: [] };
  const add = (k, v, t, s) => { sc[k] += v; why[k].push({ t, s, v }); };
  if (sit.sea === "calme" || sit.sea === "peu agitée") {
    add("surface", 2, "Mer belle à peu agitée : la surface travaille bien.", "stickbait");
  }
  if (sit.sea === "clapot") {
    add("surface", -2, "Stickbait : préférer une mer belle à peu agitée.", "stickbait");
    add("weightless", -1, "Vent fort : un souple non plombé se lance mal et se contrôle mal ; un texan légèrement plombé tient mieux.", "deduit");
  }
  if (sit.sea === "agitée") {
    add("shad", 2, "Dans les vagues : shad à palette de 120 à 140 mm sur tête de 18 à 25 g, récupération linéaire canne basse.", "vagues");
    add("metal", 1, "Jigs et cuillers métalliques : parfaits pour la pêche dans les vagues.", "merConseils");
    add("surface", -2, "Stickbait : préférer une mer belle à peu agitée.", "stickbait");
  }
  if (sit.light === "basse") add("surface", 1.5, "Aube et crépuscule : moment idéal pour la surface.", "merConseils");
  if (sit.light === "nuit") {
    add("shad", 2, "Nuit : petits souples de 85 à 100 mm sur têtes de 5 à 10 g, en zones peu profondes.", "nuit");
    add("surface", -1, "De nuit, la seule source citée ne propose que des souples ; la surface n'y figure pas, sans y être déconseillée.", "deduit");
  }
  if (sit.light === "soleil" && sit.eauClaire) add("weightless", 1, "Eaux claires de la rade : leurres petits et discrets, approche silencieuse.", "rade");
  if (sit.wind?.face && sit.wind.F >= 5 && sit.sea !== "clapot") {
    add("weightless", -1, `Vent de face F${sit.wind.F} : un souple non plombé se lance mal et se contrôle mal.`, "deduit");
  }
  // Surface et courant : chaque fiche dit ce qu'il en est chez elle (Port Maria : la surface
  // marche « dès qu'un courant se manifeste » ; Espagnols : « en plein courant, le leurre ne
  // tient pas sa couche »). Rien de général n'est supposé.
  const cs = sit.courantSurface;
  if (cs && sit.currentNow && (cs.v > 0 || sit.current?.level === "fort")) add("surface", cs.v, cs.t, "fiche");
  if (sit.currentNow ?? sit.strongCurrent) {
    add("nageur", 1, "Courant fort ou zone profonde : leurres coulants (jerkbaits, casting jigs).", "merConseils");
    add("metal", 1, "Courant fort : casting jig.", "merConseils");
    add("shad", 1, "Courant : tête plus lourde ; trop léger, le leurre dérive sans précision.", "ouverture");
  }
  const t = sit.terr;
  const rough = (sit.currentNow ?? sit.strongCurrent) || sit.sea === "agitée";
  if (t.gratter === "non") {
    add("shad", -1, "Fond trop encroché : un souple plombé se tient au-dessus du fond, jamais à son contact.", "fiche");
    add("metal", -1, "Fond trop encroché : le métal se pêche haut, sans toucher.", "fiche");
    if (!rough) add("weightless", 2, "Souple non plombé ou texan, nagé au-dessus du goémon.", "fiche");
  } else if (t.gratter === "texan") add("weightless", 1, "Fond mixte : monté texan sur les zones encombrées.", "fiche");
  if (rough) add("weightless", -2, "Courant ou vagues : trop léger, le leurre dérive sans précision.", "ouverture");
  if (!t.couches.includes("surface")) add("surface", -3, "Surface impraticable ici selon la fiche.", "fiche");
  if (sit.cold) {
    add("shad", 1, "Eau froide : souple qui nage naturellement à faible vitesse ; animations lentes.", "ouverture");
    add("weightless", 1, "Finesse de 10 à 14 cm en récupération très douce, quand le bar suit sans mordre.", "ouverture");
  }
  const p = sit.prey?.[0];
  if (p?.couche === "surface") add("surface", 1, `Proie du moment en surface : ${p.name.toLowerCase()}.`, "fiche");
  if (p?.couche === "sous-surface") { add("nageur", 0.5, `Proie du moment en sous-surface : ${p.name.toLowerCase()}.`, "fiche"); add("weightless", 0.5, `Proie du moment en sous-surface : ${p.name.toLowerCase()}.`, "fiche"); }
  if (p?.couche === "fond" && t.gratter !== "non") add("shad", 1, `Proie du moment près du fond : ${p.name.toLowerCase()}.`, "fiche");
  if (p?.couche === "mi-eau") add("shad", 1, `Proie du moment à mi-eau : ${p.name.toLowerCase()}.`, "fiche");
  // À score égal, la famille la plus citée par la fiche du spot passe devant.
  const fiche = sit.ficheFam || {};
  return Object.keys(sc).map((k) => ({ k, ...FAMILLES[k], score: sc[k], why: why[k], fiche: fiche[k] || 0 }))
    .sort((a, b) => b.score - a.score || b.fiche - a.fiche || FAM_ORDER.indexOf(a.k) - FAM_ORDER.indexOf(b.k));
}

/** Taille et profil. */
export function sizeAdvice(sit) {
  const why = [];
  const p = sit.prey?.[0];
  let text = p ? `Profil de ${p.name.toLowerCase()}${p.size && p.size !== "—" ? `, ${p.size}` : ""}` : "Profil de la proie locale";
  if (p) why.push(r(`Proie dominante du mois : ${p.name}${p.size && p.size !== "—" ? ` (${p.size})` : ""}.`, "fiche"));
  if (sit.light === "nuit") { text = "Petit souple de 85 à 100 mm"; why.push(r("Nuit : souples de 85 à 100 mm.", "nuit")); }
  else if (sit.sea === "agitée") { text = "Shad de 120 à 140 mm"; why.push(r("Dans les vagues : Black Minnow 120 ou 140.", "vagues")); }
  else if (sit.cold) { text = "Petite taille : shad de 9 à 12 cm, finesse de 10 à 14 cm"; why.push(r("Début de saison : un leurre souple de petite taille peut être plus efficace.", "couleurDebut"), r("Shad à palette de 9 à 12 cm ; finesse de 10 à 14 cm.", "ouverture")); }
  else if (sit.month >= 9 && sit.month <= 11) why.push(r("Automne : souples de 120 à 150 mm (Black Minnow, Crazy Sand Eel), surface 130 à 150 mm (Asturie, Biotop, Super Spook).", "automne"));
  return { text, why };
}

/** Poids et montage du leurre conseillé. */
export function weightAdvice(sit, fam, pick, target) {
  const why = [];
  let text = pick?.weight?.text || sit.terr.montage || "Le plus léger qui garde le contact";
  const soft = pick ? (pick.fam === "shad" || (pick.fam === "weightless" && pick.rig !== "sans plomb")) : fam === "shad";
  if (soft && target) {
    why.push(...target.why);
    why.unshift(r(`Visé : environ ${target.start} g (entre ${target.lo} et ${target.hi} g)${target.bump ? ", un cran au-dessus pour le vent" : ""}. Règle décisive : ${target.main.t.charAt(0).toLowerCase()}${target.main.t.slice(1)}`, target.main.s));
    if (pick?.weight?.use) why.push(pick.weight.use);
  } else if (pick?.weight?.g) {
    why.push(r(`Poids du leurre : ${pick.weight.text}${pick.alt ? ` (${pick.alt})` : ""}.`, pick.specSrc || "deduit"));
    if ((sit.wind?.face && sit.wind.F >= 4) || sit.sea === "clapot" || sit.sea === "agitée" || sit.currentNow) why.push(r("Vent de face, clapot, vagues ou courant : le plus lourd de la boîte se lance plus loin et tient mieux sa trajectoire.", "deduit"));
  }
  if (sit.terr.montage) why.push(r(`Montage conseillé par la fiche : ${sit.terr.montage}`, "fiche"));
  if (sit.sea === "abritée") why.push(r("Mer formée au large, mais le havre l'amortit : le conseil « vagues » (côte rocheuse ouverte) ne s'applique pas ici.", "deduit"));
  why.push(r("Trop lourd, le leurre perd en naturel : le plus léger qui garde le contact et la couche.", "ouverture"));
  return { text, why };
}

/** Animation : celle du leurre conseillé, puis ce que la situation impose. */
export function animationAdvice(sit, fam, pick) {
  const out = [...(pick?.anim || [])];
  if (!out.length) {
    if (fam === "surface") out.push(r("Walking the dog : coups de scion réguliers, environ deux par seconde. Long-slide, plus lent, pour les gros poissons.", "stickbait"));
    else if (fam === "nageur") out.push(r("Jerkbait : coups de scion secs ; varier vitesse et pauses.", "merConseils"));
    else if (fam === "weightless") out.push(r("Récupération très douce ou légers relevés de scion, longues pauses.", "ouverture"));
    else if (fam === "metal") out.push(r("Laisser couler, puis récupérer vite.", "merConseils"));
    else out.push(r("Linéaire ou en dent de scie ; varier la vitesse.", "merConseils"));
  }
  if ((pick?.fam || fam) === "shad") {
    if (sit.light === "nuit") out.push(r("Nuit : récupération saccadée.", "nuit"));
    else if (sit.sea === "agitée") out.push(r("Dans les vagues : linéaire, canne basse à 90° du leurre ; scion noyé pour supprimer la bannière.", "vagues"));
    else if (sit.cold) out.push(r("Eau froide : laisser descendre, puis récupérer lentement en gardant le contact.", "ouverture"));
  }
  if ((pick?.fam || fam) === "surface") out.push(r("Walking the dog : environ deux coups de scion par seconde ; long-slide, plus lent, pour les gros poissons.", "stickbait"));
  if (sit.terr.conseils?.some((c) => /descente/i.test(c))) out.push(r(sit.terr.conseils.find((c) => /descente/i.test(c)), "fiche"));
  return out;
}

/** Modèles cités par les sources pour cette situation. */
export function citedModels(sit) {
  const m = [];
  if (sit.sea === "agitée") m.push(r("Fiiish Black Minnow 120 ou 140, tête de 18 à 25 g (exemple : Electric Blue sur tête de 25 g)", "vagues"));
  if (sit.light === "nuit") m.push(r("Illex Nitro Shad 90 (bone) · Madness Madshad Evo 2 85 (iwashi) · Westin Sandy Andy 100 (blanc) · Megabass Spindle Worm 4\" (Ayu) · Fiiish Black Minnow 90 (blanc, tête 5 g)", "nuit"));
  if (sit.month >= 9 && sit.month <= 11) m.push(r("Fiiish Black Minnow 120 et 150, Crazy Sand Eel 120 à 150 ; surface : Xorus Asturie 130 et 150, Fiiish Biotop, Heddon Super Spook", "automne"));
  if (/lançon|équille/i.test(sit.prey?.[0]?.name || "")) m.push(r("Fiiish Crazy Sand Eel ou Crazy Paddle Tail, vert ou kaki", "coloris"));
  return m;
}

// ═══════════════════════════════════════════════════════════════════
// TA BOÎTE : le leurre précis, sa taille, son poids (ou sa tête) et sa couleur
// ═══════════════════════════════════════════════════════════════════

// Profondeur : jamais mesurée. Chaque fiche porte une classe estimée d'après sa
// description (estran découvrant, peu d'eau, tombant) ; les fourchettes sont celles
// des sources de grammage, pas des sondes.
export const DEPTH_CLASS = {
  estran: { label: "très peu d'eau (estran qui découvre)", min: 0.5, max: 3 },
  peu: { label: "peu d'eau (1 à 4 m du bord)", min: 1, max: 4 },
  tombant: { label: "tombant (5 à 15 m à portée de lancer)", min: 5, max: 15 },
};
// Hauteur d'eau relative au créneau (0 = basse mer, 1 = pleine mer), par la règle des douzièmes.
const CUM12 = [0, 1, 3, 6, 9, 11, 12];
export function levelFraction(w) {
  if (!w || !Number.isFinite(w.offsetBefore) || !Number.isFinite(w.offsetAfter)) return null;
  const o = (w.offsetBefore + w.offsetAfter) / 2, h = Math.min(HALF_TIDE, Math.abs(o)) / (HALF_TIDE / 6);
  const k = Math.min(5, Math.floor(h)), c = CUM12[k] + (CUM12[k + 1] - CUM12[k]) * (h - k);
  return w.phase === "bm" ? c / 12 : 1 - c / 12;
}
export const clsOfMetres = (m) => (m <= 1.5 ? "estran" : m <= 4 ? "peu" : "tombant");
/** Marnage du jour, interpolé entre morte-eau (coefficient 45) et vive-eau (95) de la fiche du site (déduit). */
export function rangeAt(coeff) {
  const mn = SITE.marnage;
  if (!mn || !Number.isFinite(coeff)) return null;
  return Math.max(0.3, mn.neap + (mn.spring - mn.neap) * (coeff - 45) / 50);
}
export function depthAt(spot, w) {
  const p = spot.terrain?.prof;
  const f = levelFraction(w);
  // Profondeur donnée par toi, en mètres à mi-marée : la marée du créneau l'ajuste.
  if (p && Number.isFinite(p.m) && p.m > 0) {
    const rg = rangeAt(w?.coeff);
    const now = f != null && rg != null ? Math.max(0.2, p.m + (f - 0.5) * rg) : p.m;
    const cls = clsOfMetres(now);
    return { cls, ...DEPTH_CLASS[cls], label: `environ ${String(Math.round(now * 10) / 10).replace(".", ",")} m (${String(p.m).replace(".", ",")} m à mi-marée, donné par toi)`,
             why: p.why || "Profondeur donnée par toi.", level: f, m: p.m, mNow: now, fromUser: true };
  }
  const cls = DEPTH_CLASS[p?.cls];
  if (!cls) return null;
  return { cls: p.cls, ...cls, why: p.why || "", level: f, fromUser: !!p.fromUser };
}

/** Poids visé pour un souple (tête ou plomb) : départ, fourchette et raisons sourcées. */
export function headTarget(sit) {
  const why = [];
  let start, lo, hi;
  const d = sit.depthEst;
  let main;
  if (d?.mNow != null && d.mNow > 15) {
    // v8.9 : le départ reste dans la fourchette (plafond 40 g, sous la limite de ta canne).
    hi = Math.min(40, Math.round(d.mNow * 2)); lo = Math.min(hi, Math.round(d.mNow / 2)); start = Math.min(hi, Math.round(d.mNow));
    why.push(main = r(`Environ ${Math.round(d.mNow)} m d'eau : 1 g par mètre sans vent ni courant, soit ${start} g de départ${start < Math.round(d.mNow) ? " (plafonné à 40 g)" : ""}.`, "grammage"));
  } else if (d?.mNow != null && d.mNow > 4) {
    start = Math.min(20, Math.max(10, Math.round(d.mNow))); lo = 10; hi = 20;
    why.push(main = r(`Environ ${String(Math.round(d.mNow * 10) / 10).replace(".", ",")} m d'eau : de 5 à 15 m, têtes de 10 à 20 g ; départ à 1 g par mètre.`, "grammageMer"));
  } else if (d?.cls === "tombant") {
    start = 10; lo = 10; hi = 20;
    why.push(main = r("Tombant de 5 à 15 m : têtes de 10 à 20 g.", "grammageMer"));
  } else {
    start = 5; lo = 3; hi = 10;
    why.push(main = r("Du bord, 1 à 4 m d'eau : départ à 5 g en linéaire, entre 3 et 10 g selon la session (base : 1 g par mètre sans vent ni courant).", "grammage"));
    if (d?.mNow != null ? d.mNow <= 1.5 : d && d.level != null && d.level < 0.35) {
      start = 3;
      why.push(r(d?.mNow != null ? `Environ ${String(Math.round(d.mNow * 10) / 10).replace(".", ",")} m d'eau au créneau : très peu d'eau, bas de la fourchette.`
        : `Marée basse au créneau (environ ${Math.round(d.level * 100)} % de la hauteur, règle des douzièmes) : très peu d'eau, bas de la fourchette.`, "deduit"));
    }
  }
  if (!d) why.push(r("Profondeur non estimée pour ce spot : base du bord peu profond.", "deduit"));
  if (sit.light === "nuit" && !sit.currentNow && d?.cls !== "tombant" && sit.sea !== "agitée") {
    start = Math.min(Math.max(start, 5), 10); lo = 5; hi = 10;
    why.push(main = r("Nuit : têtes de 5 à 10 g en zones peu profondes.", "nuit"));
  }
  if (sit.current?.level === "fort" && sit.currentNow) {
    const shallow = d && d.cls !== "tombant";
    start = Math.max(start, shallow ? 15 : 20); lo = Math.max(lo, 10); hi = Math.max(hi, shallow ? 25 : 40);
    why.push(main = r("Courant fort (2 à 4 nœuds), 10 m de fond, en bateau : 20 g de départ au lancer, à moduler selon la météo et l'humeur du poisson.", "grammage"));
    why.push(r("Fourchette de 10 à 40 g : la moitié et le double de ce départ, l'écart que la même source propose par courant faible.", "deduit"));
    if (shallow) why.push(r("Ici moins de fond que ces 10 m : départ ramené à 15 g, sans dépasser 25 g.", "deduit"));
  } else if (sit.currentNow) {
    start = Math.max(start, 15); lo = Math.max(lo, 15); hi = Math.max(hi, 25);
    why.push(main = r("Du bord, courant moyen : 15 à 25 g.", "grammageMer"));
  } else if (sit.strongCurrent && sit.current?.level === "faible") {
    why.push(r("Spot de courant, mais créneau près de l'étale : la tête peut redescendre à celle d'un spot calme.", "deduit"));
  }
  if (sit.sea === "agitée") {
    start = Math.max(start, 18); lo = Math.max(lo, 18); hi = Math.max(hi, 25);
    why.push(main = r("Dans les vagues : tête de 18 à 25 g.", "vagues"));
  }
  const windy = (sit.wind?.face && sit.wind.F >= 4) || sit.sea === "clapot";
  if (windy) why.push(r(`Vent${sit.wind?.face ? ` de face F${sit.wind.F}` : ""} : des têtes plus lourdes pour continuer à sentir le fond (ici, un cran au-dessus).`, "grammage"));
  if (sit.currentNow) why.push(r("À gratter en travers du courant : 2 g de plus que ce départ.", "grammage"));
  return { start, lo, hi: Math.max(hi, lo), bump: windy, why, main };
}

const nightShallow = (sit) => sit.light === "nuit" && !sit.currentNow && sit.depthEst?.cls !== "tombant" && sit.sea !== "agitée";
/** Taille visée (mm) selon la nuit, la mer, la saison ; à défaut, préférence déduite de la proie. */
export function sizeTarget(sit, fam) {
  const soft = fam === "shad" || fam === "weightless";
  // Les vagues d'abord : un petit souple sur une tête de 20 g n'a pas de sens.
  if (sit.sea === "agitée" && fam === "shad") return { min: 120, max: 140, why: r("Dans les vagues : shad de 120 à 140 mm.", "vagues") };
  // La source « nuit » parle des zones peu profondes : pas des tombants, du plein courant ni des vagues.
  if (nightShallow(sit) && soft) return { min: 85, max: 100, why: r("Nuit, zones peu profondes : souples de 85 à 100 mm.", "nuit") };
  if (sit.cold && fam === "shad") return { min: 90, max: 120, why: r("Eau froide : shad à palette de 9 à 12 cm.", "ouverture") };
  if (sit.cold && fam === "weightless") return { min: 100, max: 140, why: r("Eau froide : finesse de 10 à 14 cm.", "ouverture") };
  if (sit.month >= 9 && sit.month <= 11 && soft) return { min: 120, max: 150, why: r("Automne : souples de 120 à 150 mm.", "automne") };
  if (sit.month >= 9 && sit.month <= 11 && fam === "surface") return { min: 130, max: 150, why: r("Automne : surface de 130 à 150 mm (Asturie 130 et 150 cités).", "automne") };
  const m = String(sit.prey?.[0]?.size || "").match(/(\d+)\s*-\s*(\d+)\s*cm/);
  const small = sit.eauClaire && sit.light === "soleil" && sit.clarity === "claire";
  if (small) return { prefer: "petit", why: r("Eaux claires de la rade, plein soleil : leurres petits et discrets.", "rade") };
  if (m && +m[2] <= 8) return { prefer: "petit", why: r(`Proie dominante petite (${sit.prey[0].name.toLowerCase()}, ${sit.prey[0].size}) : la plus petite taille de la boîte.`, "deduit") };
  if (m && +m[1] >= 10) return { prefer: "grand", why: r(`Proie dominante longue (${sit.prey[0].name.toLowerCase()}, ${sit.prey[0].size}) : une grande taille.`, "deduit") };
  return { prefer: null, why: null };
}
function sizeFit(len, t) {
  if (!Number.isFinite(len)) return 0;
  if (t.min != null) return len >= t.min && len <= t.max ? 1 : Math.max(-1, 1 - Math.min(Math.abs(len - t.min), Math.abs(len - t.max)) / 30);
  if (t.prefer === "petit") return Math.max(-0.5, (130 - len) / 60);
  if (t.prefer === "grand") return Math.max(-0.5, (len - 110) / 60);
  return 0;
}

// Teinte d'une couleur de ta boîte face à la couleur conseillée.
function toneFit(tone, color, sit) {
  if (tone === "soleil") return color.cat === "naturel" && sit.light === "soleil" && sit.clarity === "claire" ? 2 : -1;
  const T = {
    blanc: { blanc: 2, vif: 1, transition: 1, naturel: 0.5, sombre: 0 },
    visible: { blanc: 2, vif: 2, sombre: 1.5, transition: 1, naturel: 0 },
    contraste: { transition: 2, blanc: 1.5, vif: 1.5, sombre: 1, naturel: 0.5 },
    naturel: { naturel: 2, transition: 1, blanc: 0.5, vif: 0, sombre: 0 },
  }[color.cat] || {};
  return T[tone] ?? 0;
}
function colorFor(b, color, sit) {
  const named = (b.colors || []).map((c) => ({ ...c, fit: toneFit(c.tone, color, sit) })).sort((x, y) => y.fit - x.fit);
  if (named[0] && named[0].fit >= 1.5) return { name: named[0].name, fit: named[0].fit, named: true };
  if (b.anyColor) return { name: color.palette.slice(0, 3).join(", "), fit: 1.5, named: false };
  return named[0] ? { name: named[0].name, fit: named[0].fit, named: true } : { name: color.palette.slice(0, 3).join(", "), fit: 0, named: false };
}

/** Tête ou poids pour un souple d'une taille donnée, le plus proche du départ visé dans la fourchette. */
function pickWeight(options, tgt) {
  // options : [[nom, g], …] ; sans liste (plombs que tu as « un peu de tous »), le départ lui-même.
  if (!options) { const g = tgt.bump ? Math.min(tgt.hi ?? CANNE.max, CANNE.max, Math.round(tgt.start * 1.4)) : tgt.start; return { name: null, g, inRange: true }; }
  const sorted = [...options].sort((a, b) => a[1] - b[1]);
  const inR = sorted.filter(([, g]) => g >= tgt.lo && g <= tgt.hi);
  const pool = inR.length ? inR : sorted;
  // Du bord, à poids voisin, les têtes de lancer (Shore, Search…) avant celles conçues pour le bateau.
  const cost = ([n, g]) => Math.abs(g - tgt.start) + (BOAT_HEADS.has(n) ? 3 : 0);
  let best = pool.reduce((a, b) => (cost(b) < cost(a) ? b : a));
  // Un cran plus lourd pour le vent, sans passer à une tête de bateau si on est sur une tête de bord.
  if (tgt.bump) { const up = pool.find(([n, g]) => g > best[1] && (BOAT_HEADS.has(best[0]) || !BOAT_HEADS.has(n))); if (up) best = up; }
  return { name: best[0], g: best[1], inRange: inR.length > 0, boat: BOAT_HEADS.has(best[0]) };
}

const BOAT_HEADS = new Set(["Offshore", "Deep", "Med Deep", "X Deep"]);
const LAYER_BAND = { surface: "surface", "sous-surface": "sous-surface", "mi-eau": "eau", "mi-eau à fond": "eau", fond: "eau" };
const LAYER_GROUP = { surface: "surface", "sous-surface": "sous la surface", "mi-eau": "entre deux eaux", "mi-eau à fond": "entre deux eaux et près du fond", fond: "près du fond" };

/** Toutes les options de ta boîte pour ce créneau, notées ; la première est le conseil. */
export function boxOptions(sit, fams, color, K = CATALOGUE) {
  const famOf = Object.fromEntries(fams.map((f) => [f.k, f]));
  const tgt = headTarget(sit);
  const t = sit.terr;
  const rough = sit.currentNow || sit.sea === "agitée";
  const needMass = (sit.wind?.face && sit.wind.F >= 4) || sit.sea === "clapot" || sit.sea === "agitée" || sit.currentNow;
  const calm = !needMass && (sit.sea === "calme" || (sit.windF != null && sit.windF <= 2));
  const out = [];
  for (const b of BOITE) {
    const c = K[b.cat];
    if (!c || !c.layer) continue;                                   // nage inconnue : jamais conseillé
    if (c.layer === "surface" && !t.couches.includes("surface")) continue;
    if (c.layer === "fond" && t.gratter === "non") continue;
    const f = famOf[c.fam];
    const sizes = b.allSizes ? Object.keys(c.sizes).map(Number) : b.size ? [b.size] : [null];
    const st = sizeTarget(sit, c.fam);
    for (const len of sizes.length ? sizes : [null]) {
      const spec = len != null ? c.sizes[len] || {} : {};
      const why = [], warn = [];
      let score = f.score, rig = null, weight = null;
      // Rien au-delà de la puissance de ta canne.
      if (spec.g != null && spec.g > CANNE.max) continue;
      const sf = c.sizeIsWeight ? 0 : sizeFit(len, st); score += st.min != null ? 1.5 * sf : sf;
      // Leurre dur : son poids est fixe ; le vent, le clapot et le courant demandent de la masse.
      if (spec.g != null && !spec.heads && !spec.weights && c.fam !== "weightless") {
        const g = spec.g;
        if (needMass) score += Math.max(-1, Math.min(1, (g - 20) / 15));
        else if (calm) score += Math.max(-0.25, Math.min(0.25, (22 - g) / 40));
        weight = { g, text: `${String(g).replace(".", ",")} g` };
        const shallow = sit.depthEst && (sit.depthEst.cls === "estran" || (sit.depthEst.cls === "peu" && t.gratter === "non"));
        if (c.float === "coulant" && shallow) {
          score -= g >= 30 ? 1 : 0.5;
          warn.push(`coule : peu d'eau ici, le ramener dès l'impact pour le garder au-dessus du ${/goémon/i.test(t.fond || "") ? "goémon" : "fond"}`);
        }
      }
      // Souple sur tête : la tête la plus proche du poids visé.
      if (spec.heads) {
        const h = pickWeight(spec.heads.filter(([, g]) => g <= CANNE.max), tgt);
        weight = { g: h.g, head: h.name, text: `tête ${h.name} ${String(h.g).replace(".", ",")} g`, use: HEAD_USE[h.name] };
        if (h.boat) { score -= 0.6; warn.push(`tête ${h.name} : conçue d'abord pour le bateau (fabricant)`); }
        if (!h.inRange) { score -= 1; warn.push(`aucune tête de cette taille entre ${tgt.lo} et ${tgt.hi} g`); }
      }
      if (spec.weights) {
        const ok = spec.weights.filter((g) => g <= CANNE.max);
        if (!ok.length) continue;
        const h = pickWeight(ok.map((g) => [null, g]), tgt);
        weight = { g: h.g, text: `${String(h.g).replace(".", ",")} g (pré-plombé)` };
        if (!h.inRange) { score -= 1.5; warn.push(`pré-plombé : ${spec.weights.join(", ")} g, hors de la fourchette ${tgt.lo} à ${tgt.hi} g`); }
      }
      // Souples fins (slug, worm, craw) : sans plomb, texan ou tête, selon le fond et le courant.
      if (c.fam === "weightless") {
        if (c.slug && spec.g != null) {
          rig = "sans plomb"; weight = { g: spec.g, text: `${String(spec.g).replace(".", ",")} g, sans plomb` };
          if (needMass) score += spec.g >= 13 ? 0 : -1;
          if (rough) { score -= 0.5; warn.push("trop léger dans le courant ou les vagues : il dérive"); }
        } else if (c.layer === "fond") {
          const h = pickWeight(null, tgt); rig = "texan"; weight = { g: h.g, text: `texan, plomb d'environ ${h.g} g` };
        } else if (t.gratter === "non" && !rough) {
          rig = "sans plomb"; weight = { g: 0, text: `sans plomb, nagé au-dessus du ${/goémon/i.test(t.fond || "") ? "goémon" : "fond"}` };
          if (needMass) { score -= 1; warn.push("léger contre le vent"); }
        } else {
          const h = pickWeight(null, tgt); rig = t.gratter === "texan" ? "texan" : "tête plombée";
          weight = { g: h.g, text: rig === "texan" ? `texan, plomb d'environ ${h.g} g` : `tête plombée d'environ ${h.g} g` };
        }
      }
      if (c.unknown) { score -= 0.75; warn.push("modèle ou taille à préciser"); }
      // Ta canne (14 à 42 g) : un leurre plus léger se lance court ; une tête lourde, avec le corps, frôle la limite.
      const total = spec.heads || c.fam === "shad" || (c.fam === "weightless" && rig !== "sans plomb") ? null : weight?.g;
      if (total != null && total > 0 && total < CANNE.min) { score -= 0.3; warn.push(`${String(total).replace(".", ",")} g : sous la plage de ta canne (${CANNE.min} à ${CANNE.max} g), lancer plus court`); }
      if (spec.heads && weight?.g >= 30) warn.push(`tête de ${weight.g} g : avec le corps du souple, proche des ${CANNE.max} g de ta canne`);
      if (c.fam === "weightless" && rig !== "sans plomb" && weight?.g > CANNE.max) { score -= 1; warn.push(`plomb de ${weight.g} g : au-delà des ${CANNE.max} g de ta canne`); }
      // Ce que disent le fabricant et les sources de CE leurre.
      if (b.cat === "asturie" && len === 150 && sit.sea === "agitée") { score += 1.5; why.push(r("L'Asturie 150 est présenté par sa fiche produit comme le spécialiste des grosses houles.", "ast110")); }
      if (b.cat === "asturie" && len === 110 && calm) { score += 0.5; why.push(r("Sa fiche produit recommande particulièrement l'Asturie 110 en mer calme.", "ast110")); }
      if (b.cat === "zclaw" && sit.wind?.face && sit.wind.F >= 3) { score += 0.5; why.push(r("Lancers longs même vent de face.", "zclaw")); }
      if (b.cat === "mastershad" && sit.currentNow) { score += 0.5; why.push(r("Idéal pour les poissons actifs en pleine eau ou dans les courants.", "fiiishMS")); }
      if (b.cat === "blackminnow" && sit.sea === "agitée") { score += 0.5; why.push(r("Black Minnow 120 ou 140 cité pour la pêche dans les vagues.", "vagues")); }
      if (b.cat === "blackminnow" && nightShallow(sit) && len === 90 && weight?.g <= 10) { score += 0.5; why.push(r("Black Minnow 90 cité pour la nuit (tête 5 g).", "nuit")); }
      if (b.cat === "spindle" && nightShallow(sit) && len === 100 && (weight?.g ?? 0) <= 10) { score += 0.3; why.push(r("Spindle Worm 4\" cité pour la nuit.", "nuit")); }
      if (b.cat === "cpt" && /lançon|équille/i.test(sit.prey?.[0]?.name || "")) { score += 0.5; why.push(r("Crazy Paddle Tail cité sur les zones à lançon (vert ou kaki).", "coloris")); }
      if (b.cat === "darksleeper" && sit.prey?.[0]?.couche === "fond") { score += 0.3; why.push(r("Imite les petits poissons de fond.", "ds95")); }
      if (b.cat === "blackminnow" && t.gratter !== "oui") { score += 0.3; why.push(r("Hameçon texan : passe là où une tête nue accrocherait.", "fiiishBM")); }
      if (c.fam === "shad" && t.gratter === "non") warn.push("fond encroché : le tenir au-dessus du fond, jamais à son contact");
      // Ton journal : bonus borné, pénalité bornée ; les deux sont affichés avec leurs dates.
      const je = sit.journal?.ev?.get(b.cat);
      if (je) {
        let bonus = Math.min(1.2, 0.6 * je.credit) - Math.min(0.6, 0.3 * je.blank);
        if (len && je.sessions.some((x) => x.lens.includes(len))) bonus += 0.15;
        score += bonus;
        why.unshift(journalWhy(je, sit.spotRef, sit.journal.light));
      }
      const col = colorFor(b, color, sit);
      score += 0.3 * col.fit;
      if (col.fit < 0) warn.push("couleur réservée à une autre lumière");
      out.push({
        id: `${b.id}${b.allSizes ? `-${len}` : ""}`, boxId: b.id, cat: b.cat, fam: c.fam, layer: c.layer, layerLabel: LAYER_GROUP[c.layer] || c.layer,
        name: `${c.name}${len ? ` ${len}${c.sizeIsWeight ? " g" : ""}` : ""}`, len: c.sizeIsWeight ? null : len, kind: c.kind, weight, rig, color: col,
        score: +score.toFixed(3), famScore: f.score, sizeWhy: st.why, why, warn, note: b.note || spec.note || null,
        anim: c.anim, facts: c.facts, specSrc: spec.s || null, alt: spec.alt || null,
      });
    }
  }
  return { options: out.sort((a, b) => b.score - a.score), target: tgt };
}

// ═══════════════════════════════════════════════════════════════════
// TON JOURNAL : ce qui t'a fait prendre du poisson dans des conditions proches
// ═══════════════════════════════════════════════════════════════════
const LURE_ALIASES = [
  [/asturie/i, "asturie"], [/z[\s-]?claw/i, "zclaw"], [/patchinko/i, "patchinko"], [/\bm(?:iste)?r\.?\s*joe/i, "mrjoe"],
  [/black\s*minnow|\bbm\s?\d{2,3}\b/i, "blackminnow"], [/crazy\s*paddle|\bcpt\b/i, "cpt"], [/master\s*shad/i, "mastershad"],
  [/dark\s*sleeper/i, "darksleeper"], [/curly/i, "curlyspindle"], [/spindle/i, "spindle"], [/x[\s-]?layer/i, "xlayer"],
  [/\bcraw/i, "craw"], [/drag\s*metal|\bjigs?\b/i, "dragmetal"], [/balsa/i, "balsa"], [/artist|bavette/i, "bavette"],
];
/** Leurres reconnus dans le texte libre d'une session (« Asturie 130 blanc · Asturie 110 Cabot »). */
export function parseLures(text, K = CATALOGUE) {
  const out = [];
  for (const part of String(text || "").split(/[·,;+/]|\bet\b/i)) {
    for (const [re, cat] of LURE_ALIASES) {
      if (!re.test(part) || (cat === "spindle" && /curly/i.test(part))) continue;
      const m = part.match(/\b(\d{2,3})\b/);
      const len = m && K[cat]?.sizes?.[+m[1]] ? +m[1] : null;
      if (!out.some((x) => x.cat === cat && x.len === len)) out.push({ cat, len });
    }
  }
  return out;
}
function entryLight(e) {
  const l = String(e?.cond?.lumiere || "").toLowerCase();
  if (/aube|crépuscule/.test(l) || e?.moment === "coucher" || e?.moment === "lever") return "basse";
  if (/nuit/.test(l)) return "nuit";
  if (/jour/.test(l)) return "jour";
  return null;
}
const lightGroup = (sit) => (sit.light === "nuit" ? "nuit" : sit.light === "basse" ? "basse" : "jour");
const LIGHT_WORD = { basse: "en basse lumière", nuit: "de nuit", jour: "de jour" };
/**
 * Sessions du journal comparables à ce créneau : même spot (ou même zone, comptée moitié), même
 * lumière (aube et crépuscule ensemble). Une session sans lumière connue ne compte que sur le même
 * spot, pour moitié. Un leurre parmi plusieurs notés ne reçoit qu'une part de la session.
 */
export function journalEvidence(entries, spot, sit, K = CATALOGUE) {
  const ev = new Map();
  const zoneOf = (id) => allSpots().find((x) => x.id === id)?.zone;
  const L0 = lightGroup(sit);
  for (const e of entries || []) {
    if (!e?.spotId || e.fish == null || e.fish === "" || !Number.isFinite(+e.fish)) continue;
    const L = entryLight(e);
    if (L && L !== L0) continue;
    const same = e.spotId === spot.id, zone = !same && zoneOf(e.spotId) === spot.zone;
    if (!same && !(zone && L)) continue;
    const refs = e.lureRef?.cat ? [e.lureRef] : parseLures(e.lure, K);
    const cats = [...new Set(refs.map((x) => x.cat))];
    if (!cats.length) continue;
    const share = (same ? 1 : 0.5) * (L ? 1 : 0.5) / (e.lureRef?.cat ? 1 : cats.length);
    for (const cat of cats) {
      const o = ev.get(cat) || { cat, credit: 0, blank: 0, sessions: [] };
      if (+e.fish > 0) o.credit += share; else o.blank += share;
      o.sessions.push({ date: e.date, fish: +e.fish, spotId: e.spotId, same, multi: cats.length > 1 && !e.lureRef?.cat, lens: refs.filter((x) => x.cat === cat && x.len).map((x) => x.len) });
      ev.set(cat, o);
    }
  }
  return { ev, light: L0 };
}
function journalWhy(o, spot, light) {
  const d = (iso) => new Date(iso + "T12:00").toLocaleDateString("fr-FR", { day: "numeric", month: "numeric", year: "numeric" });
  const parts = o.sessions.slice(-4).map((x) => `${x.fish > 0 ? `${x.fish} bar${x.fish > 1 ? "s" : ""}` : "bredouille"} le ${d(x.date)}${x.same ? "" : ` (${allSpots().find((s) => s.id === x.spotId)?.name || x.spotId})`}${x.multi ? ", avec d'autres leurres" : ""}`);
  return r(`Ton journal, ${o.sessions.some((x) => x.same) ? `à ${spot.name}` : "dans le secteur"} ${LIGHT_WORD[light]} : ${parts.join(" ; ")}.`, "journal");
}

/** Le conseil dans ta boîte, un plan B dans une autre couche, et la parade aux suiveurs. */
export function boxPick(sit, fams, color, K = CATALOGUE) {
  const { options, target } = boxOptions(sit, fams, color, K);
  // Une seule taille par modèle dans la liste affichée.
  const seen = new Set();
  const uniq = options.filter((o) => (seen.has(o.boxId) ? false : (seen.add(o.boxId), true)));
  const main = uniq[0] || null;
  const alts = [];
  if (main) {
    const other = uniq.find((o) => LAYER_BAND[o.layer] !== LAYER_BAND[main.layer] && o.famScore > 0 && !o.warn.includes("modèle ou taille à préciser"));
    if (other) alts.push({ role: `Plan B, ${other.layerLabel}`, ...other });
    if (main.layer === "surface") {
      const joe = uniq.find((o) => o.cat === "mrjoe");
      if (joe && joe.boxId !== other?.boxId) alts.push({ role: "Si les bars suivent sans prendre", ...joe, why: [r("Très efficace sur les prédateurs qui suivent les stickbaits flottants sans attaquer.", "mrjoe"), ...joe.why] });
    }
  }
  return { main, alts, ranked: uniq, target };
}

/** Leurres de la fiche du spot, classés pour la situation. */
export function spotLuresRanked(spot, fams) {
  const rank = Object.fromEntries(fams.map((f, i) => [f.k, { i, score: f.score }]));
  return (spot.lures || []).map((l) => ({ ...l, fam: familyOf(l) }))
    .map((l) => ({ ...l, fit: rank[l.fam]?.score ?? 0 }))
    .sort((a, b) => b.fit - a.fit);
}

/** Conseil complet pour un spot à un créneau. */
export function lureAdvice(spot, w, live, dateISO, ctx = {}) {
  const sit = lureSituation(spot, w, live, dateISO);
  sit.spotRef = { id: spot.id, name: spot.name };
  const K = catalogWith(ctx.boxOv);
  sit.journal = ctx.journal?.length ? journalEvidence(ctx.journal, spot, sit, K) : null;
  const fams = familyRanking(sit);
  const best = fams[0];
  const color = colorAdvice(sit);
  const box = boxPick(sit, fams, color, K);
  const pick = box.main;
  // Familles à égalité en tête : annoncées comme telles (le départage par la fiche reste visible).
  const tiedTop = fams.filter((f) => f.score === best.score);
  return {
    sit, fams, best, color,
    size: sizeAdvice(sit),
    weight: weightAdvice(sit, best.k, pick, box.target),
    anim: animationAdvice(sit, best.k, pick),
    models: citedModels(sit),
    pick, alts: box.alts, boxRanked: box.ranked, target: box.target, tiedTop,
    spotLures: spotLuresRanked(spot, fams),
    summary: pick ? `${pick.name.replace(/^(Xorus|Fiiish|Megabass|Sakura) /, "")} · ${pick.weight?.text || ""}${pick.color?.named ? ` · ${pick.color.name}` : ""}`.replace(/ · $/, "")
      : `${best.court} · ${color.label.split(" :")[0].toLowerCase()}`,
  };
}
