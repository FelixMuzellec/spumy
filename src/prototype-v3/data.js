// SPUMY V3 — données de DÉMONSTRATION du prototype (phase 3). Aucune n'est un calcul du moteur :
// noms, scores, horaires, marées, vent et temps de route sont inventés pour éprouver les écrans.
import { tierOf, isFavorable } from "../design/v3/tokens.js";

export const DEMO_NOTE = "Prototype · données de démonstration";

/** Heures décimales → « HH:MM ». */
export const hhmm = (h) => {
  const t = ((h % 24) + 24) % 24, H = Math.floor(t), M = Math.round((t - H) * 60);
  return `${String(M === 60 ? H + 1 : H).padStart(2, "0")}:${String(M === 60 ? 0 : M).padStart(2, "0")}`;
};
export const span = (w) => (w ? `${hhmm(w[0])}–${hhmm(w[1])}` : null);

export const NOW = 9 + 10 / 60; // 09:10
export const SUN = { rise: 8 + 21 / 60, set: 17 + 12 / 60 };
export const TIDE = { pm: 12 + 31 / 60, bm: 6 + 12 / 60, coef: 78, period: 12.42, mean: 6.4, amp: 4.9 };
export const tideHeight = (t) => TIDE.mean + TIDE.amp * Math.cos((2 * Math.PI * (t - TIDE.pm)) / TIDE.period);

/** Lieux connus de la recherche de démonstration. */
export const PLACES = [
  { name: "Pirou", sub: "Manche" }, { name: "Crozon", sub: "Finistère" }, { name: "Crozon-Morgat", sub: "plage" },
  { name: "Carteret", sub: "Manche" }, { name: "Plouguerneau", sub: "Finistère" },
];

// Carte schématique : repère 0–1000 × 0–1300, mer à l'ouest. La position de référence est en REF.
export const REF = { x: 640, y: 760, label: "Pirou" };

/** Spots BORD de démonstration. win : [début, fin] en heures ; second : autre période favorable du jour. */
export const SPOTS = [
  { id: "i", name: "Pointe I", kind: "pointe rocheuse", x: 300, y: 260, fav: 92, conf: 48, level: "Faible", safety: "ok", win: [7 + 10 / 60, 10 + 20 / 60], second: [19.5, 20.6], route: 55, km: 47, verified: true,
    reason: "courant de flot sur la pointe, eau teintée après le coup de vent", wind: { from: "NO", bft: 4, gust: 38, expo: "de côté" }, photo: "falaise-mer-formee", lieu: "pointe" },
  { id: "a", name: "Pointe A", kind: "platier et pointe", x: 455, y: 560, fav: 82, conf: 69, level: "Moyenne", safety: "ok", win: [7.5, 11], second: [19 + 40 / 60, 21], route: 24, km: 19, verified: true,
    reason: "courant portant sur le platier à mi-marée montante", wind: { from: "NO", bft: 4, gust: 35, expo: "de face" }, photo: "roches-eau-turquoise", lieu: "rochers",
    danger: "Accès coupé à marée haute après 11:40 : remonter par l'escalier nord avant 11:20." },
  { id: "b", name: "Platier B", kind: "platier", x: 380, y: 420, fav: 77, conf: 81, level: "Haute", safety: "ok", win: [6 + 50 / 60, 9 + 40 / 60], route: 38, km: 31, verified: false,
    reason: "marée montante sur les cuvettes, peu de houle", wind: { from: "NO", bft: 4, gust: 33, expo: "de côté" }, photo: "lancer-ressac", lieu: "rochers" },
  { id: "c", name: "Crique C", kind: "crique", x: 560, y: 820, fav: 58, conf: 62, level: "Moyenne", safety: "ok", win: [8, 10.5], route: 9, km: 6, verified: true,
    reason: "à l'abri du vent de nord-ouest", wind: { from: "NO", bft: 4, gust: 30, expo: "abrité" }, photo: "roche-ciel-bleu", lieu: "crique" },
  { id: "d", name: "Digue D", kind: "digue", x: 610, y: 980, fav: 71, conf: 55, level: "Moyenne", safety: "ok", win: [10, 12.5], route: 17, km: 12, verified: true,
    reason: "courant de vidange du port à mi-marée", wind: { from: "NO", bft: 4, gust: 31, expo: "abrité" }, photo: "nuit-frontale", lieu: "digue" },
  { id: "f", name: "Estuaire F", kind: "estuaire", x: 700, y: 1140, fav: 64, conf: 70, level: "Moyenne", safety: "ok", win: [16.5, 18.5], route: 41, km: 36, verified: true,
    reason: "fin de jusant à la sortie du chenal", wind: { from: "NO", bft: 3, gust: 26, expo: "abrité" }, photo: "estuaire-pres-sales", lieu: "estuaire" },
  { id: "e", name: "Pointe E", kind: "pointe", x: 330, y: 700, fav: 53, conf: 40, level: "Faible", safety: "unknown", status: "verify", verifyWhy: "Houle inconnue : sécurité à vérifier", win: [8.5, 10], route: 29, km: 22, verified: true,
    reason: "houle non documentée", wind: { from: "NO", bft: 5, gust: 42, expo: "de face" }, photo: "lancer-ressac", lieu: "pointe" },
  { id: "j", name: "Anse J", kind: "anse", x: 420, y: 900, fav: 68, conf: 51, level: "Moyenne", safety: "unknown", status: "verify", verifyWhy: "Accès non confirmé depuis 2024", win: [9, 11], route: 21, km: 15, verified: true,
    reason: "accès à confirmer", wind: { from: "NO", bft: 4, gust: 34, expo: "de côté" }, photo: "roche-ciel-bleu", lieu: "crique" },
  { id: "g", name: "Roche G", kind: "roche", x: 270, y: 520, fav: 45, conf: 66, level: "Moyenne", safety: "danger", status: "nr", nrWhy: "Non recommandé : accès coupé par la marée toute la matinée", win: null, route: 46, km: 39, verified: true,
    reason: "accès coupé", wind: { from: "NO", bft: 5, gust: 45, expo: "de face" }, photo: "lancer-ressac", lieu: "rochers" },
  { id: "h", name: "Plage H", kind: "plage", x: 500, y: 1210, fav: null, conf: 22, level: "Faible", safety: "unknown", win: null, noWinWhy: "données de marée insuffisantes", route: 33, km: 27, verified: false,
    reason: "données insuffisantes", wind: { from: "NO", bft: 3, gust: 24, expo: "de face" }, photo: "plage-averse", lieu: "plage" },
  { id: "k", name: "Mon spot K", kind: "spot personnel", mine: true, x: 520, y: 640, fav: 61, conf: 58, level: "Moyenne", safety: "ok", win: [7.75, 9.5], route: 16, km: 11, verified: true,
    reason: "ton spot : sortie du ruisseau", wind: { from: "NO", bft: 4, gust: 31, expo: "de côté" }, photo: "roches-eau-turquoise", lieu: "rochers" },
];

export const SPOT = Object.fromEntries(SPOTS.map((s) => [s.id, s]));
export const favorable = (s) => isFavorable(s.fav, { safetyOk: s.safety === "ok", status: s.status || null });
const admissible = (s) => s.fav !== null && s.safety === "ok" && !s.status && s.win;

/**
 * Classement de Home : par Favorabilité ; place réservée (V3-016) au meilleur admissible à 15 min ou moins
 * si aucun des trois n'y est ; égalités au dernier rang : 4 ou 5 cartes, au-delà un accès aux autres.
 */
export function ranking(list = SPOTS, { scarce = false, tie = false } = {}) {
  let pool = list.filter(admissible).map((s) => ({ ...s }));
  if (scarce) pool = pool.filter((s) => ["d", "c"].includes(s.id)).map((s) => ({ ...s, fav: s.id === "d" ? 44 : 41, ...(s.id === "c" ? { win: null, noWinWhy: "coefficient trop faible" } : {}) }));
  if (tie) pool = pool.map((s) => (["b", "c", "d", "f", "k"].includes(s.id) ? { ...s, fav: 61 } : s));
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
  return { text: `${lead} : ${span(best.win)}`, sub: `à moins d'1 h d'ici · ${best.name} · ${t.word.toLowerCase()}` };
}

/** Marques BATEAU de démonstration. */
export const MARKS = [
  { id: "m1", name: "Roche nord", x: 230, y: 380, depth: "40–55 m", fond: "roche", win: [7, 10.5], safety: "ok", shelter: 4.2,
    species: [{ name: "Lieu jaune", fav: 74, conf: 58, level: "Faible", rule: "taille minimale 30 cm (démo)" }, { name: "Bar", fav: 61, conf: 64, level: "Moyenne", rule: "42 cm minimum ; 2 par jour (démo)" }] },
  { id: "m2", name: "Épave", x: 150, y: 640, depth: "62 m", fond: "épave", win: [8.5, 11.5], safety: "ok", shelter: 6.8,
    species: [{ name: "Lieu noir", fav: 68, conf: 52, level: "Faible", rule: "aucune taille fixée (démo)" }] },
  { id: "m3", name: "Basse sud", x: 300, y: 1000, depth: "18–25 m", fond: "roche et sable", win: [9, 11], safety: "ok", shelter: 2.9,
    species: [{ name: "Bar", fav: 57, conf: 60, level: "Moyenne", rule: "42 cm minimum (démo)" }] },
  { id: "m4", name: "Banc", x: 110, y: 860, depth: "30 m", fond: "sable", win: null, safety: "unknown", status: "verify", verifyWhy: "Houle croisée non documentée",
    species: [{ name: "Maquereau", fav: 70, conf: 35, level: "Faible", rule: "—" }] },
];

export const BOATS = [{ id: "sr6", name: "Semi-rigide 6 m", cat: "C", speed: 25, crew: "à plusieurs", default: true }];

/** Vent de démonstration en un point (repère de la carte) à une heure : « d'où il vient », force, rafales. */
export function windAt(x, y, h) {
  const daily = Math.sin(((h - 6) / 24) * 2 * Math.PI);
  const offshore = (1000 - x) / 1000;
  const kmh = Math.max(6, Math.round(14 + 10 * offshore + 7 * daily + ((y * 7) % 5)));
  const fromDeg = Math.round(305 + 15 * offshore + 8 * Math.sin(h / 4) + ((x + y) % 7));
  return { fromDeg, kmh, gust: Math.round(kmh * 1.55), bft: beaufort(kmh) };
}
export function waveAt(x, y, h) {
  const offshore = (1000 - x) / 1000;
  return { m: Math.round((0.6 + 1.0 * offshore + 0.15 * Math.sin(h / 5)) * 10) / 10, s: Math.round(8 + 3 * offshore), fromDeg: 280 + Math.round(10 * offshore) };
}
export function beaufort(kmh) {
  const lim = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
  const i = lim.findIndex((l) => kmh < l);
  return i === -1 ? 12 : i;
}
export const compass = (deg) => ["N", "NE", "E", "SE", "S", "SO", "O", "NO"][Math.round((((deg % 360) + 360) % 360) / 45) % 8];

export const JOURNAL = [
  { id: "j1", date: "Sam. 14 nov.", spot: "Platier B", state: "capture", catches: "bar 46 cm, bar 39 cm", hours: "06:40–09:10" },
  { id: "j2", date: "Jeu. 12 nov.", spot: "Crique C", state: "sans_capture", hours: "07:00–08:30" },
  { id: "j3", date: "Dim. 8 nov.", spot: "Pointe A", state: "resultat_inconnu" },
  { id: "j4", date: "Mar. 3 nov.", spot: "Digue D", state: "incomplete" },
  { id: "j5", date: "Ven. 30 oct.", spot: "Estuaire F", state: "annulee" },
];
export const STATE_LABEL = { capture: "Prise", sans_capture: "Sans prise", resultat_inconnu: "Résultat non renseigné", incomplete: "Incomplète", annulee: "Annulée" };
