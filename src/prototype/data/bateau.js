// Données du prototype BATEAU — FICTIVES, sauf la météo horaire.
//
// Le moteur BATEAU n'existe pas encore (phase 10, reportée par Félix le 19 novembre). Ce fichier remplit les écrans
// d'après la spécification de la phase 9 (docs/SPEC-MOTEUR-BATEAU.md) :
//   - le bateau, les zones (« tes marques ») et les sorties sont des EXEMPLES inventés, marqués à l'écran ;
//   - la météo horaire est celle, réelle, du 16 mai 2026 (archive Open-Meteo, cellule de la Pointe de Pen-Hir), la même
//     journée que le prototype BORD ;
//   - les règles de sécurité SEC_* sont appliquées ici à la main, avec les seuils PROPOSÉS à Félix (à décider) : vent
//     « à vérifier » dès la force 5 ou 50 km/h de rafales, « non recommandé » dès la force 6 ou 60 km/h ; mer « à
//     vérifier » dès 1,25 m ; visibilité inconnue « à vérifier ».
//   - la réglementation est la vraie (data/knowledge/bateau.json, 2026).
import bord from "./bord.json";

export const DEMO = "Exemple : bateau, zones et sorties inventés ; météo réelle du 16 mai 2026 ; règles de la spécification BATEAU appliquées à la main (le moteur est en phase 10).";

export const BOAT = {
  nom: "Ton semi-rigide (exemple)", categorie: "C", armement: "côtier", longueur: "5,8 m", vitesse: 18,
  port: { nom: "Port du Moulin Blanc", lat: 48.3906, lon: -4.4283 },
  limites: { vent: 4, mer: 1.0 }, seul: false,
  materiel: [
    { t: "Daiwa Megaforce Jigging 170 HS", s: "90 à 210 g · jigging" },
    { t: "Shimano Stradic 4000", s: "tresse 8 brins 16/100, 150 m" },
    { t: "Fluorocarbone 20 lb", s: "30 lb envisagé pour les épaves" },
  ],
};

const NM = 1852;
export function milles(a, b) {
  const R = 6371000, toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat), dLon = toR(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLon / 2) ** 2;
  return (2 * R * Math.asin(Math.sqrt(h))) / NM;
}

// Zones d'exemple. Les positions sont plausibles, les noms inventés : aucune ne désigne une marque réelle.
export const ZONES = [
  { id: "z1", nom: "Tombant du Goulet", type: "tombant", prof: 32, lat: 48.338, lon: -4.585, abri: "Port du Moulin Blanc" },
  { id: "z2", nom: "Roches de l'anse", type: "roche", prof: 14, lat: 48.285, lon: -4.6, abri: "Port de Camaret" },
  { id: "z3", nom: "Épave du large", type: "épave", prof: 46, lat: 48.248, lon: -4.735, abri: "Port de Camaret" },
  { id: "z4", nom: "Basse de l'Iroise", type: "banc", prof: 58, lat: 48.33, lon: -4.9, abri: "Port du Moulin Blanc" },
].map((z) => ({ ...z, demo: true }));

// Abris choisis (spécification : la distance se mesure aux abris choisis par toi, jamais à un port supposé).
export const ABRIS = [
  { nom: "Port du Moulin Blanc", lat: 48.3906, lon: -4.4283 },
  { nom: "Port de Camaret", lat: 48.2793, lon: -4.5946 },
];

/** Distance (milles) au plus proche abri choisi, et limite de l'armement côtier (6 milles, division 240). */
export function zoneSafety(z) {
  const d = Math.min(...ABRIS.map((a) => milles(a, z)));
  const lim = { basique: 2, "côtier": 6, "semi-hauturier": 60 }[BOAT.armement];
  return { d: Math.round(d * 10) / 10, lim, ok: d <= lim, near: d > lim * 0.8 && d <= lim };
}

// Météo horaire réelle (cellule de la Pointe de Pen-Hir, 16 mai 2026) et règles SEC_* appliquées à la main.
const H = (bord.spots.find((s) => s.id === "penhir")?.hourly || []).filter((x) => x.h >= 6 && x.h <= 14);
const beaufort = (kmh) => [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118].findIndex((t) => kmh < t);
export const HOURS = H.map((x) => {
  const bf = beaufort(x.wind ?? 0);
  const vent = x.wind == null ? "inconnu" : bf >= 6 || (x.gust ?? 0) >= 60 ? "nr" : bf >= 5 || (x.gust ?? 0) >= 50 ? "verify" : "ok";
  const mer = x.wave == null ? "inconnu" : x.wave >= 2 ? "nr" : x.wave >= 1.25 ? "verify" : "ok";
  return { ...x, bf, vent, mer, visi: "inconnu" };
});
const worst = (k) => (HOURS.some((h) => h[k] === "nr") ? "nr" : HOURS.some((h) => h[k] === "verify" || h[k] === "inconnu") ? "verify" : "ok");
const maxBy = (k) => HOURS.reduce((m, h) => ((h[k] ?? -1) > (m?.[k] ?? -1) ? h : m), null);

export const SORTIE = {
  depart: "07h00", retour: "12h00", creneau: [7, 12],
  regles: [
    (() => { const z = ZONES[0], s = zoneSafety(z); return { id: "SEC_ARMEMENT", t: "Distance d'un abri", st: s.ok ? (s.near ? "verify" : "ok") : "nr",
      d: `${z.nom} à ${String(s.d).replace(".", ",")} mille${s.d >= 2 ? "s" : ""} du plus proche abri choisi ; limite de ton armement ${BOAT.armement} : ${s.lim} milles.` }; })(),
    { id: "SEC_CATEGORIE", t: "Catégorie de conception C", st: "ok", d: "Limite : force 6 et 2 m de vagues. Pire moment du créneau : force " + (maxBy("wind")?.bf ?? "?") + ", " + (maxBy("wave")?.wave ?? "?") + " m." },
    { id: "SEC_VENT", t: "Vent et rafales", st: worst("vent"), d: `Maximum ${maxBy("wind")?.wind ?? "?"} km/h à ${maxBy("wind")?.h ?? "?"} h, rafales ${maxBy("gust")?.gust ?? "?"} km/h à ${maxBy("gust")?.h ?? "?"} h. Seuils proposés : à vérifier dès force 5 ou 50 km/h.` },
    { id: "SEC_MER", t: "État de la mer", st: worst("mer"), d: `Vagues de ${String(Math.min(...HOURS.map((h) => h.wave ?? 9))).replace(".", ",")} à ${String(Math.max(...HOURS.map((h) => h.wave ?? 0))).replace(".", ",")} m : « peu agitée ». À vérifier dès « agitée » (1,25 m).` },
    { id: "SEC_BMS", t: "Bulletin météo spécial", st: "verify", d: "Aucune force 7 prévue. L'application ne lit pas encore les BMS : vérifie sur Météo-France ou le canal 16." },
    { id: "SEC_VISIBILITE", t: "Visibilité", st: "verify", d: "Inconnue : le modèle AROME servi par Open-Meteo ne la fournit pas. Jamais « au vert » sans elle." },
    { id: "SEC_ORAGE", t: "Orage", st: "ok", d: "Aucun orage prévu sur le créneau." },
    { id: "SEC_NUIT", t: "Retour avant la nuit", st: "ok", d: `Retour prévu à 12h00, coucher du soleil à ${bord.sun.sunset}.` },
    { id: "SEC_DONNEES", t: "Âge des données", st: "ok", d: "Prévision de la nuit, qui couvre tout le créneau." },
  ],
};
SORTIE.verdict = SORTIE.regles.some((r) => r.st === "nr") ? "nr" : SORTIE.regles.some((r) => r.st === "verify") ? "verify" : "ok";
SORTIE.raisons = SORTIE.regles.filter((r) => r.st !== "ok");

// Espèces : la réglementation est la vraie (2026) ; présence et scores d'exemple, selon la spécification.
export const ESPECES = [
  { id: "lieu-jaune", nom: "Lieu jaune", latin: "Pollachius pollachius", photo: "lieu-jaune-boudin", fav: 74, pert: 82, conf: 48,
    statut: "ouvert", reg: "2 par jour · 42 cm · marquage · RecFishing", regNote: "Fermé du 1er janvier au 30 avril, relâcher compris.",
    presence: "Retour sur les épaves et tombants après le frai (février à mai).", technique: "Jig ou leurre souple : toucher le fond, remonter lentement à mi-hauteur.",
    why: ["Tombant dur à 32 m (structure 30/30)", "Courant établi en fin de flot", "Aube : lumière basse"], watch: ["Effet de la marée et de la lumière : sans source (hypothèse)"] },
  { id: "maquereau", nom: "Maquereau", latin: "Scomber scombrus", photo: "maquereau-banquette", fav: 68, pert: 90, conf: 58,
    statut: "ouvert", reg: "10 par jour · 20 cm · marquage · RecFishing", presence: "En côte quand l'eau dépasse 11 °C : 14,8 °C aujourd'hui.",
    technique: "Train de plumes ou petit jig, souvent entre 15 et 30 m ; chercher les oiseaux.", why: ["Eau à 14,8 °C", "Pêche de jour", "Bancs en côte de mai à octobre"], watch: [] },
  { id: "bar", nom: "Bar", latin: "Dicentrarchus labrax", photo: "bar-boudin", fav: 61, pert: 76, conf: 44,
    statut: "ouvert", reg: "3 par jour au nord du 48e parallèle · 42 cm · RecFishing", presence: "Retour côtier au printemps (biologie du mode BORD).",
    technique: "Leurre souple ou stickbait sur les plateaux et roches dans le courant.", why: ["Saison de retour", "Lumière basse à l'aube"], watch: ["Critères bateau sans source (hypothèses)"] },
  { id: "vieille", nom: "Vieille", latin: "Labrus bergylta", art: "vieille", fav: 55, pert: 70, conf: 52,
    statut: "inconnu", reg: "Taille et quota : inconnus (absents des textes lus)", presence: "Résidente toute l'année, plus active au printemps et en été.",
    technique: "Leurre souple texan ou appât, au ras des roches et des laminaires.", why: ["Roches et laminaires, 14 m", "Pêche de jour"], watch: ["Réglementation à vérifier"] },
  { id: "saint-pierre", nom: "Saint-pierre", latin: "Zeus faber", art: "saint-pierre", fav: null, pert: 64, conf: 22,
    statut: "inconnu", reg: "Taille et quota : inconnus (absents des textes lus)", presence: "Saison en côte en Bretagne : inconnue (source à trouver).",
    technique: "Près du fond, 50 à 150 m ; vif ou leurre lent.", why: [], watch: ["Pas de note : moins de la moitié des critères sont connus"] },
  { id: "lieu-noir", nom: "Lieu noir", latin: "Pollachius virens", photo: "lieu-noir-boudin", fav: null, pert: null, conf: 18,
    statut: "decision", reg: "35 cm · marquage", presence: "Rare à la limite sud de son aire (golfe de Gascogne).",
    technique: "Jig dans le courant, plus profond en hiver.", why: [], watch: ["Proposé seulement si tu en as déjà pris : à décider (question 20)"] },
];

export const SORTIES = [
  { date: "2026-05-02", zone: "Tombant du Goulet", h: "06h40 – 11h10", prises: [{ e: "Lieu jaune", n: 3, g: 2 }, { e: "Vieille", n: 2, g: 0 }], meteo: "OSO 3, 0,4 m", demo: true },
  { date: "2026-04-18", zone: "Roches de l'anse", h: "08h00 – 12h30", prises: [{ e: "Maquereau", n: 0, g: 0 }], meteo: "N 4, 0,6 m", note: "Lieu jaune fermé jusqu'au 30 avril : non ciblé.", demo: true },
  { date: "2026-03-29", zone: "Épave du large", h: "07h15 – 11h45", prises: [{ e: "Bar", n: 1, g: 0 }], meteo: "O 3, 0,9 m", demo: true },
];
