// Phase 5 V3, sous-tâche 5.12 (passe exhaustive) : évaluations § 7.1 des pages lues le 23 nov. 2026, source par source.
// Chaque évaluation dit ce que la page affirme exactement (affirmation), si elle attache le bar au poste (bar_au_poste)
// et comment elle a été lue (lecture : page entière par l'outil de lecture, ou extrait de la page renvoyé par le moteur
// de recherche). Les sources nouvelles (pages non citées par la V2) sont dans NOUVELLES, rattachées à leur fiche.
// Ce script écrit les évaluations dans data/sources/registre.json (que sources-registre.mjs garde ensuite) et les
// sources nouvelles dans data/sources/manuelles.json ; il ne touche à aucune autre donnée.
//   node scripts/evaluer-pages.mjs && node scripts/sources-registre.mjs && node scripts/qualifier-fiches.mjs
import fs from "node:fs";
import path from "node:path";
import { lireFiches, DIR_FICHES, ecrireRegistre } from "./registre-spots.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const JOUR = "2026-11-23";
const CIT = "droit de citation : courte citation, référence et faits tirés ; pas de copie";

// Pages de mieuxpecher.com lues (outil de lecture, 23 nov. 2026).
const MP_NORD = { url: "https://mieuxpecher.com/finistere-nord-coins-de-peche/", titre: "Coins de pêche – Finistère NORD", auteur: "Norbert (mieuxpecher.com)", date: "2018-05-10 (modifiée le 2018-10-16)" };
const MP_SUD = { url: "https://mieuxpecher.com/finistere-sud-coins-de-peche/", titre: "Coins de Pêche – Finistère SUD", auteur: "Norbert (mieuxpecher.com)", date: "2018-06-17 (modifiée le 2022-02-28)" };
const MP_TOP = { url: "https://mieuxpecher.com/10-coins-de-peche-en-bretagne-1/", titre: "Top 10 des Coins de Pêche en Bretagne (1/2)", auteur: "Norbert (mieuxpecher.com)", date: "2018 (mise à jour 2020 d'après la V2)" };
const mp = (page, item, { bar = false, lecture = "page entière (outil de lecture)" } = {}) => ({
  statut: "évaluée", auteur: page.auteur, date: page.date, url_lue: page.url, lecture,
  methode: "liste de « meilleurs coins de pêche du bord » sans méthode publiée ; « pas exhaustive » selon la page",
  precision: "nom du lieu seulement ; ni poste, ni marée, ni date d'observation (sauf mention jointe à l'élément)",
  independance: "éditeur mieuxpecher.com (groupe propre) ; source d'origine de nombreux spots V2",
  limites: "liste ancienne et non sourcée ; ne prouve qu'une réputation", droits: CIT, consulte_le: JOUR,
  affirmation: `« ${page.titre} » cite : « ${item} »`, bar_au_poste: bar,
});
export const EVALUATIONS = {
  "src-mieuxpecher-com-11a42d": mp(MP_NORD, "Pointe de Kermorvan"),
  "src-mieuxpecher-com-1b6020": mp(MP_NORD, "Pointe de Corsen à Plouarzel"),
  "src-mieuxpecher-com-30bb60": mp(MP_NORD, "Plage des Blancs-Sablons au Conquet"),
  "src-mieuxpecher-com-318609": mp(MP_NORD, "Enez Amann ar rouz à Kerlouan"),
  "src-mieuxpecher-com-3a1b38": mp(MP_NORD, "Roc’h ar Pelguent à Plouguerneau"),
  "src-mieuxpecher-com-3e943c": mp(MP_NORD, "La presqu’île Sainte-Marguerite aux leurres souples"),
  "src-mieuxpecher-com-3ff077": mp(MP_NORD, "L’embouchure de la Penzée à Carantec"),
  "src-mieuxpecher-com-4a6bbb": mp(MP_NORD, "Les abords de la Pointe de Lostmarc’h à Crozon"),
  "src-mieuxpecher-com-59001e": mp(MP_NORD, "Penn Enez à Plouguerneau"),
  "src-mieuxpecher-com-5f7545": mp(MP_NORD, "L’embouchure de l’Aber Idult"),
  "src-mieuxpecher-com-604583": mp(MP_NORD, "Les digue à Audierne"),
  "src-mieuxpecher-com-7ce072": mp(MP_NORD, "Pointe de Trénaouret en début de montante"),
  "src-mieuxpecher-com-8efb4c": mp(MP_NORD, "Pointe des Espagnols, à condition de trouver les accès…"),
  "src-mieuxpecher-com-a3c6e6": mp(MP_NORD, "Pointe du Cosmeur à Carantec"),
  "src-mieuxpecher-com-ac5a35": mp(MP_NORD, "Les alentours de la pointe de Primel"),
  "src-mieuxpecher-com-b0f79e": mp(MP_NORD, "Les environs du château de Dinan à Crozon"),
  "src-mieuxpecher-com-b185a3": mp(MP_NORD, "Le Grand et le petit Minou"),
  "src-mieuxpecher-com-b4850a": mp(MP_NORD, "La Pointe de Leydé"),
  "src-mieuxpecher-com-ba6412": mp(MP_NORD, "La pointe de Brezellec"),
  "src-mieuxpecher-com-bd7b0b": mp(MP_NORD, "Pointe de Feunteun Aod à Plogoff"),
  "src-mieuxpecher-com-bed4e8": mp(MP_NORD, "La pointe de Locquirec » et « La digue de Locquirec à la nuit tombée"),
  "src-mieuxpecher-com-df233a": mp(MP_NORD, "La Pointe et les abords du port de plaisance de Morgat"),
  "src-mieuxpecher-com-06c6f4": mp(MP_SUD, "La rivière et l'estuaire de l'Odet"),
  "src-mieuxpecher-com-11af92": mp(MP_SUD, "Beg Meil"),
  "src-mieuxpecher-com-278e6e": mp(MP_SUD, "Pointe de Kerjean"),
  "src-mieuxpecher-com-2baae9": mp(MP_SUD, "Autour du phare d'Eckmuhl à Penmarch"),
  "src-mieuxpecher-com-509c0f": mp(MP_SUD, "Cap Coz"),
  "src-mieuxpecher-com-77b97b": mp(MP_SUD, "Embouchure de l'Aven et du Belon"),
  "src-mieuxpecher-com-8716b2": mp(MP_SUD, "Concarneau : Les bordures de plage » et « La pointe de Trévignon"),
  "src-mieuxpecher-com-c37d1a": mp(MP_SUD, "La pointe de Rospico"),
  "src-mieuxpecher-com-ceb5da": mp(MP_SUD, "L'estuaire de de la Laïta"),
  "src-mieuxpecher-com-e73489": mp(MP_SUD, "Pointe de Mousterlin à Fouesnant"),
  "src-mieuxpecher-com-fd2285": mp(MP_SUD, "Île Conq à Saint Guénolé"),
  "src-mieuxpecher-com-613cb6": mp(MP_TOP, "Le secteur de Paluden jusqu’au pont du Diable est un secteur à ne pas manquer", { lecture: "extrait de la page renvoyé par le moteur de recherche" }),
  "src-mieuxpecher-com-f242a9": mp(MP_TOP, "Les abers sont réputés assez faciles à pêcher du bord et pleins de bars et de mulets » ; « trois Abers principaux : Benoit, Wrac’h et Idult", { bar: true, lecture: "extrait de la page renvoyé par le moteur de recherche" }),
};

// carnet-de-peche.com : fiches de spots rédigées par l'équipe (« sélectionnés et documentés par l'équipe Carnet de
// Pêche »), coordonnées floutées en accès gratuit (positions précises réservées aux abonnés : jamais reprises).
const cdp = (url, affirmation, bar) => ({
  statut: "évaluée", auteur: "équipe Carnet de Pêche (carnet-de-peche.com)", date: "2026 (pages vues par le moteur de recherche il y a 80 à 165 jours)", url_lue: url,
  lecture: "extrait de la page renvoyé par le moteur de recherche (description complète du spot)",
  methode: "fiche rédigée par l'éditeur ; méthode de sélection non publiée ; prises déclarées par les utilisateurs affichées à part",
  precision: "lieu nommé, structure, espèces, technique et moment de marée quand ils sont décrits ; position floutée de plusieurs centaines de mètres",
  independance: "éditeur carnet-de-peche.com (groupe propre)", limites: "description générique possible ; aucune date d'observation ; ne dit rien des dangers ni des règles locales",
  droits: `${CIT} ; positions précises payantes, jamais reprises`, consulte_le: JOUR, affirmation, bar_au_poste: bar,
});
EVALUATIONS["src-carnet-de-peche-com-10c969"] = cdp("https://www.carnet-de-peche.com/spots/pointe-de-penmarch", "« Terrain de roches plates battues par la houle d'Atlantique, où le bar chasse dans le ressac dès que la mer bouge. Tu pêches aux leurres depuis les bordures hautes, jamais au ras de l'eau. »", true);
EVALUATIONS["src-carnet-de-peche-com-f09448"] = cdp("https://www.carnet-de-peche.com/spots/pointe-de-mousterlin", "« Le poste est réputé pour le bar et le congre » ; « Aux leurres, cherche les bordures du platier au début de la montante. »", true);

EVALUATIONS["src-carnet-de-peche-com-5c39ae"] = cdp("https://www.carnet-de-peche.com/spots/cap-coz-fouesnant", "« le bar longe la flèche à la montante et l'estran rocheux qui découvre donne du terrain sur les bordures. Leurres en bordure, surfcasting côté baie. »", true);

/** Sources nouvelles : pages lues qui nomment un spot V2 sans que la V2 les cite. */
export const NOUVELLES = [];

if (import.meta.url === `file://${process.argv[1]}`) {
  const F_REG = path.join(root, "data/sources/registre.json");
  const reg = JSON.parse(fs.readFileSync(F_REG, "utf8"));
  let n = 0;
  for (const s of reg.sources) if (EVALUATIONS[s.id]) { s.evaluation = EVALUATIONS[s.id]; if (s.famille == null) s.famille = 4; n++; }
  const manque = Object.keys(EVALUATIONS).filter((id) => !reg.sources.some((s) => s.id === id));
  if (manque.length) throw new Error(`sources absentes du registre : ${manque.join(", ")}`);
  fs.writeFileSync(F_REG, JSON.stringify(reg, null, 1) + "\n");
  const F_MAN = path.join(root, "data/sources/manuelles.json");
  const man = JSON.parse(fs.readFileSync(F_MAN, "utf8"));
  for (const s of NOUVELLES) {
    const { spot, ...src } = s;
    const i = man.sources.findIndex((x) => x.id === s.id);
    const entree = { ...src, url: s.evaluation.url_lue, type: "site, guide ou presse spécialisée", famille: 4, niveau_v2: null };
    if (i >= 0) man.sources[i] = entree; else man.sources.push(entree);
    for (const { fichier, fiche: f } of lireFiches()) if (f.id === spot && !f.provenance.sources.includes(s.id)) {
      f.provenance.sources = [...f.provenance.sources, s.id].sort();
      fs.writeFileSync(path.join(DIR_FICHES, fichier), JSON.stringify(f, null, 1) + "\n");
    }
  }
  fs.writeFileSync(F_MAN, JSON.stringify(man, null, 1) + "\n");
  ecrireRegistre();
  console.log(`[pages lues] ${n} sources V2 évaluées page par page ; ${NOUVELLES.length} source(s) nouvelle(s)`);
}
