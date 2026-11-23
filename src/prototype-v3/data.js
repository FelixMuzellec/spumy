// SPUMY V3 — données de DÉMONSTRATION du prototype (phase 3). Aucune n'est un calcul du moteur :
// scores, horaires, marée du jour, vent et journal sont inventés pour éprouver les écrans ; les spots, leurs positions,
// leurs temps de route et leurs fenêtres de marée viennent des fiches V2 (data/sites/pirou.config.js).
import { tierOf, isFavorable } from "../design/v3/tokens.js";

export const DEMO_NOTE = "Prototype · données de démonstration";

/** Photos du catalogue utilisées par le prototype (copiées à la construction de la page de revue). */
export const PHOTO_SET = ["platier-aube-frontale", "roche-ciel-bleu", "falaises-couchant", "jigging-console-sondeur", "falaise-mer-formee", "roches-eau-turquoise",
  "lancer-ressac", "nuit-frontale", "estuaire-pres-sales", "plage-averse", "bar-eau-claire", "lieu-noir-pont-jig", "lieu-jaune-goemon", "maquereau-roche",
  "mesure-bar", "silhouette-couchant", "bar-roche"];

/** Photo d'illustration de chaque espèce (fiches et cartes BATEAU). */
export const SPECIES_PHOTO = { Bar: "bar-eau-claire", "Lieu jaune": "lieu-jaune-goemon", "Lieu noir": "lieu-noir-pont-jig", Maquereau: "maquereau-roche" };

/** Heures décimales → « HH:MM ». */
export const hhmm = (h) => {
  const t = ((h % 24) + 24) % 24, H = Math.floor(t), M = Math.round((t - H) * 60);
  return `${String(M === 60 ? H + 1 : H).padStart(2, "0")}:${String(M === 60 ? 0 : M).padStart(2, "0")}`;
};
export const span = (w) => (w ? `${hhmm(w[0])}–${hhmm(w[1])}` : null);

export const NOW = 9 + 10 / 60; // 09:10
export const SUN = { rise: 8 + 21 / 60, set: 17 + 12 / 60 };
export const TIDE = { pm: 13 + 53 / 60, bm: 7 + 40 / 60, coef: 78, period: 12.42, mean: 6.4, amp: 4.9 };
export const tideHeight = (t) => TIDE.mean + TIDE.amp * Math.cos((2 * Math.PI * (t - TIDE.pm)) / TIDE.period);

/** Lieux connus de la recherche de démonstration. */
export const PLACES = [
  { name: "Pirou", sub: "Manche" }, { name: "Granville", sub: "Manche" }, { name: "Crozon", sub: "Finistère" }, { name: "Crozon-Morgat", sub: "plage" },
  { name: "Carteret", sub: "Manche" }, { name: "Plouguerneau", sub: "Finistère" }, { name: "Saint-Pierre-Quiberon", sub: "Morbihan" },
  { name: "Barneville-Carteret", sub: "Manche" },
];

// Version 6 : les 8 vrais spots BORD de la fiche de Pirou à moins d'1 h de route (data/sites/pirou.config.js), à leur
// position réelle (coordonnées des fiches, à la minute près : jusqu'à environ 1 km d'écart près de la côte). Les notes, la marée du
// jour, le vent et les résultats du journal restent des DONNÉES DE DÉMONSTRATION.
import { SPOTS as V2 } from "../../data/sites/pirou.config.js";
import { NIVEAUX } from "./connaissances.js";
import { GEO, project, parseDM } from "./geo.js";
export { GEO };

const km = (a, b) => { // distance à vol d'oiseau
  const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const at = (id) => { const v = V2.find((x) => x.id === id); return v.lat ? { lat: v.lat, lon: v.lon } : parseDM(v.coords); };
const HOME = at("pirou");
/** Position de référence : Pirou (fiche du spot Pirou Plage). */
export const REF = { ...project(HOME.lat, HOME.lon), label: "Pirou" };

/** Fenêtres de marée de la fiche, calculées sur la marée du jour (démonstration) ; la première « prime » de jour. */
export function windows(v2) {
  return (v2.tidalRules?.windows || []).map((w) => {
    const base = w.phase === "pm" ? TIDE.pm : TIDE.bm;
    return { ...w, from: base + w.offsetBefore, to: base + w.offsetAfter };
  });
}
const firstPrime = (v2) => windows(v2).filter((w) => w.priority === "prime" && w.to > SUN.rise && w.from < SUN.set).sort((a, b) => a.from - b.from)[0];

/** Les 8 spots ; demo : note, Confiance, statut, houle prévue, raison, journal (tout ce qui n'est pas dans la fiche). */
const DEMO = [
  { id: "granville", fav: 92, conf: 48, level: "Faible", safety: "ok", swell: 1.4, photo: "falaise-mer-formee", lieu: "pointe", trips: 6, fish: 11, reason: "courant de flot sur la pointe du Roc, eau teintée par la houle" },
  { id: "agon", fav: 84, conf: 69, level: "Moyenne", safety: "ok", swell: 1.3, photo: "estuaire-pres-sales", lieu: "estuaire", trips: 18, fish: 42, reason: "montant sur les bancs de sable, puis veine du havre au jusant" },
  { id: "gouville", fav: 79, conf: 81, level: "Haute", safety: "ok", swell: 1.2, photo: "lancer-ressac", lieu: "rochers", trips: 9, fish: 14, reason: "montant entre les tables et sur les roches proches du bord" },
  { id: "pirou", fav: 71, conf: 55, level: "Moyenne", safety: "ok", swell: 1.2, photo: "roches-eau-turquoise", lieu: "rochers", trips: 24, fish: 37, reason: "épis et tables à mi-marée montante" },
  { id: "carteret", fav: 62, conf: 62, level: "Moyenne", safety: "ok", swell: 1.5, photo: "roche-ciel-bleu", lieu: "pointe", trips: 3, fish: 2, reason: "pied du cap au flot, courant soutenu" },
  { id: "regneville", fav: 54, conf: 70, level: "Moyenne", safety: "ok", swell: 0.9, photo: "estuaire-pres-sales", lieu: "estuaire", trips: 5, fish: 4, reason: "jusant à la sortie du havre de la Sienne" },
  // Portbail reprend la fixture du référentiel (§ 6.7.2) : Favorabilité 53 — À vérifier, Confiance 69 — Moyenne.
  { id: "portbail", fav: 53, conf: 69, level: "Moyenne", safety: "unknown", status: "verify", verifyWhy: "Houle non documentée sur le platier : sécurité à vérifier", swell: null, photo: "lancer-ressac", lieu: "rochers", trips: 2, fish: 0, reason: "houle non documentée" },
  { id: "surtainville", fav: 45, conf: 66, level: "Moyenne", safety: "danger", status: "nr", swell: 2.4, photo: "plage-averse", lieu: "plage", trips: 0, fish: 0, reason: "houle au-delà de la limite du spot" },
];

// Exposition au vent du jour, comme dans effets.js : vent qui entre (± 22,5°), vent de terre, ou vent qui longe la côte.
const gap = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
const expo = (v2, from) => ((v2.exposedAngles || []).some((a) => gap(a, from) <= 22.5) ? "de face" : (v2.shelteredAngles || []).some((a) => gap(a, from) <= 22.5) ? "abrité" : "de côté");

export const SPOTS = DEMO.map((d) => {
  const v2 = V2.find((x) => x.id === d.id), c = at(d.id), pt = project(c.lat, c.lon), w = firstPrime(v2);
  const s = {
    ...d, name: v2.name, kind: String(v2.type || "").toLowerCase(), sub: v2.subtitle, v2, lat: c.lat, lon: c.lon, x: pt.x, y: pt.y,
    route: v2.distMin, km: Math.round(km(HOME, c)), verified: true,
    win: d.status === "nr" ? null : w ? [w.from, w.to] : null, winLabel: w?.label, evidence: NIVEAUX[d.id] || {},
    wind: { from: "NO", bft: 4, gust: 34, expo: expo(v2, windAt(pt.x, pt.y, NOW).fromDeg) },
  };
  if (d.status === "nr") s.nrWhy = `Non recommandé : houle de ${String(d.swell).replace(".", ",")} m prévue, au-delà de la limite de ${String(v2.houleMax).replace(".", ",")} m du spot`;
  if (d.id === "agon" && v2.securite?.[0]) s.danger = `${v2.securite[0].t} (${v2.securite[0].s})`;
  return s;
});

export const SPOT = Object.fromEntries(SPOTS.map((s) => [s.id, s]));
export const favorable = (s) => isFavorable(s.fav, { safetyOk: s.safety === "ok", status: s.status || null });
const admissible = (s) => s.fav !== null && s.safety === "ok" && !s.status && s.win;

/**
 * Classement de Home : par Favorabilité ; place réservée (V3-016) au meilleur admissible à 15 min ou moins
 * si aucun des trois n'y est ; égalités au dernier rang : 4 ou 5 cartes, au-delà un accès aux autres.
 */
export function ranking(list = SPOTS, { scarce = false, tie = false } = {}) {
  let pool = list.filter(admissible).map((s) => ({ ...s }));
  if (scarce) pool = pool.filter((s) => ["regneville", "carteret"].includes(s.id)).map((s) => ({ ...s, fav: s.id === "regneville" ? 44 : 41, ...(s.id === "carteret" ? { win: null, noWinWhy: "coefficient trop faible" } : {}) }));
  if (tie) pool = pool.map((s) => (["gouville", "pirou", "carteret", "regneville"].includes(s.id) ? { ...s, fav: 61 } : s));
  pool.sort((a, b) => b.fav - a.fav || a.route - b.route);
  let top = pool.slice(0, 3);
  if (!scarce && !tie && !top.some((s) => s.route <= 15)) {
    const near = pool.filter((s) => s.route <= 15 && !top.includes(s)).sort((a, b) => b.fav - a.fav)[0];
    if (near) top = [top[0], top[1], { ...near, nearest: true }];
  }
  let extra = 0;
  if (top.length === 3) {
    const tied = pool.filter((s) => s.fav === top[2].fav && !top.some((t) => t.id === s.id));
    if (tied.length) { const add = tied.slice(0, 2); top = top.concat(add); extra = tied.length - add.length; top.forEach((s) => { if (s.fav === top[2].fav) s.tie = true; }); }
  }
  return { cards: top, extra, scarceWhy: scarce ? "2 spots seulement : vent de force 7 sur les côtes exposées." : null };
}

export const verifyList = (list = SPOTS) => list.filter((s) => s.status === "verify");

/** Phrase de synthèse de Home (jamais une promesse). */
export function homePhrase(cards, { scarce } = {}) {
  if (!cards.length || scarce) return { text: "Peu favorable aujourd'hui", sub: "vent de force 7 sur les côtes exposées" };
  const best = cards[0], t = tierOf(best.fav);
  const lead = best.fav >= 90 ? "Très bonne matinée pour le bar" : best.fav >= 75 ? "Bonne matinée pour le bar" : best.fav >= 60 ? "Matinée correcte pour le bar" : "Pêche difficile aujourd'hui";
  return { text: `${lead}\u00a0: ${span(best.win)}`, sub: `à moins d'1 h d'ici · ${best.name} · ${t.word.toLowerCase()}` };
}

/** Marques BATEAU de démonstration (noms et positions inventés, au large, marqués « démo »). */
export const MARKS = [
  { id: "m1", name: "Roche nord (démo)", x: 70, y: 210, depth: "40–55 m", fond: "roche", win: [7, 10.5], safety: "ok", shelter: 4.2,
    species: [{ name: "Lieu jaune", fav: 74, conf: 58, level: "Faible", rule: "taille minimale 30 cm (démo)" }, { name: "Bar", fav: 61, conf: 64, level: "Moyenne", rule: "42 cm minimum ; 2 par jour (démo)" }] },
  { id: "m2", name: "Épave (démo)", x: 40, y: 380, depth: "62 m", fond: "épave", win: [8.5, 11.5], safety: "ok", shelter: 6.8,
    species: [{ name: "Lieu noir", fav: 68, conf: 52, level: "Faible", rule: "aucune taille fixée (démo)" }] },
  { id: "m3", name: "Basse sud (démo)", x: 150, y: 600, depth: "18–25 m", fond: "roche et sable", win: [9, 11], safety: "ok", shelter: 2.9,
    species: [{ name: "Bar", fav: 57, conf: 60, level: "Moyenne", rule: "42 cm minimum (démo)" }] },
  { id: "m4", name: "Banc (démo)", x: 60, y: 520, depth: "30 m", fond: "sable", win: null, safety: "unknown", status: "verify", verifyWhy: "Houle croisée non documentée",
    species: [{ name: "Maquereau", fav: 70, conf: 35, level: "Faible", rule: "—" }] },
];

export const BOATS = [{ id: "sr6", name: "Semi-rigide 6 m", cat: "C", speed: 25, crew: "à plusieurs", default: true }];

/** Vent de démonstration en un point (repère de la carte) à une heure : « d'où il vient », force, rafales. */
export function windAt(x, y, h) {
  const daily = Math.sin(((h - 6) / 24) * 2 * Math.PI);
  const offshore = Math.max(0, (GEO.width - x) / GEO.width);
  const kmh = Math.max(6, Math.round(20 + 16 * offshore + 7 * daily + ((y * 7) % 5)));
  const fromDeg = Math.round(305 + 15 * offshore + 8 * Math.sin(h / 4) + ((x + y) % 7));
  return { fromDeg, kmh, gust: Math.round(kmh * 1.55), bft: beaufort(kmh) };
}
export function waveAt(x, y, h) {
  const offshore = Math.max(0, (GEO.width - x) / GEO.width);
  return { m: Math.round((0.6 + 1.0 * offshore + 0.15 * Math.sin(h / 5)) * 10) / 10, s: Math.round(8 + 3 * offshore), fromDeg: 280 + Math.round(10 * offshore) };
}
export function beaufort(kmh) {
  const lim = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
  const i = lim.findIndex((l) => kmh < l);
  return i === -1 ? 12 : i;
}
export const compass = (deg) => ["N", "NE", "E", "SE", "S", "SO", "O", "NO"][Math.round((((deg % 360) + 360) % 360) / 45) % 8];

/** Journal de démonstration ; « note » = la note affichée au moment de la sortie (JRN-06, V3-030). */
export const JOURNAL = [
  { id: "j1", date: "Sam. 14 nov.", spot: "Gouville-sur-Mer", state: "capture", catches: "bar 46 cm, bar 39 cm", n: 2, h: 2.5, hours: "06:40–09:10", photo: "mesure-bar", note: 81 },
  { id: "j2", date: "Jeu. 12 nov.", spot: "Cap de Carteret", state: "sans_capture", n: 0, h: 1.5, hours: "07:00–08:30", photo: "silhouette-couchant", note: 58 },
  { id: "j3", date: "Dim. 8 nov.", spot: "Pointe d'Agon", state: "resultat_inconnu", note: 77 },
  { id: "j4", date: "Mar. 3 nov.", spot: "Pirou Plage", state: "incomplete", note: 66 },
  { id: "j5", date: "Ven. 30 oct.", spot: "Régnéville", state: "annulee", note: 49 },
];
/** Seuil avant toute conclusion sur les notes face aux sorties (JRN-05, mode BORD : 5 sorties dont 2 avec prise). */
export const JOURNAL_MIN = { sessions: 5, withCatch: 2 };
export const STATE_LABEL = { capture: "Prise", sans_capture: "Sans prise", resultat_inconnu: "Résultat non renseigné", incomplete: "Incomplète", annulee: "Annulée" };
